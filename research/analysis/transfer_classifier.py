"""Does the origin classifier transfer between datasets?

Usage: python transfer_classifier.py <tables dir>
Trains the same logistic regression as run_comparisons.py on one dataset (all its sites) and tests it on another.
Two scalings: "pooled" standardizes with the training set's mean and spread (the plain transfer); "per dataset"
standardizes each dataset on its own, so only relative differences within a dataset carry over (removes shifts
such as Arena sites simply having more text overall). Accuracy is compared with 50% by a binomial test and with
the test set's majority class.
"""
import csv, os, sys
import numpy as np
from scipy.stats import binomtest
from sklearn.impute import SimpleImputer
from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import StandardScaler

TABLES = sys.argv[1]
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
FEATURES = None


def load(name, filt=None):
    rows = [r for r in csv.DictReader(open(os.path.join(TABLES, name))) if not filt or filt(r)]
    return rows


study = load("study_sites.csv")
arena_zh = load("arena_sites.csv", lambda r: r["lang"] == "zh")
arena_en = load("arena_sites.csv", lambda r: r["lang"] == "en")
skip = {"site", "model", "origin", "prompt", "type", "battle", "side", "lang", "won", "category"}
FEATURES = [k for k in study[0] if k not in skip and k in arena_zh[0]]
DENSITY_LAYOUT = ["visible_text_chars", "text_chars_first_screen", "text_blocks", "visible_elements_first_screen", "page_screens",
                  "mobile_page_screens", "columns_first_screen", "nav_items", "has_hover_menu", "footer_links", "visible_links", "form_inputs"]


def matrix(rows, keys):
    X = np.array([[float(r[k]) if r[k] not in ("", "nan", None) else np.nan for k in keys] for r in rows])
    y = np.array([r["origin"] in ("China", "CN") for r in rows], int)
    return X, y


def prep(X, imputer=None, scaler=None):
    X = X.copy(); X[:, np.all(np.isnan(X), 0)] = 0
    imputer = imputer or SimpleImputer().fit(X)
    X = imputer.transform(X)
    scaler = scaler or StandardScaler().fit(X)
    return np.nan_to_num(scaler.transform(X)), imputer, scaler


SETS = {"Study sites": study, "Arena, Chinese prompts": arena_zh, "Arena, English prompts": arena_en}
PAIRS = [("Study sites", "Arena, Chinese prompts"), ("Study sites", "Arena, English prompts"),
         ("Arena, Chinese prompts", "Study sites"), ("Arena, English prompts", "Study sites"),
         ("Arena, Chinese prompts", "Arena, English prompts"), ("Arena, English prompts", "Arena, Chinese prompts")]
out = []
for feat_name, keys in (("All measures", FEATURES), ("Density, layout and navigation only", DENSITY_LAYOUT)):
    for train, test in PAIRS:
        Xtr, ytr = matrix(SETS[train], keys); Xte, yte = matrix(SETS[test], keys)
        for scaling in ("pooled", "per dataset"):
            Ztr, imp, sc = prep(Xtr)
            Zte = prep(Xte, imp, sc)[0] if scaling == "pooled" else prep(Xte)[0]
            model = LogisticRegression(C=0.5, max_iter=5000).fit(Ztr, ytr)
            pred = model.predict(Zte); acc = (pred == yte).mean(); k = int((pred == yte).sum())
            out.append(dict(features=feat_name, train=train, test=test, scaling=scaling, test_sites=len(yte), accuracy=round(acc, 4),
                            majority=round(max(yte.mean(), 1 - yte.mean()), 4), p_vs_50=round(binomtest(k, len(yte), 0.5, alternative="greater").pvalue, 5),
                            predicted_chinese_share=round(pred.mean(), 3)))
            print(f"{feat_name[:22]:22} {train:24} -> {test:24} {scaling:11} acc {acc:.3f} (n={len(yte)}, p={out[-1]['p_vs_50']:.3g}, predicted Chinese {pred.mean():.2f})")
with open(os.path.join(TABLES, "classifier_transfer.csv"), "w", newline="") as f:
    w = csv.DictWriter(f, list(out[0]), lineterminator="\n"); w.writeheader(); w.writerows(out)
print("wrote classifier_transfer.csv")
