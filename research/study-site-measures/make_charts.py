"""Sample charts of new measures on the 80 Spark study sites. Usage: python make_charts.py measures.json outdir"""
import json, sys, os
import numpy as np
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib.lines import Line2D
from matplotlib.colors import LinearSegmentedColormap

SRC, OUT = sys.argv[1], sys.argv[2]
US, CN = "#2a78d6", "#eb6834"          # validated categorical slots 1-2
INK, INK2, GRID, SURF = "#0b0b0b", "#52514e", "#e6e5e1", "#fcfcfb"
SEQ = ["#cde2fb", "#9ec5f4", "#6da7ec", "#3987e5", "#256abf", "#184f95", "#0d366b"]   # blue ramp 100..700
from matplotlib import font_manager
for _f in ("/System/Library/Fonts/Hiragino Sans GB.ttc",):
    try: font_manager.fontManager.addfont(_f)
    except Exception: pass
plt.rcParams.update({"font.family": ["DejaVu Sans", "Hiragino Sans GB"], "font.size": 10, "axes.edgecolor": GRID, "axes.labelcolor": INK2, "xtick.color": INK2,
                     "ytick.color": INK2, "axes.facecolor": SURF, "figure.facecolor": SURF, "savefig.facecolor": SURF,
                     "axes.spines.top": False, "axes.spines.right": False, "axes.grid": True, "grid.color": GRID,
                     "grid.linewidth": 0.8, "axes.axisbelow": True})
R = json.load(open(SRC))
CAPTION = "Source: 80 study sites from the DGX Spark. US: Gemma 4 31B, gpt-oss 120B. China: Qwen 3.8 27B, Qwen 3.5 122B."
GROUPS = [("US", "en"), ("US", "zh"), ("China", "en"), ("China", "zh")]
rng = np.random.default_rng(0)

def cell(o, p): return [r for r in R if r["origin"] == o and r["prompt"] == p]
def mean_ci(v):
    v = np.asarray(v, float); bs = [v[rng.integers(0, len(v), len(v))].mean() for _ in range(3000)]
    return v.mean(), *np.percentile(bs, [2.5, 97.5])
def finish(fig, path, title, subtitle):
    h = fig.get_figheight()
    fig.text(0.01, 1 - 0.25 / h, title, ha="left", va="top", fontsize=14, color=INK, fontweight="bold")
    fig.text(0.01, 1 - 0.58 / h, subtitle, ha="left", va="top", fontsize=10, color=INK2)
    fig.text(0.01, 0.012, CAPTION, ha="left", fontsize=8, color=INK2)
    fig.savefig(path, dpi=200); plt.close(fig); print("wrote", path)

# ---- 1. Interaction plots: does origin or prompt language move each measure?
M = [("text_chars", "Visible text (characters)", 1), ("footer_links", "Footer links", 1),
     ("fold_image_share", "First screen covered by images (%)", 100), ("cn_font_share", "Text in a chosen Chinese font (%)", 100),
     ("quadtree_leaves", "Visual complexity (quadtree blocks)", 1), ("colorfulness", "Colorfulness (Hasler–Süsstrunk)", 1)]
fig, axes = plt.subplots(2, 3, figsize=(13, 8))
fig.subplots_adjust(left=0.06, right=0.98, top=0.83, bottom=0.08, hspace=0.45, wspace=0.28)
origin_gap = lang_gap = 0
for ax, (k, lab, scale) in zip(axes.ravel(), M):
    for o, col, dx in (("US", US, -0.03), ("China", CN, 0.03)):
        st = [mean_ci([r[k] * scale for r in cell(o, p)]) for p in ("en", "zh")]
        xs = np.array([0, 1]) + dx
        ax.plot(xs, [s[0] for s in st], color=col, lw=2, zorder=2)
        for x, (m, lo, hi) in zip(xs, st):
            ax.plot([x, x], [lo, hi], color=col, lw=1.5, alpha=0.6, zorder=1)
            ax.scatter(x, m, s=55, color=col, edgecolor=SURF, linewidth=1.5, zorder=3)
    ax.set_xticks([0, 1]); ax.set_xticklabels(["English prompt", "Chinese prompt"], color=INK); ax.set_xlim(-0.35, 1.35)
    ax.set_ylim(bottom=0); ax.set_title(lab, loc="left", fontsize=11, color=INK); ax.grid(axis="x", visible=False)
    ax.tick_params(axis="x", length=0)
    us = np.mean([r[k] for r in R if r["origin"] == "US"]); cn = np.mean([r[k] for r in R if r["origin"] == "China"])
    en = np.mean([r[k] for r in R if r["prompt"] == "en"]); zh = np.mean([r[k] for r in R if r["prompt"] == "zh"])
    origin_gap += abs(cn - us) > abs(zh - en)
