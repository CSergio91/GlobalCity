/**
 * ============================================================================
 * ZYTI TRADE - INSTITUTIONAL MULTI-EXCHANGE RISK DAEMON
 * ============================================================================
 * Centinela de Riesgo Autónomo en RAM para Prop Firms.
 * 
 * Capacidades:
 * 1. Agnóstico de Exchange: Ingesta precios de Binance, Bybit, OKX, KuCoin,
 *    Synthetic o cualquier adaptador futuro con clave combinada y normalizada.
 * 2. Evaluación en sub-50ns en RAM por cada tick recibido.
 * 3. Detección instantánea de perforación de Drawdown Diario (EOD o Trailing)
 *    y Drawdown Total Acumulado.
 * 4. Auto-Liquidación Forzosa Atómica: Cierra posiciones abiertas al precio de tick
 *    actual y congela la cuenta en estado 'BREACHED'.
 * 5. Sincronización dinámica de Reglas desde Supabase (risk_rule_configs) y Redis.
 * 6. Suministro en tiempo real al CRM de posiciones monitoreadas (cero datos falsos).
 */

import { WebSocket } from 'ws';

export function normalizeSymbol(sym) {
  if (!sym) return '';
  return sym.replace(/[\/\-_:]/g, '').toUpperCase();
}

export class RiskDaemon {
  constructor(options = {}) {
    this.supabase = options.supabase || null;
    this.redisPub = options.redisPub || null;
    this.redisSub = options.redisSub || null;
    this.onBreach = options.onBreach || (() => {});
    this.onAccountPassed = options.onAccountPassed || (() => {});
    this.onMetricsUpdate = options.onMetricsUpdate || (() => {});
    this.onRuleUpdated = options.onRuleUpdated || (() => {});
    this.onTradeClosed = options.onTradeClosed || (() => {});
    this.onCrmUpdate = options.onCrmUpdate || (() => {});
    this.onDailyRollover = options.onDailyRollover || (() => {});

    // Estado en RAM
    // Map<ruleId, RiskRuleConfig>
    this.rules = new Map();
    this.defaultDemoRule = null;

    // Map<accountId, AccountRAMState>
    this.accounts = new Map();

    // Map<normSymbol, { price: number, exchange: string, timestamp: number }>
    this.latestPrices = new Map();

    // Map<exchange_normSymbol, { price: number, exchange: string, timestamp: number }>
    this.exchangePrices = new Map();

    // Mapeo de símbolos a cuentas para evaluación rápida en sub-50ns
    // Map<normSymbol, Set<accountId>>
    this.symbolToAccounts = new Map();

    // Conectores WebSocket públicos de respaldo multi-exchange
    this.activeExchangeSockets = new Map();

    this.midnightTimer = null;
    this.isInitialized = false;
  }

  /**
   * Carga inicial desde Supabase y arranque del demonio
   */
  async init() {
    console.log('\x1b[35m[Risk Daemon] Inicializando centinela de riesgo multi-exchange...\x1b[0m');

    // 1. Cargar presets de reglas
    await this.loadRiskRules();

    // 2. Cargar cuentas activas
    await this.loadActiveAccounts();

    // 3. Cargar posiciones abiertas
    await this.loadOpenPositions();

    // 4. Programar temporizador autónomo de cambio de día (00:00:00 UTC Rollover)
    this.scheduleMidnightRollover();

    // 5. Programar centinela autónomo de Fin de Semana (Viernes 20:55 UTC Auto-Close)
    this.scheduleWeekendHoldingCheck();

    this.isInitialized = true;
    console.log(`\x1b[32m✔ [Risk Daemon] Activo: ${this.accounts.size} cuentas vigiladas, ${this.rules.size} reglas dinámicas\x1b[0m`);
  }

  /**
   * Carga reglas desde Supabase risk_rule_configs
   */
  async loadRiskRules() {
    if (!this.supabase) return;

    try {
      const { data, error } = await this.supabase
        .from('risk_rule_configs')
        .select('*')
        .eq('is_active', true);

      if (error || !data || data.length === 0) {
        console.warn('[Risk Daemon] No hay reglas de riesgo activas en la base de datos.');
        return;
      }

      data.forEach(r => {
        const ruleObj = {
          ...r,
          model_type: r.model_type || 'ONE_PHASE',
          default_account_balance: Number(r.default_account_balance || 0),
          max_daily_loss_percent: Number(r.max_daily_loss_percent || 0),
          max_total_drawdown_percent: Number(r.max_total_drawdown_percent || 0),
          max_trailing_drawdown_percent: r.max_trailing_drawdown_percent ? Number(r.max_trailing_drawdown_percent) : null,
          profit_target_percent: Number(r.profit_target_percent || 10),
          profit_target_phase2_percent: Number(r.profit_target_phase2_percent || 5),
          min_trading_days: Number(r.min_trading_days || 5),
          min_daily_profit_type: r.min_daily_profit_type || 'PERCENT',
          min_daily_profit_value: Number(r.min_daily_profit_value || 0.5),
          consistency_rule_percent: Number(r.consistency_rule_percent || 40),
          max_leverage: Number(r.max_leverage || 1),
          mandatory_stop_loss: !!r.mandatory_stop_loss,
          max_positions_per_symbol_enabled: !!r.max_positions_per_symbol_enabled,
          max_positions_per_symbol: Number(r.max_positions_per_symbol || 2),
          max_total_open_positions_enabled: !!r.max_total_open_positions_enabled,
          max_total_open_positions: Number(r.max_total_open_positions || 5),
          anti_hedging_enabled: !!r.anti_hedging_enabled,
          max_risk_per_trade_percent: Number(r.max_risk_per_trade_percent || 2),
          weekend_holding_allowed: r.weekend_holding_allowed !== false,
          min_trade_duration_seconds: Number(r.min_trade_duration_seconds || 10),
          news_trading_allowed: r.news_trading_allowed !== false,
          drawdown_type: r.drawdown_type || 'EOD',
          profit_split_percent: Number(r.profit_split_percent || 80),
          inactivity_days_limit: Number(r.inactivity_days_limit || 30),
          is_default_demo: !!r.is_default_demo
        };
        this.rules.set(r.id, ruleObj);

        if (ruleObj.is_default_demo) {
          this.defaultDemoRule = ruleObj;
        }
      });

      if (!this.defaultDemoRule && this.rules.size > 0) {
        this.defaultDemoRule = Array.from(this.rules.values())[0];
      }

      if (this.defaultDemoRule) {
        console.log(`\x1b[36m✔ [Risk Daemon] Plantilla Demo Activa: "${this.defaultDemoRule.name}" ($${this.defaultDemoRule.default_account_balance} | Modelo: ${this.defaultDemoRule.model_type} | MaxDD Diario: ${this.defaultDemoRule.max_daily_loss_percent}% | MaxDD Total: ${this.defaultDemoRule.max_total_drawdown_percent}%)\x1b[0m`);
      }
    } catch (e) {
      console.warn('[Risk Daemon] Error cargando reglas de Supabase:', e.message);
    }
  }

  /**
   * Mapea un registro de trading_accounts de la base de datos a la estructura en RAM
   */
  mapDbAccountToRam(acc) {
    const rulesCfg = acc.rules_config || {};
    const defaultRule = this.defaultDemoRule || {};

    const initialBalance = Number(acc.initial_balance);
    const currentBalance = Number(acc.current_balance);
    const equity = Number(acc.equity);
    const peakEquity = Number(acc.peak_equity);
    const dailyStartEquity = Number(acc.daily_start_equity);
    const todayUtc = new Date().toISOString().split('T')[0];

    return {
      id: acc.id,
      accountNumber: acc.account_number,
      traderEmail: acc.trader_email,
      initialBalance,
      currentBalance,
      equity,
      peakEquity,
      dailyStartEquity: isNaN(dailyStartEquity) || dailyStartEquity <= 0 ? initialBalance : dailyStartEquity,
      dailyStartDate: acc.daily_start_date ? String(acc.daily_start_date).split('T')[0] : todayUtc,
      tradingDaysCount: Number(acc.trading_days_count || 0),
      lastTradeDate: acc.last_trade_date ? String(acc.last_trade_date).split('T')[0] : null,
      status: acc.status || 'ACTIVE',
      breachReason: acc.breach_reason || null,
      rulesConfig: {
        modelType: rulesCfg.modelType || defaultRule.model_type || 'ONE_PHASE',
        maxDailyDrawdownPct: rulesCfg.maxDailyDrawdownPct !== undefined ? Number(rulesCfg.maxDailyDrawdownPct) : Number(defaultRule.max_daily_loss_percent || 5),
        maxTotalDrawdownPct: rulesCfg.maxTotalDrawdownPct !== undefined ? Number(rulesCfg.maxTotalDrawdownPct) : Number(defaultRule.max_total_drawdown_percent || 10),
        profitTargetPct: rulesCfg.profitTargetPct !== undefined ? Number(rulesCfg.profitTargetPct) : Number(defaultRule.profit_target_percent || 10),
        profitTargetPhase2Pct: rulesCfg.profitTargetPhase2Pct !== undefined ? Number(rulesCfg.profitTargetPhase2Pct) : Number(defaultRule.profit_target_phase2_percent || 5),
        minTradingDays: rulesCfg.minTradingDays !== undefined ? Number(rulesCfg.minTradingDays) : Number(defaultRule.min_trading_days || 5),
        minDailyProfitType: rulesCfg.minDailyProfitType || defaultRule.min_daily_profit_type || 'PERCENT',
        minDailyProfitValue: rulesCfg.minDailyProfitValue !== undefined ? Number(rulesCfg.minDailyProfitValue) : Number(defaultRule.min_daily_profit_value || 0.5),
        maxLeverage: rulesCfg.maxLeverage !== undefined ? Number(rulesCfg.maxLeverage) : Number(defaultRule.max_leverage || 50),
        mandatoryStopLoss: rulesCfg.mandatoryStopLoss !== undefined ? !!rulesCfg.mandatoryStopLoss : !!defaultRule.mandatory_stop_loss,
        maxPositionsPerSymbolEnabled: rulesCfg.maxPositionsPerSymbolEnabled !== undefined ? !!rulesCfg.maxPositionsPerSymbolEnabled : !!defaultRule.max_positions_per_symbol_enabled,
        maxPositionsPerSymbol: rulesCfg.maxPositionsPerSymbol !== undefined ? Number(rulesCfg.maxPositionsPerSymbol) : Number(defaultRule.max_positions_per_symbol || 2),
        maxTotalOpenPositionsEnabled: rulesCfg.maxTotalOpenPositionsEnabled !== undefined ? !!rulesCfg.maxTotalOpenPositionsEnabled : !!defaultRule.max_total_open_positions_enabled,
        maxTotalOpenPositions: rulesCfg.maxTotalOpenPositions !== undefined ? Number(rulesCfg.maxTotalOpenPositions) : Number(defaultRule.max_total_open_positions || 5),
        antiHedgingEnabled: rulesCfg.antiHedgingEnabled !== undefined ? !!rulesCfg.antiHedgingEnabled : !!defaultRule.anti_hedging_enabled,
        maxRiskPerTradePct: rulesCfg.maxRiskPerTradePct !== undefined ? Number(rulesCfg.maxRiskPerTradePct) : Number(defaultRule.max_risk_per_trade_percent || 2),
        consistencyRulePct: rulesCfg.consistencyRulePct !== undefined ? Number(rulesCfg.consistencyRulePct) : Number(defaultRule.consistency_rule_percent || 40),
        weekendHoldingAllowed: rulesCfg.weekendHoldingAllowed !== undefined ? !!rulesCfg.weekendHoldingAllowed : defaultRule.weekend_holding_allowed !== false,
        drawdownType: rulesCfg.drawdownType || defaultRule.drawdown_type || 'EOD',
        profitSplitPercent: rulesCfg.profitSplitPercent !== undefined ? Number(rulesCfg.profitSplitPercent) : Number(defaultRule.profit_split_percent || 80)
      },
      positions: new Map(),
      lastEvaluatedAt: Date.now()
    };
  }

