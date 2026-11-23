# All sites in one place

Copies of every site generated or collected for the study (2026-11-23). The originals stay where the app and the
analysis scripts read them; this folder is for keeping and sharing. `index.csv` lists every site with its model,
origin (China or US, from the model's lab), prompt language and site type.

| Folder | Sites | What | Originals |
|---|---|---|---|
| `study/` | 86 | Study sites shown in the app: 80 from 4 local models on the DGX Spark, 6 from frontier models. `study-manifest.json` is the app's manifest (one country label in it is wrong; `index.csv` is right). | `sites/`, `data/manifest.json` |
| `new-labs-round1/` | 118 | 6 local models from 5 labs, generated on a GCP A100 on 2026-11-23. Each folder has the generated pages, `_generation.json` and `_staged.json` with locally stored images. | `generations-new-labs/gcp/`, `generations-new-labs/sites/` |
| `new-labs-round2/` | 11 | ERNIE 4.5 only (round 2 stopped by GPU shortages). Raw output, not measured. | `generations-new-labs/gcp-round2/` |
| `arena/zh/`, `arena/en/` | 408 | Arena WebDev battles with Chinese and English prompts: each battle folder has both sides' source (`a/`, `b/`) and `prompt.txt`; `pairs.csv` has the models and vote. Rendered screenshots and measurements are in `arena-data/experiment-render/`. | `arena-data/experiment-{zh,en}-sources/` |
