"use strict";

/* ---------- 工具 ---------- */
const $ = (s, r = document) => r.querySelector(s);
const $all = (s, r = document) => [...r.querySelectorAll(s)];
const fmt = n => "¥" + n;

/* ---------- 商品数据 ---------- */
const CATS = ["上衣", "针织", "裤装", "裙装", "连衣裙", "外套"];

const PRODUCTS = [
  { id: 1, name: "云朵棉基础白衬衫", cat: "上衣", price: 269, orig: 329, tag: "热卖", art: "shirt",
    sizes: ["S", "M", "L"], colors: [{ name: "本白", hex: "#F7F3EA" }, { name: "浅蓝", hex: "#C9D8E4" }],
    bg1: "#F3EDE3", bg2: "#E4D9C6",
    desc: "可衣的第一款产品，版型前后改了 11 次。100 支云朵棉，柔软但有骨感，单穿不透，塞进裤腰也不臃肿。" },
  { id: 2, name: "法式方领短袖针织衫", cat: "针织", price: 299, orig: null, tag: "新品", art: "knit",
    sizes: ["S", "M", "L"], colors: [{ name: "燕麦色", hex: "#E4D6BD" }, { name: "焦糖", hex: "#B07B4F" }],
    bg1: "#F6ECE0", bg2: "#EBDAC3",
    desc: "复古方领刚好露出锁骨，领口内贴织带不易变形。粘胶混纺纱线，垂顺亲肤，空调房里正合适。" },
  { id: 3, name: "高腰直筒九分西裤", cat: "裤装", price: 359, orig: null, tag: "通勤", art: "pants",
    sizes: ["S", "M", "L", "XL"], colors: [{ name: "炭灰", hex: "#5A5650" }, { name: "米杏", hex: "#E0D2BA" }],
    bg1: "#EFEDE8", bg2: "#DDD8CC",
    desc: "高腰加直筒的黄金组合，显腿长不挑鞋。面料带 2% 氨纶，久坐不起包、不皱，下班直接去约会也得体。" },
  { id: 4, name: "垂感阔腿西装裤", cat: "裤装", price: 329, orig: null, tag: "新品", art: "pants",
    sizes: ["S", "M", "L", "XL"], colors: [{ name: "经典黑", hex: "#33302C" }, { name: "深咖", hex: "#6B543F" }],
    bg1: "#F0EAE2", bg2: "#DFD4C2",
    desc: "重磅垂感面料，走路带风。后腰做了半松紧设计，吃饱也不勒，是编辑部投票选出的本周最爱。" },
  { id: 5, name: "高腰 A 字伞裙", cat: "裙装", price: 289, orig: null, tag: null, art: "skirt",
    sizes: ["S", "M", "L", "XL"], colors: [{ name: "雾蓝", hex: "#9FB4C4" }, { name: "米白", hex: "#EFE8DA" }],
    bg1: "#EDF1F3", bg2: "#DCE5E9",
    desc: "裙摆用了八片剪裁，转圈时弧度特别好看。高腰线卡在腰最细的位置，配衬衫或针织都成立。" },
  { id: 6, name: "茶歇法式碎花连衣裙", cat: "连衣裙", price: 459, orig: 529, tag: "热卖", art: "dress",
    sizes: ["S", "M", "L"], colors: [{ name: "杏粉", hex: "#E8C3B0" }, { name: "墨绿", hex: "#4E6157" }],
    bg1: "#F8ECE7", bg2: "#F0D8CD",
    desc: "V 领裹身剪裁配侧开衩，显瘦是第一要务。人棉面料凉滑垂坠，从办公室到周末野餐，一条裙子搞定。" },
  { id: 7, name: "醋酸缎面吊带长裙", cat: "连衣裙", price: 399, orig: null, tag: "新品", art: "dress",
    sizes: ["S", "M", "L"], colors: [{ name: "香槟", hex: "#E6D3B3" }, { name: "鼠尾草绿", hex: "#A9B8A0" }],
    bg1: "#F5EFE4", bg2: "#E8DBC2",
    desc: "三醋酸缎面，光泽像流动的牛奶。可调节肩带加侧拉链，单穿优雅，叠穿针织就是秋冬内搭王牌。" },
  { id: 8, name: "双排扣廓形西装外套", cat: "外套", price: 699, orig: 799, tag: "通勤", art: "coat",
    sizes: ["S", "M", "L"], colors: [{ name: "燕麦", hex: "#D9C9AE" }, { name: "经典黑", hex: "#35322E" }],
    bg1: "#F1EBE0", bg2: "#E0D4BE",
    desc: "微廓形不压个子，薄垫肩撑起气场。TR 斜纹面料抗皱好打理，出差塞进行李箱，挂一晚就恢复平整。" },
  { id: 9, name: "双面羊毛呢大衣", cat: "外套", price: 1099, orig: 1299, tag: "热卖", art: "coat",
    sizes: ["S", "M", "L"], colors: [{ name: "驼色", hex: "#B8936A" }, { name: "深咖", hex: "#5F4A36" }],
    bg1: "#F3EADF", bg2: "#E5D5BE",
    desc: "100% 羊毛双面呢，手工剖缝，整件没有里布，轻且暖。H 型中长款，155 到 175 的身高都试过版。" },
  { id: 10, name: "复古水洗牛仔外套", cat: "外套", price: 459, orig: null, tag: null, art: "coat",
    sizes: ["S", "M", "L", "XL"], colors: [{ name: "浅蓝", hex: "#9DB6C9" }, { name: "深蓝", hex: "#4A6076" }],
    bg1: "#EBF0F3", bg2: "#D6E0E6",
    desc: "12 盎司赤耳丹宁，成衣水洗出自然做旧感。微宽松短款，配连衣裙是春天最值得照搬的公式。" },
  { id: 11, name: "软糯云朵圆领毛衣", cat: "针织", price: 349, orig: null, tag: "新品", art: "knit",
    sizes: ["S", "M", "L"], colors: [{ name: "奶白", hex: "#F3EDE2" }, { name: "雾霾蓝", hex: "#A8BCC9" }, { name: "豆沙粉", hex: "#D9AFA5" }],
    bg1: "#F4EEE6", bg2: "#E7DBC8",
    desc: "仿羊绒手感的膨体纱线，贴身穿不扎。落肩微宽松，藏住手臂肉肉，三个颜色都是低饱和的显白选手。" },
  { id: 12, name: "真丝飘带长袖衬衫", cat: "上衣", price: 529, orig: null, tag: "通勤", art: "shirt",
    sizes: ["S", "M", "L"], colors: [{ name: "象牙白", hex: "#F4EEE0" }, { name: "裸粉", hex: "#E9CFC6" }],
    bg1: "#F7F0E8", bg2: "#EBDDCE",
    desc: "19 姆米桑蚕丝，领口飘带可系可垂。重要会议和客户拜访的安心牌，光泽柔和，拍照不上油光。" },
  { id: 13, name: "九分烟管小脚裤", cat: "裤装", price: 299, orig: 349, tag: "热卖", art: "pants",
    sizes: ["S", "M", "L", "XL"], colors: [{ name: "经典黑", hex: "#33302C" }, { name: "浅灰", hex: "#B9B4AC" }],
    bg1: "#F0EDE8", bg2: "#DFDACE",
    desc: "比直筒更利落，比铅笔裤更宽容。九分长度露出脚踝，配乐福鞋是标准答案，配短靴也好看。" },
  { id: 14, name: "细褶中长百褶裙", cat: "裙装", price: 319, orig: null, tag: "新品", art: "skirt",
    sizes: ["S", "M", "L", "XL"], colors: [{ name: "奶茶", hex: "#D6BE9E" }, { name: "藏青", hex: "#3B4657" }],
    bg1: "#F4EDE1", bg2: "#E6D8BF",
    desc: "高温定型的细密褶，机洗后依旧锋利（记得装洗衣袋）。弹力腰头不勒，中长长度对小个子友好。" },
  { id: 15, name: "棉麻宽松衬衫裙", cat: "连衣裙", price: 429, orig: null, tag: null, art: "dress",
    sizes: ["S", "M", "L"], colors: [{ name: "亚麻色", hex: "#D9CBAF" }, { name: "橄榄绿", hex: "#8A8B66" }],
    bg1: "#F2EEE2", bg2: "#E2D9C2",
    desc: "55% 亚麻混纺，越洗越软。宽松直身剪裁配本布腰带，系上通勤、散开度假，一件两种性格。" },
  { id: 16, name: "羊绒混纺 V 领开衫", cat: "针织", price: 589, orig: 689, tag: null, art: "knit",
    sizes: ["S", "M", "L"], colors: [{ name: "浅驼", hex: "#C9A87F" }, { name: "灰粉", hex: "#D3B8B4" }],
    bg1: "#F5EDE2", bg2: "#E8D9C2",
    desc: "15% 羊绒混纺，轻盈保暖。V 领深度经过反复调试，单穿不露、叠穿有层次，是秋冬利用率冠军。" }
];

