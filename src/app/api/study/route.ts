import { NextRequest } from "next/server";
import { getSql } from "@/lib/db";
import { readSessionId, readVisit } from "@/lib/session";
import { sanitizeDraft } from "@/lib/study-state";

export async function GET() {
  const visit = await readVisit();
  const sql = getSql();
  if (sql && visit?.phase === "background") {
    const rows =
      await sql`select study_data from sessions where id = ${visit.sessionId}`;
    return Response.json({
      background: rows[0]?.study_data?.backgroundDraft ?? null,
    });
  }
  if (!sql || visit?.phase !== "pair") return Response.json({ state: null });
  const rows =
    await sql`select state, updated_at from study_drafts where session_id = ${visit.pair.sessionId} and site_type = ${visit.pair.siteType}`;
  return Response.json(rows[0] ?? { state: null }, {
    headers: { "Cache-Control": "no-store" },
  });
}
export async function POST(request: NextRequest) {
  if (request.headers.get("origin") !== request.nextUrl.origin)
    return new Response(null, { status: 403 });
  const id = await readSessionId();
  const sql = getSql();
  if (!id || !sql) return new Response(null, { status: 401 });
  const raw = await request.text();
  if (raw.length > 160_000) return new Response(null, { status: 413 });
  let body;
  try {
    body = JSON.parse(raw);
  } catch {
    return new Response(null, { status: 400 });
  }
  if (!body || typeof body !== "object")
    return new Response(null, { status: 400 });
  if (body.metadata) {
    const metadata = {
      screen: body.metadata.screen,
      browser: String(body.metadata.browser ?? "").slice(0, 500),
      tourSkipped: body.metadata.tourSkipped,
      tourDone: body.metadata.tourDone,
    };
    await sql`update sessions set study_data = study_data || ${JSON.stringify(metadata)}::jsonb, last_active_at = now() where id = ${id}`;
    return Response.json({ saved: true });
  }
  const visit = await readVisit();
  if (
    visit?.phase === "background" &&
    body.background &&
    JSON.stringify(body.background).length < 12000
  ) {
    await sql`update sessions set study_data = study_data || ${JSON.stringify({ backgroundDraft: body.background, status: body.leaving ? "dropped_out" : "in_progress" })}::jsonb, last_active_at=now() where id=${id}`;
    return Response.json({ saved: true });
  }
  if (visit?.phase !== "pair" || visit.pair.siteType !== body.siteType)
    return new Response(null, { status: 409 });
  const state = sanitizeDraft(body.state);
  if (!state) return new Response(null, { status: 400 });
  await sql`insert into study_drafts (session_id, site_type, state) values (${id},${body.siteType},${JSON.stringify(state)}::jsonb)
    on conflict (session_id, site_type) do update set state = excluded.state, updated_at = now()`;
  await sql`update sessions set last_active_at = now(), current_pair = ${visit.pair.pairIndex}, study_data = study_data || ${JSON.stringify({ status: body.leaving ? "dropped_out" : "in_progress" })}::jsonb where id = ${id}`;
  return Response.json({ saved: true });
}
