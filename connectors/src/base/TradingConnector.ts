/**
 * GLOBAL CITY — UNIVERSAL TRADING CONNECTOR INTERFACE
 * Regla 13: Interfaz canónica universal.
 * "La interfaz debe representar el negocio de Global City, no copiar literalmente la API de Binance ni de ningún broker."
 */

import {
  NormalizedTicker,
  NormalizedOrderBook,
  ExecutionIntent,
  CanonicalOrder,
  CanonicalBalance,
  CanonicalPosition
} from '../../../packages/contracts/src';

export interface MarketInfo {
  venue: string;
  symbol: string;
  baseAsset: string;
  quoteAsset: string;
  minQuantity: number;
  maxQuantity: number;
  stepSize: number;
  tickSize: number;
  isActive: boolean;
}

export interface TradingConnector {
  readonly venue: string;

  // Connectivity & Health
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  isAlive(): Promise<boolean>;

  // Public Market Data
  getMarkets(): Promise<MarketInfo[]>;
  getTicker(symbol: string): Promise<NormalizedTicker>;
  getOrderBook(symbol: string): Promise<NormalizedOrderBook>;

  // Private Account Data
  getBalance(): Promise<CanonicalBalance[]>;
  getPositions(): Promise<CanonicalPosition[]>;

  // Order Execution & Lifecycle
  createOrder(intent: ExecutionIntent): Promise<CanonicalOrder>;
  cancelOrder(internalOrderId: string, clientOrderId: string): Promise<CanonicalOrder>;
  getOrder(clientOrderId: string): Promise<CanonicalOrder>;
  getOpenOrders(symbol?: string): Promise<CanonicalOrder[]>;
}
