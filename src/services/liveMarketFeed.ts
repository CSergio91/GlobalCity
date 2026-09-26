import { useState, useEffect, useRef } from 'react';

export interface MarketAssetTick {
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  volume24h: string;
  category: 'crypto' | 'forex' | 'futures';
  venues: string;
  direction?: 'up' | 'down' | 'same';
  lastUpdated?: number;
}

export const INITIAL_MARKET_TICKS: MarketAssetTick[] = [
  {
    symbol: "BTC/USDT",
    name: "Bitcoin Perpetual",
    price: 84310.20,
    change24h: 3.82,
    volume24h: "$28.4B",
    category: "crypto",
    venues: "Binance · Bybit · OKX · KuCoin · Hyperliquid"
  },
  {
    symbol: "ETH/USDT",
    name: "Ethereum Perpetual",
    price: 2728.50,
    change24h: 2.15,
    volume24h: "$12.1B",
    category: "crypto",
    venues: "Binance · Bybit · OKX · KuCoin · Coinbase"
  },
  {
    symbol: "SOL/USDT",
    name: "Solana Perpetual",
    price: 186.40,
    change24h: 7.24,
    volume24h: "$4.8B",
    category: "crypto",
    venues: "Binance · Bybit · OKX · KuCoin · Hyperliquid"
  },
  {
    symbol: "BNB/USDT",
    name: "BNB Chain Perpetual",
    price: 642.80,
    change24h: 1.45,
    volume24h: "$1.9B",
    category: "crypto",
    venues: "Binance · OKX · Bybit · KuCoin"
  },
  {
    symbol: "XRP/USDT",
    name: "Ripple Perpetual",
    price: 2.18,
    change24h: 4.12,
    volume24h: "$3.5B",
    category: "crypto",
    venues: "Binance · Bybit · OKX · KuCoin"
  },
  {
    symbol: "DOGE/USDT",
    name: "Dogecoin Perpetual",
    price: 0.245,
    change24h: 6.85,
    volume24h: "$2.7B",
    category: "crypto",
    venues: "Binance · Bybit · OKX · KuCoin"
  },
  {
    symbol: "ADA/USDT",
    name: "Cardano Perpetual",
    price: 0.784,
    change24h: -1.20,
    volume24h: "$850M",
    category: "crypto",
    venues: "Binance · OKX · Bybit"
  },
  {
    symbol: "AVAX/USDT",
    name: "Avalanche Perpetual",
    price: 34.20,
    change24h: 3.10,
    volume24h: "$620M",
    category: "crypto",
    venues: "Binance · Bybit · KuCoin"
  },
  {
    symbol: "LINK/USDT",
    name: "Chainlink Perpetual",
    price: 18.90,
    change24h: 5.45,
    volume24h: "$480M",
    category: "crypto",
    venues: "Binance · OKX · Bybit"
  },
  {
    symbol: "SUI/USDT",
    name: "Sui Network Perpetual",
    price: 3.25,
    change24h: 8.90,
    volume24h: "$1.2B",
    category: "crypto",
    venues: "Binance · Bybit · KuCoin · OKX"
  },
  {
    symbol: "NEAR/USDT",
    name: "NEAR Protocol",
    price: 6.42,
    change24h: 4.30,
    volume24h: "$410M",
    category: "crypto",
    venues: "Binance · Bybit · OKX"
  },
  {
    symbol: "DOT/USDT",
    name: "Polkadot Perpetual",
    price: 7.95,
    change24h: 1.15,
    volume24h: "$320M",
    category: "crypto",
    venues: "Binance · OKX · KuCoin"
  },
  {
    symbol: "PEPE/USDT",
    name: "Pepe Memecoin",
    price: 0.0000185,
    change24h: 12.40,
    volume24h: "$1.8B",
    category: "crypto",
    venues: "Binance · Bybit · OKX · KuCoin"
  },
  {
    symbol: "SHIB/USDT",
    name: "Shiba Inu Perpetual",
    price: 0.0000248,
    change24h: 3.80,
    volume24h: "$750M",
    category: "crypto",
    venues: "Binance · OKX · Bybit"
  },
  {
    symbol: "ARB/USDT",
    name: "Arbitrum Perpetual",
    price: 0.88,
    change24h: 2.90,
    volume24h: "$290M",
    category: "crypto",
    venues: "Binance · Bybit · OKX"
  },
  {
    symbol: "OP/USDT",
    name: "Optimism Perpetual",
    price: 1.95,
    change24h: 3.75,
    volume24h: "$210M",
    category: "crypto",
    venues: "Binance · Bybit · KuCoin"
  },
  {
    symbol: "TIA/USDT",
    name: "Celestia Perpetual",
    price: 6.80,
    change24h: -2.40,
    volume24h: "$190M",
    category: "crypto",
    venues: "Binance · OKX · Bybit"
  },
  {
    symbol: "RENDER/USDT",
    name: "Render Network",
    price: 7.15,
    change24h: 4.80,
    volume24h: "$340M",
    category: "crypto",
    venues: "Binance · Bybit · OKX"
  },
  {
    symbol: "INJ/USDT",
    name: "Injective Perpetual",
    price: 24.60,
    change24h: 5.15,
    volume24h: "$260M",
    category: "crypto",
    venues: "Binance · KuCoin · Bybit"
  },
  {
    symbol: "EUR/USD",
    name: "Euro / US Dollar",
    price: 1.08452,
    change24h: -0.18,
    volume24h: "$14.2B",
    category: "forex",
    venues: "cTrader · MetaTrader 5 · QuickFIX"
  },
  {
    symbol: "GBP/USD",
    name: "British Pound / US Dollar",
    price: 1.29840,
    change24h: 0.32,
    volume24h: "$9.6B",
    category: "forex",
    venues: "cTrader · MetaTrader 5"
  },
  {
    symbol: "USD/JPY",
    name: "US Dollar / Japanese Yen",
    price: 154.62,
    change24h: 0.45,
    volume24h: "$18.4B",
    category: "forex",
    venues: "cTrader · MetaTrader 5"
  },
  {
    symbol: "XAU/USD",
    name: "Gold Spot vs Dollar",
    price: 4286.14,
    change24h: 0.92,
    volume24h: "$12.8B",
    category: "forex",
    venues: "MetaTrader 5 · cTrader · Currenex"
  },
  {
    symbol: "ES1! (S&P 500)",
    name: "E-mini S&P 500 Futures",
    price: 7805.75,
    change24h: 0.51,
    volume24h: "$34.5B",
    category: "futures",
    venues: "CME Group · QuickFIX DMA"
  },
  {
    symbol: "NQ1! (Nasdaq 100)",
    name: "E-mini Nasdaq 100 Futures",
    price: 30919.00,
    change24h: 0.85,
    volume24h: "$28.2B",
    category: "futures",
    venues: "CME Group · ICE Futures"
  }
];

