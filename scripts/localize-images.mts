import { createHash } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

// Preserve the model's visual choices. Failed image URLs stay unchanged for the study.
export async function localizeImages(
  directory: string,
  files: Record<string, string>,
) {
  const urls = new Set<string>();
  for (const body of Object.values(files)) {
    for (const tag of body.matchAll(/<(?:img|image|source)\b[^>]*>/gi)) {
      for (const attribute of tag[0].matchAll(
        /\b(src|href|srcset)=["']([^"']+)["']/gi,
      )) {
        const candidates =
          attribute[1].toLowerCase() === "srcset"
            ? attribute[2].split(/,\s+/)
            : [attribute[2]];
        for (const candidate of candidates) {
          const url = candidate.trim().split(/\s+/)[0];
          if (/^https?:\/\//i.test(url)) urls.add(url);
        }
      }
    }
    for (const match of body.matchAll(
      /url\(\s*["']?(https?:\/\/[^"')\s]+)["']?\s*\)/gi,
    ))
      urls.add(match[1]);
  }
  const results: { url: string; file?: string; error?: string }[] = [];
  for (const url of urls) {
    try {
      const response = await fetch(url.replaceAll("&amp;", "&"), {
        signal: AbortSignal.timeout(20000),
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const type = response.headers.get("content-type")?.split(";")[0] ?? "";
      const extensions: Record<string, string> = {
        "image/jpeg": "jpg",
        "image/png": "png",
        "image/webp": "webp",
        "image/gif": "gif",
        "image/svg+xml": "svg",
        "image/avif": "avif",
      };
      if (!extensions[type]) throw new Error("URL did not return an image");
      if (Number(response.headers.get("content-length")) > 10_000_000)
        throw new Error("Image exceeds 10 MB");
      const image = Buffer.from(await response.arrayBuffer());
      if (image.length > 10_000_000) throw new Error("Image exceeds 10 MB");
      const file = `assets/image-${createHash("sha256").update(url).digest("hex").slice(0, 16)}.${extensions[type]}`;
      await mkdir(path.join(directory, "assets"), { recursive: true });
      await writeFile(path.join(directory, file), image);
      for (const [name, body] of Object.entries(files))
        files[name] = body.replaceAll(
          url,
          path.posix.relative(path.posix.dirname(name), file),
        );
      results.push({ url, file });
    } catch (error) {
      results.push({
        url,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }
  return results;
}
