/**
 * EKLIPSE FUNDED — INSTITUTIONAL EMAIL DELIVERY SERVICE & TEMPLATES
 * Colección oficial de plantillas de correo en tonalidades claras (Light Theme)
 * con diseño editorial optimizado para Retina (iPhone, Mac, Android, Outlook).
 * 
 * Cada correo incluye su banner WebP oficial con Pepe y el logotipo de Eklipse Funded,
 * tipografía nítida y la firma institucional al pie de cada comunicado.
 */

import { supabase } from '../lib/supabase';

// ============================================================================
// TIPOS Y PAYLOADS DE CORREO
// ============================================================================

export interface WelcomeEmailPayload {
  toEmail: string;
  traderName: string;
  accountNumber: string;
  planName: string;
  category: 'solar' | 'lunar';
  capitalFormatted: string;
  capitalAmount: number;
  maxDailyDrawdownPct: number;
  maxTotalDrawdownPct: number;
  profitTargetPct: number;
  profitSplitPct: number;
  leverage: string;
  orderNumber?: string;
  totalPriceFormatted?: string;
  paymentGateway?: string;
  dashboardUrl?: string;
}

export interface NewAccountPurchasedPayload {
  toEmail: string;
  traderName: string;
  accountNumber: string;
  orderId: string;
  planName: string;
  capitalFormatted: string;
  pricePaidFormatted: string;
  paymentMethod: string;
  category: 'solar' | 'lunar';
  maxDailyLoss: string;
  maxTotalLoss: string;
  profitTarget: string;
  profitSplit: string;
}

export interface AccountBreachedPayload {
  toEmail: string;
  traderName: string;
  accountNumber: string;
  planName: string;
  breachReason: string;
  breachValue: string;
  breachLimit: string;
  capitalFormatted: string;
  resetDiscountPct: number;
  resetUrl?: string;
}

export interface AccountPausedPayload {
  toEmail: string;
  traderName: string;
  accountNumber: string;
  reason: string;
  estimatedResumeTime?: string;
}

export interface AccountResetedPayload {
  toEmail: string;
  traderName: string;
  accountNumber: string;
  planName: string;
  capitalFormatted: string;
  resetDate: string;
}

export interface PasswordChangedPayload {
  toEmail: string;
  traderName: string;
  changeDate: string;
  ipAddress?: string;
  deviceInfo?: string;
}

export interface SupportReplyPayload {
  toEmail: string;
  traderName: string;
  ticketId: string;
  subject: string;
  agentName: string;
  replyMessage: string;
}

// ============================================================================
// COMPONENTE UNIVERSAL: FIRMA INSTITUCIONAL AL PIE (LIGHT THEME)
// ============================================================================

function renderInstitutionalEmailFooter(): string {
  const currentYear = new Date().getFullYear();
  return `
    <!-- FIRMA INSTITUCIONAL AL FINAL -->
    <tr>
      <td style="padding: 24px 32px 28px 32px; background-color: #F8FAFC; border-top: 1px solid #E2E8F0;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td valign="top" style="padding-bottom: 16px;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <!-- Monograma / Emblema -->
                  <td style="vertical-align: middle; padding-right: 14px;">
                    <div style="width: 44px; height: 44px; border-radius: 12px; background-color: #0F172A; text-align: center; line-height: 44px;">
                      <span style="color: #F59E0B; font-size: 22px; font-weight: 800;">◐</span>
                    </div>
                  </td>
                  <!-- Identidad del remitente -->
                  <td style="vertical-align: middle;">
                    <div style="color: #0F172A; font-size: 14px; font-weight: 800; letter-spacing: -0.2px;">
                      Equipo de Riesgo y Operaciones
                    </div>
                    <div style="color: #64748B; font-size: 12px; font-weight: 600;">
                      Eklipse Funded · Proprietary Trading Architecture
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Canales oficiales de asistencia -->
          <tr>
            <td style="padding: 12px 0 16px 0; border-top: 1px solid #E2E8F0; border-bottom: 1px solid #E2E8F0;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="color: #475569; font-size: 12.5px; line-height: 20px;">
                    ¿Preguntas o asistencia? Contáctanos de inmediato:
                  </td>
                  <td align="right" style="white-space: nowrap;">
                    <a 
                      href="https://t.me/EklipseFunded_bot" 
                      target="_blank" 
                      style="display: inline-block; padding: 7px 14px; background-color: #0284C7; color: #FFFFFF; font-size: 11.5px; font-weight: 700; border-radius: 8px; text-decoration: none; font-family: monospace;"
                    >
                      💬 Telegram Bot &rarr;
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Enlaces de navegación y aviso legal -->
          <tr>
            <td style="padding-top: 16px; text-align: center;">
              <div style="margin-bottom: 10px;">
                <a href="https://eklipsefunded.com" target="_blank" style="color: #64748B; font-size: 12px; font-weight: 600; text-decoration: none; margin: 0 10px;">Web Oficial</a>
                <span style="color: #CBD5E1;">•</span>
                <a href="https://eklipsefunded.com/dashboard" target="_blank" style="color: #64748B; font-size: 12px; font-weight: 600; text-decoration: none; margin: 0 10px;">Dashboard</a>
                <span style="color: #CBD5E1;">•</span>
                <a href="mailto:soporte@eklipsefunded.com" style="color: #64748B; font-size: 12px; font-weight: 600; text-decoration: none; margin: 0 10px;">soporte@eklipsefunded.com</a>
              </div>
              <p style="margin: 0 0 6px 0; color: #94A3B8; font-size: 11px; line-height: 16px;">
                Este correo electrónico y cualquier archivo adjunto son confidenciales y están dirigidos exclusivamente al destinatario registrado. Eklipse Funded opera como una empresa de evaluación y fondeo de trading propio.
              </p>
              <p style="margin: 0; color: #94A3B8; font-size: 11px; font-weight: 600;">
                &copy; ${currentYear} Eklipse Funded. Tu disciplina, nuestro capital.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  `;
}