const byId = id => PRODUCTS.find(p => p.id === Number(id));

/* ---------- 颜色加深 ---------- */
function shade(hex, amt) {
  const n = parseInt(hex.slice(1), 16);
  let r = (n >> 16) + amt, g = ((n >> 8) & 255) + amt, b = (n & 255) + amt;
  r = Math.max(0, Math.min(255, r)); g = Math.max(0, Math.min(255, g)); b = Math.max(0, Math.min(255, b));
  return "#" + ((r << 16) | (g << 8) | b).toString(16).padStart(6, "0");
}

/* ---------- 商品插画（内联 SVG） ---------- */
const ART = {
  shirt: (c, d) => `
    <path d="M150 74 L126 84 L100 100 L84 158 L110 168 L118 140 L118 288 Q150 300 182 288 L182 140 L190 168 L216 158 L200 100 L174 84 Z" fill="${c}" stroke="${d}" stroke-width="2" stroke-opacity=".25"/>
    <path d="M138 80 L150 102 L162 80 L150 74 Z" fill="${d}" opacity=".35"/>
    <line x1="150" y1="104" x2="150" y2="288" stroke="${d}" stroke-width="2" opacity=".3"/>
    <circle cx="150" cy="126" r="2.6" fill="${d}"/>
    <circle cx="150" cy="160" r="2.6" fill="${d}"/>
    <circle cx="150" cy="194" r="2.6" fill="${d}"/>
    <circle cx="150" cy="228" r="2.6" fill="${d}"/>`,
  knit: (c, d) => `
    <path d="M150 82 L124 92 L96 112 L86 176 L114 184 L120 150 L120 290 Q150 302 180 290 L180 150 L186 184 L214 176 L204 112 L176 92 Z" fill="${c}" stroke="${d}" stroke-width="2" stroke-opacity=".22"/>
    <path d="M132 88 Q150 108 168 88" stroke="${d}" stroke-width="5" fill="none" opacity=".4" stroke-linecap="round"/>
    <path d="M120 268 Q150 280 180 268 L180 290 Q150 302 120 290 Z" fill="${d}" opacity=".28"/>
    <line x1="96" y1="164" x2="114" y2="172" stroke="${d}" stroke-width="5" opacity=".28"/>
    <line x1="186" y1="172" x2="204" y2="164" stroke="${d}" stroke-width="5" opacity=".28"/>
    <line x1="132" y1="140" x2="132" y2="262" stroke="${d}" stroke-width="1.6" opacity=".16"/>
    <line x1="150" y1="146" x2="150" y2="266" stroke="${d}" stroke-width="1.6" opacity=".16"/>
    <line x1="168" y1="140" x2="168" y2="262" stroke="${d}" stroke-width="1.6" opacity=".16"/>`,
  pants: (c, d) => `
    <path d="M110 80 L190 80 L196 130 L188 318 L158 318 L152 180 L148 180 L142 318 L112 318 L104 130 Z" fill="${c}" stroke="${d}" stroke-width="2" stroke-opacity=".22"/>
    <rect x="110" y="80" width="80" height="16" rx="3" fill="${d}" opacity=".3"/>
    <line x1="150" y1="96" x2="150" y2="148" stroke="${d}" stroke-width="2" opacity=".3"/>
    <path d="M118 100 Q132 118 148 112" stroke="${d}" stroke-width="2" fill="none" opacity=".3"/>
    <path d="M182 100 Q168 118 152 112" stroke="${d}" stroke-width="2" fill="none" opacity=".3"/>`,
  skirt: (c, d) => `
    <path d="M110 94 L190 94 L184 128 L222 302 Q150 322 78 302 L116 128 Z" fill="${c}" stroke="${d}" stroke-width="2" stroke-opacity=".22"/>
    <rect x="110" y="94" width="80" height="15" rx="3" fill="${d}" opacity=".32"/>
    <line x1="132" y1="140" x2="110" y2="296" stroke="${d}" stroke-width="2" opacity=".2"/>
    <line x1="150" y1="142" x2="150" y2="306" stroke="${d}" stroke-width="2" opacity=".2"/>
    <line x1="168" y1="140" x2="190" y2="296" stroke="${d}" stroke-width="2" opacity=".2"/>`,
  dress: (c, d) => `
    <path d="M126 166 L174 166 L216 312 Q150 332 84 312 Z" fill="${c}" stroke="${d}" stroke-width="2" stroke-opacity=".2"/>
    <path d="M150 72 L127 84 L115 116 L130 126 L126 170 Q150 182 174 170 L170 126 L185 116 L173 84 Z" fill="${c}" stroke="${d}" stroke-width="2" stroke-opacity=".25"/>
    <path d="M136 80 Q150 98 164 80" stroke="${d}" stroke-width="4" fill="none" opacity=".45" stroke-linecap="round"/>
    <path d="M126 166 Q150 178 174 166 L174 177 Q150 189 126 177 Z" fill="${d}" opacity=".32"/>
    <line x1="140" y1="192" x2="126" y2="300" stroke="${d}" stroke-width="2" opacity=".16"/>
    <line x1="160" y1="192" x2="174" y2="300" stroke="${d}" stroke-width="2" opacity=".16"/>`,
  coat: (c, d) => `
    <path d="M150 76 L122 86 L94 104 L82 170 L108 180 L114 146 L110 318 Q150 332 190 318 L186 146 L192 180 L218 170 L206 104 L178 86 Z" fill="${c}" stroke="${d}" stroke-width="2" stroke-opacity=".25"/>
    <path d="M138 82 L150 130 L162 82 L150 76 Z" fill="#F8F4EC" opacity=".85"/>
    <path d="M138 82 L126 96 L142 118 L150 130 Z" fill="${d}" opacity=".3"/>
    <path d="M162 82 L174 96 L158 118 L150 130 Z" fill="${d}" opacity=".3"/>
    <line x1="150" y1="132" x2="150" y2="322" stroke="${d}" stroke-width="2" opacity=".28"/>
    <rect x="112" y="196" width="76" height="12" rx="6" fill="${d}" opacity=".3"/>
    <circle cx="140" cy="160" r="3" fill="${d}"/>
    <circle cx="160" cy="160" r="3" fill="${d}"/>`
};

