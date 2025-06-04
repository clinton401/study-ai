export const verificationEmailTemplate = (verificationCode: string) => {
  const currentYear = new Date().getFullYear();
  const subject = "Verify your email address";
  const text = `Thanks for signing up with StudyAI! Your verification code is: ${verificationCode}. It expires in 1 hour. If you didn't request this, please ignore it or contact our support team.`;

  const template = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Email Verification</title>
    <style>
      body {
        margin: 0;
        padding: 0;
        background-color: #f9fafb;
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        color: #1f2937;
      }
      .wrapper {
        max-width: 600px;
        margin: 40px auto;
        background: #ffffff;
        border-radius: 12px;
        overflow: hidden;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05);
      }
      .header {
        background-color: #4f46e5;
        color: white;
        padding: 24px;
        text-align: center;
      }
      .header h2 {
        margin: 0;
        font-size: 26px;
      }
      .body {
        padding: 30px;
        text-align: center;
      }
      .body p {
        font-size: 16px;
        line-height: 1.6;
        margin-bottom: 20px;
      }
      .code-box {
        display: inline-block;
        padding: 16px 24px;
        font-size: 32px;
        background-color: #eef2ff;
        color: #4f46e5;
        border-radius: 8px;
        font-weight: bold;
        letter-spacing: 6px;
        margin: 20px 0;
      }
      .footer {
        background-color: #f3f4f6;
        text-align: center;
        padding: 20px;
        font-size: 14px;
        color: #6b7280;
      }
      .footer a {
        color: #4f46e5;
        text-decoration: none;
      }
    </style>
  </head>
  <body>
    <div class="wrapper">
      <div class="header">
        <h2>StudyAI Email Verification</h2>
      </div>
      <div class="body">
        <p>Thanks for creating an account with StudyAI!</p>
        <p>To get started, verify your email address by using the code below. This code will expire in <strong>1 hour</strong>.</p>
        <div class="code-box">${verificationCode}</div>
        <p>If you didn’t request this, you can safely ignore it.</p>
      </div>
      <div class="footer">
        <p>&copy; ${currentYear} StudyAI. All rights reserved.</p>
        <p>Need help? <a href="mailto:${process.env.EMAIL_USER}">Contact Support</a></p>
      </div>
    </div>
  </body>
  </html>
  `;

  return { subject, text, template };
};

export const resetPasswordEmailTemplate = (resetLink: string) => {
  const currentYear = new Date().getFullYear();
  const subject = "Reset your StudyAI password";
  const text = `You requested to reset your password on StudyAI. Click the link below to create a new one:\n\n${resetLink}\n\nThis link will expire in 10 minutes. If you didn't request this, you can ignore this message.`;

  const template = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Reset Password</title>
    <style>
      body {
        margin: 0;
        padding: 0;
        background-color: #f9fafb;
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        color: #1f2937;
      }
      .wrapper {
        max-width: 600px;
        margin: 40px auto;
        background: #ffffff;
        border-radius: 12px;
        overflow: hidden;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05);
      }
      .header {
        background-color: #4f46e5;
        color: white;
        padding: 24px;
        text-align: center;
      }
      .header h2 {
        margin: 0;
        font-size: 26px;
      }
      .body {
        padding: 30px;
        text-align: center;
      }
      .body p {
        font-size: 16px;
        line-height: 1.6;
        margin-bottom: 20px;
      }
      .reset-button {
        display: inline-block;
        padding: 12px 24px;
        font-size: 16px;
        background-color: #4f46e5;
        color: white;
        border-radius: 6px;
        text-decoration: none;
        font-weight: bold;
        margin-top: 20px;
      }
      .footer {
        background-color: #f3f4f6;
        text-align: center;
        padding: 20px;
        font-size: 14px;
        color: #6b7280;
      }
      .footer a {
        color: #4f46e5;
        text-decoration: none;
      }
    </style>
  </head>
  <body>
    <div class="wrapper">
      <div class="header">
        <h2>Password Reset Request</h2>
      </div>
      <div class="body">
        <p>You requested to reset your password on StudyAI.</p>
        <p>Click the button below to create a new password. This link will expire in <strong>10 minutes</strong>.</p>
        <a href="${resetLink}" class="reset-button">Reset Password</a>
       <p>If the button above doesn’t work, you can use the link below:</p>
        <div class="fallback">
          <a href="${resetLink}">${resetLink}</a>
        </div>
        <p>If you didn’t request a password reset, you can safely ignore this email. No changes have been made to your account.</p>
      </div>
      </div>
      <div class="footer">
        <p>&copy; ${currentYear} StudyAI. All rights reserved.</p>
        <p>Need help? <a href="mailto:${process.env.EMAIL_USER}">Contact Support</a></p>
      </div>
    </div>
  </body>
  </html>
  `;

  return { subject, text, template };
};
