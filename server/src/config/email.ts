import nodemailer from 'nodemailer';

export const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const sendEmail = async ({
  to,
  subject,
  html,
  text,
}: {
  to: string;
  subject: string;
  html: string;
  text?: string;
}): Promise<void> => {
  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject,
    html,
    text,
  });
};

// Email Templates
export const emailTemplates = {
  verification: (name: string, otp: string) => `
    <!DOCTYPE html>
    <html>
    <head><meta charset="UTF-8"><title>Email Verification</title></head>
    <body style="font-family: Inter, sans-serif; background: #F8FAFC; margin: 0; padding: 20px;">
      <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08);">
        <div style="background: linear-gradient(135deg, #4F46E5, #7C3AED); padding: 40px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Campus Placement Portal</h1>
          <p style="color: rgba(255,255,255,0.8); margin: 8px 0 0;">Your Career Starts Here</p>
        </div>
        <div style="padding: 40px;">
          <h2 style="color: #0F172A; margin-top: 0;">Verify Your Email</h2>
          <p style="color: #64748B;">Hi ${name},</p>
          <p style="color: #64748B;">Use the OTP below to verify your email address. This code is valid for 10 minutes.</p>
          <div style="background: #F8FAFC; border-radius: 12px; padding: 24px; text-align: center; margin: 24px 0;">
            <span style="font-size: 40px; font-weight: 700; color: #4F46E5; letter-spacing: 8px;">${otp}</span>
          </div>
          <p style="color: #94A3B8; font-size: 14px;">If you didn't request this, please ignore this email.</p>
        </div>
        <div style="background: #F8FAFC; padding: 24px; text-align: center;">
          <p style="color: #94A3B8; font-size: 14px; margin: 0;">© 2025 Campus Placement Portal. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `,

  passwordReset: (name: string, resetLink: string) => `
    <!DOCTYPE html>
    <html>
    <body style="font-family: Inter, sans-serif; background: #F8FAFC; margin: 0; padding: 20px;">
      <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08);">
        <div style="background: linear-gradient(135deg, #4F46E5, #7C3AED); padding: 40px; text-align: center;">
          <h1 style="color: white; margin: 0;">Campus Placement Portal</h1>
        </div>
        <div style="padding: 40px;">
          <h2 style="color: #0F172A; margin-top: 0;">Reset Your Password</h2>
          <p style="color: #64748B;">Hi ${name},</p>
          <p style="color: #64748B;">Click the button below to reset your password. This link expires in 1 hour.</p>
          <div style="text-align: center; margin: 32px 0;">
            <a href="${resetLink}" style="background: linear-gradient(135deg, #4F46E5, #7C3AED); color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px;">Reset Password</a>
          </div>
          <p style="color: #94A3B8; font-size: 14px;">If you didn't request a password reset, please ignore this email.</p>
        </div>
      </div>
    </body>
    </html>
  `,

  welcomeEmail: (name: string, role: string) => `
    <!DOCTYPE html>
    <html>
    <body style="font-family: Inter, sans-serif; background: #F8FAFC; margin: 0; padding: 20px;">
      <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08);">
        <div style="background: linear-gradient(135deg, #4F46E5, #7C3AED); padding: 40px; text-align: center;">
          <h1 style="color: white; margin: 0;">Welcome to Campus Placement Portal! 🎉</h1>
        </div>
        <div style="padding: 40px;">
          <p style="color: #64748B;">Hi ${name},</p>
          <p style="color: #64748B;">Welcome aboard! Your account has been created as a <strong>${role}</strong>.</p>
          <p style="color: #64748B;">Start your journey by completing your profile and exploring opportunities.</p>
          <div style="text-align: center; margin: 32px 0;">
            <a href="${process.env.CLIENT_URL}/dashboard" style="background: linear-gradient(135deg, #4F46E5, #7C3AED); color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px;">Go to Dashboard</a>
          </div>
        </div>
      </div>
    </body>
    </html>
  `,

  interviewScheduled: (name: string, company: string, date: string, link?: string) => `
    <!DOCTYPE html>
    <html>
    <body style="font-family: Inter, sans-serif; background: #F8FAFC; margin: 0; padding: 20px;">
      <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08);">
        <div style="background: linear-gradient(135deg, #06B6D4, #4F46E5); padding: 40px; text-align: center;">
          <h1 style="color: white; margin: 0;">Interview Scheduled 📅</h1>
        </div>
        <div style="padding: 40px;">
          <p style="color: #64748B;">Hi ${name},</p>
          <p style="color: #64748B;">Your interview with <strong>${company}</strong> has been scheduled.</p>
          <div style="background: #F8FAFC; border-radius: 12px; padding: 24px; margin: 24px 0;">
            <p style="margin: 0; color: #0F172A; font-weight: 600;">📅 Date & Time: ${date}</p>
            ${link ? `<p style="margin: 12px 0 0;"><a href="${link}" style="color: #4F46E5;">Join Interview Link</a></p>` : ''}
          </div>
          <p style="color: #94A3B8; font-size: 14px;">Best of luck! Prepare well.</p>
        </div>
      </div>
    </body>
    </html>
  `,
};
