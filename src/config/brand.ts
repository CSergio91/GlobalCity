/**
 * ============================================================================
 * BRAND CONFIGURATION (WHITE-LABEL ARCHITECTURE)
 * ============================================================================
 * Centraliza el nombre, logo, textos corporativos y contacto de la plataforma.
 * Permite cambiar de empresa simplemente editando .env sin tocar componentes.
 * ============================================================================
 */

export const BRAND_CONFIG = {
  name: (import.meta as any).env?.VITE_APP_NAME || 'Eklipse Funded',
  shortName: (import.meta as any).env?.VITE_APP_SHORT_NAME || 'Eklipse',
  legalName: (import.meta as any).env?.VITE_APP_LEGAL_NAME || 'Eklipse Funded Technologies',
  domain: (import.meta as any).env?.VITE_APP_DOMAIN || 'eklipsefunded.com',
  supportEmail: (import.meta as any).env?.VITE_SUPPORT_EMAIL || 'soporte@eklipsefunded.com',
  telegramBot: (import.meta as any).env?.VITE_TELEGRAM_BOT_NAME || 'EklipseFunded_bot',
  communityTelegram: (import.meta as any).env?.VITE_COMMUNITY_TELEGRAM || 'https://t.me/EklipseFunded',
  communityDiscord: (import.meta as any).env?.VITE_COMMUNITY_DISCORD || 'https://discord.gg/eklipsefunded',
  communityTwitter: (import.meta as any).env?.VITE_COMMUNITY_TWITTER || 'https://x.com/EklipseFunded',
};

export default BRAND_CONFIG;
