/**
 * EKLIPSE FUNDED — CHALLENGE PLANS & ADD-ONS CONTRACT (SOLAR & LUNAR TIERS)
 * Architected for real-time synchronization with Nexus CRM, Redis Hot-Cache & Supabase.
 */

import { supabase } from '../lib/supabase';
import { apiFetch } from '../config/apiGateway';

export type PlanCategory = 'solar' | 'lunar' | string;
export type PaymentMode = 'one-time' | 'monthly';

export interface PlanAddonConfig {
  id: string;
  nameEn: string;
  nameEs: string;
  descriptionEn: string;
  descriptionEs: string;
  priceDeltaPct: number; // e.g. 0.15 = +15% of plan price
  minPriceUSDT: number;
  iconName: string;
  isActive?: boolean;
  targetRule?: string;
  modifierType?: 'ADD_VALUE' | 'MULTIPLY_VALUE' | 'SET_FIXED_VALUE' | string;
  modifierValue?: number | string;
}

export const DEFAULT_CHALLENGE_ADDONS: PlanAddonConfig[] = [
  {
    id: 'boost_leverage',
    targetRule: 'max_leverage',
    modifierType: 'MULTIPLY_VALUE',
    modifierValue: 1.5,
    nameEn: '+50% Leverage Boost',
    nameEs: '+50% Más Apalancamiento',
    descriptionEn: 'Increases base leverage to 1:150 (Solar) or 1:200 (Lunar)',
    descriptionEs: 'Aumenta el apalancamiento base a 1:150 (Solar) o 1:200 (Lunar)',
    priceDeltaPct: 0.15,
    minPriceUSDT: 10,
    iconName: 'Zap',
    isActive: true
  },
  {
    id: 'extra_drawdown',
    targetRule: 'max_total_drawdown_percent',
    modifierType: 'ADD_VALUE',
    modifierValue: 2,
    nameEn: '+2% Drawdown Shield',
    nameEs: '+2% Escudo Drawdown',
    descriptionEn: 'Expands maximum total drawdown from 8% to 10%',
    descriptionEs: 'Amplía el colchón de drawdown máximo total en +2%',
    priceDeltaPct: 0.20,
    minPriceUSDT: 15,
    iconName: 'ShieldCheck',
    isActive: true
  },
  {
    id: 'profit_split_90',
    targetRule: 'profit_split_percent',
    modifierType: 'SET_FIXED_VALUE',
    modifierValue: 90,
    nameEn: '90% Lifetime Profit Split',
    nameEs: '90% Reparto Permanente',
    descriptionEn: 'Locks maximum 90% payout split from your very first withdrawal',
    descriptionEs: 'Bloquea el 90% de reparto desde el primer retiro sin escalas',
    priceDeltaPct: 0.18,
    minPriceUSDT: 12,
    iconName: 'Award',
    isActive: true
  },
  {
    id: 'weekly_payout',
    targetRule: 'payout_frequency',
    modifierType: 'SET_FIXED_VALUE',
    modifierValue: 'WEEKLY',
    nameEn: 'Weekly Accelerated Payouts',
    nameEs: 'Retiros Semanales Exprés',
    descriptionEn: 'Bi-weekly payouts upgraded to weekly on-chain USDT settlement in <2h',
    descriptionEs: 'Retiros cada 7 días en USDT directo on-chain en < 2 horas',
    priceDeltaPct: 0.12,
    minPriceUSDT: 9,
    iconName: 'Clock',
    isActive: true
  }
];

export const AVAILABLE_ADDONS: PlanAddonConfig[] = DEFAULT_CHALLENGE_ADDONS;

export interface ChallengePlan {
  id: string;
  name?: string;
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
  payoutSplitMode?: 'FIXED' | 'TIERED';
  payoutScale?: Array<{ tier: number; split: number }>;
  customAddons?: PlanAddonConfig[];
  baseMaxDrawdownPct: number;
  baseDailyLossPct: number;
  baseLeverage: string;
  boostedLeverage: string;
  payoutSpeed: string;
  popular?: boolean;
  modelType?: string;
  drawdownType?: string;
  profitTargetPct?: number;
  profitTargetPhase2Pct?: number | null;
  minTradingDays?: number;
  mandatoryStopLoss?: boolean;
  weekendHoldingAllowed?: boolean;
  newsTradingAllowed?: boolean;
  consistencyRulePercent?: number;
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

  const addonsPool = (plan.customAddons && plan.customAddons.length > 0)
    ? plan.customAddons
    : AVAILABLE_ADDONS;

