const store = require("./_lib/store");

const DEFAULT_SITE_URL = "https://kinetixtechnologies.vercel.app";

function escapeXml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function slugs(items) {
  return [...new Set(
    (items || [])
      .map((entry) => entry && (entry.slug || entry.id || entry.key))
      .filter((slug) => typeof slug === "string" && slug.trim()),
  )];
}

function urlEntry(loc, lastmod, priority) {
  return (
    "  <url>" +
    "<loc>" + escapeXml(loc) + "</loc>" +
    (lastmod ? "<lastmod>" + escapeXml(lastmod) + "</lastmod>" : "") +
    "<priority>" + priority + "</priority>" +
    "</url>"
  );
}

module.exports = async function handler(req, res) {
  try {
    if (req.method !== "GET" && req.method !== "HEAD") {
      store.sendJson(res, 405, { error: "Method not allowed" });
      return;
    }
    const content = await store.getContent();
    const siteUrl = String(
      (content.settings && content.settings.siteUrl) || DEFAULT_SITE_URL,
    ).replace(/\/$/, "");
    const pages = [
      { path: "/", priority: "1.0" },
      { path: "/services", priority: "0.9" },
      { path: "/work", priority: "0.9" },
      { path: "/about", priority: "0.8" },
      { path: "/insights", priority: "0.8" },
      { path: "/collaborations", priority: "0.7" },
      { path: "/contact", priority: "0.8" },
    ];
    const articles = content.articles || [];
    const articleSlugs = slugs(articles);
    const entries = pages.map((page) => urlEntry(siteUrl + page.path, "", page.priority));
    slugs(content.caseStudies).forEach((slug) =>
      entries.push(urlEntry(siteUrl + "/case-studies/" + slug, "", "0.7")),
    );
    articleSlugs.forEach((slug) => {
      const article = articles.find(
        (entry) => entry && (entry.slug || entry.id || entry.key) === slug,
      );
      entries.push(urlEntry(siteUrl + "/insights/" + slug, article && (article.dateModified || article.datePublished), "0.6"));
    });
    const xml =
      '<?xml version="1.0" encoding="UTF-8"?>' +
      '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' +
      entries.join("") +
      "</urlset>";
    res.statusCode = 200;
    res.setHeader("Content-Type", "application/xml; charset=utf-8");
    res.setHeader("Cache-Control", "public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400");
    res.end(req.method === "HEAD" ? "" : xml);
  } catch (err) {
    store.sendJson(res, 500, { error: err.message || "Server error" });
  }
};
