const { Pool } = require("pg");

let pool = null;
let schemaPromise = null;

function configured() {
  return Boolean(process.env.DATABASE_URL);
}

function missing() {
  return Object.assign(new Error("DATABASE_URL is not configured."), {
    code: "DB_NOT_CONFIGURED",
  });
}

function getPool() {
  if (!configured()) throw missing();
  if (!pool) {
    const ssl = /sslmode=disable/i.test(process.env.DATABASE_URL)
      ? false
      : { rejectUnauthorized: false };
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl,
      max: Number(process.env.DB_POOL_MAX || 1),
      idleTimeoutMillis: 1000,
      connectionTimeoutMillis: 10000,
    });
  }
  return pool;
}

async function ensureSchema() {
  if (!configured()) throw missing();
  if (!schemaPromise) {
    schemaPromise = (async () => {
      const client = await getPool().connect();
      try {
        await client.query("BEGIN");
        await client.query(`
          CREATE TABLE IF NOT EXISTS cms_kv (
            key text PRIMARY KEY,
            value jsonb NOT NULL,
            updated_at timestamptz NOT NULL DEFAULT now()
          )
        `);
        await client.query(`
          CREATE TABLE IF NOT EXISTS cms_admin (
            id boolean PRIMARY KEY DEFAULT true CHECK (id),
            hash text NOT NULL,
            salt text NOT NULL,
            session_key text NOT NULL,
            updated_at timestamptz NOT NULL DEFAULT now()
          )
        `);
        await client.query(`
          CREATE TABLE IF NOT EXISTS cms_uploads (
            path text PRIMARY KEY,
            url text NOT NULL,
            content_type text,
            size_bytes integer,
            created_at timestamptz NOT NULL DEFAULT now()
          )
        `);
        await client.query(`
          CREATE TABLE IF NOT EXISTS cms_submissions (
            id bigserial PRIMARY KEY,
            kind text NOT NULL CHECK (kind IN ('contact', 'newsletter')),
            payload jsonb NOT NULL,
            created_at timestamptz NOT NULL DEFAULT now()
          )
        `);
        await client.query("COMMIT");
      } catch (err) {
        await client.query("ROLLBACK");
        throw err;
      } finally {
        client.release();
      }
    })().catch((err) => {
      schemaPromise = null;
      throw err;
    });
  }
  return schemaPromise;
}

async function query(text, params = []) {
  await ensureSchema();
  return getPool().query(text, params);
}

async function getKV(key) {
  const result = await query("SELECT value FROM cms_kv WHERE key = $1", [key]);
  return result.rows[0] ? result.rows[0].value : null;
}

async function setKV(key, value) {
  await query(
    `INSERT INTO cms_kv (key, value, updated_at)
     VALUES ($1, $2::jsonb, now())
     ON CONFLICT (key) DO UPDATE
       SET value = EXCLUDED.value, updated_at = now()`,
    [key, JSON.stringify(value)],
  );
}

async function getAdmin() {
  const result = await query(
    "SELECT hash, salt, session_key FROM cms_admin WHERE id = true",
  );
  const row = result.rows[0];
  if (!row) return null;
  return { hash: row.hash, salt: row.salt, sessionKey: row.session_key };
}

async function setAdmin(record) {
  await query(
    `INSERT INTO cms_admin (id, hash, salt, session_key, updated_at)
     VALUES (true, $1, $2, $3, now())
     ON CONFLICT (id) DO UPDATE
       SET hash = EXCLUDED.hash,
           salt = EXCLUDED.salt,
           session_key = EXCLUDED.session_key,
           updated_at = now()`,
    [record.hash, record.salt, record.sessionKey],
  );
}

async function addUpload(path, url, contentType, sizeBytes) {
  await query(
    `INSERT INTO cms_uploads (path, url, content_type, size_bytes)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (path) DO UPDATE
       SET url = EXCLUDED.url,
           content_type = EXCLUDED.content_type,
           size_bytes = EXCLUDED.size_bytes`,
    [path, url, contentType || null, Number(sizeBytes) || 0],
  );
}

async function getUpload(path) {
  const result = await query("SELECT * FROM cms_uploads WHERE path = $1", [path]);
  return result.rows[0] || null;
}

async function addSubmission(kind, payload) {
  await query(
    "INSERT INTO cms_submissions (kind, payload) VALUES ($1, $2::jsonb)",
    [kind, JSON.stringify(payload)],
  );
}

module.exports = {
  addSubmission,
  addUpload,
  configured,
  getAdmin,
  getKV,
  getUpload,
  query,
  setAdmin,
  setKV,
};