  for (const addonId of selectedAddonIds) {
    const config = addonsPool.find(a => a.id === addonId) || AVAILABLE_ADDONS.find(a => a.id === addonId);
    if (!config) continue;

    const addonPrice = Math.max(config.minPriceUSDT || 0, Math.round(basePrice * (config.priceDeltaPct || 0)));
    addonsCost += addonPrice;

    // Evaluador dinámico de modificadores
    if (config.targetRule === 'max_leverage' || config.id === 'boost_leverage') {
      effectiveLeverage = plan.boostedLeverage;
    } else if (config.targetRule === 'max_total_drawdown_percent' || config.id === 'extra_drawdown') {
      const extra = typeof config.modifierValue === 'number' ? config.modifierValue : 2;
      effectiveDrawdownPct = plan.baseMaxDrawdownPct + extra;
    } else if (config.targetRule === 'profit_split_percent' || config.id === 'profit_split_90') {
      const targetSplit = typeof config.modifierValue === 'number' ? config.modifierValue : 90;
      effectiveProfitSplit = Math.max(effectiveProfitSplit, targetSplit);
    } else if (config.targetRule === 'payout_frequency' || config.id === 'weekly_payout') {
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

export function normalizePlan(rule: any): ChallengePlan {
  const capital = Number(rule.capital || rule.default_account_balance || 100000);
  const name = rule.name || `Challenge $${capital.toLocaleString()}`;
  const isLunar = rule.category === 'lunar' || (name && name.toLowerCase().includes('lunar')) || (rule.model_type === 'INSTANT_FUNDING');
  const planCategory: PlanCategory = (rule.category || (isLunar ? 'lunar' : 'solar')).trim().toLowerCase();

  const oneTime = Number(rule.oneTimePriceUSDT || rule.one_time_price_usdt) > 0 
    ? Number(rule.oneTimePriceUSDT || rule.one_time_price_usdt) 
    : (
      capital <= 1000 ? 19 :
      capital <= 2500 ? 32 :
      capital <= 5000 ? 49 :
      capital <= 10000 ? 89 :
      capital <= 25000 ? 149 :
      capital <= 50000 ? 249 :
      capital <= 100000 ? 449 :
      capital <= 200000 ? 849 : 1499
    );
  const monthly = Number(rule.monthlyPriceUSDT || rule.monthly_price_usdt) > 0 
    ? Number(rule.monthlyPriceUSDT || rule.monthly_price_usdt) 
    : Math.round(oneTime * 0.35);

  const sizeLabel = rule.sizeLabel || (capital >= 1000000 
    ? `${(capital / 1000000).toFixed(capital % 1000000 === 0 ? 0 : 1)}M` 
    : `${(capital / 1000).toFixed(capital % 1000 === 0 ? 0 : 1)}K`);

  const astronomicalName = typeof rule.astronomicalName === 'object' && rule.astronomicalName !== null
    ? {
        en: rule.astronomicalName.en || rule.astronomical_name_en || name,
        es: rule.astronomicalName.es || rule.astronomical_name_es || name
      }
    : {
        en: rule.astronomical_name_en || (typeof rule.astronomicalName === 'string' ? rule.astronomicalName : name),
        es: rule.astronomical_name_es || (typeof rule.astronomicalName === 'string' ? rule.astronomicalName : name)
      };

  const payoutScale: Array<{ tier: number; split: number }> = 
    Array.isArray(rule.payoutScale) ? rule.payoutScale :
    Array.isArray(rule.payout_scale) ? rule.payout_scale : [];

  const payoutSplitMode: 'FIXED' | 'TIERED' = rule.payoutSplitMode || rule.payout_split_mode || (payoutScale.length > 0 ? 'TIERED' : 'FIXED');

  const customAddons: PlanAddonConfig[] = Array.isArray(rule.customAddons) && rule.customAddons.length > 0
    ? rule.customAddons
    : (Array.isArray(rule.custom_addons) && rule.custom_addons.length > 0 ? rule.custom_addons : DEFAULT_CHALLENGE_ADDONS);

  const isInstant = rule.model_type === 'INSTANT_FUNDING' || rule.modelType === 'INSTANT_FUNDING';
  const isTiered = payoutSplitMode === 'TIERED' && payoutScale.length > 0;
  const minTierSplit = isTiered ? Math.min(...payoutScale.map(t => Number(t.split) || 0)) : Number(rule.baseProfitSplit || rule.profit_split_percent || 80);
  const maxTierSplit = isTiered ? Math.max(...payoutScale.map(t => Number(t.split) || 0)) : Number(rule.baseProfitSplit || rule.profit_split_percent || 80);

  const profitTargetLabelEn = isInstant ? 'No Profit Target (Direct Funding)' : `Profit Target: ${rule.profit_target_percent || rule.profitTargetPct || 10}%`;
  const profitTargetLabelEs = isInstant ? 'Sin Objetivo de Beneficio (Fondeo Directo)' : `Objetivo de Beneficio: ${rule.profit_target_percent || rule.profitTargetPct || 10}%`;

  const splitLabelEn = isTiered 
    ? `Tiered Profit Split: ${minTierSplit}% up to ${maxTierSplit}%` 
    : `Profit Split: ${rule.profit_split_percent || rule.baseProfitSplit || 80}%`;
  const splitLabelEs = isTiered 
    ? `Reparto Escalonado: ${minTierSplit}% hasta ${maxTierSplit}%` 
    : `Reparto de Ganancias: ${rule.profit_split_percent || rule.baseProfitSplit || 80}%`;

  const features = typeof rule.features === 'object' && rule.features !== null && Array.isArray(rule.features.en)
    ? rule.features
    : {
        en: [
          profitTargetLabelEn,
          `Max Drawdown: ${rule.max_total_drawdown_percent || rule.baseMaxDrawdownPct || 10}% (${rule.drawdown_type || rule.drawdownType || 'EOD'})`,
          `Daily Loss Limit: ${rule.max_daily_loss_percent || rule.baseDailyLossPct || 5}%`,
          splitLabelEn,
          (rule.weekend_holding_allowed !== false && rule.weekendHoldingAllowed !== false) ? 'Weekend Holding Allowed' : 'Close before Weekend'
        ],
        es: [
          profitTargetLabelEs,
          `Drawdown Máximo: ${rule.max_total_drawdown_percent || rule.baseMaxDrawdownPct || 10}% (${rule.drawdown_type || rule.drawdownType || 'EOD'})`,
          `Pérdida Diaria Máxima: ${rule.max_daily_loss_percent || rule.baseDailyLossPct || 5}%`,
          splitLabelEs,
          (rule.weekend_holding_allowed !== false && rule.weekendHoldingAllowed !== false) ? 'Operativa Fin de Semana Permitida' : 'Cierre Previo a Fin de Semana'
        ]
      };

  const marketSpecialty = typeof rule.marketSpecialty === 'object' && rule.marketSpecialty !== null
    ? rule.marketSpecialty
    : {
        en: isLunar ? 'Meme Titans & High Volatility DMA' : 'Crypto DMA & Institutional Liquidity',
        es: isLunar ? 'Titanes Meme y Volatilidad Extrema DMA' : 'Crypto DMA y Liquidez Institucional'
      };

  const maxLevNum = Number(rule.max_leverage || 100);
  const baseLeverageVal = rule.baseLeverage || `1:${maxLevNum}`;
  const boostedLevVal = rule.boostedLeverage || `1:${Math.round(maxLevNum * 1.5)}`;

  return {
    ...rule,
    id: rule.id || `plan-${capital}`,
    category: planCategory,
    name,
    astronomicalName,
    sizeLabel,
    capital,
    capitalFormatted: rule.capitalFormatted || `$${capital.toLocaleString()}`,
    oneTimePriceUSDT: oneTime,
    monthlyPriceUSDT: monthly,
    baseProfitSplit: Number(rule.baseProfitSplit || rule.profit_split_percent || 80),
    payoutSplitMode,
    payoutScale,
    customAddons,
    baseMaxDrawdownPct: Number(rule.baseMaxDrawdownPct || rule.max_total_drawdown_percent || 10),
    baseDailyLossPct: Number(rule.baseDailyLossPct || rule.max_daily_loss_percent || 5),
    baseLeverage: baseLeverageVal,
    boostedLeverage: boostedLevVal,
    payoutSpeed: rule.payoutSpeed || (isInstant ? 'Semanal' : '14 Días'),
    popular: !!(rule.popular || rule.is_popular),
    modelType: rule.model_type || rule.modelType || 'ONE_PHASE',
    drawdownType: rule.drawdown_type || rule.drawdownType || 'EOD',
    profitTargetPct: isInstant ? 0 : Number(rule.profit_target_percent || rule.profitTargetPct || 10),
    profitTargetPhase2Pct: rule.profit_target_phase2_percent ? Number(rule.profit_target_phase2_percent) : null,
    minTradingDays: Number(rule.min_trading_days ?? rule.minTradingDays ?? 0),
    mandatoryStopLoss: !!(rule.mandatory_stop_loss || rule.mandatoryStopLoss),
    weekendHoldingAllowed: rule.weekend_holding_allowed !== false && rule.weekendHoldingAllowed !== false,
    newsTradingAllowed: rule.news_trading_allowed !== false && rule.newsTradingAllowed !== false,
    consistencyRulePercent: Number(rule.consistency_rule_percent || rule.consistencyRulePercent || 40),
    marketSpecialty,
    features
  };
}

let inFlightPlansPromise: Promise<ChallengePlan[]> | null = null;
const PLANS_CACHE_TTL_MS = 2 * 60 * 1000; // 2 minutos

/**
 * Fetch dynamic plans from Nexus CRM / Redis Hot-Cache / Supabase risk_rule_configs.
 * Utilizes in-flight promise deduplication and a 2-minute cache TTL.
 */
export async function getAllLiveChallengePlans(): Promise<ChallengePlan[]> {
  // 1. Local-First Cache con TTL
  try {
    const cached = localStorage.getItem('eklipse_cached_challenge_plans');
    const cachedTs = Number(localStorage.getItem('eklipse_cached_challenge_plans_ts') || 0);
    const isFresh = (Date.now() - cachedTs) < PLANS_CACHE_TTL_MS;

    if (cached) {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed) && parsed.length > 0) {
        if (isFresh) {
          return parsed.map(normalizePlan);
        }
        // Si expiró el TTL, retornar inmediatamente y revalidar en segundo plano sin duplicar
        revalidatePlansInBackground();
        return parsed.map(normalizePlan);
      }
    }
  } catch (_) {}

  // 2. Fetch deduplicado en vuelo
  if (inFlightPlansPromise) {
    return inFlightPlansPromise;
  }

  inFlightPlansPromise = fetchFreshChallengePlans()
    .then(plans => {
      inFlightPlansPromise = null;
      return plans.map(normalizePlan);
    })
    .catch(err => {
      inFlightPlansPromise = null;
      console.warn('[ChallengePlans] Failed fetching plans:', err);
      return [];
    });

  return inFlightPlansPromise;
}

export async function getLiveChallengePlans(category?: PlanCategory): Promise<ChallengePlan[]> {
  const allPlans = await getAllLiveChallengePlans();
  if (allPlans.length === 0) {
    return category === 'lunar' ? LUNAR_CHALLENGE_PLANS : SOLAR_CHALLENGE_PLANS;
  }
  if (!category) return allPlans;
  const filtered = allPlans.filter(p => p.category.toLowerCase() === category.toLowerCase());
  return filtered.length > 0 ? filtered : allPlans;
}

async function fetchFreshChallengePlans(): Promise<ChallengePlan[]> {
  try {
    // 1. Intentar endpoint acelerado con Redis Clúster / Hot-Cache (<1ms)
    try {
      const res = await apiFetch('/api/challenges/plans', {}, 3500);
      if (res.ok) {
        const json = await res.json();
        if (json.plans && Array.isArray(json.plans) && json.plans.length > 0) {
          const normalized = json.plans.map(normalizePlan);
          localStorage.setItem('eklipse_cached_challenge_plans', JSON.stringify(normalized));
          localStorage.setItem('eklipse_cached_challenge_plans_ts', Date.now().toString());
          return normalized;
        }
      }
    } catch (_) {}

    // 2. Fallback a Supabase Directo
    const { data, error } = await supabase
      .from('risk_rule_configs')
      .select('*')
      .eq('is_active', true)
      .order('default_account_balance', { ascending: true });

    if (!error && data && data.length > 0) {
      const dynamicPlans: ChallengePlan[] = data.map(normalizePlan);
      localStorage.setItem('eklipse_cached_challenge_plans', JSON.stringify(dynamicPlans));
      localStorage.setItem('eklipse_cached_challenge_plans_ts', Date.now().toString());
      return dynamicPlans;
    }
  } catch (err) {
    console.warn('[ChallengePlans] Error loading from backend/Supabase:', err);
  }

  // Fallback to static presets only if nothing is in DB
  const defaultList = [...SOLAR_CHALLENGE_PLANS, ...LUNAR_CHALLENGE_PLANS];
  return defaultList;
}

function revalidatePlansInBackground() {
  if (inFlightPlansPromise) return;
  inFlightPlansPromise = fetchFreshChallengePlans()
    .then(plans => {
      inFlightPlansPromise = null;
      return plans.map(normalizePlan);
    })
    .catch(() => {
      inFlightPlansPromise = null;
      return [];
    });
}
