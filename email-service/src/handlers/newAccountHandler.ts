import { renderEmailTemplate } from '../services/templateRenderer';
import { sendEmail } from '../services/resendClient';

export interface NewAccountEventData {
  toEmail: string;
  traderName?: string;
  accountNumber: string;
  planName: string;
  capitalFormatted: string;
  profitSplit?: string;
  maxDailyLoss?: string;
  maxTotalLoss?: string;
  profitTarget?: string;
  lang?: 'es' | 'en';
  dashboardUrl?: string;
}

export async function handleNewAccount(data: NewAccountEventData) {
  const lang = data.lang || 'es';
  const traderName = data.traderName || 'Trader';

  const html = renderEmailTemplate({
    templateName: 'new-account',
    lang,
    data: {
      traderName,
      accountNumber: data.accountNumber,
      planName: data.planName,
      capitalFormatted: data.capitalFormatted,
      profitSplit: data.profitSplit || '80% Trader',
      maxDailyLoss: data.maxDailyLoss || '5%',
      maxTotalLoss: data.maxTotalLoss || '10%',
      profitTarget: data.profitTarget || '8%',
      dashboardUrl: data.dashboardUrl,
    },
  });

  const subject = lang === 'en'
    ? `New Account Activated! #${data.accountNumber} (${data.capitalFormatted} USD) 🚀`
    : `¡Nueva Cuenta Activada! #${data.accountNumber} (${data.capitalFormatted} USD) 🚀`;

  return sendEmail({
    to: data.toEmail,
    subject,
    html,
  });
}
