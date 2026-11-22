(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  let state = null;
  let current = null;

  const SECTION_LABELS = {
    settings: "Site settings",
    seo: "SEO & metadata",
    nav: "Navigation",
    home: "Homepage",
    services: "Services page",
    work: "Work & projects",
    about: "About page",
    insights: "Insights page",
    articles: "Articles",
    collaborations: "Collaborations page",
    contact: "Contact page",
    ui: "Interface labels",
    cta: "Shared call to action",
    caseStudies: "Case studies",
  };
  const KEY_LABELS = {
    siteName: "Site name",
    logoText: "Footer wordmark",
    logoImage: "Logo image",
    email: "Contact email",
    footerBlurb: "Footer description",
    footerTagline: "Footer tagline",
    themeColor: "Theme colour",
    social: "Social links",
    colors: "Brand colours",
    labels: "Link labels",
    cta: "Button label",
    tag: "Hero tag",
    titleWords: "Hero heading words",
    sub: "Hero description",
    badges: "Hero badges",
    hero: "Hero",
    marquee: "Marquee items",
    why: "Why section",
    title: "Title",
    text: "Text",
    lead: "Lead text",
    cards: "Cards",
    rows: "Rows",
    stats: "Statistics",
    process: "Process",
    steps: "Steps",
    testimonials: "Testimonials",
    quotes: "Quotes",
    eyebrow: "Eyebrow",
    value: "Value",
    label: "Label",
    link: "Link",
    projects: "Projects",
    categories: "Filter categories",
    tags: "Tags",
    image: "Image",
    viz: "Illustration",
    items: "Items",
    id: "Anchor ID",
    number: "Number",
    features: "Feature list",
    buttonLabel: "Button label",
    description: "Description",
    year: "Year",
    client: "Client",
    service: "Service",
    blocks: "Content blocks",
    slug: "Slug",
    date: "Date",
    author: "Author",
    readTime: "Read time",
    excerpt: "Excerpt",
    related: "Next article slug",
    headline: "Headline",
    detail: "Detail",
    nameLabel: "Name label",
    emailLabel: "Email label",
    companyLabel: "Company label",
    typeLabel: "Type label",
    typePlaceholder: "Type placeholder",
    types: "Project types",
    budgetLabel: "Budget label",
    budgetPlaceholder: "Budget placeholder",
    messageLabel: "Message label",
    messagePlaceholder: "Message placeholder",
    note: "Note",
    details: "Contact details",
    next: "What happens next",
    newsletter: "Newsletter",
    titleWordsText: "Word",
    serif: "Use serif style",
    suffix: "Suffix",
    dec: "Decimals",
    count: "Animated value",
    results: "Results",
    ctaTitle: "CTA heading",
    ctaText: "CTA text",
    paragraphs: "Paragraphs",
    bullets: "Bullets",
  };
  const ICON_NAMES = [
    "bolt",
    "flow",
    "minus",
    "venn",
    "website",
    "cart",
    "clinic",
    "cube",
    "funnel",
    "spark",
    "pencil",
    "link",
    "search",
  ];
  const VIZ_NAMES = [
    "timeline",
    "browser",
    "bars",
    "layout",
    "grid",
    "funnel",
    "spotlight",
  ];
  const TEMPLATES = {
    "work.projects": {
      title: "Untitled project",
      description: "",
      category: "Websites",
      categories: ["websites"],
      year: String(new Date().getFullYear()),
      tags: [],
      image: "",
      viz: "browser",
      link: "contact.html",
    },
    articles: {
      slug: "new-article",
      title: "New article",
      tag: "Insight",
      sub: "",
      date: "",
      author: "Kinetix team",
      readTime: "5 min read",
      excerpt: "",
      related: "why-clinic-systems-fail",
      blocks: [{ type: "p", text: "" }],
    },
    caseStudies: {
      slug: "new-case",
      title: "New case study",
      tag: "Project",
      sub: "",
      client: "",
      service: "",
      year: String(new Date().getFullYear()),
      ctaButton: "Discuss a project",
      next: "mediflow",
      blocks: [{ eyebrow: "Overview", bullets: [], paragraphs: [] }],
    },
    "services.items": {
      id: "new-service",
      number: "07",
      icon: "spark",
      title: "New service",
      description: "",
      features: [],
      buttonLabel: "Discuss a project",
    },
    "collaborations.items": { title: "New option", text: "" },
    "home.why.cards": { icon: "spark", title: "New reason", text: "" },
    "home.services.cards": {
      icon: "spark",
      title: "New service",
      text: "",
      link: "services.html",
    },
    "home.hero.badges": { value: "00", label: "New badge" },
    "home.hero.titleWords": { text: "Word", serif: false },
    "home.testimonials.quotes": { quote: "", initials: "KT", who: "" },
    "home.process.steps": { number: "05", title: "New step", text: "" },
    "about.values.items": { number: "05", title: "New value", text: "" },
    "about.philosophy.items": { title: "", text: "" },
    "contact.details": { label: "Email", value: "hello@example.com" },
    "contact.next.steps": { number: "04", title: "New step", text: "" },
  };
  const IMAGE_KEYS = /^(image|logoImage|photo|picture|thumbnail)$/i;
  const LONG_KEYS =
    /description|text|sub$|lead$|note$|quote$|excerpt$|paragraph|message|blurb|tail|introduction|intro$/i;

  function label(key) {
    if (KEY_LABELS[key]) return KEY_LABELS[key];
    return String(key)
      .replace(/([a-z])([A-Z])/g, "$1 $2")
      .replace(/[_-]+/g, " ")
      .replace(/^./, (c) => c.toUpperCase());
  }

  async function api(url, options = {}) {
    let res;
    try {
      res = await fetch(
        url,
        Object.assign(
          {
            headers: { "Content-Type": "application/json" },
            credentials: "same-origin",
          },
          options,
        ),
      );
    } catch (e) {
      throw new Error(
        "Cannot reach CMS server. Run npm start and open http://localhost:3000/admin.html",
      );
    }
    let body = {};
    try {
      body = await res.json();
    } catch (e) {
      if (!res.ok)
        throw new Error(
          "CMS server unavailable. Run npm start and open http://localhost:3000/admin.html",
        );
    }
    if (!res.ok)
      throw new Error(body.error || `Request failed (${res.status})`);
    return body;
  }

  function status(message, kind = "") {
    const el = $("#status");
    el.textContent = message;
    el.className = "status " + kind;
  }

  function ref(parts, root = state) {
    return parts.reduce((o, k) => (o == null ? undefined : o[k]), root);
  }

  function setRef(parts, value) {
    const parent = ref(parts.slice(0, -1));
    if (parent) parent[parts[parts.length - 1]] = value;
  }

  function removeAt(parts, index) {
    const arr = ref(parts);
    if (Array.isArray(arr)) {
      arr.splice(index, 1);
      renderSection(current);
    }
  }

  function moveAt(parts, index, dir) {
    const arr = ref(parts);
    const next = index + dir;
    if (!Array.isArray(arr) || next < 0 || next >= arr.length) return;
    [arr[index], arr[next]] = [arr[next], arr[index]];
    renderSection(current);
  }

  function newItem(parts, arr) {
    const key = parts.join(".");
    if (TEMPLATES[key]) return JSON.parse(JSON.stringify(TEMPLATES[key]));
    const last = parts[parts.length - 1];
    if (last === "blocks") {
      if (parts.includes("caseStudies"))
        return { eyebrow: "Overview", bullets: [], paragraphs: [] };
      return { type: "p", text: "" };
    }
    const first = arr[0];
    if (first && typeof first === "object" && !Array.isArray(first))
      return Object.fromEntries(
        Object.entries(first).map(([k, v]) => [
          k,
          Array.isArray(v) ? [] : v && typeof v === "object" ? {} : "",
        ]),
      );
    return "";
  }

  function make(tag, cls, html) {
    const el = document.createElement(tag);
    if (cls) el.className = cls;
    if (html != null) el.innerHTML = html;
    return el;
  }

  function renderScalar(value, parts, container) {
    const key = String(parts[parts.length - 1]);
    const field = make("div", "field");
    const lab = make("label", "", label(key));
    field.appendChild(lab);

    if (IMAGE_KEYS.test(key)) {
      if (value) {
        const img = make("img", "img-preview");
        img.src = value;
        img.alt = "";
        field.appendChild(img);
      }
      const text = document.createElement("input");
      text.type = "text";
      text.value = value || "";
      text.placeholder = "/assets/uploads/…";
      text.addEventListener("input", () => setRef(parts, text.value));
      field.appendChild(text);
      const file = document.createElement("input");
      file.type = "file";
      file.accept = "image/png,image/jpeg,image/gif,image/webp";
      file.addEventListener("change", async () => {
        const f = file.files && file.files[0];
        if (!f) return;
        status("Uploading image…");
        try {
          const dataUrl = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(f);
          });
          const res = await api("/api/upload", {
            method: "POST",
            body: JSON.stringify({ name: f.name, dataUrl }),
          });
          setRef(parts, res.path);
          status("Image uploaded. Save to publish.", "ok");
          renderSection(current);
        } catch (err) {
          status(err.message, "err");
        }
      });
      field.appendChild(file);
      container.appendChild(field);
      return;
    }

    if (key === "icon" || key === "viz") {
      const select = document.createElement("select");
      const options = key === "icon" ? ICON_NAMES : VIZ_NAMES;
      options.forEach((o) => {
        const opt = document.createElement("option");
        opt.value = o;
        opt.textContent = o;
        select.appendChild(opt);
      });
      select.value = value || options[0];
      select.addEventListener("change", () => setRef(parts, select.value));
      field.appendChild(select);
      container.appendChild(field);
      return;
    }

    if (typeof value === "boolean") {
      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.checked = !!value;
      checkbox.addEventListener("change", () =>
        setRef(parts, checkbox.checked),
      );
      field.appendChild(checkbox);
      container.appendChild(field);
      return;
    }

    if (typeof value === "number") {
      const input = document.createElement("input");
      input.type = "number";
      input.step = "any";
      input.value = value;
      input.addEventListener("input", () =>
        setRef(parts, input.value === "" ? 0 : Number(input.value)),
      );
      field.appendChild(input);
      container.appendChild(field);
      return;
    }

    const useArea = LONG_KEYS.test(key) || String(value || "").length > 110;
    const input = document.createElement(useArea ? "textarea" : "input");
    if (!useArea) input.type = "text";
    input.value = value == null ? "" : value;
    input.addEventListener("input", () => setRef(parts, input.value));
    field.appendChild(input);
    container.appendChild(field);
  }

  function renderObject(obj, parts, container, title) {
    const group = make("section", "group");
    if (title) group.appendChild(make("h2", "", title));
    Object.keys(obj || {}).forEach((k) =>
      renderValue(obj[k], parts.concat(k), group),
    );
    const add = make("button", "add-btn", "+ Add field");
    add.type = "button";
    add.addEventListener("click", () => {
      const key = prompt("Field name");
      if (!key || key in obj) return;
      obj[key] = "";
      renderSection(current);
    });
    group.appendChild(add);
    container.appendChild(group);
    return group;
  }

  function renderArray(arr, parts, container) {
    const group = make("section", "group");
    group.appendChild(
      make(
        "h2",
        "",
        `${label(String(parts[parts.length - 1]))} (${arr.length})`,
      ),
    );
    arr.forEach((item, i) => {
      const wrap = make("div", "item");
      const head = make("div", "item-head");
      head.appendChild(make("strong", "", `Item ${i + 1}`));
      const tools = make("div", "item-tools");
      [
        ["↑", -1],
        ["↓", 1],
      ].forEach(([symbol, dir]) => {
        const b = make("button", "", symbol);
        b.type = "button";
        b.title = dir < 0 ? "Move up" : "Move down";
        b.addEventListener("click", () => moveAt(parts, i, dir));
        tools.appendChild(b);
      });
      const del = make("button", "", "Remove");
      del.type = "button";
      del.addEventListener("click", () => removeAt(parts, i));
      tools.appendChild(del);
      head.appendChild(tools);
      wrap.appendChild(head);
      renderValue(item, parts.concat(i), wrap);
      group.appendChild(wrap);
    });
    const add = make(
      "button",
      "add-btn",
      `+ Add ${label(String(parts[parts.length - 1])).replace(/s$/, "")}`,
    );
    add.type = "button";
    add.addEventListener("click", () => {
      arr.push(newItem(parts, arr));
      renderSection(current);
    });
    group.appendChild(add);
    container.appendChild(group);
  }

  function renderValue(value, parts, container) {
    if (Array.isArray(value)) {
      renderArray(value, parts, container);
      return;
    }
    if (value && typeof value === "object") {
      renderObject(value, parts, container, null);
      return;
    }
    renderScalar(value, parts, container);
  }

  function renderSection(key) {
    if (!state || (key !== "__json" && !(key in state))) return;
    current = key;
    if (key === "__json") {
      $$("#sections button").forEach((b) =>
        b.classList.toggle("active", b.dataset.key === key),
      );
      $("#section-title").textContent = "Raw JSON";
      const host = $("#fields");
      host.innerHTML = "";
      const group = make("section", "group");
      const field = make("div", "field");
      field.appendChild(make("label", "", "Content JSON"));
      const area = document.createElement("textarea");
      area.className = "raw-json";
      area.value = JSON.stringify(state, null, 2);
      field.appendChild(area);
      group.appendChild(field);
      const apply = make("button", "add-btn", "Apply JSON");
      apply.type = "button";
      apply.addEventListener("click", () => {
        try {
          const value = JSON.parse(area.value);
          if (!value || typeof value !== "object" || Array.isArray(value))
            throw new Error("JSON must be an object");
          state = value;
          renderSections();
          renderSection(Object.keys(state)[0]);
          status("JSON applied. Save to publish.", "ok");
        } catch (err) {
          status(err.message, "err");
        }
      });
      group.appendChild(apply);
      host.appendChild(group);
      window.scrollTo({ top: 0 });
      return;
    }
    $$("#sections button").forEach((b) =>
      b.classList.toggle("active", b.dataset.key === key),
    );
    $("#section-title").textContent = SECTION_LABELS[key] || label(key);
    const host = $("#fields");
    host.innerHTML = "";
    renderObject(state[key], [key], host, null);
    window.scrollTo({ top: 0 });
  }

  function renderSections() {
    const host = $("#sections");
    host.innerHTML = "";
    Object.keys(state).forEach((key) => {
      const b = make("button", "", SECTION_LABELS[key] || label(key));
      b.type = "button";
      b.dataset.key = key;
      b.addEventListener("click", () => renderSection(key));
      host.appendChild(b);
    });
    const raw = make("button", "", "Raw JSON");
    raw.type = "button";
    raw.dataset.key = "__json";
    raw.addEventListener("click", () => renderSection("__json"));
    host.appendChild(raw);
  }

  async function load() {
    state = await api("/api/content");
    renderSections();
    renderSection(Object.keys(state)[0]);
  }

  $("#login-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    $("#login-error").textContent = "";
    try {
      await api("/api/login", {
        method: "POST",
        body: JSON.stringify({ password: $("#password").value }),
      });
      $("#login").hidden = true;
      $("#app").hidden = false;
      await load();
    } catch (err) {
      $("#login-error").textContent = err.message;
    }
  });

  $("#save-btn").addEventListener("click", async () => {
    status("Saving…");
    try {
      await api("/api/content", {
        method: "POST",
        body: JSON.stringify(state),
      });
      status("Saved. Site updated.", "ok");
    } catch (err) {
      status(err.message, "err");
    }
  });

  $("#logout-btn").addEventListener("click", async () => {
    await api("/api/logout", { method: "POST", body: "{}" });
    location.reload();
  });

  $("#export-btn").addEventListener("click", () => {
    const blob = new Blob([JSON.stringify(state, null, 2)], {
      type: "application/json",
    });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "kinetix-content.json";
    a.click();
    URL.revokeObjectURL(a.href);
  });

  $("#import-file").addEventListener("change", async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    try {
      const imported = JSON.parse(await file.text());
      if (!imported || typeof imported !== "object" || Array.isArray(imported))
        throw new Error("Invalid backup file");
      state = imported;
      renderSections();
      renderSection(Object.keys(state)[0]);
      status("Backup loaded. Click Save to publish.", "ok");
    } catch (err) {
      status(err.message, "err");
    }
  });

  $("#password-btn").addEventListener("click", () => {
    $("#password-modal").hidden = false;
    $("#new-password").value = "";
    $("#confirm-password").value = "";
    $("#password-error").textContent = "";
  });
  $("#password-cancel").addEventListener("click", () => {
    $("#password-modal").hidden = true;
  });
  $("#password-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const a = $("#new-password").value,
      b = $("#confirm-password").value;
    if (a !== b) {
      $("#password-error").textContent = "Passwords do not match.";
      return;
    }
    try {
      await api("/api/password", {
        method: "POST",
        body: JSON.stringify({ password: a }),
      });
      $("#password-modal").hidden = true;
      status("Password updated.", "ok");
    } catch (err) {
      $("#password-error").textContent = err.message;
    }
  });

  (async () => {
    try {
      const s = await api("/api/status");
      if (s.authenticated) {
        $("#login").hidden = true;
        $("#app").hidden = false;
        await load();
      }
    } catch (err) {
      status(err.message, "err");
    }
  })();
})();
