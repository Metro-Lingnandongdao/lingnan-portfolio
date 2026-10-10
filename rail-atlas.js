(() => {
  const db = window.RAIL_ATLAS;
  if (!db) return;
  const byId = (id) => document.getElementById(id);
  const escapeHTML = (value) => String(value ?? '').replace(/[&<>"']/g, (char) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const systemNames = Object.fromEntries(db.systems.map(item => [item.id, item.name]));

  // System cards, with the file page linked for photographer/license attribution.
  const systemGrid = byId('system-grid');
  systemGrid.innerHTML = db.systems.map(system => `
    <article class="atlas-system-card" id="system-${escapeHTML(system.id)}">
      <div class="atlas-system-photo"><img src="${escapeHTML(system.image)}" alt="${escapeHTML(system.imageAlt)}" loading="lazy" onerror="this.closest('.atlas-system-photo').classList.add('image-missing');this.remove()"/><a href="${escapeHTML(system.imageSource)}" target="_blank" rel="noopener noreferrer">图片来源 ↗</a></div>
      <div class="atlas-system-body">
        <div class="atlas-system-meta"><span>${escapeHTML(system.kind)}</span><span class="atlas-system-region">${escapeHTML(system.area)}</span></div>
        <h3>${escapeHTML(system.name)}<span class="atlas-system-english">${escapeHTML(system.english)}</span></h3>
        <p>${escapeHTML(system.summary)}</p>
        <div class="atlas-system-lines"><strong>线路范围：</strong>${escapeHTML(system.lines)}<br/><strong>状态：</strong>${escapeHTML(system.status)}</div>
        <div class="atlas-system-links"><a href="${escapeHTML(system.wiki)}" target="_blank" rel="noopener noreferrer">维基条目 ↗</a><a href="${escapeHTML(system.stationsWiki)}" target="_blank" rel="noopener noreferrer">线路／车站名录 ↗</a><a href="${escapeHTML(system.official)}" target="_blank" rel="noopener noreferrer">官方入口 ↗</a></div>
      </div>
    </article>`).join('');

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
