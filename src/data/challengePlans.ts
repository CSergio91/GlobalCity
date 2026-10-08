/**
 * EKLIPSE FUNDED — CHALLENGE PLANS & ADD-ONS CONTRACT (SOLAR & LUNAR TIERS)
 * Architected for real-time synchronization with Nexus CRM, Redis Hot-Cache & Supabase.
 */

export type PlanCategory = 'solar' | 'lunar';
export type PaymentMode = 'one-time' | 'monthly';

export interface PlanAddonConfig {
  id: 'boost_leverage' | 'extra_drawdown' | 'profit_split_90' | 'weekly_payout';
  nameEn: string;
  nameEs: string;
  descriptionEn: string;
  descriptionEs: string;
  priceDeltaPct: number; // e.g. 0.15 = +15% of plan price
  minPriceUSDT: number;
  iconName: string;
}

export const AVAILABLE_ADDONS: PlanAddonConfig[] = [
  {
    id: 'boost_leverage',
    nameEn: '+50% Leverage Boost',
    nameEs: '+50% Más Apalancamiento',
    descriptionEn: 'Increases base leverage to 1:150 (Solar) or 1:200 (Lunar)',
    descriptionEs: 'Aumenta el apalancamiento base a 1:150 (Solar) o 1:200 (Lunar)',
    priceDeltaPct: 0.15,
    minPriceUSDT: 10,
    iconName: 'Zap'
  },
  {
    id: 'extra_drawdown',
    nameEn: '+2% Drawdown Shield',
    nameEs: '+2% Escudo Drawdown',
    descriptionEn: 'Expands maximum total drawdown from 8% to 10%',
    descriptionEs: 'Amplía el drawdown máximo total de 8% a 10%',
    priceDeltaPct: 0.20,
    minPriceUSDT: 15,
    iconName: 'ShieldCheck'
  },
  {
    id: 'profit_split_90',
    nameEn: '90% Lifetime Profit Split',
    nameEs: '90% Reparto Permanente',
    descriptionEn: 'Locks maximum 90% payout split from your very first withdrawal',
    descriptionEs: 'Bloquea el 90% de reparto desde el primer retiro sin escalas',
    priceDeltaPct: 0.18,
    minPriceUSDT: 12,
    iconName: 'Award'
  },
  {
    id: 'weekly_payout',
    nameEn: 'Weekly Accelerated Payouts',
    nameEs: 'Retiros Semanales Exprés',
    descriptionEn: 'Bi-weekly payouts upgraded to weekly on-chain USDT settlement in <2h',
    descriptionEs: 'Retiros cada 7 días en USDT directo on-chain en < 2 horas',
    priceDeltaPct: 0.12,
    minPriceUSDT: 9,
    iconName: 'Clock'
  }
];

export interface ChallengePlan {
  id: string;
  category: PlanCategory;
  astronomicalName: {
    en: string;
    es: string;
  };
  sizeLabel: string;
  capital: number;
  capitalFormatted: string;
  oneTimePriceUSDT: number;
  monthlyPriceUSDT: number;
  baseProfitSplit: number;
  baseMaxDrawdownPct: number;
  baseDailyLossPct: number;
  baseLeverage: string;
  boostedLeverage: string;
  payoutSpeed: string;
  popular?: boolean;
  marketSpecialty: {
    en: string;
    es: string;
  };
  features: {
    en: string[];
    es: string[];
  };
}

