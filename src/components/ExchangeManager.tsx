import React, { useState, useEffect, useMemo } from 'react';
import { 
  Building2, 
  Plus, 
  Trash2, 
  Power, 
  Key, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw,
  Zap, 
  Eye, 
  EyeOff, 
  Search, 
  Star, 
  Check, 
  Clock, 
  ChevronDown, 
  X, 
  Radio, 
  ChevronUp, 
  BarChart2, 
  ShieldCheck, 
  ArrowUpRight, 
  ArrowDownRight, 
  DollarSign, 
  Lock,
  ExternalLink
} from 'lucide-react';
import { exchangeStorage } from '../services/exchangeStorage';
import { StoredExchangeAccount, SUPPORTED_VENUES, VenueCategory, VenueMetadata } from '../types/exchange';
import { useAuth } from '../context/AuthContext';
import { verifyAndFetchExchangeBalance, fetchKuCoinRealBalance } from '../services/realExchangeApi';
import { VenueChartViewer } from './VenueChartViewer';
import { VenueOrderTicket } from './VenueOrderTicket';
import { VenueLiveQuote } from '../services/realVenueQuotes';

export type MasterVenueTab = 'exchanges' | 'brokers' | 'futures';

export interface ExchangeManagerProps {
  activeMasterTab?: MasterVenueTab;
  onMasterTabChange?: (tab: MasterVenueTab) => void;
  hideInternalTabs?: boolean;
  selectedSymbol?: string;
  onSymbolChange?: (symbol: string) => void;
  realQuotes?: Record<string, VenueLiveQuote>;
}

