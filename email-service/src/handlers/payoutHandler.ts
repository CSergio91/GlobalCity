import { renderEmailTemplate } from '../services/templateRenderer';
import { sendEmail } from '../services/resendClient';

export interface PayoutRequestedEventData {
  toEmail: string;
  traderName?: string;
  accountNumber: string;
  requestedAmount: string | number;
  profitSplitPct: string | number;
  netAmount: string | number;
  cryptoNetwork: string;
  walletAddress: string;
  dashboardUrl?: string;
  lang?: 'es' | 'en';
}

export interface PayoutApprovedEventData {
  toEmail: string;
  traderName?: string;
  accountNumber: string;
  netAmount: string | number;
  payoutTier: string | number;
  profitSplitPct: string | number;
  cryptoNetwork: string;
  walletAddress: string;
  txHash?: string;
  dashboardUrl?: string;
  lang?: 'es' | 'en';
}

export interface PayoutRejectedEventData {
  toEmail: string;
  traderName?: string;
  accountNumber: string;
  requestedAmount: string | number;
  rejectionReason: string;
  dashboardUrl?: string;
  lang?: 'es' | 'en';
}

export async function handlePayoutRequested(data: PayoutRequestedEventData) {
  const lang = data.lang || 'es';
  const traderName = data.traderName || 'Trader';

  const html = renderEmailTemplate({
    templateName: 'payout-requested',
    lang,
    data: {
      traderName,
      accountNumber: data.accountNumber,
      requestedAmount: data.requestedAmount,
      profitSplitPct: data.profitSplitPct,
      netAmount: data.netAmount,
      cryptoNetwork: data.cryptoNetwork || 'TRC20',
      walletAddress: data.walletAddress,
      dashboardUrl: data.dashboardUrl || 'https://dashapp.eklipsefunded.com',
    },
  });

  const subject = lang === 'en'
    ? `Payout Request Received: Account #${data.accountNumber} ⏳`
    : `Solicitud de Retiro Recibida: Cuenta #${data.accountNumber} ⏳`;

  return sendEmail({
    to: data.toEmail,
    subject,
    html,
  });
}

export async function handlePayoutApproved(data: PayoutApprovedEventData) {
  const lang = data.lang || 'es';
  const traderName = data.traderName || 'Trader';

  const html = renderEmailTemplate({
    templateName: 'payout-approved',
    lang,
    data: {
      traderName,
      accountNumber: data.accountNumber,
      netAmount: data.netAmount,
      payoutTier: data.payoutTier || '1',
      profitSplitPct: data.profitSplitPct || '80',
      cryptoNetwork: data.cryptoNetwork || 'TRC20',
      walletAddress: data.walletAddress,
      txHash: data.txHash || 'Enviado vía liquidación institucional',
      dashboardUrl: data.dashboardUrl || 'https://dashapp.eklipsefunded.com',
    },
  });

  const subject = lang === 'en'
    ? `Payout Settled! Funds Sent #${data.accountNumber} (${data.netAmount} USDT) 💰`
    : `¡Retiro Liquidado! Fondos Enviados #${data.accountNumber} (${data.netAmount} USDT) 💰`;

  return sendEmail({
    to: data.toEmail,
    subject,
    html,
  });
}

export async function handlePayoutRejected(data: PayoutRejectedEventData) {
  const lang = data.lang || 'es';
  const traderName = data.traderName || 'Trader';

  const html = renderEmailTemplate({
    templateName: 'payout-rejected',
    lang,
    data: {
      traderName,
      accountNumber: data.accountNumber,
      requestedAmount: data.requestedAmount,
      rejectionReason: data.rejectionReason,
      dashboardUrl: data.dashboardUrl || 'https://dashapp.eklipsefunded.com',
    },
  });

  const subject = lang === 'en'
    ? `Payout Audit Notice: Account #${data.accountNumber} ⚠️`
    : `Aviso de Auditoría de Retiro: Cuenta #${data.accountNumber} ⚠️`;

  return sendEmail({
    to: data.toEmail,
    subject,
    html,
  });
}
