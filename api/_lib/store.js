const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const ROOT = path.join(__dirname, "..", "..");
const DATA_DIR = path.join(ROOT, "data");
const UPLOAD_DIR = path.join(ROOT, "assets", "uploads");
const CONTENT_FILE = path.join(DATA_DIR, "content.json");
const ADMIN_FILE = path.join(DATA_DIR, "admin.json");
const BINDINGS = require("../../data/bindings.json");
const CONTENT_BLOB = "cms/content.json";
const ADMIN_BLOB = "cms/admin.json";
const UPLOAD_PREFIX = "cms/uploads/";
const DEFAULT_PASSWORD = "admin123";
const COOKIE_NAME = "cms_token";
const SESSION_MAX_AGE = 60 * 60 * 12;

let blobModule = null;
let accessOrderPromise = null;

function blobConfigured() {
  return !!(
    process.env.BLOB_READ_WRITE_TOKEN ||
    (process.env.BLOB_STORE_ID && process.env.VERCEL_OIDC_TOKEN)
  );
}

async function blobSdk() {
  if (!blobModule) blobModule = await import("@vercel/blob");
  return blobModule;
}

function accessOrder() {
  const mode = process.env.BLOB_ACCESS;
  if (mode === "private") return ["private", "public"];
  if (mode === "public") return ["public", "private"];
  return ["public", "private"];
}

function getAccessOrder() {
  if (!blobConfigured()) return Promise.resolve([]);
  if (!accessOrderPromise) accessOrderPromise = Promise.resolve(accessOrder());
  return accessOrderPromise;
}

function readJsonFile(file, fallback) {
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch (e) {
    return fallback;
  }
}

function atomicWrite(file, text) {
  if (!fs.existsSync(path.dirname(file))) {
    fs.mkdirSync(path.dirname(file), { recursive: true });
  }
  const tmp = file + ".tmp";
  fs.writeFileSync(tmp, text);
  fs.renameSync(tmp, file);
}

async function streamToString(stream) {
  if (!stream) return null;
  const chunks = [];
  for await (const chunk of stream) chunks.push(Buffer.from(chunk));
  return Buffer.concat(chunks).toString("utf8");
}

async function readBlob(pathname) {
  if (!blobConfigured()) return null;
  const { get } = await blobSdk();
  let lastError;
  for (const access of await getAccessOrder()) {
    try {
      const result = await get(pathname, { access, useCache: false });
      if (!result || result.statusCode !== 200) return null;
      return await streamToString(result.stream);
    } catch (e) {
      lastError = e;
    }
  }
  if (lastError) throw lastError;
  return null;
}

async function readBlobStream(pathname) {
  if (!blobConfigured()) return null;
  const { get } = await blobSdk();
  let lastError;
  for (const access of await getAccessOrder()) {
    try {
      const result = await get(pathname, { access, useCache: false });
      if (!result || result.statusCode !== 200) return null;
      return result;
    } catch (e) {
      lastError = e;
    }
  }
  if (lastError) throw lastError;
  return null;
}

async function writeBlob(pathname, body, options = {}) {
  if (!blobConfigured()) return null;
  const { put } = await blobSdk();
  let lastError;
  for (const access of await getAccessOrder()) {
    try {
      return await put(
        pathname,
        body,
        Object.assign(
          { access, allowOverwrite: true, addRandomSuffix: false },
          options,
        ),
      );
    } catch (e) {
      lastError = e;
    }
  }
  throw lastError || new Error("Blob write failed");
}

function hashPassword(password, salt = crypto.randomBytes(16).toString("hex")) {
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return { salt, hash };
}

function verifyPassword(record, password) {
  if (!record || typeof record.hash !== "string" || typeof record.salt !== "string") {
    return false;
  }
  try {
    const expected = Buffer.from(record.hash, "hex");
    const actual = crypto.scryptSync(password, record.salt, expected.length);
    return (
      expected.length === actual.length &&
      crypto.timingSafeEqual(expected, actual)
    );
  } catch (e) {
    return false;
  }
}

async function getContent() {
  if (blobConfigured()) {
    const text = await readBlob(CONTENT_BLOB);
    if (text) {
      try {
        const value = JSON.parse(text);
        if (value && typeof value === "object" && !Array.isArray(value)) {
          return value;
        }
      } catch (e) {}
    }
  }
  return readJsonFile(CONTENT_FILE, {});
}

async function saveContent(value) {
  const text = JSON.stringify(value, null, 2) + "\n";
  const blob = await writeBlob(CONTENT_BLOB, text, {
    contentType: "application/json",
  });
  if (blob) return { storage: "blob" };
  if (process.env.VERCEL) throw new Error("Blob storage not connected. In Vercel: Storage > Create/Connect > Blob, connect to project, redeploy.");
  atomicWrite(CONTENT_FILE, text);
  return { storage: "local" };
}

async function getAdmin() {
  if (blobConfigured()) {
    const text = await readBlob(ADMIN_BLOB);
    if (text) {
      try {
        const value = JSON.parse(text);
        if (value && value.hash && value.salt) return value;
      } catch (e) {}
    }
  }
  const local = readJsonFile(ADMIN_FILE, null);
  if (local && local.hash && local.salt) return local;
  const record = hashPassword(DEFAULT_PASSWORD);
  if (!process.env.VERCEL) {
    atomicWrite(ADMIN_FILE, JSON.stringify(record, null, 2) + "\n");
  }
  return record;
}

