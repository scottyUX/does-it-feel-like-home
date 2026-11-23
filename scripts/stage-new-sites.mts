// Stages sites generated outside the study manifest (e.g. the GCP new-labs run) for measurement only.
// Copies each <lang>/run<N>/<type>/<model>/ folder that has a _generation.json into <out>/<lang>__<type>__<model>__run<N>/,
// storing its web images locally with the same localizeImages step the study import uses. Never touches sites/ or the manifest.
// Usage: node --experimental-strip-types scripts/stage-new-sites.mts <runs dir> <out dir>
import { mkdir, readdir, readFile, writeFile, stat } from "node:fs/promises";
import path from "node:path";
import { localizeImages } from "./localize-images.mts";

const [runsDir, outDir] = process.argv.slice(2);
if (!runsDir || !outDir) throw new Error("Pass the runs directory and the output directory");
const exists = (p: string) => stat(p).then(() => true, () => false);
const staged: Record<string, unknown>[] = [];

for (const language of await readdir(runsDir).catch(() => [])) {
  for (const run of await readdir(path.join(runsDir, language)).catch(() => [])) {
    for (const type of await readdir(path.join(runsDir, language, run)).catch(() => [])) {
      for (const model of await readdir(path.join(runsDir, language, run, type)).catch(() => [])) {
        const source = path.join(runsDir, language, run, type, model);
        if (!(await exists(path.join(source, "_generation.json")))) continue;
        const id = `${language}__${type}__${model}__${run}`;
        const directory = path.join(outDir, id);
        if (await exists(path.join(directory, "_staged.json"))) continue; // already staged
        const record = JSON.parse(await readFile(path.join(source, "_generation.json"), "utf8"));
        const files: Record<string, string> = {};
        for (const name of await readdir(source)) if (name.endsWith(".html")) files[name] = await readFile(path.join(source, name), "utf8");
        await mkdir(directory, { recursive: true });
        const imageAudit = await localizeImages(directory, files);
        for (const [name, body] of Object.entries(files)) await writeFile(path.join(directory, name), body);
        const meta = { id, language, run, type, model: record.model, completionTokens: record.completionTokens, seconds: record.seconds,
          runtime: "ollama on GCP A100 80GB", imageAudit };
        await writeFile(path.join(directory, "_staged.json"), `${JSON.stringify(meta, null, 2)}\n`);
        staged.push(meta);
        console.log(`${id} images=${imageAudit.length} failed=${imageAudit.filter((i) => i.error).length}`);
      }
    }
  }
}
console.log(`staged ${staged.length} new sites`);