// ============================================================================
// BASE HTML ENVOLVENTE (LIGHT THEME)
// ============================================================================

function wrapEmailContainer(title: string, bannerUrl: string, bannerAlt: string, bodyContentHtml: string): string {
  return `<!DOCTYPE html>
<html lang="es" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="light">
  <meta name="supported-color-schemes" content="light">
  <title>${title}</title>
  <style>
    :root { color-scheme: light; }
    body {
      margin: 0;
      padding: 0;
      background-color: #F8FAFC !important;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #0F172A;
      -webkit-font-smoothing: antialiased;
    }
    table { border-collapse: separate; }
    a { text-decoration: none; }
  </style>
</head>
<body style="margin: 0; padding: 24px 12px; background-color: #F8FAFC;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #F8FAFC;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; background-color: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 25px rgba(15, 23, 42, 0.05);">
          
          <!-- Banner WebP Oficial con Pepe -->
          <tr>
            <td style="padding: 0; background-color: #000000; text-align: center;">
              <img 
                src="${bannerUrl}" 
                alt="${bannerAlt}" 
                width="600" 
                style="width: 100%; max-width: 600px; height: auto; display: block; border-top-left-radius: 20px; border-top-right-radius: 20px;"
              />
            </td>
          </tr>

          <!-- Contenido del Correo -->
          ${bodyContentHtml}

          <!-- Pie y Firma Oficial -->
          ${renderInstitutionalEmailFooter()}

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// ============================================================================
// 1. PLANTILLA: BIENVENIDA AL TRADER (welcome-to-eklipse-funded.webp)
// ============================================================================

export function generateInstitutionalWelcomeEmailHtml(data: WelcomeEmailPayload): string {
  const bannerUrl = 'https://eklipsefunded.com/emails/welcome-to-eklipse-funded.webp';
  const dashboardUrl = 'https://eklipsefunded.com/dashboard';
  const categoryColor = data.category === 'lunar' ? '#7C3AED' : '#D97706';

  const bodyContent = `
    <!-- Saludo Cálido -->
    <tr>
      <td style="padding: 28px 32px 12px 32px;">
        <h2 style="margin: 0 0 12px 0; color: #0F172A; font-size: 21px; font-weight: 800; letter-spacing: -0.4px;">
          ¡Hola, ${data.traderName}! 🎉
        </h2>
        <p style="margin: 0 0 16px 0; color: #334155; font-size: 14.5px; line-height: 24px;">
          ¡Te damos una muy cálida bienvenida a la familia de <strong>Eklipse Funded</strong>! Tu cuenta ya está lista para que empieces a demostrar tu talento en los mercados y consigas tu capital fondeado.
        </p>
        <p style="margin: 0; color: #475569; font-size: 13.5px; line-height: 22px;">
          Queremos verte triunfar. A continuación tienes el resumen de tu cuenta y las metas claras para superar tu reto:
        </p>
      </td>
    </tr>

    <!-- Tarjeta 1: Cuenta de Trading -->
    <tr>
      <td style="padding: 12px 32px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 14px; overflow: hidden;">
          <tr>
            <td style="padding: 14px 18px; border-bottom: 1px solid #F1F5F9; color: #64748B; font-size: 13px;">Número de Cuenta</td>
            <td align="right" style="padding: 14px 18px; border-bottom: 1px solid #F1F5F9; color: #0F172A; font-size: 14px; font-weight: 700; font-family: monospace;">${data.accountNumber}</td>
          </tr>
          <tr>
            <td style="padding: 14px 18px; border-bottom: 1px solid #F1F5F9; color: #64748B; font-size: 13px;">Capital Asignado</td>
            <td align="right" style="padding: 14px 18px; border-bottom: 1px solid #F1F5F9; color: #059669; font-size: 16px; font-weight: 800; font-family: monospace;">${data.capitalFormatted} USD</td>
          </tr>
          <tr>
            <td style="padding: 14px 18px; color: #64748B; font-size: 13px;">Tu Reparto de Ganancias</td>
            <td align="right" style="padding: 14px 18px; color: ${categoryColor}; font-size: 14px; font-weight: 800; font-family: monospace;">${data.profitSplitPct}% Trader</td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- Tarjeta 2: Reglas Clave -->
    <tr>
      <td style="padding: 8px 32px 18px 32px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 14px; overflow: hidden;">
          <tr>
            <td colspan="2" style="padding: 12px 18px; background-color: #F1F5F9; border-bottom: 1px solid #E2E8F0;">
              <strong style="color: #0F172A; font-size: 12.5px; font-family: monospace; letter-spacing: 0.5px;">
                ⚡ REGLAS DEL RETO
              </strong>
            </td>
          </tr>
          <tr>
            <td style="padding: 11px 18px; border-bottom: 1px solid #F1F5F9; color: #475569; font-size: 13px;">📉 Pérdida Máxima Diaria</td>
            <td align="right" style="padding: 11px 18px; border-bottom: 1px solid #F1F5F9; color: #DC2626; font-size: 13px; font-weight: 700; font-family: monospace;">${data.maxDailyDrawdownPct}%</td>
          </tr>
          <tr>
            <td style="padding: 11px 18px; border-bottom: 1px solid #F1F5F9; color: #475569; font-size: 13px;">🛑 Pérdida Máxima Total</td>
            <td align="right" style="padding: 11px 18px; border-bottom: 1px solid #F1F5F9; color: #DC2626; font-size: 13px; font-weight: 700; font-family: monospace;">${data.maxTotalDrawdownPct}%</td>
          </tr>
          <tr>
            <td style="padding: 11px 18px; border-bottom: 1px solid #F1F5F9; color: #475569; font-size: 13px;">🎯 Meta de Ganancias</td>
            <td align="right" style="padding: 11px 18px; border-bottom: 1px solid #F1F5F9; color: #059669; font-size: 13px; font-weight: 700; font-family: monospace;">${data.profitTargetPct}%</td>
          </tr>
          <tr>
            <td style="padding: 11px 18px; color: #475569; font-size: 13px;">⏱️ Duración Mínima por Trade</td>
            <td align="right" style="padding: 11px 18px; color: #0F172A; font-size: 13px; font-weight: 600;">10 segundos</td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- Botón de Acción -->
    <tr>
      <td align="center" style="padding: 6px 32px 28px 32px;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td align="center" style="border-radius: 14px; background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%); box-shadow: 0 6px 20px rgba(217, 119, 6, 0.3);">
              <a href="${dashboardUrl}" target="_blank" style="display: inline-block; padding: 16px 38px; font-size: 14.5px; font-weight: 800; color: #0F172A; text-decoration: none; font-family: monospace; letter-spacing: 0.5px; text-transform: uppercase;">
                ACCEDER A MI DASHBOARD &rarr;
              </a>
            </td>
          </tr>
        </table>
        <p style="margin: 12px 0 0 0; color: #94A3B8; font-size: 12px;">
          Puedes iniciar sesión directamente con tu correo o con tu cuenta de Google.
        </p>
      </td>
    </tr>
  `;

  return wrapEmailContainer(
    `¡Bienvenido a Eklipse Funded! Tu Cuenta #${data.accountNumber}`,
    bannerUrl,
    'Welcome to Eklipse Funded!',
    bodyContent
  );
}

