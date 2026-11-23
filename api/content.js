const store = require("./_lib/store");

module.exports = async function handler(req, res) {
  try {
    if (req.method === "GET") {
      store.sendJson(res, 200, await store.getContent());
      return;
    }
    if (req.method !== "POST") {
      store.sendJson(res, 405, { error: "Method not allowed" });
      return;
    }
    if (!store.isAuthed(req)) {
      store.sendJson(res, 401, { error: "Unauthorized" });
      return;
    }
    const body = await store.readBody(req);
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      store.sendJson(res, 400, { error: "Content must be an object" });
      return;
    }
    const result = await store.saveContent(body);
    store.sendJson(res, 200, { ok: true, storage: result.storage });
  } catch (err) {
    store.sendJson(res, 500, { error: err.message || "Server error" });
  }
};
