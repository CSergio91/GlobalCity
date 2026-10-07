-- ============================================================================
-- ZYTI TRADE / PROP FIRM CRM — ESQUEMA RELACIONAL AUTOCONTENIDO
-- Módulo independiente: Copiar y pegar para cualquier nueva Empresa de Fondeo
-- Compatible con PostgreSQL 15+, Supabase y Docker local
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- 1. EMPRESAS DE FONDEO (CLIENTES B2B)
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
-- 2. REGLAS DE RIESGO DINÁMICAS (Cero valores fijos en código)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.risk_rule_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  firm_id UUID REFERENCES public.prop_firms(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  max_daily_loss_percent NUMERIC(5, 2) NOT NULL DEFAULT 5.00,
  max_total_drawdown_percent NUMERIC(5, 2) NOT NULL DEFAULT 10.00,
  max_trailing_drawdown_percent NUMERIC(5, 2) DEFAULT NULL,
  drawdown_type VARCHAR(30) NOT NULL DEFAULT 'EOD', -- 'EOD' | 'TRAILING_EQUITY'
  max_leverage INT NOT NULL DEFAULT 100,
  mandatory_stop_loss BOOLEAN NOT NULL DEFAULT false,
  weekend_holding_allowed BOOLEAN NOT NULL DEFAULT true,
  consistency_rule_percent NUMERIC(5, 2) DEFAULT 40.00,
  min_trading_days INT DEFAULT 5,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_risk_rule_configs_firm ON public.risk_rule_configs(firm_id);

-- ============================================================================
-- 3. CREDENCIALES DE API (EMPRESAS DE FONDEO Y AGENTES DE IA)
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
CREATE INDEX IF NOT EXISTS idx_api_credentials_type ON public.api_credentials(key_type);

-- ============================================================================
-- 4. CUENTAS DE TRADING EMITIDAS A TRADERS
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.trading_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  firm_id UUID REFERENCES public.prop_firms(id) ON DELETE SET NULL,
  account_number VARCHAR(50) NOT NULL UNIQUE,
  trader_email VARCHAR(150) NOT NULL,
  initial_balance NUMERIC(15, 2) NOT NULL DEFAULT 10000.00,
  current_balance NUMERIC(15, 2) NOT NULL DEFAULT 10000.00,
  equity NUMERIC(15, 2) NOT NULL DEFAULT 10000.00,
  peak_equity NUMERIC(15, 2) NOT NULL DEFAULT 10000.00,
  daily_start_equity NUMERIC(15, 2) NOT NULL DEFAULT 10000.00,
  daily_start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE', -- 'ACTIVE', 'PASSED', 'BREACHED', 'FROZEN'
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

-- ============================================================================
-- 5. AUDITORÍA DE INFRACCIONES DE RIESGO
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
-- 6. DATOS INICIALES (PRESETS POR DEFECTO PARA INSTALACIÓN RÁPIDA)
-- ============================================================================
INSERT INTO public.risk_rule_configs (name, max_daily_loss_percent, max_total_drawdown_percent, max_leverage, mandatory_stop_loss, consistency_rule_percent, min_trading_days)
VALUES 
  ('Challenge Estándar 10K/50K (2-Fases)', 5.00, 10.00, 100, false, 40.00, 5),
  ('Evaluación Institucional Estricta 100K', 4.00, 8.00, 30, true, 30.00, 7),
  ('Scaling Plan Rápido (1-Fase)', 3.00, 6.00, 50, false, 50.00, 3)
ON CONFLICT DO NOTHING;
