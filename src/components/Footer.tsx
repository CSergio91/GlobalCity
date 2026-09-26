import React from 'react';
import { Shield, Lock } from 'lucide-react';
import { BrandLogo } from './BrandLogo';
import { useLanguage } from '../context/LanguageContext';

export const Footer: React.FC = () => {
  const { t, language } = useLanguage();

  return (
    <footer className="bg-[#050608] border-t border-white/[0.08] pt-16 pb-12 text-slate-400 text-xs">
      <div className="w-full px-4 sm:px-8 lg:px-12 max-w-7xl mx-auto">
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-white/[0.06]">
          
          {/* Col 1: Brand Info */}
          <div className="space-y-4">
            <BrandLogo size="md" />
            <p className="text-slate-400 text-xs leading-relaxed">
              {t.footer.brandDesc}
            </p>
            <div className="flex items-center gap-2 text-[11px] text-[#2DD4BF]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#2DD4BF] animate-pulse" />
              <span>{language === 'en' ? 'WebSockets & FIX Gateways Operational (99.99% Uptime)' : 'Conexiones WebSockets & FIX Operativas (99.99% Uptime)'}</span>
            </div>
          </div>

          {/* Col 2: Capacities */}
          <div>
            <h4 className="text-white font-bold mb-4 uppercase tracking-wider text-[11px]">
              {language === 'en' ? 'Capabilities' : 'Capacidades'}
            </h4>
            <ul className="space-y-2.5">
              <li><a href="#multi-venue" className="hover:text-white transition-colors">{language === 'en' ? 'Multi-Venue Portfolio' : 'Portafolio Multi-Exchange'}</a></li>
              <li><a href="#arbitrage" className="hover:text-white transition-colors">{language === 'en' ? 'Cross-Venue Arbitrage L2' : 'Arbitraje Cross-Venue L2'}</a></li>
              <li><a href="#horizontal-showcase" className="hover:text-white transition-colors">{language === 'en' ? 'Telegram Bot Ops' : 'Telegram Bot Ops'}</a></li>
              <li><a href="#rebalance" className="hover:text-white transition-colors">{language === 'en' ? 'Synthetic Rebalancing' : 'Rebalanceo Asistido'}</a></li>
              <li><a href="#copy-trading" className="hover:text-white transition-colors">{language === 'en' ? 'Cross Copy Trading' : 'Copy Trading Cruzado'}</a></li>
              <li><a href="#calculator" className="hover:text-white transition-colors">{language === 'en' ? 'VWAP Calculator' : 'Calculadora VWAP'}</a></li>
            </ul>
          </div>

          {/* Col 3: Conectores Integrados */}
          <div>
            <h4 className="text-white font-bold mb-4 uppercase tracking-wider text-[11px]">
              {language === 'en' ? 'Connected Gateways' : 'Conectores Integrados'}
            </h4>
            <ul className="space-y-2.5">
              <li className="flex items-center gap-1.5">
                <span className="w-1 h-1 rounded-full bg-[#2DD4BF]" />
                <span>Bybit Broker API v5</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1 h-1 rounded-full bg-[#2DD4BF]" />
                <span>OKX Non-Disclosed DMA</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1 h-1 rounded-full bg-[#2DD4BF]" />
                <span>cTrader Open API (Protobuf TLS)</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1 h-1 rounded-full bg-[#2DD4BF]" />
                <span>MetaTrader 5 Windows Gateway</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1 h-1 rounded-full bg-[#2DD4BF]" />
                <span>QuickFIX Engine (4.4 / 5.0 / CME)</span>
              </li>
            </ul>
          </div>

          {/* Col 4: Institutional Security */}
          <div>
            <h4 className="text-white font-bold mb-4 uppercase tracking-wider text-[11px]">
              {language === 'en' ? 'Security & Custody' : 'Seguridad y Custodia'}
            </h4>
            <div className="space-y-3">
              <div className="flex items-start gap-2.5 bg-white/[0.02] p-3 rounded-xl border border-white/5">
                <Shield className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                <div>
                  <div className="text-white font-bold text-[11px]">
                    {language === 'en' ? 'Strict Non-Custodial' : 'No Custodial Estricto'}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    {language === 'en' ? 'Zero withdrawal keys accepted by mathematical contract.' : 'Cero claves de retiro aceptadas por contrato.'}
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-2.5 bg-white/[0.02] p-3 rounded-xl border border-white/5">
                <Lock className="w-4 h-4 text-[#F472B6] mt-0.5 shrink-0" />
                <div>
                  <div className="text-white font-bold text-[11px]">
                    {language === 'en' ? 'AES-256 Memory Vault' : 'Bóveda en Memoria AES-256'}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    {language === 'en' ? 'Zero server persistence of trading credentials.' : 'Cero persistencia de claves de trading en servidores.'}
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Legal Disclaimer & Copyright */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-slate-300 text-[11px]">
          <div>
            © {new Date().getFullYear()} GLOBAL CITY. {language === 'en' ? 'Institutional High-Performance Trading Architecture. All rights reserved.' : 'Arquitectura Institucional de Alto Rendimiento. Todos los derechos reservados.'}
          </div>
          <div className="max-w-xl text-center md:text-right">
            {t.footer.disclaimer}
          </div>
        </div>

      </div>
    </footer>
  );
};