async function saveAdmin(record) {
  const text = JSON.stringify(record, null, 2) + "\n";
  const blob = await writeBlob(ADMIN_BLOB, text, {
    contentType: "application/json",
  });
  if (blob) return { storage: "blob" };
  if (process.env.VERCEL) throw new Error("Blob storage not connected. In Vercel: Storage > Create/Connect > Blob, connect to project, redeploy.");
  atomicWrite(ADMIN_FILE, text);
  return { storage: "local" };
}

function getBindings() {
  return BINDINGS;
}

function normalizePage(raw) {
  let value = decodeURIComponent(String(raw || "/"));
  value = value.split("?")[0].split("#")[0].replace(/^\/+/, "");
  if (!value) return "index.html";
  if (value.endsWith("/")) value += "index.html";
  if (/\.[a-z0-9]+$/i.test(value)) return value;
  return value + ".html";
}

function normalizeMediaPath(value) {
  let pathname = String(value || "").trim().replace(/^\/+/, "");
  if (pathname.startsWith("assets/uploads/")) {
    pathname = UPLOAD_PREFIX + pathname.slice("assets/uploads/".length);
  }
  if (!pathname.startsWith(UPLOAD_PREFIX)) return null;
  if (/[\\]|\.\./.test(pathname)) return null;
  return pathname;
}

function uploadPath(name, ext) {
  const base =
    String(name || "image")
      .toLowerCase()
      .replace(/\.[^.]+$/, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 48) || "image";
  return `${UPLOAD_PREFIX}${base}-${Date.now().toString(36)}.${ext}`;
}

async function saveUpload(buffer, name, ext, contentType) {
  if (blobConfigured()) {
    const blob = await writeBlob(uploadPath(name, ext), buffer, {
      contentType,
      addRandomSuffix: true,
      allowOverwrite: false,
    });
    return {
      path: "/api/media?path=" + encodeURIComponent(blob.pathname),
      storage: "blob",
      blob,
    };
  }
  if (process.env.VERCEL) throw new Error("Blob storage not connected. In Vercel: Storage > Create/Connect > Blob, connect to project, redeploy.");
  const filename = path.basename(uploadPath(name, ext));
  atomicWrite(path.join(UPLOAD_DIR, filename), buffer);
  return {
    path: "/assets/uploads/" + filename,
    storage: "local",
  };
}

async function getMedia(pathname) {
  const blobPath = normalizeMediaPath(pathname);
  if (blobConfigured() && blobPath) {
    const result = await readBlobStream(blobPath);
    if (!result) return null;
    return {
      stream: result.stream,
      contentType: result.blob.contentType || "application/octet-stream",
    };
  }
  const localName = path.basename(pathname || "");
  const file = path.join(UPLOAD_DIR, localName);
  if (!localName || !fs.existsSync(file) || !fs.statSync(file).isFile()) {
    return null;
  }
  return {
    stream: fs.createReadStream(file),
    contentType: "application/octet-stream",
  };
}

function base64url(value) {
  return Buffer.from(value)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function fromBase64url(value) {
  return Buffer.from(String(value).replace(/-/g, "+").replace(/_/g, "/"), "base64");
}

function sessionSecret() {
  return (
    process.env.CMS_SECRET ||
    process.env.BLOB_READ_WRITE_TOKEN ||
    process.env.BLOB_STORE_ID ||
    "kinetix-cms-secret"
  );
}

function createSession() {
  const payload = base64url(
    JSON.stringify({ exp: Date.now() + SESSION_MAX_AGE * 1000 }),
  );
  const signature = crypto
    .createHmac("sha256", sessionSecret())
    .update(payload)
    .digest("base64url");
  return payload + "." + signature;
}

function validSession(token) {
  if (!token || typeof token !== "string") return false;
  const parts = token.split(".");
  if (parts.length !== 2) return false;
  const expected = crypto
    .createHmac("sha256", sessionSecret())
    .update(parts[0])
    .digest();
  let actual;
  try {
    actual = fromBase64url(parts[1]);
  } catch (e) {
    return false;
  }
  if (actual.length !== expected.length) return false;
  if (!crypto.timingSafeEqual(actual, expected)) return false;
  try {
    const payload = JSON.parse(fromBase64url(parts[0]).toString("utf8"));
    return !!payload.exp && payload.exp > Date.now();
  } catch (e) {
    return false;
  }
}

function getToken(req) {
  const header = (req.headers && req.headers.cookie) || "";
  const match = header.match(/(?:^|;\s*)cms_token=([^;]+)/);
  if (!match) return null;
  try {
    return decodeURIComponent(match[1]);
  } catch (e) {
    return match[1];
  }
}

function isAuthed(req) {
  return validSession(getToken(req));
}

function sessionCookie() {
  return `${COOKIE_NAME}=${createSession()}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${SESSION_MAX_AGE}`;
}

function clearCookie() {
  return `${COOKIE_NAME}=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0`;
}

function sendJson(res, status, data, headers = {}) {
  const body = JSON.stringify(data).replace(/</g, "\\u003c");
  res.writeHead(
    status,
    Object.assign(
      {
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": "no-store",
      },
      headers,
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

module.exports = {
  DEFAULT_PASSWORD,
  UPLOAD_DIR,
  blobConfigured,
  clearCookie,
  createSession,
  getAdmin,
  getBindings,
  getContent,
  getMedia,
  getToken,
  hashPassword,
  isAuthed,
  normalizeMediaPath,
  normalizePage,
  readBody,
  saveAdmin,
  saveContent,
  saveUpload,
  sendJson,
  sessionCookie,
  validSession,
  verifyPassword,
};
