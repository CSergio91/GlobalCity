/**
 * ZYTI Trade - Bybit Native Adapter (Spot & Linear USDT-M Perpetuals)
 * Conexión WebSocket v5 oficial de Bybit sin librerías pesadas.
 * Soporta KLine, OrderBook 50 niveles y Ticker en tiempo real con Heartbeat obligatorio.
 */

import { MarketType, KLineBar, OrderBookPayload, MarketStats } from '../types';
import { BaseMarketAdapter } from './BaseMarketAdapter';

export class BybitAdapter extends BaseMarketAdapter {
  private lastStats: Map<string, MarketStats> = new Map();
  private lastBars: Map<string, KLineBar> = new Map();

  constructor() {
    super({
      exchangeId: 'bybit',
      baseDelayMs: 1000,
      maxDelayMs: 30000,
      maxCommandsPerSec: 10,
      idleDisconnectDelayMs: 4000,
      heartbeatIntervalMs: 20000 // Bybit desconecta si no hay ping en 30s
    });
  }

  protected getEndpointUrl(marketType: MarketType): string {
    return marketType === 'futures'
      ? 'wss://stream.bybit.com/v5/public/linear'
      : 'wss://stream.bybit.com/v5/public/spot';
  }

  private normalizeSymbol(symbol: string): string {
    return symbol.replace('/', '').toUpperCase();
  }

  private denormalizeSymbol(raw: string): string {
    if (raw.endsWith('USDT')) {
      const base = raw.replace('USDT', '');
      return `${base}/USDT`;
    }
    return raw;
  }

  private mapTimeframe(tf: string): string {
    const map: Record<string, string> = {
      '1m': '1',
      '3m': '3',
      '5m': '5',
      '15m': '15',
      '30m': '30',
      '1h': '60',
      '2h': '120',
      '4h': '240',
      '1d': 'D',
      '1D': 'D',
      '1w': 'W',
      '1M': 'M'
    };
    return map[tf] || '15';
  }

  protected sendSubscription(symbol: string, timeframe: string, marketType: MarketType): void {
    const sym = this.normalizeSymbol(symbol);
    const interval = this.mapTimeframe(timeframe);

    const args = [
      `kline.${interval}.${sym}`,
      `tickers.${sym}`,
      `orderbook.50.${sym}`
    ];

    this.sendCommand(marketType, {
      op: 'subscribe',
      args
    });
  }

  protected sendUnsubscription(symbol: string, marketType: MarketType): void {
    const sym = this.normalizeSymbol(symbol);
    const key = `${marketType}:${symbol}`;
    const interval = this.mapTimeframe(this.symbolTimeframes.get(key) || '15m');

    const args = [
      `kline.${interval}.${sym}`,
      `tickers.${sym}`,
      `orderbook.50.${sym}`
    ];

    this.sendCommand(marketType, {
      op: 'unsubscribe',
      args
    });
  }

