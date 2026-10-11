import { renderEmailTemplate } from '../services/templateRenderer';
import { sendEmail } from '../services/resendClient';

export interface NeedSupportEventData {
  toEmail: string;
  traderName?: string;
  ticketId: string;
  subject: string;
  agentName?: string;
  replyMessage: string;
  supportUrl?: string;
  lang?: 'es' | 'en';
}

export async function handleNeedSupport(data: NeedSupportEventData) {
  const lang = data.lang || 'es';
  const traderName = data.traderName || 'Trader';

  const html = renderEmailTemplate({
    templateName: 'need-support',
    lang,
    data: {
      traderName,
      ticketId: data.ticketId,
      subject: data.subject,
      agentName: data.agentName || 'Mesa de Operaciones Eklipse',
      replyMessage: data.replyMessage,
      supportUrl: data.supportUrl,
    },
  });

  const subject = lang === 'en'
    ? `Support Ticket #${data.ticketId}: ${data.subject} — Eklipse Desk`
    : `Ticket #${data.ticketId}: ${data.subject} — Soporte Eklipse`;

  return sendEmail({
    to: data.toEmail,
    subject,
    html,
  });
}
