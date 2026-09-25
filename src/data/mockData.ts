export interface LiveMarketTick {
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  volume24h: string;
  category: "crypto" | "forex" | "futures";
  venues: string;
}

export const MULTI_ASSET_MARKET_TICKS: LiveMarketTick[] = [
  {
    symbol: "BTC/USDT",
    name: "Bitcoin Perpetual",
    price: 84310.20,
    change24h: 3.82,
    volume24h: "$2.10B",
    category: "crypto",
    venues: "Bybit · OKX · Binance · Hyperliquid"
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
    symbol: "ETH/USDT",
    name: "Ethereum Perpetual",
    price: 2728.50,
    change24h: 2.15,
    volume24h: "$940M",
    category: "crypto",
    venues: "Bybit · OKX · Binance"
  },
  {
    symbol: "ES1! (S&P 500)",
    name: "E-mini S&P 500 Futures",
    price: 5892.25,
    change24h: 0.65,
    volume24h: "$18.5B",
    category: "futures",
    venues: "CME Group · QuickFIX DMA"
  },
  {
    symbol: "SOL/USDT",
    name: "Solana Perpetual",
    price: 186.40,
    change24h: 7.24,
    volume24h: "$680M",
    category: "crypto",
    venues: "Bybit · OKX · Hyperliquid"
  },
  {
    symbol: "XAU/USD",
    name: "Gold Spot vs Dollar",
    price: 2748.10,
    change24h: 0.92,
    volume24h: "$5.8B",
    category: "forex",
    venues: "MetaTrader 5 · cTrader"
  }
];

export interface ConnectedAccount {
  id: string;
  venueName: string;
  protocol: "CCXT" | "cTrader Protobuf" | "MT5 Windows Gateway" | "QuickFIX" | "Hyperliquid Agent";
  assetClass: "Crypto Perpetuals" | "Forex / CFDs" | "CME Futures" | "DEX L1";
  balanceUsd: number;
  freeMarginUsd: number;
  openOrdersCount: number;
  pingMs: number;
  status: "ONLINE" | "SYNCHRONIZED";
}

export const INITIAL_CONNECTED_ACCOUNTS: ConnectedAccount[] = [
  {
    id: "acc_bybit_v5",
    venueName: "Bybit Broker API v5",
    protocol: "CCXT",
    assetClass: "Crypto Perpetuals",
    balanceUsd: 42500,
    freeMarginUsd: 38200,
    openOrdersCount: 2,
    pingMs: 14,
    status: "ONLINE"
  },
  {
    id: "acc_okx_dma",
    venueName: "OKX Non-Disclosed DMA",
    protocol: "CCXT",
    assetClass: "Crypto Perpetuals",
    balanceUsd: 31200,
    freeMarginUsd: 29500,
    openOrdersCount: 1,
    pingMs: 18,
    status: "ONLINE"
  },
  {
    id: "acc_ctrader",
    venueName: "cTrader Open API",
    protocol: "cTrader Protobuf",
    assetClass: "Forex / CFDs",
    balanceUsd: 25000,
    freeMarginUsd: 21800,
    openOrdersCount: 3,
    pingMs: 22,
    status: "ONLINE"
  },
  {
    id: "acc_mt5",
    venueName: "MetaTrader 5 Server Gateway",
    protocol: "MT5 Windows Gateway",
    assetClass: "Forex / CFDs",
    balanceUsd: 19800,
    freeMarginUsd: 18500,
    openOrdersCount: 0,
    pingMs: 16,
    status: "ONLINE"
  },
  {
    id: "acc_hyperliquid",
    venueName: "Hyperliquid L1 Protocol",
    protocol: "Hyperliquid Agent",
    assetClass: "DEX L1",
    balanceUsd: 15400,
    freeMarginUsd: 14800,
    openOrdersCount: 1,
    pingMs: 12,
    status: "ONLINE"
  },
  {
    id: "acc_cme_fix",
    venueName: "Prime Broker QuickFIX Session",
    protocol: "QuickFIX",
    assetClass: "CME Futures",
    balanceUsd: 50000,
    freeMarginUsd: 46200,
    openOrdersCount: 1,
    pingMs: 4,
    status: "ONLINE"
  }
];

export interface MultiVenueFeature {
  id: string;
  badge: string;
  title: string;
  subtitle: string;
  description: string;
  tags: string[];
  latency: string;
  status: string;
}