fig.legend(handles=[Line2D([], [], color=US, lw=2, marker="o", label="US models"), Line2D([], [], color=CN, lw=2, marker="o", label="Chinese models")],
           loc="upper right", ncol=2, frameon=False, bbox_to_anchor=(0.98, 0.90))
finish(fig, os.path.join(OUT, "1_origin_vs_prompt_language.png"),
       f"Model origin moves {origin_gap} of 6 measures more than prompt language does",
       "Mean per group with 95% bootstrap interval; 20 sites per group. Lines far apart = origin matters; steep lines = prompt language matters.")

# ---- 2. Localization and features checklist heatmap
F = [("icp_record", "ICP record (备案)"), ("customer_service", "Customer service / chat"), ("login", "Login or sign-up"),
     ("price_in_yuan", "Prices in yuan (¥/元)"), ("china_phone", "Chinese phone number"), ("wechat", "WeChat"),
     ("search", "Search box"), ("chinese_date", "Chinese date format"), ("chinese_social", "Weibo, Xiaohongshu, Douyin"),
     ("alipay", "Alipay"), ("qr_code", "QR code"), ("western_platforms", "Google, Facebook, PayPal…"), ("language_switch", "Language switch")]
mat = np.array([[100 * np.mean([r[k] for r in cell(o, p)]) for (o, p) in GROUPS] for k, _ in F])
order = np.argsort(-mat.mean(1)); mat = mat[order]; F = [F[i] for i in order]
cmap = LinearSegmentedColormap.from_list("seq", ["#f0efec"] + SEQ)
fig, ax = plt.subplots(figsize=(9, 7.4))
fig.subplots_adjust(left=0.30, right=0.97, top=0.80, bottom=0.08)
ax.imshow(mat, cmap=cmap, vmin=0, vmax=100, aspect="auto")
for i in range(mat.shape[0]):
    for j in range(mat.shape[1]):
        v = mat[i, j]; ax.text(j, i, f"{v:.0f}%", ha="center", va="center", fontsize=9, color="white" if v >= 45 else INK)
ax.set_xticks(range(4)); ax.set_xticklabels(["US models\nEnglish prompt", "US models\nChinese prompt", "Chinese models\nEnglish prompt", "Chinese models\nChinese prompt"], color=INK)
ax.xaxis.tick_top(); ax.set_yticks(range(len(F))); ax.set_yticklabels([f[1] for f in F], color=INK)
ax.grid(False); ax.tick_params(length=0)
for sp in ax.spines.values(): sp.set_visible(False)
ax.set_xticks(np.arange(-0.5, 4, 1), minor=True); ax.set_yticks(np.arange(-0.5, len(F), 1), minor=True)
ax.grid(which="minor", color=SURF, linewidth=3); ax.tick_params(which="minor", length=0)
icp = {g: 100 * np.mean([r["icp_record"] for r in cell(*g)]) for g in GROUPS}
finish(fig, os.path.join(OUT, "2_localization_checklist.png"),
       f"Chinese models add local details: {min(icp[('China','en')], icp[('China','zh')]):.0f}–{max(icp[('China','en')], icp[('China','zh')]):.0f}% show an ICP record, US models {min(icp[('US','en')], icp[('US','zh')]):.0f}–{max(icp[('US','en')], icp[('US','zh')]):.0f}%",
       "Share of home pages (20 per group) whose visible text or labels include each item.")

