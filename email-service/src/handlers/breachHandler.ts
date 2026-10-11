import { renderEmailTemplate } from '../services/templateRenderer';
import { sendEmail } from '../services/resendClient';

export interface BreachEventData {
  toEmail: string;
  traderName?: string;
  accountNumber: string;
  breachReason: string;
  breachLimit?: string;
  resetUrl?: string;
  lang?: 'es' | 'en';
}

export async function handleBreach(data: BreachEventData) {
  const lang = data.lang || 'es';
  const traderName = data.traderName || 'Trader';

  const html = renderEmailTemplate({
    templateName: 'account-breached',
    lang,
    data: {
      traderName,
      accountNumber: data.accountNumber,
      breachReason: data.breachReason,
      breachLimit: data.breachLimit || 'Parámetro de Riesgo Institucional',
      resetUrl: data.resetUrl,
    },
  });

  const subject = lang === 'en'
    ? `Risk Desk Notice: Account #${data.accountNumber} Limit Reached 🛑`
    : `Aviso de Gestión de Riesgo: Cuenta #${data.accountNumber} Límite Alcanzado 🛑`;

  return sendEmail({
    to: data.toEmail,
    subject,
    html,
  });
}