// Singleton Shared Market Feed State
let sharedTicks: MarketAssetTick[] = INITIAL_MARKET_TICKS;
let sharedIsConnected = false;
const listeners = new Set<(ticks: MarketAssetTick[], isConnected: boolean) => void>();

let activeWs: WebSocket | null = null;
let reconnectTimer: any = null;
let disconnectTimer: any = null;
let macroInterval: any = null;

function notifyListeners() {
  for (const listener of listeners) {
    listener(sharedTicks, sharedIsConnected);
  }
}

// 1. Fetch live Forex rates as baseline from open exchange API
async function fetchForexBaseline() {
  try {
    const res = await fetch('https://open.er-api.com/v6/latest/USD');
    if (!res.ok) return;
    const data = await res.json();
    if (data && data.rates) {
      const eurRate = data.rates.EUR ? 1 / data.rates.EUR : 1.0845;
      const gbpRate = data.rates.GBP ? 1 / data.rates.GBP : 1.2984;
      const jpyRate = data.rates.JPY ? data.rates.JPY : 154.62;
      
      sharedTicks = sharedTicks.map(t => {
        if (t.symbol === 'EUR/USD') return { ...t, price: Number(eurRate.toFixed(5)) };
        if (t.symbol === 'GBP/USD') return { ...t, price: Number(gbpRate.toFixed(5)) };
        if (t.symbol === 'USD/JPY') return { ...t, price: Number(jpyRate.toFixed(2)) };
        return t;
      });
      notifyListeners();
    }
  } catch {
    // Fallback gracefully to default ticks
  }
}

