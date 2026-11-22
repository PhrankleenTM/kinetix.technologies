const http = require("http");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const ROOT = __dirname;
const DATA_DIR = path.join(ROOT, "data");
const UPLOAD_DIR = path.join(ROOT, "assets", "uploads");
const CONTENT_FILE = path.join(DATA_DIR, "content.json");
const BINDINGS_FILE = path.join(DATA_DIR, "bindings.json");
const ADMIN_FILE = path.join(DATA_DIR, "admin.json");
const PORT = Number(process.env.PORT || 3000);
const DEFAULT_PASSWORD = "admin123";

for (const dir of [DATA_DIR, UPLOAD_DIR]) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function hashPassword(password, salt = crypto.randomBytes(16).toString("hex")) {
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return { salt, hash };
}

function loadAdmin() {
  if (!fs.existsSync(ADMIN_FILE)) {
    fs.writeFileSync(
      ADMIN_FILE,
      JSON.stringify(hashPassword(DEFAULT_PASSWORD), null, 2),
    );
    console.log(
      `Created ${ADMIN_FILE} with default password: ${DEFAULT_PASSWORD}`,
    );
  }
  return JSON.parse(fs.readFileSync(ADMIN_FILE, "utf8"));
}

let admin = loadAdmin();
const sessions = new Map();

function verifyPassword(password) {
  const expected = Buffer.from(admin.hash, "hex");
  const actual = crypto.scryptSync(password, admin.salt, expected.length);
  return (
    expected.length === actual.length &&
    crypto.timingSafeEqual(expected, actual)
  );
}

function newToken() {
  const token = crypto.randomBytes(32).toString("hex");
  sessions.set(token, Date.now() + 1000 * 60 * 60 * 12);
  return token;
}

function getToken(req) {
  const cookie = req.headers.cookie || "";
  const match = cookie.match(/(?:^|;\s*)cms_token=([a-f0-9]{64})/);
  return match ? match[1] : null;
}

function isAuthed(req) {
  const token = getToken(req);
  if (!token) return false;
  const expiry = sessions.get(token);
  if (!expiry) return false;
  if (expiry < Date.now()) {
    sessions.delete(token);
    return false;
  }
  return true;
}

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

function safePath(urlPath) {
  const decoded = decodeURIComponent(urlPath.split("?")[0]);
  const clean = decoded === "/" ? "/index.html" : decoded;
  const resolved = path.resolve(ROOT, "." + clean);
  if (resolved !== ROOT && !resolved.startsWith(ROOT + path.sep)) return null;
  return resolved;
}

function readJson(file, fallback) {
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch (e) {
    return fallback;
  }
}

function sendJson(res, status, data, extraHeaders = {}) {
  const body = JSON.stringify(data).replace(/</g, "\\u003c");
  res.writeHead(
    status,
    Object.assign(
      {
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": "no-store",
      },
      extraHeaders,
    ),
  );
  res.end(body);
}

function readBody(req, limit = 12 * 1024 * 1024) {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];
    req.on("data", (chunk) => {
      size += chunk.length;
      if (size > limit) {
        reject(new Error("Payload too large"));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on("end", () => {
      try {
        resolve(JSON.parse(Buffer.concat(chunks).toString("utf8")));
      } catch (e) {
        reject(new Error("Invalid JSON"));
      }
    });
    req.on("error", reject);
  });
}

function atomicWrite(file, text) {
  const tmp = file + ".tmp";
  fs.writeFileSync(tmp, text);
  fs.renameSync(tmp, file);
}

function injectCms(html, route) {
  const content = readJson(CONTENT_FILE, {});
  const bindings = readJson(BINDINGS_FILE, {});
  const clean = decodeURIComponent(route === "/" ? "/index.html" : route)
    .replace(/^\/+/, "");
  const page = clean.endsWith("/") ? clean + "index.html" : clean;
  const payload = JSON.stringify({ content, bindings, page })
    .replace(/</g, "\\u003c")
    .replace(/-->/g, "--\\u003e");
  const tag = `<script>window.__CMS__=${payload};</script>\n<script src="/assets/js/cms.js" defer></script>`;
  return html.includes("</head>")
    ? html.replace("</head>", tag + "\n</head>")
    : tag + html;
}

