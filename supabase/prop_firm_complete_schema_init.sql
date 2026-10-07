-- ============================================================================
-- GLOBAL CITY FUNDING / ZYTI TRADE — ESQUEMA RELACIONAL INSTITUCIONAL COMPLETO
-- Base de datos completa para Empresa de Fondeo (Prop Firm) con Motor de Riesgo 24/7
-- Compatible con PostgreSQL 15+, Supabase Cloud y Docker On-Premise
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- 1. TABLA: EMPRESAS DE FONDEO (PROP FIRMS / BROKERS B2B)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.prop_firms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  api_key_hash VARCHAR(255) NOT NULL UNIQUE,
  webhook_url TEXT,
  webhook_secret VARCHAR(100) NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 2. TABLA: PERFILES DE USUARIO (TRADERS Y ADMINISTRADORES)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'trader', -- 'admin', 'trader', 'support'
  provider TEXT DEFAULT 'email', -- 'email', 'telegram', 'google'
  telegram_id BIGINT,
  telegram_username TEXT,
  is_verified BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 3. TABLA: REGLAS DE RIESGO DINÁMICAS (13 REGLAS INSTITUCIONALES DEL MOTOR)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.risk_rule_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  firm_id UUID REFERENCES public.prop_firms(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  model_type VARCHAR(30) NOT NULL DEFAULT 'ONE_PHASE', -- 'INSTANT_FUNDING' | 'ONE_PHASE' | 'TWO_PHASE'
  default_account_balance NUMERIC(15, 2) NOT NULL DEFAULT 100000.00,
  is_default_demo BOOLEAN NOT NULL DEFAULT false,
  drawdown_type VARCHAR(30) NOT NULL DEFAULT 'EOD', -- 'EOD' | 'TRAILING_EQUITY'
  max_daily_loss_percent NUMERIC(5, 2) NOT NULL DEFAULT 5.00,
  max_total_drawdown_percent NUMERIC(5, 2) NOT NULL DEFAULT 10.00,
  max_trailing_drawdown_percent NUMERIC(5, 2) DEFAULT NULL,
  profit_target_percent NUMERIC(5, 2) DEFAULT 10.00,
  profit_target_phase2_percent NUMERIC(5, 2) DEFAULT 5.00,
  min_trading_days INT DEFAULT 5,
  min_daily_profit_type VARCHAR(20) DEFAULT 'PERCENT', -- 'PERCENT' | 'AMOUNT'
  min_daily_profit_value NUMERIC(10, 2) DEFAULT 0.50,
  max_leverage INT NOT NULL DEFAULT 50,
  mandatory_stop_loss BOOLEAN NOT NULL DEFAULT false,
  max_positions_per_symbol_enabled BOOLEAN NOT NULL DEFAULT false,
  max_positions_per_symbol INT DEFAULT 2,
  max_total_open_positions_enabled BOOLEAN NOT NULL DEFAULT false,
  max_total_open_positions INT DEFAULT 5,
  anti_hedging_enabled BOOLEAN NOT NULL DEFAULT false,
  max_risk_per_trade_percent NUMERIC(5, 2) DEFAULT 2.00,
  consistency_rule_percent NUMERIC(5, 2) DEFAULT 40.00,
  weekend_holding_allowed BOOLEAN NOT NULL DEFAULT true,
  news_trading_allowed BOOLEAN NOT NULL DEFAULT true,
  min_trade_duration_seconds INT DEFAULT 10,
  profit_split_percent NUMERIC(5, 2) DEFAULT 80.00,
  inactivity_days_limit INT DEFAULT 30,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_risk_rule_configs_firm ON public.risk_rule_configs(firm_id);
CREATE INDEX IF NOT EXISTS idx_risk_rule_configs_active ON public.risk_rule_configs(is_active);

-- ============================================================================
-- 4. TABLA: CUENTAS DE TRADING DE LOS TRADERS (EVALUACIÓN Y FONDEADAS)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.trading_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  firm_id UUID REFERENCES public.prop_firms(id) ON DELETE SET NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  account_number VARCHAR(50) NOT NULL UNIQUE,
  trader_email VARCHAR(150) NOT NULL,
  initial_balance NUMERIC(15, 2) NOT NULL DEFAULT 100000.00,
  current_balance NUMERIC(15, 2) NOT NULL DEFAULT 100000.00,
  equity NUMERIC(15, 2) NOT NULL DEFAULT 100000.00,
  peak_equity NUMERIC(15, 2) NOT NULL DEFAULT 100000.00,
  daily_start_equity NUMERIC(15, 2) NOT NULL DEFAULT 100000.00,
  daily_start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE', -- 'ACTIVE', 'PASSED', 'BREACHED', 'FROZEN', 'WARNING'
  breach_reason TEXT,
  trading_days_count INT DEFAULT 0,
  last_trade_date DATE,
  rules_config JSONB NOT NULL DEFAULT '{}'::jsonb,
  access_token VARCHAR(255) NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_trading_accounts_token ON public.trading_accounts(access_token);
CREATE INDEX IF NOT EXISTS idx_trading_accounts_firm ON public.trading_accounts(firm_id);
CREATE INDEX IF NOT EXISTS idx_trading_accounts_status ON public.trading_accounts(status);
CREATE INDEX IF NOT EXISTS idx_trading_accounts_email ON public.trading_accounts(trader_email);

-- ============================================================================
-- 5. TABLA: OPERACIONES (TRADES ABIERTOS Y CERRADOS)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.account_trades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES public.trading_accounts(id) ON DELETE CASCADE,
  user_id UUID,
  trader_email VARCHAR(150),
  exchange VARCHAR(30) NOT NULL DEFAULT 'binance',
  symbol VARCHAR(30) NOT NULL,
  side VARCHAR(10) NOT NULL, -- 'LONG' | 'SHORT'
  size NUMERIC(15, 4) NOT NULL,
  leverage INT NOT NULL DEFAULT 10,
  entry_price NUMERIC(15, 2) NOT NULL,
  exit_price NUMERIC(15, 2),
  sl_price NUMERIC(15, 2),
  tp_price NUMERIC(15, 2),
  realized_pnl NUMERIC(15, 2),
  commission NUMERIC(15, 2) DEFAULT 0.00,
  status VARCHAR(20) NOT NULL DEFAULT 'OPEN', -- 'OPEN' | 'CLOSED'
  close_reason VARCHAR(40), -- 'MANUAL', 'TP', 'SL', 'LIQUIDATION_BREACH', 'WEEKEND_HOLDING_AUTO_CLOSE'
  opened_at TIMESTAMPTZ DEFAULT NOW(),
  closed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_account_trades_account ON public.account_trades(account_id);
CREATE INDEX IF NOT EXISTS idx_account_trades_status ON public.account_trades(status);
CREATE INDEX IF NOT EXISTS idx_account_trades_symbol ON public.account_trades(symbol);

-- ============================================================================
-- 6. TABLA: SNAPSHOTS DE EQUIDAD (CURVA DE CAPITAL Y AUDITORÍA)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.equity_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES public.trading_accounts(id) ON DELETE CASCADE,
  equity NUMERIC(15, 2) NOT NULL,
  balance NUMERIC(15, 2) NOT NULL,
  drawdown_daily_pct NUMERIC(6, 2) NOT NULL,
  drawdown_total_pct NUMERIC(6, 2) NOT NULL,
  recorded_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_equity_snapshots_account ON public.equity_snapshots(account_id, recorded_at);

-- ============================================================================
-- 7. TABLA: CREDENCIALES DE API (ACCESO B2B Y AGENTES)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.api_credentials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  key_type VARCHAR(30) NOT NULL CHECK (key_type IN ('prop_firm', 'ai_agent', 'webhook')),
  api_key_public VARCHAR(64) UNIQUE NOT NULL,
  key_hash VARCHAR(128) NOT NULL,
  scopes TEXT[] NOT NULL DEFAULT '{}',
  ip_whitelist TEXT[] DEFAULT '{}',
  rate_limit_rpm INT DEFAULT 120,
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_used_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_api_credentials_public ON public.api_credentials(api_key_public);

-- ============================================================================
-- 8. TABLA: AUDITORÍA DE INFRACCIONES DE RIESGO EN VIVO
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.risk_audit_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID REFERENCES public.trading_accounts(id) ON DELETE CASCADE,
  rule_name VARCHAR(100) NOT NULL,
  breach_type VARCHAR(50) NOT NULL,
  current_metrics JSONB NOT NULL,
  action_taken VARCHAR(50) NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_risk_audit_account ON public.risk_audit_events(account_id);

-- ============================================================================
-- 9. DATOS SEMILLA INICIALES (PRESETS POR DEFECTO Y PLANTILLA BASE)
-- ============================================================================
INSERT INTO public.prop_firms (id, name, api_key_hash, webhook_secret, is_active)
VALUES (
  'a0000000-0000-0000-0000-000000000001',
  'Global City Funding',
  'hash_initial_global_city_key',
  'whsec_global_city_vault_secret',
  true
)
ON CONFLICT (api_key_hash) DO NOTHING;

INSERT INTO public.risk_rule_configs (
  firm_id,
  name,
  model_type,
  default_account_balance,
  is_default_demo,
  drawdown_type,
  max_daily_loss_percent,
  max_total_drawdown_percent,
  profit_target_percent,
  profit_target_phase2_percent,
  min_trading_days,
  min_daily_profit_type,
  min_daily_profit_value,
  max_leverage,
  mandatory_stop_loss,
  max_positions_per_symbol_enabled,
  max_positions_per_symbol,
  max_total_open_positions_enabled,
  max_total_open_positions,
  anti_hedging_enabled,
  consistency_rule_percent,
  weekend_holding_allowed,
  news_trading_allowed,
  min_trade_duration_seconds,
  profit_split_percent,
  inactivity_days_limit,
  is_active
) VALUES (
  'a0000000-0000-0000-0000-000000000001',
  'Global City 100K Challenge (1 Fase)',
  'ONE_PHASE',
  100000.00,
  true,
  'EOD',
  5.00,
  10.00,
  10.00,
  5.00,
  5,
  'PERCENT',
  0.50,
  50,
  false,
  false,
  2,
  false,
  5,
  false,
  40.00,
  true,
  true,
  10,
  80.00,
  30,
  true
)
ON CONFLICT DO NOTHING;