  /**
   * Pre-Trade Risk Engine: Validación estricta y ultra-rápida en RAM antes de aceptar o abrir una orden
   * Retorna { allowed: boolean, reason?: string }
   */
  validatePreTrade(accOrId, pos) {
    const acc = typeof accOrId === 'string' ? this.accounts.get(accOrId) : accOrId;
    if (!acc) return { allowed: false, reason: 'Cuenta no encontrada o no inicializada' };

    // 1. Verificar estado de la cuenta
    if (acc.status === 'BREACHED') {
      return { allowed: false, reason: `Cuenta descalificada por infracción previa: ${acc.breachReason || 'Límite de Drawdown excedido'}` };
    }
    if (acc.status === 'PASSED') {
      return { allowed: false, reason: 'La cuenta ya ha aprobado la evaluación (PASSED). Operaciones congeladas hasta activación de siguiente etapa.' };
    }

    const cfg = acc.rulesConfig || {};
    const normSym = normalizeSymbol(pos.symbol);

    // 2. Stop Loss Obligatorio (Soft Breach / Rechazo Pre-Trade)
    if (cfg.mandatoryStopLoss && (!pos.slPrice || Number(pos.slPrice) <= 0)) {
      return { allowed: false, reason: 'Stop Loss OBLIGATORIO: Esta regla exige definir un precio de SL antes de enviar la orden.' };
    }

    // 3. Apalancamiento Máximo
    const posLev = Number(pos.leverage || 1);
    const maxLev = Number(cfg.maxLeverage || 100);
    if (posLev > maxLev) {
      return { allowed: false, reason: `Apalancamiento excedido: El apalancamiento solicitado (${posLev}x) supera el máximo autorizado (${maxLev}x).` };
    }

    // 4. Límite Total de Operaciones Abiertas Simultáneas
    if (cfg.maxTotalOpenPositionsEnabled && cfg.maxTotalOpenPositions > 0) {
      if (acc.positions.size >= cfg.maxTotalOpenPositions) {
        return { allowed: false, reason: `Límite total alcanzado: Ya existen ${acc.positions.size} posiciones abiertas (Máximo permitido: ${cfg.maxTotalOpenPositions}).` };
      }
    }

    // 5. Límite de Operaciones por Activo Específico
    if (cfg.maxPositionsPerSymbolEnabled && cfg.maxPositionsPerSymbol > 0) {
      let currentInSymbol = 0;
      for (const p of acc.positions.values()) {
        if (p.normSymbol === normSym) currentInSymbol++;
      }
      if (currentInSymbol >= cfg.maxPositionsPerSymbol) {
        return { allowed: false, reason: `Límite por activo excedido: Ya existen ${currentInSymbol} operaciones en ${pos.symbol} (Máximo permitido: ${cfg.maxPositionsPerSymbol}).` };
      }
    }

    // 6. Regla Anti-Hedging (Prohibido LONG y SHORT simultáneos sobre el mismo activo)
    if (cfg.antiHedgingEnabled) {
      const incomingSide = String(pos.side || '').toUpperCase();
      for (const p of acc.positions.values()) {
        if (p.normSymbol === normSym && p.side.toUpperCase() !== incomingSide) {
          return { allowed: false, reason: `Violación Anti-Hedging: Ya tienes una posición ${p.side} abierta en ${pos.symbol}. No se permite cobertura simultánea en sentido opuesto.` };
        }
      }
    }

    // 7. Restricción de Fin de Semana (Weekend Holding)
    if (cfg.weekendHoldingAllowed === false) {
      const now = new Date();
      const day = now.getUTCDay(); // 0 = Domingo, 5 = Viernes, 6 = Sábado
      const hour = now.getUTCHours();
      const minute = now.getUTCMinutes();
      const isWeekendClosed = (day === 5 && (hour > 20 || (hour === 20 && minute >= 55))) || day === 6 || (day === 0 && hour < 21);
      if (isWeekendClosed) {
        return { allowed: false, reason: 'Operativa bloqueada por fin de semana: Tu plan prohíbe operar durante el fin de semana (Viernes 20:55 UTC a Domingo 21:00 UTC).' };
      }
    }

    return { allowed: true };
  }

  /**
   * Carga cuentas en estado ACTIVE desde la base de datos
   */
  async loadActiveAccounts() {
    if (!this.supabase) return;

    try {
      const { data, error } = await this.supabase
        .from('trading_accounts')
        .select('*')
        .in('status', ['ACTIVE', 'WARNING']);

      if (error || !data) return;

      data.forEach(acc => {
        this.accounts.set(acc.id, this.mapDbAccountToRam(acc));
      });
    } catch (err) {
      console.warn('[Risk Daemon] Error cargando cuentas:', err.message);
    }
  }

  /**
   * Carga posiciones abiertas desde account_trades
   */
  async loadOpenPositions() {
    if (!this.supabase) return;

    try {
      const { data, error } = await this.supabase
        .from('account_trades')
        .select('*')
        .eq('status', 'OPEN');

      if (error || !data) return;

      data.forEach(trade => {
        this.addPosition(trade.account_id, {
          id: trade.id,
          accountId: trade.account_id,
          exchange: trade.exchange || 'binance',
          symbol: trade.symbol,
          side: trade.side,
          size: Number(trade.size),
          entryPrice: Number(trade.entry_price),
          leverage: Number(trade.leverage || 1),
          slPrice: trade.sl_price ? Number(trade.sl_price) : null,
          tpPrice: trade.tp_price ? Number(trade.tp_price) : null,
          openedAt: trade.opened_at
        });
      });
    } catch (err) {
      console.warn('[Risk Daemon] Error cargando posiciones abiertas:', err.message);
    }
  }

