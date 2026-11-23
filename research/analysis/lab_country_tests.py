"""Model -> lab -> country: what can be identified from design, on models and labs never seen in training?

Usage: python lab_country_tests.py <repo root> <new pages.json> <output dir>
Data: the 80 Spark study sites (research/results/study/pages.json, set "spark") plus the staged new-lab sites (<new pages.json>),
home pages only, the same 40 measures as run_comparisons.py. Logistic regression throughout (C = 0.5, standardized features).
  1. Model identity, 10 models, tested on held-out site types.
  2. Lab of an unseen model: hold out one model of a two-model lab, train a lab classifier on all other models, predict its lab.
  3. Country of an unseen lab: hold out each lab, train on the others, predict origin. Balanced accuracy; exact permutation
     test over every assignment of origin to labs with the same number of Chinese labs.
  4. Country of an unseen model: the same, holding out models (exact test over model-level assignments).
  5. Prompt language within each model: paired by site type, sign-flip test, Benjamini-Hochberg across measures.
"""
import csv, itertools, json, os, sys
import numpy as np
from sklearn.impute import SimpleImputer
from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import StandardScaler

ROOT, NEW, OUT = sys.argv[1], sys.argv[2], sys.argv[3]
os.makedirs(OUT, exist_ok=True)
src = open(os.path.join(ROOT, "research/analysis/run_comparisons.py")).read()
exec(src[src.index("GROUPS = ["):src.index("def paired_stats")])  # MEASURES, BINARY, value()
exec(src[src.index("def paired_stats"):src.index("def compare")])  # paired_stats(), bh()
rng = np.random.default_rng(2026)

LAB = {"google/gemma-4-31b": "Google", "google/gemma-3-27b": "Google", "openai/gpt-oss-120b": "OpenAI", "openai/gpt-oss-20b": "OpenAI",
       "meta/llama-4-scout": "Meta", "nvidia/nemotron-3-33b": "NVIDIA", "qwen/qwen3.8-27b": "Alibaba", "qwen/qwen3.5-122b": "Alibaba",
       "zhipu/glm-4.7-flash": "Zhipu", "zhipu/glm-4-9b": "Zhipu"}
CHINA = {"Alibaba", "Zhipu"}
pages = [p for p in json.load(open(os.path.join(ROOT, "research/results/study/pages.json"))) if p["set"] == "spark"]
pages += json.load(open(NEW))
home = [p for p in pages if p["is_home"] and p["model"] in LAB]
KEYS = [k for k, _, _ in MEASURES]
X_all = np.array([[value(p, k) for k in KEYS] for p in home], float)
X_all[:, np.all(np.isnan(X_all), 0)] = 0
models = np.array([p["model"] for p in home]); labs = np.array([LAB[m] for m in models])
types = np.array([p["type"] for p in home]); langs = np.array([p["prompt"] for p in home])
PRESENT = [m for m in LAB if (models == m).any()]
print(f"{len(home)} home pages: " + ", ".join(f"{m.split('/')[1]} {int((models == m).sum())}" for m in LAB))


def fit_predict(train, test, y):
    imp = SimpleImputer().fit(X_all[train]); sc = StandardScaler().fit(imp.transform(X_all[train]))
    z = lambda m: np.nan_to_num(sc.transform(imp.transform(X_all[m])))
    return LogisticRegression(C=0.5, max_iter=5000).fit(z(train), y[train]).predict(z(test))


def balanced(pred, y):
    return float(np.mean([(pred[y == c] == c).mean() for c in np.unique(y)]))


rows = []
# 1. Model identity on held-out site types
pred = np.empty(len(home), dtype=object)
for t in np.unique(types):
    te = types == t; pred[te] = fit_predict(~te, te, models)
acc = (pred == models).mean()
rows.append(dict(test=f"Which of {len(PRESENT)} models (held-out site types)", accuracy=acc, chance=1 / len(PRESENT), detail=""))
print(f"1. model identity: {acc:.3f} (chance {1 / len(PRESENT):.3f})")
per_model = {m: float((pred[models == m] == m).mean()) for m in PRESENT}

# 2. Lab of an unseen model (two-model labs only)
lab_hits = {}
for m in PRESENT:
    if sum(LAB[x] == LAB[m] for x in PRESENT) < 2:
        continue
    te = models == m; p = fit_predict(~te, te, labs)
    lab_hits[m] = float((p == LAB[m]).mean())
