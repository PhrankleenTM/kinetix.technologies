const store = require("./_lib/store");
const mail = require("./_lib/mail");
const db = require("./_lib/db");

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const text = (value, max = 200) => String(value || "").trim().slice(0, max);

module.exports = async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      store.sendJson(res, 405, { error: "Method not allowed" });
      return;
    }
    const body = await store.readBody(req, 4 * 1024);
    if (body.website) {
      store.sendJson(res, 200, { ok: true });
      return;
    }
    const email = text(body.email, 160);
    if (!emailPattern.test(email)) {
      store.sendJson(res, 400, { ok: false, error: "Please enter a valid email address." });
      return;
    }
    await db.addSubmission("newsletter", {
      email,
      page: text(body.page, 200) || null,
    });
    await mail.sendMail({
      subject: `Newsletter signup: ${email}`,
      text: `New newsletter signup\n\nEmail: ${email}\nPage: ${text(body.page, 200) || "-"}`,
      replyTo: email,
    });
    store.sendJson(res, 200, { ok: true });
  } catch (err) {
    const dbMissing = err.code === "DB_NOT_CONFIGURED";
    const mailMissing = err.code === "MAIL_NOT_CONFIGURED";
    const status = dbMissing || mailMissing ? 503 : 500;
    const error = dbMissing
      ? "Database storage is not configured yet."
      : mailMissing
        ? "Email delivery is not configured yet."
        : "Could not complete signup right now.";
    store.sendJson(res, status, { ok: false, error });
  }
};
