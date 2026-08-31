import nodemailer from 'nodemailer';
import mg from 'nodemailer-mailgun-transport';
import { env } from '../../config/env';

let transporter: nodemailer.Transporter | null = null;

function getTransporter(): nodemailer.Transporter {
  if (transporter) return transporter;

  if (env.EMAIL_PRIVATE_KEY && env.EMAIL_DOMAIN) {
    const auth = {
      auth: {
        api_key: env.EMAIL_PRIVATE_KEY,
        domain: env.EMAIL_DOMAIN,
      },
    };
    transporter = nodemailer.createTransport(mg(auth));
  } else {
    // Fallback to console logging in development
    transporter = nodemailer.createTransport({
      jsonTransport: true,
    });
  }

  return transporter;
}

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail(options: SendEmailOptions): Promise<void> {
  const transport = getTransporter();

  const mailOptions = {
    from: 'EasyFund <noreply@easyfund.com>',
    to: options.to,
    subject: options.subject,
    html: options.html,
    text: options.text,
  };

  try {
    const info = await transport.sendMail(mailOptions);
    console.log('Email sent:', info.messageId || 'development mode');
  } catch (error) {
    console.error('Failed to send email:', error);
  }
}

// Email templates
export function donationConfirmationEmail(data: {
  donorName: string;
  campaignTitle: string;
  amount: number;
  transactionId: string;
}): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #10B981; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background-color: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; }
        .footer { background-color: #f3f4f6; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; font-size: 12px; color: #6b7280; }
        .amount { font-size: 32px; font-weight: bold; color: #10B981; }
        .details { background: white; padding: 15px; border-radius: 8px; margin: 15px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Thank You for Your Support!</h1>
        </div>
        <div class="content">
          <p>Hi ${data.donorName},</p>
          <p>Your generous contribution is making a real difference.</p>
          <div class="details">
            <p><strong>Campaign:</strong> ${data.campaignTitle}</p>
            <p class="amount">$${data.amount}</p>
            <p><strong>Transaction ID:</strong> ${data.transactionId}</p>
          </div>
          <p>You can track the campaign's progress and see the impact of your support in your dashboard.</p>
          <p>Thank you for being part of this community!</p>
        </div>
        <div class="footer">
          <p>EasyFund - Fund What Matters</p>
          <p>This is a confirmation of your donation. Keep this for your records.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

export function withdrawalApprovedEmail(amount: number, campaignTitle: string) {
  return `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #0ef695;">Withdrawal Approved</h2>
      <p>Your withdrawal of <strong>$${amount}</strong> for "${campaignTitle}" has been approved and is being processed.</p>
      <p>You should receive the funds within 3-5 business days.</p>
      <br/>
      <p>Thank you for using EasyFund!</p>
    </div>
  `;
}

export function withdrawalRejectedEmail(amount: number, campaignTitle: string, reason?: string) {
  return `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #ef4444;">Withdrawal Not Approved</h2>
      <p>Your withdrawal of <strong>$${amount}</strong> for "${campaignTitle}" was not approved.</p>
      ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}
      <p>Please contact support if you have questions.</p>
    </div>
  `;
}

export function verificationApprovedEmail(level: string) {
  return `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #0ef695;">Verification Approved</h2>
      <p>Your <strong>${level}</strong> verification has been approved!</p>
      <p>This helps build trust with donors on EasyFund.</p>
    </div>
  `;
}

export function verificationRejectedEmail(level: string, notes?: string) {
  return `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #ef4444;">Verification Not Approved</h2>
      <p>Your <strong>${level}</strong> verification was not approved.</p>
      ${notes ? `<p><strong>Notes:</strong> ${notes}</p>` : ''}
      <p>You can re-submit with additional information.</p>
    </div>
  `;
}

export function campaignApprovedEmail(data: {
  fundraiserName: string;
  campaignTitle: string;
  campaignSlug: string;
}): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #10B981; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background-color: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; }
        .footer { background-color: #f3f4f6; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; font-size: 12px; color: #6b7280; }
        .btn { display: inline-block; background-color: #10B981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Campaign Approved! 🎉</h1>
        </div>
        <div class="content">
          <p>Hi ${data.fundraiserName},</p>
          <p>Great news! Your campaign <strong>${data.campaignTitle}</strong> has been approved and is now live on EasyFund.</p>
          <p>People can now discover and support your campaign.</p>
          <p style="text-align: center; margin: 30px 0;">
            <a href="${env.FRONTEND_URL}/campaign/${data.campaignSlug}" class="btn">View Your Campaign</a>
          </p>
          <p>Share your campaign on social media to reach more supporters!</p>
        </div>
        <div class="footer">
          <p>EasyFund - Fund What Matters</p>
        </div>
      </div>
    </body>
    </html>
  `;
}
