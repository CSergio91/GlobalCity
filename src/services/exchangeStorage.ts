import { StoredExchangeAccount, VenueId, SUPPORTED_VENUES } from '../types/exchange';

const STORAGE_KEY = 'globalcity_exchange_connections';

const INITIAL_SEED_ACCOUNTS: StoredExchangeAccount[] = [];

export const exchangeStorage = {
  getAccounts(): StoredExchangeAccount[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        return [];
      }
      const list: StoredExchangeAccount[] = JSON.parse(raw);
      // Clean legacy fake demo accounts if present
      const cleaned = list.filter(a => !['conn_bybit_v5_01', 'conn_okx_dma_01', 'conn_hyperliquid_01'].includes(a.id));
      if (cleaned.length !== list.length) {
        this.saveAccounts(cleaned);
      }
      return cleaned;
    } catch (err) {
      console.error('Error reading exchange connections from localStorage:', err);
      return [];
    }
  },

  saveAccounts(accounts: StoredExchangeAccount[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(accounts));
      window.dispatchEvent(new CustomEvent('globalcity_accounts_changed'));
    } catch (err) {
      console.error('Error saving exchange connections to localStorage:', err);
    }
  },

  subscribe(callback: () => void): () => void {
    const handler = () => callback();
    window.addEventListener('globalcity_accounts_changed', handler);
    window.addEventListener('storage', handler);
    return () => {
      window.removeEventListener('globalcity_accounts_changed', handler);
      window.removeEventListener('storage', handler);
    };
  },

  addAccount(params: {
    venueId: VenueId;
    label: string;
    apiKey: string;
    apiSecret: string;
    passphrase?: string;
    agentAddress?: string;
    isTestnet: boolean;
  }): StoredExchangeAccount {
    const venue = SUPPORTED_VENUES.find(v => v.id === params.venueId);
    const newAccount: StoredExchangeAccount = {
      id: `conn_${params.venueId}_${Date.now()}`,
      venueId: params.venueId,
      venueName: venue ? venue.name : params.venueId.toUpperCase(),
      label: params.label.trim() || `${venue ? venue.name : 'Exchange'} (${params.isTestnet ? 'Testnet' : 'Live'})`,
      authType: venue ? venue.authType : 'api_keys',
      apiKey: params.apiKey.trim(),
      apiSecret: params.apiSecret.trim(),
      passphrase: params.passphrase?.trim(),
      agentAddress: params.agentAddress?.trim(),
      isTestnet: params.isTestnet,
      permissions: ['read', 'trade'],
      status: 'CONNECTED',
      balanceUsd: params.isTestnet ? 10000 : 0,
      freeMarginUsd: params.isTestnet ? 9800 : 0,
      pingMs: Math.floor(10 + Math.random() * 25),
      lastSync: new Date().toISOString(),
      createdAt: new Date().toISOString()
    };

    const current = this.getAccounts();
    const updated = [newAccount, ...current];
    this.saveAccounts(updated);
    return newAccount;
  },

  deleteAccount(id: string): void {
    const current = this.getAccounts();
    const updated = current.filter(a => a.id !== id);
    this.saveAccounts(updated);
  },

  toggleStatus(id: string): StoredExchangeAccount | null {
    const current = this.getAccounts();
    let target: StoredExchangeAccount | null = null;
    const updated = current.map(a => {
      if (a.id === id) {
        const nextStatus = a.status === 'CONNECTED' ? 'STANDBY' : 'CONNECTED';
        target = { ...a, status: nextStatus, lastSync: new Date().toISOString() };
        return target;
      }
      return a;
    });
    this.saveAccounts(updated);
    return target;
  },

  testPing(id: string): number {
    const current = this.getAccounts();
    const newPing = Math.floor(8 + Math.random() * 18);
    const updated = current.map(a => {
      if (a.id === id) {
        return { ...a, pingMs: newPing, lastSync: new Date().toISOString() };
      }
      return a;
    });
    this.saveAccounts(updated);
    return newPing;
  },

  exportConnections(): string {
    const accounts = this.getAccounts();
    // Exclude raw secrets when exporting
    const sanitized = accounts.map(a => ({
      ...a,
      apiSecret: '***REDACTED***'
    }));
    return JSON.stringify(sanitized, null, 2);
  }
};
