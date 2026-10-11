import { renderEmailTemplate } from '../services/templateRenderer';
import { sendEmail } from '../services/resendClient';

export interface WelcomeEventData {
  toEmail: string;
  traderName?: string;
  lang?: 'es' | 'en';
  dashboardUrl?: string;
}

export async function handleWelcome(data: WelcomeEventData) {
  const lang = data.lang || 'es';
  const traderName = data.traderName || 'Trader';

  const html = renderEmailTemplate({
    templateName: 'welcome',
    lang,
    data: {
      traderName,
      dashboardUrl: data.dashboardUrl,
    },
  });

  const subject = lang === 'en'
    ? `Welcome to Eklipse Funded, ${traderName}! ✨`
    : `¡Bienvenido a Eklipse Funded, ${traderName}! ✨`;

  return sendEmail({
    to: data.toEmail,
    subject,
    html,
  });
}