// ============================================================================
// 2. PLANTILLA: NUEVA CUENTA COMPRADA / ACTIVADA (new-account-purchased.webp)
// ============================================================================

export function generateNewAccountPurchasedEmailHtml(data: NewAccountPurchasedPayload): string {
  const bannerUrl = 'https://eklipsefunded.com/emails/new-account-purchased.webp';
  const dashboardUrl = 'https://eklipsefunded.com/dashboard';

  const bodyContent = `
    <tr>
      <td style="padding: 28px 32px 12px 32px;">
        <h2 style="margin: 0 0 12px 0; color: #0F172A; font-size: 21px; font-weight: 800; letter-spacing: -0.4px;">
          ¡Nueva Cuenta Activada! 🚀
        </h2>
        <p style="margin: 0 0 16px 0; color: #334155; font-size: 14.5px; line-height: 24px;">
          Hola, <strong>${data.traderName}</strong>. Hemos confirmado el pago de tu evaluación <strong>${data.planName}</strong>. Tu cuenta de trading ya ha sido aprovisionada con el balance completo y las credenciales listas.
        </p>
      </td>
    </tr>

    <!-- Detalle de la Orden y Cuenta -->
    <tr>
      <td style="padding: 10px 32px 16px 32px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 14px; overflow: hidden;">
          <tr>
            <td style="padding: 13px 18px; border-bottom: 1px solid #F1F5F9; color: #64748B; font-size: 13px;">Número de Cuenta</td>
            <td align="right" style="padding: 13px 18px; border-bottom: 1px solid #F1F5F9; color: #0F172A; font-size: 14px; font-weight: 700; font-family: monospace;">${data.accountNumber}</td>
          </tr>
          <tr>
            <td style="padding: 13px 18px; border-bottom: 1px solid #F1F5F9; color: #64748B; font-size: 13px;">Capital Asignado</td>
            <td align="right" style="padding: 13px 18px; border-bottom: 1px solid #F1F5F9; color: #059669; font-size: 15px; font-weight: 800; font-family: monospace;">${data.capitalFormatted} USD</td>
          </tr>
          <tr>
            <td style="padding: 13px 18px; border-bottom: 1px solid #F1F5F9; color: #64748B; font-size: 13px;">Referencia / Orden</td>
            <td align="right" style="padding: 13px 18px; border-bottom: 1px solid #F1F5F9; color: #475569; font-size: 13px; font-family: monospace;">#${data.orderId}</td>
          </tr>
          <tr>
            <td style="padding: 13px 18px; color: #64748B; font-size: 13px;">Importe Abonado</td>
            <td align="right" style="padding: 13px 18px; color: #0F172A; font-size: 13.5px; font-weight: 700;">${data.pricePaidFormatted} (${data.paymentMethod})</td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- Reglas del Reto -->
    <tr>
      <td style="padding: 0 32px 20px 32px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 14px;">
          <tr>
            <td colspan="2" style="padding: 11px 18px; background-color: #F1F5F9; border-bottom: 1px solid #E2E8F0; font-size: 12px; font-weight: 700; font-family: monospace; color: #0F172A;">
              🎯 PARÁMETROS OPERATIVOS
            </td>
          </tr>
          <tr>
            <td style="padding: 10px 18px; border-bottom: 1px solid #F1F5F9; color: #475569; font-size: 13px;">Pérdida Diaria Máxima</td>
            <td align="right" style="padding: 10px 18px; border-bottom: 1px solid #F1F5F9; color: #DC2626; font-weight: 700; font-family: monospace;">${data.maxDailyLoss}</td>
          </tr>
          <tr>
            <td style="padding: 10px 18px; border-bottom: 1px solid #F1F5F9; color: #475569; font-size: 13px;">Pérdida Máxima Total</td>
            <td align="right" style="padding: 10px 18px; border-bottom: 1px solid #F1F5F9; color: #DC2626; font-weight: 700; font-family: monospace;">${data.maxTotalLoss}</td>
          </tr>
          <tr>
            <td style="padding: 10px 18px; color: #475569; font-size: 13px;">Meta de Beneficio</td>
            <td align="right" style="padding: 10px 18px; color: #059669; font-weight: 700; font-family: monospace;">${data.profitTarget}</td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- Botón -->
    <tr>
      <td align="center" style="padding: 4px 32px 28px 32px;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td align="center" style="border-radius: 14px; background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%);">
              <a href="${dashboardUrl}" target="_blank" style="display: inline-block; padding: 15px 36px; font-size: 14px; font-weight: 800; color: #0F172A; text-decoration: none; font-family: monospace; letter-spacing: 0.5px;">
                COMENZAR EVALUACIÓN &rarr;
              </a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  `;

  return wrapEmailContainer(
    `Nueva Cuenta Activada #${data.accountNumber} — Eklipse Funded`,
    bannerUrl,
    'New Account Purchased',
    bodyContent
  );
}

