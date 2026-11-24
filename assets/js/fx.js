/* Kinetix hero animations. One canvas per hero, mode chosen with data-fx. */
(() => {
  const canvas = document.querySelector('canvas.fx');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const mode = canvas.dataset.fx || 'flow';
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let BG = '#18181B', BG_RGB = '24,24,27', INK = '244,244,245', MUTE = '161,161,170';
  const rgbTriplet = (value, fallback) => {
    const raw = (value || '').trim();
    const hex = raw.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);
    if (hex) {
      const h = hex[1].length === 3 ? hex[1].replace(/./g, c => c + c) : hex[1];
      return `${parseInt(h.slice(0, 2), 16)},${parseInt(h.slice(2, 4), 16)},${parseInt(h.slice(4, 6), 16)}`;
    }
    const rgb = raw.match(/^rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)/i);
    if (rgb) return `${Math.round(rgb[1])},${Math.round(rgb[2])},${Math.round(rgb[3])}`;
    return fallback;
  };
  const cssValue = (style, name, fallback) => {
    const value = style.getPropertyValue(name).trim();
    return value && !value.includes('var(') ? value : fallback;
  };
  const readPalette = () => {
    const style = getComputedStyle(document.documentElement);
    BG = cssValue(style, '--bg', cssValue(style, '--cms-bg', '#18181B'));
    BG_RGB = rgbTriplet(BG, '24,24,27');
    INK = rgbTriplet(cssValue(style, '--text', cssValue(style, '--cms-text', '#F4F4F5')), '244,244,245');
    MUTE = rgbTriplet(cssValue(style, '--muted', cssValue(style, '--cms-muted', '#A1A1AA')), '161,161,170');
  };
  readPalette();
  let W = 0, H = 0, DPR = 1, t = 0, last = 0, visible = true, raf = 0;
  const mouse = { x: 0, y: 0, sx: 0, sy: 0, on: false };
  let S = {};
  const rand = (a, b) => a + Math.random() * (b - a);
  const hero = canvas.parentElement;

  function size() {
    const r = hero.getBoundingClientRect();
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    W = r.width; H = r.height;
    canvas.width = Math.round(W * DPR); canvas.height = Math.round(H * DPR);
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    mouse.sx = mouse.x = W * 0.6; mouse.sy = mouse.y = H * 0.45;
    modes[mode].init();
  }

  const modes = {
    /* HOME: particles riding a flow field, pushed by the cursor */
    flow: {
      init() {
        const n = Math.max(260, Math.min(900, Math.floor(W * H / 2600)));
        S.p = Array.from({ length: n }, () => ({ x: rand(0, W), y: rand(0, H), life: rand(40, 220), bright: Math.random() < 0.28, sp: rand(0.7, 1.6) }));
        ctx.fillStyle = BG; ctx.fillRect(0, 0, W, H);
        if (reduce) for (let i = 0; i < 160; i++) this.frame(0.016, i * 0.016);
      },
      frame(dt, tt) {
        ctx.fillStyle = `rgba(${BG_RGB},0.075)`; ctx.fillRect(0, 0, W, H);
        const bright = new Path2D(), dim = new Path2D();
        for (const p of S.p) {
          const a = (Math.sin(p.x * 0.0034 + tt * 0.16) + Math.cos(p.y * 0.0042 - tt * 0.13) + Math.sin((p.x + p.y) * 0.002 + tt * 0.1)) * 1.35 - 0.25;
          let vx = Math.cos(a) * p.sp * 1.5, vy = Math.sin(a) * p.sp * 1.5;
          const dx = p.x - mouse.sx, dy = p.y - mouse.sy, d = Math.hypot(dx, dy);
          if (mouse.on && d < 180 && d > 0.1) { const f = (1 - d / 180) * 3.2; vx += dx / d * f; vy += dy / d * f; }
          const nx = p.x + vx, ny = p.y + vy, path = p.bright ? bright : dim;
          path.moveTo(p.x, p.y); path.lineTo(nx, ny);
          p.x = nx; p.y = ny; p.life--;
          if (p.life <= 0 || nx < -10 || nx > W + 10 || ny < -10 || ny > H + 10) { p.x = rand(0, W); p.y = rand(0, H); p.life = rand(60, 240); }
        }
        ctx.lineWidth = 1; ctx.strokeStyle = `rgba(${MUTE},.55)`; ctx.stroke(dim);
        ctx.lineWidth = 1.2; ctx.strokeStyle = `rgba(${INK},.85)`; ctx.stroke(bright);
      }
    },

    /* SERVICES: orbiting rings with travelling nodes */
    rings: {
      init() { S.rings = Array.from({ length: 7 }, (_, k) => ({ k, sp: (k % 2 ? -1 : 1) * rand(0.12, 0.32), ph: rand(0, 6.28), dots: 1 + (k % 3) })); },
      frame(dt, tt) {
        ctx.clearRect(0, 0, W, H);
        const mob = W < 900, cx = (mob ? W * 0.5 : W * 0.72) + (mouse.sx - W / 2) * 0.03, cy = (mob ? H * 0.78 : H * 0.5) + (mouse.sy - H / 2) * 0.03;
        const base = Math.min(W, H) * (mob ? 0.55 : 0.66);
        const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, base * 0.5);
        g.addColorStop(0, `rgba(${INK},.12)`); g.addColorStop(1, `rgba(${INK},0)`);
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy, base * 0.5, 0, 6.283); ctx.fill();
        for (const r of S.rings) {
          const rad = base * (0.14 + r.k * 0.13);
          ctx.beginPath(); ctx.arc(cx, cy, rad, 0, 6.283);
          ctx.setLineDash(r.k % 2 ? [3, 9] : []); ctx.lineDashOffset = -tt * 14 * r.sp;
          ctx.strokeStyle = `rgba(${MUTE},${0.34 - r.k * 0.03})`; ctx.lineWidth = 1; ctx.stroke(); ctx.setLineDash([]);
          for (let d = 0; d < r.dots; d++) {
            const a = tt * r.sp + r.ph + d * (6.283 / r.dots);
            const x = cx + Math.cos(a) * rad, y = cy + Math.sin(a) * rad;
            ctx.beginPath(); ctx.arc(x, y, 2.6 + (r.k % 3), 0, 6.283);
            ctx.fillStyle = `rgba(${INK},.95)`; ctx.shadowColor = `rgba(${INK},.8)`; ctx.shadowBlur = 14; ctx.fill(); ctx.shadowBlur = 0;
          }
        }
      }
    },

    /* WORK: speed streaks, kinetic motion */
    streaks: {
      init() {
        S.s = Array.from({ length: Math.floor(W / 14) + 24 }, () => ({ x: rand(-300, W), y: rand(0, H), len: rand(80, 360), sp: rand(90, 520), a: rand(0.12, 0.6), w: Math.random() < 0.2 ? 2 : 1 }));
        if (reduce) this.frame(0.016, 2);
      },
      frame(dt) {
        ctx.clearRect(0, 0, W, H);
        const py = (mouse.sy - H / 2) * 0.02;
        for (const s of S.s) {
          s.x += s.sp * dt; if (s.x - s.len > W) { s.x = -rand(0, 200); s.y = rand(0, H); }
          const y = s.y + py * (s.sp / 300), g = ctx.createLinearGradient(s.x - s.len, 0, s.x, 0);
          g.addColorStop(0, `rgba(${INK},0)`); g.addColorStop(1, `rgba(${INK},${s.a})`);
          ctx.strokeStyle = g; ctx.lineWidth = s.w; ctx.beginPath(); ctx.moveTo(s.x - s.len, y); ctx.lineTo(s.x, y); ctx.stroke();
          ctx.fillStyle = `rgba(${INK},${Math.min(1, s.a + 0.3)})`; ctx.fillRect(s.x - 1, y - s.w / 2, 2, s.w);
        }
      }
    },

    /* ABOUT: dot grid with a travelling wave around the cursor */
    wave: {
      init() { S.gap = W < 700 ? 24 : 30; },
      frame(dt, tt) {
        ctx.clearRect(0, 0, W, H);
        const gap = S.gap, cx = mouse.on ? mouse.sx : W * 0.7, cy = mouse.on ? mouse.sy : H * 0.5;
        for (let y = gap / 2; y < H; y += gap) for (let x = gap / 2; x < W; x += gap) {
          const d = Math.hypot(x - cx, y - cy), v = Math.sin(d * 0.022 - tt * 1.8) * Math.exp(-d / 620);
          const k = (v + 1) / 2, r = 0.7 + k * 2.1;
          ctx.fillStyle = `rgba(${INK},${0.07 + k * 0.5 * Math.exp(-d / 800)})`;
          ctx.beginPath(); ctx.arc(x, y, r, 0, 6.283); ctx.fill();
        }
      }
    },

    /* INSIGHTS: document lines being read by a sweeping highlight */
    scan: {
      init() {
        const x0 = W < 900 ? 24 : W * 0.56, w = W - x0 - 24; S.x0 = x0; S.rows = []; let y = 110, para = 0;
        while (y < H - 60) {
          if (Math.random() < 0.14) { y += 28; para++; continue; }
          const segs = []; let x = 0; while (x < w * 0.9) { const sw = rand(26, 110); segs.push([x, Math.min(sw, w - x)]); x += sw + rand(8, 14); }
          S.rows.push({ y, segs, w }); y += 22;
        }
      },
      frame(dt, tt) {
        ctx.clearRect(0, 0, W, H);
        const sweep = ((tt * 70) % (H + 260)) - 130, mob = W < 900;
        for (const r of S.rows) {
          const d = Math.abs(r.y - sweep), md = mouse.on ? Math.abs(r.y - mouse.sy) : 999;
          const a = (mob ? 0.05 : 0.09) + Math.exp(-(d * d) / 5200) * 0.55 + Math.exp(-(md * md) / 3000) * 0.18;
          ctx.fillStyle = `rgba(${INK},${a})`;
          for (const [sx, sw] of r.segs) { ctx.beginPath(); ctx.roundRect ? ctx.roundRect(S.x0 + sx, r.y, sw, 6, 3) : ctx.rect(S.x0 + sx, r.y, sw, 6); ctx.fill(); }
        }
      }
    },

    /* COLLABORATIONS: two circles drifting together and apart */
    venn: {
      init() { },
      frame(dt, tt) {
        ctx.clearRect(0, 0, W, H);
        const mob = W < 900, cx = mob ? W * 0.5 : W * 0.72, cy = mob ? H * 0.8 : H * 0.5, R = Math.min(W, H) * (mob ? 0.2 : 0.27);
        const off = R * (0.62 + Math.sin(tt * 0.7) * 0.42), ax = cx - off, bx = cx + off;
        ctx.save(); ctx.beginPath(); ctx.arc(ax, cy, R, 0, 6.283); ctx.clip();
        ctx.beginPath(); ctx.arc(bx, cy, R, 0, 6.283);
        const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, R); g.addColorStop(0, `rgba(${INK},.30)`); g.addColorStop(1, `rgba(${INK},.06)`);
        ctx.fillStyle = g; ctx.fill(); ctx.restore();
        for (const [x, a] of [[ax, 0.55], [bx, 0.8]]) { ctx.beginPath(); ctx.arc(x, cy, R, 0, 6.283); ctx.strokeStyle = `rgba(${a > 0.7 ? INK : MUTE},${a})`; ctx.lineWidth = 1.2; ctx.stroke(); }
        for (let i = 0; i < 14; i++) { const a = tt * (0.2 + i * 0.03) + i, rr = R * (1.25 + (i % 4) * 0.17), x = cx + Math.cos(a) * rr * 1.3, y = cy + Math.sin(a) * rr * 0.75; ctx.beginPath(); ctx.arc(x, y, 1.6 + (i % 3), 0, 6.283); ctx.fillStyle = `rgba(${INK},${0.25 + (i % 4) * 0.15})`; ctx.fill(); }
      }
    },

    /* CONTACT: signal ripples, click to ping */
    ripple: {
      init() { S.r = []; S.next = 0; hero.addEventListener('pointerdown', e => { const b = canvas.getBoundingClientRect(); S.r.push({ x: e.clientX - b.left, y: e.clientY - b.top, t: 0 }); }); },
      frame(dt, tt) {
        ctx.clearRect(0, 0, W, H);
        const mob = W < 900, cx = mob ? W * 0.5 : W * 0.74, cy = mob ? H * 0.78 : H * 0.5, max = Math.min(W, 900) * (mob ? 0.7 : 0.5);
        if (tt > S.next) { S.r.push({ x: cx, y: cy, t: 0 }); S.next = tt + 1.5; }
        S.r = S.r.filter(r => r.t < 1);
        for (const r of S.r) { r.t += dt * 0.28; const rad = r.t * max, a = (1 - r.t) * 0.55; ctx.beginPath(); ctx.arc(r.x, r.y, rad, 0, 6.283); ctx.strokeStyle = `rgba(${INK},${a})`; ctx.lineWidth = 1.2; ctx.stroke(); }
        ctx.beginPath(); ctx.arc(cx, cy, 4 + Math.sin(tt * 3) * 1.2, 0, 6.283); ctx.fillStyle = `rgb(${INK})`; ctx.shadowColor = `rgb(${INK})`; ctx.shadowBlur = 20; ctx.fill(); ctx.shadowBlur = 0;
        ctx.strokeStyle = `rgba(${MUTE},.16)`; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(cx - max, cy); ctx.lineTo(cx + max, cy); ctx.moveTo(cx, cy - max); ctx.lineTo(cx, cy + max); ctx.stroke();
      }
    },

    /* CASE STUDIES + ARTICLES: slow drifting light */
    mesh: {
      init() { S.b = Array.from({ length: 4 }, (_, i) => ({ fx: rand(0.1, 0.25), fy: rand(0.08, 0.2), ph: i * 1.7, r: rand(0.25, 0.45) })); },
      frame(dt, tt) {
        ctx.clearRect(0, 0, W, H);
        for (const b of S.b) {
          const x = W * (0.5 + Math.sin(tt * b.fx + b.ph) * 0.42) + (mouse.sx - W / 2) * 0.05, y = H * (0.45 + Math.cos(tt * b.fy + b.ph) * 0.35), r = Math.max(W, H) * b.r;
          const g = ctx.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, `rgba(${INK},.10)`); g.addColorStop(1, `rgba(${INK},0)`);
          ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
        }
      }
    }
  };

  function loop(now) {
    raf = requestAnimationFrame(loop);
    if (!visible) { last = now; return; }
    const dt = Math.min((now - last) / 1000, 0.05); last = now; t += dt;
    mouse.sx += (mouse.x - mouse.sx) * 0.12; mouse.sy += (mouse.y - mouse.sy) * 0.12;
    modes[mode].frame(dt, t);
  }

  hero.addEventListener('pointermove', e => { const b = canvas.getBoundingClientRect(); mouse.x = e.clientX - b.left; mouse.y = e.clientY - b.top; mouse.on = true; });
  hero.addEventListener('pointerleave', () => { mouse.on = false; });
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; }, { threshold: 0 }).observe(hero);
  let rt; addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(size, 150); });
  const redraw = () => {
    readPalette();
    if (mode === 'flow') size(); else modes[mode].frame(0.016, t || 3);
  };
  addEventListener('themechange', redraw);
  document.addEventListener('cms:ready', redraw);

  size();
  if (reduce) { modes[mode].frame(0.016, 3); } else { last = performance.now(); raf = requestAnimationFrame(loop); }
})();
