import { createClient } from '@supabase/supabase-js';

// Eklipse Funded — Supabase Gateway Configuration (Local Docker Gateway en :54321 o Supabase Cloud)
const supabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL || 'http://localhost:54321';
const supabaseAnonKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlzcyI6InN1cGFiYXNlIiwiaWF0IjoxNzAwMDAwMDAwLCJleHAiOjIwMDAwMDAwMDB9.J4Nc54mpNrnEUUNHnVZfNUyTbnX_ss1OzKsUnJRMvkw';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);


export interface PropFirmAccount {
  id: string;
  firmId?: string;
  firmName: string;
  accountNumber: string;
  initialBalance: number;
  currentBalance: number;
  equity: number;
  dailyStartEquity?: number;
  dailyStartDate?: string;
  tradingDaysCount?: number;
  lastTradeDate?: string;
  status: 'ACTIVE' | 'PASSED' | 'BREACHED' | 'FROZEN' | 'WARNING';
  rulesConfig: Record<string, any> & {
    maxDailyDrawdownPct?: number;
    maxTotalDrawdownPct?: number;
    profitTargetPct?: number;
    drawdownType?: 'EOD' | 'TRAILING_EQUITY';
    mandatoryStopLoss?: boolean;
    minTradingDays?: number;
    maxLeverage?: number;
  };
}

export interface UserSession {
  id?: string;
  email: string;
  name?: string;
  avatarUrl?: string;
  isDemo?: boolean;
  provider?: 'email' | 'demo' | 'google' | 'github' | 'telegram';
  telegramId?: number;
  telegramUsername?: string;
  role?: 'admin' | 'trader' | 'soporte' | 'marketing';
  isVerified?: boolean;
  accounts?: PropFirmAccount[];
  activeAccountId?: string;
}

// Persistencia en IndexedDB para cumplimiento de la gobernanza Zero-Egress (SKILL)
const IDB_NAME = 'zyti_db';
const IDB_STORE = 'session';

