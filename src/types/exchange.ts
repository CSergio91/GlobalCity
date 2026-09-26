export type VenueId = string;

export type VenueCategory = 
  | 'tier1_derivatives' 
  | 'tier1_spot' 
  | 'dex_l1' 
  | 'institutional_broker' 
  | 'regional_regulated';

export type AuthType = 'api_keys' | 'web3_agent' | 'oauth_token' | 'fix_session' | 'terminal_bridge';

export interface StoredExchangeAccount {
  id: string;
  venueId: string;
  venueName: string;
  label: string;
  authType: AuthType;
  apiKey: string;
  apiSecret: string;
  passphrase?: string;
  agentAddress?: string;
  isTestnet: boolean;
  subaccountName?: string;
  permissions: ('read' | 'trade')[];
  status: 'CONNECTED' | 'ERROR' | 'STANDBY';
  balanceUsd: number;
  freeMarginUsd: number;
  pingMs: number;
  lastSync: string;
  createdAt: string;
}

export interface VenueMetadata {
  id: string;
  name: string;
  tagline: string;
  category: VenueCategory;
  color: string;
  authType: AuthType;
  requiresPassphrase: boolean;
  supportsTestnet: boolean;
  supportsPerpetuals: boolean;
  supportsSpot: boolean;
  rateLimitInfo: string;
  ccxtId: string;
  documentationUrl: string;
}

