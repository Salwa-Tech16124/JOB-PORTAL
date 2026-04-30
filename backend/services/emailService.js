import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// ─── Transporter Setup ──────────────────────────────────────────────────────
// Uses Gmail SMTP by default. Falls back to Ethereal (test) if no credentials.
let transporter = null;

async function getTransporter() {
  if (transporter) return transporter;

  const user = process.env.MAIL_USER;
  const pass = process.env.MAIL_PASS;

  if (user && pass) {
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user, pass }
    });
    console.log('📧 Email: Using Gmail SMTP');
  } else {
    // Ethereal test account — catches emails without sending real ones
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: { user: testAccount.user, pass: testAccount.pass }
    });
    console.log('📧 Email: Using Ethereal test account —', testAccount.user);
    console.log('📧 View sent emails at https://ethereal.email');
  }
  return transporter;
}

// ─── Email Templates ─────────────────────────────────────────────────────────

function buildAcceptanceEmail({ candidateName, jobTitle, companyName, employerName, strengths }) {
  const strengthList = strengths?.length
    ? `<ul style="margin:8px 0 0 0; padding-left:20px;">${strengths.map(s => `<li style="margin-bottom:4px;">${s}</li>`).join('')}</ul>`
    : '';

  return {
    subject: `🎉 Great news! You've caught our attention — ${jobTitle} at ${companyName}`,
    html: `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f9fafb; border-radius: 12px; overflow: hidden;">
        <div style="background: linear-gradient(135deg, #6366f1, #8b5cf6); padding: 36px 32px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 26px; font-weight: 700;">We're Interested in You! 🚀</h1>
          <p style="color: rgba(255,255,255,0.85); margin: 10px 0 0 0; font-size: 15px;">${companyName}</p>
        </div>
        <div style="padding: 36px 32px; background: white;">
          <p style="font-size: 16px; color: #1f2937; margin: 0 0 16px 0;">Dear <strong>${candidateName}</strong>,</p>
          <p style="color: #4b5563; line-height: 1.7; margin: 0 0 16px 0;">
            We have reviewed your profile for the <strong>${jobTitle}</strong> position at <strong>${companyName}</strong>, 
            and we are genuinely impressed! After careful evaluation, we'd love to move forward and explore this opportunity together.
          </p>
          ${strengths?.length ? `
          <div style="background: #f0fdf4; border-left: 4px solid #22c55e; border-radius: 6px; padding: 16px 20px; margin: 20px 0;">
            <p style="color: #166534; font-weight: 600; margin: 0 0 6px 0; font-size: 14px;">What stood out to us:</p>
            ${strengthList}
          </div>` : ''}
          <p style="color: #4b5563; line-height: 1.7; margin: 16px 0;">
            Our team, led by <strong>${employerName}</strong>, will be reaching out shortly with the next steps. 
            Please keep an eye on your inbox and feel free to reply to this email if you have any questions.
          </p>
          <div style="text-align: center; margin: 30px 0 0 0;">
            <div style="background: linear-gradient(135deg, #6366f1, #8b5cf6); display: inline-block; padding: 14px 32px; border-radius: 8px; color: white; font-weight: 600; font-size: 16px;">
              Looking forward to speaking with you!
            </div>
          </div>
        </div>
        <div style="padding: 20px 32px; text-align: center; background: #f9fafb; border-top: 1px solid #e5e7eb;">
          <p style="color: #9ca3af; font-size: 13px; margin: 0;">Sent via AI Job Portal • ${companyName}</p>
        </div>
      </div>
    `
  };
}

function buildRejectionEmail({ candidateName, jobTitle, companyName, employerName, gaps }) {
  return {
    subject: `Update on your application — ${jobTitle} at ${companyName}`,
    html: `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f9fafb; border-radius: 12px; overflow: hidden;">
        <div style="background: linear-gradient(135deg, #64748b, #475569); padding: 36px 32px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 26px; font-weight: 700;">Application Update</h1>
          <p style="color: rgba(255,255,255,0.8); margin: 10px 0 0 0; font-size: 15px;">${companyName}</p>
        </div>
        <div style="padding: 36px 32px; background: white;">
          <p style="font-size: 16px; color: #1f2937; margin: 0 0 16px 0;">Dear <strong>${candidateName}</strong>,</p>
          <p style="color: #4b5563; line-height: 1.7; margin: 0 0 16px 0;">
            Thank you sincerely for your interest in the <strong>${jobTitle}</strong> position at <strong>${companyName}</strong> 
            and for taking the time to apply. We genuinely appreciate it.
          </p>
          <p style="color: #4b5563; line-height: 1.7; margin: 0 0 16px 0;">
            After carefully reviewing your profile, we have decided not to move forward with your application at this time. 
            This was a difficult decision, as we received many strong applications.
          </p>
          <div style="background: #fefce8; border-left: 4px solid #eab308; border-radius: 6px; padding: 16px 20px; margin: 20px 0;">
            <p style="color: #713f12; font-weight: 600; margin: 0 0 6px 0; font-size: 14px;">💡 A tip for your next application:</p>
            <p style="color: #92400e; margin: 0; font-size: 14px; line-height: 1.6;">
              ${gaps?.length
                ? `Consider strengthening: ${gaps.join(', ')}.`
                : 'Keep building your skills and portfolio — your next opportunity is just around the corner!'}
            </p>
          </div>
          <p style="color: #4b5563; line-height: 1.7; margin: 16px 0 0 0;">
            We encourage you to keep applying and wish you the very best in your career journey. 
            Thank you again, <strong>${employerName}</strong> and the ${companyName} team.
          </p>
        </div>
        <div style="padding: 20px 32px; text-align: center; background: #f9fafb; border-top: 1px solid #e5e7eb;">
          <p style="color: #9ca3af; font-size: 13px; margin: 0;">Sent via AI Job Portal • ${companyName}</p>
        </div>
      </div>
    `
  };
}

