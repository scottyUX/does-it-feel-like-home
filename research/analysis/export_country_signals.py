"""Export the five exploratory country signals per home page, for the /arena/compare page.

Usage: python research/analysis/export_country_signals.py  (from the repo root)
Same pages and lab labels as country_signals_exploratory.py: 80 Spark + 118 new-lab home pages from 10 models.
Writes research/results/new-labs/country-signals.json and research/results/tables/arena-country-signals.json.
"""
import csv, json, math

LAB = {"google/gemma-4-31b": "Google", "google/gemma-3-27b": "Google", "openai/gpt-oss-120b": "OpenAI", "openai/gpt-oss-20b": "OpenAI",
       "meta/llama-4-scout": "Meta", "nvidia/nemotron-3-33b": "NVIDIA", "qwen/qwen3.8-27b": "Alibaba", "qwen/qwen3.5-122b": "Alibaba",
       "zhipu/glm-4.7-flash": "Zhipu", "zhipu/glm-4-9b": "Zhipu"}
CN = {"Alibaba", "Zhipu"}
KEYS = ["visible_elements_first_screen", "footer_links", "visible_links", "page_screens", "mobile_page_screens", "price_in_yuan"]

pages = [p for p in json.load(open("research/results/study/pages.json")) if p["set"] == "spark"]
pages += json.load(open("research/results/new-labs/pages.json"))
rows = []
for p in pages:
    if not p["is_home"] or p["model"] not in LAB:
        continue
    values = {k: (None if p.get(k) is None or (isinstance(p[k], float) and math.isnan(p[k])) else float(p[k])) for k in KEYS}
    rows.append(dict(model=p["model"], lab=LAB[p["model"]], origin="China" if LAB[p["model"]] in CN else "US",
                     site=p["site"], type=p["type"], prompt=p["prompt"], values=values))
json.dump(rows, open("research/results/new-labs/country-signals.json", "w"), ensure_ascii=False, indent=1)
print(len(rows), "home pages from", len({r["model"] for r in rows}), "models")

# Arena: both sides of the 204 US-vs-China battles (Chinese and English prompts), from research/results/tables/arena_sites.csv.
ARENA_LAB = {"claude": "Anthropic", "gemini": "Google", "gpt": "OpenAI", "grok": "xAI", "deepseek": "DeepSeek", "glm": "Zhipu",
             "kimi": "Moonshot", "longcat": "Meituan", "mimo": "Xiaomi", "minimax": "MiniMax", "qwen": "Alibaba"}
arena = []
for r in csv.DictReader(open("research/results/tables/arena_sites.csv")):
    lab = next(v for k, v in ARENA_LAB.items() if r["model"].startswith(k))
    arena.append(dict(model=r["model"], lab=lab, origin="China" if r["origin"] == "CN" else "US", site=f"{r['battle']}-{r['side']}",
                      type=r["category"].replace("_", " "), prompt=r["lang"], won=r["won"] == "1", values={k: float(r[k]) if r.get(k) not in (None, "") else None for k in KEYS}))
json.dump(arena, open("research/results/tables/arena-country-signals.json", "w"), ensure_ascii=False, indent=1)
print(len(arena), "Arena sites from", len({r["model"] for r in arena}), "models and", len({r["lab"] for r in arena}), "labs")
