(() => {
  function pageKey() {
    let value = decodeURIComponent(location.pathname || "/");
    value = value.replace(/^\/+/, "");
    if (!value || value.endsWith("/")) return value + "index.html";
    if (/\.[a-z0-9]+$/i.test(value)) return value;
    return value + ".html";
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
    try {
      const page = window.__CMS_PAGE__ || pageKey();
      const res = await fetch(
        "/api/bootstrap?page=" + encodeURIComponent(page),
        { cache: "no-store", credentials: "same-origin" },
      );
      if (!res.ok) throw new Error("Bootstrap failed: " + res.status);
      const data = await res.json();
      await loadCmsScript();
      window.__CMS__ = data;
      window.KinetixCMS.init(data);
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
