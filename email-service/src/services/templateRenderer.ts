import fs from 'fs';
import path from 'path';

export interface RenderOptions {
  templateName: string;
  lang?: 'es' | 'en';
  data: Record<string, any>;
}

export function renderEmailTemplate({ templateName, lang = 'es', data }: RenderOptions): string {
  const normalizedLang = lang === 'en' ? 'en' : 'es';

  // Buscar template tanto en desarrollo (src) como en producción compilada (dist)
  const candidatePaths = [
    path.join(__dirname, '..', 'templates', normalizedLang, `${templateName}.html`),
    path.join(__dirname, '..', '..', 'src', 'templates', normalizedLang, `${templateName}.html`),
    path.join(process.cwd(), 'src', 'templates', normalizedLang, `${templateName}.html`),
    path.join(process.cwd(), 'dist', 'templates', normalizedLang, `${templateName}.html`),
  ];

  let templateHtml = '';
  for (const p of candidatePaths) {
    if (fs.existsSync(p)) {
      templateHtml = fs.readFileSync(p, 'utf-8');
      break;
    }
  }

  if (!templateHtml) {
    throw new Error(`Template not found: ${templateName} in language ${normalizedLang}`);
  }

  // Fallbacks globales dinámicos desde variables de entorno
  const globalDefaults: Record<string, string> = {
    telegramBotUrl: process.env.TELEGRAM_BOT_URL || 'https://t.me/EklipseFunded_bot',
    dashboardUrl: process.env.DASHBOARD_URL || 'https://eklipsefunded.com/dashboard',
    resetUrl: process.env.RESET_URL || 'https://eklipsefunded.com/reset-password',
    supportUrl: process.env.SUPPORT_URL || 'https://eklipsefunded.com/support',
  };

  const mergedData = { ...globalDefaults, ...data };

  // Reemplazo limpio y seguro de variables {{key}}
  let rendered = templateHtml;
  for (const [key, val] of Object.entries(mergedData)) {
    const safeVal = val !== undefined && val !== null ? String(val) : '';
    const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
    rendered = rendered.replace(regex, safeVal);
  }

  return rendered;
}