let svgSeq = 0;
function svgArt(p, hex) {
  const c = hex || p.colors[0].hex;
  const d = shade(c, -32);
  const gid = "g" + p.id + "-" + (svgSeq++);
  return `<svg viewBox="0 0 300 380" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${p.name}">
    <defs><linearGradient id="${gid}" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${p.bg1}"/><stop offset="1" stop-color="${p.bg2}"/>
    </linearGradient></defs>
    <rect width="300" height="380" fill="url(#${gid})"/>
    <circle cx="150" cy="190" r="118" fill="#ffffff" opacity=".5"/>
    <ellipse cx="150" cy="332" rx="76" ry="9" fill="#3a2e22" opacity=".08"/>
    ${ART[p.art](c, d)}
  </svg>`;
}

/* ---------- 购物袋（本地存储） ---------- */
const CART_KEY = "keyi_cart";
function getCart() {
  try { return JSON.parse(localStorage.getItem(CART_KEY)) || []; }
  catch (e) { return []; }
}
function saveCart(c) {
  localStorage.setItem(CART_KEY, JSON.stringify(c));
  updateBadge();
}
function addToCart(id, size, color, qty) {
  const cart = getCart();
  const found = cart.find(i => i.id === id && i.size === size && i.color === color);
  if (found) found.qty += qty;
  else cart.push({ id, size, color, qty });
  saveCart(cart);
}
function cartTotalQty() {
  return getCart().reduce((s, i) => s + i.qty, 0);
}
function updateBadge() {
  const n = cartTotalQty();
  $all(".cart-count").forEach(el => {
    el.textContent = n;
    el.style.display = n ? "flex" : "none";
  });
}

