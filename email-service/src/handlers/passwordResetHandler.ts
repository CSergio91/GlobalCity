import { renderEmailTemplate } from '../services/templateRenderer';
import { sendEmail } from '../services/resendClient';

export interface PasswordResetEventData {
  toEmail: string;
  traderName?: string;
  resetUrl: string;
  lang?: 'es' | 'en';
}

export async function handlePasswordReset(data: PasswordResetEventData) {
  const lang = data.lang || 'es';
  const traderName = data.traderName || 'Trader';

  const html = renderEmailTemplate({
    templateName: 'password-reset',
    lang,
    data: {
      traderName,
      resetUrl: data.resetUrl,
    },
  });

  const subject = lang === 'en'
    ? 'Reset Your Password · Eklipse Funded Security 🔒'
    : 'Restablecer Tu Contraseña · Seguridad Eklipse 🔒';

  return sendEmail({
    to: data.toEmail,
    subject,
    html,
  });
}
