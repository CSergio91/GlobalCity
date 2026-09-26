import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'en' | 'es';

export interface Translations {
  nav: {
    multiVenue: string;
    arbitrage: string;
    modules: string;
    rebalance: string;
    copyTrading: string;
    calculator: string;
    openTerminal: string;
    terminalBtn: string;
  };
  hero: {
    headlineStart: string;
    headlineEnd: string;
    subheadline: string;
    openTerminalBtn: string;
    exploreModulesBtn: string;
    telemetry: {
      t1Title: string;
      t1Desc: string;
      t2Title: string;
      t2Desc: string;
      t3Title: string;
      t3Desc: string;
      t4Title: string;
      t4Desc: string;
    };
    liveTelemetry: {
      title: string;
      desc: string;
    };
    rotatingWords: string[];
  };
  multiVenue: {
    titleStart: string;
    titleEnd: string;
    subtitle: string;
    equityLabel: string;
    feedTitle: string;
    allAssets: string;
    latencyText: string;
    splitOrderBtn: string;
    gatewaysTitle: string;
    gatewaysSubtitle: string;
    depthLabel: string;
    manageCredentialsBtn: string;
  };
  showcase: {
    slides: {
      index: string;
      title: string;
      description: string;
      highlightStat: string;
      highlightLabel: string;
      tags: { label: string; value: string }[];
    }[];
    ctaBtn: string;
  };
  calculator: {
    titleStart: string;
    titleEnd: string;
    subtitle: string;
    capitalParamsTitle: string;
    capitalParamsSubtitle: string;
    assignedCapital: string;
    buyAt: string;
    sellAt: string;
    simulatingBtn: string;
    simulateBtn: string;
    breakdownTitle: string;
    breakdownSubtitle: string;
    positiveSpread: string;
    netProfitLabel: string;
    netSpreadEffective: string;
    afterFees: string;
    grossSpread: string;
    takerFees: string;
    traderShare: string;
    infraFee: string;
    successToast: (buy: string, sell: string) => string;
  };
  rebalancing: {
    titleStart: string;
    titleEnd: string;
    subtitle: string;
    gasSavingsLabel: string;
    gasSavingsSub: string;
    simulatorTitle: string;
    simulatorSubtitle: string;
    adjustImbalance: string;
    balanced: string;
    thresholdAlert: string;
    critical: string;
    deviationDetected: string;
    inOptimalRange: string;
    deviationText: (amount: string) => string;
    optimalText: string;
    directionalRisk: string;
    deltaNeutral: string;
    securityTitle: string;
    securitySubtitle: string;
    sec1Title: string;
    sec1Desc: string;
    sec2Title: string;
    sec2Desc: string;
    sec3Title: string;
    sec3Desc: string;
    auditVerified: string;
  };
  copyTrading: {
    titleStart: string;
    titleEnd: string;
    subtitle: string;
    step1Tag: string;
    step1Title: string;
    step1Desc: string;
    step2Tag: string;
    step2Title: string;
    step2Desc: string;
    step2ComputeTime: string;
    step3Tag: string;
    step3Title: string;
    step3Desc: string;
    stopLossGuarantee: string;
    leverageAudit: string;
  };
  telegram: {
    titleStart: string;
    titleEnd: string;
    subtitle: string;
    webhookLatency: string;
    protocolTitle: string;
    protocolSubtitle: string;
    f1Title: string;
    f1Desc: string;
    f2Title: string;
    f2Desc: string;
    f3Title: string;
    f3Desc: string;
    selectCommand: string;
    botVerified: string;
    nodeOperative: string;
    confirmEmergencyBtn: string;
    cancelBtn: string;
    tlsNotice: string;
  };
  cta: {
    titleStart: string;
    titleEnd: string;
    subtitle: string;
    accessTerminalBtn: string;
    exploreGatewaysBtn: string;
  };
  footer: {
    brandDesc: string;
    quickLinks: string;
    legal: string;
    disclaimer: string;
    riskTitle: string;
    riskDisclaimerFull: string;
    connectorsTitle: string;
    connectorsCount: string;
    securityTitle: string;
  };
}