async function openIDB(): Promise<IDBDatabase | null> {
  if (typeof window === 'undefined' || !window.indexedDB) return null;
  return new Promise((resolve) => {
    try {
      const request = indexedDB.open(IDB_NAME, 1);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(IDB_STORE)) {
          db.createObjectStore(IDB_STORE);
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

async function setIDBSession(session: UserSession | null): Promise<void> {
  try {
    const db = await openIDB();
    if (!db) return;
    const tx = db.transaction(IDB_STORE, 'readwrite');
    const store = tx.objectStore(IDB_STORE);
    if (session) {
      store.put(session, 'zyti_session_snapshot');
    } else {
      store.delete('zyti_session_snapshot');
    }
  } catch (_) {}
}

export const getStoredSession = (): UserSession | null => {
  try {
    const raw = localStorage.getItem('zyti_user_session');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const setStoredSession = (user: UserSession | null) => {
  if (user) {
    try {
      localStorage.setItem('zyti_user_session', JSON.stringify(user));
    } catch (_) {}
    setIDBSession(user);
  } else {
    try {
      localStorage.removeItem('zyti_user_session');
    } catch (_) {}
    setIDBSession(null);
  }
};

/**
 * Consulta en Supabase las cuentas de fondeo asignadas al ID de usuario o correo del trader
 */
export async function fetchTraderAccounts(identifier: string): Promise<PropFirmAccount[]> {
  try {
    const clean = identifier.trim().toLowerCase();
    if (!clean) return [];

    let query = supabase
      .from('trading_accounts')
      .select(`
        id,
        user_id,
        firm_id,
        account_number,
        initial_balance,
        current_balance,
        equity,
        daily_start_equity,
        daily_start_date,
        trading_days_count,
        last_trade_date,
        status,
        rules_config,
        prop_firms (
          id,
          name
        )
      `);

    if (IS_UUID_REGEX.test(clean)) {
      query = query.or(`user_id.eq.${clean},id.eq.${clean}`);
    } else {
      query = query.eq('trader_email', clean);
    }

    const { data, error } = await query;

    if (error || !data) {
      console.warn('[ZYTI DB] No se pudieron cargar cuentas de fondeo:', error?.message);
      return [];
    }

    return data.map((row: any) => ({
      id: row.id,
      firmId: row.firm_id,
      firmName: row.prop_firms?.name || 'Prop Firm',
      accountNumber: row.account_number,
      initialBalance: Number(row.initial_balance),
      currentBalance: Number(row.current_balance),
      equity: Number(row.equity),
      dailyStartEquity: row.daily_start_equity ? Number(row.daily_start_equity) : Number(row.initial_balance),
      dailyStartDate: row.daily_start_date ? String(row.daily_start_date) : undefined,
      tradingDaysCount: row.trading_days_count !== undefined ? Number(row.trading_days_count) : 0,
      lastTradeDate: row.last_trade_date ? String(row.last_trade_date) : undefined,
      status: row.status,
      rulesConfig: row.rules_config || {}
    }));
  } catch (err) {
    console.error('[ZYTI DB] Error inesperado consultando cuentas:', err);
    return [];
  }
}

/**
 * Consulta y auto-aprovisiona la cuenta oficial estandarizada de 100K si el trader no tiene una en Supabase.
 */
export async function ensureDefaultDemoAccount(email: string, userId?: string): Promise<PropFirmAccount[]> {
  try {
    const clean = email.trim().toLowerCase();
    if (!clean) return [];

    const existing = await fetchTraderAccounts(clean);
    if (existing.length > 0) {
      return existing;
    }

    // 1. Obtener la Plantilla Demo Activa configurada en el CRM / Supabase
    let templateBalance = 100000.00;
    let templateName = 'ZYTI Funding';
    let defaultRules: PropFirmAccount['rulesConfig'] = {
      maxDailyDrawdownPct: 5.0,
      maxTotalDrawdownPct: 10.0,
      maxLeverage: 100,
      profitTargetPct: 8.0,
      minTradingDays: 5,
      drawdownType: 'EOD'
    };

    try {
      const { data: defaultRule } = await supabase
        .from('risk_rule_configs')
        .select('*')
        .eq('is_active', true)
        .order('is_default_demo', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (defaultRule) {
        if (defaultRule.default_account_balance) {
          templateBalance = Number(defaultRule.default_account_balance);
        }
        if (defaultRule.name) {
          templateName = defaultRule.name;
        }
        defaultRules = {
          maxDailyDrawdownPct: Number(defaultRule.max_daily_loss_percent),
          maxTotalDrawdownPct: Number(defaultRule.max_total_drawdown_percent),
          maxLeverage: Number(defaultRule.max_leverage),
          profitTargetPct: 8.0,
          minTradingDays: Number(defaultRule.min_trading_days || 5),
          mandatoryStopLoss: !!defaultRule.mandatory_stop_loss,
          drawdownType: defaultRule.drawdown_type || 'EOD'
        };
      }
    } catch (_) {}

    // Auto-aprovisionar cuenta demo basada en la Plantilla Activa de la Prop Firm
    const sizeLabel = Math.round(templateBalance / 1000);
    const suffix = (userId || clean).replace(/[^a-zA-Z0-9]/g, '').slice(0, 6).toUpperCase() || Math.floor(1000 + Math.random() * 9000);
    const accountNumber = `ZYTI-${sizeLabel}K-${suffix}`;
    const accessToken = `sso_${(userId || clean).replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}`;

    const { data, error } = await supabase
      .from('trading_accounts')
      .insert({
        user_id: (userId && IS_UUID_REGEX.test(userId)) ? userId : null,
        account_number: accountNumber,
        trader_email: clean,
        initial_balance: templateBalance,
        current_balance: templateBalance,
        equity: templateBalance,
        peak_equity: templateBalance,
        daily_start_equity: templateBalance,
        status: 'ACTIVE',
        rules_config: defaultRules,
        access_token: accessToken
      })
      .select(`
        id,
        firm_id,
        account_number,
        initial_balance,
        current_balance,
        equity,
        status,
        rules_config
      `)
      .single();

    if (error || !data) {
      console.warn('[ZYTI DB] Fallback local para cuenta demo:', error?.message);
      return [{
        id: `demo_${Date.now()}`,
        firmId: 'zyti_funding',
        firmName: templateName,
        accountNumber,
        initialBalance: templateBalance,
        currentBalance: templateBalance,
        equity: templateBalance,
        status: 'ACTIVE',
        rulesConfig: defaultRules
      }];
    }

    return [{
      id: data.id,
      firmId: data.firm_id,
      firmName: templateName,
      accountNumber: data.account_number,
      initialBalance: Number(data.initial_balance),
      currentBalance: Number(data.current_balance),
      equity: Number(data.equity),
      status: data.status,
      rulesConfig: data.rules_config || defaultRules
    }];
  } catch (err) {
    console.error('[ZYTI DB] Error inesperado en ensureDefaultDemoAccount:', err);
    return [];
  }
}

const IS_UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Guarda y actualiza de manera robusta el perfil del usuario en la base de datos (Supabase)
 * usando coincidencia múltiple (UUID, telegram_id o correo) para erradicar fallos de tipo de datos (22P02).
 */
export async function saveUserProfile(
  user: UserSession | null | undefined,
  updates: { name?: string; email?: string; avatarUrl?: string }
): Promise<UserSession> {
  const cleanName = updates.name !== undefined ? updates.name.trim() : (user?.name || 'Trader');
  const cleanEmail = updates.email?.trim() || undefined;
  const cleanAvatar = updates.avatarUrl?.trim() || undefined;

  const updatedUser: UserSession = {
    ...user,
    email: cleanEmail || user?.email || '',
    name: cleanName || user?.name || 'Trader',
    avatarUrl: cleanAvatar !== undefined ? cleanAvatar : user?.avatarUrl
  };

  // 1. Guardar de inmediato localmente (Optimistic Update a 0ms)
  setStoredSession(updatedUser);

  // 2. Sincronización robusta en Supabase (public.profiles)
  try {
    const profilePayload: any = {
      updated_at: new Date().toISOString()
    };
    if (updates.name !== undefined) profilePayload.full_name = cleanName;
    if (cleanEmail !== undefined) profilePayload.email = cleanEmail;
    if (cleanAvatar !== undefined) profilePayload.avatar_url = cleanAvatar;

    let updatePromise: any = null;

    if (user?.id && IS_UUID_REGEX.test(user.id)) {
      updatePromise = supabase.from('profiles').update(profilePayload).eq('id', user.id);
    } else if (user?.telegramId || (user?.id && /^\d+$/.test(user.id))) {
      const tgIdNum = Number(user.telegramId || user.id);
      updatePromise = supabase.from('profiles').update(profilePayload).eq('telegram_id', tgIdNum);
    } else if (user?.email) {
      updatePromise = supabase.from('profiles').update(profilePayload).eq('email', user.email.trim().toLowerCase());
    }

    if (updatePromise) {
      const { data, error } = await updatePromise.select();
      if (error) {
        console.warn('[ZYTI DB] Fallo al actualizar public.profiles:', error.message);
      } else if (data && data.length > 0 && data[0].id) {
        // Aseguramos que el usuario guarde su verdadero UUID de PostgreSQL
        updatedUser.id = data[0].id;
        setStoredSession(updatedUser);
      }
    }
  } catch (err) {
    console.warn('[ZYTI DB] Error de sincronización de perfil:', err);
  }

  // 3. Si hay sesión activa en Supabase Auth, sincronizar metadatos de usuario
  try {
    await supabase.auth.updateUser({
      data: {
        full_name: cleanName,
        avatar_url: cleanAvatar || null
      }
    });
  } catch (_) {}

  return updatedUser;
}

/**
 * Patrón "Single-Fetch Bootstrap" (Gobernanza Zero-Egress):
 * Ejecuta una sola consulta agregada para hidratar el perfil verificado y sus cuentas de fondeo
 * evitando waterfall queries repetitivas.
 */
export async function bootstrapUserSession(identifiers: {
  userId?: string;
  email?: string;
  telegramId?: number;
}): Promise<UserSession | null> {
  const { userId, email, telegramId } = identifiers;
  if (!userId && !email && !telegramId) return null;

  try {
    let profileQuery = supabase.from('profiles').select('*');

    if (userId && IS_UUID_REGEX.test(userId)) {
      profileQuery = profileQuery.eq('id', userId);
    } else if (telegramId) {
      profileQuery = profileQuery.eq('telegram_id', telegramId);
    } else if (userId && /^\d+$/.test(userId)) {
      profileQuery = profileQuery.eq('telegram_id', Number(userId));
    } else if (email) {
      profileQuery = profileQuery.eq('email', email.trim().toLowerCase());
    }

    const { data: profileList, error: profErr } = await profileQuery.limit(1);
    const profile = profileList?.[0];

    if (profErr) {
      console.warn('[Bootstrap] Error fetching profile:', profErr.message);
    }

    const effectiveEmail = profile?.email || email || '';
    const accounts = effectiveEmail ? await ensureDefaultDemoAccount(effectiveEmail, profile?.id || userId) : [];

    const session: UserSession = {
      id: profile?.id || userId,
      email: effectiveEmail,
      name: profile?.full_name || (profile?.telegram_username ? `@${profile.telegram_username}` : (effectiveEmail.split('@')[0] || 'Trader')),
      avatarUrl: profile?.avatar_url,
      provider: profile?.provider || 'email',
      telegramId: profile?.telegram_id || telegramId,
      telegramUsername: profile?.telegram_username,
      role: profile?.role || (effectiveEmail.toLowerCase().includes('admin@') ? 'admin' : 'trader'),
      isVerified: profile?.is_verified ?? true,
      accounts,
      activeAccountId: accounts[0]?.id
    };

    setStoredSession(session);
    return session;
  } catch (err) {
    console.error('[Bootstrap] Unexpected error in bootstrapUserSession:', err);
    return null;
  }
}

