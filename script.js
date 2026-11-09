(() => {
  const root = document.documentElement;
  const body = document.body;
  const header = document.getElementById('header');
  const nav = document.getElementById('nav');
  const menu = document.querySelector('.menu');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const hasGsap = !!(window.gsap && window.ScrollTrigger);
  if (hasGsap) gsap.registerPlugin(ScrollTrigger);

  /* ---------- Smooth scroll (Lenis) ---------- */
  let lenis = null;
  if (window.Lenis && !reduce) {
    lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
    if (hasGsap) {
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add((t) => lenis.raf(t * 1000));
      gsap.ticker.lagSmoothing(0);
    } else {
      const raf = (t) => { lenis.raf(t); requestAnimationFrame(raf); };
      requestAnimationFrame(raf);
    }
  }

  /* ---------- Mobile menu ---------- */
  const setMenu = (open) => {
    if (!nav || !menu) return;
    nav.classList.toggle('open', open);
    body.classList.toggle('menu-open', open);
    menu.setAttribute('aria-expanded', String(open));
    menu.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    if (lenis) open ? lenis.stop() : lenis.start();
  };
  menu?.addEventListener('click', () => setMenu(!nav.classList.contains('open')));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && nav?.classList.contains('open')) { setMenu(false); menu.focus(); }
  });
  matchMedia('(min-width: 1001px)').addEventListener('change', (e) => { if (e.matches) setMenu(false); });

  /* ---------- In-page links ---------- */
  document.querySelectorAll('a[href^="#"]').forEach((a) => a.addEventListener('click', (e) => {
    const id = a.getAttribute('href');
    const target = id.length > 1 && document.querySelector(id);
    if (!target) return;
    e.preventDefault();
    setMenu(false);
    if (lenis) lenis.scrollTo(target, { offset: -header.offsetHeight + 1, duration: 1.2 });
    else target.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
    history.replaceState(null, '', id);
  }));

  /* ---------- Header state + progress ---------- */
  const bar = document.querySelector('.progress span');
  const floatCta = document.getElementById('float-cta');
  const heroEl = document.querySelector('.hero');
  const contactEl = document.getElementById('contact');
  const onScroll = () => {
    header?.classList.toggle('scrolled', scrollY > 12);
    const max = root.scrollHeight - innerHeight;
    if (bar) bar.style.transform = `scaleX(${max > 0 ? scrollY / max : 0})`;
    // mobile "Let's Talk" button: visible after the hero, hidden once the contact section is on screen
    if (floatCta && heroEl && contactEl) {
      const past = scrollY > heroEl.offsetHeight * 0.8;
      const atContact = contactEl.getBoundingClientRect().top < innerHeight * 0.9;
      floatCta.classList.toggle('show', past && !atContact);
    }
  };
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Active nav link ---------- */
  const links = [...document.querySelectorAll('.site-nav a[href^="#"]')];
  const sections = links.map((a) => document.querySelector(a.getAttribute('href'))).filter(Boolean);
  if ('IntersectionObserver' in window && sections.length) {
    const spy = new IntersectionObserver((entries) => entries.forEach((en) => {
      if (en.isIntersecting) links.forEach((a) => a.classList.toggle('active', a.getAttribute('href') === '#' + en.target.id));
    }), { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach((s) => spy.observe(s));
    addEventListener('scroll', () => {
      if (sections[0].getBoundingClientRect().top > innerHeight * 0.5) links.forEach((a) => a.classList.remove('active'));
    }, { passive: true });
  }

  /* ---------- Custom cursor ---------- */
  if (finePointer && !reduce) {
    const dot = document.querySelector('.cursor-dot');
    const ring = document.querySelector('.cursor-ring');
    let x = -100, y = -100, rx = -100, ry = -100;
    root.classList.add('has-cursor');
    addEventListener('pointermove', (e) => { x = e.clientX; y = e.clientY; dot.style.transform = `translate(${x}px, ${y}px)`; }, { passive: true });
    const follow = () => { rx += (x - rx) * 0.18; ry += (y - ry) * 0.18; ring.style.transform = `translate(${rx}px, ${ry}px)`; requestAnimationFrame(follow); };
    follow();
    document.querySelectorAll('a, button, .service, .post').forEach((el) => {
      el.addEventListener('pointerenter', () => ring.classList.add('hover'));
      el.addEventListener('pointerleave', () => ring.classList.remove('hover'));
    });
    document.addEventListener('pointerleave', () => { dot.style.opacity = ring.style.opacity = '0'; });
    document.addEventListener('pointerenter', () => { dot.style.opacity = ring.style.opacity = ''; });
  }

  /* ---------- Reveal on scroll ---------- */
  const countUp = (el) => {
    const to = +el.dataset.to;
    if (reduce || !to) return;
    const start = performance.now();
    const tick = (now) => {
      const p = Math.min((now - start) / 1400, 1);
      el.textContent = Math.round(to * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  const items = [...document.querySelectorAll('[data-reveal]')];
  if ('IntersectionObserver' in window && !reduce) {
    root.classList.add('js');
    const groups = new Map();
    items.forEach((el) => {
      const i = groups.get(el.parentElement) || 0;
      el.style.transitionDelay = `${Math.min(i, 6) * 70}ms`;
      groups.set(el.parentElement, i + 1);
    });
    const pending = new Set(items);
    const reveal = (el) => {
      if (!pending.delete(el)) return;
      el.classList.add('visible');
      el.querySelectorAll('.count').forEach(countUp);
      setTimeout(() => { el.style.transitionDelay = ''; }, 1400);
      io.unobserve(el);
    };
    const io = new IntersectionObserver((entries) => entries.forEach((en) => { if (en.isIntersecting) reveal(en.target); }), { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    items.forEach((el) => io.observe(el));
    // backstop: a fast fling can skip an element past the viewport between observer checks
    let ticking = false;
    addEventListener('scroll', () => {
      if (ticking || !pending.size) return;
      ticking = true;
      requestAnimationFrame(() => {
        ticking = false;
        pending.forEach((el) => { if (el.getBoundingClientRect().top < innerHeight * 0.92) reveal(el); });
      });
    }, { passive: true });
  }

  /* ---------- Statement: split into words ---------- */
  const statement = document.getElementById('statement');
  if (statement) statement.innerHTML = statement.textContent.trim().split(/\s+/).map((w) => `<span class="w">${w}</span>`).join(' ');

  /* ---------- Service tile spotlight ---------- */
  document.querySelectorAll('.service').forEach((card) => card.addEventListener('pointermove', (e) => {
    const r = card.getBoundingClientRect();
    card.style.setProperty('--mx', `${e.clientX - r.left}px`);
    card.style.setProperty('--my', `${e.clientY - r.top}px`);
  }));

  /* ---------- GSAP scenes ---------- */
  if (hasGsap && !reduce) {
    gsap.from('.hero-title .line > span', { yPercent: 110, duration: 1.15, ease: 'power4.out', stagger: 0.12, delay: 0.1 });
    gsap.fromTo('.hero-copy', { opacity: 1, y: 0 }, { opacity: 0, y: -60, ease: 'none', immediateRender: false, scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });

    gsap.fromTo('#showcase-frame', { scale: 0.86, rotateX: 12, transformPerspective: 1200 }, { scale: 1, rotateX: 0, ease: 'none', scrollTrigger: { trigger: '#showcase-frame', start: 'top bottom', end: 'center center', scrub: true } });
    gsap.to('#statement .w', { opacity: 1, stagger: 0.1, ease: 'none', scrollTrigger: { trigger: '#statement', start: 'top 80%', end: 'bottom 45%', scrub: true } });

    document.querySelectorAll('.post-img').forEach((img) => {
      gsap.fromTo(img, { scale: 1.12 }, { scale: 1, ease: 'none', scrollTrigger: { trigger: img, start: 'top bottom', end: 'bottom top', scrub: true } });
    });

    document.querySelectorAll('.cta-title span').forEach((line, i) => {
      gsap.fromTo(line, { xPercent: i % 2 ? 12 : -12 }, { xPercent: 0, ease: 'none', scrollTrigger: { trigger: '.cta', start: 'top bottom', end: 'top 25%', scrub: true } });
    });

    // Instagram feed: pinned horizontal gallery on large screens
    const feed = document.getElementById('feed');
    const track = document.getElementById('feed-track');
    if (feed && track) {
      gsap.matchMedia().add('(min-width: 1024px)', () => {
        feed.classList.add('is-pinned');
        const distance = () => Math.max(0, track.scrollWidth - (innerWidth - track.offsetLeft));
        gsap.to(track, {
          x: () => -distance(), ease: 'none',
          scrollTrigger: { trigger: feed.querySelector('.feed-pin'), pin: true, scrub: 0.8, start: 'top top', end: () => '+=' + distance(), invalidateOnRefresh: true, anticipatePin: 1 }
        });
        return () => feed.classList.remove('is-pinned');
      });
    }
    addEventListener('load', () => ScrollTrigger.refresh());
  } else {
    root.classList.add('no-scrub');
  }

  /* ---------- Project brief → Instagram DM ---------- */
  const brief = document.getElementById('brief');
  if (brief) {
    const status = document.getElementById('brief-status');
    const out = document.getElementById('brief-out');
    brief.addEventListener('submit', async (e) => {
      e.preventDefault();
      const f = new FormData(brief);
      const needs = f.getAll('need');
      const lines = ['Hi Code Runners! Here is my project brief:', ''];
      if (f.get('name').trim()) lines.push(`Name: ${f.get('name').trim()}`);
      if (f.get('store').trim()) lines.push(`Store: ${f.get('store').trim()}`);
      lines.push(`Need: ${needs.length ? needs.join(', ') : 'Not sure yet'}`);
      lines.push(`Timeline: ${f.get('timeline')}`);
      if (f.get('details').trim()) lines.push('', f.get('details').trim());
      const text = lines.join('\n');
      let copied = false;
      try { await navigator.clipboard.writeText(text); copied = true; } catch (err) { copied = false; }
      out.value = text;
      out.hidden = copied;
      status.textContent = copied
        ? 'Brief copied. Paste it into the Instagram chat that just opened.'
        : 'Copy your brief below, then paste it into the Instagram chat.';
      if (!copied) { out.focus(); out.select(); }
      window.open('https://ig.me/m/code_runners', '_blank', 'noopener');
    });
  }

  const year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();
})();
