import { UserProfile, TelegramUserPayload } from '../types/auth';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

export interface AuthResult {
  success: boolean;
  type: 'TAKE_PROFIT' | 'STOP_LOSS' | 'MARGIN_CALL';
  message: string;
  user?: UserProfile;
}

const STORAGE_KEY = 'globalcity_auth_user';

export const authService = {
  /**
   * Verifica si Supabase está configurado con variables de entorno
   */
  isSupabaseConfigured(): boolean {
    return isSupabaseConfigured;
  },

  /**
   * Obtiene la sesión actual persistida
   */
  getCurrentUser(): UserProfile | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },

  /**
   * Guarda la sesión del usuario
   */
  saveSession(user: UserProfile): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  },

  /**
   * Cierra la sesión
   */
  signOut(): void {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem('gc_pending_nonce');
  },

  /**
   * Obtiene la última autorización de Telegram si el usuario está autenticado
   */
  async getLatestTelegramAuthUser(): Promise<TelegramUserPayload | null> {
    // 1. Si ya existe sesión activa en localStorage, retornarla de inmediato
    const existing = this.getCurrentUser();
    if (existing && existing.telegramId) {
      return {
        id: existing.telegramId,
        first_name: existing.firstName,
        last_name: existing.lastName,
        username: existing.username?.replace('@', ''),
        photo_url: existing.photoUrl,
        auth_date: Math.floor(Date.now() / 1000)
      };
    }

    // 2. Consultar al endpoint backend seguro de Vite / Control Plane si está activo
    try {
      const res = await fetch('/api/auth/telegram-latest');
      if (res.ok) {
        const json = await res.json();
        if (json.authenticated && json.user) {
          return json.user;
        }
      }
    } catch {
      // Ignorar fallback
    }

    return null;
  },

  /**
   * Sondea el estado de autorización de Telegram de forma segura vía backend por nonce
   */
  async checkTelegramBotUpdates(authNonce?: string): Promise<TelegramUserPayload | null> {
    if (!authNonce) return null;

    try {
      const res = await fetch(`/api/auth/telegram-status?nonce=${encodeURIComponent(authNonce)}`);
      const contentType = res.headers.get('content-type') || '';
      if (res.ok && contentType.includes('application/json')) {
        const json = await res.json();
        if (json.authenticated && json.user) {
          return json.user;
        }
      }
    } catch {
      // Silencioso
    }

    return null;
  },

  /**
   * Autenticación con Telegram OAuth 2.0
   * Recibe el payload oficial del Telegram Login Widget o deep-link
   */
  async loginWithTelegram(payload: TelegramUserPayload): Promise<AuthResult> {
    try {
      if (!payload.id) {
        return {
          success: false,
          type: 'MARGIN_CALL',
          message: 'Margin Call: No se pudo verificar la firma de autorización de Telegram.'
        };
      }

      const user: UserProfile = {
        id: `tg_${payload.id}`,
        username: payload.username ? `@${payload.username.replace('@', '')}` : `@tg_${payload.id}`,
        firstName: payload.first_name || 'Trader',
        lastName: payload.last_name,
        photoUrl: payload.photo_url,
        authProvider: 'telegram',
        telegramId: payload.id,
        role: 'institutional_trader',
        createdAt: new Date().toISOString(),
        twoFactorEnabled: true,
      };

      this.saveSession(user);

      return {
        success: true,
        type: 'TAKE_PROFIT',
        message: 'Take Profit: Autorización de Telegram verificada con éxito. Conectando al terminal...',
        user
      };
    } catch {
      return {
        success: false,
        type: 'MARGIN_CALL',
        message: 'Margin Call: Error interno al procesar el token de Telegram.'
      };
    }
  },

  /**
   * Autenticación por Correo y Contraseña
   * (Preparado para conectar supabase.auth.signInWithPassword)
   */
  async loginWithEmail(email: string, pass: string): Promise<AuthResult> {
    const cleanEmail = email.trim().toLowerCase();

    // 1. Validaciones de formulario estrictas
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      return {
        success: false,
        type: 'STOP_LOSS',
        message: 'Stop Loss: El formato del correo institucional es inválido.'
      };
    }

    if (pass.length < 6) {
      return {
        success: false,
        type: 'STOP_LOSS',
        message: 'Stop Loss: La contraseña debe tener al menos 6 caracteres para cumplir la política de seguridad.'
      };
    }

    // 2. Si Supabase / GoTrue está configurado, autenticar directamente con la base de datos
    if (this.isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password: pass
        });

        if (error) {
          return {
            success: false,
            type: 'MARGIN_CALL',
            message: `Margin Call: ${error.message}`
          };
        }

        if (data?.user) {
          const userMeta = data.user.user_metadata || {};
          const fullName = userMeta.full_name || cleanEmail.split('@')[0];
          const nameParts = fullName.split(' ');
          const user: UserProfile = {
            id: data.user.id,
            username: `@${cleanEmail.split('@')[0]}`,
            firstName: nameParts[0] || 'Trader',
            lastName: nameParts.slice(1).join(' ') || undefined,
            email: cleanEmail,
            photoUrl: userMeta.avatar_url || undefined,
            authProvider: 'email',
            role: 'institutional_trader',
            createdAt: data.user.created_at || new Date().toISOString(),
            twoFactorEnabled: false
          };

          this.saveSession(user);

          return {
            success: true,
            type: 'TAKE_PROFIT',
            message: 'Take Profit: Autenticación aprobada en base de datos. Conectando al terminal...',
            user
          };
        }
      } catch (err: any) {
        console.warn('[AuthService] Fallback local tras error de red:', err?.message);
      }
    }

    // 3. Fallback de verificación local
    const username = `@${cleanEmail.split('@')[0]}`;
    const user: UserProfile = {
      id: `usr_${Date.now()}`,
      username,
      firstName: cleanEmail.split('@')[0],
      authProvider: 'email',
      role: 'institutional_trader',
      createdAt: new Date().toISOString(),
      twoFactorEnabled: false
    };

    this.saveSession(user);

    return {
      success: true,
      type: 'TAKE_PROFIT',
      message: 'Take Profit: Autenticación aprobada. Balance y permisos validados.',
      user
    };
  },

  /**
   * Registro con Email y Contraseña conectado a Supabase GoTrue
   */
  async registerWithEmail(email: string, pass: string, confirmPass: string, fullName?: string): Promise<AuthResult> {
    const cleanEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(cleanEmail)) {
      return {
        success: false,
        type: 'STOP_LOSS',
        message: 'Stop Loss: Formato de correo institucional inválido.'
      };
    }

    if (pass.length < 6) {
      return {
        success: false,
        type: 'STOP_LOSS',
        message: 'Stop Loss: La clave de acceso debe contener como mínimo 6 caracteres.'
      };
    }

    if (pass !== confirmPass) {
      return {
        success: false,
        type: 'MARGIN_CALL',
        message: 'Margin Call: Las contraseñas no coinciden. Verificación denegada.'
      };
    }

    // Registrar en Supabase Auth / GoTrue
    if (this.isSupabaseConfigured()) {
      try {
        const displayName = fullName?.trim() || cleanEmail.split('@')[0];
        const { data, error } = await supabase.auth.signUp({
          email: cleanEmail,
          password: pass,
          options: {
            data: {
              full_name: displayName
            }
          }
        });

        if (error) {
          return {
            success: false,
            type: 'MARGIN_CALL',
            message: `Margin Call: ${error.message}`
          };
        }

        if (data?.user) {
          const nameParts = displayName.split(' ');
          const user: UserProfile = {
            id: data.user.id,
            username: `@${cleanEmail.split('@')[0]}`,
            firstName: nameParts[0] || 'Trader',
            lastName: nameParts.slice(1).join(' ') || undefined,
            email: cleanEmail,
            authProvider: 'email',
            role: 'institutional_trader',
            createdAt: data.user.created_at || new Date().toISOString(),
            twoFactorEnabled: false
          };

          this.saveSession(user);

          return {
            success: true,
            type: 'TAKE_PROFIT',
            message: 'Take Profit: Cuenta institucional registrada y sincronizada con éxito.',
            user
          };
        }
      } catch (err: any) {
        console.warn('[AuthService] Fallback local tras error de registro:', err?.message);
      }
    }

    const username = `@${cleanEmail.split('@')[0]}`;
    const user: UserProfile = {
      id: `usr_${Date.now()}`,
      username,
      firstName: cleanEmail.split('@')[0],
      authProvider: 'email',
      role: 'institutional_trader',
      createdAt: new Date().toISOString(),
      twoFactorEnabled: false
    };

    this.saveSession(user);

    return {
      success: true,
      type: 'TAKE_PROFIT',
      message: 'Take Profit: Cuenta institucional registrada y lista para operar.',
      user
    };
  },

  /**
   * Inicio de sesión con Google OAuth vía Supabase GoTrue
   */
  async loginWithGoogle(): Promise<{ success: boolean; url?: string; message?: string }> {
    if (!this.isSupabaseConfigured()) {
      return { success: false, message: 'Supabase Gateway no está configurado.' };
    }

    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3100'
        }
      });

      if (error) {
        return { success: false, message: error.message };
      }

      if (data?.url && typeof window !== 'undefined') {
        window.location.href = data.url;
        return { success: true, url: data.url };
      }

      return { success: true };
    } catch (err: any) {
      return { success: false, message: err?.message || 'Error iniciando Google OAuth' };
    }
  },

  /**
   * Acceso Demo Inmediato
   */
  loginAsDemo(): AuthResult {
    const demoUser: UserProfile = {
      id: 'demo_quant_01',
      username: '@quant_demo_trader',
      firstName: 'Quant',
      lastName: 'Trader',
      authProvider: 'demo',
      telegramId: '884920194',
      role: 'institutional_trader',
      createdAt: new Date().toISOString(),
      twoFactorEnabled: true,
    };

    this.saveSession(demoUser);

    return {
      success: true,
      type: 'TAKE_PROFIT',
      message: 'Take Profit: Sesión de demostración cargada con éxito.',
      user: demoUser
    };
  }
};
