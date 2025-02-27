import nodemailer from "nodemailer";
import crypto from "crypto";

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true, // true for port 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export async function sendVerificationEmail(
  email,
  token,
  subject = "Verify Your Email",
  path = "/verify-email"
) {
  const verificationLink = `${process.env.NEXTAUTH_URL}/${path}?token=${token}`;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: subject,
    html: `
      <!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Hack-IT-on - Action Required</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
        }
        .container {
            max-width: 600px;
            margin: 30px auto;
            background: #ffffff;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);
            text-align: center;
        }
        h1 {
            color: #333;
        }
        p {
            font-size: 16px;
            color: #555;
        }
        .btn {
            display: inline-block;
            padding: 12px 20px;
            margin: 20px 0;
            font-size: 18px;
            color: #fff;
            background: #007bff;
            text-decoration: none;
            border-radius: 5px;
        }
        .btn:hover {
            background: #0056b3;
        }
        .footer {
            margin-top: 20px;
            font-size: 12px;
            color: #888;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🚀 ${subject} - Hack-IT-on</h1>
        <p>Hi,</p>
        
        <p>${subject}</p>

        <a href="${verificationLink}" class="btn">${subject}</a>

        <p>If the button doesn’t work, copy and paste this link into your browser:</p>
        <p><a href="${verificationLink}">${verificationLink}</a></p>

        <p>This link will expire in <strong>24 hours</strong>, so act now!</p>

        <p>If you didn’t request this, you can safely ignore this email.</p>

        <div class="footer">
            <p>Happy coding! 🚀<br>Hack-IT-on Team</p>
        </div>
    </div>
</body>
</html>

    `,
  };

  await transporter.sendMail(mailOptions);
  return true;
}

export function generateVerificationToken() {
  return crypto.randomBytes(32).toString("hex");
}

export async function sendQRCodeEmail(
  email,
  userName,
  qrCodeDataUrl,
  eventName
) {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: `Event Registration Confirmation - ${eventName}`,
    html: `
          <!DOCTYPE html>
          <html>
          <head>
              <meta charset="utf-8">
              <style>
                  body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                  .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                  .header { font-size: 24px; font-weight: bold; color: #2c3e50; margin-bottom: 20px; }
                  .qr-code { margin: 30px 0; text-align: center; }
                  .qr-code img { width: 300px; height: 300px; }
                  .warning { color: #e74c3c; margin-top: 20px; font-weight: bold; }
                  .footer { margin-top: 30px; font-size: 14px; color: #7f8c8d; }
              </style>
          </head>
          <body>
              <div class="container">
                  <div class="header">Event Registration Confirmation</div>
                  <p>Hello ${userName},</p>
                  <p>Thank you for registering for ${eventName}. Your registration has been confirmed.</p>
                  <div class="qr-code">
                      <img src="${qrCodeDataUrl}" alt="QR Code for Event Check-in" style="max-width: 300px;">
                  </div>
                  <p><strong>Important Instructions:</strong></p>
                  <ul>
                      <li>Please save this QR code or keep this email accessible</li>
                      <li>Present this QR code at the venue entrance for check-in</li>
                      <li>Make sure your screen brightness is high when showing the QR code</li>
                  </ul>
                  <p class="warning">Please don't share this QR code with anyone else as it's unique to your registration.</p>
                  <div class="footer">
                      <p>If you have any questions, please contact the event organizer.</p>
                  </div>
              </div>
          </body>
          </html>
      `,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Email sending error:", error);
    throw error;
  }
}

