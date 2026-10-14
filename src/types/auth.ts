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
  email?: string;
  photoUrl?: string;
  phone?: string;
  company?: string;
  country?: string;
  city?: string;
  state?: string;
  addressLine1?: string;
  authProvider: 'telegram' | 'email' | 'google';
  telegramId?: number | string;
  role: 'admin' | 'soporte' | 'marketing' | 'trader' | string;
  createdAt: string;
  twoFactorEnabled: boolean;
}