// 1. CUENTAS SOLARES (Crypto Futures DMA & Institutional Liquidity)
export const SOLAR_CHALLENGE_PLANS: ChallengePlan[] = [
  {
    id: 'solar-1k',
    category: 'solar',
    astronomicalName: {
      en: 'Solar Flare $1K',
      es: 'Chispa Solar $1K'
    },
    sizeLabel: '$1K',
    capital: 1000,
    capitalFormatted: '$1,000',
    oneTimePriceUSDT: 19,
    monthlyPriceUSDT: 12,
    baseProfitSplit: 80,
    baseMaxDrawdownPct: 8,
    baseDailyLossPct: 2,
    baseLeverage: '1:50',
    boostedLeverage: '1:100',
    payoutSpeed: '< 8h',
    marketSpecialty: {
      en: 'Top 100 Crypto DMA Futures',
      es: 'Futuros Cripto DMA Top 100'
    },
    features: {
      en: ['Institutional crypto liquidity', 'Real exchange order books', 'Bi-weekly USDT payouts', '0 minimum trading days'],
      es: ['Liquidez cripto institucional', 'Libros reales de exchange', 'Retiros quincenales en USDT', '0 días mínimos requeridos']
    }
  },
  {
    id: 'solar-2.5k',
    category: 'solar',
    astronomicalName: {
      en: 'Solar Ray $2.5K',
      es: 'Rayo Solar $2.5K'
    },
    sizeLabel: '$2.5K',
    capital: 2500,
    capitalFormatted: '$2,500',
    oneTimePriceUSDT: 32,
    monthlyPriceUSDT: 19,
    baseProfitSplit: 80,
    baseMaxDrawdownPct: 8,
    baseDailyLossPct: 2,
    baseLeverage: '1:50',
    boostedLeverage: '1:100',
    payoutSpeed: '< 8h',
    marketSpecialty: {
      en: 'Top 100 Crypto DMA Futures',
      es: 'Futuros Cripto DMA Top 100'
    },
    features: {
      en: ['Aggregated Binance/Bybit books', 'Zero evaluation traps', 'Automated risk monitor', 'Instant account deployment'],
      es: ['Libros agregados Binance/Bybit', 'Sin trampas de evaluación', 'Monitor de riesgo automático', 'Despliegue inmediato']
    }
  },
  {
    id: 'solar-5k',
    category: 'solar',
    astronomicalName: {
      en: 'Solar Prominence $5K',
      es: 'Protuberancia Solar $5K'
    },
    sizeLabel: '$5K',
    capital: 5000,
    capitalFormatted: '$5,000',
    oneTimePriceUSDT: 59,
    monthlyPriceUSDT: 36,
    baseProfitSplit: 80,
    baseMaxDrawdownPct: 8,
    baseDailyLossPct: 2,
    baseLeverage: '1:100',
    boostedLeverage: '1:150',
    payoutSpeed: '< 8h',
    marketSpecialty: {
      en: 'Institutional Multi-Venue Cripto',
      es: 'Cripto Institucional Multi-Venue'
    },
    features: {
      en: ['High speed WebSocket fills', 'Overnight & weekend crypto allowed', 'Bi-weekly profit splits', 'Scale up to $200K'],
      es: ['Llenado ultra-rápido por WS', 'Cripto abierta 24/7 en fin de semana', 'Repartos quincenales', 'Escalado hasta $200K']
    }
  },
  {
    id: 'solar-10k',
    category: 'solar',
    astronomicalName: {
      en: 'Solar Corona $10K',
      es: 'Corona Solar $10K'
    },
    sizeLabel: '$10K',
    capital: 10000,
    capitalFormatted: '$10,000',
    oneTimePriceUSDT: 99,
    monthlyPriceUSDT: 59,
    baseProfitSplit: 80,
    baseMaxDrawdownPct: 8,
    baseDailyLossPct: 2,
    baseLeverage: '1:100',
    boostedLeverage: '1:150',
    payoutSpeed: '< 8h',
    marketSpecialty: {
      en: 'Professional Crypto Execution',
      es: 'Ejecución Profesional Cripto'
    },
    features: {
      en: ['Real sub-millisecond execution', 'Direct TradingView & KLineCharts v10', 'Priority compliance review', 'On-chain USDT settlement'],
      es: ['Ejecución real en sub-milisegundo', 'KLineCharts v10 con GPU', 'Revisión de riesgo prioritaria', 'Liquidación directa USDT on-chain']
    }
  },
  {
    id: 'solar-25k',
    category: 'solar',
    astronomicalName: {
      en: 'Solar Helios $25K',
      es: 'Helios Solar $25K'
    },
    sizeLabel: '$25K',
    capital: 25000,
    capitalFormatted: '$25,000',
    oneTimePriceUSDT: 179,
    monthlyPriceUSDT: 109,
    baseProfitSplit: 85,
    baseMaxDrawdownPct: 8,
    baseDailyLossPct: 2,
    baseLeverage: '1:100',
    boostedLeverage: '1:150',
    payoutSpeed: '< 8h',
    marketSpecialty: {
      en: 'Advanced Multi-Asset Futures',
      es: 'Futuros Multiactivo Avanzados'
    },
    features: {
      en: ['85% Base profit split', 'Raw spreads with institutional rebates', 'Dedicated Telegram desk', 'Zero commissions on limit orders'],
      es: ['85% Reparto base de ganancias', 'Spreads puros institucionales', 'Mesa de soporte en Telegram', 'Cero comisiones en órdenes limit']
    }
  },
  {
    id: 'solar-50k',
    category: 'solar',
    astronomicalName: {
      en: 'Solar Eclipse $50K',
      es: 'Eclipse Solar $50K'
    },
    sizeLabel: '$50K',
    capital: 50000,
    capitalFormatted: '$50,000',
    oneTimePriceUSDT: 289,
    monthlyPriceUSDT: 175,
    baseProfitSplit: 85,
    baseMaxDrawdownPct: 8,
    baseDailyLossPct: 2,
    baseLeverage: '1:100',
    boostedLeverage: '1:150',
    payoutSpeed: '< 6h',
    popular: true,
    marketSpecialty: {
      en: 'High Capacity Corporate Capital',
      es: 'Capital Corporativo de Alta Capacidad'
    },
    features: {
      en: ['VIP Priority execution tier', '85% Base split upgradable to 90%', 'Accelerated <6h payout window', 'Direct API access for algorithmic copy'],
      es: ['Nivel de ejecución VIP prioritario', 'Reparto 85% ampliable al 90%', 'Retiros acelerados en <6h', 'Acceso API para copy trading algorítmico']
    }
  },
  {
    id: 'solar-100k',
    category: 'solar',
    astronomicalName: {
      en: 'Solar Zenith $100K',
      es: 'Cenit Solar $100K'
    },
    sizeLabel: '$100K',
    capital: 100000,
    capitalFormatted: '$100,000',
    oneTimePriceUSDT: 459,
    monthlyPriceUSDT: 279,
    baseProfitSplit: 90,
    baseMaxDrawdownPct: 8,
    baseDailyLossPct: 2,
    baseLeverage: '1:100',
    boostedLeverage: '1:150',
    payoutSpeed: '< 4h',
    marketSpecialty: {
      en: 'Institutional Maximum Sovereign Tier',
      es: 'Nivel Soberano Máximo Institucional'
    },
    features: {
      en: ['Full 90% profit split included', 'Personal Risk Director concierge', 'Sub-4h expedited crypto payout', 'Custom liquidity routing options'],
      es: ['90% Reparto permanente incluido', 'Director de Riesgo personal', 'Retiro express en menos de 4 horas', 'Enrutamiento de liquidez personalizado']
    }
  }
];

