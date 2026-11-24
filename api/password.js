const store = require("./_lib/store");

module.exports = async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      store.sendJson(res, 405, { error: "Method not allowed" });
      return;
    }
    if (!(await store.isAuthed(req))) {
      store.sendJson(res, 401, { error: "Unauthorized" });
      return;
    }
    const body = await store.readBody(req, 64 * 1024);
    if (typeof body.password !== "string" || body.password.length < 8) {
      store.sendJson(res, 400, { error: "Password must be at least 8 characters" });
      return;
    }
    const current = await store.getAdmin();
    const record = { ...current, ...store.hashPassword(body.password) };
    const result = await store.saveAdmin(record);
    store.sendJson(
      res,
      200,
      { ok: true, storage: result.storage },
      { "Set-Cookie": await store.sessionCookie() },
    );
  } catch (err) {
    store.sendJson(res, 500, { error: err.message || "Server error" });
  }
};
