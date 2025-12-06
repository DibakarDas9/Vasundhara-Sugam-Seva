import nodemailer from 'nodemailer';
import { config } from '@/config/config';
import { logger } from '@/utils/logger';

interface ApprovalEmailPayload {
  to: string;
  name?: string;
  decision: 'approved' | 'rejected';
  note?: string;
  reason?: string;
}

let transporter: nodemailer.Transporter | null = null;

const hasSmtpConfig = () => {
  const { smtp } = config.email;
  return Boolean(smtp.host && smtp.user && smtp.pass);
};

const ensureTransporter = () => {
  if (transporter || !hasSmtpConfig()) {
    return transporter;
  }

  const { smtp } = config.email;
  transporter = nodemailer.createTransport({
    host: smtp.host,
    port: smtp.port,
    secure: smtp.secure,
    auth: {
      user: smtp.user,
      pass: smtp.pass,
    },
  });

  return transporter;
};

const decisionCopy = (payload: ApprovalEmailPayload) => {
  if (payload.decision === 'approved') {
    return {
      subject: 'Your Vasundhara account has been approved',
      intro: 'Great news!',
      body: 'Your application was reviewed and approved. You can now sign in and start using all Vasundhara features immediately.',
    };
  }
  return {
    subject: 'Action needed for your Vasundhara application',
    intro: 'A quick update on your account request.',
    body: payload.reason
      ? `We could not approve your application because: ${payload.reason}`
      : 'We could not approve your application. Please review the details you submitted and try again.',
  };
};

export async function sendApprovalDecisionEmail(payload: ApprovalEmailPayload): Promise<void> {
  if (!config.email.enabled) {
    logger.info('Email disabled; skipping approval notification', { to: payload.to, decision: payload.decision });
    return;
  }

  if (!payload.to) {
    logger.warn('Cannot send approval email without recipient address');
    return;
  }

  if (config.email.service !== 'smtp') {
    logger.warn('Email service not set to SMTP; skipping approval notification', { service: config.email.service });
    return;
  }

  const transport = ensureTransporter();
  if (!transport) {
    logger.warn('SMTP credentials missing; unable to send approval email');
    return;
  }

  const copy = decisionCopy(payload);
  const greeting = payload.name ? `Hi ${payload.name.split(' ')[0]},` : 'Hello,';
  const noteCopy = payload.note ? `\n\nReviewer note: ${payload.note}` : '';
  const closing = payload.decision === 'approved'
    ? 'We are excited to have you onboard. Log in to start managing your food systems.'
    : 'Update your application and resubmit whenever you are ready. Reply to this email if you need assistance.';

  const text = `${greeting}\n\n${copy.intro}\n${copy.body}${noteCopy}\n\n${closing}\n\n— Vasundhara Support Team`;
  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #0f172a;">
      <p>${greeting}</p>
      <p><strong>${copy.intro}</strong></p>
      <p>${copy.body}</p>
      ${payload.note ? `<p style="margin-top: 12px; padding: 12px; background: #f1f5f9; border-radius: 8px;"><strong>Reviewer note:</strong><br/>${payload.note}</p>` : ''}
      <p style="margin-top: 24px;">${closing}</p>
      <p style="color: #475569;">— Vasundhara Support Team</p>
    </div>
  `;

  try {
    await transport.sendMail({
      from: config.email.from,
      to: payload.to,
      subject: copy.subject,
      text,
      html,
    });
    logger.info('Approval decision email sent', { to: payload.to, decision: payload.decision });
  } catch (error) {
    logger.error('Failed to send approval decision email', { error, to: payload.to });
  }
}
