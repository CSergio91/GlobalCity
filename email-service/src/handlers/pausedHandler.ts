import { renderEmailTemplate } from '../services/templateRenderer';
import { sendEmail } from '../services/resendClient';

export interface PausedEventData {
  toEmail: string;
  traderName?: string;
  accountNumber: string;
  reason: string;
  lang?: 'es' | 'en';
}

export async function handlePaused(data: PausedEventData) {
  const lang = data.lang || 'es';
  const traderName = data.traderName || 'Trader';

  const html = renderEmailTemplate({
    templateName: 'account-paused',
    lang,
    data: {
      traderName,
      accountNumber: data.accountNumber,
      reason: data.reason,
    },
  });

  const subject = lang === 'en'
    ? `Account #${data.accountNumber} Temporarily Paused ⏸️`
    : `Tu Cuenta #${data.accountNumber} Ha Sido Pausada Temporalmente ⏸️`;

  return sendEmail({
    to: data.toEmail,
    subject,
    html,
  });
}
