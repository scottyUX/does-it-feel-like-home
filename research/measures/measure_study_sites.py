"""Measure every page of every study site with the same page measures as the Arena worker.

Usage: python measure_study_sites.py <repo root> <output dir> [staged sites dir]
With a third argument, measures the staged sites there (scripts/stage-new-sites.mts) instead of the manifest's.
Each site in data/manifest.json is opened from file:// in headless Chromium (zh-CN locale) at 1440x900 and
390x844. Non-file requests are blocked and counted. For each page: arena/worker/page-measures.js, screenshot
measures (pixels.py) for the first screen, and for the home page the hover-menu test and screenshots.
Origin comes from the model name, not the manifest's country field (one manifest row is mislabeled).
"""
import json, os, re, sys
from playwright.sync_api import sync_playwright
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from pixels import measure as pixel_measures

ROOT, OUT = os.path.abspath(sys.argv[1]), os.path.abspath(sys.argv[2])
PAGE_JS = open(os.path.join(ROOT, "arena/worker/page-measures.js")).read() + "\nmeasurePage()"
CHINESE = re.compile(r"^(qwen|moonshotai|deepseek|z-ai|zhipu|minimax|xiaomi|baidu|bytedance|tencent)/", re.I)
SPARK = re.compile(r"^(google/gemma-4-31b|qwen/qwen3\.8-27b|openai/gpt-oss-120b|qwen/qwen3\.5-122b)$")
COUNT_LINKS = """() => [...document.querySelectorAll('a, button')].filter(el => { const r = el.getBoundingClientRect(), s = getComputedStyle(el);
  return r.width > 2 && r.height > 2 && s.display !== 'none' && s.visibility !== 'hidden' && Number(s.opacity) > 0.05; }).length"""
os.makedirs(os.path.join(OUT, "shots"), exist_ok=True)


def hover_menus(page, limit=8):
    """Same rule as measureHoverMenus in arena/worker/measurements.mjs."""
    items = page.query_selector_all("nav a, nav button, header a, header button")[:limit]
    revealing = 0
    for item in items:
        try:
            before = page.evaluate(COUNT_LINKS)
            item.hover(timeout=1000); page.wait_for_timeout(300)
            if page.evaluate(COUNT_LINKS) - before >= 3:
                revealing += 1
            page.mouse.move(0, 0); page.wait_for_timeout(150)
        except Exception:
            pass
    return {"nav_items_tested": len(items), "hover_menu_items": revealing, "has_hover_menu": int(revealing > 0)}


def open_page(browser, url, width, height, blocked, errors):
    page = browser.new_page(viewport={"width": width, "height": height}, locale="zh-CN")
    page.route("**/*", lambda route: route.continue_() if route.request.url.startswith("file://")
               else (blocked.add(route.request.url), route.abort())[1])
    page.on("pageerror", lambda e: errors.append(str(e)[:200]))
    page.goto(url, wait_until="load", timeout=30000)
    page.wait_for_timeout(1500)
    return page


STAGED_NAMES = {"glm-4.7-flash:q4_K_M": "zhipu/glm-4.7-flash", "llama4:scout": "meta/llama-4-scout", "nemotron3:33b": "nvidia/nemotron-3-33b",
                "glm4:9b": "zhipu/glm-4-9b", "gemma3:27b": "google/gemma-3-27b", "gpt-oss:20b": "openai/gpt-oss-20b",
                "ernie4.5:21b": "baidu/ernie-4.5-21b", "seed-oss:36b": "bytedance/seed-oss-36b", "kimi-linear:48b": "moonshotai/kimi-linear-48b",
                "deepseek-coder-v2:16b": "deepseek/deepseek-coder-v2-16b", "hunyuan:a13b": "tencent/hunyuan-a13b", "phi4:14b": "microsoft/phi-4",
                "granite4.2:30b": "ibm/granite-4.2-30b", "olmo-3.1:32b-instruct": "ai2/olmo-3.1-32b", "inkling-2-mini:26b-a5b": "thinkingmachines/inkling-2-mini"}
if len(sys.argv) > 3:  # optional: a folder of staged sites (scripts/stage-new-sites.mts) instead of the study manifest
    staged_dir = os.path.abspath(sys.argv[3])
    sites = []
    for d in sorted(os.listdir(staged_dir)):
        meta_file = os.path.join(staged_dir, d, "_staged.json")
        if os.path.isfile(meta_file):
            meta = json.load(open(meta_file))
            sites.append({"id": d, "folder": os.path.join(staged_dir, d), "type": meta["type"], "promptLanguage": meta["language"],
                          "model": STAGED_NAMES.get(meta["model"], meta["model"]), "set": "new"})
else:
    sites = [{**s, "folder": os.path.join(ROOT, "sites", s["id"])} for s in json.load(open(os.path.join(ROOT, "data/manifest.json")))["sites"]]
rows, evidence = [], {}
with sync_playwright() as p:
    browser = p.chromium.launch()
    for site in sites:
        model = site["model"].split(" (")[0]
        folder = site["folder"]
        pages = sorted(f for f in os.listdir(folder) if f.endswith(".html"))
        pages = ["index.html"] + [f for f in pages if f != "index.html"]
        blocked, errors = set(), []
        for name in pages:
            url = "file://" + os.path.join(folder, name)
            base = {"site": site["id"], "page": name, "is_home": int(name == "index.html"), "type": site["type"],
                    "model": model, "origin": "China" if CHINESE.match(model) else "US",
                    "prompt": site["promptLanguage"], "set": site.get("set") or ("spark" if SPARK.match(model) else "frontier")}
            desk = open_page(browser, url, 1440, 900, blocked, errors)
            result = desk.evaluate(PAGE_JS)
            row = {**base, **result["measures"]}
            shot = desk.screenshot()
            row.update(pixel_measures(shot))
            if name == "index.html":
                open(os.path.join(OUT, "shots", f"{site['id']}_desktop.png"), "wb").write(shot)
                row.update(hover_menus(desk))
                evidence[site["id"]] = result["evidence"]
            desk.close()
            mob = open_page(browser, url, 390, 844, blocked, errors)
            for key, value in mob.evaluate(PAGE_JS)["measures"].items():
                row[f"mobile_{key}"] = value
            if name == "index.html":
                open(os.path.join(OUT, "shots", f"{site['id']}_mobile.png"), "wb").write(mob.screenshot())
            mob.close()
            rows.append(row)
        for row in rows:
            if row["site"] == site["id"]:
                row["external_requests"] = len(blocked); row["javascript_errors"] = len(errors)
        print(site["id"], model, site["promptLanguage"], len(pages), "pages", flush=True)
    browser.close()
with open(os.path.join(OUT, "pages.json"), "w") as f:
    json.dump(rows, f, indent=1, ensure_ascii=False)
with open(os.path.join(OUT, "evidence.json"), "w") as f:
    json.dump(evidence, f, indent=1, ensure_ascii=False)
print(len(rows), "pages measured across", len({r["site"] for r in rows}), "sites")
