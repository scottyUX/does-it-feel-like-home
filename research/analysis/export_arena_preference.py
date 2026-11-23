"""Arena votes for the compare page's Arena tab.

Usage: python research/analysis/export_arena_preference.py  (from the repo root)
Reads research/results/tables/arena_sites.csv (both sides of each US-vs-China battle, `won` = the voter's pick) and
research/results/tables/arena_preference.csv (Chinese win rate vs the rate expected from Arena WebDev scores).
For each of the five signals: in battles where the two sites differ, how often the site with the higher value won,
with a Wilson 95% interval and an exact two-sided binomial p against 50%. Also win rates per lab.
Writes research/results/tables/arena-preference.json.
"""
import csv, json, math
from collections import defaultdict

SIGNALS = [("visible_elements_first_screen", "Elements on the first screen"), ("footer_links", "Footer links"),
           ("visible_links", "Links on the page"), ("page_screens", "Page length"), ("price_in_yuan", "Prices in yuan")]
LAB = {"claude": "Anthropic", "gemini": "Google", "gpt": "OpenAI", "grok": "xAI", "deepseek": "DeepSeek", "glm": "Zhipu",
       "kimi": "Moonshot", "longcat": "Meituan", "mimo": "Xiaomi", "minimax": "MiniMax", "qwen": "Alibaba"}


def wilson(k, n):
    if not n:
        return None, None
    p, z = k / n, 1.96
    centre, half = (p + z * z / (2 * n)) / (1 + z * z / n), z * math.sqrt(p * (1 - p) / n + z * z / (4 * n * n)) / (1 + z * z / n)
    return centre - half, centre + half


def binom_p(k, n):
    probs = [math.comb(n, i) / 2 ** n for i in range(n + 1)]
    return min(1.0, sum(q for q in probs if q <= probs[k] + 1e-12))


battles = defaultdict(dict)
for r in csv.DictReader(open("research/results/tables/arena_sites.csv")):
    battles[r["battle"]][r["side"]] = r
pairs = [(b["a"], b["b"]) for b in battles.values() if "a" in b and "b" in b and b["a"]["won"] != b["b"]["won"]]

signals = []
for lang, lang_label in (("all", "Both prompt languages"), ("zh", "Chinese prompts"), ("en", "English prompts")):
    for key, label in SIGNALS:
        k = n = 0
        for a, b in pairs:
            if lang != "all" and a["lang"] != lang or a.get(key) in (None, "") or b.get(key) in (None, ""):
                continue
            va, vb = float(a[key]), float(b[key])
            if va == vb:
                continue
            n += 1
            k += (a if va > vb else b)["won"] == "1"
        low, high = wilson(k, n)
        signals.append(dict(prompt=lang, prompt_label=lang_label, key=key, label=label, battles=n, higher_won=k,
                            share=k / n if n else None, ci_low=low, ci_high=high, p=binom_p(k, n) if n else None))

labs, models = defaultdict(lambda: [0, 0]), defaultdict(lambda: [0, 0])
for a, b in pairs:
    for side in (a, b):
        lab = next(v for p, v in LAB.items() if side["model"].startswith(p))
        for table, name in ((labs, lab), (models, side["model"])):
            table[name][0] += side["won"] == "1"; table[name][1] += 1
origin = {r["model"]: ("China" if r["origin"] == "CN" else "US") for b in battles.values() for r in b.values()}
lab_origin = {next(v for p, v in LAB.items() if m.startswith(p)): o for m, o in origin.items()}

expected = [dict(prompt=r["prompt"], battles=int(r["battles"]), chinese_won=float(r["chinese_won"]), expected=float(r["expected"]),
                 difference=float(r["difference"]), ci_low=float(r["ci_low"]), ci_high=float(r["ci_high"]))
            for r in csv.DictReader(open("research/results/tables/arena_preference.csv"))]
out = dict(decided_battles=len(pairs), expected=expected, signals=signals,
           labs=[dict(lab=lab, origin=lab_origin[lab], wins=w, battles=n, ci_low=wilson(w, n)[0], ci_high=wilson(w, n)[1]) for lab, (w, n) in sorted(labs.items())],
           models=[dict(model=m, lab=next(v for p, v in LAB.items() if m.startswith(p)), origin=origin[m], wins=w, battles=n) for m, (w, n) in sorted(models.items())])
json.dump(out, open("research/results/tables/arena-preference.json", "w"), indent=1)
print(len(pairs), "decided battles")
for s in signals:
    print(f"{s['prompt_label']:22} {s['label']:30} higher won {s['higher_won']:3}/{s['battles']:3} = {s['share'] or 0:.2f}  [{s['ci_low'] or 0:.2f}, {s['ci_high'] or 0:.2f}]  p={s['p'] if s['p'] is not None else float('nan'):.3f}")
for l in out["labs"]:
    print(f"{l['lab']:10} {l['origin']:5} {l['wins']}/{l['battles']}")
