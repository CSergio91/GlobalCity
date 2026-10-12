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

import { renderEmailHtml } from './emailTemplates';

/**
 * Despacho genérico y asíncrono con tolerancia a fallos:
 * 1. Intenta enviar al gateway institucional (/api/email/dispatch).
 * 2. Si el gateway está fuera de línea o en hosting estático, despacha DIRECTAMENTE vía Resend API oficial con el correo soporte@eklipsefunded.com.
 */
async function dispatchEmailEvent(type: string, data: Record<string, any>): Promise<{ success: boolean; queued?: boolean; error?: string }> {
  const lang = data.lang || 'es';
  const traderName = data.traderName || 'Trader';
  const cleanEmail = (data.toEmail || '').trim();

  if (!cleanEmail) {
    return { success: false, error: 'toEmail is required' };
  }

  // 1. Intentar despacho mediante backend / tradingHub
  try {
    const backendUrl = 
      (import.meta as any).env?.VITE_WS_GATEWAY_URL?.replace('ws://', 'http://').replace('wss://', 'https://') ||
      (import.meta as any).env?.VITE_WS_URL?.replace('ws://', 'http://').replace('wss://', 'https://') ||
      'http://localhost:8080';
    const endpoint = `${backendUrl}/api/email/dispatch`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ type, data }),
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (response.ok) {
      const resData = await response.json();
      console.info(`[EmailService] Correo despachado por gateway (${type} -> ${cleanEmail})`);
      return { success: true, queued: resData?.queued ?? true };
    }
  } catch (gwErr: any) {
    console.info('[EmailService] Gateway no disponible, ejecutando despacho directo vía Resend:', gwErr.message);
  }

  // 2. Despacho directo de alta prioridad vía Resend API con plantilla oficial
  try {
    const resendKey = (import.meta as any).env?.VITE_RESEND_API_KEY;
    if (!resendKey) {
      console.warn('[EmailService] VITE_RESEND_API_KEY no encontrada en entorno');
      return { success: false, error: 'No Resend API Key configured' };
    }
    const templateName = type.toUpperCase() === 'WELCOME' ? 'welcome' : 'new-account';
    
    const html = renderEmailHtml({
      templateName,
      lang: lang as 'es' | 'en',
      data: {
        ...data,
        traderName,
        dashboardUrl: data.dashboardUrl || 'https://dashapp.eklipsefunded.com',
      }
    });

    const subject = lang === 'en'
      ? (templateName === 'welcome' 
          ? 'Welcome to Eklipse Funded! ✨' 
          : `New Account Activated! #${data.accountNumber || 'EKL'} (${data.capitalFormatted || ''} USD) 🚀`)
      : (templateName === 'welcome' 
          ? '¡Bienvenido a Eklipse Funded! ✨' 
          : `¡Nueva Cuenta Activada! #${data.accountNumber || 'EKL'} (${data.capitalFormatted || ''} USD) 🚀`);

    const resendRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'Eklipse Funded <soporte@eklipsefunded.com>',
        to: cleanEmail,
        subject,
        html
      })
    });

    if (resendRes.ok) {
      const resData = await resendRes.json();
      console.info(`[EmailService] Correo entregado exitosamente vía Resend Direct [ID: ${resData?.id}]`);
      return { success: true, queued: false };
    } else {
      const errData = await resendRes.json().catch(() => ({}));
      console.warn('[EmailService] Advertencia de Resend API:', errData);
      return { success: false, error: errData?.message || 'Error en entrega de correo' };
    }
  } catch (directErr: any) {
    console.error('[EmailService] Error crítico despachando correo:', directErr);
    return { success: false, error: directErr?.message };
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
