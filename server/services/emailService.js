const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
dotenv.config();

/**
 * Sweet Haven Email Service
 * 
 * Priority order:
 *  1. Gmail SMTP (when GMAIL_USER + GMAIL_APP_PASS are set in server/.env)
 *  2. Generic SMTP (EMAIL_HOST, EMAIL_USER, EMAIL_PASS)
 *  3. Development console log fallback
 * 
 * HOW TO ENABLE REAL EMAIL:
 *  1. Go to your Google Account → Security → 2-Step Verification (enable it)
 *  2. Go to Security → App Passwords → generate one for "Sweet Haven"
 *  3. Add to server/.env:
 *       GMAIL_USER=deepaveera3slm@gmail.com
 *       GMAIL_APP_PASS=xxxx xxxx xxxx xxxx   ← 16-char app password
 */

function createTransporter() {
  // Option 1: Gmail (recommended — no SMTP host config needed)
  if (
    process.env.GMAIL_USER && 
    process.env.GMAIL_APP_PASS && 
    process.env.GMAIL_APP_PASS !== 'your_gmail_app_password_here'
  ) {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASS
      }
    });
  }

  // Option 2: Generic SMTP (e.g. Outlook, Yahoo, custom host)
  if (process.env.EMAIL_HOST && process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT) || 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      },
      tls: { rejectUnauthorized: false }
    });
  }

  return null;
}

/**
 * Core sendMail with dev fallback
 */
async function sendMail({ to, subject, html, text }) {
  const transporter = createTransporter();
  const senderName = 'Sweet Haven Bakery';
  const senderEmail = process.env.GMAIL_USER || process.env.EMAIL_USER || 'no-reply@sweethaven.com';

  if (transporter) {
    try {
      const info = await transporter.sendMail({
        from: `${senderName} <${senderEmail}>`,
        to,
        subject,
        text: text || subject,
        html
      });
      console.log(`✉️  [Email] Sent to ${to} — ID: ${info.messageId}`);
      return { success: true, messageId: info.messageId, mode: 'SMTP' };
    } catch (err) {
      console.error(`❌ [Email] Failed to send to ${to}: ${err.message}`);
      // Fall through to console fallback
    }
  }

  // DEV FALLBACK — console log (OTP shown in terminal & as devOtpHint on frontend)
  console.log('\n================================================');
  console.log(`📧 [DEV EMAIL FALLBACK]`);
  console.log(`   To      : ${to}`);
  console.log(`   Subject : ${subject}`);
  console.log(`   Body    : ${text || subject}`);
  console.log('================================================\n');

  return { success: true, mode: 'DEV_CONSOLE_FALLBACK' };
}

/**
 * OTP Email Template
 */
async function sendOtpEmail(email, otpCode, purpose = 'SIGNUP_VERIFICATION') {
  const purposeTitles = {
    SIGNUP_VERIFICATION: 'Account Verification',
    FORGOT_PASSWORD: 'Password Reset',
    EMAIL_VERIFICATION: 'Email Verification'
  };

  const title = purposeTitles[purpose] || 'Verification Code';

  const html = `
  <div style="font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; max-width:580px; margin:0 auto; background:#fff; border:1px solid #e5e7eb; border-radius:16px; overflow:hidden;">
    <div style="background:linear-gradient(135deg,#5C1329 0%,#3D0919 100%); padding:28px 24px; text-align:center;">
      <h1 style="color:#D4AF37; margin:0; font-size:26px; letter-spacing:1px;">🍰 Sweet Haven</h1>
      <p style="color:rgba(253,249,243,0.8); margin:6px 0 0 0; font-size:13px;">Smart Confectionery Management System</p>
    </div>

    <div style="padding:32px 28px; text-align:center;">
      <h2 style="color:#2A1710; font-size:20px; margin:0 0 12px 0;">${title}</h2>
      <p style="color:#6B5952; font-size:14px; line-height:1.7; margin:0 0 24px 0;">
        Use the verification code below to complete your action.<br/>
        This code is valid for <strong>10 minutes</strong> and can only be used once.
      </p>

      <div style="background:#FDF9F3; border:2px dashed #D4AF37; display:inline-block; padding:18px 40px; border-radius:14px; margin:0 0 24px 0;">
        <span style="font-size:36px; font-weight:900; letter-spacing:12px; color:#5C1329;">${otpCode}</span>
      </div>

      <p style="color:#9CA3AF; font-size:12px;">If you did not request this, you can safely ignore this email.</p>
    </div>

    <div style="background:#FDF9F3; padding:16px 24px; text-align:center; border-top:1px solid #F3E9D2;">
      <p style="margin:0; font-size:12px; color:#9CA3AF;">© 2026 Sweet Haven Confectionery. All rights reserved.</p>
    </div>
  </div>
  `;

  return await sendMail({
    to: email,
    subject: `🍰 Sweet Haven — ${title}: ${otpCode}`,
    text: `Your Sweet Haven ${title} OTP is: ${otpCode}. Valid for 10 minutes.`,
    html
  });
}

