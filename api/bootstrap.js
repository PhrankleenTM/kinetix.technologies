const store = require("./_lib/store");

module.exports = async function handler(req, res) {
  try {
    if (req.method !== "GET") {
      store.sendJson(res, 405, { error: "Method not allowed" });
      return;
    }
    const url = new URL(req.url, "http://localhost");
    const content = await store.getContent();
    store.sendJson(res, 200, {
      content,
      bindings: store.getBindings(),
      page: store.normalizePage(url.searchParams.get("page") || url.searchParams.get("path")),
    });
  } catch (err) {
    store.sendJson(res, 500, { error: err.message || "Server error" });
  }
};
