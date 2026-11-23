"""Can the lab (Arena) or the model (study sites) be predicted from the design measures?

Usage: python predict_lab.py <tables dir>
Multiclass logistic regression and random forest, tested on held-out site categories (Arena) or site types (study).
Compared with the majority-class baseline and with the same test on shuffled labels.
"""
import csv, os, re, sys
from collections import Counter
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression

TABLES = sys.argv[1]
HERE = os.path.dirname(os.path.abspath(__file__))
sys.argv = [sys.argv[0], TABLES]
exec(open(os.path.join(HERE, "transfer_classifier.py")).read().split("SETS = {")[0])
exec(open(os.path.join(HERE, "leave_one_lab_out.py")).read().split("MODELS = {")[0].split("exec(")[0] + "\n" +
     "\n".join(l for l in open(os.path.join(HERE, "leave_one_lab_out.py")).read().split("\n") if l.startswith("LABS") or l.startswith("        (r") or l.startswith("def lab") or l.startswith("    return next")))
rng = np.random.default_rng(11)
MAKERS = {"Logistic regression": lambda: LogisticRegression(C=0.5, max_iter=5000),
          "Random forest": lambda: RandomForestClassifier(300, min_samples_leaf=2, random_state=0, n_jobs=-1)}


def cv_predict(X, y, groups, make):
    pred = np.empty(len(y), dtype=object)
    for g in np.unique(groups):
        te = groups == g
        Za, imp, sc = prep(X[~te]); Zb = prep(X[te], imp, sc)[0]
        pred[te] = make().fit(Za, y[~te]).predict(Zb)
    return pred


out, per = [], []
cases = [("Arena sites: which of 11 labs", [r for r in arena_zh + arena_en if lab(r["model"])], lambda r: lab(r["model"]), "category"),
         ("Study sites: which of 4 models", study, lambda r: r["model"].split("/")[-1], "type")]
for name, rows, target, group in cases:
    X, _ = matrix(rows, FEATURES); y = np.array([target(r) for r in rows]); groups = np.array([r[group] for r in rows])
    counts = Counter(y); majority = max(counts.values()) / len(y)
    for mname, make in MAKERS.items():
        pred = cv_predict(X, y, groups, make); acc = (pred == y).mean()
        null = [(cv_predict(X, rng.permutation(y), groups, make) == y).mean() for _ in range(30 if mname.startswith("Logistic") else 10)]
        p = (np.sum(np.array(null) >= acc) + 1) / (len(null) + 1)
        out.append(dict(task=name, classifier=mname, sites=len(y), classes=len(counts), accuracy=round(acc, 4),
                        majority_baseline=round(majority, 4), shuffled_mean=round(float(np.mean(null)), 4), p=round(p, 4)))
        print(f"{name:32} {mname:20} acc {acc:.3f}  (majority {majority:.3f}, shuffled {np.mean(null):.3f}, p={p:.3f})", flush=True)
        if mname.startswith("Logistic"):
            for c in sorted(counts):
                m = y == c
                top = Counter(pred[m]).most_common(2)
                per.append(dict(task=name, label=c, sites=int(m.sum()), recall=round((pred[m] == c).mean(), 4),
                                most_confused_with=next((k for k, _ in top if k != c), "")))
for fname, rows in (("predict_lab.csv", out), ("predict_lab_by_class.csv", per)):
    with open(os.path.join(TABLES, fname), "w", newline="") as f:
        w = csv.DictWriter(f, list(rows[0]), lineterminator="\n"); w.writeheader(); w.writerows(rows)
print()
for r in per:
    print(f"  {r['task'][:12]:12} {r['label']:22} sites={r['sites']:3}  recognised {r['recall']*100:3.0f}%  most often mistaken for {r['most_confused_with']}")