function serveFile(req, res, file) {
  if (!fs.existsSync(file) || !fs.statSync(file).isFile()) {
    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Not found");
    return;
  }
  const ext = path.extname(file).toLowerCase();
  let body = fs.readFileSync(file);
  const headers = {
    "Content-Type": MIME[ext] || "application/octet-stream",
    "Cache-Control":
      ext === ".html" || ext === ".json" ? "no-store" : "public, max-age=3600",
  };
  if (ext === ".html" && path.basename(file) !== "admin.html") {
    body = Buffer.from(
      injectCms(body.toString("utf8"), new URL(req.url, "http://localhost").pathname),
    );
  }
  res.writeHead(200, headers);
  res.end(body);
}

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host || "localhost"}`);
    const route = url.pathname;

    if (route === "/api/content" && req.method === "GET") {
      sendJson(res, 200, readJson(CONTENT_FILE, {}));
      return;
    }
    if (route === "/api/status" && req.method === "GET") {
      sendJson(res, 200, { authenticated: isAuthed(req) });
      return;
    }
    if (route === "/api/login" && req.method === "POST") {
      const body = await readBody(req, 64 * 1024);
      if (typeof body.password === "string" && verifyPassword(body.password)) {
        const token = newToken();
        sendJson(
          res,
          200,
          { ok: true },
          {
            "Set-Cookie": `cms_token=${token}; HttpOnly; SameSite=Lax; Path=/; Max-Age=43200`,
          },
        );
      } else {
        sendJson(res, 401, { ok: false, error: "Incorrect password" });
      }
      return;
    }
    if (route === "/api/logout" && req.method === "POST") {
      const token = getToken(req);
      if (token) sessions.delete(token);
      sendJson(
        res,
        200,
        { ok: true },
        {
          "Set-Cookie": "cms_token=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0",
        },
      );
      return;
    }
    if (route.startsWith("/api/") && !isAuthed(req)) {
      sendJson(res, 401, { error: "Unauthorized" });
      return;
    }
    if (route === "/api/content" && req.method === "POST") {
      const body = await readBody(req);
      if (!body || typeof body !== "object" || Array.isArray(body)) {
        sendJson(res, 400, { error: "Content must be an object" });
        return;
      }
      atomicWrite(CONTENT_FILE, JSON.stringify(body, null, 2) + "\n");
      sendJson(res, 200, { ok: true });
      return;
    }
    if (route === "/api/upload" && req.method === "POST") {
      const body = await readBody(req);
      const match =
        typeof body.dataUrl === "string"
          ? body.dataUrl.match(
              /^data:image\/(png|jpeg|gif|webp);base64,([A-Za-z0-9+/=]+)$/,
            )
          : null;
      if (!match) {
        sendJson(res, 400, { error: "Use a PNG, JPEG, GIF, or WebP image" });
        return;
      }
      const buffer = Buffer.from(match[2], "base64");
      if (buffer.length > 5 * 1024 * 1024) {
        sendJson(res, 400, { error: "Image must be 5 MB or smaller" });
        return;
      }
      const ext = match[1] === "jpeg" ? "jpg" : match[1];
      const base =
        String(body.name || "image")
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, "")
          .slice(0, 48) || "image";
      const filename = `${base}-${Date.now().toString(36)}.${ext}`;
      fs.writeFileSync(path.join(UPLOAD_DIR, filename), buffer);
      sendJson(res, 200, { ok: true, path: `/assets/uploads/${filename}` });
      return;
    }
    if (route === "/api/password" && req.method === "POST") {
      const body = await readBody(req, 64 * 1024);
      if (typeof body.password !== "string" || body.password.length < 8) {
        sendJson(res, 400, { error: "Password must be at least 8 characters" });
        return;
      }
      admin = hashPassword(body.password);
      atomicWrite(ADMIN_FILE, JSON.stringify(admin, null, 2) + "\n");
      sendJson(res, 200, { ok: true });
      return;
    }

    if (req.method !== "GET" && req.method !== "HEAD") {
      sendJson(res, 405, { error: "Method not allowed" });
      return;
    }
    if (
      route.startsWith("/data/") ||
      route === "/server.js" ||
      route === "/package.json"
    ) {
      res.writeHead(403);
      res.end("Forbidden");
      return;
    }
    const file = safePath(route);
    if (!file) {
      res.writeHead(403);
      res.end("Forbidden");
      return;
    }
    serveFile(req, res, file);
  } catch (err) {
    sendJson(res, err.message === "Payload too large" ? 413 : 500, {
      error: err.message || "Server error",
    });
  }
});

server.listen(PORT, () => {
  console.log(`Kinetix CMS running at http://localhost:${PORT}`);
  console.log(`Admin panel: http://localhost:${PORT}/admin.html`);
});
