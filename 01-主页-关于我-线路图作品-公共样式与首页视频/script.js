(() => {
  const toggle = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.nav-links');

  if (toggle && nav) {
    toggle.addEventListener('click', () => {
      const open = nav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? '关闭导航菜单' : '打开导航菜单');
    });
    nav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
      nav.querySelectorAll('.nav-dropdown').forEach(item => { item.classList.remove('is-open'); item.querySelector('.nav-menu-button')?.setAttribute('aria-expanded', 'false'); });
      nav.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-label', '打开导航菜单');
    }));
  }

  const year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();

  // Video-topic filters. Keep card content editable in index.html.
  const videoFilters = document.querySelectorAll('[data-video-filter]');
  const videoCards = document.querySelectorAll('[data-video-category]');
  videoFilters.forEach(button => {
    button.addEventListener('click', () => {
      const selected = button.dataset.videoFilter;
      videoFilters.forEach(item => {
        const active = item === button;
        item.classList.toggle('is-active', active);
        item.setAttribute('aria-pressed', String(active));
      });
      videoCards.forEach(card => {
        card.hidden = selected !== 'all' && card.dataset.videoCategory !== selected;
      });
    });
  });

  // Map portfolio filters.
  const mapFilters = document.querySelectorAll('[data-map-filter]');
  const mapCards = document.querySelectorAll('[data-map-category]');
  mapFilters.forEach(button => {
    button.addEventListener('click', () => {
      const selected = button.dataset.mapFilter;
      mapFilters.forEach(item => {
        const active = item === button;
        item.classList.toggle('is-active', active);
        item.setAttribute('aria-pressed', String(active));
      });
      mapCards.forEach(card => {
        card.hidden = selected !== 'all' && card.dataset.mapCategory !== selected;
      });
    });
  });

  // Accessible lightbox for the map illustrations.
  const modal = document.getElementById('map-modal');
  const modalImage = document.getElementById('map-modal-image');
  const modalTitle = document.getElementById('map-modal-title');
  const modalDescription = document.getElementById('map-modal-desc');
  const closeModal = modal?.querySelector('.map-modal-close');

  if (modal && modalImage && modalTitle && modalDescription) {
    document.querySelectorAll('[data-map-src]').forEach(button => {
      button.addEventListener('click', () => {
        modalImage.src = button.dataset.mapSrc;
        modalImage.alt = `${button.dataset.mapTitle || '线路图作品'}大图`;
        modalTitle.textContent = button.dataset.mapTitle || '线路图作品';
        modalDescription.textContent = button.dataset.mapDesc || '';
        if (typeof modal.showModal === 'function') modal.showModal();
        else modal.setAttribute('open', '');
      });
    });
    closeModal?.addEventListener('click', () => {
      if (typeof modal.close === 'function') modal.close();
      else modal.removeAttribute('open');
    });
    modal.addEventListener('click', event => {
      if (event.target === modal) {
        if (typeof modal.close === 'function') modal.close();
        else modal.removeAttribute('open');
      }
    });
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && modal.hasAttribute('open')) {
        if (typeof modal.close === 'function') modal.close();
        else modal.removeAttribute('open');
      }
    });
  }


  // Multi-level navigation menus (click-to-open, keyboard/focus friendly).
  document.querySelectorAll('.nav-menu-button').forEach((button) => {
    button.addEventListener('click', () => {
      const dropdown = button.closest('.nav-dropdown');
      const isOpen = dropdown.classList.toggle('is-open');
      button.setAttribute('aria-expanded', String(isOpen));
      document.querySelectorAll('.nav-dropdown').forEach((other) => {
        if (other !== dropdown) {
          other.classList.remove('is-open');
          other.querySelector('.nav-menu-button')?.setAttribute('aria-expanded', 'false');
        }
      });
    });
  });

  // Search and region filters for the operator directory.
  const operatorSearch = document.getElementById('operator-search');
  const operatorRegionButtons = document.querySelectorAll('[data-region-filter]');
  const operatorCards = document.querySelectorAll('[data-operator-card]');
  const operatorRegions = document.querySelectorAll('[data-operator-region]');
  let activeOperatorRegion = 'all';
  const updateOperatorDirectory = () => {
    const query = (operatorSearch?.value || '').trim().toLocaleLowerCase();
    operatorCards.forEach((card) => {
      const regionMatches = activeOperatorRegion === 'all' || card.dataset.region === activeOperatorRegion;
      const textMatches = !query || (card.dataset.search || '').includes(query) || card.textContent.toLocaleLowerCase().includes(query);
      card.hidden = !(regionMatches && textMatches);
    });
    operatorRegions.forEach((region) => {
      const regionMatches = activeOperatorRegion === 'all' || region.dataset.operatorRegion === activeOperatorRegion;
      const visibleCards = region.querySelectorAll('[data-operator-card]:not([hidden])').length;
      region.hidden = !regionMatches || visibleCards === 0;
    });
  };
  operatorSearch?.addEventListener('input', updateOperatorDirectory);
  operatorRegionButtons.forEach((button) => {
    button.addEventListener('click', () => {
      activeOperatorRegion = button.dataset.regionFilter || 'all';
      operatorRegionButtons.forEach((item) => {
        const active = item === button;
        item.classList.toggle('is-active', active);
        item.setAttribute('aria-pressed', String(active));
      });
      updateOperatorDirectory();
    });
  });
})();


// Copy QQ group numbers with a graceful fallback for browsers without clipboard permission.
document.querySelectorAll('[data-copy-qq]').forEach((button) => {
  button.addEventListener('click', async () => {
    const number = button.getAttribute('data-copy-qq');
    try {
      await navigator.clipboard.writeText(number);
      button.textContent = '已复制';
    } catch (error) {
      window.prompt('请复制 QQ 群号：', number);
    }
    window.setTimeout(() => { button.textContent = '复制群号'; }, 1800);
  });

});


document.querySelectorAll('.copy-group').forEach((button) => {
  button.addEventListener('click', async () => {
    const value = button.dataset.copy;
    try {
      await navigator.clipboard.writeText(value);
      const old = button.textContent;
      button.textContent = '已复制';
      window.setTimeout(() => { button.textContent = old; }, 1600);
    } catch (error) { window.prompt('请复制QQ群号：', value); }
  });
});


// Copy the WeChat public-account name so visitors can find it inside WeChat.
document.querySelectorAll('[data-copy-wechat]').forEach((button) => {
  button.addEventListener('click', async () => {
    const accountName = button.getAttribute('data-copy-wechat') || '';
    const previousText = button.textContent;
    try {
      await navigator.clipboard.writeText(accountName);
      button.textContent = '已复制名称';
    } catch (error) {
      window.prompt('请复制公众号名称，并在微信中搜索：', accountName);
    }
    window.setTimeout(() => { button.textContent = previousText; }, 1800);
  });
});