// 2. CUENTAS LUNARES (Meme Coin Titans: PEPE, DOGE, BONK, SHIB, FLOKI, WIF)
export const LUNAR_CHALLENGE_PLANS: ChallengePlan[] = [
  {
    id: 'lunar-1k',
    category: 'lunar',
    astronomicalName: {
      en: 'Crescent Moon $1K',
      es: 'Luna Creciente $1K'
    },
    sizeLabel: '$1K',
    capital: 1000,
    capitalFormatted: '$1,000',
    oneTimePriceUSDT: 22,
    monthlyPriceUSDT: 14,
    baseProfitSplit: 80,
    baseMaxDrawdownPct: 9,
    baseDailyLossPct: 2.5,
    baseLeverage: '1:75',
    boostedLeverage: '1:150',
    payoutSpeed: '< 6h',
    marketSpecialty: {
      en: 'Meme Volatility Speculation (PEPE / DOGE / BONK)',
      es: 'Especulación en Memecoins (PEPE / DOGE / BONK)'
    },
    features: {
      en: ['Tailored for high meme volatility', 'No microscalping penalties on pumps', 'Bi-weekly payout in USDT', '0 minimum trading days'],
      es: ['Diseñada para volatilidad extrema meme', 'Sin penalización por microscalping en pumps', 'Retiros quincenales en USDT', '0 días mínimos obligatorios']
    }
  },
  {
    id: 'lunar-2.5k',
    category: 'lunar',
    astronomicalName: {
      en: 'Gibbous Moon $2.5K',
      es: 'Luna Gibosa $2.5K'
    },
    sizeLabel: '$2.5K',
    capital: 2500,
    capitalFormatted: '$2,500',
    oneTimePriceUSDT: 38,
    monthlyPriceUSDT: 23,
    baseProfitSplit: 80,
    baseMaxDrawdownPct: 9,
    baseDailyLossPct: 2.5,
    baseLeverage: '1:75',
    boostedLeverage: '1:150',
    payoutSpeed: '< 6h',
    marketSpecialty: {
      en: 'Meme Coin Momentum & Breakouts',
      es: 'Rupturas y Momentum de Memecoins'
    },
    features: {
      en: ['Overnight holding permitted 24/7', 'Trade all top 30 meme coins', 'Fast risk reconciliation in RAM', 'Instant activation'],
      es: ['Permite mantener operaciones 24/7', 'Opera las 30 principales memecoins', 'Reconciliación de riesgo en RAM', 'Activación inmediata']
    }
  },
  {
    id: 'lunar-5k',
    category: 'lunar',
    astronomicalName: {
      en: 'Lunar Eclipse $5K',
      es: 'Eclipse Lunar $5K'
    },
    sizeLabel: '$5K',
    capital: 5000,
    capitalFormatted: '$5,000',
    oneTimePriceUSDT: 69,
    monthlyPriceUSDT: 42,
    baseProfitSplit: 80,
    baseMaxDrawdownPct: 9,
    baseDailyLossPct: 2.5,
    baseLeverage: '1:100',
    boostedLeverage: '1:200',
    payoutSpeed: '< 6h',
    marketSpecialty: {
      en: 'High Leverage Meme Aggression',
      es: 'Apalancamiento Agresivo en Memes'
    },
    features: {
      en: ['Higher leverage for explosive runs', '9% Total drawdown buffer', 'Direct access to Pepe Trading Terminal', 'Bi-weekly profit splits'],
      es: ['Mayor apalancamiento para rallies explosivos', 'Colchón de 9% de Drawdown Total', 'Acceso directo a la Terminal Pepe', 'Repartos quincenales en USDT']
    }
  },
  {
    id: 'lunar-10k',
    category: 'lunar',
    astronomicalName: {
      en: 'Supermoon $10K',
      es: 'Superluna $10K'
    },
    sizeLabel: '$10K',
    capital: 10000,
    capitalFormatted: '$10,000',
    oneTimePriceUSDT: 119,
    monthlyPriceUSDT: 72,
    baseProfitSplit: 85,
    baseMaxDrawdownPct: 9,
    baseDailyLossPct: 2.5,
    baseLeverage: '1:100',
    boostedLeverage: '1:200',
    payoutSpeed: '< 6h',
    popular: true,
    marketSpecialty: {
      en: 'Community Meme Heavyweights',
      es: 'Pesos Pesados de la Comunidad Meme'
    },
    features: {
      en: ['85% Base profit share', 'Deep order books without slippage spikes', 'Exclusive Pepe Mascot badges', 'Expedited crypto settlement'],
      es: ['85% Reparto base de ganancias', 'Profundidad de libro sin saltos de slippage', 'Acceso a telemetría de ballenas meme', 'Liquidación cripto acelerada']
    }
  },
  {
    id: 'lunar-25k',
    category: 'lunar',
    astronomicalName: {
      en: 'Blue Moon $25K',
      es: 'Luna Azul $25K'
    },
    sizeLabel: '$25K',
    capital: 25000,
    capitalFormatted: '$25,000',
    oneTimePriceUSDT: 209,
    monthlyPriceUSDT: 126,
    baseProfitSplit: 85,
    baseMaxDrawdownPct: 9,
    baseDailyLossPct: 2.5,
    baseLeverage: '1:100',
    boostedLeverage: '1:200',
    payoutSpeed: '< 4h',
    marketSpecialty: {
      en: 'Large-Cap Meme Speculation',
      es: 'Especulación de Gran Capital Meme'
    },
    features: {
      en: ['Institutional size fills on meme pairs', 'Direct Telegram trade alerts', 'Up to 90% split with add-on', 'Priority payout channel'],
      es: ['Llenado institucional en pares meme', 'Alertas de trading en Telegram', 'Hasta 90% de reparto con add-on', 'Canal de retiros prioritario']
    }
  },
  {
    id: 'lunar-50k',
    category: 'lunar',
    astronomicalName: {
      en: 'Blood Moon $50K',
      es: 'Luna de Sangre $50K'
    },
    sizeLabel: '$50K',
    capital: 50000,
    capitalFormatted: '$50,000',
    oneTimePriceUSDT: 329,
    monthlyPriceUSDT: 199,
    baseProfitSplit: 88,
    baseMaxDrawdownPct: 10,
    baseDailyLossPct: 3,
    baseLeverage: '1:100',
    boostedLeverage: '1:200',
    payoutSpeed: '< 3h',
    marketSpecialty: {
      en: 'Legendary Meme Market Dominance',
      es: 'Dominancia Legendaria del Mercado Meme'
    },
    features: {
      en: ['10% Maximum Drawdown allowance', '88% Base profit split', 'Uncensored meme token trading', 'Priority <3h on-chain payouts'],
      es: ['10% de Drawdown Máximo Total permitido', '88% Reparto base de ganancias', 'Operativa libre en tokens meme', 'Retiros prioritarios en <3 horas']
    }
  },
  {
    id: 'lunar-100k',
    category: 'lunar',
    astronomicalName: {
      en: 'Apex Lunar $100K',
      es: 'Titán Lunar $100K'
    },
    sizeLabel: '$100K',
    capital: 100000,
    capitalFormatted: '$100,000',
    oneTimePriceUSDT: 499,
    monthlyPriceUSDT: 299,
    baseProfitSplit: 90,
    baseMaxDrawdownPct: 10,
    baseDailyLossPct: 3,
    baseLeverage: '1:100',
    boostedLeverage: '1:200',
    payoutSpeed: '< 2h',
    marketSpecialty: {
      en: 'Ultimate Sovereign Meme Sovereign Fund',
      es: 'Fondo Soberano Supremo de Memecoins'
    },
    features: {
      en: ['Full 90% profit split included', 'Maximized 1:200 meme leverage available', 'Sub-2h direct crypto wallet payout', 'Dedicated institutional trader support'],
      es: ['90% Reparto total incluido', 'Apalancamiento meme hasta 1:200 habilitado', 'Retiros directos a tu wallet en <2 horas', 'Soporte institucional dedicado 24/7']
    }
  }
];

