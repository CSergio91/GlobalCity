import { Resend } from 'resend';

let resendInstance: Resend | null = null;

function getResendClient(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn('[EmailService] Advertencia: RESEND_API_KEY no configurada en .env.');
    return null;
  }
  if (!resendInstance) {
    resendInstance = new Resend(apiKey);
  }
  return resendInstance;
}

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: SendEmailOptions): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const resend = getResendClient();
    const from = process.env.RESEND_FROM_EMAIL || 'Eklipse Funded <soporte@eklipsefunded.com>';

    if (!resend) {
      console.info(`[EmailService - Modo Demo/Log] Correo a ${to}: "${subject}" (Simulado, sin clave Resend)`);
      return { success: true, messageId: 'mock-local-delivered' };
    }

    const { data, error } = await resend.emails.send({
      from,
      to,
      subject,
      html,
    });

    if (error) {
      console.error(`[EmailService] Error de Resend para ${to}:`, error);
      return { success: false, error: error.message };
    }

    console.info(`[EmailService] Correo entregado exitosamente a ${to}: ${data?.id}`);
    return { success: true, messageId: data?.id };
  } catch (err: any) {
    console.error(`[EmailService] Excepción despachando a ${to}:`, err?.message);
    return { success: false, error: err?.message };
  }
}
