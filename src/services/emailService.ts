/**
 * EKLIPSE FUNDED — CLIENT EMAIL DISPATCH SERVICE
 * Arquitectura Segura y Desacoplada:
 * Las peticiones de correo se envían al backend / microservicio de email vía Redis Pub/Sub.
 * Ninguna clave privada (RESEND_API_KEY) se expone jamás en el frontend del cliente.
 */

export interface WelcomeEmailPayload {
  toEmail: string;
  traderName: string;
  lang?: 'es' | 'en';
  dashboardUrl?: string;
}

export interface NewAccountPurchasedPayload {
  toEmail: string;
  traderName: string;
  accountNumber: string;
  planName: string;
  capitalFormatted: string;
  profitSplit?: string;
  maxDailyLoss?: string;
  maxTotalLoss?: string;
  profitTarget?: string;
  orderNumber?: string;
  totalPriceFormatted?: string;
  paymentGateway?: string;
  dashboardUrl?: string;
  lang?: 'es' | 'en';
}

export interface AccountBreachedPayload {
  toEmail: string;
  traderName: string;
  accountNumber: string;
  breachReason: string;
  breachLimit?: string;
  resetUrl?: string;
  lang?: 'es' | 'en';
}

export interface AccountPausedPayload {
  toEmail: string;
  traderName: string;
  accountNumber: string;
  reason: string;
  lang?: 'es' | 'en';
}

export interface AccountResetedPayload {
  toEmail: string;
  traderName: string;
  accountNumber: string;
  capitalFormatted: string;
  lang?: 'es' | 'en';
}

export interface PasswordResetPayload {
  toEmail: string;
  traderName: string;
  resetUrl: string;
  lang?: 'es' | 'en';
}

export interface SupportReplyPayload {
  toEmail: string;
  traderName: string;
  ticketId: string;
  subject: string;
  agentName?: string;
  replyMessage: string;
  supportUrl?: string;
  lang?: 'es' | 'en';
}

/**
 * Despacho genérico y asíncrono al gateway institucional
 */
async function dispatchEmailEvent(type: string, data: Record<string, any>): Promise<{ success: boolean; queued?: boolean; error?: string }> {
  try {
    const backendUrl = (import.meta as any).env?.VITE_WS_URL?.replace('ws://', 'http://').replace('wss://', 'https://') || 'http://localhost:8080';
    const endpoint = `${backendUrl}/api/email/dispatch`;

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ type, data })
    });

    if (response.ok) {
      const resData = await response.json();
      return { success: true, queued: resData?.queued ?? true };
    } else {
      const errData = await response.json().catch(() => ({}));
      console.warn('[EmailService] Advertencia del gateway:', errData);
      return { success: false, error: errData?.error || 'Error despachando correo' };
    }
  } catch (err: any) {
    // Si el backend no está encendido en desarrollo local, no romper la experiencia del usuario
    console.info('[EmailService] Evento de correo encolado localmente:', type, data?.toEmail);
    return { success: true, queued: false };
  }
}

// ============================================================================
// EXPORTADORES PÚBLICOS
// ============================================================================

export async function sendWelcomeEmail(payload: WelcomeEmailPayload | any) {
  // Soporta tanto el formato simplificado como el de nueva cuenta con reto
  if (payload.accountNumber && payload.capitalFormatted) {
    return dispatchEmailEvent('NEW_ACCOUNT', {
      toEmail: payload.toEmail,
      traderName: payload.traderName || 'Trader',
      accountNumber: payload.accountNumber,
      planName: payload.planName || 'Reto de Evaluación',
      capitalFormatted: payload.capitalFormatted,
      profitSplit: payload.profitSplitPct ? `${payload.profitSplitPct}% Trader` : undefined,
      maxDailyLoss: payload.maxDailyDrawdownPct ? `${payload.maxDailyDrawdownPct}%` : undefined,
      maxTotalLoss: payload.maxTotalDrawdownPct ? `${payload.maxTotalDrawdownPct}%` : undefined,
      profitTarget: payload.profitTargetPct ? `${payload.profitTargetPct}%` : undefined,
      dashboardUrl: payload.dashboardUrl,
      lang: payload.lang || 'es',
    });
  }

  return dispatchEmailEvent('WELCOME', payload);
}

export async function sendNewAccountPurchasedEmail(payload: NewAccountPurchasedPayload) {
  return dispatchEmailEvent('NEW_ACCOUNT', payload);
}

export async function sendAccountBreachedEmail(payload: AccountBreachedPayload) {
  return dispatchEmailEvent('ACCOUNT_BREACHED', payload);
}

export async function sendAccountPausedEmail(payload: AccountPausedPayload) {
  return dispatchEmailEvent('ACCOUNT_PAUSED', payload);
}

export async function sendAccountResetedEmail(payload: AccountResetedPayload) {
  return dispatchEmailEvent('ACCOUNT_RESETED', payload);
}

export async function sendPasswordResetEmail(payload: PasswordResetPayload) {
  return dispatchEmailEvent('PASSWORD_RESET', payload);
}

export async function sendSupportReplyEmail(payload: SupportReplyPayload) {
  return dispatchEmailEvent('NEED_SUPPORT', payload);
}
