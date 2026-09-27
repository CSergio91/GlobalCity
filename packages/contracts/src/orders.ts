/**
 * GLOBAL CITY — ORDER & EXECUTION CONTRACTS
 * Reglas 6, 20, 21 y 22: ExecutionIntent, Máquina de estados con UNKNOWN, e IDs obligatorios.
 */

export type OrderSide = 'BUY' | 'SELL';
export type OrderType = 'MARKET' | 'LIMIT' | 'STOP_LIMIT' | 'TAKE_PROFIT';
export type TimeInForce = 'GTC' | 'IOC' | 'FOK';

/**
 * Regla 6: Intención de ejecución emitida por UI, Estrategia, Telegram o AI.
 * Nunca interactúa directamente con los providers.
 */
export interface ExecutionIntent {
  intentId: string;
  organizationId: string;
  accountId: string;
  venue: string;
  symbol: string;
  side: OrderSide;
  quantity: number;
  orderType: OrderType;
  limitPrice?: number;
  stopPrice?: number;
  timeInForce?: TimeInForce;
  strategyId?: string;
  reason?: string;
  timestamp: number;
}

/**
 * Regla 20 y 21: Estados de orden estrictos del OMS.
 * UNKNOWN es obligatorio para tratar timeouts y desconexiones sin duplicar órdenes.
 */
export type OrderLifecycleState =
  | 'CREATED'
  | 'PENDING'
  | 'SUBMITTED'
  | 'ACKNOWLEDGED'
  | 'PARTIALLY_FILLED'
  | 'FILLED'
  | 'REJECTED'
  | 'CANCEL_REQUESTED'
  | 'CANCELLED'
  | 'EXPIRED'
  | 'UNKNOWN';

/**
 * Regla 22: Toda orden debe poseer esta tríada de identificadores para idempotencia y reconciliación.
 */
export interface OrderIdentification {
  internalOrderId: string;  // GC-ORD-xxxx
  clientOrderId: string;    // GC-CID-xxxx (enviado al exchange para idempotencia)
  providerOrderId?: string; // ID asignado por el exchange/broker
}

export interface OrderFill {
  fillId: string;
  internalOrderId: string;
  price: number;
  quantity: number;
  fee: number;
  feeAsset: string;
  timestamp: number;
}

export interface CanonicalOrder extends OrderIdentification {
  organizationId: string;
  accountId: string;
  venue: string;
  symbol: string;
  side: OrderSide;
  orderType: OrderType;
  quantity: number;
  price?: number;
  filledQuantity: number;
  averageFilledPrice?: number;
  status: OrderLifecycleState;
  createdAt: number;
  updatedAt: number;
  reconciliationRequired: boolean;
}
