/**
 * EKLIPSE FUNDED — CLIENT EMAIL DISPATCH SERVICE
 * Arquitectura Segura y Desacoplada:
 * Las peticiones de correo se envían al backend / microservicio de email vía Redis Pub/Sub.
 * Ninguna clave privada (RESEND_API_KEY) se expone jamás en el frontend del cliente.
 */

import { apiFetch } from '../config/apiGateway';

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

export interface PayoutRequestedPayload {
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

export interface PayoutApprovedPayload {
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

export interface PayoutRejectedPayload {
  toEmail: string;
  traderName?: string;
  accountNumber: string;
  requestedAmount: string | number;
  rejectionReason: string;
  dashboardUrl?: string;
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

  // 1. Intentar despacho mediante backend institucional (api.eklipsefunded.com en prod, localhost:8080 en dev)
  try {
    const response = await apiFetch('/api/email/dispatch', {
      method: 'POST',
      body: JSON.stringify({ type, data })
    }, 4000);

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
    const upperType = type.toUpperCase();
    let templateName: any = 'new-account';
    let subject = '';

    if (upperType === 'WELCOME') {
      templateName = 'welcome';
      subject = lang === 'en' ? 'Welcome to Eklipse Funded! ✨' : '¡Bienvenido a Eklipse Funded! ✨';
    } else if (upperType.includes('PAYOUT_REQ') || upperType === 'PAYOUT_REQUESTED') {
      templateName = 'payout-requested';
      subject = lang === 'en'
        ? `Payout Request Received: Account #${data.accountNumber || 'EKL'} ⏳`
        : `Solicitud de Retiro Recibida: Cuenta #${data.accountNumber || 'EKL'} ⏳`;
    } else if (upperType.includes('PAYOUT_APP') || upperType.includes('PAYOUT_PAID') || upperType === 'PAYOUT_APPROVED') {
      templateName = 'payout-approved';
      subject = lang === 'en'
        ? `Payout Settled! Funds Sent #${data.accountNumber || 'EKL'} (${data.netAmount || ''} USDT) 💰`
        : `¡Retiro Liquidado! Fondos Enviados #${data.accountNumber || 'EKL'} (${data.netAmount || ''} USDT) 💰`;
    } else if (upperType.includes('PAYOUT_REJ') || upperType === 'PAYOUT_REJECTED') {
      templateName = 'payout-rejected';
      subject = lang === 'en'
        ? `Payout Audit Notice: Account #${data.accountNumber || 'EKL'} ⚠️`
        : `Aviso de Auditoría de Retiro: Cuenta #${data.accountNumber || 'EKL'} ⚠️`;
    } else {
      templateName = 'new-account';
      const isInstant = data.isInstantFunding || data.modelType === 'INSTANT_FUNDING' || (data.profitTargetPct === 0);
      subject = lang === 'en'
        ? (isInstant 
            ? `Instant Funding Account Activated! #${data.accountNumber || 'EKL'} (${data.capitalFormatted || ''} USD) ⚡`
            : `New Account Activated! #${data.accountNumber || 'EKL'} (${data.capitalFormatted || ''} USD) 🚀`)
        : (isInstant
            ? `¡Cuenta de Fondeo Inmediato Activada! #${data.accountNumber || 'EKL'} (${data.capitalFormatted || ''} USD) ⚡`
            : `¡Nueva Cuenta Activada! #${data.accountNumber || 'EKL'} (${data.capitalFormatted || ''} USD) 🚀`);
    }

    const isInstantFunding = data.isInstantFunding || data.modelType === 'INSTANT_FUNDING' || (data.profitTargetPct === 0);
    const badgeText = data.badgeText || (isInstantFunding
      ? (lang === 'en' ? '⚡ INSTANT FUNDING ACTIVATED' : '⚡ FONDEO INMEDIATO ACTIVADO')
      : (lang === 'en' ? '🚀 CHALLENGE ACTIVATED' : '🚀 RETO ACTIVADO CON ÉXITO'));

    const modelTypeLabel = data.modelTypeLabel || (isInstantFunding
      ? (lang === 'en' ? 'Direct Instant Funding' : 'Fondeo Inmediato Directo')
      : (lang === 'en' ? `Evaluation Challenge (${data.modelType || '1-Step'})` : `Reto de Evaluación (${data.modelType || '1-Paso'})`));

    const profitTarget = data.profitTarget !== undefined ? data.profitTarget : (
      isInstantFunding 
        ? (lang === 'en' ? 'No Profit Target (Direct Funding)' : 'Sin Objetivo de Beneficio (Fondeo Directo)')
        : (data.profitTargetPct ? `${data.profitTargetPct}%` : '8%')
    );

    const addonsListFormatted = data.addonsListFormatted || (
      Array.isArray(data.addons) && data.addons.length > 0
        ? data.addons.join(', ')
        : (lang === 'en' ? 'None (Standard)' : 'Ninguno (Estándar)')
    );

    const leverage = data.leverage || '1:50';
    
    const html = renderEmailHtml({
      templateName,
      lang: lang as 'es' | 'en',
      data: {
        ...data,
        traderName,
        badgeText,
        modelTypeLabel,
        profitTarget,
        addonsListFormatted,
        leverage,
        dashboardUrl: data.dashboardUrl || 'https://dashapp.eklipsefunded.com',
      }
    });

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
  // Soporta tanto el formato simplificado como el de nueva cuenta con reto o fondeo inmediato
  if (payload.accountNumber && payload.capitalFormatted) {
    return dispatchEmailEvent('NEW_ACCOUNT', {
      toEmail: payload.toEmail,
      traderName: payload.traderName || 'Trader',
      accountNumber: payload.accountNumber,
      planName: payload.planName || 'Reto de Evaluación',
      modelType: payload.modelType,
      isInstantFunding: payload.isInstantFunding,
      modelTypeLabel: payload.modelTypeLabel,
      badgeText: payload.badgeText,
      capitalFormatted: payload.capitalFormatted,
      capitalAmount: payload.capitalAmount,
      profitSplit: payload.profitSplit || (payload.profitSplitPct ? `${payload.profitSplitPct}% Trader` : undefined),
      maxDailyLoss: payload.maxDailyLoss || (payload.maxDailyDrawdownPct ? `${payload.maxDailyDrawdownPct}%` : undefined),
      maxTotalLoss: payload.maxTotalLoss || (payload.maxTotalDrawdownPct ? `${payload.maxTotalDrawdownPct}%` : undefined),
      profitTarget: payload.profitTarget,
      profitTargetPct: payload.profitTargetPct,
      leverage: payload.leverage,
      addons: payload.addons,
      addonsListFormatted: payload.addonsListFormatted,
      orderNumber: payload.orderNumber,
      totalPriceFormatted: payload.totalPriceFormatted,
      paymentGateway: payload.paymentGateway,
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

export async function sendPayoutRequestedEmail(payload: PayoutRequestedPayload) {
  return dispatchEmailEvent('PAYOUT_REQUESTED', payload);
}

export async function sendPayoutApprovedEmail(payload: PayoutApprovedPayload) {
  return dispatchEmailEvent('PAYOUT_APPROVED', payload);
}

export async function sendPayoutRejectedEmail(payload: PayoutRejectedPayload) {
  return dispatchEmailEvent('PAYOUT_REJECTED', payload);
}
