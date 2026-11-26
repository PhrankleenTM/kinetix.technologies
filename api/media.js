const store = require("./_lib/store");

async function pipeMedia(stream, res) {
  if (typeof stream.pipe === "function") {
    stream.on("error", () => res.end());
    stream.pipe(res);
    return;
  }

  const reader = typeof stream.getReader === "function" ? stream.getReader() : null;
  try {
    if (reader) {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        if (!res.write(Buffer.from(value))) {
          await new Promise((resolve) => res.once("drain", resolve));
        }
      }
    } else {
      for await (const chunk of stream) {
        if (!res.write(Buffer.from(chunk))) {
          await new Promise((resolve) => res.once("drain", resolve));
        }
      }
    }
  } catch {
    res.end();
    return;
  } finally {
    if (reader) reader.releaseLock();
  }
  res.end();
}

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
    await pipeMedia(media.stream, res);
  } catch (err) {
    store.sendJson(res, 500, { error: err.message || "Server error" });
  }
};
