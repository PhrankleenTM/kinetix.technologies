const store = require("./_lib/store");

module.exports = function handler(req, res) {
  if (req.method !== "POST") {
    store.sendJson(res, 405, { error: "Method not allowed" });
    return;
  }
  store.sendJson(res, 200, { ok: true }, { "Set-Cookie": store.clearCookie() });
};
