/**
 * Eklipse Funded — Institutional Pepe Avatar System
 * 
 * Configurable avatar catalog without hardcoded URLs.
 * Supports Cloudflare R2 / Cloudflare Images / Cloudflare CDN via environment variables:
 * VITE_CLOUDFLARE_AVATARS_CDN (e.g., https://cdn.eklipsefunded.com/avatars)
 * Defaults to high-performance local WebP assets (/avatars/pepe/...).
 */

export interface PepeAvatar {
  id: string;
  name: string;
  title: string;
  gender: 'male' | 'female';
  rarity: 'Mythic' | 'Legendary' | 'Epic';
  imageFile: string;
  accentColor: string;
  glowColor: string;
  description: string;
}

export const PEPE_AVATARS: PepeAvatar[] = [
  // 7 Male Pepe Avatars
  {
    id: 'pepe_golden_bull',
    name: 'Pepe Golden Bull',
    title: 'Institutional Funded Trader',
    gender: 'male',
    rarity: 'Mythic',
    imageFile: 'pepe_golden_bull.webp',
    accentColor: '#F59E0B',
    glowColor: 'rgba(245, 158, 11, 0.4)',
    description: 'Master trader con traje obsidian, corbata dorada y medalla de capital institucional.'
  },
  {
    id: 'pepe_cyber_vision',
    name: 'Pepe Cyber Trader',
    title: 'Cybernetic HFT Specialist',
    gender: 'male',
    rarity: 'Legendary',
    imageFile: 'pepe_cyber_vision.webp',
    accentColor: '#06B6D4',
    glowColor: 'rgba(6, 182, 212, 0.4)',
    description: 'Especialista en alta frecuencia con visor holográfico AR y chaqueta táctica neón.'
  },
  {
    id: 'pepe_wall_street',
    name: 'Pepe Wall Street',
    title: 'Hedge Fund Executive',
    gender: 'male',
    rarity: 'Legendary',
    imageFile: 'pepe_wall_street.webp',
    accentColor: '#3B82F6',
    glowColor: 'rgba(59, 130, 246, 0.4)',
    description: 'Gestor de fondos de cobertura con traje a rayas, gemelos de oro y gafas oscuras.'
  },
  {
    id: 'pepe_astronaut',
    name: 'Pepe Interstellar',
    title: 'Deep Space Cosmic Trader',
    gender: 'male',
    rarity: 'Mythic',
    imageFile: 'pepe_astronaut.webp',
    accentColor: '#A855F7',
    glowColor: 'rgba(168, 85, 247, 0.45)',
    description: 'Cosmonauta de Eklipse en órbita con visor dorado reflejando el eclipse solar.'
  },
  {
    id: 'pepe_zen_master',
    name: 'Pepe Zen Master',
    title: 'Psychology & Drawdown Monk',
    gender: 'male',
    rarity: 'Epic',
    imageFile: 'pepe_zen_master.webp',
    accentColor: '#10B981',
    glowColor: 'rgba(16, 185, 129, 0.4)',
    description: 'Maestro zen en meditación sobre velas verdes con rosario de cuentas de jade y oro.'
  },
  {
    id: 'pepe_matrix_quant',
    name: 'Pepe Matrix Quant',
    title: 'Algorithmic L2 Terminal',
    gender: 'male',
    rarity: 'Epic',
    imageFile: 'pepe_matrix_quant.webp',
    accentColor: '#22C55E',
    glowColor: 'rgba(34, 197, 94, 0.4)',
    description: 'Ingeniero cuantitativo con código binario fluyendo en lentes y halo de terminal.'
  },
  {
    id: 'pepe_royal_king',
    name: 'Pepe Imperial King',
    title: 'Sovereign King of PnL',
    gender: 'male',
    rarity: 'Mythic',
    imageFile: 'pepe_royal_king.webp',
    accentColor: '#E11D48',
    glowColor: 'rgba(225, 29, 72, 0.45)',
    description: 'Monarca imperial del profit con corona de oro macizo y manto de terciopelo carmesí.'
  },

  // 3 Female Pepe Avatars (Damas)
  {
    id: 'lady_pepe_queen',
    name: 'Lady Pepe Imperial',
    title: 'Empress of Evaluation',
    gender: 'female',
    rarity: 'Mythic',
    imageFile: 'lady_pepe_queen.webp',
    accentColor: '#EC4899',
    glowColor: 'rgba(236, 72, 153, 0.45)',
    description: 'Emperatriz con tiara de zafiros y diamantes, collar de perlas y saco de gala azul noche.'
  },
  {
    id: 'lady_pepe_cyber',
    name: 'Lady Pepe Cyberpunk',
    title: 'Neon Matrix Operative',
    gender: 'female',
    rarity: 'Legendary',
    imageFile: 'lady_pepe_cyber.webp',
    accentColor: '#8B5CF6',
    glowColor: 'rgba(139, 92, 246, 0.45)',
    description: 'Trader cyberpunk con cabello fucsia neón, visor cian de precisión y chaqueta de cuero.'
  },
  {
    id: 'lady_pepe_emerald',
    name: 'Lady Pepe Wall Street',
    title: 'Executive Prop Firm Director',
    gender: 'female',
    rarity: 'Legendary',
    imageFile: 'lady_pepe_emerald.webp',
    accentColor: '#059669',
    glowColor: 'rgba(5, 150, 105, 0.4)',
    description: 'Directora ejecutiva de mesa de riesgo con blazer sastre esmeralda y gafas doradas.'
  }
];

/**
 * Obtiene la URL absoluta o relativa del avatar.
 * Permite inyección de CDN externo (Cloudflare R2 / Cloudflare Images) sin tocar código.
 */
export const getPepeAvatarUrl = (avatarOrId: PepeAvatar | string): string => {
  const avatar = typeof avatarOrId === 'string'
    ? PEPE_AVATARS.find(a => a.id === avatarOrId) || PEPE_AVATARS[0]
    : avatarOrId;

  // Si existe una variable de entorno en Vite para Cloudflare CDN, usarla
  const cdnBase = (import.meta as any).env?.VITE_CLOUDFLARE_AVATARS_CDN as string | undefined;

  if (cdnBase && cdnBase.startsWith('http')) {
    const cleanBase = cdnBase.endsWith('/') ? cdnBase.slice(0, -1) : cdnBase;
    return `${cleanBase}/${avatar.imageFile}`;
  }

  // Fallback local estándar en /avatars/pepe/...
  return `/avatars/pepe/${avatar.imageFile}`;
};

export const DEFAULT_PEPE_AVATAR = PEPE_AVATARS[0];

export const loadStoredPepeAvatarId = (): string => {
  try {
    return localStorage.getItem('eklipse_trader_pepe_avatar') || DEFAULT_PEPE_AVATAR.id;
  } catch (_) {
    return DEFAULT_PEPE_AVATAR.id;
  }
};

export const storeSelectedPepeAvatarId = (avatarId: string): void => {
  try {
    localStorage.setItem('eklipse_trader_pepe_avatar', avatarId);
  } catch (_) {}
};
