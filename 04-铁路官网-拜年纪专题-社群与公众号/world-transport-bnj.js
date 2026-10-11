(() => {
  const MANIFEST_URL = 'assets/world-transport-bnj-data.json';
  const DEFAULT_COVER = 'assets/world-transport-bnj-cover.svg';
  const DEFAULT_AVATAR = 'assets/world-transport-bnj-avatar.svg';
  const esc = (value) => String(value ?? '').replace(/[&<>"']/g, (ch) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const safeAsset = (value, fallback) => {
    if (typeof value !== 'string' || !value.trim()) return fallback;
    if (/^https?:\/\//i.test(value) || value.startsWith('data:')) return value;
    return value.replace(/^\.\//, '');
  };
  const byId = (id) => document.getElementById(id);
  const grid = byId('bnj-video-grid');
  const search = byId('bnj-video-search');
  let allVideos = [];

  function formatDate(value) {
    if (!value) return '';
    const seconds = Number(value);
    if (!Number.isFinite(seconds) || seconds <= 0) return String(value);
    const d = new Date(seconds * 1000);
    if (Number.isNaN(d.getTime())) return '';
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  }

  function coverFor(item) {
    return safeAsset(item.localCover || item.faceLocal || item.pic, DEFAULT_COVER);
  }

  function cardMarkup(item) {
    const bvid = String(item.bvid || '').trim();
    const url = item.url && /^https:\/\/(www\.)?bilibili\.com\//.test(item.url)
      ? item.url : (bvid ? `https://www.bilibili.com/video/${encodeURIComponent(bvid)}/` : 'https://space.bilibili.com/3546601293351293/upload/video');
    const title = item.title || (bvid ? `B站投稿 ${bvid}` : '世界交通拜年纪相关作品');
    const cover = coverFor(item);
    const date = formatDate(item.pubdate || item.ctime);
    const duration = item.durationText || item.length || '';
    const stats = [];
    if (date) stats.push(date);
    if (duration) stats.push(duration);
    return `<article class="bnj-video-card" data-bvid="${esc(bvid)}" data-title="${esc((title+' '+bvid).toLowerCase())}">
      <a class="bnj-video-cover" href="${esc(url)}" target="_blank" rel="noopener noreferrer"><img loading="lazy" src="${esc(cover)}" alt="${esc(title)}封面" data-bnj-image><span class="bnj-cover-tag">${esc(item.featured ? 'FEATURED REPLAY' : 'BILIBILI VIDEO')}</span><span class="bnj-cover-play">▶</span></a>
      <div class="bnj-video-card-body"><div class="bnj-video-meta"><span>${esc(item.featured ? '年度回放' : '视频投稿')}</span><span>${esc(bvid || 'B站作品')}</span></div><h3>${esc(title)}</h3>
      ${item.desc ? `<p>${esc(String(item.desc).replace(/\s+/g,' ').slice(0,150))}</p>` : `<p>来自世界交通拜年纪 B 站空间的作品入口。点击查看原视频与完整信息。</p>`}
      <div class="bnj-video-card-foot"><a href="${esc(url)}" target="_blank" rel="noopener noreferrer">打开 B 站原视频 ↗</a><span class="bnj-video-source">${esc(stats.join(' · ') || (item.localCover && item.source === 'Bilibili public metadata' ? '封面已缓存' : '等待同步公开资料'))}</span></div></div></article>`;
  }

  function renderVideos(items) {
    if (!grid) return;
    const unique = [];
    const seen = new Set();
    for (const item of items || []) {
      if (!item || !item.bvid) continue;
      const id = String(item.bvid);
      if (seen.has(id)) continue;
      seen.add(id);
      unique.push(item);
    }
    unique.sort((a,b) => Number(Boolean(b.featured)) - Number(Boolean(a.featured)) || Number(b.pubdate || b.ctime || 0)-Number(a.pubdate || a.ctime || 0));
    allVideos = unique;
    const q = (search?.value || '').trim().toLowerCase();
    const filtered = unique.filter(v => (`${v.title||''} ${v.bvid||''} ${v.desc||''}`).toLowerCase().includes(q));
    grid.innerHTML = filtered.length ? filtered.map(cardMarkup).join('') : '';
    const count = byId('bnj-video-count');
    if (count) count.textContent = `已收录作品：${unique.length} 条${unique.length === 1 ? '（等待同步最新投稿）' : ' · 可搜索标题或 BV 号'}`;
    const empty = byId('bnj-no-matches');
    if (empty) empty.hidden = filtered.length !== 0;
    grid.querySelectorAll('img[data-bnj-image]').forEach(img => {
      img.addEventListener('error', () => { if (!img.src.endsWith(DEFAULT_COVER)) img.src = DEFAULT_COVER; }, { once: true });
    });
  }

  function renderCollections(items) {
    const el = byId('bnj-collection-list');
    if (!el || !Array.isArray(items) || items.length === 0) return;
    const safeItems = items.slice(0, 8).filter(item => item && typeof item.url === 'string' && /^https:\/\/(space\.bilibili\.com|www\.bilibili\.com)\//.test(item.url));
    if (!safeItems.length) return;
    el.innerHTML = safeItems.map(item => `<a href="${esc(item.url)}" target="_blank" rel="noopener noreferrer"><span class="bnj-extra-list-icon">▤</span><span><strong>${esc(item.title || '团队作品合集')}</strong><small>${item.count ? `收录 ${esc(item.count)} 条内容` : '来自 B 站公开合集资料'}</small></span><b>↗</b></a>`).join('');
  }

  function renderDynamics(items) {
    const el = byId('bnj-dynamic-list');
    if (!el || !Array.isArray(items) || items.length === 0) return;
    const safeItems = items.slice(0, 6).filter(item => item && typeof item.url === 'string' && /^https:\/\/(space\.bilibili\.com|www\.bilibili\.com|t\.bilibili\.com)\//.test(item.url));
    if (!safeItems.length) return;
    el.innerHTML = safeItems.map(item => {
      const title = item.title || item.text || '团队动态';
      const summary = item.text && item.text !== title ? String(item.text).slice(0, 96) : '打开 B 站查看完整动态';
      const date = formatDate(item.pubdate);
      return `<a href="${esc(item.url)}" target="_blank" rel="noopener noreferrer"><span class="bnj-extra-list-icon">✳</span><span><strong>${esc(title)}</strong><small>${esc(summary)}${date ? `<span class="bnj-dynamic-date">${esc(date)}</span>` : ''}</small></span><b>↗</b></a>`;
    }).join('');
  }

  function updateProfile(profile, manifest) {
    if (!profile) return;
    const avatar = byId('bnj-team-avatar');
    const avatarSource = profile.faceLocal || profile.face;
    if (avatar && avatarSource) {
      avatar.src = safeAsset(avatarSource, DEFAULT_AVATAR);
      avatar.onerror = () => { avatar.onerror = null; avatar.src = DEFAULT_AVATAR; };
      const caption = byId('bnj-avatar-caption');
      if (caption) caption.textContent = profile.faceLocal ? '已缓存空间头像' : (String(profile.face || '').includes('world-transport-bnj-avatar.svg') ? '团队主题标识（非官方头像）' : 'B站空间头像');
    }
    const sign = byId('bnj-team-sign');
    if (sign && profile.sign && String(profile.sign).trim()) sign.textContent = profile.sign;
    const sync = byId('bnj-sync-status');
    if (sync && manifest?.generatedAt) {
      const dt = new Date(manifest.generatedAt);
      const dateText = Number.isNaN(dt.getTime()) ? String(manifest.generatedAt) : dt.toLocaleString('zh-CN', { hour12: false });
      sync.innerHTML = `<span class="bnj-sync-dot"></span><span>已同步公开资料 · ${esc(dateText)}。若 B 站暂时不可访问，将继续展示本地缓存。</span>`;
      sync.classList.add('is-synced');
    }
  }

  if (search) search.addEventListener('input', () => renderVideos(allVideos));

  // Render the verified locally recorded title immediately, even when the network/API is unavailable.
  renderVideos([{
    bvid: 'BV16ZFjeMEzE',
    title: '〖2025年交通拜年纪〗2025年世界交通拜年纪直播回放',
    localCover: DEFAULT_COVER,
    url: 'https://www.bilibili.com/video/BV16ZFjeMEzE/',
    featured: true,
    source: '公开检索索引；待官方接口同步封面'
  }]);

  fetch(`${MANIFEST_URL}?v=${Date.now()}`, { cache: 'no-store' })
    .then(response => { if (!response.ok) throw new Error('metadata not available'); return response.json(); })
    .then(data => {
      updateProfile(data.profile, data);
      renderVideos(Array.isArray(data.videos) && data.videos.length ? data.videos : [{bvid:'BV16ZFjeMEzE',title:'〖2025年交通拜年纪〗2025年世界交通拜年纪直播回放',localCover:DEFAULT_COVER,featured:true}]);
      renderCollections(data.collections);
      renderDynamics(data.dynamic);
    })
    .catch(() => {
      const sync = byId('bnj-sync-status');
      if (sync) sync.setAttribute('aria-label', '当前使用本地内容；B站同步不可用');
    });
})();
