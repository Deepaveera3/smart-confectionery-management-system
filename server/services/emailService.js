const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
dotenv.config();

// Create Transporter using environment variables if provided
let transporter = null;
if (process.env.EMAIL_HOST && process.env.EMAIL_USER && process.env.EMAIL_PASS) {
  try {
    transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT) || 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      tls: {
        rejectUnauthorized: false
      }
    });
  } catch (err) {
    console.warn('⚠️ Nodemailer Transporter Initialization Warning:', err.message);
  }
}

/**
 * Send Email with Development Fallback
 */
async function sendMail({ to, subject, html, text }) {
  const from = `Sweet Haven Confectionery <${process.env.EMAIL_USER || 'no-reply@sweethaven.com'}>`;
  
  if (transporter && process.env.EMAIL_USER !== 'your_email@gmail.com') {
    try {
      const info = await transporter.sendMail({
        from,
        to,
        subject,
        text: text || subject,
        html
      });
      console.log(`✉️ Email dispatched to ${to}: Message ID ${info.messageId}`);
      return { success: true, messageId: info.messageId, mode: 'SMTP' };
    } catch (error) {
      console.warn(`⚠️ SMTP Send failed for ${to} (${error.message}). Falling back to Dev Logger.`);
    }
  }

  // Development Fallback Console Log
  console.log(`====================================================`);
  console.log(`✉️ [DEV EMAIL FALLBACK] To: ${to}`);
  console.log(`📌 Subject: ${subject}`);
  console.log(`📄 Content Preview: ${text || subject}`);
  console.log(`====================================================`);

  return { success: true, mode: 'DEV_CONSOLE_FALLBACK' };
}

/**
 * Send OTP Verification Email
 */
async function sendOtpEmail(email, otpCode, purpose = 'SIGNUP_VERIFICATION') {
  const purposeTitles = {
    SIGNUP_VERIFICATION: 'Account Signup Verification',
    FORGOT_PASSWORD: 'Password Reset Request',
    EMAIL_VERIFICATION: 'Verify Email Address'
  };

  const title = purposeTitles[purpose] || 'Verification Code';

  const html = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; borderRadius: 12px; background-color: #ffffff;">
      <div style="text-align: center; padding-bottom: 20px; border-bottom: 2px solid #ec4899;">
        <h1 style="color: #be185d; margin: 0; font-size: 26px;">🍰 Sweet Haven</h1>
        <p style="color: #6b7280; margin-top: 5px; font-size: 14px;">Smart Confectionery Management System</p>
      </div>
      
      <div style="padding: 30px 20px; text-align: center;">
        <h2 style="color: #1f2937; font-size: 20px; margin-bottom: 10px;">${title}</h2>
        <p style="color: #4b5563; font-size: 15px; line-height: 1.6;">Use the following One-Time Password (OTP) to complete your action. This code is valid for <strong>10 minutes</strong> and can only be used once.</p>
        
        <div style="background-color: #fdf2f8; border: 2px dashed #f43f5e; display: inline-block; padding: 15px 35px; border-radius: 12px; margin: 25px 0;">
          <span style="font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #be185d;">${otpCode}</span>
        </div>
        
        <p style="color: #9ca3af; font-size: 13px; margin-top: 20px;">If you did not request this OTP code, please ignore this email.</p>
      </div>
      
      <div style="text-align: center; padding-top: 20px; border-top: 1px solid #f3f4f6; font-size: 12px; color: #9ca3af;">
        <p>© 2026 Sweet Haven Confectionery Ltd. All rights reserved.</p>
      </div>
    </div>
  `;

  return await sendMail({
    to: email,
    subject: `🍰 Sweet Haven - ${title} (OTP: ${otpCode})`,
    text: `Your Sweet Haven OTP for ${title} is: ${otpCode}. Valid for 10 minutes.`,
    html
  });
}

/**
 * Send Order Confirmation & Invoice Email
 */
async function sendOrderConfirmationEmail(email, orderDetails) {
  const html = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 650px; margin: 0 auto; padding: 20px; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px;">
      <div style="background: linear-gradient(135deg, #be185d 0%, #831843 100%); padding: 25px; border-radius: 10px 10px 0 0; color: white; text-align: center;">
        <h1 style="margin: 0; font-size: 28px;">🍰 Sweet Haven</h1>
        <p style="margin: 5px 0 0 0; opacity: 0.9;">Order Payment Confirmed!</p>
      </div>
      <div style="padding: 25px;">
        <h3 style="color: #1e293b;">Thank you for your order, ${orderDetails.customer_name || 'Valued Customer'}!</h3>
        <p style="color: #475569;">We have received your payment of <strong>₹${parseFloat(orderDetails.final_amount).toFixed(2)}</strong>. Your delicious treats are now being prepared!</p>
        
        <div style="background: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 4px 0;"><strong>Order Number:</strong> ${orderDetails.order_number}</p>
          <p style="margin: 4px 0;"><strong>Payment Method:</strong> ${orderDetails.payment_method || 'Online Payment'}</p>
          <p style="margin: 4px 0;"><strong>Status:</strong> ${orderDetails.order_status || 'Order Confirmed'}</p>
        </div>
        
        <p style="color: #64748b; font-size: 14px;">You can track your live order progress anytime on our website under Live Order Tracking.</p>
      </div>
    </div>
  `;

  return await sendMail({
    to: email,
    subject: `🎉 Payment Successful - Order #${orderDetails.order_number} Confirmed!`,
    text: `Your order #${orderDetails.order_number} has been confirmed. Total paid: ₹${orderDetails.final_amount}`,
    html
  });
}

/**
 * Send Live Order Status Update Email
 */
async function sendOrderStatusUpdateEmail(email, orderNumber, newStatus) {
  const html = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
      <h2 style="color: #be185d;">🍰 Sweet Haven Order Update</h2>
      <p style="font-size: 16px; color: #334155;">Great news! Your order <strong>#${orderNumber}</strong> status has been updated to:</p>
      <div style="background-color: #fdf2f8; border-left: 4px solid #be185d; padding: 15px; margin: 20px 0; border-radius: 4px;">
        <span style="font-size: 20px; font-weight: bold; color: #be185d;">${newStatus}</span>
      </div>
      <p style="color: #64748b; font-size: 14px;">Thank you for choosing Sweet Haven!</p>
    </div>
  `;

  return await sendMail({
    to: email,
    subject: `🚚 Order #${orderNumber} Status Updated: ${newStatus}`,
    text: `Order #${orderNumber} status updated to: ${newStatus}`,
    html
  });
}

module.exports = {
  sendMail,
  sendOtpEmail,
  sendOrderConfirmationEmail,
  sendOrderStatusUpdateEmail
};
