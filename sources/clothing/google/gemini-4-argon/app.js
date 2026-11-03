const PRODUCTS = [
  {
    id: "ky-101",
    name: "静安晨光·双排扣垂感廓形西装外套",
    subtitle: "挺括不易皱，兼顾会议正式感与日常松弛度",
    category: "职场通勤",
    subcat: "外套",
    price: 680,
    sizes: ["S", "M", "L", "XL"],
    colors: ["燕麦米", "深炭灰"],
    fabric: "72% 醋酸纤维 / 28% 聚酯纤维",
    care: "建议干洗或冷水轻柔手洗，悬挂阴干",
    tag: "通勤热销",
    palette: ["#ded5c8", "#6d655f", "#4a433f"],
    desc: "源自上海静安工作室版型档案，微落肩与收腰弧线经过六次调整。内衬采用透气铜氨丝，春秋单穿或叠穿针织衫都干净利落。"
  },
  {
    id: "ky-102",
    name: "梧桐絮语·重磅桑蚕丝飘带衬衫",
    subtitle: "19姆米双绉真丝，温润珍珠母贝扣",
    category: "职场通勤",
    subcat: "衬衫",
    price: 520,
    sizes: ["XS", "S", "M", "L"],
    colors: ["月光白", "浅杏粉", "松石绿"],
    fabric: "100% 桑蚕丝（19姆米双绉）",
    care: "专用丝毛洗涤剂冷水手洗，不可暴晒",
    tag: "真丝系列",
    palette: ["#f3EFEA", "#d8c3b8", "#8c7265"],
    desc: "领口可拆卸飘带设计，系上是优雅职场装，解开呈微V领法式随性感。袖口加宽双扣，抬手间尽显温和气场。"
  },
  {
    id: "ky-103",
    name: "衡山印象·高腰压褶垂坠阔腿西装裤",
    subtitle: "立体双褶修饰胯部，拉长腿部线条",
    category: "职场通勤",
    subcat: "下装",
    price: 420,
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: ["松果棕", "经典黑", "暖米白"],
    fabric: "68% 聚酯纤维 / 29% 粘胶纤维 / 3% 氨纶",
    care: "可机洗（请放入洗衣袋），低温熨烫",
    tag: "回购榜首",
    palette: ["#7d6354", "#3d3531", "#cbbba8"],
    desc: "针对亚洲都市女性梨形身材研发，高腰位配合后腰微弹暗松紧，久坐办公不勒腰腹，步行带风且不易起膝盖鼓包。"
  },
  {
    id: "ky-104",
    name: "苏河微风·澳洲精纺美利奴羊毛开衫",
    subtitle: "亲肤软糯不扎肤，四季空调房与春秋必备",
    category: "日常休闲",
    subcat: "针织",
    price: 460,
    sizes: ["S", "M", "L"],
    colors: ["焦糖驼", "雾霾蓝", "奶昔白"],
    fabric: "100% 澳洲超细美利奴羊毛",
    care: "平铺晾干，冷水手洗或干洗",
    tag: "精选羊毛",
    palette: ["#b88b6a", "#8d725e", "#e6d8c9"],
    desc: "选用18.5微米超细美丽奴羊毛，触感如云朵般细腻。微宽松短款比例，搭配连衣裙或高腰牛仔裤都恰到好处。"
  },
  {
    id: "ky-105",
    name: "武康午后·立体收腰A字亚麻混纺连衣裙",
    subtitle: "透气天丝亚麻，自带南法复古胶片感",
    category: "日常休闲",
    subcat: "连衣裙",
    price: 590,
    sizes: ["XS", "S", "M", "L"],
    colors: ["茶卡杏", "橄榄绿"],
    fabric: "55% 莱赛尔天丝 / 45% 亚麻",
    care: "轻柔洗护，湿态整形悬挂晾干",
    tag: "周末出游",
    palette: ["#d2c2ae", "#7a8268", "#504a42"],
    desc: "中和了纯亚麻易皱的缺点，加入天丝提升垂感与丝滑度。方领微露锁骨，两侧设有隐形实用口袋，漫步街角自在从容。"
  },
  {
    id: "ky-106",
    name: "外滩夜色·醋酸缎面斜裁高腰半身裙",
    subtitle: "如水波般流动光泽，通勤约会无缝切换",
    category: "轻社交晚装",
    subcat: "下装",
    price: 390,
    sizes: ["S", "M", "L"],
    colors: ["香槟金", "深邃黑", "玫瑰豆沙"],
    fabric: "80% 三醋酸 / 20% 聚酯纤维",
    care: "冷水轻柔手洗，隔布低温蒸汽熨烫",
    tag: "约会推荐",
    palette: ["#dfd1be", "#b59a84", "#4f433c"],
    desc: "采用45度斜裁工艺，裙摆自然贴合身体曲线却不紧绷。下班后无需换装，搭配一件针织或衬衫即可赴约晚宴与展览。"
  },
  {
    id: "ky-107",
    name: "愚园路88号·防风双排扣中长款经典风衣",
    subtitle: "高密防泼水长绒棉，利落肩章与背部雨挡",
    category: "职场通勤",
    subcat: "外套",
    price: 890,
    sizes: ["XS", "S", "M", "L"],
    colors: ["经典卡其", "冷萃灰绿"],
    fabric: "100% 新疆长绒棉（防泼水整理）",
    care: "建议专业干洗，勿使用漂白剂",
    tag: "经典馆藏",
    palette: ["#c9b89e", "#8f7e68", "#47413a"],
    desc: "衣长控制在小腿肚上方黄金位置，对158cm至172cm身高均十分友好。牛角纹树脂扣细节考究，陪伴你度过数个春秋。"
  },
  {
    id: "ky-108",
    name: "新天地·极简船领修身弹力罗纹针织衫",
    subtitle: "高支兰精莫代尔混纺，显瘦锁骨线条",
    category: "日常休闲",
    subcat: "针织",
    price: 290,
    sizes: ["S", "M", "L", "XL"],
    colors: ["浓缩咖啡", "云朵白", "经典黑"],
    fabric: "65% 兰精莫代尔 / 28% 棉 / 7% 氨纶",
    care: "可机洗，建议平铺晾干避免拉长",
    tag: "百搭基础",
    palette: ["#5c493f", "#d6ccc2", "#2b2623"],
    desc: "恰到好处的一字船领不会滑肩，五分袖长遮住大臂肉感。无论是单穿还是作为西装内搭，都能展现克制的高级感。"
  },
  {
    id: "ky-109",
    name: "思南公馆·法式V领收腰茶歇连衣裙",
    subtitle: "微肌理垂感面料，视觉显瘦五斤",
    category: "轻社交晚装",
    subcat: "连衣裙",
    price: 620,
    sizes: ["XS", "S", "M", "L"],
    colors: ["复古勃艮第", "午夜藏青"],
    fabric: "100% 环保再生聚酯纤维（日本进口纱线）",
    care: "冷水机洗或手洗，悬挂晾干无需熨烫",
    tag: "秋季新品",
    palette: ["#72383d", "#343b4a", "#d9c8be"],
    desc: "高腰线扭结设计巧妙隐藏小腹，裙摆开叉恰到好处，行走时若隐若现。适合下午茶、艺术展及重要纪念日场合。"
  }
];

