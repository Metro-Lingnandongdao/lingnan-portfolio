(() => {
  const root = document.getElementById('line-detail-root');
  const db = window.RAIL_ATLAS;
  if (!root || !db) return;
  const index = Number(document.body.dataset.routeIndex || 0);
  const route = db.routes[index];
  if (!route) { root.innerHTML = '<section class="line-detail-content"><h1>未找到线路</h1><a href="../rail-atlas.html">返回轨道百科</a></section>'; return; }
  const system = db.systems.find(x => x.id === route.system) || {};
  const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const colorMap = {"gzmetro::1号线":"#F2C744","gzmetro::2号线":"#0072BC","gzmetro::3号线（含北延段）":"#F58220","gzmetro::4号线":"#168C4A","gzmetro::5号线":"#C71E32","gzmetro::6号线":"#6B4C9A","gzmetro::7号线":"#8DBE45","gzmetro::8号线":"#00A6A6","gzmetro::9号线":"#C99A22","gzmetro::10号线":"#6E3F91","gzmetro::11号线（环线）":"#8CBF42","gzmetro::12号线（东西段）":"#D9B633","gzmetro::13号线一期":"#E87522","gzmetro::14号线":"#2455A4","gzmetro::16号线":"#A6764B","gzmetro::18号线":"#00A4D6","gzmetro::21号线":"#E77A29","gzmetro::22号线":"#39A7A0","gzmetro::APM线":"#5BB6D6","gzmetro::广佛线":"#C61F3A","gzmetro::8号线北延段":"#00A6A6","gzmetro::8号线东延段":"#00A6A6","gzmetro::13号线二期西段":"#E87522","gzmetro::13号线二期东段":"#E87522","gzmetro::22号线北延／后续延伸":"#39A7A0","foshan::佛山地铁2号线":"#0065A8","foshan::佛山地铁3号线":"#55449A","foshan::佛山地铁4号线一期":"#78B62A","foshan::佛山地铁2号线二期":"#0065A8","foshan::佛山地铁11号线":"#248B9A","szmetro::1号线（罗宝线）":"#009944","szmetro::2号线／8号线":"#F28C28","szmetro::3号线（龙岗线）":"#0072BC","szmetro::4号线（龙华线）":"#C8102E","szmetro::5号线（环中线）":"#7D4698","szmetro::6号线":"#00529B","szmetro::7号线":"#F36F21","szmetro::9号线":"#8C8C8C","szmetro::10号线":"#7D4698","szmetro::11号线":"#A7BC36","szmetro::12号线":"#009FE3","szmetro::13号线（已开通区段）":"#00A7A7","szmetro::14号线":"#F5CF42","szmetro::16号线":"#1067A5","szmetro::20号线":"#EB6424","szmetro::13号线二期／北延相关工程":"#00A7A7","szmetro::深圳地铁五期及调整线路":"#168f86","hkmtr::观塘线":"#00A94F","hkmtr::荃湾线":"#E2231A","hkmtr::港岛线":"#0075C9","hkmtr::将军澳线":"#7C2D91","hkmtr::南港岛线（东段）":"#B9CC4A","hkmtr::东涌线":"#ED6C00","hkmtr::机场快线":"#00A6A6","hkmtr::迪士尼线":"#F17CB0","hkmtr::东铁线":"#5BC5F2","hkmtr::屯马线":"#923F8F","hkmtr::轻铁":"#E9BD25","hkmtr::香港电车":"#778899","hkmtr::广深港高速铁路香港段":"#265c89","hkmtr::北环线及其他铁路项目":"#168f86","macau::氹仔线":"#0072BC","macau::石排湾线":"#4AA4D9","macau::横琴线":"#16A085","macau::澳氹东线":"#657E9C","gdintercity::广清城际":"#5A9F49","gdintercity::广州东环城际":"#008B8B","gdintercity::广肇城际":"#7BAA36","gdintercity::广惠城际":"#DB7628","gdintercity::琶莲城际":"#008BCB","gdintercity::穗深城际（新塘南—深圳机场已开通段）":"#168f86","gdintercity::广州地铁18号线（城际化运营管理）":"#00A4D6","gdintercity::广州地铁22号线（城际化运营管理）":"#39A7A0","gdintercity::广佛西环城际":"#248b9a","gdintercity::广花城际":"#5B9ED2","gdintercity::新白广城际":"#168f86","gdintercity::佛莞城际／广佛南环贯通段":"#8BAF42","qingyuan::清远长隆磁浮旅游专线":"#3F90BF","cr-guangzhou::京广铁路（广东省内区段）":"#B33D36","cr-guangzhou::京广高速铁路（广东段）":"#285C8C","cr-guangzhou::广深铁路":"#B33D36","cr-guangzhou::广深港高速铁路（广东段）":"#285C8C","cr-guangzhou::赣深高速铁路（广东段）":"#285C8C","cr-guangzhou::厦深铁路（广东段）":"#B33D36","cr-guangzhou::贵广铁路（广东段）":"#285C8C","cr-guangzhou::南广铁路（广东段）":"#285C8C","cr-guangzhou::广汕高铁":"#285C8C","cr-guangzhou::汕汕高铁":"#285C8C","cr-guangzhou::广湛高速铁路":"#285C8C","cr-guangzhou::广梅汕铁路":"#B33D36","cr-guangzhou::广茂铁路":"#B33D36","cr-guangzhou::广珠铁路":"#B33D36","cr-guangzhou::广州—湛江方向既有铁路／深湛铁路":"#B33D36","cr-guangzhou::广州站—广州南站联络线":"#285C8C","cr-guangzhou::广佛江珠城际等规划线路":"#168f86"};
  const color = colorMap[`${route.system}::${route.name}`] || ({gzmetro:'#168f86',foshan:'#248b9a',szmetro:'#5b9ed2',dgmetro:'#168f86',hkmtr:'#0075C9',macau:'#0072BC',gdintercity:'#65a843',qingyuan:'#3f90bf','cr-guangzhou':'#265c89'}[route.system] || '#168f86');
  document.documentElement.style.setProperty('--line-color', color);
  const lineTokenGroups = (route.stations || '').split(/[；;]/).map(group => group.split(/[、，,]/).map(s => s.trim()).filter(Boolean)).filter(g => g.length);
  const sourceTitle = (() => { try { return decodeURIComponent((route.source || '').split('/wiki/')[1] || '').replace(/_/g,' '); } catch { return ''; }})();
  const sourceLink = route.source || system.wiki || '#';
  const indexFile = `line-${String(index+1).padStart(3,'0')}.html`;
  const prev = index > 0 ? `<a href="line-${String(index).padStart(3,'0')}.html">← 上一条：${esc(db.routes[index-1].name)}</a>` : `<a href="../rail-atlas.html#atlas-directory">← 返回线路目录</a>`;
  const next = index < db.routes.length-1 ? `<a href="line-${String(index+2).padStart(3,'0')}.html">下一条：${esc(db.routes[index+1].name)} →</a>` : `<a href="../rail-atlas.html#atlas-directory">返回线路目录 →</a>`;
  const fallbackPhoto = `../assets/line-thumbnails/line-${String(index+1).padStart(3,'0')}.svg`;
  const sysPhoto = fallbackPhoto;
  const stationLocal = () => {
    if (!lineTokenGroups.length || lineTokenGroups.every(g => g.length <= 1)) {
      return `<div class="station-diagram"><div class="station-diagram-head"><strong>站点顺序待补齐</strong><span>LOCAL INDEX</span></div><div class="station-gap">当前本地索引尚未收录足够的中间车站。可尝试读取维基百科的线路车站表；读取失败时，请通过原始资料链接核对完整站序。</div><ol class="station-singleline"><li class="end-stop">${esc(route.from || '起点待核对')}<small>起点／方向</small></li><li><span>中间站序待补齐</span><small>资料缺项</small></li><li class="end-stop">${esc(route.to || '终点待核对')}<small>终点／方向</small></li></ol></div>`;
    }
    return lineTokenGroups.map((stops, n) => `<div class="station-diagram"><div class="station-diagram-head"><strong>${lineTokenGroups.length > 1 ? `区段／支线 ${n+1}` : '站点顺序'}</strong><span>${stops.length} NODES · LOCAL INDEX</span></div><ol class="station-singleline">${stops.map((stop,j) => `<li class="${j===0||j===stops.length-1?'end-stop':''}">${esc(stop)}${j===0?'<small>起点侧</small>':j===stops.length-1?'<small>终点侧</small>':''}</li>`).join('')}</ol></div>`).join('');
  };
  root.innerHTML = `
  <section class="line-detail-hero" style="--line-color:${esc(color)}"><a class="line-detail-back" href="../rail-atlas.html#atlas-directory">← 返回轨道百科线路目录</a><p class="line-detail-kicker">${esc(system.english || system.name || 'RAIL TRANSIT')} / LINE PROFILE</p><div class="line-detail-title-row"><span class="line-detail-badge" aria-hidden="true"></span><h1>${esc(route.name)}<small>${esc(system.name)} · ${esc(route.kind || system.kind || '线路')} · 线路单线图</small></h1></div><p>${esc(route.detail || system.summary || '线路详情待补充。')}</p><div class="line-detail-pills"><span class="line-detail-pill status">${esc(route.status || '状态待核验')}</span><span class="line-detail-pill">${esc(route.from || '起点待核对')} → ${esc(route.to || '终点待核对')}</span><span class="line-detail-pill">线路示意色：${color.toUpperCase()}</span></div></section>
  <section class="line-detail-content">
    <div class="line-detail-overview">
      <article class="line-detail-panel"><h2>线路资料</h2><div class="line-detail-facts"><div class="line-detail-fact"><small>运营系统</small><strong>${esc(system.name)}</strong></div><div class="line-detail-fact"><small>建设／运营状态</small><strong>${esc(route.status || '待核验')}</strong></div><div class="line-detail-fact"><small>起点方向</small><strong>${esc(route.from || '待补充')}</strong></div><div class="line-detail-fact"><small>终点方向</small><strong>${esc(route.to || '待补充')}</strong></div><div class="line-detail-fact"><small>相关车辆段／停车场</small><strong>${esc(route.facilities || '公开资料暂未整理，需核对')}</strong></div><div class="line-detail-fact"><small>数据来源</small><strong>${sourceTitle ? `维基百科：${esc(sourceTitle)}` : '公开资料索引'}</strong></div></div><div class="line-detail-usage-note">本页的本地站序取自当前资料索引，部分线路只收录代表性节点或施工／规划端点，不能直接视为全站名录。成功读取维基表格后会在下方更新；涉及开通状态、线路走向及设施名称，请以运营方最新公告和官方线路图复核。</div></article>
      <article class="line-detail-panel"><h2>本线路配图</h2><img class="line-detail-photo" id="line-detail-photo" src="${esc(sysPhoto)}" data-line-photo-index="${index}" data-fallback-src="${esc(fallbackPhoto)}" alt="${esc(system.name+' '+route.name+'线路识别图；优先尝试读取对应维基条目配图')}" loading="lazy"><div class="line-detail-photo-source"><span id="line-detail-photo-note">当前为本线路专属的线色识别图（本地生成，非实拍）；页面会尝试读取对应线路条目的真实配图。</span><br><a id="line-detail-photo-source-link" href="${esc(sourceLink)}" target="_blank" rel="noopener noreferrer">线路图片／资料来源 ↗</a></div></article>
    </div>
    <div class="line-detail-section-head"><h2>站点顺序 <em>· 单线图</em></h2><p>站点按当前已收录的线路方向排序，线路色用于视觉识别；交叉换乘关系和分支运营方式请以官方线网图为准。</p></div>
    <div class="station-diagram-list" id="station-diagram-list">${stationLocal()}</div>
    <div class="line-detail-loadrow"><button id="load-full-stations" type="button">尝试读取维基车站表 ↗</button><span id="station-fetch-status" role="status">正在尝试取得公开站表；如果接口不可用，将保留本站本地站序并提供原文入口。</span></div>
    <div class="line-detail-full-list" id="line-detail-full-list" hidden><div class="line-detail-section-head"><h2>完整车站表 <em>· 在线资料</em></h2><p id="full-station-count">维基百科当前公开表格</p></div><div class="station-diagram-list" id="wiki-station-diagram"></div></div>
    <div class="line-detail-section-head"><h2>相关资料 <em>与参考入口</em></h2><p>本页保留原始条目与运营方入口，便于查阅车站列表、线路图、施工公告及设施资料。</p></div>
    <div class="line-detail-source-grid"><a href="${esc(sourceLink)}" target="_blank" rel="noopener noreferrer"><strong>线路原始资料 ↗</strong><span>${sourceTitle ? `打开维基条目：${esc(sourceTitle)}` : '打开原始来源页面'}，核对线路站序与建设状态。</span></a><a href="${esc(system.stationsWiki || system.wiki || '#')}" target="_blank" rel="noopener noreferrer"><strong>系统车站／线路名录 ↗</strong><span>查阅所属系统的车站列表、换乘信息及相关线路。</span></a><a href="${esc(system.official || '#')}" target="_blank" rel="noopener noreferrer"><strong>${esc(system.name)}官方入口 ↗</strong><span>官方信息优先用于核验营业状态、服务调整、工程进展与设施名称。</span></a></div>
    <div class="line-detail-pager">${prev}${next}</div>
  </section>`;


  // Prefer a route-specific Wikipedia lead image, then the local line-colored drawing.
  async function loadRouteLeadImage() {
    const photo = document.getElementById('line-detail-photo');
    const note = document.getElementById('line-detail-photo-note');
    const link = document.getElementById('line-detail-photo-source-link');
    if (!photo) return;
    const fallback = photo.dataset.fallbackSrc;
    function useFallback() {
      photo.onerror = null;
      photo.src = fallback;
      if (note) note.textContent = '显示本线路专属的线色识别图（本地生成，非实拍）；原始资料入口见下方链接。';
      if (link) { link.href = sourceLink; link.textContent = '线路原始资料 ↗'; }
    }
    try {
      const mRes = await fetch('../assets/line-images-manifest.json', {cache:'no-cache'});
      const imageManifest = mRes.ok ? await mRes.json() : {routes:[]};
      const item = (imageManifest.routes || []).find(x => x.index === index) || {};
      if (item.localImage) {
        photo.onerror = useFallback;
        photo.onload = () => { if (note) note.textContent = `已加载本线路缓存配图（${item.imageLicense || '许可信息请查看来源页'}）；请打开来源核对图注、作者及许可。`; };
        photo.src = `../${item.localImage}`;
        if (link) { link.href = item.imagePage || item.sourceUrl || sourceLink; link.textContent = '图片来源与许可 ↗'; }
        return;
      }
      if (item.remoteImage) {
        photo.onerror = useFallback;
        photo.onload = () => { if (note) note.textContent = `维基条目配图：${item.pageTitle || route.name}。请在来源页核对图注、作者与许可。`; };
        photo.src = item.remoteImage;
        if (link) { link.href = item.imagePage || item.sourceUrl || sourceLink; link.textContent = '打开配图来源 ↗'; }
        return;
      }
      const getPages = async (params) => {
        const query = new URLSearchParams({action:'query',format:'json',formatversion:'2',origin:'*',prop:'pageimages|info',piprop:'thumbnail',pithumbsize:'1000',inprop:'url',...params});
        const r = await fetch(`https://zh.wikipedia.org/w/api.php?${query.toString()}`, {headers:{Accept:'application/json'}});
        if (!r.ok) throw new Error('维基接口不可用');
        const json = await r.json();
        return (json.query && json.query.pages) || [];
      };
      let title = item.sourceTitle || sourceTitle;
      let page = null;
      if (title) page = (await getPages({titles:title})).find(x => x.thumbnail && x.thumbnail.source);
      if (!page) {
        const q = new URLSearchParams({action:'query',format:'json',formatversion:'2',origin:'*',list:'search',srnamespace:'0',srlimit:'6',srsearch:`${system.name || ''} ${route.name || ''}`});
        const r = await fetch(`https://zh.wikipedia.org/w/api.php?${q.toString()}`, {headers:{Accept:'application/json'}});
        if (r.ok) {
          const json = await r.json();
          const searches = (json.query && json.query.search) || [];
          const number = (String(route.name || '').match(/\d+/) || [])[0];
          const routeName = String(route.name || '').replace(/[（）()／/\s]/g,'');
          const matches = searches.filter(x => {
            const t = String(x.title || '').replace(/[（）()／/\s]/g,'');
            return (routeName && (t.includes(routeName) || routeName.includes(t))) || (number && t.includes(number) && /地铁|城际|铁路|轻轨|磁浮/.test(t));
          }).slice(0,3);
          if (matches.length) page = (await getPages({titles:matches.map(x=>x.title).join('|')})).find(x=>x.thumbnail && x.thumbnail.source);
        }
      }
      if (!page || !page.thumbnail || !page.thumbnail.source) return useFallback();
      photo.onerror = useFallback;
      photo.onload = () => {
        if (note) note.textContent = `维基条目配图：${page.title || title || '对应线路条目'}。请在原页面核对图注与授权。`;
        if (link) { link.href = page.fullurl || sourceLink; link.textContent = '打开配图原始条目 ↗'; }
      };
      photo.src = page.thumbnail.source;
    } catch (_) { useFallback(); }
  }
  loadRouteLeadImage();

  const stationStatus = document.getElementById('station-fetch-status');
  const loadButton = document.getElementById('load-full-stations');
  const fullList = document.getElementById('line-detail-full-list');
  const wikiDiagram = document.getElementById('wiki-station-diagram');
  const countText = document.getElementById('full-station-count');
  let loaded = false;
  function normalize(txt) { return (txt || '').replace(/\[\s*注\s*\d+\s*\]/g,'').replace(/\[\d+\]/g,'').replace(/\s+/g,' ').trim(); }
  function stationCandidateTables(doc) {
    return [...doc.querySelectorAll('table.wikitable')].map(table => {
      const rows = [...table.querySelectorAll('tr')];
      const headers = [...(rows[0]?.querySelectorAll('th,td') || [])].map(c=>normalize(c.textContent));
      const headerText = headers.join(' ');
      const relevant = /车站|站名|站点|站序|station/i.test(headerText);
      return {table,rows,headers,headerText,relevant,score:(relevant?1000:0)+Math.min(rows.length,200)};
    }).filter(x => x.rows.length >= 3).sort((a,b)=>b.score-a.score);
  }
  function extractStations(doc) {
    const candidates = stationCandidateTables(doc);
    for (const c of candidates) {
      let col = c.headers.findIndex(h => /车站名称|车站名|站名|车站|站点|station/i.test(h));
      if (col < 0) col = 0;
      const names = [];
      for (const tr of c.rows.slice(1)) {
        const cells = [...tr.querySelectorAll('th,td')];
        if (!cells[col]) continue;
        const text = normalize(cells[col].textContent);
        const linked = [...cells[col].querySelectorAll('a')].map(a=>normalize(a.textContent)).find(x=>x && !/编辑|来源|资料|维基百科/.test(x));
        const name = linked || text;
        if (!name || /^(车站|车站名称|站名|站点|名称|合计|注释|備註|备注)$/i.test(name) || name.length > 38) continue;
        if (/|暂未开通|表格|线路列表/.test(name)) continue;
        if (!names.includes(name)) names.push(name);
      }
      if (names.length >= 3) return names;
    }
    return [];
  }
  function renderWikiStationList(names) {
    wikiDiagram.innerHTML = `<div class="station-diagram"><div class="station-diagram-head"><strong>维基百科车站表（读取顺序）</strong><span>${names.length} STATIONS</span></div><ol class="station-singleline">${names.map((n,i)=>`<li class="${i===0||i===names.length-1?'end-stop':''}">${esc(n)}${i===0?'<small>表格首项</small>':i===names.length-1?'<small>表格末项</small>':''}</li>`).join('')}</ol></div>`;
    countText.textContent = `已读取 ${names.length} 个表格条目。该顺序是按维基条目表格提取，并不自动保证行车方向或分支关系完全正确。`;
    fullList.hidden = false;
  }
  async function loadFullStations() {
    if (loaded) return;
    if (!sourceTitle || !/zh\.wikipedia\.org/.test(route.source || '')) {
      stationStatus.textContent = '此条目的来源不是中文维基百科线路页，无法自动读取维基车站表。请打开原始来源与系统名录核对。';
      return;
    }
    loadButton.disabled = true; loadButton.textContent = '读取中…';
    stationStatus.textContent = `正在读取“${sourceTitle}”的公开页面表格。`;
    try {
      const api = new URL('https://zh.wikipedia.org/w/api.php');
      api.searchParams.set('action','parse'); api.searchParams.set('page',sourceTitle); api.searchParams.set('prop','text'); api.searchParams.set('format','json'); api.searchParams.set('formatversion','2'); api.searchParams.set('origin','*'); api.searchParams.set('disableeditsection','1');
      const resp = await fetch(api.toString(), {headers:{Accept:'application/json'}});
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const data = await resp.json();
      if (data.error) throw new Error(data.error.info || '维基接口错误');
      const markup = data.parse && data.parse.text;
      if (!markup) throw new Error('没有返回条目内容');
      const doc = new DOMParser().parseFromString(markup,'text/html');
      const names = extractStations(doc);
      if (names.length < 3) throw new Error('没有检出足够的车站名表格');
      renderWikiStationList(names); loaded = true;
      stationStatus.textContent = `读取成功：按维基百科“${sourceTitle}”的站名列提取 ${names.length} 个条目。请再与运营方官方站表核对。`;
    } catch (err) {
      stationStatus.textContent = `暂时无法读取完整站表（${err.message || err}）。当前展示的是本地资料中已收录的顺序节点，不代表完整站名表；请使用下方原始资料链接。`;
    } finally { loadButton.disabled = false; loadButton.textContent = '尝试读取维基车站表 ↗'; }
  }
  loadButton.addEventListener('click', loadFullStations);
  // Try to fill the complete list automatically, retaining local stops if access is blocked.
  loadFullStations();
})();