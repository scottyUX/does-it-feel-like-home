import { readFile } from "node:fs/promises";
import path from "node:path";

export async function GET(_request: Request, context: { params: Promise<{ id: string; side: string }> }) {
  if (process.env.NODE_ENV !== "development") return new Response(null, { status: 404 });
  const { id, side } = await context.params;
  if (!/^[a-zA-Z0-9_-]{1,128}$/.test(id) || !["a", "b"].includes(side)) return new Response(null, { status: 404 });
  try {
    const html = await readFile(path.join(process.cwd(), "arena-data", "pilot-interactive", id, side, "index.html"));
    return new Response(new Uint8Array(html), { headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
      "Referrer-Policy": "no-referrer",
      "Content-Security-Policy": "sandbox allow-scripts; default-src 'none'; script-src 'unsafe-inline' 'unsafe-eval' blob:; style-src 'unsafe-inline'; img-src data: blob:; font-src data:; media-src data: blob:; connect-src 'none'; worker-src blob:; object-src 'none'; base-uri 'none'; form-action 'none'; frame-ancestors 'self'",
    } });
  } catch {
    return new Response(null, { status: 404 });
  }
}
