// Imports sites generated on the Spark (scripts run outside this repo) into sites/ and data/manifest.json.
// Usage: node scripts/import-local-sites.mts <results dir>
// The results dir holds <en|zh>/<type>/<model>/ folders, each with the HTML pages and _generation.json.
import { randomBytes } from "node:crypto";
import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { localizeImages } from "./localize-images.mts";

const ROOT = process.cwd();
const results = process.argv[2];
if (!results) throw new Error("Pass the results directory");

// Ollama tag -> how the study names the model, and which side of the pairing it is on.
const MODELS: Record<string, { name: string; country: "US" | "China" }> = {
  "gemma4-31b": { name: "google/gemma-4-31b", country: "US" },
  "qwen3.8-27b": { name: "qwen/qwen3.8-27b", country: "China" },
  "gpt-oss-120b": { name: "openai/gpt-oss-120b", country: "US" },
  "qwen3.5-122b": { name: "qwen/qwen3.5-122b", country: "China" },
};
const LANGUAGE_LABEL = { en: "English prompt", zh: "Chinese prompt" } as const;

const manifestPath = path.join(ROOT, "data", "manifest.json");
const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
const imported: { language: "en" | "zh"; type: string; folder: string; id: string }[] = [];

for (const language of ["en", "zh"] as const) {
  const types = await readdir(path.join(results, language)).catch(() => []);
  for (const type of types) {
    for (const folder of await readdir(path.join(results, language, type))) {
      const model = MODELS[folder];
      if (!model) continue;
      const source = path.join(results, language, type, folder);
      const label = `${model.name} (${LANGUAGE_LABEL[language]})`;
      if (manifest.sites.some((site: { model: string; type: string }) => site.model === label && site.type === type)) {
        console.log(`skip ${language} ${type} ${folder}, already imported`);
        continue;
      }
      const record = JSON.parse(await readFile(path.join(source, "_generation.json"), "utf8"));
      const photoFixes = await readFile(path.join(source, "_photo-fixes.json"), "utf8")
        .then((text) => JSON.parse(text))
        .catch(() => []);
      const files: Record<string, string> = {};
      for (const name of await readdir(source)) {
        if (name.endsWith(".html")) files[name] = await readFile(path.join(source, name), "utf8");
      }
      const id = randomBytes(4).toString("hex");
      const directory = path.join(ROOT, "sites", id);
      const imageAudit = await localizeImages(directory, files);
      await mkdir(directory, { recursive: true });
      for (const [name, body] of Object.entries(files)) await writeFile(path.join(directory, name), body);
      await writeFile(
        path.join(ROOT, "generations", `${id}.json`),
        `${JSON.stringify({ id, type, country: model.country, model: label, promptLanguage: language, runtime: "ollama on NVIDIA DGX Spark", ...record, photoFixes, imageAudit }, null, 2)}\n`,
      );
      manifest.sites.push({ id, type, country: model.country, model: label, promptLanguage: language, createdAt: record.createdAt ?? new Date().toISOString() });
      imported.push({ language, type, folder, id });
      const failed = imageAudit.filter((image) => image.error).length;
      console.log(`${id} ${language} ${type} ${folder} images=${imageAudit.length} failed=${failed}`);
    }
  }
}

await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
console.log(`imported ${imported.length} sites`);
