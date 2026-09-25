export interface TelegramUserPayload {
  id: number | string;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  auth_date: number;
  hash?: string;
}

export interface UserProfile {
  id: string;
  username: string;
  firstName: string;
  lastName?: string;
  photoUrl?: string;
  authProvider: 'telegram' | 'demo' | 'email';
  telegramId?: number | string;
  role: 'institutional_trader' | 'quant_developer' | 'guest';
  createdAt: string;
  twoFactorEnabled: boolean;
}
