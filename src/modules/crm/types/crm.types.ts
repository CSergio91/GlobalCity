/**
-- ============================================================================
-- ZYTI TRADE / PROP FIRM CRM — TIPOS DE DATOS INSTITUCIONALES (ERP)
-- ============================================================================
*/

export type CrmModuleId = 
  | 'hub' 
  | 'risk_engine' 
  | 'apis' 
  | 'challenges' 
  | 'plans' 
  | 'exchanges' 
  | 'prop_firms' 
  | 'support' 
  | 'marketing'
  | 'deployment';

export type ApiKeyType = 'prop_firm' | 'ai_agent' | 'webhook';

export type ApiScope = 
  | 'trade:read' 
  | 'trade:order_create' 
  | 'trade:order_cancel' 
  | 'accounts:provision' 
  | 'accounts:freeze' 
  | 'metrics:read'
  | 'webhooks:write';

export interface ApiCredentialEntity {
  id: string;
  name: string;
  key_type: ApiKeyType;
  api_key_public: string;
  key_hash: string;
  scopes: ApiScope[];
  ip_whitelist: string[];
  rate_limit_rpm: number;
  is_active: boolean;
  last_used_at?: string | null;
  expires_at?: string | null;
  created_at?: string;
  raw_secret_key?: string;
}

export type ChallengeModelType = 'INSTANT_FUNDING' | 'ONE_PHASE' | 'TWO_PHASE';
export type MinDailyProfitType = 'PERCENT' | 'AMOUNT';

export interface RiskRuleConfigEntity {
  id: string;
  firm_id?: string | null;
  name: string;
  model_type?: ChallengeModelType;
  default_account_balance?: number;
  is_default_demo?: boolean;
  is_active: boolean;

  // Drawdowns
  drawdown_type: 'EOD' | 'TRAILING_EQUITY';
  max_daily_loss_percent: number;
  max_total_drawdown_percent: number;
  max_trailing_drawdown_percent?: number | null;

  // Calificación & Objetivos
  profit_target_percent?: number;
  profit_target_phase2_percent?: number | null;
  min_trading_days: number;
  min_daily_profit_type?: MinDailyProfitType;
  min_daily_profit_value?: number;
  consistency_rule_percent: number;

  // Operativa & Exposición (Pre-Trade)
  max_leverage: number;
  mandatory_stop_loss: boolean;
  max_positions_per_symbol_enabled?: boolean;
  max_positions_per_symbol?: number;
  max_total_open_positions_enabled?: boolean;
  max_total_open_positions?: number;
  anti_hedging_enabled?: boolean;
  max_risk_per_trade_percent?: number | null;

  // Restricciones de Tiempo & Gobierno
  weekend_holding_allowed: boolean;
  min_trade_duration_seconds?: number;
  news_trading_allowed?: boolean;
  inactivity_days_limit?: number;
  profit_split_percent?: number;

  created_at?: string;
  updated_at?: string;
}

export interface CrmKpiStats {
  totalAccounts: number;
  activeAccounts: number;
  breachedAccounts: number;
  fundedCapitalUsd: number;
  activeApiKeys: number;
  aiAgentsConnected: number;
  liveFloatingPnL: number;
  riskStatus: 'HEALTHY' | 'WARNING' | 'ALERT';
}

export type UserCrmRole = 'trader' | 'soporte' | 'admin' | 'marketing';
export type CrmStaffRole = 'admin' | 'soporte' | 'marketing';

export const CRM_ALLOWED_ROLES: CrmStaffRole[] = ['admin', 'soporte', 'marketing'];

export const ROLE_CARD_PERMISSIONS: Record<CrmStaffRole, CrmModuleId[]> = {
  admin: [
    'deployment',
    'risk_engine',
    'apis',
    'challenges',
    'plans',
    'exchanges',
    'prop_firms',
    'support',
    'marketing'
  ],
  soporte: [
    'support',
    'risk_engine',
    'challenges'
  ],
  marketing: [
    'marketing',
    'exchanges',
    'prop_firms',
    'plans'
  ]
};

export interface TraderClientEntity {
  id: string;
  fullName: string;
  email: string;
  avatarUrl?: string;
  provider: 'telegram' | 'google' | 'email' | 'demo';
  telegramId?: number;
  telegramUsername?: string;
  role: UserCrmRole;
  isVerified: boolean;
  createdAt: string;
  
