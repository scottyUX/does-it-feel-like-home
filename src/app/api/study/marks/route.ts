import { NextRequest } from "next/server";
import { getSql } from "@/lib/db";
import { readVisit } from "@/lib/session";
import type { WebsiteMark } from "@/lib/types";

export async function POST(request: NextRequest) {
  if (request.headers.get("origin") !== request.nextUrl.origin)
    return new Response(null, { status: 403 });
  const visit = await readVisit();
  const sql = getSql();
  if (!sql || visit?.phase !== "pair")
    return new Response(null, { status: 401 });
  const raw = await request.text();
  if (raw.length > 2_000_000) return new Response(null, { status: 413 });
  let mark: WebsiteMark;
  try {
    mark = JSON.parse(raw);
  } catch {
    return new Response(null, { status: 400 });
  }
  if (
    !mark ||
    !/^[a-f0-9-]{36}$/.test(mark.id) ||
    !["a", "b"].includes(mark.side) ||
    !["box", "circle", "highlight"].includes(mark.shape) ||
    !/^data:image\/jpeg;base64,[a-zA-Z0-9+/]+={0,2}$/.test(
      mark.screenshot ?? "",
    ) ||
    ![
      mark.x,
      mark.y,
      mark.width,
      mark.height,
      mark.scrollX,
      mark.scrollY,
      mark.viewportWidth,
      mark.viewportHeight,
    ].every((value) => Number.isFinite(value) && value >= 0) ||
    mark.width < 5 ||
    mark.height < 5 ||
    !mark.page?.startsWith(
      `/s/${mark.side === "a" ? visit.pair.leftId : visit.pair.rightId}`,
    )
  )
    return new Response(null, { status: 400 });
  const { screenshot, ...details } = mark;
  details.note = String(details.note ?? "").slice(0, 200);
  const existing =
    await sql`select id from study_marks where id=${mark.id} and session_id=${visit.pair.sessionId}`;
  if (existing.length) return Response.json({ id: mark.id });
  const rows =
    await sql`select count(*)::int as count from study_marks where session_id = ${visit.pair.sessionId} and site_type = ${visit.pair.siteType}`;
  if (rows[0].count >= 20) return new Response(null, { status: 422 });
  await sql`insert into study_marks (id, session_id, site_type, details, screenshot) values (${mark.id},${visit.pair.sessionId},${visit.pair.siteType},${JSON.stringify(details)}::jsonb,${screenshot}) on conflict (id) do nothing`;
  return Response.json({ id: mark.id });
}
