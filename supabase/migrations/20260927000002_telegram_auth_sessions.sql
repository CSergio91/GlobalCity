-- Migration 20260927000002: Telegram Authentication Sessions Table
-- Global City Trading Operating System: Cloud & Local Auth Synchronization

CREATE TABLE IF NOT EXISTS public.telegram_auth_sessions (
    nonce TEXT PRIMARY KEY,
    status VARCHAR(32) NOT NULL DEFAULT 'pending', -- 'pending', 'authenticated', 'expired'
    telegram_id BIGINT,
    first_name TEXT,
    last_name TEXT,
    username TEXT,
    photo_url TEXT,
    auth_date BIGINT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    authenticated_at TIMESTAMPTZ
);

-- Enable Row Level Security
ALTER TABLE public.telegram_auth_sessions ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'telegram_auth_sessions' AND policyname = 'Public read auth sessions'
    ) THEN
        CREATE POLICY "Public read auth sessions" ON public.telegram_auth_sessions FOR SELECT USING (true);
    END IF;
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'telegram_auth_sessions' AND policyname = 'Public insert auth sessions'
    ) THEN
        CREATE POLICY "Public insert auth sessions" ON public.telegram_auth_sessions FOR INSERT WITH CHECK (true);
    END IF;
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'telegram_auth_sessions' AND policyname = 'Public update auth sessions'
    ) THEN
        CREATE POLICY "Public update auth sessions" ON public.telegram_auth_sessions FOR UPDATE USING (true);
    END IF;
END $$;

-- Índices de consulta rápida por nonce y telegram_id
CREATE INDEX IF NOT EXISTS idx_tg_auth_nonce ON public.telegram_auth_sessions(nonce);
CREATE INDEX IF NOT EXISTS idx_tg_auth_tgid ON public.telegram_auth_sessions(telegram_id);
