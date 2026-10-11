(() => {
  const root = document.getElementById('operator-media-grid');
  const esc=s=>String(s||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const encodeFileTitle = title => 'https://commons.wikimedia.org/wiki/' + String(title||'').replace(/ /g,'_');
  const staticLogo = {
    '广州地铁':{src:'https://commons.wikimedia.org/wiki/Special:FilePath/Guangzhou_Metro_logo.svg?width=360',page:'https://commons.wikimedia.org/wiki/File:Guangzhou_Metro_logo.svg'},
    '澳门轻轨':{src:'https://commons.wikimedia.org/wiki/Special:FilePath/Macau_LRT_logo.svg?width=360',page:'https://commons.wikimedia.org/wiki/File:Macau_LRT_logo.svg'},
    '广铁集团 · 广东省内国铁':{src:'https://commons.wikimedia.org/wiki/Special:FilePath/China_Railway_Guangzhou_logo.svg?width=360',page:'https://commons.wikimedia.org/wiki/File:China_Railway_Guangzhou_logo.svg'}
  };
  const items = [
    {name:'广州地铁',label:'GUANGZHOU METRO',code:'gzmetro',desc:'广州地铁列车及官方线网图参考。',photo:'https://commons.wikimedia.org/wiki/Special:FilePath/A10_Train_%2812x005-006%29_and_B12_Train_%2807x101-102_and_07x105-106%29_at_Guangzhou_CRRC_Base%2C_Guangzhou_Metro_20240331.jpg?width=900',photoPage:'https://commons.wikimedia.org/wiki/File:A10_Train_(12x005-006)_and_B12_Train_(07x101-102_and_07x105-106)_at_Guangzhou_CRRC_Base,_Guangzhou_Metro_20240331.jpg',photoQuery:'Guangzhou Metro train Guangzhou CRRC base',map:'https://commons.wikimedia.org/wiki/Special:FilePath/Guangzhou_Metro_Linemap.svg?width=850',mapPage:'https://commons.wikimedia.org/wiki/File:Guangzhou_Metro_Linemap.svg',logoQuery:'Guangzhou Metro logo',official:'https://www.gzmtr.com/',officialMap:'https://www.gz.gov.cn/guangzhouinternational/home/bulletin/content/post_10133518.html'},
    {name:'佛山地铁／广佛线',label:'FOSHAN METRO & GUANGFO LINE',code:'foshan',desc:'配图为佛山西站的广肇城际列车，非佛山地铁车辆；请以佛山地铁官方资料核对线路。',photo:'https://commons.wikimedia.org/wiki/Special:FilePath/Guangzhou-Zhaoqing_Intercity_Rail_CRH6_Train_Arriving_at_Foshanxi_Railway_Station_Platform_19.jpg?width=900',photoPage:'https://commons.wikimedia.org/wiki/File:Guangzhou-Zhaoqing_Intercity_Rail_CRH6_Train_Arriving_at_Foshanxi_Railway_Station_Platform_19.jpg',photoQuery:'Foshan Metro train station',map:'https://commons.wikimedia.org/wiki/Special:FilePath/Pearl_River_Delta_Metro_and_Railway_Map.svg?width=850',mapPage:'https://commons.wikimedia.org/wiki/File:Pearl_River_Delta_Metro_and_Railway_Map.svg',logoQuery:'Foshan Metro logo',official:'https://www.fmetro.net/',officialMap:'https://www.fmetro.net/upload/main/contentmanage/article/file/2024/08/19/202408191534278940.pdf'},
    {name:'深圳地铁',label:'SHENZHEN METRO',code:'szmetro',desc:'深圳地铁列车及线网图参考；实际运营线路请核对官网。',photo:'https://commons.wikimedia.org/wiki/Special:FilePath/L13_Train_%281326%29_at_CRRC_Guangdong_Base%2C_Shenzhen_Metro_20260218.jpg?width=900',photoPage:'https://commons.wikimedia.org/wiki/File:L13_Train_(1326)_at_CRRC_Guangdong_Base,_Shenzhen_Metro_20260218.jpg',photoQuery:'Shenzhen Metro train',map:'https://commons.wikimedia.org/wiki/Special:FilePath/Shenzhen_Metro_%28Rapid_Transit%29_System_Map.svg?width=850',mapPage:'https://commons.wikimedia.org/wiki/File:Shenzhen_Metro_(Rapid_Transit)_System_Map.svg',logoQuery:'Shenzhen Metro logo',official:'https://www.szmc.net/',officialMap:'https://www.sz.gov.cn/xxgk/sydwxxgk/jt/dt/ywxx/dtxlxx/content/mpost_11086804.html'},
    {name:'东莞轨道交通',label:'DONGGUAN RAIL TRANSIT',code:'dgmetro',desc:'东莞轨道交通列车／车站参考；不同线路运营主体以官方公布为准。',photo:'https://commons.wikimedia.org/wiki/Special:FilePath/Dongguan_Rail_Transit_Line_1_Train.jpg?width=900',photoPage:'https://commons.wikimedia.org/wiki/File:Dongguan_Rail_Transit_Line_1_Train.jpg',photoQuery:'Dongguan Rail Transit train station',map:'https://commons.wikimedia.org/wiki/Special:FilePath/Dongguan_Rail_Transit_System_Map.svg?width=850',mapPage:'https://commons.wikimedia.org/wiki/File:Dongguan_Rail_Transit_System_Map.svg',logoQuery:'Dongguan Rail Transit logo',official:'http://www.dggdjt.com/',officialMap:'http://www.dggdjt.com/'},
    {name:'港铁 MTR',label:'HONG KONG MTR',code:'hkmtr',desc:'香港港铁列车及铁路网络示意图。',photo:'https://commons.wikimedia.org/wiki/Special:FilePath/MTR-train.jpg?width=900',photoPage:'https://commons.wikimedia.org/wiki/File:MTR-train.jpg',photoQuery:'Hong Kong MTR train',map:'https://commons.wikimedia.org/wiki/Special:FilePath/Hong_Kong_Railway_Route_Map_en.svg?width=850',mapPage:'https://commons.wikimedia.org/wiki/File:Hong_Kong_Railway_Route_Map_en.svg',logoQuery:'MTR Corporation logo Hong Kong',official:'https://www.mtr.com.hk/',officialMap:'https://www.mtr.com.hk/en/customer/services/system_map.html'},
    {name:'澳门轻轨',label:'MACAU LRT',code:'macau',desc:'澳门轻轨列车参考；运营、建设与规划线路请以官方公告核对。',photo:'https://commons.wikimedia.org/wiki/Special:FilePath/Macau_LRT_Train.jpg?width=900',photoPage:'https://commons.wikimedia.org/wiki/File:Macau_LRT_Train.jpg',photoQuery:'Macau LRT train',map:'https://commons.wikimedia.org/wiki/Special:FilePath/MLRT_Route_Map_Planning.svg?width=850',mapPage:'https://commons.wikimedia.org/wiki/File:MLRT_Route_Map_Planning.svg',logoQuery:'Macau LRT logo',official:'https://www.mlm.com.mo/sc/index.html',officialMap:'https://www.mlm.com.mo/sc/index.html'},
    {name:'广东城际铁路',label:'GUANGDONG INTERCITY',code:'gdintercity',desc:'广肇城际 CRH6A 动车组参考图，线路图为公开资料示意。',photo:'https://commons.wikimedia.org/wiki/Special:FilePath/Guangzhou-Zhaoqing_Intercity_Rail_CRH6_Train_Arriving_at_Foshanxi_Railway_Station_Platform_19.jpg?width=900',photoPage:'https://commons.wikimedia.org/wiki/File:Guangzhou-Zhaoqing_Intercity_Rail_CRH6_Train_Arriving_at_Foshanxi_Railway_Station_Platform_19.jpg',photoQuery:'Guangdong Intercity CRH6 train',map:'https://commons.wikimedia.org/wiki/Special:FilePath/PRDIR_%28GBA_Intercity%29_Diagram_%28CHS%26ENG%2C_svg%2C_by_Sir1L0n%29.svg?width=850',mapPage:'https://commons.wikimedia.org/wiki/File:PRDIR_(GBA_Intercity)_Diagram_(CHS%26ENG,_svg,_by_Sir1L0n).svg',logoQuery:'Pearl River Delta Intercity Railway logo',official:'https://www.gzmtr.com/',officialMap:'https://gdcj.gzmtr.com/wxMetro/ccyjxz/xltxz.html'},
    {name:'清远磁浮',label:'QINGYUAN MAGLEV',code:'qingyuan',desc:'清远磁浮列车驶入银盏站的参考图。',photo:'https://commons.wikimedia.org/wiki/Special:FilePath/QY03_entering_Maglev_Yinzhan_Station%2C_Qingyuan_Maglev_20240206.jpg?width=900',photoPage:'https://commons.wikimedia.org/wiki/File:QY03_entering_Maglev_Yinzhan_Station,_Qingyuan_Maglev_20240206.jpg',photoQuery:'Qingyuan Maglev train Yinzhan station',map:'https://commons.wikimedia.org/wiki/Special:FilePath/Actual_Route_of_Qingyuan_Maglev_Tourist_Line.png?width=850',mapPage:'https://commons.wikimedia.org/wiki/File:Actual_Route_of_Qingyuan_Maglev_Tourist_Line.png',logoQuery:'Qingyuan Maglev logo',official:'https://www.gdqycf.com/',officialMap:'https://www.gdqycf.com/show/12/456/1'},
    {name:'广铁集团 · 广东省内国铁',label:'GUANGZHOU RAILWAY GROUP',code:'cr-guangzhou',desc:'广州南站及高速列车参考；广东省内普速、高速线路需结合铁路官方资料核对。',photo:'https://commons.wikimedia.org/wiki/Special:FilePath/Guangzhou_South_Station_with_trains.jpg?width=900',photoPage:'https://commons.wikimedia.org/wiki/File:Guangzhou_South_Station_with_trains.jpg',photoQuery:'Guangzhou South railway station high speed train',map:'https://commons.wikimedia.org/wiki/Special:FilePath/Map_of_Intercity_Passenger_Rail_System_in_Pearl_River_Delta_Area%2C_China.png?width=850',mapPage:'https://commons.wikimedia.org/wiki/File:Map_of_Intercity_Passenger_Rail_System_in_Pearl_River_Delta_Area,_China.png',logoQuery:'China Railway Guangzhou Group logo',official:'https://www.china-railway.com.cn/',officialMap:'https://www.12306.cn/'}
  ];
  const logoFallback = (name, code='RAIL') => 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="320" height="100" viewBox="0 0 320 100"><rect width="320" height="100" rx="10" fill="#f8fbfa"/><rect x="10" y="10" width="80" height="80" rx="9" fill="#102b3a"/><path d="M23 63H77M30 30H70V54H30Z" fill="none" stroke="#65c6b4" stroke-width="4"/><text x="50" y="48" fill="#f8fbfa" text-anchor="middle" font-family="Arial,sans-serif" font-weight="700" font-size="16">${esc(code.slice(0,5))}</text><text x="104" y="42" fill="#173347" font-family="sans-serif" font-size="15" font-weight="700">${esc(name.slice(0,13))}</text><text x="104" y="64" fill="#168f86" font-family="Arial,sans-serif" font-size="9" letter-spacing="1">TEXT MARK / NOT OFFICIAL</text><text x="104" y="82" fill="#758990" font-family="sans-serif" font-size="10">文字识别回退标识</text></svg>`);
  const apiCache = new Map();
  async function commonsSearch(query, mode='photo') {
    const key=mode+'|'+query;
    if(apiCache.has(key)) return apiCache.get(key);
    const promise=(async()=>{
      try {
        const url=new URL('https://commons.wikimedia.org/w/api.php');
        url.searchParams.set('action','query'); url.searchParams.set('generator','search'); url.searchParams.set('gsrsearch',query); url.searchParams.set('gsrnamespace','6'); url.searchParams.set('gsrlimit','8'); url.searchParams.set('prop','imageinfo'); url.searchParams.set('iiprop','url|extmetadata'); url.searchParams.set('iiurlwidth',mode==='logo'?'360':'900'); url.searchParams.set('format','json'); url.searchParams.set('origin','*');
        const response=await fetch(url.toString(),{headers:{Accept:'application/json'}}); if(!response.ok) return null;
        const data=await response.json(); const pages=Object.values(data.query?.pages||{});
        const scored=pages.map(p=>{const title=(p.title||''); const info=p.imageinfo?.[0]; if(!info) return null; const ext=(title.split('.').pop()||'').toLowerCase(); const bad=/map|linemap|route|diagram|schedule|timetable|flag|icon/i.test(title); if(mode==='photo' && !['jpg','jpeg','png','webp'].includes(ext)) return null; if(mode==='photo' && bad) return null; if(mode==='logo' && !['svg','png','jpg','jpeg','webp'].includes(ext)) return null; let score=0; for(const token of query.toLowerCase().split(/\s+/).filter(x=>x.length>2)) if(title.toLowerCase().includes(token)) score+=3; if(mode==='logo' && /logo|mark|symbol/i.test(title)) score+=15; if(mode==='photo' && /train|station|metro|rail|tram|maglev|crh|em u/i.test(title)) score+=6; if(info.extmetadata?.LicenseShortName) score+=1; return {title,url:info.thumburl||info.url,page:encodeFileTitle(title),artist:(info.extmetadata?.Artist?.value||'').replace(/<[^>]*>/g,'').trim(),license:(info.extmetadata?.LicenseShortName?.value||info.extmetadata?.LicenseShortName||'').toString().replace(/<[^>]*>/g,'').trim(),score};}).filter(Boolean).sort((a,b)=>b.score-a.score);
        return scored[0]||null;
      } catch { return null; }
    })(); apiCache.set(key,promise); return promise;
  }
  function setImage(img, found, statusEl, sourceLink) {
    if(!found || !found.url) return false;
    img.dataset.dynamicSource='commons'; img.dataset.sourcePage=found.page; img.alt = img.alt || found.title; img.title = `${found.title}\n图源：Wikimedia Commons${found.license?' · '+found.license:''}${found.artist?' · '+found.artist:''}`;
    img.onerror=()=>{img.onerror=null; const fallback=img.dataset.fallbackSrc; if(fallback) img.src=fallback; else img.src=logoFallback(img.alt||'铁路图像'); if(statusEl) statusEl.textContent='已切换回退图';};
    img.src=found.url;
    if(statusEl) statusEl.textContent=found.license?`Wikimedia Commons · ${found.license}`:'Wikimedia Commons 图源';
    if(sourceLink){sourceLink.href=found.page;sourceLink.hidden=false;sourceLink.textContent='实际图片／标志来源 ↗';}
    return true;
  }
  const localFallbackFor = code => `assets/atlas-photo-fallbacks/${code}.svg`;

  if(root) {
    root.innerHTML=items.map((it,i)=>{
      const logo=staticLogo[it.name]; const logoInitial=logo?.src||logoFallback(it.name,it.code);
      return `<article class="operator-media-card" data-operator-media data-photo-query="${esc(it.photoQuery)}" data-logo-query="${esc(it.logoQuery)}">
        <div class="operator-media-brandline"><img class="operator-media-logo" src="${esc(logoInitial)}" data-fallback-src="assets/operator-logos/${esc(it.code)}.svg" alt="${esc(it.name)}标志；无法读取时显示非官方文字回退标识" loading="lazy"><div><strong>${esc(it.name)}</strong><span class="operator-logo-status" data-logo-status>${logo?'尝试读取官方标志':'正在查找公开标志'}</span></div></div>
        <a class="operator-media-photo" href="${esc(it.photoPage)}" target="_blank" rel="noopener noreferrer"><img src="${esc(it.photo)}" data-fallback-src="${esc(localFallbackFor(it.code))}" alt="${esc(it.name)}相关列车或车站图片" loading="lazy"><span>${esc(it.label)}</span></a>
        <div class="operator-media-card-body"><p class="operator-media-caption">${esc(it.desc)}</p>
        <a class="operator-media-map" href="${esc(it.mapPage)}" target="_blank" rel="noopener noreferrer"><img src="${esc(it.map)}" data-fallback-src="assets/atlas-map-fallbacks/${esc(it.code)}.svg" alt="${esc(it.name)}线路图" loading="lazy"></a>
        <div class="operator-media-links"><a class="operator-logo-source" href="${esc(logo?.page||it.official)}" target="_blank" rel="noopener noreferrer">标志来源 ↗</a><a href="${esc(it.photoPage)}" target="_blank" rel="noopener noreferrer">列车／站内图来源 ↗</a><a href="${esc(it.mapPage)}" target="_blank" rel="noopener noreferrer">线路图原始来源 ↗</a><a href="${esc(it.official)}" target="_blank" rel="noopener noreferrer">运营方官网 ↗</a><a href="${esc(it.officialMap)}" target="_blank" rel="noopener noreferrer">官方线网图／线路信息 ↗</a></div></div>
      </article>`;
    }).join('');
  }

  const photoByName={
    '广州地铁':'https://commons.wikimedia.org/wiki/Special:FilePath/A10_Train_%2812x005-006%29_and_B12_Train_%2807x101-102_and_07x105-106%29_at_Guangzhou_CRRC_Base%2C_Guangzhou_Metro_20240331.jpg?width=650',
    '佛山地铁与广佛线':'https://commons.wikimedia.org/wiki/Special:FilePath/Guangzhou-Zhaoqing_Intercity_Rail_CRH6_Train_Arriving_at_Foshanxi_Railway_Station_Platform_19.jpg?width=650',
    '深圳地铁':'https://commons.wikimedia.org/wiki/Special:FilePath/L13_Train_%281326%29_at_CRRC_Guangdong_Base%2C_Shenzhen_Metro_20260218.jpg?width=650',
    '港铁 MTR':'https://commons.wikimedia.org/wiki/Special:FilePath/MTR-train.jpg?width=650',
    '东莞轨道交通':'https://commons.wikimedia.org/wiki/Special:FilePath/Dongguan_Rail_Transit_Line_1_Train.jpg?width=650',
    '澳门轻轨':'https://commons.wikimedia.org/wiki/Special:FilePath/Macau_LRT_Train.jpg?width=650',
    '广东城际铁路':'https://commons.wikimedia.org/wiki/Special:FilePath/Guangzhou-Zhaoqing_Intercity_Rail_CRH6_Train_Arriving_at_Foshanxi_Railway_Station_Platform_19.jpg?width=650',
    '中国国家铁路集团':'https://commons.wikimedia.org/wiki/Special:FilePath/Guangzhou_South_Station_with_trains.jpg?width=650',
    '中国铁路 12306':'https://commons.wikimedia.org/wiki/Special:FilePath/Guangzhou_South_Station_with_trains.jpg?width=650',
    '港铁高速铁路':'https://commons.wikimedia.org/wiki/Special:FilePath/Guangzhou_South_Station_with_trains.jpg?width=650'
  };
  const photoQueryFor=name=>`${name} train railway station`;
  const logoQueryFor=name=>`${name} official logo`;
  const generic=(name,kind)=>'data:image/svg+xml;charset=utf-8,'+encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="800" height="220" viewBox="0 0 800 220"><rect width="800" height="220" fill="#102b3a"/><path d="M0 165H800" stroke="#65c6b4" stroke-width="5"/><path d="M35 175H765" stroke="#8cb4c2" stroke-width="2"/><g transform="translate(65 55)"><path d="M0 72Q10 15 55 15H470Q505 15 525 60V115H0Z" fill="#eef6f3"/><path d="M55 27H462Q480 27 496 52H45Z" fill="#9acdd4"/><path d="M14 71H510V95H14Z" fill="#168f86"/><path d="M120 29V69M195 29V69M270 29V69M345 29V69M420 29V69" stroke="#16394b" stroke-width="5"/><circle cx="56" cy="107" r="7" fill="#65c6b4"/><circle cx="467" cy="107" r="7" fill="#65c6b4"/></g><text x="28" y="30" fill="#65c6b4" font-size="12" font-family="Arial" letter-spacing="3">${esc(kind)}</text><text x="30" y="208" fill="#f8fbfa" font-size="17" font-family="Arial" font-weight="700">${esc(name)}</text><text x="770" y="208" text-anchor="end" fill="#c7deda" font-size="11" font-family="Arial">GENERIC RAIL VISUAL · 非该公司实拍图</text></svg>`);

  const cardObserver = new IntersectionObserver(entries=>{
    entries.forEach(entry=>{
      if(!entry.isIntersecting) return;
      const card=entry.target; cardObserver.unobserve(card);
      const photo=card.querySelector('.operator-media-photo img'); const logo=card.querySelector('.operator-media-logo');
      const photoStatus=null; const logoStatus=card.querySelector('[data-logo-status]'); const logoSource=card.querySelector('.operator-logo-source');
      const photoQuery=card.dataset.photoQuery, logoQuery=card.dataset.logoQuery;
      const lookupLogo=()=>commonsSearch(logoQuery,'logo').then(found=>{if(found && !logo.dataset.dynamicSource) setImage(logo,found,logoStatus,logoSource);});
      if(logo && logoQuery && !logo.dataset.dynamicSource) {
        if(!staticLogo[card.querySelector('.operator-media-brandline strong')?.textContent.trim()]) lookupLogo();
        else setTimeout(()=>{if(!logo.dataset.dynamicSource && (logo.getAttribute('src')||'').includes('assets/operator-logos/')) lookupLogo();},1200);
      }
      if(photo && photoQuery) setTimeout(()=>{
        const current=photo.getAttribute('src')||'';
        if(!photo.dataset.dynamicSource && (current.includes('assets/atlas-photo-fallbacks/') || current.startsWith('data:'))) {
          commonsSearch(photoQuery,'photo').then(found=>{if(found && !photo.dataset.dynamicSource) {setImage(photo,found,null,null); const anchor=photo.closest('a'); if(anchor) anchor.href=found.page;}});
        }
      },1400);
    });
  },{rootMargin:'450px 0px'});
  document.querySelectorAll('[data-operator-media]').forEach(card=>cardObserver.observe(card));

  // Directory cards: each gets a real-photo lookup and a logo lookup on demand. If Commons is unavailable,
  // local themed pictures and explicitly labelled text marks remain visible instead of creating empty cards.
  const photoObserver = new IntersectionObserver(entries=>{
    entries.forEach(entry=>{
      if(!entry.isIntersecting) return;
      const card=entry.target; photoObserver.unobserve(card);
      const title=card.querySelector('strong')?.textContent.trim()||'铁路运营方';
      if(card.querySelector('.operator-card-media')) return;
      const code=card.querySelector('.operator-code')?.textContent.trim()||'RAIL';
      const lowerTitle=title.toLowerCase();
      const fallbackName=code.includes('TRAM')||code.includes('LRT')?'tram.svg':(/RAIL|HSR|MAINLINE|TICKETS/.test(code)?'rail.svg':'metro.svg');
      const fallPath=`assets/operator-thumbnails/${fallbackName}`;
      const logo = staticLogo[title] || null;
      const top = card.querySelector('.operator-card-top');
      const initialPhoto=photoByName[title] || fallPath;
      const imgWrap=document.createElement('span');imgWrap.className='operator-card-media';
      const img=document.createElement('img');img.src=initialPhoto;img.alt=photoByName[title]?`${title}相关列车或车站参考图`:`${title}铁路交通示意图；尝试读取共享资源实拍图片`;img.loading='lazy';img.dataset.fallbackSrc=fallPath;
      imgWrap.appendChild(img); if(top) card.insertBefore(imgWrap,top);
      const brand=document.createElement('span');brand.className='operator-card-logo-row';
      const brandImg=document.createElement('img'); brandImg.alt=`${title}标志；失败时显示非官方文字标识`;brandImg.loading='lazy';brandImg.src=logo?.src||logoFallback(title,code);brandImg.dataset.fallbackSrc=`assets/operator-logos/${(/广州/.test(title)?'gzmetro':/佛山/.test(title)?'foshan':/深圳/.test(title)?'szmetro':/东莞/.test(title)?'dgmetro':/澳门/.test(title)?'macau':/港铁|香港/.test(title)?'hkmtr':/城际/.test(title)?'gdintercity':/清远/.test(title)?'qingyuan':'cr-guangzhou')}.svg`;
      const brandLabel=document.createElement('span');brandLabel.className='operator-card-logo-caption';brandLabel.textContent=logo?'官方标志来源':'尝试读取公开标志';brand.append(brandImg,brandLabel); if(top) top.insertAdjacentElement('afterend',brand); else card.insertBefore(brand,card.firstChild);
      // Search Commons after the local fallback has already made the card usable.
      if(!photoByName[title]) commonsSearch(photoQueryFor(title),'photo').then(found=>{if(found) setImage(img,found,null,null);});
      if(!logo) commonsSearch(logoQueryFor(title),'logo').then(found=>{if(found && !brandImg.dataset.dynamicSource){setImage(brandImg,found,{set textContent(v){brandLabel.textContent=v}},null);}});
      if(logo) { brandImg.title='Wikimedia Commons logo file; opening operator card opens the official website'; }
    });
  },{rootMargin:'450px 0px'});
  document.querySelectorAll('[data-operator-card]').forEach(card=>photoObserver.observe(card));
})();
