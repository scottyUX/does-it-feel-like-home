"""Run the agreed comparisons on the study sites and the Arena sites; write CSV tables for the results page.

Usage: python run_comparisons.py <repo root> <arena render dir root> <output dir>
  <arena render dir root> holds render-zh/ and render-en/ copied back from the Spark worker.

Design (agreed before running):
- Study sites (80 Spark sites, home pages): 2 US models x 2 Chinese models x 10 site types x 2 prompt languages.
  Q1 origin: paired within (site type, prompt language, size pair): Gemma 31B vs Qwen 3.8 27B, gpt-oss 120B vs Qwen 3.5 122B.
  Q2 prompt language: paired within (model, site type).
  Q3 interaction: origin difference with Chinese prompts minus with English prompts.
  Per model means; inner pages; phone pages.
- Arena (102 Chinese-prompt + 102 English-prompt US-vs-Chinese battles, matched by category): origin paired within battle.
- Each comparison: mean difference, 95% bootstrap CI, pairs higher/lower, sign-flip permutation p, Benjamini-Hochberg q
  across measures. "Clear" = q < 0.05. Both size pairs must agree in direction for a study-site origin difference to be called consistent.
- Classifier: can model origin be predicted from the measures? Logistic regression, leave-one-site-type-out (study) or
  leave-one-category-out (Arena) cross-validation; accuracy vs 50% with a permutation test.
"""
import csv, json, os, re, sys
from collections import defaultdict
import numpy as np

ROOT, ARENA, OUT = sys.argv[1], sys.argv[2], sys.argv[3]
os.makedirs(OUT, exist_ok=True)
sys.path.insert(0, os.path.join(ROOT, "research/measures"))
from pixels import measure as pixel_measures  # noqa: E402

rng = np.random.default_rng(2026)
# Curated measures, grouped as on the results page. Keyword checks are practical conventions only.
GROUPS = [
    ("Density", [("visible_text_chars", "Visible text (characters)"), ("text_chars_first_screen", "Text on first screen (characters)"),
                 ("text_blocks", "Separate text blocks"), ("visible_elements_first_screen", "Elements on first screen"),
                 ("page_screens", "Page length (desktop screens)"), ("mobile_page_screens", "Page length on a phone (screens)")]),
    ("Layout and navigation", [("columns_first_screen", "Side-by-side boxes on first screen"), ("nav_items", "Navigation items"),
                               ("has_hover_menu", "Has a hover-reveal menu"), ("footer_links", "Footer links"),
                               ("visible_links", "Links"), ("form_inputs", "Form inputs")]),
    ("Imagery and motion", [("images", "Images"), ("image_share_first_screen", "First screen covered by images"),
                            ("canvas_share", "Canvas (3D/game) area"), ("css_animated_elements", "Animated elements"),
                            ("fixed_or_sticky", "Fixed or sticky elements")]),
    ("Color and complexity", [("colorfulness", "Colorfulness"), ("saturation", "Saturation"), ("brightness", "Brightness"),
                              ("distinct_colors", "Distinct colors"), ("quadtree_blocks", "Visual complexity (quadtree blocks)"),
                              ("edge_density", "Edge density"), ("background_share", "Empty background share")]),
    ("Typography and language", [("font_sizes", "Distinct font sizes"), ("chinese_font_share", "Text in a chosen Chinese font"),
                                 ("latin_share", "Latin letters among letters")]),
    ("Features and local conventions", [("price_in_yuan", "Prices in yuan"), ("china_phone", "Chinese phone number"),
                                        ("icp_record", "ICP registration record"), ("wechat", "WeChat"), ("alipay", "Alipay"),
                                        ("chinese_platforms", "Weibo, Xiaohongshu, Douyin, QQ"), ("western_platforms", "Google, Facebook, PayPal…"),
                                        ("qr_code", "QR code"), ("chinese_date", "Chinese date format"), ("login", "Login or sign-up"),
                                        ("customer_service", "Customer service"), ("search_box", "Search box"), ("language_switch", "Language switch")]),
]
MEASURES = [(k, label, g) for g, items in GROUPS for k, label in items]
BINARY = {"has_hover_menu", "price_in_yuan", "china_phone", "icp_record", "wechat", "alipay", "chinese_platforms",
          "western_platforms", "qr_code", "chinese_date", "login", "customer_service", "search_box", "language_switch"}


def value(row, key):
    if key == "latin_share":
        letters = (row.get("latin_letters") or 0) + (row.get("cjk_characters") or 0)
        return (row.get("latin_letters") or 0) / letters if letters else np.nan
    v = row.get(key)
    return np.nan if v is None else float(v)


