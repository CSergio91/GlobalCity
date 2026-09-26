/**
 * Service: positionStorage.ts
 * Arquitectura de persistencia para operaciones, posiciones abiertas y PnL multivenue.
 * Actualmente persistido en LocalStorage con capa de abstracción desacoplada
 * lista para migración directa a PostgreSQL / Supabase / Redis sin refactorizar la UI.
 */

export interface OpenPosition {
  id: string;
  accountId: string;
  venueId: string;
  venueName: string;
  symbol: string;
  side: 'LONG' | 'SHORT';
  size: number; // Cantidad base
  entryPrice: number;
  markPrice: number;
  leverage: number;
  marginUsed: number;
  unrealizedPnl: number;
  unrealizedPnlPct: number;
  realizedPnl: number;
  liquidationPrice: number;
  stopLoss?: number;
  takeProfit?: number;
  openedAt: string;
  updatedAt: string;
}

export interface ClosedTrade {
  id: string;
  positionId: string;
  venueId: string;
  venueName: string;
  symbol: string;
  side: 'LONG' | 'SHORT';
  size: number;
  entryPrice: number;
  exitPrice: number;
  realizedPnl: number;
  pnlPct: number;
  closedAt: string;
}

export interface PerformanceMetrics {
  totalEquity: number;
  openPositionsCount: number;
  totalMarginUsed: number;
  unrealizedPnl: number;
  realizedPnl: number;
  netPnl: number;
  maxDrawdownPct: number;
  maxDrawdownUsd: number;
  highWaterMark: number;
}

const POSITIONS_STORAGE_KEY = 'globalcity_open_positions';
const CLOSED_TRADES_KEY = 'globalcity_closed_trades';
const PERFORMANCE_KEY = 'globalcity_performance_history';