// ============================================================================
// 3. PLANTILLA: CUENTA BREACHED / INFRACCIÓN (account-breached.webp)
// ============================================================================

export function generateAccountBreachedEmailHtml(data: AccountBreachedPayload): string {
  const bannerUrl = 'https://eklipsefunded.com/emails/account-breached.webp';
  const resetUrl = data.resetUrl || 'https://eklipsefunded.com/dashboard';

  const bodyContent = `
    <tr>
      <td style="padding: 28px 32px 12px 32px;">
        <h2 style="margin: 0 0 12px 0; color: #991B1B; font-size: 21px; font-weight: 800; letter-spacing: -0.4px;">
          Límite de Riesgo Alcanzado 🛑
        </h2>
        <p style="margin: 0 0 16px 0; color: #334155; font-size: 14.5px; line-height: 24px;">
          Hola, <strong>${data.traderName}</strong>. Nuestro centinela automatizado ha detectado que tu cuenta <strong>${data.accountNumber}</strong> ha alcanzado uno de los límites de riesgo del programa.
        </p>
        <p style="margin: 0; color: #475569; font-size: 13.5px; line-height: 22px;">
          Sabemos que el trading profesional está lleno de lecciones. Como dice nuestra filosofía: <em>tu disciplina se forja en cada intento</em>.
        </p>
      </td>
    </tr>

    <!-- Detalle de la Infracción -->
    <tr>
      <td style="padding: 12px 32px 18px 32px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #FEF2F2; border: 1px solid #FECACA; border-radius: 14px; overflow: hidden;">
          <tr>
            <td style="padding: 13px 18px; border-bottom: 1px solid #FEE2E2; color: #991B1B; font-size: 13px;">Regla Afectada</td>
            <td align="right" style="padding: 13px 18px; border-bottom: 1px solid #FEE2E2; color: #991B1B; font-size: 13.5px; font-weight: 800; font-family: monospace;">${data.breachReason}</td>
          </tr>
          <tr>
            <td style="padding: 13px 18px; border-bottom: 1px solid #FEE2E2; color: #7F1D1D; font-size: 13px;">Pérdida Registrada</td>
            <td align="right" style="padding: 13px 18px; border-bottom: 1px solid #FEE2E2; color: #DC2626; font-size: 14px; font-weight: 800; font-family: monospace;">${data.breachValue}</td>
          </tr>
          <tr>
            <td style="padding: 13px 18px; color: #7F1D1D; font-size: 13px;">Límite Permitido</td>
            <td align="right" style="padding: 13px 18px; color: #475569; font-size: 13px; font-family: monospace;">${data.breachLimit}</td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- Opción de Reset con Descuento -->
    <tr>
      <td style="padding: 0 32px 24px 32px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 14px; padding: 18px;">
          <tr>
            <td>
              <h4 style="margin: 0 0 6px 0; color: #0F172A; font-size: 14.5px; font-weight: 800;">
                💡 No te detengas: Resetea con ${data.resetDiscountPct}% de Descuento
              </h4>
              <p style="margin: 0 0 14px 0; color: #64748B; font-size: 13px; line-height: 20px;">
                Como trader activo de Eklipse, tienes acceso a un restablecimiento inmediato de tu cuenta sin pagar el precio completo.
              </p>
              <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="border-radius: 10px; background-color: #0F172A;">
                    <a href="${resetUrl}" target="_blank" style="display: inline-block; padding: 12px 24px; color: #FFFFFF; font-size: 13px; font-weight: 700; font-family: monospace; text-decoration: none;">
                      REINICIAR CUENTA (${data.resetDiscountPct}% OFF) &rarr;
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  `;

  return wrapEmailContainer(
    `Alerta de Riesgo: Cuenta #${data.accountNumber} Breached — Eklipse Funded`,
    bannerUrl,
    'Account Breached',
    bodyContent
  );
}

