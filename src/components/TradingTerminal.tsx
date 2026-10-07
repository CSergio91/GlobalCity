import React, { useState, useEffect, useRef, useCallback } from 'react';
import { init, dispose, Chart, DeepPartial, Styles } from 'klinecharts';
import { Language } from '../i18n/translations';
import { supabase, UserSession, PropFirmAccount, fetchTraderAccounts } from '../lib/supabase';
import { MarketStats, OrderBookPayload } from '../workers/marketData.worker';
import { MarketType, AdapterConnectionStatus } from '../core/market-feed/types';

import { 
  DEFAULT_FAV_TIMEFRAMES, 
  DEFAULT_FAV_INDICATORS, 
  ALL_INDICATORS,
  ClosedTradeItem,
  sortTimeframes
} from './terminal/types';
import { 
  TradingEngine, 
  RiskEngine,
  DEFAULT_PROP_FIRM_RULES,
  PropFirmRuleConfig,
  PositionItem, 
  LimitOrderItem,
  OrderRequest, 
  AccountMetrics,
  generateTradeId,
  TradePersistenceService,
  zytiTradingClient
} from '../core/trading';
import { TerminalHeader } from './terminal/TerminalHeader';
import { TerminalToolbar } from './terminal/TerminalToolbar';
import { TerminalSideNav } from './terminal/TerminalSideNav';
import { TerminalOrderBook } from './terminal/TerminalOrderBook';
import { TerminalOrderForm } from './terminal/TerminalOrderForm';
import { TerminalPositions } from './terminal/TerminalPositions';
import { TerminalMobileSheet } from './terminal/TerminalMobileSheet';
import { TerminalExchangeModal } from './terminal/TerminalExchangeModal';
import { PositionChartOverlay } from './terminal/PositionChartOverlay';
import { CandleInfoModal } from './terminal/CandleInfoModal';
import { TerminalToast, ToastNotification } from './terminal/TerminalToast';
import { KLineBar } from '../core/market-feed/types';
import { playOrderFilledSound } from '../utils/audioAlerts';
import { SlidersHorizontal, X, AlertTriangle, RotateCcw, PenTool, Trash2 } from 'lucide-react';
import { ZYTI_CHART_THEME, applyIndicatorsToChart } from './terminal/chartTheme';
import { QuickTradeButtons } from './terminal/QuickTradeButtons';
import { DrawdownBreachBanner } from './terminal/DrawdownBreachBanner';
import { ChartContextMenu } from './terminal/ChartContextMenu';
import { MobileRadialDrawingDial } from './terminal/MobileRadialDrawingDial';
import { registerCustomChartOverlays } from './terminal/drawingTools';
import { ChartTimezoneSelector } from './terminal/ChartTimezoneSelector';

interface TradingTerminalProps {
  currentLang: Language;
  user: UserSession | null;
  initialSymbol?: string;
  onExit: () => void;
  onOpenAuth?: () => void;
  onLanguageChange?: (lang: Language) => void;
  onUpdateUser?: (updated: UserSession) => void;
  onPairChange?: (pair: string) => void;
}

const SUPPORTED_PAIRS = ['BTC/USDT', 'ETH/USDT', 'SOL/USDT', 'BNB/USDT', 'XRP/USDT'];

// Generador de ID robusto compatible con HTTP en móviles y túneles locales
const generateId = (): string => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    try {
      return crypto.randomUUID();
    } catch {}
  }
  return 'pos_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 9);
};

const getStoredDailyStartEquity = (currentBalance: number): number => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const saved = localStorage.getItem('zyti_daily_start_equity');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.date === today && typeof parsed.equity === 'number' && parsed.equity > 0) {
        if (parsed.equity < 50000 && currentBalance >= 100000) {
          localStorage.setItem('zyti_daily_start_equity', JSON.stringify({ date: today, equity: currentBalance }));
          return currentBalance;
        }
        return parsed.equity;
      }
    }
    localStorage.setItem('zyti_daily_start_equity', JSON.stringify({ date: today, equity: currentBalance }));
    return currentBalance;
  } catch {
    return currentBalance;
  }
};

const getPairLeverageKey = (pair: string, userId?: string): string => {
  const cleanPair = (pair || 'BTC/USDT').replace('/', '_').toUpperCase();
  return userId ? `zyti_leverage_${userId}_${cleanPair}` : `zyti_leverage_${cleanPair}`;
};

const getStoredPairLeverage = (pair: string, userId?: string): number => {
  try {
    const userKey = getPairLeverageKey(pair, userId);
    const globalKey = getPairLeverageKey(pair);
    const saved = localStorage.getItem(userKey) || localStorage.getItem(globalKey);
    if (saved) {
      const val = parseInt(saved, 10);
      if (!isNaN(val) && val >= 1 && val <= 100) {
        return val;
      }
    }
  } catch {}
  return 10;
};