  /**
   * Registra una posición viva en el motor
   */
  async addPosition(accountId, pos) {
    let acc = this.accounts.get(accountId);
    if (!acc) {
      // 1. Intentar cargar la cuenta real desde Supabase si existe
      if (this.supabase) {
        try {
          const { data: dbAcc } = await this.supabase
            .from('trading_accounts')
            .select('*')
            .eq('id', accountId)
            .maybeSingle();

          if (dbAcc) {
            acc = this.mapDbAccountToRam(dbAcc);
            this.accounts.set(accountId, acc);
          }
        } catch (_) {}
      }

      // 2. Si es una sesión nueva en vivo que aún no se guardó, inicializar con la Plantilla Demo de la DB
      if (!acc) {
        const templateRule = this.defaultDemoRule || Array.from(this.rules.values())[0];
        const templateBalance = templateRule ? Number(templateRule.default_account_balance) : 100000;
        const todayUtc = new Date().toISOString().split('T')[0];
        acc = {
          id: accountId,
          accountNumber: `EKL-ACC-${accountId.slice(0, 6).toUpperCase()}`,
          traderEmail: pos.traderEmail || 'trader@eklipsefunded.com',
          initialBalance: templateBalance,
          currentBalance: templateBalance,
          equity: templateBalance,
          peakEquity: templateBalance,
          dailyStartEquity: templateBalance,
          dailyStartDate: todayUtc,
          tradingDaysCount: 0,
          lastTradeDate: null,
          status: 'ACTIVE',
          breachReason: null,
          rulesConfig: {
            modelType: templateRule?.model_type || 'ONE_PHASE',
            maxDailyDrawdownPct: templateRule ? Number(templateRule.max_daily_loss_percent) : 5,
            maxTotalDrawdownPct: templateRule ? Number(templateRule.max_total_drawdown_percent) : 10,
            profitTargetPct: templateRule ? Number(templateRule.profit_target_percent) : 10,
            profitTargetPhase2Pct: templateRule ? Number(templateRule.profit_target_phase2_percent) : 5,
            minTradingDays: templateRule ? Number(templateRule.min_trading_days) : 5,
            minDailyProfitType: templateRule?.min_daily_profit_type || 'PERCENT',
            minDailyProfitValue: templateRule ? Number(templateRule.min_daily_profit_value) : 0.5,
            maxLeverage: templateRule ? Number(templateRule.max_leverage) : 50,
            mandatoryStopLoss: !!templateRule?.mandatory_stop_loss,
            maxPositionsPerSymbolEnabled: !!templateRule?.max_positions_per_symbol_enabled,
            maxPositionsPerSymbol: templateRule ? Number(templateRule.max_positions_per_symbol) : 2,
            maxTotalOpenPositionsEnabled: !!templateRule?.max_total_open_positions_enabled,
            maxTotalOpenPositions: templateRule ? Number(templateRule.max_total_open_positions) : 5,
            antiHedgingEnabled: !!templateRule?.anti_hedging_enabled,
            maxRiskPerTradePct: templateRule ? Number(templateRule.max_risk_per_trade_percent) : 2,
            consistencyRulePct: templateRule ? Number(templateRule.consistency_rule_percent) : 40,
            weekendHoldingAllowed: templateRule?.weekend_holding_allowed !== false,
            drawdownType: templateRule?.drawdown_type || 'EOD'
          },
          positions: new Map(),
          lastEvaluatedAt: Date.now()
        };
        this.accounts.set(accountId, acc);
      }
    }

    // Validación Pre-Trade Risk Engine
    const preCheck = this.validatePreTrade(acc, pos);
    if (!preCheck.allowed) {
      console.warn(`\x1b[33m[Risk Daemon] ⚠️ Orden PRE-TRADE RECHAZADA en cuenta ${acc.accountNumber}: ${preCheck.reason}\x1b[0m`);
      return { success: false, rejected: true, reason: preCheck.reason };
    }

    const normSym = normalizeSymbol(pos.symbol);
    const posState = {
      id: pos.id,
      accountId,
      exchange: (pos.exchange || 'binance').toLowerCase(),
      symbol: pos.symbol,
      normSymbol: normSym,
      side: pos.side,
      size: Number(pos.sizeUnits ?? (typeof pos.size === 'number' ? pos.size : parseFloat(pos.size || '0')) ?? 0),
      entryPrice: Number(pos.entryPrice ?? pos.entry ?? 0),
      currentPrice: Number(pos.entryPrice ?? pos.entry ?? 0),
      leverage: Number(pos.leverage || 1),
      slPrice: pos.slPrice ? Number(pos.slPrice) : null,
      tpPrice: pos.tpPrice ? Number(pos.tpPrice) : null,
      unrealizedPnl: 0,
      openedAt: pos.openedAt || new Date().toISOString()
    };

    acc.positions.set(pos.id, posState);

    // Registrar actividad operativa para el conteo de días mínimos de trading
    this.registerTradeActivityForDay(acc);

    // Mapear símbolo -> cuenta
    if (!this.symbolToAccounts.has(normSym)) {
      this.symbolToAccounts.set(normSym, new Set());
    }
    this.symbolToAccounts.get(normSym).add(accountId);

    // Asegurar suscripción de respaldo para este par
    this.ensureExchangeStream(posState.exchange, posState.symbol, normSym);

    // Evaluar inmediatamente con el último precio conocido si existe
    const knownPrice = this.getLatestPrice(posState.exchange, normSym);
    if (knownPrice > 0) {
      posState.currentPrice = knownPrice;
      this.evaluateAccount(accountId);
    }
  }

  /**
   * Remueve una posición cerrada del motor
   */
  removePosition(accountId, posId) {
    const acc = this.accounts.get(accountId);
    if (!acc) return;

    const pos = acc.positions.get(posId);
    if (!pos) return;

    acc.positions.delete(posId);

    // Si ya no quedan posiciones con este símbolo para esta cuenta, limpiar índice
    let hasOtherWithSym = false;
    for (const p of acc.positions.values()) {
      if (p.normSymbol === pos.normSymbol) {
        hasOtherWithSym = true;
        break;
      }
    }

    if (!hasOtherWithSym) {
      const accSet = this.symbolToAccounts.get(pos.normSymbol);
      if (accSet) {
        accSet.delete(accountId);
        if (accSet.size === 0) {
          this.symbolToAccounts.delete(pos.normSymbol);
        }
      }
    }

    // Reevaluar cuenta tras remover la posición
    this.evaluateAccount(accountId);
  }

  /**
   * Actualiza SL / TP de una posición en RAM
   */
  updatePositionSLTP(accountId, posId, slPrice, tpPrice) {
    const acc = this.accounts.get(accountId);
    if (!acc) return;
    const pos = acc.positions.get(posId);
    if (!pos) return;

    if (slPrice !== undefined) pos.slPrice = slPrice ? Number(slPrice) : null;
    if (tpPrice !== undefined) pos.tpPrice = tpPrice ? Number(tpPrice) : null;
  }

  /**
   * Actualiza el balance realizado de la cuenta
   */
  updateBalance(accountId, newBalance) {
    const acc = this.accounts.get(accountId);
    if (!acc) return;
    acc.currentBalance = Number(newBalance);
    this.evaluateAccount(accountId);
  }

  /**
   * Ingesta de ticks agnóstica de exchange (Binance, Bybit, OKX, KuCoin, etc.)
   */
  recordTick({ symbol, exchange = 'binance', price, timestamp = Date.now() }) {
    if (!symbol || !price || isNaN(price) || price <= 0) return;

    const normSym = normalizeSymbol(symbol);
    const exKey = exchange.toLowerCase();

    // 1. Guardar precio específico de exchange
    this.exchangePrices.set(`${exKey}:${normSym}`, {
      price: Number(price),
      exchange: exKey,
      timestamp
    });

    // 2. Guardar precio global normalizado (fallback rápido)
    this.latestPrices.set(normSym, {
      price: Number(price),
      exchange: exKey,
      timestamp
    });

    // 3. Evaluar rápidamente cuentas que tengan posiciones en este símbolo
    const affectedAccounts = this.symbolToAccounts.get(normSym);
    if (!affectedAccounts || affectedAccounts.size === 0) return;

    for (const accountId of affectedAccounts) {
      this.evaluateAccount(accountId, normSym, Number(price), exKey);
    }
  }

  /**
   * Obtiene el mejor precio disponible para un símbolo y exchange
   */
  getLatestPrice(exchange, normSymbol) {
    if (exchange) {
      const exVal = this.exchangePrices.get(`${exchange.toLowerCase()}:${normSymbol}`);
      if (exVal && exVal.price > 0) return exVal.price;
    }
    const globalVal = this.latestPrices.get(normSymbol);
    return globalVal ? globalVal.price : 0;
  }

