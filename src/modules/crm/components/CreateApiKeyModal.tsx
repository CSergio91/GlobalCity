import React, { useState } from 'react';
import { ApiCredentialEntity, ApiKeyType, ApiScope } from '../types/crm.types';
import { CrmLang } from '../types/i18n';
import { X, KeyRound, Copy, Check, ShieldCheck, AlertTriangle, Bot, Building2, Zap } from 'lucide-react';

interface CreateApiKeyModalProps {
  isOpen: boolean;
  lang?: CrmLang;
  onClose: () => void;
  onCreateKey: (params: {
    name: string;
    keyType: ApiKeyType;
    scopes: ApiScope[];
    ipWhitelist: string[];
    rateLimitRpm: number;
  }) => Promise<void>;
  newlyCreatedKey: ApiCredentialEntity | null;
  onDismissCreatedKey: () => void;
}

const ALL_SCOPES_ES: { id: ApiScope; label: string; desc: string }[] = [
  { id: 'trade:read', label: 'Lectura de Trading (trade:read)', desc: 'Consultar precios, velas y posiciones activas.' },
  { id: 'trade:order_create', label: 'Crear Órdenes (trade:order_create)', desc: 'Emitir órdenes de compra y venta para agentes IA.' },
  { id: 'trade:order_cancel', label: 'Cancelar Órdenes (trade:order_cancel)', desc: 'Cerrar posiciones o cancelar órdenes límite pendientes.' },
  { id: 'accounts:provision', label: 'Aprovisionar Cuentas (accounts:provision)', desc: 'Crear cuentas y emitir tokens SSO (Solo Prop Firms).' },
  { id: 'accounts:freeze', label: 'Congelar Cuentas (accounts:freeze)', desc: 'Bloquear cuentas ante infracciones o liquidaciones.' },
  { id: 'metrics:read', label: 'Métricas & Drawdown (metrics:read)', desc: 'Auditoría continua de balance, equidad y PnL.' },
  { id: 'webhooks:write', label: 'Recepción Webhooks (webhooks:write)', desc: 'Permiso para recibir despachos HMAC-SHA256 en vivo.' }
];

const ALL_SCOPES_EN: { id: ApiScope; label: string; desc: string }[] = [
  { id: 'trade:read', label: 'Trading Read (trade:read)', desc: 'Query prices, k-lines and active positions.' },
  { id: 'trade:order_create', label: 'Create Orders (trade:order_create)', desc: 'Execute buy/sell orders for AI bots.' },
  { id: 'trade:order_cancel', label: 'Cancel Orders (trade:order_cancel)', desc: 'Close open trades or cancel pending orders.' },
  { id: 'accounts:provision', label: 'Provision Accounts (accounts:provision)', desc: 'Create challenges and SSO tokens (Prop Firms only).' },
  { id: 'accounts:freeze', label: 'Freeze Accounts (accounts:freeze)', desc: 'Lock accounts on breach or liquidation.' },
  { id: 'metrics:read', label: 'Metrics & Drawdown (metrics:read)', desc: 'Continuous audit of balance, equity and PnL.' },
  { id: 'webhooks:write', label: 'Webhook Reception (webhooks:write)', desc: 'Permission to receive live HMAC-SHA256 dispatches.' }
];

