// ============================================================================
// SUPABASE EDGE FUNCTION: send-welcome-email
// ============================================================================
// Despacha correos institucionales de bienvenida, credenciales y reglas de reto
// a través de la API oficial de Resend. Diseño claro (Light Theme) para iPhone.
// Replicable en Supabase Cloud ('supabase functions deploy') y VPS On-Premise.
// ============================================================================
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req: Request) => {
  // Manejo de preflight CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const payload = await req.json();
    const {
      toEmail,
      traderName = "Trader",
      accountNumber,
      planName,
      category = "solar",
      capitalFormatted = "$25,000",
      maxDailyDrawdownPct = 5,
      maxTotalDrawdownPct = 10,
      profitTargetPct = 8,
      profitSplitPct = 80,
      leverage = "1:50",
      orderNumber,
      totalPriceFormatted = "$199.00",
      paymentGateway = "crypto",
      dashboardUrl = "https://eklipsefunded.com/dashboard",
    } = payload;

    if (!toEmail || !accountNumber) {
      return new Response(
        JSON.stringify({ error: "toEmail and accountNumber are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const resendApiKey = Deno.env.get("RESEND_API_KEY") || "";
    const resendFromEmail = Deno.env.get("RESEND_FROM_EMAIL") || "Eklipse Funded <soporte@eklipsefunded.com>";

    const categoryColor = category === "lunar" ? "#8B5CF6" : "#D97706";
    const categoryBg = category === "lunar" ? "#F5F3FF" : "#FFFBEB";
    const categoryBadge = category === "lunar" ? "LUNAR EVALUATION" : "SOLAR EVALUATION";

    // Plantilla HTML corporativa (Fondo Claro, compatible 100% con Apple Mail / iPhone)
    const htmlContent = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="light">
  <title>¡Bienvenido a Eklipse Funded! Tu Cuenta #${accountNumber}</title>
</head>
<body style="margin: 0; padding: 24px 12px; background-color: #F8FAFC; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #0F172A;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #F8FAFC;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; background-color: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 25px rgba(15, 23, 42, 0.05);">
          
          <!-- Imagen de Cabecera Oficial -->
          <tr>
            <td style="padding: 0; background-color: #FFFFFF; text-align: center;">
              <img 
                src="https://eklipsefunded.com/email-banner.webp" 
                alt="Eklipse Funded" 
                width="600" 
                style="width: 100%; max-width: 600px; height: auto; display: block; border-top-left-radius: 20px; border-top-right-radius: 20px;"
              />
            </td>
          </tr>

          <!-- Saludo Cálido y Empático -->
          <tr>
            <td style="padding: 28px 32px 12px 32px;">
              <h2 style="margin: 0 0 12px 0; color: #0F172A; font-size: 20px; font-weight: 800; letter-spacing: -0.4px;">
                ¡Hola, ${traderName}! 🎉
              </h2>
              <p style="margin: 0 0 16px 0; color: #334155; font-size: 14.5px; line-height: 24px;">
                ¡Te damos una muy cálida bienvenida a la familia de <strong>Eklipse Funded</strong>! Tu cuenta ya está lista para que empieces a demostrar tu talento en los mercados y consigas tu capital fondeado.
              </p>
              <p style="margin: 0; color: #475569; font-size: 13.5px; line-height: 22px;">
                Queremos verte triunfar. A continuación tienes el resumen de tu cuenta y las metas claras para superar tu reto:
              </p>
            </td>
          </tr>

          <!-- TARJETA 1: TU CUENTA DE TRADING -->
          <tr>
            <td style="padding: 12px 32px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 14px; overflow: hidden;">
                <tr>
                  <td style="padding: 14px 18px; border-bottom: 1px solid #F1F5F9; color: #64748B; font-size: 13px;">Número de Cuenta</td>
                  <td align="right" style="padding: 14px 18px; border-bottom: 1px solid #F1F5F9; color: #0F172A; font-size: 14px; font-weight: 700; font-family: monospace;">${accountNumber}</td>
                </tr>
                <tr>
                  <td style="padding: 14px 18px; border-bottom: 1px solid #F1F5F9; color: #64748B; font-size: 13px;">Capital Asignado</td>
                  <td align="right" style="padding: 14px 18px; border-bottom: 1px solid #F1F5F9; color: #059669; font-size: 16px; font-weight: 800; font-family: monospace;">${capitalFormatted} USD</td>
                </tr>
                <tr>
                  <td style="padding: 14px 18px; color: #64748B; font-size: 13px;">Tu Reparto de Ganancias</td>
                  <td align="right" style="padding: 14px 18px; color: ${categoryColor}; font-size: 14px; font-weight: 800; font-family: monospace;">${profitSplitPct}% Trader</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- TARJETA 2: REGLAS CLAVE PARA GANAR -->
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
                  <td align="right" style="padding: 11px 18px; border-bottom: 1px solid #F1F5F9; color: #DC2626; font-size: 13px; font-weight: 700; font-family: monospace;">${maxDailyDrawdownPct}%</td>
                </tr>
                <tr>
                  <td style="padding: 11px 18px; border-bottom: 1px solid #F1F5F9; color: #475569; font-size: 13px;">🛑 Pérdida Máxima Total</td>
                  <td align="right" style="padding: 11px 18px; border-bottom: 1px solid #F1F5F9; color: #DC2626; font-size: 13px; font-weight: 700; font-family: monospace;">${maxTotalDrawdownPct}%</td>
                </tr>
                <tr>
                  <td style="padding: 11px 18px; border-bottom: 1px solid #F1F5F9; color: #475569; font-size: 13px;">🎯 Meta de Ganancias</td>
                  <td align="right" style="padding: 11px 18px; border-bottom: 1px solid #F1F5F9; color: #059669; font-size: 13px; font-weight: 700; font-family: monospace;">${profitTargetPct}%</td>
                </tr>
                <tr>
                  <td style="padding: 11px 18px; color: #475569; font-size: 13px;">⏱️ Duración Mínima por Trade</td>
                  <td align="right" style="padding: 11px 18px; color: #0F172A; font-size: 13px; font-weight: 600;">10 segundos</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- BOTÓN PRINCIPAL 1-CLIC -->
          <tr>
            <td align="center" style="padding: 6px 32px 28px 32px;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td align="center" style="border-radius: 14px; background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%); box-shadow: 0 6px 20px rgba(217, 119, 6, 0.3);">
                    <a href="https://eklipsefunded.com/dashboard" target="_blank" style="display: inline-block; padding: 16px 38px; font-size: 14.5px; font-weight: 800; color: #0F172A; text-decoration: none; font-family: monospace; letter-spacing: 0.5px; text-transform: uppercase;">
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

          <!-- SOPORTE EN TELEGRAM (DIRECTO Y HUMANO) -->
          <tr>
            <td style="padding: 22px 32px; background-color: #F8FAFC; border-top: 1px solid #E2E8F0; text-align: center;">
              <p style="margin: 0 0 8px 0; color: #475569; font-size: 13px; font-weight: 500;">
                ¿Tienes preguntas o necesitas asistencia con tu cuenta?
              </p>
              <div style="margin-bottom: 12px;">
                <a 
                  href="https://t.me/EklipseFunded_bot" 
                  target="_blank" 
                  style="display: inline-block; padding: 8px 18px; background-color: #0284C7; color: #FFFFFF; font-size: 12.5px; font-weight: 700; border-radius: 10px; text-decoration: none; font-family: monospace;"
                >
                  💬 Escríbenos en Telegram (@EklipseFunded_bot) &rarr;
                </a>
              </div>
              <p style="margin: 0; color: #94A3B8; font-size: 11px;">
                &copy; 2026 Eklipse Funded. Tu disciplina, nuestro capital.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

    // Despacho vía Resend API
    const resendRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: resendFromEmail,
        to: [toEmail],
        subject: `¡Bienvenido a Eklipse Funded! Tu Reto ${planName} (${accountNumber})`,
        html: htmlContent,
      }),
    });

    const resendData = await resendRes.json();

    if (resendRes.ok && resendData?.id) {
      return new Response(
        JSON.stringify({ success: true, messageId: resendData.id }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } else {
      console.warn("[EdgeFunction send-welcome-email] Resend warning:", resendData);
      return new Response(
        JSON.stringify({ success: true, mode: "sandbox_or_logged", notice: resendData?.message }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
  } catch (err: any) {
    console.error("[EdgeFunction send-welcome-email] Error:", err.message);
    return new Response(
      JSON.stringify({ success: false, error: err.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