/* ---------- 提示条 ---------- */
let toastTimer = null;
function toast(msg) {
  const t = $("#toast");
  if (!t) return;
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove("show"), 2400);
}

/* ---------- 商品卡片 ---------- */
function cardHTML(p) {
  const tag = p.tag ? `<span class="card-tag ${p.tag === "热卖" ? "hot" : ""}">${p.tag}</span>` : "";
  const colorNames = p.colors.map(c => c.name).join(" / ");
  return `
  <article class="card">
    <a href="detail.html?id=${p.id}">
      <div class="card-art">${svgArt(p)}${tag}</div>
      <div class="card-info">
        <h3>${p.name}</h3>
        <p class="card-meta">${p.cat} · ${colorNames}</p>
        <p class="card-price">${fmt(p.price)}${p.orig ? `<del>${fmt(p.orig)}</del>` : ""}</p>
        <p class="card-sizes">尺码 ${p.sizes.join(" / ")}</p>
      </div>
    </a>
    <button class="quick-add" data-id="${p.id}">＋ 加入购物袋</button>
  </article>`;
}
function bindQuickAdd(root) {
  $all(".quick-add", root).forEach(btn => {
    btn.addEventListener("click", () => {
      const p = byId(btn.dataset.id);
      const size = p.sizes.includes("M") ? "M" : p.sizes[0];
      addToCart(p.id, size, p.colors[0].name, 1);
      toast(`已加入购物袋：${p.name}（${p.colors[0].name} / ${size}）`);
    });
  });
}
function renderGrid(el, list) {
  el.innerHTML = list.map(cardHTML).join("");
  bindQuickAdd(el);
}

