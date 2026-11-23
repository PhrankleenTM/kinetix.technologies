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
      link: "/contact",
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
      link: "/services",
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
  const PATH_LABELS = {
    settings: "Site settings",
    "settings.social": "Social profile links",
    "settings.colors": "Theme colours",
    seo: "Search engine metadata",
    nav: "Navigation",
    "nav.labels[]": "Navigation labels",
    "home.hero": "Homepage hero",
    "home.hero.titleWords[]": "Homepage hero headline words",
    "home.hero.badges[]": "Homepage hero proof badges",
    "home.marquee[]": "Homepage marquee items",
    "home.why": "Homepage why section",
    "home.why.cards[]": "Homepage reason cards",
    "home.services": "Homepage services section",
    "home.services.cards[]": "Homepage service cards",
    "home.work": "Homepage selected work",
    "home.work.rows[]": "Homepage featured projects",
    "home.stats[]": "Homepage impact statistics",
    "home.process": "Homepage process",
    "home.process.steps[]": "Homepage process steps",
    "home.testimonials": "Homepage testimonials",
    "home.testimonials.quotes[]": "Homepage testimonial quotes",
    "services.hero": "Services hero",
    "services.hero.titleWords[]": "Services hero headline words",
    "services.items[]": "Service blocks",
    "services.items[].features[]": "Service features",
    "work.hero": "Work page hero",
    "work.hero.titleWords[]": "Work page hero headline words",
    "work.hero.badges[]": "Work page hero proof badges",
    "work.intro": "Work page intro",
    "work.filters[]": "Portfolio category filters",
    "work.projects[]": "Portfolio projects",
    "work.projects[].categories[]": "Project categories",
    "work.projects[].tags[]": "Project capability tags",
    "work.empty": "Empty portfolio message",
    "about.hero": "About page hero",
    "about.hero.titleWords[]": "About page hero headline words",
    "about.story": "About story",
    "about.story.paragraphs[]": "About story paragraphs",
    "about.principles": "Working principles",
    "about.principles.items[]": "Working principles",
    "about.values": "Company values",
    "about.values.items[]": "Company values",
    "about.working": "Working with us",
    "about.working.items[]": "Working-with-us points",
    "about.philosophy": "Philosophy",
    "about.philosophy.items[]": "Philosophy commitments",
    "insights.hero": "Insights page hero",
    "insights.hero.titleWords[]": "Insights page hero headline words",
    "insights.intro": "Insights page intro",
    "insights.newsletter": "Insights newsletter",
    "articles[]": "Articles",
    "articles[].blocks[]": "Article content blocks",
    "articles[].blocks[].items[]": "Article list items",
    "collaborations.hero": "Collaborations hero",
    "collaborations.hero.titleWords[]": "Collaborations hero headline words",
    "collaborations.intro": "Collaborations intro",
    "collaborations.items[]": "Ways to collaborate",
    "collaborations.process": "Collaborations process",
    "contact.hero": "Contact hero",
    "contact.hero.titleWords[]": "Contact hero headline words",
    "contact.intro": "Contact intro",
    "contact.form": "Contact form",
    "contact.form.types[]": "Project type options",
    "contact.details[]": "Contact detail rows",
    "contact.next": "After you send",
    "contact.next.steps[]": "Next-step items",
    "contact.newsletter": "Contact newsletter",
    ui: "Interface labels",
    cta: "Shared call to action",
    "caseStudies[]": "Case studies",
    "caseStudies[].blocks[]": "Case study sections",
    "caseStudies[].blocks[].paragraphs[]": "Case study paragraphs",
    "caseStudies[].blocks[].bullets[]": "Case study bullet points",
    "caseStudies[].blocks[].results[]": "Case study result metrics",
  };

  const ITEM_NOUNS = {
    "nav.labels[]": "Navigation label",
    "home.hero.titleWords[]": "Headline word",
    "home.hero.badges[]": "Hero badge",
    "home.marquee[]": "Marquee phrase",
    "home.why.cards[]": "Reason card",
    "home.services.cards[]": "Service card",
    "home.work.rows[]": "Featured project",
    "home.stats[]": "Impact statistic",
    "home.process.steps[]": "Process step",
    "home.testimonials.quotes[]": "Testimonial",
    "services.items[]": "Service",
    "services.items[].features[]": "Service feature",
    "work.hero.titleWords[]": "Headline word",
    "work.hero.badges[]": "Hero badge",
    "work.filters[]": "Portfolio filter",
    "work.projects[]": "Project",
    "work.projects[].categories[]": "Project category",
    "work.projects[].tags[]": "Project tag",
    "about.hero.titleWords[]": "Headline word",
    "about.story.paragraphs[]": "Story paragraph",
    "about.principles.items[]": "Principle",
    "about.values.items[]": "Value",
    "about.working.items[]": "Working point",
    "about.philosophy.items[]": "Philosophy commitment",
    "insights.hero.titleWords[]": "Headline word",
    "articles[]": "Article",
    "articles[].blocks[]": "Content block",
    "articles[].blocks[].items[]": "List item",
    "collaborations.hero.titleWords[]": "Headline word",
    "collaborations.items[]": "Collaboration option",
    "contact.hero.titleWords[]": "Headline word",
    "contact.form.types[]": "Project type",
    "contact.details[]": "Contact detail",
    "contact.next.steps[]": "Next step",
    "caseStudies[]": "Case study",
    "caseStudies[].blocks[]": "Case study section",
    "caseStudies[].blocks[].paragraphs[]": "Case study paragraph",
    "caseStudies[].blocks[].bullets[]": "Case study bullet",
    "caseStudies[].blocks[].results[]": "Result metric",
  };

  const DEFAULT_NAME_KEYS = [
    "title",
    "name",
    "label",
    "who",
    "text",
    "value",
    "lead",
    "eyebrow",
    "slug",
  ];
  const BLOCK_TYPE_NAMES = {
    p: "Paragraph",
    paragraph: "Paragraph",
    quote: "Quote",
    bullets: "Bullets",
    list: "List",
  };
  const ITEM_NAME_KEYS = {
    "home.hero.badges[]": ["label", "value"],
    "work.hero.badges[]": ["label", "value"],
    "home.stats[]": ["label", "value"],
    "articles[].blocks[]": ["type", "text"],
    "caseStudies[].blocks[]": ["eyebrow", "lead"],
    "caseStudies[].blocks[].results[]": ["label", "value"],
  };

  const FIELD_LABELS = {
    "settings.siteName": "Site name",
    "settings.logoText": "Footer wordmark text",
    "settings.logoImage": "Logo image",
    "settings.email": "Contact email address",
    "settings.footerBlurb": "Footer description",
    "settings.footerTagline": "Footer tagline",
    "settings.themeColor": "Theme colour",
    "settings.social.linkedin": "LinkedIn URL",
    "settings.social.x": "X/Twitter URL",
    "settings.social.github": "GitHub URL",
    "settings.colors.bg": "Background colour",
    "settings.colors.bg-deep": "Deep background colour",
    "settings.colors.surface": "Surface colour",
    "settings.colors.surface-2": "Secondary surface colour",
    "settings.colors.muted": "Muted text colour",
    "settings.colors.text": "Body text colour",
    "settings.colors.accent": "Accent colour",
    "settings.colors.accent-ink": "Accent text colour",
    "settings.colors.line": "Border colour",
    "settings.colors.line-strong": "Strong border colour",
    "nav.labels[]": "Navigation label text",
    "nav.cta": "Navigation button label",
    "home.hero.tag": "Homepage hero eyebrow",
    "home.hero.sub": "Homepage hero description",
    "home.hero.badges[].value": "Badge number or value",
    "home.hero.badges[].label": "Badge caption",
    "home.marquee[]": "Marquee phrase",
    "home.why.eyebrow": "Why-section eyebrow",
    "home.why.title": "Why-section heading",
    "home.why.lead": "Why-section description",
    "home.why.cards[].icon": "Reason card icon",
    "home.why.cards[].title": "Reason card heading",
    "home.why.cards[].text": "Reason card description",
    "home.services.eyebrow": "Homepage services eyebrow",
    "home.services.title": "Homepage services heading",
    "home.services.cards[].icon": "Service card icon",
    "home.services.cards[].title": "Service card heading",
    "home.services.cards[].text": "Service card description",
    "home.services.cards[].link": "Service card link",
    "home.work.eyebrow": "Homepage work eyebrow",
    "home.work.title": "Homepage work heading",
    "home.work.rows[].year": "Project year",
    "home.work.rows[].title": "Project name",
    "home.work.rows[].category": "Project category",
    "home.work.rows[].link": "Project link",
    "home.stats[].value": "Statistic number",
    "home.stats[].dec": "Decimal places",
    "home.stats[].suffix": "Statistic suffix",
    "home.stats[].label": "Statistic caption",
    "home.process.eyebrow": "Process eyebrow",
    "home.process.title": "Process heading",
    "home.process.steps[].number": "Step number",
    "home.process.steps[].title": "Step heading",
    "home.process.steps[].text": "Step description",
    "home.testimonials.eyebrow": "Testimonials eyebrow",
    "home.testimonials.title": "Testimonials heading",
    "home.testimonials.ctaTitle": "Testimonials CTA heading",
    "home.testimonials.ctaText": "Testimonials CTA text",
    "home.testimonials.quotes[].quote": "Quote text",
    "home.testimonials.quotes[].initials": "Author initials",
    "home.testimonials.quotes[].who": "Author role or company",
    "services.ctaTitle": "Services CTA heading",
    "services.ctaText": "Services CTA text",
    "services.items[].id": "Section anchor ID",
    "services.items[].number": "Service number",
    "services.items[].title": "Service name",
    "services.items[].icon": "Service icon",
    "services.items[].description": "Service description",
    "services.items[].features[]": "Included feature",
    "services.items[].buttonLabel": "Service button label",
    "work.hero.tag": "Work page hero eyebrow",
    "work.hero.sub": "Work page hero description",
    "work.hero.badges[].value": "Badge number or value",
    "work.hero.badges[].label": "Badge caption",
    "work.intro.eyebrow": "Portfolio intro eyebrow",
    "work.intro.title": "Portfolio intro heading",
    "work.filters[].label": "Filter name",
    "work.filters[].value": "Filter value used in code",
    "work.projects[].title": "Project name",
    "work.projects[].category": "Project category label",
    "work.projects[].categories[]": "Filter category value",
    "work.projects[].year": "Project year",
    "work.projects[].description": "Project description",
    "work.projects[].tags[]": "Capability tag",
    "work.projects[].link": "Project or case study link",
    "work.projects[].image": "Project image",
    "work.projects[].viz": "Project illustration",
    "work.empty.text": "Empty state message",
    "work.empty.linkText": "Empty state link label",
    "work.empty.link": "Empty state link",
    "work.empty.tail": "Empty state trailing text",
    "about.hero.tag": "About page hero eyebrow",
    "about.hero.sub": "About page hero description",
    "about.story.eyebrow": "Story eyebrow",
    "about.story.title": "Story heading",
    "about.story.paragraphs[]": "Story paragraph",
    "about.principles.eyebrow": "Principles eyebrow",
    "about.principles.items[]": "Working principle",
    "about.values.eyebrow": "Values eyebrow",
    "about.values.title": "Values heading",
    "about.values.items[].number": "Value number",
    "about.values.items[].title": "Value name",
    "about.values.items[].text": "Value description",
    "about.working.eyebrow": "Working-with-us eyebrow",
    "about.working.title": "Working-with-us heading",
    "about.working.items[]": "Working-with-us point",
    "about.philosophy.eyebrow": "Philosophy eyebrow",
    "about.philosophy.title": "Philosophy heading",
    "about.philosophy.items[].title": "Commitment name",
    "about.philosophy.items[].text": "Commitment explanation",
    "insights.hero.tag": "Insights page hero eyebrow",
    "insights.hero.sub": "Insights page hero description",
    "insights.intro.eyebrow": "Insights intro eyebrow",
    "insights.intro.title": "Insights intro heading",
    "insights.intro.text": "Insights intro text",
    "insights.newsletter.eyebrow": "Newsletter eyebrow",
    "insights.newsletter.title": "Newsletter heading",
    "insights.newsletter.lead": "Newsletter description",
    "insights.newsletter.note": "Newsletter fine print",
    "articles[].slug": "Article URL slug",
    "articles[].date": "Publication date",
    "articles[].author": "Author",
    "articles[].readTime": "Reading time",
    "articles[].title": "Article title",
    "articles[].excerpt": "Article summary",
    "articles[].tag": "Article category tag",
    "articles[].sub": "Article subtitle",
    "articles[].blocks[].type": "Block type",
    "articles[].blocks[].text": "Block text",
    "articles[].blocks[].items[]": "List item text",
    "articles[].related": "Related article slug",
    "collaborations.hero.tag": "Collaborations hero eyebrow",
    "collaborations.hero.sub": "Collaborations hero description",
    "collaborations.hero.buttonLabel": "Collaborations hero button label",
    "collaborations.intro.eyebrow": "Collaborations intro eyebrow",
    "collaborations.intro.title": "Collaborations intro heading",
    "collaborations.items[].number": "Option number",
    "collaborations.items[].title": "Option name",
    "collaborations.items[].text": "Option description",
    "collaborations.process.eyebrow": "Process eyebrow",
    "collaborations.process.title": "Process heading",
    "collaborations.process.text": "Process description",
    "contact.hero.tag": "Contact hero eyebrow",
    "contact.hero.sub": "Contact hero description",
    "contact.intro.eyebrow": "Contact intro eyebrow",
    "contact.intro.title": "Contact intro heading",
    "contact.form.nameLabel": "Name field label",
    "contact.form.emailLabel": "Email field label",
    "contact.form.companyLabel": "Company field label",
    "contact.form.typeLabel": "Project type field label",
    "contact.form.typePlaceholder": "Project type placeholder",
    "contact.form.types[]": "Project type option",
    "contact.form.budgetLabel": "Budget field label",
    "contact.form.budgetPlaceholder": "Budget placeholder",
    "contact.form.messageLabel": "Message field label",
    "contact.form.messagePlaceholder": "Message placeholder",
    "contact.form.buttonLabel": "Submit button label",
    "contact.form.note": "Form helper note",
    "contact.details[].label": "Contact detail name",
    "contact.details[].value": "Contact detail value",
    "contact.next.eyebrow": "Next-steps eyebrow",
    "contact.next.title": "Next-steps heading",
    "contact.next.text": "Next-steps description",
    "contact.next.steps[].number": "Step number",
    "contact.next.steps[].title": "Step heading",
    "contact.next.steps[].text": "Step description",
    "contact.newsletter.eyebrow": "Newsletter eyebrow",
    "contact.newsletter.title": "Newsletter heading",
    "contact.newsletter.lead": "Newsletter description",
    "contact.newsletter.note": "Newsletter fine print",
    "cta.eyebrow": "CTA eyebrow",
    "cta.title": "CTA heading",
    "cta.text": "CTA description",
    "cta.buttonLabel": "CTA button label",
    "caseStudies[].slug": "Case study URL slug",
    "caseStudies[].title": "Case study title",
    "caseStudies[].tag": "Case study category tag",
    "caseStudies[].sub": "Case study subtitle",
    "caseStudies[].client": "Client description",
    "caseStudies[].service": "Service name",
    "caseStudies[].year": "Project year",
    "caseStudies[].blocks[].eyebrow": "Section eyebrow",
    "caseStudies[].blocks[].lead": "Section lead text",
    "caseStudies[].blocks[].paragraphs[]": "Paragraph text",
    "caseStudies[].blocks[].bullets[]": "Bullet point",
    "caseStudies[].blocks[].results[].value": "Result display value",
    "caseStudies[].blocks[].results[].suffix": "Result suffix",
    "caseStudies[].blocks[].results[].label": "Result caption",
    "caseStudies[].blocks[].results[].count": "Animated result number",
    "caseStudies[].blocks[].results[].dec": "Result decimal places",
    "caseStudies[].next": "Next case study slug",
    "caseStudies[].ctaButton": "Case study button label",
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

  function pathOf(parts) {
    return parts
      .map((p) => (/^\d+$/.test(String(p)) ? "[]" : String(p)))
      .join(".");
  }

  function singular(text) {
    const value = String(text || "");
    if (/ies$/i.test(value)) return value.replace(/ies$/i, "y");
    if (/sses$/i.test(value)) return value.replace(/es$/i, "");
    return /s$/i.test(value) ? value.replace(/s$/i, "") : value;
  }

  function short(value) {
    const text = String(value == null ? "" : value)
      .replace(/\s+/g, " ")
      .trim();
    return text.length > 42 ? text.slice(0, 41) + "…" : text;
  }

  function itemValueName(value, path) {
    if (value == null) return "";
    if (typeof value !== "object") return short(value);
    if (path === "articles[].blocks[]" && value.type)
      return BLOCK_TYPE_NAMES[value.type] || label(value.type);
    const keys = ITEM_NAME_KEYS[path] || DEFAULT_NAME_KEYS;
    for (const key of keys) {
      if (value[key] != null && value[key] !== "") return short(value[key]);
    }
    return "";
  }

  function itemTitle(value, parts, index) {
    const path = pathOf(parts);
    const noun =
      ITEM_NOUNS[path] ||
      singular(PATH_LABELS[path] || label(String(parts[parts.length - 1]))) ||
      "Item";
    const name = itemValueName(value, path);
    return `${noun} ${index + 1}${name ? `: ${name}` : ""}`;
  }

  function parentContext(parts) {
    for (let i = parts.length - 1; i >= 0; i--) {
      if (!/^\d+$/.test(String(parts[i]))) continue;
      const item = ref(parts.slice(0, i + 1));
      if (item == null) continue;
      const name = itemValueName(item, pathOf(parts.slice(0, i + 1)));
      if (name) return short(name);
    }
    return "";
  }

  function arrayTitle(parts, arr) {
    const path = pathOf(parts);
    const base = PATH_LABELS[path] || label(String(parts[parts.length - 1]));
    const context = parentContext(parts);
    return `${base}${context ? ` — ${context}` : ""} (${arr.length})`;
  }

  function addText(parts) {
    const path = pathOf(parts);
    const noun =
      ITEM_NOUNS[path] ||
      singular(PATH_LABELS[path] || label(String(parts[parts.length - 1]))) ||
      "item";
    return `+ Add ${noun}`;
  }

  function fieldLabel(parts) {
    const path = pathOf(parts);
    const key = String(parts[parts.length - 1]);
    if (FIELD_LABELS[path]) return FIELD_LABELS[path];
    if (path.endsWith(".titleWords[].text")) return "Headline word text";
    if (path.endsWith(".titleWords[].serif")) return "Use serif style";
    if (path.endsWith(".hero.tag")) return "Page hero eyebrow";
    if (path.endsWith(".hero.sub")) return "Page hero description";
    if (path.endsWith(".ctaTitle")) return "CTA heading";
    if (path.endsWith(".ctaText")) return "CTA description";
    if (path.startsWith("seo."))
      return key === "title" ? "Page title" : "Meta description";
    if (/^\d+$/.test(key)) {
      const arrayPath = pathOf(parts.slice(0, -1));
      const noun =
        ITEM_NOUNS[arrayPath] || singular(PATH_LABELS[arrayPath] || "item");
      return `${noun} ${Number(key) + 1}`;
    }
    return label(key);
  }

  function objectTitle(parts) {
    if (parts.length < 2) return "";
    return PATH_LABELS[pathOf(parts)] || "";
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
        "Cannot reach CMS server. Open /admin on this site.",
      );
    }
    let body = {};
    try {
      body = await res.json();
    } catch (e) {
      if (!res.ok)
        throw new Error(
          "CMS server unavailable. Open /admin on this site.",
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
    const lab = make("label", "", fieldLabel(parts));
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
    group.appendChild(make("h2", "", arrayTitle(parts, arr)));
    arr.forEach((item, i) => {
      const wrap = make("div", "item");
      const head = make("div", "item-head");
      head.appendChild(make("strong", "", itemTitle(item, parts, i)));
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
    const add = make("button", "add-btn", addText(parts));
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
      renderObject(value, parts, container, objectTitle(parts));
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
