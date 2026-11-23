import { build } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { viteSingleFile } from "vite-plugin-singlefile";
import { chromium } from "playwright-core";
import { PNG } from "pngjs";
import fs from "node:fs/promises";
import path from "node:path";
import http from "node:http";
import { measureScreenshotBrightness, measureJavaScriptErrors, measureHoverMenus } from "./measurements.mjs";

const root = "/tmp/site";
await fs.cp("/input", root, { recursive: true });
await fs.rm(path.join(root, "node_modules"), { recursive: true, force: true });
await fs.symlink("/opt/arena/node_modules", path.join(root, "node_modules"));
await build({
  root,
  configFile: false,
  logLevel: "warn",
  plugins: [react(), tailwindcss(), viteSingleFile()],
  css: { postcss: { plugins: [] } },
  resolve: { alias: { "@": path.join(root, "src") } },
  build: { outDir: "/tmp/dist", emptyOutDir: true },
});

const html = await fs.readFile("/tmp/dist/index.html");
await fs.writeFile("/output/index.html", html);
const pageMeasures = await fs.readFile("/opt/arena/page-measures.js", "utf8");
const server = http.createServer((request, response) => {
  if (request.method !== "GET") { response.writeHead(405).end(); return; }
  response.writeHead(200, { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" });
  response.end(html);
});
await new Promise((resolve) => server.listen(8080, "127.0.0.1", resolve));

// Opens the site at one viewport and returns its page measures; desktop also gets the hover test and screenshots.
async function visit(browser, width, height, errors) {
  const page = await browser.newPage({ viewport: { width, height }, locale: "zh-CN", serviceWorkers: "block" });
  page.on("pageerror", (error) => errors.push(error.message.slice(0, 200)));
  await page.goto("http://127.0.0.1:8080/", { waitUntil: "load", timeout: 30000 });
  await page.waitForTimeout(2500);
  const { measures, evidence } = await page.evaluate(`${pageMeasures}\nmeasurePage()`);
  return { page, measures, evidence };
}

let browser;
try {
  browser = await chromium.launch({ executablePath: "/usr/bin/chromium", args: ["--no-sandbox", "--disable-dev-shm-usage"] });
  const errors = [];
  const desktop = await visit(browser, 1440, 900, errors);
  const screenshot = await desktop.page.screenshot({ animations: "disabled" });
  await fs.writeFile("/output/screenshot.png", screenshot);
  const fullHeight = Math.min(desktop.measures.page_height_px, 900 * 8);
  await desktop.page.setViewportSize({ width: 1440, height: Math.max(900, fullHeight) });
  await fs.writeFile("/output/full.png", await desktop.page.screenshot({ animations: "disabled" }));
  await desktop.page.setViewportSize({ width: 1440, height: 900 });
  const hover = await measureHoverMenus(desktop.page);
  const mobile = await visit(browser, 390, 844, errors);
  await fs.writeFile("/output/mobile.png", await mobile.page.screenshot({ animations: "disabled" }));

  const metrics = { ...desktop.measures, ...hover };
  for (const [name, value] of Object.entries(mobile.measures)) metrics[`mobile_${name}`] = value;
  metrics.screenshot_mean_rgb_brightness = measureScreenshotBrightness(PNG.sync.read(screenshot));
  metrics.javascript_error_count = measureJavaScriptErrors(errors);
  await fs.writeFile("/output/measurements.json", JSON.stringify(metrics, null, 2));
  await fs.writeFile("/output/evidence.json", JSON.stringify(desktop.evidence, null, 2));
  await fs.writeFile("/output/diagnostics.json", JSON.stringify({ errors }, null, 2));
} finally {
  if (browser) await browser.close();
  server.close();
}