// ============================================================================
// 4. PLANTILLA: CUENTA PAUSADA (account-paused.webp)
// ============================================================================

export function generateAccountPausedEmailHtml(data: AccountPausedPayload): string {
  const bannerUrl = 'https://eklipsefunded.com/emails/account-paused.webp';
  const dashboardUrl = 'https://eklipsefunded.com/dashboard';

  const bodyContent = `
    <tr>
      <td style="padding: 28px 32px 14px 32px;">
        <h2 style="margin: 0 0 12px 0; color: #0F172A; font-size: 21px; font-weight: 800; letter-spacing: -0.4px;">
          Tu Cuenta Está en Pausa Temporal ⏸️
        </h2>
        <p style="margin: 0 0 16px 0; color: #334155; font-size: 14.5px; line-height: 24px;">
          Hola, <strong>${data.traderName}</strong>. Te informamos que la operativa de tu cuenta <strong>${data.accountNumber}</strong> ha sido pausada de forma temporal.
        </p>
        <div style="background-color: #FFFBEB; border: 1px solid #FDE68A; border-radius: 12px; padding: 16px; margin-bottom: 18px;">
          <strong style="color: #92400E; font-size: 13px; font-family: monospace;">MOTIVO DE LA PAUSA:</strong>
          <p style="margin: 6px 0 0 0; color: #78350F; font-size: 13.5px; line-height: 21px;">
            ${data.reason}
          </p>
        </div>
        <p style="margin: 0; color: #475569; font-size: 13.5px; line-height: 22px;">
          Tus métricas, balance y posición se encuentran totalmente resguardados. Tan pronto concluya el período de pausa, recibirás un aviso automático y tu operativa se reanudará con normalidad.
        </p>
      </td>
    </tr>

    <tr>
      <td align="center" style="padding: 8px 32px 28px 32px;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td align="center" style="border-radius: 12px; background-color: #0F172A;">
              <a href="${dashboardUrl}" target="_blank" style="display: inline-block; padding: 14px 32px; font-size: 13.5px; font-weight: 800; color: #FFFFFF; text-decoration: none; font-family: monospace;">
                VER ESTADO EN MI DASHBOARD &rarr;
              </a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  `;

  return wrapEmailContainer(
    `Tu Cuenta #${data.accountNumber} Está en Pausa Temporal — Eklipse Funded`,
    bannerUrl,
    'Account Paused',
    bodyContent
  );
}