/* ---------- 全站通用 ---------- */
function initCommon() {
  updateBadge();
  const input = $("#h-search");
  if (input) {
    input.addEventListener("keydown", e => {
      if (e.key === "Enter" && input.value.trim()) {
        location.href = "products.html?q=" + encodeURIComponent(input.value.trim());
      }
    });
  }
  const cf = $("#contact-form");
  if (cf) {
    cf.addEventListener("submit", e => {
      e.preventDefault();
      cf.reset();
      toast("留言已收到，我们会在 1 个工作日内回复你");
    });
  }
}

/* ---------- 首页 ---------- */
function initHome() {
  const heroP = byId(6);
  $("#hero-art").innerHTML = `<a href="detail.html?id=6" aria-label="${heroP.name}">${svgArt(heroP)}</a>`;

  const tileBgs = [
    ["#F3E7D8", "#E9D5BC"], ["#E9EDF2", "#D6DFE9"], ["#F5E5DF", "#EDD3C8"],
    ["#F8ECE7", "#F2D9CF"], ["#ECE9E2", "#DDD6C6"], ["#F0EAE0", "#E4D8C2"]
  ];
  $("#cat-grid").innerHTML = CATS.map((cat, i) => {
    const n = PRODUCTS.filter(p => p.cat === cat).length;
    return `<a class="cat-tile" href="products.html?cat=${encodeURIComponent(cat)}"
      style="background:linear-gradient(150deg,${tileBgs[i][0]},${tileBgs[i][1]})">
      <h3>${cat}</h3><span>${n} 款商品 →</span></a>`;
  }).join("");

  renderGrid($("#new-grid"), PRODUCTS.filter(p => p.tag === "新品").slice(0, 4));
  renderGrid($("#work-grid"), PRODUCTS.filter(p => p.tag === "通勤").slice(0, 4));

  $("#news-form").addEventListener("submit", e => {
    e.preventDefault();
    const inp = e.target.querySelector("input");
    if (!inp.value.trim()) { toast("请先输入邮箱地址"); return; }
    inp.value = "";
    toast("订阅成功！每周四记得查收可衣周刊");
  });
}

/* ---------- 列表页 ---------- */
function initList() {
  const params = new URLSearchParams(location.search);
  const state = {
    cat: params.get("cat") || "全部",
    tag: params.get("tag") || null,
    q: params.get("q") || null,
    sizes: new Set(),
    price: "all",
    sort: "default"
  };
  const PRICE_MAP = {
    p1: p => p.price < 200,
    p2: p => p.price >= 200 && p.price < 400,
    p3: p => p.price >= 400 && p.price < 700,
    p4: p => p.price >= 700
  };

  const catsBox = $("#f-cats");
  catsBox.innerHTML = ["全部", ...CATS].map(c =>
    `<li><button data-cat="${c}" class="${c === state.cat ? "on" : ""}">${c === "全部" ? "全部商品" : c}</button></li>`
  ).join("");

  function apply() {
    let list = PRODUCTS.slice();
    if (state.cat !== "全部") list = list.filter(p => p.cat === state.cat);
    if (state.tag) list = list.filter(p => p.tag === state.tag);
    if (state.q) list = list.filter(p => p.name.includes(state.q));
    if (state.sizes.size) list = list.filter(p => p.sizes.some(s => state.sizes.has(s)));
    if (state.price !== "all") list = list.filter(PRICE_MAP[state.price]);
    if (state.sort === "asc") list.sort((a, b) => a.price - b.price);
    if (state.sort === "desc") list.sort((a, b) => b.price - a.price);
    if (state.sort === "new") list.sort((a, b) => (b.tag === "新品" ? 1 : 0) - (a.tag === "新品" ? 1 : 0));

    const title = state.q ? `“${state.q}”的搜索结果`
      : state.tag ? `${state.tag}专区`
      : state.cat === "全部" ? "全部商品" : state.cat;
    $("#list-title").textContent = title;
    $("#crumb-now").textContent = title;
    document.title = title + " · 可衣 KEYI";
    $("#list-sub").textContent =
      state.tag === "通勤" ? "利落、得体、久坐不皱 —— 为办公室而生的版型。"
      : state.tag === "新品" ? "每周四 10:00 准时上新，会员可提前加购。" : "";
    $("#list-count").innerHTML = `共 <strong>${list.length}</strong> 件商品`;

    const grid = $("#list-grid"), empty = $("#list-empty");
    if (list.length) {
      empty.hidden = true;
      grid.style.display = "";
      renderGrid(grid, list);
    } else {
      grid.style.display = "none";
      empty.hidden = false;
    }
  }

  catsBox.addEventListener("click", e => {
    const btn = e.target.closest("button"); if (!btn) return;
    state.cat = btn.dataset.cat;
    $all("button", catsBox).forEach(b => b.classList.toggle("on", b === btn));
    apply();
  });

  $("#f-sizes").addEventListener("click", e => {
    const btn = e.target.closest("button"); if (!btn) return;
    const s = btn.dataset.size;
    if (state.sizes.has(s)) { state.sizes.delete(s); btn.classList.remove("on"); }
    else { state.sizes.add(s); btn.classList.add("on"); }
    apply();
  });

  $("#f-prices").addEventListener("click", e => {
    const btn = e.target.closest("button"); if (!btn) return;
    state.price = btn.dataset.price;
    $all("button", $("#f-prices")).forEach(b => b.classList.toggle("on", b === btn));
    apply();
  });

  $("#sort-select").addEventListener("change", e => { state.sort = e.target.value; apply(); });

  function clearAll() {
    state.cat = "全部"; state.tag = null; state.q = null;
    state.sizes.clear(); state.price = "all"; state.sort = "default";
    $all("button", catsBox).forEach(b => b.classList.toggle("on", b.dataset.cat === "全部"));
    $all("#f-sizes button").forEach(b => b.classList.remove("on"));
    $all("#f-prices button").forEach(b => b.classList.toggle("on", b.dataset.price === "all"));
    $("#sort-select").value = "default";
    apply();
  }
  $("#f-clear").addEventListener("click", clearAll);
  $("#empty-clear").addEventListener("click", clearAll);

  apply();
}

