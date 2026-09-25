import { StoredExchangeAccount, VenueId, SUPPORTED_VENUES } from '../types/exchange';

const STORAGE_KEY = 'globalcity_exchange_connections';

const INITIAL_SEED_ACCOUNTS: StoredExchangeAccount[] = [
  {
    id: 'conn_bybit_v5_01',
    venueId: 'bybit',
    venueName: 'Bybit Unified V5',
    label: 'Cuenta Institucional Alpha',
    authType: 'api_keys',
    apiKey: 'byb_live_79a2****************',
    apiSecret: '********************************',
    isTestnet: false,
    permissions: ['read', 'trade'],
    status: 'CONNECTED',
    balanceUsd: 48250.00,
    freeMarginUsd: 42100.00,
    pingMs: 14,
    lastSync: new Date().toISOString(),
    createdAt: '2026-09-20T10:00:00.000Z'
  },
  {
    id: 'conn_okx_dma_01',
    venueId: 'okx',
    venueName: 'OKX DMA Unified',
    label: 'Subcuenta Cuantitativa DMA',
    authType: 'api_keys',
    apiKey: 'okx_dma_91c4****************',
    apiSecret: '********************************',
    passphrase: '****************',
    isTestnet: false,
    permissions: ['read', 'trade'],
    status: 'CONNECTED',
    balanceUsd: 36400.00,
    freeMarginUsd: 33200.00,
    pingMs: 18,
    lastSync: new Date().toISOString(),
    createdAt: '2026-09-21T14:30:00.000Z'
  },
  {
    id: 'conn_hyperliquid_01',
    venueId: 'hyperliquid',
    venueName: 'Hyperliquid L1 (DEX)',
    label: 'Agent Wallet Arbitrage Sub-20ms',
    authType: 'web3_agent',
    apiKey: '0x8B7a2F93C674E9D51b8D7F91Ac4d8f0A9e2Bc781',
    apiSecret: '0x****************************************************************',
    agentAddress: '0x8B7a2F93C674E9D51b8D7F91Ac4d8f0A9e2Bc781',
    isTestnet: false,
    permissions: ['read', 'trade'],
    status: 'CONNECTED',
    balanceUsd: 25100.00,
    freeMarginUsd: 22800.00,
    pingMs: 9,
    lastSync: new Date().toISOString(),
    createdAt: '2026-09-22T08:15:00.000Z'
  }
];

export const exchangeStorage = {
  getAccounts(): StoredExchangeAccount[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_SEED_ACCOUNTS));
        return INITIAL_SEED_ACCOUNTS;
      }
      return JSON.parse(raw);
    } catch (err) {
      console.error('Error reading exchange connections from localStorage:', err);
      return INITIAL_SEED_ACCOUNTS;
    }
  },

  saveAccounts(accounts: StoredExchangeAccount[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(accounts));
    } catch (err) {
      console.error('Error saving exchange connections to localStorage:', err);
    }
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
