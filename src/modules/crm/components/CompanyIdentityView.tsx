import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Save, 
  Check, 
  Copy, 
  RefreshCw, 
  Key, 
  Webhook, 
  ShieldCheck, 
  Fingerprint, 
  Hash, 
  Info,
  Globe
} from 'lucide-react';
import { CompanyIdentityEntity } from '../types/crm.types';
import { crmService } from '../api/crmService';
import { CrmLang } from '../types/i18n';
import { BrandLogo } from '../../../components/BrandLogo';

interface CompanyIdentityViewProps {
  lang?: CrmLang;
}

export const CompanyIdentityView: React.FC<CompanyIdentityViewProps> = ({ lang = 'es' }) => {
  const isEs = lang === 'es';
  const [identity, setIdentity] = useState<CompanyIdentityEntity>({
    id: '',
    name: 'Eklipse Funded',
    legal_name: 'Eklipse Funded Proprietary Trading Ltd.',
    slogan: 'Arquitectura de Fondeo Cripto Institucional',
    account_prefix: 'EKL-',
    webhook_url: '',
    webhook_secret: 'whsec_eklipse_vault_master_secret',
    is_active: true
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  useEffect(() => {
    crmService.getCompanyIdentity().then(data => {
      setIdentity(data);
      setIsLoading(false);
    });
  }, []);

  const handleCopy = (text: string, keyName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(keyName);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const updated = await crmService.updateCompanyIdentity(identity);
      setIdentity(updated);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  const handleGenerateSecret = () => {
    const chars = '0123456789abcdef';
    let rand = '';
    for (let i = 0; i < 32; i++) {
      rand += chars[Math.floor(Math.random() * chars.length)];
    }
    setIdentity(prev => ({
      ...prev,
      webhook_secret: `whsec_eklipse_${rand}`
    }));
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* 1. Header con Branding Oficial */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-2.5 rounded-2xl bg-[#090A10] border border-amber-400/30 shadow-md">
            <BrandLogo size="sm" lightMode={false} showText={false} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-black text-[#0F172A] tracking-tight">
                {isEs ? 'Identidad de Empresa & Nomenclatura' : 'Company Identity & Nomenclatures'}
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-300">
                {isEs ? 'Prop Firm Master' : 'Prop Firm Master'}
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              {isEs 
                ? 'Control de la identidad legal de Eklipse Funded, prefijos de nomenclatura de cuentas de traders y webhooks institucionales.' 
                : 'Manage the legal identity of Eklipse Funded, account numbering prefixes, and institutional webhooks.'}
            </p>
          </div>
        </div>

        {savedSuccess && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-100 border border-emerald-300 text-emerald-800 text-xs font-bold animate-in fade-in">
            <Check className="w-3.5 h-3.5 stroke-[3]" />
            <span>{isEs ? '¡Guardado en Base de Datos!' : 'Saved to Database!'}</span>
          </span>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* 2. Sección: Datos Comerciales & Legales */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <Building2 className="w-5 h-5 text-amber-600" />
            <h2 className="text-sm font-black text-slate-900">
              {isEs ? '1. Razón Social & Marca Comercial' : '1. Legal Entity & Brand Details'}
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-bold text-slate-700 block mb-1">
                {isEs ? 'Nombre Comercial de la Firma' : 'Trade Brand Name'}
              </label>
              <input
                type="text"
                required
                value={identity.name}
                onChange={(e) => setIdentity({ ...identity, name: e.target.value })}
                className="w-full px-3.5 py-2 text-xs font-bold bg-slate-50 border border-slate-300 rounded-xl focus:outline-hidden focus:border-amber-500 text-slate-900"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">
                {isEs ? 'Razón Social Legal (Incorporación)' : 'Legal Entity Name'}
              </label>
              <input
                type="text"
                value={identity.legal_name || ''}
                onChange={(e) => setIdentity({ ...identity, legal_name: e.target.value })}
                placeholder="Eklipse Funded Proprietary Trading Ltd."
                className="w-full px-3.5 py-2 text-xs font-bold bg-slate-50 border border-slate-300 rounded-xl focus:outline-hidden focus:border-amber-500 text-slate-900"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="font-bold text-slate-700 block mb-1">
                {isEs ? 'Slogan Institucional / Misión' : 'Institutional Slogan / Tagline'}
              </label>
              <input
                type="text"
                value={identity.slogan || ''}
                onChange={(e) => setIdentity({ ...identity, slogan: e.target.value })}
                placeholder="Arquitectura de Fondeo Cripto Institucional"
                className="w-full px-3.5 py-2 text-xs font-medium bg-slate-50 border border-slate-300 rounded-xl focus:outline-hidden focus:border-amber-500 text-slate-900"
              />
            </div>
          </div>
        </div>

        {/* 3. Sección: Nomenclatura de Cuentas de Trading */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <Fingerprint className="w-5 h-5 text-purple-600" />
            <h2 className="text-sm font-black text-slate-900">
              {isEs ? '2. Nomenclatura de Cuentas de Trading (Prefijos Dinámicos)' : '2. Account Numbering Nomenclatures'}
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-bold text-slate-700 block mb-1">
                {isEs ? 'Prefijo Oficial de Cuentas (Prop Firm Prefix)' : 'Official Account Prefix'}
              </label>
              <input
                type="text"
                required
                value={identity.account_prefix || 'EKL-'}
                onChange={(e) => setIdentity({ ...identity, account_prefix: e.target.value.toUpperCase() })}
                placeholder="EKL-"
                className="w-full px-3.5 py-2 text-xs font-mono font-black bg-slate-50 border border-slate-300 rounded-xl focus:outline-hidden focus:border-purple-500 text-purple-950 uppercase"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">
                {isEs ? 'Se antepone automáticamente al aprovisionar retos a traders.' : 'Prepended automatically when provisioning trader accounts.'}
              </span>
            </div>

            {/* Vista Previa de Nomenclatura Generada */}
            <div className="p-3.5 rounded-xl bg-purple-50/70 border border-purple-200 flex flex-col justify-between">
              <span className="text-[10px] font-bold text-purple-900 uppercase tracking-wider block">
                {isEs ? 'Vista Previa en Terminal' : 'Live Terminal Preview'}
              </span>
              <div className="font-mono font-black text-sm text-purple-950 mt-1 flex items-center gap-2">
                <span>{(identity.account_prefix || 'EKL-')}100K-SOL582</span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
                  ACTIVE
                </span>
              </div>
              <span className="text-[10px] text-purple-700 font-mono mt-1">
                Formato: [PREFIJO][BALANCE]-[ID_RANDOM]
              </span>
            </div>
          </div>
        </div>

        {/* 4. Sección: Webhooks & Notificaciones Institucionales */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <Webhook className="w-5 h-5 text-emerald-600" />
              <h2 className="text-sm font-black text-slate-900">
                {isEs ? '3. Webhooks & Notificaciones de Eventos' : '3. Webhooks & Event Notifications'}
              </h2>
            </div>
            <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
              HMAC-SHA256
            </span>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <label className="font-bold text-slate-700 block mb-1">
                {isEs ? 'URL del Webhook (Despacho de Breaches & Payouts)' : 'Webhook Endpoint URL'}
              </label>
              <input
                type="url"
                value={identity.webhook_url || ''}
                onChange={(e) => setIdentity({ ...identity, webhook_url: e.target.value })}
                placeholder="https://api.tuempresa.com/webhooks/eklipse"
                className="w-full px-3.5 py-2 text-xs font-mono font-medium bg-slate-50 border border-slate-300 rounded-xl focus:outline-hidden focus:border-emerald-500 text-slate-900"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-bold text-slate-700">
                  {isEs ? 'Clave Secreta de Webhook (HMAC Secret)' : 'Webhook HMAC Secret'}
                </label>
                <button
                  type="button"
                  onClick={handleGenerateSecret}
                  className="text-[10px] font-bold text-emerald-700 hover:text-emerald-800 cursor-pointer"
                >
                  {isEs ? '↻ Generar Nuevo' : '↻ Regenerate'}
                </button>
              </div>
              <div className="relative">
                <input
                  type="text"
                  readOnly
                  value={identity.webhook_secret || ''}
                  className="w-full px-3.5 py-2 pr-10 text-xs font-mono font-bold bg-slate-100 border border-slate-300 rounded-xl text-slate-800"
                />
                <button
                  type="button"
                  onClick={() => handleCopy(identity.webhook_secret || '', 'whsec')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-800 cursor-pointer"
                  title="Copiar secreto"
                >
                  {copiedKey === 'whsec' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 5. Barra de Guardado Inferior */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>{isEs ? 'Los cambios se replican en caliente en la base de datos PostgreSQL.' : 'Changes replicate live to PostgreSQL database.'}</span>
          </div>

          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#0F172A] hover:bg-slate-800 text-white font-bold text-xs transition-all shadow-xs cursor-pointer disabled:opacity-50"
          >
            <Save className="w-4 h-4 text-amber-400" />
            <span>{isSaving ? (isEs ? 'Guardando...' : 'Saving...') : (isEs ? 'Guardar Cambios' : 'Save Changes')}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