/* ---------- 详情页 ---------- */
function initDetail() {
  const id = new URLSearchParams(location.search).get("id");
  const p = byId(id) || PRODUCTS[0];
  document.title = p.name + " · 可衣 KEYI";

  const isBottom = p.cat === "裤装" || p.cat === "裙装";
  const sizeTable = isBottom ? `
    <table class="size-table">
      <tr><th>尺码</th><th>腰围 (cm)</th><th>臀围 (cm)</th><th>长度 (cm)</th><th>建议体重</th></tr>
      <tr><td>S</td><td>64 – 68</td><td>90 – 94</td><td>96</td><td>45 – 52 kg</td></tr>
      <tr><td>M</td><td>68 – 72</td><td>94 – 98</td><td>98</td><td>52 – 58 kg</td></tr>
      <tr><td>L</td><td>72 – 76</td><td>98 – 102</td><td>100</td><td>58 – 65 kg</td></tr>
      <tr><td>XL</td><td>76 – 82</td><td>102 – 108</td><td>102</td><td>65 – 72 kg</td></tr>
    </table>` : `
    <table class="size-table">
      <tr><th>尺码</th><th>肩宽 (cm)</th><th>胸围 (cm)</th><th>衣长 (cm)</th><th>建议体重</th></tr>
      <tr><td>S</td><td>37</td><td>92</td><td>62</td><td>45 – 52 kg</td></tr>
      <tr><td>M</td><td>38.5</td><td>96</td><td>64</td><td>52 – 58 kg</td></tr>
      <tr><td>L</td><td>40</td><td>100</td><td>66</td><td>58 – 65 kg</td></tr>
    </table>`;

  const related = PRODUCTS.filter(x => x.cat === p.cat && x.id !== p.id)
    .concat(PRODUCTS.filter(x => x.cat !== p.cat && x.id !== p.id)).slice(0, 4);

  const state = { color: p.colors[0].name, hex: p.colors[0].hex, size: null, qty: 1 };

  $("#detail-root").innerHTML = `
    <div class="page-head" style="padding-bottom:0">
      <nav class="crumbs">
        <a href="index.html">首页</a><span>/</span>
        <a href="products.html">全部商品</a><span>/</span>
        <a href="products.html?cat=${encodeURIComponent(p.cat)}">${p.cat}</a><span>/</span>
        <em>${p.name}</em>
      </nav>
    </div>

    <div class="detail-layout">
      <div>
        <div class="d-gallery-main" id="d-main">${svgArt(p)}</div>
        <div class="d-thumbs" id="d-thumbs">
          ${p.colors.map((c, i) => `
            <button class="d-thumb ${i === 0 ? "on" : ""}" data-hex="${c.hex}" data-name="${c.name}" aria-label="${c.name}">
              ${svgArt(p, c.hex)}
            </button>`).join("")}
        </div>
      </div>

      <div class="d-info">
        <p class="d-catline">${p.cat}${p.tag ? " · " + p.tag : ""}</p>
        <h1>${p.name}</h1>
        <div class="d-price">
          <strong>${fmt(p.price)}</strong>
          ${p.orig ? `<del>${fmt(p.orig)}</del><span class="save">立省 ${fmt(p.orig - p.price)}</span>` : ""}
        </div>
        <p class="d-desc">${p.desc}</p>

        <div class="d-row">
          <p class="d-row-label">颜色<em id="d-color-name">${p.colors[0].name}</em></p>
          <div class="swatches" id="d-swatches">
            ${p.colors.map((c, i) => `
              <button class="swatch ${i === 0 ? "on" : ""}" style="background:${c.hex}"
                data-hex="${c.hex}" data-name="${c.name}" aria-label="${c.name}"></button>`).join("")}
          </div>
        </div>

        <div class="d-row">
          <p class="d-row-label">尺码<em id="d-size-hint">请选择尺码</em></p>
          <div class="size-btns" id="d-sizes">
            ${p.sizes.map(s => `<button data-size="${s}">${s}</button>`).join("")}
          </div>
        </div>

        <div class="d-row">
          <p class="d-row-label">数量</p>
          <div class="qty">
            <button id="d-minus" aria-label="减少数量">−</button>
            <span id="d-qty">1</span>
            <button id="d-plus" aria-label="增加数量">＋</button>
          </div>
        </div>

        <div class="d-actions">
          <button class="btn btn-line" id="d-add">加入购物袋</button>
          <button class="btn btn-dark" id="d-buy">立即购买</button>
        </div>

        <div class="d-acc">
          <details>
            <summary>尺码表（实量平铺尺寸）</summary>
            <div class="acc-body">手工测量存在 1 – 2 cm 误差，属正常范围。${sizeTable}</div>
          </details>
          <details>
            <summary>面料与洗护</summary>
            <div class="acc-body">
              建议使用中性洗涤剂，30°C 以下水温轻柔机洗或手洗；深浅色分开洗涤；
              阴凉通风处平铺晾干，避免长时间暴晒；如需熨烫请使用低温并垫布。
            </div>
          </details>
          <details>
            <summary>配送与退换</summary>
            <div class="acc-body">
              工作日 16:00 前付款当日由上海仓发出，顺丰配送；全场满 ¥399 免运费。
              签收后 7 天内支持无理由退换（需保持吊牌完整、未水洗），可申请上门取件，退款原路返回。
            </div>
          </details>
        </div>
      </div>
    </div>

    <section class="related">
      <h2>你可能也喜欢</h2>
      <div class="grid" id="related-grid"></div>
    </section>`;

  renderGrid($("#related-grid"), related);

  function setColor(name, hex) {
    state.color = name; state.hex = hex;
    $("#d-color-name").textContent = name;
    $("#d-main").innerHTML = svgArt(p, hex);
    $all("#d-swatches .swatch").forEach(s => s.classList.toggle("on", s.dataset.name === name));
    $all("#d-thumbs .d-thumb").forEach(t => t.classList.toggle("on", t.dataset.name === name));
  }
  $("#d-swatches").addEventListener("click", e => {
    const b = e.target.closest(".swatch"); if (!b) return;
    setColor(b.dataset.name, b.dataset.hex);
  });
  $("#d-thumbs").addEventListener("click", e => {
    const b = e.target.closest(".d-thumb"); if (!b) return;
    setColor(b.dataset.name, b.dataset.hex);
  });

  $("#d-sizes").addEventListener("click", e => {
    const b = e.target.closest("button"); if (!b) return;
    state.size = b.dataset.size;
    $all("#d-sizes button").forEach(x => x.classList.toggle("on", x === b));
    $("#d-size-hint").textContent = "已选 " + state.size;
  });

  $("#d-minus").addEventListener("click", () => {
    state.qty = Math.max(1, state.qty - 1);
    $("#d-qty").textContent = state.qty;
  });
  $("#d-plus").addEventListener("click", () => {
    state.qty = Math.min(9, state.qty + 1);
    $("#d-qty").textContent = state.qty;
  });

  function checkSize() {
    if (!state.size) {
      toast("请先选择尺码");
      $("#d-size-hint").textContent = "请选择一个尺码";
      return false;
    }
    return true;
  }
  $("#d-add").addEventListener("click", () => {
    if (!checkSize()) return;
    addToCart(p.id, state.size, state.color, state.qty);
    toast(`已加入购物袋：${p.name}（${state.color} / ${state.size} × ${state.qty}）`);
  });
  $("#d-buy").addEventListener("click", () => {
    if (!checkSize()) return;
    addToCart(p.id, state.size, state.color, state.qty);
    location.href = "cart.html";
  });
}

