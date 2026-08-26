const nodemailer = require('nodemailer');

// Create transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Verify transporter connection
transporter.verify((error, success) => {
  if (error) {
    console.error('❌ Email transporter error:', error);
  } else {
    console.log('✅ Email transporter ready');
  }
});

/**
 * Send OTP email
 */
const sendOTPEmail = async (email, otp, name = '') => {
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: 'Inter', Arial, sans-serif; line-height: 1.6; color: #1a1a2e; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #990000; color: white; padding: 20px; text-align: center; border-radius: 12px 12px 0 0; }
        .content { background: #f8fafc; padding: 30px; border-radius: 0 0 12px 12px; border: 1px solid #e2e8f0; border-top: none; }
        .otp-box { background: white; border: 2px solid #990000; border-radius: 12px; padding: 20px; text-align: center; margin: 20px 0; }
        .otp-code { font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #990000; }
        .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #94a3b8; }
        .highlight { color: #990000; font-weight: 600; }
        .divider { height: 1px; background: #e2e8f0; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="margin:0; font-size:24px;">🎓 EDU Meet</h1>
          <p style="margin:5px 0 0; opacity:0.9;">East Delta University</p>
        </div>
        <div class="content">
          <h2 style="margin-top:0;">Email Verification</h2>
          ${name ? `<p>Hello <strong>${name}</strong>,</p>` : '<p>Hello,</p>'}
          <p>Thank you for registering with <strong>EDU Meet</strong>. Please use the verification code below to complete your registration:</p>
          
          <div class="otp-box">
            <div class="otp-code">${otp}</div>
            <p style="margin:10px 0 0; font-size:14px; color:#475569;">
              This code expires in <span class="highlight">${process.env.OTP_EXPIRY_MINUTES || 10} minutes</span>
            </p>
          </div>
          
          <p style="font-size:14px; color:#475569;">
            If you didn't request this code, please ignore this email or contact support.
          </p>
          
          <div class="divider"></div>
          
          <p style="font-size:13px; color:#64748b;">
            <strong>Security Tip:</strong> Never share this OTP with anyone. EDU Meet will never ask for your verification code.
          </p>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} East Delta University. All rights reserved.</p>
          <p style="margin-top:5px;">
            <a href="mailto:support@eastdelta.edu.bd" style="color:#990000;">Contact Support</a>
          </p>
        </div>
      </div>
    </body>
    </html>
  `;

  const mailOptions = {
    from: `"EDU Meet" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: '🔐 Verify Your EDU Meet Account',
    html: htmlContent,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ OTP email sent to ${email}: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Email send error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Send welcome email after verification
 */
const sendWelcomeEmail = async (email, name) => {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: 'Inter', Arial, sans-serif; line-height: 1.6; color: #1a1a2e; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #990000; color: white; padding: 20px; text-align: center; border-radius: 12px 12px 0 0; }
        .content { background: #f8fafc; padding: 30px; border-radius: 0 0 12px 12px; border: 1px solid #e2e8f0; border-top: none; }
        .btn { background: #990000; color: white; padding: 12px 30px; border-radius: 8px; text-decoration: none; font-weight: 600; display: inline-block; }
        .divider { height: 1px; background: #e2e8f0; margin: 20px 0; }
        .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #94a3b8; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="margin:0; font-size:24px;">🎉 Welcome to EDU Meet!</h1>
        </div>
        <div class="content">
          <h2 style="margin-top:0;">Account Verified Successfully</h2>
          <p>Hello <strong>${name}</strong>,</p>
          <p>Your account has been successfully verified and activated! You can now:</p>
          <ul>
            <li>📅 Book appointments with faculty members</li>
            <li>📋 View and manage your schedule</li>
            <li>📩 Send messages to support</li>
            <li>👤 Update your profile</li>
          </ul>
          <p style="margin-top:20px;">
            <a href="${frontendUrl}/login" class="btn">Login to Your Account</a>
          </p>
          <div class="divider"></div>
          <p style="font-size:13px; color:#64748b;">
            Need help? <a href="${frontendUrl}/contact" style="color:#990000;">Contact Support</a>
          </p>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} East Delta University. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const mailOptions = {
    from: `"EDU Meet" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: '🎉 Welcome to EDU Meet!',
    html: htmlContent,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Welcome email sent to ${email}`);
    return { success: true };
  } catch (error) {
    console.error('❌ Welcome email error:', error);
    return { success: false, error: error.message };
  }
};

module.exports = { sendOTPEmail, sendWelcomeEmail };