def paired_stats(diffs):
    d = np.asarray([x for x in diffs if not np.isnan(x)], float)
    if len(d) < 3:
        return None
    boots = d[rng.integers(0, len(d), (4000, len(d)))].mean(1)
    signs = rng.choice([-1, 1], (8000, len(d)))
    p = (np.abs((signs * d).mean(1)) >= abs(d.mean()) - 1e-12).mean()
    return dict(n=len(d), mean_diff=d.mean(), ci_low=np.percentile(boots, 2.5), ci_high=np.percentile(boots, 97.5),
                higher=int((d > 0).sum()), lower=int((d < 0).sum()), p=max(p, 1 / 8000))


def bh(ps):
    ps = np.asarray(ps, float); order = np.argsort(ps); q = np.empty_like(ps); prev = 1.0
    for rank, i in reversed(list(enumerate(order, 1))):
        prev = min(prev, ps[i] * len(ps) / rank); q[i] = prev
    return q


def compare(name, pairs, a_label, b_label, extra=None):
    """pairs: list of (row_a, row_b); difference is b - a."""
    rows = []
    for key, label, group in MEASURES:
        a_vals = [value(a, key) for a, b in pairs]; b_vals = [value(b, key) for a, b in pairs]
        s = paired_stats([y - x for x, y in zip(a_vals, b_vals)])
        if not s:
            continue
        row = dict(comparison=name, group=group, measure=key, label=label, binary=int(key in BINARY),
                   **{f"mean_{a_label}": np.nanmean(a_vals), f"mean_{b_label}": np.nanmean(b_vals)}, **s)
        if extra:
            row.update(extra(key))
        rows.append(row)
    for row, q in zip(rows, bh([r["p"] for r in rows])):
        row["q"] = q; row["clear"] = int(q < 0.05)
    return rows


def write(name, rows):
    if not rows:
        return
    keys = list(dict.fromkeys(k for r in rows for k in r))
    with open(os.path.join(OUT, name), "w", newline="") as f:
        w = csv.DictWriter(f, keys, lineterminator="\n"); w.writeheader()  # LF: the results page compares cells as text
        for r in rows:
            w.writerow({k: (round(v, 5) if isinstance(v, float) else v) for k, v in r.items()})
    print("wrote", name, len(rows))


# ---------------- Study sites ----------------
pages = json.load(open(os.path.join(ROOT, "research/results/study/pages.json")))
spark = [p for p in pages if p["set"] == "spark"]
home = {(p["model"], p["type"], p["prompt"]): p for p in spark if p["is_home"]}
inner = defaultdict(list)
for p in spark:
    if not p["is_home"]:
        inner[(p["model"], p["type"], p["prompt"])].append(p)
inner_mean = {k: {m: np.nanmean([value(r, m) for r in v]) for m, _, _ in MEASURES} | {"_n": len(v)} for k, v in inner.items()}
SIZE_PAIRS = [("google/gemma-4-31b", "qwen/qwen3.8-27b", "small"), ("openai/gpt-oss-120b", "qwen/qwen3.5-122b", "large")]
TYPES = sorted({p["type"] for p in spark}); LANGS = ["en", "zh"]
MODELS = ["google/gemma-4-31b", "openai/gpt-oss-120b", "qwen/qwen3.8-27b", "qwen/qwen3.5-122b"]

def origin_pairs(source, size=None, lang=None):
    return [(source[(us, t, l)], source[(cn, t, l)]) for us, cn, s in SIZE_PAIRS if size in (None, s)
            for t in TYPES for l in LANGS if l in ((lang,) if lang else LANGS) if (us, t, l) in source and (cn, t, l) in source]

def size_agreement(key):
    signs = []
    for s in ("small", "large"):
        d = [value(b, key) - value(a, key) for a, b in origin_pairs(home, size=s)]
        signs.append(np.sign(np.nanmean(d)) if d else 0)
    return {"small_pair_diff": np.nanmean([value(b, key) - value(a, key) for a, b in origin_pairs(home, size="small")]),
            "large_pair_diff": np.nanmean([value(b, key) - value(a, key) for a, b in origin_pairs(home, size="large")]),
            "both_pairs_agree": int(signs[0] == signs[1] and signs[0] != 0)}