export async function sendQRCodeEmailOut(
  email,
  userName,
  qrCodeDataUrl,
  eventName
) {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: `Event Check-out Confirmation - ${eventName}`,
    html: `
          <!DOCTYPE html>
          <html>
          <head>
              <meta charset="utf-8">
              <style>
                  body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                  .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                  .header { font-size: 24px; font-weight: bold; color: #2c3e50; margin-bottom: 20px; }
                  .qr-code { margin: 30px 0; text-align: center; }
                  .qr-code img { width: 300px; height: 300px; }
                  .warning { color: #e74c3c; margin-top: 20px; font-weight: bold; }
                  .footer { margin-top: 30px; font-size: 14px; color: #7f8c8d; }
              </style>
          </head>
          <body>
              <div class="container">
                  <div class="header">Event Check-out Confirmation</div>
                  <p>Hello ${userName},</p>
                  <p>Thank you for attending the event: ${eventName}. Your Check-out has been confirmed.</p>
                  <div class="qr-code">
                      <img src="${qrCodeDataUrl}" alt="QR Code for Event Check-out" style="max-width: 300px;">
                  </div>
                  <p><strong>Important Instructions:</strong></p>
                  <ul>
                      <li>Please save this QR code or keep this email accessible</li>
                      <li>Present this QR code at the venue entrance for check-out</li>
                      <li>Make sure your screen brightness is high when showing the QR code</li>
                  </ul>
                  <p class="warning">Please don't share this QR code with anyone else as it's unique to your check-out.</p>
                  <div class="footer">
                      <p>If you have any questions, please contact the event organizer.</p>
                  </div>
              </div>
          </body>
          </html>
      `,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Email sending error:", error);
    throw error;
  }
}

export async function sendAccountApprovalEmail(
  email,
  name,
  subject = "Account Approved - Welcome to Hack-IT-on"
) {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: subject,
    html: `
      <!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Account Approved - Welcome to Hack-IT-on</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
        }
        .container {
            max-width: 600px;
            margin: 30px auto;
            background: #ffffff;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);
            text-align: center;
        }
        h1 {
            color: #333;
        }
        p {
            font-size: 16px;
            color: #555;
        }
        .btn {
            display: inline-block;
            padding: 12px 20px;
            margin: 20px 0;
            font-size: 18px;
            color: #fff;
            background: #28a745;
            text-decoration: none;
            border-radius: 5px;
        }
        .btn:hover {
            background: #218838;
        }
        .footer {
            margin-top: 20px;
            font-size: 12px;
            color: #888;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🎉 Account Approved - Welcome to Hack-IT-on!</h1>
        <p>Hi, ${name}</p>
        
        <p>Your account has been successfully approved. You can now access all features and start your journey with us!</p>

        <a href="${process.env.NEXTAUTH_URL}" class="btn">Go to Dashboard</a>

        <p>If the button doesn’t work, copy and paste this link into your browser:</p>
        <p><a href="${process.env.NEXTAUTH_URL}">${process.env.NEXTAUTH_URL}</a></p>

        <p>We’re excited to have you on board. If you have any questions, feel free to reach out.</p>

        <div class="footer">
            <p>Happy coding! 🚀<br>Hack-IT-on Team</p>
        </div>
    </div>
</body>
</html>

    `,
  };

  await transporter.sendMail(mailOptions);
  return true;
}

export async function sendAccountRejectedEmail(
  email,
  name,
  subject = "Account Rejected - Hack-IT-on"
) {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: subject,
    html: `
      <!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Account Rejected - Hack-IT-on</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
        }
        .container {
            max-width: 600px;
            margin: 30px auto;
            background: #ffffff;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);
            text-align: center;
        }
        h1 {
            color: #d9534f;
        }
        p {
            font-size: 16px;
            color: #555;
        }
        .btn {
            display: inline-block;
            padding: 12px 20px;
            margin: 20px 0;
            font-size: 18px;
            color: #fff;
            background: #dc3545;
            text-decoration: none;
            border-radius: 5px;
        }
        .btn:hover {
            background: #c82333;
        }
        .footer {
            margin-top: 20px;
            font-size: 12px;
            color: #888;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>⚠️ Account Rejected - Please Register Again</h1>
        <p>Hi ${name},</p>
        
        <p>Unfortunately, your account registration has been rejected due to incorrect or incomplete information.</p>
        <p>To access Hack-IT-on, please ensure that all details provided match the required criteria and try registering again.</p>

        <a href="${process.env.NEXTAUTH_URL}/register" class="btn">Register Again</a>

        <p>If the button doesn’t work, copy and paste this link into your browser:</p>
        <p><a href="${process.env.NEXTAUTH_URL}/register">${process.env.NEXTAUTH_URL}/register</a></p>

        <p>If you believe this was a mistake, feel free to contact our support team.</p>

        <div class="footer">
            <p>Best Regards,<br>Hack-IT-on Team</p>
        </div>
    </div>
</body>
</html>

    `,
  };

  await transporter.sendMail(mailOptions);
  return true;
}
