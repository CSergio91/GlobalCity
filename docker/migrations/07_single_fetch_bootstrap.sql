-- ============================================================================
-- EKLIPSE FUNDED — SINGLE-FETCH BOOTSTRAP RPC (ZERO-EGRESS COMPLIANT)
-- ============================================================================
-- Consolida en 1 SOLA llamada de base de datos (<15ms):
-- 1. Perfil del trader y roles
-- 2. Cuentas de trading vinculadas
-- 3. Trades recientes
-- 4. Reglas de riesgo activas
-- Erradica waterfall queries (pérdida de egress y latencia)
-- ============================================================================

CREATE OR REPLACE FUNCTION public.get_trader_bootstrap(
    p_user_id UUID DEFAULT NULL,
    p_email TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_user_id UUID := p_user_id;
    v_email TEXT := lower(trim(p_email));
    v_profile JSONB;
    v_accounts JSONB;
    v_trades JSONB;
    v_rules JSONB;
BEGIN
    -- 1. Si no viene p_user_id, resolver de auth.uid() si aplica
    IF v_user_id IS NULL THEN
        BEGIN
            v_user_id := auth.uid();
        EXCEPTION WHEN OTHERS THEN
            v_user_id := NULL;
        END;
    END IF;

    -- 2. Si no viene email, obtenerlo de profiles
    IF v_email IS NULL AND v_user_id IS NOT NULL THEN
        SELECT lower(email) INTO v_email FROM public.profiles WHERE id = v_user_id;
    END IF;

    -- 3. Perfil del usuario
    SELECT to_jsonb(p) INTO v_profile
    FROM (
        SELECT id, role, email, full_name, avatar_url, is_verified, created_at
        FROM public.profiles
        WHERE (v_user_id IS NOT NULL AND id = v_user_id)
           OR (v_email IS NOT NULL AND lower(email) = v_email)
        LIMIT 1
    ) p;

    IF v_profile IS NULL THEN
        v_profile := jsonb_build_object('role', 'trader');
    END IF;

    -- 4. Cuentas de trading del usuario
    SELECT coalesce(jsonb_agg(to_jsonb(a)), '[]'::jsonb) INTO v_accounts
    FROM (
        SELECT *
        FROM public.trading_accounts
        WHERE (v_email IS NOT NULL AND lower(trader_email) = v_email)
           OR (v_user_id IS NOT NULL AND user_id = v_user_id)
        ORDER BY created_at DESC
    ) a;

    -- 5. Trades recientes (últimos 50 de todas las cuentas del usuario)
    SELECT coalesce(jsonb_agg(to_jsonb(t)), '[]'::jsonb) INTO v_trades
    FROM (
        SELECT t.*
        FROM public.account_trades t
        INNER JOIN public.trading_accounts acc ON t.account_id = acc.id
        WHERE (v_email IS NOT NULL AND lower(acc.trader_email) = v_email)
           OR (v_user_id IS NOT NULL AND acc.user_id = v_user_id)
        ORDER BY COALESCE(t.created_at, t.opened_at) DESC
        LIMIT 50
    ) t;

    -- 6. Reglas de riesgo de retos activas
    SELECT coalesce(jsonb_agg(to_jsonb(r)), '[]'::jsonb) INTO v_rules
    FROM (
        SELECT *
        FROM public.risk_rule_configs
        WHERE is_active = true
        ORDER BY default_account_balance ASC
    ) r;

    RETURN jsonb_build_object(
        'profile', v_profile,
        'accounts', v_accounts,
        'trades', v_trades,
        'rules', v_rules,
        'server_time', now()
    );
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_trader_bootstrap(UUID, TEXT) TO authenticated, anon, service_role;