study_rows = []
study_rows += compare("study_origin", origin_pairs(home), "us", "china", size_agreement)
study_rows += compare("study_origin_zh_prompt", origin_pairs(home, lang="zh"), "us", "china")
study_rows += compare("study_origin_en_prompt", origin_pairs(home, lang="en"), "us", "china")
lang_pairs = [(home[(m, t, "en")], home[(m, t, "zh")]) for m in MODELS for t in TYPES if (m, t, "en") in home and (m, t, "zh") in home]
study_rows += compare("study_prompt_language", lang_pairs, "en", "zh")
inner_pairs = [(inner_mean[(us, t, l)], inner_mean[(cn, t, l)]) for us, cn, _ in SIZE_PAIRS for t in TYPES for l in LANGS
               if (us, t, l) in inner_mean and (cn, t, l) in inner_mean]
study_rows += compare("study_origin_inner_pages", inner_pairs, "us", "china")
# Interaction: (CN - US | zh) - (CN - US | en), paired within (size pair, type)
inter = []
for us, cn, s in SIZE_PAIRS:
    for t in TYPES:
        if all((m, t, l) in home for m in (us, cn) for l in LANGS):
            inter.append(({k: value(home[(cn, t, "en")], k) - value(home[(us, t, "en")], k) for k, _, _ in MEASURES},
                          {k: value(home[(cn, t, "zh")], k) - value(home[(us, t, "zh")], k) for k, _, _ in MEASURES}))
study_rows += compare("study_interaction", inter, "gap_en", "gap_zh")
write("study_comparisons.csv", study_rows)

model_rows = []
for m in MODELS:
    for l in LANGS:
        sites = [home[(m, t, l)] for t in TYPES if (m, t, l) in home]
        model_rows.append({"model": m, "origin": "China" if m.startswith("qwen") else "US", "prompt": l, "n": len(sites),
                           **{k: np.nanmean([value(s, k) for s in sites]) for k, _, _ in MEASURES}})
write("study_model_means.csv", model_rows)
write("study_sites.csv", [{"site": p["site"], "model": p["model"], "origin": p["origin"], "prompt": p["prompt"], "type": p["type"],
                           **{k: value(p, k) for k, _, _ in MEASURES}} for p in spark if p["is_home"]])

# ---------------- Arena sites ----------------
mapping = json.load(open(os.path.join(ROOT, "arena/model-origins.provisional.json")))
arena_sites, arena_pairs, evidence = [], {"zh": [], "en": []}, {}
for lang in ("zh", "en"):
    pairs = json.load(open(os.path.join(ROOT, f"arena-data/experiment-{lang}/pairs.json")))
    base = os.path.join(ARENA, f"render-{lang}")
    for pair in pairs:
        sides = {}
        for side in ("a", "b"):
            d = os.path.join(base, pair["id"], side)
            mfile = os.path.join(d, "measurements.json")
            if not os.path.isfile(mfile):
                continue
            m = json.load(open(mfile))
            m.update(pixel_measures(open(os.path.join(d, "screenshot.png"), "rb").read()))
            model = pair[f"model_{side}"]
            m.update(battle=pair["id"], side=side, lang=lang, model=model, origin=mapping[model],
                     won=int(pair["winner"] == f"model_{side}"), category=pair["category"])
            evfile = os.path.join(d, "evidence.json")
            if os.path.isfile(evfile):
                evidence[f"{pair['id']}/{side}"] = json.load(open(evfile))
            sides[side] = m; arena_sites.append(m)
        if len(sides) == 2:
            us = sides["a"] if sides["a"]["origin"] == "US" else sides["b"]
            cn = sides["b"] if us is sides["a"] else sides["a"]
            arena_pairs[lang].append((us, cn))
arena_rows = []
for lang in ("zh", "en"):
    arena_rows += compare(f"arena_origin_{lang}_prompt", arena_pairs[lang], "us", "china")
write("arena_comparisons.csv", arena_rows)
write("arena_sites.csv", [{k: (s.get(k) if k in ("battle", "side", "lang", "model", "origin", "won", "category") else value(s, k))
                           for k in ["battle", "side", "lang", "model", "origin", "won", "category"] + [m for m, _, _ in MEASURES]}
                          for s in arena_sites])
with open(os.path.join(OUT, "arena_evidence.json"), "w") as f:
    json.dump(evidence, f, indent=1)  # escaped: the running worker's snippets can hold half an emoji

# Preference: Chinese model's win rate vs what official scores predict (scores as of 2026-07-31)
import duckdb  # noqa: E402
names = {k: v.lstrip("~") for k, v in json.load(open(os.path.join(ROOT, "research/analysis/score_names.provisional.json"))).items() if not k.startswith("_")}
lb = dict(duckdb.sql(f"""select model_name, arg_max(rating, leaderboard_publish_date) from read_parquet('{os.path.join(ROOT, "arena-data/webdev-leaderboard-full.parquet")}')
    where category='overall' and leaderboard_publish_date<='2026-07-31' group by 1""").fetchall())