const DEFAULT_CART = [
  { id: "ky-102", size: "M", color: "月光白", qty: 1 },
  { id: "ky-103", size: "M", color: "松果棕", qty: 1 }
];

function getCart() {
  try {
    const raw = localStorage.getItem("keyi_cart_v1");
    if (!raw) {
      localStorage.setItem("keyi_cart_v1", JSON.stringify(DEFAULT_CART));
      return [...DEFAULT_CART];
    }
    return JSON.parse(raw);
  } catch (e) {
    return [...DEFAULT_CART];
  }
}

function saveCart(cart) {
  try {
    localStorage.setItem("keyi_cart_v1", JSON.stringify(cart));
  } catch (e) {}
  updateCartBadge();
}

function updateCartBadge() {
  const cart = getCart();
  const count = cart.reduce((sum, item) => sum + Number(item.qty || 1), 0);
  document.querySelectorAll(".cart-badge").forEach(el => {
    el.textContent = count;
  });
}

function showToast(msg) {
  let toast = document.getElementById("site-toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "site-toast";
    toast.className = "toast";
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.classList.add("show");
  clearTimeout(window.__toastTimer);
  window.__toastTimer = setTimeout(() => {
    toast.classList.remove("show");
  }, 2600);
}

function addToCart(productId, size, color, qty = 1) {
  const product = PRODUCTS.find(p => p.id === productId) || PRODUCTS[0];
  const chosenSize = size || product.sizes[1] || product.sizes[0];
  const chosenColor = color || product.colors[0];
  const cart = getCart();
  const existing = cart.find(
    item => item.id === product.id && item.size === chosenSize && item.color === chosenColor
  );
  if (existing) {
    existing.qty += Number(qty);
  } else {
    cart.push({
      id: product.id,
      size: chosenSize,
      color: chosenColor,
      qty: Number(qty)
    });
  }
  saveCart(cart);
  showToast(`已加入购物袋：${product.name}（${chosenColor} / ${chosenSize}码）`);
}

function renderGarmentSVG(product, viewIndex = 0) {
  const [c1, c2, c3] = product.palette;
  const sub = product.subcat;
  let shape = "";

  if (sub === "外套") {
    shape = `
      <path d="M110 70 L155 50 L245 50 L290 70 L320 210 L285 220 L270 120 L270 320 L130 320 L130 120 L115 220 L80 210 Z" fill="${c1}" stroke="${c3}" stroke-width="2"/>
      <path d="M155 50 L200 145 L245 50" fill="none" stroke="${c3}" stroke-width="2"/>
      <circle cx="185" cy="190" r="4" fill="${c3}"/>
      <circle cx="215" cy="190" r="4" fill="${c3}"/>
      <circle cx="185" cy="230" r="4" fill="${c3}"/>
      <circle cx="215" cy="230" r="4" fill="${c3}"/>
    `;
  } else if (sub === "衬衫" || sub === "针织") {
    shape = `
      <path d="M120 80 L165 62 L235 62 L280 80 L305 205 L270 215 L258 125 L258 300 L142 300 L142 125 L130 215 L95 205 Z" fill="${c1}" stroke="${c3}" stroke-width="2"/>
      <path d="M170 62 Q200 95 230 62" fill="none" stroke="${c2}" stroke-width="3"/>
      <line x1="200" y1="88" x2="200" y2="298" stroke="${c2}" stroke-width="1.5" stroke-dasharray="4 6"/>
    `;
  } else if (sub === "下装") {
    shape = `
      <path d="M145 60 L255 60 L285 330 L215 330 L200 155 L185 330 L115 330 Z" fill="${c1}" stroke="${c3}" stroke-width="2"/>
      <line x1="142" y1="82" x2="258" y2="82" stroke="${c3}" stroke-width="2"/>
      <line x1="175" y1="82" x2="165" y2="290" stroke="${c2}" stroke-width="1.2"/>
      <line x1="225" y1="82" x2="235" y2="290" stroke="${c2}" stroke-width="1.2"/>
    `;
  } else {
    shape = `
      <path d="M150 65 L180 55 L220 55 L250 65 L242 150 L295 325 L105 325 L158 150 Z" fill="${c1}" stroke="${c3}" stroke-width="2"/>
      <path d="M158 150 Q200 162 242 150" fill="none" stroke="${c3}" stroke-width="2"/>
      <path d="M180 55 L200 105 L220 55" fill="none" stroke="${c3}" stroke-width="2"/>
    `;
  }

  const badgeText = viewIndex === 1 ? "面料微距纹理" : viewIndex === 2 ? "立体剪裁背面" : viewIndex === 3 ? "上身比例参考" : product.category;

  return `
    <svg viewBox="0 0 400 380" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${product.name}">
      <rect width="400" height="380" fill="#f5f0ea"/>
      <circle cx="200" cy="190" r="135" fill="${c2}" opacity="0.16"/>
      <rect x="28" y="24" width="344" height="332" fill="none" stroke="#e2d9ce" stroke-width="1"/>
      ${shape}
      <text x="44" y="340" fill="#6e665f" font-size="12" font-family="PingFang SC, sans-serif">可衣 KEYI SHANGHAI · ${badgeText}</text>
    </svg>
  `;
}

function createProductCardHTML(product) {
  const sizesHTML = product.sizes.map(s => `<span class="size-pill">${s}</span>`).join("");
  return `
    <article class="product-card">
      <a href="product-detail.html?id=${product.id}" class="product-thumb">
        ${renderGarmentSVG(product)}
        <span class="product-tag">${product.tag}</span>
      </a>
      <div class="product-body">
        <div class="product-cat">${product.category} · ${product.subcat}</div>
        <a href="product-detail.html?id=${product.id}" class="product-title">${product.name}</a>
        <div class="product-fabric">${product.fabric}</div>
        <div class="product-meta-row">
          <span class="product-price">¥${product.price}</span>
          <div class="product-sizes" title="可选尺码">${sizesHTML}</div>
        </div>
        <div class="product-actions">
          <a href="product-detail.html?id=${product.id}" class="btn btn-light">查看详情</a>
          <button type="button" class="btn btn-primary" onclick="addToCart('${product.id}')">加入购物袋</button>
        </div>
      </div>
    </article>
  `;
}

document.addEventListener("DOMContentLoaded", () => {
  updateCartBadge();
});
