(() => {
  const siteRoot = location.pathname.match(/^\/s\/[a-f0-9]{8}/)?.[0];
  if (!siteRoot) return;
  const report = () => parent.postMessage({ kind: 'study:page', page: location.pathname + location.search + location.hash, x: scrollX, y: scrollY, brokenImages: [...document.images].filter(image => image.complete && image.naturalWidth === 0).length }, location.origin);
  addEventListener('load', report);
  addEventListener('hashchange', report);
  let timer;
  addEventListener('scroll', () => { clearTimeout(timer); timer = setTimeout(report, 150); }, { passive: true });
  document.addEventListener('click', event => {
    const link = event.target.closest?.('a');
    if (!link) return;
    const url = new URL(link.href, location.href);
    if (url.origin !== location.origin || !(url.pathname === siteRoot || url.pathname.startsWith(siteRoot + '/'))) { event.preventDefault(); return; }
    link.target = '_self';
  }, true);
  document.addEventListener('submit', event => event.preventDefault(), true);
  addEventListener('message', event => {
    if (event.source !== parent || event.origin !== location.origin || event.data?.kind !== 'study:scroll') return;
    scrollTo(Number(event.data.x) || 0, Number(event.data.y) || 0);
  });
  if (document.readyState === 'complete') report();

  // Sites whose model drew image placeholders without photos list added photos in photos.json, matched by
  // selector plus the card text next to the placeholder (or its position), so the model's own HTML stays untouched.
  const page = location.pathname.slice(siteRoot.length + 1) || 'index.html';
  fetch(siteRoot + '/photos.json').then(response => response.ok ? response.json() : null).then(data => {
    const rules = (data?.photos ?? []).filter(rule => rule.page === page);
    if (!rules.length) return;
    const nearbyText = element => {
      let card = element.parentElement;
      for (let depth = 0; depth < 4 && card && card !== document.body; depth++, card = card.parentElement) {
        const text = (card.innerText || '').replace(element.innerText || '', '').replace(/\s+/g, ' ');
        if (text.trim().length > 6) return text;
      }
      return '';
    };
    const apply = () => {
      for (const selector of new Set(rules.map(rule => rule.selector))) {
        const own = rules.filter(rule => rule.selector === selector);
        document.querySelectorAll(selector).forEach((element, index) => {
          const text = own.some(rule => rule.match) ? nearbyText(element) : '';
          const rule = own.find(rule => rule.match && text.includes(rule.match)) ?? own.find(rule => !rule.match && rule.index === index);
          if (!rule || element.dataset.studyPhoto === rule.url) return;
          element.dataset.studyPhoto = rule.url;
          element.style.backgroundImage = `url("${siteRoot}/${rule.url}")`;
          element.style.backgroundSize = 'cover';
          element.style.backgroundPosition = 'center';
          element.style.backgroundRepeat = 'no-repeat';
          // The placeholder's own emoji or label text goes; child elements such as promo badges and captions stay.
          if (rule.hideText) element.childNodes.forEach(node => { if (node.nodeType === Node.TEXT_NODE) node.textContent = ''; });
          for (const child of element.children) {
            const childText = child.textContent.trim();
            if (childText && !/[\p{L}\p{N}]/u.test(childText)) child.style.display = 'none';
          }
          // Labels drawn with CSS ::before/::after text ("餐厅环境示意") are placeholder labels too.
          for (const pseudo of ['::before', '::after']) {
            const content = getComputedStyle(element, pseudo).content;
            if (/^["'].*\S.*["']$/.test(content)) element.dataset[pseudo === '::before' ? 'studyNoBefore' : 'studyNoAfter'] = '';
          }
        });
      }
    };
    const style = document.createElement('style');
    style.textContent = '[data-study-no-before]::before,[data-study-no-after]::after{content:none!important}';
    document.head.appendChild(style);
    apply();
    let pending;
    new MutationObserver(() => { clearTimeout(pending); pending = setTimeout(apply, 50); }).observe(document.body, { childList: true, subtree: true });
  }).catch(() => {});
})();