/* ---------- 购物袋页 ---------- */
function initCart() {
  const root = $("#cart-root");
  let coupon = null;
  const COUPONS = { KEYI20: 20, SPRING30: 30 };
  const FREE_LIMIT = 399, SHIP_FEE = 12;

  function render() {
    const cart = getCart();
    if (!cart.length) {
      root.innerHTML = `
        <div class="cart-empty">
          <h2>购物袋还是空的</h2>
          <p>去逛逛本周新品，挑几件喜欢的吧。</p>
          <a class="btn btn-dark" href="products.html">去逛全部商品</a>
        </div>`;
      return;
    }

    const subtotal = cart.reduce((s, i) => s + byId(i.id).price * i.qty, 0);
    const discount = coupon ? Math.min(COUPONS[coupon], subtotal) : 0;
    const shipping = subtotal - discount >= FREE_LIMIT ? 0 : SHIP_FEE;
    const total = subtotal - discount + shipping;
    const gap = FREE_LIMIT - (subtotal - discount);

    root.innerHTML = `
      <div class="cart-layout">
        <div class="cart-items">
          ${cart.map((i, idx) => {
            const p = byId(i.id);
            const col = p.colors.find(c => c.name === i.color) || p.colors[0];
            return `
            <div class="cart-item">
              <a class="ci-art" href="detail.html?id=${p.id}">${svgArt(p, col.hex)}</a>
              <div>
                <p class="ci-name"><a href="detail.html?id=${p.id}">${p.name}</a></p>
                <p class="ci-meta">${i.color} / 尺码 ${i.size} · 单价 ${fmt(p.price)}</p>
                <p class="ci-price">${fmt(p.price)} × ${i.qty}</p>
              </div>
              <div class="ci-right">
                <p class="ci-total">${fmt(p.price * i.qty)}</p>
                <div class="qty">
                  <button data-act="minus" data-idx="${idx}" aria-label="减少数量">−</button>
                  <span>${i.qty}</span>
                  <button data-act="plus" data-idx="${idx}" aria-label="增加数量">＋</button>
                </div>
                <button class="ci-remove" data-act="remove" data-idx="${idx}">移除</button>
              </div>
            </div>`;
          }).join("")}
        </div>

        <aside class="cart-summary">
          <h2>订单摘要</h2>
          ${gap > 0
            ? `<p class="free-tip">再买 ${fmt(gap)} 即可免运费</p>`
            : `<p class="free-tip">已享免运费</p>`}
          <div class="sum-row"><span>商品小计</span><span>${fmt(subtotal)}</span></div>
          <div class="sum-row"><span>运费</span><span>${shipping === 0 ? "免运费" : fmt(shipping)}</span></div>
          ${discount ? `<div class="sum-row"><span>优惠券（${coupon}）</span><span>−${fmt(discount)}</span></div>` : ""}
          <div class="coupon">
            <input id="coupon-input" type="text" placeholder="优惠码，如 KEYI20" value="${coupon || ""}">
            <button id="coupon-btn">使用</button>
          </div>
          <div class="sum-row total"><span>应付合计</span><strong>${fmt(total)}</strong></div>
          <button class="btn btn-dark btn-block" id="checkout-btn" style="margin-top:16px">去结算</button>
          <p style="font-size:12px;color:var(--muted);margin-top:12px;text-align:center">支持七天无理由退换 · 顺丰包邮</p>
        </aside>
      </div>`;

    root.querySelectorAll("[data-act]").forEach(btn => {
      btn.addEventListener("click", () => {
        const cart2 = getCart();
        const idx = Number(btn.dataset.idx);
        const act = btn.dataset.act;
        if (act === "minus") cart2[idx].qty = Math.max(1, cart2[idx].qty - 1);
        if (act === "plus") cart2[idx].qty = Math.min(9, cart2[idx].qty + 1);
        if (act === "remove") {
          const p = byId(cart2[idx].id);
          cart2.splice(idx, 1);
          toast(`已移除：${p.name}`);
        }
        saveCart(cart2);
        render();
      });
    });

    $("#coupon-btn").addEventListener("click", () => {
      const code = $("#coupon-input").value.trim().toUpperCase();
      if (!code) { toast("请输入优惠码"); return; }
      if (COUPONS[code]) {
        coupon = code;
        toast(`优惠码 ${code} 已生效，立减 ${fmt(COUPONS[code])}`);
      } else {
        coupon = null;
        toast("优惠码无效，试试 KEYI20");
      }
      render();
    });

    $("#checkout-btn").addEventListener("click", () => {
      toast("结算通道正在维护，请稍后再试，商品已为你保留在购物袋中");
    });
  }

  render();
}

/* ---------- 路由 ---------- */
document.addEventListener("DOMContentLoaded", () => {
  initCommon();
  const page = document.body.dataset.page;
  if (page === "home") initHome();
  if (page === "list") initList();
  if (page === "detail") initDetail();
  if (page === "cart") initCart();
});
