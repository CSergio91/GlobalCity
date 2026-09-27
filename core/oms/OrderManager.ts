/**
 * GLOBAL CITY — ORDER MANAGEMENT SYSTEM (OMS)
 * Reglas 20, 21 y 22: Order Lifecycle con estado UNKNOWN e identificadores de idempotencia.
 */

import {
  CanonicalOrder,
  ExecutionIntent,
  OrderLifecycleState,
  OrderIdentification
} from '../../packages/contracts/src';

export class OrderManager {
  private orders: Map<string, CanonicalOrder> = new Map();

  /**
   * Inicializa una orden a partir de un ExecutionIntent aprobado por Risk
   */
  public createOrder(intent: ExecutionIntent): CanonicalOrder {
    const internalId = `GC-ORD-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const clientId = `GC-CID-${intent.symbol}-${Date.now()}`;

    const order: CanonicalOrder = {
      internalOrderId: internalId,
      clientOrderId: clientId,
      organizationId: intent.organizationId,
      accountId: intent.accountId,
      venue: intent.venue,
      symbol: intent.symbol,
      side: intent.side,
      orderType: intent.orderType,
      quantity: intent.quantity,
      price: intent.limitPrice,
      filledQuantity: 0,
      status: 'CREATED',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      reconciliationRequired: false
    };

    this.orders.set(order.clientOrderId, order);
    return order;
  }

  public transitionState(clientOrderId: string, newState: OrderLifecycleState, providerOrderId?: string): CanonicalOrder {
    const order = this.orders.get(clientOrderId);
    if (!order) {
      throw new Error(`Order with clientOrderId ${clientOrderId} not found in OMS.`);
    }

    // Regla 21: Si ocurre timeout de red, transicionar a UNKNOWN y marcar reconciliación obligatoria
    if (newState === 'UNKNOWN') {
      order.reconciliationRequired = true;
    }

    order.status = newState;
    if (providerOrderId) {
      order.providerOrderId = providerOrderId;
    }
    order.updatedAt = Date.now();

    return order;
  }

  public getOrder(clientOrderId: string): CanonicalOrder | undefined {
    return this.orders.get(clientOrderId);
  }
}
