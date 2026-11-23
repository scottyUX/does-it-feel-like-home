import { readFile } from "node:fs/promises";
import path from "node:path";

export async function GET(_request: Request, context: { params: Promise<{ id: string; side: string }> }) {
  if (process.env.NODE_ENV !== "development") return new Response(null, { status: 404 });
  const { id, side } = await context.params;
  if (!/^[a-zA-Z0-9_-]{1,128}$/.test(id) || !["a", "b"].includes(side)) return new Response(null, { status: 404 });
  try {
    const screenshot = await readFile(path.join(process.cwd(), "arena-data", "pilot-render", id, side, "screenshot.png"));
    return new Response(new Uint8Array(screenshot), { headers: { "Content-Type": "image/png", "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" } });
  } catch {
    return new Response(null, { status: 404 });
  }
}
