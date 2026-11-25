const nodemailer = require("nodemailer");

const MAIL_TO = process.env.MAIL_TO || "kinetix.technologies.web@gmail.com";
const MAIL_USER = process.env.GMAIL_USER || MAIL_TO;
let transporter = null;

function configured() {
  return !!(process.env.GMAIL_APP_PASSWORD || process.env.GMAIL_SMTP_PASSWORD);
}

function header(value) {
  return String(value || "").replace(/[\r\n]+/g, " ").trim();
}

function getTransporter() {
  if (!transporter) {
    const port = Number(process.env.GMAIL_SMTP_PORT || 465);
    const secure =
      process.env.GMAIL_SMTP_SECURE === "true" ||
      (process.env.GMAIL_SMTP_SECURE !== "false" && port === 465);
    const pass = (process.env.GMAIL_APP_PASSWORD || process.env.GMAIL_SMTP_PASSWORD || "").replace(/\s/g, "");
    transporter = nodemailer.createTransport({
      host: process.env.GMAIL_SMTP_HOST || "smtp.gmail.com",
      port,
      secure,
      auth: { user: MAIL_USER, pass },
    });
  }
  return transporter;
}

async function sendMail({ subject, text, replyTo }) {
  if (!configured()) {
    const err = new Error("Gmail SMTP is not configured");
    err.code = "MAIL_NOT_CONFIGURED";
    throw err;
  }
  await getTransporter().sendMail({
    from: `"Kinetix Website" <${MAIL_USER}>`,
    to: MAIL_TO,
    subject: header(subject),
    text,
    replyTo: replyTo ? header(replyTo) : undefined,
  });
}

module.exports = { configured, header, sendMail };