export const SUPPORTED_VENUES: VenueMetadata[] = [
  // --- Tier 1 Derivatives & Unified Exchanges (CCXT Primary) ---
  {
    id: 'binance',
    name: 'Binance Global',
    tagline: 'Spot & USDⓈ-M / COIN-M Futures con routing institucional',
    category: 'tier1_derivatives',
    color: '#F0B90B',
    authType: 'api_keys',
    requiresPassphrase: false,
    supportsTestnet: true,
    supportsPerpetuals: true,
    supportsSpot: true,
    rateLimitInfo: '1200 weight/min',
    ccxtId: 'binance',
    documentationUrl: 'https://binance-docs.github.io/apidocs/futures/en/'
  },
  {
    id: 'bybit',
    name: 'Bybit Unified V5',
    tagline: 'Perpetuals, Inversos & Spot con baja latencia via Unified Account',
    category: 'tier1_derivatives',
    color: '#F7A600',
    authType: 'api_keys',
    requiresPassphrase: false,
    supportsTestnet: true,
    supportsPerpetuals: true,
    supportsSpot: true,
    rateLimitInfo: '50 req/s',
    ccxtId: 'bybit',
    documentationUrl: 'https://bybit-exchange.github.io/docs/v5/intro'
  },
  {
    id: 'okx',
    name: 'OKX DMA Unified',
    tagline: 'Direct Market Access con cuenta unificada multimoneda',
    category: 'tier1_derivatives',
    color: '#FFFFFF',
    authType: 'api_keys',
    requiresPassphrase: true,
    supportsTestnet: true,
    supportsPerpetuals: true,
    supportsSpot: true,
    rateLimitInfo: '20 req/2s',
    ccxtId: 'okx',
    documentationUrl: 'https://www.okx.com/docs-v5/en/'
  },
  {
    id: 'bitget',
    name: 'Bitget Unified',
    tagline: 'Cuentas de derivados USDT-M/USDC-M y Copy Trading API',
    category: 'tier1_derivatives',
    color: '#00F0FF',
    authType: 'api_keys',
    requiresPassphrase: true,
    supportsTestnet: true,
    supportsPerpetuals: true,
    supportsSpot: true,
    rateLimitInfo: '20 req/s',
    ccxtId: 'bitget',
    documentationUrl: 'https://www.bitget.com/api-doc/common/intro'
  },
  {
    id: 'gateio',
    name: 'Gate.io Tier 1',
    tagline: 'Más de 1,400 pares spot y perpetuos con API v4',
    category: 'tier1_derivatives',
    color: '#0D8557',
    authType: 'api_keys',
    requiresPassphrase: false,
    supportsTestnet: true,
    supportsPerpetuals: true,
    supportsSpot: true,
    rateLimitInfo: '300 req/s',
    ccxtId: 'gateio',
    documentationUrl: 'https://www.gate.io/docs/developers/apiv4'
  },
  {
    id: 'kucoin',
    name: 'KuCoin Institutional',
    tagline: 'Alta liquidez spot y futuros con autenticación de 3 factores',
    category: 'tier1_derivatives',
    color: '#24AE8F',
    authType: 'api_keys',
    requiresPassphrase: true,
    supportsTestnet: true,
    supportsPerpetuals: true,
    supportsSpot: true,
    rateLimitInfo: '100 req/s',
    ccxtId: 'kucoin',
    documentationUrl: 'https://www.kucoin.com/docs-new'
  },
  {
    id: 'deribit',
    name: 'Deribit Institutional',
    tagline: 'Líder en Opciones y Futuros de BTC, ETH y SOL',
    category: 'tier1_derivatives',
    color: '#00D1B2',
    authType: 'api_keys',
    requiresPassphrase: false,
    supportsTestnet: true,
    supportsPerpetuals: true,
    supportsSpot: false,
    rateLimitInfo: '20 req/s',
    ccxtId: 'deribit',
    documentationUrl: 'https://docs.deribit.com/'
  },
  {
    id: 'mexc',
    name: 'MEXC Global',
    tagline: 'Comisiones ultrabajas en futuros y liquidez masiva',
    category: 'tier1_derivatives',
    color: '#1652F0',
    authType: 'api_keys',
    requiresPassphrase: false,
    supportsTestnet: false,
    supportsPerpetuals: true,
    supportsSpot: true,
    rateLimitInfo: '20 req/s',
    ccxtId: 'mexc',
    documentationUrl: 'https://mexcdevelop.github.io/apidocs/'
  },
  {
    id: 'htx',
    name: 'HTX (Huobi)',
    tagline: 'Mercados globales spot y contratos perpetuos swap',
    category: 'tier1_derivatives',
    color: '#2C62FF',
    authType: 'api_keys',
    requiresPassphrase: false,
    supportsTestnet: false,
    supportsPerpetuals: true,
    supportsSpot: true,
    rateLimitInfo: '10 req/s',
    ccxtId: 'htx',
    documentationUrl: 'https://huobiapi.github.io/docs/spot/v1/en/'
  },
  {
    id: 'bingx',
    name: 'BingX Futures',
    tagline: 'Perpetuos estándar e inversos con copy trading directo',
    category: 'tier1_derivatives',
    color: '#0052FF',
    authType: 'api_keys',
    requiresPassphrase: false,
    supportsTestnet: true,
    supportsPerpetuals: true,
    supportsSpot: true,
    rateLimitInfo: '10 req/s',
    ccxtId: 'bingx',
    documentationUrl: 'https://bingx-api.github.io/docs/'
  },
  {
    id: 'phemex',
    name: 'Phemex Execution',
    tagline: 'Motor de trading de alta velocidad con API de contratos',
    category: 'tier1_derivatives',
    color: '#D4AF37',
    authType: 'api_keys',
    requiresPassphrase: false,
    supportsTestnet: true,
    supportsPerpetuals: true,
    supportsSpot: true,
    rateLimitInfo: '100 req/min',
    ccxtId: 'phemex',
    documentationUrl: 'https://phemex-docs.github.io/'
  },
  {
    id: 'bitmex',
    name: 'BitMEX Quant',
    tagline: 'Arquitectura original de perpetuos con apalancamiento 100x',
    category: 'tier1_derivatives',
    color: '#FF1744',
    authType: 'api_keys',
    requiresPassphrase: false,
    supportsTestnet: true,
    supportsPerpetuals: true,
    supportsSpot: false,
    rateLimitInfo: '30 req/s',
    ccxtId: 'bitmex',
    documentationUrl: 'https://www.bitmex.com/app/apiOverview'
  },
  {
    id: 'woo',
    name: 'WOO X Network',
    tagline: 'Deep liquidity aggregation con zero fee staking options',
    category: 'tier1_derivatives',
    color: '#00E5FF',
    authType: 'api_keys',
    requiresPassphrase: false,
    supportsTestnet: true,
    supportsPerpetuals: true,
    supportsSpot: true,
    rateLimitInfo: '10 req/s',
    ccxtId: 'woo',
    documentationUrl: 'https://docs.woo.org/'
  },
  {
    id: 'bitfinex',
    name: 'Bitfinex Margin',
    tagline: 'Mercados institucionales con orderbook profundo y lending',
    category: 'tier1_derivatives',
    color: '#16B157',
    authType: 'api_keys',
    requiresPassphrase: false,
    supportsTestnet: false,
    supportsPerpetuals: true,
    supportsSpot: true,
    rateLimitInfo: '90 req/min',
    ccxtId: 'bitfinex',
    documentationUrl: 'https://docs.bitfinex.com/'
  },

  // --- On-Chain DEXs & Layer 1 Perpetuals ---
  {
    id: 'hyperliquid',
    name: 'Hyperliquid L1 (DEX)',
    tagline: 'Orderbook on-chain con subcuentas Agent Wallet y cero gas fees',
    category: 'dex_l1',
    color: '#2DD4BF',
    authType: 'web3_agent',
    requiresPassphrase: false,
    supportsTestnet: true,
    supportsPerpetuals: true,
    supportsSpot: true,
    rateLimitInfo: 'Sub-20ms L1',
    ccxtId: 'hyperliquid',
    documentationUrl: 'https://hyperliquid.gitbook.io/hyperliquid-docs'
  },
  {
    id: 'dydx',
    name: 'dYdX Chain v4',
    tagline: 'Cosmos App-chain con liquidaciones soberanas y orderbook en memoria',
    category: 'dex_l1',
    color: '#6966FF',
    authType: 'web3_agent',
    requiresPassphrase: false,
    supportsTestnet: true,
    supportsPerpetuals: true,
    supportsSpot: false,
    rateLimitInfo: '20 req/s',
    ccxtId: 'dydx',
    documentationUrl: 'https://docs.dydx.exchange/'
  },
  {
    id: 'vertex',
    name: 'Vertex Protocol',
    tagline: 'Cross-margin DEX en Arbitrum con secuenciador off-chain ultra-rápido',
    category: 'dex_l1',
    color: '#8A2BE2',
    authType: 'web3_agent',
    requiresPassphrase: false,
    supportsTestnet: true,
    supportsPerpetuals: true,
    supportsSpot: true,
    rateLimitInfo: '30 req/s',
    ccxtId: 'vertex',
    documentationUrl: 'https://vertex-protocol.gitbook.io/docs'
  },
  {
    id: 'aevo',
    name: 'Aevo Exchange',
    tagline: 'Opciones y futuros de alta velocidad basados en OP Stack',
    category: 'dex_l1',
    color: '#FF69B4',
    authType: 'web3_agent',
    requiresPassphrase: false,
    supportsTestnet: true,
    supportsPerpetuals: true,
    supportsSpot: false,
    rateLimitInfo: '15 req/s',
    ccxtId: 'aevo',
    documentationUrl: 'https://docs.aevo.xyz/'
  },
  {
    id: 'paradex',
    name: 'Paradex Starknet',
    tagline: 'Layer 2 Appchain con pruebas de validez ZK y book CLOB',
    category: 'dex_l1',
    color: '#FFA500',
    authType: 'web3_agent',
    requiresPassphrase: false,
    supportsTestnet: true,
    supportsPerpetuals: true,
    supportsSpot: false,
    rateLimitInfo: 'Sub-30ms ZK',
    ccxtId: 'paradex',
    documentationUrl: 'https://docs.paradex.trade/'
  },

  // --- Regulated & Institutional Venues (Spot & Fiat Onramps) ---
  {
    id: 'kraken',
    name: 'Kraken Institutional',
    tagline: 'Spot y futuros regulados con alta liquidez EUR/USD y API v2',
    category: 'regional_regulated',
    color: '#5741D9',
    authType: 'api_keys',
    requiresPassphrase: false,
    supportsTestnet: false,
    supportsPerpetuals: true,
    supportsSpot: true,
    rateLimitInfo: 'Token Bucket',
    ccxtId: 'kraken',
    documentationUrl: 'https://docs.kraken.com/api/'
  },
  {
    id: 'coinbase',
    name: 'Coinbase Advanced',
    tagline: 'Acceso regulado institucional con claves CDP API v3',
    category: 'regional_regulated',
    color: '#0052FF',
    authType: 'api_keys',
    requiresPassphrase: true,
    supportsTestnet: true,
    supportsPerpetuals: true,
    supportsSpot: true,
    rateLimitInfo: '30 req/s',
    ccxtId: 'coinbase',
    documentationUrl: 'https://docs.cloud.coinbase.com/advanced-trade-api/docs/welcome'
  },
  {
    id: 'bitstamp',
    name: 'Bitstamp Europe',
    tagline: 'El exchange europeo regulado más antiguo con soporte FIX y HTTP',
    category: 'regional_regulated',
    color: '#00A370',
    authType: 'api_keys',
    requiresPassphrase: false,
    supportsTestnet: false,
    supportsPerpetuals: false,
    supportsSpot: true,
    rateLimitInfo: '600 req/10min',
    ccxtId: 'bitstamp',
    documentationUrl: 'https://www.bitstamp.net/api/'
  },
  {
    id: 'gemini',
    name: 'Gemini Institutional',
    tagline: 'Custodia institucional de Nueva York con API REST y FIX',
    category: 'regional_regulated',
    color: '#00DCFA',
    authType: 'api_keys',
    requiresPassphrase: false,
    supportsTestnet: true,
    supportsPerpetuals: false,
    supportsSpot: true,
    rateLimitInfo: '120 req/min',
    ccxtId: 'gemini',
    documentationUrl: 'https://docs.gemini.com/rest-api/'
  },
  {
    id: 'whitebit',
    name: 'WhiteBIT Global',
    tagline: 'Plataforma europea de trading con libros profundos de criptoactivos',
    category: 'regional_regulated',
    color: '#E06D8A',
    authType: 'api_keys',
    requiresPassphrase: false,
    supportsTestnet: false,
    supportsPerpetuals: true,
    supportsSpot: true,
    rateLimitInfo: '100 req/s',
    ccxtId: 'whitebit',
    documentationUrl: 'https://whitebit-exchange.github.io/api-docs/'
  },
  {
    id: 'cryptocom',
    name: 'Crypto.com Exchange',
    tagline: 'Infraestructura de derivados y spot de alta disponibilidad',
    category: 'regional_regulated',
    color: '#002D74',
    authType: 'api_keys',
    requiresPassphrase: false,
    supportsTestnet: true,
    supportsPerpetuals: true,
    supportsSpot: true,
    rateLimitInfo: '100 req/s',
    ccxtId: 'cryptocom',
    documentationUrl: 'https://exchange-docs.crypto.com/'
  },

  // --- Institutional Broker Protocols (Prop Firm & Forex DMA) ---
  {
    id: 'mt5',
    name: 'MetaTrader 5 Gateway',
    tagline: 'Conexión DMA con brokers regulados de Forex, CFDs y Futuros CME',
    category: 'institutional_broker',
    color: '#10B981',
    authType: 'terminal_bridge',
    requiresPassphrase: true,
    supportsTestnet: true,
    supportsPerpetuals: true,
    supportsSpot: true,
    rateLimitInfo: 'ZeroMQ Direct IPC',
    ccxtId: 'mt5',
    documentationUrl: 'https://www.mql5.com/en/docs'
  },
  {
    id: 'mt4',
    name: 'MetaTrader 4 Bridge',
    tagline: 'Puente TCP con servidores ECN/STP de prop firms tradicionales',
    category: 'institutional_broker',
    color: '#F59E0B',
    authType: 'terminal_bridge',
    requiresPassphrase: true,
    supportsTestnet: true,
    supportsPerpetuals: true,
    supportsSpot: true,
    rateLimitInfo: 'Local Socket Bridge',
    ccxtId: 'mt4',
    documentationUrl: 'https://book.mql4.com/'
  },
  {
    id: 'ctrader',
    name: 'cTrader Open API',
    tagline: 'Conexión nativa Protobuf en Spotware Cloud para trading interbancario',
    category: 'institutional_broker',
    color: '#06B6D4',
    authType: 'oauth_token',
    requiresPassphrase: false,
    supportsTestnet: true,
    supportsPerpetuals: true,
    supportsSpot: true,
    rateLimitInfo: 'TCP Protobuf 50 msg/s',
    ccxtId: 'ctrader',
    documentationUrl: 'https://openapi.ctrader.com/'
  },
  {
    id: 'quickfix',
    name: 'QuickFIX DMA Engine',
    tagline: 'Protocolo FIX 4.4 / 5.0 institucional para Prime Brokers y Liquidity Pools',
    category: 'institutional_broker',
    color: '#6366F1',
    authType: 'fix_session',
    requiresPassphrase: true,
    supportsTestnet: true,
    supportsPerpetuals: true,
    supportsSpot: true,
    rateLimitInfo: 'Sub-millisecond FIX',
    ccxtId: 'quickfix',
    documentationUrl: 'https://www.quickfixengine.org/'
  }
];
