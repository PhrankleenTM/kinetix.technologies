/* Kinetix site behaviour */
(() => {
  const $ = (s, c = document) => c.querySelector(s), $$ = (s, c = document) => [...c.querySelectorAll(s)];
  let cms = (window.__CMS__ && window.__CMS__.content) || {};
  let ui = cms.ui || {};
  let siteEmail = (cms.settings || {}).email || 'kinetix.technologies.web@gmail.com';
  document.addEventListener('cms:ready', e => {
    cms = (e.detail && e.detail.content) || cms;
    ui = cms.ui || {};
    siteEmail = (cms.settings || {}).email || 'kinetix.technologies.web@gmail.com';
  });

  const THEME_KEY = 'kinetix-theme';
  const themeMeta = $('meta[name="theme-color"]');
  const SUN = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M19.1 4.9l-1.4 1.4M6.3 17.7l-1.4 1.4"/></svg>';
  const MOON = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 14.5A8.5 8.5 0 0 1 9.5 4 8.5 8.5 0 1 0 20 14.5Z"/></svg>';
  const applyTheme = (value, persist) => {
    const theme = value === 'light' ? 'light' : 'dark';
    document.documentElement.dataset.theme = theme;
    if (themeMeta) themeMeta.setAttribute('content', theme === 'light' ? '#f4f4f5' : '#18181b');
    if (persist) { try { localStorage.setItem(THEME_KEY, theme); } catch (e) {} }
    const next = theme === 'light' ? 'Dark mode' : 'Light mode';
    $$('.theme-toggle').forEach(btn => {
      const label = btn.classList.contains('mobile-theme') ? next : 'Switch to ' + next.toLowerCase();
      btn.setAttribute('aria-label', label);
      btn.setAttribute('title', label);
      btn.setAttribute('aria-pressed', String(theme === 'light'));
      const icon = $('.theme-icon', btn);
      if (icon) icon.innerHTML = theme === 'light' ? MOON : SUN;
      const text = $('.theme-label', btn);
      if (text) text.textContent = next;
    });
  };
  const toggleTheme = () => applyTheme(document.documentElement.dataset.theme === 'light' ? 'dark' : 'light', true);
  const makeThemeButton = mobile => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'theme-toggle' + (mobile ? ' mobile-theme' : ' desktop-theme');
    btn.innerHTML = mobile
      ? '<span class="theme-icon"></span><span class="theme-label"></span>'
      : '<span class="theme-icon"></span>';
    btn.addEventListener('click', toggleTheme);
    return btn;
  };
  let storedTheme = null;
  try { storedTheme = localStorage.getItem(THEME_KEY); } catch (e) {}
  const initialTheme = storedTheme || document.documentElement.dataset.theme || 'light';
  document.documentElement.dataset.theme = initialTheme === 'light' ? 'light' : 'dark';
  const navIn = $('.nav-in');
  if (navIn && !$('.desktop-theme')) {
    const btn = makeThemeButton(false);
    const burger = $('.burger');
    if (burger) navIn.insertBefore(btn, burger); else navIn.appendChild(btn);
  }
  const mobileMenu = $('.mobile-menu');
  if (mobileMenu && !$('.mobile-theme')) {
    const btn = makeThemeButton(true);
    const cta = $('.btn', mobileMenu);
    if (cta) mobileMenu.insertBefore(btn, cta); else mobileMenu.appendChild(btn);
  }
  applyTheme(initialTheme);

  // nav state
  const nav = $('.nav');
  const onScroll = () => nav && nav.classList.toggle('scrolled', scrollY > 24);
  onScroll(); addEventListener('scroll', onScroll, { passive: true });

  // mobile menu
  const burger = $('.burger');
  if (burger) {
    const set = open => { document.body.classList.toggle('menu-open', open); burger.setAttribute('aria-expanded', open); document.body.style.overflow = open ? 'hidden' : ''; };
    burger.addEventListener('click', () => set(!document.body.classList.contains('menu-open')));
    $$('.mobile-menu a').forEach((a, i) => { a.style.transitionDelay = (80 + i * 45) + 'ms'; a.addEventListener('click', () => set(false)); });
    addEventListener('keydown', e => { if (e.key === 'Escape') set(false); });
  }

  // page transition
  document.addEventListener('click', e => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const a = e.target.closest('a[href]');
    if (!a || a.target === '_blank' || a.hasAttribute('download') || 'noTransition' in a.dataset) return;
    const href = a.getAttribute('href');
    if (!href || href.startsWith('#') || /^(mailto:|tel:|javascript:)/i.test(href)) return;
    const url = new URL(a.href, location.href);
    if (url.origin !== location.origin) return;
    if (url.pathname === location.pathname && url.search === location.search && url.hash) return;
    if (document.body.classList.contains('is-leaving')) { e.preventDefault(); return; }
    e.preventDefault();
    document.body.classList.add('is-leaving');
    setTimeout(() => { location.href = url.href; }, 160);
  });

  // reveal on scroll
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: 0.14, rootMargin: '0px 0px -6% 0px' });
  const bindReveals = () => $$('.rv:not(.in), .step:not(.in)').forEach(el => {
    const r = el.getBoundingClientRect();
    if (r.top < innerHeight * 0.95) { el.classList.add('in'); return; }
    io.observe(el);
  });
  bindReveals();

  // count up
  const count = el => {
    if (el.dataset.counted) return;
    el.dataset.counted = '1';
    const end = parseFloat(el.dataset.count), dec = +(el.dataset.dec || 0), suf = el.dataset.suffix || '';
    const t0 = performance.now(), dur = 1600;
    const tick = n => { const p = Math.min((n - t0) / dur, 1), e = 1 - Math.pow(1 - p, 3); el.textContent = (end * e).toFixed(dec) + suf; if (p < 1) requestAnimationFrame(tick); };
    requestAnimationFrame(tick);
  };
  const cio = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { count(e.target); cio.unobserve(e.target); } }), { threshold: 0.6 });
  const bindCounts = () => $$('[data-count]:not([data-counted])').forEach(el => cio.observe(el));
  bindCounts();

  // spotlight on cards
  const bindSpotlight = () => $$('.card:not([data-spot])').forEach(c => {
    c.dataset.spot = '1';
    c.addEventListener('pointermove', e => { const r = c.getBoundingClientRect(); c.style.setProperty('--mx', (e.clientX - r.left) + 'px'); c.style.setProperty('--my', (e.clientY - r.top) + 'px'); });
  });
  bindSpotlight();

  // work filters
  const initWorkFilters = () => {
    const chips = $$('.chip[data-filter]');
    if (!chips.length) return;
    const cards = $$('.pcard[data-cat]'), empty = $('.empty');
    const active = chips.find(c => c.classList.contains('active')) || chips[0];
    const apply = (ch) => {
      chips.forEach(c => { c.classList.toggle('active', c === ch); c.setAttribute('aria-pressed', c === ch); });
      const f = ch.dataset.filter; let n = 0;
      cards.forEach(c => { const show = f === 'all' || (c.dataset.cat || '').split(' ').includes(f); c.hidden = !show; if (show) n++; });
      if (empty) empty.classList.toggle('show', n === 0);
    };
    chips.forEach(ch => {
      if (ch.dataset.bound) return;
      ch.dataset.bound = '1';
      ch.addEventListener('click', () => apply(ch));
    });
    apply(active);
  };
  initWorkFilters();
  document.addEventListener('cms:ready', () => { bindReveals(); bindCounts(); bindSpotlight(); initWorkFilters(); });

  // newsletter
  $$('form.nl-form').forEach(f => f.addEventListener('submit', e => {
    e.preventDefault();
    const i = $('input', f), m = $('.nl-msg', f.parentElement), v = i.value.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) { m.textContent = ui.newsletterInvalid || 'Please enter a valid email address.'; return; }
    m.textContent = ui.newsletterSuccess || 'You are on the list. Thank you.'; i.value = '';
  }));

  // contact form: opens the visitor's email app with the message filled in
  const cf = $('#contact-form');
  if (cf) cf.addEventListener('submit', e => {
    e.preventDefault();
    const d = Object.fromEntries(new FormData(cf)), msg = $('#form-msg');
    const body = `Name: ${d.name}\nEmail: ${d.email}\nCompany: ${d.company || '-'}\nProject type: ${d.type}\nBudget: ${d.budget || '-'}\n\n${d.message || ''}`;
    const subject = ui.contactSubject || 'New project enquiry';
    location.href = `mailto:${siteEmail}?subject=${encodeURIComponent(subject + ': ' + d.type)}&body=${encodeURIComponent(body)}`;
    msg.textContent = (ui.contactOpening || 'Opening your email app with your message ready to send.') + ` If nothing opens, write to ${siteEmail}.`;
    msg.classList.add('show');
  });

  // reading progress
  const bar = $('.progress');
  if (bar) { const u = () => { const h = document.documentElement; bar.style.width = Math.min(100, scrollY / (h.scrollHeight - innerHeight) * 100) + '%'; }; addEventListener('scroll', u, { passive: true }); u(); }

  // year
  $$('.yr-now').forEach(e => e.textContent = new Date().getFullYear());
})();