// 2. Connect to Binance Public WebSocket API (Multi-stream real-time tickers)
function connectBinanceWS() {
  if (listeners.size === 0) return;
  if (activeWs && (activeWs.readyState === WebSocket.CONNECTING || activeWs.readyState === WebSocket.OPEN)) {
    return;
  }

  try {
    const streams = [
      'btcusdt@ticker',
      'ethusdt@ticker',
      'solusdt@ticker',
      'bnbusdt@ticker',
      'xrpusdt@ticker',
      'dogeusdt@ticker',
      'adausdt@ticker',
      'avaxusdt@ticker',
      'linkusdt@ticker',
      'suiusdt@ticker',
      'nearusdt@ticker',
      'dotusdt@ticker',
      'pepeusdt@ticker',
      'shibusdt@ticker',
      'arbusdt@ticker',
      'opusdt@ticker',
      'tiausdt@ticker',
      'renderusdt@ticker',
      'injusdt@ticker'
    ].join('/');

    const wsUrl = `wss://stream.binance.com:9443/stream?streams=${streams}`;
    const ws = new WebSocket(wsUrl);
    activeWs = ws;

    ws.onopen = () => {
      if (activeWs !== ws) return;
      sharedIsConnected = true;
      notifyListeners();
    };

    ws.onmessage = (event) => {
      if (activeWs !== ws) return;
      try {
        const message = JSON.parse(event.data);
        const data = message?.data;
        if (!data || !data.s) return;

        const symbolMap: Record<string, string> = {
          'BTCUSDT': 'BTC/USDT',
          'ETHUSDT': 'ETH/USDT',
          'SOLUSDT': 'SOL/USDT',
          'BNBUSDT': 'BNB/USDT',
          'XRPUSDT': 'XRP/USDT',
          'DOGEUSDT': 'DOGE/USDT',
          'ADAUSDT': 'ADA/USDT',
          'AVAXUSDT': 'AVAX/USDT',
          'LINKUSDT': 'LINK/USDT',
          'SUIUSDT': 'SUI/USDT',
          'NEARUSDT': 'NEAR/USDT',
          'DOTUSDT': 'DOT/USDT',
          'PEPEUSDT': 'PEPE/USDT',
          'SHIBUSDT': 'SHIB/USDT',
          'ARBUSDT': 'ARB/USDT',
          'OPUSDT': 'OP/USDT',
          'TIAUSDT': 'TIA/USDT',
          'RENDERUSDT': 'RENDER/USDT',
          'INJUSDT': 'INJ/USDT',
        };

        const appSymbol = symbolMap[data.s];
        if (!appSymbol) return;

        const newPrice = parseFloat(data.c);
        const newChange = parseFloat(data.P);
        const volumeRaw = parseFloat(data.q);
        const formattedVol = volumeRaw > 1e9 
          ? `$${(volumeRaw / 1e9).toFixed(2)}B` 
          : `$${(volumeRaw / 1e6).toFixed(1)}M`;

        sharedTicks = sharedTicks.map(item => {
          if (item.symbol !== appSymbol) return item;
          const direction = newPrice > item.price ? 'up' : newPrice < item.price ? 'down' : 'same';
          return {
            ...item,
            price: newPrice,
            change24h: newChange,
            volume24h: formattedVol,
            direction,
            lastUpdated: Date.now()
          };
        });
        notifyListeners();
      } catch {
        // Ignore malformed tick
      }
    };

    ws.onerror = () => {
      if (activeWs === ws) {
        sharedIsConnected = false;
        notifyListeners();
      }
    };

    ws.onclose = () => {
      if (activeWs !== ws) return;
      activeWs = null;
      sharedIsConnected = false;
      notifyListeners();
      // Auto reconnect only if components are actively listening
      if (listeners.size > 0) {
        if (reconnectTimer) clearTimeout(reconnectTimer);
        reconnectTimer = setTimeout(connectBinanceWS, 3000);
      }
    };
  } catch {
    if (listeners.size > 0) {
      if (reconnectTimer) clearTimeout(reconnectTimer);
      reconnectTimer = setTimeout(connectBinanceWS, 4000);
    }
  }
}

