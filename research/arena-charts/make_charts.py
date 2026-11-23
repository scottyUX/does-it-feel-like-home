"""Charts for 10 paired US vs Chinese model sites (Arena, Chinese prompts). Usage: python make_charts.py pairs.csv outdir"""
import csv, sys, os, re
import numpy as np
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib.lines import Line2D

SRC, OUT = sys.argv[1], sys.argv[2]
US, CN = "#2a78d6", "#eb6834"                # validated categorical slots 1-2
INK, INK2, GRID, SURF = "#0b0b0b", "#52514e", "#e6e5e1", "#fcfcfb"
plt.rcParams.update({"font.size": 10, "axes.edgecolor": GRID, "axes.labelcolor": INK2, "xtick.color": INK2,
                     "ytick.color": INK2, "axes.facecolor": SURF, "figure.facecolor": SURF, "savefig.facecolor": SURF,
                     "axes.spines.top": False, "axes.spines.right": False, "axes.grid": True, "grid.color": GRID,
                     "grid.linewidth": 0.8, "axes.axisbelow": True})

def short(m):
    m = re.sub(r"-(webdev|preview)$", "", m)
    m = m.replace("qwen3.5-397b-a17b", "qwen3.5-397b").replace("gemini-3.1-flash-lite", "gemini-3.1-flash-lite")
    return m
CAT = {"simulations": "Simulation", "data_and_analytics_applications": "Data app", "gaming": "Game",
       "content_creation_and_editing_tools": "Creative tool", "brand_marketing_and_informational_websites": "Website",
       "reference_based_design": "Reference design", "consumer_product_and_platform_applications": "Consumer app"}

rows = list(csv.DictReader(open(SRC)))
pairs = {}
for r in rows:
    pairs.setdefault(r["pair_id"], {})[r["developer_origin"]] = r
P = []
for pid, p in pairs.items():
    u, c = p["US"], p["CN"]
    win = u if u["arena_winner"] == "model_" + u["side"] else c
    P.append(dict(id=pid, cat=CAT[u["category"]], us=u, cn=c, winner=win["developer_origin"],
                  label=f"{CAT[u['category']]}: {short(u['model'])} vs {short(c['model'])}"))
P.sort(key=lambda p: (p["cat"], p["label"]))
num = lambda r, k: float(r[k])
caption = "Source: Arena WebDev preferences (July 2026), Chinese-language prompts, 10 US-vs-Chinese pairs built from the same prompt."

def finish(fig, path, title, subtitle):
    h = fig.get_figheight()
    fig.text(0.01, 1 - 0.25 / h, title, ha="left", va="top", fontsize=14, color=INK, fontweight="bold")
    fig.text(0.01, 1 - 0.58 / h, subtitle, ha="left", va="top", fontsize=10, color=INK2)
    fig.text(0.01, 0.012, caption, ha="left", fontsize=8, color=INK2)
    fig.savefig(path, dpi=200); plt.close(fig); print("wrote", path)

# ---- 1. Dumbbell small multiples
MEAS = [("visible_text_chars", "Visible text (characters)"), ("visible_elements", "Visible elements"),
        ("visible_buttons", "Buttons"), ("css_animated_elements", "Animated elements")]
fig, axes = plt.subplots(1, 4, figsize=(16, 6.4), sharey=True)
fig.subplots_adjust(left=0.27, right=0.99, top=0.80, bottom=0.12, wspace=0.12)
y = np.arange(len(P))[::-1]
for ax, (k, lab) in zip(axes, MEAS):
    for yi, p in zip(y, P):
        a, b = num(p["us"], k), num(p["cn"], k)
        ax.plot([a, b], [yi, yi], color="#c9c8c2", lw=2, zorder=1, solid_capstyle="round")
        for v, col, side in ((a, US, "US"), (b, CN, "CN")):
            won = p["winner"] == side
            ax.scatter(v, yi, s=70, zorder=3, color=col if won else SURF, edgecolor=col, linewidth=2)
    ax.set_xscale("symlog", linthresh=1); ax.set_xlim(left=-0.3)
    ax.set_title(lab, loc="left", fontsize=11, color=INK)
    ax.grid(axis="y", visible=False); ax.tick_params(axis="y", length=0)
    ax.xaxis.set_major_formatter(matplotlib.ticker.FuncFormatter(lambda v, _: f"{v:,.0f}"))
