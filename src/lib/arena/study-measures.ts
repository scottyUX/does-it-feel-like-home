// The 40 measures compared across models (research/analysis/run_comparisons.py, GROUPS), and how each is calculated.
// Page measures come from arena/worker/page-measures.js, screenshot measures from research/measures/pixels.py.
// Pages are rendered in headless Chromium at 1440x900 (zh-CN locale) with outside requests blocked.

export type StudyMeasure = { key: string; label: string; calculation: string };

export const measureNotes = [
  "Visible means wider and taller than 2 px, not display: none or visibility: hidden, and opacity above 0.05.",
  "The first screen is the top 900 px of the page at 1440 px wide.",
  "Screenshot measures use a screenshot of the first screen.",
  "Yes/no checks search the visible text plus placeholder, alt, aria-label and title attributes, and keep the matched text so each hit can be checked by hand.",
];

export const measureGroups: { name: string; measures: StudyMeasure[] }[] = [
  { name: "Density", measures: [
    { key: "visible_text_chars", label: "Visible text (characters)", calculation: "Characters in visible text nodes, ignoring whitespace." },
    { key: "text_chars_first_screen", label: "Text on first screen (characters)", calculation: "Visible text characters whose element starts within the first screen." },
    { key: "text_blocks", label: "Separate text blocks", calculation: "Distinct block-level containers (the nearest non-inline ancestor) that hold visible text." },
    { key: "visible_elements_first_screen", label: "Elements on first screen", calculation: "Visible elements inside the body whose top edge is within the first screen." },
    { key: "page_screens", label: "Page length (desktop screens)", calculation: "Full page height divided by the 900 px window height." },
    { key: "mobile_page_screens", label: "Page length on a phone (screens)", calculation: "The same, rendered at 390x844 and divided by 844 px." },
  ] },
  { name: "Layout and navigation", measures: [
    { key: "columns_first_screen", label: "Side-by-side boxes on first screen", calculation: "Most non-overlapping boxes (120 px to 60% of the width wide, at least 80 px tall) crossing one horizontal line, checked every 40 px down the first screen." },
    { key: "nav_items", label: "Navigation items", calculation: "Visible links and buttons inside nav, header or role=navigation elements." },
    { key: "has_hover_menu", label: "Has a hover-reveal menu", calculation: "Hovers up to 8 nav or header items; yes if hovering one reveals at least 3 more visible links or buttons." },
    { key: "footer_links", label: "Footer links", calculation: "Links inside visible footer or role=contentinfo elements." },
    { key: "visible_links", label: "Links", calculation: "Visible a elements anywhere on the page." },
    { key: "form_inputs", label: "Form inputs", calculation: "Visible input, select and textarea elements." },
  ] },
  { name: "Imagery and motion", measures: [
    { key: "images", label: "Images", calculation: "Visible img elements, SVGs larger than 10,000 px², and elements with a CSS background image." },
    { key: "image_share_first_screen", label: "First screen covered by images", calculation: "Area of those images inside the first screen, divided by the first-screen area (overlaps count twice)." },
    { key: "canvas_share", label: "Canvas (3D/game) area", calculation: "Area of visible canvas elements divided by the full page area." },
    { key: "css_animated_elements", label: "Animated elements", calculation: "Visible elements with a CSS animation assigned." },
    { key: "fixed_or_sticky", label: "Fixed or sticky elements", calculation: "Visible elements with position fixed or sticky." },
  ] },
  { name: "Color and complexity", measures: [
    { key: "colorfulness", label: "Colorfulness", calculation: "Hasler and Süsstrunk (2003) colourfulness of the screenshot, as used by Reinecke et al. (2013)." },
    { key: "saturation", label: "Saturation", calculation: "Mean HSV saturation of screenshot pixels brighter than 20%." },
    { key: "brightness", label: "Brightness", calculation: "Mean luminance of the screenshot (0 to 1)." },
    { key: "distinct_colors", label: "Distinct colors", calculation: "Colours, binned into 16 levels per channel, that cover at least 0.1% of the screenshot." },
    { key: "quadtree_blocks", label: "Visual complexity (quadtree blocks)", calculation: "Splits the screenshot into four while a block's brightness varies (std ≥ 0.03) and it is over 8 px; counts the final blocks. After Reinecke et al. (2013); our own code." },
    { key: "edge_density", label: "Edge density", calculation: "Share of screenshot pixels where brightness changes by more than 0.1 to the next pixel." },
    { key: "background_share", label: "Empty background share", calculation: "Share of the screenshot covered by its single most common colour (16 levels per channel)." },
  ] },
  { name: "Typography and language", measures: [
    { key: "font_sizes", label: "Distinct font sizes", calculation: "Distinct rounded font sizes used by visible text." },
    { key: "chinese_font_share", label: "Text in a chosen Chinese font", calculation: "Share of visible characters whose font list names a Chinese font (PingFang, Microsoft YaHei, Noto Sans SC, Source Han, SimSun…)." },
    { key: "latin_share", label: "Latin letters among letters", calculation: "Latin letters divided by Latin letters plus Chinese characters in visible text." },
  ] },
  { name: "Features and local conventions", measures: [
    { key: "price_in_yuan", label: "Prices in yuan", calculation: "Yes if the text has ¥ or ￥ before a number, a number followed by 元, RMB before a number, or 人民币." },
    { key: "china_phone", label: "Chinese phone number", calculation: "Yes for +86, a 400 service number, an 11-digit mobile number starting 13 to 19, or a 0xx-xxxxxxxx landline." },
    { key: "icp_record", label: "ICP registration record", calculation: "Yes for ICP, 备案号 or 公网安备." },
    { key: "wechat", label: "WeChat", calculation: "Yes for 微信 or WeChat." },
    { key: "alipay", label: "Alipay", calculation: "Yes for 支付宝 or Alipay." },
    { key: "chinese_platforms", label: "Weibo, Xiaohongshu, Douyin, QQ", calculation: "Yes for Weibo, Xiaohongshu, Douyin, Bilibili or QQ, in Chinese or English." },
    { key: "western_platforms", label: "Google, Facebook, PayPal…", calculation: "Yes for Google, Facebook, Instagram, Twitter, PayPal, YouTube, WhatsApp, LinkedIn or Apple Pay." },
    { key: "qr_code", label: "QR code", calculation: "Yes for 二维码, 扫码, 扫一扫 or QR code." },
    { key: "chinese_date", label: "Chinese date format", calculation: "Yes for a date written as 2026年11月 or 11月23日." },
    { key: "login", label: "Login or sign-up", calculation: "Yes for 登录, 注册, sign in, log in or sign up." },
    { key: "customer_service", label: "Customer service", calculation: "Yes for 在线客服, 联系客服, 客服热线, 在线咨询, 人工客服 or live chat." },
    { key: "search_box", label: "Search box", calculation: "Yes if a visible input is type=search or its placeholder or label mentions search (搜索, 查找)." },
    { key: "language_switch", label: "Language switch", calculation: "Yes for an EN | 中文 style switch, English /, 切换语言 or 简体 / 繁體." },
  ] },
];
