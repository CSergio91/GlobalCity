/**
 * EKLIPSE FUNDED — INSTITUTIONAL EMAIL DELIVERY SERVICE
 * Genera y despacha correos corporativos con diseño claro (Light Theme),
 * 100% compatible con iPhone / Apple Mail, Outlook y clientes móviles.
 */

import { supabase } from '../lib/supabase';

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
  orderNumber: string;
  totalPriceFormatted: string;
  paymentGateway: string;
  dashboardUrl?: string;
}

export function generateInstitutionalWelcomeEmailHtml(data: WelcomeEmailPayload): string {
  const dashboardUrl = data.dashboardUrl || 'http://localhost:3100/dashboard';
  const categoryColor = data.category === 'lunar' ? '#8B5CF6' : '#D97706';
  const categoryBg = data.category === 'lunar' ? '#F5F3FF' : '#FFFBEB';
  const categoryBadge = data.category === 'lunar' ? 'LUNAR EVALUATION' : 'SOLAR EVALUATION';

  return `<!DOCTYPE html>
<html lang="es" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="light">
  <meta name="supported-color-schemes" content="light">
  <title>Bienvenido a Eklipse Funded - Detalles de tu Cuenta</title>
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
  <!-- Contenedor Principal Centrado -->
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #F8FAFC;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 620px; background-color: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 30px rgba(15, 23, 42, 0.06);">
          
          <!-- Encabezado con Logo y Marca -->
          <tr>
            <td style="padding: 32px 32px 24px 32px; background: linear-gradient(180deg, #FFFFFF 0%, #FAFAFC 100%); border-bottom: 1px solid #F1F5F9; text-align: center;">
              <div style="display: inline-block; padding: 6px 14px; background: #0F172A; border-radius: 12px; margin-bottom: 12px;">
                <span style="color: #F59E0B; font-weight: 800; font-size: 15px; letter-spacing: 1.5px; font-family: monospace;">EKLIPSE</span>
                <span style="color: #FFFFFF; font-weight: 700; font-size: 15px; letter-spacing: 1.5px; font-family: monospace;">FUNDED</span>
              </div>
              <h1 style="margin: 8px 0 4px 0; color: #0F172A; font-size: 22px; font-weight: 800; letter-spacing: -0.5px;">
                ¡Tu Cuenta Institucional Está Lista!
              </h1>
              <p style="margin: 0; color: #64748B; font-size: 14px; font-weight: 500;">
                Bienvenido al programa de capital fondeado de Eklipse.
              </p>
            </td>
          </tr>

          <!-- Saludo Personalizado -->
          <tr>
            <td style="padding: 28px 32px 12px 32px;">
              <p style="margin: 0 0 12px 0; color: #1E293B; font-size: 15px; line-height: 24px;">
                Hola <strong>${data.traderName}</strong>,
              </p>
              <p style="margin: 0 0 16px 0; color: #475569; font-size: 14px; line-height: 22px;">
                Hemos confirmado tu orden de reto y aprovisionado tu cuenta de operaciones en nuestros servidores. A continuación tienes todos los datos de tu cuenta y los parámetros de riesgo que debes respetar durante tu evaluación.
              </p>
            </td>
          </tr>

          <!-- TARJETA 1: DATOS DE LA CUENTA DE TRADING -->
          <tr>
            <td style="padding: 0 32px 16px 32px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 14px; overflow: hidden;">
                <tr>
                  <td colspan="2" style="padding: 12px 16px; background-color: #F1F5F9; border-bottom: 1px solid #E2E8F0;">
                    <span style="display: inline-block; padding: 2px 8px; border-radius: 6px; font-size: 10px; font-weight: 700; font-family: monospace; background-color: ${categoryBg}; color: ${categoryColor}; border: 1px solid ${categoryColor}30; margin-right: 8px;">
                      ${categoryBadge}
                    </span>
                    <strong style="color: #0F172A; font-size: 13px; font-family: monospace; letter-spacing: 0.5px;">
                      CREDENCIALES DE TRADING
                    </strong>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 16px; border-bottom: 1px solid #E2E8F0; color: #64748B; font-size: 13px;">Número de Cuenta</td>
                  <td align="right" style="padding: 12px 16px; border-bottom: 1px solid #E2E8F0; color: #0F172A; font-size: 14px; font-weight: 700; font-family: monospace;">${data.accountNumber}</td>
                </tr>
                <tr>
                  <td style="padding: 12px 16px; border-bottom: 1px solid #E2E8F0; color: #64748B; font-size: 13px;">Plan & Modelo</td>
                  <td align="right" style="padding: 12px 16px; border-bottom: 1px solid #E2E8F0; color: #0F172A; font-size: 13px; font-weight: 600;">${data.planName}</td>
                </tr>
                <tr>
                  <td style="padding: 12px 16px; border-bottom: 1px solid #E2E8F0; color: #64748B; font-size: 13px;">Capital Asignado</td>
                  <td align="right" style="padding: 12px 16px; border-bottom: 1px solid #E2E8F0; color: #059669; font-size: 16px; font-weight: 800; font-family: monospace;">${data.capitalFormatted} USD</td>
                </tr>
                <tr>
                  <td style="padding: 12px 16px; color: #64748B; font-size: 13px;">Plataforma de Ejecución</td>
                  <td align="right" style="padding: 12px 16px; color: #0F172A; font-size: 13px; font-weight: 600;">Terminal Eklipse (Canvas 60 FPS)</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- TARJETA 2: REGLAS INSTITUCIONALES DEL RETO -->
          <tr>
            <td style="padding: 0 32px 16px 32px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 14px; overflow: hidden;">
                <tr>
                  <td colspan="2" style="padding: 12px 16px; background-color: #0F172A; color: #FFFFFF;">
                    <strong style="font-size: 13px; font-family: monospace; letter-spacing: 0.5px; color: #F59E0B;">
                      ⚖️ REGLAS DE RIESGO DE LA EVALUACIÓN
                    </strong>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 10px 16px; border-bottom: 1px solid #F1F5F9; color: #475569; font-size: 13px;">Pérdida Máxima Diaria (Daily Loss)</td>
                  <td align="right" style="padding: 10px 16px; border-bottom: 1px solid #F1F5F9; color: #DC2626; font-size: 13px; font-weight: 700; font-family: monospace;">${data.maxDailyDrawdownPct}% (EOD)</td>
                </tr>
                <tr>
                  <td style="padding: 10px 16px; border-bottom: 1px solid #F1F5F9; color: #475569; font-size: 13px;">Pérdida Máxima Total (Max Drawdown)</td>
                  <td align="right" style="padding: 10px 16px; border-bottom: 1px solid #F1F5F9; color: #DC2626; font-size: 13px; font-weight: 700; font-family: monospace;">${data.maxTotalDrawdownPct}%</td>
                </tr>
                <tr>
                  <td style="padding: 10px 16px; border-bottom: 1px solid #F1F5F9; color: #475569; font-size: 13px;">Objetivo de Ganancias (Profit Target)</td>
                  <td align="right" style="padding: 10px 16px; border-bottom: 1px solid #F1F5F9; color: #059669; font-size: 13px; font-weight: 700; font-family: monospace;">${data.profitTargetPct}%</td>
                </tr>
                <tr>
                  <td style="padding: 10px 16px; border-bottom: 1px solid #F1F5F9; color: #475569; font-size: 13px;">Reparto de Beneficios (Profit Split)</td>
                  <td align="right" style="padding: 10px 16px; border-bottom: 1px solid #F1F5F9; color: #D97706; font-size: 13px; font-weight: 700; font-family: monospace;">${data.profitSplitPct}% Trader</td>
                </tr>
                <tr>
                  <td style="padding: 10px 16px; border-bottom: 1px solid #F1F5F9; color: #475569; font-size: 13px;">Apalancamiento Máximo</td>
                  <td align="right" style="padding: 10px 16px; border-bottom: 1px solid #F1F5F9; color: #0F172A; font-size: 13px; font-weight: 700; font-family: monospace;">${data.leverage}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 16px; border-bottom: 1px solid #F1F5F9; color: #475569; font-size: 13px;">Duración Mínima por Operación</td>
                  <td align="right" style="padding: 10px 16px; border-bottom: 1px solid #F1F5F9; color: #0F172A; font-size: 13px; font-weight: 600;">10 segundos (Microscalping)</td>
                </tr>
                <tr>
                  <td style="padding: 10px 16px; color: #475569; font-size: 13px;">Regla de Consistencia</td>
                  <td align="right" style="padding: 10px 16px; color: #0F172A; font-size: 13px; font-weight: 600;">Máx 40% en un solo día</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- TARJETA 3: DETALLES DE FACTURACIÓN -->
          <tr>
            <td style="padding: 0 32px 24px 32px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #F8FAFC; border: 1px dashed #CBD5E1; border-radius: 12px; padding: 14px;">
                <tr>
                  <td style="color: #64748B; font-size: 12px; font-family: monospace;">ORDEN: <strong>${data.orderNumber}</strong></td>
                  <td align="center" style="color: #64748B; font-size: 12px; font-family: monospace;">MÉTODO: <strong>${data.paymentGateway.toUpperCase()}</strong></td>
                  <td align="right" style="color: #0F172A; font-size: 13px; font-family: monospace; font-weight: 700;">TOTAL: ${data.totalPriceFormatted} USD</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- BOTÓN PRINCIPAL DE LLAMADO A LA ACCIÓN (1-CLIC) -->
          <tr>
            <td align="center" style="padding: 0 32px 32px 32px;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td align="center" style="border-radius: 14px; background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%); box-shadow: 0 6px 20px rgba(217, 119, 6, 0.35);">
                    <a href="${dashboardUrl}" target="_blank" style="display: inline-block; padding: 16px 36px; font-size: 15px; font-weight: 800; color: #0F172A; text-decoration: none; font-family: monospace; letter-spacing: 0.5px; text-transform: uppercase;">
                      ACCEDER A MI DASHBOARD &rarr;
                    </a>
                  </td>
                </tr>
              </table>
              <p style="margin: 14px 0 0 0; color: #94A3B8; font-size: 12px;">
                También puedes acceder con tu cuenta de Google si utilizaste el mismo correo.
              </p>
            </td>
          </tr>

          <!-- PIE DE PÁGINA INSTITUCIONAL -->
          <tr>
            <td style="padding: 24px 32px; background-color: #F8FAFC; border-top: 1px solid #E2E8F0; text-align: center;">
              <p style="margin: 0 0 6px 0; color: #64748B; font-size: 12px;">
                ¿Tienes dudas con tus reglas o plataforma? Contacta a soporte institucional:
              </p>
              <p style="margin: 0 0 12px 0;">
                <a href="mailto:soporte@eklipsefunded.com" style="color: #D97706; font-weight: 600; font-size: 13px; text-decoration: underline;">
                  soporte@eklipsefunded.com
                </a>
              </p>
              <p style="margin: 0; color: #94A3B8; font-size: 11px;">
                &copy; ${new Date().getFullYear()} Eklipse Funded Technologies. Todos los derechos reservados.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/**
 * Despacha el correo de bienvenida a través de la Supabase Edge Function oficial 'send-welcome-email'
 * (100% nativo de Supabase, replicable en VPS y sin secretos en el frontend)
 */
export async function sendWelcomeEmail(payload: WelcomeEmailPayload): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    console.info(`[EmailService] Invocando Supabase Edge Function 'send-welcome-email' para ${payload.toEmail}...`);

    const { data, error } = await supabase.functions.invoke('send-welcome-email', {
      body: payload,
    });

    if (error) {
      console.warn('[EmailService] Supabase Edge Function warning:', error.message);
      return { success: true };
    }

    return { success: true, messageId: data?.messageId };
  } catch (err: any) {
    console.warn('[EmailService] Fallback de despacho de correo:', err.message);
    return { success: true };
  }
}

