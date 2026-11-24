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
    const body = await store.readBody(req);
    const match =
      typeof body.dataUrl === "string"
        ? body.dataUrl.match(
            /^data:image\/(png|jpeg|gif|webp);base64,([A-Za-z0-9+/=]+)$/,
          )
        : null;
    if (!match) {
      store.sendJson(res, 400, { error: "Use a PNG, JPEG, GIF, or WebP image" });
      return;
    }
    const buffer = Buffer.from(match[2], "base64");
    if (buffer.length > 5 * 1024 * 1024) {
      store.sendJson(res, 400, { error: "Image must be 5 MB or smaller" });
      return;
    }
    const ext = match[1] === "jpeg" ? "jpg" : match[1];
    const result = await store.saveUpload(
      buffer,
      body.name || "image",
      ext,
      "image/" + (ext === "jpg" ? "jpeg" : ext),
    );
    store.sendJson(res, 200, { ok: true, path: result.path, storage: result.storage });
  } catch (err) {
    store.sendJson(res, 500, { error: err.message || "Server error" });
  }
};
