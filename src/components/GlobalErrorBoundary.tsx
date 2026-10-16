import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Trash2 } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class GlobalErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[Eklipse GlobalErrorBoundary] Uncaught error caught by boundary:', error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleResetCache = () => {
    try {
      localStorage.removeItem('eklipse_cached_challenge_plans');
      localStorage.removeItem('eklipse_binance_symbols_cache');
    } catch (_) {}
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#06070B] text-white flex items-center justify-center p-6">
          <div className="max-w-md w-full p-8 rounded-3xl bg-[#090A10] border border-amber-500/30 shadow-[0_0_50px_rgba(245,158,11,0.15)] text-center space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400">
              <AlertTriangle className="w-8 h-8" />
            </div>
            
            <div className="space-y-2">
              <h2 className="text-xl font-black font-mono tracking-tight text-white">
                EKLIPSE OPERATING SYSTEM
              </h2>
              <p className="text-xs text-slate-400 leading-relaxed font-sans">
                Se detectó una discrepancia temporal en la memoria de renderizado. Puedes recargar la plataforma o restablecer el almacenamiento local.
              </p>
              {this.state.error?.message && (
                <div className="p-3 rounded-xl bg-black/50 border border-white/10 text-[11px] font-mono text-rose-300 text-left overflow-auto max-h-24">
                  {this.state.error.message}
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={this.handleReload}
                className="py-3 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-mono font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-transform active:scale-95 cursor-pointer shadow-lg shadow-amber-400/20"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Recargar</span>
              </button>

              <button
                type="button"
                onClick={this.handleResetCache}
                className="py-3 px-4 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 border border-white/10 font-mono font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-transform active:scale-95 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Limpiar Caché</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
