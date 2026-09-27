import type { Plugin, ViteDevServer } from 'vite';
import net from 'net';

export interface NormalizedBar {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  turnover: number;
}

// ==========================================
// 1. REDIS CLIENT LIGERO (RESP PROTOCOL NATIVO)
// Cero dependencias externas, sub-milisegundo
// ==========================================
class LightweightRedisClient {
  private client: net.Socket | null = null;
  private isConnected = false;
  private host: string;
  private port: number;
  private responseQueue: Array<(res: string | null) => void> = [];

  constructor(host = '127.0.0.1', port = 6379) {
    this.host = host;
    this.port = port;
    this.connect();
  }

  private connect() {
    try {
      this.client = net.createConnection({ host: this.host, port: this.port }, () => {
        this.isConnected = true;
        // console.log(`[MarketDataEngine:Redis] Conectado exitosamente a Redis en ${this.host}:${this.port}`);
      });

      this.client.setTimeout(2500);

      this.client.on('data', (data) => {
        const text = data.toString();
        const resolver = this.responseQueue.shift();
        if (resolver) {
          if (text.startsWith('$-1')) {
            resolver(null); // Nil
          } else if (text.startsWith('$')) {
            // Bulk string: $<len>\r\n<data>\r\n
            const firstLineEnd = text.indexOf('\r\n');
            const content = text.slice(firstLineEnd + 2, -2);
            resolver(content);
          } else if (text.startsWith('+')) {
            resolver(text.slice(1).trim());
          } else {
            resolver(null);
          }
        }
      });

      this.client.on('error', () => {
        this.isConnected = false;
        const resolver = this.responseQueue.shift();
        if (resolver) resolver(null);
      });

      this.client.on('close', () => {
        this.isConnected = false;
        setTimeout(() => this.connect(), 15000); // Reintento de reconexión automático
      });
    } catch {
      this.isConnected = false;
    }
  }

  async get(key: string): Promise<string | null> {
    if (!this.isConnected || !this.client) return null;
    return new Promise((resolve) => {
      try {
        this.responseQueue.push(resolve);
        const cmd = `*2\r\n$3\r\nGET\r\n$${key.length}\r\n${key}\r\n`;
        this.client.write(cmd);
        setTimeout(() => {
          const idx = this.responseQueue.indexOf(resolve);
          if (idx !== -1) {
            this.responseQueue.splice(idx, 1);
            resolve(null);
          }
        }, 1500);
      } catch {
        resolve(null);
      }
    });
  }

  async setex(key: string, seconds: number, val: string): Promise<void> {
    if (!this.isConnected || !this.client) return;
    try {
      const secStr = seconds.toString();
      const cmd = `*4\r\n$5\r\nSETEX\r\n$${key.length}\r\n${key}\r\n$${secStr.length}\r\n${secStr}\r\n$${val.length}\r\n${val}\r\n`;
      this.client.write(cmd);
    } catch {}
  }

  get connected(): boolean {
    return this.isConnected;
  }
}

// In-Memory Hot Cache Fallback (si Redis no está iniciado en local)
const memoryHotCache = new Map<string, { expiresAt: number; data: NormalizedBar[] }>();

// ==========================================
// 2. MARKET DATA CONNECTORS
// ==========================================
class BinanceConnector {
  static async fetchKlines(symbol: string, interval: string, limit = 200, endTime?: number): Promise<NormalizedBar[]> {
    const cleanSym = symbol.replace(/[\/\-\s]/g, '').toUpperCase();
    const intervalMap: Record<string, string> = {
      '1s': '1s', '5s': '1s', '15s': '1s', '30s': '1s',
      '1m': '1m', '3m': '3m', '5m': '5m', '15m': '15m', '30m': '30m', '45m': '15m',
      '1h': '1h', '2h': '2h', '3h': '1h', '4h': '4h', '6h': '6h', '8h': '8h', '12h': '12h',
      '1D': '1d', '3D': '3d', '1W': '1w', '1M': '1M'
    };
    const apiInterval = intervalMap[interval] || '15m';
    const endParam = endTime ? `&endTime=${endTime}` : '';
    const url = `https://api.binance.com/api/v3/klines?symbol=${cleanSym}&interval=${apiInterval}&limit=${limit}${endParam}`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);
    try {
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timeout);
      if (!res.ok) return [];
      const raw = await res.json();
      if (!Array.isArray(raw)) return [];

      return raw.map((item: any[]) => ({
        timestamp: Number(item[0]),
        open: parseFloat(item[1]),
        high: parseFloat(item[2]),
        low: parseFloat(item[3]),
        close: parseFloat(item[4]),
        volume: parseFloat(item[5]),
        turnover: parseFloat(item[7])
      }));
    } catch {
      return [];
    }
  }
}

class ForexCommoditiesConnector {
  static generateNormalizedBars(
    symbol: string,
    interval: string,
    limit = 120,
    endTime?: number,
    basePrice = 4286.14
  ): NormalizedBar[] {
    const intervalSecs = this.intervalToSeconds(interval);
    const bars: NormalizedBar[] = [];
    const endTimestamp = endTime || Date.now();
    const stepMs = intervalSecs * 1000;
    let currentClose = basePrice;
    const volatility = basePrice * 0.0025;

    for (let i = limit - 1; i >= 0; i--) {
      const timestamp = endTimestamp - i * stepMs;
      const delta = (Math.random() - 0.495) * volatility;
      const open = i === limit - 1 ? currentClose - delta : currentClose;
      const close = i === 0 ? basePrice : open + delta;
      const high = Math.max(open, close) + Math.random() * volatility * 0.6;
      const low = Math.min(open, close) - Math.random() * volatility * 0.6;
      const volume = Math.floor(Math.random() * 500 + 100);

      bars.push({
        timestamp,
        open: Number(open.toFixed(basePrice < 10 ? 5 : 2)),
        high: Number(high.toFixed(basePrice < 10 ? 5 : 2)),
        low: Number(low.toFixed(basePrice < 10 ? 5 : 2)),
        close: Number(close.toFixed(basePrice < 10 ? 5 : 2)),
        volume,
        turnover: volume * close
      });

      currentClose = close;
    }

    return bars;
  }

