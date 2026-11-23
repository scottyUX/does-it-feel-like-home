"""Round 2 confirmatory test, exactly as written in research/preregistration/round2-country-signals.md.

Usage: python round2_confirm.py <repo root> <round 1 new-labs pages.json> <round 2 pages.json> <output dir>
Unit: the model (mean over its home pages). Models with fewer than 10 home pages are dropped.
  Primary: composite (mean z-score of the five signals) Chinese > US, exact one-sided permutation over labellings.
  Secondary: each signal, same test, Holm across the five.
  Classifier: logistic regression on the five signals trained on round 1 home pages, predicting each round 2 model.
"""
import csv, itertools, json, os, sys
import numpy as np
from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import StandardScaler

ROOT, R1, R2, OUT = sys.argv[1:5]
os.makedirs(OUT, exist_ok=True)
src = open(os.path.join(ROOT, "research/analysis/run_comparisons.py")).read()
exec(src[src.index("GROUPS = ["):src.index("def paired_stats")])  # MEASURES, value()
SIGNALS = ["visible_elements_first_screen", "footer_links", "visible_links", "page_screens", "price_in_yuan"]
LABEL = {k: l for k, l, _ in MEASURES}

round1 = [p for p in json.load(open(os.path.join(ROOT, "research/results/study/pages.json"))) if p["set"] == "spark"]
round1 = [p for p in round1 + json.load(open(R1)) if p["is_home"]]
round2 = [p for p in json.load(open(R2)) if p["is_home"]]
counts = {m: sum(p["model"] == m for p in round2) for m in sorted({p["model"] for p in round2})}
kept = [m for m, n in counts.items() if n >= 10]
print("round 2 home pages per model:", counts, "\ndropped (<10):", [m for m in counts if m not in kept])
origin = {p["model"]: p["origin"] for p in round2}
is_cn = np.array([origin[m] == "China" for m in kept])
means = np.array([[np.nanmean([value(p, k) for p in round2 if p["model"] == m]) for k in SIGNALS] for m in kept])


def exact(scores):
    """One-sided p: share of labellings (same number of Chinese models) whose China - US gap is at least the observed."""
    gap = lambda mask: scores[mask].mean() - scores[~mask].mean()
    k, n = int(is_cn.sum()), len(scores)
    null = [gap(np.isin(np.arange(n), c)) for c in itertools.combinations(range(n), k)]
    return gap(is_cn), float(np.mean(np.array(null) >= gap(is_cn) - 1e-12)), len(null)


rows = []
z = (means - means.mean(0)) / np.where(means.std(0) > 0, means.std(0), 1)
g, p, n = exact(z.mean(1))
rows.append(dict(test="Primary: composite of the five signals", china_minus_us=g, p=p, p_holm="", assignments=n))
print(f"PRIMARY composite: gap {g:+.3f} z, exact p = {p:.4f} over {n} labellings")
sec = [(k, *exact(means[:, i])) for i, k in enumerate(SIGNALS)]
order = np.argsort([s[2] for s in sec]); holm = np.empty(5); running = 0
for rank, i in enumerate(order):
    running = max(running, min(1, (5 - rank) * sec[i][2])); holm[i] = running
for (k, g, p, n), h in zip(sec, holm):
    rows.append(dict(test=f"Secondary: {LABEL[k]}", china_minus_us=g, p=p, p_holm=h, assignments=n))
    print(f"  {LABEL[k]:32} gap {g:+.3f}  p = {p:.4f}  Holm p = {h:.4f}")

X1 = np.array([[value(p, k) for k in SIGNALS] for p in round1], float); y1 = np.array([p["origin"] == "China" for p in round1])
fill = np.nanmean(X1, 0); X1 = np.where(np.isnan(X1), fill, X1); sc = StandardScaler().fit(X1)
clf = LogisticRegression(C=0.5, max_iter=5000).fit(sc.transform(X1), y1)
per_model = []
for m, cn in zip(kept, is_cn):
    X2 = np.array([[value(p, k) for k in SIGNALS] for p in round2 if p["model"] == m], float); X2 = np.where(np.isnan(X2), fill, X2)
    prob = float(clf.predict_proba(sc.transform(X2))[:, 1].mean())
    per_model.append(dict(model=m, origin="China" if cn else "US", home_pages=counts[m], p_china=prob, predicted="China" if prob > 0.5 else "US",
                          **{k: v for k, v in zip(SIGNALS, means[kept.index(m)])}))
pred = np.array([r["predicted"] == "China" for r in per_model])
bal = float(np.mean([(pred[is_cn] == True).mean(), (pred[~is_cn] == False).mean()]))
rows.append(dict(test="Classifier trained on round 1, balanced accuracy over round 2 models", china_minus_us=bal, p="", p_holm="", assignments=""))
print(f"classifier (round 1 -> round 2): balanced accuracy {bal:.3f}")
for r in per_model:
    print(f"  {r['model']:34} {r['origin']:5} P(China) {r['p_china']:.2f}")
for name, data in (("round2_confirmatory.csv", rows), ("round2_models.csv", per_model)):
    with open(os.path.join(OUT, name), "w", newline="") as f:
        w = csv.DictWriter(f, list(data[0]), lineterminator="\n"); w.writeheader()
        w.writerows([{k: (round(v, 4) if isinstance(v, float) else v) for k, v in r.items()} for r in data])
print("wrote", OUT)