acc2 = float(np.mean(list(lab_hits.values()))) if lab_hits else float("nan")
rows.append(dict(test="Lab of an unseen model (8 models in two-model labs)", accuracy=acc2, chance=1 / len(set(LAB.values())),
                 detail="; ".join(f"{m.split('/')[1]} {v:.0%}" for m, v in lab_hits.items())))
print(f"2. lab of unseen model: {acc2:.3f} (chance {1 / len(set(LAB.values())):.3f})  " + ", ".join(f"{m.split('/')[1]}={v:.0%}" for m, v in lab_hits.items()))


# 3/4. Country of an unseen lab / model, exact permutation over unit-level origin assignments
def origin_test(units, unit_of_row):
    names = sorted(set(units.values())) if isinstance(units, dict) else units
    true = {u: int(u in CHINA or LAB.get(u) in CHINA) for u in names}
    def score(assign):
        y = np.array([assign[unit_of_row[i]] for i in range(len(home))]); pred = np.empty(len(y), int)
        for u in names:
            te = np.array([unit_of_row[i] == u for i in range(len(home))]); pred[te] = fit_predict(~te, te, y)
        return balanced(pred, y)
    observed = score(true); k = sum(true.values())
    null = [score({u: int(u in combo) for u in names}) for combo in itertools.combinations(names, k)]
    return observed, float(np.mean(np.array(null) >= observed - 1e-12)), len(null), float(np.mean(null))

acc3, p3, n3, m3 = origin_test(sorted({LAB[m] for m in PRESENT}), list(labs))
rows.append(dict(test="Country of an unseen lab (6 labs)", accuracy=acc3, chance=0.5, detail=f"exact p = {p3:.3f} over {n3} assignments; mean of assignments {m3:.2f}"))
print(f"3. country of unseen lab: balanced {acc3:.3f}, exact p={p3:.3f} ({n3} assignments, mean {m3:.3f})")
acc4, p4, n4, m4 = origin_test(PRESENT, list(models))
rows.append(dict(test="Country of an unseen model (10 models)", accuracy=acc4, chance=0.5, detail=f"exact p = {p4:.3f} over {n4} assignments; mean of assignments {m4:.2f}"))
print(f"4. country of unseen model: balanced {acc4:.3f}, exact p={p4:.3f} ({n4} assignments, mean {m4:.3f})")

# 5. Prompt language within each model
lang_rows = []
for m in PRESENT:
    by = {(p["type"], p["prompt"]): p for p in home if p["model"] == m}
    pairs = [(by[(t, "en")], by[(t, "zh")]) for t in sorted({t for t, _ in by}) if (t, "en") in by and (t, "zh") in by]
    stats = [(k, paired_stats([value(b, k) - value(a, k) for a, b in pairs])) for k in KEYS]
    stats = [(k, s) for k, s in stats if s]
    qs = bh([s["p"] for _, s in stats]) if stats else []
    lang_rows.append(dict(model=m, lab=LAB[m], pairs=len(pairs), measures_tested=len(stats), clear=int(sum(q < 0.05 for q in qs))))
print("5. prompt language, clear measures per model: " + ", ".join(f"{r['model'].split('/')[1]} {r['clear']}/{r['measures_tested']} (n={r['pairs']})" for r in lang_rows))

# Per-model profile for the results page
profile = []
for m in PRESENT:
    s = [p for p in home if p["model"] == m]
    profile.append({"model": m, "lab": LAB[m], "origin": "China" if LAB[m] in CHINA else "US", "sites": len(s), "recognised": per_model[m],
                    **{k: float(np.nanmean([value(p, k) for p in s])) for k in ("visible_text_chars", "footer_links", "visible_links", "page_screens",
                                                                              "mobile_page_screens", "images", "quadtree_blocks", "icp_record", "price_in_yuan")}})
for name, data in (("lab_country_tests.csv", rows), ("model_profiles.csv", profile), ("prompt_language_by_model.csv", lang_rows)):
    with open(os.path.join(OUT, name), "w", newline="") as f:
        w = csv.DictWriter(f, list(data[0]), lineterminator="\n"); w.writeheader()
        w.writerows([{k: (round(v, 4) if isinstance(v, float) else v) for k, v in r.items()} for r in data])
print("wrote", OUT)
