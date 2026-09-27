/**
 * GLOBAL CITY — MARKET DATA CONTRACTS
 * Regla 8: Contratos agnósticos normalizados. Cero acoplamiento a formatos de exchanges.
 */

export interface NormalizedTicker {
  venue: string;
  symbol: string;
  bid: number;
  ask: number;
  last: number;
  volume24h: number;
  change24h?: number;
  high24h?: number;
  low24h?: number;
  timestamp: number;
}

export interface OrderBookLevel {
  price: number;
  amount: number;
}

export interface NormalizedOrderBook {
  venue: string;
  symbol: string;
  bids: OrderBookLevel[];
  asks: OrderBookLevel[];
  timestamp: number;
  sequenceId?: number;
}

export interface NormalizedTrade {
  venue: string;
  symbol: string;
  tradeId: string;
  price: number;
  amount: number;
  side: 'BUY' | 'SELL';
  timestamp: number;
}

export interface NormalizedCandle {
  venue: string;
  symbol: string;
  timeframe: string;
  timestamp: number; // UTC Unix timestamp in milliseconds
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  turnover?: number;
}

export interface NormalizedFundingRate {
  venue: string;
  symbol: string;
  fundingRate: number;
  fundingTime: number;
  estimatedNextRate?: number;
}

export interface NormalizedMarkPrice {
  venue: string;
  symbol: string;
  markPrice: number;
  indexPrice: number;
  timestamp: number;
}
