(() => {
  const DEFAULT_SITE_URL = "https://kinetixtechnologies.vercel.app";
  const LOCALE = "en-NG";

  function pageKey() {
    let value = decodeURIComponent(location.pathname || "/");
    value = value.replace(/^\/+/, "");
    if (!value || value.endsWith("/")) return value + "index.html";
    if (/\.[a-z0-9]+$/i.test(value)) return value;
    return value + ".html";
  }

  function normalizedPath() {
    let value = decodeURIComponent(location.pathname || "/");
    value = value.replace(/\/{2,}/g, "/");
    if (value.length > 1 && value.endsWith("/")) value = value.slice(0, -1);
    value = value.replace(/\.html$/i, "");
    if (value === "/index" || !value) value = "/";
    return value;
  }

  function absoluteUrl(value, siteUrl) {
    const text = String(value || "").trim();
    if (!text) return siteUrl + "/og-image.png";
    if (/^https?:\/\//i.test(text)) return text;
    return siteUrl + (text.startsWith("/") ? text : "/" + text);
  }

  function setMeta(attribute, key, value) {
    let el = document.head.querySelector(`meta[${attribute}="${key}"]`);
    if (!el) {
      el = document.createElement("meta");
      el.setAttribute(attribute, key);
      document.head.appendChild(el);
    }
    el.setAttribute("content", value == null ? "" : String(value));
  }

  function setCanonical(url) {
    let el = document.head.querySelector('link[rel="canonical"]');
    if (!el) {
      el = document.createElement("link");
      el.setAttribute("rel", "canonical");
      document.head.appendChild(el);
    }
    el.setAttribute("href", url);
  }

  function escapeHtml(value) {
    return String(value || "").replace(/[&<>"']/g, (char) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    })[char]);
  }

  function labelFromTitle(title, fallback) {
    return String(title || fallback || "Kinetix").split("|")[0].trim();
  }

  function lookup(items, slug, path) {
    return (items || []).find((entry) =>
      entry &&
      (entry.slug === slug || entry.id === slug || entry.key === slug || entry.path === path),
    );
  }

  function applySeo(data) {
    const settings = (data && data.settings) || {};
    const siteUrl = String(settings.siteUrl || DEFAULT_SITE_URL).replace(/\/$/, "");
    const siteName = settings.siteName || "Kinetix Technologies";
    const path = normalizedPath();
    const canonical = siteUrl + (path === "/" ? "/" : path);
    const seoPath = path === "/" ? "index.html" : path.replace(/^\//, "") + ".html";
    const seo = ((data && data.seo) || {})[seoPath] || {};
    const title = seo.title || document.title || siteName;
    const description =
      seo.description ||
      (document.head.querySelector('meta[name="description"]') || {}).content ||
      "";
    const image = absoluteUrl(
      (document.head.querySelector('meta[property="og:image"]') || {}).content,
      siteUrl,
    );
    const isArticle = /^\/insights\/[^/]+$/.test(path);
    const isCaseStudy = /^\/case-studies\/[^/]+$/.test(path);
    const slug = path.split("/").filter(Boolean).pop() || "";
    const article = isArticle ? lookup((data && data.articles) || [], slug, seoPath) : null;
    const caseStudy = isCaseStudy
      ? lookup((data && data.caseStudies) || [], slug, seoPath)
      : null;

    setCanonical(canonical);
    setMeta("name", "robots", "index,follow,max-snippet:-1,max-image-preview:large,max-video-preview:-1");
    setMeta("property", "og:url", canonical);
    setMeta("property", "og:site_name", siteName);
    setMeta("property", "og:locale", LOCALE);
    setMeta("property", "og:type", isArticle ? "article" : "website");
    setMeta("name", "twitter:card", "summary_large_image");
    setMeta("name", "twitter:title", title);
    setMeta("name", "twitter:description", description);
    setMeta("name", "twitter:image", image);
    if (article && article.datePublished)
      setMeta("property", "article:published_time", article.datePublished);
    if (article && article.dateModified)
      setMeta("property", "article:modified_time", article.dateModified);

    const graph = [
      {
        "@type": "Organization",
        "@id": siteUrl + "/#organization",
        name: siteName,
        url: siteUrl,
        ...(settings.email ? { email: settings.email } : {}),
        logo: {
          "@type": "ImageObject",
          "@id": siteUrl + "/#logo",
          url: siteUrl + "/og-image.png",
          width: 1024,
          height: 1024,
        },
      },
      {
        "@type": "WebSite",
        "@id": siteUrl + "/#website",
        url: siteUrl,
        name: siteName,
        inLanguage: LOCALE,
        publisher: { "@id": siteUrl + "/#organization" },
      },
      {
        "@type": "WebPage",
        "@id": canonical + "#webpage",
        url: canonical,
        name: title,
        description: description,
        inLanguage: LOCALE,
        isPartOf: { "@id": siteUrl + "/#website" },
        about: { "@id": siteUrl + "/#organization" },
        primaryImageOfPage: { "@id": canonical + "#primaryimage" },
      },
      {
        "@type": "ImageObject",
        "@id": canonical + "#primaryimage",
        url: image,
        width: 1024,
        height: 1024,
      },
    ];

    if (path !== "/") {
      const currentLabel = labelFromTitle(
        (article && article.title) ||
          (caseStudy && caseStudy.title) ||
          seo.title ||
          title,
        path.split("/").filter(Boolean).pop(),
      );
      const parent = /^\/case-studies\//.test(path)
        ? { label: "Work", href: "/work" }
        : /^\/insights\//.test(path)
          ? { label: "Insights", href: "/insights" }
          : null;
      const items = [
        { name: "Home", item: siteUrl + "/" },
        ...(parent ? [{ name: parent.label, item: siteUrl + parent.href }] : []),
        { name: currentLabel },
      ];
      graph.push({
        "@type": "BreadcrumbList",
        "@id": canonical + "#breadcrumb",
        itemListElement: items.map((item, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: item.name,
          ...(item.item ? { item: item.item } : {}),
        })),
      });
      graph[2].breadcrumb = { "@id": canonical + "#breadcrumb" };

      if (!document.querySelector(".breadcrumbs")) {
        const main = document.querySelector("main");
        if (main && main.parentNode) {
          const nav = document.createElement("nav");
          nav.className = "breadcrumbs";
          nav.setAttribute("aria-label", "Breadcrumb");
          nav.innerHTML =
            `<a href="/">Home</a><span aria-hidden="true">/</span>` +
            (parent
              ? `<a href="${parent.href}">${escapeHtml(parent.label)}</a><span aria-hidden="true">/</span>`
              : "") +
            `<span aria-current="page">${escapeHtml(currentLabel)}</span>`;
          main.parentNode.insertBefore(nav, main);
        }
      }
    }

    if (article) {
      graph.push({
        "@type": "Article",
        "@id": canonical + "#article",
        headline: article.title || labelFromTitle(title, siteName),
        description: description,
        image: image,
        ...(article.datePublished ? { datePublished: article.datePublished } : {}),
        ...(article.dateModified || article.datePublished
          ? { dateModified: article.dateModified || article.datePublished }
          : {}),
        author: { "@id": siteUrl + "/#organization" },
        publisher: { "@id": siteUrl + "/#organization" },
        mainEntityOfPage: { "@id": canonical + "#webpage" },
        inLanguage: LOCALE,
      });
    }

    if (caseStudy) {
      graph.push({
        "@type": "CreativeWork",
        "@id": canonical + "#case-study",
        name: caseStudy.title || labelFromTitle(title, siteName),
        description: description,
        image: image,
        creator: { "@id": siteUrl + "/#organization" },
        mainEntityOfPage: { "@id": canonical + "#webpage" },
        inLanguage: LOCALE,
      });
    }

    let schema = document.getElementById("kinetix-seo-schema");
    if (!schema) {
      schema = document.createElement("script");
      schema.id = "kinetix-seo-schema";
      schema.type = "application/ld+json";
      document.head.appendChild(schema);
    }
    schema.textContent = JSON.stringify({ "@context": "https://schema.org", "@graph": graph }).replace(/</g, "\\u003c");
  }

  function loadCmsScript() {
    if (window.KinetixCMS) return Promise.resolve();
    const existing = document.querySelector('script[src="/assets/js/cms.js"]');
    if (existing) {
      return new Promise((resolve, reject) => {
        existing.addEventListener("load", resolve, { once: true });
        existing.addEventListener("error", reject, { once: true });
      });
    }
    return new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = "/assets/js/cms.js";
      script.defer = true;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  async function load() {
    applySeo({ settings: {} });
    try {
      const page = window.__CMS_PAGE__ || pageKey();
      const res = await fetch(
        "/api/bootstrap?page=" + encodeURIComponent(page),
        { cache: "no-store", credentials: "same-origin" },
      );
      if (!res.ok) throw new Error("Bootstrap failed: " + res.status);
      const data = await res.json();
      const content = data.content || data;
      await loadCmsScript();
      window.__CMS__ = data;
      window.KinetixCMS.init(data);
      applySeo(content);
    } catch (e) {
      console.warn("Kinetix CMS data unavailable", e);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", load, { once: true });
  } else {
    load();
  }
})();
