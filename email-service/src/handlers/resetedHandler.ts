import { renderEmailTemplate } from '../services/templateRenderer';
import { sendEmail } from '../services/resendClient';

export interface ResetedEventData {
  toEmail: string;
  traderName?: string;
  accountNumber: string;
  capitalFormatted: string;
  lang?: 'es' | 'en';
}

export async function handleReseted(data: ResetedEventData) {
  const lang = data.lang || 'es';
  const traderName = data.traderName || 'Trader';

  const html = renderEmailTemplate({
    templateName: 'account-reseted',
    lang,
    data: {
      traderName,
      accountNumber: data.accountNumber,
      capitalFormatted: data.capitalFormatted,
    },
  });

  const subject = lang === 'en'
    ? `Account #${data.accountNumber} Successfully Reset! 🔄`
    : `¡Tu Cuenta #${data.accountNumber} Ha Sido Reseteada! 🔄`;

  return sendEmail({
    to: data.toEmail,
    subject,
    html,
  });
}