pref = []
for lang in ("zh", "en"):
    obs, exp = [], []
    for us, cn in arena_pairs[lang]:
        su, sc = lb.get(names.get(us["model"])), lb.get(names.get(cn["model"]))
        if su is None or sc is None:
            continue
        obs.append(cn["won"]); exp.append(1 / (1 + 10 ** ((su - sc) / 400)))
    o, e = np.array(obs, float), np.array(exp)
    if len(o):
        boots = [(o[i] - e[i]).mean() for i in (rng.integers(0, len(o), len(o)) for _ in range(4000))]
        pref.append(dict(prompt=lang, battles=len(o), chinese_won=o.mean(), expected=e.mean(), difference=(o - e).mean(),
                         ci_low=np.percentile(boots, 2.5), ci_high=np.percentile(boots, 97.5)))
    # Fuller site wins? share of battles won by the site with more visible text
    s = [(us, cn) for us, cn in arena_pairs[lang] if us["visible_text_chars"] != cn["visible_text_chars"]]
    if s:
        pref[-1]["fuller_site_won"] = np.mean([(cn["visible_text_chars"] > us["visible_text_chars"]) == bool(cn["won"]) for us, cn in s])
write("arena_preference.csv", pref)

# ---------------- Classifier: is origin identifiable? ----------------
from sklearn.linear_model import LogisticRegression  # noqa: E402
from sklearn.pipeline import make_pipeline  # noqa: E402
from sklearn.preprocessing import StandardScaler  # noqa: E402
from sklearn.impute import SimpleImputer  # noqa: E402

def cv_accuracy(X, y, groups):
    preds = np.empty(len(y))
    for g in np.unique(groups):
        test = groups == g
        model = make_pipeline(SimpleImputer(), StandardScaler(), LogisticRegression(C=0.5, max_iter=2000))
        model.fit(X[~test], y[~test]); preds[test] = model.predict(X[test])
    return (preds == y).mean()

clf = []
ALL = [k for k, _, _ in MEASURES]
GROUP_OF = {k: g for k, _, g in MEASURES}
PIXEL_AND_IMAGE = {"images", "image_share_first_screen", "colorfulness", "saturation", "brightness", "distinct_colors",
                   "quadtree_blocks", "edge_density", "background_share"}
FEATURE_SETS = [("All measures", ALL),
                ("Without local conventions and features", [k for k in ALL if GROUP_OF[k] != "Features and local conventions"]),
                ("Without images and screenshot measures", [k for k in ALL if k not in PIXEL_AND_IMAGE]),
                ("Density, layout and navigation only", [k for k in ALL if GROUP_OF[k] in ("Density", "Layout and navigation")])]
datasets = [("Study sites", [home[k] for k in sorted(home)], "type"),
            ("Arena, Chinese prompts", [s for s in arena_sites if s["lang"] == "zh"], "category"),
            ("Arena, English prompts", [s for s in arena_sites if s["lang"] == "en"], "category")]
LABEL = {k: l for k, l, _ in MEASURES}
for name, rows, group_key in datasets:
    if len(rows) < 20:
        continue
    y = np.array([r["origin"] in ("China", "CN") for r in rows], int)
    groups = np.array([r[group_key] for r in rows])
    for set_name, keys in FEATURE_SETS:
        X = np.array([[value(r, k) for k in keys] for r in rows], float)
        X[:, np.all(np.isnan(X), 0)] = 0
        acc = cv_accuracy(X, y, groups)
        null = [cv_accuracy(X, rng.permutation(y), groups) for _ in range(200)]
        fit = make_pipeline(SimpleImputer(), StandardScaler(), LogisticRegression(C=0.5, max_iter=2000)).fit(X, y)
        coef = fit[-1].coef_[0]; top = np.argsort(-np.abs(coef))[:5]
        clf.append(dict(dataset=name, features=set_name, n_features=len(keys), sites=len(rows), accuracy=acc,
                        chance=max(y.mean(), 1 - y.mean()), p=(np.sum(np.array(null) >= acc) + 1) / (len(null) + 1),
                        top_cues="; ".join(f"{LABEL[keys[i]]} ({'Chinese' if coef[i] > 0 else 'US'})" for i in top)))
write("classifier.csv", clf)
print("done")
