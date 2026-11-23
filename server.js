const http = require("http");
const fs = require("fs");
const path = require("path");
const store = require("./api/_lib/store");

const ROOT = __dirname;
const PORT = Number(process.env.PORT || 3000);

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
};

const API_HANDLERS = {
  "/api/bootstrap": require("./api/bootstrap"),
  "/api/content": require("./api/content"),
  "/api/status": require("./api/status"),
  "/api/login": require("./api/login"),
  "/api/logout": require("./api/logout"),
  "/api/upload": require("./api/upload"),
  "/api/media": require("./api/media"),
  "/api/password": require("./api/password"),
};

function staticPath(pathname) {
  let value = decodeURIComponent(pathname);
  if (value === "/" || value === "") value = "/index.html";
  if (value === "/admin") value = "/admin.html";
  if (value.length > 1 && value.endsWith("/")) value = value.slice(0, -1);
  if (!path.extname(value)) value += ".html";
  const resolved = path.resolve(ROOT, "." + value);
  if (resolved !== ROOT && !resolved.startsWith(ROOT + path.sep)) return null;
  return resolved;
}

function isBlocked(file) {
  const relative = path.relative(ROOT, file).replace(/\\/g, "/");
  return (
    relative.startsWith("api/") ||
    relative.startsWith("data/") ||
    relative.startsWith("node_modules/") ||
    relative === "server.js" ||
    relative === "package.json" ||
    relative === "package-lock.json" ||
    relative === "vercel.json" ||
    relative.startsWith(".") ||
    relative.endsWith(".tmp")
  );
}

function serveFile(res, file) {
  if (!fs.existsSync(file) || !fs.statSync(file).isFile()) {
    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Not found");
    return;
  }
  const ext = path.extname(file).toLowerCase();
  const headers = {
    "Content-Type": MIME[ext] || "application/octet-stream",
    "Cache-Control":
      ext === ".html" || ext === ".json" ? "no-store" : "public, max-age=3600",
  };
  res.writeHead(200, headers);
  fs.createReadStream(file).pipe(res);
}

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host || "localhost"}`);
    const route = url.pathname;

    if (API_HANDLERS[route]) {
      await API_HANDLERS[route](req, res);
      return;
    }
    if (route.startsWith("/api/")) {
      store.sendJson(res, 404, { error: "Not found" });
      return;
    }
    if (req.method !== "GET" && req.method !== "HEAD") {
      store.sendJson(res, 405, { error: "Method not allowed" });
      return;
    }
    const file = staticPath(route);
    if (!file || isBlocked(file)) {
      res.writeHead(403, { "Content-Type": "text/plain; charset=utf-8" });
      res.end("Forbidden");
      return;
    }
    serveFile(res, file);
  } catch (err) {
    store.sendJson(res, err.message === "Payload too large" ? 413 : 500, {
      error: err.message || "Server error",
    });
  }
});

server.listen(PORT, () => {
  console.log(`Kinetix CMS running at http://localhost:${PORT}`);
  console.log(`Admin panel: http://localhost:${PORT}/admin`);
});