  // Cuenta Demo Oficial de ZYTI vinculada
  accountNumber: string;
  accountSize: number;       // $10,000, $25,000, $50,000, $100,000
  currentBalance: number;
  equity: number;
  floatingPnl: number;
  dailyDrawdownPct: number;
  totalDrawdownPct: number;
  dailyStartEquity?: number;
  dailyStartDate?: string;
  tradingDaysCount?: number;
  status: 'ACTIVE' | 'WARNING' | 'BREACHED' | 'FROZEN';
  lastActivity: string;
}

export interface MonitoredPosition {
  id: string;
  accountNumber: string;
  traderEmail: string;
  traderName: string;
  accountSize: number;       // Tamaño de cuenta del trader
  symbol: string;
  side: 'LONG' | 'SHORT';
  sizeUnits: number;
  leverage: number;
  entryPrice: number;
  currentPrice: number;
  floatingPnl: number;
  dailyDrawdownPct: number;
  totalDrawdownPct: number;
  ruleHealth: 'HEALTHY' | 'WARNING' | 'BREACHED';
  breachReason?: string;
  openedAt: string;
}

export interface ExchangeAffiliateItem {
  id: string;
  name: string;
  logo: string;
  affiliateUrl: string;
  commissionRebatePct: number;
  isActive: boolean;
  status: 'ONLINE' | 'MAINTENANCE';
}

export interface PropFirmAffiliateItem {
  id: string;
  name: string;
  logo: string;
  affiliateUrl: string;
  discountCode: string;
  payoutSplitPct: number;
  isActive: boolean;
}

export interface TraderTradeAuditItem {
  id: string;
  symbol: string;
  exchange: string;
  side: 'LONG' | 'SHORT';
  size: number;
  leverage: number;
  entryPrice: number;
  exitPrice: number | null;
  slPrice: number | null;
  tpPrice: number | null;
  realizedPnl: number | null;
  pnlPercent: number | null;
  status: 'OPEN' | 'CLOSED';
  closeReason: string | null;
  openedAt: string;
  closedAt: string | null;
  ipAddress?: string;
}

export interface RuleComplianceAuditItem {
  id: string;
  name: string;
  thresholdLabel: string;
  currentValueLabel: string;
  status: 'PASSED' | 'IN_PROGRESS' | 'BREACHED' | 'NOT_STARTED';
  progressPct: number;
  details: string;
}

export interface IpSessionAuditItem {
  ip: string;
  count: number;
  location: string;
  isp: string;
  status: 'VERIFIED' | 'SUSPICIOUS_MULTI_IP' | 'VPN_PROXY' | 'SHARED_WIFI_SUSPICIOUS';
  networkType?: string;
  isSharedNetwork?: boolean;
  sharedWithAccounts?: string[];
  firstSeen: string;
  lastSeen: string;
}

export interface UserChallengeAccountSummary {
  id: string;
  accountNumber: string;
  planName: string;
  initialBalance: number;
  currentBalance: number;
  equity: number;
  status: 'ACTIVE' | 'WARNING' | 'BREACHED' | 'FROZEN';
  rulesConfig: any;
}

export interface TraderAuditData {
  account: {
    id: string;
    accountNumber: string;
    traderEmail: string;
    traderName: string;
    initialBalance: number;
    currentBalance: number;
    equity: number;
    peakEquity: number;
    dailyStartEquity: number;
    status: 'ACTIVE' | 'WARNING' | 'BREACHED' | 'FROZEN';
    tradingDaysCount: number;
    planName: string;
    rulesConfig?: any;
  };
  allUserAccounts: UserChallengeAccountSummary[];
  stats: {
    totalTrades: number;
    closedTradesCount: number;
    openTradesCount: number;
    bestTradePnl: number;
    worstTradePnl: number;
    winRatePct: number;
    profitFactor: number;
    netRealizedPnl: number;
    grossProfits: number;
    grossLosses: number;
    avgWin: number;
    avgLoss: number;
    profitTargetPct: number;
    profitTargetAmount: number;
    profitTargetProgress: number;
    maxDailyDdPct: number;
    maxDailyLossAmount: number;
    dailyDd: number;
    maxTotalDdPct: number;
    maxTotalLossAmount: number;
    totalDd: number;
  };
  trades: TraderTradeAuditItem[];
  ruleChecklist: RuleComplianceAuditItem[];
  ipSessions: IpSessionAuditItem[];
}

