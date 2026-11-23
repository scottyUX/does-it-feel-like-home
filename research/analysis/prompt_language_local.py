"""Does a Chinese prompt make a model add local features? (David's prompt-language question.)

Usage: python research/analysis/prompt_language_local.py  (from the repo root)
Home pages from the 10 models (80 Spark + 118 new-lab). Within each model, a Chinese-prompt page is paired with the
English-prompt page for the same site type. Unit: the model (mean of its paired differences).
Test: exact sign-flip over the 10 models (1,024 assignments), two-sided; Benjamini-Hochberg q across the measures.
Writes research/results/tables/new-labs/prompt_language_local.csv.
"""
import csv, itertools, json
import numpy as np

MEASURES = [("price_in_yuan", "Prices in yuan"), ("wechat", "WeChat"), ("alipay", "Alipay"), ("china_phone", "Chinese phone number"),
            ("icp_record", "ICP registration record"), ("chinese_platforms", "Weibo, Xiaohongshu, Douyin, QQ"),
            ("western_platforms", "Google, Facebook, PayPal…"), ("qr_code", "QR code"), ("chinese_date", "Chinese date format"),
            ("customer_service", "Customer service"), ("login", "Login or sign-up"), ("search_box", "Search box"),
            ("language_switch", "Language switch"), ("chinese_font_share", "Text in a chosen Chinese font"),
            ("latin_share", "Latin letters among letters")]


def value(p, k):
    if k == "latin_share":
        n = (p.get("latin_letters") or 0) + (p.get("cjk_characters") or 0)
        return (p.get("latin_letters") or 0) / n if n else np.nan
    return np.nan if p.get(k) is None else float(p[k])


pages = json.load(open("research/results/new-labs/country-signals.json"))  # the 198 home pages, with lab and origin
full = {(p["model"], p["site"]): p for p in json.load(open("research/results/study/pages.json")) + json.load(open("research/results/new-labs/pages.json")) if p["is_home"]}
origin = {p["model"]: p["origin"] for p in pages}
models = sorted(origin, key=lambda m: (origin[m], m))
pairs = {m: [] for m in models}
for m in models:
    by = {}
    for p in pages:
        if p["model"] == m:
            by.setdefault(p["type"], {})[p["prompt"]] = full[(m, p["site"])]
    pairs[m] = [(v["zh"], v["en"]) for v in by.values() if "zh" in v and "en" in v]

rows = []
signs = np.array(list(itertools.product([1, -1], repeat=len(models))))
for key, label in MEASURES:
    zh = {m: np.nanmean([value(a, key) for a, _ in pairs[m]]) for m in models}
    en = {m: np.nanmean([value(b, key) for _, b in pairs[m]]) for m in models}
    d = np.array([zh[m] - en[m] for m in models])
    ok = ~np.isnan(d)
    obs = d[ok].mean()
    p = float(np.mean(np.abs((signs[:, ok] * d[ok]).mean(1)) >= abs(obs) - 1e-12))
    rows.append(dict(measure=key, label=label, zh=np.nanmean(list(zh.values())), en=np.nanmean(list(en.values())), diff=obs,
                     models_zh_higher=int((d > 1e-9).sum()), models_en_higher=int((d < -1e-9).sum()), models_tied=int((np.abs(d) <= 1e-9).sum()), p=p,
                     **{f"zh_minus_en:{m}": d[i] for i, m in enumerate(models)}))
ps = np.array([r["p"] for r in rows]); order = np.argsort(ps); n = len(ps)
q = np.empty(n); running = 1.0
for rank in range(n - 1, -1, -1):
    running = min(running, ps[order[rank]] * n / (rank + 1)); q[order[rank]] = running
for r, qq in zip(rows, q):
    r["q"] = qq

print("pairs per model:", {m: len(pairs[m]) for m in models})
print(f"{'measure':32} {'zh':>6} {'en':>6} {'zh>en':>6} {'en>zh':>6} {'tie':>4} {'p':>6} {'q':>6}")
for r in sorted(rows, key=lambda r: r["p"]):
    print(f"{r['label'][:32]:32} {r['zh']:6.2f} {r['en']:6.2f} {r['models_zh_higher']:6} {r['models_en_higher']:6} {r['models_tied']:4} {r['p']:6.3f} {r['q']:6.3f}")
with open("research/results/tables/new-labs/prompt_language_local.csv", "w", newline="") as f:
    w = csv.DictWriter(f, list(rows[0]), lineterminator="\n"); w.writeheader()
    w.writerows([{k: (round(v, 4) if isinstance(v, float) else v) for k, v in r.items()} for r in rows])
