(() => {
  let ready = false;
  function init(data) {
    if (ready || !data || !data.content) return;
    ready = true;
    const C = data.content;
  const B = data.bindings || {};
  const rawPath = decodeURIComponent(location.pathname || "/").replace(
    /^\/+/,
    "",
  );
  const fallbackPage =
    !rawPath || rawPath.endsWith("/")
      ? rawPath + "index.html"
      : /\.[a-z0-9]+$/i.test(rawPath)
        ? rawPath
        : rawPath + ".html";
  const page = data.page || fallbackPage;
  const caseSlug =
    window.__CMS_SLUG__ ||
    (page.match(/case-studies\/([^.]+)\.html/) || [])[1] ||
    "";
  const esc = (v) =>
    String(v == null ? "" : v).replace(
      /[&<>"']/g,
      (c) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[c],
    );
  const q = (sel, root = document) => root.querySelector(sel);
  const qa = (sel, root = document) => [...root.querySelectorAll(sel)];

  function get(path) {
    if (!path) return undefined;
    const m = String(path).match(
      /^([A-Za-z0-9_]+)\[([A-Za-z0-9_]+)=([^\]]+)\](?:\.(.*))?$/,
    );
    if (m) {
      const item = (C[m[1]] || []).find((x) => String(x[m[2]]) === m[3]);
      if (!item) return undefined;
      if (!m[4]) return item;
      return m[4]
        .split(".")
        .reduce((o, k) => (o == null ? undefined : o[k]), item);
    }
    return String(path)
      .split(".")
      .reduce((o, k) => (o == null ? undefined : o[k]), C);
  }

  function findBySlug(list, slug) {
    const key = String(slug || "")
      .split("/")
      .pop()
      .replace(/\.html$/, "");
    return (C[list] || []).find((x) => x.slug === key);
  }

  function setText(el, value, mode = "") {
    if (!el || value == null) return;
    const text = String(value);
    if (mode === "first" && el.firstChild && el.firstChild.nodeType === 3) {
      el.firstChild.nodeValue = text;
      return;
    }
    if (mode === "last" && el.lastChild && el.lastChild.nodeType === 3) {
      el.lastChild.nodeValue = text;
      return;
    }
    el.textContent = text;
  }

  function nodes(html) {
    const t = document.createElement("template");
    t.innerHTML = html.trim();
    return [...t.content.children];
  }

  const ICONS = {
    bolt: '<path d="M13 2 4 14h7l-1 8 9-12h-7z"/>',
    flow: '<circle cx="6" cy="6" r="2.5"/><circle cx="18" cy="12" r="2.5"/><circle cx="6" cy="18" r="2.5"/><path d="M8.5 6h4a3 3 0 0 1 3 3v.5M8.5 18h4a3 3 0 0 0 3-3v-.5"/>',
    minus: '<circle cx="12" cy="12" r="9"/><path d="M8 12h8"/>',
    venn: '<circle cx="9" cy="12" r="6"/><circle cx="15" cy="12" r="6"/>',
    website:
      '<rect x="3" y="4" width="18" height="16" rx="3"/><path d="M3 9h18M7 6.5h.01M10 6.5h.01"/>',
    cart: '<path d="M3 4h2l2.5 11h10l2-8H6.5"/><circle cx="9" cy="19" r="1.5"/><circle cx="17" cy="19" r="1.5"/>',
    clinic:
      '<rect x="3" y="3" width="18" height="18" rx="4"/><path d="M12 8v8M8 12h8"/>',
    cube: '<path d="m12 3 8 4.5v9L12 21l-8-4.5v-9z"/><path d="M12 12 4 7.5M12 12l8-4.5M12 12v9"/>',
    funnel: '<path d="M3 5h18l-7 8v6l-4 2v-8z"/>',
    spark:
      '<path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M18 6l-2.5 2.5M8.5 15.5 6 18"/>',
    pencil: '<path d="M4 20l4-1 11-11-3-3L5 16z"/><path d="M14 6l3 3"/>',
    link: '<circle cx="9" cy="12" r="6"/><circle cx="15" cy="12" r="6"/>',
    search: '<circle cx="11" cy="11" r="6"/><path d="m20 20-4.5-4.5"/>',
  };
  const icon = (name) =>
    `<svg viewBox="0 0 24 24" aria-hidden="true">${ICONS[name] || ICONS.spark}</svg>`;
  const arrow =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';

  const VIZ = {
    timeline:
      '<svg viewBox="0 0 320 200" fill="none" stroke="#A1A1AA" stroke-width="1.2" aria-hidden="true"><line x1="86" y1="28" x2="86" y2="172" stroke-opacity=".5"/><g class="float"><circle cx="86" cy="48" r="7" fill="#27272A"/><rect x="108" y="40" width="120" height="16" rx="8" stroke-opacity=".6"/></g><g class="float2"><circle cx="86" cy="94" r="9" fill="#F4F4F5" stroke="none"/><rect x="108" y="84" width="170" height="20" rx="10" fill="#F4F4F5" fill-opacity=".1" stroke="#F4F4F5" stroke-opacity=".6"/></g><g class="float"><circle cx="86" cy="140" r="7" fill="#27272A"/><rect x="108" y="132" width="96" height="16" rx="8" stroke-opacity=".6"/></g><circle cx="86" cy="94" r="16" stroke="#F4F4F5" stroke-opacity=".4"/></svg>',
    browser:
      '<svg viewBox="0 0 320 200" fill="none" stroke="#A1A1AA" stroke-width="1.2" aria-hidden="true"><g class="float"><rect x="34" y="26" width="252" height="148" rx="16"/><line x1="34" y1="54" x2="286" y2="54" stroke-opacity=".5"/><circle cx="54" cy="40" r="3.5" fill="#A1A1AA" stroke="none"/><circle cx="68" cy="40" r="3.5" fill="#A1A1AA" stroke="none"/><circle cx="82" cy="40" r="3.5" fill="#A1A1AA" stroke="none"/></g><g class="float2"><rect x="58" y="78" width="130" height="12" rx="6" fill="#F4F4F5" stroke="none"/><rect x="58" y="100" width="190" height="8" rx="4" stroke-opacity=".6"/><rect x="58" y="116" width="150" height="8" rx="4" stroke-opacity=".6"/><rect x="58" y="138" width="74" height="22" rx="11" fill="#F4F4F5" fill-opacity=".14" stroke="#F4F4F5"/></g></svg>',
    bars: '<svg viewBox="0 0 320 200" fill="none" stroke="#A1A1AA" stroke-width="1.2" aria-hidden="true"><g class="float2"><rect x="46" y="110" width="26" height="62" rx="6"/><rect x="86" y="82" width="26" height="90" rx="6"/><rect x="126" y="98" width="26" height="74" rx="6"/><rect x="166" y="58" width="26" height="114" rx="6" fill="#F4F4F5" fill-opacity=".14" stroke="#F4F4F5" stroke-opacity=".7"/><rect x="206" y="76" width="26" height="96" rx="6"/><rect x="246" y="44" width="26" height="128" rx="6"/></g><polyline points="59,90 99,62 139,78 179,38 219,56 259,26" stroke="#F4F4F5" stroke-width="1.6" class="float"/><circle cx="179" cy="38" r="5" fill="#F4F4F5" stroke="none"/></svg>',
    layout:
      '<svg viewBox="0 0 320 200" fill="none" stroke="#A1A1AA" stroke-width="1.2" aria-hidden="true"><g class="float"><rect x="38" y="34" width="110" height="132" rx="14"/><rect x="164" y="34" width="118" height="60" rx="14" fill="#F4F4F5" fill-opacity=".1" stroke="#F4F4F5" stroke-opacity=".6"/><rect x="164" y="106" width="118" height="60" rx="14"/></g><g class="float2"><line x1="56" y1="60" x2="128" y2="60" stroke-opacity=".7"/><line x1="56" y1="80" x2="110" y2="80" stroke-opacity=".5"/><line x1="56" y1="100" x2="122" y2="100" stroke-opacity=".5"/><circle cx="92" cy="138" r="14" stroke="#F4F4F5" stroke-opacity=".6"/></g></svg>',
    grid: '<svg viewBox="0 0 320 200" fill="none" stroke="#A1A1AA" stroke-width="1.2" aria-hidden="true"><g class="float"><rect x="40" y="34" width="68" height="52" rx="12"/><rect x="126" y="34" width="68" height="52" rx="12" fill="#F4F4F5" fill-opacity=".12" stroke="#F4F4F5" stroke-opacity=".7"/><rect x="212" y="34" width="68" height="52" rx="12"/></g><g class="float2"><rect x="40" y="100" width="68" height="52" rx="12"/><rect x="126" y="100" width="68" height="52" rx="12"/><rect x="212" y="100" width="68" height="52" rx="12"/></g><rect x="40" y="168" width="240" height="6" rx="3" stroke-opacity=".4"/><rect x="40" y="168" width="150" height="6" rx="3" fill="#F4F4F5" stroke="none"/><circle cx="160" cy="60" r="8" fill="#F4F4F5" stroke="none"/></svg>',
    funnel:
      '<svg viewBox="0 0 320 200" fill="none" stroke="#A1A1AA" stroke-width="1.2" aria-hidden="true"><g class="float"><rect x="40" y="30" width="240" height="26" rx="13"/><rect x="62" y="68" width="196" height="26" rx="13" fill="#F4F4F5" fill-opacity=".08" stroke="#F4F4F5" stroke-opacity=".5"/><rect x="88" y="106" width="144" height="26" rx="13"/><rect x="118" y="144" width="84" height="26" rx="13" fill="#F4F4F5" stroke="none"/></g><g class="float2"><circle cx="64" cy="43" r="5" fill="#A1A1AA" stroke="none"/><circle cx="84" cy="43" r="5" fill="#A1A1AA" stroke="none" fill-opacity=".6"/><circle cx="136" cy="157" r="4" fill="#18181B" stroke="none"/></g></svg>',
    spotlight:
      '<svg viewBox="0 0 320 200" fill="none" stroke="#A1A1AA" stroke-width="1.2" aria-hidden="true"><g class="float2"><path d="M160 190 60 40M160 190 110 20M160 190 160 14M160 190 210 20M160 190 260 40" stroke-opacity=".35"/></g><g class="float"><circle cx="160" cy="190" r="70" stroke-opacity=".3"/><circle cx="160" cy="190" r="110" stroke-opacity=".2"/><rect x="112" y="92" width="96" height="30" rx="15" fill="#F4F4F5" stroke="none"/><rect x="132" y="56" width="56" height="8" rx="4" stroke-opacity=".7"/></g></svg>',
  };

  const renderers = {
    words: (items, el) => {
      const list =
        typeof items === "string"
          ? items
              .split(/\s+/)
              .filter(Boolean)
              .map((text) => ({ text }))
          : items || [];
      el.innerHTML = list
        .map(
          (w, i) =>
            `<span class="w"><span${w.serif ? ' class="serif"' : ""} style="--i:${i}">${esc(w.text)}</span></span>`,
        )
        .join(" ");
    },
    badges: (items, el) => {
      el.innerHTML = (items || [])
        .map(
          (x) =>
            `<div class="badge"><b>${esc(x.value)}</b><span>${esc(x.label)}</span></div>`,
        )
        .join("");
    },
    marquee: (items, el) => {
      const half = (items || []).map((x) => `<span>${esc(x)}</span>`).join("");
      el.innerHTML = half.repeat(4);
    },
    iconCards: (items, el) => {
      el.innerHTML = (items || [])
        .map(
          (x, i) =>
            `<div class="card rv" style="--d:${i * 90}ms"><div class="ico">${icon(x.icon)}</div><h3>${esc(x.title)}</h3><p>${esc(x.text)}</p></div>`,
        )
        .join("");
    },
    serviceCards: (items, el) => {
      el.innerHTML = (items || [])
        .map(
          (x, i) =>
            `<a class="card svc-card rv" style="--d:${i * 90}ms" href="${esc(x.link)}"><span class="num">${String(i + 1).padStart(2, "0")}</span><div class="ico">${icon(x.icon)}</div><h3>${esc(x.title)}</h3><p>${esc(x.text)}</p><span class="link-arrow">${esc(get("ui.learnMore") || "Learn more")} ${arrow}</span></a>`,
        )
        .join("");
    },
    workRows: (items, el) => {
      el.innerHTML = (items || [])
        .map(
          (x) =>
            `<a class="rv" href="${esc(x.link)}"><span class="yr">${esc(x.year)}</span><h3>${esc(x.title)}</h3><span class="cat">${esc(x.category)}</span>${arrow}</a>`,
        )
        .join("");
    },
    stats: (items, el) => {
      el.innerHTML = (items || [])
        .map(
          (x) =>
            `<div class="stat"><b data-count="${esc(x.value)}"${x.dec ? ` data-dec="${esc(x.dec)}"` : ""}${x.suffix ? ` data-suffix="${esc(x.suffix)}"` : ""}>${esc(x.value)}${x.dec ? "." + "0".repeat(x.dec) : ""}${esc(x.suffix || "")}</b><span>${esc(x.label)}</span></div>`,
        )
        .join("");
    },
    steps: (items, el) => {
      el.className =
        el.className.replace(/\bsteps-\d+\b/g, "").trim() +
        ((items || []).length === 3 ? " steps-3" : "");
      el.innerHTML = (items || [])
        .map(
          (x, i) =>
            `<div class="step rv" style="--d:${i * 100}ms"><span class="n">${esc(x.number || String(i + 1).padStart(2, "0"))}</span><h3>${esc(x.title)}</h3><p>${esc(x.text)}</p></div>`,
        )
        .join("");
    },
    quotes: (items, el) => {
      el.innerHTML = (items || [])
        .map(
          (x, i) =>
            `<div class="card quote rv"${i ? ` style="--d:${i * 120}ms"` : ""}><span class="mark">&ldquo;</span><q>${esc(x.quote)}</q><div class="who"><span class="av">${esc(x.initials)}</span><span>${esc(x.who)}</span></div></div>`,
        )
        .join("");
    },
    chips: (items, el) => {
      el.innerHTML = (items || [])
        .map(
          (x, i) =>
            `<button class="chip${i === 0 ? " active" : ""}" data-filter="${esc(x.value)}" aria-pressed="${i === 0}">${esc(x.label)}</button>`,
        )
        .join("");
    },
    projects: (items, el) => {
      el.innerHTML = (items || [])
        .map((x, i) => {
          const viz = x.image
            ? `<img src="${esc(x.image)}" alt="${esc(x.title)}">`
            : VIZ[x.viz] || VIZ.browser;
          return `<a class="pcard rv" style="--d:${i % 2 ? 90 : 0}ms" data-cat="${esc((x.categories || []).join(" "))}" href="${esc(x.link || "/contact")}"><div class="viz">${viz}</div><div class="pb"><div class="pmeta"><span>${esc(x.category)}</span><span>${esc(x.year)}</span></div><h3>${esc(x.title)}${arrow}</h3><p>${esc(x.description)}</p><div class="tags">${(x.tags || []).map((t) => `<span class="tag">${esc(t)}</span>`).join("")}</div></div></a>`;
        })
        .join("");
    },
    collabCards: (items) =>
      (items || [])
        .map(
          (x, i) =>
            `<div class="card collab-card rv" style="--d:${i % 2 ? 90 : 0}ms"><div class="ico">${icon(["pencil", "link", "flow", "search"][i % 4])}</div><h3>${esc(x.title)}</h3><p>${esc(x.text)}</p></div>`,
        )
        .join(""),
    paragraphs: (items, els) => {
      els.forEach((el, i) => {
        if (items[i] != null) setText(el, items[i]);
      });
    },
    list: (items, el) => {
      el.innerHTML = (items || []).map((x) => `<li>${esc(x)}</li>`).join("");
    },
    strongList: (items, el) => {
      el.innerHTML = (items || [])
        .map(
          (x) =>
            `<li><b style="font-weight:500">${esc(x.title)}</b>&nbsp;${esc(x.text)}</li>`,
        )
        .join("");
    },
    numberCards: (items, el) => {
      el.innerHTML = (items || [])
        .map(
          (x, i) =>
            `<div class="card rv" style="--d:${i * 90}ms"><span class="num">${esc(x.number)}</span><h3 style="margin-top:46px">${esc(x.title)}</h3><p>${esc(x.text)}</p></div>`,
        )
        .join("");
    },
    serviceRows: (items) =>
      (items || [])
        .map(
          (x) =>
            `<section class="svc-row" id="${esc(x.id)}"><div class="container split"><div class="sticky rv"><div class="big-num">${esc(x.number)} <span style="flex:0 0 40px;height:1px;background:var(--line-strong)"></span></div><div class="ico">${icon(x.icon)}</div><h2>${esc(x.title)}</h2></div><div class="rv" style="--d:100ms"><p class="desc">${esc(x.description)}</p><ul class="feat">${(x.features || []).map((f) => `<li>${esc(f)}</li>`).join("")}</ul><a class="btn btn-primary" href="/contact">${esc(x.buttonLabel)} ${arrow}</a></div></div></section>`,
        )
        .join(""),
    navLinks: (items, el) => {
      const labels = items || [];
      [...el.querySelectorAll("a")].forEach((a, i) => {
        if (labels[i] != null) a.textContent = labels[i];
      });
    },
    ctaLabel: (value, el) =>
      setText(el, value, el.classList.contains("btn-nav") ? "" : "first"),
    mailto: (value, el) => {
      if (!value) return;
      el.setAttribute("href", "mailto:" + value);
      setText(el, value, el.classList.contains("btn") ? "first" : "");
    },
    socials: (value, el) => {
      const paths = {
        linkedin:
          '<path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zM3 9.75h4V21H3zM9.75 9.75h3.8v1.6h.06c.53-1 1.82-2.05 3.75-2.05 4 0 4.74 2.6 4.74 6V21h-4v-4.9c0-1.2 0-2.7-1.7-2.7s-1.95 1.3-1.95 2.6V21h-4z"/>',
        x: '<path d="M17.7 3h3.1l-6.8 7.7L22 21h-6.3l-4.9-6.4L5.2 21H2.1l7.3-8.3L2 3h6.4l4.4 5.9zm-1.1 16.2h1.7L7.5 4.7H5.7z"/>',
        github:
          '<path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.1.79-.25.79-.56v-2c-3.2.7-3.87-1.37-3.87-1.37-.52-1.33-1.28-1.69-1.28-1.69-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.03 1.76 2.69 1.25 3.35.96.1-.74.4-1.25.73-1.54-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.28 1.18-3.09-.12-.29-.51-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.77 0c2.2-1.49 3.17-1.18 3.17-1.18.62 1.59.23 2.76.11 3.05.74.81 1.18 1.83 1.18 3.09 0 4.42-2.69 5.39-5.25 5.68.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5z"/>',
      };
      const labels = { linkedin: "LinkedIn", x: "X", github: "GitHub" };
      el.innerHTML = Object.keys(labels)
        .filter((k) => value && value[k])
        .map(
          (k) =>
            `<a href="${esc(value[k])}" aria-label="${labels[k]}" rel="noopener"><svg viewBox="0 0 24 24"><path d="${paths[k]}"/></svg></a>`,
        )
        .join("");
    },
    infoList: (items, el) => {
      el.innerHTML = (items || [])
        .map(
          (x, i) =>
            `<li><small>${esc(x.label)}</small>${i === 0 ? `<a href="mailto:${esc(x.value)}">${esc(x.value)}</a>` : `<span class="v${i === 2 ? " serif" : ""}"${i === 2 ? ' style="font-size:1.6rem"' : ""}>${esc(x.value)}</span>`}</li>`,
        )
        .join("");
    },
    articleRows: (items, el) => {
      el.innerHTML = (items || [])
        .map(
          (x) =>
            `<a class="rv" href="/insights/${esc(x.slug)}"><time>${esc(x.date)}</time><div><h3>${esc(x.title)}</h3><p>${esc(x.excerpt)}</p><span class="rt">${esc(x.author)} &middot; ${esc(x.readTime)}</span></div>${arrow}</a>`,
        )
        .join("");
    },
    articleBlocks: (blocks, el) => {
      el.innerHTML = (blocks || [])
        .map((b, i) => {
          if (b.type === "h2") return `<h2>${esc(b.text)}</h2>`;
          if (b.type === "ul")
            return `<ul>${(b.items || []).map((x) => `<li>${esc(x)}</li>`).join("")}</ul>`;
          if (b.type === "quote")
            return `<div class="pull">${esc(b.text)}</div>`;
          return `<p${i === 0 ? ' class="first"' : ""}>${esc(b.text)}</p>`;
        })
        .join("");
    },
    caseBlocks: (blocks, el) => {
      el.innerHTML = (blocks || [])
        .map((b, i) => {
          const body = [];
          if (b.lead)
            body.push(
              `<p style="font-size:1.35rem;color:var(--text);line-height:1.55">${esc(b.lead)}</p>`,
            );
          if (b.bullets)
            body.push(
              `<ul>${b.bullets.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>`,
            );
          if (b.paragraphs)
            b.paragraphs.forEach((p) => body.push(`<p>${esc(p)}</p>`));
          if (b.results)
            body.push(
              `<div class="grid g3" style="gap:36px">${b.results.map((r, j) => `<div class="res rv" style="--d:${j * 100}ms"><b${r.count ? ` data-count="${esc(r.count)}"${r.dec ? ` data-dec="${esc(r.dec)}"` : ""}${r.suffix ? ` data-suffix="${esc(r.suffix)}"` : ""}` : ""}>${esc(r.value)}</b><span>${esc(r.label)}</span></div>`).join("")}</div>`,
            );
          return `<div class="case-block"${i === 0 ? ' style="border-top:0"' : ""}><div class="split"><div class="sticky"><span class="eyebrow">${esc(b.eyebrow)}</span></div><div>${body.join("")}</div></div></div>`;
        })
        .join("");
    },
  };

  function renderList(path, cfg) {
    const configs = Array.isArray(cfg) ? cfg : [cfg];
    configs.forEach((item) => {
      const value = get(item.path || path);
      if (value == null) return;
      const selectors = Array.isArray(item.selector)
        ? item.selector
        : [item.selector];
      const els = selectors.flatMap((sel) => qa(sel));
      if (!els.length) return;
      const render = renderers[item.render];
      if (!render) return;
      if (item.replaceWith) {
        els[0].insertAdjacentHTML("beforebegin", render(value, null));
        els.forEach((el) => el.remove());
        return;
      }
      if (item.render === "paragraphs") {
        render(value, els);
        return;
      }
      els.forEach((el) => render(value, el));
    });
  }

  function applyGlobal() {
    const g = B._global || {};
    Object.entries(g.list || {}).forEach(([path, cfg]) =>
      renderList(path, cfg),
    );
    Object.entries(g.text || {}).forEach(([path, sel]) => {
      const [rawSel, mode] = String(sel).split("@");
      setText(
        q(rawSel),
        get(path),
        mode === "last" ? "last" : mode === "first" ? "first" : "",
      );
    });
    (g.special || []).forEach((name) => {
      if (name === "ui") {
        const ui = C.ui || {};
        qa(".f-grid > div:nth-child(2) h4").forEach((el) =>
          setText(el, ui.footerNavigation),
        );
        qa(".f-grid > div:nth-child(3) h4").forEach((el) =>
          setText(el, ui.footerCompany),
        );
        qa(".f-grid > div:nth-child(4) h4").forEach((el) =>
          setText(el, ui.footerStayAhead),
        );
        qa("form.nl-form input[type=email]").forEach((el) => {
          if (ui.newsletterPlaceholder) {
            el.setAttribute("placeholder", ui.newsletterPlaceholder);
            el.setAttribute("aria-label", ui.newsletterPlaceholder);
          }
        });
        qa("form.nl-form button").forEach((el) =>
          setText(el, ui.subscribe, "first"),
        );
      }
      if (name === "siteName") {
        const siteName = (C.settings || {}).siteName;
        if (siteName)
          qa(".f-bottom > span:first-child").forEach((el) => {
            if (el.lastChild && el.lastChild.nodeType === 3)
              el.lastChild.nodeValue = ` ${siteName}.`;
          });
      }
      if (name === "seo") {
        const seoKey =
          page === "case-studies/project.html"
            ? `case-studies/${caseSlug}.html`
            : page;
        let seo = (C.seo || {})[seoKey];
        if (!seo && page === "case-studies/project.html" && caseSlug) {
          const item = findBySlug("caseStudies", caseSlug);
          if (item) {
            seo = {
              title: `${item.title} | Case Study | ${(C.settings || {}).siteName || "Kinetix Technologies"}`,
              description: item.sub || "",
            };
          }
        }
        if (!seo) return;
        document.title = seo.title || document.title;
        qa('meta[name=description],meta[property="og:description"]').forEach(
          (m) => m.setAttribute("content", seo.description || ""),
        );
        qa('meta[property="og:title"]').forEach((m) =>
          m.setAttribute("content", seo.title || ""),
        );
      }
      if (name === "colors") {
        Object.entries((C.settings || {}).colors || {}).forEach(([k, v]) =>
          document.documentElement.style.setProperty("--cms-" + k, v),
        );
      }
      if (name === "logo") {
        const src = (C.settings || {}).logoImage;
        if (src)
          qa(".logo").forEach((a) => {
            const svg = q("svg", a);
            if (svg)
              svg.outerHTML = `<img src="${esc(src)}" alt="${esc((C.settings || {}).siteName || "Kinetix")}">`;
          });
      }
      if (name === "companyFooter") {
        const labels = (C.nav || {}).labels || [];
        const idx = [3, 2, 4, 5, 6];
        qa(".f-grid > div:nth-child(3) ul li a").forEach((a, i) => {
          if (labels[idx[i]]) a.textContent = labels[idx[i]];
        });
      }
    });
  }

  function applyAttrs(attrs) {
    Object.entries(attrs || {}).forEach(([path, spec]) => {
      const [rawSel, mode] = String(spec).split("@");
      const el = q(rawSel);
      const value = get(path);
      if (!el || value == null) return;
      if (mode === "textFirst") {
        setText(el, value, "first");
      } else if (mode === "placeholder") {
        el.setAttribute("placeholder", value);
        if (el.hasAttribute("aria-label")) el.setAttribute("aria-label", value);
      } else if (mode === "value") {
        el.value = value;
      }
    });
  }

  function applyCta(cfg) {
    if (!cfg) return;
    if (cfg.title) setText(q(".cta h2"), get(cfg.title));
    if (cfg.text) setText(q(".cta p"), get(cfg.text));
    if (cfg.eyebrow)
      setText(
        q(".cta .eyebrow"),
        get(cfg.eyebrow) || (C.cta || {}).eyebrow || cfg.eyebrow,
      );
    const label = get(cfg.button || "cta.buttonLabel") || (C.cta || {}).buttonLabel;
    qa(".cta .btn-primary").forEach((btn) => setText(btn, label, "first"));
  }

  function caseStudyBinding(slug) {
    const root = `caseStudies[slug=${slug}]`;
    return {
      list: {
        [`${root}.title`]: { selector: "h1", render: "words" },
        [`${root}.blocks`]: { selector: ".prose", render: "caseBlocks" },
        [`${root}.ctaButton`]: {
          selector: [".actions .btn-primary", ".cta .btn-primary"],
          render: "ctaLabel",
        },
      },
      text: {
        [`${root}.tag`]: "main > section:nth-of-type(1) .hero-tag",
        [`${root}.sub`]: "main > section:nth-of-type(1) .sub",
        [`${root}.client`]: ".meta-grid > div:nth-child(1)",
        [`${root}.service`]: ".meta-grid > div:nth-child(2)",
        [`${root}.year`]: ".meta-grid > div:nth-child(3)",
      },
      cta: {
        eyebrow: "cta.eyebrow",
        title: "cta.title",
        text: "cta.text",
        button: `${root}.ctaButton`,
      },
      special: ["caseHero", "caseNext", "cta"],
    };
  }

  function applyPage() {
    const p =
      B[page] ||
      (page === "case-studies/project.html" && caseSlug
        ? caseStudyBinding(caseSlug)
        : {});
    Object.entries(p.list || {}).forEach(([path, cfg]) =>
      renderList(path, cfg),
    );
    applyAttrs(p.attr);
    Object.entries(p.text || {}).forEach(([path, sel]) =>
      setText(
        q(sel.split("@")[0]),
        get(path),
        sel.endsWith("@first") ? "first" : sel.endsWith("@last") ? "last" : "",
      ),
    );
    Object.entries(p.html || {}).forEach(([path, sel]) => {
      const v = get(path);
      const el = q(sel);
      if (el && v)
        el.innerHTML =
          esc(v.text) +
          ` <a href="${esc(v.link || "#")}">${esc(v.linkText || "")}</a> ` +
          esc(v.tail || "");
    });
    (p.special || []).forEach((name) => {
      if (name === "cta")
        applyCta(
          p.cta || {
            title: "cta.title",
            text: "cta.text",
            eyebrow: "cta.eyebrow",
          },
        );
      if (name === "caseHero") {
        const item = findBySlug("caseStudies", caseSlug);
        const hero = q("main > section:nth-of-type(1)");
        if (item && item.image && hero) {
          const src = String(item.image).replace(/["'()\\]/g, "");
          hero.style.setProperty("--hero-img", `url("${src}")`);
        }
      }
      if (name === "caseNext") {
        const item = findBySlug("caseStudies", caseSlug);
        const next = item && findBySlug("caseStudies", item.next);
        if (next) {
          const a = q(".next .big");
          if (a) {
            a.innerHTML = esc(next.title) + " " + arrow;
            a.setAttribute("href", "/case-studies/" + next.slug);
          }
        }
        setText(q(".next .eyebrow"), (C.ui || {}).nextProject);
        setText(q(".next .link-arrow"), (C.ui || {}).backToWork, "first");
      }
      if (name === "articleNext") {
        const slug = (page.match(/insights\/([^.]+)\.html/) || [])[1];
        const item = findBySlug("articles", slug);
        const next = item && findBySlug("articles", item.related);
        if (next) {
          const a = q(".next .big");
          if (a) {
            a.innerHTML = esc(next.title) + " " + arrow;
            a.setAttribute("href", "/insights/" + next.slug);
          }
        }
        setText(q(".next .eyebrow"), (C.ui || {}).keepReading);
        setText(q(".next .link-arrow"), (C.ui || {}).allInsights, "first");
      }
      if (name === "submitButton")
        setText(
          q("#contact-form button[type=submit]"),
          (C.contact || {}).form?.buttonLabel || "",
          "first",
        );
      if (name === "typeOptions") {
        const sel = q("#type");
        if (sel) {
          const f = (C.contact || {}).form || {};
          const placeholder = sel.querySelector("option[disabled]");
          if (placeholder)
            placeholder.textContent =
              f.typePlaceholder || "Select a project type";
          [...sel.querySelectorAll("option:not([disabled])")].forEach((o) =>
            o.remove(),
          );
          (f.types || []).forEach((t) => {
            const o = document.createElement("option");
            o.textContent = t;
            sel.appendChild(o);
          });
        }
      }
    });
    if (p.cta && !(p.special || []).includes("cta")) applyCta(p.cta);
  }

  applyGlobal();
  applyPage();
  document.dispatchEvent(new CustomEvent("cms:ready", { detail: C }));
  }

  window.KinetixCMS = { init };
  if (window.__CMS__) init(window.__CMS__);
})();