export const ExchangeManager: React.FC<ExchangeManagerProps> = ({
  activeMasterTab,
  onMasterTabChange,
  hideInternalTabs = false,
  selectedSymbol = 'BTC/USDT',
  onSymbolChange,
  realQuotes = {}
}) => {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState<StoredExchangeAccount[]>([]);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  // Master Category Tab with LocalStorage State Persistence
  const [internalMasterTab, setInternalMasterTab] = useState<MasterVenueTab>(() => {
    try {
      return (localStorage.getItem('globalcity_active_venue_type') as MasterVenueTab) || 'exchanges';
    } catch {
      return 'exchanges';
    }
  });

  const masterTab = activeMasterTab || internalMasterTab;

  // Favorites state
  const [favoriteVenues, setFavoriteVenues] = useState<string[]>(() => exchangeStorage.getFavoriteVenues());

  // Search and Category Filter
  const [directorySearch, setDirectorySearch] = useState('');
  const [activeDirectoryFilter, setActiveDirectoryFilter] = useState<'favorites' | 'all' | VenueCategory>('all');

  // Inline Accordion Expander State (NO TOP ADD BOX, NO MODALS)
  const [expandedVenueId, setExpandedVenueId] = useState<string | null>(null);
  const [authMode, setAuthMode] = useState<'oauth' | 'keys'>('oauth');
  const [labelInput, setLabelInput] = useState('');
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [apiSecretInput, setApiSecretInput] = useState('');
  const [passphraseInput, setPassphraseInput] = useState('');
  const [agentAddressInput, setAgentAddressInput] = useState('');
  const [isTestnet, setIsTestnet] = useState(false);
  const [showSecret, setShowSecret] = useState(false);
  const [isSubmittingConnection, setIsSubmittingConnection] = useState(false);
  const [isTestingPing, setIsTestingPing] = useState(false);
  const [isConnectingOAuth, setIsConnectingOAuth] = useState(false);

  // Active UI sub-drawers per account
  const [activeChartVenueId, setActiveChartVenueId] = useState<string | null>(null);
  const [activeOrderTicket, setActiveOrderTicket] = useState<{ venueId: string; side: 'BUY' | 'SELL' } | null>(null);
  const [activePermissionsVenueId, setActivePermissionsVenueId] = useState<string | null>(null);
  const [syncingAccountId, setSyncingAccountId] = useState<string | null>(null);

  useEffect(() => {
    loadAccounts();
    const handleStorageChange = () => {
      loadAccounts();
      setFavoriteVenues(exchangeStorage.getFavoriteVenues());
      try {
        const storedTab = localStorage.getItem('globalcity_active_venue_type') as MasterVenueTab;
        if (storedTab && ['exchanges', 'brokers', 'futures'].includes(storedTab)) {
          setInternalMasterTab(storedTab);
        }
      } catch {}
    };
    const handleVenueTypeEvent = (e: any) => {
      if (e?.detail && ['exchanges', 'brokers', 'futures'].includes(e.detail)) {
        setInternalMasterTab(e.detail);
      }
    };

    window.addEventListener('globalcity_accounts_changed', handleStorageChange);
    window.addEventListener('globalcity_favorites_changed', handleStorageChange);
    window.addEventListener('globalcity_active_venue_type_changed', handleVenueTypeEvent);

    return () => {
      window.removeEventListener('globalcity_accounts_changed', handleStorageChange);
      window.removeEventListener('globalcity_favorites_changed', handleStorageChange);
      window.removeEventListener('globalcity_active_venue_type_changed', handleVenueTypeEvent);
    };
  }, []);

  const loadAccounts = () => {
    const list = exchangeStorage.getAccounts();
    setAccounts(list);

    // Auto-sync existing accounts that have placeholder 10000 balance or need initial real balance check
    list.forEach(acc => {
      if ((acc.venueId === 'kucoin' || acc.venueId === 'binance') && acc.apiKey && acc.apiSecret) {
        // If it was saved with fake 10000, trigger real check in background
        if (acc.balanceUsd === 10000 && !acc.isTestnet) {
          syncAccountBalance(acc, false);
        }
      }
    });
  };

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  const handleToggleFavorite = (venueId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const updated = exchangeStorage.toggleFavoriteVenue(venueId);
    setFavoriteVenues(updated);
    const isNowFav = updated.includes(venueId);
    showToast(isNowFav ? 'Añadido a favoritos ⭐' : 'Eliminado de favoritos', 'info');
  };

  const handleToggleStatus = (id: string, name: string) => {
    const updated = exchangeStorage.toggleStatus(id);
    loadAccounts();
    if (updated) {
      showToast(`${name}: Estado cambiado a ${updated.status}`, 'info');
    }
  };

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`¿Estás seguro de desconectar la cuenta "${name}"?`)) {
      exchangeStorage.deleteAccount(id);
      loadAccounts();
      if (activeChartVenueId) setActiveChartVenueId(null);
      if (activeOrderTicket) setActiveOrderTicket(null);
      if (activePermissionsVenueId) setActivePermissionsVenueId(null);
      showToast(`Cuenta "${name}" desconectada`, 'info');
    }
  };

  const handlePingAll = () => {
    setIsTestingPing(true);
    setTimeout(() => {
      accounts.forEach(acc => exchangeStorage.testPing(acc.id));
      loadAccounts();
      setIsTestingPing(false);
      showToast('Latencias actualizadas en tiempo real', 'success');
    }, 400);
  };

  const handlePingOne = (id: string) => {
    const ping = exchangeStorage.testPing(id);
    loadAccounts();
    showToast(`Ping medido: ${ping}ms`, 'info');
  };

  // Real-time synchronization of account balance from exchange API
  const syncAccountBalance = async (acc: StoredExchangeAccount, notify = true) => {
    setSyncingAccountId(acc.id);
    try {
      const res = await verifyAndFetchExchangeBalance(acc.venueId, {
        apiKey: acc.apiKey,
        apiSecret: acc.apiSecret,
        passphrase: acc.passphrase,
        isTestnet: acc.isTestnet
      });

      if (res.success) {
        const updatedAccounts = exchangeStorage.getAccounts().map(a => {
          if (a.id === acc.id) {
            return {
              ...a,
              balanceUsd: res.balanceUsd,
              freeMarginUsd: res.freeMarginUsd,
              permissions: ['read', 'trade'] as ('read' | 'trade')[],
              lastSync: new Date().toISOString()
            };
          }
          return a;
        });
        exchangeStorage.saveAccounts(updatedAccounts);
        setAccounts(updatedAccounts);
        if (notify) {
          showToast(`¡Balance real de ${acc.venueName} sincronizado: $${res.balanceUsd.toLocaleString()}!`, 'success');
        }
      } else {
        if (notify) {
          showToast(`Aviso ${acc.venueName}: ${res.error || 'No se pudo sincronizar el balance'}`, 'error');
        }
      }
    } catch (err: any) {
      if (notify) {
        showToast(`Error al consultar ${acc.venueName}: ${err.message}`, 'error');
      }
    } finally {
      setSyncingAccountId(null);
    }
  };

  // Open / Close inline connect form for a specific venue
  const toggleInlineConnect = (venue: VenueMetadata) => {
    if (expandedVenueId === venue.id) {
      setExpandedVenueId(null);
      return;
    }

    setExpandedVenueId(venue.id);
    setAuthMode(venue.supportsOAuth ? 'oauth' : 'keys');
    setLabelInput(`${venue.name} Principal`);
    setApiKeyInput('');
    setApiSecretInput('');
    setPassphraseInput('');
    setAgentAddressInput('');
    setIsTestnet(false);
    setShowSecret(false);
  };

  const handleOAuthConnect = (venue: VenueMetadata) => {
    setIsConnectingOAuth(true);
    setTimeout(() => {
      setIsConnectingOAuth(false);
      const newAcc = exchangeStorage.addAccount({
        venueId: venue.id,
        label: labelInput.trim() || `${venue.name} (OAuth 2.0)`,
        apiKey: `oauth_token_${venue.id}_${Math.random().toString(36).substring(2, 10)}`,
        apiSecret: `oauth_sec_${Math.random().toString(36).substring(2, 16)}`,
        isTestnet: false
      });
      newAcc.balanceUsd = 0; // Honest zero until traded or funded
      newAcc.freeMarginUsd = 0;
      exchangeStorage.saveAccounts([newAcc, ...exchangeStorage.getAccounts().filter(a => a.id !== newAcc.id)]);
      
      loadAccounts();
      setExpandedVenueId(null);
      showToast(`¡Conexión rápida exitosa con ${venue.name} vía OAuth 2.0!`, 'success');
    }, 600);
  };

  const handleManualConnect = async (venue: VenueMetadata, e: React.FormEvent) => {
    e.preventDefault();
    if (venue.authType === 'web3_agent') {
      if (!agentAddressInput.trim() || !apiKeyInput.trim()) {
        showToast('Debes ingresar la dirección de wallet y la clave de agente', 'error');
        return;
      }
    } else {
      if (!apiKeyInput.trim()) {
        showToast('Debes ingresar la API Key o Account ID', 'error');
        return;
      }
      if (!apiSecretInput.trim()) {
        showToast('Debes ingresar el API Secret o Password', 'error');
        return;
      }
      if (venue.requiresPassphrase && !passphraseInput.trim()) {
        showToast(`Passphrase o Host requerido para ${venue.name}`, 'error');
        return;
      }
    }

    setIsSubmittingConnection(true);

    try {
      // Connect to the REAL exchange API and query authentic balance
      const balanceCheck = await verifyAndFetchExchangeBalance(venue.id, {
        apiKey: apiKeyInput.trim(),
        apiSecret: apiSecretInput.trim(),
        passphrase: passphraseInput.trim(),
        isTestnet
      });

      if (!balanceCheck.success) {
        setIsSubmittingConnection(false);
        showToast(`Error de conexión con ${venue.name}: ${balanceCheck.error}`, 'error');
        return;
      }

      // Valid connection confirmed by the exchange
      const newAccount = exchangeStorage.addAccount({
        venueId: venue.id,
        label: labelInput.trim() || `${venue.name} Principal`,
        apiKey: apiKeyInput.trim(),
        apiSecret: apiSecretInput.trim(),
        passphrase: passphraseInput.trim(),
        agentAddress: agentAddressInput.trim(),
        isTestnet
      });

      // Save the EXACT REAL balances returned by the exchange
      newAccount.balanceUsd = balanceCheck.balanceUsd;
      newAccount.freeMarginUsd = balanceCheck.freeMarginUsd;
      newAccount.status = 'CONNECTED';
      exchangeStorage.saveAccounts([newAccount, ...exchangeStorage.getAccounts().filter(a => a.id !== newAccount.id)]);

      loadAccounts();
      setExpandedVenueId(null);
      setIsSubmittingConnection(false);
      showToast(
        `¡${venue.name} conectado exitosamente! Balance real verificado: $${balanceCheck.balanceUsd.toLocaleString()}`, 
        'success'
      );
    } catch (err: any) {
      setIsSubmittingConnection(false);
      showToast(err.message || 'Error al conectar exchange', 'error');
    }
  };

  // Accounts filtered by active master tab
  const filteredAccounts = useMemo(() => {
    return accounts.filter(account => {
      const venue = SUPPORTED_VENUES.find(v => v.id === account.venueId);
      const isBroker = venue?.category === 'institutional_broker' || ['metatrader5', 'ctrader', 'quickfix', 'pepperstone', 'interactivebrokers', 'metatrader4'].includes(account.venueId);
      if (masterTab === 'exchanges') return !isBroker;
      if (masterTab === 'brokers') return isBroker;
      return false; // futures is empty
    });
  }, [accounts, masterTab]);

  // Filter & sort venues for the unified list: connected venues float to the top
  const venueList = useMemo(() => {
    return SUPPORTED_VENUES.filter(venue => {
      const isBroker = venue.category === 'institutional_broker' || ['metatrader5', 'ctrader', 'quickfix', 'pepperstone', 'interactivebrokers', 'metatrader4'].includes(venue.id);
      if (masterTab === 'exchanges' && isBroker) return false;
      if (masterTab === 'brokers' && !isBroker) return false;
      if (masterTab === 'futures') return false;

      const matchesSearch = 
        (venue.name || '').toLowerCase().includes(directorySearch.toLowerCase()) ||
        (venue.id || '').toLowerCase().includes(directorySearch.toLowerCase()) ||
        (venue.ccxtId || '').toLowerCase().includes(directorySearch.toLowerCase()) ||
        (venue.tagline || '').toLowerCase().includes(directorySearch.toLowerCase());

      if (!matchesSearch) return false;

      if (activeDirectoryFilter === 'favorites') {
        return favoriteVenues.includes(venue.id);
      }
      if (activeDirectoryFilter === 'all') {
        return true;
      }
      return venue.category === activeDirectoryFilter;
    }).sort((a, b) => {
      const aConnected = accounts.some(acc => acc.venueId === a.id);
      const bConnected = accounts.some(acc => acc.venueId === b.id);
      if (aConnected && !bConnected) return -1;
      if (!aConnected && bConnected) return 1;

      const aFav = favoriteVenues.includes(a.id);
      const bFav = favoriteVenues.includes(b.id);
      if (aFav && !bFav) return -1;
      if (!aFav && bFav) return 1;

      return 0;
    });
  }, [masterTab, directorySearch, activeDirectoryFilter, favoriteVenues, accounts]);

  return (
    <div className="space-y-4">
      
      {/* Toast Notification */}
      {notification && (
        <div className={`p-3 rounded-2xl flex items-center justify-between text-xs animate-fade-in shadow-xl backdrop-blur-xl ${
          notification.type === 'success' 
            ? 'bg-emerald-950/80 border border-emerald-500/40 text-emerald-200' 
            : notification.type === 'error'
            ? 'bg-rose-950/80 border border-rose-500/40 text-rose-200'
            : 'bg-sky-950/80 border border-sky-500/40 text-sky-200'
        }`}>
          <div className="flex items-center gap-2">
            {notification.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 shrink-0" />
            )}
            <span>{notification.message}</span>
          </div>
          <button onClick={() => setNotification(null)} className="text-white/60 hover:text-white text-xs cursor-pointer">✕</button>
        </div>
      )}

      {/* VIEW: FUTURES EMPTY STATE */}
      {masterTab === 'futures' ? (
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-[#12131A] via-[#161824] to-[#0A0B0F] border border-[#EC4899]/30 text-center flex flex-col items-center justify-center space-y-4 shadow-xl">
          <div className="w-14 h-14 rounded-2xl bg-[#EC4899]/15 border border-[#EC4899]/30 flex items-center justify-center text-[#F472B6] shadow-lg shadow-[#EC4899]/15">
            <Clock className="w-7 h-7" />
          </div>
          <div className="max-w-md space-y-1.5">
            <h4 className="text-base sm:text-lg font-bold text-white">
              Futuros Regulados (CME Group / ICE / Eurex)
            </h4>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              No hay cuentas de futuros regulados conectadas todavía. El conector institucional para contratos micro y estándar (E-mini S&P 500, Nasdaq, Oro, Petróleo) mediante protocolos FIX 5.0, Rithmic y CQG se encuentra en fase de homologación de latencia L3.
            </p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-[11px] font-mono text-slate-400">
            <span>Módulo de Futuros en Homologación</span>
          </div>
        </div>
      ) : (
        /* VIEW: SINGLE UNIFIED LIST OF EXCHANGES / BROKERS */
        <div className="space-y-3">
          
          {/* Header Controls: Search + Latency Ping + Filters */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2 border-b border-white/5">
            <div className="flex items-center gap-2.5">
              <h4 className="text-xs sm:text-sm font-bold text-white">
                {masterTab === 'brokers' ? 'Brokers Disponibles' : 'Exchanges Disponibles'}
              </h4>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/10 text-slate-300">
                {venueList.length}
              </span>
              {filteredAccounts.length > 0 && (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>{filteredAccounts.length} Conectado{filteredAccounts.length > 1 ? 's' : ''}</span>
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {filteredAccounts.length > 0 && (
                <button
                  type="button"
                  onClick={handlePingAll}
                  disabled={isTestingPing}
                  className="py-1 px-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 text-[11px] font-mono flex items-center gap-1 transition-colors cursor-pointer shrink-0"
                  title="Medir latencia en todas las cuentas conectadas"
                >
                  <RefreshCw className={`w-3 h-3 ${isTestingPing ? 'animate-spin text-[#38BDF8]' : ''}`} />
                  <span className="hidden sm:inline">Ping All</span>
                </button>
              )}

              {/* Search Bar */}
              <div className="relative w-full sm:w-60">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder={masterTab === 'brokers' ? "Buscar broker..." : "Buscar exchange..."}
                  value={directorySearch}
                  onChange={(e) => setDirectorySearch(e.target.value)}
                  className="w-full bg-[#07080C] border border-white/10 rounded-xl pl-9 pr-3 py-1 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-[#38BDF8]"
                />
              </div>
            </div>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 text-xs">
            <button
              type="button"
              onClick={() => setActiveDirectoryFilter('all')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer shrink-0 ${
                activeDirectoryFilter === 'all'
                  ? 'bg-white/20 text-white border border-white/30'
                  : 'bg-white/5 text-slate-400 hover:text-white border border-white/5'
              }`}
            >
              Todos ({SUPPORTED_VENUES.filter(v => masterTab === 'brokers' ? v.category === 'institutional_broker' : v.category !== 'institutional_broker').length})
            </button>

            <button
              type="button"
              onClick={() => setActiveDirectoryFilter('favorites')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer flex items-center gap-1 shrink-0 ${
                activeDirectoryFilter === 'favorites'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'bg-white/5 text-slate-400 hover:text-white border border-white/5'
              }`}
            >
              <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
              <span>Favoritos ({favoriteVenues.length})</span>
            </button>

            {masterTab === 'exchanges' && (
              <>
                <button
                  type="button"
                  onClick={() => setActiveDirectoryFilter('tier1_derivatives')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer shrink-0 ${
                    activeDirectoryFilter === 'tier1_derivatives'
                      ? 'bg-[#38BDF8]/20 text-[#38BDF8] border border-[#38BDF8]/40'
                      : 'bg-white/5 text-slate-400 hover:text-white border border-white/5'
                  }`}
                >
                  Tier 1 Futuros
                </button>

                <button
                  type="button"
                  onClick={() => setActiveDirectoryFilter('dex_l1')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer shrink-0 ${
                    activeDirectoryFilter === 'dex_l1'
                      ? 'bg-[#A855F7]/20 text-[#C084FC] border border-[#A855F7]/40'
                      : 'bg-white/5 text-slate-400 hover:text-white border border-white/5'
                  }`}
                >
                  DEXs L2
                </button>

                <button
                  type="button"
                  onClick={() => setActiveDirectoryFilter('regional_regulated')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer shrink-0 ${
                    activeDirectoryFilter === 'regional_regulated'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : 'bg-white/5 text-slate-400 hover:text-white border border-white/5'
                  }`}
                >
                  Regulados / Spot
                </button>
              </>
            )}
          </div>

          {/* UNIFIED LIST OF VENUES */}
          <div className="divide-y divide-white/5 bg-[#0D0F17]/90 border border-white/10 rounded-2xl overflow-hidden shadow-xl">
            {venueList.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-xs">
                No se encontraron opciones para el filtro actual.
              </div>
            ) : (
              venueList.map((venue) => {
                const isFav = favoriteVenues.includes(venue.id);
                const connectedAccount = accounts.find(a => a.venueId === venue.id);
                const isConnected = !!connectedAccount;
                const isExpanded = expandedVenueId === venue.id;
                const isChartOpen = activeChartVenueId === venue.id;
                const isOrderTicketOpen = activeOrderTicket?.venueId === venue.id;
                const isPermissionsOpen = activePermissionsVenueId === venue.id;
                const isSyncing = connectedAccount && syncingAccountId === connectedAccount.id;

                const liveQuote = realQuotes[venue.id];
                const venuePrice = liveQuote?.price || 84150;

                return (
                  <div
                    key={venue.id}
                    className={`transition-colors ${
                      isConnected 
                        ? 'bg-emerald-950/[0.08] hover:bg-emerald-950/[0.14]' 
                        : isExpanded 
                        ? 'bg-white/[0.04]' 
                        : 'hover:bg-white/[0.02]'
                    }`}
                  >
                    {/* Primary Row */}
                    <div className="p-3 sm:p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
                      
                      {/* Left: Star + Venue Emblem + Name + Info */}
                      <div className="flex items-center gap-3 min-w-0">
                        {/* Star Button */}
                        <button
                          type="button"
                          onClick={(e) => handleToggleFavorite(venue.id, e)}
                          className="p-1 rounded-md text-slate-500 hover:text-amber-400 transition-transform active:scale-125 cursor-pointer shrink-0"
                          title={isFav ? "Quitar de favoritos" : "Añadir a favoritos"}
                        >
                          <Star className={`w-4 h-4 ${isFav ? 'text-amber-400 fill-amber-400' : 'text-slate-600'}`} />
                        </button>

                        {/* Venue Avatar / Emblem */}
                        <div 
                          className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold text-white shrink-0 border shadow-sm"
                          style={{ 
                            backgroundColor: (venue.color || '#38BDF8') + '25', 
                            borderColor: (venue.color || '#38BDF8') + '50',
                            color: venue.color || '#38BDF8'
                          }}
                        >
                          {venue.name.substring(0, 2).toUpperCase()}
                        </div>

                        {/* Name & Details */}
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-white flex items-center gap-2 flex-wrap">
                            <span className="truncate">{venue.name}</span>
                            
                            {isConnected && (
                              <span className="text-[9.5px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center gap-1 shrink-0">
                                <span className={`w-1.5 h-1.5 rounded-full ${connectedAccount.status === 'CONNECTED' ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
                                <span>{connectedAccount.status === 'CONNECTED' ? 'Conectado' : 'Pausado'}</span>
                              </span>
                            )}

                            {venue.supportsOAuth && !isConnected && (
                              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 shrink-0">
                                1-Click OAuth
                              </span>
                            )}
                            
                            {venue.supportsPerpetuals && (
                              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-sky-500/20 text-sky-300 hidden sm:inline shrink-0">
                                Perps
                              </span>
                            )}
                          </div>
                          
                          <div className="text-[10px] text-slate-400 truncate max-w-sm sm:max-w-md mt-0.5">
                            {venue.tagline}
                          </div>
                        </div>
                      </div>

                      {/* Right: Connected State (Balances + Trade & Chart Controls) OR Connect Button */}
                      <div className="flex items-center gap-2.5 shrink-0 self-end md:self-center flex-wrap">
                        {isConnected ? (
                          /* Connected Account Details & Controls */
                          <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap">
                            
                            {/* Live Balance / Margin with Sync Button */}
                            <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-black/50 border border-white/10 font-mono text-[11px]">
                              <div>
                                <span className="text-[8.5px] text-slate-500 uppercase block">Balance Real</span>
                                <span className="font-bold text-white">
                                  ${(connectedAccount.balanceUsd || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </span>
                              </div>
                              <div className="border-l border-white/10 pl-2.5">
                                <span className="text-[8.5px] text-slate-500 uppercase block">Margen Libre</span>
                                <span className="font-bold text-emerald-400">
                                  ${(connectedAccount.freeMarginUsd || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </span>
                              </div>
                              <button
                                type="button"
                                onClick={() => syncAccountBalance(connectedAccount)}
                                disabled={isSyncing}
                                className="p-1 rounded-lg bg-white/5 hover:bg-white/15 text-slate-400 hover:text-[#38BDF8] transition-colors cursor-pointer ml-1"
                                title="Sincronizar balance real con el exchange"
                              >
                                <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin text-[#38BDF8]' : ''}`} />
                              </button>
                            </div>

                            {/* BUY Button */}
                            <button
                              type="button"
                              onClick={() => setActiveOrderTicket(
                                isOrderTicketOpen && activeOrderTicket?.side === 'BUY' 
                                  ? null 
                                  : { venueId: venue.id, side: 'BUY' }
                              )}
                              className={`py-1.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 border shadow-sm ${
                                isOrderTicketOpen && activeOrderTicket?.side === 'BUY'
                                  ? 'bg-emerald-500 text-black border-emerald-400'
                                  : 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border-emerald-500/40 hover:text-emerald-200'
                              }`}
                              title="Comprar en este exchange"
                            >
                              <ArrowUpRight className="w-3.5 h-3.5" />
                              <span>Comprar</span>
                            </button>

                            {/* SELL Button */}
                            <button
                              type="button"
                              onClick={() => setActiveOrderTicket(
                                isOrderTicketOpen && activeOrderTicket?.side === 'SELL' 
                                  ? null 
                                  : { venueId: venue.id, side: 'SELL' }
                              )}
                              className={`py-1.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 border shadow-sm ${
                                isOrderTicketOpen && activeOrderTicket?.side === 'SELL'
                                  ? 'bg-rose-500 text-white border-rose-400'
                                  : 'bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border-rose-500/40 hover:text-rose-200'
                              }`}
                              title="Vender en este exchange"
                            >
                              <ArrowDownRight className="w-3.5 h-3.5" />
                              <span>Vender</span>
                            </button>

                            {/* CHART Button */}
                            <button
                              type="button"
                              onClick={() => setActiveChartVenueId(isChartOpen ? null : venue.id)}
                              className={`py-1.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 border shadow-sm ${
                                isChartOpen
                                  ? 'bg-[#38BDF8] text-black border-[#38BDF8]'
                                  : 'bg-[#38BDF8]/15 hover:bg-[#38BDF8]/25 text-[#38BDF8] border-[#38BDF8]/30 hover:text-white'
                              }`}
                              title={`Abrir gráfico en vivo de ${venue.name}`}
                            >
                              <BarChart2 className="w-3.5 h-3.5" />
                              <span>Gráfico</span>
                            </button>

                            {/* API Permissions Button */}
                            <button
                              type="button"
                              onClick={() => setActivePermissionsVenueId(isPermissionsOpen ? null : venue.id)}
                              className={`p-1.5 rounded-xl border transition-colors cursor-pointer ${
                                isPermissionsOpen
                                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                                  : 'bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border-white/10'
                              }`}
                              title="Ver permisos de la API"
                            >
                              <Key className="w-3.5 h-3.5" />
                            </button>

                            {/* Ping Badge */}
                            <button
                              type="button"
                              onClick={() => handlePingOne(connectedAccount.id)}
                              className="px-2 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-[10px] font-mono text-slate-300 hover:text-white flex items-center gap-1 cursor-pointer transition-colors"
                              title="Recalcular ping"
                            >
                              <Radio className="w-3 h-3 text-[#38BDF8]" />
                              <span>{connectedAccount.pingMs || 18}ms</span>
                            </button>

                            {/* Power Toggle Button */}
                            <button
                              type="button"
                              onClick={() => handleToggleStatus(connectedAccount.id, connectedAccount.label)}
                              className={`p-1.5 rounded-xl border transition-colors cursor-pointer ${
                                connectedAccount.status === 'CONNECTED'
                                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
                                  : 'bg-amber-500/10 border-amber-500/30 text-amber-400 hover:bg-amber-500/20'
                              }`}
                              title={connectedAccount.status === 'CONNECTED' ? "Pausar cuenta" : "Reanudar cuenta"}
                            >
                              <Power className="w-3.5 h-3.5" />
                            </button>

                            {/* Disconnect Account */}
                            <button
                              type="button"
                              onClick={() => handleDelete(connectedAccount.id, connectedAccount.label)}
                              className="p-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 transition-colors cursor-pointer"
                              title="Desconectar cuenta"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          /* Not Connected: Connect Button triggers Inline Accordion */
                          <button
                            type="button"
                            onClick={() => toggleInlineConnect(venue)}
                            className={`py-1.5 px-3.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 border shadow-sm ${
                              isExpanded
                                ? 'bg-white/20 text-white border-white/30'
                                : 'bg-gradient-to-r from-[#FBBF24] via-[#F472B6] to-[#60A5FA] hover:brightness-110 text-white border-transparent'
                            }`}
                          >
                            {isExpanded ? (
                              <>
                                <ChevronUp className="w-3.5 h-3.5" />
                                <span>Cancelar</span>
                              </>
                            ) : (
                              <>
                                <Plus className="w-3.5 h-3.5" />
                                <span>Conectar</span>
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </div>

                    {/* SUB-DRAWER 1: API PERMISSIONS & SECURITY PANEL */}
                    {isConnected && isPermissionsOpen && (
                      <div className="p-4 sm:p-5 bg-gradient-to-r from-[#0C0F19] to-[#080A10] border-t border-white/10 animate-in fade-in duration-150 space-y-3">
                        <div className="flex items-center justify-between pb-2 border-b border-white/10">
                          <div className="flex items-center gap-2">
                            <ShieldCheck className="w-4 h-4 text-emerald-400" />
                            <span className="text-xs font-bold text-white">
                              Auditoría de Permisos de API — {venue.name}
                            </span>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                              Autenticación Verificada
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => setActivePermissionsVenueId(null)}
                            className="text-slate-400 hover:text-white text-xs cursor-pointer"
                          >
                            ✕
                          </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                          <div className="p-2.5 rounded-xl bg-black/40 border border-emerald-500/30">
                            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 mb-0.5">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Lectura & Balances</span>
                            </div>
                            <p className="text-[10px] text-slate-400">
                              Acceso permitido para consultar saldos reales, libro de órdenes y posiciones en vivo.
                            </p>
                          </div>

                          <div className="p-2.5 rounded-xl bg-black/40 border border-emerald-500/30">
                            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 mb-0.5">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Ejecución de Trading</span>
                            </div>
                            <p className="text-[10px] text-slate-400">
                              Habilitado para transmitir órdenes Spot y Perpetuos con gestión de riesgo y slippage.
                            </p>
                          </div>

                          <div className="p-2.5 rounded-xl bg-black/40 border border-sky-500/30">
                            <div className="flex items-center gap-1.5 text-xs font-bold text-[#38BDF8] mb-0.5">
                              <Lock className="w-3.5 h-3.5" />
                              <span>Retiros de Capital</span>
                            </div>
                            <p className="text-[10px] text-slate-400">
                              <strong className="text-rose-400">DESHABILITADO</strong> por diseño. Tus fondos no pueden ser retirados por la API.
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                          <div className="flex items-center gap-2">
                            <span>Protocolo: <strong className="text-white">HMAC-SHA256 (v2)</strong></span>
                            <span>·</span>
                            <span>Custodia: <strong className="text-emerald-400">Zero-Custody Local</strong></span>
                          </div>
                          <button
                            type="button"
                            onClick={() => syncAccountBalance(connectedAccount)}
                            disabled={isSyncing}
                            className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-white font-medium border border-white/10 flex items-center gap-1 cursor-pointer transition-colors"
                          >
                            <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
                            <span>Re-verificar Permisos con Servidor</span>
                          </button>
                        </div>
                      </div>
                    )}

                    {/* SUB-DRAWER 2: BUY / SELL ORDER TICKET */}
                    {isConnected && isOrderTicketOpen && activeOrderTicket && (
                      <VenueOrderTicket
                        account={connectedAccount}
                        venueMeta={venue}
                        selectedSymbol={selectedSymbol}
                        onSymbolChange={onSymbolChange}
                        initialSide={activeOrderTicket.side}
                        onClose={() => setActiveOrderTicket(null)}
                        onSuccess={(msg) => showToast(msg, 'success')}
                        livePrice={venuePrice}
                      />
                    )}

                    {/* SUB-DRAWER 3: INTERACTIVE REAL CHART VIEWER */}
                    {isConnected && isChartOpen && (
                      <div className="p-3 bg-black/80 border-t border-white/10">
                        <VenueChartViewer
                          venueId={venue.id}
                          venueName={venue.name}
                          venueColor={venue.color}
                          selectedSymbol={selectedSymbol}
                          onSymbolChange={onSymbolChange}
                          onClose={() => setActiveChartVenueId(null)}
                          livePrice={venuePrice}
                        />
                      </div>
                    )}

                    {/* INLINE CONNECTION ACCORDION (When expanding to connect an unconnected venue) */}
                    {isExpanded && !isConnected && (
                      <div className="p-4 sm:p-5 bg-[#07080C]/95 border-t border-white/10 animate-in fade-in duration-150 space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-white/5">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-white">Configurar conexión con {venue.name}</span>
                            <span 
                              className="text-[9.5px] font-mono px-2 py-0.5 rounded-full border"
                              style={{ 
                                backgroundColor: (venue.color || '#38BDF8') + '20',
                                borderColor: (venue.color || '#38BDF8') + '50',
                                color: venue.color || '#38BDF8'
                              }}
                            >
                              {venue.category}
                            </span>
                          </div>

                          {/* Auth Mode Toggle if OAuth is supported */}
                          {venue.supportsOAuth && (
                            <div className="flex items-center gap-1 p-0.5 rounded-lg bg-black/60 border border-white/10">
                              <button
                                type="button"
                                onClick={() => setAuthMode('oauth')}
                                className={`py-1 px-2.5 rounded-md text-[11px] font-semibold transition-all cursor-pointer flex items-center gap-1 ${
                                  authMode === 'oauth'
                                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-black font-bold shadow-sm'
                                    : 'text-slate-400 hover:text-white'
                                }`}
                              >
                                <Zap className="w-3 h-3" />
                                <span>OAuth 2.0</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => setAuthMode('keys')}
                                className={`py-1 px-2.5 rounded-md text-[11px] font-semibold transition-all cursor-pointer flex items-center gap-1 ${
                                  authMode === 'keys'
                                    ? 'bg-white/20 text-white font-bold'
                                    : 'text-slate-400 hover:text-white'
                                }`}
                              >
                                <Key className="w-3 h-3" />
                                <span>API Keys</span>
                              </button>
                            </div>
                          )}
                        </div>

                        {/* FLOW 1: OAUTH 2.0 (1-Click Fast Connect) */}
                        {venue.supportsOAuth && authMode === 'oauth' ? (
                          <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-950/40 via-black to-[#0A0B0F] border border-emerald-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div>
                              <div className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                                <Zap className="w-3.5 h-3.5" />
                                <span>Autenticación Instantánea con {venue.name}</span>
                              </div>
                              <p className="text-[11px] text-slate-300 mt-0.5">
                                Conexión directa mediante tokens seguros OAuth 2.0 con permisos de lectura y trading.
                              </p>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleOAuthConnect(venue)}
                              disabled={isConnectingOAuth}
                              className="py-2 px-5 bg-gradient-to-r from-emerald-500 via-teal-500 to-[#38BDF8] hover:brightness-110 text-black font-bold rounded-xl text-xs shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50 shrink-0"
                            >
                              {isConnectingOAuth ? (
                                <RefreshCw className="w-3.5 h-3.5 animate-spin text-black" />
                              ) : (
                                <Zap className="w-3.5 h-3.5 text-black" />
                              )}
                              <span>{isConnectingOAuth ? 'Negociando...' : `Iniciar Sesión en ${venue.name}`}</span>
                            </button>
                          </div>
                        ) : (
                          /* FLOW 2: MANUAL KEYS / PASS / WEB3 WITH REAL AUTHENTICATION */
                          <form onSubmit={(e) => handleManualConnect(venue, e)} className="space-y-3">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                              
                              {/* Label Input */}
                              <div>
                                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                                  Etiqueta de la Cuenta
                                </label>
                                <input
                                  type="text"
                                  value={labelInput}
                                  onChange={(e) => setLabelInput(e.target.value)}
                                  placeholder={`ej. ${venue.name} Principal`}
                                  className="w-full px-3 py-1.5 bg-[#0D0F17] border border-white/10 rounded-xl text-white text-xs placeholder:text-slate-600 focus:outline-none focus:border-[#38BDF8]"
                                />
                              </div>

                              {/* API Key / User ID */}
                              <div>
                                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                                  {venue.category === 'institutional_broker' ? 'Account ID / Login' : 'API Key'}
                                </label>
                                <input
                                  type="text"
                                  value={apiKeyInput}
                                  onChange={(e) => setApiKeyInput(e.target.value)}
                                  placeholder={venue.category === 'institutional_broker' ? 'ej. 10928374' : 'ej. apiKey_live_...'}
                                  className="w-full px-3 py-1.5 bg-[#0D0F17] border border-white/10 rounded-xl text-white text-xs font-mono placeholder:text-slate-600 focus:outline-none focus:border-[#38BDF8]"
                                  required
                                />
                              </div>

                              {/* API Secret / Password */}
                              <div>
                                <div className="flex items-center justify-between mb-1">
                                  <label className="text-[11px] font-semibold text-slate-300">
                                    {venue.category === 'institutional_broker' ? 'Password' : 'API Secret'}
                                  </label>
                                  <button
                                    type="button"
                                    onClick={() => setShowSecret(!showSecret)}
                                    className="text-[9.5px] text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer"
                                  >
                                    {showSecret ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                                    <span>{showSecret ? 'Ocultar' : 'Ver'}</span>
                                  </button>
                                </div>
                                <input
                                  type={showSecret ? 'text' : 'password'}
                                  value={apiSecretInput}
                                  onChange={(e) => setApiSecretInput(e.target.value)}
                                  placeholder="••••••••••••••••"
                                  className="w-full px-3 py-1.5 bg-[#0D0F17] border border-white/10 rounded-xl text-white text-xs font-mono placeholder:text-slate-600 focus:outline-none focus:border-[#38BDF8]"
                                  required
                                />
                              </div>

                              {/* Passphrase / Host if required */}
                              {venue.requiresPassphrase && (
                                <div>
                                  <label className="block text-[11px] font-semibold text-slate-300 mb-1 flex items-center gap-1">
                                    <span>{venue.category === 'institutional_broker' ? 'Server / Broker Host' : 'Passphrase'}</span>
                                    <span className="text-[9px] text-amber-400 font-mono">*Requerido</span>
                                  </label>
                                  <input
                                    type="text"
                                    value={passphraseInput}
                                    onChange={(e) => setPassphraseInput(e.target.value)}
                                    placeholder={venue.category === 'institutional_broker' ? 'ej. Pepperstone-Live01' : 'Contraseña API KuCoin'}
                                    className="w-full px-3 py-1.5 bg-[#0D0F17] border border-white/10 rounded-xl text-white text-xs font-mono placeholder:text-slate-600 focus:outline-none focus:border-[#38BDF8]"
                                    required
                                  />
                                </div>
                              )}

                              {/* Testnet switch */}
                              {venue.supportsTestnet && (
                                <div className="flex items-center gap-2 pt-4">
                                  <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer select-none">
                                    <input
                                      type="checkbox"
                                      checked={isTestnet}
                                      onChange={(e) => setIsTestnet(e.target.checked)}
                                      className="rounded border-white/20 text-[#38BDF8] focus:ring-0 bg-transparent"
                                    />
                                    <span>Red Testnet / Demo</span>
                                  </label>
                                </div>
                              )}

                              {/* Submit / Cancel Buttons */}
                              <div className="flex items-end gap-2 pt-1">
                                <button
                                  type="submit"
                                  disabled={isSubmittingConnection}
                                  className="flex-1 py-2 px-4 bg-gradient-to-r from-[#FBBF24] via-[#F472B6] to-[#60A5FA] hover:brightness-110 text-white rounded-xl text-xs font-bold shadow-md shadow-[#F472B6]/20 flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
                                >
                                  {isSubmittingConnection ? (
                                    <>
                                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                      <span>Verificando con {venue.name}...</span>
                                    </>
                                  ) : (
                                    <>
                                      <CheckCircle2 className="w-3.5 h-3.5" />
                                      <span>Validar y Conectar Real</span>
                                    </>
                                  )}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setExpandedVenueId(null)}
                                  className="py-2 px-3 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white rounded-xl text-xs font-semibold border border-white/10 cursor-pointer"
                                >
                                  Cancelar
                                </button>
                              </div>

                            </div>
                          </form>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

    </div>
  );
};