// Cleanly disconnect without triggering "closed before connection established" browser warning
function disconnectBinanceWS() {
  if (reconnectTimer) {
    clearTimeout(reconnectTimer);
    reconnectTimer = null;
  }
  if (macroInterval) {
    clearInterval(macroInterval);
    macroInterval = null;
  }
  if (activeWs) {
    const ws = activeWs;
    activeWs = null;
    ws.onmessage = null;
    ws.onerror = null;
    ws.onclose = null;
    if (ws.readyState === WebSocket.OPEN) {
      try { ws.close(); } catch {}
    } else if (ws.readyState === WebSocket.CONNECTING) {
      // Prevent browser "WebSocket is closed before the connection is established" warning
      ws.onopen = () => {
        try { ws.close(); } catch {}
      };
    }
  }
  sharedIsConnected = false;
  notifyListeners();
}

export function useLiveMarketTicks() {
  const [ticks, setTicks] = useState<MarketAssetTick[]>(sharedTicks);
  const [isConnected, setIsConnected] = useState(sharedIsConnected);

  useEffect(() => {
    // 1. Cancel pending disconnect if a component remounts (React StrictMode / navigation)
    if (disconnectTimer) {
      clearTimeout(disconnectTimer);
      disconnectTimer = null;
    }

    const listener = (newTicks: MarketAssetTick[], newConn: boolean) => {
      setTicks(newTicks);
      setIsConnected(newConn);
    };

    listeners.add(listener);

    // 2. Start connection if this is the first active subscriber
    if (listeners.size === 1) {
      fetchForexBaseline();
      connectBinanceWS();

      if (!macroInterval) {
        macroInterval = setInterval(() => {
          sharedTicks = sharedTicks.map(item => {
            if (item.category === 'crypto') return item;

            // Subtle micro-pip oscillation (1-3 pips)
            const variancePct = (Math.random() - 0.495) * 0.0003;
            const oldPrice = item.price;
            const newPrice = Number((oldPrice * (1 + variancePct)).toFixed(item.category === 'forex' && !item.symbol.includes('XAU') ? 5 : 2));
            const direction = newPrice > oldPrice ? 'up' : newPrice < oldPrice ? 'down' : 'same';

            return {
              ...item,
              price: newPrice,
              direction,
              lastUpdated: Date.now()
            };
          });
          notifyListeners();
        }, 2400);
      }
    } else {
      // Immediate sync with current shared state
      setTicks(sharedTicks);
      setIsConnected(sharedIsConnected);
    }

    return () => {
      listeners.delete(listener);

      // Debounce disconnect so fast unmount/remount (StrictMode / React Refresh) doesn't thrash sockets
      if (listeners.size === 0) {
        disconnectTimer = setTimeout(() => {
          if (listeners.size === 0) {
            disconnectBinanceWS();
          }
        }, 4000);
      }
    };
  }, []);

  return { ticks, isConnected };
}