// ─── Main Export ─────────────────────────────────────────────────────────────

export async function sendAcceptanceEmail({ to, candidateName, jobTitle, companyName, employerName, strengths }) {
  if (!to) {
    console.warn(`⚠️ No email address for ${candidateName}, skipping acceptance email.`);
    return { sent: false, reason: 'No email address' };
  }
  try {
    const transport = await getTransporter();
    const { subject, html } = buildAcceptanceEmail({ candidateName, jobTitle, companyName, employerName, strengths });
    const info = await transport.sendMail({
      from: `"${companyName} Recruiting" <${process.env.MAIL_USER || 'noreply@aijobportal.com'}>`,
      to,
      subject,
      html
    });
    console.log(`✅ Acceptance email sent to ${to}: ${nodemailer.getTestMessageUrl(info) || info.messageId}`);
    return { sent: true, messageId: info.messageId, previewUrl: nodemailer.getTestMessageUrl(info) || null };
  } catch (err) {
    console.error(`❌ Failed to send acceptance email to ${to}:`, err.message);
    return { sent: false, reason: err.message };
  }
}

export async function sendRejectionEmail({ to, candidateName, jobTitle, companyName, employerName, gaps }) {
  if (!to) {
    console.warn(`⚠️ No email address for ${candidateName}, skipping rejection email.`);
    return { sent: false, reason: 'No email address' };
  }
  try {
    const transport = await getTransporter();
    const { subject, html } = buildRejectionEmail({ candidateName, jobTitle, companyName, employerName, gaps });
    const info = await transport.sendMail({
      from: `"${companyName} Recruiting" <${process.env.MAIL_USER || 'noreply@aijobportal.com'}>`,
      to,
      subject,
      html
    });
    console.log(`✅ Rejection email sent to ${to}: ${nodemailer.getTestMessageUrl(info) || info.messageId}`);
    return { sent: true, messageId: info.messageId, previewUrl: nodemailer.getTestMessageUrl(info) || null };
  } catch (err) {
    console.error(`❌ Failed to send rejection email to ${to}:`, err.message);
    return { sent: false, reason: err.message };
  }
}
function buildViewedEmail({ candidateName, jobTitle, companyName }) {
  return {
    subject: `👀 Your profile was viewed for the ${jobTitle} position!`,
    html: `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f9fafb; border-radius: 12px; overflow: hidden;">
        <div style="background: linear-gradient(135deg, #3b82f6, #2563eb); padding: 36px 32px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 26px; font-weight: 700;">Profile Viewed! 👀</h1>
          <p style="color: rgba(255,255,255,0.85); margin: 10px 0 0 0; font-size: 15px;">${companyName}</p>
        </div>
        <div style="padding: 36px 32px; background: white;">
          <p style="font-size: 16px; color: #1f2937; margin: 0 0 16px 0;">Hi <strong>${candidateName}</strong>,</p>
          <p style="color: #4b5563; line-height: 1.7; margin: 0 0 16px 0;">
            Great news! <strong>${companyName}</strong> has just reviewed your profile for the <strong>${jobTitle}</strong> position. 
          </p>
          <p style="color: #4b5563; line-height: 1.7; margin: 0 0 16px 0;">
            This is a positive sign that your skills caught their eye. They are currently evaluating applicants, and if there's a match, they will reach out to you soon.
          </p>
          <div style="text-align: center; margin: 30px 0 0 0;">
            <div style="background: #eff6ff; border: 1px solid #bfdbfe; display: inline-block; padding: 14px 32px; border-radius: 8px; color: #1e40af; font-weight: 600; font-size: 16px;">
              Keep up the great work!
            </div>
          </div>
        </div>
        <div style="padding: 20px 32px; text-align: center; background: #f9fafb; border-top: 1px solid #e5e7eb;">
          <p style="color: #9ca3af; font-size: 13px; margin: 0;">Sent via AI Job Portal • ${companyName}</p>
        </div>
      </div>
    `
  };
}

export async function sendViewedEmail({ to, candidateName, jobTitle, companyName }) {
  if (!to) {
    console.warn(`⚠️ No email address for ${candidateName}, skipping viewed notification email.`);
    return { sent: false, reason: 'No email address' };
  }
  try {
    const transport = await getTransporter();
    const { subject, html } = buildViewedEmail({ candidateName, jobTitle, companyName });
    const info = await transport.sendMail({
      from: `"${companyName} Recruiting" <${process.env.MAIL_USER || 'noreply@aijobportal.com'}>`,
      to,
      subject,
      html
    });
    console.log(`✅ Viewed notification email sent to ${to}: ${nodemailer.getTestMessageUrl(info) || info.messageId}`);
    return { sent: true, messageId: info.messageId, previewUrl: nodemailer.getTestMessageUrl(info) || null };
  } catch (err) {
    console.error(`❌ Failed to send viewed notification email to ${to}:`, err.message);
    return { sent: false, reason: err.message };
  }
}
