// Page measures live in page-measures.js (shared with the study-site measurer); these helpers run outside the page.

export function measureScreenshotBrightness(pixels) {
  let brightness = 0;
  for (let index = 0; index < pixels.data.length; index += 4) brightness += (0.2126 * pixels.data[index] + 0.7152 * pixels.data[index + 1] + 0.0722 * pixels.data[index + 2]) / 255;
  return brightness / (pixels.width * pixels.height);
}

export function measureJavaScriptErrors(errors) {
  return errors.length;
}

// Menu type (Alexander et al. 2017): hover each top navigation item and count how many reveal
// at least 3 links that were hidden before. 0 = every option is visible up front.
export async function measureHoverMenus(page, limit = 8) {
  const countVisibleLinks = () => [...document.querySelectorAll("a, button")].filter((el) => {
    const r = el.getBoundingClientRect(), s = getComputedStyle(el);
    return r.width > 2 && r.height > 2 && s.display !== "none" && s.visibility !== "hidden" && Number(s.opacity) > 0.05;
  }).length;
  const items = (await page.$$("nav a, nav button, header a, header button")).slice(0, limit);
  let revealing = 0;
  for (const item of items) {
    try {
      const before = await page.evaluate(countVisibleLinks);
      await item.hover({ timeout: 1000 });
      await page.waitForTimeout(300);
      if ((await page.evaluate(countVisibleLinks)) - before >= 3) revealing++;
      await page.mouse.move(0, 0);
      await page.waitForTimeout(150);
    } catch {
      // Hidden or detached items cannot be hovered; they reveal nothing.
    }
  }
  return { nav_items_tested: items.length, hover_menu_items: revealing, has_hover_menu: revealing > 0 ? 1 : 0 };
}
