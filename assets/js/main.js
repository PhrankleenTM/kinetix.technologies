/* Kinetix site behaviour */
(() => {
  const $ = (s, c = document) => c.querySelector(s), $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

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

  // reveal on scroll
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: 0.14, rootMargin: '0px 0px -6% 0px' });
  $$('.rv, .step').forEach(el => io.observe(el));

  // count up
  const count = el => {
    const end = parseFloat(el.dataset.count), dec = +(el.dataset.dec || 0), suf = el.dataset.suffix || '';
    if (reduce) { el.textContent = end.toFixed(dec) + suf; return; }
    const t0 = performance.now(), dur = 1600;
    const tick = n => { const p = Math.min((n - t0) / dur, 1), e = 1 - Math.pow(1 - p, 3); el.textContent = (end * e).toFixed(dec) + suf; if (p < 1) requestAnimationFrame(tick); };
    requestAnimationFrame(tick);
  };
  const cio = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { count(e.target); cio.unobserve(e.target); } }), { threshold: 0.6 });
  $$('[data-count]').forEach(el => cio.observe(el));

  // spotlight on cards
  $$('.card').forEach(c => c.addEventListener('pointermove', e => { const r = c.getBoundingClientRect(); c.style.setProperty('--mx', (e.clientX - r.left) + 'px'); c.style.setProperty('--my', (e.clientY - r.top) + 'px'); }));

  // work filters
  const chips = $$('.chip');
  if (chips.length) {
    const cards = $$('.pcard[data-cat]'), empty = $('.empty');
    chips.forEach(ch => ch.addEventListener('click', () => {
      chips.forEach(c => { c.classList.toggle('active', c === ch); c.setAttribute('aria-pressed', c === ch); });
      const f = ch.dataset.filter; let n = 0;
      cards.forEach(c => { const show = f === 'all' || c.dataset.cat.split(' ').includes(f); c.hidden = !show; if (show) n++; });
      if (empty) empty.classList.toggle('show', n === 0);
    }));
  }

  // newsletter
  $$('form.nl-form').forEach(f => f.addEventListener('submit', e => {
    e.preventDefault();
    const i = $('input', f), m = $('.nl-msg', f.parentElement), v = i.value.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) { m.textContent = 'Please enter a valid email address.'; return; }
    m.textContent = 'You are on the list. Thank you.'; i.value = '';
  }));

  // contact form: opens the visitor's email app with the message filled in
  const cf = $('#contact-form');
  if (cf) cf.addEventListener('submit', e => {
    e.preventDefault();
    const d = Object.fromEntries(new FormData(cf)), msg = $('#form-msg');
    const body = `Name: ${d.name}\nEmail: ${d.email}\nCompany: ${d.company || '-'}\nProject type: ${d.type}\nBudget: ${d.budget || '-'}\n\n${d.message || ''}`;
    location.href = `mailto:kinetix.technologies.web@gmail.com?subject=${encodeURIComponent('New project enquiry: ' + d.type)}&body=${encodeURIComponent(body)}`;
    msg.textContent = 'Opening your email app with your message ready to send. If nothing opens, write to kinetix.technologies.web@gmail.com.';
    msg.classList.add('show');
  });

  // reading progress
  const bar = $('.progress');
  if (bar) { const u = () => { const h = document.documentElement; bar.style.width = Math.min(100, scrollY / (h.scrollHeight - innerHeight) * 100) + '%'; }; addEventListener('scroll', u, { passive: true }); u(); }

  // year
  $$('.yr-now').forEach(e => e.textContent = new Date().getFullYear());
})();