export const translations: Record<Language, Translations> = {
  en: {
    nav: {
      multiVenue: "Multi-Venue & Brokers",
      arbitrage: "Synthetic Arbitrage",
      modules: "Modules & Telegram",
      rebalance: "Rebalancing",
      copyTrading: "Cross-Copy Trading",
      calculator: "VWAP Calculator",
      openTerminal: "Open Unified Terminal",
      terminalBtn: "Terminal",
    },
    hero: {
      headlineStart: "Operate Your Global Portfolio from a Single",
      headlineEnd: "",
      subheadline: "Unify Crypto, Forex, and Futures. Execute simultaneous synthetic arbitrage and command your operation from Telegram.",
      openTerminalBtn: "Open Unified Trading Terminal",
      exploreModulesBtn: "Explore Trading Modules",
      telemetry: {
        t1Title: "Non-Custodial Protocol",
        t1Desc: "Zero withdrawal permissions by mathematical design",
        t2Title: "Synthetic Arbitrage",
        t2Desc: "Atomic L2 routing with fee rebate deduction",
        t3Title: "Mobile Remote Control",
        t3Desc: "Real-time equity monitoring and biometric panic-switch",
        t4Title: "Lot Normalization",
        t4Desc: "Dynamic mapping across cTrader, MT5 and FIX gateways",
      },
      liveTelemetry: {
        title: "Smart Order Router & Cross Bridge Active",
        desc: "Routing microsecond order flows across Bybit, OKX, cTrader Open API and parallel MT5 terminals.",
      },
      rotatingWords: [
        "Terminal",
        "Dashboard",
        "Server",
        "Telegram",
        "Protocol",
        "Gateway",
        "Command",
        "Radar",
        "Ecosystem",
        "Bridge",
      ],
    },
    multiVenue: {
      titleStart: "A Single Command.",
      titleEnd: "Every Venue on Earth.",
      subtitle: "Consolidate liquidity, Level 2 order books, and concurrent execution across the world's premier venues without fragmenting capital or collateral.",
      equityLabel: "Consolidated Equity",
      feedTitle: "Streaming Market Prices Feed",
      allAssets: "All Assets",
      latencyText: "WebSocket broadcast latency: sub-2ms",
      splitOrderBtn: "Execute Live Split-Order",
      gatewaysTitle: "Active Connection Gateways",
      gatewaysSubtitle: "Native binary protocols without web intermediaries",
      depthLabel: "Depth",
      manageCredentialsBtn: "Manage Credentials in Terminal",
    },
    showcase: {
      slides: [
        {
          index: "01",
          title: "Unify Crypto, Forex, and Futures Without Capital Dispersion",
          description: "Connect institutional accounts on Bybit v5, OKX DMA, Binance, cTrader Open API, and MetaTrader 5 into a centralized command deck. Credentials operate under strict non-custodial security: zero withdrawal permissions by mathematical design.",
          highlightStat: "2.4 ms",
          highlightLabel: "Average institutional execution latency",
          tags: [
            { label: "Architecture", value: "Non-Custodial (Read & Trade)" },
            { label: "Gateways", value: "Bybit · OKX · Binance · cTrader · MT5" },
            { label: "Protocol", value: "WebSockets + Protobuf TLS & FIX" }
          ]
        },
        {
          index: "02",
          title: "Capture Simultaneous Spread Inefficiencies in Sub-100ms",
          description: "Forget slow on-chain bridges exposed to block delays and liquidation risk. The engine analyzes Level 2 order books in real time, factors in taker fees and VWAP slippage, and executes atomic concurrent orders with instant rollback guarantees.",
          highlightStat: "< 95 ms",
          highlightLabel: "Simultaneous atomic dispatch window",
          tags: [
            { label: "Execution Safety", value: "Atomic Promise.allSettled + Rollback" },
            { label: "Fee Reservoir", value: "Virtual Gas Tank in USDT" },
            { label: "Spread Formula", value: "Net Spread > Taker A + Taker B + Slippage" }
          ]
        },
        {
          index: "03",
          title: "Monitoring, Live Fills, and Global Panic-Switch on Your Phone",
          description: "Command global execution anywhere in the world. Receive consolidated equity snapshots, push arbitrage notifications, and execute instant emergency market closures across all venues with 2FA biometric confirmation.",
          highlightStat: "100%",
          highlightLabel: "End-to-end encrypted remote control",
          tags: [
            { label: "Authentication", value: "HMAC-SHA256 + User Whitelist" },
            { label: "Response Latency", value: "< 180ms via Secure Webhook" },
            { label: "Quick Commands", value: "/portfolio · /rebalance · /panic_close_all" }
          ]
        },
        {
          index: "04",
          title: "Balance Balances Across Venues with Zero Blockchain Transfers",
          description: "Zero network gas fees and zero block confirmation delays. The synthetic rebalancing algorithm opens and closes inverse delta-neutral hedges between venues to reallocate effective margin instantly without moving physical funds.",
          highlightStat: "$0.00",
          highlightLabel: "Blockchain gas fee on rebalancing",
          tags: [
            { label: "Mechanism", value: "Concurrent Delta-Neutral Hedging" },
            { label: "Speed", value: "Immediate at market price" },
            { label: "Market Risk", value: "Zero directional exposure during execution" }
          ]
        },
        {
          index: "05",
          title: "Mirror Crypto Signals to Forex and Futures with Dynamic Lot Sizing",
          description: "The engine normalizes asset dimensionality in microseconds, translating Bitcoin or Solana volume into standard FX lots on MetaTrader 5 or regulated CME futures contracts, calibrated to your account risk and margin parameters.",
          highlightStat: "< 15 ms",
          highlightLabel: "Cross-platform replication latency",
          tags: [
            { label: "Symbol Translation", value: "Canonical Mapper (BTC/USDT ↔ BTCUSD.raw)" },
            { label: "Dynamic Risk", value: "Equity & leverage proportion calibration" },
            { label: "Protection", value: "Automatic inherited Stop-Loss cap" }
          ]
        }
      ],
      ctaBtn: "Test this module in Terminal",
    },
    calculator: {
      titleStart: "Cross-Venue Arbitrage.",
      titleEnd: "Real-Time Spread Capture Without On-Chain Risk.",
      subtitle: "Detect real-time price discrepancies across premier exchanges with instant taker fee deduction and Level 2 VWAP depth calculation. No slow bridges or liquidation risk.",
      capitalParamsTitle: "Capital & Margin Parameters",
      capitalParamsSubtitle: "Virtual allocation for concurrent dual-order dispatch",
      assignedCapital: "Assigned Capital",
      buyAt: "Buy on",
      sellAt: "Sell on",
      simulatingBtn: "Verifying L2 Depth & Routing...",
      simulateBtn: "Simulate Concurrent Sub-100ms Dispatch",
      breakdownTitle: "Net Return Breakdown",
      breakdownSubtitle: "Mathematical audit computed via VWAP order book model",
      positiveSpread: "POSITIVE SPREAD",
      netProfitLabel: "Estimated Net Profit",
      netSpreadEffective: "Effective Net Spread",
      afterFees: "after all taker fees",
      grossSpread: "Gross Quotation Spread:",
      takerFees: "Combined Taker Fees:",
      traderShare: "Trader Profit Share (80%):",
      infraFee: "Infrastructure Fee (20% Gas Tank):",
      successToast: (buy: string, sell: string) => `Order executed in 84ms! Concurrent buy on ${buy} and sell on ${sell} confirmed with zero leg risk.`,
    },
    rebalancing: {
      titleStart: "Synthetic Rebalancing.",
      titleEnd: "Zero On-Chain Network Transfers.",
      subtitle: "Balance balances between venues via inverse delta-neutral orders. Avoid blockchain gas fees, eliminate block delays, and keep your API keys strictly withdrawal-free.",
      gasSavingsLabel: "Blockchain Gas Savings",
      gasSavingsSub: "IMMEDIATE MARKET EXECUTION",
      simulatorTitle: "Margin Skew Simulator",
      simulatorSubtitle: "Optimal liquidity ratio control between venues",
      adjustImbalance: "Adjust Simulated Imbalance",
      balanced: "Balanced (50/50)",
      thresholdAlert: "Threshold Alert (70/30)",
      critical: "Critical (85/15)",
      deviationDetected: "Imbalance Detected: Action Recommended",
      inOptimalRange: "Operating Ratios Within Optimal Range",
      deviationText: (amount: string) => `Algorithm recommends executing an inverse mirror order of $${amount} USDT to synchronize Bybit margin without wallet withdrawals.`,
      optimalText: "Reserves across both venues comfortably support continuous concurrent order bursts with zero margin deficit risk.",
      directionalRisk: "Directional risk during execution: 0.00%",
      deltaNeutral: "Delta-Neutral Protocol",
      securityTitle: "Security Guarantees",
      securitySubtitle: "Strictly non-custodial architecture",
      sec1Title: "1. Read & Trade Keys Only",
      sec1Desc: "Global City automatically rejects any API key with withdrawal or external transfer permissions enabled.",
      sec2Title: "2. Low-Cost Route Advising",
      sec2Desc: "If the trader opts for a manual transfer, the engine identifies low-cost Layer-2 networks below $0.50.",
      sec3Title: "3. AES-256 Client-Side Encryption",
      sec3Desc: "API secrets are encrypted with user-derived keys before being loaded into terminal volatile memory.",
      auditVerified: "Permission Audit Verified in Real Time",
    },
    copyTrading: {
      titleStart: "Cross-Bridge Copy Trading.",
      titleEnd: "From Crypto to Forex CFDs & Regulated Futures.",
      subtitle: "Replicate master orders triggered on crypto exchanges directly into cTrader, MetaTrader 5, or CME futures with instant lot and leverage calibration.",
      step1Tag: "01 // MASTER SOURCE",
      step1Title: "Master Order Trigger",
      step1Desc: "A manual trade, TradingView webhook, or algorithmic bot opens a position on Bybit v5 or Hyperliquid L1.",
      step2Tag: "02 // CANONICAL NORMALIZATION",
      step2Title: "SymbolMapper & Lot Calibrator",
      step2Desc: "Translates universal symbol BTC/USDT into broker-specific identifiers (e.g. BTCUSD.pro) and scales lot sizes proportional to each slave account equity.",
      step2ComputeTime: "Computation time: 1.2 ms",
      step3Tag: "03 // MULTI-VENUE DISPATCH",
      step3Title: "Destination Execution",
      step3Desc: "Orders are concurrently dispatched to connected brokers without slippage or noticeable latency.",
      stopLossGuarantee: "Integrated Stop-Loss Protection: Slave orders automatically inherit master SL/TP parameters.",
      leverageAudit: "Audited algorithm prevents accidental over-leverage",
    },
    telegram: {
      titleStart: "Command Your Financial Empire from",
      titleEnd: "Telegram.",
      subtitle: "No need to juggle 5 broker tabs on your laptop. Receive instant fill telemetry, arbitrage radar alerts, and trigger the global panic button directly from your phone with military-grade encryption.",
      webhookLatency: "Telegram Webhook Latency",
      protocolTitle: "Notification & Execution Protocol",
      protocolSubtitle: "Point-to-point secure link to your private host",
      f1Title: "Live Order Telemetry & Fills",
      f1Desc: "Push alerts in under 50ms when an order fills on Bybit, OKX, cTrader, or MT5 with full fee and price breakdown.",
      f2Title: "Global Panic Switch (/panic_close_all)",
      f2Desc: "Instantly cancel all open orders and flatten positions to market across every connected venue during adverse macro events.",
      f3Title: "Strict Whitelist & 2FA Protection",
      f3Desc: "The bot exclusively accepts commands from your verified Telegram ID and requires biometric authentication before firing emergency trades.",
      selectCommand: "Select command to preview simulator:",
      botVerified: "verified bot · online",
      nodeOperative: "NODE 100% OPERATIONAL",
      confirmEmergencyBtn: "CONFIRM EMERGENCY CLOSE",
      cancelBtn: "Cancel",
      tlsNotice: "TLS 1.3 Encrypted Tunnel",
    },
    cta: {
      titleStart: "Take Total Command of Your Global Trading",
      titleEnd: "in One Single Place",
      subtitle: "Connect your accounts under strict non-custodial security across Bybit, OKX, cTrader, MetaTrader 5, and CME. Execute sub-100ms synthetic arbitrage and trade with ultimate peace of mind.",
      accessTerminalBtn: "Access Trading Terminal",
      exploreGatewaysBtn: "Explore Venues & Gateways",
    },
    footer: {
      brandDesc: "The master connector and unified trading terminal inspired by the Trading City community to concurrently operate crypto exchanges, Forex/CFDs on cTrader and MetaTrader 5, and regulated futures gateways.",
      quickLinks: "Platform Architecture",
      legal: "Security & Custody",
      disclaimer: "Non-custodial trading software. Global City does not hold user funds. All API keys operate strictly in Read & Trade mode with zero withdrawal permissions.",
      riskTitle: "High-Risk Operational Disclaimer & Limitation of Liability",
      riskDisclaimerFull: "Trading in digital assets, cryptocurrencies, Contracts for Difference (CFDs), foreign exchange (Forex), futures, and algorithmic synthetic arbitrage involves significant risk of capital loss and extreme price volatility. Financial leverage can amplify both gains and losses exponentially. Global City is strictly a financial technology and non-custodial software infrastructure provider; it is not a registered broker-dealer, financial advisor, investment manager, or exchange custodian. The software does not provide personalized investment advice or execute autonomous decisions without user-configured parameters. All order routing, risk thresholds, and executions are carried out under the user's sole discretion and responsibility. Past performance, backtested returns, or synthetic spreads do not guarantee future profitability. Before deploying capital, ensure you understand all inherent technical and financial risks.",
      connectorsTitle: "Connected Gateways & Aggregation",
      connectorsCount: "+20 Exchanges & Gateways",
      securityTitle: "Institutional Security & Custody",
    },
  },
  es: {
    nav: {
      multiVenue: "Multi-Exchange & Brokers",
      arbitrage: "Arbitraje Sintético",
      modules: "Módulos & Telegram",
      rebalance: "Rebalanceo",
      copyTrading: "Copy Trading Cruzado",
      calculator: "Calculadora VWAP",
      openTerminal: "Abrir Terminal Unificado",
      terminalBtn: "Terminal",
    },
    hero: {
      headlineStart: "Opera Todo tu Portafolio Global desde un Único",
      headlineEnd: "",
      subheadline: "Unifica Criptoactivos, Forex y Futuros. Ejecuta arbitraje sintético simultáneo y comanda tu operativa desde Telegram.",
      openTerminalBtn: "Abrir Terminal de Trading Unificado",
      exploreModulesBtn: "Explorar Módulos de Operativa",
      telemetry: {
        t1Title: "Protocolo No Custodial",
        t1Desc: "Cero permisos de retiro por diseño matemático",
        t2Title: "Arbitraje Sintético",
        t2Desc: "Despacho atómico L2 con descuento de comisiones",
        t3Title: "Control Remoto Móvil",
        t3Desc: "Monitoreo de equidad y panic-switch biométrico",
        t4Title: "Normalización de Lote",
        t4Desc: "Mapeo dinámico cTrader, MT5 y pasarelas FIX",
      },
      liveTelemetry: {
        title: "Smart Order Router & Cross Bridge Activo",
        desc: "Enrutando flujos en microsegundos entre Bybit, OKX, cTrader Open API y terminales MT5 simultáneas.",
      },
      rotatingWords: [
        "Terminal",
        "Dashboard",
        "Servidor",
        "Telegram",
        "Protocolo",
        "Gateway",
        "Comando",
        "Radar",
        "Ecosistema",
        "Puente",
      ],
    },
    multiVenue: {
      titleStart: "Un Único Mando.",
      titleEnd: "Todas las Sedes del Mundo.",
      subtitle: "Consolida liquidez, libros de órdenes Nivel 2 y ejecución simultánea entre los mayores centros de negociación sin fragmentar tu tesorería ni dispersar tus garantías.",
      equityLabel: "Equidad Consolidada",
      feedTitle: "Feed de Precios en Streaming",
      allAssets: "Todos los Activos",
      latencyText: "Latencia de difusión WebSocket: sub-2ms",
      splitOrderBtn: "Ejecutar Split-Order en Vivo",
      gatewaysTitle: "Pasarelas de Conexión Activas",
      gatewaysSubtitle: "Protocolos binarios nativos sin intermediarios web",
      depthLabel: "Profundidad",
      manageCredentialsBtn: "Gestionar Credenciales en Terminal",
    },
    showcase: {
      slides: [
        {
          index: "01",
          title: "Unifica Cripto, Forex y Futuros sin Fragmentar tu Capital",
          description: "Conecta tus cuentas institucionales en Bybit v5, OKX DMA, Binance, cTrader Open API y MetaTrader 5 en una consola centralizada de mando. Tus credenciales operan bajo protocolo no custodial estricto: cero permisos de retiro por diseño matemático.",
          highlightStat: "2.4 ms",
          highlightLabel: "Latencia media de ejecución institucional",
          tags: [
            { label: "Arquitectura", value: "No Custodial (Read & Trade)" },
            { label: "Gateways", value: "Bybit · OKX · Binance · cTrader · MT5" },
            { label: "Protocolo", value: "WebSockets + Protobuf TLS & FIX" }
          ]
        },
        {
          index: "02",
          title: "Captura Ineficiencias de Spread Simultáneo en Sub-100 Milisegundos",
          description: "Olvídate del arbitraje en cadena lento y expuesto a riesgo de liquidación. El motor analiza libros de órdenes Nivel 2 en tiempo real, descuenta comisiones de taker y slippage VWAP, y despacha órdenes concurrentes con protocolo de rollback instantáneo.",
          highlightStat: "< 95 ms",
          highlightLabel: "Despacho concurrente atómico simultáneo",
          tags: [
            { label: "Seguridad Operativa", value: "Atomic Promise.allSettled + Rollback" },
            { label: "Monedero de Tarifas", value: "Virtual Gas Tank en USDT" },
            { label: "Cálculo de Spread", value: "Net Spread > Taker A + Taker B + Slippage" }
          ]
        },
        {
          index: "03",
          title: "Monitoreo, Alertas y Panic Switch Directamente en tu Móvil",
          description: "Comanda tu operativa global desde cualquier lugar del mundo. Recibe reportes consolidados de equidad en tiempo real, notificaciones push de arbitraje y ejecuta el cierre de emergencia inmediato de todas tus posiciones mediante autenticación biométrica 2FA.",
          highlightStat: "100%",
          highlightLabel: "Control remoto cifrado de punto a punto",
          tags: [
            { label: "Autenticación", value: "HMAC-SHA256 + User Whitelist" },
            { label: "Tiempo de Respuesta", value: "< 180ms vía Webhook Seguro" },
            { label: "Comandos Rápidos", value: "/portfolio · /rebalance · /panic_close_all" }
          ]
        },
        {
          index: "04",
          title: "Equilibra Cuentas entre Sedes sin Transferencias On-Chain",
          description: "Cero comisiones de red blockchain y cero esperas de confirmación de bloque. El algoritmo de rebalanceo sintético abre y cierra coberturas delta-neutrales inversas entre sedes para reubicar tu margen efectivo al instante sin mover fondos físicos.",
          highlightStat: "0.00 $",
          highlightLabel: "Coste de gas blockchain en rebalanceos",
          tags: [
            { label: "Mecánica", value: "Coberturas Delta-Neutral Simultáneas" },
            { label: "Velocidad", value: "Inmediato a precio de mercado" },
            { label: "Riesgo de Mercado", value: "Exposición direccional nula durante ejecución" }
          ]
        },
        {
          index: "05",
          title: "Espeja Señales de Cripto hacia Forex y Futuros con Normalización de Lote",
          description: "El motor normaliza la dimensionalidad del activo en microsegundos, traduciendo unidades de Bitcoin o Solana a lotes estándar de FX en MetaTrader 5 o contratos de futuros regulados, respetando la calibración de riesgo y margen de tu cuenta.",
          highlightStat: "< 15 ms",
          highlightLabel: "Latencia de replicación entre plataformas",
          tags: [
            { label: "Traducción de Símbolo", value: "Canónico Universal (BTC/USDT ↔ BTCUSD.raw)" },
            { label: "Riesgo Dinámico", value: "Calibración por apalancamiento y equidad" },
            { label: "Protección", value: "Cap máximo de stop loss por operación" }
          ]
        }
      ],
      ctaBtn: "Probar este módulo en el Terminal",
    },
    calculator: {
      titleStart: "Arbitraje Cross-Venue.",
      titleEnd: "Captura de Spreads en Tiempo Real sin Riesgo On-Chain.",
      subtitle: "Detecta brechas de precio en tiempo real entre exchanges globales con deducción instantánea de comisiones taker y cálculo de profundidad L2. Sin puentes lentos ni riesgo de liquidación.",
      capitalParamsTitle: "Parámetros de Capital y Margen",
      capitalParamsSubtitle: "Asignación virtual de órdenes concurrentes",
      assignedCapital: "Capital Asignado",
      buyAt: "Compra en",
      sellAt: "Venta en",
      simulatingBtn: "Verificando Profundidad L2 y Ruteo...",
      simulateBtn: "Simular Despacho Concurrente Sub-100ms",
      breakdownTitle: "Desglose de Retorno Neto",
      breakdownSubtitle: "Auditoría matemática según modelo VWAP de libro de órdenes",
      positiveSpread: "SPREAD POSITIVO",
      netProfitLabel: "Beneficio Neto Estimado",
      netSpreadEffective: "Spread Neto Efectivo",
      afterFees: "tras comisiones de taker",
      grossSpread: "Spread Bruto de Cotización:",
      takerFees: "Comisiones Taker Combinadas:",
      traderShare: "Participación del Trader (80%):",
      infraFee: "Fee de Infraestructura (20% Gas Tank):",
      successToast: (buy: string, sell: string) => `¡Orden ejecutada en 84ms! Compra en ${buy} y Venta en ${sell} confirmadas sin descalce.`,
    },
    rebalancing: {
      titleStart: "Rebalanceo Sintético.",
      titleEnd: "Cero Transferencias de Red.",
      subtitle: "Equilibra tus saldos entre sedes mediante órdenes espejo delta-neutrales. Sin pagar tarifas de red blockchain, sin esperas de confirmación y con tus claves API estrictamente protegidas sin permiso de retiro.",
      gasSavingsLabel: "Ahorro en Gas Blockchain",
      gasSavingsSub: "EJECUCIÓN INMEDIATA A MERCADO",
      simulatorTitle: "Simulador de Desviación de Margen",
      simulatorSubtitle: "Control de ratio óptimo entre sedes operativas",
      adjustImbalance: "Ajustar Desbalance Simulado",
      balanced: "Equilibrado (50/50)",
      thresholdAlert: "Alerta Umbral (70/30)",
      critical: "Crítico (85/15)",
      deviationDetected: "Desviación Detectada: Acción Requerida",
      inOptimalRange: "Ratios de Operación en Rango Óptimo",
      deviationText: (amount: string) => `El algoritmo sugiere ejecutar una orden espejo inversa de $${amount} USDT para sincronizar el margen en Bybit sin transferencias de billetera.`,
      optimalText: "Las reservas entre ambas sedes permiten ejecutar ráfagas de órdenes continuas sin riesgo de insuficiencia de margen.",
      directionalRisk: "Riesgo direccional durante ejecución: 0.00%",
      deltaNeutral: "Protocolo Delta-Neutral",
      securityTitle: "Garantías de Seguridad",
      securitySubtitle: "Arquitectura estrictamente no custodial",
      sec1Title: "1. Claves Read & Trade Únicamente",
      sec1Desc: "Global City rechaza automáticamente cualquier clave API que tenga habilitados permisos de retiro o transferencia externa.",
      sec2Title: "2. Enrutamiento por Redes Low-Cost",
      sec2Desc: "Si el trader decide realizar una transferencia física opcional, el motor recomienda enrutadores de capa 2 inferiores a $0.50.",
      sec3Title: "3. Cifrado AES-256 en Reposo",
      sec3Desc: "Los secretos de API se cifran con claves derivadas del usuario antes de ser validados en la memoria volátil del terminal.",
      auditVerified: "Auditoría de Permisos Verificada en Tiempo Real",
    },
    copyTrading: {
      titleStart: "Copy Trading Puente.",
      titleEnd: "De Criptoactivos a CFDs y Futuros.",
      subtitle: "Replica operaciones maestras disparadas en exchanges de criptomonedas directamente hacia cuentas de cTrader, MetaTrader 5 o futuros regulados, con normalización instantánea de lotaje y apalancamiento.",
      step1Tag: "01 // ORIGEN MAESTRO",
      step1Title: "Disparo de Orden Master",
      step1Desc: "Un trade manual, webhook de TradingView o bot algorítmico abre posición en Bybit v5 o Hyperliquid L1.",
      step2Tag: "02 // NORMALIZACIÓN CANÓNICA",
      step2Title: "SymbolMapper & Lot Calibrator",
      step2Desc: "Traduce el símbolo universal BTC/USDT al identificador de cada broker (ej: BTCUSD.pro) y calcula el tamaño de lote proporcional a la equidad de cada cuenta esclava.",
      step2ComputeTime: "Tiempo de cómputo: 1.2 milisegundos",
      step3Tag: "03 // DESPACHO MULTI-SEDE",
      step3Title: "Ejecución en Destino",
      step3Desc: "Las órdenes se despachan simultáneamente hacia las terminales configuradas sin descalce ni latencia perceptible.",
      stopLossGuarantee: "Protección Stop-Loss Integrada: Las órdenes esclavas heredan automáticamente el SL/TP de la orden maestra.",
      leverageAudit: "Algoritmo auditado para evitar sobre-apalancamiento",
    },
    telegram: {
      titleStart: "Comanda tu Imperio Financiero desde",
      titleEnd: "Telegram.",
      subtitle: "Sin necesidad de mantener abiertas 5 pestañas de brokers en tu laptop. Recibe telemetría instantánea de Fills, alertas de arbitraje y ejecuta el botón de pánico global directamente desde tu móvil con cifrado de grado militar.",
      webhookLatency: "Latencia Webhook Telegram",
      protocolTitle: "Protocolo de Notificaciones y Ejecución",
      protocolSubtitle: "Enlace punto a punto con tu servidor personal",
      f1Title: "Telemetría en Vivo de Órdenes y Fills",
      f1Desc: "Notificación push en menos de 50ms al completarse una orden de Bybit, OKX, cTrader o MT5, con desglose de precio ejecutado y comisiones.",
      f2Title: "Panic Switch Global (/panic_close_all)",
      f2Desc: "Cancela todas las órdenes activas y liquida posiciones a mercado en todas las sedes conectadas en caso de eventos macroeconómicos adversos.",
      f3Title: "Whitelist Estricta y Autenticación 2FA",
      f3Desc: "El bot solo acepta comandos procedentes de tu Telegram ID verificado, requiriendo confirmación biométrica antes de disparar ejecuciones de emergencia.",
      selectCommand: "Selecciona comando para probar en simulador:",
      botVerified: "bot verificado · en línea",
      nodeOperative: "NODO 100% OPERATIVO",
      confirmEmergencyBtn: "CONFIRMAR CIERRE TOTAL",
      cancelBtn: "Cancelar",
      tlsNotice: "Enlace cifrado TLS 1.3",
    },
    cta: {
      titleStart: "Toma el Control Total de tu Operativa Global",
      titleEnd: "en un Solo Lugar",
      subtitle: "Conecta tus cuentas bajo protocolo no custodial estricto en Bybit, OKX, cTrader, MetaTrader 5 y CME. Ejecuta arbitraje sintético simultáneo sub-100ms y opera con total tranquilidad desde Telegram.",
      accessTerminalBtn: "Acceder al Terminal de Trading",
      exploreGatewaysBtn: "Explorar Conectores y Sedes",
    },
    footer: {
      brandDesc: "El conector maestro y terminal unificado inspirado en la comunidad de Trading City para operar concurrentemente exchanges de criptomonedas, brokers de forex/CFDs en cTrader y MetaTrader 5, y pasarelas de futuros regulados.",
      quickLinks: "Arquitectura de Plataforma",
      legal: "Seguridad y Custodia",
      disclaimer: "Software de negociación no custodial. Global City no retiene fondos de usuarios. Todas las claves API operan estrictamente en modo Read & Trade sin permisos de retiro.",
      riskTitle: "Aviso de Alto Riesgo Operativo y Descargo de Responsabilidad",
      riskDisclaimerFull: "El trading con criptoactivos, contratos por diferencia (CFDs), divisas (Forex), futuros y arbitraje sintético algorítmico implica un riesgo sustancial de pérdida de capital y una alta volatilidad. El apalancamiento financiero puede magnificar tanto las ganancias como las pérdidas de forma acelerada. Global City es exclusivamente una empresa de software tecnológico y desarrollo de infraestructura no custodial; no actúa como broker regulado, asesor financiero, gestor de fondos ni custodio de activos. La plataforma no proporciona asesoramiento financiero de ningún tipo. La configuración de parámetros, la conexión de claves API y toda ejecución de órdenes se realizan bajo la exclusiva responsabilidad y riesgo del usuario. El rendimiento pasado o los diferenciales de arbitraje mostrados no constituyen una garantía de resultados futuros. Asegúrese de evaluar minuciosamente su tolerancia al riesgo antes de operar.",
      connectorsTitle: "Pasarelas & Capacidad de Conexión",
      connectorsCount: "+20 Exchanges & Pasarelas",
      securityTitle: "Seguridad y Custodia Institucional",
    },
  },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Default to native English as requested
  const [language, setLanguage] = useState<Language>('en');

  useEffect(() => {
    document.documentElement.lang = language;
    const isEs = language === 'es';
    
    // Dynamic Page Title
    document.title = isEs 
      ? "Global City · Terminal Institucional Multi-Exchange & Prop-Firm Trading"
      : "Global City · Institutional Multi-Venue & Prop-Firm Trading Terminal";

    // Dynamic Meta Description
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute(
        'content',
        isEs
          ? "El terminal unificado definitivo para operar Cripto, Forex, Futuros y cuentas de Prop Firms. Conecta Binance, Bybit, OKX, MT5, cTrader, TradeLocker y CCXT con arbitraje sintético L2 y control por Telegram."
          : "The ultimate unified terminal for Crypto, Forex, Futures, and Prop Firm accounts. Connect Binance, Bybit, OKX, MT5, cTrader, TradeLocker, and CCXT with L2 synthetic arbitrage and Telegram ops."
      );
    }

    // Dynamic OpenGraph Title & Description
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) {
      ogTitle.setAttribute(
        'content',
        isEs
          ? "Global City · Terminal Institucional Multi-Exchange & Prop-Firm Trading"
          : "Global City · Institutional Multi-Venue & Prop-Firm Trading Terminal"
      );
    }
    const ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc) {
      ogDesc.setAttribute(
        'content',
        isEs
          ? "Opera todas tus cuentas de exchanges y prop firms desde un único mando no custodial. Arbitraje sintético L2, pasarelas FIX/WebSocket y control biométrico desde Telegram."
          : "Operate all your exchange and prop firm accounts from a single non-custodial command center. L2 synthetic arbitrage, FIX/WebSocket gateways, and Telegram biometric control."
      );
    }

    // Dynamic Twitter Title & Description
    const twTitle = document.querySelector('meta[name="twitter:title"]');
    if (twTitle) {
      twTitle.setAttribute(
        'content',
        isEs
          ? "Global City · Terminal Multi-Exchange & Prop-Firm"
          : "Global City · Multi-Exchange & Prop-Firm Terminal"
      );
    }
    const twDesc = document.querySelector('meta[name="twitter:description"]');
    if (twDesc) {
      twDesc.setAttribute(
        'content',
        isEs
          ? "Unifica Criptoactivos, Forex y Futuros. Ejecuta arbitraje sintético simultáneo y comanda tu operativa desde Telegram."
          : "Unify Crypto, Forex, and Futures. Execute simultaneous synthetic arbitrage and command your operation from Telegram."
      );
    }
  }, [language]);

  const value = {
    language,
    setLanguage,
    t: translations[language],
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