// ============================================================================
// 5. PLANTILLA: CUENTA RESETEADA / REINICIADA (account-reseted.webp)
// ============================================================================

export function generateAccountResetedEmailHtml(data: AccountResetedPayload): string {
  const bannerUrl = 'https://eklipsefunded.com/emails/account-reseted.webp';
  const dashboardUrl = 'https://eklipsefunded.com/dashboard';

  const bodyContent = `
    <tr>
      <td style="padding: 28px 32px 14px 32px;">
        <h2 style="margin: 0 0 12px 0; color: #0F172A; font-size: 21px; font-weight: 800; letter-spacing: -0.4px;">
          ¡Tu Cuenta Ha Sido Reseteada! 🔄
        </h2>
        <p style="margin: 0 0 16px 0; color: #334155; font-size: 14.5px; line-height: 24px;">
          Hola, <strong>${data.traderName}</strong>. Confirmamos que tu cuenta <strong>${data.accountNumber}</strong> (${data.planName}) ha sido restablecida al 100% de su capital inicial.
        </p>
        <p style="margin: 0; color: #475569; font-size: 13.5px; line-height: 22px;">
          Tus métricas de drawdown se han reiniciado a cero. Estás completamente listo para ejecutar tu plan de trading con disciplina renovada.
        </p>
      </td>
    </tr>

    <!-- Tarjeta de Métricas Restauradas -->
    <tr>
      <td style="padding: 10px 32px 18px 32px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 14px; overflow: hidden;">
          <tr>
            <td style="padding: 13px 18px; border-bottom: 1px solid #F1F5F9; color: #64748B; font-size: 13px;">Capital Restaurado</td>
            <td align="right" style="padding: 13px 18px; border-bottom: 1px solid #F1F5F9; color: #059669; font-size: 16px; font-weight: 800; font-family: monospace;">${data.capitalFormatted} USD</td>
          </tr>
          <tr>
            <td style="padding: 13px 18px; border-bottom: 1px solid #F1F5F9; color: #64748B; font-size: 13px;">Drawdown Actual</td>
            <td align="right" style="padding: 13px 18px; border-bottom: 1px solid #F1F5F9; color: #059669; font-size: 14px; font-weight: 700; font-family: monospace;">0.00% (Limpio)</td>
          </tr>
          <tr>
            <td style="padding: 13px 18px; color: #64748B; font-size: 13px;">Fecha de Activación</td>
            <td align="right" style="padding: 13px 18px; color: #475569; font-size: 13px; font-family: monospace;">${data.resetDate}</td>
          </tr>
        </table>
      </td>
    </tr>

    <tr>
      <td align="center" style="padding: 6px 32px 28px 32px;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td align="center" style="border-radius: 14px; background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%);">
              <a href="${dashboardUrl}" target="_blank" style="display: inline-block; padding: 15px 36px; font-size: 14px; font-weight: 800; color: #0F172A; text-decoration: none; font-family: monospace; letter-spacing: 0.5px;">
                TRILOGÍA DE TRADING &rarr;
              </a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  `;

  return wrapEmailContainer(
    `Cuenta #${data.accountNumber} Reseteada Exitosamente — Eklipse Funded`,
    bannerUrl,
    'Account Reseted',
    bodyContent
  );
}

