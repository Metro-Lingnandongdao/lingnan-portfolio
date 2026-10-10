(() => {
  const db = window.RAIL_ATLAS;
  if (!db) return;
  const byId = (id) => document.getElementById(id);
  const escapeHTML = (value) => String(value ?? '').replace(/[&<>"']/g, (char) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const systemNames = Object.fromEntries(db.systems.map(item => [item.id, item.name]));

  const mediaBySystem = {
    gzmetro:{photo:'https://commons.wikimedia.org/wiki/Special:FilePath/A10_Train_%2812x005-006%29_and_B12_Train_%2807x101-102_and_07x105-106%29_at_Guangzhou_CRRC_Base%2C_Guangzhou_Metro_20240331.jpg?width=1000',photoSource:'https://commons.wikimedia.org/wiki/File:A10_Train_(12x005-006)_and_B12_Train_(07x101-102_and_07x105-106)_at_Guangzhou_CRRC_Base,_Guangzhou_Metro_20240331.jpg',map:'https://commons.wikimedia.org/wiki/Special:FilePath/Guangzhou_Metro_Linemap.svg?width=1100',mapSource:'https://commons.wikimedia.org/wiki/File:Guangzhou_Metro_Linemap.svg',officialMap:'https://www.gz.gov.cn/guangzhouinternational/home/bulletin/content/post_10133518.html',mapNote:'维基共享资源广州地铁线路图；版本需与官网最新线网图核对。'},
    foshan:{photo:'https://commons.wikimedia.org/wiki/Special:FilePath/Guangzhou-Zhaoqing_Intercity_Rail_CRH6_Train_Arriving_at_Foshanxi_Railway_Station_Platform_19.jpg?width=1000',photoSource:'https://commons.wikimedia.org/wiki/File:Guangzhou-Zhaoqing_Intercity_Rail_CRH6_Train_Arriving_at_Foshanxi_Railway_Station_Platform_19.jpg',map:'https://commons.wikimedia.org/wiki/Special:FilePath/Pearl_River_Delta_Metro_and_Railway_Map.svg?width=1100',mapSource:'https://commons.wikimedia.org/wiki/File:Pearl_River_Delta_Metro_and_Railway_Map.svg',officialMap:'https://www.fmetro.net/upload/main/contentmanage/article/file/2024/08/19/202408191534278940.pdf',mapNote:'维基湾区综合轨道图，包含佛山及周边线路；不是佛山地铁单系统图。另附佛山地铁官方社会价值报告中的线网图。'},
    szmetro:{photo:'https://commons.wikimedia.org/wiki/Special:FilePath/L13_Train_%281326%29_at_CRRC_Guangdong_Base%2C_Shenzhen_Metro_20260218.jpg?width=1000',photoSource:'https://commons.wikimedia.org/wiki/File:L13_Train_(1326)_at_CRRC_Guangdong_Base,_Shenzhen_Metro_20260218.jpg',map:'https://commons.wikimedia.org/wiki/Special:FilePath/Shenzhen_Metro_%28Rapid_Transit%29_System_Map.svg?width=1100',mapSource:'https://commons.wikimedia.org/wiki/File:Shenzhen_Metro_(Rapid_Transit)_System_Map.svg',officialMap:'https://www.sz.gov.cn/xxgk/sydwxxgk/jt/dt/ywxx/dtxlxx/content/mpost_11086804.html',mapNote:'维基共享资源深圳地铁系统图（2024 版本图件）；在建状态请查官方。'},
    dgmetro:{photo:'https://commons.wikimedia.org/wiki/Special:FilePath/Dongguan_Rail_Transit_Line_1_Train.jpg?width=1000',photoSource:'https://commons.wikimedia.org/wiki/File:Dongguan_Rail_Transit_Line_1_Train.jpg',map:'https://commons.wikimedia.org/wiki/Special:FilePath/Dongguan_Rail_Transit_System_Map.svg?width=1100',mapSource:'https://commons.wikimedia.org/wiki/File:Dongguan_Rail_Transit_System_Map.svg',officialMap:'http://www.dggdjt.com/',mapNote:'维基共享资源东莞轨道交通线网图；以运营公司版本为准。'},
    hkmtr:{photo:'https://commons.wikimedia.org/wiki/Special:FilePath/MTR-train.jpg?width=1000',photoSource:'https://commons.wikimedia.org/wiki/File:MTR-train.jpg',map:'https://commons.wikimedia.org/wiki/Special:FilePath/Hong_Kong_Railway_Route_Map_en.svg?width=1100',mapSource:'https://commons.wikimedia.org/wiki/File:Hong_Kong_Railway_Route_Map_en.svg',officialMap:'https://www.mtr.com.hk/en/customer/services/system_map.html',mapNote:'维基共享资源香港铁路示意图；官方英文线网图入口见右侧链接。'},
    macau:{photo:'https://commons.wikimedia.org/wiki/Special:FilePath/Macau_LRT_Train.jpg?width=1000',photoSource:'https://commons.wikimedia.org/wiki/File:Macau_LRT_Train.jpg',map:'https://commons.wikimedia.org/wiki/Special:FilePath/MLRT_Route_Map_Planning.svg?width=900',mapSource:'https://commons.wikimedia.org/wiki/File:MLRT_Route_Map_Planning.svg',officialMap:'https://www.mlm.com.mo/sc/index.html',mapNote:'澳门轻轨运营、在建与规划线路示意；规划线不代表已经获批或开工。'},
    gdintercity:{photo:'https://commons.wikimedia.org/wiki/Special:FilePath/Guangzhou-Zhaoqing_Intercity_Rail_CRH6_Train_Arriving_at_Foshanxi_Railway_Station_Platform_19.jpg?width=1000',photoSource:'https://commons.wikimedia.org/wiki/File:Guangzhou-Zhaoqing_Intercity_Rail_CRH6_Train_Arriving_at_Foshanxi_Railway_Station_Platform_19.jpg',map:'https://commons.wikimedia.org/wiki/Special:FilePath/PRDIR_%28GBA_Intercity%29_Diagram_%28CHS%26ENG%2C_svg%2C_by_Sir1L0n%29.svg?width=1100',mapSource:'https://commons.wikimedia.org/wiki/File:PRDIR_(GBA_Intercity)_Diagram_(CHS%26ENG,_svg,_by_Sir1L0n).svg',officialMap:'https://gdcj.gzmtr.com/wxMetro/ccyjxz/xltxz.html',mapNote:'维基共享资源大湾区城际线路示意（社区制图），线路变化以官方运行图及公告为准；官方线网图入口已附。'},
    qingyuan:{photo:'https://commons.wikimedia.org/wiki/Special:FilePath/QY03_entering_Maglev_Yinzhan_Station%2C_Qingyuan_Maglev_20240206.jpg?width=1000',photoSource:'https://commons.wikimedia.org/wiki/File:QY03_entering_Maglev_Yinzhan_Station,_Qingyuan_Maglev_20240206.jpg',map:'https://commons.wikimedia.org/wiki/Special:FilePath/Actual_Route_of_Qingyuan_Maglev_Tourist_Line.png?width=1100',mapSource:'https://commons.wikimedia.org/wiki/File:Actual_Route_of_Qingyuan_Maglev_Tourist_Line.png',officialMap:'https://www.gdqycf.com/',mapNote:'维基共享资源清远磁浮旅游专线实际走向图；预留/未开通站点请核对官方信息。'},
    'cr-guangzhou':{photo:'https://commons.wikimedia.org/wiki/Special:FilePath/Guangzhou_South_Station_with_trains.jpg?width=1000',photoSource:'https://commons.wikimedia.org/wiki/File:Guangzhou_South_Station_with_trains.jpg',map:'https://commons.wikimedia.org/wiki/Special:FilePath/Map_of_Intercity_Passenger_Rail_System_in_Pearl_River_Delta_Area%2C_China.png?width=1100',mapSource:'https://commons.wikimedia.org/wiki/File:Map_of_Intercity_Passenger_Rail_System_in_Pearl_River_Delta_Area,_China.png',officialMap:'https://www.12306.cn/',mapNote:'珠三角客运铁路示意图（非全广东省国铁完整路网图）；官方客运信息请以 12306 等铁路渠道为准。'}
  };
  // System cards: photo source, local fallback and explicit source attribution.
  const systemGrid = byId('system-grid');
  systemGrid.innerHTML = db.systems.map(system => {
    const media = mediaBySystem[system.id] || {};
    const photo = media.photo || system.image;
    const photoSource = media.photoSource || system.imageSource || system.wiki;
    return `
    <article class="atlas-system-card" id="system-${escapeHTML(system.id)}">
      <div class="atlas-system-photo"><img src="${escapeHTML(photo)}" data-fallback-src="assets/atlas-photo-fallbacks/${escapeHTML(system.id)}.svg" alt="${escapeHTML(system.imageAlt || system.name+'相关列车或车辆基地照片')}" loading="lazy"/><a href="${escapeHTML(photoSource)}" target="_blank" rel="noopener noreferrer">图片来源 ↗</a></div>
      <div class="atlas-system-body">
        <div class="atlas-system-meta"><span>${escapeHTML(system.kind)}</span><span class="atlas-system-region">${escapeHTML(system.area)}</span></div>
        <h3>${escapeHTML(system.name)}<span class="atlas-system-english">${escapeHTML(system.english)}</span></h3>
        <p>${escapeHTML(system.summary)}</p>
        <div class="atlas-system-lines"><strong>线路范围：</strong>${escapeHTML(system.lines)}<br/><strong>状态：</strong>${escapeHTML(system.status)}</div>
        <div class="atlas-system-links"><a href="${escapeHTML(system.wiki)}" target="_blank" rel="noopener noreferrer">维基条目 ↗</a><a href="${escapeHTML(system.stationsWiki)}" target="_blank" rel="noopener noreferrer">线路／车站名录 ↗</a><a href="${escapeHTML(system.official)}" target="_blank" rel="noopener noreferrer">官方入口 ↗</a></div>
      </div>
    </article>`;
  }).join('');

  // Network maps are linked to their Commons file pages and the corresponding official entry.
  const mapGrid = byId('atlas-system-maps-grid');
  if (mapGrid) mapGrid.innerHTML = db.systems.map(system => {
    const media = mediaBySystem[system.id] || {};
    const map = media.map || '';
    const mapSource = media.mapSource || system.wiki;
    return `<article class="atlas-map-card">
      <a class="atlas-map-picture" href="${escapeHTML(mapSource)}" target="_blank" rel="noopener noreferrer" aria-label="打开${escapeHTML(system.name)}线路图原始来源"><img src="${escapeHTML(map)}" data-fallback-src="assets/atlas-map-fallbacks/${escapeHTML(system.id)}.svg" alt="${escapeHTML(system.name)}线路图；外部图件加载失败时显示离线示意" loading="lazy"/><span class="atlas-map-stamp">WIKIMEDIA / MAP</span></a>
      <div class="atlas-map-card-body"><h3>${escapeHTML(system.name)} · 线路图</h3><p>${escapeHTML(media.mapNote || '线路图来自公开资料入口，请注意核对版本与运营状态。')}</p><div class="atlas-map-card-links"><a href="${escapeHTML(mapSource)}" target="_blank" rel="noopener noreferrer">维基原图／许可 ↗</a><a href="${escapeHTML(media.officialMap || system.official)}" target="_blank" rel="noopener noreferrer">官网线网图入口 ↗</a></div></div>
    </article>`;
  }).join('');

  const systemSelect = byId('atlas-system-filter');
  db.systems.forEach(system => {
    const option = document.createElement('option'); option.value = system.id; option.textContent = system.name;
    systemSelect.appendChild(option);
  });

  const entities = [
    ...db.routes.map(item => ({...item, entityType:'线路', labelKind:item.kind || '线路', title:item.name, systemName:systemNames[item.system], description:item.detail, line:`${item.from} → ${item.to}`, extra:`代表性站点：${item.stations || '请查线路完整站表'}；车辆基地：${item.facilities || '以设计/运营资料核对'}`, source:item.source})),
    ...db.stations.map(item => ({...item, entityType:'车站', labelKind:item.type || '车站', title:item.name, systemName:systemNames[item.system], line:item.type, description:item.detail, extra:'车站启用范围、换乘方式及站内设施请以运营方资料核对。', source:item.source})),
    ...db.facilities.map(item => ({...item, entityType:'设施', labelKind:item.type || '设施', title:item.name, systemName:systemNames[item.system], line:item.type, description:item.detail, extra:`状态：${item.status}`, source:item.source}))
  ];
  const routeCount = byId('atlas-route-count'); if (routeCount) routeCount.textContent = String(db.routes.length).padStart(2,'0');
  const facilityCount = byId('atlas-facility-count'); if (facilityCount) facilityCount.textContent = String(db.facilities.length).padStart(2,'0');
  const grid = byId('atlas-entry-grid');
  const searchInput = byId('atlas-search');
  const statusSelect = byId('atlas-status-filter');
  const typeSelect = byId('atlas-type-filter');
  const empty = byId('atlas-empty');
  const countLabel = byId('atlas-result-count');

  function statusMatches(status, filter) {
    if (filter === 'all') return true;
    if (filter === '运营中') return status.includes('运营中');
    if (filter === '在建') return /在建|建设中|建设\/运营筹备/.test(status);
    if (filter === '规划') return /规划|已批|前期|待建设/.test(status);
    if (filter === '前期研究／可研阶段') return /前期|可研/.test(status);
    if (filter === '建成／试运营资料待复核') return /试运营|资料待复核|待核验/.test(status);
    return status.includes(filter);
  }
  function statusClass(status) {
    if (/规划|待建设|前期|已批/.test(status)) return 'is-planned';
    if (/在建|建设中/.test(status)) return 'is-under';
    if (/待复核|待核验|需核验|需更新|试运营/.test(status)) return 'is-pending';
    return '';
  }
  function renderEntities() {
    const query = searchInput.value.trim().toLocaleLowerCase();
    const sys = systemSelect.value;
    const status = statusSelect.value;
    const type = typeSelect.value;
    const filtered = entities.filter(item => {
      const haystack = [item.title,item.systemName,item.area,item.kind,item.labelKind,item.detail,item.description,item.line,item.from,item.to,item.stations,item.facilities,item.status,item.extra].filter(Boolean).join(' ').toLocaleLowerCase();
      return (!query || haystack.includes(query)) && (sys === 'all' || item.system === sys) && statusMatches(item.status || '', status) && (type === 'all' || item.entityType === type);
    });
    countLabel.textContent = `显示 ${filtered.length} / ${entities.length} 个本地条目`;
    empty.hidden = filtered.length > 0;
    grid.innerHTML = filtered.map(item => `
      <article class="atlas-entry-card">
        <div class="atlas-entry-top"><span>${escapeHTML(item.entityType)} / ${escapeHTML(item.systemName)}</span><span class="atlas-entry-status ${statusClass(item.status || '')}">${escapeHTML(item.status || '状态待核验')}</span></div>
        <h3>${escapeHTML(item.title)}</h3>
        <div class="atlas-entry-line">${escapeHTML(item.line || item.labelKind || '')}</div>
        <div class="atlas-entry-media"><img src="${escapeHTML((mediaBySystem[item.system]||{}).photo || (db.systems.find(s => s.id===item.system)||{}).image || '')}" data-fallback-src="assets/atlas-photo-fallbacks/${escapeHTML(item.system || 'gzmetro')}.svg" alt="${escapeHTML(item.systemName+'相关列车、车站或设施配图')}" loading="lazy"/><a href="${escapeHTML((mediaBySystem[item.system]||{}).photoSource || (db.systems.find(s => s.id===item.system)||{}).imageSource || item.source || '#sources')}" target="_blank" rel="noopener noreferrer">配图来源 ↗</a></div>
        <p>${escapeHTML(item.description || item.detail || '')}</p>
        ${item.extra ? `<div class="atlas-entry-detail">${escapeHTML(item.extra)}</div>` : ''}
        <div class="atlas-entry-links"><a href="${escapeHTML(item.source || '#sources')}" target="_blank" rel="noopener noreferrer">资料来源 ↗</a>${item.system ? `<a href="#system-${escapeHTML(item.system)}">所属系统 ↑</a>` : ''}</div>
      </article>`).join('');
  }
  [searchInput, systemSelect, statusSelect, typeSelect].forEach(el => {
    el.addEventListener(el === searchInput ? 'input' : 'change', renderEntities);
  });
  byId('atlas-reset').addEventListener('click', () => {
    searchInput.value = ''; systemSelect.value = 'all'; statusSelect.value = 'all'; typeSelect.value = 'all'; renderEntities();
  });
  renderEntities();

  // Live fetch of public Wikipedia tables. Tables are recreated from text, rather than copying arbitrary remote HTML into this site.
  const sourceSelect = byId('wiki-source-select');
  const loadButton = byId('wiki-load-button');
  const statusBox = byId('wiki-sync-status');
  const tableContainer = byId('wiki-table-container');
  const wikiActions = byId('wiki-source-actions');
  const tableSearchWrap = byId('wiki-table-search-wrap');
  const tableSearch = byId('wiki-table-search');
  const rowCountLabel = byId('wiki-row-count');
  let activeRows = [];
  db.wikiSources.forEach((source, index) => {
    const option = document.createElement('option'); option.value = source.title; option.textContent = source.label;
    if (index === 0) option.selected = true;
    sourceSelect.appendChild(option);
  });
  function setWikiStatus(message, isError=false) {
    statusBox.textContent = message;
    statusBox.classList.toggle('is-error', isError);
  }
  function tableTitle(table, index) {
    const caption = table.querySelector('caption');
    if (caption && caption.textContent.trim()) return caption.textContent.trim();
    let node = table.previousElementSibling;
    while (node) {
      if (/^H[1-6]$/.test(node.tagName) && node.textContent.trim()) return node.textContent.trim();
      node = node.previousElementSibling;
    }
    return `维基表格 ${String(index).padStart(2,'0')}`;
  }
  function makeTextTable(sourceTable, index) {
    const rows = [...sourceTable.querySelectorAll('tr')].map(row => [...row.querySelectorAll('th,td')].map(cell => (cell.innerText || cell.textContent || '').replace(/\s+/g,' ').trim()));
    const nonempty = rows.filter(row => row.some(cell => cell));
    if (nonempty.length < 2 || nonempty.every(row => row.length < 2)) return null;
    const details = document.createElement('details'); details.className = 'wiki-source-table';
    const summary = document.createElement('summary'); summary.textContent = `${String(index+1).padStart(2,'0')} · ${tableTitle(sourceTable,index+1)} · ${nonempty.length-1} 行`;
    details.appendChild(summary);
    const scroll = document.createElement('div'); scroll.className = 'wiki-table-scroll';
    const table = document.createElement('table');
    nonempty.forEach((row, rowIndex) => {
      const tr = document.createElement('tr');
      row.forEach((cellText, cellIndex) => {
        const cell = document.createElement(rowIndex === 0 ? 'th' : 'td');
        cell.textContent = cellText;
        tr.appendChild(cell);
      });
      tr.dataset.rowText = row.join(' ').toLocaleLowerCase();
      table.appendChild(tr);
    });
    scroll.appendChild(table); details.appendChild(scroll);
    return {details, rows: [...table.querySelectorAll('tr')].slice(1)};
  }
  function applyTableSearch() {
    const q = tableSearch.value.trim().toLocaleLowerCase();
    let visible = 0;
    activeRows.forEach(row => {
      const match = !q || (row.dataset.rowText || row.textContent.toLocaleLowerCase()).includes(q);
      row.hidden = !match;
      if (match) visible++;
    });
    rowCountLabel.textContent = `${visible} 行匹配`;
  }
  tableSearch.addEventListener('input', applyTableSearch);
  async function loadWikiTables() {
    const source = db.wikiSources.find(item => item.title === sourceSelect.value);
    if (!source) return;
    loadButton.disabled = true; loadButton.textContent = '正在读取…';
    tableContainer.replaceChildren(); wikiActions.replaceChildren(); activeRows = []; tableSearch.value = ''; tableSearchWrap.hidden = true;
    setWikiStatus(`正在从维基百科公开接口读取“${source.title}”的表格。请稍候……`);
    const api = new URL('https://zh.wikipedia.org/w/api.php');
    api.searchParams.set('action','parse'); api.searchParams.set('page',source.title); api.searchParams.set('prop','text'); api.searchParams.set('format','json'); api.searchParams.set('formatversion','2'); api.searchParams.set('origin','*'); api.searchParams.set('disableeditsection','1');
    try {
      const response = await fetch(api.toString(), {headers:{'Accept':'application/json'}});
      if (!response.ok) throw new Error(`接口返回 HTTP ${response.status}`);
      const data = await response.json();
      if (data.error) throw new Error(data.error.info || '维基百科接口返回错误');
      const markup = data.parse && data.parse.text;
      if (!markup) throw new Error('未取得条目内容');
      const parsed = new DOMParser().parseFromString(markup, 'text/html');
      const tables = [...parsed.querySelectorAll('table.wikitable')];
      let loaded = 0;
      tables.forEach((table, index) => {
        const result = makeTextTable(table,index);
        if (result) { tableContainer.appendChild(result.details); activeRows.push(...result.rows); loaded++; }
      });
      const link = document.createElement('a'); link.href = source.url; link.target = '_blank'; link.rel = 'noopener noreferrer'; link.textContent = `打开原始条目：${source.title} ↗`; wikiActions.appendChild(link);
      if (!loaded) {
        setWikiStatus('该条目暂未检出可展示的维基表格。请打开原条目查看站名、设施或段落，或换用其他资料源。', true);
      } else {
        tableSearchWrap.hidden = false;
        applyTableSearch();
        setWikiStatus(`读取完成：找到 ${loaded} 张表格。表格按原条目的现有结构提取；请留意每张表中的“未开通、规划、在建”等注记，且以官方公告核实最新状态。`);
      }
    } catch (error) {
      const link = document.createElement('a'); link.href = source.url; link.target = '_blank'; link.rel = 'noopener noreferrer'; link.textContent = `在维基百科打开“${source.title}” ↗`; wikiActions.appendChild(link);
      setWikiStatus(`当前浏览器无法读取维基 API：${error.message || error}。可能是网络、跨域或接口限制；可直接打开原条目，网页其他目录仍可使用。`, true);
    } finally {
      loadButton.disabled = false; loadButton.innerHTML = '加载表格 <span>↗</span>';
    }
  }
  loadButton.addEventListener('click', loadWikiTables);
})();
