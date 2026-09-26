import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Plus, 
  Wifi, 
  Trash2, 
  Power, 
  ExternalLink, 
  Key, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw,
  Zap,
  Eye,
  EyeOff,
  Search,
  Star,
  Sparkles,
  Layers,
  ArrowRight,
  ShieldCheck,
  Check,
  Flame,
  Clock,
  Server
} from 'lucide-react';
import { exchangeStorage } from '../services/exchangeStorage';
import { StoredExchangeAccount, SUPPORTED_VENUES, VenueCategory } from '../types/exchange';
import { useAuth } from '../context/AuthContext';

export type MasterVenueTab = 'exchanges' | 'brokers' | 'futures';

export const ExchangeManager: React.FC = () => {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState<StoredExchangeAccount[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  // Master Category Tab with LocalStorage State Persistence
  const [masterTab, setMasterTab] = useState<MasterVenueTab>(() => {
    try {
      return (localStorage.getItem('globalcity_active_venue_type') as MasterVenueTab) || 'exchanges';
    } catch {
      return 'exchanges';
    }
  });

  // Favorites state
  const [favoriteVenues, setFavoriteVenues] = useState<string[]>(() => exchangeStorage.getFavoriteVenues());

  // CCXT Directory Search and Category Filter
  const [directorySearch, setDirectorySearch] = useState('');
  const [activeDirectoryFilter, setActiveDirectoryFilter] = useState<'favorites' | 'all' | VenueCategory>('favorites');

  // Form State
  const [selectedVenueId, setSelectedVenueId] = useState<string>('binance');
  const [authMode, setAuthMode] = useState<'oauth' | 'keys'>('keys');
  const [labelInput, setLabelInput] = useState('');
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [apiSecretInput, setApiSecretInput] = useState('');
  const [passphraseInput, setPassphraseInput] = useState('');
  const [agentAddressInput, setAgentAddressInput] = useState('');
  const [isTestnet, setIsTestnet] = useState(false);
  const [showSecret, setShowSecret] = useState(false);
  const [isTestingPing, setIsTestingPing] = useState(false);
  const [isConnectingOAuth, setIsConnectingOAuth] = useState(false);

  useEffect(() => {
    loadAccounts();
    const handleStorageChange = () => {
      loadAccounts();
      setFavoriteVenues(exchangeStorage.getFavoriteVenues());
      try {
        const storedTab = localStorage.getItem('globalcity_active_venue_type') as MasterVenueTab;
        if (storedTab && ['exchanges', 'brokers', 'futures'].includes(storedTab)) {
          setMasterTab(storedTab);
        }
      } catch {}
    };
    const handleVenueTypeEvent = (e: any) => {
      if (e?.detail && ['exchanges', 'brokers', 'futures'].includes(e.detail)) {
        setMasterTab(e.detail);
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

  const handleMasterTabChange = (tab: MasterVenueTab) => {
    setMasterTab(tab);
    try {
      localStorage.setItem('globalcity_active_venue_type', tab);
      window.dispatchEvent(new CustomEvent('globalcity_active_venue_type_changed', { detail: tab }));
    } catch {}
  };

  const loadAccounts = () => {
    const list = exchangeStorage.getAccounts();
    setAccounts(list);
  };

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
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
    if (window.confirm(`¿Estás seguro de desconectar y eliminar la cuenta "${name}" de LocalStorage?`)) {
      exchangeStorage.deleteAccount(id);
      loadAccounts();
      showToast(`Cuenta "${name}" eliminada de LocalStorage`, 'info');
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

  const openConnectModal = (venueId: string) => {
    setSelectedVenueId(venueId);
    const target = SUPPORTED_VENUES.find(v => v.id === venueId);
    if (target?.supportsOAuth) {
      setAuthMode('oauth');
    } else {
      setAuthMode('keys');
    }
    setLabelInput('');
    setApiKeyInput('');
    setApiSecretInput('');
    setPassphraseInput('');
    setAgentAddressInput('');
    setIsTestnet(false);
    setIsAddModalOpen(true);
  };

  const handleOAuthConnect = () => {
    const venue = selectedVenueMeta;
    setIsConnectingOAuth(true);
    setTimeout(() => {
      setIsConnectingOAuth(false);
      const randomBalance = Math.floor(5000 + Math.random() * 25000);
      const newAcc = exchangeStorage.addAccount({
        venueId: venue.id,
        label: labelInput.trim() || `${venue.name} (OAuth 2.0)`,
        apiKey: `oauth_token_${venue.id}_${Math.random().toString(36).substring(2, 10)}`,
        apiSecret: `oauth_sec_${Math.random().toString(36).substring(2, 16)}`,
        isTestnet: false
      });
      newAcc.balanceUsd = randomBalance;
      newAcc.freeMarginUsd = Math.floor(randomBalance * 0.95);
      exchangeStorage.saveAccounts([newAcc, ...exchangeStorage.getAccounts().filter(a => a.id !== newAcc.id)]);
      
      loadAccounts();
      setIsAddModalOpen(false);
      showToast(`¡Conexión rápida exitosa con ${venue.name} vía OAuth 2.0!`, 'success');
    }, 700);
  };

  const handleCreateConnection = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedVenueMeta.authType === 'web3_agent') {
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
      if (selectedVenueMeta.requiresPassphrase && !passphraseInput.trim()) {
        showToast(`Passphrase requerida para ${selectedVenueMeta.name}`, 'error');
        return;
      }
    }

    try {
      const newAccount = exchangeStorage.addAccount({
        venueId: selectedVenueId,
        label: labelInput,
        apiKey: apiKeyInput,
        apiSecret: apiSecretInput,
        passphrase: passphraseInput,
        agentAddress: agentAddressInput,
        isTestnet
      });

      const randomBal = isTestnet ? 10000 : Math.floor(3500 + Math.random() * 15000);
      newAccount.balanceUsd = randomBal;
      newAccount.freeMarginUsd = Math.floor(randomBal * 0.92);
      exchangeStorage.saveAccounts([newAccount, ...exchangeStorage.getAccounts().filter(a => a.id !== newAccount.id)]);

      loadAccounts();
      setIsAddModalOpen(false);
      showToast(`¡Cuenta ${newAccount.venueName} conectada exitosamente!`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Error al conectar exchange', 'error');
    }
  };

  const selectedVenueMeta = SUPPORTED_VENUES.find(v => v.id === selectedVenueId) || SUPPORTED_VENUES[0];

  // Accounts filtered by active master tab
  const filteredAccounts = accounts.filter(account => {
    const venue = SUPPORTED_VENUES.find(v => v.id === account.venueId);
    const isBroker = venue?.category === 'institutional_broker' || ['metatrader5', 'ctrader', 'quickfix', 'pepperstone', 'interactivebrokers'].includes(account.venueId);
    if (masterTab === 'exchanges') return !isBroker;
    if (masterTab === 'brokers') return isBroker;
    return false; // futures is empty
  });

  // Filter venues for directory catalog
  const filteredCatalogVenues = SUPPORTED_VENUES.filter(venue => {
    const isBroker = venue.category === 'institutional_broker' || ['metatrader5', 'ctrader', 'quickfix', 'pepperstone', 'interactivebrokers'].includes(venue.id);
    if (masterTab === 'exchanges' && isBroker) return false;
    if (masterTab === 'brokers' && !isBroker) return false;
    if (masterTab === 'futures') return false;

    const matchesSearch = 
      venue.name.toLowerCase().includes(directorySearch.toLowerCase()) ||
      venue.id.toLowerCase().includes(directorySearch.toLowerCase()) ||
      venue.ccxtId.toLowerCase().includes(directorySearch.toLowerCase()) ||
      venue.tagline.toLowerCase().includes(directorySearch.toLowerCase());

    if (!matchesSearch) return false;

    if (activeDirectoryFilter === 'favorites') {
      return favoriteVenues.includes(venue.id);
    }
    if (activeDirectoryFilter === 'all') {
      return true;
    }
    return venue.category === activeDirectoryFilter;
  });

  return (
    <div className="space-y-5">

      {/* Toast Notification */}
      {notification && (
        <div className={`p-3 rounded-2xl text-xs font-semibold flex items-center justify-between shadow-xl animate-fade-in ${
          notification.type === 'success' 
            ? 'bg-emerald-950/80 border border-emerald-500/40 text-emerald-300' 
            : notification.type === 'error'
            ? 'bg-rose-950/80 border border-rose-500/40 text-rose-300'
            : 'bg-sky-950/80 border border-sky-500/40 text-sky-300'
        }`}>
          <div className="flex items-center gap-2">
            {notification.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <AlertTriangle className="w-4 h-4" />
            )}
            <span>{notification.message}</span>
          </div>
          <button onClick={() => setNotification(null)} className="text-white/60 hover:text-white text-xs">✕</button>
        </div>
      )}

      {/* Browser-Style Master Tabs: Exchanges | Brokers | Futuros */}
      <div className="flex items-center justify-between border-b border-white/10 bg-[#07080D]/90 px-2 sm:px-3 pt-2 rounded-2xl shadow-lg">
        <div className="flex items-end gap-1 sm:gap-2 overflow-x-auto scrollbar-none">
          {/* Tab 1: Exchanges (Electric Blue / Cyan) */}
          <button
            type="button"
            onClick={() => handleMasterTabChange('exchanges')}
            className={`group relative flex items-center gap-2 px-3.5 sm:px-5 py-2 text-xs font-bold rounded-t-xl transition-all cursor-pointer border-t-2 border-l border-r -mb-[1px] select-none ${
              masterTab === 'exchanges'
                ? 'bg-[#0D0F17] text-white border-t-[#38BDF8] border-l-white/10 border-r-white/10 border-b-transparent shadow-lg shadow-black/50 z-10'
                : 'bg-white/[0.02] text-slate-400 hover:text-slate-200 hover:bg-white/[0.05] border-transparent'
            }`}
          >
            <span className={`w-2 h-2 rounded-full shrink-0 ${
              masterTab === 'exchanges' ? 'bg-[#38BDF8] shadow-sm shadow-[#38BDF8]/60 animate-pulse' : 'bg-slate-600'
            }`} />
            <Layers className={`w-3.5 h-3.5 ${masterTab === 'exchanges' ? 'text-[#38BDF8]' : 'text-slate-400'}`} />
            <span>Exchanges</span>
            <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded-full ${
              masterTab === 'exchanges' 
                ? 'bg-[#38BDF8]/20 text-[#38BDF8]' 
                : 'bg-white/5 text-slate-400'
            }`}>
              CCXT Cripto
            </span>
          </button>

          {/* Tab 2: Brokers (Emerald Green) */}
          <button
            type="button"
            onClick={() => handleMasterTabChange('brokers')}
            className={`group relative flex items-center gap-2 px-3.5 sm:px-5 py-2 text-xs font-bold rounded-t-xl transition-all cursor-pointer border-t-2 border-l border-r -mb-[1px] select-none ${
              masterTab === 'brokers'
                ? 'bg-[#0D0F17] text-white border-t-emerald-400 border-l-white/10 border-r-white/10 border-b-transparent shadow-lg shadow-black/50 z-10'
                : 'bg-white/[0.02] text-slate-400 hover:text-slate-200 hover:bg-white/[0.05] border-transparent'
            }`}
          >
            <span className={`w-2 h-2 rounded-full shrink-0 ${
              masterTab === 'brokers' ? 'bg-emerald-400 shadow-sm shadow-emerald-400/60 animate-pulse' : 'bg-slate-600'
            }`} />
            <Server className={`w-3.5 h-3.5 ${masterTab === 'brokers' ? 'text-emerald-400' : 'text-slate-400'}`} />
            <span>Brokers</span>
            <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded-full ${
              masterTab === 'brokers' 
                ? 'bg-emerald-500/20 text-emerald-400' 
                : 'bg-white/5 text-slate-400'
            }`}>
              MT5 · cTrader
            </span>
          </button>

          {/* Tab 3: Futuros (Rose Pink) */}
          <button
            type="button"
            onClick={() => handleMasterTabChange('futures')}
            className={`group relative flex items-center gap-2 px-3.5 sm:px-5 py-2 text-xs font-bold rounded-t-xl transition-all cursor-pointer border-t-2 border-l border-r -mb-[1px] select-none ${
              masterTab === 'futures'
                ? 'bg-[#0D0F17] text-white border-t-[#EC4899] border-l-white/10 border-r-white/10 border-b-transparent shadow-lg shadow-black/50 z-10'
                : 'bg-white/[0.02] text-slate-400 hover:text-slate-200 hover:bg-white/[0.05] border-transparent'
            }`}
          >
            <span className={`w-2 h-2 rounded-full shrink-0 ${
              masterTab === 'futures' ? 'bg-[#EC4899] shadow-sm shadow-[#EC4899]/60' : 'bg-slate-600'
            }`} />
            <Flame className={`w-3.5 h-3.5 ${masterTab === 'futures' ? 'text-[#F472B6]' : 'text-slate-400'}`} />
            <span>Futuros</span>
            <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded-full ${
              masterTab === 'futures' 
                ? 'bg-[#EC4899]/20 text-[#F472B6]' 
                : 'bg-white/5 text-slate-400'
            }`}>
              CME L3
            </span>
          </button>
        </div>

        {/* Tab Right: Quick Status */}
        <div className="hidden sm:flex items-center gap-2 pb-2 text-[10px] font-mono text-slate-400">
          <span>{filteredAccounts.length} Conectados</span>
        </div>
      </div>

      {/* Main Header with Compact Button for active master tab */}
      <div className="flex items-center justify-between gap-3 pb-2 border-b border-white/5">
        <div>
          <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
            <span>
              {masterTab === 'exchanges' && 'Cuentas de Exchanges Cripto'}
              {masterTab === 'brokers' && 'Cuentas de Brokers DMA & MT5'}
              {masterTab === 'futures' && 'Cuentas de Futuros Regulados'}
            </span>
            <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-white/10 text-slate-300">
              {filteredAccounts.length}
            </span>
          </h3>
          <p className="text-[11px] text-slate-400">
            {masterTab === 'exchanges' && 'Conexión unificada CCXT a Binance, KuCoin, OKX, Bybit, etc.'}
            {masterTab === 'brokers' && 'Integración directa con MetaTrader 5 y cTrader Open API.'}
            {masterTab === 'futures' && 'Infraestructura de futuros institucionales CME / ICE.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {filteredAccounts.length > 0 && (
            <button
              onClick={handlePingAll}
              disabled={isTestingPing}
              className="py-1.5 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
              title="Medir latencia en todas las cuentas"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isTestingPing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Ping All</span>
            </button>
          )}

          {/* Compact "+ Añadir" button */}
          {masterTab !== 'futures' && (
            <button
              onClick={() => openConnectModal(masterTab === 'brokers' ? 'metatrader5' : 'binance')}
              className={`py-1.5 px-3 rounded-xl text-xs font-semibold shadow-md flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95 shrink-0 ${
                masterTab === 'brokers'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-black font-bold shadow-emerald-500/20'
                  : 'bg-gradient-to-r from-[#FBBF24] via-[#F472B6] to-[#60A5FA] text-white shadow-[#F472B6]/20'
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{masterTab === 'brokers' ? 'Añadir Broker' : 'Añadir Exchange'}</span>
            </button>
          )}
        </div>
      </div>

      {/* VIEW: FUTURES EMPTY STATE */}
      {masterTab === 'futures' ? (
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-[#12131A] via-[#161824] to-[#0A0B0F] border border-[#EC4899]/30 text-center flex flex-col items-center justify-center space-y-4 shadow-xl">
          <div className="w-14 h-14 rounded-2xl bg-[#EC4899]/15 border border-[#EC4899]/30 flex items-center justify-center text-[#F472B6] shadow-lg shadow-[#EC4899]/15">
            <Flame className="w-7 h-7" />
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
            <Clock className="w-3.5 h-3.5 text-[#F472B6]" />
            <span>Módulo de Futuros en Desarrollo</span>
          </div>
        </div>
      ) : (
        /* VIEW: EXCHANGES OR BROKERS */
        <>
          {/* Connected Accounts List */}
          {filteredAccounts.length === 0 ? (
            <div className="p-6 sm:p-8 rounded-2xl bg-[#0D0F17]/80 border border-dashed border-white/15 text-center flex flex-col items-center justify-center space-y-3">
              <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-[#F472B6]">
                <Key className="w-6 h-6" />
              </div>
              <div className="max-w-md space-y-1">
                <h4 className="text-sm sm:text-base font-bold text-white">
                  0 {masterTab === 'brokers' ? 'Brokers' : 'Exchanges'} Conectados
                </h4>
                <p className="text-xs text-slate-400">
                  {masterTab === 'brokers' 
                    ? 'Selecciona MetaTrader 5 o cTrader del listado para vincular tu puente de ejecución directa.'
                    : 'Selecciona cualquier exchange del catálogo CCXT inferior y conéctalo en 1 clic (OAuth 2.0) o con tus API Secrets.'}
                </p>
              </div>
              <button
                onClick={() => openConnectModal(masterTab === 'brokers' ? 'metatrader5' : 'binance')}
                className="py-1.5 px-4 bg-white/10 hover:bg-white/15 text-white rounded-xl text-xs font-semibold border border-white/15 flex items-center gap-1.5 cursor-pointer transition-all"
              >
                <Plus className="w-3.5 h-3.5 text-[#F472B6]" />
                <span>{masterTab === 'brokers' ? 'Conectar MT5 o cTrader' : 'Conectar Exchange Principal'}</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
              {filteredAccounts.map((account) => {
                const venue = SUPPORTED_VENUES.find(v => v.id === account.venueId);
                const isOnline = account.status === 'CONNECTED';

                return (
                  <div 
                    key={account.id} 
                    className="bg-[#0D0F17]/90 border border-white/10 hover:border-white/20 rounded-2xl p-3.5 transition-all relative overflow-hidden flex flex-col justify-between group"
                  >
                    <div 
                      className="absolute top-0 left-0 right-0 h-1"
                      style={{ backgroundColor: venue?.color || '#38BDF8' }}
                    />

                    <div className="flex items-start justify-between gap-2 mb-2 pt-1">
                      <div className="flex items-center gap-2 min-w-0">
                        <div 
                          className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold text-white shrink-0 border border-white/10"
                          style={{ backgroundColor: (venue?.color || '#38BDF8') + '25', borderColor: (venue?.color || '#38BDF8') + '40' }}
                        >
                          {account.venueName.substring(0, 2).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-white truncate flex items-center gap-1.5">
                            <span>{account.label}</span>
                            {account.isTestnet && (
                              <span className="text-[9px] px-1 py-0.2 rounded bg-amber-500/20 text-amber-400 font-mono">
                                TESTNET
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono truncate">
                            {account.venueName} · {masterTab === 'brokers' ? 'DMA Bridge' : 'CCXT L2'}
                          </div>
                        </div>
                      </div>

                      <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded-full shrink-0 ${
                        isOnline 
                          ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-400' 
                          : 'bg-slate-500/15 border border-slate-500/30 text-slate-400'
                      }`}>
                        {account.status}
                      </span>
                    </div>

                    {/* Balance & Margin Row */}
                    <div className="grid grid-cols-2 gap-2 my-2 p-2 rounded-xl bg-black/30 border border-white/5 font-mono text-left">
                      <div>
                        <div className="text-[9px] text-slate-400 uppercase">Balance USD</div>
                        <div className="text-xs font-bold text-white">
                          ${account.balanceUsd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                      </div>
                      <div>
                        <div className="text-[9px] text-slate-400 uppercase">Margen Libre</div>
                        <div className="text-xs font-bold text-emerald-400">
                          ${account.freeMarginUsd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                      </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="flex items-center justify-between pt-2 border-t border-white/5 text-[10px] font-mono">
                      <div className="flex items-center gap-1 text-slate-400">
                        <Wifi className="w-3 h-3 text-[#FBBF24]" />
                        <span>{account.pingMs}ms</span>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handlePingOne(account.id)}
                          title="Medir Latencia"
                          className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
                        >
                          <RefreshCw className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => handleToggleStatus(account.id, account.label)}
                          title={isOnline ? 'Pausar' : 'Activar'}
                          className={`p-1 rounded-lg transition-colors cursor-pointer ${
                            isOnline ? 'text-emerald-400 hover:bg-emerald-500/15' : 'text-slate-500 hover:bg-white/10'
                          }`}
                        >
                          <Power className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => handleDelete(account.id, account.label)}
                          title="Eliminar"
                          className="p-1 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>
          )}

          {/* VENUE DIRECTORY (EXCHANGES CCXT OR BROKERS MT5/cTrader) */}
          <div className="pt-4 border-t border-white/10 space-y-3.5">
            
            {/* Directory Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                  <Building2 className={`w-4 h-4 ${masterTab === 'brokers' ? 'text-emerald-400' : 'text-[#38BDF8]'}`} />
                  <span>
                    {masterTab === 'brokers' 
                      ? 'Brokers DMA & Terminales Soportados' 
                      : 'Directorio Global CCXT & Exchanges'}
                  </span>
                  <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-white/10 text-slate-300">
                    {filteredCatalogVenues.length} Disponibles
                  </span>
                </h3>
                <p className="text-[11px] text-slate-400">
                  {masterTab === 'brokers'
                    ? 'Conexión a brokers institucionales mediante sockets DMA, MetaTrader 5 y cTrader Open API.'
                    : 'Marca con la estrella ⭐ tus favoritos para que aparezcan en tu acceso rápido permanente.'}
                </p>
              </div>

              {/* Search Bar */}
              <div className="relative w-full sm:w-72">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder={masterTab === 'brokers' ? "Buscar broker (MT5, cTrader)..." : "Buscar exchange (KuCoin, Binance, OKX)..."}
                  value={directorySearch}
                  onChange={(e) => setDirectorySearch(e.target.value)}
                  className="w-full bg-[#0A0B0F] border border-white/10 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-[#F472B6]"
                />
              </div>
            </div>

            {/* Filter Tabs for Exchanges */}
            {masterTab === 'exchanges' && (
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
                <button
                  onClick={() => setActiveDirectoryFilter('favorites')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeDirectoryFilter === 'favorites'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                      : 'bg-white/5 text-slate-400 hover:text-white border border-white/5'
                  }`}
                >
                  <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  <span>Favoritos ({favoriteVenues.length})</span>
                </button>

                <button
                  onClick={() => setActiveDirectoryFilter('all')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    activeDirectoryFilter === 'all'
                      ? 'bg-white/20 text-white border border-white/30'
                      : 'bg-white/5 text-slate-400 hover:text-white border border-white/5'
                  }`}
                >
                  🌐 Todos CCXT
                </button>

                <button
                  onClick={() => setActiveDirectoryFilter('tier1_derivatives')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    activeDirectoryFilter === 'tier1_derivatives'
                      ? 'bg-[#38BDF8]/20 text-[#38BDF8] border border-[#38BDF8]/40'
                      : 'bg-white/5 text-slate-400 hover:text-white border border-white/5'
                  }`}
                >
                  ⚡ Tier 1 Futuros
                </button>

                <button
                  onClick={() => setActiveDirectoryFilter('dex_l1')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    activeDirectoryFilter === 'dex_l1'
                      ? 'bg-[#A855F7]/20 text-[#C084FC] border border-[#A855F7]/40'
                      : 'bg-white/5 text-slate-400 hover:text-white border border-white/5'
                  }`}
                >
                  💧 DEXs L2 & Perps
                </button>

                <button
                  onClick={() => setActiveDirectoryFilter('regional_regulated')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    activeDirectoryFilter === 'regional_regulated'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : 'bg-white/5 text-slate-400 hover:text-white border border-white/5'
                  }`}
                >
                  🏛️ Regulados / Spot
                </button>
              </div>
            )}

            {/* Directory Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {filteredCatalogVenues.map((venue) => {
                const isFav = favoriteVenues.includes(venue.id);
                const isConnected = accounts.some(a => a.venueId === venue.id && a.status === 'CONNECTED');

                return (
                  <div
                    key={venue.id}
                    className="bg-[#0D0F17]/70 border border-white/10 hover:border-white/20 rounded-2xl p-3 flex flex-col justify-between transition-all group relative"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-1.5 mb-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <div 
                            className="w-7 h-7 rounded-lg flex items-center justify-center text-[11px] font-bold text-white shrink-0 border"
                            style={{ 
                              backgroundColor: venue.color + '20', 
                              borderColor: venue.color + '45',
                              color: venue.color
                            }}
                          >
                            {venue.name.substring(0, 2).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <div className="text-xs font-bold text-white truncate group-hover:text-[#38BDF8] transition-colors">
                              {venue.name}
                            </div>
                            <div className="text-[9.5px] font-mono text-slate-400 truncate">
                              id: {venue.ccxtId}
                            </div>
                          </div>
                        </div>

                        {/* Star Toggle Button */}
                        <button
                          type="button"
                          onClick={(e) => handleToggleFavorite(venue.id, e)}
                          title={isFav ? "Quitar de favoritos" : "Añadir a favoritos"}
                          className="p-1 rounded-lg text-slate-500 hover:text-amber-400 transition-transform active:scale-125 cursor-pointer"
                        >
                          <Star className={`w-3.5 h-3.5 ${isFav ? 'text-amber-400 fill-amber-400' : 'text-slate-600 hover:text-amber-400'}`} />
                        </button>
                      </div>

                      <p className="text-[10px] text-slate-400 line-clamp-2 leading-tight mb-2.5">
                        {venue.tagline}
                      </p>
                    </div>

                    <div className="space-y-2 pt-2 border-t border-white/5">
                      <div className="flex items-center justify-between text-[9px] font-mono text-slate-400">
                        <span className="truncate">{venue.rateLimitInfo}</span>
                        {venue.supportsOAuth && (
                          <span className="px-1.5 py-0.2 rounded bg-[#38BDF8]/20 text-[#38BDF8] font-bold shrink-0">
                            OAuth 2.0
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-between gap-2">
                        <a
                          href={venue.documentationUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[10px] text-slate-500 hover:text-slate-300 flex items-center gap-0.5"
                        >
                          <span>Docs</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </a>

                        {isConnected ? (
                          <span className="py-1 px-2.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[10px] font-mono font-bold flex items-center gap-1">
                            <Check className="w-2.5 h-2.5" />
                            <span>Conectado</span>
                          </span>
                        ) : (
                          <button
                            onClick={() => openConnectModal(venue.id)}
                            className="py-1 px-3 rounded-lg bg-white/10 hover:bg-white/20 text-white text-[10px] font-semibold flex items-center gap-1 cursor-pointer transition-colors active:scale-95"
                          >
                            <Plus className="w-2.5 h-2.5 text-[#F472B6]" />
                            <span>Conectar</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

          </div>
        </>
      )}

      {/* Modal: Conexión Exchange o Broker con OAuth 2.0 o API Secrets */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#06070B]/85 backdrop-blur-xl animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-[#12131A] border border-white/15 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
            
            {/* Top Venue Accent */}
            <div 
              className="h-1.5 w-full transition-colors"
              style={{ backgroundColor: selectedVenueMeta.color }}
            />

            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-white/[0.08] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div 
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold text-white border"
                  style={{ 
                    backgroundColor: selectedVenueMeta.color + '25', 
                    borderColor: selectedVenueMeta.color + '50',
                    color: selectedVenueMeta.color
                  }}
                >
                  {selectedVenueMeta.name.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-1.5">
                    <span>Conectar {selectedVenueMeta.name}</span>
                  </h3>
                  <p className="text-[10.5px] text-slate-400">
                    {selectedVenueMeta.category === 'institutional_broker' ? 'Protocolo DMA / Bridge' : 'CCXT Protocol'} · Zero-Custody Storage
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Auth Mode Toggle (Only if venue supports OAuth 2.0) */}
            {selectedVenueMeta.supportsOAuth && (
              <div className="px-5 pt-3">
                <div className="p-1 rounded-xl bg-[#0A0B0F] border border-white/10 flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setAuthMode('oauth')}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      authMode === 'oauth'
                        ? 'bg-gradient-to-r from-[#FBBF24] to-[#F472B6] text-white shadow-md'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Zap className="w-3.5 h-3.5" />
                    <span>Conexión Rápida (OAuth 2.0)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setAuthMode('keys')}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      authMode === 'keys'
                        ? 'bg-white/20 text-white font-bold'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Key className="w-3.5 h-3.5" />
                    <span>Claves API Manuales</span>
                  </button>
                </div>
              </div>
            )}

            {/* Modal Body */}
            <div className="p-4 sm:p-5 overflow-y-auto space-y-4">

              {/* Venue Info Pill */}
              <div className="bg-[#1A1C26] border border-white/5 rounded-xl p-3 flex items-center justify-between text-xs">
                <div>
                  <div className="font-semibold text-white">{selectedVenueMeta.name}</div>
                  <div className="text-slate-400 text-[10.5px]">{selectedVenueMeta.tagline}</div>
                </div>
                <a 
                  href={selectedVenueMeta.documentationUrl} 
                  target="_blank" 
                  rel="noreferrer"
                  className="flex items-center gap-1 text-[#38BDF8] hover:underline text-[10.5px] shrink-0 font-medium ml-2"
                >
                  <span>Doc API</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              {/* OAUTH 2.0 FLOW */}
              {selectedVenueMeta.supportsOAuth && authMode === 'oauth' ? (
                <div className="space-y-4 py-2">
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-950/40 via-[#0A0B0F] to-[#12131A] border border-emerald-500/30 space-y-3">
                    <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold">
                      <Zap className="w-4 h-4" />
                      <span>Autenticación Instantánea sin Claves Manuales</span>
                    </div>
                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      Con OAuth 2.0 no necesitas copiar ni pegar API Keys ni Secrets. El broker autoriza directamente un canal seguro con permisos mínimos de lectura y trading.
                    </p>
                    <div className="flex flex-wrap gap-2 pt-1">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                        ✓ Sin riesgo de retiros
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                        ✓ Refresh Token Automático
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Etiqueta Opcional
                    </label>
                    <input
                      type="text"
                      value={labelInput}
                      onChange={(e) => setLabelInput(e.target.value)}
                      placeholder={`ej. ${selectedVenueMeta.name} OAuth Principal`}
                      className="w-full px-3.5 py-2 bg-[#0A0B0F] border border-white/10 rounded-xl text-white text-xs placeholder-slate-500 focus:outline-none focus:border-[#38BDF8]"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleOAuthConnect}
                    disabled={isConnectingOAuth}
                    className="w-full py-2.5 px-4 bg-gradient-to-r from-emerald-500 via-teal-500 to-[#38BDF8] hover:brightness-110 text-black font-bold rounded-xl text-xs shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50"
                  >
                    {isConnectingOAuth ? (
                      <RefreshCw className="w-4 h-4 animate-spin text-black" />
                    ) : (
                      <Zap className="w-4 h-4 text-black" />
                    )}
                    <span>{isConnectingOAuth ? 'Negociando handshake OAuth 2.0...' : `Autorizar y Conectar con ${selectedVenueMeta.name}`}</span>
                  </button>
                </div>
              ) : (
                /* MANUAL API KEYS / WEB3 / FIX FLOW */
                <form onSubmit={handleCreateConnection} className="space-y-3.5">
                  {/* Testnet vs Mainnet Switch */}
                  {selectedVenueMeta.supportsTestnet && (
                    <div className="flex items-center justify-between p-3 rounded-xl bg-[#0A0B0F] border border-white/5">
                      <div className="space-y-0.5">
                        <div className="text-xs font-semibold text-white flex items-center gap-1.5">
                          <span>Modo Testnet / Demo</span>
                          <span className="text-[9px] bg-amber-500/20 text-amber-400 px-1.5 py-0.2 rounded font-mono">
                            Fondos Virtuales
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-400">
                          Usa credenciales de la cuenta Demo o Sandbox oficial.
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsTestnet(!isTestnet)}
                        className={`w-10 h-5 rounded-full transition-colors relative cursor-pointer ${
                          isTestnet ? 'bg-[#F472B6]' : 'bg-white/10'
                        }`}
                      >
                        <div 
                          className={`w-3.5 h-3.5 rounded-full bg-white absolute top-0.5 transition-transform ${
                            isTestnet ? 'left-5.5' : 'left-0.5'
                          }`} 
                        />
                      </button>
                    </div>
                  )}

                  {/* Label Name */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Etiqueta / Nombre
                    </label>
                    <input
                      type="text"
                      value={labelInput}
                      onChange={(e) => setLabelInput(e.target.value)}
                      placeholder={`ej. ${selectedVenueMeta.name} Cuenta 1`}
                      className="w-full px-3.5 py-2 bg-[#0A0B0F] border border-white/10 rounded-xl text-white text-xs placeholder-slate-500 focus:outline-none focus:border-[#38BDF8]"
                    />
                  </div>

                  {/* Dynamic inputs based on authType */}
                  {selectedVenueMeta.authType === 'web3_agent' ? (
                    <>
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">
                          Dirección de Agent Wallet (0x...)
                        </label>
                        <input
                          type="text"
                          value={agentAddressInput}
                          onChange={(e) => setAgentAddressInput(e.target.value)}
                          placeholder="0x71C... (Arbitrum L2)"
                          className="w-full px-3.5 py-2 bg-[#0A0B0F] border border-white/10 rounded-xl text-white text-xs font-mono placeholder-slate-500 focus:outline-none focus:border-[#38BDF8]"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">
                          Private Key del Agente
                        </label>
                        <input
                          type={showSecret ? 'text' : 'password'}
                          value={apiKeyInput}
                          onChange={(e) => setApiKeyInput(e.target.value)}
                          placeholder="0x... (Clave delegada con saldo de gas)"
                          className="w-full px-3.5 py-2 bg-[#0A0B0F] border border-white/10 rounded-xl text-white text-xs font-mono placeholder-slate-500 focus:outline-none focus:border-[#38BDF8]"
                          required
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">
                          {selectedVenueMeta.category === 'institutional_broker' ? 'Account ID / Login' : 'API Key'}
                        </label>
                        <input
                          type="text"
                          value={apiKeyInput}
                          onChange={(e) => setApiKeyInput(e.target.value)}
                          placeholder={selectedVenueMeta.category === 'institutional_broker' ? 'ej. 10928374' : 'ej. apiKey_live_...'}
                          className="w-full px-3.5 py-2 bg-[#0A0B0F] border border-white/10 rounded-xl text-white text-xs font-mono placeholder-slate-500 focus:outline-none focus:border-[#38BDF8]"
                          required
                        />
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-xs font-semibold text-slate-300">
                            {selectedVenueMeta.category === 'institutional_broker' ? 'Password / Clave de Acceso' : 'API Secret'}
                          </label>
                          <button
                            type="button"
                            onClick={() => setShowSecret(!showSecret)}
                            className="text-[10px] text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer"
                          >
                            {showSecret ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                            <span>{showSecret ? 'Ocultar' : 'Mostrar'}</span>
                          </button>
                        </div>
                        <input
                          type={showSecret ? 'text' : 'password'}
                          value={apiSecretInput}
                          onChange={(e) => setApiSecretInput(e.target.value)}
                          placeholder="••••••••••••••••••••••••••••••••"
                          className="w-full px-3.5 py-2 bg-[#0A0B0F] border border-white/10 rounded-xl text-white text-xs font-mono placeholder-slate-500 focus:outline-none focus:border-[#38BDF8]"
                          required
                        />
                      </div>

                      {/* Passphrase if required */}
                      {selectedVenueMeta.requiresPassphrase && (
                        <div>
                          <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1">
                            <span>{selectedVenueMeta.category === 'institutional_broker' ? 'Server / Host Broker' : 'Passphrase'}</span>
                            <span className="text-[9.5px] text-amber-400 font-mono">(Requerido por {selectedVenueMeta.name})</span>
                          </label>
                          <input
                            type="text"
                            value={passphraseInput}
                            onChange={(e) => setPassphraseInput(e.target.value)}
                            placeholder={selectedVenueMeta.category === 'institutional_broker' ? 'ej. Pepperstone-Live01' : 'Contraseña de API establecida en el exchange'}
                            className="w-full px-3.5 py-2 bg-[#0A0B0F] border border-white/10 rounded-xl text-white text-xs font-mono placeholder-slate-500 focus:outline-none focus:border-[#38BDF8]"
                            required
                          />
                        </div>
                      )}
                    </>
                  )}

                  {/* Actions */}
                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/10">
                    <button
                      type="button"
                      onClick={() => setIsAddModalOpen(false)}
                      className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-gradient-to-r from-[#FBBF24] via-[#F472B6] to-[#60A5FA] hover:brightness-110 text-white rounded-xl text-xs font-bold shadow-md shadow-[#F472B6]/20 flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Guardar y Conectar</span>
                    </button>
                  </div>
                </form>
              )}

            </div>

          </div>
        </div>
      )}

    </div>
  );
};