export const DEFAULT_CHALLENGE_PLANS = SOLAR_CHALLENGE_PLANS;

/**
 * Dynamic price and rules calculator with add-ons
 */
export function calculateDynamicPlanPricing(
  plan: ChallengePlan,
  mode: PaymentMode,
  selectedAddonIds: string[]
): {
  basePrice: number;
  addonsCost: number;
  totalPrice: number;
  effectiveDrawdownPct: number;
  effectiveDailyLossPct: number;
  effectiveLeverage: string;
  effectiveProfitSplit: number;
  effectivePayoutSpeed: string;
} {
  const basePrice = mode === 'one-time' ? plan.oneTimePriceUSDT : plan.monthlyPriceUSDT;
  
  let addonsCost = 0;
  let effectiveDrawdownPct = plan.baseMaxDrawdownPct;
  let effectiveDailyLossPct = plan.baseDailyLossPct;
  let effectiveLeverage = plan.baseLeverage;
  let effectiveProfitSplit = plan.baseProfitSplit;
  let effectivePayoutSpeed = plan.payoutSpeed;

  for (const addonId of selectedAddonIds) {
    const config = AVAILABLE_ADDONS.find(a => a.id === addonId);
    if (!config) continue;

    const addonPrice = Math.max(config.minPriceUSDT, Math.round(basePrice * config.priceDeltaPct));
    addonsCost += addonPrice;

    if (addonId === 'boost_leverage') {
      effectiveLeverage = plan.boostedLeverage;
    }
    if (addonId === 'extra_drawdown') {
      effectiveDrawdownPct = plan.baseMaxDrawdownPct + 2;
    }
    if (addonId === 'profit_split_90') {
      effectiveProfitSplit = 90;
    }
    if (addonId === 'weekly_payout') {
      effectivePayoutSpeed = '< 2h (Semanal)';
    }
  }

  return {
    basePrice,
    addonsCost,
    totalPrice: basePrice + addonsCost,
    effectiveDrawdownPct,
    effectiveDailyLossPct,
    effectiveLeverage,
    effectiveProfitSplit,
    effectivePayoutSpeed
  };
}

/**
 * Fetch dynamic plans from Nexus / Redis cache or fallback to static contracts
 */
export async function getLiveChallengePlans(category: PlanCategory = 'solar'): Promise<ChallengePlan[]> {
  try {
    const cacheKey = `eklipse_plans_${category}`;
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {
    // LocalStorage fallback
  }

  return category === 'solar' ? SOLAR_CHALLENGE_PLANS : LUNAR_CHALLENGE_PLANS;
}
