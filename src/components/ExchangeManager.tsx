import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Plus, 
  ShieldCheck, 
  Wifi, 
  Trash2, 
  Power, 
  ExternalLink, 
  Key, 
  CheckCircle2, 
  AlertTriangle, 
  Copy, 
  RefreshCw,
  Layers,
  ArrowRight,
  Info,
  Send,
  Zap,
  Lock,
  Eye,
  EyeOff
} from 'lucide-react';
import { exchangeStorage } from '../services/exchangeStorage';
import { StoredExchangeAccount, SUPPORTED_VENUES, VenueId } from '../types/exchange';
import { useAuth } from '../context/AuthContext';

export const ExchangeManager: React.FC = () => {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState<StoredExchangeAccount[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  // Form State
  const [selectedVenueId, setSelectedVenueId] = useState<VenueId>('bybit');
  const [labelInput, setLabelInput] = useState('');
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [apiSecretInput, setApiSecretInput] = useState('');
  const [passphraseInput, setPassphraseInput] = useState('');
  const [agentAddressInput, setAgentAddressInput] = useState('');
  const [isTestnet, setIsTestnet] = useState(false);
  const [showSecret, setShowSecret] = useState(false);
  const [isTestingPing, setIsTestingPing] = useState(false);

  useEffect(() => {
    loadAccounts();
  }, []);

  const loadAccounts = () => {
    const list = exchangeStorage.getAccounts();
    setAccounts(list);
  };

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
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
    }, 500);
  };

  const handleCreateConnection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKeyInput.trim()) {
      showToast('Debes ingresar la API Key o dirección del agente', 'error');
      return;
    }
    if (!apiSecretInput.trim()) {
      showToast('Debes ingresar el API Secret o clave privada', 'error');
      return;
    }

    const currentVenue = SUPPORTED_VENUES.find(v => v.id === selectedVenueId);
    if (currentVenue?.requiresPassphrase && !passphraseInput.trim()) {
      showToast(`${currentVenue.name} requiere obligatoriamente una Passphrase / Contraseña de API`, 'error');
      return;
    }

    exchangeStorage.addAccount({
      venueId: selectedVenueId,
      label: labelInput,
      apiKey: apiKeyInput,
      apiSecret: apiSecretInput,
      passphrase: passphraseInput,
      agentAddress: agentAddressInput,
      isTestnet,
    });

    // Reset Form
    setLabelInput('');
    setApiKeyInput('');
    setApiSecretInput('');
    setPassphraseInput('');
    setAgentAddressInput('');
    setIsTestnet(false);
    setIsAddModalOpen(false);

    loadAccounts();
    showToast(`¡Conexión con ${currentVenue?.name || 'Exchange'} guardada en LocalStorage!`, 'success');
  };

  const selectedVenueMeta = SUPPORTED_VENUES.find(v => v.id === selectedVenueId)!;

  const totalEquity = accounts.reduce((sum, acc) => sum + (acc.status === 'CONNECTED' ? acc.balanceUsd : 0), 0);
  const totalFreeMargin = accounts.reduce((sum, acc) => sum + (acc.status === 'CONNECTED' ? acc.freeMarginUsd : 0), 0);
  const connectedCount = accounts.filter(acc => acc.status === 'CONNECTED').length;
  const avgPing = accounts.length > 0 ? Math.round(accounts.reduce((s, a) => s + a.pingMs, 0) / accounts.length) : 0;

  return (
    <div className="space-y-6">

      {/* Toast Notification */}
      {notification && (
        <div className={`p-4 rounded-2xl border text-xs sm:text-sm font-medium flex items-center justify-between shadow-xl animate-in slide-in-from-top-2 duration-200 ${
          notification.type === 'error' 
            ? 'bg-rose-500/15 border-rose-500/30 text-rose-300' 
            : notification.type === 'info'
            ? 'bg-[#38BDF8]/15 border-[#38BDF8]/30 text-[#38BDF8]'
            : 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
        }`}>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{notification.message}</span>
          </div>
        </div>
      )}

      {/* Metrics Header Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-[#12131A] border border-white/[0.08] p-4 sm:p-5 rounded-2xl relative overflow-hidden group">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>Cuentas Conectadas</span>
            <Building2 className="w-4 h-4 text-[#E06D8A]" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-white">{connectedCount}</span>
            <span className="text-xs text-slate-500 font-mono">/ {accounts.length} configuradas</span>
          </div>
          <div className="text-[11px] text-emerald-400 mt-2 flex items-center gap-1 font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Almacenamiento Local Activo
          </div>
        </div>

        <div className="bg-[#12131A] border border-white/[0.08] p-4 sm:p-5 rounded-2xl relative overflow-hidden group">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>Equidad Consolidada</span>
            <Layers className="w-4 h-4 text-[#38BDF8]" />
          </div>
          <div className="text-2xl font-bold font-mono text-white">
            ${totalEquity.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-slate-400 mt-2 font-mono">
            Suma de inventarios activos
          </div>
        </div>

        <div className="bg-[#12131A] border border-white/[0.08] p-4 sm:p-5 rounded-2xl relative overflow-hidden group">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>Margen Libre Disponible</span>
            <Zap className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-400">
            ${totalFreeMargin.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-slate-400 mt-2 font-mono">
            Capacidad para nuevas órdenes
          </div>
        </div>

        <div className="bg-[#12131A] border border-white/[0.08] p-4 sm:p-5 rounded-2xl relative overflow-hidden group">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>Latencia Media (Ping)</span>
            <Wifi className="w-4 h-4 text-[#E06D8A]" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-white">{avgPing}</span>
            <span className="text-xs text-slate-500 font-mono">ms</span>
          </div>
          <div className="text-[11px] text-emerald-400 mt-2 flex items-center gap-1 font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            Baja latencia institucional
          </div>
        </div>

      </div>

      {/* Security & Non-Custodial Protocol Banner */}
      <div className="bg-gradient-to-r from-[#12131A] to-[#1A1C26] border border-[#E06D8A]/20 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-lg">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-[#E06D8A]/15 border border-[#E06D8A]/30 flex items-center justify-center shrink-0 text-[#E06D8A]">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold text-white">
                Seguridad Estricta No Custodial & Privacidad en LocalStorage
              </h4>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400">
                ZERO-CUSTODY
              </span>
            </div>
            <p className="text-xs text-slate-400 max-w-3xl leading-relaxed">
              Tus claves API se almacenan de forma local en tu propio navegador. 
              <strong className="text-slate-200"> Nunca habilites permisos de retiro (Withdrawal)</strong> en tus exchanges. 
              Solo se requieren permisos de <code className="text-[#E06D8A] font-mono">Lectura</code> y <code className="text-[#38BDF8] font-mono">Operación (Trade)</code>.
            </p>
          </div>
        </div>

        {/* Telegram Linked Identity */}
        {user && (
          <div className="bg-[#0A0B0F] border border-white/10 rounded-xl px-3.5 py-2.5 flex items-center gap-2.5 shrink-0">
            <div className="w-7 h-7 rounded-lg bg-[#229ED9]/20 flex items-center justify-center text-[#229ED9]">
              <Send className="w-3.5 h-3.5" />
            </div>
            <div className="text-left font-mono">
              <div className="text-[10px] text-slate-500">Telegram Vinculado</div>
              <div className="text-xs text-white font-bold">{user.username}</div>
            </div>
          </div>
        )}
      </div>

      {/* Main Action Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <span>Conexiones Activas de Exchanges</span>
            <span className="text-xs font-mono text-slate-500">({accounts.length})</span>
          </h3>
          <p className="text-xs text-slate-400">
            Gestiona tus cuentas de Bybit, Binance, OKX, Bitget e Hyperliquid L1.
          </p>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <button
            onClick={handlePingAll}
            disabled={isTestingPing}
            className="py-2.5 px-3.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isTestingPing ? 'animate-spin' : ''}`} />
            <span>Test Ping</span>
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex-1 sm:flex-initial py-2.5 px-4 bg-gradient-to-r from-[#E06D8A] to-[#ED7D9A] hover:brightness-110 text-white rounded-xl text-xs font-bold shadow-lg shadow-[#E06D8A]/25 flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Añadir Exchange</span>
          </button>
        </div>
      </div>

      {/* Accounts List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {accounts.map((account) => {
          const venueMeta = SUPPORTED_VENUES.find(v => v.id === account.venueId);
          const isOnline = account.status === 'CONNECTED';

          return (
            <div 
              key={account.id}
              className={`bg-[#12131A] border rounded-2xl p-5 flex flex-col justify-between transition-all duration-200 relative overflow-hidden group hover:border-white/20 ${
                isOnline ? 'border-white/10' : 'border-white/5 opacity-75'
              }`}
            >
              {/* Top Accent Color Bar */}
              <div 
                className="absolute top-0 left-0 right-0 h-1"
                style={{ backgroundColor: venueMeta?.color || '#E06D8A' }}
              />

              {/* Card Header */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div 
                      className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs"
                      style={{ 
                        backgroundColor: `${venueMeta?.color || '#FFF'}15`, 
                        color: venueMeta?.color || '#FFF',
                        border: `1px solid ${venueMeta?.color || '#FFF'}30`
                      }}
                    >
                      {account.venueId.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-white flex items-center gap-1.5">
                        <span>{account.label}</span>
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {account.venueName}
                      </div>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className="flex items-center gap-1.5">
                    {account.isTestnet && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/15 border border-amber-500/30 text-amber-400">
                        TESTNET
                      </span>
                    )}
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded flex items-center gap-1 ${
                      isOnline 
                        ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-400' 
                        : 'bg-slate-500/15 border border-slate-500/30 text-slate-400'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-slate-400'}`} />
                      {account.status}
                    </span>
                  </div>
                </div>

                {/* Key / Agent Preview */}
                <div className="bg-[#0A0B0F] border border-white/5 rounded-xl p-2.5 text-xs font-mono space-y-1 mb-4">
                  <div className="text-slate-500 text-[10px] flex items-center justify-between">
                    <span>{account.authType === 'web3_agent' ? 'DIRECCIÓN DEL AGENTE' : 'API KEY'}</span>
                    <span className="text-emerald-400 flex items-center gap-1">
                      <Lock className="w-2.5 h-2.5" /> Read & Trade
                    </span>
                  </div>
                  <div className="text-slate-300 truncate">
                    {account.apiKey}
                  </div>
                </div>

                {/* Balance & Free Margin */}
                <div className="grid grid-cols-2 gap-2 text-xs font-mono mb-4 pt-1 border-t border-white/5">
                  <div>
                    <span className="text-slate-500 text-[10px] block">EQUIDAD</span>
                    <span className="text-white font-bold text-sm">
                      ${account.balanceUsd.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] block">MARGEN LIBRE</span>
                    <span className="text-emerald-400 font-bold text-sm">
                      ${account.freeMarginUsd.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="flex items-center justify-between pt-3 border-t border-white/10 text-xs">
                <div className="flex items-center gap-1.5 font-mono text-[11px] text-slate-400">
                  <Wifi className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{account.pingMs} ms</span>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleToggleStatus(account.id, account.label)}
                    title={isOnline ? 'Pausar cuenta' : 'Activar cuenta'}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                  >
                    <Power className={`w-4 h-4 ${isOnline ? 'text-emerald-400' : 'text-slate-500'}`} />
                  </button>

                  <button
                    onClick={() => handleDelete(account.id, account.label)}
                    title="Eliminar de LocalStorage"
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

            </div>
          );
        })}
      </div>

      {/* Modal: Añadir Nueva Conexión */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#06070B]/85 backdrop-blur-xl animate-in fade-in duration-200">
          <div className="relative w-full max-w-xl bg-[#12131A] border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
            
            {/* Top Accent */}
            <div 
              className="h-1.5 w-full transition-colors"
              style={{ backgroundColor: selectedVenueMeta.color }}
            />

            {/* Modal Header */}
            <div className="p-6 border-b border-white/[0.08] flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Key className="w-5 h-5 text-[#E06D8A]" />
                  <span>Vincular Nueva API de Exchange</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Conexión directa no custodial almacenada en tu navegador.
                </p>
              </div>

              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleCreateConnection} className="p-6 overflow-y-auto space-y-5">
              
              {/* Venue Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  1. Selecciona el Exchange o Protocolo
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {SUPPORTED_VENUES.map((venue) => {
                    const isSelected = venue.id === selectedVenueId;
                    return (
                      <button
                        key={venue.id}
                        type="button"
                        onClick={() => setSelectedVenueId(venue.id)}
                        className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between cursor-pointer ${
                          isSelected 
                            ? 'bg-white/10 border-white/40 shadow-lg' 
                            : 'bg-[#0A0B0F] border-white/5 hover:border-white/20'
                        }`}
                      >
                        <div className="flex items-center justify-between w-full mb-1">
                          <span 
                            className="w-2.5 h-2.5 rounded-full" 
                            style={{ backgroundColor: venue.color }} 
                          />
                          {venue.requiresPassphrase && (
                            <span className="text-[9px] font-mono text-slate-500">
                              Passphrase
                            </span>
                          )}
                        </div>
                        <div className="text-xs font-bold text-white truncate">
                          {venue.name.split(' ')[0]}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono truncate">
                          {venue.rateLimitInfo}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Venue Specific Info Banner */}
              <div className="bg-[#1A1C26] border border-white/5 rounded-2xl p-3.5 flex items-center justify-between text-xs">
                <div>
                  <div className="font-semibold text-white">{selectedVenueMeta.name}</div>
                  <div className="text-slate-400 text-[11px]">{selectedVenueMeta.tagline}</div>
                </div>
                <a 
                  href={selectedVenueMeta.documentationUrl} 
                  target="_blank" 
                  rel="noreferrer"
                  className="flex items-center gap-1 text-[#38BDF8] hover:underline text-[11px] shrink-0 font-medium"
                >
                  <span>Doc API</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              {/* Testnet vs Mainnet Switch */}
              {selectedVenueMeta.supportsTestnet && (
                <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#0A0B0F] border border-white/5">
                  <div className="space-y-0.5">
                    <div className="text-xs font-semibold text-white flex items-center gap-1.5">
                      <span>Modo Sandbox / Testnet</span>
                      <span className="text-[10px] bg-amber-500/20 text-amber-400 px-1.5 py-0.2 rounded font-mono">
                        Fondos Virtuales
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Usa claves de la Testnet oficial para operar sin riesgo de dinero real.
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsTestnet(!isTestnet)}
                    className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                      isTestnet ? 'bg-[#E06D8A]' : 'bg-white/10'
                    }`}
                  >
                    <div 
                      className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                        isTestnet ? 'left-7' : 'left-1'
                      }`} 
                    />
                  </button>
                </div>
              )}

              {/* Label Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Etiqueta / Nombre Descriptivo
                </label>
                <input
                  type="text"
                  value={labelInput}
                  onChange={(e) => setLabelInput(e.target.value)}
                  placeholder={`ej. ${selectedVenueMeta.name} Principal`}
                  className="w-full px-3.5 py-2.5 bg-[#0A0B0F] border border-white/10 rounded-xl text-white text-xs placeholder-slate-500 focus:outline-none focus:border-[#E06D8A]"
                />
              </div>

              {/* API Key / Address */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  {selectedVenueMeta.authType === 'web3_agent' ? 'Dirección de la Agent Wallet' : 'API Key'}
                </label>
                <input
                  type="text"
                  value={apiKeyInput}
                  onChange={(e) => setApiKeyInput(e.target.value)}
                  placeholder={selectedVenueMeta.authType === 'web3_agent' ? '0x...' : 'ej. byb_live_...'}
                  className="w-full px-3.5 py-2.5 bg-[#0A0B0F] border border-white/10 rounded-xl text-white text-xs font-mono placeholder-slate-500 focus:outline-none focus:border-[#E06D8A]"
                  required
                />
              </div>

              {/* API Secret / Private Key */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-300">
                    {selectedVenueMeta.authType === 'web3_agent' ? 'Private Key del Agente' : 'API Secret'}
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowSecret(!showSecret)}
                    className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer"
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
                  className="w-full px-3.5 py-2.5 bg-[#0A0B0F] border border-white/10 rounded-xl text-white text-xs font-mono placeholder-slate-500 focus:outline-none focus:border-[#E06D8A]"
                  required
                />
              </div>

              {/* Passphrase (Only if required by venue like OKX, Bitget, Coinbase) */}
              {selectedVenueMeta.requiresPassphrase && (
                <div className="animate-in fade-in duration-200">
                  <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                    <span>Passphrase / Contraseña de API</span>
                    <span className="text-[10px] text-amber-400 font-mono">(Requerido por {selectedVenueMeta.name})</span>
                  </label>
                  <input
                    type="password"
                    value={passphraseInput}
                    onChange={(e) => setPassphraseInput(e.target.value)}
                    placeholder="Contraseña establecida al crear la API Key"
                    className="w-full px-3.5 py-2.5 bg-[#0A0B0F] border border-white/10 rounded-xl text-white text-xs font-mono placeholder-slate-500 focus:outline-none focus:border-[#E06D8A]"
                    required
                  />
                </div>
              )}

              {/* Security Warning Checklist */}
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 space-y-1.5 text-[11px] text-amber-300">
                <div className="font-semibold flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Regla Crítica de Seguridad:</span>
                </div>
                <ul className="list-disc list-inside text-amber-200/80 space-y-0.5">
                  <li>Permisos requeridos: <strong>Read (Lectura)</strong> y <strong>Trade (Operaciones)</strong>.</li>
                  <li><strong>DESACTIVA el permiso de "Withdraw" (Retiros)</strong> en la web del exchange.</li>
                  <li>Tus claves se guardan en el LocalStorage de tu navegador.</li>
                </ul>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="px-5 py-2.5 bg-gradient-to-r from-[#E06D8A] to-[#ED7D9A] hover:brightness-110 text-white rounded-xl text-xs font-bold shadow-lg shadow-[#E06D8A]/25 flex items-center gap-2 transition-all cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Guardar y Conectar</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};