export const TradingTerminal: React.FC<TradingTerminalProps> = ({
  currentLang,
  user,
  initialSymbol,
  onExit,
  onOpenAuth,
  onLanguageChange,
  onUpdateUser,
  onPairChange
}) => {
  const isEs = currentLang === 'es';
  const normalizePair = (sym?: string): string => {
    if (!sym) return 'BTC/USDT';
    const clean = sym.replace('/', '').toUpperCase();
    const found = SUPPORTED_PAIRS.find(p => p.replace('/', '').toUpperCase() === clean);
    return found || 'BTC/USDT';
  };

  const [selectedPair, setSelectedPair] = useState(() => {
    try {
      const saved = localStorage.getItem('zyti_selected_pair');
      if (saved) return normalizePair(saved);
    } catch {}
    return normalizePair(initialSymbol);
  });
  const selectedPairRef = useRef<string>(selectedPair);
  selectedPairRef.current = selectedPair;

  const [currentExchange, setCurrentExchange] = useState<string>(() => {
    try {
      return localStorage.getItem('zyti_exchange') || 'binance';
    } catch {
      return 'binance';
    }
  });
  const [currentMarketType, setCurrentMarketType] = useState<MarketType>(() => {
    try {
      return (localStorage.getItem('zyti_market_type') as MarketType) || 'futures';
    } catch {
      return 'futures';
    }
  });
  const [connectionStatus, setConnectionStatus] = useState<AdapterConnectionStatus>('CONNECTING');
  const [selectedCandle, setSelectedCandle] = useState<KLineBar | null>(null);
  const [timeframe, setTimeframe] = useState<string>(() => {
    try {
      return localStorage.getItem('zyti_selected_timeframe') || '15m';
    } catch {
      return '15m';
    }
  });
  const [activeIndicators, setActiveIndicators] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('zyti_active_indicators');
      if (saved !== null) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {}
    return ['MA', 'VOL'];
  });
  const activeIndicatorsRef = useRef<string[]>(activeIndicators);
  activeIndicatorsRef.current = activeIndicators;
  const [orderType, setOrderType] = useState<'market' | 'limit'>('market');
  const [side, setSide] = useState<'buy' | 'sell'>('buy');
  const [amount, setAmount] = useState('1000');
  // Apalancamiento con persistencia por usuario y por par en localStorage
  const [leverage, setLeverage] = useState<number>(() => {
    return getStoredPairLeverage(normalizePair(initialSymbol), user?.id);
  });
  const handleSetLeverage = useCallback((newLev: number) => {
    setLeverage(newLev);
    try {
      const pair = selectedPairRef.current;
      const cleanPair = pair.replace('/', '_').toUpperCase();
      if (user?.id) {
        localStorage.setItem(`zyti_leverage_${user.id}_${cleanPair}`, String(newLev));
      }
      localStorage.setItem(`zyti_leverage_${cleanPair}`, String(newLev));
    } catch {}
  }, [user?.id]);

  // Persistencia de visibilidad de la orden previa proyectada en el gráfico
  const [showChartOrderPreview, setShowChartOrderPreview] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('zyti_show_chart_order_preview');
      return saved !== null ? JSON.parse(saved) : true;
    } catch {
      return true;
    }
  });

  const handleToggleChartOrderPreview = useCallback(() => {
    setShowChartOrderPreview((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('zyti_show_chart_order_preview', JSON.stringify(next));
      } catch {}
      return next;
    });
  }, []);

  const [orderSuccess, setOrderSuccess] = useState<string | null>(null);

  // Huso horario del gráfico (America/New_York por defecto para trading institucional)
  const [chartTimezone, setChartTimezone] = useState<string>(() => {
    try {
      return localStorage.getItem('zyti_chart_timezone') || 'America/New_York';
    } catch {
      return 'America/New_York';
    }
  });

  const handleSelectTimezone = useCallback((tz: string) => {
    setChartTimezone(tz);
    try {
      localStorage.setItem('zyti_chart_timezone', tz);
    } catch {}
    if (chartInstanceRef.current) {
      if (tz === 'LOCAL') {
        chartInstanceRef.current.setTimezone(Intl.DateTimeFormat().resolvedOptions().timeZone);
      } else {
        chartInstanceRef.current.setTimezone(tz);
      }
    }
  }, []);

  // Navegación lateral en escritorio y drawer en móvil
  const [navPosition, setNavPosition] = useState<'left' | 'right'>(() => {
    try {
      return (localStorage.getItem('zyti_nav_position') as 'left' | 'right') || 'left';
    } catch {
      return 'left';
    }
  });
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<'none' | 'exchange'>('none');

  // Hoja activa en móvil: null (cerrada) o 'order' | 'book' | 'positions' | 'history' | 'profile'
  const [mobileSheet, setMobileSheet] = useState<'order' | 'book' | 'positions' | 'history' | 'profile' | null>(null);

  // Favoritos de temporalidades e indicadores con persistencia
  const [favoriteTimeframes, setFavoriteTimeframes] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('zyti_fav_timeframes');
      return sortTimeframes(saved ? JSON.parse(saved) : DEFAULT_FAV_TIMEFRAMES);
    } catch {
      return sortTimeframes(DEFAULT_FAV_TIMEFRAMES);
    }
  });

  const [favoriteIndicators, setFavoriteIndicators] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('zyti_fav_indicators');
      return saved ? JSON.parse(saved) : DEFAULT_FAV_INDICATORS;
    } catch {
      return DEFAULT_FAV_INDICATORS;
    }
  });

  // Botones flotantes de 1 toque (quick trade) para móviles
  const [quickTradeEnabled, setQuickTradeEnabled] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('zyti_quick_trade');
      return saved !== null ? JSON.parse(saved) : true;
    } catch {
      return true;
    }
  });

  const toggleQuickTrade = () => {
    setQuickTradeEnabled((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('zyti_quick_trade', JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  // Herramientas de dibujo en KLineChart (Línea Horizontal, Tendencia, Cuadros, Fibonacci)
  const [activeDrawingTool, setActiveDrawingTool] = useState<string | null>(null);
  const [selectedOverlayId, setSelectedOverlayId] = useState<string | null>(null);
  const [isRadialDialOpen, setIsRadialDialOpen] = useState<boolean>(false);
  const [radialDialPos, setRadialDialPos] = useState<{ x: number; y: number } | null>(null);
  const activeDrawingToolRef = useRef<string | null>(null);
  activeDrawingToolRef.current = activeDrawingTool;
  const isRadialDialOpenRef = useRef<boolean>(false);
  isRadialDialOpenRef.current = isRadialDialOpen;
  const lastTickServerSendRef = useRef<Map<string, number>>(new Map());

  // ─── Persistencia de trazos en localStorage ────────────────────────────
  const DRAWINGS_KEY = (pair: string) => `zyti_drawings_${pair}`;

  const saveDrawings = useCallback((pair: string) => {
    const chart = chartInstanceRef.current;
    if (!chart) return;
    try {
      const store = (chart as any)._chartStore?.getOverlayStore?.();
      if (!store) return;
      const instances: any[] = store.getInstances() ?? [];
      const serialized = instances
        .filter((o: any) => o.name && Array.isArray(o.points) && o.points.length > 0 && !o.isDrawing?.())
        .map((o: any) => ({ name: o.name, points: o.points, paneId: o.paneId ?? 'candle_pane' }));
      localStorage.setItem(DRAWINGS_KEY(pair), JSON.stringify(serialized));
    } catch { /* silencioso */ }
  }, []);

  const restoreDrawings = useCallback((pair: string) => {
    const chart = chartInstanceRef.current;
    if (!chart) return;
    try {
      const raw = localStorage.getItem(DRAWINGS_KEY(pair));
      if (!raw) return;
      const drawings: { name: string; points: any[]; paneId: string }[] = JSON.parse(raw);
      drawings.forEach(({ name, points, paneId }) => {
        try {
          (chart as any).createOverlay({ name, points, paneId });
        } catch { /* overlay desconocido, ignorar */ }
      });
    } catch { /* JSON corrupto, ignorar */ }
  }, []);
  // ────────────────────────────────────────────────────────────────────────

  const handleSelectDrawingTool = useCallback((overlayName: string) => {
    setActiveDrawingTool(overlayName);
    if (chartInstanceRef.current) {
      try {
        (chartInstanceRef.current as any).createOverlay({
          name: overlayName,
          onDrawEnd: () => {
            setActiveDrawingTool(null);
            // Guardar todos los trazos al terminar cada dibujo
            saveDrawings(selectedPairRef.current);
            return true;
          },
          onSelected: (event: any) => {
            if (event?.overlay?.id) {
              setSelectedOverlayId(event.overlay.id);
            }
            return true;
          },
          onDeselected: () => {
            setSelectedOverlayId(null);
            return true;
          },
          onRemoved: () => {
            setSelectedOverlayId(null);
            // Guardar estado actualizado tras eliminar
            setTimeout(() => saveDrawings(selectedPairRef.current), 50);
            return true;
          }
        });
      } catch (err) {
        console.warn('[ZYTI Trade] Error al crear overlay de dibujo:', err);
      }
    }
  }, [saveDrawings]);

  const handleCancelDrawing = useCallback(() => {
    setActiveDrawingTool(null);
  }, []);

  const handleDeleteSelectedOverlay = useCallback(() => {
    if (selectedOverlayId && chartInstanceRef.current) {
      try {
        (chartInstanceRef.current as any).removeOverlay(selectedOverlayId);
      } catch (err) {
        console.warn('[ZYTI Trade] Error al eliminar overlay seleccionado:', err);
      }
      setSelectedOverlayId(null);
      setTimeout(() => saveDrawings(selectedPairRef.current), 50);
    }
  }, [selectedOverlayId, saveDrawings]);

  const handleClearAllDrawings = useCallback(() => {
    setActiveDrawingTool(null);
    setSelectedOverlayId(null);
    if (chartInstanceRef.current) {
      try {
        (chartInstanceRef.current as any).removeOverlay();
      } catch (err) {
        console.warn('[ZYTI Trade] Error al limpiar overlays:', err);
      }
    }
    // Borrar también de localStorage
    try { localStorage.removeItem(DRAWINGS_KEY(selectedPairRef.current)); } catch { /* noop */ }
  }, []);

  // Eliminar trazo seleccionado con la tecla Suprimir / Backspace
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedOverlayId) {
        const activeTag = (document.activeElement?.tagName || '').toUpperCase();
        if (['INPUT', 'TEXTAREA'].includes(activeTag)) return;
        handleDeleteSelectedOverlay();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedOverlayId, handleDeleteSelectedOverlay]);

  // Detección reactiva de escritorio (>= 1024px)
  const [isDesktop, setIsDesktop] = useState<boolean>(() => {
    return typeof window !== 'undefined' ? window.innerWidth >= 1024 : true;
  });

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Estadísticas del par desde el Worker
  const [stats, setStats] = useState<MarketStats>({
    symbol: 'BTC/USDT',
    lastPrice: 68450.0,
    change24h: 2.42,
    high24h: 69120.0,
    low24h: 66800.0,
    volume24h: 42890
  });

  // Order Book L2 en vivo emitido por el Worker
  const [orderBook, setOrderBook] = useState<OrderBookPayload>({
    bids: [],
    asks: []
  });

  // Cuentas de fondeo / Desafíos vinculados al trader
  const [traderAccounts, setTraderAccounts] = useState<PropFirmAccount[]>(() => user?.accounts || []);

  // Cuenta de fondeo oficial activa
  const [activeAccountId, setActiveAccountId] = useState<string | undefined>(() => {
    return user?.activeAccountId || user?.accounts?.[0]?.id || localStorage.getItem('zyti_active_account_id') || undefined;
  });

  // Posiciones abiertas con persistencia Local-First (0ms al recargar el navegador)
  const [positions, setPositions] = useState<PositionItem[]>(() => {
    try {
      const activeAccId = user?.activeAccountId || localStorage.getItem('zyti_active_account_id');
      const saved = activeAccId ? localStorage.getItem(`zyti_positions_${activeAccId}`) : localStorage.getItem('zyti_open_positions');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const positionsRef = useRef<PositionItem[]>(positions);
  positionsRef.current = positions;

  useEffect(() => {
    try {
      localStorage.setItem('zyti_open_positions', JSON.stringify(positions));
      if (activeAccountId) {
        localStorage.setItem(`zyti_positions_${activeAccountId}`, JSON.stringify(positions));
      }
    } catch {}
  }, [positions, activeAccountId]);

  // Órdenes Límites pendientes con persistencia en localStorage
  const [limitOrders, setLimitOrders] = useState<LimitOrderItem[]>(() => {
    try {
      const activeAccId = user?.activeAccountId || localStorage.getItem('zyti_active_account_id');
      const saved = activeAccId ? localStorage.getItem(`zyti_limit_orders_${activeAccId}`) : localStorage.getItem('zyti_limit_orders');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const limitOrdersRef = useRef<LimitOrderItem[]>(limitOrders);
  limitOrdersRef.current = limitOrders;

  useEffect(() => {
    try {
      localStorage.setItem('zyti_limit_orders', JSON.stringify(limitOrders));
      if (activeAccountId) {
        localStorage.setItem(`zyti_limit_orders_${activeAccountId}`, JSON.stringify(limitOrders));
      }
    } catch {}
  }, [limitOrders, activeAccountId]);

  // Precio límite configurado en el formulario
  const [limitPrice, setLimitPrice] = useState<string>('');
  const lastInitializedPairRef = useRef<string>('');

  useEffect(() => {
    if (stats.lastPrice > 0) {
      if (!limitPrice || lastInitializedPairRef.current !== selectedPair) {
        lastInitializedPairRef.current = selectedPair;
        setLimitPrice(stats.lastPrice.toString());
      }
    }
  }, [selectedPair, stats.lastPrice, limitPrice]);

  // Registro de IDs cerrados para evitar duplicación de eventos o toasts
  const closedPositionIdsRef = useRef<Set<string>>(new Set());

  // Registro de IDs de órdenes límites ejecutadas para evitar ejecuciones concurrentes por ticks
  const filledLimitOrderIdsRef = useRef<Set<string>>(new Set());

  // Seguro contra clics múltiples rápidos en colocación de órdenes
  const isSubmittingOrderRef = useRef<boolean>(false);

  // Asegurar resolución de la cuenta oficial del usuario autenticado y cargar todas sus cuentas
  useEffect(() => {
    if (user?.accounts && user.accounts.length > 0) {
      setTraderAccounts(user.accounts);
    }
    if (user?.activeAccountId) {
      setActiveAccountId(user.activeAccountId);
      try { localStorage.setItem('zyti_active_account_id', user.activeAccountId); } catch {}
    } else if (user?.accounts && user.accounts.length > 0) {
      setActiveAccountId(user.accounts[0].id);
      try { localStorage.setItem('zyti_active_account_id', user.accounts[0].id); } catch {}
    }
    
    const identifier = user?.id || user?.email;
    if (identifier) {
      fetchTraderAccounts(identifier).then((accs) => {
        if (accs && accs.length > 0) {
          setTraderAccounts(accs);
          if (!activeAccountId || !accs.some((a) => a.id === activeAccountId)) {
            setActiveAccountId(accs[0].id);
            try { localStorage.setItem('zyti_active_account_id', accs[0].id); } catch {}
          }
        }
      }).catch(() => {});
    }
  }, [user]);

  // Historial de operaciones cerradas con persistencia local y sincronización con Supabase
  const [tradeHistory, setTradeHistory] = useState<ClosedTradeItem[]>(() => {
    try {
      const saved = localStorage.getItem('zyti_trade_history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Trade enfocado para inspección y marcadores en el gráfico
  const [focusedTrade, setFocusedTrade] = useState<ClosedTradeItem | null>(null);
  const pendingTradeFocusRef = useRef<ClosedTradeItem | null>(null);

  // Reconciliar y cargar historial y posiciones abiertas desde Supabase (Cold Sync)
  useEffect(() => {
    const targetId = activeAccountId || user?.activeAccountId || user?.accounts?.[0]?.id;
    if (targetId || user?.id || user?.email) {
      // 1. Cargar historial de trades cerrados
      TradePersistenceService.fetchAccountTradesHistory(targetId, user?.id, user?.email).then((dbHistory) => {
        if (dbHistory && dbHistory.length > 0) {
          setTradeHistory(dbHistory);
          try { localStorage.setItem('zyti_trade_history', JSON.stringify(dbHistory)); } catch {}
        }
      }).catch(() => {});

      // 2. Reconciliación en frío de posiciones abiertas desde la base de datos
      TradePersistenceService.fetchOpenPositions(targetId, user?.id, user?.email).then((dbPositions) => {
        if (dbPositions && dbPositions.length > 0) {
          setPositions((prev) => {
            const map = new Map<string, PositionItem>();
            dbPositions.forEach((p) => map.set(p.id, p));
            prev.forEach((p) => {
              if (map.has(p.id)) {
                map.set(p.id, {
                  ...map.get(p.id)!,
                  mark: p.mark,
                  pnlUsdt: p.pnlUsdt,
                  pnl: p.pnl,
                  pnlPercent: p.pnlPercent,
                  pnlPercentNum: p.pnlPercentNum,
                  isProfit: p.isProfit
                });
              }
            });
            const merged = Array.from(map.values());
            positionsRef.current = merged;
            try { localStorage.setItem('zyti_open_positions', JSON.stringify(merged)); } catch {}
            return merged;
          });
        }
      }).catch(() => {});

      // 3. Reconciliación en frío del Balance General de la cuenta desde Supabase
      const identifier = targetId || user?.id || user?.email;
      if (identifier) {
        fetchTraderAccounts(identifier).then((accounts) => {
          if (accounts && accounts.length > 0) {
            const activeAcc = (targetId ? accounts.find((a) => a.id === targetId) : null) || accounts[0];
            if (activeAcc && typeof activeAcc.currentBalance === 'number' && !isNaN(activeAcc.currentBalance) && activeAcc.currentBalance > 0) {
              setDemoBalance(activeAcc.currentBalance);
              demoBalanceRef.current = activeAcc.currentBalance;
              try { localStorage.setItem('zyti_demo_balance', activeAcc.currentBalance.toString()); } catch {}
            }
          }
        }).catch(() => {});
      }
    }
  }, [activeAccountId, user]);

  // Sincronización Multi-Dispositivo en Tiempo Real (PC <-> Móvil <-> Tablet) vía Supabase Realtime
  // Zero-Egress: Solo transmite ~200 bytes ante un evento real de apertura/cierre de ESTA cuenta.
  useEffect(() => {
    const targetAccountId = activeAccountId || user?.activeAccountId || user?.accounts?.[0]?.id;
    if (!targetAccountId) return;

    const channel = supabase
      .channel(`sync_trades_${targetAccountId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'account_trades',
          filter: `account_id=eq.${targetAccountId}`
        },
        (payload: any) => {
          if (payload.eventType === 'INSERT') {
            const row = payload.new;
            if (row && row.status === 'OPEN') {
              setPositions((prev) => {
                if (prev.some((p) => p.id === row.id)) return prev;
                const entry = Number(row.entry_price) || 1;
                const sizeUnits = Number(row.size) || 0;
                const leverage = Number(row.leverage) || 10;
                const newPos: PositionItem = {
                  id: row.id,
                  userId: row.user_id,
                  symbol: row.symbol,
                  exchange: row.exchange || 'binance',
                  side: (row.side as 'LONG' | 'SHORT') || 'LONG',
                  orderType: 'market',
                  status: 'OPEN',
                  size: `${sizeUnits.toFixed(4)} ${row.symbol.split('/')[0] || ''}`.trim(),
                  sizeUnits,
                  entry,
                  entryTimestamp: new Date(row.opened_at).getTime(),
                  mark: entry,
                  slPrice: row.sl_price ? Number(row.sl_price) : null,
                  tpPrice: row.tp_price ? Number(row.tp_price) : null,
                  leverage,
                  collateralUsdt: (sizeUnits * entry) / leverage,
                  pnlUsdt: 0,
                  pnlPercentNum: 0,
                  pnl: '$0.00',
                  pnlPercent: '0.00%',
                  isProfit: true,
                  createdAt: row.opened_at
                };
                playOrderFilledSound();
                return [newPos, ...prev];
              });
            }
          } else if (payload.eventType === 'UPDATE') {
            const row = payload.new;
            if (row && row.status === 'CLOSED') {
              // Posición liquidada o cerrada en otro dispositivo (ej: desde el ordenador)
              setPositions((prev) => prev.filter((p) => p.id !== row.id));
              closedPositionIdsRef.current.add(row.id);

              // Actualizar saldo de inmediato si el payload incluye el PnL realizado
              if (typeof row.realized_pnl !== 'undefined' && row.realized_pnl !== null) {
                const pnlDelta = Number(row.realized_pnl) || 0;
                setDemoBalance((prev) => {
                  const nextBal = Number((prev + pnlDelta).toFixed(2));
                  try { localStorage.setItem('zyti_demo_balance', nextBal.toString()); } catch {}
                  return nextBal;
                });
              }

              // Recargar historial para que aparezca de inmediato en la pestaña de historial del tablet/móvil
              TradePersistenceService.fetchAccountTradesHistory(targetAccountId, user?.id, user?.email).then((dbHist) => {
                if (dbHist && dbHist.length > 0) {
                  setTradeHistory(dbHist);
                  try { localStorage.setItem('zyti_trade_history', JSON.stringify(dbHist)); } catch {}
                }
              });
            } else if (row && row.status === 'OPEN') {
              // Actualización de SL o TP arrastrado desde otro dispositivo
              setPositions((prev) =>
                prev.map((p) =>
                  p.id === row.id
                    ? {
                        ...p,
                        slPrice: row.sl_price ? Number(row.sl_price) : null,
                        tpPrice: row.tp_price ? Number(row.tp_price) : null
                      }
                    : p
                )
              );
            }
          } else if (payload.eventType === 'DELETE') {
            // Se ejecutó una purga/reset desde otro dispositivo
            setPositions([]);
            setTradeHistory([]);
            setDemoBalance(100000);
            try { localStorage.removeItem('zyti_open_positions'); } catch {}
            try { localStorage.removeItem('zyti_trade_history'); } catch {}
            try { localStorage.setItem('zyti_demo_balance', '100000'); } catch {}
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'trading_accounts',
          filter: `id=eq.${targetAccountId}`
        },
        (payload: any) => {
          const row = payload.new;
          if (row) {
            if (typeof row.current_balance !== 'undefined') {
              const newBal = Number(row.current_balance);
              if (!isNaN(newBal) && newBal > 0) {
                setDemoBalance(newBal);
                try { localStorage.setItem('zyti_demo_balance', newBal.toString()); } catch {}
              }
            }
            if (typeof row.daily_start_equity !== 'undefined') {
              const newDailyBase = Number(row.daily_start_equity);
              if (!isNaN(newDailyBase) && newDailyBase > 0) {
                dailyStartEquityRef.current = newDailyBase;
                const today = new Date().toISOString().split('T')[0];
                try {
                  localStorage.setItem('zyti_daily_start_equity', JSON.stringify({
                    date: row.daily_start_date || today,
                    equity: newDailyBase
                  }));
                } catch {}
              }
            }
            if (row.status === 'BREACHED') {
              setIsAccountBreached(true);
              isBreachedRef.current = true;
              setBreachReason(row.breach_reason || (isEs ? 'Infracción de reglas de riesgo' : 'Risk rules breached'));
            } else if (row.status === 'ACTIVE') {
              setIsAccountBreached(false);
              isBreachedRef.current = false;
              setBreachReason('');
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeAccountId, user, isEs]);

  // Sincronización instantánea inter-pestañas en la misma máquina (Zero-Egress total a 0ms)
  useEffect(() => {
    if (typeof window === 'undefined' || !window.BroadcastChannel) return;
    const targetAccountId = activeAccountId || user?.activeAccountId || user?.accounts?.[0]?.id;
    if (!targetAccountId) return;

    const bc = new BroadcastChannel('zyti_trading_sync');
    bc.onmessage = (event) => {
      const msg = event.data;
      if (!msg || msg.accountId !== targetAccountId) return;
      if (msg.type === 'BALANCE_SYNC' && typeof msg.balance === 'number') {
        setDemoBalance(msg.balance);
        try { localStorage.setItem('zyti_demo_balance', msg.balance.toString()); } catch {}
      } else if (msg.type === 'RESET_SYNC') {
        setDemoBalance(100000);
        setPositions([]);
        setTradeHistory([]);
        try { localStorage.removeItem('zyti_open_positions'); } catch {}
        try { localStorage.removeItem('zyti_trade_history'); } catch {}
        try { localStorage.setItem('zyti_demo_balance', '100000'); } catch {}
      }
    };

    return () => {
      bc.close();
    };
  }, [activeAccountId, user]);

  // Sincronización Institucional mediante ZYTI Trading WebSocket Gateway (Redis Pub/Sub)
  useEffect(() => {
    const targetAccountId = activeAccountId || user?.activeAccountId || user?.accounts?.[0]?.id;
    if (!targetAccountId) return;

    zytiTradingClient.connect(targetAccountId);

    const unsubscribe = zytiTradingClient.onEvent((event) => {
      switch (event.type) {
        case 'TRADE_OPENED': {
          const pos = event.payload;
          if (pos && pos.id) {
            setPositions((prev) => {
              if (prev.some((p) => p.id === pos.id)) return prev;
              playOrderFilledSound();
              return [pos, ...prev];
            });
          }
          break;
        }
        case 'TRADE_CLOSED': {
          const { id, newBalance: remoteBal } = event.payload || {};
          if (id) {
            setPositions((prev) => prev.filter((p) => p.id !== id));
            closedPositionIdsRef.current.add(id);
          }
          if (typeof remoteBal === 'number') {
            setDemoBalance(remoteBal);
            try { localStorage.setItem('zyti_demo_balance', remoteBal.toString()); } catch {}
          }
          TradePersistenceService.fetchAccountTradesHistory(targetAccountId, user?.id, user?.email).then((dbHist) => {
            if (dbHist && dbHist.length > 0) {
              setTradeHistory(dbHist);
              try { localStorage.setItem('zyti_trade_history', JSON.stringify(dbHist)); } catch {}
            }
          });
          break;
        }
        case 'SL_TP_UPDATED': {
          const { id, slPrice, tpPrice } = event.payload || {};
          if (id) {
            setPositions((prev) => {
              const next = prev.map((p) => (p.id === id ? { ...p, slPrice, tpPrice } : p));
              positionsRef.current = next;
              try { localStorage.setItem('zyti_open_positions', JSON.stringify(next)); } catch {}
              return next;
            });
          }
          break;
        }
        case 'BALANCE_UPDATED': {
          const { balance } = event.payload || {};
          if (typeof balance === 'number') {
            setDemoBalance(balance);
            demoBalanceRef.current = balance;
            try { localStorage.setItem('zyti_demo_balance', balance.toString()); } catch {}
          }
          break;
        }
        case 'ACCOUNT_RESET': {
          const { initialBalance = 100000 } = event.payload || {};
          setDemoBalance(initialBalance);
          demoBalanceRef.current = initialBalance;
          setPositions([]);
          positionsRef.current = [];
          setTradeHistory([]);
          try { localStorage.removeItem('zyti_open_positions'); } catch {}
          try { localStorage.removeItem('zyti_trade_history'); } catch {}
          try { localStorage.setItem('zyti_demo_balance', initialBalance.toString()); } catch {}
          break;
        }
        case 'LIMIT_ORDER_PLACED': {
          const { order } = event.payload || {};
          if (order && order.id) {
            setLimitOrders((prev) => {
              if (prev.some((o) => o.id === order.id)) return prev;
              const next = [order, ...prev];
              limitOrdersRef.current = next;
              try { localStorage.setItem('zyti_limit_orders', JSON.stringify(next)); } catch {}
              return next;
            });
            playOrderFilledSound();
          }
          break;
        }
        case 'LIMIT_ORDER_CANCELLED': {
          const { orderId } = event.payload || {};
          if (orderId) {
            setLimitOrders((prev) => {
              const next = prev.filter((o) => o.id !== orderId);
              limitOrdersRef.current = next;
              try { localStorage.setItem('zyti_limit_orders', JSON.stringify(next)); } catch {}
              return next;
            });
          }
          break;
        }
        case 'ALL_LIMIT_ORDERS_CANCELLED': {
          setLimitOrders([]);
          limitOrdersRef.current = [];
          try { localStorage.removeItem('zyti_limit_orders'); } catch {}
          break;
        }
        case 'LIMIT_ORDER_UPDATED': {
          const { orderId, newLimitPrice, newSlPrice, newTpPrice } = event.payload || {};
          if (orderId) {
            setLimitOrders((prev) => {
              const next = TradingEngine.updateLimitOrder(prev, orderId, newLimitPrice, newSlPrice, newTpPrice);
              limitOrdersRef.current = next;
              try { localStorage.setItem('zyti_limit_orders', JSON.stringify(next)); } catch {}
              return next;
            });
          }
          break;
        }
        case 'ACCOUNT_RESET': {
          setPositions([]);
          setTradeHistory([]);
          setDemoBalance(100000);
          try { localStorage.removeItem('zyti_open_positions'); } catch {}
          try { localStorage.removeItem('zyti_trade_history'); } catch {}
          try { localStorage.setItem('zyti_demo_balance', '100000'); } catch {}
          break;
        }
        case 'DRAWDOWN_BREACH': {
          setIsAccountBreached(true);
          isBreachedRef.current = true;
          setBreachReason(event.payload?.reason || (isEs ? 'Infracción de reglas de riesgo' : 'Risk rules breached'));
          break;
        }
        case 'DAILY_ROLLOVER': {
          const { newDailyStartEquity, date } = event.payload || {};
          if (typeof newDailyStartEquity === 'number' && newDailyStartEquity > 0) {
            dailyStartEquityRef.current = newDailyStartEquity;
            const rollDate = date || new Date().toISOString().split('T')[0];
            try {
              localStorage.setItem('zyti_daily_start_equity', JSON.stringify({
                date: rollDate,
                equity: newDailyStartEquity
              }));
            } catch {}

            // Actualizar cuenta en lista local de cuentas
            const targetAccId = activeAccountId || user?.activeAccountId;
            if (targetAccId) {
              setTraderAccounts((prev) =>
                prev.map((a) =>
                  a.id === targetAccId
                    ? { ...a, dailyStartEquity: newDailyStartEquity, dailyStartDate: rollDate, tradingDaysCount: (a.tradingDaysCount || 0) + (event.payload?.tradingDaysCount ? 1 : 0) }
                    : a
                )
              );
            }

            addToastRef.current({
              type: 'info',
              title: isEs ? 'Nuevo Día de Trading (00:00 UTC)' : 'New Trading Day (00:00 UTC)',
              message: isEs
                ? `Drawdown diario reiniciado. Tu base de equidad para hoy es $${newDailyStartEquity.toLocaleString(undefined, { minimumFractionDigits: 2 })} USDT.`
                : `Daily drawdown reset. Your base equity for today is $${newDailyStartEquity.toLocaleString(undefined, { minimumFractionDigits: 2 })} USDT.`
            });
          }
          break;
        }
      }
    });

    return () => {
      unsubscribe();
    };
  }, [activeAccountId, user, isEs]);

  const recordClosedTrade = useCallback((
    item: {
      id: string;
      symbol: string;
      side: 'LONG' | 'SHORT';
      size: string;
      sizeUnits: number;
      entry: number;
      mark: number;
      pnlUsdt: number;
      pnlPercentNum: number;
      createdAt?: string;
      openedAt?: string;
      leverage?: number;
    },
    reason: 'TP' | 'SL' | 'MANUAL' | 'LIQUIDATION_BREACH',
    newBalance?: number
  ) => {
    const isProfit = item.pnlUsdt >= 0;
    const nowIso = new Date().toISOString();
    const record: ClosedTradeItem = {
      id: item.id,
      symbol: item.symbol,
      side: item.side,
      size: item.size,
      sizeUnits: item.sizeUnits,
      entry: item.entry,
      exitPrice: item.mark,
      pnlUsdt: Number(item.pnlUsdt.toFixed(2)),
      pnlPercentNum: Number(item.pnlPercentNum.toFixed(2)),
      pnlPercent: `${isProfit ? '+' : ''}${item.pnlPercentNum.toFixed(2)}%`,
      isProfit,
      openedAt: item.createdAt || item.openedAt || nowIso,
      closedAt: nowIso,
      leverage: item.leverage || 10,
      closeReason: reason
    };

    setTradeHistory((prev) => {
      const updated = [record, ...prev.filter((p) => p.id !== item.id)].slice(0, 100);
      try { localStorage.setItem('zyti_trade_history', JSON.stringify(updated)); } catch {}
      return updated;
    });

    // Write-Behind Queue: persistir cierre asíncronamente en Supabase y sincronizar balance de la cuenta
    const targetAccountId = activeAccountId || user?.activeAccountId || user?.accounts?.[0]?.id;
    if (newBalance !== undefined) {
      try {
        const bc = new BroadcastChannel('zyti_trading_sync');
        bc.postMessage({ type: 'BALANCE_SYNC', balance: newBalance, accountId: targetAccountId });
        bc.close();
      } catch {}
    }

    // Difundir al WebSocket Gateway / Redis
    zytiTradingClient.publishEvent({
      type: 'TRADE_CLOSED',
      payload: { id: item.id, realizedPnl: item.pnlUsdt, newBalance }
    });

    if (newBalance !== undefined) {
      zytiTradingClient.publishEvent({
        type: 'BALANCE_UPDATED',
        payload: { balance: newBalance }
      });
    }

    TradePersistenceService.persistClosedTrade({
      tradeId: item.id,
      accountId: targetAccountId,
      userId: user?.id,
      traderEmail: user?.email,
      exitPrice: item.mark,
      realizedPnl: Number(item.pnlUsdt.toFixed(2)),
      closeReason: reason,
      closedAt: nowIso,
      newBalance
    }).catch(() => {});
  }, [activeAccountId, user]);

  const recordClosedTradeRef = useRef(recordClosedTrade);
  recordClosedTradeRef.current = recordClosedTrade;

  // Saldo de cuenta Demo y gestión de riesgo en % (Estandarizado a 100K para usuarios logueados y no logueados)
  const [demoBalance, setDemoBalance] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('zyti_demo_balance');
      // Si es un usuario invitado que tenía un balance previo inferior o antiguo, migrarlo a 100K
      if (!saved || saved === '10000' || saved === '1000' || saved === '5000' || saved === '15000' || saved === '25000' || saved === '50000' || saved === '200000') {
        localStorage.setItem('zyti_demo_balance', '100000');
        return 100000;
      }
      return Number(saved) || 100000;
    } catch {
      return 100000;
    }
  });
  const demoBalanceRef = useRef(demoBalance);
  demoBalanceRef.current = demoBalance;

  const [riskPercent, setRiskPercent] = useState<number>(1);
  const [slPercent, setSlPercent] = useState<number>(2);
  const [tpPercent, setTpPercent] = useState<number>(4);
  const [orderMode, setOrderMode] = useState<'amount' | 'risk'>('amount');

  // Control de visibilidad y minimizado de paneles con persistencia en localStorage
  const [isTradingSidebarOpen, setIsTradingSidebarOpen] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('zyti_trading_sidebar_open');
      return saved !== null ? saved !== 'false' : true;
    } catch {
      return true;
    }
  });

  const [showOrderForm, setShowOrderForm] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('zyti_show_orderform');
      return saved !== null ? saved !== 'false' : true;
    } catch {
      return true;
    }
  });

  const [showOrderBook, setShowOrderBook] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('zyti_show_orderbook');
      return saved !== null ? saved !== 'false' : true;
    } catch {
      return true;
    }
  });

  const [showPositions, setShowPositions] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('zyti_show_positions');
      return saved !== null ? saved !== 'false' : true;
    } catch {
      return true;
    }
  });

  const [isOrderFormMinimized, setIsOrderFormMinimized] = useState<boolean>(false);
  const [isOrderBookMinimized, setIsOrderBookMinimized] = useState<boolean>(false);

  const isOrderFormClosed = !showOrderForm;
  const isOrderBookClosed = !showOrderBook;

  const handleToggleTradingSidebar = useCallback(() => {
    setIsTradingSidebarOpen((prev) => {
      const next = !prev;
      try { localStorage.setItem('zyti_trading_sidebar_open', String(next)); } catch {}
      setTimeout(() => chartInstanceRef.current?.resize(), 60);
      return next;
    });
  }, []);

  const handleOpenTradingPanel = useCallback(() => {
    setIsTradingSidebarOpen(true);
    setShowOrderForm(true);
    setIsOrderFormMinimized(false);
    try {
      localStorage.setItem('zyti_trading_sidebar_open', 'true');
      localStorage.setItem('zyti_show_orderform', 'true');
    } catch {}
    setTimeout(() => chartInstanceRef.current?.resize(), 60);
  }, []);

  const handleToggleOrderForm = useCallback(() => {
    setShowOrderForm((prev) => {
      const next = !prev;
      try { localStorage.setItem('zyti_show_orderform', String(next)); } catch {}
      setTimeout(() => chartInstanceRef.current?.resize(), 60);
      return next;
    });
  }, []);

  const handleToggleOrderBook = useCallback(() => {
    setShowOrderBook((prev) => {
      const next = !prev;
      try { localStorage.setItem('zyti_show_orderbook', String(next)); } catch {}
      setTimeout(() => chartInstanceRef.current?.resize(), 60);
      return next;
    });
  }, []);

  const handleTogglePositions = useCallback(() => {
    setShowPositions((prev) => {
      const next = !prev;
      try { localStorage.setItem('zyti_show_positions', String(next)); } catch {}
      setTimeout(() => chartInstanceRef.current?.resize(), 60);
      return next;
    });
  }, []);

  // Centinela de Drawdown en vivo y Gobernanza de Riesgo para Prop Firm
  const propFirmRulesRef = useRef<PropFirmRuleConfig>(DEFAULT_PROP_FIRM_RULES);
  const dailyStartEquityRef = useRef<number>(getStoredDailyStartEquity(demoBalance));
  const [isAccountBreached, setIsAccountBreached] = useState<boolean>(false);
  const [breachReason, setBreachReason] = useState<string>('');
  const isBreachedRef = useRef<boolean>(false);
  isBreachedRef.current = isAccountBreached;

  // Vigilancia y sincronización proactiva de cambio de día UTC (00:00:00 UTC) en cliente
  useEffect(() => {
    const checkUtcDateRollover = () => {
      const todayUtc = new Date().toISOString().split('T')[0];
      const savedRaw = localStorage.getItem('zyti_daily_start_equity');
      if (savedRaw) {
        try {
          const parsed = JSON.parse(savedRaw);
          if (parsed && parsed.date && parsed.date !== todayUtc) {
            const currentEq = demoBalanceRef.current;
            dailyStartEquityRef.current = currentEq;
            localStorage.setItem('zyti_daily_start_equity', JSON.stringify({
              date: todayUtc,
              equity: currentEq
            }));
            addToastRef.current({
              type: 'info',
              title: isEs ? 'Nuevo Día de Trading (00:00 UTC)' : 'New Trading Day (00:00 UTC)',
              message: isEs
                ? `Inicio de nueva sesión UTC. Equidad base para hoy: $${currentEq.toLocaleString(undefined, { minimumFractionDigits: 2 })} USDT.`
                : `New UTC trading session started. Base equity for today: $${currentEq.toLocaleString(undefined, { minimumFractionDigits: 2 })} USDT.`
            });
          }
        } catch {}
      }
    };

    const interval = setInterval(checkUtcDateRollover, 15000);
    return () => clearInterval(interval);
  }, [isEs]);

  // Menú contextual flotante de clic derecho en el gráfico
  const [chartContextMenu, setChartContextMenu] = useState<{
    x: number;
    y: number;
    price: number;
  } | null>(null);

  // Sistema de notificaciones Toast sonoras para TP, SL y ejecución
  const [toasts, setToasts] = useState<ToastNotification[]>([]);
  const addToast = useCallback((toast: Omit<ToastNotification, 'id'>) => {
    const newToast: ToastNotification = {
      ...toast,
      id: generateTradeId()
    };
    setToasts((prev) => [...prev.slice(-3), newToast]);
  }, []);

  const addToastRef = useRef(addToast);
  addToastRef.current = addToast;

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const chartContainerRef = useRef<HTMLDivElement | null>(null);
  const chartInstanceRef = useRef<any>(null);
  const workerRef = useRef<Worker | null>(null);

  // Centrar milimétricamente el gráfico KLineChart en una vela/timestamp específico en medio de la pantalla
  const centerChartOnTimestamp = useCallback((chart: any, targetTs: number) => {
    if (!chart || !targetTs || isNaN(targetTs)) return;
    try {
      const dl = chart.getDataList?.() as Array<{ timestamp: number }> | undefined;
      if (!dl || dl.length === 0) {
        chart.scrollToTimestamp?.(targetTs, 300);
        return;
      }

      // 1. Encontrar la vela más cercana en el dataset al timestamp del trade
      let closestIdx = -1;
      let minDiff = Infinity;
      for (let i = 0; i < dl.length; i++) {
        const diff = Math.abs(dl[i].timestamp - targetTs);
        if (diff < minDiff) {
          minDiff = diff;
          closestIdx = i;
        }
      }

      if (closestIdx !== -1) {
        const visibleRange = chart.getVisibleRange?.() as { from: number; to: number } | undefined;
        const visibleBars = visibleRange ? Math.max(10, visibleRange.to - visibleRange.from) : 35;
        // Para que la vela quede en el medio horizontal de la pantalla:
        // el índice objetivo de la derecha debe ser el índice de la vela + la mitad de las barras visibles
        const centerTargetIdx = closestIdx + Math.floor(visibleBars / 2);
        chart.scrollToDataIndex?.(centerTargetIdx, 250);

        // Verificación y corrección milimétrica por coordenadas pixel tras el desplazamiento inicial
        setTimeout(() => {
          try {
            const coord = chart.convertToPixel?.({ dataIndex: closestIdx }, { paneId: 'candle_pane' }) as { x?: number } | undefined;
            const paneSize = chart.getSize?.('candle_pane') || chart.getSize?.();
            const canvasWidth = paneSize?.width || (chartContainerRef.current?.clientWidth ?? window.innerWidth);
            const targetCenter = canvasWidth / 2;
            if (coord && typeof coord.x === 'number' && !isNaN(coord.x)) {
              const delta = targetCenter - coord.x;
              if (Math.abs(delta) > 10) {
                chart.scrollByDistance?.(delta, 150);
              }
            }
          } catch {}
        }, 270);
      } else {
        chart.scrollToTimestamp?.(targetTs, 300);
      }
    } catch (err) {
      console.warn('[ZYTI Trade] Error centrando gráfico:', err);
    }
  }, []);

  // Escuchar toques y clics fuera para cerrar el menú contextual del gráfico.
  // IMPORTANTE: KLineChart llama preventDefault() en touchend, lo que impide que llegue
  // el evento 'click' sintetizado al window. Por eso usamos document capture-phase (touchstart),
  // que se ejecuta ANTES de cualquier handler y ANTES de que KLineChart pueda bloquearlo.
  useEffect(() => {
    const handleDismiss = () => setChartContextMenu(null);
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setChartContextMenu(null);
    };
    // capture:true garantiza que se ejecuta antes que el target/bubble y no puede ser bloqueado
    document.addEventListener('touchstart', handleDismiss, { capture: true, passive: true });
    document.addEventListener('click', handleDismiss, { capture: true });
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('touchstart', handleDismiss, { capture: true });
      document.removeEventListener('click', handleDismiss, { capture: true });
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Detección de toque rápido en el gráfico para abrir el dial radial (FASE CAPTURA).
  // Usa document+capture:true para ejecutarse ANTES de que KLineChart consuma el evento.
  // CRÍTICO: Verifica que e.target sea un <canvas> hijo del chartContainer — los botones UI
  // que se superponen al gráfico nunca son canvas, por lo que quedan excluidos automáticamente.
  useEffect(() => {
    let tapX = 0, tapY = 0, tapMs = 0, tapMoved = false;

    const onTouchStart = (e: TouchEvent) => {
      const container = chartContainerRef.current;
      if (!container) return;
      const touch = e.touches[0];
      if (!touch) return;

      // El target debe ser un <canvas> hijo del contenedor del gráfico.
      // KLineChart renderiza todo en canvas — cualquier botón/overlay React NO es canvas.
      const target = e.target as Element | null;
      if (!target || target.tagName !== 'CANVAS' || !container.contains(target)) {
        tapMs = 0;
        return;
      }

      // Excluir zona del eje de precios (derecha, 70px) y eje de tiempo (abajo, 36px)
      const rect = container.getBoundingClientRect();
      const relX = touch.clientX - rect.left;
      const relY = touch.clientY - rect.top;
      if (relX >= rect.width - 70 || relY >= rect.height - 36) { tapMs = 0; return; }

      tapX = touch.clientX;
      tapY = touch.clientY;
      tapMs = Date.now();
      tapMoved = false;
    };

    const onTouchMove = (e: TouchEvent) => {
      if (tapMoved || tapMs === 0) return;
      const touch = e.touches[0];
      if (!touch) return;
      if (Math.abs(touch.clientX - tapX) > 8 || Math.abs(touch.clientY - tapY) > 8) {
        tapMoved = true;
      }
    };

    const onTouchEnd = () => {
      if (tapMs === 0) return;
      const elapsed = Date.now() - tapMs;
      tapMs = 0;
      if (
        !tapMoved &&
        elapsed < 280 &&
        window.innerWidth < 1024 &&
        !activeDrawingToolRef.current &&
        !isRadialDialOpenRef.current
      ) {
        setRadialDialPos({ x: tapX, y: tapY });
        setIsRadialDialOpen(true);
      }
    };

    document.addEventListener('touchstart', onTouchStart, { capture: true, passive: true });
    document.addEventListener('touchmove',  onTouchMove,  { capture: true, passive: true });
    document.addEventListener('touchend',   onTouchEnd,   { capture: true });
    document.addEventListener('touchcancel', () => { tapMs = 0; }, { capture: true });

    return () => {
      document.removeEventListener('touchstart', onTouchStart, { capture: true });
      document.removeEventListener('touchmove',  onTouchMove,  { capture: true });
      document.removeEventListener('touchend',   onTouchEnd,   { capture: true });
    };
  }, []);

  // Liquidación de Emergencia ante infracción de Drawdown de Prop Firm
  const handleEmergencyLiquidation = useCallback((reason: string) => {
    const currentPositions = positionsRef.current;
    let totalRealized = 0;
    currentPositions.forEach((pos) => {
      totalRealized += (pos.pnlUsdt ?? 0);
    });

    const nextB = Number((demoBalanceRef.current + totalRealized).toFixed(2));
    currentPositions.forEach((pos) => {
      closedPositionIdsRef.current.add(pos.id);
      recordClosedTradeRef.current(pos, 'LIQUIDATION_BREACH', nextB);
    });

    positionsRef.current = [];
    setPositions([]);

    limitOrdersRef.current = [];
    setLimitOrders([]);
    try { localStorage.removeItem('zyti_limit_orders'); } catch {}

    setDemoBalance(() => {
      try { localStorage.setItem('zyti_demo_balance', nextB.toString()); } catch {}
      return nextB;
    });

    addToastRef.current({
      type: 'sl',
      title: isEs ? '¡Límite de Riesgo Prop Firm Superado!' : 'Prop Firm Risk Breach!',
      message: reason,
      pnlUsdt: totalRealized
    });
  }, [isEs]);

  const handleEmergencyLiquidationRef = useRef(handleEmergencyLiquidation);
  handleEmergencyLiquidationRef.current = handleEmergencyLiquidation;

  // Verificación reactiva en cada tick del límite de pérdida diaria y total (5% DD diario / 10% total)
  const checkLiveRiskAndDrawdown = useCallback((livePositions: PositionItem[], currentBalanceVal: number) => {
    if (isBreachedRef.current) return;
    const metrics = TradingEngine.calculateAccountMetrics(
      currentBalanceVal,
      livePositions,
      limitOrdersRef.current
    );
    const status = RiskEngine.checkPropFirmStatus(
      metrics,
      dailyStartEquityRef.current,
      propFirmRulesRef.current
    );
    if (status.breached && !isBreachedRef.current) {
      isBreachedRef.current = true;
      setIsAccountBreached(true);
      setBreachReason(status.reason || (isEs ? 'Límite máximo de Drawdown superado' : 'Maximum Drawdown limit breached'));
      handleEmergencyLiquidationRef.current(status.reason || 'Drawdown limit reached');
    }
  }, [isEs]);

  const checkLiveRiskAndDrawdownRef = useRef(checkLiveRiskAndDrawdown);
  checkLiveRiskAndDrawdownRef.current = checkLiveRiskAndDrawdown;

  // Colocación inmediata de orden pendiente desde el menú contextual de clic derecho en el gráfico
  const handlePlacePendingOrderFromChart = (orderSide: 'buy' | 'sell', targetPrice: number) => {
    setChartContextMenu(null);
    if (!user) {
      onOpenAuth?.();
      return;
    }
    if (isAccountBreached) {
      addToast({
        type: 'warning',
        title: isEs ? 'Operativa Bloqueada' : 'Trading Blocked',
        message: isEs
          ? 'Cuenta en infracción de Drawdown de la Prop Firm. Restablece la cuenta para continuar.'
          : 'Account in Drawdown breach. Reset account to continue.'
      });
      return;
    }

    const orderReq: OrderRequest = {
      symbol: selectedPair,
      exchange: currentExchange,
      marketType: currentMarketType,
      side: orderSide,
      orderType: 'limit',
      orderMode: 'amount',
      amountUsdt: parseFloat(amount) || 1000,
      riskPercent,
      slPercent,
      tpPercent,
      leverage
    };

    const currentMetrics = TradingEngine.calculateAccountMetrics(demoBalance, positionsRef.current, limitOrdersRef.current);
    const result = TradingEngine.createLimitOrder(
      orderReq,
      targetPrice,
      stats.lastPrice,
      currentMetrics,
      propFirmRulesRef.current
    );

    if (!result.success || !result.limitOrder) {
      addToast({
        type: 'warning',
        title: isEs ? 'Error al crear orden' : 'Order Creation Error',
        message: result.error || 'Error'
      });
      return;
    }

    limitOrdersRef.current = [result.limitOrder!, ...limitOrdersRef.current];
    setLimitOrders(limitOrdersRef.current);
    try {
      localStorage.setItem('zyti_limit_orders', JSON.stringify(limitOrdersRef.current));
    } catch {}

    // Difundir orden límite por WebSocket Gateway a todos los dispositivos
    zytiTradingClient.publishEvent({
      type: 'LIMIT_ORDER_PLACED',
      payload: { order: result.limitOrder }
    });

    playOrderFilledSound();
    const isBuy = orderSide === 'buy';
    const subtype = result.limitOrder.orderSubtype || (isBuy ? (targetPrice <= stats.lastPrice ? 'LIMIT' : 'STOP') : (targetPrice >= stats.lastPrice ? 'LIMIT' : 'STOP'));
    const orderLabel = `${isBuy ? 'Buy' : 'Sell'} ${subtype === 'LIMIT' ? 'Limit' : 'Stop'}`;

    addToast({
      type: isBuy ? 'buy' : 'sell',
      title: isEs ? `¡Orden ${orderLabel} Colocada!` : `${orderLabel} Order Placed!`,
      message: `${orderLabel.toUpperCase()} • ${result.limitOrder.size} @ $${targetPrice.toLocaleString()}`,
      symbol: selectedPair,
      price: targetPrice
    });

    setOrderSuccess(
      isEs
        ? `¡Orden ${orderLabel} colocada a $${targetPrice.toLocaleString()}!`
        : `${orderLabel} order placed at $${targetPrice.toLocaleString()}!`
    );
    setTimeout(() => setOrderSuccess(null), 3000);
  };

  // 1. Inicialización de KLineChart Canvas y Web Worker
  useEffect(() => {
    const container = chartContainerRef.current;
    if (!container) return;

    registerCustomChartOverlays();

    const chart: any = init(container, {
      styles: ZYTI_CHART_THEME,
      locale: isEs ? 'es' : 'en'
    });
    if (!chart) return;
    chartInstanceRef.current = chart;

    chart.setPriceVolumePrecision(2, 4);

    // Calibrar huso horario institucional (New York por defecto, o guardado por el usuario)
    const initialTz = localStorage.getItem('zyti_chart_timezone') || 'America/New_York';
    if (initialTz === 'LOCAL') {
      chart.setTimezone(Intl.DateTimeFormat().resolvedOptions().timeZone);
    } else {
      chart.setTimezone(initialTz);
    }

    // Restaurar los indicadores guardados en el navegador por el usuario
    applyIndicatorsToChart(chart, activeIndicatorsRef.current || ['MA', 'VOL']);

    // Suscripción al clic de vela para mostrar modalito con información detallada
    chart.subscribeAction('onCandleBarClick' as any, (data: any) => {
      if (data && data.kLineData) {
        setSelectedCandle(data.kLineData);
      }
    });

    // Restablecer herramienta activa cuando el usuario termina de trazar
    try {
      chart.subscribeAction('onDrawEnd' as any, () => {
        setActiveDrawingTool(null);
      });
    } catch {}

    // Soporte táctil nativo y fluido en 2D (arriba/abajo y lados) para dispositivos móviles y tablets
    const chartEvent = (chart as any)._chartEvent;
    if (chartEvent) {
      const origTouchStart = chartEvent.touchStartEvent.bind(chartEvent);
      const origTouchMove = chartEvent.touchMoveEvent.bind(chartEvent);
      const origTouchEnd = chartEvent.touchEndEvent.bind(chartEvent);

      let isSingleTouchActive = false;
      let lastTapTime = 0;
      // Estado de tap rápido para el dial radial (detectado DENTRO del override de KLineChart)
      let tapStartX = 0;
      let tapStartY = 0;
      let tapStartMs = 0;
      let tapMoved = false;

      chartEvent.touchStartEvent = function (e: any) {
        const found = chartEvent._findWidgetByEvent(e);
        const name = found?.widget?.getName?.();
        const pane = found?.pane;
        const yAxis = pane?.getAxisComponent?.();

        // Guardar coordenadas para detección de tap rápido
        const nativeTouch = e.changedTouches?.[0] ?? e.touches?.[0];
        if (nativeTouch) {
          tapStartX = nativeTouch.clientX;
          tapStartY = nativeTouch.clientY;
          tapStartMs = Date.now();
          tapMoved = false;
        }

        // 1. Doble toque rápido para restablecer auto-escalado vertical
        const now = Date.now();
        if (now - lastTapTime < 350) {
          if (yAxis && !yAxis.getAutoCalcTickFlag?.()) {
            yAxis.setAutoCalcTickFlag(true);
            (chart as any).adjustPaneViewport(false, true, true, true);
            lastTapTime = 0;
            return true;
          }
        }
        lastTapTime = now;

        // 2. Si el usuario toca el eje lateral de precios (Y-Axis) o tiempo (X-Axis)
        if (name === 'yAxis' || name === 'xAxis') {
          isSingleTouchActive = true;
          tapMoved = true; // los ejes no disparan el dial
          return chartEvent.mouseDownEvent(e);
        }

        // 3. Toque en el cuerpo del gráfico (velas e indicadores): permitir arrastre libre 2D (arriba/abajo y lados)
        if (name === 'main') {
          isSingleTouchActive = true;
          if (yAxis) {
            // Desbloquear escalado vertical para que el arrastre 2D (arriba/abajo y lados) funcione idéntico a escritorio
            yAxis.setAutoCalcTickFlag(false);
          }
          chartEvent.mouseDownEvent(e);
          return true;
        }

        isSingleTouchActive = false;
        return origTouchStart(e);
      };

      chartEvent.touchMoveEvent = function (e: any) {
        // Si el dedo se mueve más de 8px se descarta el tap rápido
        if (!tapMoved) {
          const nativeTouch = e.changedTouches?.[0] ?? e.touches?.[0];
          if (nativeTouch) {
            const dx = Math.abs(nativeTouch.clientX - tapStartX);
            const dy = Math.abs(nativeTouch.clientY - tapStartY);
            if (dx > 8 || dy > 8) tapMoved = true;
          }
        }

        if (isSingleTouchActive) {
          if (e.preventDefault) {
            try { e.preventDefault(); } catch {}
          }
          return chartEvent.pressedMouseMoveEvent(e);
        }

        return origTouchMove(e);
      };

      chartEvent.touchEndEvent = function (e: any) {
        // Detectar tap rápido para abrir el dial radial en móviles
        if (!tapMoved && !activeDrawingToolRef.current && !isRadialDialOpenRef.current && window.innerWidth < 1024) {
          const elapsed = Date.now() - tapStartMs;
          if (elapsed < 280) {
            setRadialDialPos({ x: tapStartX, y: tapStartY });
            setIsRadialDialOpen(true);
          }
        }

        if (isSingleTouchActive) {
          isSingleTouchActive = false;
          return chartEvent.mouseUpEvent(e);
        }
        return origTouchEnd(e);
      };
    }

    // Instanciar Web Worker
    const worker = new Worker(
      new URL('../workers/marketData.worker.ts', import.meta.url),
      { type: 'module' }
    );
    workerRef.current = worker;

    worker.onmessage = (e: MessageEvent) => {
      const { type, payload } = e.data || {};
      const activeChart = chartInstanceRef.current;
      if (type === 'HISTORICAL_BARS') {
        if (activeChart && payload.bars && payload.bars.length > 0) {
          const normPayloadSym = (payload.symbol || '').replace('/', '').toUpperCase();
          const normCurrentSym = (selectedPairRef.current || '').replace('/', '').toUpperCase();
          // Descartar si las barras pertenecen a un par que ya no es el seleccionado en el chart
          if (normPayloadSym && normPayloadSym !== normCurrentSym) {
            return;
          }
          const precision = normPayloadSym.includes('XRP') ? 4 : 2;
          activeChart.setPriceVolumePrecision(precision, 4);

          // Restablecer auto-cálculo de ticks en el eje Y para que la nueva escala se calibre de inmediato
          try {
            const candlePane = (activeChart as any)._candlePane;
            candlePane?.getAxisComponent?.().setAutoCalcTickFlag?.(true);
          } catch {}

          activeChart.applyNewData(payload.bars, false);
          if (pendingTradeFocusRef.current) {
            const pending = pendingTradeFocusRef.current;
            pendingTradeFocusRef.current = null;
            const openTs = parseTradeTimestamp(pending.openedAt);
            const closeTs = parseTradeTimestamp(pending.closedAt);
            const targetTs = openTs || closeTs;
            if (targetTs && !isNaN(targetTs)) {
              setTimeout(() => {
                try {
                  centerChartOnTimestamp(activeChart, targetTs);
                } catch {}
              }, 120);
            } else {
              activeChart.scrollToRealTime();
            }
          } else {
            activeChart.scrollToRealTime();
          }

          try {
            (activeChart as any).adjustPaneViewport(true, true, true, true, true);
          } catch {}

          // Restaurar trazos de dibujo guardados en localStorage para este nuevo par
          restoreDrawings(selectedPairRef.current);
        }
      } else if (type === 'TICK_UPDATE') {
        // 1. Alimentar el gráfico y las estadísticas SOLO si el tick pertenece al par activo del canvas
        const normPayloadSym = (payload.symbol || '').replace('/', '').toUpperCase();
        const normCurrentSym = (selectedPairRef.current || '').replace('/', '').toUpperCase();
        const isCurrentPair = normPayloadSym === normCurrentSym;
        if (isCurrentPair) {
          if (activeChart && payload.bar) {
            activeChart.updateData(payload.bar);
          }
          if (payload.stats && payload.stats.lastPrice > 0 && !isNaN(payload.stats.lastPrice)) {
            setStats(payload.stats);
          }
        }

        const tickSymbol = payload.stats?.symbol || payload.symbol;
        const tickExchange = payload.exchange || payload.stats?.exchange;
        const currentP = payload.stats?.lastPrice || payload.bar?.close;

        // Ingesta continua multi-exchange hacia el Risk Daemon del Servidor (24/7)
        if (currentP > 0 && tickSymbol) {
          const now = Date.now();
          const lastSent = lastTickServerSendRef.current.get(tickSymbol) || 0;
          if (now - lastSent >= 500) {
            lastTickServerSendRef.current.set(tickSymbol, now);
            zytiTradingClient.sendAction({
              action: 'MARKET_TICK',
              symbol: tickSymbol,
              exchange: tickExchange || 'binance',
              price: currentP,
              timestamp: now
            });
          }
        }

        // 2. Evaluar posiciones abiertas para este símbolo (continúa en vivo aunque el usuario esté en otro par)
        if (!payload.isInitialBars && currentP > 0 && tickSymbol) {
          const normTick = (tickSymbol || '').replace('/', '').toUpperCase();
          const currentPositions = positionsRef.current;
          if (currentPositions.some((p) => (p.symbol || '').replace('/', '').toUpperCase() === normTick)) {
            const evaluation = TradingEngine.evaluatePositionsOnTick(
              currentPositions,
              currentP,
              tickSymbol,
              tickExchange
            );

            // Actualizar posiciones sincrónicamente en la referencia y en el estado
            positionsRef.current = evaluation.updatedPositions;
            setPositions(evaluation.updatedPositions);
            checkLiveRiskAndDrawdownRef.current(evaluation.updatedPositions, demoBalanceRef.current);

            // Actualizar saldo realizado si hubo ejecuciones de TP o SL
            if (evaluation.balanceDelta !== 0) {
              setDemoBalance((prevB) => {
                const nextB = Number((prevB + evaluation.balanceDelta).toFixed(2));
                try {
                  localStorage.setItem('zyti_demo_balance', nextB.toString());
                } catch {}
                return nextB;
              });
            }

            // Despachar Toasts, registrar en historial y alertas sonoras de TP o SL FUERA del setState (exactamente una vez)
            const nextB = evaluation.balanceDelta !== 0 ? Number((demoBalanceRef.current + evaluation.balanceDelta).toFixed(2)) : undefined;
            evaluation.events.forEach((evt) => {
              if (closedPositionIdsRef.current.has(evt.position.id)) return;
              closedPositionIdsRef.current.add(evt.position.id);

              // Registrar en Historial y sincronizar en Supabase
              recordClosedTradeRef.current(evt.position, evt.type === 'TP_HIT' ? 'TP' : 'SL', nextB);

              if (evt.type === 'TP_HIT') {
                addToastRef.current({
                  type: 'tp',
                  title: isEs ? '¡Take Profit Alcanzado!' : 'Take Profit Triggered!',
                  symbol: evt.position.symbol,
                  pnlUsdt: evt.realizedPnL,
                  pnlPercent: evt.position.pnlPercentNum,
                  price: evt.price
                });
                setOrderSuccess(
                  isEs
                    ? `¡Take Profit alcanzado en ${evt.position.symbol}! (+${evt.realizedPnL.toFixed(2)} USDT)`
                    : `Take Profit hit on ${evt.position.symbol}! (+${evt.realizedPnL.toFixed(2)} USDT)`
                );
                setTimeout(() => setOrderSuccess(null), 4000);
              } else if (evt.type === 'SL_HIT') {
                addToastRef.current({
                  type: 'sl',
                  title: isEs ? 'Stop Loss Ejecutado' : 'Stop Loss Triggered',
                  symbol: evt.position.symbol,
                  pnlUsdt: evt.realizedPnL,
                  pnlPercent: evt.position.pnlPercentNum,
                  price: evt.price
                });
                setOrderSuccess(
                  isEs
                    ? `Stop Loss ejecutado en ${evt.position.symbol}. (${evt.realizedPnL.toFixed(2)} USDT)`
                    : `Stop Loss triggered on ${evt.position.symbol}. (${evt.realizedPnL.toFixed(2)} USDT)`
                );
                setTimeout(() => setOrderSuccess(null), 4000);
              }
            });
          }

          // 3. Evaluación de Órdenes Límite pendientes para este símbolo
          const currentLimits = limitOrdersRef.current.filter(
            (o) => (o.symbol || '').replace('/', '').toUpperCase() === normTick && o.status === 'PENDING' && !filledLimitOrderIdsRef.current.has(o.id)
          );
          if (currentLimits.length > 0) {
            const limitEval = TradingEngine.evaluateLimitOrdersOnTick(
              currentLimits,
              currentP,
              tickSymbol,
              tickExchange
            );

              if (limitEval.filledOrders.length > 0) {
                // Registrar inmediatamente los IDs ejecutados para prevenir cualquier ejecución duplicada por ticks concurrentes
                limitEval.filledOrders.forEach((filled) => {
                  filledLimitOrderIdsRef.current.add(filled.id);
                });

                // Actualizar inmediatamente y de forma síncrona las referencias mutables antes del próximo mensaje de WebSocket
                limitOrdersRef.current = limitEval.remainingOrders;
                positionsRef.current = [...limitEval.newlyOpenedPositions, ...positionsRef.current];

                try {
                  localStorage.setItem('zyti_limit_orders', JSON.stringify(limitEval.remainingOrders));
                } catch {}

                setLimitOrders(limitEval.remainingOrders);
                setPositions((prev) => [...limitEval.newlyOpenedPositions, ...prev]);
                playOrderFilledSound();

                // Persistir órdenes límites ejecutadas como posiciones en Supabase
                limitEval.newlyOpenedPositions.forEach((pos) => {
                  const targetAccountId = activeAccountId || user?.activeAccountId || user?.accounts?.[0]?.id;
                  TradePersistenceService.persistOpenedTrade({
                    id: pos.id,
                    accountId: targetAccountId,
                    userId: user?.id,
                    traderEmail: user?.email,
                    exchange: pos.exchange || currentExchange,
                    symbol: pos.symbol,
                    side: pos.side,
                    size: pos.sizeUnits,
                    leverage: pos.leverage,
                    entryPrice: pos.entry,
                    slPrice: pos.slPrice,
                    tpPrice: pos.tpPrice,
                    openedAt: pos.createdAt
                  }).catch(() => {});
                });

                limitEval.filledOrders.forEach((filled) => {
                  const isBuy = filled.side === 'buy';
                  const subtype = filled.orderSubtype || (isBuy ? (filled.limitPrice <= filled.placedAtPrice ? 'LIMIT' : 'STOP') : (filled.limitPrice >= filled.placedAtPrice ? 'LIMIT' : 'STOP'));
                  const orderLabel = `${isBuy ? 'Buy' : 'Sell'} ${subtype === 'LIMIT' ? 'Limit' : 'Stop'}`;
                  addToastRef.current({
                    type: isBuy ? 'buy' : 'sell',
                    title: isEs ? `¡Orden ${orderLabel} Ejecutada!` : `${orderLabel} Filled!`,
                    message: `${orderLabel.toUpperCase()} • ${filled.size} (${filled.leverage}x)`,
                    symbol: filled.symbol,
                    price: filled.limitPrice
                  });
                  setOrderSuccess(
                    isEs
                      ? `¡Orden ${orderLabel} ejecutada a $${filled.limitPrice.toLocaleString()}!`
                      : `${orderLabel} order filled at $${filled.limitPrice.toLocaleString()}!`
                  );
                  setTimeout(() => setOrderSuccess(null), 3500);
                });
              }
            }
          }
        } else if (type === 'TICKER') {
        if (payload.stats && payload.stats.lastPrice > 0 && !isNaN(payload.stats.lastPrice)) {
          const normTickerSym = (payload.stats.symbol || payload.symbol || '').replace('/', '').toUpperCase();
          const normCurrentChartSym = (selectedPairRef.current || '').replace('/', '').toUpperCase();
          if (normTickerSym === normCurrentChartSym) {
            setStats(payload.stats);
          }
          const currentP = payload.stats.lastPrice;
          const currentPositions = positionsRef.current;
          const tickSymbol = payload.stats?.symbol || payload.symbol;
          const tickExchange = payload.exchange || payload.stats?.exchange;

          if (currentPositions.length > 0 && currentPositions.some((p) => (p.symbol || '').replace('/', '').toUpperCase() === normTickerSym)) {
            const evaluation = TradingEngine.evaluatePositionsOnTick(
              currentPositions,
              currentP,
              tickSymbol,
              tickExchange
            );
            positionsRef.current = evaluation.updatedPositions;
            setPositions(evaluation.updatedPositions);
            checkLiveRiskAndDrawdownRef.current(evaluation.updatedPositions, demoBalanceRef.current);
            if (evaluation.balanceDelta !== 0) {
              setDemoBalance((prevB) => {
                const nextB = Number((prevB + evaluation.balanceDelta).toFixed(2));
                try {
                  localStorage.setItem('zyti_demo_balance', nextB.toString());
                } catch {}
                return nextB;
              });
            }

            // Despachar Toasts, registrar en historial si ocurrió TP o SL en TICKER
            const nextB = evaluation.balanceDelta !== 0 ? Number((demoBalanceRef.current + evaluation.balanceDelta).toFixed(2)) : undefined;
            evaluation.events.forEach((evt) => {
              if (closedPositionIdsRef.current.has(evt.position.id)) return;
              closedPositionIdsRef.current.add(evt.position.id);

              recordClosedTradeRef.current(evt.position, evt.type === 'TP_HIT' ? 'TP' : 'SL', nextB);

              if (evt.type === 'TP_HIT') {
                addToastRef.current({
                  type: 'tp',
                  title: isEs ? '¡Take Profit Alcanzado!' : 'Take Profit Triggered!',
                  symbol: evt.position.symbol,
                  pnlUsdt: evt.realizedPnL,
                  pnlPercent: evt.position.pnlPercentNum,
                  price: evt.price
                });
              } else if (evt.type === 'SL_HIT') {
                addToastRef.current({
                  type: 'sl',
                  title: isEs ? 'Stop Loss Ejecutado' : 'Stop Loss Triggered',
                  symbol: evt.position.symbol,
                  pnlUsdt: evt.realizedPnL,
                  pnlPercent: evt.position.pnlPercentNum,
                  price: evt.price
                });
              }
            });
          }

          // Evaluación de Órdenes Límite pendientes en TICKER
          const currentLimitsTicker = limitOrdersRef.current.filter(
            (o) => (o.symbol || '').replace('/', '').toUpperCase() === normTickerSym && o.status === 'PENDING' && !filledLimitOrderIdsRef.current.has(o.id)
          );
          if (currentLimitsTicker.length > 0) {
            const tickSymbol = payload.stats?.symbol || payload.symbol;
            const tickExchange = payload.exchange || payload.stats?.exchange;
            const limitEval = TradingEngine.evaluateLimitOrdersOnTick(
              currentLimitsTicker,
              currentP,
              tickSymbol,
              tickExchange
            );

            if (limitEval.filledOrders.length > 0) {
              // Registrar inmediatamente los IDs ejecutados para prevenir cualquier ejecución duplicada por ticks concurrentes
              limitEval.filledOrders.forEach((filled) => {
                filledLimitOrderIdsRef.current.add(filled.id);
              });

              // Actualizar inmediatamente y de forma síncrona las referencias mutables antes del próximo mensaje de WebSocket
              limitOrdersRef.current = limitEval.remainingOrders;
              positionsRef.current = [...limitEval.newlyOpenedPositions, ...positionsRef.current];

              try {
                localStorage.setItem('zyti_limit_orders', JSON.stringify(limitEval.remainingOrders));
              } catch {}

              setLimitOrders(limitEval.remainingOrders);
              setPositions((prev) => [...limitEval.newlyOpenedPositions, ...prev]);
              playOrderFilledSound();

              // Persistir órdenes límites ejecutadas como posiciones en Supabase
              limitEval.newlyOpenedPositions.forEach((pos) => {
                const targetAccountId = activeAccountId || user?.activeAccountId || user?.accounts?.[0]?.id;
                TradePersistenceService.persistOpenedTrade({
                  id: pos.id,
                  accountId: targetAccountId,
                  userId: user?.id,
                  traderEmail: user?.email,
                  exchange: pos.exchange || currentExchange,
                  symbol: pos.symbol,
                  side: pos.side,
                  size: pos.sizeUnits,
                  leverage: pos.leverage,
                  entryPrice: pos.entry,
                  slPrice: pos.slPrice,
                  tpPrice: pos.tpPrice,
                  openedAt: pos.createdAt
                }).catch(() => {});
              });

              limitEval.filledOrders.forEach((filled) => {
                const isBuy = filled.side === 'buy';
                const subtype = filled.orderSubtype || (isBuy ? (filled.limitPrice <= filled.placedAtPrice ? 'LIMIT' : 'STOP') : (filled.limitPrice >= filled.placedAtPrice ? 'LIMIT' : 'STOP'));
                const orderLabel = `${isBuy ? 'Buy' : 'Sell'} ${subtype === 'LIMIT' ? 'Limit' : 'Stop'}`;
                addToastRef.current({
                  type: isBuy ? 'buy' : 'sell',
                  title: isEs ? `¡Orden ${orderLabel} Ejecutada!` : `${orderLabel} Filled!`,
                  message: `${orderLabel.toUpperCase()} • ${filled.size} (${filled.leverage}x)`,
                  symbol: filled.symbol,
                  price: filled.limitPrice
                });
                setOrderSuccess(
                  isEs
                    ? `¡Orden ${orderLabel} ejecutada a $${filled.limitPrice.toLocaleString()}!`
                    : `${orderLabel} order filled at $${filled.limitPrice.toLocaleString()}!`
                );
                setTimeout(() => setOrderSuccess(null), 3500);
              });
            }
          }
        }
      } else if (type === 'ORDERBOOK_UPDATE') {
        if (payload.bids && payload.asks && payload.bids.length > 0) {
          setOrderBook(payload);
        }
      } else if (type === 'STATUS_CHANGE') {
        if (payload?.status) {
          setConnectionStatus(payload.status);
        }
      }
    };

    worker.postMessage({
      type: 'SUBSCRIBE',
      payload: { 
        exchange: currentExchange, 
        symbol: selectedPair, 
        timeframe, 
        marketType: currentMarketType 
      }
    });

    const resizeObserver = new ResizeObserver(() => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.resize();
      }
    });
    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
      if (workerRef.current) {
        workerRef.current.postMessage({ type: 'UNSUBSCRIBE' });
        workerRef.current.terminate();
        workerRef.current = null;
      }
      if (chartInstanceRef.current) {
        dispose(container);
        chartInstanceRef.current = null;
      }
    };
  }, []);

  // 1.B Soporte de gestos táctiles para zoom en ejes lateral/inferior en móviles
  // NOTA: La detección de tap rápido para el dial radial está integrada dentro del override
  // de _chartEvent en el bloque de inicialización del chart, ya que KLineChart captura los
  // eventos táctiles antes de que lleguen a los listeners del DOM.
  useEffect(() => {
    const container = chartContainerRef.current;
    if (!container) return;

    let activeTouchAxis: 'yAxis' | 'xAxis' | null = null;
    let startTouchX = 0;
    let startTouchY = 0;

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length !== 1) return;
      const touch = e.touches[0];
      const rect = container.getBoundingClientRect();
      const x = touch.clientX - rect.left;
      const y = touch.clientY - rect.top;

      startTouchX = touch.clientX;
      startTouchY = touch.clientY;

      // Eje lateral derecho (Precio): zona derecha (últimos 70px)
      const isRightAxis = x >= rect.width - 70;
      // Eje inferior (Tiempo): base (últimos 36px)
      const isBottomAxis = y >= rect.height - 36;

      if (isRightAxis) {
        activeTouchAxis = 'yAxis';
        const synthDown = new MouseEvent('mousedown', { clientX: touch.clientX, clientY: touch.clientY, bubbles: true, cancelable: true, button: 0 });
        container.dispatchEvent(synthDown);
      } else if (isBottomAxis) {
        activeTouchAxis = 'xAxis';
        const synthDown = new MouseEvent('mousedown', { clientX: touch.clientX, clientY: touch.clientY, bubbles: true, cancelable: true, button: 0 });
        container.dispatchEvent(synthDown);
      } else {
        activeTouchAxis = null;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!activeTouchAxis || e.touches.length !== 1) return;
      const touch = e.touches[0];
      if (e.cancelable) e.preventDefault();
      const synthMove = new MouseEvent('mousemove', { clientX: touch.clientX, clientY: touch.clientY, bubbles: true, cancelable: true, buttons: 1 });
      container.dispatchEvent(synthMove);
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (!activeTouchAxis) return;
      const touch = e.changedTouches[0];
      const synthUp = new MouseEvent('mouseup', {
        clientX: touch ? touch.clientX : startTouchX,
        clientY: touch ? touch.clientY : startTouchY,
        bubbles: true, cancelable: true, button: 0
      });
      container.dispatchEvent(synthUp);
      activeTouchAxis = null;
    };

    container.addEventListener('touchstart', handleTouchStart, { passive: false });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd, { passive: false });
    container.addEventListener('touchcancel', handleTouchEnd, { passive: false });

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
      container.removeEventListener('touchcancel', handleTouchEnd);
    };
  }, []);

  // Handlers de Exchange, Mercado, Par y Saldo Institucional
  const handleSelectExchange = (exchange: string) => {
    setCurrentExchange(exchange);
    try {
      localStorage.setItem('zyti_exchange', exchange);
    } catch {}
    if (chartInstanceRef.current) {
      chartInstanceRef.current.clearData();
    }
    if (workerRef.current) {
      workerRef.current.postMessage({
        type: 'SUBSCRIBE',
        payload: {
          exchange,
          symbol: selectedPair,
          timeframe,
          marketType: currentMarketType
        }
      });
    }
  };

  const handleSelectMarketType = (mType: MarketType) => {
    setCurrentMarketType(mType);
    try {
      localStorage.setItem('zyti_market_type', mType);
    } catch {}
    if (chartInstanceRef.current) {
      chartInstanceRef.current.clearData();
    }
    if (workerRef.current) {
      workerRef.current.postMessage({
        type: 'SUBSCRIBE',
        payload: {
          exchange: currentExchange,
          symbol: selectedPair,
          timeframe,
          marketType: mType
        }
      });
    }
  };

  const handleSelectPair = (pair: string) => {
    setSelectedPair(pair);
    selectedPairRef.current = pair;
    try {
      localStorage.setItem('zyti_selected_pair', pair);
    } catch {}
    onPairChange?.(pair);

    // Restaurar apalancamiento persistido para este par específico
    const savedLev = getStoredPairLeverage(pair, user?.id);
    setLeverage(savedLev);

    // Limpiar overlays del par anterior y desbloquear auto-escala del eje vertical
    if (chartInstanceRef.current) {
      try {
        const candlePane = (chartInstanceRef.current as any)._candlePane;
        candlePane?.getAxisComponent?.().setAutoCalcTickFlag?.(true);
        (chartInstanceRef.current as any).removeOverlay();
      } catch {}
    }

    // Sincronizar URL dinámica para compartir y SEO (/es/zytiterminal/BTCUSDT)
    const cleanPair = pair.replace('/', '').toUpperCase();
    const targetPath = `/${currentLang}/zytiterminal/${cleanPair}`;
    if (typeof window !== 'undefined' && window.location.pathname.toLowerCase() !== targetPath.toLowerCase()) {
      window.history.replaceState({ view: 'terminal', symbol: cleanPair }, '', targetPath);
    }
    // Pre-cargar precio base para eliminar desfases de escala en el eje derecho
    const pairPriceEstimates: Record<string, number> = {
      'BTC/USDT': 96450.0,
      'ETH/USDT': 2688.0,
      'SOL/USDT': 218.5,
      'BNB/USDT': 685.0,
      'XRP/USDT': 2.45
    };
    const estPrice = pairPriceEstimates[pair];
    if (typeof document !== 'undefined') {
      const p = estPrice || stats.lastPrice;
      const formattedPrice = p >= 1
        ? p.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
        : p.toFixed(4);
      document.title = `${formattedPrice} | ${pair} • ZYTI Trade`;
      const ogUrl = document.querySelector('meta[property="og:url"]');
      if (ogUrl) ogUrl.setAttribute('content', `https://zytitrade.com${targetPath}`);
      const ogTitle = document.querySelector('meta[property="og:title"]');
      if (ogTitle) ogTitle.setAttribute('content', `${pair} • ZYTI Trade Terminal`);
    }
    if (estPrice) {
      setStats((prev) => ({
        ...prev,
        symbol: pair,
        lastPrice: estPrice
      }));
    }
    if (workerRef.current) {
      workerRef.current.postMessage({
        type: 'SUBSCRIBE',
        payload: {
          exchange: currentExchange,
          symbol: pair,
          timeframe,
          marketType: currentMarketType
        }
      });
      // Sincronizar de inmediato las posiciones abiertas para que el worker mantenga ambos streams vivos
      const activeSymbols = Array.from(
        new Set([
          ...positionsRef.current.map((p) => p.symbol),
          ...limitOrdersRef.current.filter((o) => o.status === 'PENDING').map((o) => o.symbol)
        ])
      );
      workerRef.current.postMessage({
        type: 'SYNC_TRACKED_SYMBOLS',
        payload: { symbols: activeSymbols }
      });
    }
  };

const parseTradeTimestamp = (d?: string | number | null): number | null => {
  if (!d) return null;
  if (typeof d === 'number') return d;
  const num = Number(d);
  if (!isNaN(num) && num > 100000000000) return num;
  const parsed = new Date(d).getTime();
  return isNaN(parsed) ? null : parsed;
};

  const handleSelectHistoryTrade = useCallback((trade: ClosedTradeItem) => {
    setFocusedTrade(trade);
    const normTradeSym = normalizePair(trade.symbol);
    const normCurrentSym = normalizePair(selectedPairRef.current);

    const openTs = parseTradeTimestamp(trade.openedAt);
    const closeTs = parseTradeTimestamp(trade.closedAt);
    const targetTs = openTs || closeTs;

    if (normTradeSym !== normCurrentSym) {
      pendingTradeFocusRef.current = trade;
      handleSelectPair(normTradeSym);
    } else if (chartInstanceRef.current && targetTs && !isNaN(targetTs)) {
      centerChartOnTimestamp(chartInstanceRef.current, targetTs);
    }
  }, [centerChartOnTimestamp, normalizePair]);

  const handleReturnToLive = useCallback(() => {
    if (chartInstanceRef.current) {
      try {
        (chartInstanceRef.current as any).scrollToRealTime(300);
      } catch {}
    }
    setFocusedTrade(null);
  }, []);

  const handleClearFocusedTrade = useCallback(() => {
    setFocusedTrade(null);
  }, []);

  // Sincronizar en segundo plano los símbolos de posiciones y órdenes límites activas con el worker
  // para que sus marcas de precio y PnL sigan actualizándose en vivo aunque el usuario navegue a otros pares
  useEffect(() => {
    if (!workerRef.current) return;
    const activeSymbols = Array.from(
      new Set([
        ...positions.map((p) => p.symbol),
        ...limitOrders.filter((o) => o.status === 'PENDING').map((o) => o.symbol)
      ])
    );
    workerRef.current.postMessage({
      type: 'SYNC_TRACKED_SYMBOLS',
      payload: { symbols: activeSymbols }
    });
  }, [positions, limitOrders]);

  useEffect(() => {
    if (initialSymbol) {
      const match = normalizePair(initialSymbol);
      if (match && match !== selectedPairRef.current) {
        handleSelectPair(match);
      }
    }
  }, [initialSymbol]);

  // Sincronizar apalancamiento al cambiar de usuario / sesión
  useEffect(() => {
    if (user?.id) {
      const savedLev = getStoredPairLeverage(selectedPairRef.current, user.id);
      setLeverage(savedLev);
    }
  }, [user?.id]);

  // ── Pestaña del navegador: precio en vivo en tiempo real vía WebSocket (sin conexiones adicionales, reusando el feed del chart)
  useEffect(() => {
    if (typeof document !== 'undefined' && stats.lastPrice > 0) {
      const formattedPrice = stats.lastPrice >= 1
        ? stats.lastPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
        : stats.lastPrice.toFixed(4);
      document.title = `${formattedPrice} | ${selectedPair} • ZYTI Trade`;
    }
    return () => {
      if (typeof document !== 'undefined') {
        document.title = 'ZYTI Trade | Institutional Trading OS & Multi-Exchange Terminal';
      }
    };
  }, [stats.lastPrice, selectedPair]);

  const handleSelectBalanceAmount = (amountNum: number) => {
    closedPositionIdsRef.current.clear();
    setPositions([]);
    setDemoBalance(amountNum);
    try {
      localStorage.setItem('zyti_demo_balance', amountNum.toString());
    } catch {}
    addToast({
      type: 'info',
      title: isEs ? 'Tamaño de Cuenta Actualizado' : 'Account Size Updated',
      message: isEs
        ? `Cuenta configurada en $${amountNum.toLocaleString()}.00 USDT. Parámetros de riesgo recalculados.`
        : `Account set to $${amountNum.toLocaleString()}.00 USDT. Risk parameters recalibrated.`
    });
  };

  const handleSelectTimeframe = (tf: string) => {
    setTimeframe(tf);
    try {
      localStorage.setItem('zyti_selected_timeframe', tf);
    } catch {}
    if (chartInstanceRef.current) {
      chartInstanceRef.current.clearData();
    }
    if (workerRef.current) {
      workerRef.current.postMessage({
        type: 'CHANGE_TIMEFRAME',
        payload: { timeframe: tf }
      });
    }
  };

  const handleToggleIndicator = (name: string) => {
    const chart = chartInstanceRef.current;
    if (!chart) return;

    if (name === 'OHLC') {
      const willBeActive = !activeIndicators.includes('OHLC');
      chart.setStyles({
        candle: {
          tooltip: {
            showRule: willBeActive ? ('always' as any) : ('none' as any),
            text: {
              size: 9,
              color: '#475569'
            }
          }
        }
      });
      const next = willBeActive ? [...activeIndicators, 'OHLC'] : activeIndicators.filter((i) => i !== 'OHLC');
      setActiveIndicators(next);
      try {
        localStorage.setItem('zyti_active_indicators', JSON.stringify(next));
      } catch {}
      return;
    }

    const indOption = ALL_INDICATORS.find((i) => i.name === name);
    const targetPane = indOption?.paneId || (indOption?.category === 'main' ? 'candle_pane' : `pane_${name.toLowerCase()}`);

    if (activeIndicators.includes(name)) {
      chart.removeIndicator(targetPane, name);
      const next = activeIndicators.filter((i) => i !== name);
      setActiveIndicators(next);
      try {
        localStorage.setItem('zyti_active_indicators', JSON.stringify(next));
      } catch {}
    } else {
      chart.createIndicator(name, false, { id: targetPane });
      const next = [...activeIndicators, name];
      setActiveIndicators(next);
      try {
        localStorage.setItem('zyti_active_indicators', JSON.stringify(next));
      } catch {}
    }
  };

  const toggleFavoriteTimeframe = (tf: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setFavoriteTimeframes((prev) => {
      const next = prev.includes(tf) ? prev.filter((item) => item !== tf) : [...prev, tf];
      const sorted = sortTimeframes(next);
      try {
        localStorage.setItem('zyti_fav_timeframes', JSON.stringify(sorted));
      } catch {}
      return sorted;
    });
  };

  const toggleFavoriteIndicator = (ind: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setFavoriteIndicators((prev) => {
      const next = prev.includes(ind) ? prev.filter((item) => item !== ind) : [...prev, ind];
      try {
        localStorage.setItem('zyti_fav_indicators', JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const toggleNavPosition = () => {
    setNavPosition((prev) => {
      const next = prev === 'left' ? 'right' : 'left';
      try {
        localStorage.setItem('zyti_nav_position', next);
      } catch {}
      return next;
    });
  };

  // Métricas de cuenta centralizadas por el TradingEngine (incluyendo margen comprometido en órdenes pendientes)
  const accountMetrics = TradingEngine.calculateAccountMetrics(demoBalance, positions, limitOrders);

  const handleUpdatePositionSLTP = (id: string, slPrice?: number | null, tpPrice?: number | null) => {
    const target = positionsRef.current.find((p) => p.id === id);
    if (!target) return;

    const slChanged = slPrice !== undefined && (
      (slPrice === null && target.slPrice !== null && target.slPrice !== undefined) ||
      (slPrice !== null && (target.slPrice === null || target.slPrice === undefined || Math.abs(slPrice - target.slPrice) >= 0.02))
    );
    const tpChanged = tpPrice !== undefined && (
      (tpPrice === null && target.tpPrice !== null && target.tpPrice !== undefined) ||
      (tpPrice !== null && (target.tpPrice === null || target.tpPrice === undefined || Math.abs(tpPrice - target.tpPrice) >= 0.02))
    );

    if (!slChanged && !tpChanged) {
      return;
    }

    setPositions((prev) => {
      const next = TradingEngine.updatePositionSLTP(prev, id, slPrice, tpPrice);
      positionsRef.current = next;
      try { localStorage.setItem('zyti_open_positions', JSON.stringify(next)); } catch {}
      return next;
    });

    // 1. Difundir modificación de SL/TP a otros dispositivos vía WebSocket Gateway
    zytiTradingClient.publishEvent({
      type: 'SL_TP_UPDATED',
      payload: { id, slPrice, tpPrice }
    });

    // 2. Persistir en Base de Datos Supabase (Write-Behind) para que no se pierda al recargar
    TradePersistenceService.updateTradeSLTP(id, slPrice, tpPrice);

    if (slPrice !== undefined) {
      if (slPrice !== null) {
        const isLong = target.side === 'LONG';
        const isBE = Math.abs(slPrice - target.entry) < 0.05;
        const isProtectedProfit = isLong ? slPrice > target.entry + 0.05 : slPrice < target.entry - 0.05;

        if (isBE) {
          addToast({
            type: 'info',
            title: isEs ? 'Stop Loss en Break-Even' : 'Stop Loss at Break-Even',
            message: isEs
              ? `SL colocado al precio de entrada ($${slPrice.toLocaleString()}). Operación protegida sin riesgo.`
              : `SL placed at entry price ($${slPrice.toLocaleString()}). Trade protected risk-free.`
          });
        } else if (isProtectedProfit) {
          addToast({
            type: 'tp',
            title: isEs ? 'Operación Protegida (SL en Beneficio)' : 'Protected Trade (SL in Profit)',
            message: isEs
              ? `Stop Loss asegurado a $${slPrice.toLocaleString()} protegiendo beneficios acumulados.`
              : `Stop Loss secured at $${slPrice.toLocaleString()} locking in accumulated profits.`
          });
        }
      }
    }
  };

  // Activación o validación de Stop Loss en Break-Even (precio de entrada exacto)
  const handleSetBreakEven = useCallback((pos: PositionItem) => {
    const isLong = pos.side === 'LONG';
    const currentSymbolPrice = (pos.symbol === selectedPair && stats.lastPrice > 0)
      ? stats.lastPrice
      : pos.mark;

    // Verificamos si la posición está actualmente en pérdidas respecto al precio de entrada
    const isLoss = isLong
      ? currentSymbolPrice < pos.entry
      : currentSymbolPrice > pos.entry;

    if (isLoss) {
      const unrealizedLoss = Math.abs(pos.pnlUsdt);
      addToast({
        type: 'warning',
        title: isEs ? 'No se puede activar Break-Even' : 'Cannot Activate Break-Even',
        message: isEs
          ? `La posición en ${pos.symbol} está actualmente en pérdidas (-$${unrealizedLoss.toFixed(2)} USDT). Para colocar Break-Even sin riesgo de liquidación inmediata, el precio debe alcanzar o superar la entrada ($${pos.entry.toLocaleString()} USDT).`
          : `Position on ${pos.symbol} is currently in loss (-$${unrealizedLoss.toFixed(2)} USDT). To set Break-Even without immediate liquidation risk, the price must reach or surpass entry ($${pos.entry.toLocaleString()} USDT).`
      });
      return;
    }

    // Si ya está colocada la orden en Break-Even exacto
    if (pos.slPrice && Math.abs(pos.slPrice - pos.entry) < 0.05) {
      addToast({
        type: 'info',
        title: isEs ? 'Ya en Break-Even' : 'Already at Break-Even',
        message: isEs
          ? `La operación en ${pos.symbol} ya cuenta con Stop Loss en su precio de entrada ($${pos.entry.toLocaleString()} USDT). Puedes arrastrar el badge de SL en el gráfico hacia arriba para ir protegiendo ganancias a medida que el precio avance.`
          : `Trade on ${pos.symbol} already has Stop Loss at entry ($${pos.entry.toLocaleString()} USDT). You can drag the SL badge on the chart to lock in profits as the price advances.`
      });
      return;
    }

    // Posición en ganancia o equilibrio: fijar SL en el precio de entrada delegando a handleUpdatePositionSLTP.
    // Esto difunde el evento por WebSocket a todos los dispositivos, actualiza la base de datos Supabase y persiste en caché local.
    handleUpdatePositionSLTP(pos.id, pos.entry, pos.tpPrice ?? null);
  }, [selectedPair, stats.lastPrice, isEs, addToast]);

  const handleUpdatePreviewSLTP = useCallback((newSlPct?: number, newTpPct?: number) => {
    if (newSlPct !== undefined && !isNaN(newSlPct) && newSlPct > 0) {
      setSlPercent(Math.max(0.1, Number(newSlPct.toFixed(1))));
    }
    if (newTpPct !== undefined && !isNaN(newTpPct) && newTpPct > 0) {
      setTpPercent(Math.max(0.1, Number(newTpPct.toFixed(1))));
    }
  }, []);

  // Cerrar posición manualmente: calcula PnL realizado y actualiza el saldo de la cuenta
  const handleClosePosition = (id: string) => {
    if (closedPositionIdsRef.current.has(id)) return;
    
    const currentPositions = positionsRef.current;
    const { remainingPositions, closedPosition, realizedPnL } = TradingEngine.closePosition(currentPositions, id);
    if (!closedPosition) return;

    closedPositionIdsRef.current.add(id);

    const nextB = Number((demoBalanceRef.current + realizedPnL).toFixed(2));
    // Registrar en Historial de operaciones cerradas y sincronizar Supabase
    recordClosedTrade(closedPosition, 'MANUAL', nextB);

    setPositions(remainingPositions);
    setDemoBalance(() => {
      try { localStorage.setItem('zyti_demo_balance', nextB.toString()); } catch {}
      return nextB;
    });

    // Toast sonoro al cerrar manualmente (despachado una sola vez)
    addToast({
      type: realizedPnL >= 0 ? 'tp' : 'sl',
      title: isEs
        ? (realizedPnL >= 0 ? 'Posición Cerrada (Beneficio)' : 'Posición Cerrada (Pérdida)')
        : (realizedPnL >= 0 ? 'Position Closed (Profit)' : 'Position Closed (Loss)'),
      symbol: closedPosition.symbol,
      pnlUsdt: realizedPnL,
      pnlPercent: closedPosition.pnlPercentNum,
      price: closedPosition.mark
    });

    setOrderSuccess(
      isEs
        ? `Posición ${closedPosition.symbol} cerrada. PnL: ${realizedPnL >= 0 ? '+' : ''}$${realizedPnL.toFixed(2)} USDT`
        : `Position ${closedPosition.symbol} closed. PnL: ${realizedPnL >= 0 ? '+' : ''}$${realizedPnL.toFixed(2)} USDT`
    );
    setTimeout(() => setOrderSuccess(null), 3000);
  };

  // Cerrar todas las posiciones abiertas en una sola acción atómica a precio de mercado
  const handleCloseAllPositions = () => {
    const currentPositions = positionsRef.current;
    if (currentPositions.length === 0) return;

    let totalRealizedPnL = 0;
    currentPositions.forEach((pos) => {
      totalRealizedPnL += (pos.pnlUsdt ?? 0);
    });

    const nextB = Number((demoBalanceRef.current + totalRealizedPnL).toFixed(2));
    currentPositions.forEach((pos) => {
      closedPositionIdsRef.current.add(pos.id);
      recordClosedTrade(pos, 'MANUAL', nextB);
    });

    setPositions([]);
    setDemoBalance(() => {
      try { localStorage.setItem('zyti_demo_balance', nextB.toString()); } catch {}
      return nextB;
    });

    addToast({
      type: totalRealizedPnL >= 0 ? 'tp' : 'sl',
      title: isEs
        ? (totalRealizedPnL >= 0 ? 'Posiciones Cerradas (Beneficio)' : 'Posiciones Cerradas (Pérdida)')
        : (totalRealizedPnL >= 0 ? 'Positions Closed (Profit)' : 'Positions Closed (Loss)'),
      message: isEs
        ? `${currentPositions.length} operaciones liquidadas a mercado`
        : `${currentPositions.length} positions settled at market`,
      pnlUsdt: totalRealizedPnL
    });

    setOrderSuccess(
      isEs
        ? `Todas las posiciones (${currentPositions.length}) cerradas. PnL: ${totalRealizedPnL >= 0 ? '+' : ''}$${totalRealizedPnL.toFixed(2)} USDT`
        : `All positions (${currentPositions.length}) closed. PnL: ${totalRealizedPnL >= 0 ? '+' : ''}$${totalRealizedPnL.toFixed(2)} USDT`
    );
    setTimeout(() => setOrderSuccess(null), 3000);
  };

  // Resetear el saldo demo al valor inicial de $100,000, eliminar historial local y purgar Supabase
  const resetDemoBalance = () => {
    // 1. Limpieza de posiciones y órdenes en memoria RAM
    closedPositionIdsRef.current.clear();
    filledLimitOrderIdsRef.current.clear();
    setPositions([]);
    positionsRef.current = [];
    setLimitOrders([]);
    limitOrdersRef.current = [];

    // 2. Limpieza radical de LocalStorage e historial de trades
    try { localStorage.removeItem('zyti_limit_orders'); } catch {}
    try { localStorage.removeItem('zyti_trade_history'); } catch {}
    try { localStorage.removeItem('zyti_open_positions'); } catch {}
    setTradeHistory([]);

    // 3. Restauración de Saldo y Métricas al saldo inicial configurado de esta cuenta
    const targetAccountId = activeAccountId || user?.activeAccountId || user?.accounts?.[0]?.id;
    const currentAcc = traderAccounts.find((a) => a.id === targetAccountId) || user?.accounts?.[0];
    const initialBal = currentAcc?.initialBalance ? Number(currentAcc.initialBalance) : 100000;

    setDemoBalance(initialBal);
    demoBalanceRef.current = initialBal;
    try { localStorage.setItem('zyti_demo_balance', initialBal.toString()); } catch {}

    // 4. Resetear centinela de Drawdown y nuevo baseline diario
    const today = new Date().toISOString().split('T')[0];
    dailyStartEquityRef.current = initialBal;
    try { localStorage.setItem('zyti_daily_start_equity', JSON.stringify({ date: today, equity: initialBal })); } catch {}
    isBreachedRef.current = false;
    setIsAccountBreached(false);
    setBreachReason('');

    // Actualizar estado en lista de cuentas del trader
    setTraderAccounts((prev) =>
      prev.map((a) =>
        a.id === targetAccountId
          ? { ...a, status: 'ACTIVE', currentBalance: initialBal, equity: initialBal }
          : a
      )
    );

    // 5. Purgar historial forense en la nube (Supabase) para la cuenta activa y difundir por Broadcast
    try {
      const bc = new BroadcastChannel('zyti_trading_sync');
      bc.postMessage({ type: 'RESET_SYNC', accountId: targetAccountId });
      bc.close();
    } catch {}
    TradePersistenceService.purgeAccountTrades(targetAccountId, user?.id, user?.email).catch(() => {});

    // 5.1 Notificar al servidor Risk Daemon en RAM para restaurar a ACTIVE de inmediato
    if (targetAccountId) {
      zytiTradingClient.sendAction({
        action: 'RESET_ACCOUNT',
        accountId: targetAccountId,
        initialBalance: initialBal
      });
    }

    // 6. Toast de confirmación institucional
    addToast({
      type: 'info',
      title: isEs ? '¡Cuenta e Historial Restablecidos!' : 'Account & History Cleared!',
      message: isEs
        ? `Saldo restablecido a $${initialBal.toLocaleString()} USDT y todo el historial de trades fue purgado.`
        : `Balance reset to $${initialBal.toLocaleString()} USDT and all trade history was cleared.`
    });
  };

  const handleSelectAccount = useCallback((account: PropFirmAccount | null) => {
    if (account) {
      // 1. Si ya es la cuenta actualmente seleccionada, NO TOCAR NADA ni limpiar memoria
      if (account.id === activeAccountId) {
        return;
      }

      // 2. Guardar estado de posiciones y órdenes de la cuenta saliente
      if (activeAccountId) {
        try {
          localStorage.setItem(`zyti_positions_${activeAccountId}`, JSON.stringify(positionsRef.current));
          localStorage.setItem(`zyti_limit_orders_${activeAccountId}`, JSON.stringify(limitOrdersRef.current));
        } catch {}
      }

      setActiveAccountId(account.id);
      try { localStorage.setItem('zyti_active_account_id', account.id); } catch {}
      closedPositionIdsRef.current.clear();
      filledLimitOrderIdsRef.current.clear();

      // 3. Cargar posiciones guardadas específicamente para esta nueva cuenta
      try {
        const savedPos = localStorage.getItem(`zyti_positions_${account.id}`);
        const parsedPos: PositionItem[] = savedPos ? JSON.parse(savedPos) : [];
        setPositions(parsedPos);
        positionsRef.current = parsedPos;
      } catch {
        setPositions([]);
        positionsRef.current = [];
      }

      // 4. Cargar órdenes límite específicas para esta nueva cuenta
      try {
        const savedOrd = localStorage.getItem(`zyti_limit_orders_${account.id}`);
        const parsedOrd: LimitOrderItem[] = savedOrd ? JSON.parse(savedOrd) : [];
        setLimitOrders(parsedOrd);
        limitOrdersRef.current = parsedOrd;
      } catch {
        setLimitOrders([]);
        limitOrdersRef.current = [];
      }

      // 5. Reconciliación en segundo plano desde Supabase para la cuenta seleccionada
      TradePersistenceService.fetchOpenPositions(account.id, user?.id, user?.email).then((dbPos) => {
        if (dbPos) {
          setPositions(dbPos);
          positionsRef.current = dbPos;
          try { localStorage.setItem(`zyti_positions_${account.id}`, JSON.stringify(dbPos)); } catch {}
        }
      });

      TradePersistenceService.fetchAccountTradesHistory(account.id, user?.id, user?.email).then((dbHist) => {
        if (dbHist) {
          setTradeHistory(dbHist);
          try { localStorage.setItem('zyti_trade_history', JSON.stringify(dbHist)); } catch {}
        }
      });

      // 6. Suscribir canal WebSocket central a la nueva cuenta
      zytiTradingClient.subscribeAccount(account.id);

      const targetBal = Number(account.currentBalance ?? account.initialBalance ?? 100000);
      setDemoBalance(targetBal);
      demoBalanceRef.current = targetBal;
      try { localStorage.setItem('zyti_demo_balance', targetBal.toString()); } catch {}

      if (account.rulesConfig) {
        const rc: any = account.rulesConfig;
        propFirmRulesRef.current = {
          id: account.id,
          firmName: account.firmName,
          initialBalance: account.initialBalance,
          modelType: rc.modelType || rc.model_type || 'ONE_PHASE',
          maxDailyLossPercent: Number(rc.maxDailyLossPercent ?? rc.maxDailyDrawdownPct ?? 5),
          maxTotalDrawdownPercent: Number(rc.maxTotalDrawdownPercent ?? rc.maxTotalDrawdownPct ?? 10),
          maxTrailingDrawdownPercent: rc.maxTrailingDrawdownPercent ? Number(rc.maxTrailingDrawdownPercent) : undefined,
          drawdownType: rc.drawdownType || rc.drawdown_type || 'EOD',
          profitTargetPercent: Number(rc.profitTargetPercent ?? rc.profit_target_percent ?? 10),
          profitTargetPhase2Percent: Number(rc.profitTargetPhase2Percent ?? rc.profit_target_phase2_percent ?? 5),
          maxLeverage: Number(rc.maxLeverage ?? rc.max_leverage ?? 100),
          mandatoryStopLoss: !!(rc.mandatoryStopLoss ?? rc.mandatory_stop_loss),
          maxPositionsPerSymbolEnabled: !!(rc.maxPositionsPerSymbolEnabled ?? rc.max_positions_per_symbol_enabled),
          maxPositionsPerSymbol: Number(rc.maxPositionsPerSymbol ?? rc.max_positions_per_symbol ?? 2),
          maxTotalOpenPositionsEnabled: !!(rc.maxTotalOpenPositionsEnabled ?? rc.max_total_open_positions_enabled),
          maxTotalOpenPositions: Number(rc.maxTotalOpenPositions ?? rc.max_total_open_positions ?? 5),
          antiHedgingEnabled: !!(rc.antiHedgingEnabled ?? rc.anti_hedging_enabled),
          consistencyRulePercent: Number(rc.consistencyRulePercent ?? rc.consistency_rule_percent ?? 40),
          allowWeekendHolding: rc.allowWeekendHolding !== undefined ? !!rc.allowWeekendHolding : (rc.weekend_holding_allowed !== undefined ? !!rc.weekend_holding_allowed : true),
          allowNewsTrading: rc.allowNewsTrading !== undefined ? !!rc.allowNewsTrading : (rc.news_trading_allowed !== undefined ? !!rc.news_trading_allowed : true),
          minTradeDurationSeconds: Number(rc.minTradeDurationSeconds ?? rc.min_trade_duration_seconds ?? 10),
          minTradingDays: Number(rc.minTradingDays ?? rc.min_trading_days ?? 5),
          minDailyProfitType: rc.minDailyProfitType || rc.min_daily_profit_type || 'PERCENT',
          minDailyProfitValue: Number(rc.minDailyProfitValue ?? rc.min_daily_profit_value ?? 0.5),
          profitSplitPercent: Number(rc.profitSplitPercent ?? rc.profit_split_percent ?? 80),
          inactivityDaysLimit: Number(rc.inactivityDaysLimit ?? rc.inactivity_days_limit ?? 30)
        };
      }

      const effectiveDailyBase = Number(account.dailyStartEquity || account.initialBalance || 100000);
      dailyStartEquityRef.current = effectiveDailyBase;
      const today = new Date().toISOString().split('T')[0];
      try {
        localStorage.setItem('zyti_daily_start_equity', JSON.stringify({
          date: account.dailyStartDate || today,
          equity: effectiveDailyBase
        }));
      } catch {}

      const isAccBreached = account.status === 'BREACHED';
      setIsAccountBreached(isAccBreached);
      isBreachedRef.current = isAccBreached;

      addToast({
        type: 'info',
        title: isEs ? 'Cuenta de Fondeo Vinculada' : 'Prop Firm Account Linked',
        message: `${account.firmName} • ${account.accountNumber}`
      });
    } else {
      setActiveAccountId(undefined);
      resetDemoBalance();
      propFirmRulesRef.current = DEFAULT_PROP_FIRM_RULES;
      addToast({
        type: 'info',
        title: isEs ? 'Simulador Demo ZYTI' : 'ZYTI Demo Simulator',
        message: isEs ? 'Operando en simulación libre' : 'Trading in free simulation'
      });
    }
  }, [isEs, addToast]);

  // Cancelar orden límite individual
  const handleCancelLimitOrder = useCallback((orderId: string) => {
    const { remainingOrders } = TradingEngine.cancelLimitOrder(limitOrdersRef.current, orderId);
    limitOrdersRef.current = remainingOrders;
    setLimitOrders(remainingOrders);
    try { localStorage.setItem('zyti_limit_orders', JSON.stringify(remainingOrders)); } catch {}

    // Difundir cancelación por WebSocket Gateway a todos los dispositivos
    zytiTradingClient.publishEvent({
      type: 'LIMIT_ORDER_CANCELLED',
      payload: { orderId }
    });

    addToast({
      type: 'info',
      title: isEs ? 'Orden Límite Cancelada' : 'Limit Order Cancelled',
      message: isEs ? 'La orden pendiente fue cancelada y se liberó su margen.' : 'Pending limit order cancelled and margin unlocked.'
    });
  }, [isEs, addToast]);

  // Cancelar todas las órdenes límites pendientes
  const handleCancelAllLimitOrders = useCallback(() => {
    const count = limitOrdersRef.current.length;
    if (count === 0) return;
    limitOrdersRef.current = [];
    setLimitOrders([]);
    try { localStorage.removeItem('zyti_limit_orders'); } catch {}

    // Difundir cancelación masiva por WebSocket Gateway a todos los dispositivos
    zytiTradingClient.publishEvent({
      type: 'ALL_LIMIT_ORDERS_CANCELLED',
      payload: {}
    });

    addToast({
      type: 'info',
      title: isEs ? 'Órdenes Límites Canceladas' : 'All Limit Orders Cancelled',
      message: isEs ? `Se cancelaron ${count} órdenes pendientes y se liberó el margen.` : `${count} pending limit orders cancelled.`
    });
  }, [isEs, addToast]);

  // Modificar orden límite pendiente de forma interactiva (arrastrar en gráfico o editar en tabla)
  const handleUpdateLimitOrder = useCallback((
    orderId: string,
    newLimitPrice?: number,
    newSlPrice?: number | null,
    newTpPrice?: number | null
  ) => {
    const existing = limitOrdersRef.current.find((o) => o.id === orderId);
    if (!existing) return;

    const priceChanged = newLimitPrice !== undefined && Math.abs(newLimitPrice - existing.limitPrice) >= 0.02;
    const slChanged = newSlPrice !== undefined && (
      (newSlPrice === null && existing.slPrice !== null && existing.slPrice !== undefined) ||
      (newSlPrice !== null && (existing.slPrice === null || existing.slPrice === undefined || Math.abs(newSlPrice - existing.slPrice) >= 0.02))
    );
    const tpChanged = newTpPrice !== undefined && (
      (newTpPrice === null && existing.tpPrice !== null && existing.tpPrice !== undefined) ||
      (newTpPrice !== null && (existing.tpPrice === null || existing.tpPrice === undefined || Math.abs(newTpPrice - existing.tpPrice) >= 0.02))
    );

    if (!priceChanged && !slChanged && !tpChanged) {
      return;
    }

    const updated = TradingEngine.updateLimitOrder(
      limitOrdersRef.current,
      orderId,
      newLimitPrice,
      newSlPrice,
      newTpPrice,
      stats.lastPrice
    );
    limitOrdersRef.current = updated;
    setLimitOrders(updated);
    try {
      localStorage.setItem('zyti_limit_orders', JSON.stringify(updated));
    } catch {}

    // Difundir actualización por WebSocket Gateway a todos los dispositivos
    zytiTradingClient.publishEvent({
      type: 'LIMIT_ORDER_UPDATED',
      payload: { orderId, newLimitPrice, newSlPrice, newTpPrice }
    });

    const ord = updated.find((o) => o.id === orderId);
    if (ord) {
      addToast({
        type: 'info',
        title: isEs ? 'Orden Límite Modificada' : 'Limit Order Updated',
        message: `${ord.side.toUpperCase()} • ${ord.size} @ $${(newLimitPrice ?? ord.limitPrice).toLocaleString()}`,
        symbol: ord.symbol,
        price: newLimitPrice ?? ord.limitPrice
      });
    }
  }, [stats.lastPrice, isEs, addToast]);

  // Arrastre interactivo de la línea de entrada preview (modo Limit) en el gráfico
  const handleUpdatePreviewEntry = useCallback((newPrice: number) => {
    if (newPrice > 0 && !isNaN(newPrice)) {
      setLimitPrice(newPrice.toFixed(2));
    }
  }, []);

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      onOpenAuth?.();
      return;
    }
    if (isAccountBreached) {
      addToast({
        type: 'warning',
        title: isEs ? 'Operativa Bloqueada' : 'Trading Blocked',
        message: isEs
          ? 'Has alcanzado el límite de Drawdown de la Prop Firm. Restablece la cuenta para continuar.'
          : 'You reached the Prop Firm Drawdown limit. Reset account to continue.'
      });
      return;
    }
    if (isSubmittingOrderRef.current) return;
    isSubmittingOrderRef.current = true;
    setTimeout(() => { isSubmittingOrderRef.current = false; }, 600);

    const entryTs = (() => {
      const d = chartInstanceRef.current?.getDataList();
      return d && d.length > 0 ? d[d.length - 1].timestamp : Math.floor(Date.now() / 60000) * 60000;
    })();

    if (orderType === 'limit') {
      const limitP = parseFloat(limitPrice);
      if (!limitP || isNaN(limitP) || limitP <= 0) {
        setOrderSuccess(isEs ? 'Introduce un precio límite válido' : 'Enter a valid limit price');
        setTimeout(() => setOrderSuccess(null), 3000);
        return;
      }

      const orderReq: OrderRequest = {
        symbol: selectedPair,
        exchange: currentExchange,
        marketType: currentMarketType,
        side,
        orderType: 'limit',
        orderMode,
        amountUsdt: parseFloat(amount) || 1000,
        riskPercent,
        slPercent,
        tpPercent,
        leverage
      };

      const result = TradingEngine.createLimitOrder(
        orderReq,
        limitP,
        stats.lastPrice,
        accountMetrics,
        propFirmRulesRef.current
      );

      if (!result.success || !result.limitOrder) {
        setOrderSuccess(result.error || (isEs ? 'Error al crear orden límite' : 'Limit order error'));
        setTimeout(() => setOrderSuccess(null), 4000);
        return;
      }

      limitOrdersRef.current = [result.limitOrder!, ...limitOrdersRef.current];
      setLimitOrders(limitOrdersRef.current);
      try {
        localStorage.setItem('zyti_limit_orders', JSON.stringify(limitOrdersRef.current));
      } catch {}

      // Difundir orden límite por WebSocket Gateway a todos los dispositivos
      zytiTradingClient.publishEvent({
        type: 'LIMIT_ORDER_PLACED',
        payload: { order: result.limitOrder }
      });

      playOrderFilledSound();
      const isBuy = side === 'buy';
      const subtype = result.limitOrder.orderSubtype || (isBuy ? (limitP <= stats.lastPrice ? 'LIMIT' : 'STOP') : (limitP >= stats.lastPrice ? 'LIMIT' : 'STOP'));
      const orderLabel = `${isBuy ? 'Buy' : 'Sell'} ${subtype === 'LIMIT' ? 'Limit' : 'Stop'}`;
      addToast({
        type: isBuy ? 'buy' : 'sell',
        title: isEs ? `¡Orden ${orderLabel} Colocada!` : `${orderLabel} Order Placed!`,
        message: `${orderLabel.toUpperCase()} • ${result.limitOrder.size} @ $${limitP.toLocaleString()}`,
        symbol: selectedPair,
        price: limitP
      });

      setOrderSuccess(
        isEs
          ? `¡Orden ${orderLabel} colocada a $${limitP.toLocaleString()}!`
          : `${orderLabel} order placed at $${limitP.toLocaleString()}!`
      );
      setTimeout(() => setOrderSuccess(null), 3000);
      return;
    }

    const orderReq: OrderRequest = {
      symbol: selectedPair,
      exchange: currentExchange,
      marketType: currentMarketType,
      side,
      orderType,
      orderMode,
      amountUsdt: parseFloat(amount) || 1000,
      riskPercent,
      slPercent,
      tpPercent,
      leverage
    };

    const result = TradingEngine.openPosition(
      orderReq,
      stats.lastPrice,
      entryTs,
      accountMetrics,
      propFirmRulesRef.current
    );

    if (!result.success || !result.position) {
      setOrderSuccess(result.error || (isEs ? 'Error al validar orden' : 'Order validation error'));
      setTimeout(() => setOrderSuccess(null), 4000);
      return;
    }

    positionsRef.current = [result.position!, ...positionsRef.current];
    setPositions((prev) => [result.position!, ...prev]);
    playOrderFilledSound();

    if (workerRef.current) {
      const activeSymbols = Array.from(
        new Set([
          ...positionsRef.current.map((p) => p.symbol),
          ...limitOrdersRef.current.filter((o) => o.status === 'PENDING').map((o) => o.symbol)
        ])
      );
      workerRef.current.postMessage({
        type: 'SYNC_TRACKED_SYMBOLS',
        payload: { symbols: activeSymbols }
      });
    }

    // Persistir orden abierta asíncronamente en public.account_trades
    const targetAccountId = activeAccountId || user?.activeAccountId || user?.accounts?.[0]?.id;
    if (result.position) {
      // Difundir al WebSocket Gateway / Redis para sync multi-dispositivo instantáneo
      zytiTradingClient.publishEvent({
        type: 'TRADE_OPENED',
        payload: result.position
      });

      TradePersistenceService.persistOpenedTrade({
        id: result.position.id,
        accountId: targetAccountId,
        userId: user?.id,
        traderEmail: user?.email,
        exchange: currentExchange,
        symbol: result.position.symbol,
        side: result.position.side,
        size: result.position.sizeUnits,
        leverage: result.position.leverage,
        entryPrice: result.position.entry,
        slPrice: result.position.slPrice,
        tpPrice: result.position.tpPrice,
        openedAt: result.position.createdAt
      }).catch(() => {});
    }

    const isBuy = side === 'buy';
    addToast({
      type: isBuy ? 'buy' : 'sell',
      title: isEs ? (isBuy ? '¡Compra Ejecutada!' : '¡Venta Ejecutada!') : (isBuy ? 'Buy Filled!' : 'Sell Filled!'),
      message: `${result.position.side} • ${result.position.size} (${result.position.leverage}x)`,
      symbol: selectedPair,
      price: stats.lastPrice
    });

    setOrderSuccess(
      isEs
        ? `¡Orden ${result.position.side} ejecutada a $${stats.lastPrice.toLocaleString()}!`
        : `Order ${result.position.side} executed at $${stats.lastPrice.toLocaleString()}!`
    );
    setTimeout(() => setOrderSuccess(null), 3000);
  };

  const bestBid = orderBook.bids[0]?.price || Number((stats.lastPrice * 0.9998).toFixed(2));
  const bestAsk = orderBook.asks[0]?.price || Number((stats.lastPrice * 1.0002).toFixed(2));

  const handleQuickTrade = (quickSide: 'buy' | 'sell') => {
    if (!user) {
      onOpenAuth?.();
      return;
    }
    if (isAccountBreached) {
      addToast({
        type: 'warning',
        title: isEs ? 'Operativa Bloqueada' : 'Trading Blocked',
        message: isEs
          ? 'Has alcanzado el límite de Drawdown de la Prop Firm. Restablece la cuenta para continuar.'
          : 'You reached the Prop Firm Drawdown limit. Reset account to continue.'
      });
      return;
    }

    // Comprar se ejecuta al Ask, Vender se ejecuta al Bid
    const currentP = quickSide === 'buy' ? bestAsk : bestBid;
    const entryTs = (() => {
      const d = chartInstanceRef.current?.getDataList();
      return d && d.length > 0 ? d[d.length - 1].timestamp : Math.floor(Date.now() / 60000) * 60000;
    })();

    const defaultAmount = Math.min(1000, accountMetrics.availableBalance > 10 ? accountMetrics.availableBalance : 1000);

    const orderReq: OrderRequest = {
      symbol: selectedPair,
      exchange: currentExchange,
      marketType: currentMarketType,
      side: quickSide,
      orderType: 'market',
      orderMode: 'amount',
      amountUsdt: defaultAmount,
      slPercent,
      tpPercent,
      leverage
    };

    const result = TradingEngine.openPosition(
      orderReq,
      currentP,
      entryTs,
      accountMetrics,
      propFirmRulesRef.current
    );

    if (result.success && result.position) {
      positionsRef.current = [result.position!, ...positionsRef.current];
      setPositions((prev) => [result.position!, ...prev]);
      playOrderFilledSound();

      if (workerRef.current) {
        const activeSymbols = Array.from(
          new Set([
            ...positionsRef.current.map((p) => p.symbol),
            ...limitOrdersRef.current.filter((o) => o.status === 'PENDING').map((o) => o.symbol)
          ])
        );
        workerRef.current.postMessage({
          type: 'SYNC_TRACKED_SYMBOLS',
          payload: { symbols: activeSymbols }
        });
      }

      // Persistir orden rápida abierta asíncronamente en public.account_trades
      const targetAccId = activeAccountId || user?.activeAccountId || user?.accounts?.[0]?.id;
      if (result.position) {
        // Difundir al WebSocket Gateway / Redis para sync multi-dispositivo instantáneo
        zytiTradingClient.publishEvent({
          type: 'TRADE_OPENED',
          payload: result.position
        });

        TradePersistenceService.persistOpenedTrade({
          id: result.position.id,
          accountId: targetAccId,
          userId: user?.id,
          traderEmail: user?.email,
          exchange: currentExchange,
          symbol: result.position.symbol,
          side: result.position.side,
          size: result.position.sizeUnits,
          leverage: result.position.leverage,
          entryPrice: result.position.entry,
          slPrice: result.position.slPrice,
          tpPrice: result.position.tpPrice,
          openedAt: result.position.createdAt
        }).catch(() => {});
      }
      const isQuickBuy = quickSide === 'buy';
      addToast({
        type: isQuickBuy ? 'buy' : 'sell',
        title: isEs ? (isQuickBuy ? '¡Compra Rápida!' : '¡Venta Rápida!') : (isQuickBuy ? '1-Tap Buy Filled!' : '1-Tap Sell Filled!'),
        message: `${result.position.side} • ${result.position.size} (${result.position.leverage}x)`,
        symbol: selectedPair,
        price: currentP
      });

      setOrderSuccess(
        isEs
          ? `¡Orden 1-Toque ${result.position.side} ejecutada a $${currentP.toLocaleString()}!`
          : `1-Tap ${result.position.side} filled at $${currentP.toLocaleString()}!`
      );
      setTimeout(() => setOrderSuccess(null), 3000);
    }
  };

  // Al hacer clic sobre cualquier posición en la lista, cambiar de inmediato al par y exchange que se está operando
  const handleSelectPositionItem = useCallback((pos: PositionItem) => {
    if (pos.symbol && pos.symbol !== selectedPair) {
      handleSelectPair(pos.symbol);
    }
    if (pos.exchange && pos.exchange !== currentExchange) {
      handleSelectExchange(pos.exchange);
    }
    if (pos.marketType && pos.marketType !== currentMarketType) {
      handleSelectMarketType(pos.marketType as MarketType);
    }
    setMobileSheet(null);
  }, [selectedPair, currentExchange, currentMarketType, handleSelectPair, handleSelectExchange, handleSelectMarketType]);

  const handleSelectOrderType = useCallback((type: 'market' | 'limit') => {
    setOrderType(type);
    if (type === 'limit' && stats.lastPrice > 0) {
      setLimitPrice(stats.lastPrice.toString());
    }
  }, [stats.lastPrice]);

  // Al hacer clic sobre cualquier orden límite en la lista, cambiar de inmediato al par, exchange y cargar en panel
  const handleSelectLimitOrderItem = useCallback((ord: LimitOrderItem) => {
    if (ord.symbol && ord.symbol !== selectedPair) {
      handleSelectPair(ord.symbol);
    }
    if (ord.exchange && ord.exchange !== currentExchange) {
      handleSelectExchange(ord.exchange);
    }
    if (ord.marketType && ord.marketType !== currentMarketType) {
      handleSelectMarketType(ord.marketType as MarketType);
    }
    setOrderType('limit');
    setSide(ord.side);
    setLimitPrice(ord.limitPrice.toString());
    if (ord.slPercent) setSlPercent(ord.slPercent);
    if (ord.tpPercent) setTpPercent(ord.tpPercent);
    if (ord.leverage) setLeverage(ord.leverage);
    setIsTradingSidebarOpen(true);
    setShowOrderForm(true);
    setIsOrderFormMinimized(false);
    setMobileSheet(null);
  }, [selectedPair, currentExchange, currentMarketType, handleSelectPair, handleSelectExchange, handleSelectMarketType]);

  const renderOrderForm = () => (
    <TerminalOrderForm
      isEs={isEs}
      selectedPair={selectedPair}
      currentPrice={stats.lastPrice}
      demoBalance={demoBalance}
      side={side}
      orderType={orderType}
      limitPrice={limitPrice}
      setLimitPrice={setLimitPrice}
      amount={amount}
      leverage={leverage}
      riskPercent={riskPercent}
      slPercent={slPercent}
      tpPercent={tpPercent}
      orderMode={orderMode}
      orderSuccess={orderSuccess}
      quickTradeEnabled={quickTradeEnabled}
      showChartPreview={showChartOrderPreview}
      onToggleChartPreview={handleToggleChartOrderPreview}
      isDesktop={isDesktop}
      isMinimized={isOrderFormMinimized}
      onToggleMinimize={() => setIsOrderFormMinimized((m) => !m)}
      onClose={() => {
        setShowOrderForm(false);
        try { localStorage.setItem('zyti_show_orderform', 'false'); } catch {}
        setTimeout(() => chartInstanceRef.current?.resize(), 60);
      }}
      onToggleQuickTrade={toggleQuickTrade}
      setSide={setSide}
      setOrderType={handleSelectOrderType}
      setAmount={setAmount}
      setLeverage={handleSetLeverage}
      setRiskPercent={setRiskPercent}
      setSlPercent={setSlPercent}
      setTpPercent={setTpPercent}
      setOrderMode={setOrderMode}
      onSubmit={handlePlaceOrder}
    />
  );

  const renderOrderBook = () => (
    <TerminalOrderBook
      orderBook={orderBook}
      isMinimized={isOrderBookMinimized}
      onToggleMinimize={() => setIsOrderBookMinimized((m) => !m)}
      onClose={() => {
        setShowOrderBook(false);
        try { localStorage.setItem('zyti_show_orderbook', 'false'); } catch {}
        setTimeout(() => chartInstanceRef.current?.resize(), 60);
      }}
    />
  );

  // Cálculos de configuración previa de trading para proyectar en el gráfico
  const isPreviewLong = side === 'buy';
  const effectiveRefPrice = (orderType === 'limit' && parseFloat(limitPrice) > 0)
    ? parseFloat(limitPrice)
    : stats.lastPrice;

  const previewSlPrice = isPreviewLong
    ? Number((effectiveRefPrice * (1 - slPercent / 100)).toFixed(2))
    : Number((effectiveRefPrice * (1 + slPercent / 100)).toFixed(2));
  const previewTpPrice = isPreviewLong
    ? Number((effectiveRefPrice * (1 + tpPercent / 100)).toFixed(2))
    : Number((effectiveRefPrice * (1 - tpPercent / 100)).toFixed(2));

  const previewRiskAmountUsd = (demoBalance * riskPercent) / 100;
  const previewNotionalUsd = orderMode === 'risk'
    ? (slPercent > 0 ? previewRiskAmountUsd / (slPercent / 100) : 1000)
    : (parseFloat(amount) || 1000) * leverage;
  const previewEstimatedLossUsd = orderMode === 'risk'
    ? previewRiskAmountUsd
    : previewNotionalUsd * (slPercent / 100);
  const previewEstimatedProfitUsd = previewNotionalUsd * (tpPercent / 100);

  return (
    <div className="h-screen w-screen bg-[#fbf9f4] text-slate-900 flex flex-col font-sans overflow-hidden select-none">
      
      {/* 1. TOP HEADER INSTITUCIONAL */}
      <TerminalHeader
        isEs={isEs}
        user={user}
        selectedPair={selectedPair}
        supportedPairs={SUPPORTED_PAIRS}
        stats={stats}
        demoBalance={demoBalance}
        availableBalance={accountMetrics.availableBalance}
        equity={accountMetrics.equity}
        isMobileNavOpen={isMobileNavOpen}
        unrealizedPnL={accountMetrics.unrealizedPnL}
        positionsCount={positions.length}
        activeSection={activeSection}
        currentExchange={currentExchange}
        currentMarketType={currentMarketType}
        connectionStatus={connectionStatus}
        activeAccountId={activeAccountId}
        accounts={traderAccounts}
        dailyStartEquity={dailyStartEquityRef.current}
        tradingDaysCount={traderAccounts.find((a) => a.id === activeAccountId)?.tradingDaysCount}
        onSelectExchange={handleSelectExchange}
        onSelectMarketType={handleSelectMarketType}
        onSelectPair={handleSelectPair}
        onSelectBalanceAmount={handleSelectBalanceAmount}
        onSelectAccount={handleSelectAccount}
        onSelectSection={(sec) => setActiveSection(sec === 'exchange' ? 'exchange' : 'none')}
        onToggleMobileNav={() => setIsMobileNavOpen(!isMobileNavOpen)}
        onResetBalance={resetDemoBalance}
        onExit={onExit}
        onOpenAuth={onOpenAuth}
      />

      {/* 2. ÁREA PRINCIPAL: NAVEGACIÓN + GRÁFICO CENTRAL + PANEL LATERAL */}
      <div className="terminal-main-layout flex-1 overflow-hidden relative">
        
        {/* NAVEGACIÓN LATERAL EN ESCRITORIO (IZQUIERDA) */}
        {navPosition === 'left' && (
          <TerminalSideNav
            isEs={isEs}
            currentLang={currentLang}
            onLanguageChange={onLanguageChange}
            onUpdateUser={onUpdateUser}
            quickTradeEnabled={quickTradeEnabled}
            onToggleQuickTrade={toggleQuickTrade}
            navPosition={navPosition}
            isMobileNavOpen={isMobileNavOpen}
            activeSection={activeSection}
            user={user}
            isTradingSidebarOpen={isTradingSidebarOpen}
            showOrderForm={showOrderForm}
            showOrderBook={showOrderBook}
            showPositions={showPositions}
            onOpenTradingPanel={handleOpenTradingPanel}
            onToggleTradingSidebar={handleToggleTradingSidebar}
            onToggleOrderForm={handleToggleOrderForm}
            onToggleOrderBook={handleToggleOrderBook}
            onTogglePositions={handleTogglePositions}
            onToggleNavPosition={toggleNavPosition}
            onSelectSection={(sec) => setActiveSection(sec === 'exchange' ? 'exchange' : 'none')}
            onCloseMobileNav={() => setIsMobileNavOpen(false)}
            onExit={onExit}
          />
        )}

        {/* COLUMNA CENTRAL: TOOLBAR + KLINECHART + POSICIONES (Desktop) / MOBILE SHEET */}
        <div className="terminal-chart-wrapper relative">
          
          <TerminalToolbar
            isEs={isEs}
            timeframe={timeframe}
            favoriteTimeframes={favoriteTimeframes}
            activeIndicators={activeIndicators}
            favoriteIndicators={favoriteIndicators}
            activeDrawingTool={activeDrawingTool}
            onSelectTimeframe={handleSelectTimeframe}
            onToggleIndicator={handleToggleIndicator}
            onToggleFavoriteTimeframe={toggleFavoriteTimeframe}
            onToggleFavoriteIndicator={toggleFavoriteIndicator}
            onSelectDrawingTool={handleSelectDrawingTool}
            onCancelDrawing={handleCancelDrawing}
            onClearAllDrawings={handleClearAllDrawings}
          />

          {/* CONTENEDOR KLINECHART v9.8.6 OFICIAL */}
          <div 
            className="terminal-chart-canvas-box overflow-hidden bg-[#fbf9f4] relative"
            onContextMenu={(e) => {
              e.preventDefault();
              if (!chartInstanceRef.current || !chartContainerRef.current) return;
              const rect = chartContainerRef.current.getBoundingClientRect();
              const pixelY = e.clientY - rect.top;
              try {
                const converted = (chartInstanceRef.current as any).convertFromPixel([{ y: pixelY }], { paneId: 'candle_pane' });
                const priceVal = converted?.[0]?.value;
                if (typeof priceVal === 'number' && !isNaN(priceVal) && priceVal > 0) {
                  const roundedPrice = Number(priceVal.toFixed(2));
                  setChartContextMenu({
                    x: Math.min(e.clientX, window.innerWidth - 240),
                    y: Math.min(e.clientY, window.innerHeight - 200),
                    price: roundedPrice
                  });
                }
              } catch {}
            }}
          >
            <div 
              ref={chartContainerRef} 
              id="trading-terminal-chart" 
              className="w-full h-full block" 
            />

            {/* CESTITO DE BASURA ÚNICO AL SELECCIONAR UN DIBUJO EN EL GRÁFICO */}
            {selectedOverlayId && (
              <div className="absolute top-2.5 left-1/2 -translate-x-1/2 z-40 flex items-center gap-1.5 p-1 rounded-full bg-slate-950/90 border border-slate-700/80 shadow-xl backdrop-blur-md animate-in fade-in zoom-in-95 select-none">
                <button
                  type="button"
                  onClick={handleDeleteSelectedOverlay}
                  className="p-1.5 rounded-full bg-red-600 hover:bg-red-500 text-white transition-all active:scale-90 cursor-pointer shadow-sm"
                  title={isEs ? 'Eliminar dibujo seleccionado' : 'Delete selected drawing'}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedOverlayId(null)}
                  className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
                  title={isEs ? 'Deseleccionar' : 'Deselect'}
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}

            {/* AVISO FLOTANTE SUPERIOR CUANDO HAY HERRAMIENTA ACTIVA PARA TRAZAR */}
            {activeDrawingTool && (
              <div className="absolute top-1.5 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1.5 px-2 py-0.5 sm:px-3 sm:py-1 rounded-full bg-[#060B14]/95 border border-cyan-400/90 text-cyan-200 shadow-[0_0_18px_rgba(0,240,255,0.4)] text-[9px] sm:text-[11px] font-mono backdrop-blur-md animate-in fade-in select-none">
                <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-cyan-400 animate-pulse" />
                <span className="hidden sm:inline">{isEs ? 'Toca o haz clic en el gráfico para colocar' : 'Click/tap on chart to place'}</span>
                <span className="sm:hidden">{isEs ? 'Toca para colocar' : 'Tap to place'}</span>
                <button
                  type="button"
                  onClick={handleCancelDrawing}
                  className="p-0.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
                  title={isEs ? 'Cancelar' : 'Cancel'}
                >
                  <X className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                </button>
              </div>
            )}

            {/* BOTONES FLOTANTES SUPERIORES DE COMPRA / VENTA 1-CLICK EN ESCRITORIO (SOLO CUANDO EL PANEL DE TRADING ESTÁ OCULTO) */}
            <QuickTradeButtons
              isDesktop={isDesktop}
              visible={!isTradingSidebarOpen || !showOrderForm}
              isEs={isEs}
              lastPrice={stats.lastPrice}
              onQuickTrade={handleQuickTrade}
            />

            {/* BANNER DE INFRACCIÓN DE DRAWDOWN DE PROP FIRM (5% DIARIO O 10% TOTAL) */}
            <DrawdownBreachBanner
              isEs={isEs}
              isAccountBreached={isAccountBreached}
              breachReason={breachReason}
              onResetEvaluation={resetDemoBalance}
            />

            {/* MENÚ CONTEXTUAL FLOTANTE DE CLIC DERECHO EN EL GRÁFICO */}
            <ChartContextMenu
              isEs={isEs}
              selectedPair={selectedPair}
              lastPrice={stats.lastPrice}
              contextMenu={chartContextMenu}
              onPlacePendingOrder={handlePlacePendingOrderFromChart}
              onClose={() => setChartContextMenu(null)}
              onConfigureInPanel={(price) => {
                setLimitPrice(price.toFixed(2));
                setOrderType('limit');
                setIsTradingSidebarOpen(true);
                setShowOrderForm(true);
                setChartContextMenu(null);
              }}
            />

            {/* OVERLAY INTERACTIVO: ENTRADAS (AZUL), TAKE PROFIT (VERDE) Y STOP LOSS (ROJO) ARRASTRABLES + PREVIEW + ÓRDENES LÍMITES */}
            <PositionChartOverlay
              chart={chartInstanceRef.current}
              positions={positions.filter((p) => p.symbol === selectedPair)}
              limitOrders={limitOrders.filter((o) => o.symbol === selectedPair)}
              tradeHistory={tradeHistory}
              focusedTrade={focusedTrade}
              selectedPair={selectedPair}
              currentPrice={stats.lastPrice}
              demoBalance={demoBalance}
              isEs={isEs}
              tradeSetupPreview={{
                enabled: showChartOrderPreview && (isDesktop
                  ? (isTradingSidebarOpen && showOrderForm && !isOrderFormMinimized)
                  : (mobileSheet === 'order' || (showOrderForm && !isOrderFormMinimized))),
                orderType,
                side,
                entryPrice: effectiveRefPrice,
                slPercent,
                tpPercent,
                slPrice: previewSlPrice,
                tpPrice: previewTpPrice,
                estimatedLossUsd: previewEstimatedLossUsd,
                estimatedProfitUsd: previewEstimatedProfitUsd
              }}
              onHidePreview={handleToggleChartOrderPreview}
              onUpdatePositionSLTP={handleUpdatePositionSLTP}
              onClosePosition={handleClosePosition}
              onCancelLimitOrder={handleCancelLimitOrder}
              onUpdateLimitOrder={handleUpdateLimitOrder}
              onUpdatePreviewSLTP={handleUpdatePreviewSLTP}
              onUpdatePreviewEntry={handleUpdatePreviewEntry}
              onSetBreakEven={handleSetBreakEven}
              onSelectTrade={handleSelectHistoryTrade}
              onClearFocusedTrade={handleClearFocusedTrade}
              onReturnToLive={handleReturnToLive}
            />

            {/* MODALITO FLOTANTE CON DETALLES DE VELA AL CLICAR DIRECTAMENTE (OHLC, VOL, CAMBIO %) */}
            <CandleInfoModal
              candle={selectedCandle}
              symbol={selectedPair}
              isEs={isEs}
              onClose={() => setSelectedCandle(null)}
            />

            {/* SELECTOR DE HUSO HORARIO INSTITUCIONAL (NEW YORK / UTC / LOCAL) */}
            <div className="absolute bottom-1 right-18 sm:right-22 z-30">
              <ChartTimezoneSelector
                currentTimezone={chartTimezone}
                onSelectTimezone={handleSelectTimezone}
                isEs={isEs}
              />
            </div>

          </div>

          {/* DESKTOP: TABLA INFERIOR DE POSICIONES ABIERTAS Y ÓRDENES LÍMITES (h-36 / RESIZABLE) */}
          {showPositions && (
            <TerminalPositions
              isEs={isEs}
              positions={positions}
              limitOrders={limitOrders}
              history={tradeHistory}
              demoBalance={demoBalance}
              onClosePosition={handleClosePosition}
              onCloseAllPositions={handleCloseAllPositions}
              onCancelLimitOrder={handleCancelLimitOrder}
              onCancelAllLimitOrders={handleCancelAllLimitOrders}
              onUpdateLimitOrder={handleUpdateLimitOrder}
              onSetBreakEven={handleSetBreakEven}
              onSelectPosition={handleSelectPositionItem}
              onSelectLimitOrder={handleSelectLimitOrderItem}
              onClearHistory={resetDemoBalance}
              onSelectHistoryTrade={handleSelectHistoryTrade}
              selectedHistoryTradeId={focusedTrade?.id}
            />
          )}

        </div>

        {/* DESKTOP (>= 1024px): PANEL LATERAL ESTRECHO (280px) CON TRADING ARRIBA Y LIBRO ABAJO */}
        {isTradingSidebarOpen && (showOrderForm || showOrderBook) && (
          <div className="terminal-desktop-sidebar no-scrollbar">
            {/* 1. PANEL DE TRADING ARRIBA */}
            {showOrderForm && renderOrderForm()}

            {/* 2. LIBRO DE ÓRDENES ABAJO */}
            {showOrderBook && renderOrderBook()}
          </div>
        )}

        {/* NAVEGACIÓN LATERAL EN ESCRITORIO (DERECHA) */}
        {navPosition === 'right' && (
          <TerminalSideNav
            isEs={isEs}
            currentLang={currentLang}
            onLanguageChange={onLanguageChange}
            onUpdateUser={onUpdateUser}
            quickTradeEnabled={quickTradeEnabled}
            onToggleQuickTrade={toggleQuickTrade}
            navPosition={navPosition}
            isMobileNavOpen={isMobileNavOpen}
            activeSection={activeSection}
            user={user}
            isTradingSidebarOpen={isTradingSidebarOpen}
            showOrderForm={showOrderForm}
            showOrderBook={showOrderBook}
            showPositions={showPositions}
            onOpenTradingPanel={handleOpenTradingPanel}
            onToggleTradingSidebar={handleToggleTradingSidebar}
            onToggleOrderForm={handleToggleOrderForm}
            onToggleOrderBook={handleToggleOrderBook}
            onTogglePositions={handleTogglePositions}
            onToggleNavPosition={toggleNavPosition}
            onSelectSection={(sec) => setActiveSection(sec === 'exchange' ? 'exchange' : 'none')}
            onCloseMobileNav={() => setIsMobileNavOpen(false)}
            onExit={onExit}
          />
        )}

      </div>

      {/* 3. MÓVIL EXCLUSIVO (< 1024px): BARRA DE BOTONES INFERIOR FIJA + HOJA A MITAD DE PANTALLA (50dvh) + BOTONES 1-TOQUE */}
      {!isDesktop && (
        <TerminalMobileSheet
          isEs={isEs}
          currentLang={currentLang}
          onLanguageChange={onLanguageChange}
          onUpdateUser={onUpdateUser}
          activeSheet={mobileSheet}
          positions={positions}
          limitOrders={limitOrders}
          history={tradeHistory}
          demoBalance={demoBalance}
          riskPercent={riskPercent}
          onSetRiskPercent={setRiskPercent}
          quickTradeEnabled={quickTradeEnabled}
          onToggleQuickTrade={toggleQuickTrade}
          navPosition={navPosition}
          onToggleNavPosition={toggleNavPosition}
          lastPrice={stats.lastPrice}
          bestBid={bestBid}
          bestAsk={bestAsk}
          selectedPair={selectedPair}
          user={user}
          onExit={onExit}
          onQuickTrade={handleQuickTrade}
          setActiveSheet={setMobileSheet}
          renderOrderForm={renderOrderForm}
          renderOrderBook={renderOrderBook}
          onClosePosition={handleClosePosition}
          onCloseAllPositions={handleCloseAllPositions}
          onCancelLimitOrder={handleCancelLimitOrder}
          onCancelAllLimitOrders={handleCancelAllLimitOrders}
          onSetBreakEven={handleSetBreakEven}
          onSelectPosition={handleSelectPositionItem}
          onSelectLimitOrder={handleSelectLimitOrderItem}
          onClearHistory={resetDemoBalance}
          onSelectHistoryTrade={handleSelectHistoryTrade}
          selectedHistoryTradeId={focusedTrade?.id}
        />
      )}

      {/* 4. PANTALLA CRISTALINA GLASSMORPHISM PARA LA SECCIÓN EXCHANGE */}
      {activeSection === 'exchange' && (
        <TerminalExchangeModal
          isEs={isEs}
          onClose={() => setActiveSection('none')}
        />
      )}

      {/* 4. DRAWER MÓVIL (CUANDO EL HAMBURGUESA ESTÁ ABIERTO) */}
      {isMobileNavOpen && (
        <TerminalSideNav
          isEs={isEs}
          currentLang={currentLang}
          onLanguageChange={onLanguageChange}
          onUpdateUser={onUpdateUser}
          quickTradeEnabled={quickTradeEnabled}
          onToggleQuickTrade={toggleQuickTrade}
          navPosition={navPosition}
          isMobileNavOpen={isMobileNavOpen}
          activeSection={activeSection}
          user={user}
          isTradingSidebarOpen={isTradingSidebarOpen}
          onToggleTradingSidebar={handleToggleTradingSidebar}
          onToggleNavPosition={toggleNavPosition}
          onSelectSection={(sec) => setActiveSection(sec === 'exchange' ? 'exchange' : 'none')}
          onCloseMobileNav={() => setIsMobileNavOpen(false)}
          onExit={onExit}
        />
      )}

      {/* 5. DIAL RADIAL DE HERRAMIENTAS TÁCTIL / MÓVIL ESTILO TERMÓMETRO CRM */}
      <MobileRadialDrawingDial
        isOpen={isRadialDialOpen}
        onClose={() => setIsRadialDialOpen(false)}
        onSelectTool={handleSelectDrawingTool}
        onClearDrawings={handleClearAllDrawings}
        activeTool={activeDrawingTool}
        position={radialDialPos}
        isEs={isEs}
      />

      {/* 6. SISTEMA DE TOAST NOTIFICATIONS CON SONIDO (TP, SL, EJECUCIÓN) */}
      <TerminalToast
        toasts={toasts}
        onDismiss={dismissToast}
        isEs={isEs}
      />

    </div>
  );
};

export default TradingTerminal;
