(function (global) {
  'use strict';

  var PRODUCTS = [
    {
      id: 's01', name: '云朵真丝衬衫', cat: '上装', type: 'shirt', tone: '#eae2d6',
      price: 459, old: 0, tag: '热卖', sub: '19 姆米桑蚕丝 · 垂坠不透',
      sizes: ['S', 'M', 'L', 'XL'], sold: [],
      colors: [['米白', '#efe8dc'], ['雾蓝', '#c3cfdb'], ['墨黑', '#2d2b29']],
      material: '100% 桑蚕丝', fit: '微宽松', season: '春 / 秋 / 冬（内搭）', sku: 'KY-2024-S01',
      desc: '做了四年的经典款，今年把领座加高了 0.5 厘米，扣起第一颗扣子也不压脖子。19 姆米的桑蚕丝足够厚实，浅色里面穿浅色内衣不会透；下摆前短后长，塞进西裤或直接外穿都利落。袖口的小褶是手工收的，卷起来随意一折就很好看。',
      highlights: ['加高领座，开会扣到顶也舒服', '19 姆米真丝，米白色不透', '支持洗衣机真丝程序，缩率 2% 以内'],
      hint: '模特身高 168cm / 体重 52kg，穿着 M 码。'
    },
    {
      id: 's02', name: '法式方领针织衫', cat: '上装', type: 'knit', tone: '#e3dbe6',
      price: 299, old: 0, tag: '', sub: '细羊毛混纺 · 修饰肩颈线条',
      sizes: ['S', 'M', 'L'], sold: ['L'],
      colors: [['奶咖', '#ddd0bf'], ['藕粉', '#dfc9cd'], ['藏青', '#2f3b4f']],
      material: '羊毛 55% / 粘纤 40% / 锦纶 5%', fit: '合身', season: '春 / 秋', sku: 'KY-2024-S02',
      desc: '方领的开口宽度调试过三次，最后定在锁骨下方两指，露出的那一小截颈线正好。织法用的是细针双股，贴身穿不扎皮肤，也不会勾到项链。下摆有一圈弹性罗纹，塞进半裙里不会起鼓。',
      highlights: ['方领开口修饰颈肩', '细针双股，贴身不扎', '可单穿也可做西装内搭'],
      hint: '模特身高 165cm / 体重 50kg，穿着 S 码。'
    },
    {
      id: 's03', name: '宽松廓形白衬衫', cat: '上装', type: 'shirt', tone: '#eef0ef',
      price: 329, old: 0, tag: '补货', sub: '免烫棉 · 落肩版型',
      sizes: ['S', 'M', 'L', 'XL'], sold: [],
      colors: [['本白', '#f3f2ee'], ['浅蓝', '#cdd9e3']],
      material: '棉 97% / 氨纶 3%（免烫整理）', fit: '宽松', season: '四季', sku: 'KY-2024-S03',
      desc: '通勤衣橱里最容易被穿旧的一件，所以我们选了经过免烫整理的高支棉，洗后基本不用熨。落肩的位置下放了 2 厘米，手臂活动不紧绷，袖口两颗扣可以调节松紧。',
      highlights: ['免烫整理，洗后几乎不用熨', '落肩版型，手臂活动自由', '可调节袖口，两段式扣位'],
      hint: '模特身高 170cm / 体重 55kg，穿着 M 码。'
    },
    {
      id: 's04', name: '圆领基础针织背心', cat: '上装', type: 'knit', tone: '#e6e2d4',
      price: 189, old: 0, tag: '', sub: '叠穿神器 · 四季可用',
      sizes: ['S', 'M', 'L'], sold: [],
      colors: [['燕麦', '#e2d8c5'], ['浅灰', '#d6d6d4'], ['黑', '#282624']],
      material: '棉 70% / 粘纤 30%', fit: '合身', season: '四季', sku: 'KY-2024-S04',
      desc: '一件用来叠穿的背心，袖窿开得比常规高一点，套在衬衫外面不会把袖子挤出褶皱。版型是直筒的，腰腹不收紧，坐着也不勒。',
      highlights: ['高袖窿设计，叠穿不挤褶', '直筒版型，腰腹无压迫', '三色可选，百搭度高'],
      hint: '模特身高 162cm / 体重 48kg，穿着 S 码。'
    },
    {
      id: 'o01', name: '通勤双排扣西装外套', cat: '外套', type: 'coat', tone: '#dcd8d0',
      price: 699, old: 899, tag: '限时 ¥200', sub: '有肩线的松弛廓形',
      sizes: ['S', 'M', 'L', 'XL'], sold: [],
      colors: [['燕麦', '#ded4c3'], ['炭灰', '#4b4a48'], ['墨黑', '#2b2a28']],
      material: '聚酯纤维 68% / 粘纤 29% / 氨纶 3%', fit: '微宽松', season: '春 / 秋', sku: 'KY-2024-O01',
      desc: '我们想要的是一件“有肩线但不硬”的外套：垫肩只用了 0.4 厘米的薄棉，肩头有型却不会显得用力。胸口到腰部的收量控制得克制，里面套针织背心或薄毛衣都不绷。衣长到胯下三指，配西裤和半裙都好看。',
      highlights: ['0.4cm 薄垫肩，有型不显硬', '内里半里设计，春秋不闷', '四个实用口袋，手机可放'],
      hint: '模特身高 168cm / 体重 54kg，穿着 M 码。'
    },
    {
      id: 'o02', name: '双面呢羊毛大衣', cat: '外套', type: 'coat', tone: '#d9ccc0',
      price: 1299, old: 0, tag: '明星单品', sub: '手工缝制 · 无需夹里',
      sizes: ['S', 'M', 'L'], sold: ['S'],
      colors: [['驼色', '#c3a688'], ['米灰', '#d8d2c8']],
      material: '羊毛 90% / 羊绒 10%', fit: '宽松', season: '秋 / 冬', sku: 'KY-2024-O02',
      desc: '双面呢的工艺决定了这件大衣没有夹里，边缘全部由手工缲边完成，整件衣服很轻但挡风。版型是 H 型，里面叠一件羊毛衫也不会显臃肿；衣长到小腿中部，配裤装和长裙都合适。',
      highlights: ['90% 羊毛 + 10% 羊绒，轻而保暖', '手工缲边，正反两面都可穿看', 'H 型版型，不挑身形'],
      hint: '模特身高 172cm / 体重 56kg，穿着 M 码。'
    },
    {
      id: 'o03', name: '落肩短款夹克', cat: '外套', type: 'coat', tone: '#d5dbd8',
      price: 599, old: 0, tag: '', sub: '休闲通勤两用',
      sizes: ['S', 'M', 'L', 'XL'], sold: [],
      colors: [['雾绿', '#c6d0c8'], ['卡其', '#cdbda2']],
      material: '棉 100%（涂层处理）', fit: '宽松', season: '春 / 秋', sku: 'KY-2024-O03',
      desc: '短款落肩的版型，正好停在胯骨上方，配高腰裤显腿长。面料经过轻涂层处理，小雨天不怕打湿；领口可以立起来，起风的时候挡一下脖子。',
      highlights: ['轻涂层处理，防小雨', '短款落肩，配高腰下装显比例', '两侧立体口袋，装得下长款钱包'],
      hint: '模特身高 166cm / 体重 51kg，穿着 M 码。'
    },
    {
      id: 'b01', name: '高腰垂感西裤', cat: '下装', type: 'pants', tone: '#ded8cf',
      price: 389, old: 0, tag: '热卖', sub: '显腿长的直筒九分',
      sizes: ['S', 'M', 'L', 'XL'], sold: [],
      colors: [['燕麦', '#ddd3c2'], ['藏青', '#333c4d'], ['黑', '#272524']],
      material: '聚酯纤维 72% / 粘纤 25% / 氨纶 3%', fit: '直筒', season: '四季', sku: 'KY-2024-B01',
      desc: '腰头做了 4.5 厘米的宽度，后腰加了隐形松紧，久坐也不卡。裤线是定型压烫的，洗后依然笔直。九分的长度配平底鞋和中跟都合适，膝盖以下有一点点自然外扩，不会贴腿。',
      highlights: ['后腰隐形松紧，久坐不勒', '定型裤线，洗后依旧笔挺', '九分长度，平底中跟都好穿'],
      hint: '模特身高 168cm / 体重 52kg，穿着 M 码。'
    },
    {
      id: 'b02', name: '微喇弹力牛仔裤', cat: '下装', type: 'pants', tone: '#cfd8e2',
      price: 359, old: 429, tag: '', sub: '高弹不松垮',
      sizes: ['S', 'M', 'L', 'XL'], sold: ['XL'],
      colors: [['中蓝', '#7f9ab4'], ['深蓝', '#3f506b']],
      material: '棉 92% / 聚酯纤维 6% / 氨纶 2%', fit: '微喇', season: '四季', sku: 'KY-2024-B02',
      desc: '牛仔裤最怕穿两小时就变大，这条用的是高回弹氨纶，一整天下来腰臀依然服帖。小喇叭的开口从膝盖下方开始，视觉上把小腿拉直。洗水做得干净，没有多余的猫须和磨白。',
      highlights: ['高回弹面料，久穿不变形', '膝下微喇，显腿直', '干净洗水，通勤也能穿'],
      hint: '模特身高 165cm / 体重 50kg，穿着 S 码。'
    },
    {
      id: 'b03', name: '醋酸百褶半身裙', cat: '下装', type: 'skirt', tone: '#e7dbd2',
      price: 349, old: 0, tag: '', sub: '走动有光泽的垂坠感',
      sizes: ['S', 'M', 'L'], sold: [],
      colors: [['雾粉', '#e0cdc6'], ['墨绿', '#3c4b43'], ['黑', '#2a2827']],
      material: '醋酸纤维 65% / 聚酯纤维 35%', fit: '伞型', season: '春 / 秋', sku: 'KY-2024-B03',
      desc: '压褶用的是高温定型工艺，洗过之后褶子不会散。裙长到小腿中部，走路时褶子会自然打开，光泽柔和不廉价。腰头是全隐形松紧，吃完饭也不会难受。',
      highlights: ['高温定型压褶，水洗不散', '全隐形松紧腰，舒适度高', '内衬加长，阳光下不透'],
      hint: '模特身高 167cm / 体重 51kg，穿着 M 码。'
    },
    {
      id: 'b04', name: '羊毛混纺A字裙', cat: '下装', type: 'skirt', tone: '#ddd3cd',
      price: 429, old: 0, tag: '', sub: '秋冬通勤必备',
      sizes: ['S', 'M', 'L', 'XL'], sold: [],
      colors: [['浅驼', '#cbb79c'], ['深灰', '#555452']],
      material: '羊毛 60% / 聚酯纤维 38% / 氨纶 2%', fit: 'A 字', season: '秋 / 冬', sku: 'KY-2024-B04',
      desc: 'A 字的下摆展开刚好一个手掌的宽度，配靴子或乐福鞋都成立。面料有一点点呢感但不扎，里面配厚打底袜也不会起静电（内衬做了抗静电处理）。后开衩的长度经过调整，上下楼梯不会走不开。',
      highlights: ['内衬抗静电处理，不粘腿', '后开衩加长，走路不受限', '羊毛混纺，秋冬挡风'],
      hint: '模特身高 163cm / 体重 49kg，穿着 S 码。'
    },
    {
      id: 'd01', name: '醋酸缎面吊带连衣裙', cat: '连衣裙', type: 'dress', tone: '#e2d6d9',
      price: 569, old: 0, tag: '新品', sub: '内搭针织也好看',
      sizes: ['S', 'M', 'L'], sold: [],
      colors: [['藕粉', '#dcc6c8'], ['雾霾蓝', '#aebcc9'], ['黑', '#2a2827']],
      material: '醋酸纤维 70% / 粘纤 30%', fit: '直筒微收腰', season: '春 / 夏 / 秋', sku: 'KY-2024-D01',
      desc: '一条可以从夏天穿到秋天的裙子：天热单穿，转凉里面加一件薄针织、外面套西装外套。肩带可调节，前胸做了双层处理不走光。缎面的光泽偏哑，不会太张扬。',
      highlights: ['肩带可调节 5cm', '前胸双层，不需要另穿内搭', '哑光缎面，通勤也合适'],
      hint: '模特身高 170cm / 体重 53kg，穿着 M 码。'
    },
    {
      id: 'd02', name: '棉麻衬衫式连衣裙', cat: '连衣裙', type: 'dress', tone: '#e4e0d2',
      price: 389, old: 0, tag: '', sub: '透气不黏身',
      sizes: ['S', 'M', 'L', 'XL'], sold: [],
      colors: [['本白', '#efeadd'], ['浅卡其', '#d6c7ac']],
      material: '棉 55% / 亚麻 45%', fit: '宽松', season: '春 / 夏', sku: 'KY-2024-D02',
      desc: '棉麻的比例调到 55:45，兼顾挺括和柔软，洗两次之后会更贴身。腰间附一根同色腰带，系上是收腰造型，不系就是宽松版型。口袋做在侧缝里，不破坏裙子的线条。',
      highlights: ['棉麻 55:45，透气挺括', '附腰带，一裙两穿', '侧缝隐形口袋'],
      hint: '模特身高 166cm / 体重 52kg，穿着 M 码。'
    },
    {
      id: 'd03', name: '简约小黑裙', cat: '连衣裙', type: 'dress', tone: '#d6d4d6',
      price: 499, old: 0, tag: '经典', sub: '从办公室到晚餐',
      sizes: ['S', 'M', 'L'], sold: [],
      colors: [['黑', '#272524'], ['深蓝', '#2f3a4c']],
      material: '聚酯纤维 65% / 粘纤 32% / 氨纶 3%', fit: '合身', season: '四季', sku: 'KY-2024-D03',
      desc: '一条不会出错的黑裙：圆领不开太低，袖子是修饰手臂的中袖，腰线落在自然腰位。面料有微弹，坐下来不会卡在腰上。配一条细链和平底鞋就能出门。',
      highlights: ['中袖修饰手臂线条', '面料微弹，久坐不勒', '哑光质感，不显廉价'],
      hint: '模特身高 164cm / 体重 50kg，穿着 S 码。'
    },
    {
      id: 'd04', name: '法式波点收腰长裙', cat: '连衣裙', type: 'dress', tone: '#e0dae6',
      price: 479, old: 0, tag: '', sub: '周末与约会',
      sizes: ['S', 'M', 'L'], sold: ['L'],
      colors: [['藏蓝波点', '#39405a'], ['奶油波点', '#e6ddcc']],
      material: '粘纤 78% / 聚酯纤维 22%', fit: '收腰', season: '春 / 夏 / 秋', sku: 'KY-2024-D04',
      desc: '小波点是印在底布上的，不是植绒，洗多少次都不会掉。V 领做了内扣设计，低头也不走光。裙摆用了四片裁，转身的时候会有弧度，但静止时不会显得太蓬。',
      highlights: ['印花波点，水洗不脱落', 'V 领内扣，低头不走光', '四片裁裙摆，动态好看'],
      hint: '模特身高 169cm / 体重 52kg，穿着 M 码。'
    },
    {
      id: 's05', name: '真丝针织开衫', cat: '上装', type: 'knit', tone: '#e9e0d6',
      price: 459, old: 0, tag: '', sub: '空调房里的一件',
      sizes: ['S', 'M', 'L'], sold: [],
      colors: [['米杏', '#e8dbc8'], ['浅蓝', '#c9d5e0'], ['黑', '#282624']],
      material: '桑蚕丝 50% / 棉 50%', fit: '合身', season: '春 / 夏 / 秋', sku: 'KY-2024-S05',
      desc: '丝棉混纺的针织开衫，薄但不透，夏天在空调房里披着刚好。扣子是贝母的，光泽温润。领口和门襟都做了防变形的加固，挂衣架上不会被拉长。',
      highlights: ['丝棉混纺，亲肤透气', '贝母扣，质感温润', '门襟加固，长期穿不变形'],
      hint: '模特身高 165cm / 体重 50kg，穿着 S 码。'
    }
  ];

  var SVGS = {
    shirt: '<path d="M62 44 L104 26 L136 26 L178 44 L196 96 L164 106 L164 216 L76 216 L76 106 L44 96 Z"/><path d="M104 26 L120 52 L136 26" fill="none" stroke-width="3"/><path d="M120 60 V206" fill="none" stroke-width="2.5"/>',
    knit: '<path d="M66 46 L104 28 L136 28 L174 46 L200 110 L176 122 L170 212 L70 212 L64 122 L40 110 Z"/><path d="M98 30 Q120 54 142 30" fill="none" stroke-width="3"/><path d="M80 140 H160" fill="none" stroke-width="2" stroke-dasharray="6 7"/><path d="M80 164 H160" fill="none" stroke-width="2" stroke-dasharray="6 7"/>',
    coat: '<path d="M60 48 L102 28 L138 28 L180 48 L198 118 L176 126 L172 226 L68 226 L64 126 L42 118 Z"/><path d="M102 28 L120 86 L138 28" fill="none" stroke-width="3"/><path d="M120 90 V220" fill="none" stroke-width="2.5"/><path d="M70 136 H170" fill="none" stroke-width="5"/>',
    pants: '<path d="M78 30 H162 L170 120 L158 232 H128 L120 140 L112 232 H82 L70 120 Z"/><path d="M74 54 H166" fill="none" stroke-width="3"/><path d="M120 60 V130" fill="none" stroke-width="2"/>',
    skirt: '<path d="M82 36 H158 L196 210 Q120 226 44 210 Z"/><path d="M78 58 H162" fill="none" stroke-width="3"/><path d="M108 62 L96 212" fill="none" stroke-width="2"/><path d="M132 62 L144 212" fill="none" stroke-width="2"/>',
    dress: '<path d="M74 44 L104 26 L136 26 L166 44 L152 100 L190 220 Q120 236 50 220 L88 100 Z"/><path d="M104 26 Q120 46 136 26" fill="none" stroke-width="3"/><path d="M90 104 H150" fill="none" stroke-width="2.5"/>'
  };

  function garmentSVG(type) {
    var body = SVGS[type] || SVGS.shirt;
    return '<svg viewBox="0 0 240 256" role="img" aria-label="服装示意图">' +
      '<g fill="rgba(255,255,255,.72)" stroke="rgba(70,55,42,.35)" stroke-width="2" stroke-linejoin="round">' +
      body + '</g></svg>';
  }

  function paintArt(scope) {
    var nodes = (scope || document).querySelectorAll('[data-type]');
    for (var i = 0; i < nodes.length; i++) {
      if (!nodes[i].getAttribute('data-painted')) {
        nodes[i].innerHTML = garmentSVG(nodes[i].getAttribute('data-type'));
        nodes[i].setAttribute('data-painted', '1');
      }
    }
  }

  function byId(id) { return PRODUCTS.filter(function (p) { return p.id === id; })[0]; }
  function money(n) { return '¥' + n.toLocaleString('zh-CN'); }

  /* ---------- cart storage ---------- */
  var KEY = 'keyi_cart_v1';
  var memory = null;

  function readCart() {
    try {
      var raw = localStorage.getItem(KEY);
      if (raw === null) {
        var seed = [
          { id: 's01', size: 'M', color: '米白', qty: 1 },
          { id: 'b01', size: 'M', color: '燕麦', qty: 1 }
        ];
        writeCart(seed);
        return seed;
      }
      return JSON.parse(raw) || [];
    } catch (e) {
      if (memory === null) {
        memory = [
          { id: 's01', size: 'M', color: '米白', qty: 1 },
          { id: 'b01', size: 'M', color: '燕麦', qty: 1 }
        ];
      }
      return memory;
    }
  }

  function writeCart(items) {
    memory = items;
    try { localStorage.setItem(KEY, JSON.stringify(items)); } catch (e) { /* 内存模式 */ }
    updateBadge();
  }

  function updateBadge() {
    var items = readCart(), total = 0;
    items.forEach(function (i) { total += i.qty; });
    var els = document.querySelectorAll('#cartCount');
    for (var i = 0; i < els.length; i++) els[i].textContent = total;
  }

  function addToCart(id, size, color, qty) {
    var p = byId(id);
    if (!p) return;
    size = size || p.sizes.filter(function (s) { return p.sold.indexOf(s) < 0; })[0];
    color = color || p.colors[0][0];
    qty = qty || 1;
    var items = readCart(), found = false;
    items.forEach(function (i) {
      if (i.id === id && i.size === size && i.color === color) { i.qty += qty; found = true; }
    });
    if (!found) items.push({ id: id, size: size, color: color, qty: qty });
    writeCart(items);
    toast('已加入购物袋：' + p.name + '（' + color + ' / ' + size + '）');
  }

  /* ---------- toast ---------- */
  var toastTimer;
  function toast(msg) {
    var el = document.getElementById('toast');
    if (!el) return;
    el.textContent = msg;
    el.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { el.classList.remove('show'); }, 2400);
  }

  /* ---------- card markup ---------- */
  function cardHTML(p) {
    var tag = p.tag ? '<span class="tag' + (p.old ? ' tag-sale' : '') + '">' + p.tag + '</span>' : '';
    var priceHTML = money(p.price) + (p.old ? ' <s>' + money(p.old) + '</s>' : '');
    return '<article class="card" data-cat="' + p.cat + '" data-price="' + p.price + '" data-sizes="' + p.sizes.join(',') + '">' +
      '<a class="card-media" href="product.html?id=' + p.id + '">' +
        '<div class="thumb" data-type="' + p.type + '" style="--tone:' + p.tone + '"></div>' + tag +
      '</a>' +
      '<div class="card-body">' +
        '<h3><a href="product.html?id=' + p.id + '">' + p.name + '</a></h3>' +
        '<p class="card-sub">' + p.sub + '</p>' +
        '<p class="card-size">' + p.sizes.join(' / ') + '</p>' +
        '<div class="card-foot"><span class="price">' + priceHTML + '</span>' +
        '<button class="btn btn-mini add-cart" data-id="' + p.id + '">加入购物袋</button></div>' +
      '</div></article>';
  }

  function renderGrid(el, list) {
    el.innerHTML = list.map(cardHTML).join('');
    paintArt(el);
  }

  /* ---------- list page ---------- */
  function initList() {
    var grid = document.getElementById('productGrid');
    if (!grid) return;
    var state = { cat: 'all', price: 'all', size: 'all', sort: 'default' };

    function apply() {
      var list = PRODUCTS.filter(function (p) {
        if (state.cat !== 'all' && p.cat !== state.cat) return false;
        if (state.size !== 'all' && p.sizes.indexOf(state.size) < 0) return false;
        if (state.price !== 'all') {
          var r = state.price.split('-');
          if (p.price < +r[0] || p.price > +r[1]) return false;
        }
        return true;
      });
      if (state.sort === 'asc') list.sort(function (a, b) { return a.price - b.price; });
      if (state.sort === 'desc') list.sort(function (a, b) { return b.price - a.price; });
      if (state.sort === 'new') list = list.slice().reverse();
      renderGrid(grid, list);
      document.getElementById('resultCount').textContent = list.length;
      document.getElementById('emptyFilter').hidden = list.length > 0;
    }

    var groups = document.querySelectorAll('.chips');
    for (var g = 0; g < groups.length; g++) {
      (function (group) {
        group.addEventListener('click', function (e) {
          var btn = e.target.closest('.chip');
          if (!btn) return;
          var sibs = group.querySelectorAll('.chip');
          for (var i = 0; i < sibs.length; i++) sibs[i].classList.remove('active');
          btn.classList.add('active');
          state[group.getAttribute('data-filter')] = btn.getAttribute('data-value');
          apply();
        });
      })(groups[g]);
    }

    var sel = document.getElementById('sortSelect');
    if (sel) sel.addEventListener('change', function () { state.sort = sel.value; apply(); });

    var reset = document.getElementById('resetFilter');
    if (reset) reset.addEventListener('click', function () {
      state = { cat: 'all', price: 'all', size: 'all', sort: 'default' };
      if (sel) sel.value = 'default';
      var chips = document.querySelectorAll('.chip');
      for (var i = 0; i < chips.length; i++) {
        chips[i].classList.toggle('active', chips[i].getAttribute('data-value') === 'all');
      }
      apply();
      toast('已清除筛选条件');
    });

    apply();
  }

  /* ---------- detail page ---------- */
  function initDetail() {
    var title = document.getElementById('pdTitle');
    if (!title) return;
    var params = new URLSearchParams(location.search);
    var p = byId(params.get('id')) || PRODUCTS[0];
    document.title = p.name + ' · ' + money(p.price) + ' | 可衣';

    var chosen = { size: '', color: p.colors[0][0], qty: 1 };

    title.textContent = p.name;
    document.getElementById('pdCrumbName').textContent = p.name;
    document.getElementById('pdCatLink').textContent = p.cat;
    document.getElementById('pdSub').textContent = p.sub + ' · ' + p.material;
    document.getElementById('pdPrice').textContent = money(p.price);
    document.getElementById('pdOld').textContent = p.old ? money(p.old) : '';
    document.getElementById('pdBadge').textContent = (p.tag ? p.tag + ' · ' : '') + '上海仓现货';
    document.getElementById('pdDesc').textContent = p.desc;
    document.getElementById('pdMaterial').textContent = p.material;
    document.getElementById('pdFit').textContent = p.fit;
    document.getElementById('pdSeason').textContent = p.season;
    document.getElementById('pdSku').textContent = p.sku;
    document.getElementById('pdSizeHint').textContent = p.hint;
    document.getElementById('pdHighlights').innerHTML = p.highlights.map(function (h) {
      return '<li>' + h + '</li>';
    }).join('');

    var main = document.getElementById('pdMain');
    main.setAttribute('data-type', p.type);
    main.style.setProperty('--tone', p.tone);
    main.removeAttribute('data-painted');

    var tones = [p.tone, '#efeae2', '#e3ded6', '#ded7cd'];
    document.getElementById('pdThumbs').innerHTML = tones.map(function (t, i) {
      return '<div class="thumb' + (i === 0 ? ' active' : '') + '" data-type="' + p.type + '" style="--tone:' + t + '"></div>';
    }).join('');

    document.getElementById('pdColors').innerHTML = p.colors.map(function (c, i) {
      return '<button class="swatch' + (i === 0 ? ' active' : '') + '" style="background:' + c[1] + '" data-name="' + c[0] + '" title="' + c[0] + '"></button>';
    }).join('');
    document.getElementById('pdColorName').textContent = p.colors[0][0];

    document.getElementById('pdSizes').innerHTML = p.sizes.map(function (s) {
      var out = p.sold.indexOf(s) >= 0;
      return '<button class="size-btn' + (out ? ' sold' : '') + '" data-size="' + s + '"' + (out ? ' disabled' : '') + '>' + s + '</button>';
    }).join('');

    var rows = [['尺码', '肩宽', '胸围', '腰围', '衣长 / 裙长']];
    var base = { 'S': 0, 'M': 1, 'L': 2, 'XL': 3 };
    p.sizes.forEach(function (s) {
      var k = base[s];
      rows.push([s, (37 + k * 1.5) + 'cm', (88 + k * 4) + 'cm', (78 + k * 4) + 'cm', (62 + k * 2) + 'cm']);
    });
    document.getElementById('sizeTable').innerHTML = rows.map(function (r, i) {
      var cell = i === 0 ? 'th' : 'td';
      return '<tr>' + r.map(function (c) { return '<' + cell + '>' + c + '</' + cell + '>'; }).join('') + '</tr>';
    }).join('');

    paintArt(document);

    document.getElementById('pdColors').addEventListener('click', function (e) {
      var b = e.target.closest('.swatch'); if (!b) return;
      this.querySelectorAll('.swatch').forEach(function (s) { s.classList.remove('active'); });
      b.classList.add('active');
      chosen.color = b.getAttribute('data-name');
      document.getElementById('pdColorName').textContent = chosen.color;
    });

    document.getElementById('pdSizes').addEventListener('click', function (e) {
      var b = e.target.closest('.size-btn'); if (!b || b.disabled) return;
      this.querySelectorAll('.size-btn').forEach(function (s) { s.classList.remove('active'); });
      b.classList.add('active');
      chosen.size = b.getAttribute('data-size');
    });

    var qtyInput = document.getElementById('qtyInput');
    document.getElementById('qtyMinus').addEventListener('click', function () {
      if (chosen.qty > 1) { chosen.qty--; qtyInput.value = chosen.qty; }
    });
    document.getElementById('qtyPlus').addEventListener('click', function () {
      if (chosen.qty < 9) { chosen.qty++; qtyInput.value = chosen.qty; }
      else toast('单款单次最多购买 9 件，如需更多请联系客服');
    });

    function ensureSize() {
      if (!chosen.size) { toast('请先选择尺码'); return false; }
      return true;
    }
    document.getElementById('addToCart').addEventListener('click', function () {
      if (ensureSize()) addToCart(p.id, chosen.size, chosen.color, chosen.qty);
    });
    document.getElementById('buyNow').addEventListener('click', function () {
      if (ensureSize()) { addToCart(p.id, chosen.size, chosen.color, chosen.qty); location.href = 'cart.html'; }
    });
    document.getElementById('favBtn').addEventListener('click', function () {
      toast('已收藏，可在“我的收藏”中查看');
    });

    var tabs = document.querySelectorAll('.tab');
    for (var i = 0; i < tabs.length; i++) {
      tabs[i].addEventListener('click', function () {
        document.querySelectorAll('.tab').forEach(function (t) { t.classList.remove('active'); });
        document.querySelectorAll('.tab-panel').forEach(function (t) { t.classList.remove('active'); });
        this.classList.add('active');
        document.getElementById('tab-' + this.getAttribute('data-tab')).classList.add('active');
      });
    }

    var related = PRODUCTS.filter(function (x) { return x.cat === p.cat && x.id !== p.id; });
    PRODUCTS.forEach(function (x) {
      if (related.length < 4 && x.id !== p.id && related.indexOf(x) < 0) related.push(x);
    });
    renderGrid(document.getElementById('relatedGrid'), related.slice(0, 4));
  }

  /* ---------- cart page ---------- */
  function initCart() {
    var box = document.getElementById('cartItems');
    if (!box) return;
    var coupon = null;

    function render() {
      var items = readCart();
      document.getElementById('cartEmpty').hidden = items.length > 0;
      box.innerHTML = items.map(function (i, idx) {
        var p = byId(i.id);
        if (!p) return '';
        return '<div class="cart-row" data-idx="' + idx + '">' +
          '<div class="cart-goods">' +
            '<a class="thumb" data-type="' + p.type + '" style="--tone:' + p.tone + '" href="product.html?id=' + p.id + '"></a>' +
            '<div><h4><a href="product.html?id=' + p.id + '">' + p.name + '</a></h4>' +
            '<p>' + i.color + ' / ' + i.size + '</p><p>' + p.material + '</p></div>' +
          '</div>' +
          '<div>' + money(p.price) + '</div>' +
          '<div><div class="stepper"><button type="button" data-act="minus">−</button>' +
            '<input type="text" value="' + i.qty + '" readonly aria-label="数量">' +
            '<button type="button" data-act="plus">+</button></div></div>' +
          '<div class="cart-sub">' + money(p.price * i.qty) + '</div>' +
          '<div><button class="cart-del" data-act="del">删除</button></div>' +
        '</div>';
      }).join('');
      paintArt(box);

      var goods = 0;
      items.forEach(function (i) { var p = byId(i.id); if (p) goods += p.price * i.qty; });
      var ship = (goods === 0 || goods >= 399) ? 0 : 12;
      var discount = 0;
      if (coupon === 'KEYI50' && goods >= 399) discount = 50;
      if (coupon === 'WELCOME20' && goods > 0) discount = 20;

      document.getElementById('sumGoods').textContent = money(goods);
      document.getElementById('sumShip').textContent = ship === 0 ? '免运费' : money(ship);
      document.getElementById('discountRow').hidden = discount === 0;
      document.getElementById('sumDiscount').textContent = '−' + money(discount);
      document.getElementById('sumTotal').textContent = money(Math.max(goods + ship - discount, 0));

      var pct = Math.min(goods / 399 * 100, 100);
      document.getElementById('freeBar').style.width = pct + '%';
      document.getElementById('freeText').textContent = goods >= 399
        ? '已享全国包邮，上海仓当日发出'
        : '再购 ' + money(399 - goods) + ' 即可免运费';
    }

    box.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-act]');
      if (!btn) return;
      var row = btn.closest('.cart-row');
      var idx = +row.getAttribute('data-idx');
      var items = readCart();
      var act = btn.getAttribute('data-act');
      if (act === 'plus') items[idx].qty = Math.min(items[idx].qty + 1, 9);
      if (act === 'minus') items[idx].qty = Math.max(items[idx].qty - 1, 1);
      if (act === 'del') { items.splice(idx, 1); toast('已从购物袋移除'); }
      writeCart(items);
      render();
    });

    document.getElementById('clearCart').addEventListener('click', function () {
      writeCart([]);
      render();
      toast('购物袋已清空');
    });

    document.getElementById('couponBtn').addEventListener('click', function () {
      var code = (document.getElementById('couponInput').value || '').trim().toUpperCase();
      var items = readCart(), goods = 0;
      items.forEach(function (i) { var p = byId(i.id); if (p) goods += p.price * i.qty; });
      if (code === 'KEYI50') {
        if (goods < 399) { toast('该优惠码需满 399 元使用'); return; }
        coupon = code; toast('优惠码已使用，立减 ¥50');
      } else if (code === 'WELCOME20') {
        coupon = code; toast('新客优惠码已使用，立减 ¥20');
      } else {
        coupon = null; toast('优惠码无效或已过期');
      }
      render();
    });

    document.getElementById('checkoutBtn').addEventListener('click', function () {
      var items = readCart();
      if (!items.length) { toast('购物袋是空的，先去挑几件吧'); return; }
      toast('正在前往收货信息页面，请稍候…');
    });

    render();
    renderGrid(document.getElementById('alsoGrid'), [byId('s04'), byId('b03'), byId('o01'), byId('s02')]);
  }

  /* ---------- global ---------- */
  document.addEventListener('click', function (e) {
    var btn = e.target.closest('.add-cart');
    if (!btn) return;
    e.preventDefault();
    addToCart(btn.getAttribute('data-id'));
  });

  document.addEventListener('DOMContentLoaded', function () {
    paintArt(document);
    updateBadge();
    initList();
    initDetail();
    initCart();
  });

  global.keyi = { toast: toast, addToCart: addToCart, products: PRODUCTS };
})(window);
