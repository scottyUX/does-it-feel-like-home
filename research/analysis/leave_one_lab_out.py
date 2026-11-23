"""Can model origin be predicted for a lab the classifier has never seen? (Arena sites)

Usage: python leave_one_lab_out.py <tables dir>
For each lab: train on every other lab's sites, predict the held-out lab's sites. Pooled over labs, report balanced
accuracy (mean of US and Chinese recall, so a classifier that always says "US" scores 50%). Significance: origin is
shuffled between labs (labs are the units), 200 times, keeping the number of US and Chinese labs.
"""
import csv, os, re, sys
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression

TABLES = sys.argv[1]
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
exec(open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "transfer_classifier.py")).read().split("SETS = {")[0])

LABS = [(r"^claude", "Anthropic"), (r"^gpt", "OpenAI"), (r"^gemini", "Google"), (r"^grok", "xAI"), (r"^kimi", "Moonshot"),
        (r"^qwen", "Alibaba"), (r"^deepseek", "DeepSeek"), (r"^glm", "Zhipu"), (r"^minimax", "MiniMax"), (r"^mimo", "Xiaomi"),
        (r"^longcat", "Meituan")]
def lab(model):
    return next((name for pattern, name in LABS if re.match(pattern, model)), None)

MODELS = {"Logistic regression": lambda: LogisticRegression(C=0.5, max_iter=5000),
          "Random forest": lambda: RandomForestClassifier(150, min_samples_leaf=2, random_state=0, n_jobs=-1)}
rng = np.random.default_rng(7)


def balanced(pred, y):
    return np.mean([(pred[y == c] == c).mean() for c in (0, 1) if (y == c).any()])


def run(rows, make, origin_of_lab):
    labs = np.array([lab(r["model"]) for r in rows])
    X, _ = matrix(rows, FEATURES)
    y = np.array([origin_of_lab[l] for l in labs])
    pred = np.empty(len(y), int)
    for held in np.unique(labs):
        te = labs == held
        Za, imp, sc = prep(X[~te]); Zb = prep(X[te], imp, sc)[0]
        pred[te] = make().fit(Za, y[~te]).predict(Zb)
    per_lab = {l: (pred[labs == l] == y[labs == l]).mean() for l in np.unique(labs)}
    return balanced(pred, y), per_lab, pred, y, labs


out, per_lab_rows = [], []
data = {"Arena, Chinese prompts": arena_zh, "Arena, English prompts": arena_en, "Arena, both": arena_zh + arena_en}
for dname, rows in data.items():
    rows = [r for r in rows if lab(r["model"])]
    true_origin = {lab(r["model"]): int(r["origin"] in ("China", "CN")) for r in rows}
    lab_names = sorted(true_origin); n_cn = sum(true_origin.values())
    for mname, make in MODELS.items():
        score, per_lab, pred, y, labs = run(rows, make, true_origin)
        null = []
        for _ in range(200 if mname == "Logistic regression" else 20):
            perm = dict(zip(lab_names, rng.permutation([true_origin[l] for l in lab_names])))
            null.append(run(rows, make, perm)[0])
        p = (np.sum(np.array(null) >= score) + 1) / (len(null) + 1)
        out.append(dict(dataset=dname, classifier=mname, sites=len(rows), labs=len(lab_names), chinese_labs=n_cn,
                        balanced_accuracy=round(score, 4), null_mean=round(float(np.mean(null)), 4), p=round(p, 4)))
        print(f"{dname:24} {mname:20} sites={len(rows)} labs={len(lab_names)} balanced acc {score:.3f}  (shuffled-labs mean {np.mean(null):.3f}, p={p:.3f})")
        for l in lab_names:
            per_lab_rows.append(dict(dataset=dname, classifier=mname, lab=l, origin="China" if true_origin[l] else "US",
                                     sites=int((labs == l).sum()), correct=round(per_lab[l], 4)))
for name, rows in (("classifier_leave_one_lab_out.csv", out), ("classifier_leave_one_lab_out_by_lab.csv", per_lab_rows)):
    with open(os.path.join(TABLES, name), "w", newline="") as f:
        w = csv.DictWriter(f, list(rows[0]), lineterminator="\n"); w.writeheader(); w.writerows(rows)
print("\nPer lab (logistic regression, both languages):")
for r in per_lab_rows:
    if r["dataset"] == "Arena, both" and r["classifier"] == "Logistic regression":
        print(f"  {r['lab']:10} {r['origin']:6} sites={r['sites']:3}  correct {r['correct']*100:.0f}%")
