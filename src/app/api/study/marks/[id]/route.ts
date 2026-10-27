import { getSql } from "@/lib/db";
import { readSessionId } from "@/lib/session";
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await readSessionId();
  const sql = getSql();
  if (!session || !sql) return new Response(null, { status: 401 });
  const { id } = await params;
  if (!/^[a-f0-9-]{36}$/.test(id)) return new Response(null, { status: 404 });
  const rows =
    await sql`select screenshot from study_marks where id = ${id} and session_id = ${session}`;
  if (!rows.length) return new Response(null, { status: 404 });
  return new Response(
    Buffer.from(String(rows[0].screenshot).split(",")[1], "base64"),
    {
      headers: {
        "Content-Type": "image/jpeg",
        "Cache-Control": "private, no-store",
      },
    },
  );
}
