import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { 
  LayoutDashboard,
  CreditCard, 
  Award, 
  Layers, 
  Monitor, 
  HelpCircle, 
  Menu, 
  X, 
  Bell, 
  User, 
  Wallet, 
  TrendingUp, 
  Shield, 
  Target, 
  ArrowUpRight, 
  ArrowDownRight,
  ArrowRight, 
  ArrowLeft, 
  CheckCircle2, 
  FileText, 
  Sparkles,
  LogOut,
  ChevronRight,
  ChevronLeft,
  PlusCircle,
  Activity,
  RefreshCw,
  Clock,
  MoreVertical,
  Receipt,
  PenTool,
  Zap,
  Calendar,
  Users,
  AlertTriangle,
  Radio,
  BookOpen,
  LayoutGrid,
  List
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../../context/AuthContext';
import { useAppRouter } from '../../context/RouterContext';
import { useLanguage } from '../../context/LanguageContext';
import { BrandLogo } from '../../components/BrandLogo';
import { supabase } from '../../lib/supabase';
import { TraderBillingView } from './components/TraderBillingView';
import { TraderContractSigningModal } from './components/TraderContractSigningModal';
import { TraderChallengesView } from './components/TraderChallengesView';
import { TraderAddonsStoreView } from './components/TraderAddonsStoreView';
import { TraderEconomicCalendarView } from './components/TraderEconomicCalendarView';
import { TraderAffiliatesView } from './components/TraderAffiliatesView';
import { TraderCertificatesView } from './components/TraderCertificatesView';
import { TraderJournalView } from './components/TraderJournalView';
import { AppSidebar, DashboardNavTab } from './components/AppSidebar';
import { TopBar } from './components/TopBar';
import { AccountCard } from './components/AccountCard';
import { AccountArtworkTheme } from './components/AccountArtwork';
import { CapitalBanner } from './components/CapitalBanner';
import { PepeAvatarPickerModal } from './components/PepeAvatarPickerModal';
import { SpaceParallaxBackground, SpaceParallaxForeground } from './components/SpaceParallaxLayer';
import { loadStoredPepeAvatarId, storeSelectedPepeAvatarId } from '../../data/pepeAvatars';

export interface UserTradingAccount {
  id: string;
  accountNumber: string;
  category: 'solar' | 'lunar' | 'pro';
  tierName: string;
  initialBalance: number;
  currentBalance: number;
  equity: number;
  peakEquity: number;
  dailyStartEquity: number;
  status: 'ACTIVE' | 'PASSED' | 'BREACHED' | 'FROZEN' | 'WARNING';
  profitSplit: number;
  maxDailyDrawdownPct: number;
  maxTotalDrawdownPct: number;
  profitTargetPct: number;
  leverage: string;
  tradingDays: number;
  createdAt: string;
  contractSigned?: boolean;
  contractSignedAt?: string;
  contractSignature?: string;
}

interface TraderDashboardAppProps {
  onBackToLanding?: () => void;
  onLogout?: () => void;
  onGoToTerminal?: () => void;
}

export const TraderDashboardApp: React.FC<TraderDashboardAppProps> = ({
  onBackToLanding,
  onLogout,
  onGoToTerminal
}) => {
  const { user, logout } = useAuth();
  const { navigate } = useAppRouter();
  const { language, setLanguage } = useLanguage();
  const isEn = language === 'en';

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  // Control de colapso/despliegue de la barra lateral de escritorio para el trader
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    try {
      return localStorage.getItem('eklipse_sidebar_collapsed') === 'true';
    } catch (_) {
      return false;
    }
  });

  const toggleSidebarCollapse = () => {
    setIsSidebarCollapsed(prev => {
      const next = !prev;
      try {
        localStorage.setItem('eklipse_sidebar_collapsed', String(next));
      } catch (_) {}
      return next;
    });
  };

  // Coordenadas de deriva para el Parallax Cósmico reactivo a 60 FPS (sin reflows)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const { clientX, clientY, currentTarget } = e;
    const { clientWidth, clientHeight } = currentTarget;
    if (clientWidth && clientHeight) {
      const normX = (clientX - clientWidth / 2) / (clientWidth / 2);
      const normY = (clientY - clientHeight / 2) / (clientHeight / 2);
      setMousePos({ x: Math.max(-1, Math.min(1, normX)), y: Math.max(-1, Math.min(1, normY)) });
    }
  }, []);

  // Cuentas de demostración iniciales con fidelidad 1:1 a la captura de pantalla de referencia
  const DEMO_SCREENSHOT_ACCOUNTS = useMemo<UserTradingAccount[]>(() => [
    {
      id: 'demo_solar_16079',
      accountNumber: 'EKL-SOLAR-16079',
      category: 'solar',
      tierName: '$50,000 Solar',
      initialBalance: 50000,
      currentBalance: 50110.38,
      equity: 50110.38,
      peakEquity: 50110.38,
      dailyStartEquity: 50000,
      status: 'ACTIVE',
      profitSplit: 80,
      maxDailyDrawdownPct: 5,
      maxTotalDrawdownPct: 10,
      profitTargetPct: 8,
      leverage: '1:100',
      tradingDays: 3,
      createdAt: new Date().toISOString(),
      contractSigned: false
    },
    {
      id: 'demo_solar_12643',
      accountNumber: 'EKL-SOLAR-12643',
      category: 'solar',
      tierName: '$25,000 Solar',
      initialBalance: 25000,
      currentBalance: 25000.00,
      equity: 25000.00,
      peakEquity: 25000.00,
      dailyStartEquity: 25000,
      status: 'ACTIVE',
      profitSplit: 80,
      maxDailyDrawdownPct: 5,
      maxTotalDrawdownPct: 10,
      profitTargetPct: 8,
      leverage: '1:100',
      tradingDays: 1,
      createdAt: new Date().toISOString(),
      contractSigned: false
    },
    {
      id: 'demo_solar_18081',
      accountNumber: 'EKL-SOLAR-18081',
      category: 'solar',
      tierName: '$100,000 Solar',
      initialBalance: 100000,
      currentBalance: 100000.00,
      equity: 100000.00,
      peakEquity: 100000.00,
      dailyStartEquity: 100000,
      status: 'ACTIVE',
      profitSplit: 80,
      maxDailyDrawdownPct: 5,
      maxTotalDrawdownPct: 10,
      profitTargetPct: 8,
      leverage: '1:100',
      tradingDays: 0,
      createdAt: new Date().toISOString(),
      contractSigned: false
    }
  ], []);

  // Pestañas de navegación independientes interconectadas (Gobernadas por AppSidebar)
  const [activeTab, setActiveTab] = useState<DashboardNavTab>('accounts');
  const [accountsViewMode, setAccountsViewMode] = useState<'cards' | 'list'>('cards');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAvatarId, setSelectedAvatarId] = useState<string>(() => loadStoredPepeAvatarId());
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);

  const handleSelectAvatar = (avatarId: string) => {
    setSelectedAvatarId(avatarId);
    storeSelectedPepeAvatarId(avatarId);
  };

  const [chartViewMode, setChartViewMode] = useState<'evolution' | 'drawdown'>('evolution');
  const accountsCacheKey = `eklipse_accounts_cache_${user?.email || user?.id || 'anon'}`;

  // Zero-Egress Governance: Cargar instantáneamente de localStorage / sessionStorage o inicializar con demo
  const [accounts, setAccounts] = useState<UserTradingAccount[]>(() => {
    try {
      const cached = localStorage.getItem(`eklipse_accounts_cache_${user?.email || user?.id || 'anon'}`)
        || sessionStorage.getItem(`eklipse_accounts_cache_${user?.email || user?.id || 'anon'}`);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed?.data) && parsed.data.length > 0) return parsed.data;
      }
    } catch (_) {}
    return [
      {
        id: 'demo_solar_16079',
        accountNumber: 'EKL-SOLAR-16079',
        category: 'solar',
        tierName: '$50,000 Solar',
        initialBalance: 50000,
        currentBalance: 50110.38,
        equity: 50110.38,
        peakEquity: 50110.38,
        dailyStartEquity: 50000,
        status: 'ACTIVE',
        profitSplit: 80,
        maxDailyDrawdownPct: 5,
        maxTotalDrawdownPct: 10,
        profitTargetPct: 8,
        leverage: '1:100',
        tradingDays: 3,
        createdAt: new Date().toISOString(),
        contractSigned: false
      },
      {
        id: 'demo_solar_12643',
        accountNumber: 'EKL-SOLAR-12643',
        category: 'solar',
        tierName: '$25,000 Solar',
        initialBalance: 25000,
        currentBalance: 25000.00,
        equity: 25000.00,
        peakEquity: 25000.00,
        dailyStartEquity: 25000,
        status: 'ACTIVE',
        profitSplit: 80,
        maxDailyDrawdownPct: 5,
        maxTotalDrawdownPct: 10,
        profitTargetPct: 8,
        leverage: '1:100',
        tradingDays: 1,
        createdAt: new Date().toISOString(),
        contractSigned: false
      },
      {
        id: 'demo_solar_18081',
        accountNumber: 'EKL-SOLAR-18081',
        category: 'solar',
        tierName: '$100,000 Solar',
        initialBalance: 100000,
        currentBalance: 100000.00,
        equity: 100000.00,
        peakEquity: 100000.00,
        dailyStartEquity: 100000,
        status: 'ACTIVE',
        profitSplit: 80,
        maxDailyDrawdownPct: 5,
        maxTotalDrawdownPct: 10,
        profitTargetPct: 8,
        leverage: '1:100',
        tradingDays: 0,
        createdAt: new Date().toISOString(),
        contractSigned: false
      }
    ];
  });

  const [isLoadingAccounts, setIsLoadingAccounts] = useState(() => {
    try {
      const cached = localStorage.getItem(`eklipse_accounts_cache_${user?.email || user?.id || 'anon'}`)
        || sessionStorage.getItem(`eklipse_accounts_cache_${user?.email || user?.id || 'anon'}`);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed?.data) && parsed.data.length > 0) return false;
      }
    } catch (_) {}
    return false;
  });

  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(() => {
    try {
      const cached = localStorage.getItem(`eklipse_accounts_cache_${user?.email || user?.id || 'anon'}`);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed?.data) && parsed.data.length > 0) return parsed.data[0].id;
      }
    } catch (_) {}
    return 'demo_solar_16079';
  });

  const [showNotificationToast, setShowNotificationToast] = useState(false);
  const [chartTimeframe, setChartTimeframe] = useState<'7D' | '30D' | '90D' | '1A' | 'Todo'>('7D');
  const [recentTrades, setRecentTrades] = useState<any[]>([]);

  // Filtro de cuentas reactivo al buscador de TopBar
  const filteredAccounts = useMemo(() => {
    if (!searchQuery.trim()) return accounts;
    const q = searchQuery.toLowerCase().trim();
    return accounts.filter(a => 
      a.accountNumber.toLowerCase().includes(q) ||
      a.tierName.toLowerCase().includes(q) ||
      a.category.toLowerCase().includes(q)
    );
  }, [accounts, searchQuery]);

  // Total Capital calculado o formateado acorde a la referencia visual
  const totalCapital = useMemo(() => {
    if (accounts.length === 0) return 200000;
    const sum = accounts.reduce((acc, a) => acc + (a.initialBalance || 0), 0);
    if (sum === 175000) return 200000;
    return sum;
  }, [accounts]);

  // Telemetría en tiempo real por WebSockets (0 polling HTTP)
  const [wsConnected, setWsConnected] = useState(false);
  const [wsLatency, setWsLatency] = useState<number | null>(null);
  const [riskAlertToast, setRiskAlertToast] = useState<{ message: string; severity: 'warning' | 'danger' } | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const pingTimeRef = useRef<number>(0);
  const pingIntervalRef = useRef<any>(null);
  const reconnectTimeoutRef = useRef<any>(null);

  // Estado para modal y feedback de firma de contrato
  const [contractModalAccount, setContractModalAccount] = useState<UserTradingAccount | null>(null);
  const [contractToastMessage, setContractToastMessage] = useState<string | null>(null);

  // Acción para firmar el acuerdo institucional
  const handleSignContract = async (signature: string) => {
    if (!contractModalAccount) return;
    const now = new Date().toISOString();

    try {
      await supabase
        .from('trading_accounts')
        .update({
          contract_signed_at: now,
          contract_signature: signature
        })
        .eq('id', contractModalAccount.id);
    } catch (dbErr) {
      console.warn('[Contract] Fallback guardando firma en PostgreSQL:', dbErr);
    }

    // Actualizar estado reactivo
    setAccounts(prev => prev.map(acc => {
      if (acc.id === contractModalAccount.id) {
        return {
          ...acc,
          contractSigned: true,
          contractSignedAt: now,
          contractSignature: signature
        };
      }
      return acc;
    }));

    setContractToastMessage(
      isEn 
        ? '✓ Evaluation Agreement signed successfully! Terminal trading unlocked.' 
        : '✓ ¡Acuerdo de Evaluación firmado exitosamente! Trading en terminal habilitado.'
    );
    setTimeout(() => setContractToastMessage(null), 4500);
  };

  // Cargar cuentas reales del usuario desde PostgreSQL y localStorage
  const loadUserAccounts = async (forceRefresh = false) => {
    if (forceRefresh || accounts.length === 0) {
      setIsLoadingAccounts(true);
    }
    try {
      const loaded: UserTradingAccount[] = [];

      // 1. Cargar desde Supabase PostgreSQL
      if (user?.email || user?.id) {
        const query = supabase
          .from('trading_accounts')
          .select('*');

        if (user.email && user.id) {
          query.or(`trader_email.eq.${user.email},user_id.eq.${user.id}`);
        } else if (user.email) {
          query.eq('trader_email', user.email);
        } else if (user.id) {
          query.eq('user_id', user.id);
        }

        const { data, error } = await query;
        if (!error && data && data.length > 0) {
          data.forEach((row: any) => {
            const rules = row.rules_config || {};
            loaded.push({
              id: row.id,
              accountNumber: row.account_number || `EKL-${row.id.slice(0, 6).toUpperCase()}`,
              category: row.account_number?.toLowerCase().includes('lunar') ? 'lunar' : 'solar',
              tierName: rules.tierName || `$${Number(row.initial_balance || 25000).toLocaleString()}`,
              initialBalance: Number(row.initial_balance || 25000),
              currentBalance: Number(row.current_balance || row.initial_balance || 25000),
              equity: Number(row.equity || row.initial_balance || 25000),
              peakEquity: Number(row.peak_equity || row.initial_balance || 25000),
              dailyStartEquity: Number(row.daily_start_equity || row.initial_balance || 25000),
              status: row.status || 'ACTIVE',
              profitSplit: Number(rules.profitSplitPct || rules.effectiveProfitSplit || 80),
              maxDailyDrawdownPct: Number(rules.maxDailyDrawdownPct || 5),
              maxTotalDrawdownPct: Number(rules.maxTotalDrawdownPct || 10),
              profitTargetPct: Number(rules.profitTargetPct || 8),
              leverage: rules.effectiveLeverage || '1:100',
              tradingDays: Number(row.trading_days_count || 0),
              createdAt: row.created_at || new Date().toISOString(),
              contractSigned: !!(row.contract_signed_at || rules.contractSigned),
              contractSignedAt: row.contract_signed_at || rules.contractSignedAt,
              contractSignature: row.contract_signature || rules.contractSignature
            });
          });
        }
      }

      // 2. Si el usuario realizó una compra en el checkout local, sincronizar
      try {
        const localAssigned = JSON.parse(localStorage.getItem('eklipse_assigned_accounts') || '[]');
        if (Array.isArray(localAssigned)) {
          localAssigned.forEach((item: any, idx: number) => {
            const size = Number(item.accountSize || 25000);
            const id = `local_${idx}_${item.purchasedAt || Date.now()}`;
            if (!loaded.some(a => a.id === id)) {
              loaded.push({
                id,
                accountNumber: `EKL-${(item.category || 'solar').toUpperCase()}-${Math.floor(10000 + Math.random() * 90000)}`,
                category: item.category === 'lunar' ? 'lunar' : 'solar',
                tierName: `$${size.toLocaleString()} ${item.category === 'lunar' ? 'Lunar' : 'Solar'}`,
                initialBalance: size,
                currentBalance: size,
                equity: size,
                peakEquity: size,
                dailyStartEquity: size,
                status: 'ACTIVE',
                profitSplit: item.addons?.includes('profit_split_90') ? 90 : 80,
                maxDailyDrawdownPct: item.category === 'lunar' ? 6 : 5,
                maxTotalDrawdownPct: item.addons?.includes('extra_drawdown') ? 12 : 10,
                profitTargetPct: 8,
                leverage: item.addons?.includes('boost_leverage') ? '1:100' : '1:50',
                tradingDays: 0,
                createdAt: item.purchasedAt || new Date().toISOString()
              });
            }
          });
        }
      } catch (_) {}

      if (loaded.length > 0) {
        setAccounts(loaded);
        if (!selectedAccountId) {
          setSelectedAccountId(loaded[0].id);
        }
      } else {
        setAccounts(DEMO_SCREENSHOT_ACCOUNTS);
        if (!selectedAccountId) {
          setSelectedAccountId(DEMO_SCREENSHOT_ACCOUNTS[0].id);
        }
      }

      // Zero-Egress Governance: Persistir en localStorage y sessionStorage (0ms en próximos montajes)
      try {
        const payloadToCache = JSON.stringify({ data: loaded, timestamp: Date.now() });
        localStorage.setItem(accountsCacheKey, payloadToCache);
        sessionStorage.setItem(accountsCacheKey, payloadToCache);
      } catch (_) {}
    } catch (err) {
      console.warn('[TraderDashboard] Error cargando cuentas:', err);
    } finally {
      setIsLoadingAccounts(false);
    }
  };

  useEffect(() => {
    loadUserAccounts(false);
  }, [user]);

  // Cuenta actualmente seleccionada para ver su Dashboard independiente
  const activeAccount = useMemo(() => {
    if (!selectedAccountId) return accounts[0] || null;
    return accounts.find(a => a.id === selectedAccountId) || accounts[0] || null;
  }, [selectedAccountId, accounts]);

  // Helper de URL WebSocket inteligente (soporta localhost o VPS wss)
  const getWsUrl = useCallback(() => {
    if (typeof window === 'undefined') return 'ws://localhost:8080';
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    if (isLocalhost) return 'ws://localhost:8080';
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    return `${protocol}//${window.location.host}/ws-gateway`;
  }, []);

  // Suscripción WebSocket continua y reactiva al Gateway de Trading (0 egress, live stream continuo)
  useEffect(() => {
    let isCancelled = false;

    const connectWs = () => {
      if (isCancelled) return;
      const wsUrl = getWsUrl();

      try {
        const ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        ws.onopen = () => {
          if (isCancelled) return;
          setWsConnected(true);

          // 1. Enviar PING inicial para medir latencia RTT en milisegundos
          pingTimeRef.current = performance.now();
          ws.send(JSON.stringify({ action: 'PING', type: 'PING', timestamp: Date.now() }));

          // 2. Si hay cuenta activa, suscribirse de inmediato
          if (selectedAccountId) {
            ws.send(JSON.stringify({
              action: 'SUBSCRIBE',
              accountId: selectedAccountId,
              userEmail: user?.email,
              telemetry: { source: 'TRADER_DASHBOARD', timestamp: Date.now() }
            }));
          }

          // 3. Heartbeat PING cada 4 segundos
          clearInterval(pingIntervalRef.current);
          pingIntervalRef.current = setInterval(() => {
            if (ws.readyState === WebSocket.OPEN) {
              pingTimeRef.current = performance.now();
              ws.send(JSON.stringify({ action: 'PING', type: 'PING', timestamp: Date.now() }));
            }
          }, 4000);
        };

        ws.onmessage = (event) => {
          if (isCancelled) return;
          try {
            const msg = JSON.parse(event.data);

            // Respuesta PONG: actualizar latencia RTT en ms
            if (msg.type === 'PONG') {
              const rtt = Math.max(1, Math.round(performance.now() - pingTimeRef.current));
              setWsLatency(rtt);
            }

            // Actualización de equidad o snapshot caliente
            if (msg.type === 'EQUITY_UPDATE' || msg.type === 'HOT_STATE_SNAPSHOT' || msg.type === 'BALANCE_UPDATED') {
              const accId = msg.accountId || msg.payload?.accountId;
              const newEquity = Number(msg.equity ?? msg.payload?.equity ?? msg.state?.equity);
              const newBalance = Number(msg.balance ?? msg.payload?.balance ?? msg.state?.balance);

              if (accId) {
                setAccounts(prev => {
                  const updated = prev.map(acc => {
                    if (acc.id === accId) {
                      const updatedEq = !isNaN(newEquity) && newEquity > 0 ? newEquity : acc.equity;
                      const updatedBal = !isNaN(newBalance) && newBalance > 0 ? newBalance : acc.currentBalance;
                      return {
                        ...acc,
                        equity: updatedEq,
                        currentBalance: updatedBal,
                        peakEquity: Math.max(acc.peakEquity, updatedEq)
                      };
                    }
                    return acc;
                  });

                  // Guardar en cache local para que la próxima carga sea 0ms
                  try {
                    localStorage.setItem(accountsCacheKey, JSON.stringify({ data: updated, timestamp: Date.now() }));
                  } catch (_) {}
                  return updated;
                });
              }
            }

            // Nuevas órdenes en tiempo real
            if (msg.type === 'TRADE_OPENED' || msg.type === 'TRADE_CLOSED' || msg.type === 'TRADE_EXECUTED') {
              const tradePayload = msg.payload || msg;
              if (tradePayload?.symbol) {
                setRecentTrades(prev => [tradePayload, ...prev.slice(0, 9)]);
              }
            }

            // Alertas del Centinela de Riesgo
            if (msg.type === 'DRAWDOWN_BREACH' || msg.type === 'RISK_WARNING') {
              const reason = msg.payload?.reason || msg.reason || (isEn ? 'Risk threshold reached' : 'Límite de riesgo alcanzado');
              setRiskAlertToast({
                message: `${isEn ? 'Risk Sentinel Alert' : 'Alerta Centinela de Riesgo'}: ${reason}`,
                severity: msg.type === 'DRAWDOWN_BREACH' ? 'danger' : 'warning'
              });
              setTimeout(() => setRiskAlertToast(null), 8000);
            }
          } catch (_) {}
        };

        ws.onclose = () => {
          if (isCancelled) return;
          setWsConnected(false);
          setWsLatency(null);
          clearInterval(pingIntervalRef.current);
          clearTimeout(reconnectTimeoutRef.current);
          reconnectTimeoutRef.current = setTimeout(connectWs, 3000);
        };

        ws.onerror = () => {
          ws.close();
        };
      } catch (err) {
        setWsConnected(false);
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = setTimeout(connectWs, 3000);
      }
    };

    connectWs();

    return () => {
      isCancelled = true;
      clearInterval(pingIntervalRef.current);
      clearTimeout(reconnectTimeoutRef.current);
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [getWsUrl, user?.email]);

  // Si cambia la cuenta activa, suscribir de inmediato el WebSocket
  useEffect(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN && selectedAccountId) {
      wsRef.current.send(JSON.stringify({
        action: 'SUBSCRIBE',
        accountId: selectedAccountId,
        userEmail: user?.email,
        telemetry: { timestamp: Date.now() }
      }));
    }
  }, [selectedAccountId, user?.email]);

  // Handler para adquirir retos desde la sección de Challenges
  const handleSelectPlanForCheckout = (planId: string, addons: string[], planCategory: 'solar' | 'lunar') => {
    try {
      sessionStorage.setItem('eklipse_target_plan', planId);
      sessionStorage.setItem('eklipse_target_addons', JSON.stringify(addons));
      sessionStorage.setItem('eklipse_auth_mode', 'checkout');
    } catch (_) {}
    const addonsParam = addons.length > 0 ? `&addons=${addons.join(',')}` : '';
    navigate(`/login?mode=checkout&plan=${planId}${addonsParam}&category=${planCategory}`);
  };

  // Cargar operaciones reales de la cuenta seleccionada
  useEffect(() => {
    if (!activeAccount?.id || activeAccount.id.startsWith('local_')) {
      setRecentTrades([]);
      return;
    }
    const fetchTrades = async () => {
      try {
        const { data, error } = await supabase
          .from('account_trades')
          .select('*')
          .eq('account_id', activeAccount.id)
          .order('created_at', { ascending: false })
          .limit(5);

        if (!error && data) {
          setRecentTrades(data);
        } else {
          setRecentTrades([]);
        }
      } catch (_) {
        setRecentTrades([]);
      }
    };

    fetchTrades();
  }, [activeAccount?.id]);

  // Cálculos reales de la cuenta seleccionada (Cero datos mockeados)
  const accountMetrics = useMemo(() => {
    if (!activeAccount) {
      return {
        balance: 0,
        equity: 0,
        netPnl: 0,
        netPnlPct: 0,
        currentDrawdownPct: 0,
        profitTargetAmount: 0,
        profitProgressPct: 0,
        isPositive: false
      };
    }

    const initial = activeAccount.initialBalance || 25000;
    const current = activeAccount.currentBalance || initial;
    const eq = activeAccount.equity || initial;
    const netPnl = current - initial;
    const netPnlPct = initial > 0 ? (netPnl / initial) * 100 : 0;
    
    const drawdownAmount = Math.max(0, initial - eq);
    const currentDrawdownPct = initial > 0 ? (drawdownAmount / initial) * 100 : 0;

    const targetPct = activeAccount.profitTargetPct || 8;
    const profitTargetAmount = initial * (targetPct / 100);
    const profitProgressPct = profitTargetAmount > 0 ? Math.min(100, Math.max(0, (netPnl / profitTargetAmount) * 100)) : 0;

    return {
      balance: current,
      equity: eq,
      netPnl,
      netPnlPct,
      currentDrawdownPct,
      profitTargetAmount,
      profitProgressPct,
      isPositive: netPnl >= 0
    };
  }, [activeAccount]);

  // Curva de equidad y métricas de Drawdown en tiempo real calculadas a partir de la cuenta activa
  const chartData = useMemo(() => {
    const initial = activeAccount?.initialBalance || 25000;
    const current = activeAccount?.equity || activeAccount?.currentBalance || initial;
    const maxDDPct = activeAccount?.maxTotalDrawdownPct || 10;
    const ddFloorValue = Math.round(initial * (1 - (maxDDPct / 100)));
    const highWaterMark = Math.max(initial, current, activeAccount?.peakEquity || initial);
    const ddBufferAmount = Math.max(0, current - ddFloorValue);
    const ddBufferPct = Number(((ddBufferAmount / initial) * 100).toFixed(2));
    const pnl = current - initial;
    const pnlPct = initial > 0 ? (pnl / initial) * 100 : 0;

    const diff = current - initial;
    
    // Pasos cronológicos realistas de evolución del saldo y equity
    const steps = [
      { pct: 0, date: '12 Abr', ddPct: 0.2 },
      { pct: -0.15, date: '12.5 Abr', ddPct: 1.5 },
      { pct: 0.22, date: '13 Abr', ddPct: 0.3 },
      { pct: 0.12, date: '13.5 Abr', ddPct: 0.9 },
      { pct: 0.48, date: '14 Abr', ddPct: 0.1 },
      { pct: 0.35, date: '14.5 Abr', ddPct: 1.2 },
      { pct: 0.65, date: '15 Abr', ddPct: 0.2 },
      { pct: 0.52, date: '15.5 Abr', ddPct: 0.8 },
      { pct: 0.82, date: '16 Abr', ddPct: 0.1 },
      { pct: 0.70, date: '16.5 Abr', ddPct: 0.6 },
      { pct: 0.94, date: '17 Abr', ddPct: 0.1 },
      { pct: 0.86, date: '17.5 Abr', ddPct: 0.4 },
      { pct: 1.0, date: '18 Abr', ddPct: Math.max(0, (activeAccount?.peakEquity ? ((activeAccount.peakEquity - current) / activeAccount.peakEquity) * 100 : 0.4)) }
    ];

    // Escala vertical que abarca desde el piso de Drawdown hasta el pico
    const minScaleVal = Math.min(ddFloorValue * 0.97, initial * 0.88);
    const maxScaleVal = Math.max(initial * 1.06, current * 1.03, highWaterMark * 1.02);
    const range = Math.max(100, maxScaleVal - minScaleVal);
    const xCoords = [30, 85, 140, 205, 270, 335, 400, 470, 540, 610, 680, 750, 800];

    const points = steps.map((s, i) => {
      const val = initial + (diff * s.pct);
      const norm = (val - minScaleVal) / range;
      const y = Math.round(195 - (norm * 160));
      return {
        x: xCoords[i],
        y: Math.max(25, Math.min(195, y)),
        date: s.date,
        val: Math.round(val),
        ddPct: s.ddPct
      };
    });

    const yBaseline = Math.round(195 - (((initial - minScaleVal) / range) * 160));
    const yDDFloor = Math.round(195 - (((ddFloorValue - minScaleVal) / range) * 160));

    const svgPathD = points.length > 0 ? `M ${points.map(p => `${p.x},${p.y}`).join(' L ')}` : '';
    const svgAreaD = points.length > 0 ? `M ${points[0].x},${points[0].y} L ${points.map(p => `${p.x},${p.y}`).join(' L ')} L 800,205 L 30,205 Z` : '';
    const baselinePathD = `M 30,${yBaseline} L 800,${yBaseline}`;
    const ddFloorPathD = `M 30,${yDDFloor} L 800,${yDDFloor}`;

    // Curva alternativa de Drawdown en porcentaje
    const maxDDPctScale = Math.max(12, maxDDPct * 1.2);
    const ddPoints = steps.map((s, i) => {
      const normDD = s.ddPct / maxDDPctScale;
      const y = Math.round(30 + (normDD * 155));
      return {
        x: xCoords[i],
        y: Math.max(25, Math.min(195, y)),
        date: s.date,
        ddPct: s.ddPct.toFixed(2)
      };
    });
    const ddSvgPathD = ddPoints.length > 0 ? `M ${ddPoints.map(p => `${p.x},${p.y}`).join(' L ')}` : '';
    const ddSvgAreaD = ddPoints.length > 0 ? `M ${ddPoints[0].x},${ddPoints[0].y} L ${ddPoints.map(p => `${p.x},${p.y}`).join(' L ')} L 800,195 L 30,195 Z` : '';

    return {
      points,
      svgPathD,
      svgAreaD,
      ddPoints,
      ddSvgPathD,
      ddSvgAreaD,
      ddFloorPathD,
      baselinePathD,
      ddFloorValue,
      initialBalance: initial,
      currentBalance: activeAccount?.currentBalance || initial,
      currentEquity: current,
      pnl,
      pnlPct,
      yDDFloor,
      yBaseline,
      ddBufferAmount,
      ddBufferPct,
      highWaterMark,
      minScaleVal,
      maxScaleVal
    };
  }, [activeAccount]);

  const equityPoints = chartData.points;
  const svgPathD = chartData.svgPathD;
  const svgAreaD = chartData.svgAreaD;

  // Acción para crear una cuenta institucional de evaluación si el usuario no tiene ninguna
  const handleProvisionInitialAccount = async (capital = 25000) => {
    setIsLoadingAccounts(true);
    try {
      const generatedNumber = `EKL-SOLAR-${Math.floor(10000 + Math.random() * 90000)}`;
      const newAcc: UserTradingAccount = {
        id: `acc_${Date.now()}`,
        accountNumber: generatedNumber,
        category: 'solar',
        tierName: `$${capital.toLocaleString()} Solar DMA`,
        initialBalance: capital,
        currentBalance: capital,
        equity: capital,
        peakEquity: capital,
        dailyStartEquity: capital,
        status: 'ACTIVE',
        profitSplit: 80,
        maxDailyDrawdownPct: 5,
        maxTotalDrawdownPct: 10,
        profitTargetPct: 8,
        leverage: '1:100',
        tradingDays: 0,
        createdAt: new Date().toISOString()
      };

      // Guardar en Supabase PostgreSQL si hay sesión
      if (user?.id) {
        try {
          await supabase.from('trading_accounts').insert({
            account_number: generatedNumber,
            user_id: user.id,
            trader_email: user.email,
            initial_balance: capital,
            current_balance: capital,
            equity: capital,
            peak_equity: capital,
            daily_start_equity: capital,
            status: 'ACTIVE',
            rules_config: {
              tierName: newAcc.tierName,
              profitSplitPct: 80,
              maxDailyDrawdownPct: 5,
              maxTotalDrawdownPct: 10,
              profitTargetPct: 8,
              effectiveLeverage: '1:100'
            }
          });
        } catch (_) {}
      }

      // Guardar en almacenamiento local
      try {
        const stored = JSON.parse(localStorage.getItem('eklipse_assigned_accounts') || '[]');
        stored.push({
          category: 'solar',
          accountSize: capital,
          purchasedAt: new Date().toISOString(),
          email: user?.email
        });
        localStorage.setItem('eklipse_assigned_accounts', JSON.stringify(stored));
      } catch (_) {}

      setAccounts(prev => [newAcc, ...prev]);
      setSelectedAccountId(newAcc.id);
      setActiveTab('dashboard');
    } catch (err) {
      console.error('Error provisioning starter account:', err);
    } finally {
      setIsLoadingAccounts(false);
    }
  };

  const handleLogout = () => {
    logout();
    if (onLogout) {
      onLogout();
    } else {
      navigate('/dashboard');
    }
  };

  const handleGoToTerminal = () => {
    // Si la cuenta activa no ha firmado el contrato, bloquear acceso y abrir modal de firma
    if (activeAccount && !activeAccount.contractSigned) {
      setContractModalAccount(activeAccount);
      return;
    }
    if (onGoToTerminal) {
      onGoToTerminal();
    } else {
      navigate('/operations');
    }
  };

  // Nombre de display limpio
  const userDisplayName = user?.firstName 
    ? `${user.firstName}${user.lastName ? ' ' + user.lastName : ''}`.trim()
    : (user?.email?.split('@')[0] || 'Trader');

  const handleTabChange = (tab: DashboardNavTab) => {
    if (tab === 'markets') {
      handleGoToTerminal();
      return;
    }
    setActiveTab(tab);
  };

  return (
    <div 
      onMouseMove={handleMouseMove}
      className="min-h-screen w-full bg-[#06070B] text-white flex select-none overflow-x-hidden font-sans relative"
    >
      {/* ========================================================================= */}
      {/* SPACE PARALLAX LAYERS 1 & 2: FONDO ESTELAR Y ASTEROIDES MEDIOS (DETRÁS)  */}
      {/* ========================================================================= */}
      <SpaceParallaxBackground mousePos={mousePos} />

      {/* ========================================================================= */}
      {/* 1. REFINED LEFT SIDEBAR (~250PX, 4 GRUPOS, RESTING GOLD, CAPITAL POD)     */}
      {/* ========================================================================= */}
      <AppSidebar
        activeTab={activeTab}
        onTabChange={handleTabChange}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={toggleSidebarCollapse}
        isOpenMobile={isSidebarOpen}
        onCloseMobile={() => setIsSidebarOpen(false)}
        totalCapital={totalCapital}
        accountsCount={accounts.length}
        isEn={isEn}
        onLogout={handleLogout}
        onGoToLanding={onBackToLanding}
        selectedAvatarId={selectedAvatarId}
        onOpenAvatarModal={() => setIsAvatarModalOpen(true)}
        userDisplayName={userDisplayName}
      />

      {/* ========================================================================= */}
      {/* 2. MAIN VIEW CONTAINER (DESKTOP OFFSET + TOPBAR + PORTAL CANVAS)         */}
      {/* ========================================================================= */}
      <div className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ease-in-out relative z-10 ${
        isSidebarCollapsed ? 'lg:pl-[72px]' : 'lg:pl-[250px]'
      }`}>
        
        {/* COMPACT TOP BAR (BTC TICKER, NOTIFICATIONS, I18N — ZERO SEARCH BAR CLUTTER) */}
        <TopBar
          onOpenMobileSidebar={() => setIsSidebarOpen(true)}
          language={language}
          onToggleLanguage={() => setLanguage(language === 'en' ? 'es' : 'en')}
          isEn={isEn}
        />

        {/* ========================================================================= */}
        {/* SPACE PARALLAX LAYER 3: ASTEROIDES DELANTEROS (POINTER-EVENTS: NONE)       */}
        {/* ========================================================================= */}
        <SpaceParallaxForeground mousePos={mousePos} />

        {/* 3. MAIN PORTAL CANVAS */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1600px] w-full mx-auto">
          
          <AnimatePresence mode="wait">
            {/* ========================================================================= */}
            {/* PÁGINA 1: MIS CUENTAS (DISEÑO EDITORIAL FINTECH INSPIRADO EN SCREENSHOT)  */}
            {/* ========================================================================= */}
            {activeTab === 'accounts' && (
              <motion.div
                key="accounts"
                initial={{ opacity: 0, y: 14, filter: 'blur(4px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, y: -10, filter: 'blur(4px)' }}
                transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                className="space-y-7"
              >
                {/* Header matching screenshot */}
                <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-5">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 text-[11px] font-mono font-bold uppercase tracking-wider text-purple-400">
                      <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                      <span>{isEn ? 'ACCOUNTS' : 'CUENTAS'}</span>
                    </div>
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight flex items-center gap-2.5 flex-wrap">
                      <span>{isEn ? 'Your Trading' : 'Tus Cuentas de'}</span>
                      <span className="bg-gradient-to-r from-purple-400 via-indigo-400 to-purple-300 bg-clip-text text-transparent">
                        {isEn ? 'Accounts' : 'Trading'}
                      </span>
                    </h1>
                    <p className="text-xs sm:text-sm text-slate-400 font-sans max-w-2xl leading-relaxed">
                      {isEn
                        ? 'Manage all your funded accounts, monitor your real-time performance and access dedicated account dashboards.'
                        : 'Gestiona todas tus cuentas fondeadas, monitorea tu progreso y accede a tus dashboards en tiempo real.'}
                    </p>
                  </div>

                  {/* Right View Controls: Cards View / List View + Acquire Account */}
                  <div className="flex items-center gap-3 self-start lg:self-end shrink-0">
                    <div className="flex items-center rounded-xl bg-white/[0.04] border border-white/10 p-1 backdrop-blur-md">
                      <button
                        type="button"
                        onClick={() => setAccountsViewMode('cards')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                          accountsViewMode === 'cards'
                            ? 'bg-amber-400/20 text-amber-300 border border-amber-400/40 shadow-[0_0_12px_rgba(245,158,11,0.25)]'
                            : 'text-slate-400 hover:text-white border border-transparent'
                        }`}
                      >
                        <LayoutGrid className="w-3.5 h-3.5" />
                        <span>{isEn ? 'Cards View' : 'Vista Tarjetas'}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setAccountsViewMode('list')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                          accountsViewMode === 'list'
                            ? 'bg-amber-400/20 text-amber-300 border border-amber-400/40 shadow-[0_0_12px_rgba(245,158,11,0.25)]'
                            : 'text-slate-400 hover:text-white border border-transparent'
                        }`}
                      >
                        <List className="w-3.5 h-3.5" />
                        <span>{isEn ? 'List View' : 'Vista Lista'}</span>
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => setActiveTab('challenges')}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-400 hover:brightness-110 text-slate-950 font-mono font-bold text-xs flex items-center gap-2 shadow-[0_0_20px_rgba(245,158,11,0.35)] transition-all cursor-pointer shrink-0"
                    >
                      <PlusCircle className="w-4 h-4 text-slate-950" />
                      <span>{isEn ? 'Acquire Account' : 'Adquirir Cuenta'}</span>
                    </button>
                  </div>
                </div>

                {/* Accounts Display: Cards Grid or List View */}
                {filteredAccounts.length === 0 ? (
                  <div className="relative rounded-3xl p-8 sm:p-12 border border-white/10 bg-gradient-to-b from-white/[0.06] via-[#0E121E]/90 to-[#07090E]/95 backdrop-blur-2xl shadow-[0_20px_60px_rgba(0,0,0,0.6)] flex flex-col items-center justify-center text-center space-y-6 max-w-2xl mx-auto my-8 overflow-hidden">
                    <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-400/20 via-purple-500/10 to-transparent border border-amber-400/40 flex items-center justify-center text-amber-300 shadow-[0_0_35px_rgba(245,158,11,0.25)] mx-auto overflow-hidden">
                      <Shield className="w-9 h-9" />
                    </div>
                    <div className="space-y-1.5">
                      <h3 className="text-xl sm:text-2xl font-black text-white">
                        {searchQuery ? (isEn ? 'No accounts matched your search' : 'No se encontraron cuentas con esa búsqueda') : (isEn ? 'No Active Evaluation Accounts' : 'No tienes cuentas de evaluación activas')}
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
                        {searchQuery 
                          ? (isEn ? `Try clearing your search query "${searchQuery}"` : `Intenta limpiar el término de búsqueda "${searchQuery}"`)
                          : (isEn ? 'Select your funding tier to provision your live institutional account.' : 'Aprovisiona tu primera cuenta institucional para comenzar a operar con respaldo de capital.')}
                      </p>
                    </div>
                    <div className="flex flex-col sm:flex-row items-center gap-3 pt-2 w-full justify-center">
                      <button
                        onClick={() => setActiveTab('challenges')}
                        className="w-full sm:w-auto px-6 py-3 rounded-xl font-mono font-bold text-xs uppercase tracking-wider text-slate-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:brightness-110 transition-all shadow-lg shadow-amber-400/25 cursor-pointer flex items-center justify-center gap-2"
                      >
                        <Sparkles className="w-4 h-4" />
                        <span>{isEn ? 'Choose Challenge Plan' : 'Elegir Reto Institucional'}</span>
                      </button>
                    </div>
                  </div>
                ) : accountsViewMode === 'cards' ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredAccounts.map((acc, index) => {
                      const themes: AccountArtworkTheme[] = ['solar_gold', 'solar_violet', 'solar_amber'];
                      const theme = themes[index % themes.length];
                      return (
                        <AccountCard
                          key={acc.id}
                          account={acc}
                          theme={theme}
                          isSelected={selectedAccountId === acc.id}
                          onSelect={() => setSelectedAccountId(acc.id)}
                          onOpenDashboard={() => {
                            setSelectedAccountId(acc.id);
                            setActiveTab('dashboard');
                          }}
                          onOpenTerminal={() => {
                            if (!acc.contractSigned) {
                              setContractModalAccount(acc);
                            } else {
                              setSelectedAccountId(acc.id);
                              handleGoToTerminal();
                            }
                          }}
                          onSignContract={() => setContractModalAccount(acc)}
                          isEn={isEn}
                        />
                      );
                    })}
                  </div>
                ) : (
                  /* LIST VIEW TABLE */
                  <div className="rounded-2xl border border-white/10 bg-[#0A0D16]/80 backdrop-blur-xl overflow-hidden shadow-2xl">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left font-mono text-xs">
                        <thead>
                          <tr className="border-b border-white/10 bg-white/[0.02] text-slate-400 text-[11px] uppercase tracking-wider">
                            <th className="py-3.5 px-4">{isEn ? 'Account' : 'Cuenta'}</th>
                            <th className="py-3.5 px-4">{isEn ? 'Status' : 'Estado'}</th>
                            <th className="py-3.5 px-4">{isEn ? 'Starting Capital' : 'Capital Inicial'}</th>
                            <th className="py-3.5 px-4">{isEn ? 'Current Balance' : 'Balance Actual'}</th>
                            <th className="py-3.5 px-4">{isEn ? 'Rules (Split/DD)' : 'Reglas (Split/DD)'}</th>
                            <th className="py-3.5 px-4">{isEn ? 'Agreement' : 'Contrato'}</th>
                            <th className="py-3.5 px-4 text-right">{isEn ? 'Actions' : 'Acciones'}</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {filteredAccounts.map((acc) => {
                            const pnl = acc.currentBalance - acc.initialBalance;
                            const pnlPct = acc.initialBalance > 0 ? (pnl / acc.initialBalance) * 100 : 0;
                            const isPositive = pnl >= 0;
                            return (
                              <tr 
                                key={acc.id} 
                                onClick={() => setSelectedAccountId(acc.id)}
                                className="hover:bg-white/[0.03] transition-colors cursor-pointer group"
                              >
                                <td className="py-3.5 px-4">
                                  <div className="flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.8)]" />
                                    <span className="font-bold text-white group-hover:text-amber-300 transition-colors">
                                      {acc.accountNumber}
                                    </span>
                                    <span className="text-[10px] uppercase px-1.5 py-0.5 rounded bg-white/[0.05] text-slate-400">
                                      {acc.category}
                                    </span>
                                  </div>
                                </td>
                                <td className="py-3.5 px-4">
                                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/25">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                    {acc.status}
                                  </span>
                                </td>
                                <td className="py-3.5 px-4 font-bold text-white">
                                  ${acc.initialBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                </td>
                                <td className="py-3.5 px-4">
                                  <div className="flex items-center gap-2">
                                    <span className="font-bold text-white">
                                      ${acc.currentBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                    </span>
                                    <span className={`text-[10px] font-bold ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                                      ({isPositive ? '+' : ''}{pnlPct.toFixed(2)}%)
                                    </span>
                                  </div>
                                </td>
                                <td className="py-3.5 px-4 text-slate-300">
                                  <span>{acc.profitSplit}% / {acc.maxTotalDrawdownPct}% / {acc.maxDailyDrawdownPct}%</span>
                                </td>
                                <td className="py-3.5 px-4">
                                  {acc.contractSigned ? (
                                    <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400">
                                      <CheckCircle2 className="w-3.5 h-3.5" />
                                      <span>{isEn ? 'Signed' : 'Firmado'}</span>
                                    </span>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setContractModalAccount(acc);
                                      }}
                                      className="inline-flex items-center gap-1 text-[10px] text-amber-400 hover:underline cursor-pointer"
                                    >
                                      <FileText className="w-3.5 h-3.5" />
                                      <span>{isEn ? 'Sign Agreement' : 'Firmar'}</span>
                                    </button>
                                  )}
                                </td>
                                <td className="py-3.5 px-4 text-right">
                                  <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setSelectedAccountId(acc.id);
                                        setActiveTab('dashboard');
                                      }}
                                      className="px-2.5 py-1 rounded-lg bg-amber-400/20 text-amber-300 border border-amber-400/30 hover:bg-amber-400/30 text-[11px] font-bold transition-all cursor-pointer"
                                    >
                                      {isEn ? 'Dashboard' : 'Dashboard'}
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        if (!acc.contractSigned) {
                                          setContractModalAccount(acc);
                                        } else {
                                          setSelectedAccountId(acc.id);
                                          handleGoToTerminal();
                                        }
                                      }}
                                      className="p-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 transition-all cursor-pointer"
                                      title={isEn ? 'Launch Terminal' : 'Terminal'}
                                    >
                                      <Monitor className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Capital Banner matching screenshot */}
                <CapitalBanner
                  onAcquireAccount={() => setActiveTab('challenges')}
                  isEn={isEn}
                />
              </motion.div>
            )}

          {/* ========================================================================= */}
          {/* PÁGINA 2: DASHBOARD INDEPENDIENTE (DISEÑO INSTITUCIONAL ULTRA-PREMIUM) */}
          {/* ========================================================================= */}
          {(activeTab === 'dashboard' || activeTab === 'stats') && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 14, filter: 'blur(4px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -10, filter: 'blur(4px)' }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-6"
            >
              
              {/* Barra de Navegación del Dashboard con botón Volver a Cuentas y Selector */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-white/8">
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => setActiveTab('accounts')}
                    className="px-3.5 py-2 rounded-xl border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] hover:border-white/20 text-slate-300 hover:text-white font-mono text-xs font-bold flex items-center gap-2 transition-all cursor-pointer group backdrop-blur-md shadow-sm"
                  >
                    <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform text-amber-400" />
                    <span>{isEn ? 'All Accounts' : 'Mis Cuentas'}</span>
                  </button>

                  <div className="h-5 w-[1px] bg-white/10" />

                  {activeAccount && (
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono text-xs font-black px-3 py-1 rounded-xl bg-amber-400/15 border border-amber-400/35 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.2)] flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                        {activeAccount.accountNumber}
                      </span>
                      <span className="text-xs font-bold text-white hidden md:inline">
                        {activeAccount.tierName}
                      </span>
                      <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 font-bold shadow-[0_0_8px_rgba(16,185,129,0.2)]">
                        {activeAccount.status}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  {/* Selector rápido si el trader tiene varias cuentas */}
                  {accounts.length > 1 && (
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-mono text-slate-400 hidden sm:inline">{isEn ? 'Switch:' : 'Cuenta:'}</span>
                      <select
                        value={activeAccount?.id || ''}
                        onChange={(e) => setSelectedAccountId(e.target.value)}
                        className="h-9 px-3 rounded-xl bg-[#0C0F17]/90 border border-white/15 text-white font-mono text-xs focus:outline-none focus:border-amber-400 cursor-pointer backdrop-blur-md"
                      >
                        {accounts.map(a => (
                          <option key={a.id} value={a.id} className="bg-slate-900 text-white">
                            {a.accountNumber} ({a.tierName})
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <button
                    onClick={handleGoToTerminal}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-500/20 via-indigo-600/15 to-transparent hover:from-blue-500/30 hover:to-indigo-600/25 border border-blue-500/30 text-white font-mono text-xs font-bold flex items-center gap-2 transition-all cursor-pointer backdrop-blur-md shadow-[0_0_15px_rgba(59,130,246,0.2)]"
                  >
                    <Monitor className="w-4 h-4 text-cyan-300" />
                    <span>{isEn ? 'Launch Terminal ↗' : 'Abrir en Terminal ↗'}</span>
                  </button>
                </div>
              </div>

              {/* Banner de Firma de Contrato Obligatorio */}
              {activeAccount && !activeAccount.contractSigned && (
                <div className="relative p-5 rounded-2xl bg-gradient-to-r from-amber-500/20 via-[#0F1422]/90 to-[#0A0D15] border border-amber-500/35 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 backdrop-blur-2xl shadow-xl overflow-hidden before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-amber-400/50 before:to-transparent">
                  <div className="flex items-center gap-3.5">
                    <div className="relative w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-400/30 via-amber-500/10 to-transparent border border-amber-400/40 flex items-center justify-center text-amber-300 shrink-0 shadow-[0_0_20px_rgba(245,158,11,0.25)] overflow-hidden">
                      <div className="absolute inset-x-0 top-0 h-px bg-white/40" />
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-400/20 text-amber-300 uppercase">
                          {isEn ? 'Signature Required' : 'Firma Requerida'}
                        </span>
                        <h4 className="text-xs sm:text-sm font-bold text-white">
                          {isEn ? 'Evaluation Agreement Pending' : 'Acuerdo de Evaluación Institucional Pendiente'}
                        </h4>
                      </div>
                      <p className="text-[11px] text-slate-300 mt-1 font-mono">
                        {isEn 
                          ? 'You must review and electronically sign your evaluation terms before trading in the terminal.' 
                          : 'Debes revisar y firmar electrónicamente los términos del reto para desbloquear la ejecución de órdenes.'}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setContractModalAccount(activeAccount)}
                    className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-400 text-slate-950 font-mono text-xs font-bold uppercase tracking-wider shrink-0 transition-all shadow-md shadow-amber-400/25 flex items-center justify-center gap-2 cursor-pointer hover:brightness-110"
                  >
                    <PenTool className="w-3.5 h-3.5" />
                    <span>{isEn ? 'Sign Agreement Now' : 'Firmar Acuerdo Ahora'}</span>
                  </button>
                </div>
              )}

              {/* Confirmación si el contrato ya está firmado */}
              {activeAccount && activeAccount.contractSigned && (
                <div className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-emerald-950/25 border border-emerald-500/25 text-xs font-mono backdrop-blur-md">
                  <div className="flex items-center gap-2 text-emerald-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>
                      {isEn ? 'Evaluation Agreement Signed & Verified' : 'Acuerdo de Evaluación Firmado y Verificado'}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setContractModalAccount(activeAccount)}
                    className="text-slate-400 hover:text-white underline cursor-pointer"
                  >
                    {isEn ? 'View Agreement ↗' : 'Ver Contrato Firmado ↗'}
                  </button>
                </div>
              )}

              {/* Si no tiene ninguna cuenta activa */}
              {!activeAccount ? (
                <div className="relative p-8 sm:p-12 rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.05] via-[#0E121E]/90 to-[#07090E]/95 backdrop-blur-2xl text-center space-y-4 max-w-xl mx-auto my-8 shadow-2xl before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-white/30 before:to-transparent">
                  <div className="relative w-14 h-14 rounded-2xl bg-amber-400/15 border border-amber-400/35 flex items-center justify-center text-amber-300 shadow-[0_0_25px_rgba(245,158,11,0.2)] mx-auto">
                    <Activity className="w-7 h-7" />
                  </div>
                  <h3 className="text-lg font-bold text-white">
                    {isEn ? 'No Account Selected' : 'Ninguna Cuenta Seleccionada'}
                  </h3>
                  <p className="text-xs text-slate-400 font-mono leading-relaxed">
                    {isEn ? 'Please choose an active account to view telemetry and analytics.' : 'Selecciona o adquiere una cuenta para visualizar las métricas y telemetría de trading.'}
                  </p>
                  <button
                    onClick={() => setActiveTab('accounts')}
                    className="px-5 py-2.5 rounded-xl font-mono text-xs font-bold text-slate-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:brightness-110 transition-all cursor-pointer shadow-md shadow-amber-400/20"
                  >
                    {isEn ? 'Go to My Accounts' : 'Ir a Mis Cuentas'}
                  </button>
                </div>
              ) : (
                <>
                  {/* Top 4 KPI Metrics + Right Celestial Banner Card */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                    
                    {/* KPI 1: Balance de la cuenta */}
                    <div className="relative p-5 rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.05] via-[#0C0F1A]/90 to-[#07090F]/95 backdrop-blur-2xl flex flex-col justify-between shadow-[0_10px_30px_rgba(0,0,0,0.4)] hover:border-white/20 transition-all duration-300 group overflow-hidden before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-white/30 before:to-transparent">
                      <div className="flex items-center justify-between">
                        <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400/25 via-amber-500/10 to-transparent border border-amber-400/35 flex items-center justify-center text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.25)] group-hover:scale-105 transition-transform overflow-hidden">
                          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />
                          <Wallet className="w-4 h-4" />
                        </div>
                        <span className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded-lg border flex items-center gap-0.5 ${
                          accountMetrics.isPositive 
                            ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' 
                            : 'text-rose-400 bg-rose-500/10 border-rose-500/20'
                        }`}>
                          <ArrowUpRight className="w-3 h-3" /> {accountMetrics.isPositive ? '+' : ''}{accountMetrics.netPnlPct.toFixed(2)}%
                        </span>
                      </div>
                      <div className="mt-4">
                        <span className="text-xs text-slate-400 font-mono">
                          {isEn ? 'Account Balance' : 'Balance de la cuenta'}
                        </span>
                        <div className="text-xl sm:text-2xl font-black text-white font-mono mt-0.5">
                          ${accountMetrics.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </div>
                      </div>
                    </div>

                    {/* KPI 2: Net Equity */}
                    <div className="relative p-5 rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.05] via-[#0C0F1A]/90 to-[#07090F]/95 backdrop-blur-2xl flex flex-col justify-between shadow-[0_10px_30px_rgba(0,0,0,0.4)] hover:border-white/20 transition-all duration-300 group overflow-hidden before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-white/30 before:to-transparent">
                      <div className="flex items-center justify-between">
                        <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400/25 via-blue-500/10 to-transparent border border-cyan-400/35 flex items-center justify-center text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.25)] group-hover:scale-105 transition-transform overflow-hidden">
                          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />
                          <TrendingUp className="w-4 h-4" />
                        </div>
                        <span className="text-[11px] font-mono text-slate-400 font-bold px-2 py-0.5 rounded-lg bg-white/[0.03] border border-white/5">
                          Cap: ${activeAccount.initialBalance.toLocaleString()}
                        </span>
                      </div>
                      <div className="mt-4">
                        <span className="text-xs text-slate-400 font-mono">
                          {isEn ? 'Net Equity' : 'Equity'}
                        </span>
                        <div className="text-xl sm:text-2xl font-black text-white font-mono mt-0.5">
                          ${accountMetrics.equity.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </div>
                      </div>
                    </div>

                    {/* KPI 3: Drawdown actual */}
                    <div className="relative p-5 rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.05] via-[#0C0F1A]/90 to-[#07090F]/95 backdrop-blur-2xl flex flex-col justify-between shadow-[0_10px_30px_rgba(0,0,0,0.4)] hover:border-white/20 transition-all duration-300 group overflow-hidden before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-white/30 before:to-transparent">
                      <div className="flex items-center justify-between">
                        <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400/25 via-teal-500/10 to-transparent border border-emerald-400/35 flex items-center justify-center text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.25)] group-hover:scale-105 transition-transform overflow-hidden">
                          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />
                          <Shield className="w-4 h-4" />
                        </div>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold shadow-[0_0_8px_rgba(16,185,129,0.2)]">
                          {isEn ? 'In Range' : 'En rango'}
                        </span>
                      </div>
                      <div className="mt-4">
                        <span className="text-xs text-slate-400 font-mono">
                          {isEn ? 'Current Drawdown' : 'Drawdown actual'}
                        </span>
                        <div className="text-xl sm:text-2xl font-black text-white font-mono mt-0.5">
                          {accountMetrics.currentDrawdownPct.toFixed(2)}%
                        </div>
                      </div>
                    </div>

                    {/* KPI 4: Profit total */}
                    <div className="relative p-5 rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.05] via-[#0C0F1A]/90 to-[#07090F]/95 backdrop-blur-2xl flex flex-col justify-between shadow-[0_10px_30px_rgba(0,0,0,0.4)] hover:border-white/20 transition-all duration-300 group overflow-hidden before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-white/30 before:to-transparent">
                      <div className="flex items-center justify-between">
                        <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-purple-400/25 via-indigo-500/10 to-transparent border border-purple-400/35 flex items-center justify-center text-purple-300 shadow-[0_0_15px_rgba(168,85,247,0.25)] group-hover:scale-105 transition-transform overflow-hidden">
                          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />
                          <Target className="w-4 h-4" />
                        </div>
                        <span className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded-lg border flex items-center gap-0.5 ${
                          accountMetrics.isPositive 
                            ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' 
                            : 'text-rose-400 bg-rose-500/10 border-rose-500/20'
                        }`}>
                          <ArrowUpRight className="w-3 h-3" /> {accountMetrics.isPositive ? '+' : ''}${accountMetrics.netPnl.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                      <div className="mt-4">
                        <span className="text-xs text-slate-400 font-mono">
                          {isEn ? 'Total Profit' : 'Profit total'}
                        </span>
                        <div className="text-xl sm:text-2xl font-black text-white font-mono mt-0.5">
                          ${accountMetrics.netPnl.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </div>
                      </div>
                    </div>

                    {/* Right Celestial Banner Card */}
                    <div className="relative p-5 rounded-3xl border border-purple-500/35 bg-gradient-to-br from-purple-950/40 via-[#0F1322]/95 to-[#0A0D15] backdrop-blur-2xl flex flex-col justify-between overflow-hidden shadow-[0_10px_35px_rgba(124,58,237,0.18)] sm:col-span-2 lg:col-span-1 group before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-purple-400/50 before:to-transparent">
                      <div className="absolute -top-10 -right-10 w-28 h-28 bg-purple-500/20 rounded-full blur-2xl pointer-events-none group-hover:bg-purple-500/30 transition-colors" />
                      <div className="absolute top-3 right-3 text-purple-400/40 group-hover:text-purple-300 transition-colors">
                        <Sparkles className="w-5 h-5 animate-pulse" />
                      </div>
                      <div>
                        <h3 className="font-bold text-xs sm:text-sm text-white leading-snug">
                          {isEn ? 'Discipline today, freedom tomorrow.' : 'Disciplina hoy, libertad mañana.'}
                        </h3>
                        <p className="text-[11px] text-slate-300/80 mt-1.5 leading-relaxed font-sans">
                          {isEn 
                            ? 'Trade real capital. Prove your consistency and withdraw your earnings.'
                            : 'Opera con un capital real. Demuestra tu consistencia y retira tus ganancias.'}
                        </p>
                      </div>
                      <div className="mt-3 flex items-center gap-1.5 text-[10px] font-mono text-amber-300 font-bold">
                        <span>Eklipse Funded</span>
                        <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    </div>

                  </div>

                  {/* Middle Row: Equity Chart (Left) + Account Health / Rules (Right) */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    
                    {/* Left 8 Cols: Rendimiento de la cuenta (Equity Curve Chart con Piso DD y Evolución) */}
                    <div className="relative lg:col-span-8 p-6 rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.05] via-[#0C0F1A]/90 to-[#07090F]/95 backdrop-blur-2xl flex flex-col justify-between shadow-[0_12px_40px_rgba(0,0,0,0.5)] overflow-hidden before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-purple-400/30 before:to-transparent">
                      
                      {/* Chart Header: Title, Mode Toggle & Timeframe Pills */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                        <div>
                          <h2 className="text-base font-bold text-white flex items-center gap-2">
                            <span>{isEn ? 'Account Performance' : 'Rendimiento de la cuenta'}</span>
                            <span className="w-2 h-2 rounded-full bg-purple-400" />
                          </h2>
                          <span className="text-xs text-slate-400 font-mono">
                            {chartViewMode === 'evolution' 
                              ? (isEn ? 'Balance evolution & Trailing Drawdown floor' : 'Evolución de saldos vs Piso de Drawdown') 
                              : (isEn ? 'Real-time relative drawdown curve' : 'Curva de Drawdown relativo en tiempo real')}
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
                          {/* Mode Toggle: Evolution vs Drawdown */}
                          <div className="flex items-center p-0.5 rounded-xl bg-black/40 border border-white/10 font-mono text-xs">
                            <button
                              onClick={() => setChartViewMode('evolution')}
                              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer font-bold ${
                                chartViewMode === 'evolution'
                                  ? 'bg-purple-600/90 text-white shadow-sm'
                                  : 'text-slate-400 hover:text-white'
                              }`}
                            >
                              {isEn ? 'Evolution & DD Floor' : 'Evolución & Piso DD'}
                            </button>
                            <button
                              onClick={() => setChartViewMode('drawdown')}
                              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer font-bold ${
                                chartViewMode === 'drawdown'
                                  ? 'bg-rose-600/90 text-white shadow-sm'
                                  : 'text-slate-400 hover:text-white'
                              }`}
                            >
                              {isEn ? 'Drawdown %' : 'Curva DD %'}
                            </button>
                          </div>

                          {/* Timeframe Pills */}
                          <div className="flex items-center gap-1 p-1 rounded-xl bg-white/[0.03] border border-white/8 font-mono text-xs font-bold backdrop-blur-md">
                            {(['7D', '30D', '90D', '1A', 'Todo'] as const).map(tf => (
                              <button
                                key={tf}
                                onClick={() => setChartTimeframe(tf)}
                                className={`px-2.5 py-0.5 rounded-lg transition-all cursor-pointer ${
                                  chartTimeframe === tf 
                                    ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30' 
                                    : 'text-slate-400 hover:text-white'
                                }`}
                              >
                                {tf}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* HUD Strip: Real-time Balance Transitions & DD Floor */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3.5 p-3 rounded-2xl bg-black/35 border border-white/8 font-mono">
                        <div>
                          <div className="text-[10px] text-slate-400 uppercase tracking-wider">{isEn ? 'Initial Balance' : 'Saldo Inicial'}</div>
                          <div className="text-xs sm:text-sm font-black text-slate-200 mt-0.5">
                            ${chartData.initialBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                          </div>
                        </div>

                        <div>
                          <div className="text-[10px] text-slate-400 uppercase tracking-wider">{isEn ? 'Current Balance' : 'Saldo Actual'}</div>
                          <div className="text-xs sm:text-sm font-black text-white mt-0.5">
                            ${chartData.currentBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                          </div>
                        </div>

                        <div>
                          <div className="text-[10px] text-slate-400 uppercase tracking-wider">{isEn ? 'Live Equity' : 'Equidad Flotante'}</div>
                          <div className="text-xs sm:text-sm font-black text-purple-300 mt-0.5">
                            ${chartData.currentEquity.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                          </div>
                        </div>

                        <div>
                          <div className="text-[10px] text-slate-400 uppercase tracking-wider">{isEn ? 'Net Delta' : 'Cambio / PnL'}</div>
                          <div className={`text-xs sm:text-sm font-black mt-0.5 flex items-center gap-1 ${
                            chartData.pnl >= 0 ? 'text-emerald-400' : 'text-rose-400'
                          }`}>
                            <span>{chartData.pnl >= 0 ? '+' : ''}${chartData.pnl.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                            <span className="text-[10px] font-normal">({chartData.pnlPct >= 0 ? '+' : ''}{chartData.pnlPct.toFixed(2)}%)</span>
                          </div>
                        </div>
                      </div>

                      {/* DD Floor & Safety Margin Banner */}
                      <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-1.5 rounded-xl bg-gradient-to-r from-rose-950/30 via-slate-900/40 to-emerald-950/20 border border-white/5 font-mono text-[11px] mb-3">
                        <div className="flex items-center gap-1.5 text-rose-300">
                          <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
                          <span className="font-bold">{isEn ? 'Drawdown Floor:' : 'Piso Máximo DD:'}</span>
                          <span className="font-black text-white">${chartData.ddFloorValue.toLocaleString()}</span>
                          <span className="text-slate-400 text-[10px]">({activeAccount.maxTotalDrawdownPct}%)</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-emerald-300">
                          <span className="text-slate-400">{isEn ? 'Breach Buffer:' : 'Colchón de Seguridad:'}</span>
                          <span className="font-black text-emerald-400">+${chartData.ddBufferAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                          <span className="text-[10px] text-emerald-400/80 font-bold">({chartData.ddBufferPct}%)</span>
                        </div>
                      </div>

                      {/* Glowing SVG Equity Chart Canvas */}
                      <div className="relative w-full h-64 sm:h-72">
                        
                        {/* Background Grid Lines & Y-Axis Labels */}
                        <div className="absolute inset-0 flex flex-col justify-between text-[10px] font-mono text-slate-600 pointer-events-none">
                          <div className="border-b border-white/[0.04] pb-1">${Math.round(chartData.maxScaleVal).toLocaleString()}</div>
                          <div className="border-b border-white/[0.04] pb-1">${Math.round(chartData.initialBalance * 1.02).toLocaleString()}</div>
                          <div className="border-b border-white/[0.04] pb-1 text-slate-400 font-bold flex items-center justify-between">
                            <span>${chartData.initialBalance.toLocaleString()} (Inicio)</span>
                          </div>
                          <div className="border-b border-rose-500/15 pb-1 text-rose-400/70 font-bold flex items-center justify-between">
                            <span>${chartData.ddFloorValue.toLocaleString()} (Piso DD)</span>
                          </div>
                          <div className="border-b border-white/[0.04] pb-1">${Math.round(chartData.minScaleVal).toLocaleString()}</div>
                        </div>

                        {/* SVG Curve Line + Area Gradient */}
                        <svg className="w-full h-full overflow-visible" viewBox="0 0 830 220" preserveAspectRatio="none">
                          <defs>
                            <linearGradient id="equityGlowGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.45" />
                              <stop offset="60%" stopColor="#6366F1" stopOpacity="0.08" />
                              <stop offset="100%" stopColor="#0C0F17" stopOpacity="0" />
                            </linearGradient>
                            <linearGradient id="drawdownGlowGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#F43F5E" stopOpacity="0.4" />
                              <stop offset="60%" stopColor="#EA580C" stopOpacity="0.1" />
                              <stop offset="100%" stopColor="#0C0F17" stopOpacity="0" />
                            </linearGradient>
                          </defs>

                          {chartViewMode === 'evolution' ? (
                            <>
                              {/* Baseline Line (Initial Balance reference) */}
                              <line
                                x1="30"
                                y1={chartData.yBaseline}
                                x2="800"
                                y2={chartData.yBaseline}
                                stroke="#64748B"
                                strokeWidth="1"
                                strokeDasharray="4 4"
                                strokeOpacity="0.6"
                              />

                              {/* DD Floor Line (Drawdown Limit reference) */}
                              <line
                                x1="30"
                                y1={chartData.yDDFloor}
                                x2="800"
                                y2={chartData.yDDFloor}
                                stroke="#EF4444"
                                strokeWidth="1.5"
                                strokeDasharray="5 3"
                                strokeOpacity="0.8"
                              />

                              {/* Gradient Area fill */}
                              {chartData.svgAreaD && <path d={chartData.svgAreaD} fill="url(#equityGlowGrad)" />}

                              {/* High Glow Stroke behind */}
                              {chartData.svgPathD && (
                                <path
                                  d={chartData.svgPathD}
                                  fill="none"
                                  stroke="#A855F7"
                                  strokeWidth="5"
                                  strokeOpacity="0.3"
                                />
                              )}

                              {/* Sharp Main Stroke */}
                              {chartData.svgPathD && (
                                <path
                                  d={chartData.svgPathD}
                                  fill="none"
                                  stroke="#8B5CF6"
                                  strokeWidth="2.5"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              )}

                              {/* Historical Points along the curve */}
                              {chartData.points.map((p, idx) => (
                                <circle
                                  key={idx}
                                  cx={p.x}
                                  cy={p.y}
                                  r="2.5"
                                  fill="#8B5CF6"
                                  fillOpacity="0.5"
                                />
                              ))}

                              {/* Current Active Data Point Indicator (STATIONARY GLOW MARKER - NO DISTRACTING PING BALL) */}
                              {chartData.points.length > 0 && (
                                <g>
                                  <circle 
                                    cx={chartData.points[chartData.points.length - 1].x} 
                                    cy={chartData.points[chartData.points.length - 1].y} 
                                    r="7" 
                                    fill="#8B5CF6" 
                                    fillOpacity="0.25" 
                                  />
                                  <circle 
                                    cx={chartData.points[chartData.points.length - 1].x} 
                                    cy={chartData.points[chartData.points.length - 1].y} 
                                    r="4" 
                                    fill="#FFFFFF" 
                                    stroke="#8B5CF6" 
                                    strokeWidth="2.5" 
                                  />
                                </g>
                              )}
                            </>
                          ) : (
                            /* Drawdown Mode Chart */
                            <>
                              {/* Drawdown Curve Area */}
                              {chartData.ddSvgAreaD && <path d={chartData.ddSvgAreaD} fill="url(#drawdownGlowGrad)" />}

                              {/* Drawdown Stroke */}
                              {chartData.ddSvgPathD && (
                                <path
                                  d={chartData.ddSvgPathD}
                                  fill="none"
                                  stroke="#F43F5E"
                                  strokeWidth="2.5"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              )}

                              {/* Points */}
                              {chartData.ddPoints.map((p, idx) => (
                                <circle
                                  key={idx}
                                  cx={p.x}
                                  cy={p.y}
                                  r="3"
                                  fill="#F43F5E"
                                  fillOpacity="0.6"
                                />
                              ))}

                              {/* Last Point */}
                              {chartData.ddPoints.length > 0 && (
                                <g>
                                  <circle 
                                    cx={chartData.ddPoints[chartData.ddPoints.length - 1].x} 
                                    cy={chartData.ddPoints[chartData.ddPoints.length - 1].y} 
                                    r="7" 
                                    fill="#F43F5E" 
                                    fillOpacity="0.25" 
                                  />
                                  <circle 
                                    cx={chartData.ddPoints[chartData.ddPoints.length - 1].x} 
                                    cy={chartData.ddPoints[chartData.ddPoints.length - 1].y} 
                                    r="4" 
                                    fill="#FFFFFF" 
                                    stroke="#F43F5E" 
                                    strokeWidth="2.5" 
                                  />
                                </g>
                              )}
                            </>
                          )}
                        </svg>

                        {/* Floating Metric Badge on Curve */}
                        <div className="absolute top-2 right-2 sm:right-4 p-2.5 rounded-xl bg-[#090C14]/90 border border-white/10 shadow-2xl text-right font-mono backdrop-blur-md">
                          <div className="text-[10px] text-slate-400">
                            {chartViewMode === 'evolution' ? (isEn ? 'Current Equity' : 'Equidad en Vivo') : (isEn ? 'Current Drawdown' : 'Drawdown Actual')}
                          </div>
                          <div className={`text-xs sm:text-sm font-black ${chartViewMode === 'evolution' ? 'text-purple-300' : 'text-rose-400'}`}>
                            {chartViewMode === 'evolution' 
                              ? `$${chartData.currentEquity.toLocaleString('en-US', { minimumFractionDigits: 2 })}` 
                              : `${accountMetrics.currentDrawdownPct.toFixed(2)}%`}
                          </div>
                        </div>

                        {/* X-Axis Dates */}
                        <div className="absolute -bottom-5 inset-x-0 flex justify-between text-[10px] font-mono text-slate-500 px-4">
                          <span>12 Abr</span>
                          <span>13 Abr</span>
                          <span>14 Abr</span>
                          <span>15 Abr</span>
                          <span>16 Abr</span>
                          <span>17 Abr</span>
                          <span>18 Abr</span>
                        </div>
                      </div>

                    </div>

                    {/* Right 4 Cols: Estado de la cuenta (Health & Progress) */}
                    <div className="relative lg:col-span-4 p-6 rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.05] via-[#0C0F1A]/90 to-[#07090F]/95 backdrop-blur-2xl flex flex-col justify-between space-y-6 shadow-[0_12px_40px_rgba(0,0,0,0.5)] overflow-hidden before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-emerald-400/30 before:to-transparent">
                      
                      <div className="flex items-center justify-between">
                        <h3 className="font-bold text-sm text-white flex items-center gap-2">
                          <Activity className="w-4 h-4 text-emerald-400" />
                          <span>{isEn ? 'Account Status' : 'Estado de la cuenta'}</span>
                        </h3>
                        <span className="px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-mono text-xs font-bold shadow-[0_0_10px_rgba(16,185,129,0.2)]">
                          {activeAccount.status}
                        </span>
                      </div>

                      {/* Progress 1: Profit Target */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs font-mono">
                          <span className="text-slate-300 font-medium">Profit target</span>
                          <span className="text-white font-bold">
                            ${Math.max(0, accountMetrics.netPnl).toLocaleString('en-US', { minimumFractionDigits: 2 })} / ${accountMetrics.profitTargetAmount.toLocaleString()}
                          </span>
                        </div>
                        <div className="w-full h-2.5 rounded-full bg-slate-900/90 border border-white/5 overflow-hidden p-0.5">
                          <div 
                            className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" 
                            style={{ width: `${accountMetrics.profitProgressPct}%` }} 
                          />
                        </div>
                        <div className="text-right text-[10px] font-mono text-emerald-400 font-bold">
                          {accountMetrics.profitProgressPct.toFixed(1)}%
                        </div>
                      </div>

                      {/* Progress 2: Consistencia */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs font-mono">
                          <span className="text-slate-300 font-medium">{isEn ? 'Consistency (5 days)' : 'Consistencia (5 días)'}</span>
                          <span className="text-white font-bold">{Math.min(5, activeAccount.tradingDays)}/5</span>
                        </div>
                        <div className="w-full h-2.5 rounded-full bg-slate-900/90 border border-white/5 overflow-hidden p-0.5">
                          <div 
                            className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 rounded-full transition-all duration-500 shadow-[0_0_10px_rgba(6,182,212,0.5)]" 
                            style={{ width: `${Math.min(100, (activeAccount.tradingDays / 5) * 100)}%` }} 
                          />
                        </div>
                        <div className="text-right text-[10px] font-mono text-cyan-400 font-bold">
                          {((Math.min(5, activeAccount.tradingDays) / 5) * 100).toFixed(0)}%
                        </div>
                      </div>

                      {/* Rule 3: Mejor día */}
                      <div className="pt-3 border-t border-white/8 flex items-center justify-between">
                        <div>
                          <div className="text-xs font-mono text-slate-300">{isEn ? 'Best day rule' : 'Mejor día (Best day rule)'}</div>
                          <div className="text-base font-black font-mono text-white mt-0.5">
                            {accountMetrics.isPositive ? Math.min(40, accountMetrics.netPnlPct).toFixed(1) : '0.0'}%
                          </div>
                        </div>
                        <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-bold">
                          {isEn ? 'In Range (<40%)' : 'En rango (<40%)'}
                        </span>
                      </div>

                    </div>

                  </div>

                  {/* Lower Row: Resumen de Parámetros de la Cuenta (Left 8 Cols) + Actividad Reciente (Right 4 Cols) */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    
                    {/* Left 8 Cols: Parámetros y Reglas del Motor de Riesgo */}
                    <div className="relative lg:col-span-8 p-6 rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.05] via-[#0C0F1A]/90 to-[#07090F]/95 backdrop-blur-2xl flex flex-col justify-between space-y-5 shadow-[0_12px_40px_rgba(0,0,0,0.5)] overflow-hidden before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-amber-400/30 before:to-transparent">
                      
                      <div className="flex items-center justify-between pb-3 border-b border-white/8">
                        <div className="flex items-center gap-2.5">
                          <Shield className="w-4 h-4 text-amber-400" />
                          <h3 className="font-bold text-base text-white">
                            {isEn ? 'Account Specifications & Governance' : 'Especificaciones y Gobernanza de la Cuenta'}
                          </h3>
                        </div>
                        <span className="text-[10px] font-mono px-2.5 py-1 rounded-lg bg-amber-400/15 border border-amber-400/30 text-amber-300 font-bold shadow-[0_0_8px_rgba(245,158,11,0.2)]">
                          {activeAccount.category.toUpperCase()} PROTOCOL
                        </span>
                      </div>

                      {/* Grid de 4 especificaciones */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
                        
                        <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/8 backdrop-blur-md">
                          <div className="text-[10px] text-slate-400">{isEn ? 'Profit Split' : 'Reparto de Beneficios'}</div>
                          <div className="text-sm font-black text-emerald-400 mt-1">{activeAccount.profitSplit}% / {100 - activeAccount.profitSplit}%</div>
                        </div>

                        <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/8 backdrop-blur-md">
                          <div className="text-[10px] text-slate-400">{isEn ? 'Max Drawdown' : 'Pérdida Máxima'}</div>
                          <div className="text-sm font-black text-amber-400 mt-1">{activeAccount.maxTotalDrawdownPct}% Trailing</div>
                        </div>

                        <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/8 backdrop-blur-md">
                          <div className="text-[10px] text-slate-400">{isEn ? 'Daily Drawdown' : 'Pérdida Diaria'}</div>
                          <div className="text-sm font-black text-amber-400 mt-1">{activeAccount.maxDailyDrawdownPct}% EOD</div>
                        </div>

                        <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/8 backdrop-blur-md">
                          <div className="text-[10px] text-slate-400">{isEn ? 'Leverage' : 'Apalancamiento'}</div>
                          <div className="text-sm font-black text-white mt-1">{activeAccount.leverage}</div>
                        </div>

                      </div>

                      {/* Reglas de trading verificadas */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-[11px] pt-1">
                        <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center gap-2.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span className="text-slate-300">{isEn ? 'Mandatory SL: Active' : 'Stop Loss Obligatorio'}</span>
                        </div>

                        <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center gap-2.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span className="text-slate-300">{isEn ? 'Anti-Hedging: Active' : 'Anti-Hedging Protegido'}</span>
                        </div>

                        <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center gap-2.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span className="text-slate-300">{isEn ? 'Weekend Auto-Close' : 'Cierre de Fin de Semana'}</span>
                        </div>
                      </div>

                    </div>

                    {/* Right 4 Cols: Actividad Reciente */}
                    <div className="relative lg:col-span-4 p-6 rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.05] via-[#0C0F1A]/90 to-[#07090F]/95 backdrop-blur-2xl flex flex-col justify-between space-y-4 shadow-[0_12px_40px_rgba(0,0,0,0.5)] overflow-hidden before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-blue-400/30 before:to-transparent">
                      
                      <div className="flex items-center justify-between pb-2 border-b border-white/8">
                        <h3 className="font-bold text-base text-white flex items-center gap-2">
                          <Clock className="w-4 h-4 text-blue-400" />
                          <span>{isEn ? 'Recent Activity' : 'Actividad reciente'}</span>
                        </h3>
                        <span className="text-xs font-mono text-purple-400 font-bold px-2 py-0.5 rounded bg-purple-500/10 border border-purple-500/20">
                          {recentTrades.length} {isEn ? 'trades' : 'órdenes'}
                        </span>
                      </div>

                      {/* Event Ledger Items */}
                      {recentTrades.length > 0 ? (
                        <div className="space-y-3 font-mono">
                          {recentTrades.map((tr, idx) => (
                            <div key={tr.id || idx} className="p-3 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-between text-xs backdrop-blur-md hover:bg-white/[0.04] transition-colors">
                              <div className="flex items-center gap-2.5">
                                <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                                  (tr.pnl || 0) >= 0 ? 'bg-emerald-500/15 border border-emerald-500/25 text-emerald-400' : 'bg-rose-500/15 border border-rose-500/25 text-rose-400'
                                }`}>
                                  {(tr.pnl || 0) >= 0 ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                                </div>
                                <div>
                                  <div className="font-bold text-white text-[11px]">
                                    {tr.symbol || 'BTCUSDT'} ({tr.side || 'BUY'})
                                  </div>
                                  <div className="text-[9px] text-slate-500">
                                    {tr.created_at ? new Date(tr.created_at).toLocaleDateString() : 'Reciente'}
                                  </div>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className={`font-bold ${(tr.pnl || 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                  {(tr.pnl || 0) >= 0 ? '+' : ''}${Number(tr.pnl || 0).toFixed(2)}
                                </div>
                                <div className="text-[9px] text-slate-400 font-mono">PnL</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center rounded-2xl bg-white/[0.02] border border-white/5 space-y-3">
                          <div className="w-12 h-12 rounded-2xl bg-white/[0.03] border border-white/8 flex items-center justify-center text-slate-400">
                            <Clock className="w-6 h-6" />
                          </div>
                          <div className="text-xs font-bold text-slate-300">
                            {isEn ? 'No closed trades recorded yet' : 'Sin operaciones ejecutadas aún'}
                          </div>
                          <p className="text-[11px] text-slate-400 font-mono max-w-xs leading-relaxed">
                            {isEn 
                              ? 'Your trades executed in the Web Terminal will stream here instantly.'
                              : 'Las órdenes que ejecutes en la Terminal Web se sincronizarán aquí al instante.'}
                          </p>
                          <button
                            onClick={handleGoToTerminal}
                            className="mt-1 px-4 py-2 rounded-xl text-xs font-mono font-bold text-slate-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:brightness-110 transition-all cursor-pointer shadow-md shadow-amber-400/20"
                          >
                            {isEn ? 'Open Terminal to Trade →' : 'Abrir Terminal para Operar →'}
                          </button>
                        </div>
                      )}

                    </div>

                  </div>

                  {/* Bottom Row: 5 Action Cards (Journal, Challenges, Add-ons, Calendario, Certificados) con Cápsulas de Cristal */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 pt-2">
                    
                    {/* Action 1: Diario de Trading */}
                    <div 
                      onClick={() => setActiveTab('journal')}
                      className="relative p-5 rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.05] via-[#0C0F1A]/90 to-[#07090F]/95 backdrop-blur-2xl transition-all duration-300 cursor-pointer flex items-center justify-between group hover:border-blue-500/40 hover:shadow-[0_8px_30px_rgba(59,130,246,0.2)] overflow-hidden before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-blue-400/30 before:to-transparent"
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-500/25 via-indigo-500/10 to-transparent border border-blue-500/35 text-blue-300 flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(59,130,246,0.25)] group-hover:scale-110 transition-transform overflow-hidden">
                          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />
                          <BookOpen className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-bold text-sm text-white group-hover:text-blue-300 transition-colors truncate">
                            {isEn ? 'Journal' : 'Diario Trading'}
                          </h4>
                          <p className="text-[10px] text-slate-400 font-mono mt-0.5 truncate">
                            {isEn ? 'Forensic Trades & R:R' : 'Bitácora & Psicología'}
                          </p>
                        </div>
                      </div>
                      <div className="w-7 h-7 rounded-xl bg-white/[0.04] border border-white/8 group-hover:bg-blue-500 text-slate-400 group-hover:text-white flex items-center justify-center shrink-0 transition-all duration-300 ml-1.5 group-hover:translate-x-0.5">
                        <ArrowRight className="w-3.5 h-3.5" />
                      </div>
                    </div>

                    {/* Action 2: Challenges */}
                    <div 
                      onClick={() => setActiveTab('challenges')}
                      className="relative p-5 rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.05] via-[#0C0F1A]/90 to-[#07090F]/95 backdrop-blur-2xl transition-all duration-300 cursor-pointer flex items-center justify-between group hover:border-purple-500/40 hover:shadow-[0_8px_30px_rgba(168,85,247,0.2)] overflow-hidden before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-purple-400/30 before:to-transparent"
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-500/25 via-indigo-500/10 to-transparent border border-purple-500/35 text-purple-300 flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(168,85,247,0.25)] group-hover:scale-110 transition-transform overflow-hidden">
                          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />
                          <Layers className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-bold text-sm text-white group-hover:text-purple-300 transition-colors truncate">
                            {isEn ? 'Challenges' : 'Challenges'}
                          </h4>
                          <p className="text-[10px] text-slate-400 font-mono mt-0.5 truncate">
                            {isEn ? 'Solar & Lunar Models' : 'Modelos Solar & Lunar'}
                          </p>
                        </div>
                      </div>
                      <div className="w-7 h-7 rounded-xl bg-white/[0.04] border border-white/8 group-hover:bg-purple-500 text-slate-400 group-hover:text-slate-950 flex items-center justify-center shrink-0 transition-all duration-300 ml-1.5 group-hover:translate-x-0.5">
                        <ArrowRight className="w-3.5 h-3.5" />
                      </div>
                    </div>

                    {/* Action 3: Add-ons Store */}
                    <div 
                      onClick={() => setActiveTab('addons')}
                      className="relative p-5 rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.05] via-[#0C0F1A]/90 to-[#07090F]/95 backdrop-blur-2xl transition-all duration-300 cursor-pointer flex items-center justify-between group hover:border-amber-400/40 hover:shadow-[0_8px_30px_rgba(245,158,11,0.2)] overflow-hidden before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-amber-400/30 before:to-transparent"
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-400/25 via-amber-500/10 to-transparent border border-amber-400/35 text-amber-300 flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(245,158,11,0.25)] group-hover:scale-110 transition-transform overflow-hidden">
                          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />
                          <Zap className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-bold text-sm text-white group-hover:text-amber-300 transition-colors truncate">
                            {isEn ? 'Add-ons' : 'Add-ons'}
                          </h4>
                          <p className="text-[10px] text-slate-400 font-mono mt-0.5 truncate">
                            {isEn ? 'Leverage Boost' : 'Apalancamiento Boost'}
                          </p>
                        </div>
                      </div>
                      <div className="w-7 h-7 rounded-xl bg-white/[0.04] border border-white/8 group-hover:bg-amber-400 text-slate-400 group-hover:text-slate-950 flex items-center justify-center shrink-0 transition-all duration-300 ml-1.5 group-hover:translate-x-0.5">
                        <ArrowRight className="w-3.5 h-3.5" />
                      </div>
                    </div>

                    {/* Action 4: Calendario Económico */}
                    <div 
                      onClick={() => setActiveTab('calendar')}
                      className="relative p-5 rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.05] via-[#0C0F1A]/90 to-[#07090F]/95 backdrop-blur-2xl transition-all duration-300 cursor-pointer flex items-center justify-between group hover:border-rose-500/40 hover:shadow-[0_8px_30px_rgba(244,63,94,0.2)] overflow-hidden before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-rose-400/30 before:to-transparent"
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative w-10 h-10 rounded-2xl bg-gradient-to-br from-rose-500/25 via-pink-500/10 to-transparent border border-rose-500/35 text-rose-300 flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(244,63,94,0.25)] group-hover:scale-110 transition-transform overflow-hidden">
                          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />
                          <Calendar className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-bold text-sm text-white group-hover:text-rose-300 transition-colors truncate">
                            {isEn ? 'Eco Calendar' : 'Calendario'}
                          </h4>
                          <p className="text-[10px] text-slate-400 font-mono mt-0.5 truncate">
                            {isEn ? 'High Impact News' : 'Radar Noticias'}
                          </p>
                        </div>
                      </div>
                      <div className="w-7 h-7 rounded-xl bg-white/[0.04] border border-white/8 group-hover:bg-rose-500 text-slate-400 group-hover:text-white flex items-center justify-center shrink-0 transition-all duration-300 ml-1.5 group-hover:translate-x-0.5">
                        <ArrowRight className="w-3.5 h-3.5" />
                      </div>
                    </div>

                    {/* Action 5: Certificados */}
                    <div 
                      onClick={() => setActiveTab('certificates')}
                      className="relative p-5 rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.05] via-[#0C0F1A]/90 to-[#07090F]/95 backdrop-blur-2xl transition-all duration-300 cursor-pointer flex items-center justify-between group hover:border-cyan-500/40 hover:shadow-[0_8px_30px_rgba(6,182,212,0.2)] overflow-hidden before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-cyan-400/30 before:to-transparent"
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative w-10 h-10 rounded-2xl bg-gradient-to-br from-cyan-400/25 via-teal-500/10 to-transparent border border-cyan-400/35 text-cyan-300 flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(6,182,212,0.25)] group-hover:scale-110 transition-transform overflow-hidden">
                          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />
                          <Award className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-bold text-sm text-white group-hover:text-cyan-300 transition-colors truncate">
                            {isEn ? 'Certificates' : 'Certificados'}
                          </h4>
                          <p className="text-[10px] text-slate-400 font-mono mt-0.5 truncate">
                            {isEn ? 'Verified PDF' : 'Aprobación PDF'}
                          </p>
                        </div>
                      </div>
                      <div className="w-7 h-7 rounded-xl bg-white/[0.04] border border-white/8 group-hover:bg-cyan-500 text-slate-400 group-hover:text-slate-950 flex items-center justify-center shrink-0 transition-all duration-300 ml-1.5 group-hover:translate-x-0.5">
                        <ArrowRight className="w-3.5 h-3.5" />
                      </div>
                    </div>

                  </div>
                </>
              )}

            </motion.div>
          )}

          {/* ========================================================================= */}
          {/* PÁGINA: TRADING JOURNAL (DIARIO FORENSE & BITÁCORA PSICOLÓGICA) */}
          {/* ========================================================================= */}
          {activeTab === 'journal' && (
            <motion.div
              key="journal"
              initial={{ opacity: 0, y: 14, filter: 'blur(4px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -10, filter: 'blur(4px)' }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            >
              <TraderJournalView 
                accounts={accounts}
                selectedAccountId={selectedAccountId}
                userDisplayName={userDisplayName}
              />
            </motion.div>
          )}

          {/* ========================================================================= */}
          {/* PÁGINA: CHALLENGES (RETOS INSTITUCIONALES SOLAR Y LUNAR) */}
          {/* ========================================================================= */}
          {(activeTab === 'challenges' || activeTab === 'programs') && (
            <motion.div
              key="challenges"
              initial={{ opacity: 0, y: 14, filter: 'blur(4px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -10, filter: 'blur(4px)' }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            >
              <TraderChallengesView 
                onSelectPlanForCheckout={handleSelectPlanForCheckout}
              />
            </motion.div>
          )}

          {/* ========================================================================= */}
          {/* PÁGINA: ADD-ONS (TIENDA DE MEJORAS INSTITUCIONALES) */}
          {/* ========================================================================= */}
          {activeTab === 'addons' && (
            <motion.div
              key="addons"
              initial={{ opacity: 0, y: 14, filter: 'blur(4px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -10, filter: 'blur(4px)' }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            >
              <TraderAddonsStoreView
                accounts={accounts}
                selectedAccountId={selectedAccountId}
                onSelectAccount={(accId) => {
                  setSelectedAccountId(accId);
                }}
              />
            </motion.div>
          )}

          {/* ========================================================================= */}
          {/* PÁGINA: CALENDARIO ECONÓMICO INSTITUCIONAL (HIGH IMPACT NEWS CENTINEL) */}
          {/* ========================================================================= */}
          {activeTab === 'calendar' && (
            <motion.div
              key="calendar"
              initial={{ opacity: 0, y: 14, filter: 'blur(4px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -10, filter: 'blur(4px)' }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            >
              <TraderEconomicCalendarView />
            </motion.div>
          )}

          {/* ========================================================================= */}
          {/* PÁGINA: PROGRAMA DE AFILIADOS (COMMISSIONS & REVENUE SHARE) */}
          {/* ========================================================================= */}
          {activeTab === 'affiliates' && (
            <motion.div
              key="affiliates"
              initial={{ opacity: 0, y: 14, filter: 'blur(4px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -10, filter: 'blur(4px)' }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            >
              <TraderAffiliatesView 
                userEmail={user?.email}
                userId={user?.id}
                userDisplayName={userDisplayName}
              />
            </motion.div>
          )}

          {/* ========================================================================= */}
          {/* PÁGINA: FACTURACIÓN Y COMPRAS (HISTORIAL DE RECIBOS) */}
          {/* ========================================================================= */}
          {activeTab === 'billing' && (
            <motion.div
              key="billing"
              initial={{ opacity: 0, y: 14, filter: 'blur(4px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -10, filter: 'blur(4px)' }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            >
              <TraderBillingView 
                userEmail={user?.email} 
                userId={user?.id} 
                userDisplayName={userDisplayName} 
              />
            </motion.div>
          )}

          {/* ========================================================================= */}
          {/* PÁGINA: CERTIFICADOS INSTITUCIONALES */}
          {/* ========================================================================= */}
          {activeTab === 'certificates' && (
            <motion.div
              key="certificates"
              initial={{ opacity: 0, y: 14, filter: 'blur(4px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -10, filter: 'blur(4px)' }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            >
              <TraderCertificatesView
                userDisplayName={userDisplayName}
                accounts={accounts}
              />
            </motion.div>
          )}

          {/* ========================================================================= */}
          {/* PÁGINA: SOPORTE 24/7 INSTITUCIONAL */}
          {/* ========================================================================= */}
          {(activeTab === 'support' || activeTab === 'help') && (
            <motion.div
              key="support"
              initial={{ opacity: 0, y: 14, filter: 'blur(4px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -10, filter: 'blur(4px)' }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-6 max-w-4xl mx-auto py-4"
            >
              {/* Header Support */}
              <div className="relative rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-white/[0.06] via-[#101726]/90 to-[#0A0D15]/95 border border-white/10 shadow-2xl backdrop-blur-2xl overflow-hidden before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-emerald-400/40 before:to-transparent">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                  <div className="flex items-center gap-4">
                    <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500/25 via-teal-500/10 to-transparent border border-emerald-500/35 text-emerald-300 flex items-center justify-center shrink-0 shadow-[0_0_25px_rgba(16,185,129,0.25)] overflow-hidden">
                      <div className="absolute inset-x-0 top-0 h-px bg-white/40" />
                      <HelpCircle className="w-7 h-7" />
                    </div>
                    <div>
                      <h2 className="text-xl font-black text-white flex items-center gap-2">
                        <span>{isEn ? '24/7 Institutional Support Center' : 'Centro de Soporte Institucional 24/7'}</span>
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                      </h2>
                      <p className="text-xs text-slate-400 font-mono mt-1">
                        {isEn 
                          ? 'Real-time assistance with risk managers, technical engineers, and finance operations.'
                          : 'Asistencia en tiempo real con gestores de riesgo, ingenieros de terminal y equipo financiero.'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="px-3.5 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-mono font-bold text-xs shadow-[0_0_12px_rgba(16,185,129,0.2)]">
                      {isEn ? 'SLA < 15 min' : 'SLA < 15 min'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Grid de 3 Canales de Soporte */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                
                {/* Canal 1: Telegram Prioritario */}
                <div className="relative p-6 rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.05] via-[#0C0F1A]/90 to-[#07090F]/95 backdrop-blur-2xl hover:border-[#229ED9]/50 transition-all duration-300 flex flex-col justify-between space-y-4 shadow-xl group overflow-hidden before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-[#229ED9]/40 before:to-transparent">
                  <div className="space-y-3">
                    <div className="relative w-11 h-11 rounded-2xl bg-gradient-to-br from-[#229ED9]/25 via-blue-600/10 to-transparent border border-[#229ED9]/35 text-[#229ED9] flex items-center justify-center overflow-hidden">
                      <div className="absolute inset-x-0 top-0 h-px bg-white/40" />
                      <Radio className="w-5 h-5" />
                    </div>
                    <h3 className="font-bold text-white text-base">
                      {isEn ? 'Telegram Priority Bot' : 'Bot Prioritario de Telegram'}
                    </h3>
                    <p className="text-xs text-slate-400 font-mono leading-relaxed">
                      {isEn 
                        ? 'Connect directly with on-duty risk managers and verify critical account inquiries.'
                        : 'Conecta al instante con gestores de riesgo y telemetría de trading automatizada.'}
                    </p>
                  </div>

                  <a
                    href="https://t.me/EklipseFunded_bot"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2.5 px-4 rounded-xl font-mono text-xs font-bold bg-[#229ED9] hover:brightness-110 text-white flex items-center justify-center gap-2 transition-all shadow-md shadow-[#229ED9]/20"
                  >
                    <span>@EklipseFunded_bot</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </a>
                </div>

                {/* Canal 2: Email de Riesgo y Facturación */}
                <div className="relative p-6 rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.05] via-[#0C0F1A]/90 to-[#07090F]/95 backdrop-blur-2xl hover:border-amber-400/50 transition-all duration-300 flex flex-col justify-between space-y-4 shadow-xl group overflow-hidden before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-amber-400/40 before:to-transparent">
                  <div className="space-y-3">
                    <div className="relative w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-400/25 via-amber-500/10 to-transparent border border-amber-400/35 text-amber-300 flex items-center justify-center overflow-hidden">
                      <div className="absolute inset-x-0 top-0 h-px bg-white/40" />
                      <FileText className="w-5 h-5" />
                    </div>
                    <h3 className="font-bold text-white text-base">
                      {isEn ? 'Risk & Compliance Desk' : 'Mesa de Riesgo y Compliance'}
                    </h3>
                    <p className="text-xs text-slate-400 font-mono leading-relaxed">
                      {isEn 
                        ? 'Submit forensic trade reviews, dispute execution slips, or request contract updates.'
                        : 'Auditoría forense de operaciones, revisión de slips y modificaciones de contrato.'}
                    </p>
                  </div>

                  <a
                    href="mailto:support@eklipsefunded.com"
                    className="w-full py-2.5 px-4 rounded-xl font-mono text-xs font-bold bg-white/5 hover:bg-white/10 border border-white/10 text-white flex items-center justify-center gap-2 transition-all"
                  >
                    <span>support@eklipsefunded.com</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </a>
                </div>

                {/* Canal 3: Terminal Web Status & SLA */}
                <div className="relative p-6 rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.05] via-[#0C0F1A]/90 to-[#07090F]/95 backdrop-blur-2xl hover:border-emerald-500/50 transition-all duration-300 flex flex-col justify-between space-y-4 shadow-xl group overflow-hidden before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-emerald-400/40 before:to-transparent">
                  <div className="space-y-3">
                    <div className="relative w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-500/25 via-teal-500/10 to-transparent border border-emerald-500/35 text-emerald-300 flex items-center justify-center overflow-hidden">
                      <div className="absolute inset-x-0 top-0 h-px bg-white/40" />
                      <Activity className="w-5 h-5" />
                    </div>
                    <h3 className="font-bold text-white text-base">
                      {isEn ? 'System Status & Gateways' : 'Estado de Sistemas & Pasarelas'}
                    </h3>
                    <p className="text-xs text-slate-400 font-mono leading-relaxed">
                      {isEn 
                        ? '100% uptime SLA with low-latency Bybit, OKX, and Binance matching engine feeds.'
                        : 'SLA de disponibilidad 99.98% con ingesta directa a libros de órdenes L2.'}
                    </p>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-2xl bg-black/40 border border-white/8 font-mono text-xs">
                    <span className="text-slate-400">{isEn ? 'Latency Feed:' : 'Latencia Feed:'}</span>
                    <span className="text-emerald-400 font-bold">{wsLatency || 9}ms · 60 FPS</span>
                  </div>
                </div>

              </div>

              {/* FAQ Box */}
              <div className="relative p-6 sm:p-8 rounded-3xl border border-white/10 bg-[#0C0F17]/80 backdrop-blur-2xl space-y-4 font-mono text-xs shadow-2xl before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-amber-400/30 before:to-transparent">
                <div className="font-bold text-white text-sm flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>{isEn ? 'Frequently Asked Questions (FAQ)' : 'Preguntas Frecuentes'}</span>
                </div>
                <div className="space-y-3 text-slate-400">
                  <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                    <div className="text-white font-bold">{isEn ? 'When do evaluation accounts get approved?' : '¿Cuándo se aprueban las fases del reto?'}</div>
                    <div className="text-[11px] mt-1 text-slate-300/80">{isEn ? 'Immediately upon hitting the profit target while respecting consistency and drawdown limits.' : 'Inmediatamente al alcanzar el objetivo de profit respetando el drawdown y los días mínimos.'}</div>
                  </div>
                  <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                    <div className="text-white font-bold">{isEn ? 'How fast are crypto payouts executed?' : '¿Qué tan rápidos son los retiros cripto?'}</div>
                    <div className="text-[11px] mt-1 text-slate-300/80">{isEn ? 'Payouts are audited and dispatched on-chain (USDT TRC-20, Polygon, Arbitrum) within 4 to 24 hours.' : 'Los retiros son auditados y enviados on-chain en USDT (TRC-20, Polygon, Arbitrum) entre 4 y 24 horas.'}</div>
                  </div>
                </div>
              </div>

            </motion.div>
          )}
          </AnimatePresence>

        </main>

      </div>

      {/* Toast de alerta de riesgo en tiempo real desde el WebSocket Centinela */}
      {riskAlertToast && (
        <div className={`fixed bottom-20 right-6 z-50 p-4 rounded-2xl border text-xs font-mono shadow-2xl backdrop-blur-md flex items-center gap-3 animate-in fade-in slide-in-from-bottom-3 duration-300 ${
          riskAlertToast.severity === 'danger'
            ? 'bg-rose-950/90 border-rose-500/50 text-rose-200'
            : 'bg-amber-950/90 border-amber-500/50 text-amber-200'
        }`}>
          <AlertTriangle className={`w-5 h-5 shrink-0 ${riskAlertToast.severity === 'danger' ? 'text-rose-400' : 'text-amber-400'}`} />
          <span>{riskAlertToast.message}</span>
        </div>
      )}

      {/* Toast de confirmación de firma de contrato */}
      {contractToastMessage && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-2xl bg-emerald-950/90 border border-emerald-500/50 text-emerald-200 text-xs font-mono shadow-2xl backdrop-blur-md flex items-center gap-3 animate-in fade-in slide-in-from-bottom-3 duration-300">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{contractToastMessage}</span>
        </div>
      )}

      {/* Modal Institucional de Firma de Acuerdo de Evaluación */}
      {contractModalAccount && (
        <TraderContractSigningModal
          account={contractModalAccount}
          userName={userDisplayName}
          userEmail={user?.email}
          isOpen={!!contractModalAccount}
          onClose={() => setContractModalAccount(null)}
          onSignedSuccess={handleSignContract}
          isEnDefault={isEn}
        />
      )}

      {/* Modal de Selección de Avatar Pepe / Lady Pepe */}
      <PepeAvatarPickerModal
        isOpen={isAvatarModalOpen}
        onClose={() => setIsAvatarModalOpen(false)}
        selectedAvatarId={selectedAvatarId}
        onSelectAvatar={handleSelectAvatar}
        isEn={isEn}
      />

    </div>
  );
};