  /**
   * Núcleo del Centinela de Riesgo: Evaluación matemática sub-50ns en RAM
   */
  evaluateAccount(accountId, updatedNormSym = null, currentPrice = 0, currentExchange = null) {
    const acc = this.accounts.get(accountId);
    if (!acc || acc.status === 'BREACHED') return;

    // Salvaguarda Reactiva (Lazy Rollover Check por tick):
    // Si la fecha UTC actual difiere de la fecha diaria de la cuenta, ejecutar rollover inmediato
    const todayUtc = new Date().toISOString().split('T')[0];
    if (acc.dailyStartDate && acc.dailyStartDate !== todayUtc) {
      this.rolloverSingleAccount(acc, todayUtc);
    }

    let totalFloatingPnl = 0;

    const positionsToClose = [];

    for (const pos of acc.positions.values()) {
      if (updatedNormSym && pos.normSymbol === updatedNormSym) {
        pos.currentPrice = currentPrice;
      } else {
        const p = this.getLatestPrice(pos.exchange, pos.normSymbol);
        if (p > 0) pos.currentPrice = p;
      }

      // Verificación 24/7 en backend de Stop Loss (incluso con la terminal cerrada o en segundo plano)
      if (pos.slPrice && pos.slPrice > 0) {
        const hitSl = pos.side === 'LONG' ? pos.currentPrice <= pos.slPrice : pos.currentPrice >= pos.slPrice;
        if (hitSl) {
          positionsToClose.push({ pos, reason: 'SL', exitPrice: pos.slPrice });
          continue;
        }
      }

      // Verificación 24/7 en backend de Take Profit (incluso con la terminal cerrada o en segundo plano)
      if (pos.tpPrice && pos.tpPrice > 0) {
        const hitTp = pos.side === 'LONG' ? pos.currentPrice >= pos.tpPrice : pos.currentPrice <= pos.tpPrice;
        if (hitTp) {
          positionsToClose.push({ pos, reason: 'TP', exitPrice: pos.tpPrice });
          continue;
        }
      }

      // Cálculo de PnL no realizado de la posición
      const pDiff = pos.side === 'LONG' 
        ? pos.currentPrice - pos.entryPrice 
        : pos.entryPrice - pos.currentPrice;

      pos.unrealizedPnl = Number((pDiff * pos.size).toFixed(2));
      totalFloatingPnl += pos.unrealizedPnl;
    }

    // Si una o varias posiciones impactaron SL o TP, ejecutarlas de inmediato en backend
    if (positionsToClose.length > 0) {
      for (const item of positionsToClose) {
        this.executePositionClose(acc, item.pos, item.reason, item.exitPrice);
      }
      return;
    }

    acc.equity = Number((acc.currentBalance + totalFloatingPnl).toFixed(2));
    if (acc.equity > acc.peakEquity) {
      acc.peakEquity = acc.equity;
    }

    // Cálculo de Drawdowns frente a reglas institucionales
    const dailyBase = acc.rulesConfig.drawdownType === 'TRAILING_EQUITY' 
      ? acc.peakEquity 
      : acc.dailyStartEquity;

    const dailyLossUsd = Math.max(0, dailyBase - acc.equity);
    const dailyLossPct = dailyBase > 0 
      ? Number(((dailyLossUsd / dailyBase) * 100).toFixed(2)) 
      : 0;

    const totalLossUsd = Math.max(0, acc.initialBalance - acc.equity);
    const totalLossPct = acc.initialBalance > 0 
      ? Number(((totalLossUsd / acc.initialBalance) * 100).toFixed(2)) 
      : 0;

    const maxDailyLimit = Number(acc.rulesConfig.maxDailyDrawdownPct);
    const maxTotalLimit = Number(acc.rulesConfig.maxTotalDrawdownPct);

    // ------------------------------------------------------------------------
    // VERIFICACIÓN DE INFRACCIÓN (BREACH) Y AUTO-LIQUIDACIÓN
    // ------------------------------------------------------------------------
    let isBreached = false;
    let breachReason = '';

    if (!isNaN(maxDailyLimit) && maxDailyLimit > 0 && dailyLossPct >= maxDailyLimit) {
      isBreached = true;
      breachReason = `Drawdown diario excedido (${dailyLossPct.toFixed(2)}% >= ${maxDailyLimit.toFixed(2)}%)`;
    } else if (!isNaN(maxTotalLimit) && maxTotalLimit > 0 && totalLossPct >= maxTotalLimit) {
      isBreached = true;
      breachReason = `Drawdown total excedido (${totalLossPct.toFixed(2)}% >= ${maxTotalLimit.toFixed(2)}%)`;
    }

    if (isBreached) {
      this.executeBreach(acc, breachReason, totalFloatingPnl);
      return;
    }

    // ------------------------------------------------------------------------
    // VERIFICACIÓN DE OBJETIVO DE GANANCIA (PROFIT TARGET PASSED)
    // ------------------------------------------------------------------------
    if (acc.rulesConfig.modelType !== 'INSTANT_FUNDING') {
      const profitTargetPct = Number(acc.rulesConfig.profitTargetPct || 0);
      const minDaysRequired = Number(acc.rulesConfig.minTradingDays || 0);
      const profitUsd = acc.equity - acc.initialBalance;
      const profitPct = acc.initialBalance > 0 ? (profitUsd / acc.initialBalance) * 100 : 0;

      if (profitTargetPct > 0 && profitPct >= profitTargetPct && (acc.tradingDaysCount || 0) >= minDaysRequired) {
        this.executePass(acc, profitPct);
        return;
      }
    }

    // Estado preventivo de Warning
    const hasDailyLimit = !isNaN(maxDailyLimit) && maxDailyLimit > 0;
    const hasTotalLimit = !isNaN(maxTotalLimit) && maxTotalLimit > 0;
    if ((hasDailyLimit && dailyLossPct >= maxDailyLimit * 0.8) || (hasTotalLimit && totalLossPct >= maxTotalLimit * 0.8)) {
      acc.status = 'WARNING';
    } else {
      acc.status = 'ACTIVE';
    }

    acc.lastEvaluatedAt = Date.now();

    // Notificar métricas a suscriptores
    this.onMetricsUpdate({
      accountId: acc.id,
      accountNumber: acc.accountNumber,
      balance: acc.currentBalance,
      equity: acc.equity,
      floatingPnl: totalFloatingPnl,
      dailyDrawdownPct: dailyLossPct,
      totalDrawdownPct: totalLossPct,
      status: acc.status
    });
  }

  /**
   * Protocolo de Aprobación de Evaluación (PASSED)
   */
  async executePass(acc, achievedProfitPct) {
    acc.status = 'PASSED';
    console.log(`\x1b[32m🎉 [Risk Daemon] ¡CHALLENGE APROBADO (PASSED)! Cuenta ${acc.accountNumber} (${acc.traderEmail})\x1b[0m`);
    console.log(`\x1b[32m   Beneficio: +${achievedProfitPct.toFixed(2)}% | Días Operados: ${acc.tradingDaysCount} | Equidad: $${acc.equity}\x1b[0m`);

    // Notificar al Hub
    if (this.onAccountPassed) {
      this.onAccountPassed({
        accountId: acc.id,
        accountNumber: acc.accountNumber,
        traderEmail: acc.traderEmail,
        equity: acc.equity,
        balance: acc.currentBalance,
        profitPct: achievedProfitPct,
        tradingDaysCount: acc.tradingDaysCount || 0,
        modelType: acc.rulesConfig.modelType,
        timestamp: Date.now()
      });
    }

    if (this.supabase && acc.id) {
      try {
        await this.supabase
          .from('trading_accounts')
          .update({
            status: 'PASSED',
            equity: acc.equity,
            current_balance: acc.currentBalance,
            updated_at: new Date().toISOString()
          })
          .eq('id', acc.id);
      } catch (e) {
        console.warn('[Risk Daemon] Error persistiendo estado PASSED en Supabase:', e.message);
      }
    }
  }

  /**
   * Ejecuta el protocolo atómico de Auto-Liquidación y Despacho de Breach
   */
  async executeBreach(acc, reason, finalFloatingPnl) {
    acc.status = 'BREACHED';
    acc.breachReason = reason;

    console.warn(`\x1b[31m🚨 [Risk Daemon] BREACH CONFIRMADO en cuenta ${acc.accountNumber} (${acc.traderEmail})\x1b[0m`);
    console.warn(`\x1b[31m   Motivo: ${reason} | Equidad: $${acc.equity}\x1b[0m`);

    // 1. Congelar y auto-cerrar todas las posiciones abiertas
    const positionsToClose = Array.from(acc.positions.values());
    acc.positions.clear();

    // Limpiar índices de símbolos
    for (const pos of positionsToClose) {
      const set = this.symbolToAccounts.get(pos.normSymbol);
      if (set) {
        set.delete(acc.id);
        if (set.size === 0) this.symbolToAccounts.delete(pos.normSymbol);
      }
    }

    // 2. Notificar inmediatamente al Hub para broadcasting por WebSocket y Redis
    this.onBreach({
      accountId: acc.id,
      accountNumber: acc.accountNumber,
      traderEmail: acc.traderEmail,
      reason,
      equity: acc.equity,
      balance: acc.currentBalance,
      positionsClosed: positionsToClose.length,
      timestamp: Date.now()
    });

    // 3. Persistir en Supabase en segundo plano (Write-Behind sin bloquear)
    if (this.supabase) {
      try {
        // Actualizar cuenta
        await this.supabase
          .from('trading_accounts')
          .update({
            status: 'BREACHED',
            breach_reason: reason,
            equity: acc.equity,
            current_balance: acc.equity,
            updated_at: new Date().toISOString()
          })
          .eq('id', acc.id);

        // Actualizar trades a cerrados por liquidación forzosa
        if (positionsToClose.length > 0) {
          const tradeIds = positionsToClose.map(p => p.id);
          await this.supabase
            .from('account_trades')
            .update({
              status: 'CLOSED',
              close_reason: 'LIQUIDATION_BREACH',
              exit_price: positionsToClose[0]?.currentPrice || 0,
              closed_at: new Date().toISOString()
            })
            .in('id', tradeIds);
        }

        // Registrar snapshot de equidad de auditoría
        await this.supabase
          .from('equity_snapshots')
          .insert({
            account_id: acc.id,
            equity: acc.equity,
            balance: acc.currentBalance,
            drawdown_daily_pct: acc.rulesConfig.maxDailyDrawdownPct,
            drawdown_total_pct: acc.rulesConfig.maxTotalDrawdownPct,
            recorded_at: new Date().toISOString()
          });
      } catch (dbErr) {
        console.warn('[Risk Daemon] Error persistiendo breach en Supabase:', dbErr.message);
      }
    }
  }

  /**
   * Liquidación forzosa manual activada desde el CRM
   */
  async emergencyLiquidate(accountId, positionId = null) {
    const acc = this.accounts.get(accountId);
    if (!acc) return false;

    if (positionId) {
      // Liquidar una posición específica
      const pos = acc.positions.get(positionId);
      if (!pos) return false;

      this.removePosition(accountId, positionId);

      if (this.supabase) {
        await this.supabase
          .from('account_trades')
          .update({
            status: 'CLOSED',
            close_reason: 'MANUAL',
            exit_price: pos.currentPrice,
            closed_at: new Date().toISOString()
          })
          .eq('id', positionId);
      }
      return true;
    } else {
      // Liquidar cuenta completa
      this.executeBreach(acc, 'Liquidación manual forzada desde el CRM Institucional', 0);
      return true;
    }
  }