export const CreateApiKeyModal: React.FC<CreateApiKeyModalProps> = ({
  isOpen,
  lang = 'es',
  onClose,
  onCreateKey,
  newlyCreatedKey,
  onDismissCreatedKey
}) => {
  const [name, setName] = useState('');
  const [keyType, setKeyType] = useState<ApiKeyType>('ai_agent');
  const [selectedScopes, setSelectedScopes] = useState<ApiScope[]>([
    'trade:read',
    'trade:order_create',
    'trade:order_cancel'
  ]);
  const [ipWhitelistStr, setIpWhitelistStr] = useState('');
  const [rateLimitRpm, setRateLimitRpm] = useState(120);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedPublic, setCopiedPublic] = useState(false);
  const [copiedSecret, setCopiedSecret] = useState(false);

  const isEs = lang === 'es';
  const scopesList = isEs ? ALL_SCOPES_ES : ALL_SCOPES_EN;

  if (!isOpen && !newlyCreatedKey) return null;

  const toggleScope = (scope: ApiScope) => {
    if (selectedScopes.includes(scope)) {
      setSelectedScopes(selectedScopes.filter(s => s !== scope));
    } else {
      setSelectedScopes([...selectedScopes, scope]);
    }
  };

  const handleSelectPresetType = (type: ApiKeyType) => {
    setKeyType(type);
    if (type === 'prop_firm') {
      setSelectedScopes(['accounts:provision', 'accounts:freeze', 'metrics:read', 'webhooks:write']);
      setRateLimitRpm(300);
    } else {
      setSelectedScopes(['trade:read', 'trade:order_create', 'trade:order_cancel']);
      setRateLimitRpm(120);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const ipList = ipWhitelistStr
        .split('\n')
        .map(ip => ip.trim())
        .filter(ip => ip.length > 0);

      await onCreateKey({
        name,
        keyType,
        scopes: selectedScopes,
        ipWhitelist: ipList,
        rateLimitRpm: Number(rateLimitRpm)
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopy = (text: string, isSecret = false) => {
    navigator.clipboard.writeText(text);
    if (isSecret) {
      setCopiedSecret(true);
      setTimeout(() => setCopiedSecret(false), 2000);
    } else {
      setCopiedPublic(true);
      setTimeout(() => setCopiedPublic(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-xl rounded-2xl bg-[#FDFCF9] border border-[#ded8cb] shadow-2xl p-6 text-slate-800">
        
        {/* Pantalla 2: Llave Generada */}
        {newlyCreatedKey ? (
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-[#ece7dc]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4 text-emerald-700" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-[#0F172A] tracking-tight">
                    {isEs ? 'Credencial Generada Exitosamente' : 'Credential Successfully Issued'}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    {newlyCreatedKey.name} ({newlyCreatedKey.key_type === 'ai_agent' ? (isEs ? 'Agente IA' : 'AI Agent') : 'Prop Firm B2B'})
                  </p>
                </div>
              </div>
            </div>

            <div className="my-4 p-3.5 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-2.5 text-xs text-amber-900">
              <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">{isEs ? 'Importante: Guarda tu clave secreta ahora.' : 'Important: Save your secret key now.'}</span>
                <p className="text-[11px] text-amber-800/80 mt-0.5">
                  {isEs 
                    ? 'Por seguridad institucional, en la base de datos se almacena un hash SHA-256. Esta es la única vez que verás el secreto en texto plano.'
                    : 'For institutional security, a SHA-256 hash is stored in the database. This is the only time you will see the raw secret.'
                  }
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                  {isEs ? 'Clave Pública (API Key)' : 'Public API Key'}
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={newlyCreatedKey.api_key_public}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-[#dcd6ca] text-xs font-mono font-bold text-[#0F172A]"
                  />
                  <button
                    onClick={() => handleCopy(newlyCreatedKey.api_key_public)}
                    className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 transition-colors"
                  >
                    {copiedPublic ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                  {isEs ? 'Clave Secreta (API Secret)' : 'Secret API Key'}
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={newlyCreatedKey.raw_secret_key || ''}
                    className="w-full px-3 py-2 rounded-xl bg-amber-50/50 border border-amber-300 text-xs font-mono font-bold text-amber-900"
                  />
                  <button
                    onClick={() => handleCopy(newlyCreatedKey.raw_secret_key || '', true)}
                    className="p-2 rounded-xl bg-amber-100 hover:bg-amber-200 border border-amber-300 text-amber-900 transition-colors"
                  >
                    {copiedSecret ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-5 mt-4 border-t border-[#ece7dc]">
              <button
                onClick={onDismissCreatedKey}
                className="px-5 py-2.5 rounded-xl bg-[#EAB308] hover:bg-[#CA8A04] text-[#020617] text-xs font-bold shadow-sm transition-all hover:scale-[1.02] active:scale-95"
              >
                {isEs ? 'He Guardado las Credenciales' : 'I Have Saved the Credentials'}
              </button>
            </div>
          </div>
        ) : (
          /* Pantalla 1: Formulario */
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-[#ece7dc]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-purple-50 border border-purple-200 flex items-center justify-center">
                  <KeyRound className="w-4 h-4 text-purple-700" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-[#0F172A] tracking-tight">
                    {isEs ? 'Emitir Nueva Credencial API' : 'Issue New API Credential'}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    {isEs ? 'Configura permisos granulares para Empresas de Fondeo o Agentes IA.' : 'Configure granular scopes for Prop Firms or AI Agents.'}
                  </p>
                </div>
              </div>
              <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  {isEs ? 'Tipo de Integración' : 'Integration Type'}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleSelectPresetType('ai_agent')}
                    className={`flex items-center gap-2 p-2.5 rounded-xl border text-left text-xs transition-all ${
                      keyType === 'ai_agent'
                        ? 'bg-cyan-50 border-cyan-400 text-cyan-950 font-bold shadow-sm'
                        : 'bg-white border-[#dcd6ca] text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Bot className="w-4 h-4 text-cyan-700 shrink-0" />
                    <div>
                      <div>{isEs ? 'Agente de IA / Bot' : 'AI Agent / Bot'}</div>
                      <div className="text-[10px] text-slate-500 font-normal">{isEs ? 'Trading autónomo vía REST/WS' : 'Autonomous trading via API'}</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSelectPresetType('prop_firm')}
                    className={`flex items-center gap-2 p-2.5 rounded-xl border text-left text-xs transition-all ${
                      keyType === 'prop_firm'
                        ? 'bg-purple-50 border-purple-400 text-purple-950 font-bold shadow-sm'
                        : 'bg-white border-[#dcd6ca] text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Building2 className="w-4 h-4 text-purple-700 shrink-0" />
                    <div>
                      <div>{isEs ? 'Empresa de Fondeo' : 'Prop Firm'}</div>
                      <div className="text-[10px] text-slate-500 font-normal">{isEs ? 'Aprovisionamiento B2B' : 'B2B provisioning & webhooks'}</div>
                    </div>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {isEs ? 'Nombre / Identificador' : 'Name / Identity'}
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-[#dcd6ca] text-xs font-semibold text-slate-900 focus:outline-none focus:border-slate-800"
                  placeholder={keyType === 'ai_agent' ? (isEs ? 'ej: Claude Arbitrage Sentinel' : 'e.g. Claude Arbitrage Sentinel') : 'ej: Global City Funding B2B Gateway'}
                />
              </div>

              {/* Scopes */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  {isEs ? 'Permisos / Scopes Asignados' : 'Assigned Permissions / Scopes'}
                </label>
                <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
                  {scopesList.map(scope => {
                    const isChecked = selectedScopes.includes(scope.id);
                    return (
                      <label
                        key={scope.id}
                        onClick={() => toggleScope(scope.id)}
                        className={`flex items-start gap-2 p-2 rounded-lg cursor-pointer border text-xs transition-colors ${
                          isChecked
                            ? 'bg-purple-50/70 border-purple-300 text-slate-900'
                            : 'bg-white border-[#ece7dc] text-slate-500'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {}}
                          className="w-3.5 h-3.5 rounded mt-0.5 text-purple-700 focus:ring-purple-600"
                        />
                        <div>
                          <div className="font-bold text-[11px] text-[#0F172A]">{scope.label}</div>
                          <div className="text-[10px] text-slate-500 font-medium">{scope.desc}</div>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {isEs ? 'Rate Limit (Req / Min)' : 'Rate Limit (Req / Min)'}
                  </label>
                  <input
                    type="number"
                    min="10"
                    max="1200"
                    value={rateLimitRpm}
                    onChange={(e) => setRateLimitRpm(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-[#dcd6ca] text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {isEs ? 'Lista Blanca IPs (Opcional)' : 'IP Whitelist (Optional)'}
                  </label>
                  <input
                    type="text"
                    value={ipWhitelistStr}
                    onChange={(e) => setIpWhitelistStr(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-[#dcd6ca] text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-slate-800"
                    placeholder="192.168.1.5, 10.0.0.1"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-[#ece7dc]">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 transition-colors"
                >
                  {isEs ? 'Cancelar' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || selectedScopes.length === 0}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#EAB308] hover:bg-[#CA8A04] text-[#020617] text-xs font-bold shadow-sm transition-all hover:scale-[1.02] active:scale-95"
                >
                  <Zap className="w-3.5 h-3.5 fill-[#020617]" />
                  <span>{isSubmitting ? (isEs ? 'Generando...' : 'Generating...') : (isEs ? 'Generar Credencial' : 'Generate Key')}</span>
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
