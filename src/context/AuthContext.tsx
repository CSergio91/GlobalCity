import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, TelegramUserPayload } from '../types/auth';
import { authService } from '../services/authService';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  loginWithEmail: (email: string, password: string) => Promise<boolean>;
  signUpWithEmail: (
    email: string,
    password: string,
    metadata?: { 
      firstName?: string; 
      lastName?: string; 
      fullName?: string;
      phone?: string;
      company?: string;
      address_line1?: string;
      address_line2?: string;
      country?: string;
      postal_code?: string;
      city?: string;
      state?: string;
      avatar_url?: string;
      billing_metadata?: Record<string, any>;
    }
  ) => Promise<boolean>;
  loginWithGoogle: () => Promise<boolean>;
  loginWithTelegram: (payload: TelegramUserPayload) => void;
  loginWithCustomTelegram: (username: string, telegramId?: string) => void;
  syncWithTelegram: () => Promise<UserProfile | null>;
  loginAsDemo: () => void;
  logout: () => void;
}

const STORAGE_KEY = 'globalcity_auth_user';

function mapSupabaseUserToProfile(sbUser: any): UserProfile {
  const metadata = sbUser.user_metadata || {};
  const email = sbUser.email || '';
  const fullName = metadata.full_name || metadata.name || email.split('@')[0] || 'Trader';
  const nameParts = fullName.split(' ');
  const firstName = nameParts[0] || 'Trader';
  const lastName = nameParts.slice(1).join(' ') || undefined;
  const isGoogle = sbUser.app_metadata?.provider === 'google' || metadata.iss?.includes('google');

  return {
    id: sbUser.id,
    username: `@${email.split('@')[0] || 'trader'}`,
    firstName,
    lastName,
    email,
    photoUrl: metadata.avatar_url || metadata.picture,
    authProvider: isGoogle ? 'google' : 'email',
    role: 'institutional_trader',
    createdAt: sbUser.created_at || new Date().toISOString(),
    twoFactorEnabled: true,
  };
}

// ============================================================================
// ZERO-EGRESS CACHE & IN-FLIGHT DEDUPLICATION ENGINE (PERFORMANCE SKILL STANDARD)
// ============================================================================
const accountVerificationCache = new Map<string, { hasAccount: boolean; expiresAt: number }>();
const inFlightVerifications = new Map<string, Promise<boolean>>();
const ACCOUNT_CACHE_TTL_MS = 60000; // 60 segundos de caché caliente en memoria

export const invalidateAccountCache = (email?: string) => {
  if (!email) return;
  accountVerificationCache.delete(email.trim().toLowerCase());
};

export const setAccountCacheValid = (email?: string) => {
  if (!email) return;
  accountVerificationCache.set(email.trim().toLowerCase(), {
    hasAccount: true,
    expiresAt: Date.now() + ACCOUNT_CACHE_TTL_MS
  });
};

