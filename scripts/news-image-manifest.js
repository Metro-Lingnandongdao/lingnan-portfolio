(function () {
  'use strict';
  const manifestUrl = 'assets/news-source-images/manifest.json';
  const defaultTag = {
    verified: '原文配图',
    'source-image-found': '原文配图',
    'related-reference': '相关参考图（非现场）',
    'site-illustration': '主题示意图 · 非实拍',
    'source-link-only': '主题示意图 · 非实拍',
    'no-article-image': '主题示意图 · 非实拍'
  };

  function localFallback(media, img, card, entry, failed) {
    const fallback = entry.fallbackImage || img?.dataset.fallbackSrc || media.dataset.fallbackSrc;
    if (img && fallback) {
      img.onerror = null;
      img.src = fallback;
      img.dataset.fallbackApplied = 'true';
      img.alt = `${(card.querySelector('h2')?.textContent || '铁路资讯').trim()}主题示意图（非实拍）`;
    }
    media.classList.add('news-card-image-source');
    const badge = media.querySelector('.news-image-open') || document.createElement('span');
    badge.className = 'news-image-open';
    badge.textContent = '主题示意图 · 非实拍';
    if (!badge.isConnected) media.append(badge);
    updateCredit(card, entry, true, failed);
  }

  function updateCredit(card, entry, usingFallback, failureMessage) {
    const credit = card.querySelector('.image-credit');
    if (!credit) return;
    credit.textContent = '';
    const status = usingFallback ? 'site-illustration' : (entry.status || 'source-link-only');
    let prefix = '原文配图｜';
    if (status === 'related-reference') prefix = '相关参考图（非此篇报道现场）｜';
    else if (status === 'site-illustration' || status === 'source-link-only' || status === 'no-article-image') prefix = '主题示意图（非实拍）｜';
    credit.append(document.createTextNode(prefix));
    const source = entry.imageSourcePage || entry.page || entry.sourcePage;
    if (source && /^https?:\/\//i.test(source) && status !== 'site-illustration') {
      const a = document.createElement('a');
      a.href = source; a.target = '_blank'; a.rel = 'noopener noreferrer';
      a.textContent = (entry.imageCredit || (status === 'related-reference' ? '相关图片来源' : '对应新闻原文')) + ' ↗';
      credit.append(a);
      credit.append(document.createTextNode('。'));
    } else {
      credit.append(document.createTextNode((entry.imageCredit || '嶺南東道制作') + '。'));
    }
    if (usingFallback) {
      credit.append(document.createTextNode(failureMessage ? `外部图片暂时无法加载，已切换为本站示意图。${failureMessage}` : '图片为本站制作的非实拍示意图。'));
    } else if (entry.note) {
      credit.append(document.createTextNode(entry.note));
    } else if (status === 'related-reference') {
      credit.append(document.createTextNode('相关参考照片，不代表本篇报道现场。'));
    } else if (status === 'site-illustration') {
      credit.append(document.createTextNode('本站制作的非实拍主题图。'));
    } else {
      credit.append(document.createTextNode('图片说明与许可请以原文为准。'));
    }
  }

  function renderCard(card, entry) {
    const media = card.querySelector('.news-card-image[data-news-image-id]');
    if (!media) return;
    entry = entry || {};
    const sourceUrl = entry.sourcePage || media.dataset.articleUrl || media.href;
    media.href = sourceUrl;
    const fallback = entry.fallbackImage || media.dataset.fallbackSrc || `assets/news-reference-fallbacks/${card.id}.svg`;
    media.dataset.fallbackSrc = fallback;
    let img = media.querySelector('img');
    if (!img) {
      img = document.createElement('img');
      img.loading = 'lazy'; img.decoding = 'async'; img.referrerPolicy = 'no-referrer';
      img.dataset.fallbackSrc = fallback;
      media.prepend(img);
    }
    img.dataset.fallbackSrc = fallback;
    const imageUrl = entry.imageUrl || entry.url || fallback;
    const status = entry.status || 'site-illustration';
    const isLocal = !/^https?:\/\//i.test(imageUrl);
    if (isLocal || status === 'site-illustration') {
      img.onerror = null;
      img.src = imageUrl || fallback;
      img.alt = entry.alt || `${(card.querySelector('h2')?.textContent || '铁路资讯').trim()}主题示意图（非实拍）`;
      img.dataset.fallbackApplied = 'true';
      const badge = media.querySelector('.news-image-open') || document.createElement('span');
      badge.className = 'news-image-open'; badge.textContent = defaultTag[status] || '主题示意图 · 非实拍';
      if (!badge.isConnected) media.append(badge);
      updateCredit(card, entry, status === 'site-illustration' || isLocal);
      return;
    }
    img.dataset.fallbackApplied = 'false';
    img.alt = entry.alt || (card.querySelector('h2')?.textContent || '新闻配图').trim();
    img.loading = 'lazy'; img.decoding = 'async'; img.referrerPolicy = 'no-referrer';
    img.onerror = function () {
      if (img.dataset.fallbackApplied === 'true') return;
      localFallback(media, img, card, entry, '建议打开原文查看原始图片。');
    };
    img.src = imageUrl;
    const badge = media.querySelector('.news-image-open') || document.createElement('span');
    badge.className = 'news-image-open'; badge.textContent = defaultTag[status] || '图片来源 ↗';
    if (!badge.isConnected) media.append(badge);
    updateCredit(card, entry, false);
  }

  function init() {
    const cards = document.querySelectorAll('.news-card[id]');
    if (!cards.length) return;
    fetch(manifestUrl, { cache: 'no-cache' })
      .then((response) => { if (!response.ok) throw new Error('manifest unavailable'); return response.json(); })
      .then((manifest) => {
        cards.forEach((card) => renderCard(card, manifest.cards && manifest.cards[card.id] ? manifest.cards[card.id] : {}));
      })
      .catch(() => {
        cards.forEach((card) => {
          const media = card.querySelector('.news-card-image[data-news-image-id]');
          if (!media) return;
          const img = media.querySelector('img');
          if (img) img.addEventListener('error', () => localFallback(media, img, card, {fallbackImage: img.dataset.fallbackSrc}, '图片清单暂时无法读取。'), {once:true});
        });
      });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, {once:true});
  else init();
})();