// Adaptador de almacenamiento desacoplado (actualmente LocalStorage, compatible con Supabase / Postgres)
export const positionStorage = {
  
  /**
   * Obtiene todas las posiciones abiertas activas
   */
  getPositions(): OpenPosition[] {
    try {
      const raw = localStorage.getItem(POSITIONS_STORAGE_KEY);
      if (!raw) return [];
      return JSON.parse(raw);
    } catch (err) {
      console.error('Error reading positions from storage:', err);
      return [];
    }
  },

  /**
   * Guarda posiciones abiertas y despacha evento reactivo
   */
  savePositions(positions: OpenPosition[]): void {
    try {
      localStorage.setItem(POSITIONS_STORAGE_KEY, JSON.stringify(positions));
      window.dispatchEvent(new CustomEvent('globalcity_positions_changed'));
    } catch (err) {
      console.error('Error saving positions to storage:', err);
    }
  },

  /**
   * Suscribe a cambios en operaciones
   */
  subscribe(callback: () => void): () => void {
    const handler = () => callback();
    window.addEventListener('globalcity_positions_changed', handler);
    window.addEventListener('storage', handler);
    return () => {
      window.removeEventListener('globalcity_positions_changed', handler);
      window.removeEventListener('storage', handler);
    };
  },

  /**
   * Abre o simula una nueva posición en un exchange
   */
  openPosition(params: {
    accountId: string;
    venueId: string;
    venueName: string;
    symbol: string;
    side: 'LONG' | 'SHORT';
    size: number;
    entryPrice: number;
    leverage?: number;
  }): OpenPosition {
    const leverage = params.leverage || 10;
    const notional = params.size * params.entryPrice;
    const marginUsed = notional / leverage;
    const liqOffset = params.side === 'LONG' ? (1 - 0.9 / leverage) : (1 + 0.9 / leverage);

    const newPos: OpenPosition = {
      id: `pos_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      accountId: params.accountId,
      venueId: params.venueId,
      venueName: params.venueName,
      symbol: params.symbol,
      side: params.side,
      size: params.size,
      entryPrice: params.entryPrice,
      markPrice: params.entryPrice,
      leverage,
      marginUsed,
      unrealizedPnl: 0,
      unrealizedPnlPct: 0,
      realizedPnl: 0,
      liquidationPrice: Number((params.entryPrice * liqOffset).toFixed(params.symbol.includes('EUR') ? 5 : 2)),
      openedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const current = this.getPositions();
    const updated = [newPos, ...current];
    this.savePositions(updated);
    return newPos;
  },

  /**
   * Cierra una posición registrando su PnL realizado
   */
  closePosition(id: string, exitPrice: number): ClosedTrade | null {
    const current = this.getPositions();
    const pos = current.find(p => p.id === id);
    if (!pos) return null;

    const diff = pos.side === 'LONG' ? (exitPrice - pos.entryPrice) : (pos.entryPrice - exitPrice);
    const finalRealizedPnl = diff * pos.size;
    const pnlPct = (diff / pos.entryPrice) * 100 * pos.leverage;

    const closedRecord: ClosedTrade = {
      id: `trade_${Date.now()}`,
      positionId: pos.id,
      venueId: pos.venueId,
      venueName: pos.venueName,
      symbol: pos.symbol,
      side: pos.side,
      size: pos.size,
      entryPrice: pos.entryPrice,
      exitPrice,
      realizedPnl: finalRealizedPnl,
      pnlPct,
      closedAt: new Date().toISOString()
    };

    // Guardar trade cerrado
    this.saveClosedTrade(closedRecord);

    // Remover de posiciones abiertas
    const remaining = current.filter(p => p.id !== id);
    this.savePositions(remaining);

    return closedRecord;
  },

  /**
   * Obtiene historial de trades cerrados
   */
  getClosedTrades(): ClosedTrade[] {
    try {
      const raw = localStorage.getItem(CLOSED_TRADES_KEY);
      if (!raw) return [];
      return JSON.parse(raw);
    } catch {
      return [];
    }
  },

  saveClosedTrade(trade: ClosedTrade): void {
    try {
      const history = this.getClosedTrades();
      const updated = [trade, ...history];
      localStorage.setItem(CLOSED_TRADES_KEY, JSON.stringify(updated.slice(0, 100)));
      window.dispatchEvent(new CustomEvent('globalcity_positions_changed'));
    } catch (err) {
      console.error('Error saving closed trade:', err);
    }
  },

  /**
   * Actualiza el mark price y el PnL no realizado con cotizaciones en vivo
   */
  updateMarkPrices(symbolPriceMap: Record<string, number>): void {
    const current = this.getPositions();
    if (current.length === 0) return;

    let hasChanged = false;
    const updated = current.map(pos => {
      const livePrice = symbolPriceMap[pos.symbol];
      if (!livePrice || Math.abs(livePrice - pos.markPrice) < 0.000001) return pos;

      hasChanged = true;
      const diff = pos.side === 'LONG' ? (livePrice - pos.entryPrice) : (pos.entryPrice - livePrice);
      const unrealizedPnl = diff * pos.size;
      const unrealizedPnlPct = (diff / pos.entryPrice) * 100 * pos.leverage;

      return {
        ...pos,
        markPrice: livePrice,
        unrealizedPnl,
        unrealizedPnlPct,
        updatedAt: new Date().toISOString()
      };
    });

    if (hasChanged) {
      this.savePositions(updated);
    }
  },

  /**
   * Calcula resumen consolidado de métricas de rendimiento en tiempo real
   */
  getPerformanceMetrics(totalEquityFromAccounts: number): PerformanceMetrics {
    const openPositions = this.getPositions();
    const closedTrades = this.getClosedTrades();

    const openPositionsCount = openPositions.length;
    const totalMarginUsed = openPositions.reduce((acc, p) => acc + (p.marginUsed || 0), 0);
    const unrealizedPnl = openPositions.reduce((acc, p) => acc + (p.unrealizedPnl || 0), 0);
    const realizedPnl = closedTrades.reduce((acc, t) => acc + (t.realizedPnl || 0), 0);
    const netPnl = realizedPnl + unrealizedPnl;

    // Capital total consolidado (base balance + uPnL flotante)
    const effectiveEquity = Math.max(0, totalEquityFromAccounts + unrealizedPnl);

    // Calcular High-Water Mark y Max Drawdown
    let maxDrawdownPct = 0;
    let maxDrawdownUsd = 0;
    let highWaterMark = totalEquityFromAccounts;

    if (effectiveEquity > 0) {
      // Simulación de DD basada en pérdidas flotantes y trades cerrados negativos
      const negativeTrades = closedTrades.filter(t => t.realizedPnl < 0);
      const worstClosedLoss = negativeTrades.reduce((acc, t) => Math.min(acc, t.realizedPnl), 0);
      const worstFloatingLoss = Math.min(0, unrealizedPnl);
      const totalPotentialLoss = Math.abs(worstClosedLoss + worstFloatingLoss);

      maxDrawdownUsd = totalPotentialLoss;
      highWaterMark = Math.max(totalEquityFromAccounts, effectiveEquity + maxDrawdownUsd);
      maxDrawdownPct = highWaterMark > 0 ? (maxDrawdownUsd / highWaterMark) * 100 : 0;
    }

    return {
      totalEquity: effectiveEquity,
      openPositionsCount,
      totalMarginUsed,
      unrealizedPnl,
      realizedPnl,
      netPnl,
      maxDrawdownPct,
      maxDrawdownUsd,
      highWaterMark
    };
  }
};
