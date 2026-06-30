const nodemailer = require('nodemailer');

// ── Build the transporter from environment variables ─────
// Supports any SMTP provider (Gmail, SendGrid, Mailgun, etc.)
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT, 10) || 587,
    secure: process.env.SMTP_SECURE === 'true', // true for port 465, false for 587
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

// ── Send a generic email ─────────────────────────────────
const sendEmail = async ({ to, subject, html, text }) => {
  const transporter = createTransporter();

  const mailOptions = {
    from: `"${process.env.FROM_NAME || 'PriceEngine'}" <${process.env.FROM_EMAIL || process.env.SMTP_USER}>`,
    to,
    subject,
    html,
    text, // plain-text fallback
  };

  const info = await transporter.sendMail(mailOptions);
  console.log(`[Email] Message sent to ${to}: ${info.messageId}`);
  return info;
};

// ── Send password reset email ────────────────────────────
const sendPasswordResetEmail = async ({ to, resetUrl, name }) => {
  const subject = 'PriceEngine — Password Reset Request';

  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Reset Your Password</title>
    </head>
    <body style="margin:0;padding:0;background-color:#0f1117;font-family:Inter,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0f1117;padding:40px 20px;">
        <tr>
          <td align="center">
            <table width="100%" style="max-width:520px;background-color:#1e2235;border:1px solid #2d3348;border-radius:16px;padding:40px;">
              <tr>
                <td>
                  <!-- Brand -->
                  <div style="text-align:center;margin-bottom:32px;">
                    <div style="display:inline-flex;align-items:center;justify-content:center;width:48px;height:48px;border-radius:12px;background:linear-gradient(135deg,#6366f1,#a855f7);margin-bottom:12px;">
                      <span style="font-size:22px;">⚡</span>
                    </div>
                    <p style="margin:4px 0 0;font-size:18px;font-weight:700;color:#e2e8f0;">PriceEngine</p>
                    <p style="margin:2px 0 0;font-size:11px;color:#64748b;letter-spacing:0.04em;">Dynamic Pricing</p>
                  </div>

                  <!-- Heading -->
                  <h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#e2e8f0;text-align:center;">
                    Reset Your Password
                  </h1>
                  <p style="margin:0 0 28px;font-size:14px;color:#94a3b8;text-align:center;line-height:1.6;">
                    Hi ${name || 'there'}, we received a request to reset your PriceEngine account password.
                  </p>

                  <!-- Button -->
                  <div style="text-align:center;margin-bottom:28px;">
                    <a
                      href="${resetUrl}"
                      style="display:inline-block;padding:14px 32px;background:#6366f1;color:#fff;text-decoration:none;border-radius:10px;font-size:15px;font-weight:600;letter-spacing:0.02em;"
                    >
                      Reset Password
                    </a>
                  </div>

                  <!-- Warning -->
                  <div style="background:#252a3a;border:1px solid #2d3348;border-radius:10px;padding:16px;margin-bottom:20px;">
                    <p style="margin:0 0 6px;font-size:12px;font-weight:600;color:#94a3b8;text-transform:uppercase;letter-spacing:0.06em;">
                      ⚠️ Security Notice
                    </p>
                    <p style="margin:0;font-size:13px;color:#64748b;line-height:1.6;">
                      This link expires in <strong style="color:#e2e8f0;">15 minutes</strong>.
                      If you did not request this, please ignore this email — your account remains secure.
                    </p>
                  </div>

                  <!-- URL fallback -->
                  <p style="font-size:12px;color:#64748b;word-break:break-all;text-align:center;">
                    Or copy this link:<br/>
                    <span style="color:#6366f1;">${resetUrl}</span>
                  </p>

                  <!-- Footer -->
                  <hr style="border:none;border-top:1px solid #2d3348;margin:24px 0;" />
                  <p style="margin:0;font-size:11px;color:#64748b;text-align:center;">
                    © ${new Date().getFullYear()} PriceEngine · Dynamic Pricing Engine
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  const text = `
    Hi ${name || 'there'},

    You requested a password reset for your PriceEngine account.

    Click the link below to reset your password (expires in 15 minutes):
    ${resetUrl}

    If you did not request this, please ignore this email.

    — PriceEngine Team
  `.trim();

  return sendEmail({ to, subject, html, text });
};

module.exports = { sendEmail, sendPasswordResetEmail };
