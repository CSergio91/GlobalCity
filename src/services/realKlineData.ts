import { KLineData } from 'klinecharts';

export async function fetchRealHistoricalKlines(
  symbol: string,
  interval: '1m' | '5m' | '15m' | '1h' | '4h' | '1D' = '15m',
  limit = 200,
  fallbackPrice = 84500
): Promise<KLineData[]> {
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

  // Lista de endpoints espejo públicos para garantizar datos reales sin bloqueos de IP
  const candidateUrls = [
    `/api-binance/api/v3/klines?symbol=${cleanSymbol}&interval=${apiInterval}&limit=${limit}`,
    `https://data-api.binance.vision/api/v3/klines?symbol=${cleanSymbol}&interval=${apiInterval}&limit=${limit}`,
    `https://api.binance.com/api/v3/klines?symbol=${cleanSymbol}&interval=${apiInterval}&limit=${limit}`,
    `https://api1.binance.com/api/v3/klines?symbol=${cleanSymbol}&interval=${apiInterval}&limit=${limit}`
  ];

  for (const url of candidateUrls) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4500);

      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (!res.ok) continue;

      const rawData = await res.json();
      if (!Array.isArray(rawData) || rawData.length === 0) continue;

      // Mapear el array crudo al formato canónico KLineData
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
    } catch {
      // Intentar siguiente endpoint espejo
      continue;
    }
  }

  // Si todos los endpoints de red fallaron por estar offline
  console.warn(`[KLineFeed] Sin conexión con endpoints públicos para ${symbol}. Usando velas locales de contingencia.`);
  return generateFallbackHistoricalBars(fallbackPrice, limit, interval);
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
