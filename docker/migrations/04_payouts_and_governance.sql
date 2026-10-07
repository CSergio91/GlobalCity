-- ============================================================================
-- EKLIPSE FUNDED — MIGRATION 04: GOBERNANZA DE PAGOS, RETIROS Y AUDITORÍA
-- Soporte completo para ciclo de vida de Prop Firm: Retiros (Payouts),
-- Regla de consistencia del 40%, comprobantes on-chain y tracking de migraciones.
-- ============================================================================

-- 1. TABLA DE TRACKING DE MIGRACIONES (Para replicabilidad determinista en VPS)
CREATE TABLE IF NOT EXISTS public._migrations (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) UNIQUE NOT NULL,
  checksum VARCHAR(64),
  applied_at TIMESTAMPTZ DEFAULT NOW()
);

-- Registrar las migraciones base si no están registradas
INSERT INTO public._migrations (name)
VALUES 
  ('01_schema.sql'),
  ('02_roles_and_permissions.sql'),
  ('03_seeds.sql')
ON CONFLICT (name) DO NOTHING;

-- ============================================================================
-- 2. TABLA: SOLICITUDES DE RETIRO Y PAGOS DE BENEFICIOS (PAYOUT REQUESTS)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.payout_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES public.trading_accounts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  trader_email VARCHAR(150) NOT NULL,
  
  -- Montos y split acordado
  amount NUMERIC(15, 2) NOT NULL,                           -- Ganancia bruta solicitada
  profit_split_percent NUMERIC(5, 2) NOT NULL DEFAULT 80.00,-- Reparto acordado (ej: 80% o 90%)
  net_payout_amount NUMERIC(15, 2) NOT NULL,                -- Monto neto a transferir al trader
  firm_retained_amount NUMERIC(15, 2) NOT NULL,             -- Monto que retiene la tesorería de la firma
  
  -- Método de pago y destino on-chain
  payout_method VARCHAR(30) NOT NULL DEFAULT 'CRYPTO_USDT', -- 'CRYPTO_USDT' | 'CRYPTO_USDC' | 'BANK_WIRE'
  crypto_network VARCHAR(30) DEFAULT 'TRC20',               -- 'TRC20', 'BEP20', 'ERC20', 'POLYGON', 'SOLANA'
  destination_address TEXT NOT NULL,
  
  -- Estado y auditoría de consistencia
  status VARCHAR(20) NOT NULL DEFAULT 'PENDING',            -- 'PENDING', 'APPROVED', 'REJECTED', 'PROCESSED'
  consistency_checked BOOLEAN DEFAULT FALSE,
  best_day_profit NUMERIC(15, 2) DEFAULT 0.00,
  best_day_ratio NUMERIC(5, 4) DEFAULT 0.00,                -- Máximo permitido 0.40 (40%)
  
  -- Verificación en blockchain y administración
  tx_hash TEXT,
  reviewed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  rejection_reason TEXT,
  notes TEXT,
  
  requested_at TIMESTAMPTZ DEFAULT NOW(),
  processed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_payout_requests_account ON public.payout_requests(account_id);
CREATE INDEX IF NOT EXISTS idx_payout_requests_status ON public.payout_requests(status);
CREATE INDEX IF NOT EXISTS idx_payout_requests_email ON public.payout_requests(trader_email);

-- ============================================================================
-- 3. PERMISOS Y PRIVILEGIOS POSTGREST / SUPABASE
-- ============================================================================
GRANT ALL PRIVILEGES ON TABLE public.payout_requests TO anon, authenticated, service_role;
GRANT ALL PRIVILEGES ON TABLE public._migrations TO anon, authenticated, service_role;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;

-- Registrar esta migración como aplicada
INSERT INTO public._migrations (name)
VALUES ('04_payouts_and_governance.sql')
ON CONFLICT (name) DO NOTHING;
