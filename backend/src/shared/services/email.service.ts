import nodemailer from 'nodemailer';

let transporter: nodemailer.Transporter;

// Initialize transporter
const initTransporter = async () => {
  if (transporter) return transporter;

  if (process.env.SMTP_HOST && process.env.SMTP_USER) {
    // Use real SMTP if configured
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  } else {
    // Generate test Ethereal account if no SMTP config is found
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: testAccount.user, // generated ethereal user
        pass: testAccount.pass, // generated ethereal password
      },
    });
    console.log('Ethereal Email account generated for testing.');
  }

  return transporter;
};

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
}

export const sendEmail = async ({ to, subject, html }: SendEmailOptions) => {
  try {
    const t = await initTransporter();
    
    const info = await t.sendMail({
      from: '"TrustVerify NGO" <no-reply@trustverify.ngo>',
      to,
      subject,
      html,
    });

    console.log(`Email sent to ${to}: ${info.messageId}`);
    
    // If using Ethereal, print the URL to view the email in terminal
    if (!process.env.SMTP_HOST) {
      console.log(`Preview Email URL: ${nodemailer.getTestMessageUrl(info)}`);
    }

    return info;
  } catch (error) {
    console.error('Email Send Error:', error);
    throw error;
  }
};

// --- Email Templates ---

export const templates = {
  welcome: (name: string) => `
    <div style="font-family: Arial, sans-serif; max-w: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
      <h2 style="color: #6366f1;">Welcome to TrustVerify, ${name}!</h2>
      <p>Thank you for registering on the TrustVerify NGO platform.</p>
      <p>We are dedicated to full transparency in our aid tracking system. You can log in at any time to monitor donations and see the real-time impact of your contributions.</p>
      <br/>
      <p>Best Regards,</p>
      <p><strong>The TrustVerify Team</strong></p>
    </div>
  `,
  
  statusUpdate: (requestNumber: string, status: string, reason?: string) => `
    <div style="font-family: Arial, sans-serif; max-w: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
      <h2 style="color: #6366f1;">Aid Request Update</h2>
      <p>Your aid request <strong>#${requestNumber}</strong> has been updated to:</p>
      <h3 style="color: ${status === 'APPROVED' ? '#14b8a6' : status === 'REJECTED' ? '#ef4444' : '#f59e0b'};">${status}</h3>
      ${reason ? `<p><strong>Reason/Notes:</strong> ${reason}</p>` : ''}
      <br/>
      <p>Please log in to your dashboard for more details.</p>
    </div>
  `,

  donationReceipt: (donorName: string, amount: string, currency: string, receiptNumber: string) => `
    <div style="font-family: Arial, sans-serif; max-w: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
      <h2 style="color: #6366f1;">Thank you for your generous donation!</h2>
      <p>Dear ${donorName},</p>
      <p>We have successfully received your donation of <strong>${amount} ${currency}</strong>.</p>
      <p>Your official tax receipt number is: <strong>${receiptNumber}</strong></p>
      <p>You can download a PDF copy of this receipt at any time from your Donor Dashboard.</p>
      <br/>
      <p>With gratitude,</p>
      <p><strong>The TrustVerify Team</strong></p>
    </div>
  `,
};
