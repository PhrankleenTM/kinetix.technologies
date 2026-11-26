(() => {
  const $ = (s, r = document) => r.querySelector(s);
  let state = null;
  let activeProjectIndex = null;

  const VIZ_NAMES = ["timeline", "browser", "bars", "layout", "grid", "funnel", "spotlight"];
  const PROJECT_TEMPLATE = {
    title: "Untitled project",
    category: "Websites",
    categories: ["websites"],
    year: String(new Date().getFullYear()),
    description: "",
    details: "",
    tags: [],
    slug: "",
    slugAuto: true,
    link: "",
    image: "",
    viz: "browser",
  };

  function status(message, kind = "") {
    const el = $("#status");
    el.textContent = message;
    el.className = "status " + kind;
  }

  async function api(url, options = {}) {
    let res;
    try {
      res = await fetch(url, {
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        ...options,
      });
    } catch {
      throw new Error("Cannot reach the server. Open /admin on the site to manage content.");
    }
    const body = await res.json().catch(() => ({}));
    if (res.status === 401 && url !== "/api/login") {
      $("#login").hidden = false;
      $("#app").hidden = true;
      state = null;
      throw new Error("Session expired. Sign in again.");
    }
    if (!res.ok) throw new Error(body.error || `Request failed (${res.status})`);
    return body;
  }

  function make(tag, cls, text) {
    const el = document.createElement(tag);
    if (cls) el.className = cls;
    if (text != null) el.textContent = text;
    return el;
  }

  function slugify(value) {
    return String(value || "")
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 64) || "project";
  }

  function normalizeProjects() {
    const projects = state.work.projects || [];
    const used = new Set();
    projects.forEach((project, i) => {
      if (!project || typeof project !== "object") return;
      project.title = project.title || "Untitled project";
      project.tags = Array.isArray(project.tags) ? project.tags : [];
      project.categories = Array.isArray(project.categories) ? project.categories : [];
      if (!project.slug) {
        const match = String(project.link || "").match(/\/case-studies\/([^/?#]+)/);
        project.slug = match ? slugify(decodeURIComponent(match[1])) : slugify(project.title);
        project.slugAuto = true;
      }
      if (used.has(project.slug)) project.slug = `${project.slug}-${i + 1}`;
      used.add(project.slug);
      project.link = "/case-studies/" + project.slug;
      if (typeof project.details !== "string") project.details = "";
    });
    state.work.projects = projects.filter((project) => project && typeof project === "object");
    return state.work.projects;
  }

  function syncCaseStudies() {
    const projects = normalizeProjects();
    const existing = Array.isArray(state.caseStudies) ? state.caseStudies : [];
    const cases = [];
    projects.forEach((project, i) => {
      const title = project.title || "Untitled project";
      const tag = `${project.category || "Project"}${project.year ? " · " + project.year : ""}`;
      const next = projects[(i + 1) % projects.length];
      let item = existing.find((x) => x && x.slug === project.slug);
      if (!item) {
        item = {
          slug: project.slug,
          title,
          tag,
          sub: project.description || "",
          image: project.image || "",
          client: title,
          service: project.category || "Project",
          year: project.year || "",
          blocks: [],
          next: next ? next.slug : project.slug,
          ctaButton: "Discuss a similar project",
        };
      } else {
        Object.assign(item, {
          title,
          tag,
          sub: project.description || "",
          image: project.image || "",
          client: title,
          service: project.category || "Project",
          year: project.year || "",
          next: next ? next.slug : project.slug,
        });
      }
      if (!Array.isArray(item.blocks) || !item.blocks.length) {
        const blocks = [
          {
            eyebrow: "Overview",
            lead:
              String(project.details || "").trim() ||
              String(project.description || "").trim() ||
              `A ${project.category || "project"} built by Kinetix Technologies.`,
          },
        ];
        const bullets = (project.tags || []).filter(Boolean);
        if (bullets.length) blocks.push({ eyebrow: "Capabilities", bullets });
        if (project.description && project.details) {
          blocks.push({ eyebrow: "The brief", paragraphs: [project.description] });
        }
        item.blocks = blocks;
      }
      cases.push(item);
    });
    state.caseStudies = cases;
  }

  function render() {
    const host = $("#fields");
    host.innerHTML = "";
    const projects = normalizeProjects();
    const group = make("section", "group project-manager");
    group.appendChild(make("h2", "", `Projects (${projects.length})`));
    group.appendChild(make("p", "field-hint", "Add a project or click a card to edit its details."));

    const add = make("button", "add-btn", "+ Add project");
    add.type = "button";
    add.addEventListener("click", () => {
      projects.push(JSON.parse(JSON.stringify(PROJECT_TEMPLATE)));
      activeProjectIndex = projects.length - 1;
      render();
    });
    group.appendChild(add);

    const grid = make("div", "project-manager-grid");
    projects.forEach((project, i) => {
      const tile = make("button", "project-tile");
      tile.type = "button";
      const cover = make("div", "project-tile-cover");
      if (project.image) {
        const img = make("img");
        img.src = project.image;
        img.alt = "";
        cover.appendChild(img);
      } else {
        cover.appendChild(make("div", "project-tile-placeholder", "Cover image"));
      }
      tile.appendChild(cover);
      const body = make("div", "project-tile-body");
      body.appendChild(make("div", "project-tile-title", project.title || "Untitled project"));
      body.appendChild(make("div", "project-tile-meta", `${project.category || "Uncategorised"}${project.year ? " � " + project.year : ""}`));
      tile.appendChild(body);
      tile.addEventListener("click", () => { activeProjectIndex = i; render(); });
      grid.appendChild(tile);
    });
    group.appendChild(grid);

    const editorHost = make("div");
    group.appendChild(editorHost);
    host.appendChild(group);
    if (activeProjectIndex != null && projects[activeProjectIndex]) renderEditor(activeProjectIndex, editorHost);
  }

  function renderPreview(project, host) {
    host.innerHTML = "";
    const card = make("div", "project-preview-card");
    const cover = make("div", "project-preview-cover");
    if (project.image) {
      const img = make("img"); img.src = project.image; img.alt = ""; cover.appendChild(img);
    } else {
      cover.appendChild(make("div", "project-preview-art", "Cover preview"));
    }
    card.appendChild(cover);
    const body = make("div", "project-preview-body");
    body.appendChild(make("div", "project-preview-meta", `${project.category || ""}${project.year ? " � " + project.year : ""}`));
    body.appendChild(make("h3", "", project.title || "Project name"));
    body.appendChild(make("p", "", project.description || "Project description will appear here."));
    const tags = make("div", "project-preview-tags");
    (project.tags || []).forEach((t) => tags.appendChild(make("span", "tag", t)));
    body.appendChild(tags);
    card.appendChild(body);
    host.appendChild(card);
  }

  function renderEditor(index, host) {
    const projects = state.work.projects;
    const project = projects[index];
    host.innerHTML = "";
    const editor = make("div", "project-editor");
    const head = make("div", "project-editor-head");
    const titleLabel = make("h3", "", project.title || "New project");
    head.appendChild(titleLabel);
    const done = make("button", "btn btn-ghost", "Done editing");
    done.type = "button";
    done.addEventListener("click", () => { activeProjectIndex = null; render(); });
    head.appendChild(done);
    editor.appendChild(head);

    const layout = make("div", "project-editor-grid");
    const form = make("div", "project-form");
    const previewWrap = make("div", "project-preview-wrap");
    const updatePreview = () => renderPreview(project, previewWrap);

    const field = (label, el, hint) => {
      const f = make("div", "field");
      f.appendChild(make("label", "", label));
      f.appendChild(el);
      if (hint) f.appendChild(make("p", "field-hint", hint));
      form.appendChild(f);
    };

    const imageField = make("div", "field project-image-field");
    imageField.appendChild(make("label", "", "Cover image"));
    const imagePreview = make("div", "project-image-preview");
    const setImage = () => {
      imagePreview.innerHTML = "";
      if (project.image) { const img = make("img"); img.src = project.image; img.alt = ""; imagePreview.appendChild(img); }
      else imagePreview.appendChild(make("div", "project-image-placeholder", "Upload a cover image"));
    };
    const url = document.createElement("input");
    url.type = "text"; url.value = project.image || ""; url.placeholder = "/assets/uploads/project-cover.jpg";
    url.addEventListener("input", () => { project.image = url.value; setImage(); updatePreview(); });
    const file = document.createElement("input");
    file.type = "file"; file.accept = "image/png,image/jpeg,image/gif,image/webp";
    file.addEventListener("change", async () => {
      const f = file.files && file.files[0];
      if (!f) return;
      status("Uploading image�");
      try {
        const dataUrl = await new Promise((resolve, reject) => { const r = new FileReader(); r.onload = () => resolve(r.result); r.onerror = reject; r.readAsDataURL(f); });
        const res = await api("/api/upload", { method: "POST", body: JSON.stringify({ name: f.name, dataUrl }) });
        project.image = res.path; url.value = res.path; setImage(); updatePreview();
        status("Image uploaded. Click Save changes to publish.", "ok");
      } catch (err) { status(err.message, "err"); }
    });
    imageField.append(imagePreview, url, file);
    form.appendChild(imageField);

    const text = (label, key, area, hint) => {
      const input = document.createElement(area ? "textarea" : "input");
      if (!area) input.type = "text";
      input.value = project[key] || "";
      input.addEventListener("input", () => { project[key] = input.value; updatePreview(); });
      field(label, input, hint);
    };
    const title = document.createElement("input");
    title.type = "text";
    title.value = project.title || "";
    title.addEventListener("input", () => {
      project.title = title.value;
      titleLabel.textContent = project.title || "New project";
      if (project.slugAuto !== false) {
        project.slug = slugify(project.title);
        slug.value = project.slug;
      }
      project.link = "/case-studies/" + project.slug;
      updatePreview();
    });
    field("Project name", title);

    const slug = document.createElement("input");
    slug.type = "text";
    slug.value = project.slug || "";
    slug.addEventListener("input", () => {
      project.slug = slugify(slug.value);
      project.slugAuto = false;
      project.link = "/case-studies/" + project.slug;
    });
    field("Page slug", slug, "Creates /case-studies/" + (project.slug || "your-slug") + ".");

    text("Category", "category");
    text("Year", "year");
    text("Short description", "description", true);
    text("Full details", "details", true, "Shown on the project detail page.");

    const tags = document.createElement("input");
    tags.type = "text"; tags.value = (project.tags || []).join(", ");
    tags.addEventListener("input", () => { project.tags = tags.value.split(",").map((s) => s.trim()).filter(Boolean); updatePreview(); });
    field("Tags", tags, "Separate tags with commas.");

    const categories = document.createElement("input");
    categories.type = "text"; categories.value = (project.categories || []).join(", ");
    categories.addEventListener("input", () => { project.categories = categories.value.split(",").map((s) => s.trim()).filter(Boolean); });
    field("Filter categories", categories, "Examples: websites, ecommerce, clinic, erp, crm, custom.");

    const viz = document.createElement("select");
    VIZ_NAMES.forEach((n) => { const o = document.createElement("option"); o.value = n; o.textContent = n; viz.appendChild(o); });
    viz.value = project.viz || "browser";
    viz.addEventListener("change", () => { project.viz = viz.value; updatePreview(); });
    field("Fallback illustration", viz, "Used until a cover image is uploaded.");

    const actions = make("div", "project-editor-actions");
    const remove = make("button", "btn btn-ghost", "Remove project");
    remove.type = "button";
    remove.addEventListener("click", () => { projects.splice(index, 1); activeProjectIndex = null; render(); });
    actions.appendChild(remove);
    form.appendChild(actions);

    layout.append(form, previewWrap);
    editor.appendChild(layout);
    host.appendChild(editor);
    setImage();
    updatePreview();
  }

  async function load() {
    state = await api("/api/content");
    state.work = state.work || {};
    state.work.projects = state.work.projects || [];
    render();
  }

  $("#login-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    $("#login-error").textContent = "";
    try {
      await api("/api/login", { method: "POST", body: JSON.stringify({ password: $("#password").value }) });
      $("#login").hidden = true; $("#app").hidden = false;
      await load();
    } catch (err) { $("#login-error").textContent = err.message; }
  });

  $("#save-btn").addEventListener("click", async () => {
    status("Saving…");
    try {
      syncCaseStudies();
      const res = await api("/api/content", { method: "POST", body: JSON.stringify(state) });
      status(res.storage === "local" ? "Saved locally only. Connect Vercel Blob for live site." : "Saved. Site updated.", res.storage === "local" ? "err" : "ok");
    } catch (err) { status(err.message, "err"); }
  });

  $("#logout-btn").addEventListener("click", async () => {
    await api("/api/logout", { method: "POST", body: "{}" });
    location.reload();
  });

  $("#export-btn").addEventListener("click", () => {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "kinetix-content.json"; a.click();
    URL.revokeObjectURL(a.href);
  });

  $("#import-file").addEventListener("change", async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    try {
      const imported = JSON.parse(await file.text());
      if (!imported || typeof imported !== "object" || Array.isArray(imported)) throw new Error("Invalid backup file");
      state = imported; state.work = state.work || {}; state.work.projects = state.work.projects || [];
      render(); status("Backup loaded. Click Save to publish.", "ok");
    } catch (err) { status(err.message, "err"); }
  });

  $("#password-btn").addEventListener("click", () => { $("#password-modal").hidden = false; $("#new-password").value = ""; $("#confirm-password").value = ""; $("#password-error").textContent = ""; });
  $("#password-cancel").addEventListener("click", () => { $("#password-modal").hidden = true; });
  $("#password-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const a = $("#new-password").value, b = $("#confirm-password").value;
    if (a !== b) { $("#password-error").textContent = "Passwords do not match."; return; }
    try {
      await api("/api/password", { method: "POST", body: JSON.stringify({ password: a }) });
      $("#password-modal").hidden = true; status("Password updated.", "ok");
    } catch (err) { $("#password-error").textContent = err.message; }
  });

  (async () => {
    try {
      const s = await api("/api/status");
      if (s.authenticated) { $("#login").hidden = true; $("#app").hidden = false; await load(); }
    } catch (err) { status(err.message, "err"); }
  })();
})();