/**
 * Order Confirmation Email
 */
async function sendOrderConfirmationEmail(email, orderDetails) {
  const html = `
  <div style="font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; max-width:620px; margin:0 auto; background:#fff; border:1px solid #e5e7eb; border-radius:16px; overflow:hidden;">
    <div style="background:linear-gradient(135deg,#5C1329 0%,#3D0919 100%); padding:28px 24px; text-align:center; color:white;">
      <h1 style="color:#D4AF37; margin:0; font-size:26px;">🍰 Sweet Haven</h1>
      <p style="margin:6px 0 0 0; opacity:0.9; font-size:14px;">Order Payment Confirmed!</p>
    </div>
    <div style="padding:28px 24px;">
      <h3 style="color:#2A1710; margin:0 0 12px 0;">Thank you, ${orderDetails.customer_name || 'Valued Customer'}!</h3>
      <p style="color:#6B5952;">Your payment of <strong>₹${parseFloat(orderDetails.final_amount).toFixed(2)}</strong> has been received. Your delicious treats are being prepared!</p>
      <div style="background:#FDF9F3; border-left:4px solid #D4AF37; padding:16px; margin:20px 0; border-radius:8px;">
        <p style="margin:4px 0;"><strong>Order Number:</strong> ${orderDetails.order_number}</p>
        <p style="margin:4px 0;"><strong>Payment Method:</strong> ${orderDetails.payment_method || 'Online Payment'}</p>
        <p style="margin:4px 0;"><strong>Status:</strong> ${orderDetails.order_status || 'Order Confirmed'}</p>
      </div>
      <p style="color:#9CA3AF; font-size:13px;">Track your order live anytime on our website under Live Order Tracking.</p>
    </div>
  </div>
  `;

  return await sendMail({
    to: email,
    subject: `🎉 Order Confirmed — #${orderDetails.order_number}`,
    text: `Order #${orderDetails.order_number} confirmed. Total: ₹${orderDetails.final_amount}`,
    html
  });
}

/**
 * Order Status Update Email
 */
async function sendOrderStatusUpdateEmail(email, orderNumber, newStatus) {
  const html = `
  <div style="font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; max-width:580px; margin:0 auto; background:#fff; border:1px solid #e5e7eb; border-radius:16px; overflow:hidden;">
    <div style="background:linear-gradient(135deg,#5C1329,#3D0919); padding:24px; text-align:center;">
      <h1 style="color:#D4AF37; margin:0;">🍰 Sweet Haven Order Update</h1>
    </div>
    <div style="padding:28px 24px; text-align:center;">
      <p style="font-size:16px; color:#2A1710;">Your order <strong>#${orderNumber}</strong> has been updated:</p>
      <div style="background:#FDF9F3; border-left:4px solid #5C1329; padding:16px; margin:20px auto; border-radius:8px; display:inline-block;">
        <span style="font-size:22px; font-weight:700; color:#5C1329;">${newStatus}</span>
      </div>
      <p style="color:#9CA3AF; font-size:13px;">Thank you for choosing Sweet Haven!</p>
    </div>
  </div>
  `;

  return await sendMail({
    to: email,
    subject: `🚚 Order #${orderNumber} Status: ${newStatus}`,
    text: `Order #${orderNumber} is now: ${newStatus}`,
    html
  });
}

module.exports = {
  sendMail,
  sendOtpEmail,
  sendOrderConfirmationEmail,
  sendOrderStatusUpdateEmail
};
