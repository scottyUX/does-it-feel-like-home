import { readFile, stat } from "node:fs/promises";
import path from "node:path";

const MIME: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".json": "application/json; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
};

const injectBase = (html: string, id: string) => {
  if (/<base\s/i.test(html)) return html;
  const base = `<base href="/s/${id}/">`;
  if (/<head[^>]*>/i.test(html)) {
    return html.replace(/<head[^>]*>/i, (match) => `${match}${base}`);
  }
  return `${base}${html}`;
};

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string; path?: string[] }> },
) {
  const { id, path: parts = [] } = await context.params;
  if (!/^[a-f0-9]{8}$/.test(id)) {
    return new Response("Not found", { status: 404 });
  }

  const root = path.resolve(process.cwd(), "sites", id);
  const requested = parts.length === 0 ? "index.html" : parts.join("/");
  let filePath = path.resolve(root, requested);
  if (filePath !== root && !filePath.startsWith(`${root}${path.sep}`)) {
    return new Response("Not found", { status: 404 });
  }

  try {
    const info = await stat(filePath);
    if (info.isDirectory()) filePath = path.join(filePath, "index.html");
    const body = await readFile(filePath);
    const extension = path.extname(filePath).toLowerCase();
    const type = MIME[extension] ?? "application/octet-stream";
    const payload = extension === ".html" ? injectBase(body.toString("utf8"), id) : body;
    return new Response(payload, {
      headers: {
        "Content-Type": type,
        "Cache-Control": "public, max-age=3600",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
