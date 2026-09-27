import { KLineData } from 'klinecharts';

// Determinar si el símbolo es un par cripto válido en Binance Spot
const isSupportedBinanceCrypto = (sym: string): boolean => {
  if (['XAUUSD', 'EURUSD', 'GBPUSD', 'USDJPY'].includes(sym)) return false;
  if (sym.includes('!') || sym.includes('^') || sym.includes('(') || sym.includes(')')) return false;
  return /^[A-Z0-9]{2,10}(USDT|FDUSD|BTC|ETH)$/.test(sym);
};

export async function fetchRealHistoricalKlines(
  symbol: string,
  interval: string = '15m',
  limit = 200,
  fallbackPrice = 84500,
  endTime?: number
): Promise<KLineData[]> {
  const cleanSymbol = symbol.replace(/[\/\-\s]/g, '').toUpperCase();
  const endParam = endTime ? `&endTime=${endTime}` : '';

  // 1. Invocar el Realtime Market Data Gateway interno de Global City (Arquitectura Canónica)
  // El frontend NUNCA se conecta directamente a Binance ni expone endpoints externos.
  const gatewayUrl = `/api/market/klines?symbol=${cleanSymbol}&interval=${interval}&limit=${limit}${endParam}`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    const res = await fetch(gatewayUrl, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        return data as KLineData[];
      }
    }
  } catch (err) {
    // Si la red o el gateway están temporalmente no disponibles
  }

  // Si se pedían velas históricas anteriores (endTime) y no se obtuvieron por red, devolver array vacío para no duplicar velas
  if (endTime) {
    return [];
  }

  // Generador de contingencia si el backend está offline o sin conexión
  return generateFallbackHistoricalBars(fallbackPrice, limit, interval, endTime);
}

// Fallback generator if offline, network error or non-crypto asset (Forex/Metals/Futures)
export function generateFallbackHistoricalBars(
  basePrice: number,
  count = 120,
  interval: '1m' | '5m' | '15m' | '1h' | '4h' | '1D' = '15m',
  endTime?: number
): KLineData[] {
  const intervalMinutes = interval === '1m' ? 1 : interval === '5m' ? 5 : interval === '1h' ? 60 : interval === '4h' ? 240 : interval === '1D' ? 1440 : 15;
  const bars: KLineData[] = [];
  const endTimestamp = endTime || Date.now();
  const stepMs = intervalMinutes * 60 * 1000;
  let currentClose = basePrice;
  const volatility = basePrice * 0.0035;

  for (let i = count - 1; i >= 0; i--) {
    const timestamp = endTimestamp - i * stepMs;
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
