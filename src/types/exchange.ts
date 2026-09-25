export type VenueId = 
  | 'bybit' 
  | 'binance' 
  | 'okx' 
  | 'bitget' 
  | 'hyperliquid' 
  | 'kraken' 
  | 'coinbase';

export type AuthType = 'api_keys' | 'web3_agent' | 'oauth_token';

export interface StoredExchangeAccount {
  id: string;
  venueId: VenueId;
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
  id: VenueId;
  name: string;
  tagline: string;
  logoUrl?: string;
  color: string;
  authType: AuthType;
  requiresPassphrase?: boolean;
  supportsTestnet: boolean;
  rateLimitInfo: string;
  ccxtId: string;
  documentationUrl: string;
}

export const SUPPORTED_VENUES: VenueMetadata[] = [
  {
    id: 'bybit',
    name: 'Bybit Unified V5',
    tagline: 'Perpetuals & Spot con baja latencia via API v5',
    color: '#F7A600',
    authType: 'api_keys',
    requiresPassphrase: false,
    supportsTestnet: true,
    rateLimitInfo: '50 req/s',
    ccxtId: 'bybit',
    documentationUrl: 'https://bybit-exchange.github.io/docs/v5/intro'
  },
  {
    id: 'binance',
    name: 'Binance Global',
    tagline: 'Spot & USDⓈ-M Futures con routing institucional',
    color: '#F0B90B',
    authType: 'api_keys',
    requiresPassphrase: false,
    supportsTestnet: true,
    rateLimitInfo: '1200 weight/min',
    ccxtId: 'binance',
    documentationUrl: 'https://binance-docs.github.io/apidocs/futures/en/'
  },
  {
    id: 'okx',
    name: 'OKX DMA Unified',
    tagline: 'Direct Market Access con cuenta unificada multimoneda',
    color: '#FFFFFF',
    authType: 'api_keys',
    requiresPassphrase: true,
    supportsTestnet: true,
    rateLimitInfo: '20 req/2s',
    ccxtId: 'okx',
    documentationUrl: 'https://www.okx.com/docs-v5/en/'
  },
  {
    id: 'bitget',
    name: 'Bitget Unified',
    tagline: 'Cuentas de derivados con subcuentas segregadas',
    color: '#00F0FF',
    authType: 'api_keys',
    requiresPassphrase: true,
    supportsTestnet: true,
    rateLimitInfo: '20 req/s',
    ccxtId: 'bitget',
    documentationUrl: 'https://www.bitget.com/api-doc/common/intro'
  },
  {
    id: 'hyperliquid',
    name: 'Hyperliquid L1 (DEX)',
    tagline: 'Orderbook on-chain con Agent Wallets y cero gas',
    color: '#2DD4BF',
    authType: 'web3_agent',
    requiresPassphrase: false,
    supportsTestnet: true,
    rateLimitInfo: 'Sub-20ms L1',
    ccxtId: 'hyperliquid',
    documentationUrl: 'https://hyperliquid.gitbook.io/hyperliquid-docs'
  },
  {
    id: 'kraken',
    name: 'Kraken Institutional',
    tagline: 'Spot y futuros regulados con alta liquidez EUR/USD',
    color: '#5741D9',
    authType: 'api_keys',
    requiresPassphrase: false,
    supportsTestnet: false,
    rateLimitInfo: 'Token Bucket',
    ccxtId: 'kraken',
    documentationUrl: 'https://docs.kraken.com/api/'
  },
  {
    id: 'coinbase',
    name: 'Coinbase Advanced',
    tagline: 'Acceso regulado con claves CDP API v3',
    color: '#0052FF',
    authType: 'api_keys',
    requiresPassphrase: true,
    supportsTestnet: true,
    rateLimitInfo: '30 req/s',
    ccxtId: 'coinbase',
    documentationUrl: 'https://docs.cloud.coinbase.com/advanced-trade-api/docs/welcome'
  }
];
