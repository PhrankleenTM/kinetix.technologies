const store = require("./_lib/store");

module.exports = async function handler(req, res) {
  try {
    if (req.method !== "GET") {
      store.sendJson(res, 405, { error: "Method not allowed" });
      return;
    }
    const url = new URL(req.url, "http://localhost");
    const pathname = url.searchParams.get("path");
    const media = await store.getMedia(pathname);
    if (!media) {
      res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      res.end("Not found");
      return;
    }
    res.writeHead(200, {
      "Content-Type": media.contentType,
      "Cache-Control": "public, max-age=31536000, immutable",
    });
    media.stream.on("error", () => res.end());
    media.stream.pipe(res);
  } catch (err) {
    store.sendJson(res, 500, { error: err.message || "Server error" });
  }
};
