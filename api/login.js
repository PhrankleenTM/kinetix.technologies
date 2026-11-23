const store = require("./_lib/store");

module.exports = async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      store.sendJson(res, 405, { error: "Method not allowed" });
      return;
    }
    const body = await store.readBody(req, 64 * 1024);
    const admin = await store.getAdmin();
    if (typeof body.password !== "string" || !store.verifyPassword(admin, body.password)) {
      store.sendJson(res, 401, { ok: false, error: "Incorrect password" });
      return;
    }
    store.sendJson(res, 200, { ok: true }, { "Set-Cookie": store.sessionCookie() });
  } catch (err) {
    store.sendJson(res, 500, { error: err.message || "Server error" });
  }
};
