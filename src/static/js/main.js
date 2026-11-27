// 10pm crafts: menu, scroll reveal, project gallery. No dependencies.
(() => {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];

  // Remember the language the visitor picked, so the home page stops auto-redirecting.
  $$('[data-lang]').forEach((a) =>
    a.addEventListener('click', () => {
      try { localStorage.setItem('lang', a.dataset.lang); } catch (e) {}
    }),
  );

  // Header border once the page scrolls.
  const header = $('.site-header');
  const onScroll = () => header && header.classList.toggle('is-scrolled', scrollY > 8);
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Full-screen menu with photos.
  const menu = $('#site-menu');
  const menuBtn = $('.menu-btn');
  const openMenu = () => {
    menu.hidden = false;
    requestAnimationFrame(() => menu.classList.add('is-open'));
    menuBtn.setAttribute('aria-expanded', 'true');
    document.body.classList.add('menu-open');
    $('.menu-close', menu).focus();
  };
  const closeMenu = () => {
    menu.classList.remove('is-open');
    menuBtn.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('menu-open');
    setTimeout(() => (menu.hidden = true), 250);
    menuBtn.focus();
  };
  menuBtn && menuBtn.addEventListener('click', openMenu);
  menu && $('.menu-close', menu).addEventListener('click', closeMenu);

  // Fade sections in as they scroll into view.
  const reveals = $$('.reveal');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && (e.target.classList.add('is-in'), io.unobserve(e.target))),
      { rootMargin: '0px 0px -8% 0px' },
    );
    reveals.forEach((el) => io.observe(el));
  } else reveals.forEach((el) => el.classList.add('is-in'));

  // ---------- home page photo, with arrows ----------
  const hero = $('.hero-gallery');
  if (hero) {
    const slides = $$('.hero-slide', hero);
    const dots = $$('.hero-dots button', hero);
    let h = 0;
    const go = (k) => {
      k = (k + slides.length) % slides.length;
      slides[h].hidden = true;
      dots[h] && dots[h].classList.remove('is-active');
      h = k;
      slides[h].hidden = false;
      dots[h] && dots[h].classList.add('is-active');
    };
    const heroPrev = $('.hero-prev', hero);
    const heroNext = $('.hero-next', hero);
    heroPrev && heroPrev.addEventListener('click', () => go(h - 1));
    heroNext && heroNext.addEventListener('click', () => go(h + 1));
    dots.forEach((d, k) => d.addEventListener('click', () => go(k)));
    let hx = null;
    hero.addEventListener('touchstart', (e) => { hx = e.touches[0].clientX; }, { passive: true });
    hero.addEventListener('touchend', (e) => {
      if (hx === null) return;
      const dx = e.changedTouches[0].clientX - hx;
      if (Math.abs(dx) > 50) go(h + (dx < 0 ? 1 : -1));
      hx = null;
    });
  }

  // ---------- past work: click a photo to see it large, with its caption ----------
  const pastBox = $('.past-box');
  if (pastBox && pastBox.showModal) {
    const items = $$('.past-item');
    let p = 0;
    const showPast = (k) => {
      p = (k + items.length) % items.length;
      const img = $('img', pastBox);
      img.src = items[p].dataset.full;
      img.alt = items[p].dataset.caption || '';
      const cap = $('figcaption', pastBox);
      cap.textContent = items[p].dataset.caption || '';
      cap.hidden = !cap.textContent;
    };
    items.forEach((it, k) => it.addEventListener('click', () => { showPast(k); pastBox.showModal(); }));
    $('.past-close', pastBox).addEventListener('click', () => pastBox.close());
    $('.past-prev', pastBox).addEventListener('click', () => showPast(p - 1));
    $('.past-next', pastBox).addEventListener('click', () => showPast(p + 1));
    pastBox.addEventListener('click', (e) => e.target === pastBox && pastBox.close());
    pastBox.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') showPast(p - 1);
      if (e.key === 'ArrowRight') showPast(p + 1);
    });
    if (items.length < 2) $$('.past-prev, .past-next', pastBox).forEach((b) => (b.hidden = true));
  }

  // ---------- project gallery ----------
  // Left/right walks through the photos; past the first or last photo it goes to the
  // previous or next project of the same category.
  const project = $('.project');
  const lightbox = $('.lightbox');
  let lbOpen = false;
  if (project) {
    const slides = $$('.slide', project);
    const thumbs = $$('.thumb', project);
    const prevBtn = $('.stage-prev', project);
    const nextBtn = $('.stage-next', project);
    const hint = $('.stage-hint', project);
    const count = $('.stage-count b', project);
    const { prev: prevUrl, next: nextUrl } = project.dataset;
    let i = 0;
    let hintTimer;

    const imgSrc = (k) => {
      const img = $('img', slides[k]);
      return img.currentSrc || img.src;
    };

    const label = () => {
      const atStart = i === 0;
      const atEnd = i === slides.length - 1;
      for (const [btn, edge, url] of [[prevBtn, atStart, prevUrl], [nextBtn, atEnd, nextUrl]]) {
        const toProject = edge;
        btn.classList.toggle('is-project', toProject && !!url);
        btn.setAttribute('aria-label', toProject ? btn.dataset.labelProject : btn.dataset.labelPhoto);
        btn.setAttribute('aria-disabled', toProject && !url ? 'true' : 'false');
      }
    };

    const show = (k) => {
      slides[i].hidden = true;
      slides[i].classList.remove('is-active');
      thumbs[i] && thumbs[i].classList.remove('is-active');
      i = k;
      slides[i].hidden = false;
      slides[i].classList.add('is-active');
      if (thumbs[i]) {
        thumbs[i].classList.add('is-active');
        thumbs[i].scrollIntoView({ block: 'nearest', inline: 'nearest' });
      }
      if (count) count.textContent = i + 1;
      if (lbOpen) $('img', lightbox).src = imgSrc(i);
      label();
      // Tell the visitor that the next press leaves this project.
      clearTimeout(hintTimer);
      const edgeBtn = i === slides.length - 1 && nextUrl ? nextBtn : i === 0 && prevUrl && slides.length > 1 ? prevBtn : null;
      if (edgeBtn && hint) {
        hint.textContent = edgeBtn.dataset.labelProject + (edgeBtn === nextBtn ? ' →' : '');
        if (edgeBtn === prevBtn) hint.textContent = '← ' + edgeBtn.dataset.labelProject;
        hint.classList.add('is-visible');
        hintTimer = setTimeout(() => hint.classList.remove('is-visible'), 1800);
      } else hint && hint.classList.remove('is-visible');
    };

    const step = (dir) => {
      const k = i + dir;
      if (k >= 0 && k < slides.length) return show(k), true;
      const url = dir > 0 ? nextUrl : prevUrl;
      if (url) location.href = url;
      return false;
    };

    prevBtn.addEventListener('click', (e) => { e.preventDefault(); step(-1); });
    nextBtn.addEventListener('click', (e) => { e.preventDefault(); step(1); });
    thumbs.forEach((t, k) => t.addEventListener('click', () => show(k)));
    label();

    // Swipe on touch screens.
    const stage = $('.stage', project);
    let x0 = null, y0 = null;
    stage.addEventListener('touchstart', (e) => { x0 = e.touches[0].clientX; y0 = e.touches[0].clientY; }, { passive: true });
    stage.addEventListener('touchend', (e) => {
      if (x0 === null) return;
      const dx = e.changedTouches[0].clientX - x0;
      const dy = e.changedTouches[0].clientY - y0;
      if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) step(dx < 0 ? 1 : -1);
      x0 = null;
    });

    // Lightbox (click a photo to see it large).
    const openLb = () => {
      $('img', lightbox).src = imgSrc(i);
      $('img', lightbox).alt = $('img', slides[i]).alt;
      lightbox.hidden = false;
      lbOpen = true;
      document.body.classList.add('menu-open');
      $('.lb-close', lightbox).focus();
    };
    const closeLb = () => {
      lightbox.hidden = true;
      lbOpen = false;
      document.body.classList.remove('menu-open');
    };
    slides.forEach((s) => $('img', s).addEventListener('click', openLb));
    $('.lb-close', lightbox).addEventListener('click', closeLb);
    $('.lb-prev', lightbox).addEventListener('click', () => show((i - 1 + slides.length) % slides.length));
    $('.lb-next', lightbox).addEventListener('click', () => show((i + 1) % slides.length));
    lightbox.addEventListener('click', (e) => e.target === lightbox && closeLb());
    if (slides.length < 2) $$('.lb-btn', lightbox).forEach((b) => (b.hidden = true));

    document.addEventListener('keydown', (e) => {
      if (e.altKey || e.ctrlKey || e.metaKey || /input|textarea|select/i.test(e.target.tagName)) return;
      if (menu && !menu.hidden) return;
      if (e.key === 'ArrowLeft') lbOpen ? show((i - 1 + slides.length) % slides.length) : step(-1);
      if (e.key === 'ArrowRight') lbOpen ? show((i + 1) % slides.length) : step(1);
      if (e.key === 'Escape' && lbOpen) closeLb();
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && menu && !menu.hidden) closeMenu();
  });
})();
