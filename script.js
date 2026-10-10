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
})();
