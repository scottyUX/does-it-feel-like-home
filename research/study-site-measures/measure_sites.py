"""Sample of new measures on the Spark-generated study sites (home page only).

Usage: python measure_sites.py <repo root> <output dir>
Renders sites/<id>/index.html from file:// in headless Chromium at 1440x900, blocks every
non-file request (and counts them), then measures the page and the first-screen screenshot.
"""
import json, os, re, sys, io, colorsys
import numpy as np
from PIL import Image
from playwright.sync_api import sync_playwright

ROOT, OUT = os.path.abspath(sys.argv[1]), sys.argv[2]
SPARK = re.compile(r"(google/gemma|qwen/qwen3\.8-27b|openai/gpt-oss|qwen/qwen3\.5-122b)")
os.makedirs(os.path.join(OUT, "shots"), exist_ok=True)

PAGE_JS = r"""
() => {
  const vis = el => { const r = el.getBoundingClientRect(), s = getComputedStyle(el);
    return r.width > 2 && r.height > 2 && s.display !== 'none' && s.visibility !== 'hidden' && +s.opacity > 0.05; };
  const els = [...document.querySelectorAll('body *')].filter(vis);
  let text = '', sizes = new Set(), cnFontChars = 0, chars = 0, textBlocks = 0;
  const CN_FONT = /PingFang|YaHei|Noto (Sans|Serif) (SC|CJK)|Source Han|Hiragino Sans GB|SimSun|SimHei|STHeiti|KaiTi|思源|宋体|黑体|楷体|苹方/i;
  const tw = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  const blockParents = new Set();
  while (tw.nextNode()) {
    const n = tw.currentNode, t = n.textContent.replace(/\s+/g, ''); if (!t) continue;
    const p = n.parentElement; if (!p || !vis(p)) continue;
    const s = getComputedStyle(p); sizes.add(Math.round(parseFloat(s.fontSize)));
    chars += t.length; if (CN_FONT.test(s.fontFamily)) cnFontChars += t.length;
    text += n.textContent + ' ';
    let b = p; while (b && getComputedStyle(b).display.startsWith('inline')) b = b.parentElement; if (b) blockParents.add(b);
  }
  const attrs = [...document.querySelectorAll('[placeholder],[alt],[aria-label],[title]')]
    .map(e => [e.getAttribute('placeholder'), e.getAttribute('alt'), e.getAttribute('aria-label'), e.getAttribute('title')].join(' ')).join(' ');
  const imgs = els.filter(e => e.tagName === 'IMG' || (getComputedStyle(e).backgroundImage || '').includes('url('));
  const H = innerHeight;
  const foldImgArea = imgs.reduce((a, e) => { const r = e.getBoundingClientRect(); const h = Math.max(0, Math.min(r.bottom, H) - Math.max(r.top, 0)); return a + h * r.width; }, 0);
  const nav = [...document.querySelectorAll('nav, header')].filter(vis);
  const footer = [...document.querySelectorAll('footer')].filter(vis);
  return {
    text, attrs,
    text_chars: chars, cjk_chars: (text.match(/[一-鿿]/g) || []).length,
    latin_letters: (text.match(/[A-Za-z]/g) || []).length,
    cn_font_share: chars ? cnFontChars / chars : 0,
    font_sizes: sizes.size, text_blocks: blockParents.size,
    images: imgs.length, fold_image_share: foldImgArea / (innerWidth * H),
    nav_items: nav.reduce((a, n) => a + [...n.querySelectorAll('a,button')].filter(vis).length, 0),
    footer_links: footer.reduce((a, f) => a + f.querySelectorAll('a').length, 0),
    inputs: els.filter(e => ['INPUT', 'SELECT', 'TEXTAREA'].includes(e.tagName)).length,
    page_screens: document.documentElement.scrollHeight / H,
  };
}
"""
# Localization and feature checks on visible text + attributes (Li 2022; Cermak 2020)
CHECKS = {
    "price_in_yuan": r"[¥￥]|元|RMB|人民币",
    "chinese_date": r"\d{4}\s*年\s*\d{1,2}\s*月|\d{1,2}\s*月\s*\d{1,2}\s*日",
    "china_phone": r"\+86|400[-\s]?\d{3}[-\s]?\d{4}|1[3-9]\d[-\s]?\d{4}[-\s]?\d{4}|0\d{2,3}-\d{7,8}",
    "wechat": r"微信|WeChat",
    "alipay": r"支付宝|Alipay",
    "chinese_social": r"微博|Weibo|小红书|抖音|Douyin|B站|哔哩哔哩|QQ",
    "western_platforms": r"Google|Facebook|Instagram|Twitter|PayPal|YouTube|WhatsApp|LinkedIn",
    "qr_code": r"二维码|扫码|扫一扫|QR",
    "icp_record": r"ICP|备案|公网安备",
    "search": r"搜索|查找|search",
    "login": r"登录|登陆|注册|Sign in|Log in|Sign up",
    "customer_service": r"客服|在线咨询|人工服务|chat",
    "language_switch": r"\bEN\b|English|中文\s*/\s*EN|简体中文",
}