// ============================================================================
// 6. PLANTILLA: CAMBIO DE CONTRASEÑA (change-password.webp)
// ============================================================================

export function generatePasswordChangedEmailHtml(data: PasswordChangedPayload): string {
  const bannerUrl = 'https://eklipsefunded.com/emails/change-password.webp';
  const loginUrl = 'https://eklipsefunded.com/dashboard';

  const bodyContent = `
    <tr>
      <td style="padding: 28px 32px 14px 32px;">
        <h2 style="margin: 0 0 12px 0; color: #0F172A; font-size: 21px; font-weight: 800; letter-spacing: -0.4px;">
          Contraseña Actualizada con Éxito 🔒
        </h2>
        <p style="margin: 0 0 16px 0; color: #334155; font-size: 14.5px; line-height: 24px;">
          Hola, <strong>${data.traderName}</strong>. Te confirmamos que la contraseña de acceso a tu cuenta de Eklipse Funded ha sido modificada correctamente.
        </p>
        
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 12px; margin-bottom: 20px;">
          <tr>
            <td style="padding: 12px 18px; border-bottom: 1px solid #F1F5F9; color: #64748B; font-size: 13px;">Fecha del cambio</td>
            <td align="right" style="padding: 12px 18px; border-bottom: 1px solid #F1F5F9; color: #0F172A; font-weight: 700; font-family: monospace;">${data.changeDate}</td>
          </tr>
          ${data.ipAddress ? `
          <tr>
            <td style="padding: 12px 18px; color: #64748B; font-size: 13px;">Dirección IP</td>
            <td align="right" style="padding: 12px 18px; color: #475569; font-family: monospace;">${data.ipAddress}</td>
          </tr>` : ''}
        </table>

        <div style="background-color: #FEF2F2; border: 1px solid #FECACA; border-radius: 12px; padding: 14px; margin-bottom: 18px;">
          <p style="margin: 0; color: #991B1B; font-size: 12.5px; line-height: 19px;">
            ⚠️ <strong>¿No reconoces esta actividad?</strong> Si no realizaste este cambio, ponte en contacto con nuestro equipo de seguridad de inmediato escribiendo a <a href="mailto:soporte@eklipsefunded.com" style="color: #DC2626; font-weight: 700;">soporte@eklipsefunded.com</a> o mediante nuestro bot de Telegram.
          </p>
        </div>
      </td>
    </tr>

    <tr>
      <td align="center" style="padding: 4px 32px 28px 32px;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td align="center" style="border-radius: 12px; background-color: #0F172A;">
              <a href="${loginUrl}" target="_blank" style="display: inline-block; padding: 14px 34px; font-size: 13.5px; font-weight: 800; color: #FFFFFF; text-decoration: none; font-family: monospace;">
                INICIAR SESIÓN CON MI NUEVA CLAVE &rarr;
              </a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  `;

  return wrapEmailContainer(
    'Tu Contraseña Ha Sido Actualizada — Eklipse Funded',
    bannerUrl,
    'Change Password',
    bodyContent
  );
}

// ============================================================================
// 7. PLANTILLA: SOPORTE Y ATENCIÓN (need-support.webp)
// ============================================================================

export function generateSupportReplyEmailHtml(data: SupportReplyPayload): string {
  const bannerUrl = 'https://eklipsefunded.com/emails/need-support.webp';

  const bodyContent = `
    <tr>
      <td style="padding: 28px 32px 14px 32px;">
        <div style="display: inline-block; padding: 4px 10px; background-color: #E0F2FE; color: #0369A1; font-size: 11.5px; font-weight: 800; border-radius: 6px; font-family: monospace; margin-bottom: 12px;">
          TICKET #${data.ticketId}
        </div>
        <h2 style="margin: 0 0 12px 0; color: #0F172A; font-size: 21px; font-weight: 800; letter-spacing: -0.4px;">
          ${data.subject}
        </h2>
        <p style="margin: 0 0 16px 0; color: #334155; font-size: 14.5px; line-height: 24px;">
          Hola, <strong>${data.traderName}</strong>. Nuestro especialista <strong>${data.agentName}</strong> ha revisado tu solicitud y te deja la siguiente respuesta:
        </p>

        <!-- Mensaje de Respuesta -->
        <div style="background-color: #F8FAFC; border-left: 4px solid #0284C7; border-radius: 0 12px 12px 0; padding: 18px 20px; margin-bottom: 22px;">
          <p style="margin: 0; color: #1E293B; font-size: 14px; line-height: 23px; white-space: pre-line;">
            ${data.replyMessage}
          </p>
        </div>

        <p style="margin: 0 0 8px 0; color: #64748B; font-size: 13px; line-height: 20px;">
          Para responder a este mensaje o añadir información complementaria, puedes responder directamente a este correo o escribir a nuestro canal prioritario en Telegram.
        </p>
      </td>
    </tr>

    <tr>
      <td align="center" style="padding: 6px 32px 28px 32px;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td align="center" style="border-radius: 12px; background-color: #0284C7;">
              <a href="https://t.me/EklipseFunded_bot" target="_blank" style="display: inline-block; padding: 14px 32px; font-size: 13.5px; font-weight: 800; color: #FFFFFF; text-decoration: none; font-family: monospace;">
                CONTINUAR EN TELEGRAM (@EklipseFunded_bot) &rarr;
              </a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  `;

  return wrapEmailContainer(
    `Respuesta a Ticket #${data.ticketId}: ${data.subject} — Eklipse Funded`,
    bannerUrl,
    'Need Support?',
    bodyContent
  );
}

