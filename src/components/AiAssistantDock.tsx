import React, { useState } from 'react';
import { 
  Sparkles, 
  ChevronUp, 
  ChevronDown, 
  Send, 
  Bot, 
  Cpu, 
  Terminal, 
  ShieldAlert, 
  CheckCircle2, 
  SlidersHorizontal,
  Paperclip,
  Mic,
  Maximize2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { StoredExchangeAccount } from '../types/exchange';

interface AiAssistantDockProps {
  accounts: StoredExchangeAccount[];
  totalEquity: number;
  wsConnected: boolean;
  onOpenTab: (tab: any) => void;
}

export const AiAssistantDock: React.FC<AiAssistantDockProps> = ({
  accounts,
  totalEquity,
  wsConnected,
  onOpenTab
}) => {
  const { user } = useAuth();
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const [inputMessage, setInputMessage] = useState<string>('');

  // Sample quick prompt prompts
  const quickPrompts = [
    { label: "Auditar liquidez", tab: "overview", prompt: "¿Cuál es la equidad consolidada y margen libre actual?" },
    { label: "Calcular split EMS", tab: "multiorder", prompt: "Calcula un split eficiente para 1.5 BTC entre los libros de órdenes." },
    { label: "Escanear arbitraje L2", tab: "arbitrage", prompt: "Verifica spreads netos entre Binance y Bybit deduciendo fees taker." },
    { label: "Checklist Roadmap", tab: "overview", prompt: "¿Cuál es el siguiente módulo del checklist a implementar?" }
  ];

  const handlePromptClick = (tab: string, text: string) => {
    onOpenTab(tab);
    setInputMessage(text);
    setIsExpanded(true);
  };

  const showExpanded = isExpanded || isHovered;

  return (
    <div 
      className="fixed bottom-0 left-0 right-0 z-50 pointer-events-auto transition-all duration-300 ease-out"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Background blur container with top border glow */}
      <div className={`mx-auto max-w-5xl transition-all duration-300 ${
        showExpanded ? 'px-3 sm:px-6' : 'px-4 sm:px-8'
      }`}>
        <div className={`bg-[#0A0B10]/95 backdrop-blur-2xl border border-white/10 rounded-t-3xl shadow-2xl transition-all duration-300 overflow-hidden ${
          showExpanded ? 'border-t-[#EC4899]/40 shadow-[0_-10px_35px_rgba(236,72,153,0.15)]' : 'border-t-white/15'
        }`}>
          
          {/* Collapsed Ribbon (Always visible or compact) */}
          <div 
            onClick={() => setIsExpanded(!isExpanded)}
            className="px-4 py-2.5 flex items-center justify-between cursor-pointer select-none bg-gradient-to-r from-white/[0.02] via-[#EC4899]/5 to-white/[0.02] hover:bg-white/[0.04] transition-colors"
          >
            {/* Left: Agent Identity */}
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-[#EC4899] to-[#06B6D4] flex items-center justify-center text-white shadow-md shadow-[#EC4899]/25">
                  <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 border border-[#0A0B10]" />
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white tracking-wide">
                  GlobalCity Quant AI
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-white/5 border border-white/10 text-slate-300 hidden sm:inline-block">
                  MCP Protocol v1.0
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  Standby
                </span>
              </div>
            </div>

            {/* Center: Quick Action Chips (Hidden when expanded or on tiny screens) */}
            {!showExpanded && (
              <div className="hidden md:flex items-center gap-1.5">
                {quickPrompts.slice(0, 3).map((p, i) => (
                  <button
                    key={i}
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePromptClick(p.tab, p.prompt);
                    }}
                    className="px-2 py-0.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/15 text-[10px] text-slate-300 hover:text-white transition-all cursor-pointer font-sans"
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            )}

            {/* Right: Expand/Collapse Icon */}
            <div className="flex items-center gap-2 text-slate-400 text-xs">
              <span className="text-[10px] font-mono hidden sm:inline">
                {showExpanded ? 'Minimizar' : 'Hover / Clic para Abrir'}
              </span>
              {showExpanded ? (
                <ChevronDown className="w-4 h-4 text-slate-300" />
              ) : (
                <ChevronUp className="w-4 h-4 text-slate-300" />
              )}
            </div>
          </div>

          {/* Expanded Chat Drawer */}
          {showExpanded && (
            <div className="p-4 sm:p-5 border-t border-white/5 bg-[#07080D]/90 max-h-[420px] flex flex-col space-y-3.5 animate-in fade-in duration-200">
              
              {/* Context Meta Pills */}
              <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-white/5 text-[11px] font-mono text-slate-400">
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1">
                    <Terminal className="w-3 h-3 text-[#EC4899]" />
                    Contexto Activo:
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-white/5 text-slate-200">
                    28 Venues CCXT
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-white/5 text-slate-200">
                    {accounts.length} Cuentas Conectadas
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-white/5 text-emerald-400">
                    ${totalEquity.toFixed(2)} USD
                  </span>
                </div>

                <div className="flex items-center gap-1.5 text-[10px]">
                  <span className={`w-1.5 h-1.5 rounded-full ${wsConnected ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                  <span>WS Feed: {wsConnected ? 'Sincronizado' : 'Inactivo'}</span>
                </div>
              </div>

              {/* Chat Thread Area */}
              <div className="overflow-y-auto space-y-3 pr-1 text-xs max-h-[220px] font-sans">
                
                {/* Agent Welcome Bubble */}
                <div className="flex items-start gap-2.5">
                  <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-[#EC4899] to-[#06B6D4] flex items-center justify-center text-white shrink-0 shadow-md">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                  <div className="bg-[#12141F] border border-white/10 rounded-2xl rounded-tl-sm p-3.5 max-w-2xl text-slate-200 space-y-2">
                    <div className="font-semibold text-white flex items-center gap-2">
                      <span>GlobalCity Quant Copilot</span>
                      <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-[#EC4899]/15 text-[#F472B6]">
                        MODEL CONTEXT PROTOCOL
                      </span>
                    </div>
                    <p className="text-[11px] leading-relaxed text-slate-300">
                      Hola {user?.firstName || 'Trader'}. Estoy conectado a tu espacio de trabajo. Actualmente tienes{' '}
                      <strong className="text-white font-mono">{accounts.length} cuentas vinculadas</strong> en LocalStorage.
                      Cuando vincules tus exchanges, podré calcular fragmentaciones de órdenes (EMS), auditar divergencias de arbitraje L2 y monitorear tu margen consolidado.
                    </p>
                    <div className="pt-1 flex flex-wrap gap-1.5">
                      {quickPrompts.map((p, idx) => (
                        <button
                          key={idx}
                          onClick={() => handlePromptClick(p.tab, p.prompt)}
                          className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-[10px] text-slate-300 hover:text-white transition-all cursor-pointer font-sans"
                        >
                          {p.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {inputMessage && (
                  <div className="flex items-start gap-2.5 justify-end">
                    <div className="bg-gradient-to-r from-[#EC4899]/20 to-[#38BDF8]/20 border border-[#EC4899]/30 rounded-2xl rounded-tr-sm p-3 max-w-xl text-slate-100 text-[11px]">
                      {inputMessage}
                    </div>
                  </div>
                )}
              </div>

              {/* Input Area (Prepared for MCP Server / Backend Integration) */}
              <div className="pt-2">
                <div className="relative flex items-center bg-[#0D0F17] border border-white/10 rounded-2xl p-1.5 focus-within:border-[#EC4899]/60 transition-colors">
                  <div className="flex items-center gap-1 pl-2 text-slate-500">
                    <button 
                      type="button" 
                      title="Adjuntar contexto" 
                      className="p-1 rounded-lg hover:text-slate-300 transition-colors cursor-pointer"
                    >
                      <Paperclip className="w-3.5 h-3.5" />
                    </button>
                    <button 
                      type="button" 
                      title="Dictado por voz" 
                      className="p-1 rounded-lg hover:text-slate-300 transition-colors cursor-pointer"
                    >
                      <Mic className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <input 
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder="Haz una consulta a la IA (ej. ¿Cómo configuro mi API de Bybit? o Audita la latencia)..."
                    className="w-full bg-transparent px-3 py-1.5 text-xs text-white placeholder:text-slate-500 focus:outline-none"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && inputMessage.trim()) {
                        // Keep input, show standby notice
                      }
                    }}
                  />

                  <button
                    type="button"
                    onClick={() => {
                      if (inputMessage.trim()) {
                        // Placeholder
                      }
                    }}
                    className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#EC4899] to-[#06B6D4] hover:brightness-110 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-all active:scale-95 shadow-md shadow-[#EC4899]/20"
                  >
                    <Send className="w-3 h-3" />
                    <span className="hidden sm:inline">Enviar</span>
                  </button>
                </div>

                <div className="flex items-center justify-between text-[10px] text-slate-500 px-2 pt-1 font-mono">
                  <span>Modo Standby · MCP Server Gateway preparado para inferencia local / remota</span>
                  <span>Esc para minimizar</span>
                </div>
              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  );
};