def pixels(png):
    a = np.asarray(Image.open(io.BytesIO(png)).convert("RGB")).astype(np.float32) / 255
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    mx, mn = a.max(-1), a.min(-1); d = np.maximum(mx - mn, 1e-6)
    sat = np.where(mx > 0, (mx - mn) / np.maximum(mx, 1e-6), 0)
    hue = np.where(mx == r, ((g - b) / d) % 6, np.where(mx == g, (b - r) / d + 2, (r - g) / d + 4)) * 60
    chrom = (sat > 0.25) & (mx > 0.2)
    fam = {"red": (hue < 15) | (hue >= 345), "orange": (hue >= 15) & (hue < 45), "yellow": (hue >= 45) & (hue < 70),
           "green": (hue >= 70) & (hue < 170), "blue": (hue >= 170) & (hue < 260), "purple": (hue >= 260) & (hue < 345)}
    out = {f"hue_{k}": float((chrom & v).mean()) for k, v in fam.items()}
    out["hue_neutral"] = float((~chrom).mean())
    rg, yb = r - g, 0.5 * (r + g) - b   # Hasler & Suesstrunk colorfulness, as used by Reinecke 2013
    out["colorfulness"] = float((np.sqrt(rg.std() ** 2 + yb.std() ** 2) + 0.3 * np.sqrt(rg.mean() ** 2 + yb.mean() ** 2)) * 100)
    lum = 0.2126 * r + 0.7152 * g + 0.0722 * b
    out["brightness"] = float(lum.mean())
    out["saturation"] = float(sat[mx > 0.2].mean()) if (mx > 0.2).any() else 0.0
    # Quadtree leaves: split while a block is not near-uniform (approximation of Reinecke's space-based decomposition)
    def leaves(x0, y0, w, h):
        blk = lum[y0:y0 + h, x0:x0 + w]
        if w <= 8 or h <= 8 or blk.std() < 0.03: return 1
        hw, hh = w // 2, h // 2
        return leaves(x0, y0, hw, hh) + leaves(x0 + hw, y0, w - hw, hh) + leaves(x0, y0 + hh, hw, h - hh) + leaves(x0 + hw, y0 + hh, w - hw, h - hh)
    out["quadtree_leaves"] = leaves(0, 0, lum.shape[1], lum.shape[0])
    gx, gy = np.abs(np.diff(lum, axis=1))[:-1, :], np.abs(np.diff(lum, axis=0))[:, :-1]
    out["edge_density"] = float(((gx + gy) > 0.1).mean())
    q = (a * 255).astype(np.uint8) // 16
    key = q[..., 0].astype(np.int32) * 256 + q[..., 1].astype(np.int32) * 16 + q[..., 2]
    counts = np.bincount(key.ravel())
    out["background_share"] = float(counts.max() / key.size)
    out["distinct_colors"] = int((counts > key.size * 0.001).sum())   # colors covering >0.1% of the screen
    return out

sites = [s for s in json.load(open(os.path.join(ROOT, "data/manifest.json")))["sites"] if SPARK.match(s["model"])]
rows = []
with sync_playwright() as p:
    br = p.chromium.launch()
    for s in sites:
        f = os.path.join(ROOT, "sites", s["id"], "index.html")
        blocked = []
        for vw, vh, tag in ((1440, 900, "desktop"), (390, 844, "mobile")):
            pg = br.new_page(viewport={"width": vw, "height": vh}, locale="zh-CN")
            pg.route("**/*", lambda route: route.continue_() if route.request.url.startswith("file://") else (blocked.append(route.request.url), route.abort())[1])
            errs = []; pg.on("pageerror", lambda e: errs.append(str(e)[:120]))
            pg.goto("file://" + f, wait_until="load", timeout=30000); pg.wait_for_timeout(1500)
            dom = pg.evaluate(PAGE_JS); shot = pg.screenshot()
            open(os.path.join(OUT, "shots", f"{s['id']}_{tag}.png"), "wb").write(shot)
            if tag == "desktop":
                body = dom.pop("text") + " " + dom.pop("attrs")
                row = {"id": s["id"], "type": s["type"], "origin": s["country"], "prompt": s["promptLanguage"],
                       "model": s["model"].split(" (")[0], "js_errors": len(errs), **dom, **pixels(shot)}
                row["latin_share"] = row["latin_letters"] / max(row["latin_letters"] + row["cjk_chars"], 1)
                for k, rx in CHECKS.items(): row[k] = int(bool(re.search(rx, body, re.I)))
            else:
                row["mobile_text_chars"] = dom["text_chars"]; row["mobile_page_screens"] = dom["page_screens"]
                row["mobile_fold_image_share"] = dom["fold_image_share"]
            pg.close()
        row["external_requests"] = len(set(blocked))
        rows.append(row); print(s["id"], s["country"], s["promptLanguage"], "ok")
    br.close()
json.dump(rows, open(os.path.join(OUT, "measures.json"), "w"), indent=1)
print(len(rows), "sites measured")