axes[0].set_yticks(y); axes[0].set_yticklabels([p["label"] for p in P], color=INK)
more = sum(num(p["us"], "visible_text_chars") > num(p["cn"], "visible_text_chars") for p in P)
anim = sum(num(p["us"], "css_animated_elements") > num(p["cn"], "css_animated_elements") for p in P)
leg = [Line2D([], [], marker="o", ls="", ms=8, color=US, label="US model"),
       Line2D([], [], marker="o", ls="", ms=8, color=CN, label="Chinese model"),
       Line2D([], [], marker="o", ls="", ms=8, color=INK2, label="filled = won the vote"),
       Line2D([], [], marker="o", ls="", ms=8, mfc=SURF, mec=INK2, mew=2, label="hollow = lost")]
fig.legend(handles=leg, loc="upper right", ncol=4, frameon=False, bbox_to_anchor=(0.99, 0.90), fontsize=9)
finish(fig, os.path.join(OUT, "1_dumbbell_by_pair.png"),
       f"US models' sites had more text in {more} of 10 pairs and more animation in {anim} of 10",
       "Each row is one prompt. Filled dot = the side the user picked. Where the two sites tie, one dot hides the other. Log scale.")

# ---- 2. Slope chart: visible text, colored by who won
def dodge(vals, gap):
    """Spread label positions (log10 space) so neighbors are at least `gap` apart."""
    order = np.argsort(vals); pos = np.log10(np.array(vals, float))[order]
    for i in range(1, len(pos)):
        pos[i] = max(pos[i], pos[i - 1] + gap)
    out = np.empty_like(pos); out[order] = pos; return 10 ** out
fig, ax = plt.subplots(figsize=(8, 7.5))
fig.subplots_adjust(left=0.25, right=0.75, top=0.82, bottom=0.08)
denser_won = 0
us_v = [num(p["us"], "visible_text_chars") for p in P]; cn_v = [num(p["cn"], "visible_text_chars") for p in P]
us_l, cn_l = dodge(us_v, 0.075), dodge(cn_v, 0.075)
for i, p in enumerate(P):
    a, b = us_v[i], cn_v[i]
    col = US if p["winner"] == "US" else CN
    denser_won += (a > b) == (p["winner"] == "US")
    ax.plot([0, 1], [a, b], color=col, lw=2, alpha=0.9)
    ax.scatter([0, 1], [a, b], color=col, s=40, zorder=3, edgecolor=SURF, linewidth=1.5)
    ax.annotate(short(p["us"]["model"]), (0, a), xytext=(-0.06, us_l[i]), textcoords="data", ha="right", va="center", fontsize=8, color=INK2,
                arrowprops=dict(arrowstyle="-", color="#c9c8c2", lw=0.6) if abs(np.log10(us_l[i] / a)) > 0.01 else None)
    ax.annotate(short(p["cn"]["model"]), (1, b), xytext=(1.06, cn_l[i]), textcoords="data", ha="left", va="center", fontsize=8, color=INK2,
                arrowprops=dict(arrowstyle="-", color="#c9c8c2", lw=0.6) if abs(np.log10(cn_l[i] / b)) > 0.01 else None)
ax.set_yscale("log"); ax.set_xlim(-0.05, 1.05); ax.set_xticks([0, 1]); ax.set_xticklabels(["US model's site", "Chinese model's site"], color=INK)
ax.set_yticks([]); ax.yaxis.set_minor_locator(matplotlib.ticker.NullLocator())
for v in (10, 100, 1000):
    ax.axhline(v, color=GRID, lw=0.8, zorder=0); ax.text(0.5, v * 1.04, f"{v:,} characters", ha="center", va="bottom", fontsize=8, color=INK2)
for sp in ("left", "bottom"): ax.spines[sp].set_visible(False)
ax.grid(False); ax.tick_params(axis="x", length=0)
leg = [Line2D([], [], color=US, lw=2, label="US model won"), Line2D([], [], color=CN, lw=2, label="Chinese model won")]
ax.legend(handles=leg, loc="upper center", bbox_to_anchor=(0.5, 1.09), ncol=2, frameon=False, fontsize=9)
finish(fig, os.path.join(OUT, "2_slope_text_by_winner.png"),
       f"The site with more text won {denser_won} of 10 votes",
       "Visible text per site (log scale). One line per prompt, colored by the side the user picked.")
