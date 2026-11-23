// Page measures shared by the Arena worker and the study-site measurer.
// Evaluated inside the rendered page: `${source}\nmeasurePage()` returns { measures, evidence }.
// Measure names that existed before (visible_text_chars, ...) are unchanged so the dashboard keeps working.
// Keyword checks are practical conventions (prices, contact details, platforms, features), not cultural
// symbols; each returns the matched text as evidence so a person can verify every hit.
function measurePage() {
  const W = innerWidth, H = innerHeight;
  const visible = (el) => {
    const r = el.getBoundingClientRect(), s = getComputedStyle(el);
    return r.width > 2 && r.height > 2 && s.display !== "none" && s.visibility !== "hidden" && Number(s.opacity) > 0.05;
  };
  const top = (el) => el.getBoundingClientRect().top + scrollY;
  const elements = [...document.querySelectorAll("body *")].filter(visible);
  const onFold = (el) => top(el) < H;

  // Text: every visible text node, its block container, and the font it is drawn in.
  let text = "", textFold = 0, cnFontChars = 0, chars = 0;
  const sizes = new Set(), blocks = new Set(), fonts = {};
  const CN_FONT = /PingFang|YaHei|Noto (Sans|Serif) (SC|TC|HK|CJK)|Source Han|Hiragino Sans GB|SimSun|SimHei|STHeiti|KaiTi|FangSong|思源|宋体|黑体|楷体|苹方/i;
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  while (walker.nextNode()) {
    const node = walker.currentNode, compact = (node.textContent || "").replace(/\s+/g, "");
    if (!compact) continue;
    const parent = node.parentElement;
    if (!parent || !visible(parent)) continue;
    const style = getComputedStyle(parent);
    chars += compact.length;
    sizes.add(Math.round(parseFloat(style.fontSize)));
    const family = style.fontFamily.split(",")[0].replace(/["']/g, "").trim();
    fonts[family] = (fonts[family] || 0) + compact.length;
    if (CN_FONT.test(style.fontFamily)) cnFontChars += compact.length;
    if (onFold(parent)) textFold += compact.length;
    let block = parent;
    while (block && getComputedStyle(block).display.startsWith("inline")) block = block.parentElement;
    if (block) blocks.add(block);
    text += node.textContent + " ";
  }
  const attributes = [...document.querySelectorAll("[placeholder],[alt],[aria-label],[title]")]
    .map((el) => ["placeholder", "alt", "aria-label", "title"].map((a) => el.getAttribute(a) || "").join(" ")).join(" ");

  // Imagery, media and motion.
  const area = (el) => { const r = el.getBoundingClientRect(); return r.width * r.height; };
  const foldArea = (el) => { const r = el.getBoundingClientRect(); const t = r.top, b = r.bottom; return Math.max(0, Math.min(b, H) - Math.max(t, 0)) * Math.max(0, Math.min(r.right, W) - Math.max(r.left, 0)); };
  const images = elements.filter((el) => el.tagName === "IMG" || (el.tagName === "svg" && area(el) > 10000) || (getComputedStyle(el).backgroundImage || "").includes("url("));
  const canvases = elements.filter((el) => el.tagName === "CANVAS");
  const videos = elements.filter((el) => el.tagName === "VIDEO" || el.tagName === "IFRAME");
  const docArea = W * Math.max(document.documentElement.scrollHeight, H);

  // Navigation, links, footer.
  const navs = [...document.querySelectorAll("nav, header, [role=navigation]")].filter(visible);
  const navItems = new Set(navs.flatMap((n) => [...n.querySelectorAll("a, button")].filter(visible)));
  const footers = [...document.querySelectorAll("footer, [role=contentinfo]")].filter(visible);
  const links = elements.filter((el) => el.tagName === "A");
  const underlined = links.filter((el) => getComputedStyle(el).textDecorationLine.includes("underline"));

  // Layout: the most content boxes sitting side by side in one row on the first screen.
  const boxes = elements.filter((el) => { const r = el.getBoundingClientRect(); return onFold(el) && r.width >= 120 && r.width <= W * 0.6 && r.height >= 80; });
  let columns = 1;
  for (let y = 40; y < H; y += 40) {
    const row = boxes.filter((el) => { const r = el.getBoundingClientRect(); return r.top <= y && r.bottom >= y; })
      .map((el) => el.getBoundingClientRect()).sort((a, b) => a.left - b.left);
    let count = 0, edge = -1;
    for (const r of row) if (r.left >= edge - 2) { count++; edge = r.right; }
    columns = Math.max(columns, count);
  }

  // Practical conventions and features, with the matched text as evidence.
  const haystack = text + " " + attributes;
  const CHECKS = {
    price_in_yuan: /[¥￥]\s?\d[\d,.]*|\d[\d,.]*\s?元(?![素宝旦])|RMB\s?\d|人民币/,
    chinese_date: /\d{4}\s*年\s*\d{1,2}\s*月|\d{1,2}\s*月\s*\d{1,2}\s*日/,
    china_phone: /\+86[\s-]?\d|400[-\s]?\d{3}[-\s]?\d{4}|(?<!\d)1[3-9]\d[-\s]?\d{4}[-\s]?\d{4}(?!\d)|(?<!\d)0\d{2,3}-\d{7,8}(?!\d)/,
    wechat: /微信|WeChat/i,
    alipay: /支付宝|Alipay/i,
    chinese_platforms: /微博|Weibo|小红书|抖音|Douyin|哔哩哔哩|bilibili|(?<![A-Za-z])QQ(?![A-Za-z])/i,
    western_platforms: /Google|Facebook|Instagram|Twitter|PayPal|YouTube|WhatsApp|LinkedIn|Apple Pay/i,
    qr_code: /二维码|扫码|扫一扫|QR\s?code/i,
    icp_record: /ICP\s?备?|备案号|公网安备/,
    login: /登录|登陆|注册|Sign\s?in|Log\s?in|Sign\s?up/i,
    customer_service: /在线客服|联系客服|客服热线|客服中心|在线咨询|人工客服|live chat/i,
    language_switch: /(?<![A-Za-z])EN(?![A-Za-z])\s*[|/]|[|/]\s*EN(?![A-Za-z])|English\s*[|/]|切换语言|简体\s*[|/]\s*繁體/,
  };
  const evidence = {};
  for (const [name, pattern] of Object.entries(CHECKS)) {
    const match = haystack.match(pattern);
    // Slicing can split an emoji's surrogate pair; drop any half left at the edges.
    evidence[name] = match ? haystack.slice(Math.max(0, match.index - 15), match.index + match[0].length + 15)
      .replace(/[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?<![\uD800-\uDBFF])[\uDC00-\uDFFF]/g, "").replace(/\s+/g, " ").trim() : null;
  }
  const searchInput = [...document.querySelectorAll("input")].filter(visible)
    .find((el) => el.type === "search" || /搜索|查找|search/i.test(el.placeholder || "") || /搜索|search/i.test(el.getAttribute("aria-label") || ""));
  evidence.search_box = searchInput ? `input placeholder="${(searchInput.placeholder || "").slice(0, 40)}"` : null;

  const topFont = Object.entries(fonts).sort((a, b) => b[1] - a[1])[0];
  const measures = {
    visible_text_chars: chars,
    cjk_characters: (text.match(/[一-鿿]/g) || []).length,
    latin_letters: (text.match(/[A-Za-z]/g) || []).length,
    text_chars_first_screen: textFold,
    text_blocks: blocks.size,
    visible_elements: elements.length,
    visible_elements_first_screen: elements.filter(onFold).length,
    visible_buttons: elements.filter((el) => el.tagName === "BUTTON" || el.getAttribute("role") === "button").length,
    visible_links: links.length,
    underlined_link_share: links.length ? underlined.length / links.length : null,
    nav_items: navItems.size,
    has_footer: footers.length > 0 ? 1 : 0,
    footer_links: footers.reduce((n, f) => n + f.querySelectorAll("a").length, 0),
    form_inputs: elements.filter((el) => ["INPUT", "SELECT", "TEXTAREA"].includes(el.tagName)).length,
    columns_first_screen: columns,
    images: images.length,
    image_share_first_screen: images.reduce((n, el) => n + foldArea(el), 0) / (W * H),
    canvas_share: canvases.reduce((n, el) => n + area(el), 0) / docArea,
    video_or_iframe: videos.length,
    css_animated_elements: elements.filter((el) => getComputedStyle(el).animationName !== "none").length,
    fixed_or_sticky: elements.filter((el) => ["fixed", "sticky"].includes(getComputedStyle(el).position)).length,
    font_sizes: sizes.size,
    main_font: topFont ? topFont[0] : "",
    chinese_font_share: chars ? cnFontChars / chars : 0,
    page_height_px: document.documentElement.scrollHeight,
    page_screens: document.documentElement.scrollHeight / H,
  };
  for (const name of Object.keys(evidence)) measures[name] = evidence[name] ? 1 : 0;
  return { measures, evidence };
}
