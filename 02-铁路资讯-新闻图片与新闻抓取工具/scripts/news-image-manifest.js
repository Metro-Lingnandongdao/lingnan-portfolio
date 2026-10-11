(function () {
  'use strict';
  const manifestUrl = 'assets/news-source-images/manifest.json';

  function makePlaceholder(articleUrl, hasArticleImage) {
    const box = document.createElement('div');
    box.className = 'source-image-placeholder';
    const label = document.createElement('span');
    label.className = 'source-image-overline';
    label.textContent = hasArticleImage ? 'ORIGINAL NEWS SOURCE' : 'SOURCE ARTICLE';
    const title = document.createElement('strong');
    title.textContent = hasArticleImage ? '查看原文配图' : '原文以文字／数据为主';
    const p = document.createElement('p');
    p.textContent = hasArticleImage
      ? '暂未取得可直接展示的原文图片链接。为避免图文错配，请从原文查看现场图片。'
      : '当前未识别到可直接引用的新闻正文图片，因此不使用无关照片代替。';
    const cta = document.createElement('span');
    cta.className = 'source-image-cta';
    cta.textContent = '打开原文 ↗';
    box.append(label, title, p, cta);
    return box;
  }

  function updateCredit(card, sourceUrl, imageUrl) {
    const credit = card.querySelector('.image-credit');
    if (!credit) return;
    credit.textContent = '';
    credit.append(document.createTextNode('原文配图｜来源：'));
    const a = document.createElement('a');
    a.href = sourceUrl;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    let host = '对应新闻原文';
    try { host = new URL(imageUrl).hostname; } catch (_) {}
    a.textContent = host + ' ↗';
    credit.append(a, document.createTextNode('。请在原文查看完整图片说明、署名和授权信息。'));
  }

  function renderCard(card, entry) {
    const media = card.querySelector('.news-card-image[data-news-image-id]');
    if (!media) return;
    const sourceUrl = entry.sourcePage || media.dataset.articleUrl || media.href;
    media.href = sourceUrl;
    const currentImg = media.querySelector('img');
    const placeholder = media.querySelector('.source-image-placeholder');
    if (entry.imageUrl && /^https?:\/\//i.test(entry.imageUrl)) {
      const img = currentImg || document.createElement('img');
      img.src = entry.imageUrl;
      img.alt = entry.alt || (card.querySelector('h2')?.textContent || '新闻原文配图').trim();
      img.loading = 'lazy';
      img.decoding = 'async';
      img.referrerPolicy = 'no-referrer';
      img.onerror = function () {
        img.remove();
        media.classList.add('news-card-image-source');
        const note = makePlaceholder(sourceUrl, true);
        const existing = media.querySelector('.source-image-placeholder');
        if (existing) existing.replaceWith(note); else media.append(note);
      };
      if (!img.isConnected) media.prepend(img);
      if (placeholder) placeholder.remove();
      const badge = media.querySelector('.news-image-open') || document.createElement('span');
      badge.className = 'news-image-open';
      badge.textContent = '原文配图 ↗';
      if (!badge.isConnected) media.append(badge);
      media.dataset.imageInitialState = 'source-image-found';
      updateCredit(card, sourceUrl, entry.imageUrl);
    } else {
      if (currentImg) currentImg.remove();
      if (!media.querySelector('.source-image-placeholder')) {
        media.append(makePlaceholder(sourceUrl, entry.status !== 'no-article-image'));
      }
      const credit = card.querySelector('.image-credit');
      if (credit && entry.status === 'no-article-image') {
        credit.textContent = '原文配图：未识别到独立新闻图片；为避免图文错配，此卡不使用通用示意图。';
      } else if (credit) {
        credit.textContent = '原文配图：尚未取得可直接显示的图片地址；请点击图片区域查看原文。';
      }
    }
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
          if (img) {
            img.addEventListener('error', () => {
              img.remove();
              if (!media.querySelector('.source-image-placeholder')) media.append(makePlaceholder(media.href, true));
            }, { once: true });
          }
        });
      });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