# ---- 3. Ratio summary (geometric mean of CN/US with bootstrap 95% CI)
RAT = [("visible_text_chars", "Visible text"), ("cjk_characters", "Chinese characters"), ("visible_elements", "Visible elements"),
       ("visible_buttons", "Buttons"), ("visible_links", "Links"), ("css_animated_elements", "Animated elements"), ("page_height_px", "Page height")]
rng = np.random.default_rng(0)
res = []
for k, lab in RAT:
    lr = np.array([np.log((num(p["cn"], k) + 1) / (num(p["us"], k) + 1)) for p in P])
    bs = [lr[rng.integers(0, len(lr), len(lr))].mean() for _ in range(5000)]
    lo, hi = np.percentile(bs, [2.5, 97.5])
    res.append((lab, np.exp(lr.mean()), np.exp(lo), np.exp(hi)))
res.sort(key=lambda t: t[1])
fig, ax = plt.subplots(figsize=(10, 5.6))
fig.subplots_adjust(left=0.20, right=0.95, top=0.78, bottom=0.16)
for i, (lab, m, lo, hi) in enumerate(res):
    ax.plot([lo, hi], [i, i], color=INK2, lw=2, solid_capstyle="round")
    ax.scatter(m, i, s=70, color=INK, zorder=3)
    ax.text(hi * 1.08, i, f"{m:.2f}×", va="center", fontsize=9, color=INK2)
ax.axvline(1, color="#9b9a95", lw=1.2); ax.text(1, len(res) - 0.4, "no difference", ha="center", fontsize=8, color=INK2)
ax.set_xscale("log"); ax.set_yticks(range(len(res))); ax.set_yticklabels([r[0] for r in res], color=INK)
ticks = [0.1, 0.25, 0.5, 1, 2, 4]; ax.set_xticks(ticks); ax.set_xticklabels([f"{t:g}×" for t in ticks])
ax.xaxis.set_minor_locator(matplotlib.ticker.NullLocator())
ax.set_xlabel("Chinese site ÷ US site (typical pair, log scale)   ← US more  |  Chinese more →")
ax.grid(axis="y", visible=False); ax.tick_params(axis="y", length=0)
clear = [r for r in res if r[3] < 1 or r[2] > 1]   # interval excludes 1x
if len(clear) == 1:
    t = f"Only {clear[0][0].lower()} clearly differ: Chinese models' sites had about {clear[0][1]:.1f}× as many"
else:
    t = f"{len(clear)} of {len(res)} measures clearly differ between US and Chinese models' sites"
finish(fig, os.path.join(OUT, "3_ratio_summary.png"), t,
       "Typical Chinese-to-US ratio across 10 pairs, with 95% bootstrap interval. Bars crossing 1× = no clear difference.")

# ---- 4. Scatter: text vs elements, pairs joined
fig, ax = plt.subplots(figsize=(8.5, 6.5))
fig.subplots_adjust(left=0.12, right=0.96, top=0.82, bottom=0.14)
for p in P:
    xs = [num(p["us"], "visible_text_chars"), num(p["cn"], "visible_text_chars")]
    ys = [num(p["us"], "visible_elements"), num(p["cn"], "visible_elements")]
    ax.plot(xs, ys, color="#c9c8c2", lw=1.2, zorder=1)
for side, col, name in (("us", US, "US model"), ("cn", CN, "Chinese model")):
    ax.scatter([num(p[side], "visible_text_chars") for p in P], [num(p[side], "visible_elements") for p in P],
               s=70, color=col, edgecolor=SURF, linewidth=2, zorder=3, label=name)
ax.set_xscale("log"); ax.set_yscale("log")
fmt = matplotlib.ticker.FuncFormatter(lambda v, _: f"{v:,.0f}")
ax.xaxis.set_major_formatter(fmt); ax.yaxis.set_major_formatter(fmt)
ax.set_xlabel("Visible text (characters, log scale)"); ax.set_ylabel("Visible elements (log scale)")
ax.legend(loc="upper left", frameon=False)
r = np.corrcoef(np.log([num(x, "visible_text_chars") + 1 for x in rows]), np.log([num(x, "visible_elements") + 1 for x in rows]))[0, 1]
finish(fig, os.path.join(OUT, "4_text_vs_elements.png"),
       "US and Chinese models' sites overlap in density",
       f"Each dot is a site; gray lines join the two sites from the same prompt. Log scales; r = {r:.2f}.")
