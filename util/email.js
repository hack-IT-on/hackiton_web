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
      <h1>${subject}</h1>
      <p>Click the link below to ${subject}:</p>
      <a href="${verificationLink}">${subject}</a>
      <p>This link will expire in 1 hour.</p>
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