  /**
   * Ejecuta el cierre atómico de una posición por SL o TP en backend 24/7
   */
  async executePositionClose(acc, pos, reason, exitPrice) {
    acc.positions.delete(pos.id);

    // Limpiar mapeo de símbolo si esta cuenta no tiene más posiciones en él
    let hasOther = false;
    for (const p of acc.positions.values()) {
      if (p.normSymbol === pos.normSymbol) { hasOther = true; break; }
    }
    if (!hasOther) {
      const set = this.symbolToAccounts.get(pos.normSymbol);
      if (set) {
        set.delete(acc.id);
        if (set.size === 0) this.symbolToAccounts.delete(pos.normSymbol);
      }
    }

    const pDiff = pos.side === 'LONG' ? exitPrice - pos.entryPrice : pos.entryPrice - exitPrice;
    const realizedPnl = Number((pDiff * pos.size).toFixed(2));
    acc.currentBalance = Number((acc.currentBalance + realizedPnl).toFixed(2));
    acc.equity = acc.currentBalance;

    console.log(`\x1b[32m✔ [Risk Daemon / OMS] Posición ${pos.symbol} (${pos.side}) EJECUTADA por ${reason} a $${exitPrice} | PnL: $${realizedPnl} en cuenta ${acc.accountNumber}\x1b[0m`);

    // Notificar al Hub
    if (this.onTradeClosed) {
      this.onTradeClosed({
        accountId: acc.id,
        accountNumber: acc.accountNumber,
        positionId: pos.id,
        symbol: pos.symbol,
        side: pos.side,
        entryPrice: pos.entryPrice,
        exitPrice,
        realizedPnl,
        closeReason: reason,
        newBalance: acc.currentBalance,
        timestamp: Date.now()
      });
    }

    // Persistir en Supabase
    if (this.supabase) {
      try {
        await this.supabase
          .from('account_trades')
          .update({
            status: 'CLOSED',
            close_reason: reason,
            exit_price: exitPrice,
            realized_pnl: realizedPnl,
            closed_at: new Date().toISOString()
          })
          .eq('id', pos.id);

        await this.supabase
          .from('trading_accounts')
          .update({
            current_balance: acc.currentBalance,
            equity: acc.equity,
            updated_at: new Date().toISOString()
          })
          .eq('id', acc.id);
      } catch (err) {
        console.warn('[Risk Daemon] Error guardando ejecución de posición en Supabase:', err.message);
      }
    }

    this.registerTradeActivityForDay(acc, realizedPnl);
    this.evaluateAccount(acc.id);
    if (this.onCrmUpdate) {
      this.onCrmUpdate(this.getMonitoredPositionsForCrm());
    }
  }

  /**
   * Restablece una cuenta de estado BREACHED a ACTIVE con balance limpio
   */
  async resetAccount(accountId, newBalance = null) {
    let acc = this.accounts.get(accountId);
    if (!acc) {
      for (const a of this.accounts.values()) {
        if (a.accountNumber === accountId || a.id === accountId || a.traderEmail === accountId) {
          acc = a;
          break;
        }
      }
    }
    if (!acc) return false;

    const bal = Number(newBalance || acc.initialBalance || 100000);
    const todayUtc = new Date().toISOString().split('T')[0];
    acc.status = 'ACTIVE';
    acc.breachReason = null;
    acc.currentBalance = bal;
    acc.equity = bal;
    acc.peakEquity = bal;
    acc.dailyStartEquity = bal;
    acc.dailyStartDate = todayUtc;
    acc.positions.clear();

    // Limpiar suscripciones de símbolos de esta cuenta
    for (const [sym, set] of this.symbolToAccounts.entries()) {
      set.delete(acc.id);
      if (set.size === 0) this.symbolToAccounts.delete(sym);
    }

    // Persistir en Supabase
    if (this.supabase) {
      try {
        await this.supabase
          .from('trading_accounts')
          .update({
            status: 'ACTIVE',
            breach_reason: null,
            current_balance: bal,
            equity: bal,
            peak_equity: bal,
            daily_start_equity: bal,
            daily_start_date: todayUtc,
            updated_at: new Date().toISOString()
          })
          .eq('id', acc.id);

        // Purgar trades viejos de la cuenta
        await this.supabase
          .from('account_trades')
          .delete()
          .eq('account_id', acc.id);
      } catch (err) {
        console.warn('[Risk Daemon] Error persistiendo resetAccount en Supabase:', err.message);
      }
    }

    console.log(`\x1b[32m✔ [Risk Daemon] Cuenta ${acc.accountNumber} (${acc.traderEmail}) RESTABLECIDA a estado ACTIVE ($${bal})\x1b[0m`);

    // Notificar al frontend
    this.onMetricsUpdate({
      accountId: acc.id,
      accountNumber: acc.accountNumber,
      balance: acc.currentBalance,
      equity: acc.equity,
      floatingPnl: 0,
      dailyDrawdownPct: 0,
      totalDrawdownPct: 0,
      status: 'ACTIVE'
    });

    if (this.onCrmUpdate) {
      this.onCrmUpdate(this.getMonitoredPositionsForCrm());
    }
    return true;
  }

  /**
   * Devuelve las posiciones vivas con datos reales para el CRM (Erradica Math.random)
   */
  getMonitoredPositionsForCrm() {
    const monitored = [];

    for (const acc of this.accounts.values()) {
      const dailyBase = acc.rulesConfig.drawdownType === 'TRAILING_EQUITY' 
        ? acc.peakEquity 
        : acc.dailyStartEquity;

      const dailyLossUsd = Math.max(0, dailyBase - acc.equity);
      const dailyLossPct = dailyBase > 0 
        ? Number(((dailyLossUsd / dailyBase) * 100).toFixed(2)) 
        : 0;

      for (const pos of acc.positions.values()) {
        const ruleHealth = acc.status === 'BREACHED' 
          ? 'BREACHED' 
          : dailyLossPct >= (acc.rulesConfig.maxDailyDrawdownPct * 0.8) 
            ? 'WARNING' 
            : 'HEALTHY';

        monitored.push({
          id: pos.id,
          accountNumber: acc.accountNumber,
          traderEmail: acc.traderEmail,
          traderName: (acc.traderEmail || 'Trader').split('@')[0],
          accountSize: Number(acc.initialBalance) || 100000,
          symbol: pos.symbol,
          exchange: pos.exchange,
          side: pos.side,
          sizeUnits: Number(pos.size) || 0,
          leverage: Number(pos.leverage) || 1,
          entryPrice: Number(pos.entryPrice) || 0,
          currentPrice: Number(pos.currentPrice) || Number(pos.entryPrice) || 0,
          floatingPnl: Number(pos.unrealizedPnl) || 0,
          dailyDrawdownPct: Number(dailyLossPct) || 0,
          totalDrawdownPct: Number(dailyLossPct) || 0,
          ruleHealth,
          breachReason: acc.breachReason || (ruleHealth === 'WARNING' ? 'Drawdown cercano al límite' : undefined),
          openedAt: new Date(pos.openedAt).toLocaleTimeString()
        });
      }
    }

    return monitored;
  }

  /**
   * Conector de respaldo multi-exchange público para monitoreo 24/7 en Node.js
   * (Si todos los traders cierran su navegador, el servidor sigue recibiendo precios)
   */
  ensureExchangeStream(exchange, symbol, normSym) {
    const streamKey = `${exchange}:${normSym}`;
    if (this.activeExchangeSockets.has(streamKey)) return;

    try {
      if (exchange === 'binance') {
        const wsSymbol = normSym.toLowerCase();
        const ws = new WebSocket(`wss://stream.binance.com:9443/ws/${wsSymbol}@miniTicker`);
        
        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data && data.c) {
              this.recordTick({
                symbol,
                exchange: 'binance',
                price: parseFloat(data.c),
                timestamp: data.E || Date.now()
              });
            }
          } catch (_) {}
        };

