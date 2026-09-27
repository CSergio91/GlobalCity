/**
 * GLOBAL CITY — CONNECTION & PORTFOLIO CONTRACTS
 * Reglas 11, 12, 28, 29 y 94: Separación estricta de credenciales, salud de conectores y modelo de portafolio.
 */

export type VenueCategory = 'EXCHANGE_SPOT' | 'EXCHANGE_FUTURES' | 'BROKER_MT5' | 'BROKER_CTRADER' | 'FIX_GATEWAY' | 'DEX';

export type ConnectionHealthStatus = 'HEALTHY' | 'DEGRADED' | 'UNAVAILABLE' | 'DISCONNECTED';

export interface ConnectionMetadata {
  connectionId: string;
  organizationId: string;
  venue: string;
  name: string;
  category: VenueCategory;
  status: ConnectionHealthStatus;
  isLive: boolean; // LIVE vs PAPER/DEMO (Regla 27)
  latencyMs: number;
  lastSyncAt: number;
  maskedApiKey?: string; // ej: "ak_live_••••••••••••3821" (NUNCA secret completo en frontend)
  permissions: ('READ' | 'TRADE')[]; // Regla 101: Nunca WITHDRAW por defecto
}

export interface CanonicalBalance {
  venue: string;
  asset: string;
  total: number;
  free: number;
  locked: number;
  updatedAt: number;
}

export interface CanonicalPosition {
  positionId: string;
  venue: string;
  symbol: string;
  side: 'LONG' | 'SHORT';
  quantity: number;
  entryPrice: number;
  markPrice: number;
  liquidationPrice?: number;
  leverage: number;
  unrealizedPnL: number;
  realizedPnL: number;
  margin: number;
  updatedAt: number;
}
