# Arena analysis: dataset audit

This tool audits Chinese-language battles and produces a reproducible sample. An experimental separate worker can render the selected sites. Leaderboard score matching and a classifier are not implemented.

Create a virtual environment and install `arena/requirements.txt`. Supply a JSON object mapping exact model names to `US` or `CN`; omit models whose developer location has not been independently reviewed. The output contains potentially sensitive identifiers, so use the ignored `arena-data/` directory.

`arena/model-origins.provisional.json` is an initial, unverified mapping based on recognizable model families, not a completed researcher review. Anonymous, Inkling, Mistral, and Laguna models are intentionally omitted. Review each assignment against model-provider records before using results in research; US and CN refer to developer organizations, not users or cultural identity.

```sh
python3 -m venv .arena-venv
.arena-venv/bin/pip install -r arena/requirements.txt
.arena-venv/bin/python arena/analysis.py ~/Desktop/preference.parquet --mapping arena/model-origins.provisional.json --output arena-data/pilot --sample 10 --seed 7
```

Run without `--sample` for all eligible pairs. Review `selection.json` and its unmapped-model counts before interpreting results. Inclusion does not establish voter identity, cultural background, or model comparability. This program reads only metadata columns and never executes model-generated code.

For the optional score filter, obtain Arena's historical WebDev leaderboard and create a JSON object of dataset-to-leaderboard model-name aliases. An empty object (`{}`) uses exact names only. `arena/model-score-aliases.provisional.json` contains unverified working aliases for this pilot, including different harness labels. They must be checked before research use; similar names do not establish equivalent configurations. The command below uses the latest supplied overall score published on or before July 31, 2026; it never substitutes later scores. The UI defines a matched pair as a score gap of at most 100 points, and excludes pairs with either score missing.

```sh
.arena-venv/bin/python arena/score_match.py --pairs arena-data/pilot/pairs.json --leaderboard arena-data/webdev-leaderboard.parquet --aliases arena-data/score-aliases.json --output arena-data/pilot/score-matches.json
```

The current pilot's historical data came from the Hugging Face dataset viewer API for `lmarena-ai/leaderboard-dataset`, config `webdev`, split `full`, category `overall`. It includes both pages of the July 31, 2026 snapshot and the most recent earlier available records for Gemini 3.5 Flash and Kimi K3. The saved API responses are kept under `arena-data/` and can be combined with `arena/api_pages_to_parquet.py`; the resulting score file records the snapshot's SHA-256. If the latest supplied snapshot contains duplicate names for a model, that model remains unmatched. These pilot-specific pages are not a complete historical leaderboard for other models.

The optional `--candidates arena/model-score-candidates.provisional.json` records multiple possible leaderboard variants when the dataset ID does not specify one. The dashboard shows their score range rather than picking one. A pair is included by the score filter only if every listed combination is within 100 points; the candidate list itself is provisional and may not be exhaustive.

For a local-only preview of a pilot audit, run `npm run dev` and open `/arena`. The page is deliberately unavailable in production until individual authentication and private storage are implemented. It reads only `arena-data/pilot/selection.json` and `arena-data/pilot/pairs.json`; this UI does not start analysis jobs.

The optional `arena-data/pilot/measurements.json` file holds computed properties by full battle ID and side, for example `{"battle-id":{"a":{"visible_text_chars":120},"b":{"visible_text_chars":95}}}`. The dashboard shows every supplied property for each site; an absent or empty record is displayed as not measured. Copy the worker's aggregated `measurements.json` there to display it.

Extract the selected source files without running them:

```sh
.arena-venv/bin/python arena/extract.py ~/Desktop/preference.parquet --pairs arena-data/pilot/pairs.json --output arena-data/pilot-sources
```

The output directory must not already exist. `extraction.json` records failures. The extracted code is untrusted and must not be run directly on the host.

## Experimental Spark worker

`arena/worker` contains an experimental ARM64 Docker renderer. The image installs an explicit dependency set; it does not run project package scripts or load project Vite configuration. Each render uses a separate container with networking disabled, a read-only filesystem, dropped capabilities, no elevated privileges, and resource limits. This is container isolation, not a VM or a guarantee against a kernel or browser escape. Chromium's inner sandbox is disabled inside the restricted container; do not use this worker on sensitive hosts or treat it as a hardened boundary.

The worker only has access to the one mounted source and output directory. Keep cloud credentials outside the container. Output files are untrusted until inspected. A separate authenticated process must upload artifacts. External images and fonts cannot load, and missing packages or dependencies cause build failures. Screenshots capture a 1440 by 900 viewport after 2.5 seconds; brightness is a weighted RGB proxy, not relative luminance. CSS animation counts do not cover JavaScript, video, or canvas animation. These measurements are exploratory.

```sh
docker build -t arena-renderer:pilot arena/worker
python3 arena/worker/run.py --sources arena-data/pilot-sources --pairs arena-data/pilot/pairs.json --output arena-data/pilot-render
```