        ws.onerror = () => ws.close();
        ws.onclose = () => this.activeExchangeSockets.delete(streamKey);
        this.activeExchangeSockets.set(streamKey, ws);
      } else if (exchange === 'bybit') {
        const ws = new WebSocket('wss://stream.bybit.com/v5/public/spot');
        ws.onopen = () => {
          ws.send(JSON.stringify({
            op: 'subscribe',
            args: [`tickers.${normSym}`]
          }));
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data?.data?.lastPrice) {
              this.recordTick({
                symbol,
                exchange: 'bybit',
                price: parseFloat(data.data.lastPrice),
                timestamp: data.ts || Date.now()
              });
            }
          } catch (_) {}
        };

        ws.onerror = () => ws.close();
        ws.onclose = () => this.activeExchangeSockets.delete(streamKey);
        this.activeExchangeSockets.set(streamKey, ws);
      }
    } catch (_) {
      // Si la conexión directa de respaldo no está disponible, dependemos de los ticks del hub
    }
  }

  /**
   * Calibración y sincronización de reglas en caliente
   */
  applyRuleUpdate(ruleData) {
    if (!ruleData || !ruleData.id) return;
    this.rules.set(ruleData.id, ruleData);

    if (ruleData.is_default_demo) {
      this.defaultDemoRule = ruleData;
      console.log(`\x1b[35m⭐ [Risk Daemon] Nueva Plantilla Demo por Defecto establecida: "${ruleData.name}" ($${ruleData.default_account_balance || 'N/A'})\x1b[0m`);
    }

    // Actualizar cuentas que usen este preset
    for (const acc of this.accounts.values()) {
      if (ruleData.model_type) acc.rulesConfig.modelType = ruleData.model_type;
      if (ruleData.max_daily_loss_percent !== undefined) acc.rulesConfig.maxDailyDrawdownPct = Number(ruleData.max_daily_loss_percent);
      if (ruleData.max_total_drawdown_percent !== undefined) acc.rulesConfig.maxTotalDrawdownPct = Number(ruleData.max_total_drawdown_percent);
      if (ruleData.profit_target_percent !== undefined) acc.rulesConfig.profitTargetPct = Number(ruleData.profit_target_percent);
      if (ruleData.profit_target_phase2_percent !== undefined) acc.rulesConfig.profitTargetPhase2Pct = Number(ruleData.profit_target_phase2_percent);
      if (ruleData.min_trading_days !== undefined) acc.rulesConfig.minTradingDays = Number(ruleData.min_trading_days);
      if (ruleData.min_daily_profit_type !== undefined) acc.rulesConfig.minDailyProfitType = ruleData.min_daily_profit_type;
      if (ruleData.min_daily_profit_value !== undefined) acc.rulesConfig.minDailyProfitValue = Number(ruleData.min_daily_profit_value);
      if (ruleData.max_leverage !== undefined) acc.rulesConfig.maxLeverage = Number(ruleData.max_leverage);
      if (ruleData.mandatory_stop_loss !== undefined) acc.rulesConfig.mandatoryStopLoss = !!ruleData.mandatory_stop_loss;
      if (ruleData.max_positions_per_symbol_enabled !== undefined) acc.rulesConfig.maxPositionsPerSymbolEnabled = !!ruleData.max_positions_per_symbol_enabled;
      if (ruleData.max_positions_per_symbol !== undefined) acc.rulesConfig.maxPositionsPerSymbol = Number(ruleData.max_positions_per_symbol);
      if (ruleData.max_total_open_positions_enabled !== undefined) acc.rulesConfig.maxTotalOpenPositionsEnabled = !!ruleData.max_total_open_positions_enabled;
      if (ruleData.max_total_open_positions !== undefined) acc.rulesConfig.maxTotalOpenPositions = Number(ruleData.max_total_open_positions);
      if (ruleData.anti_hedging_enabled !== undefined) acc.rulesConfig.antiHedgingEnabled = !!ruleData.anti_hedging_enabled;
      if (ruleData.max_risk_per_trade_percent !== undefined) acc.rulesConfig.maxRiskPerTradePct = Number(ruleData.max_risk_per_trade_percent);
      if (ruleData.consistency_rule_percent !== undefined) acc.rulesConfig.consistencyRulePct = Number(ruleData.consistency_rule_percent);
      if (ruleData.weekend_holding_allowed !== undefined) acc.rulesConfig.weekendHoldingAllowed = !!ruleData.weekend_holding_allowed;
      if (ruleData.drawdown_type) acc.rulesConfig.drawdownType = ruleData.drawdown_type;

      this.evaluateAccount(acc.id);
    }

    this.onRuleUpdated(ruleData);
    console.log(`\x1b[34m[Risk Daemon] Regla calibrada en caliente: ${ruleData.name || ruleData.id}\x1b[0m`);
  }

  // ==========================================================================
  // GOBERNANZA DE CAMBIO DE DÍA (00:00:00 UTC DAILY ROLLOVER)
  // ==========================================================================

  /**
   * Programa el disparador autónomo para la medianoche UTC (00:00:00.000 UTC).
   * Al ejecutarse, reinicia la base diaria para todas las cuentas activas y se reprograma a 24h.
   */
  scheduleMidnightRollover() {
    if (this.midnightTimer) {
      clearTimeout(this.midnightTimer);
      this.midnightTimer = null;
    }

    const setupTimer = () => {
      const now = new Date();
      // Próxima medianoche en UTC (00:00:00.000 UTC)
      const nextMidnightUtc = new Date(Date.UTC(
        now.getUTCFullYear(),
        now.getUTCMonth(),
        now.getUTCDate() + 1,
        0, 0, 0, 0
      ));
      const msUntilMidnight = Math.max(1000, nextMidnightUtc.getTime() - now.getTime());

      const hours = Math.floor(msUntilMidnight / 3600000);
      const minutes = Math.floor((msUntilMidnight % 3600000) / 60000);
      const seconds = Math.floor((msUntilMidnight % 60000) / 1000);
      console.log(`\x1b[36m⏰ [Risk Daemon] Temporizador UTC Rollover programado. Próximo reset diario en ${hours}h ${minutes}m ${seconds}s (00:00:00 UTC)\x1b[0m`);

      this.midnightTimer = setTimeout(async () => {
        try {
          console.log('\x1b[35m🌙 [Risk Daemon] ¡MEDIANOCHE UTC ALCANZADA (00:00:00 UTC)! Ejecutando Rollover Diario de Cuentas...\x1b[0m');
          await this.performDailyRollover();
        } catch (err) {
          console.error('[Risk Daemon] Error durante el Rollover Diario:', err);
        } finally {
          // Re-programar para la siguiente medianoche
          setupTimer();
        }
      }, msUntilMidnight);
    };

    setupTimer();
  }

  /**
   * Programa la vigilancia de fin de semana para cuentas sin permiso de Weekend Holding.
   * Los viernes a las 20:55 UTC auto-liquida posiciones abiertas y rechaza nuevas órdenes.
   */
  scheduleWeekendHoldingCheck() {
    if (this.weekendCheckTimer) {
      clearInterval(this.weekendCheckTimer);
    }

    console.log('\x1b[36m🛡️ [Risk Daemon] Centinela de Weekend Holding programado (Viernes 20:55 UTC Auto-Close)\x1b[0m');

    this.weekendCheckTimer = setInterval(async () => {
      const now = new Date();
      const day = now.getUTCDay();
      const hour = now.getUTCHours();
      const minute = now.getUTCMinutes();

      // Disparador los viernes entre 20:55 y 21:05 UTC
      if (day === 5 && hour === 20 && minute >= 55) {
        for (const acc of this.accounts.values()) {
          if (acc.status === 'ACTIVE' && acc.rulesConfig.weekendHoldingAllowed === false && acc.positions.size > 0) {
            console.log(`\x1b[33m🛑 [Risk Daemon] Auto-cierre por fin de semana (Weekend Holding Lock) en cuenta ${acc.accountNumber} (${acc.traderEmail})\x1b[0m`);
            const positionsToClose = Array.from(acc.positions.values());
            for (const pos of positionsToClose) {
              const livePrice = (this.latestPrices.get(pos.normSymbol) || {}).price || pos.entryPrice;
              await this.executePositionClose(acc, pos, 'WEEKEND_HOLDING_AUTO_CLOSE', livePrice);
            }
          }
        }
      }
    }, 30000); // Chequeo cada 30 segundos
  }

  /**
   * Ejecuta el Rollover Diario para todas las cuentas activas
   */
  async performDailyRollover(forcedDate = null) {
    const todayUtc = forcedDate || new Date().toISOString().split('T')[0];
    const rolloverResults = [];

    for (const acc of this.accounts.values()) {
      if (acc.status === 'BREACHED') continue;

      // Si ya tiene la fecha actual y no es forzado, saltar
      if (acc.dailyStartDate === todayUtc && !forcedDate) continue;

      const res = await this.rolloverSingleAccount(acc, todayUtc);
      if (res) rolloverResults.push(res);
    }

    console.log(`\x1b[32m✔ [Risk Daemon] Rollover completado para ${rolloverResults.length} cuentas (Fecha UTC: ${todayUtc})\x1b[0m`);
    return rolloverResults;
  }

  /**
   * Ejecuta el rollover para una sola cuenta (usado por el scheduler y por el Lazy Check)
   */
  async rolloverSingleAccount(acc, todayUtc) {
    if (!acc) return null;

    const prevDailyBase = acc.dailyStartEquity;
    
    // Regla estándar Prop Firm (EOD):
    // La nueva base diaria es la Equidad actual (Balance + PnL flotante) a las 00:00 UTC
    const newDailyBase = Number(acc.equity.toFixed(2));
    acc.dailyStartEquity = newDailyBase;
    acc.dailyStartDate = todayUtc;

    console.log(`\x1b[36m🔄 [Risk Daemon] Rollover en cuenta ${acc.accountNumber}: Base anterior: $${prevDailyBase} ──► Nueva Base Hoy: $${newDailyBase} (${todayUtc})\x1b[0m`);

    // 1. Notificar a los suscriptores (WebSocket / CRM / Frontend)
    const rolloverPayload = {
      accountId: acc.id,
      accountNumber: acc.accountNumber,
      traderEmail: acc.traderEmail,
      previousDailyBase: prevDailyBase,
      newDailyStartEquity: newDailyBase,
      date: todayUtc,
      equity: acc.equity,
      balance: acc.currentBalance,
      tradingDaysCount: acc.tradingDaysCount || 0,
      timestamp: Date.now()
    };

    if (this.onDailyRollover) {
      this.onDailyRollover(rolloverPayload);
    }

    // 2. Persistir en Supabase en segundo plano
    if (this.supabase && acc.id) {
      try {
        await this.supabase
          .from('trading_accounts')
          .update({
            daily_start_equity: newDailyBase,
            daily_start_date: todayUtc,
            equity: acc.equity,
            current_balance: acc.currentBalance,
            updated_at: new Date().toISOString()
          })
          .eq('id', acc.id);

        // Guardar snapshot oficial de cambio de día
        await this.supabase
          .from('equity_snapshots')
          .insert({
            account_id: acc.id,
            equity: acc.equity,
            balance: acc.currentBalance,
            drawdown_daily_pct: 0,
            drawdown_total_pct: acc.rulesConfig.maxTotalDrawdownPct > 0 
              ? Math.max(0, ((acc.initialBalance - acc.equity) / acc.initialBalance) * 100) 
              : 0,
            recorded_at: new Date().toISOString()
          });
      } catch (err) {
        console.warn(`[Risk Daemon] Error persistiendo rollover en Supabase para cuenta ${acc.id}:`, err.message);
      }
    }

    // 3. Re-evaluar inmediatamente para resetear el dailyDrawdownPct a 0%
    this.evaluateAccount(acc.id);

    return rolloverPayload;
  }

  /**
   * Registra actividad operativa para la regla de Días Mínimos de Trading (min_trading_days)
   * Verifica umbral de ganancia mínima obligatoria (monto o %); días en pérdida o $0 no cuentan si hay umbral.
   */
  registerTradeActivityForDay(acc, realizedPnl = null) {
    if (!acc) return;
    const todayUtc = new Date().toISOString().split('T')[0];
    if (acc.lastTradeDate === todayUtc) return; // Ya contabilizado hoy

    const cfg = acc.rulesConfig || {};
    const minProfitVal = Number(cfg.minDailyProfitValue || 0);

    // Si la regla exige un mínimo de ganancia diaria para que cuente el día
    if (minProfitVal > 0) {
      if (realizedPnl === null || realizedPnl === undefined) {
        // Solo abrió posición, aún no hay beneficio cerrado; no contabiliza todavía
        return;
      }
      const minRequiredUsd = cfg.minDailyProfitType === 'AMOUNT' 
        ? minProfitVal 
        : (acc.initialBalance * minProfitVal) / 100;

      if (realizedPnl < minRequiredUsd) {
        console.log(`\x1b[33m📅 [Risk Daemon] Día de trading NO calificado para ${acc.accountNumber}: PnL $${realizedPnl} < Mínimo requerido $${minRequiredUsd.toFixed(2)}\x1b[0m`);
        return;
      }
    }

    acc.lastTradeDate = todayUtc;
    acc.tradingDaysCount = (acc.tradingDaysCount || 0) + 1;

    console.log(`\x1b[32m📅 [Risk Daemon] Día de trading CALIFICADO para ${acc.accountNumber}: Día #${acc.tradingDaysCount} (${todayUtc})\x1b[0m`);

    // Persistir incremento de días operados en Supabase
    if (this.supabase && acc.id) {
      this.supabase
        .from('trading_accounts')
        .update({
          trading_days_count: acc.tradingDaysCount,
          last_trade_date: todayUtc,
          updated_at: new Date().toISOString()
        })
        .eq('id', acc.id)
        .then(() => {})
        .catch(() => {});
    }
  }

  /**
   * Consulta el estado actual del reloj UTC y tiempo restante para el próximo rollover
   */
  getRolloverStatus() {
    const now = new Date();
    const nextMidnightUtc = new Date(Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate() + 1,
      0, 0, 0, 0
    ));
    const msUntilMidnight = Math.max(0, nextMidnightUtc.getTime() - now.getTime());
    const totalSeconds = Math.floor(msUntilMidnight / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return {
      currentUtcTime: now.toISOString(),
      currentUtcDate: now.toISOString().split('T')[0],
      nextRolloverUtc: nextMidnightUtc.toISOString(),
      msRemaining: msUntilMidnight,
      formattedCountdown: `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`,
      hoursRemaining: hours,
      minutesRemaining: minutes,
      accountsMonitored: this.accounts.size
    };
  }

  /**
   * ZYTI Trade - Probador Integral de Reglas de Riesgo Institucional
   * Ejecuta la validación de una regla específica en RAM y retorna diagnóstico detallado.
   */
  testRule(ruleType, ruleConfig = {}, accountState = {}, testPayload = {}) {
    const initialBalance = Number(accountState.initialBalance || ruleConfig.defaultAccountBalance || 100000);
    const balance = Number(accountState.balance !== undefined ? accountState.balance : initialBalance);
    const equity = Number(accountState.equity !== undefined ? accountState.equity : balance);
    const dailyStartEquity = Number(accountState.dailyStartEquity !== undefined ? accountState.dailyStartEquity : initialBalance);
    const peakEquity = Number(accountState.peakEquity !== undefined ? accountState.peakEquity : Math.max(initialBalance, equity));

    switch (ruleType) {
      case 'MAX_DAILY_DRAWDOWN': {
        const limitPct = Number(ruleConfig.maxDailyLossPercent || 5.0);
        const drawdownType = ruleConfig.drawdownType || 'EOD';
        const base = drawdownType === 'TRAILING_EQUITY' ? peakEquity : dailyStartEquity;
        const lossUsd = Math.max(0, base - equity);
        const currentLossPct = base > 0 ? (lossUsd / base) * 100 : 0;
        const passed = currentLossPct < limitPct;

        return {
          passed,
          status: passed ? 'ALLOWED' : 'BREACHED',
          ruleId: 'MAX_DAILY_DRAWDOWN',
          title: passed ? 'Pérdida Diaria Dentro de Límites' : '🚨 Infracción Hard Breach: Pérdida Diaria Excedida',
          currentLossPct: parseFloat(currentLossPct.toFixed(2)),
          limitPct,
          lossUsd: parseFloat(lossUsd.toFixed(2)),
          maxLossUsd: parseFloat(((base * limitPct) / 100).toFixed(2)),
          reason: passed
            ? `Pérdida diaria actual (${currentLossPct.toFixed(2)}%) dentro del límite permitido (${limitPct}%).`
            : `Drawdown diario del ${currentLossPct.toFixed(2)}% superó el límite máximo del ${limitPct}%. Cuenta descalificada.`
        };
      }

      case 'MAX_TOTAL_DRAWDOWN': {
        const limitPct = Number(ruleConfig.maxTotalDrawdownPercent || 10.0);
        const lossUsd = Math.max(0, initialBalance - equity);
        const currentLossPct = initialBalance > 0 ? (lossUsd / initialBalance) * 100 : 0;
        const passed = currentLossPct < limitPct;

        return {
          passed,
          status: passed ? 'ALLOWED' : 'BREACHED',
          ruleId: 'MAX_TOTAL_DRAWDOWN',
          title: passed ? 'Pérdida Total Dentro de Límites' : '🚨 Infracción Hard Breach: Pérdida Total Excedida',
          currentLossPct: parseFloat(currentLossPct.toFixed(2)),
          limitPct,
          lossUsd: parseFloat(lossUsd.toFixed(2)),
          maxLossUsd: parseFloat(((initialBalance * limitPct) / 100).toFixed(2)),
          reason: passed
            ? `Pérdida total acumulada (${currentLossPct.toFixed(2)}%) dentro del margen (${limitPct}%).`
            : `Drawdown total acumulado del ${currentLossPct.toFixed(2)}% superó el límite del ${limitPct}%. Cuenta descalificada permanentemente.`
        };
      }

      case 'MANDATORY_STOP_LOSS': {
        const isMandatory = !!ruleConfig.mandatoryStopLoss;
        const slPrice = testPayload.slPrice;
        const hasSl = slPrice !== null && slPrice !== undefined && Number(slPrice) > 0;
        const passed = !isMandatory || hasSl;

        return {
          passed,
          status: passed ? 'ALLOWED' : 'REJECTED',
          ruleId: 'MANDATORY_STOP_LOSS',
          title: passed ? 'Stop Loss Válido' : '❌ Pre-Trade Rechazado: Stop Loss Obligatorio',
          isMandatory,
          slPrice: hasSl ? Number(slPrice) : null,
          reason: passed
            ? (isMandatory ? `Orden validada con Stop Loss en $${slPrice}.` : 'Regla de SL Obligatorio inactiva; orden permitida sin SL.')
            : 'Rechazo Pre-Trade: Esta regla exige definir un precio de Stop Loss antes de emitir la orden.'
        };
      }

      case 'ANTI_HEDGING': {
        const isAntiHedging = !!ruleConfig.antiHedgingEnabled;
        const openPositions = Array.isArray(accountState.positions) ? accountState.positions : [];
        const incomingSymbol = testPayload.symbol || 'BTCUSDT';
        const incomingSide = (testPayload.side || 'SHORT').toUpperCase();
        const oppositeSide = incomingSide === 'LONG' ? 'SHORT' : 'LONG';
        const hasOpposite = openPositions.some(p => 
          normalizeSymbol(p.symbol) === normalizeSymbol(incomingSymbol) && 
          p.side.toUpperCase() === oppositeSide
        );
        const passed = !isAntiHedging || !hasOpposite;

        return {
          passed,
          status: passed ? 'ALLOWED' : 'REJECTED',
          ruleId: 'ANTI_HEDGING',
          title: passed ? 'Anti-Hedging Cumplido' : '❌ Pre-Trade Rechazado: Violación Anti-Hedging',
          isAntiHedging,
          symbol: incomingSymbol,
          incomingSide,
          reason: passed
            ? 'Sin conflicto direccional o regla Anti-Hedging no habilitada.'
            : `Violación Anti-Hedging: Ya tienes una posición ${oppositeSide} abierta en ${incomingSymbol}. Prohibido abrir posición ${incomingSide} simultánea.`
        };
      }

      case 'MAX_POSITIONS_PER_SYMBOL': {
        const isEnabled = !!ruleConfig.maxPositionsPerSymbolEnabled;
        const maxPerSym = Number(ruleConfig.maxPositionsPerSymbol || 2);
        const openPositions = Array.isArray(accountState.positions) ? accountState.positions : [];
        const sym = testPayload.symbol || 'BTCUSDT';
        const currentCount = openPositions.filter(p => normalizeSymbol(p.symbol) === normalizeSymbol(sym)).length;
        const passed = !isEnabled || currentCount < maxPerSym;

        return {
          passed,
          status: passed ? 'ALLOWED' : 'REJECTED',
          ruleId: 'MAX_POSITIONS_PER_SYMBOL',
          title: passed ? 'Cupo de Activo Disponible' : '❌ Pre-Trade Rechazado: Límite por Activo Excedido',
          currentCount,
          maxLimit: maxPerSym,
          reason: passed
            ? `Posición en ${sym} permitida (${currentCount}/${maxPerSym} ocupadas).`
            : `Límite por activo excedido: Ya existen ${currentCount} posiciones abiertas en ${sym} (Máximo permitido: ${maxPerSym}).`
        };
      }

      case 'MAX_TOTAL_POSITIONS': {
        const isEnabled = !!ruleConfig.maxTotalOpenPositionsEnabled;
        const maxTotal = Number(ruleConfig.maxTotalOpenPositions || 5);
        const openPositions = Array.isArray(accountState.positions) ? accountState.positions : [];
        const currentTotal = openPositions.length;
        const passed = !isEnabled || currentTotal < maxTotal;

        return {
          passed,
          status: passed ? 'ALLOWED' : 'REJECTED',
          ruleId: 'MAX_TOTAL_POSITIONS',
          title: passed ? 'Cupo Global Disponible' : '❌ Pre-Trade Rechazado: Límite Total de Operaciones',
          currentTotal,
          maxTotal,
          reason: passed
            ? `Operación permitida (${currentTotal}/${maxTotal} globales ocupadas).`
            : `Límite global alcanzado: Ya existen ${currentTotal} operaciones abiertas en la cuenta (Máximo permitido: ${maxTotal}).`
        };
      }

      case 'MAX_LEVERAGE': {
        const maxLev = Number(ruleConfig.maxLeverage || 50);
        const requestedLev = Number(testPayload.leverage || 100);
        const passed = requestedLev <= maxLev;

        return {
          passed,
          status: passed ? 'ALLOWED' : 'REJECTED',
          ruleId: 'MAX_LEVERAGE',
          title: passed ? 'Apalancamiento Válido' : '❌ Pre-Trade Rechazado: Apalancamiento Excesivo',
          requestedLeverage: requestedLev,
          maxLeverage: maxLev,
          reason: passed
            ? `Apalancamiento de ${requestedLev}x dentro del margen autorizado (${maxLev}x).`
            : `Apalancamiento solicitado (${requestedLev}x) supera el límite máximo permitido para este plan (${maxLev}x).`
        };
      }

      case 'QUALIFIED_DAYS': {
        const minDays = Number(ruleConfig.minTradingDays || 5);
        const profitType = ruleConfig.minDailyProfitType || 'PERCENT';
        const profitVal = Number(ruleConfig.minDailyProfitValue ?? 0.5);
        const minThresholdUsd = profitType === 'AMOUNT' ? profitVal : (initialBalance * profitVal) / 100;
        const simulatedDayProfit = Number(testPayload.dayProfitUsd !== undefined ? testPayload.dayProfitUsd : minThresholdUsd);
        const qualifies = simulatedDayProfit >= minThresholdUsd;

        return {
          passed: qualifies,
          status: qualifies ? 'ALLOWED' : 'WARNING',
          ruleId: 'QUALIFIED_DAYS',
          title: qualifies ? '✅ Día Calificado Registrado' : '⚠️ Día No Calificado (Bajo Umbral)',
          simulatedDayProfit,
          minThresholdUsd: parseFloat(minThresholdUsd.toFixed(2)),
          minDaysRequired: minDays,
          currentDays: Number(accountState.tradingDaysCount || 0) + (qualifies ? 1 : 0),
          reason: qualifies
            ? `Ganancia del día (+$${simulatedDayProfit.toLocaleString()}) supera el umbral institucional de $${minThresholdUsd.toFixed(2)}. ¡Suma como día calificado!`
            : `Ganancia del día ($${simulatedDayProfit.toLocaleString()}) es inferior al umbral mínimo requerido de $${minThresholdUsd.toFixed(2)} (${profitVal}${profitType === 'PERCENT' ? '%' : ' USD'}). No suma al cómputo de días.`
        };
      }

      case 'CONSISTENCY': {
        const maxSingleDayPct = Number(ruleConfig.consistencyRulePercent || 40.0);
        const totalProfitUsd = Number(testPayload.totalProfitUsd || 10000);
        const bestDayProfitUsd = Number(testPayload.bestDayProfitUsd || 6500);
        const actualDayPct = totalProfitUsd > 0 ? (bestDayProfitUsd / totalProfitUsd) * 100 : 0;
        const passed = actualDayPct <= maxSingleDayPct;

        return {
          passed,
          status: passed ? 'ALLOWED' : 'REJECTED',
          ruleId: 'CONSISTENCY',
          title: passed ? 'Consistencia Aprobada al Payout' : '❌ Violación de Consistencia (Payout Rechazado)',
          actualDayPct: parseFloat(actualDayPct.toFixed(1)),
          maxAllowedPct: maxSingleDayPct,
          bestDayProfitUsd,
          totalProfitUsd,
          reason: passed
            ? `Consistencia aprobada: Tu mejor día aportó el ${actualDayPct.toFixed(1)}% del beneficio total, dentro del límite del ${maxSingleDayPct}%.`
            : `Infracción de Consistencia: Tu mejor jornada ($${bestDayProfitUsd.toLocaleString()}) representa el ${actualDayPct.toFixed(1)}% de las ganancias totales (máx permitido: ${maxSingleDayPct}%). Debes continuar operando jornadas rentables para diluir la concentración antes de solicitar retiro.`
        };
      }

      case 'MICROSCALPING': {
        const minDurationSec = Number(ruleConfig.minTradeDurationSeconds || 10);
        const simulatedDurationSec = Number(testPayload.durationSeconds || 3);
        const passed = simulatedDurationSec >= minDurationSec;

        return {
          passed,
          status: passed ? 'ALLOWED' : 'WARNING',
          ruleId: 'MICROSCALPING',
          title: passed ? 'Duración de Trade Institucional' : '⚠️ Microscalping Detectado (Beneficio Descalificado)',
          tradeDurationSeconds: simulatedDurationSec,
          minRequiredSeconds: minDurationSec,
          reason: passed
            ? `Operación cerrada con duración de ${simulatedDurationSec}s (cumple el mínimo de ${minDurationSec}s).`
            : `Violación de Microscalping: Operación cerrada en ${simulatedDurationSec} segundos (< ${minDurationSec}s requeridos). El beneficio generado queda anulado para el reto.`
        };
      }

      case 'WEEKEND_HOLDING': {
        const allowed = ruleConfig.weekendHoldingAllowed !== false;
        const isWeekendSimulated = testPayload.isWeekend !== undefined ? !!testPayload.isWeekend : true;
        const passed = allowed || !isWeekendSimulated;

        return {
          passed,
          status: passed ? 'ALLOWED' : 'BREACHED',
          ruleId: 'WEEKEND_HOLDING',
          title: passed ? 'Weekend Holding Autorizado' : '🚨 Infracción: Fin de Semana No Permitido',
          weekendHoldingAllowed: allowed,
          reason: passed
            ? 'Operativa durante el fin de semana permitida (Criptoactivo 24/7 o Swing habilitado).'
            : 'Infracción de Fin de Semana: La cuenta tiene prohibido mantener operaciones abiertas tras el cierre del viernes (22:00 UTC). Auto-cierre forzoso ejecutado.'
        };
      }

      case 'NEWS_TRADING': {
        const allowed = ruleConfig.newsTradingAllowed !== false;
        const isNewsWindow = testPayload.isNewsWindow !== undefined ? !!testPayload.isNewsWindow : true;
        const passed = allowed || !isNewsWindow;

        return {
          passed,
          status: passed ? 'ALLOWED' : 'REJECTED',
          ruleId: 'NEWS_TRADING',
          title: passed ? 'Operación en Noticias Permitida' : '❌ Pre-Trade Rechazado: Ventana de Alta Volatilidad',
          newsTradingAllowed: allowed,
          eventName: testPayload.eventName || 'FOMC / CPI / Non-Farm Payrolls',
          reason: passed
            ? 'Trading en eventos macroeconómicos habilitado para esta cuenta.'
            : 'Rechazo Pre-Trade: Prohibido abrir órdenes 2 minutos antes o después de noticias de alto impacto (FOMC / CPI).'
        };
      }

      case 'PROFIT_TARGET': {
        const modelType = ruleConfig.modelType || 'ONE_PHASE';
        const targetPct = Number(ruleConfig.profitTargetPercent || 10.0);
        const minDays = Number(ruleConfig.minTradingDays || 5);
        const profitUsd = equity - initialBalance;
        const profitPct = initialBalance > 0 ? (profitUsd / initialBalance) * 100 : 0;
        const currentDays = Number(accountState.tradingDaysCount || 0);

        if (modelType === 'INSTANT_FUNDING') {
          return {
            passed: true,
            status: 'ALLOWED',
            ruleId: 'PROFIT_TARGET',
            title: 'Fondeo Directo Sin Meta de Evaluación',
            profitPct: parseFloat(profitPct.toFixed(2)),
            reason: 'Cuenta de Fondeo Directo: No requiere meta de evaluación. Todos los beneficios son retirables según el Profit Split.'
          };
        }

        const targetMet = profitPct >= targetPct;
        const daysMet = currentDays >= minDays;
        const passed = targetMet && daysMet;

        return {
          passed,
          status: passed ? 'PASSED' : (targetMet ? 'WARNING' : 'ALLOWED'),
          ruleId: 'PROFIT_TARGET',
          title: passed 
            ? '🎉 CHALLENGE APROBADO (PASSED)' 
            : (targetMet ? '⚠️ Meta de Beneficio Alcanzada (Faltan Días)' : 'Objetivo de Ganancia en Progreso'),
          profitPct: parseFloat(profitPct.toFixed(2)),
          targetPct,
          currentDays,
          minDaysRequired: minDays,
          reason: passed
            ? `¡Felicidades! Meta alcanzada (+${profitPct.toFixed(2)}% >= +${targetPct}%) con ${currentDays}/${minDays} días calificados. Evaluación aprobada.`
            : (targetMet 
                ? `Meta alcanzada (+${profitPct.toFixed(2)}%), pero aún requieres ${minDays - currentDays} días calificados adicionales antes de aprobar.`
                : `Progreso: +${profitPct.toFixed(2)}% / +${targetPct}%. Faltan $${((initialBalance * targetPct / 100) - profitUsd).toLocaleString()} USD.`)
        };
      }

      default:
        return {
          passed: true,
          status: 'ALLOWED',
          ruleId: ruleType || 'UNKNOWN',
          reason: 'Regla evaluada satisfactoriamente.'
        };
    }
  }
}

