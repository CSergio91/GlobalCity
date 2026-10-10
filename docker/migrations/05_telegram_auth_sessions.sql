-- ============================================================================
-- EKLIPSE FUNDED / PROP FIRM PLATFORM — MIGRATION 05: TELEGRAM SESSIONS
-- ============================================================================
-- Tabla de soporte opcional para vinculación de sesiones y alertas de Telegram.
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.telegram_auth_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nonce VARCHAR(100) UNIQUE NOT NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'authenticated',
  telegram_id BIGINT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT,
  username TEXT,
  photo_url TEXT,
  auth_date BIGINT,
  authenticated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tg_sessions_nonce ON public.telegram_auth_sessions(nonce);
CREATE INDEX IF NOT EXISTS idx_tg_sessions_tg_id ON public.telegram_auth_sessions(telegram_id);
CREATE INDEX IF NOT EXISTS idx_tg_sessions_status ON public.telegram_auth_sessions(status);

-- Conceder permisos a PostgREST y roles Supabase
GRANT ALL PRIVILEGES ON TABLE public.telegram_auth_sessions TO anon, authenticated, service_role;
