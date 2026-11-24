const store = require("./_lib/store");

module.exports = async function handler(req, res) {
  if (req.method !== "GET") {
    store.sendJson(res, 405, { error: "Method not allowed" });
    return;
  }
  store.sendJson(res, 200, { authenticated: await store.isAuthed(req) });
};
