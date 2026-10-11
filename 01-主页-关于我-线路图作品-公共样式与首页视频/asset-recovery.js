(() => {
  const escape = s => String(s || '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function fallbackData(label, sub='IMAGE FALLBACK') {
    const title = escape((label || '轨道交通图片').trim().slice(0,42));
    const subtitle = escape(sub);
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="900" height="520" viewBox="0 0 900 520"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#102b3a"/><stop offset="1" stop-color="#168f86"/></linearGradient></defs><rect width="900" height="520" fill="url(#g)"/><g fill="none" stroke="#b4e2dc" stroke-width="5" opacity=".65"><path d="M40 430H300Q350 430 350 380V240Q350 190 400 190H855"/><path d="M80 480V345Q80 300 125 300H250"/><path d="M600 40V120Q600 165 645 165H850"/></g><g fill="#eaf6f2" stroke="#102b3a" stroke-width="5"><circle cx="300" cy="430" r="10"/><circle cx="350" cy="380" r="10"/><circle cx="350" cy="240" r="10"/><circle cx="600" cy="120" r="10"/></g><g transform="translate(180 220)"><path d="M0 72Q6 20 54 20H440Q475 20 495 63L510 110V147H0Z" fill="#eaf4f1" stroke="#102b3a" stroke-width="7"/><path d="M52 34H430Q453 34 472 66H39Z" fill="#96c9d0"/><path d="M20 85H490V118H20Z" fill="#248b9a"/><path d="M90 36V83M160 36V83M230 36V83M300 36V83M370 36V83M440 44V83" stroke="#102b3a" stroke-width="5"/><circle cx="62" cy="126" r="8" fill="#65c6b4"/><circle cx="452" cy="126" r="8" fill="#65c6b4"/></g><text x="35" y="48" fill="#65c6b4" font-family="Arial,sans-serif" font-size="12" letter-spacing="3">LING NAN DONG DAO · ${subtitle}</text><text x="35" y="493" fill="#f8fbfa" font-family="Arial,sans-serif" font-size="27" font-weight="700">${title}</text><text x="865" y="493" fill="#c9e7e4" text-anchor="end" font-family="Arial,sans-serif" font-size="12">若需原图，请打开图片来源</text></svg>`;
    return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  }
  const rootPrefix = '/lingnan-portfolio/';
  function candidatePaths(src) {
    if (!src || /^(data:|blob:|https?:|\/\/|#)/i.test(src)) return [];
    const clean = src.replace(/^\.\//,'').replace(/^\//,'');
    const list = [src, './'+clean, rootPrefix+clean, rootPrefix+'lingnan_edit/'+clean, '../'+clean];
    return [...new Set(list)];
  }
  function fix(img) {
    if (!img || img.dataset.imageRecoveryDone === 'true' || img.dataset.imageRecoveryBusy === 'true') return;
    if (img.complete && img.naturalWidth > 0) { img.dataset.imageRecoveryDone='true'; return; }
    img.dataset.imageRecoveryBusy='true';
    const originals = [img.getAttribute('src'), img.getAttribute('data-fallback-src'), img.getAttribute('data-fallback-cover')].filter(Boolean);
    const candidates = [];
    for (const src of originals) for (const candidate of candidatePaths(src)) if (!candidates.includes(candidate)) candidates.push(candidate);
    const current = img.getAttribute('src');
    let idx = candidates.indexOf(current);
    if (idx < 0) idx = -1;
    function tryNext() {
      idx += 1;
      while (idx < candidates.length && candidates[idx] === img.getAttribute('src')) idx++;
      if (idx < candidates.length) { img.src = candidates[idx]; return; }
      img.onerror = null;
      img.src = fallbackData(img.alt || img.getAttribute('aria-label') || '轨道交通图片', 'LOCAL FALLBACK / SOURCE UNAVAILABLE');
      img.dataset.imageRecoveryDone='true';
      img.dataset.imageRecoveryBusy='false';
    }
    img.onerror = tryNext;
    // if the initial image had already failed before this script was loaded, begin with the first alternate.
    tryNext();
    img.addEventListener('load', () => { if (img.naturalWidth > 0) { img.dataset.imageRecoveryDone='true'; img.dataset.imageRecoveryBusy='false'; } }, {once:true});
  }
  function scan(root=document) {
    root.querySelectorAll?.('img').forEach(img => {
      if (img.dataset.imageRecoveryHooked === 'true') return;
      img.dataset.imageRecoveryHooked = 'true';
      img.addEventListener('error', () => fix(img));
      if (img.complete && img.naturalWidth === 0) fix(img);
    });
  }
  scan();
  new MutationObserver(records => records.forEach(record => record.addedNodes.forEach(node => { if (node.nodeType===1) { if (node.matches?.('img')) scan(node.parentNode || document); else scan(node); } }))).observe(document.documentElement,{subtree:true,childList:true});
  // Use a bundled SVG for the news hero so the lead visual is never dependent on a third-party image host.
  const hero = document.querySelector('.news-hero-image');
  if (hero) hero.style.backgroundImage = "linear-gradient(0deg,rgba(9,20,31,.28),rgba(9,20,31,.02)),url('assets/news-covers/railway.svg')";
})();