  protected handleRawMessage(rawData: string, marketType: MarketType): void {
    try {
      const msg = JSON.parse(rawData);
      if (!msg) return;

      // Respuesta al ping
      if (msg.op === 'pong' || msg.ret_msg === 'pong') return;

      const topic: string = msg.topic || '';
      const data = msg.data;
      if (!data) return;

      // 1. KLine
      if (topic.startsWith('kline.')) {
        const parts = topic.split('.');
        const sym = this.denormalizeSymbol(parts[2] || '');
        const barData = Array.isArray(data) ? data[0] : data;
        if (!barData) return;

        const closePrice = parseFloat(barData.close);
        if (isNaN(closePrice) || closePrice <= 0) return;

        const bar: KLineBar = {
          timestamp: parseInt(barData.start || barData.timestamp, 10),
          open: parseFloat(barData.open),
          high: parseFloat(barData.high),
          low: parseFloat(barData.low),
          close: closePrice,
          volume: parseFloat(barData.volume) || 0
        };

        const key = `${marketType}:${sym}`;
        this.lastBars.set(key, bar);

        const prevStats = this.lastStats.get(key);
        const stats: MarketStats = {
          symbol: sym,
          exchange: this.exchangeId,
          marketType,
          lastPrice: bar.close,
          change24h: prevStats?.change24h ?? 0,
          high24h: Math.max(bar.high, prevStats?.high24h ?? bar.high),
          low24h: Math.min(bar.low, prevStats?.low24h ?? bar.low),
          volume24h: prevStats?.volume24h ?? bar.volume,
          fundingRate: prevStats?.fundingRate,
          nextFundingTime: prevStats?.nextFundingTime
        };
        this.lastStats.set(key, stats);

        this.emit({
          type: 'TICK_UPDATE',
          payload: { symbol: sym, bar, stats }
        });
      }

      // 2. Tickers L1
      else if (topic.startsWith('tickers.')) {
        const parts = topic.split('.');
        const sym = this.denormalizeSymbol(parts[1] || data.symbol || '');
        const key = `${marketType}:${sym}`;
        const prevStats = this.lastStats.get(key);

        const rawPrice = parseFloat(data.lastPrice);
        const lastPrice = !isNaN(rawPrice) && rawPrice > 0 ? rawPrice : (prevStats?.lastPrice || 0);

        // Si no hay precio válido todavía, evitar emitir ceros
        if (lastPrice <= 0) return;

        let change24h = prevStats?.change24h ?? 0;
        if (data.price24hPcnt !== undefined && data.price24hPcnt !== null && data.price24hPcnt !== '') {
          const parsed = parseFloat(data.price24hPcnt) * 100;
          if (!isNaN(parsed)) {
            change24h = Number(parsed.toFixed(2));
          }
        }

        const high24h = parseFloat(data.highPrice24h) || prevStats?.high24h || lastPrice;
        const low24h = parseFloat(data.lowPrice24h) || prevStats?.low24h || lastPrice;
        const volume24h = parseFloat(data.volume24h) || prevStats?.volume24h || 0;

        const stats: MarketStats = {
          symbol: sym,
          exchange: this.exchangeId,
          marketType,
          lastPrice,
          change24h: Number(change24h.toFixed(2)),
          high24h,
          low24h,
          volume24h,
          fundingRate: data.fundingRate ? parseFloat(data.fundingRate) : prevStats?.fundingRate,
          nextFundingTime: data.nextFundingTime ? parseInt(data.nextFundingTime, 10) : prevStats?.nextFundingTime
        };

        this.lastStats.set(key, stats);

        this.emit({
          type: 'TICKER',
          payload: { exchange: this.exchangeId, symbol: sym, marketType, stats }
        });
      }

      // 3. Order Book L2
      else if (topic.startsWith('orderbook.')) {
        const parts = topic.split('.');
        const sym = this.denormalizeSymbol(parts[2] || '');

        const bids = (data.b || []).slice(0, 10).map((b: string[]) => ({
          price: parseFloat(b[0]),
          amount: parseFloat(b[1]),
          total: parseFloat(b[1])
        }));

        const asks = (data.a || []).slice(0, 10).map((a: string[]) => ({
          price: parseFloat(a[0]),
          amount: parseFloat(a[1]),
          total: parseFloat(a[1])
        }));

        this.emit({
          type: 'ORDERBOOK_UPDATE',
          payload: {
            symbol: sym,
            exchange: this.exchangeId,
            marketType,
            timestamp: msg.ts || Date.now(),
            bids,
            asks
          }
        });
      }
    } catch {}
  }

  protected startHeartbeat(marketType: MarketType): void {
    const timer = setInterval(() => {
      const ws = this.sockets.get(marketType);
      if (ws && ws.readyState === WebSocket.OPEN) {
        try {
          ws.send(JSON.stringify({ op: 'ping' }));
        } catch {}
      }
    }, this.heartbeatIntervalMs);

    this.heartbeatTimers.set(marketType, timer);
  }

  protected stopHeartbeat(marketType: MarketType): void {
    const timer = this.heartbeatTimers.get(marketType);
    if (timer) {
      clearInterval(timer);
      this.heartbeatTimers.delete(marketType);
    }
  }
}