# ---- 3. Palette fingerprint: hue families as a share of colored (non-neutral) area
H = [("red", "#d03b3b"), ("orange", "#ec835a"), ("yellow", "#eda100"), ("green", "#1baf7a"), ("blue", "#2a78d6"), ("purple", "#6250d6")]
fig, ax = plt.subplots(figsize=(11, 4.8))
fig.subplots_adjust(left=0.25, right=0.86, top=0.72, bottom=0.16)
labels = ["US models, English prompt", "US models, Chinese prompt", "Chinese models, English prompt", "Chinese models, Chinese prompt"]
for i, g in enumerate(GROUPS):
    s = cell(*g); tot = {h: np.mean([r[f"hue_{h}"] for r in s]) for h, _ in H}; colored = sum(tot.values())
    left = 0
    for h, c in H:
        w = 100 * tot[h] / colored
        ax.barh(i, w, left=left, color=c, height=0.62, edgecolor=SURF, linewidth=2)
        if w >= 7: ax.text(left + w / 2, i, f"{w:.0f}%", ha="center", va="center", fontsize=8.5, color="white")
        left += w
    ax.text(101.5, i, f"{100 * colored:.0f}% of screen\nis colored", va="center", fontsize=8, color=INK2)
ax.set_yticks(range(4)); ax.set_yticklabels(labels, color=INK); ax.invert_yaxis(); ax.set_xlim(0, 100)
ax.set_xlabel("Share of colored pixels (%)"); ax.grid(axis="y", visible=False); ax.tick_params(axis="y", length=0)
ax.legend(handles=[plt.Rectangle((0, 0), 1, 1, color=c) for _, c in H], labels=[h for h, _ in H], ncol=6, frameon=False,
          loc="lower left", bbox_to_anchor=(0, 1.02), fontsize=9)
blue_cz = np.mean([r["hue_blue"] for r in cell("China", "zh")]) / sum(np.mean([r[f"hue_{h}"] for r in cell("China", "zh")]) for h, _ in H)
finish(fig, os.path.join(OUT, "3_palette_fingerprint.png"),
       f"With a Chinese prompt, Chinese models' color is {100 * blue_cz:.0f}% blue and almost no red",
       "Hue families among colored pixels on the first screen (saturation > 0.25). Photos count, so sites with photos show more mixed color.")

# ---- 4. Mobile page length: each site a dot
fig, ax = plt.subplots(figsize=(9, 4.6))
fig.subplots_adjust(left=0.27, right=0.96, top=0.76, bottom=0.16)
for i, (g, lab) in enumerate(zip(GROUPS, labels)):
    v = np.array([r["mobile_page_screens"] for r in cell(*g)]); col = US if g[0] == "US" else CN
    ax.scatter(v, i + rng.uniform(-0.18, 0.18, len(v)), s=28, color=col, alpha=0.75, edgecolor=SURF, linewidth=0.8)
    ax.plot([np.median(v)] * 2, [i - 0.3, i + 0.3], color=INK, lw=2)
    ax.text(np.median(v), i - 0.36, f"median {np.median(v):.1f}", ha="center", fontsize=8, color=INK2)
ax.set_yticks(range(4)); ax.set_yticklabels(labels, color=INK); ax.invert_yaxis(); ax.set_xlim(left=0)
ax.set_xlabel("Home page length on a phone (screens of 844 px)"); ax.grid(axis="y", visible=False); ax.tick_params(axis="y", length=0)
med_us = np.median([r["mobile_page_screens"] for r in R if r["origin"] == "US"]); med_cn = np.median([r["mobile_page_screens"] for r in R if r["origin"] == "China"])
finish(fig, os.path.join(OUT, "4_mobile_page_length.png"),
       f"On a phone, Chinese models' home pages run about {med_cn / med_us:.1f}× longer",
       "Each dot is one site rendered at 390x844; the black tick marks the median.")