// ============================================================================
// MOTOR DE DESPACHO GENERAL (RESEND API & SUPABASE EDGE FUNCTION)
// ============================================================================

async function dispatchEmail(toEmail: string, subject: string, htmlContent: string): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const resendApiKey = (import.meta as any).env?.VITE_RESEND_API_KEY || (typeof process !== 'undefined' ? process.env?.RESEND_API_KEY : '') || '';
    
    if (!resendApiKey) {
      console.warn('[EmailService] VITE_RESEND_API_KEY no configurada en variables de entorno.');
      return { success: true };
    }

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'Eklipse Funded <soporte@eklipsefunded.com>',
        to: toEmail,
        subject: subject,
        html: htmlContent
      })
    });

    const resData = await response.json();
    if (resData?.id) {
      console.info(`[EmailService] Correo entregado exitosamente a ${toEmail}: ${resData.id}`);
      return { success: true, messageId: resData.id };
    } else {
      console.warn('[EmailService] Advertencia al despachar por Resend:', resData);
      return { success: false, error: resData?.message || 'Error de entrega' };
    }
  } catch (err: any) {
    console.error('[EmailService] Error crítico despachando correo:', err?.message);
    return { success: false, error: err?.message };
  }
}

// Exportadores de despacho
export async function sendWelcomeEmail(payload: WelcomeEmailPayload) {
  const html = generateInstitutionalWelcomeEmailHtml(payload);
  return dispatchEmail(payload.toEmail, `¡Bienvenido a Eklipse Funded! Tu Cuenta #${payload.accountNumber} Está Lista 🎉`, html);
}

export async function sendNewAccountPurchasedEmail(payload: NewAccountPurchasedPayload) {
  const html = generateNewAccountPurchasedEmailHtml(payload);
  return dispatchEmail(payload.toEmail, `¡Nueva Cuenta Activada! #${payload.accountNumber} (${payload.capitalFormatted} USD) 🚀`, html);
}

export async function sendAccountBreachedEmail(payload: AccountBreachedPayload) {
  const html = generateAccountBreachedEmailHtml(payload);
  return dispatchEmail(payload.toEmail, `Aviso de Gestión de Riesgo: Cuenta #${payload.accountNumber} Breached 🛑`, html);
}

export async function sendAccountPausedEmail(payload: AccountPausedPayload) {
  const html = generateAccountPausedEmailHtml(payload);
  return dispatchEmail(payload.toEmail, `Tu Cuenta #${payload.accountNumber} Ha Sido Pausada Temporalmente ⏸️`, html);
}

export async function sendAccountResetedEmail(payload: AccountResetedPayload) {
  const html = generateAccountResetedEmailHtml(payload);
  return dispatchEmail(payload.toEmail, `¡Tu Cuenta #${payload.accountNumber} Ha Sido Reseteada! Lista para Operar 🔄`, html);
}

export async function sendPasswordChangedEmail(payload: PasswordChangedPayload) {
  const html = generatePasswordChangedEmailHtml(payload);
  return dispatchEmail(payload.toEmail, 'Seguridad Eklipse: Tu Contraseña Ha Sido Actualizada 🔒', html);
}

export async function sendSupportReplyEmail(payload: SupportReplyPayload) {
  const html = generateSupportReplyEmailHtml(payload);
  return dispatchEmail(payload.toEmail, `Ticket #${payload.ticketId}: ${payload.subject} — Soporte Eklipse`, html);
}
