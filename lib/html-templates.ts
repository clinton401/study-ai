// ─── Brand Colors (StudyAI – hsl values from globals.css) ────────────────────
const C = {
  primary: "#1a9649",   // hsl(142.1 76.2% 36.3%)
  primaryDark: "#166d36",
  primaryLight: "#dcfce7",   // hsl(142 ~80% 90%)
  primaryText: "#14532d",   // hsl(142 ~70% 20%)
  foreground: "#09090b",   // hsl(240 10% 3.9%)
  muted: "#71717a",   // hsl(240 3.8% 46.1%)
  border: "#e4e4e7",   // hsl(240 5.9% 90%)
  surface: "#f9fafb",
  white: "#ffffff",
  error: "#dc2626",
};

// ─── Base CSS (inlined by juice before sending) ───────────────────────────────
const BASE_CSS = `
  *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    background-color: #f4f4f5;
    color: ${C.foreground};
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    line-height: 1.5;
  }
  .outer {
    background-color: #f4f4f5;
    padding: 40px 16px;
  }
  .card {
    max-width: 560px;
    margin: 0 auto;
    background: ${C.white};
    border-radius: 12px;
    overflow: hidden;
    border: 1px solid ${C.border};
  }
  /* ── Header ── */
  .header {
    padding: 28px 36px;
    border-bottom: 1px solid ${C.border};
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .logo {
    width: 36px;
    height: 36px;
    border-radius: 8px;
    display: block;
    flex-shrink: 0;
  }
  .brand {
    font-size: 25px;
    font-weight: 700;
    color: ${C.foreground};
    letter-spacing: -0.3px;
  }
  .brand-accent { color: ${C.primary}; }
  /* ── Body ── */
  .body { padding: 36px; }
  .eyebrow {
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.8px;
    color: ${C.primary};
    margin-bottom: 10px;
  }
  .title {
    font-size: 22px;
    font-weight: 700;
    color: ${C.foreground};
    letter-spacing: -0.4px;
    margin-bottom: 10px;
    line-height: 1.3;
  }
  .subtitle {
    font-size: 14px;
    color: ${C.muted};
    line-height: 1.7;
    margin-bottom: 0;
  }
  /* ── OTP ── */
  .otp-wrap { margin: 32px 0; text-align: center; }
  .otp-code {
    display: inline-block;
    padding: 18px 36px;
    background: ${C.surface};
    border: 1px solid ${C.border};
    border-radius: 10px;
    font-size: 38px;
    font-weight: 700;
    letter-spacing: 12px;
    color: ${C.foreground};
    font-variant-numeric: tabular-nums;
  }
  .otp-meta {
    margin-top: 10px;
    font-size: 12px;
    color: ${C.muted};
  }
  /* ── Button ── */
  .btn-wrap { margin: 32px 0; }
  .btn {
    display: inline-block;
    padding: 13px 30px;
    background-color: ${C.primary};
    color: #ffffff !important;
    text-decoration: none;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 600;
    letter-spacing: 0.1px;
    line-height: 1;
  }
  /* ── Divider ── */
  .divider { height: 1px; background: ${C.border}; margin: 28px 0; }
  /* ── Helper / fallback link ── */
  .helper { font-size: 12px; color: ${C.muted}; line-height: 1.6; }
  .fallback-link {
    font-size: 12px;
    color: ${C.primary};
    word-break: break-all;
    display: block;
    margin-top: 6px;
  }
  /* ── Footer ── */
  .footer {
    padding: 18px 36px;
    border-top: 1px solid ${C.border};
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 12px;
  }
  .footer-copy { font-size: 12px; color: ${C.muted}; }
  .footer-link { font-size: 12px; color: ${C.primary}; text-decoration: none; }
  @media only screen and (max-width: 600px) {
    .outer { padding: 16px 8px; }
    .header, .body { padding: 24px 20px; }
    .footer { padding: 16px 20px; flex-direction: column; align-items: flex-start; gap: 4px; }
    .title { font-size: 19px; }
    .otp-code { font-size: 28px; letter-spacing: 8px; padding: 14px 24px; }
  }
`;

const shell = (body: string, title: string) => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <title>${title}</title>
  <style>${BASE_CSS}</style>
</head>
<body>
  <div class="outer">
    <div class="card">
      ${body}
    </div>
  </div>
</body>
</html>`;

const HEADER = `
  <div class="header">
    <span class="brand">StudyAI</span>
  </div>`;

const FOOTER = (year: number) => `
  <div class="footer">
    <span class="footer-copy">&copy; ${year} StudyAI. All rights reserved.</span>
    <a href="mailto:${process.env.EMAIL_USER}" class="footer-link">Contact support</a>
  </div>`;

// ─── Template 1 – Email Verification ─────────────────────────────────────────
export const verificationEmailTemplate = (verificationCode: string) => {
  const year = new Date().getFullYear();
  const subject = "Verify your email address";
  const text = `Thanks for signing up with StudyAI! Your verification code is: ${verificationCode}. It expires in 1 hour. If you didn't request this, please ignore it or contact our support team.`;

  const template = shell(`
    ${HEADER}
    <div class="body">
      <p class="eyebrow">Email Verification</p>
      <h1 class="title">Confirm your email address</h1>
      <p class="subtitle">
        Thanks for signing up. Use the code below to verify your account —
        it expires in <strong>1 hour</strong>.
      </p>

      <div class="otp-wrap">
        <div class="otp-code">${verificationCode}</div>
        <p class="otp-meta">Expires in 1 hour &nbsp;·&nbsp; Do not share this code</p>
      </div>

      <div class="divider"></div>

      <p class="helper">
        Didn't create a StudyAI account? You can safely ignore this email —
        your address won't be used without verification.
      </p>
    </div>
    ${FOOTER(year)}
  `, subject);

  return { subject, text, template };
};

// ─── Template 2 – Password Reset ─────────────────────────────────────────────
export const resetPasswordEmailTemplate = (resetLink: string) => {
  const year = new Date().getFullYear();
  const subject = "Reset your StudyAI password";
  const text = `You requested to reset your password on StudyAI. Click the link below to create a new one:\n\n${resetLink}\n\nThis link will expire in 10 minutes. If you didn't request this, you can ignore this message.`;

  const template = shell(`
    ${HEADER}
    <div class="body">
      <p class="eyebrow">Security</p>
      <h1 class="title">Reset your password</h1>
      <p class="subtitle">
        We received a request to reset the password for your StudyAI account.
        This link expires in <strong>10 minutes</strong>.
      </p>

      <div class="btn-wrap">
        <a href="${resetLink}" class="btn">Reset password</a>
      </div>

      <div class="divider"></div>

      <p class="helper">If the button above doesn't work, paste this link into your browser:</p>
      <a href="${resetLink}" class="fallback-link">${resetLink}</a>

      <p class="helper" style="margin-top:16px;">
        If you didn't request a password reset, you can safely ignore this email.
        No changes have been made to your account.
      </p>
    </div>
    ${FOOTER(year)}
  `, subject);

  return { subject, text, template };
};