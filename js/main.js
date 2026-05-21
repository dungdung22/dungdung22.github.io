(function () {
  'use strict';

  const AGE_KEY = 'yokai_age_verified';
  const CHAR_IDS = ['baekyeon', 'karhan', 'jeokho'];

  let galleryData = [];
  let filteredItems = [];
  let lightboxIndex = 0;
  let selectCharacter = null;

  function ready(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn);
    } else {
      fn();
    }
  }

  ready(function () {
    bindAgeGate();
    if (sessionStorage.getItem(AGE_KEY)) {
      unlockSite();
    }
  });

  function bindAgeGate() {
    document.getElementById('age-confirm')?.addEventListener('click', unlockSite);
    document.getElementById('age-deny')?.addEventListener('click', function () {
      window.location.href = 'https://www.google.com';
    });
  }

  function unlockSite() {
    document.getElementById('age-gate')?.classList.add('hidden');
    document.getElementById('site')?.classList.remove('hidden');
    sessionStorage.setItem(AGE_KEY, '1');
    bootSite();
  }

  let booted = false;
  function bootSite() {
    if (booted) return;
    booted = true;

    safeRun(initParticles);
    safeRun(initHero);
    safeRun(initNav);
    safeRun(initCharacters);
    safeRun(initRegions);
    safeRun(initGallery);
    safeRun(initReveal);
  }

  function safeRun(fn) {
    try { fn(); } catch (err) { console.error('[yokai]', err); }
  }

  // ── Particles ──
  function initParticles() {
    const canvas = document.getElementById('particles');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let w = 0;
    let h = 0;
    let particles = [];
    const COUNT = window.innerWidth < 768 ? 30 : 55;

    function resize() {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    }

    function createParticle() {
      return {
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() * 1.8 + 0.4,
        vx: (Math.random() - 0.5) * 0.3,
        vy: -Math.random() * 0.5 - 0.1,
        alpha: Math.random() * 0.4 + 0.1,
        hue: Math.random() > 0.66 ? 200 : Math.random() > 0.5 ? 35 : 280,
      };
    }

    function init() {
      resize();
      particles = Array.from({ length: COUNT }, createParticle);
    }

    function draw() {
      ctx.clearRect(0, 0, w, h);
      particles.forEach(function (p) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.y < -10) { p.y = h + 10; p.x = Math.random() * w; }
        if (p.x < -10) p.x = w + 10;
        if (p.x > w + 10) p.x = -10;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = 'hsla(' + p.hue + ', 60%, 70%, ' + p.alpha + ')';
        ctx.fill();
      });
      requestAnimationFrame(draw);
    }

    init();
    draw();
    window.addEventListener('resize', init, { passive: true });
  }

  // ── Hero ──
  function initHero() {
    const slides = Array.from(document.querySelectorAll('.hero__slide'));
    const dots = Array.from(document.querySelectorAll('.hero__dot'));
    if (!slides.length) return;

    let current = 0;
    let timer = null;

    function goTo(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (s, i) {
        s.classList.toggle('hero__slide--active', i === current);
      });
      dots.forEach(function (d, i) {
        d.classList.toggle('hero__dot--active', i === current);
        d.setAttribute('aria-selected', String(i === current));
      });
    }

    function next() { goTo(current + 1); }
    function startAutoplay() {
      clearInterval(timer);
      timer = setInterval(next, 5000);
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        goTo(Number(dot.dataset.slide));
        startAutoplay();
      });
    });

    startAutoplay();

    const hero = document.querySelector('.hero');
    window.addEventListener('scroll', function () {
      if (!hero) return;
      const y = window.scrollY;
      const content = hero.querySelector('.hero__content');
      if (content && y < window.innerHeight) {
        content.style.transform = 'translateY(' + (y * 0.25) + 'px)';
        content.style.opacity = String(Math.max(0, 1 - y / (window.innerHeight * 0.8)));
      }
    }, { passive: true });
  }

  // ── Nav ──
  function initNav() {
    const toggle = document.getElementById('nav-toggle');
    const menu = document.getElementById('nav-menu');
    const header = document.querySelector('.header');
    const progress = document.getElementById('scroll-progress');
    const navLinks = document.querySelectorAll('[data-nav]');
    const sections = ['world', 'characters', 'regions', 'gallery']
      .map(function (id) { return document.getElementById(id); })
      .filter(Boolean);

    toggle?.addEventListener('click', function () {
      const open = menu.classList.toggle('nav__menu--open');
      toggle.classList.toggle('is-open', open);
      toggle.setAttribute('aria-expanded', String(open));
      document.body.style.overflow = open ? 'hidden' : '';
    });

    menu?.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        menu.classList.remove('nav__menu--open');
        toggle?.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      });
    });

    window.addEventListener('scroll', function () {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (progress) progress.style.width = (docHeight > 0 ? (scrollTop / docHeight) * 100 : 0) + '%';
      header?.classList.toggle('header--scrolled', scrollTop > 20);

      let active = 'world';
      sections.forEach(function (sec) {
        if (scrollTop >= sec.offsetTop - 120) active = sec.id;
      });
      navLinks.forEach(function (link) {
        link.classList.toggle('is-active', link.dataset.nav === active);
      });
    }, { passive: true });
  }

  // ── Characters ──
  function initCharacters() {
    const tabs = Array.from(document.querySelectorAll('.char-tab'));
    const panels = Array.from(document.querySelectorAll('.char-panel'));
    const panelsWrap = document.getElementById('char-panels');
    let activeIdx = 0;

    selectCharacter = function (id) {
      const idx = CHAR_IDS.indexOf(id);
      if (idx < 0) return;
      activeIdx = idx;

      tabs.forEach(function (t) {
        const on = t.dataset.char === id;
        t.classList.toggle('char-tab--active', on);
        t.setAttribute('aria-selected', String(on));
      });

      panels.forEach(function (p) {
        const on = p.id === 'panel-' + id;
        p.hidden = !on;
        if (on) {
          p.classList.remove('is-entering');
          void p.offsetWidth;
          p.classList.add('is-entering');
        }
      });

      tabs[idx]?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    };

    tabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        selectCharacter(tab.dataset.char);
      });
    });

    document.querySelectorAll('.char-panel__gallery-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        setGalleryFilter(btn.dataset.char);
        document.getElementById('gallery')?.scrollIntoView({ behavior: 'smooth' });
      });
    });

    if (panelsWrap) {
      let startX = 0;
      let tracking = false;

      panelsWrap.addEventListener('touchstart', function (e) {
        startX = e.touches[0].clientX;
        tracking = true;
      }, { passive: true });

      panelsWrap.addEventListener('touchend', function (e) {
        if (!tracking) return;
        tracking = false;
        const diff = e.changedTouches[0].clientX - startX;
        if (Math.abs(diff) < 60) return;
        if (diff < 0) selectCharacter(CHAR_IDS[(activeIdx + 1) % 3]);
        else selectCharacter(CHAR_IDS[(activeIdx + 2) % 3]);
      }, { passive: true });
    }
  }

  // ── Regions ──
  function initRegions() {
    document.querySelectorAll('.region[data-goto]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        selectCharacter?.(btn.dataset.goto);
        document.getElementById('characters')?.scrollIntoView({ behavior: 'smooth' });
      });
    });
  }

  // ── Gallery ──
  function resolvePath(char, stem, T) {
    const file = (T && T[char] && T[char][stem]) ? T[char][stem] : char + '_' + stem + '.webp';
    return char + '/' + file;
  }

  function initGallery() {
    initLightbox();

    document.querySelectorAll('.gallery-filter').forEach(function (btn) {
      btn.addEventListener('click', function () {
        setGalleryFilter(btn.dataset.filter);
      });
    });

    loadGalleryRules().then(function (rules) {
      buildGalleryData(rules);
      document.getElementById('gallery-count').textContent = String(galleryData.length);
      document.getElementById('gallery-loading')?.classList.add('hidden');
      setGalleryFilter('all');
    }).catch(function () {
      const loading = document.getElementById('gallery-loading');
      if (loading) loading.textContent = '갤러리를 불러오지 못했습니다. 로컬 서버로 열어주세요.';
    });
  }

  function loadGalleryRules() {
    return fetch('img_rules.json')
      .then(function (res) {
        if (!res.ok) throw new Error('fetch failed');
        return res.json();
      })
      .catch(function () {
        if (window.IMG_RULES) return Promise.resolve(window.IMG_RULES);
        return new Promise(function (resolve, reject) {
          const s = document.createElement('script');
          s.src = 'js/img-rules.js';
          s.onload = function () {
            if (window.IMG_RULES) resolve(window.IMG_RULES);
            else reject(new Error('no rules'));
          };
          s.onerror = reject;
          document.head.appendChild(s);
        });
      });
  }

  function buildGalleryData(rules) {
    const T = rules.T || {};
    galleryData = [];
    ['백연', '적호', '카르한'].forEach(function (char) {
      (rules[char] || []).forEach(function (stem) {
        galleryData.push({
          char: char,
          stem: stem,
          path: resolvePath(char, stem, T),
          label: char + ' · ' + stem,
        });
      });
    });
  }

  function setGalleryFilter(filter) {
    document.querySelectorAll('.gallery-filter').forEach(function (btn) {
      const on = btn.dataset.filter === filter;
      btn.classList.toggle('gallery-filter--active', on);
      btn.setAttribute('aria-selected', String(on));
    });

    filteredItems = filter === 'all'
      ? galleryData.slice()
      : galleryData.filter(function (item) { return item.char === filter; });

    renderGallery(filteredItems);
  }

  function renderGallery(items) {
    const grid = document.getElementById('gallery-grid');
    if (!grid) return;

    if (!items.length) {
      grid.innerHTML = '<p class="gallery-empty">표시할 이미지가 없습니다.</p>';
      return;
    }

    grid.innerHTML = items.map(function (item, i) {
      return (
        '<button type="button" class="gallery-item" role="listitem" data-index="' + i + '" style="--i:' + (i % 20) + '" aria-label="' + item.label + '">' +
          '<img src="' + item.path + '" alt="' + item.label + '" loading="lazy" decoding="async">' +
          '<span class="gallery-item__label">' + item.stem + '</span>' +
        '</button>'
      );
    }).join('');

    grid.querySelectorAll('.gallery-item').forEach(function (el) {
      el.addEventListener('click', function () {
        openLightbox(Number(el.dataset.index));
      });
    });
  }

  function initLightbox() {
    const lb = document.getElementById('lightbox');
    document.getElementById('lightbox-close')?.addEventListener('click', closeLightbox);
    document.getElementById('lightbox-prev')?.addEventListener('click', function () { stepLightbox(-1); });
    document.getElementById('lightbox-next')?.addEventListener('click', function () { stepLightbox(1); });

    lb?.addEventListener('click', function (e) {
      if (e.target === lb) closeLightbox();
    });

    document.addEventListener('keydown', function (e) {
      if (lb?.classList.contains('hidden')) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') stepLightbox(-1);
      if (e.key === 'ArrowRight') stepLightbox(1);
    });

    let startX = 0;
    lb?.addEventListener('touchstart', function (e) {
      startX = e.touches[0].clientX;
    }, { passive: true });

    lb?.addEventListener('touchend', function (e) {
      const diff = e.changedTouches[0].clientX - startX;
      if (Math.abs(diff) > 50) stepLightbox(diff < 0 ? 1 : -1);
    }, { passive: true });
  }

  function openLightbox(index) {
    if (!filteredItems.length) return;
    lightboxIndex = index;
    updateLightbox();
    document.getElementById('lightbox')?.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    document.getElementById('lightbox')?.classList.add('hidden');
    document.body.style.overflow = '';
  }

  function stepLightbox(dir) {
    if (!filteredItems.length) return;
    lightboxIndex = (lightboxIndex + dir + filteredItems.length) % filteredItems.length;
    updateLightbox();
  }

  function updateLightbox() {
    const item = filteredItems[lightboxIndex];
    if (!item) return;
    const img = document.getElementById('lightbox-img');
    const cap = document.getElementById('lightbox-caption');
    if (img) {
      img.src = item.path;
      img.alt = item.label;
    }
    if (cap) cap.textContent = item.label + ' (' + (lightboxIndex + 1) + ' / ' + filteredItems.length + ')';
  }

  // ── Reveal ──
  function initReveal() {
    const els = document.querySelectorAll('.reveal');
    if (!('IntersectionObserver' in window)) {
      els.forEach(function (el) { el.classList.add('visible'); });
      return;
    }
    const observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -30px 0px' });
    els.forEach(function (el) { observer.observe(el); });
  }
})();
