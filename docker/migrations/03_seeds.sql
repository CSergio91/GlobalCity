-- ============================================================================
-- EKLIPSE FUNDED — MIGRATION 03: DATOS SEMILLA INSTITUCIONALES (SEED DATA)
-- Modelos de challenge, reglas pre-trade dinámicas y cuentas demo iniciales
-- Idempotente mediante ON CONFLICT DO UPDATE
-- ============================================================================

-- 1. EMPRESA DE FONDEO MAESTRA: EKLIPSE FUNDED
INSERT INTO public.prop_firms (id, name, api_key_hash, webhook_secret, is_active)
VALUES (
  'a0000000-0000-0000-0000-000000000001',
  'Eklipse Funded',
  'hash_initial_eklipse_master_key',
  'whsec_eklipse_vault_master_secret',
  true
)
ON CONFLICT (id) DO UPDATE 
SET name = EXCLUDED.name,
    api_key_hash = EXCLUDED.api_key_hash,
    webhook_secret = EXCLUDED.webhook_secret;

-- 2. MODELOS DE RETO Y REGLAS DINÁMICAS PRE-TRADE
-- Modelo A: Challenge 1 Paso (10% Target / 5% Daily / 10% Total DD)
INSERT INTO public.risk_rule_configs (
  id,
  firm_id,
  name,
  model_type,
  default_account_balance,
  is_default_demo,
  drawdown_type,
  max_daily_loss_percent,
  max_total_drawdown_percent,
  profit_target_percent,
  min_trading_days,
  max_leverage,
  mandatory_stop_loss,
  max_positions_per_symbol_enabled,
  max_positions_per_symbol,
  max_total_open_positions_enabled,
  max_total_open_positions,
  anti_hedging_enabled,
  max_risk_per_trade_percent,
  consistency_rule_percent,
  weekend_holding_allowed,
  news_trading_allowed,
  min_trade_duration_seconds,
  profit_split_percent,
  inactivity_days_limit,
  is_active
) VALUES (
  'b0000000-0000-0000-0000-000000000001',
  'a0000000-0000-0000-0000-000000000001',
  'Eklipse Challenge 1 Paso (100K)',
  'ONE_PHASE',
  100000.00,
  true,
  'EOD',
  5.00,
  10.00,
  10.00,
  5,
  50,
  false,
  true,
  3,
  true,
  6,
  true,
  2.00,
  40.00,
  true,
  true,
  15,
  80.00,
  30,
  true
)
ON CONFLICT (id) DO UPDATE 
SET name = EXCLUDED.name,
    model_type = EXCLUDED.model_type,
    profit_target_percent = EXCLUDED.profit_target_percent;

-- Modelo B: Challenge 2 Pasos (Fase 1: 10% / Fase 2: 5%)
INSERT INTO public.risk_rule_configs (
  id,
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
  max_leverage,
  mandatory_stop_loss,
  anti_hedging_enabled,
  consistency_rule_percent,
  weekend_holding_allowed,
  news_trading_allowed,
  profit_split_percent,
  is_active
) VALUES (
  'b0000000-0000-0000-0000-000000000002',
  'a0000000-0000-0000-0000-000000000001',
  'Eklipse Challenge 2 Pasos (100K)',
  'TWO_PHASE',
  100000.00,
  false,
  'EOD',
  5.00,
  10.00,
  10.00,
  5.00,
  5,
  50,
  false,
  true,
  40.00,
  true,
  true,
  80.00,
  true
)
ON CONFLICT (id) DO UPDATE 
SET name = EXCLUDED.name,
    profit_target_phase2_percent = EXCLUDED.profit_target_phase2_percent;

-- Modelo C: Instant Funding (Fondeo Inmediato Directo sin evaluación previa)
INSERT INTO public.risk_rule_configs (
  id,
  firm_id,
  name,
  model_type,
  default_account_balance,
  is_default_demo,
  drawdown_type,
  max_daily_loss_percent,
  max_total_drawdown_percent,
  profit_target_percent,
  min_trading_days,
  max_leverage,
  mandatory_stop_loss,
  anti_hedging_enabled,
  consistency_rule_percent,
  weekend_holding_allowed,
  profit_split_percent,
  is_active
) VALUES (
  'b0000000-0000-0000-0000-000000000003',
  'a0000000-0000-0000-0000-000000000001',
  'Eklipse Instant Funding (50K)',
  'INSTANT_FUNDING',
  50000.00,
  false,
  'TRAILING_EQUITY',
  4.00,
  8.00,
  0.00,
  0,
  30,
  true,
  true,
  40.00,
  false,
  70.00,
  true
)
ON CONFLICT (id) DO UPDATE 
SET name = EXCLUDED.name,
    profit_split_percent = EXCLUDED.profit_split_percent;

-- 3. PERFILES DE USUARIO INICIALES
INSERT INTO public.profiles (id, email, full_name, role, provider, is_verified)
VALUES 
  ('c0000000-0000-0000-0000-000000000001', 'admin@eklipsefunded.com', 'Eklipse Admin', 'admin', 'email', true),
  ('c0000000-0000-0000-0000-000000000002', 'trader@eklipsefunded.com', 'Demo Master Trader', 'trader', 'email', true)
ON CONFLICT (email) DO NOTHING;

-- 4. CUENTA DE TRADING DEMO INICIAL ACTIVA
INSERT INTO public.trading_accounts (
  id,
  firm_id,
  user_id,
  account_number,
  trader_email,
  initial_balance,
  current_balance,
  equity,
  peak_equity,
  daily_start_equity,
  status,
  access_token,
  rules_config
) VALUES (
  'd0000000-0000-0000-0000-000000000001',
  'a0000000-0000-0000-0000-000000000001',
  'c0000000-0000-0000-0000-000000000002',
  'EKL-100K-DEMO',
  'trader@eklipsefunded.com',
  100000.00,
  100000.00,
  100000.00,
  100000.00,
  100000.00,
  'ACTIVE',
  'ekl_demo_token_884920491823',
  '{"maxDailyDrawdownPct": 5.0, "maxTotalDrawdownPct": 10.0, "profitTargetPct": 10.0, "drawdownType": "EOD", "profitSplitPct": 80}'::jsonb
)
ON CONFLICT (account_number) DO UPDATE
SET current_balance = EXCLUDED.current_balance,
    equity = EXCLUDED.equity;
