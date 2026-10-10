(() => {
  const cards = Array.from(document.querySelectorAll('[data-video-card][data-bvid]'));
  if (!cards.length) return;

  const cleanCoverUrl = (url) => {
    if (!url) return '';
    return url.startsWith('//') ? `https:${url}` : url;
  };

  let localMetadata = {};
  const localMetadataReady = fetch('assets/bilibili-video-metadata.json', { cache: 'no-cache' })
    .then(response => response.ok ? response.json() : null)
    .then(json => json && json.items ? json.items : {})
    .catch(() => ({}));

  function jsonpLookup(bvid, timeoutMs = 3000) {
    return new Promise((resolve, reject) => {
      const callback = `__lingnanBili_${bvid}_${Math.random().toString(36).slice(2)}`;
      const script = document.createElement('script');
      let settled = false;
      const timer = setTimeout(() => finish(new Error('Bilibili metadata timeout')), timeoutMs);
      function finish(error, value) {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        try { delete window[callback]; } catch (_) { window[callback] = undefined; }
        script.remove();
        error ? reject(error) : resolve(value);
      }
      window[callback] = (value) => finish(null, value);
      script.onerror = () => finish(new Error('Bilibili JSONP unavailable'));
      script.src = `https://api.bilibili.com/x/web-interface/view?bvid=${encodeURIComponent(bvid)}&jsonp=jsonp&callback=${encodeURIComponent(callback)}`;
      document.head.appendChild(script);
    });
  }

  async function requestMetadata(bvid) {
    if (!Object.keys(localMetadata).length) localMetadata = await localMetadataReady;
    if (localMetadata[bvid]) return localMetadata[bvid];
    const url = `https://api.bilibili.com/x/web-interface/view?bvid=${encodeURIComponent(bvid)}`;
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 2500);
      try {
        const response = await fetch(url, { mode: 'cors', credentials: 'omit', signal: controller.signal, cache: 'force-cache' });
        if (!response.ok) throw new Error('Bilibili API response not OK');
        const json = await response.json();
        if (json && json.code === 0 && json.data) return json.data;
        throw new Error('Bilibili API did not provide video data');
      } finally { clearTimeout(timeout); }
    } catch (_) {
      const json = await jsonpLookup(bvid);
      if (json && json.code === 0 && json.data) return json.data;
      throw new Error('Bilibili metadata unavailable');
    }
  }

  function durationLabel(seconds) {
    if (!Number.isFinite(seconds) || seconds < 0) return '';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  }

  function dateLabel(unixSeconds) {
    if (!Number.isFinite(unixSeconds) || unixSeconds <= 0) return '';
    const d = new Date(unixSeconds * 1000);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}.${m}.${day}`;
  }

  function setStatus(card, status, isError = false) {
    const node = card.querySelector('[data-video-meta-status]');
    if (!node) return;
    node.textContent = status;
    node.classList.toggle('is-error', isError);
  }

  function applyMetadata(card, data) {
    const bvid = card.dataset.bvid;
    const titleNode = card.querySelector('[data-video-title]');
    const descriptionNode = card.querySelector('[data-video-description]');
    const cover = card.querySelector('[data-video-cover]');
    const label = card.querySelector('[data-video-category-label]');
    if (titleNode && data.title) titleNode.textContent = data.title;
    if (descriptionNode) {
      const parts = [];
      const date = dateLabel(data.pubdate);
      const duration = durationLabel(data.duration);
      if (date) parts.push(`投稿日期：${date}`);
      if (duration) parts.push(`时长：${duration}`);
      if (data.owner && typeof data.owner === 'object' && data.owner.name) parts.push(`UP主：${data.owner.name}`);
      if (typeof data.stat?.view === 'number') parts.push(`播放：${data.stat.view.toLocaleString('zh-CN')}`);
      if (typeof data.stat?.like === 'number' && data.stat.like > 0) parts.push(`点赞：${data.stat.like.toLocaleString('zh-CN')}`);
      descriptionNode.textContent = parts.length ? parts.join(' · ') : (card.dataset.fallbackDescription || '点击查看 B 站原视频。');
    }
    if (cover && (data.localCover || data.pic)) {
      const actual = data.localCover || cleanCoverUrl(data.pic);
      cover.onerror = () => {
        cover.onerror = null;
        cover.src = cover.dataset.fallbackCover;
      };
      cover.src = actual;
      cover.alt = `${data.title || bvid} · B 站官方封面`;
    }
    if (label) label.textContent = 'B站投稿';
    if (titleNode) titleNode.title = data.title || bvid;
    card.dataset.videoSearchText = `${data.title || ''} ${bvid}`.toLocaleLowerCase('zh-CN');
    const published = dateLabel(data.pubdate);
    setStatus(card, `${published ? `${published} · ` : ''}已读取 B 站公开信息`);
  }

  function installPlayer(card) {
    const bvid = card.dataset.bvid;
    const frame = card.querySelector('[data-video-cover-frame]');
    if (!frame || frame.dataset.loaded === 'true') return;
    frame.dataset.loaded = 'true';
    const iframe = document.createElement('iframe');
    iframe.src = `https://player.bilibili.com/player.html?bvid=${encodeURIComponent(bvid)}&page=1&high_quality=1&danmaku=0`;
    iframe.title = `${card.querySelector('[data-video-title]')?.textContent || bvid} — B站官方播放器`;
    iframe.loading = 'lazy';
    iframe.allowFullscreen = true;
    iframe.referrerPolicy = 'origin';
    iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
    const fallbackLink = document.createElement('a');
    fallbackLink.className = 'video-source-overlay';
    fallbackLink.href = `https://www.bilibili.com/video/${encodeURIComponent(bvid)}/`;
    fallbackLink.target = '_blank';
    fallbackLink.rel = 'noopener noreferrer';
    fallbackLink.textContent = '播放器无法显示？前往 B 站观看 ↗';
    const playerShell = document.createElement('div');
    playerShell.className = 'video-player-frame';
    playerShell.append(iframe, fallbackLink);
    iframe.addEventListener('error', () => setStatus(card, '本站播放器加载失败；请点击画面中的链接前往 B 站观看。', true));
    frame.replaceChildren(playerShell);
    setStatus(card, '已请求 B 站官方播放器；若画面空白，请点击播放器右下角链接。');
  }

  cards.forEach(card => {
    card.querySelectorAll('[data-video-play]').forEach(button => {
      button.addEventListener('click', () => installPlayer(card));
    });
    const cover = card.querySelector('[data-video-cover]');
    if (cover) {
      cover.addEventListener('error', () => {
        if (cover.dataset.fallbackCover && cover.src !== new URL(cover.dataset.fallbackCover, document.baseURI).href) {
          cover.src = cover.dataset.fallbackCover;
        }
      }, { once: true });
    }
    const searchText = `${card.dataset.bvid} ${card.dataset.fallbackTitle || ''}`.toLocaleLowerCase('zh-CN');
    card.dataset.videoSearchText = searchText;
  });

  const loading = new WeakSet();
  async function loadCardMetadata(card) {
    if (loading.has(card) || card.dataset.videoMetaLoaded === 'true') return;
    loading.add(card);
    try {
      const data = await requestMetadata(card.dataset.bvid);
      applyMetadata(card, data);
      card.dataset.videoMetaLoaded = 'true';
    } catch (_) {
      const bvid = card.dataset.bvid;
      const fallbackTitle = card.dataset.fallbackTitle || `B站投稿 · ${bvid}`;
      const titleNode = card.querySelector('[data-video-title]');
      const descriptionNode = card.querySelector('[data-video-description]');
      if (titleNode && !titleNode.textContent.trim()) titleNode.textContent = fallbackTitle;
      if (descriptionNode && !descriptionNode.textContent.trim()) descriptionNode.textContent = card.dataset.fallbackDescription || '标题与封面接口暂不可用；可打开 B 站原页面查看完整内容。';
      setStatus(card, '暂未取得缓存的 B 站元数据；请检查仓库 Actions 中的 Refresh Bilibili video covers 任务，或打开原视频查看。', true);
      card.dataset.videoMetaLoaded = 'true';
    }
  }

  // Metadata requests are lazy-loaded as cards approach the viewport, avoiding a burst of 44 requests.
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          observer.unobserve(entry.target);
          loadCardMetadata(entry.target);
        }
      });
    }, { rootMargin: '300px 0px' });
    cards.forEach(card => observer.observe(card));
  } else {
    cards.slice(0, 6).forEach(card => loadCardMetadata(card));
  }

  const search = document.getElementById('video-search-input');
  if (search) {
    search.addEventListener('input', () => {
      const query = search.value.trim().toLocaleLowerCase('zh-CN');
      cards.forEach(card => {
        const text = `${card.dataset.videoSearchText || ''} ${card.querySelector('[data-video-title]')?.textContent || ''}`.toLocaleLowerCase('zh-CN');
        card.hidden = query !== '' && !text.includes(query);
      });
    });
  }
})();
