import React, { useState } from 'react';
import { ApiCredentialEntity } from '../types/crm.types';
import { CrmLang, crmTranslations } from '../types/i18n';
import { KeyRound, Plus, Bot, Building2, Copy, Check, Trash2, Power, Terminal, Zap } from 'lucide-react';

interface ApiGatewayCardProps {
  apiKeys: ApiCredentialEntity[];
  lang?: CrmLang;
  onOpenCreateModal: () => void;
  onToggleStatus: (id: string, isActive: boolean) => void;
  onDeleteKey: (id: string) => void;
}

export const ApiGatewayCard: React.FC<ApiGatewayCardProps> = ({
  apiKeys,
  lang = 'es',
  onOpenCreateModal,
  onToggleStatus,
  onDeleteKey
}) => {
  const t = crmTranslations[lang] || crmTranslations.es;
  const [activeTab, setActiveTab] = useState<'all' | 'prop_firm' | 'ai_agent'>('all');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const filteredKeys = apiKeys.filter(k => {
    if (activeTab === 'all') return true;
    return k.key_type === activeTab;
  });

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(text);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="w-full rounded-2xl bg-white border border-[#e5dfd3] p-5 shadow-[0_20px_50px_-12px_rgba(27,24,18,0.06)]">
      {/* Cabecera de la Card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#ece7dc]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-200/80 flex items-center justify-center shrink-0">
            <KeyRound className="w-5 h-5 text-purple-700" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-extrabold text-[#0F172A] tracking-tight">
                {t.apiCardTitle}
              </h2>
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-purple-50 text-purple-800 border border-purple-200">
                {t.apiCardBadge}
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              {t.apiCardDesc}
            </p>
          </div>
        </div>

        {/* Botón Primario Unificado: Amarillo Mostaza Cálido #EAB308 con texto #020617 */}
        <button
          onClick={onOpenCreateModal}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#EAB308] hover:bg-[#CA8A04] text-[#020617] font-bold text-xs shadow-sm transition-all hover:scale-[1.02] active:scale-95"
        >
          <Zap className="w-3.5 h-3.5 fill-[#020617]" />
          <span>{t.btnNewKey}</span>
        </button>
      </div>

      {/* Tabs de Filtro */}
      <div className="flex items-center gap-2 my-4">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'all'
              ? 'bg-[#0F172A] text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 bg-slate-100/70'
          }`}
        >
          {t.tabAll} ({apiKeys.length})
        </button>
        <button
          onClick={() => setActiveTab('prop_firm')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'prop_firm'
              ? 'bg-purple-100 text-purple-900 border border-purple-300'
              : 'text-slate-600 hover:text-purple-800 bg-purple-50/50'
          }`}
        >
          <Building2 className="w-3.5 h-3.5" />
          {t.tabPropFirms}
        </button>
        <button
          onClick={() => setActiveTab('ai_agent')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'ai_agent'
              ? 'bg-cyan-100 text-cyan-900 border border-cyan-300'
              : 'text-slate-600 hover:text-cyan-800 bg-cyan-50/50'
          }`}
        >
          <Bot className="w-3.5 h-3.5" />
          {t.tabAiAgents}
        </button>
      </div>

      {/* Tabla de Credenciales */}
      <div className="overflow-x-auto rounded-xl border border-[#e5dfd3] bg-[#fbf9f5]">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-[#e5dfd3] bg-[#f5f1e8] text-slate-700 font-bold uppercase text-[10px] tracking-wider">
              <th className="py-2.5 px-3.5">{t.thKeyName}</th>
              <th className="py-2.5 px-3">{t.thKeyType}</th>
              <th className="py-2.5 px-3">{t.thKeyPublic}</th>
              <th className="py-2.5 px-3">{t.thKeyScopes}</th>
              <th className="py-2.5 px-3">{t.thKeySecurity}</th>
              <th className="py-2.5 px-3">{t.thKeyStatus}</th>
              <th className="py-2.5 px-3 text-right">{t.thKeyActions}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#ece7dc] bg-white">
            {filteredKeys.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-slate-400 font-medium">
                  {t.noKeysFound}
                </td>
              </tr>
            ) : (
              filteredKeys.map(key => (
                <tr key={key.id} className="hover:bg-[#faf8f4] transition-colors">
                  <td className="py-3 px-3.5">
                    <div className="font-bold text-[#0F172A]">{key.name}</div>
                    <div className="text-[10px] text-slate-400 font-medium">
                      {key.created_at ? new Date(key.created_at).toLocaleDateString() : 'N/D'}
                    </div>
                  </td>

                  <td className="py-3 px-3">
                    {key.key_type === 'ai_agent' ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-cyan-50 border border-cyan-200 text-cyan-800 text-[10px] font-bold">
                        <Bot className="w-3 h-3 text-cyan-700" />
                        Agente IA
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-purple-50 border border-purple-200 text-purple-800 text-[10px] font-bold">
                        <Building2 className="w-3 h-3 text-purple-700" />
                        Prop Firm B2B
                      </span>
                    )}
                  </td>

                  <td className="py-3 px-3 font-mono text-[11px]">
                    <div className="flex items-center gap-1.5">
                      <span className="bg-[#f5f1e8] px-2 py-1 rounded-md border border-[#e2dcd0] text-slate-800 font-medium">
                        {key.api_key_public}
                      </span>
                      <button
                        onClick={() => handleCopy(key.api_key_public)}
                        className="p-1 text-slate-400 hover:text-slate-700 rounded hover:bg-slate-100 transition-colors"
                        title="Copiar"
                      >
                        {copiedKey === key.api_key_public ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </td>

                  <td className="py-3 px-3">
                    <div className="flex flex-wrap gap-1 max-w-[260px]">
                      {key.scopes.map(s => (
                        <span key={s} className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 text-[9px] font-mono border border-slate-200 font-medium">
                          {s}
                        </span>
                      ))}
                    </div>
                  </td>

                  <td className="py-3 px-3 text-[11px]">
                    <div className="space-y-0.5">
                      <div className="text-[10px] font-medium">
                        IPs:{' '}
                        {key.ip_whitelist && key.ip_whitelist.length > 0 ? (
                          <span className="text-emerald-700 font-bold font-mono">{key.ip_whitelist.length} {t.ipsAllowed}</span>
                        ) : (
                          <span className="text-amber-700 font-medium">{t.noIpRestriction}</span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {key.rate_limit_rpm} {t.reqPerMin}
                      </div>
                    </div>
                  </td>

                  <td className="py-3 px-3">
                    <button
                      onClick={() => onToggleStatus(key.id, !key.is_active)}
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold transition-colors ${
                        key.is_active
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-300 hover:bg-emerald-100'
                          : 'bg-rose-50 text-rose-700 border border-rose-300 hover:bg-rose-100'
                      }`}
                    >
                      <Power className="w-2.5 h-2.5" />
                      {key.is_active ? t.statusActive : t.statusRevoked}
                    </button>
                  </td>

                  <td className="py-3 px-3 text-right">
                    <button
                      onClick={() => onDeleteKey(key.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Eliminar"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Snippet de Conexión para Agentes IA */}
      <div className="mt-4 p-3 rounded-xl bg-[#f8f6f0] border border-[#e5dfd3] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-slate-700">
          <Terminal className="w-4 h-4 text-purple-700 shrink-0" />
          <span className="text-[11px] font-medium">
            {t.snippetHint}
          </span>
        </div>
        <div className="text-[11px] text-slate-500 font-medium">
          {t.snippetSupport}
        </div>
      </div>
    </div>
  );
};