export const HORIZONTAL_ECOSYSTEM_MODULES: MultiVenueFeature[] = [
  {
    id: "multi-venue-core",
    badge: "01 · Núcleo Unificado",
    title: "Un Solo Terminal para Todos tus Exchanges y Brokers",
    subtitle: "Elimina la fricción de saltar entre decenas de terminales y pantallas.",
    description: "Conecta Bybit, OKX, Binance, cTrader, MetaTrader 5 y pasarelas FIX bajo un único motor de ejecución y portafolio consolidado en tiempo real sin custodia.",
    tags: ["Bybit v5", "cTrader Protobuf", "MetaTrader 5", "QuickFIX", "AES-256-GCM"],
    latency: "Latencia sub-18ms",
    status: "Arquitectura Hexagonal"
  },
  {
    id: "synthetic-arbitrage",
    badge: "02 · Arbitraje Cuantitativo",
    title: "Arbitraje Sintético Simultáneo entre Libros L2",
    subtitle: "Sin demoras de blockchain, sin costes de gas y con riesgo direccional cero.",
    description: "El evaluador recorre el orderbook Nivel 2 calculando el precio ponderado por volumen (VWAP). Si el spread neto supera las comisiones, dispara compras y ventas paralelas en sub-100ms.",
    tags: ["VWAP Nivel 2", "Rollback Automático", "Gas Tank Virtual", "Spread Neto >0.25%"],
    latency: "Sub-100ms concurrente",
    status: "Promise.allSettled"
  },
  {
    id: "telegram-bot-ops",
    badge: "03 · Control Remoto & Bots",
    title: "Comando Central y Telemetría por Telegram",
    subtitle: "Gestiona posiciones, ejecuta trades y recibe alertas de desbalanceo en tu móvil.",
    description: "Bot bidireccional seguro con autorización biométrica y 2FA: recibe alertas instantáneas de fills, consulta tu equidad consolidada y ejecuta órdenes tácticas mediante comandos directos.",
    tags: ["Telegram Bot API", "Alertas Push", "Comandos Seguros", "2FA Obligatorio"],
    latency: "Notificación instantánea",
    status: "Webhook Encriptado"
  },
  {
    id: "auto-rebalance",
    badge: "04 · Gestión de Inventario",
    title: "Rebalanceo Inteligente de Fondos entre Cuentas",
    subtitle: "Mantén tus cuentas siempre equilibradas para seguir ejecutando sin fricción.",
    description: "Monitoreo continuo de desequilibrio de liquidez en tiempo real. Cuando una cuenta agota inventario base o USDT, el sistema calcula la ruta de menor coste (Arbitrum/Solana) y asiste el rebalanceo.",
    tags: ["Threshold Alerts", "Ruta Menor Coste", "Cero Retiros por API", "Control de Margen"],
    latency: "Monitoreo continuo",
    status: "Smart Allocation"
  },
  {
    id: "cross-copy-trading",
    badge: "05 · Replicación Cruzada",
    title: "Copy Trading Puente: Cripto a CFDs y Futuros",
    subtitle: "Replica operaciones entre plataformas heterogéneas con normalización de lotes.",
    description: "Abre una posición en Bybit o TradingView y replícala proporcionalmente en MetaTrader 5 o cTrader. El SymbolMapper y el convertidor de volumen traducen contratos a lotes en milisegundos.",
    tags: ["SymbolMapper", "Conversión Lotes/Contratos", "Slippage Guard", "MT5 Bridge"],
    latency: "Replicación en <25ms",
    status: "Puente Transversal"
  },
  {
    id: "cme-futures-expansion",
    badge: "06 · Mercados Regulados",
    title: "Enrutamiento de Futuros Centralizados (CME Group)",
    subtitle: "Conexión a índices S&P 500, Nasdaq, Oro y Petróleo bajo protocolo FIX institucional.",
    description: "Expansión nativa para conectar con Miembros Liquidadores (FCMs) y pasarelas Rithmic/Tradovate. Opera criptoactivos y derivados tradicionales bajo la misma consola.",
    tags: ["CME Globex", "ES & NQ E-mini", "QuickFIX 4.4", "Direct Market Access"],
    latency: "Sub-5ms conexión LP",
    status: "Ruta Institucional"
  }
];

export interface ArbitrageOpportunity {
  pair: string;
  buyVenue: string;
  buyPrice: number;
  sellVenue: string;
  sellPrice: number;
  grossSpread: number;
  netSpread: number;
  takerFeeBuy: number;
  takerFeeSell: number;
  availableLiquidityUsdt: number;
  latencyMs: number;
}

export const INITIAL_ARBITRAGE_DATA: ArbitrageOpportunity[] = [
  {
    pair: "BTC/USDT",
    buyVenue: "OKX DMA",
    buyPrice: 84085.10,
    sellVenue: "Bybit v5",
    sellPrice: 84395.40,
    grossSpread: 0.369,
    netSpread: 0.274,
    takerFeeBuy: 0.045,
    takerFeeSell: 0.050,
    availableLiquidityUsdt: 85000,
    latencyMs: 14
  },
  {
    pair: "SOL/USDT",
    buyVenue: "Binance Broker",
    buyPrice: 183.90,
    sellVenue: "Hyperliquid L1",
    sellPrice: 185.15,
    grossSpread: 0.679,
    netSpread: 0.529,
    takerFeeBuy: 0.050,
    takerFeeSell: 0.100,
    availableLiquidityUsdt: 42000,
    latencyMs: 19
  },
  {
    pair: "ETH/USDT",
    buyVenue: "Bybit v5",
    buyPrice: 2708.80,
    sellVenue: "OKX DMA",
    sellPrice: 2719.40,
    grossSpread: 0.391,
    netSpread: 0.296,
    takerFeeBuy: 0.045,
    takerFeeSell: 0.050,
    availableLiquidityUsdt: 120000,
    latencyMs: 22
  }
];

