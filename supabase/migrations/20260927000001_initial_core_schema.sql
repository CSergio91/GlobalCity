-- Global City Trading Operating System: Initial Database Migration
-- Version: 20260927000001
-- Description: Core financial schema for multi-venue trading, tenant isolation, and encrypted credentials.

-- 1. Enable Required Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Organizations Table (Tenant Isolation)
CREATE TABLE IF NOT EXISTS public.organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(120) NOT NULL,
    slug VARCHAR(64) UNIQUE NOT NULL,
    tier VARCHAR(32) DEFAULT 'standard',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Users Table
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    email VARCHAR(255) UNIQUE NOT NULL,
    role VARCHAR(32) DEFAULT 'trader',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Exchange & Broker Connections (Metadata only, NO SECRETS)
CREATE TABLE IF NOT EXISTS public.connections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    venue_id VARCHAR(64) NOT NULL,          -- 'binance', 'bybit', 'okx', 'kucoin', 'mt5', 'ctrader'
    venue_name VARCHAR(120) NOT NULL,
    category VARCHAR(64) NOT NULL,          -- 'tier1_derivatives', 'institutional_broker', 'dex_l1'
    status VARCHAR(32) DEFAULT 'DISCONNECTED', -- 'CONNECTED', 'PAUSED', 'ERROR', 'DISCONNECTED'
    ping_ms INT DEFAULT 0,
    health VARCHAR(32) DEFAULT 'HEALTHY',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Encrypted Credentials (Isolated Table - Never exposed to frontend)
CREATE TABLE IF NOT EXISTS public.credentials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    connection_id UUID UNIQUE NOT NULL REFERENCES public.connections(id) ON DELETE CASCADE,
    api_key_encrypted TEXT NOT NULL,
    api_secret_encrypted TEXT NOT NULL,
    passphrase_encrypted TEXT,
    is_testnet BOOLEAN DEFAULT FALSE,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Accounts (Balances & Margin Tracking)
CREATE TABLE IF NOT EXISTS public.accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    connection_id UUID NOT NULL REFERENCES public.connections(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    account_label VARCHAR(120),
    balance_usd NUMERIC(28, 8) DEFAULT 0.00000000,
    free_margin_usd NUMERIC(28, 8) DEFAULT 0.00000000,
    currency VARCHAR(16) DEFAULT 'USD',
    synced_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Orders (OMS Order Lifecycle)
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_order_id VARCHAR(128) UNIQUE NOT NULL, -- Used for Redis/DB Idempotency
    external_order_id VARCHAR(128),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    connection_id UUID NOT NULL REFERENCES public.connections(id) ON DELETE CASCADE,
    symbol VARCHAR(32) NOT NULL,
    side VARCHAR(16) NOT NULL,                    -- 'BUY', 'SELL'
    order_type VARCHAR(32) DEFAULT 'MARKET',      -- 'MARKET', 'LIMIT', 'STOP_MARKET'
    quantity NUMERIC(28, 8) NOT NULL,
    price NUMERIC(28, 8),
    status VARCHAR(32) DEFAULT 'CREATED',         -- 'CREATED', 'SUBMITTED', 'FILLED', 'REJECTED', 'CANCELLED', 'UNKNOWN'
    filled_quantity NUMERIC(28, 8) DEFAULT 0,
    average_price NUMERIC(28, 8) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Positions
CREATE TABLE IF NOT EXISTS public.positions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    connection_id UUID NOT NULL REFERENCES public.connections(id) ON DELETE CASCADE,
    symbol VARCHAR(32) NOT NULL,
    side VARCHAR(16) NOT NULL,                    -- 'LONG', 'SHORT'
    size NUMERIC(28, 8) NOT NULL,
    entry_price NUMERIC(28, 8) NOT NULL,
    mark_price NUMERIC(28, 8) NOT NULL,
    unrealized_pnl NUMERIC(28, 8) DEFAULT 0,
    leverage INT DEFAULT 1,
    status VARCHAR(32) DEFAULT 'OPEN',            -- 'OPEN', 'CLOSED', 'LIQUIDATED'
    opened_at TIMESTAMPTZ DEFAULT NOW(),
    closed_at TIMESTAMPTZ
);

-- 9. Audit Logs (Immutable Ledger)
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    action VARCHAR(64) NOT NULL,
    resource_type VARCHAR(64) NOT NULL,
    resource_id VARCHAR(128),
    metadata JSONB DEFAULT '{}'::jsonb,
    ip_address VARCHAR(45),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Enable Row Level Security (RLS)
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Indexing for High-Performance Queries
CREATE INDEX IF NOT EXISTS idx_connections_org ON public.connections(organization_id);
CREATE INDEX IF NOT EXISTS idx_orders_client_id ON public.orders(client_order_id);
CREATE INDEX IF NOT EXISTS idx_orders_org_status ON public.orders(organization_id, status);
CREATE INDEX IF NOT EXISTS idx_positions_org_symbol ON public.positions(organization_id, symbol);
CREATE INDEX IF NOT EXISTS idx_audit_logs_org_created ON public.audit_logs(organization_id, created_at DESC);
