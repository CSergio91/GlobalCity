import { renderEmailTemplate } from '../services/templateRenderer';
import { sendEmail } from '../services/resendClient';

export interface PassedEventData {
  toEmail: string;
  traderName?: string;
  accountNumber: string;
  planName?: string;
  capitalFormatted?: string;
  nextStage?: string;
  lang?: 'es' | 'en';
}

export async function handlePassed(data: PassedEventData) {
  const lang = data.lang || 'es';
  const traderName = data.traderName || 'Trader';

  const html = renderEmailTemplate({
    templateName: 'account-passed',
    lang,
    data: {
      traderName,
      accountNumber: data.accountNumber,
      planName: data.planName || 'Standard Challenge',
      capitalFormatted: data.capitalFormatted || '100,000',
      nextStage: data.nextStage || (lang === 'en' ? 'Phase 2 / Funded Account' : 'Fase 2 / Cuenta Fondeada'),
    },
  });

  const subject = lang === 'en'
    ? `Target Reached! Challenge Passed #${data.accountNumber} 🏆`
    : `¡Meta Alcanzada! Reto Superado #${data.accountNumber} 🏆`;

  return sendEmail({
    to: data.toEmail,
    subject,
    html,
  });
}
