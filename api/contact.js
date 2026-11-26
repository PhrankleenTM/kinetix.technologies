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
    const body = await store.readBody(req, 16 * 1024);
    if (body.website) {
      store.sendJson(res, 200, { ok: true });
      return;
    }
    const name = text(body.name, 120);
    const email = text(body.email, 160);
    const company = text(body.company, 120);
    const type = text(body.type, 120) || "General enquiry";
    const budget = text(body.budget, 120);
    const message = text(body.message, 4000);
    if (!name || !emailPattern.test(email) || !message) {
      store.sendJson(res, 400, { ok: false, error: "Please complete all required fields." });
      return;
    }
    await db.addSubmission("contact", {
      name,
      email,
      company,
      type,
      budget,
      page: text(body.page, 200) || null,
      message,
    });
    const subject = `New project enquiry: ${mail.header(type)}`;
    const content = [
      `Name: ${name}`,
      `Email: ${email}`,
      `Company: ${company || "-"}`,
      `Project type: ${type}`,
      `Budget: ${budget || "-"}`,
      `Page: ${text(body.page, 200) || "-"}`,
      "",
      message,
    ].join("\n");
    await mail.sendMail({ subject, text: content, replyTo: `"${mail.header(name)}" <${email}>` });
    store.sendJson(res, 200, { ok: true });
  } catch (err) {
    const dbMissing = err.code === "DB_NOT_CONFIGURED";
    const mailMissing = err.code === "MAIL_NOT_CONFIGURED";
    const status = dbMissing || mailMissing ? 503 : 500;
    const error = dbMissing
      ? "Database storage is not configured yet."
      : mailMissing
        ? "Email delivery is not configured yet."
        : "Could not send your message right now.";
    store.sendJson(res, status, { ok: false, error });
  }
};