// ============================================================================
// VERIFICADOR INSTITUCIONAL DE ACCESO: SOLO CLIENTES CON CUENTA COMPRADA
// ============================================================================
export const checkUserHasPurchasedAccount = async (email?: string, userId?: string): Promise<boolean> => {
  if (!email) return false;
  const cleanEmail = email.trim().toLowerCase();

  // 1. Zero-Egress Check: Devolver desde memoria en 0ms si está en caché vigente
  const cached = accountVerificationCache.get(cleanEmail);
  if (cached && Date.now() < cached.expiresAt) {
    return cached.hasAccount;
  }

  // 2. In-Flight Deduplication: Si ya hay una consulta en curso para este email, reutilizarla
  if (inFlightVerifications.has(cleanEmail)) {
    return inFlightVerifications.get(cleanEmail)!;
  }

  const queryPromise = (async (): Promise<boolean> => {
    try {
      // A. Consulta en public.trading_accounts (Single Lean Query)
      let query = supabase.from('trading_accounts').select('id');
      if (userId) {
        query = query.or(`trader_email.eq.${cleanEmail},user_id.eq.${userId}`);
      } else {
        query = query.eq('trader_email', cleanEmail);
      }
      const { data: accounts, error: accErr } = await query.limit(1);
      if (!accErr && accounts && accounts.length > 0) {
        accountVerificationCache.set(cleanEmail, { hasAccount: true, expiresAt: Date.now() + ACCOUNT_CACHE_TTL_MS });
        return true;
      }

      // B. Solo si no tiene cuentas, comprobar órdenes de compra
      const { data: orders, error: ordErr } = await supabase
        .from('orders')
        .select('id')
        .eq('trader_email', cleanEmail)
        .limit(1);
      if (!ordErr && orders && orders.length > 0) {
        accountVerificationCache.set(cleanEmail, { hasAccount: true, expiresAt: Date.now() + ACCOUNT_CACHE_TTL_MS });
        return true;
      }
    } catch (err) {
      console.warn('[AuthContext] Error comprobando cuentas:', err);
    }

    // C. Comprobar en compras locales de redundancia
    try {
      const local = JSON.parse(localStorage.getItem('eklipse_assigned_accounts') || '[]');
      if (Array.isArray(local) && local.some((a: any) => (a.email || '').toLowerCase() === cleanEmail)) {
        accountVerificationCache.set(cleanEmail, { hasAccount: true, expiresAt: Date.now() + ACCOUNT_CACHE_TTL_MS });
        return true;
      }
    } catch (_) {}

    accountVerificationCache.set(cleanEmail, { hasAccount: false, expiresAt: Date.now() + 15000 });
    return false;
  })();

  inFlightVerifications.set(cleanEmail, queryPromise);

  try {
    return await queryPromise;
  } finally {
    inFlightVerifications.delete(cleanEmail);
  }
};

