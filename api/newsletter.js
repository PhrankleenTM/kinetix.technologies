const store = require("./_lib/store");
const mail = require("./_lib/mail");

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
    await mail.sendMail({
      subject: `Newsletter signup: ${email}`,
      text: `New newsletter signup\n\nEmail: ${email}\nPage: ${text(body.page, 200) || "-"}`,
      replyTo: email,
    });
    store.sendJson(res, 200, { ok: true });
  } catch (err) {
    const status = err.code === "MAIL_NOT_CONFIGURED" ? 503 : 500;
    store.sendJson(res, status, {
      ok: false,
      error:
        status === 503
          ? "Email delivery is not configured yet."
          : "Could not complete signup right now.",
    });
  }
};
