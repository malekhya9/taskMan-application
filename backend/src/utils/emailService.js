const nodemailer = require('nodemailer');
require('dotenv').config();

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransporter({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
  }

  async sendOTP(email, otp) {
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject: 'TaskMan - Email Verification Code',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">TaskMan Email Verification</h2>
          <p>Your verification code is:</p>
          <div style="background-color: #f4f4f4; padding: 20px; text-align: center; font-size: 24px; font-weight: bold; color: #333; margin: 20px 0;">
            ${otp}
          </div>
          <p>This code will expire in 10 minutes.</p>
          <p>If you didn't request this code, please ignore this email.</p>
        </div>
      `
    };

    try {
      await this.transporter.sendMail(mailOptions);
      return true;
    } catch (error) {
      console.error('Email sending failed:', error);
      return false;
    }
  }

  async sendInvite(email, inviterName, orgName) {
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject: `TaskMan Invitation from ${inviterName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">You've been invited to TaskMan</h2>
          <p>${inviterName} has invited you to join ${orgName} on TaskMan.</p>
          <p>Click the link below to accept the invitation and create your account:</p>
          <a href="${process.env.FRONTEND_URL}/invite/${email}" 
             style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; margin: 20px 0;">
            Accept Invitation
          </a>
          <p>If you didn't expect this invitation, please ignore this email.</p>
        </div>
      `
    };

    try {
      await this.transporter.sendMail(mailOptions);
      return true;
    } catch (error) {
      console.error('Invite email sending failed:', error);
      return false;
    }
  }
}

module.exports = new EmailService();
