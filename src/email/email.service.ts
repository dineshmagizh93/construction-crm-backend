import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    const smtpHost = this.configService.get<string>('SMTP_HOST') || 'smtp.gmail.com';
    const smtpPort = parseInt(this.configService.get<string>('SMTP_PORT') || '587');
    const smtpUser = this.configService.get<string>('SMTP_USER');
    const smtpPass = this.configService.get<string>('SMTP_PASS');

    // Log configuration (without password)
    console.log('📧 Email Service Configuration:');
    console.log(`   Host: ${smtpHost}`);
    console.log(`   Port: ${smtpPort}`);
    console.log(`   User: ${smtpUser}`);
    console.log(`   Pass: ${smtpPass ? '***configured***' : '❌ NOT SET'}`);

    if (!smtpUser || !smtpPass) {
      console.warn('⚠️  SMTP credentials not configured. Email sending will fail.');
    }

    this.transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: false, // true for 465, false for other ports
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
      tls: {
        rejectUnauthorized: false, // For development
      },
    });

    // Verify connection
    this.verifyConnection();
  }

  private async verifyConnection() {
    try {
      await this.transporter.verify();
      console.log('✅ SMTP connection verified successfully');
    } catch (error: any) {
      console.error('❌ SMTP connection failed:', error.message);
      console.error('   Please check your SMTP configuration in .env file');
    }
  }

  async sendPasswordResetEmail(email: string, resetToken: string, resetUrl: string) {
    const smtpFrom = this.configService.get<string>('SMTP_FROM') || 'noreply@constructioncrm.com';
    // Remove quotes if present
    const fromEmail = smtpFrom.replace(/^["']|["']$/g, '');
    
    console.log(`📧 Sending password reset email to: ${email}`);
    console.log(`   From: ${fromEmail}`);
    console.log(`   Reset URL: ${resetUrl}`);

    const mailOptions = {
      from: fromEmail,
      to: email,
      subject: 'Password Reset Request - Construction CRM',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .button { display: inline-block; padding: 12px 24px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { margin-top: 30px; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <h2>Password Reset Request</h2>
            <p>You have requested to reset your password for Construction CRM.</p>
            <p>Click the button below to reset your password:</p>
            <a href="${resetUrl}" class="button">Reset Password</a>
            <p>Or copy and paste this link into your browser:</p>
            <p>${resetUrl}</p>
            <p><strong>This link will expire in 1 hour.</strong></p>
            <p>If you did not request this password reset, please ignore this email.</p>
            <div class="footer">
              <p>This is an automated message, please do not reply.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log('✅ Password reset email sent successfully');
      console.log(`   Message ID: ${info.messageId}`);
      return { success: true, messageId: info.messageId };
    } catch (error: any) {
      console.error('❌ Email sending error:', error);
      console.error('   Error code:', error.code);
      console.error('   Error command:', error.command);
      console.error('   Error response:', error.response);
      
      // Provide more helpful error messages
      let errorMessage = 'Failed to send email';
      if (error.code === 'EAUTH') {
        errorMessage = 'SMTP authentication failed. Please check your email credentials.';
      } else if (error.code === 'ECONNECTION') {
        errorMessage = 'Could not connect to SMTP server. Please check your SMTP settings.';
      } else if (error.response) {
        errorMessage = `SMTP error: ${error.response}`;
      }
      
      throw new Error(errorMessage);
    }
  }

  async sendWelcomeEmail(email: string, firstName: string, defaultPassword: string) {
    const mailOptions = {
      from: this.configService.get<string>('SMTP_FROM') || 'noreply@constructioncrm.com',
      to: email,
      subject: 'Welcome to Construction CRM',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .button { display: inline-block; padding: 12px 24px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { margin-top: 30px; font-size: 12px; color: #666; }
            .credentials { background-color: #f4f4f4; padding: 15px; border-radius: 5px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <h2>Welcome to Construction CRM, ${firstName}!</h2>
            <p>Your account has been created successfully.</p>
            <div class="credentials">
              <p><strong>Login Email:</strong> ${email}</p>
              <p><strong>Default Password:</strong> ${defaultPassword}</p>
            </div>
            <p><strong>Important:</strong> You will be required to change your password on first login.</p>
            <p>Click the button below to access your account:</p>
            <a href="${this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000'}/login" class="button">Login Now</a>
            <div class="footer">
              <p>This is an automated message, please do not reply.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      return { success: true };
    } catch (error) {
      console.error('Email sending error:', error);
      // Don't throw - email is optional
      return { success: false, error: error.message };
    }
  }

  async sendNotificationEmail(email: string, subject: string, message: string) {
    const smtpFrom = this.configService.get<string>('SMTP_FROM') || 'noreply@constructioncrm.com';
    const fromEmail = smtpFrom.replace(/^["']|["']$/g, '');
    
    const mailOptions = {
      from: fromEmail,
      to: email,
      subject,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .footer { margin-top: 30px; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <h2>${subject}</h2>
            <p>${message}</p>
            <div class="footer">
              <p>This is an automated message from Construction CRM.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      return { success: true };
    } catch (error) {
      console.error('Email sending error:', error);
      return { success: false, error: error.message };
    }
  }

  async sendApprovalRequestEmail(data: {
    adminEmail: string;
    companyName: string;
    companyEmail: string;
    userName: string;
    userEmail: string;
    userId: string;
    companyId: string;
  }) {
    const smtpFrom = this.configService.get<string>('SMTP_FROM') || 'noreply@constructioncrm.com';
    const fromEmail = smtpFrom.replace(/^["']|["']$/g, '');
    const frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000';
    const approvalUrl = `${frontendUrl}/admin/approve?userId=${data.userId}&companyId=${data.companyId}`;
    
    console.log(`📧 Sending approval request email to: ${data.adminEmail}`);
    console.log(`   Company: ${data.companyName}`);
    console.log(`   User: ${data.userName} (${data.userEmail})`);

    const mailOptions = {
      from: fromEmail,
      to: data.adminEmail,
      subject: 'New Registration Approval Request - Construction CRM',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .button { display: inline-block; padding: 12px 24px; background-color: #28a745; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .button-danger { background-color: #dc3545; }
            .info-box { background-color: #f4f4f4; padding: 15px; border-radius: 5px; margin: 20px 0; }
            .footer { margin-top: 30px; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <h2>New Registration Approval Request</h2>
            <p>A new company has registered and is waiting for your approval.</p>
            
            <div class="info-box">
              <h3>Company Information:</h3>
              <p><strong>Company Name:</strong> ${data.companyName}</p>
              <p><strong>Company Email:</strong> ${data.companyEmail}</p>
            </div>
            
            <div class="info-box">
              <h3>User Information:</h3>
              <p><strong>Name:</strong> ${data.userName}</p>
              <p><strong>Email:</strong> ${data.userEmail}</p>
            </div>
            
            <p>Please review and approve or reject this registration:</p>
            <a href="${approvalUrl}" class="button">Review Registration</a>
            
            <p><strong>Note:</strong> The user will not be able to login until you approve their account.</p>
            
            <div class="footer">
              <p>This is an automated message from Construction CRM.</p>
              <p>User ID: ${data.userId} | Company ID: ${data.companyId}</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log('✅ Approval request email sent successfully');
      console.log(`   Message ID: ${info.messageId}`);
      return { success: true, messageId: info.messageId };
    } catch (error: any) {
      console.error('❌ Email sending error:', error);
      // Provide more helpful error messages (matches sendPasswordResetEmail behavior)
      let errorMessage = 'Failed to send approval request email';
      if (error.code === 'EAUTH') {
        errorMessage =
          'SMTP authentication failed (EAUTH). If using Gmail, use an App Password (not your normal password) and ensure SMTP_USER/SMTP_PASS are correct.';
      } else if (error.code === 'ECONNECTION') {
        errorMessage = 'Could not connect to SMTP server. Please check SMTP_HOST/SMTP_PORT and network access.';
      } else if (error.response) {
        errorMessage = `SMTP error: ${error.response}`;
      }

      console.error('   Error code:', error.code);
      console.error('   Error command:', error.command);
      console.error('   Error response:', error.response);

      throw new Error(errorMessage);
    }
  }
}

