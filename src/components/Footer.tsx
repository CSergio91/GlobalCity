import React from 'react';
import { 
  ShieldCheck, 
  Lock, 
  KeyRound, 
  Layers, 
  Cpu, 
  Zap, 
  Globe, 
  AlertTriangle 
} from 'lucide-react';
import { BrandLogo } from './BrandLogo';
import { useLanguage } from '../context/LanguageContext';

export const Footer: React.FC = () => {
  const { t, language } = useLanguage();

  const connectorSpecs = [
    {
      icon: Layers,
      title: language === 'en' ? '+20 Connected CEX & DEX Venues' : '+20 CEX & DEX Conectados',
      sub: language === 'en' ? 'Deep aggregated orderbooks & synthetic spreads' : 'Libros agregados y liquidez cruzada',
      badge: 'Aggregated',
      color: 'text-amber-400'
    },
    {
      icon: Cpu,
      title: language === 'en' ? '+8 DMA & Prop-Firm Gateways' : '+8 Pasarelas DMA & Prop-Firm',
      sub: language === 'en' ? 'MetaTrader 5 Windows Server & cTrader Open API' : 'MetaTrader 5 Windows & cTrader Open API',
      badge: 'DMA / STP',
      color: 'text-[#F472B6]'
    },
    {
      icon: Zap,
      title: language === 'en' ? '+15 Direct FIX 4.4 / 5.0 Endpoints' : '+15 Endpoints FIX 4.4 / 5.0 Directos',
      sub: language === 'en' ? 'Sub-1.2ms ultra-low latency execution channel' : 'Canal ultra-baja latencia sub-1.2ms',
      badge: 'Sub-1.2ms',
      color: 'text-cyan-400'
    },
    {
      icon: Globe,
      title: language === 'en' ? '+4 High-Speed L2 Networks & Bridges' : '+4 Redes L2 de Alta Velocidad & Bridges',
      sub: language === 'en' ? 'Atomic synthetic arbitrage routing' : 'Enrutamiento atómico de arbitraje sintético',
      badge: 'L2 Routing',
      color: 'text-emerald-400'
    }
  ];

  return (
    <footer className="bg-[#05060A] border-t border-white/[0.08] pt-16 pb-12 text-slate-400 text-xs">
      <div className="w-full px-4 sm:px-8 lg:px-12 max-w-7xl mx-auto space-y-12">
        
        {/* Main 4-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-10 border-b border-white/[0.08]">
          
          {/* Col 1: Brand Info (Enlarged clean logo, no circles, removed websocket line) */}
          <div className="space-y-4">
            <BrandLogo size="md" />
            <p className="text-slate-400 text-xs leading-relaxed">
              {t.footer.brandDesc}
            </p>
          </div>

          {/* Col 2: Capacities & Modules */}
          <div>
            <h4 className="text-white font-bold mb-4 uppercase tracking-wider text-[11px] font-mono flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-[#FBBF24] via-[#F472B6] to-[#60A5FA]" />
              <span>{language === 'en' ? 'Capabilities' : 'Capacidades'}</span>
            </h4>
            <ul className="space-y-2.5">
              <li><a href="#multi-venue" className="hover:text-white transition-colors">{language === 'en' ? 'Multi-Venue Portfolio' : 'Portafolio Multi-Exchange'}</a></li>
              <li><a href="#arbitrage" className="hover:text-white transition-colors">{language === 'en' ? 'Cross-Venue Arbitrage L2' : 'Arbitraje Cross-Venue L2'}</a></li>
              <li><a href="#telegram" className="hover:text-white transition-colors">{language === 'en' ? 'Telegram Bot Ops' : 'Telegram Bot Ops'}</a></li>
              <li><a href="#rebalance" className="hover:text-white transition-colors">{language === 'en' ? 'Synthetic Rebalancing' : 'Rebalanceo Asistido'}</a></li>
              <li><a href="#copy-trading" className="hover:text-white transition-colors">{language === 'en' ? 'Cross Copy Trading' : 'Copy Trading Cruzado'}</a></li>
            </ul>
          </div>

          {/* Col 3: Conectores & Capacidad de Conexión (Quantities + System Icons, NO individual exchange names) */}
          <div>
            <h4 className="text-white font-bold mb-4 uppercase tracking-wider text-[11px] font-mono flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-[#FBBF24] via-[#F472B6] to-[#60A5FA]" />
              <span>{t.footer.connectorsTitle}</span>
            </h4>
            <div className="space-y-2.5">
              {connectorSpecs.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <div 
                    key={idx}
                    className="p-2.5 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.06] transition-all group"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <Icon className={`w-3.5 h-3.5 ${item.color} shrink-0`} />
                        <span className="text-white font-semibold text-[11px] tracking-wide">
                          {item.title}
                        </span>
                      </div>
                      <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-white/[0.06] text-slate-300">
                        {item.badge}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 pl-5.5 leading-snug">
                      {item.sub}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Col 4: Institutional Security & Custody (Audited & Fortified) */}
          <div>
            <h4 className="text-white font-bold mb-4 uppercase tracking-wider text-[11px] font-mono flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-[#FBBF24] via-[#F472B6] to-[#60A5FA]" />
              <span>{t.footer.securityTitle}</span>
            </h4>
            <div className="space-y-2.5">
              {/* Feature 1: Non-Custodial */}
              <div className="p-2.5 rounded-xl bg-emerald-500/[0.03] border border-emerald-500/20">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-[11px] mb-1">
                  <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                  <span>{language === 'en' ? '100% Non-Custodial Protocol' : 'Protocolo 100% No Custodial'}</span>
                </div>
                <p className="text-[10px] text-slate-400 leading-snug">
                  {language === 'en' 
                    ? 'Zero withdrawal permissions accepted. User funds remain securely hosted on your own exchange and broker accounts.' 
                    : 'Cero permisos de retiro aceptados. Tus fondos permanecen bajo tu custodia directa en tus propios exchanges y brokers.'}
                </p>
              </div>

              {/* Feature 2: Hardware KMS & AES-256 */}
              <div className="p-2.5 rounded-xl bg-pink-500/[0.03] border border-pink-500/20">
                <div className="flex items-center gap-2 text-[#F472B6] font-bold text-[11px] mb-1">
                  <Lock className="w-3.5 h-3.5 shrink-0" />
                  <span>{language === 'en' ? 'Hardware KMS & Volatile Memory' : 'Cifrado Hardware KMS / AES-256'}</span>
                </div>
                <p className="text-[10px] text-slate-400 leading-snug">
                  {language === 'en' 
                    ? 'API credentials are encrypted in-memory and isolated in secure hardware enclaves with zero public database exposure.' 
                    : 'Credenciales API cifradas en memoria volátil y aisladas en enclaves seguros sin persistencia en servidores públicos.'}
                </p>
              </div>

              {/* Feature 3: IP Whitelist & 2FA */}
              <div className="p-2.5 rounded-xl bg-cyan-500/[0.03] border border-cyan-500/20">
                <div className="flex items-center gap-2 text-cyan-400 font-bold text-[11px] mb-1">
                  <KeyRound className="w-3.5 h-3.5 shrink-0" />
                  <span>{language === 'en' ? 'Dedicated IP Whitelisting & 2FA' : 'IP Whitelisting & 2FA Biométrico'}</span>
                </div>
                <p className="text-[10px] text-slate-400 leading-snug">
                  {language === 'en' 
                    ? 'Cryptographic execution restricted to dedicated gateway IPs and verified Telegram biometric sessions.' 
                    : 'Firmado de órdenes restringido por IPs fijas autorizadas y validación biométrica mediante Telegram.'}
                </p>
              </div>
            </div>
          </div>

        </div>

        {/* High-Risk Operational Disclaimer (Comprehensive legal protection in active language) */}
        <div className="p-4 sm:p-5 rounded-2xl bg-amber-500/[0.04] border border-amber-500/20 space-y-2">
          <div className="flex items-center gap-2 text-amber-300 font-bold text-xs tracking-wide uppercase font-mono">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>{t.footer.riskTitle}</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed text-justify">
            {t.footer.riskDisclaimerFull}
          </p>
        </div>

        {/* Legal Disclaimer & Copyright */}
        <div className="pt-2 flex flex-col md:flex-row items-center justify-between gap-4 text-slate-300 text-[11px]">
          <div>
            © {new Date().getFullYear()} GLOBAL CITY. {language === 'en' ? 'Institutional High-Performance Trading Architecture. All rights reserved.' : 'Arquitectura Institucional de Alto Rendimiento. Todos los derechos reservados.'}
          </div>
          <div className="max-w-xl text-center md:text-right text-[10px] text-slate-300">
            {t.footer.disclaimer}
          </div>
        </div>

      </div>
    </footer>
  );
};
