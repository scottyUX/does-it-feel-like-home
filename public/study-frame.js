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
})();