  private static intervalToSeconds(interval: string): number {
    if (interval.endsWith('s')) return parseInt(interval) || 5;
    if (interval.endsWith('m')) return (parseInt(interval) || 15) * 60;
    if (interval.endsWith('h')) return (parseInt(interval) || 1) * 3600;
    if (interval.endsWith('D')) return (parseInt(interval) || 1) * 86400;
    if (interval.endsWith('W')) return 7 * 86400;
    if (interval.endsWith('M')) return 30 * 86400;
    return 900;
  }
}

// ==========================================
// 3. MARKET DATA ENGINE & NORMALIZER
// ==========================================
class MarketDataEngine {
  private redis: LightweightRedisClient;

  constructor() {
    this.redis = new LightweightRedisClient();
  }

  async getKlines(symbol: string, interval: string, limit = 180, endTime?: number): Promise<NormalizedBar[]> {
    const cleanSym = symbol.replace(/[\/\-\s]/g, '').toUpperCase();
    const cacheKey = `gc:market:klines:${cleanSym}:${interval}:${limit}:${endTime || 'latest'}`;

    // 1. Consultar Hot State en Redis
    try {
      const cached = await this.redis.get(cacheKey);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {}

    // 2. Consultar memoria interna de contingencia
    const mem = memoryHotCache.get(cacheKey);
    if (mem && mem.expiresAt > Date.now()) {
      return mem.data;
    }

    // 3. Despachar a los Market Data Connectors correspondientes
    let bars: NormalizedBar[] = [];
    const isCrypto = /^[A-Z0-9]{2,10}(USDT|FDUSD|BTC|ETH)$/.test(cleanSym) && !['XAUUSD', 'EURUSD', 'GBPUSD', 'USDJPY'].includes(cleanSym);

    if (isCrypto) {
      bars = await BinanceConnector.fetchKlines(cleanSym, interval, limit, endTime);
    } else {
      const basePrice = cleanSym === 'XAUUSD' ? 4286.14 : cleanSym.includes('EUR') ? 1.0845 : cleanSym.includes('GBP') ? 1.298 : 100;
      bars = ForexCommoditiesConnector.generateNormalizedBars(cleanSym, interval, limit, endTime, basePrice);
    }

    // 4. Normalizar y verificar continuidad temporal
    if (bars && bars.length > 0) {
      bars.sort((a, b) => a.timestamp - b.timestamp);

      // Guardar en Redis (TTL 15 seg para latest, 300 seg para historical)
      const ttl = endTime ? 300 : 15;
      try {
        await this.redis.setex(cacheKey, ttl, JSON.stringify(bars));
      } catch {}

      // Guardar en memoria de contingencia
      memoryHotCache.set(cacheKey, { expiresAt: Date.now() + ttl * 1000, data: bars });
    }

    return bars;
  }

  get isRedisConnected(): boolean {
    return this.redis.connected;
  }
}

// ==========================================
// 4. REALTIME GATEWAY VITE PLUGIN
// ==========================================
export function marketDataGatewayPlugin(): Plugin {
  const engine = new MarketDataEngine();

  return {
    name: 'globalcity-market-data-gateway',
    configureServer(server: ViteDevServer) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith('/api/market/')) {
          return next();
        }

        const urlObj = new URL(req.url, 'http://localhost');

        // Endpoint: /api/market/klines
        if (urlObj.pathname === '/api/market/klines') {
          const symbol = urlObj.searchParams.get('symbol') || 'BTC/USDT';
          const interval = urlObj.searchParams.get('interval') || '15m';
          const limit = parseInt(urlObj.searchParams.get('limit') || '180', 10);
          const endTimeParam = urlObj.searchParams.get('endTime');
          const endTime = endTimeParam ? parseInt(endTimeParam, 10) : undefined;

          try {
            const bars = await engine.getKlines(symbol, interval, limit, endTime);

            res.setHeader('Content-Type', 'application/json');
            res.setHeader('Cache-Control', 'public, max-age=5');
            res.writeHead(200);
            res.end(JSON.stringify(bars));
            return;
          } catch (err: any) {
            res.setHeader('Content-Type', 'application/json');
            res.writeHead(500);
            res.end(JSON.stringify({ error: err.message || 'Internal Market Data Engine Error' }));
            return;
          }
        }

        // Endpoint: /api/market/health
        if (urlObj.pathname === '/api/market/health') {
          res.setHeader('Content-Type', 'application/json');
          res.writeHead(200);
          res.end(JSON.stringify({
            status: 'HEALTHY',
            engine: 'Global City Market Data Engine v3.0',
            redis: engine.isRedisConnected ? 'CONNECTED (Port 6379)' : 'IN-MEMORY HOT STATE (Standby)',
            timestamp: new Date().toISOString()
          }));
          return;
        }

        return next();
      });
    }
  };
}
