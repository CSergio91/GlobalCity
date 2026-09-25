import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, TelegramUserPayload } from '../types/auth';
import { authService } from '../services/authService';

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  loginWithTelegram: (payload: TelegramUserPayload) => void;
  loginWithCustomTelegram: (username: string, telegramId?: string) => void;
  syncWithTelegram: () => Promise<UserProfile | null>;
  loginAsDemo: () => void;
  logout: () => void;
}

const STORAGE_KEY = 'globalcity_auth_user';

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

  // Si no hay usuario en localStorage al iniciar, intentar detectar si el usuario ya inició sesión con el bot
  useEffect(() => {
    if (!user) {
      authService.getLatestTelegramAuthUser().then((detected) => {
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
        }
      }).catch(() => {});
    }
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

  const loginAsDemo = () => {
    const demoUser: UserProfile = {
      id: 'demo_quant_01',
      username: '@quant_institution_demo',
      firstName: 'Institutional',
      lastName: 'Trader',
      authProvider: 'demo',
      telegramId: '884920194',
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

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
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
