import React from 'react';
import { Shield, Lock, FileText, CheckCircle2, Bot, Layers, Terminal } from 'lucide-react';
import { BrandLogo } from './BrandLogo';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#050608] border-t border-white/[0.08] pt-16 pb-12 text-slate-400 text-xs">
      <div className="w-full px-4 sm:px-8 lg:px-12 max-w-7xl mx-auto">
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-white/[0.06]">
          
          {/* Col 1: Brand Info */}
          <div className="space-y-4">
            <BrandLogo size="md" subtitle="GLOBAL TRADING HUB" />
            <p className="text-slate-400 text-xs leading-relaxed">
              El conector maestro y terminal unificado inspirado en la comunidad de Trading City para operar concurrentemente exchanges de criptomonedas, brokers de forex/CFDs en cTrader y MetaTrader 5, y pasarelas de futuros regulados.
            </p>
            <div className="flex items-center gap-2 text-[11px] text-[#2DD4BF]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#2DD4BF] animate-pulse" />
              <span>Conexiones WebSockets & FIX Operativas (99.99% Uptime)</span>
            </div>
          </div>

          {/* Col 2: Capacidades del Terminal */}
          <div>
            <h4 className="text-white font-bold mb-4 uppercase tracking-wider text-[11px]">Capacidades</h4>
            <ul className="space-y-2.5">
              <li><a href="#multi-venue" className="hover:text-white transition-colors">Portafolio Multi-Exchange</a></li>
              <li><a href="#arbitrage" className="hover:text-white transition-colors">Arbitraje Sintético L2</a></li>
              <li><a href="#horizontal-showcase" className="hover:text-white transition-colors">Telegram Bot Ops</a></li>
              <li><a href="#rebalance" className="hover:text-white transition-colors">Rebalanceo Asistido</a></li>
              <li><a href="#copy-trading" className="hover:text-white transition-colors">Copy Trading Cruzado</a></li>
              <li><a href="#calculator" className="hover:text-white transition-colors">Calculadora VWAP</a></li>
            </ul>
          </div>

          {/* Col 3: Conectividad y Protocolos */}
          <div>
            <h4 className="text-white font-bold mb-4 uppercase tracking-wider text-[11px]">Conectores Integrados</h4>
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
              <li className="flex items-center gap-1.5">
                <span className="w-1 h-1 rounded-full bg-[#2DD4BF]" />
                <span>Hyperliquid L1 Protocol</span>
              </li>
            </ul>
          </div>

          {/* Col 4: Seguridad y Cero Custodia */}
          <div>
            <h4 className="text-white font-bold mb-4 uppercase tracking-wider text-[11px]">Seguridad No Custodial</h4>
            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <Lock className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span className="text-[11px]">Permisos exclusivos <strong className="text-white">Read & Trade</strong>; prohibidos de forma inmutable los permisos de retiro.</span>
              </div>
              <div className="flex items-start gap-2">
                <Shield className="w-4 h-4 text-[#2DD4BF] shrink-0 mt-0.5" />
                <span className="text-[11px]">Cifrado simétrico AES-256-GCM para llaves de trading en reposo y tránsito.</span>
              </div>
              <div className="flex items-start gap-2">
                <Bot className="w-4 h-4 text-[#E06D8A] shrink-0 mt-0.5" />
                <span className="text-[11px]">Autenticación 2FA biométrica para comandos remotos vía Telegram.</span>
              </div>
            </div>
          </div>

        </div>

        {/* Legal Disclaimer */}
        <div className="pt-8 text-[11px] text-slate-400 leading-relaxed border-b border-white/[0.06] pb-8">
          <p>
            <strong>Aviso de Software No Custodial:</strong> Global City es una plataforma de software y herramienta analítica de trading multi-cuenta. La plataforma no custodia fondos de clientes, no actúa como intermediario financiero ni recibe depósitos. Todas las órdenes y balances residen directamente en las cuentas personales de los usuarios en sus exchanges y brokers asociados. El trading con apalancamiento y derivados financieros conlleva un riesgo sustancial de pérdida.
          </p>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-400 text-[11px]">
          <div>
            © {new Date().getFullYear()} Global City Technologies. Todos los derechos reservados.
          </div>
          <div className="flex gap-6">
            <span className="hover:text-white cursor-pointer">Documentación API</span>
            <span className="hover:text-white cursor-pointer">Términos de Licencia</span>
            <span className="hover:text-white cursor-pointer">Seguridad de Claves</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
