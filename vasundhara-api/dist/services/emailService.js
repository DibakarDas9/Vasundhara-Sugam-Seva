"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendApprovalDecisionEmail = sendApprovalDecisionEmail;
const nodemailer_1 = __importDefault(require("nodemailer"));
const config_1 = require("@/config/config");
const logger_1 = require("@/utils/logger");
let transporter = null;
const hasSmtpConfig = () => {
    const { smtp } = config_1.config.email;
    return Boolean(smtp.host && smtp.user && smtp.pass);
};
const ensureTransporter = () => {
    if (transporter || !hasSmtpConfig()) {
        return transporter;
    }
    const { smtp } = config_1.config.email;
    transporter = nodemailer_1.default.createTransport({
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
const decisionCopy = (payload) => {
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
async function sendApprovalDecisionEmail(payload) {
    if (!config_1.config.email.enabled) {
        logger_1.logger.info('Email disabled; skipping approval notification', { to: payload.to, decision: payload.decision });
        return;
    }
    if (!payload.to) {
        logger_1.logger.warn('Cannot send approval email without recipient address');
        return;
    }
    if (config_1.config.email.service !== 'smtp') {
        logger_1.logger.warn('Email service not set to SMTP; skipping approval notification', { service: config_1.config.email.service });
        return;
    }
    const transport = ensureTransporter();
    if (!transport) {
        logger_1.logger.warn('SMTP credentials missing; unable to send approval email');
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
            from: config_1.config.email.from,
            to: payload.to,
            subject: copy.subject,
            text,
            html,
        });
        logger_1.logger.info('Approval decision email sent', { to: payload.to, decision: payload.decision });
    }
    catch (error) {
        logger_1.logger.error('Failed to send approval decision email', { error, to: payload.to });
    }
}
//# sourceMappingURL=emailService.js.map