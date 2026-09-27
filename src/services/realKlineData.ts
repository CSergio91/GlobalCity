import { KLineData } from 'klinecharts';

export async function fetchRealHistoricalKlines(
  symbol: string,
  interval: '1m' | '5m' | '15m' | '1h' | '4h' | '1D' = '15m',
  limit = 150,
  fallbackPrice = 84500
): Promise<KLineData[]> {
  try {
    // Normalize symbol for Binance Public API (e.g. "BTC/USDT" -> "BTCUSDT")
    const cleanSymbol = symbol.replace(/[\/-]/g, '').toUpperCase();
    const intervalMap: Record<string, string> = {
      '1m': '1m',
      '5m': '5m',
      '15m': '15m',
      '1h': '1h',
      '4h': '4h',
      '1D': '1d'
    };
    const apiInterval = intervalMap[interval] || '15m';

    const url = `https://api.binance.com/api/v3/klines?symbol=${cleanSymbol}&interval=${apiInterval}&limit=${limit}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!res.ok) {
      throw new Error(`Binance klines API status: ${res.status}`);
    }

    const rawData = await res.json();
    if (!Array.isArray(rawData) || rawData.length === 0) {
      throw new Error('Empty klines array received');
    }

    // Map Binance raw array to KLineChart canonical KLineData format
    const bars: KLineData[] = rawData.map((item: any[]) => ({
      timestamp: Number(item[0]),
      open: parseFloat(item[1]),
      high: parseFloat(item[2]),
      low: parseFloat(item[3]),
      close: parseFloat(item[4]),
      volume: parseFloat(item[5]),
      turnover: parseFloat(item[7])
    }));

    return bars;
  } catch (err) {
    console.warn(`[KLineFeed] Fallback to synthetic bars for ${symbol}:`, err);
    return generateFallbackHistoricalBars(fallbackPrice, limit, interval);
  }
}

// Fallback generator if offline, network error or non-crypto asset (Forex/Metals)
export function generateFallbackHistoricalBars(
  basePrice: number,
  count = 120,
  interval: '1m' | '5m' | '15m' | '1h' | '4h' | '1D' = '15m'
): KLineData[] {
  const intervalMinutes = interval === '1m' ? 1 : interval === '5m' ? 5 : interval === '1h' ? 60 : interval === '4h' ? 240 : interval === '1D' ? 1440 : 15;
  const bars: KLineData[] = [];
  const now = Date.now();
  const stepMs = intervalMinutes * 60 * 1000;
  let currentClose = basePrice;
  const volatility = basePrice * 0.0035;

  for (let i = count - 1; i >= 0; i--) {
    const timestamp = now - i * stepMs;
    const delta = (Math.random() - 0.495) * volatility;
    const open = i === count - 1 ? currentClose - delta : currentClose;
    const close = i === 0 ? basePrice : open + delta;
    const high = Math.max(open, close) + Math.random() * volatility * 0.7;
    const low = Math.min(open, close) - Math.random() * volatility * 0.7;
    const volume = Math.floor(Math.random() * 80 + 20);

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
