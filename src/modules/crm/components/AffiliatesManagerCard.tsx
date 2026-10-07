import React, { useState } from 'react';
import { ExchangeAffiliateItem, PropFirmAffiliateItem } from '../types/crm.types';
import { CrmLang } from '../types/i18n';
import { INITIAL_EXCHANGES, INITIAL_PROPFIRMS } from '../api/crmService';
import { ArrowLeftRight, Building, ExternalLink, Save, Check } from 'lucide-react';

interface AffiliatesManagerCardProps {
  type: 'exchanges' | 'prop_firms';
  lang?: CrmLang;
}

export const AffiliatesManagerCard: React.FC<AffiliatesManagerCardProps> = ({
  type,
  lang = 'es'
}) => {
  const isEs = lang === 'es';
  const isExchange = type === 'exchanges';

  const [exchanges, setExchanges] = useState<ExchangeAffiliateItem[]>(() => {
    try {
      const local = localStorage.getItem('zyti_affiliate_exchanges');
      if (local) return JSON.parse(local);
    } catch {}
    return INITIAL_EXCHANGES;
  });

  const [propFirms, setPropFirms] = useState<PropFirmAffiliateItem[]>(() => {
    try {
      const local = localStorage.getItem('zyti_affiliate_propfirms');
      if (local) return JSON.parse(local);
    } catch {}
    return INITIAL_PROPFIRMS;
  });

  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleUpdateExchangeUrl = (id: string, url: string) => {
    setExchanges(prev => prev.map(ex => ex.id === id ? { ...ex, affiliateUrl: url } : ex));
  };

  const handleUpdatePropFirmUrl = (id: string, url: string, code: string) => {
    setPropFirms(prev => prev.map(pf => pf.id === id ? { ...pf, affiliateUrl: url, discountCode: code } : pf));
  };

  const handleSaveAll = () => {
    if (isExchange) {
      localStorage.setItem('zyti_affiliate_exchanges', JSON.stringify(exchanges));
    } else {
      localStorage.setItem('zyti_affiliate_propfirms', JSON.stringify(propFirms));
    }
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  return (
    <div className="w-full rounded-2xl bg-white border border-[#e5dfd3] p-5 shadow-[0_20px_50px_-12px_rgba(27,24,18,0.06)]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#ece7dc]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200/80 flex items-center justify-center shrink-0">
            {isExchange ? <ArrowLeftRight className="w-5 h-5 text-amber-700" /> : <Building className="w-5 h-5 text-amber-700" />}
          </div>
          <div>
            <h2 className="text-base font-extrabold text-[#0F172A] tracking-tight">
              {isExchange 
                ? (isEs ? 'Gestor de Exchanges & Enlaces de Afiliado' : 'Exchanges & Affiliate Links Manager')
                : (isEs ? 'Directorio de Prop Firms & Enlaces B2B' : 'Prop Firms & B2B Partner Links')
              }
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              {isEs 
                ? 'Los enlaces y códigos configurados aquí alimentan el Home de ZYTI y el enrutador de brokers.' 
                : 'Links and codes configured here feed the ZYTI homepage directory and broker router.'
              }
            </p>
          </div>
        </div>

        <button
          onClick={handleSaveAll}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#EAB308] hover:bg-[#CA8A04] text-[#020617] font-bold text-xs shadow-sm transition-all hover:scale-[1.02] active:scale-95"
        >
          {savedSuccess ? <Check className="w-4 h-4 text-emerald-900" /> : <Save className="w-4 h-4" />}
          <span>{savedSuccess ? (isEs ? '¡Guardado!' : 'Saved!') : (isEs ? 'Guardar Cambios' : 'Save Links')}</span>
        </button>
      </div>

      <div className="divide-y divide-[#ece7dc] mt-2">
        {isExchange ? (
          exchanges.map(ex => (
            <div key={ex.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="w-44">
                <div className="font-extrabold text-[#0F172A] text-sm">{ex.name}</div>
                <div className="text-[10px] text-slate-400 font-medium">Rebate: {ex.commissionRebatePct}% comisiones</div>
              </div>
              <div className="flex-1 flex items-center gap-2">
                <input
                  type="text"
                  value={ex.affiliateUrl}
                  onChange={(e) => handleUpdateExchangeUrl(ex.id, e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl bg-[#f8f6f0] border border-[#dcd6ca] text-xs font-mono text-slate-900 focus:outline-none focus:border-slate-800"
                />
                <a
                  href={ex.affiliateUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors shrink-0"
                  title="Probar enlace"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          ))
        ) : (
          propFirms.map(pf => (
            <div key={pf.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="w-44">
                <div className="font-extrabold text-[#0F172A] text-sm">{pf.name}</div>
                <div className="text-[10px] text-slate-400 font-medium">Split: {pf.payoutSplitPct}% trader</div>
              </div>
              <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div className="sm:col-span-2 flex items-center gap-2">
                  <input
                    type="text"
                    value={pf.affiliateUrl}
                    onChange={(e) => handleUpdatePropFirmUrl(pf.id, e.target.value, pf.discountCode)}
                    className="w-full px-3 py-1.5 rounded-xl bg-[#f8f6f0] border border-[#dcd6ca] text-xs font-mono text-slate-900 focus:outline-none focus:border-slate-800"
                    placeholder="URL de Afiliado"
                  />
                  <a
                    href={pf.affiliateUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors shrink-0"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
                <div>
                  <input
                    type="text"
                    value={pf.discountCode}
                    onChange={(e) => handleUpdatePropFirmUrl(pf.id, pf.affiliateUrl, e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl bg-[#f8f6f0] border border-[#dcd6ca] text-xs font-mono font-bold text-purple-900 focus:outline-none focus:border-slate-800"
                    placeholder="Código Descuento"
                  />
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
