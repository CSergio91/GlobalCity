import React, { useState } from 'react';
import { 
  Sparkles, 
  Send, 
  ChevronUp, 
  ChevronDown, 
  X,
  Command,
  CornerDownLeft
} from 'lucide-react';
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
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [inputVal, setInputVal] = useState<string>('');

  const quickActions = [
    { label: "Auditar Balance", tab: "overview", prompt: "Auditar balance" },
    { label: "Split EMS", tab: "multiorder", prompt: "Calcular split" },
    { label: "Arbitraje L2", tab: "arbitrage", prompt: "Escanear arbitraje" },
    { label: "Risk Engine", tab: "risk", prompt: "Auditar riesgo" },
  ];

  const handleAction = (tab: string, promptText: string) => {
    onOpenTab(tab);
    setInputVal(promptText);
  };

  return (
    <div className="fixed bottom-3 left-0 right-0 z-40 pointer-events-auto px-3 sm:px-6">
      <div className="max-w-2xl mx-auto">
        <div className="bg-[#0B0D14]/95 backdrop-blur-xl border border-white/10 hover:border-white/20 rounded-2xl shadow-2xl transition-all duration-200 overflow-hidden">
          
          {/* Main Floating Input Bar (Grok / Raycast Minimalist Style) */}
          <div className="p-2 sm:p-2.5 flex items-center gap-2">
            
            {/* AI Icon & Status Dot */}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1.5 rounded-xl bg-gradient-to-br from-[#EC4899]/20 to-[#38BDF8]/20 border border-[#EC4899]/30 text-[#F472B6] hover:scale-105 transition-all shrink-0 cursor-pointer flex items-center justify-center relative"
              title="Copiloto IA MCP"
            >
              <Sparkles className="w-4 h-4" />
              <span className={`absolute -bottom-0.5 -right-0.5 w-1.5 h-1.5 rounded-full ${
                wsConnected ? 'bg-emerald-400' : 'bg-amber-400'
              }`} />
            </button>

            {/* Input Field */}
            <div className="flex-1 relative flex items-center">
              <input 
                type="text"
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                onFocus={() => setIsExpanded(true)}
                placeholder="Pregunta o ejecuta con IA (ej. Auditar margen)..."
                className="w-full bg-transparent px-2 text-xs text-white placeholder:text-slate-500 focus:outline-none font-sans"
              />
            </div>

            {/* Quick Status Pill (Desktop only) */}
            <div className="hidden sm:flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-white/5 text-[10px] font-mono text-slate-400">
              <span>MCP Standby</span>
            </div>

            {/* Action / Send Button */}
            <button
              onClick={() => {
                if (inputVal.trim()) {
                  // Ready for MCP server integration
                }
              }}
              className="p-1.5 px-2.5 rounded-xl bg-gradient-to-r from-[#EC4899] to-[#06B6D4] hover:brightness-110 text-white font-bold text-xs flex items-center gap-1 cursor-pointer transition-all active:scale-95 shrink-0 shadow-sm"
              title="Enviar comando"
            >
              <Send className="w-3 h-3" />
              <span className="hidden sm:inline text-[11px]">Enviar</span>
            </button>

            {/* Toggle Expand / Collapse */}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1 text-slate-400 hover:text-white transition-colors cursor-pointer shrink-0"
              title={isExpanded ? "Minimizar" : "Expandir opciones"}
            >
              {isExpanded ? (
                <X className="w-3.5 h-3.5" />
              ) : (
                <ChevronUp className="w-3.5 h-3.5" />
              )}
            </button>

          </div>

          {/* Minimalist Quick Actions Ribbon (Visible when expanded or focused, NO text walls) */}
          {isExpanded && (
            <div className="px-2.5 pb-2.5 pt-1 border-t border-white/5 flex flex-wrap items-center justify-between gap-1.5 animate-in fade-in duration-150 text-[10px]">
              
              {/* Quick Pills */}
              <div className="flex flex-wrap items-center gap-1">
                {quickActions.map((qa, i) => (
                  <button
                    key={i}
                    onClick={() => handleAction(qa.tab, qa.prompt)}
                    className="px-2 py-0.5 rounded-lg bg-white/5 hover:bg-white/10 hover:border-white/20 border border-white/5 text-slate-300 hover:text-white transition-all cursor-pointer font-sans"
                  >
                    {qa.label}
                  </button>
                ))}
              </div>

              {/* Context Summary Micro-Tag */}
              <div className="text-[9px] font-mono text-slate-500 flex items-center gap-1.5 ml-auto">
                <span>{accounts.length} Cuentas</span>
                <span>·</span>
                <span>${totalEquity.toFixed(0)} USD</span>
              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  );
};