export const handleRejectUnauthorizedUser = async (sbUser: any, onSetUser?: (u: null) => void) => {
  const meta = sbUser?.user_metadata || {};
  const email = sbUser?.email || '';
  const fullName = meta.full_name || meta.name || '';
  const photo = meta.avatar_url || meta.picture || '';

  if (typeof window !== 'undefined') {
    sessionStorage.setItem('eklipse_unauthorized_attempt_email', email);
    sessionStorage.setItem('eklipse_unauthorized_attempt_name', fullName);
    if (photo) {
      sessionStorage.setItem('eklipse_pending_google_photo', photo);
    }
    localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(new CustomEvent('eklipse_unauthorized_login_blocked', {
      detail: { email, fullName, photo }
    }));
  }

  try {
    await supabase.auth.signOut();
  } catch (_) {}
  if (onSetUser) onSetUser(null);
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  // 1. Escuchar y sincronizar sesiones activas de Supabase Auth (GoTrue)
  useEffect(() => {
    if (!isSupabaseConfigured) return;

    // Detectar sesión activa tras recarga o tras redirect de Google OAuth
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const hasAccount = await checkUserHasPurchasedAccount(session.user.email, session.user.id);
        if (!hasAccount) {
          console.warn('[AuthContext] Sesión rechazada: el usuario no tiene ninguna cuenta comprada.');
          await handleRejectUnauthorizedUser(session.user, setUser);
          return;
        }

        const mapped = mapSupabaseUserToProfile(session.user);
        setUser(mapped);
      }
    }).catch((err) => {
      console.warn('[AuthContext] Error recuperando sesión de Supabase:', err);
    });

    // Suscripción reactiva a cambios de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user && (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED')) {
        const hasAccount = await checkUserHasPurchasedAccount(session.user.email, session.user.id);
        if (!hasAccount) {
          console.warn('[AuthContext] Evento auth bloqueado: usuario no tiene cuenta de fondeo.');
          await handleRejectUnauthorizedUser(session.user, setUser);
          return;
        }

        const mapped = mapSupabaseUserToProfile(session.user);
        setUser(mapped);
      } else if (event === 'SIGNED_OUT') {
        setUser((prev) => (prev?.authProvider === 'telegram' || prev?.authProvider === 'demo') ? prev : null);
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  useEffect(() => {
    try {
      if (user) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch (err) {
      console.error('Error persisting auth state to localStorage', err);
    }
  }, [user]);

  const loginWithTelegram = (payload: TelegramUserPayload) => {
    const newUser: UserProfile = {
      id: `tg_${payload.id}`,
      username: payload.username ? `@${payload.username.replace('@', '')}` : `@tg_${payload.id}`,
      firstName: payload.first_name,
      lastName: payload.last_name,
      photoUrl: payload.photo_url,
      authProvider: 'telegram',
      telegramId: payload.id,
      role: 'institutional_trader',
      createdAt: new Date().toISOString(),
      twoFactorEnabled: true,
    };
    setUser(newUser);
  };

  const loginWithCustomTelegram = (username: string, telegramId?: string) => {
    const cleanHandle = username.trim().startsWith('@') ? username.trim() : `@${username.trim()}`;
    const cleanId = telegramId?.trim() || Math.floor(100000000 + Math.random() * 900000000).toString();
    const newUser: UserProfile = {
      id: `tg_${cleanId}`,
      username: cleanHandle,
      firstName: cleanHandle.replace('@', ''),
      authProvider: 'telegram',
      telegramId: cleanId,
      role: 'institutional_trader',
      createdAt: new Date().toISOString(),
      twoFactorEnabled: true,
    };
    setUser(newUser);
  };

  const loginWithEmail = async (email: string, password: string): Promise<boolean> => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPass = (password || '').trim();

    if (!cleanEmail) {
      throw new Error('Por favor ingresa tu correo electrónico.');
    }
    if (!cleanPass) {
      throw new Error('Por favor ingresa tu contraseña.');
    }

    if (!isSupabaseConfigured) {
      throw new Error('El servicio de autenticación no está disponible en este momento.');
    }

    const { data: signInData, error: signInErr } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password: cleanPass,
    });

    if (signInErr) {
      console.warn('[AuthContext] Error en signInWithPassword:', signInErr.message);
      if (signInErr.message.toLowerCase().includes('invalid login credentials')) {
        throw new Error('Credenciales inválidas. Revisa tu correo o contraseña.');
      }
      if (signInErr.message.toLowerCase().includes('email not confirmed')) {
        throw new Error('Tu correo aún no ha sido confirmado. Revisa tu bandeja de entrada.');
      }
      throw new Error(signInErr.message || 'Error al iniciar sesión.');
    }

    if (!signInData?.user) {
      throw new Error('No se pudo establecer la sesión con el servidor.');
    }

    const hasAccount = await checkUserHasPurchasedAccount(cleanEmail, signInData.user.id);
    if (!hasAccount) {
      await handleRejectUnauthorizedUser(signInData.user, setUser);
      throw new Error('No se encontró ninguna cuenta de fondeo vinculada a este correo. Por favor adquiere un reto de evaluación institucional.');
    }

    const mapped = mapSupabaseUserToProfile(signInData.user);
    setUser(mapped);
    return true;
  };

  const signUpWithEmail = async (
    email: string,
    password: string,
    metadata?: { 
      firstName?: string; 
      lastName?: string; 
      fullName?: string;
      phone?: string;
      company?: string;
      address_line1?: string;
      address_line2?: string;
      country?: string;
      postal_code?: string;
      city?: string;
      state?: string;
      avatar_url?: string;
      billing_metadata?: Record<string, any>;
    }
  ): Promise<boolean> => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPass = (password || '').trim();

    if (!cleanEmail || !cleanPass) {
      throw new Error('El correo y la contraseña son obligatorios.');
    }

    if (!isSupabaseConfigured) {
      throw new Error('El servicio de autenticación no está disponible en este momento.');
    }

    const fullName = metadata?.fullName || `${metadata?.firstName || ''} ${metadata?.lastName || ''}`.trim() || cleanEmail.split('@')[0];

    const { data: signUpData, error: signUpErr } = await supabase.auth.signUp({
      email: cleanEmail,
      password: cleanPass,
      options: {
        data: {
          full_name: fullName,
          first_name: metadata?.firstName,
          last_name: metadata?.lastName,
          phone: metadata?.phone,
          company: metadata?.company,
          address_line1: metadata?.address_line1,
          address_line2: metadata?.address_line2,
          country: metadata?.country,
          postal_code: metadata?.postal_code,
          city: metadata?.city,
          state: metadata?.state,
          avatar_url: metadata?.avatar_url,
          billing_metadata: metadata?.billing_metadata,
        }
      }
    });

    if (signUpErr) {
      console.warn('[AuthContext] Aviso en signUpWithEmail:', signUpErr.message);
      const isAlreadyRegistered = 
        signUpErr.message.toLowerCase().includes('already') || 
        (signUpErr as any).status === 422 ||
        (signUpErr as any).code === 'user_already_exists';

      if (isAlreadyRegistered) {
        // El usuario ya existe en GoTrue: intentamos autenticarlo con la contraseña provista
        try {
          const { data: signInData, error: signInErr } = await supabase.auth.signInWithPassword({
            email: cleanEmail,
            password: cleanPass,
          });
          if (!signInErr && signInData?.user) {
            const mapped = mapSupabaseUserToProfile(signInData.user);
            setUser(mapped);
          }
        } catch (_) {}
      } else {
        throw new Error(signUpErr.message || 'Error al registrar la cuenta.');
      }
    }

    // Actualizar o insertar el perfil en public.profiles con todos los datos del cliente
    try {
      await supabase.from('profiles').upsert({
        email: cleanEmail,
        full_name: fullName,
        first_name: metadata?.firstName,
        last_name: metadata?.lastName,
        phone: metadata?.phone,
        company: metadata?.company,
        address_line1: metadata?.address_line1,
        address_line2: metadata?.address_line2,
        country: metadata?.country,
        postal_code: metadata?.postal_code,
        city: metadata?.city,
        state: metadata?.state,
        avatar_url: metadata?.avatar_url,
        billing_metadata: metadata?.billing_metadata || {},
        updated_at: new Date().toISOString()
      }, { onConflict: 'email' });

      setAccountCacheValid(cleanEmail);
    } catch (upsertErr) {
      console.warn('[AuthContext] Error sincronizando perfil en public.profiles:', upsertErr);
    }

    if (signUpData?.user) {
      const mapped = mapSupabaseUserToProfile(signUpData.user);
      setUser(mapped);
    }

    return true;
  };

  const loginWithGoogle = async (): Promise<boolean> => {
    if (isSupabaseConfigured) {
      try {
        const redirectOrigin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3100';
        const { data, error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: redirectOrigin,
            skipBrowserRedirect: true
          }
        });

        if (error) {
          console.error('[Google OAuth] Error iniciando OAuth:', error.message);
          throw error;
        }

        if (data?.url && typeof window !== 'undefined') {
          // Popup compacto posicionado en la esquina superior derecha
          const width = 440;
          const height = 580;
          const screenWidth = window.screen.availWidth || window.screen.width || 1280;
          const left = Math.max(20, screenWidth - width - 25);
          const top = 30;

          const popup = window.open(
            data.url,
            'GoogleAuthPopup',
            `width=${width},height=${height},top=${top},left=${left},status=no,resizable=yes,scrollbars=yes`
          );

          if (!popup) {
            // Si el navegador bloquea popups, fallback a redirección directa
            window.location.href = data.url;
            return true;
          }

          return new Promise<boolean>((resolve) => {
            let done = false;
            let bc: BroadcastChannel | null = null;

            const cleanup = () => {
              clearInterval(pollInterval);
              window.removeEventListener('focus', handleFocus);
              window.removeEventListener('message', handleMessage);
              window.removeEventListener('storage', handleStorage);
              subscription?.unsubscribe();
              if (bc) {
                try { bc.close(); } catch (_) {}
              }
            };

            const finishSuccess = async (sbUser?: any) => {
              if (done) return;
              done = true;
              cleanup();

              if (sbUser) {
                const mapped = mapSupabaseUserToProfile(sbUser);
                setUser(mapped);
                resolve(true);
                return;
              }

              try {
                const { data: { session } } = await supabase.auth.getSession();
                if (session?.user) {
                  setUser(mapSupabaseUserToProfile(session.user));
                  resolve(true);
                } else {
                  resolve(true);
                }
              } catch {
                resolve(true);
              }
            };

            const handleTokensFromHash = async (hashStr?: string) => {
              if (!hashStr) return;
              try {
                const clean = hashStr.replace(/^[#?]/, '');
                const params = new URLSearchParams(clean);
                const access_token = params.get('access_token');
                const refresh_token = params.get('refresh_token');
                if (access_token && refresh_token) {
                  const { data: sessionData } = await supabase.auth.setSession({ access_token, refresh_token });
                  if (sessionData?.user) {
                    finishSuccess(sessionData.user);
                    return;
                  }
                }
              } catch (_) {}
            };

            // Canal 1: BroadcastChannel (inmune a aislamiento Cross-Origin-Opener-Policy)
            try {
              bc = new BroadcastChannel('eklipse_auth_channel');
              bc.onmessage = (event) => {
                if (event.data?.type === 'EKLIPSE_AUTH_SUCCESS') {
                  if (event.data?.hash) {
                    handleTokensFromHash(event.data.hash).then(() => {
                      finishSuccess();
                    });
                  } else {
                    finishSuccess();
                  }
                }
              };
            } catch (_) {}

            // Canal 2: LocalStorage Event Listener
            const handleStorage = (event: StorageEvent) => {
              if (event.key === 'eklipse_oauth_payload' && event.newValue) {
                try {
                  const parsed = JSON.parse(event.newValue);
                  if (parsed?.hash) {
                    handleTokensFromHash(parsed.hash).then(() => {
                      finishSuccess();
                    });
                    return;
                  }
                } catch (_) {}
                finishSuccess();
              } else if (event.key === 'eklipse_oauth_completed') {
                finishSuccess();
              }
            };
            window.addEventListener('storage', handleStorage);

            // Canal 3: Message Event Listener (postMessage directo)
            const handleMessage = (event: MessageEvent) => {
              if (event.data?.type === 'EKLIPSE_AUTH_SUCCESS') {
                if (event.data?.hash) {
                  handleTokensFromHash(event.data.hash).then(() => {
                    finishSuccess();
                  });
                } else {
                  finishSuccess();
                }
              }
            };
            window.addEventListener('message', handleMessage);

            // Canal 4: Supabase onAuthStateChange reactivo
            const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
              if (session?.user && (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED')) {
                finishSuccess(session.user);
              }
            });

            // Escuchar cuando el usuario enfoca la ventana principal
            const handleFocus = async () => {
              try {
                const { data: { session } } = await supabase.auth.getSession();
                if (session?.user) {
                  finishSuccess(session.user);
                }
              } catch (_) {}
            };
            window.addEventListener('focus', handleFocus);

            // Centinela periódico de sesión
            // NUNCA consultar popup.closed para evitar que Chromium emita advertencias de COOP en consola
            const pollInterval = setInterval(async () => {
              if (done) {
                clearInterval(pollInterval);
                return;
              }

              try {
                const { data: { session } } = await supabase.auth.getSession();
                if (session?.user) {
                  finishSuccess(session.user);
                }
              } catch (_) {}
            }, 800);
          });
        }
      } catch (err) {
        console.error('[Google OAuth] Error ejecutando signInWithOAuth:', err);
        throw err;
      }
    }

    return false;
  };

  const loginAsDemo = () => {
    const demoUser: UserProfile = {
      id: '123456',
      username: '@trader_pro_demo',
      firstName: 'Trader Pro',
      lastName: '',
      email: 'demo@eklipsefunded.com',
      authProvider: 'demo',
      telegramId: '123456',
      role: 'institutional_trader',
      createdAt: new Date().toISOString(),
      twoFactorEnabled: true,
    };
    setUser(demoUser);
  };

  const syncWithTelegram = async (): Promise<UserProfile | null> => {
    try {
      const detected = await authService.getLatestTelegramAuthUser();
      if (detected) {
        const newUser: UserProfile = {
          id: `tg_${detected.id}`,
          username: detected.username ? `@${detected.username.replace('@', '')}` : `@tg_${detected.id}`,
          firstName: detected.first_name || 'Trader',
          lastName: detected.last_name,
          photoUrl: detected.photo_url,
          authProvider: 'telegram',
          telegramId: detected.id,
          role: 'institutional_trader',
          createdAt: new Date().toISOString(),
          twoFactorEnabled: true,
        };
        setUser(newUser);
        authService.saveSession(newUser);
        return newUser;
      }
      return null;
    } catch {
      return null;
    }
  };

  const logout = async () => {
    if (isSupabaseConfigured) {
      try {
        await supabase.auth.signOut();
      } catch (_) {}
    }
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        loginWithEmail,
        signUpWithEmail,
        loginWithGoogle,
        loginWithTelegram,
        loginWithCustomTelegram,
        syncWithTelegram,
        loginAsDemo,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
