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
    profitBadge: string;
    subheadline: string;
    openTerminalBtn: string;
    exploreModulesBtn: string;
    note: string;
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
      multiVenue: "Funding Programs",
      arbitrage: "Proprietary Terminal",
      modules: "Copy to CEX Tools",
      rebalance: "Rules & Scaling",
      copyTrading: "Exchange Tools",
      calculator: "Funding Calculator",
      openTerminal: "Start Challenge",
      terminalBtn: "Terminal",
    },
    hero: {
      headlineStart: "Fund your trading journey with",
      headlineEnd: "Instant Capital",
      profitBadge: "Earn profits from 35% up to 80%",
      subheadline: "",
      openTerminalBtn: "Get Funded Now",
      exploreModulesBtn: "Try Our Tools",
      note: "Active challenge? Free tools included + earn GC Points for challenge discounts.",
      telemetry: {
        t1Title: "Proprietary Terminal v10",
        t1Desc: "60 FPS GPU Canvas, zero reliance on 3rd-party MT5/cTrader",
        t2Title: "Up to 90% Profit Split",
        t2Desc: "Guaranteed 24-hour payouts with full mathematical audit",
        t3Title: "CEX Mirroring via API",
        t3Desc: "Automatically copy your funded trades to Binance or Bybit",
        t4Title: "Transparent Drawdown",
        t4Desc: "Static / EOD equity rules with zero intraday trailing traps",
      },
      liveTelemetry: {
        title: "Eklipse Funded Simulation Engine Active",
        desc: "Streaming real institutional L2 tick-by-tick market data across multi-asset venues with sub-millisecond execution.",
      },
      rotatingWords: [
        "Terminal",
        "Canvas Engine",
        "Trading OS",
        "Scaling $2M",
        "Official APKs",
        "24h Payouts",
      ],
    },
    multiVenue: {
      titleStart: "Global Capital.",
      titleEnd: "Zero Third-Party Broker Fees.",
      subtitle: "Experience raw institutional market conditions. Our multi-venue market data engine streams live Level 2 order books directly into our proprietary terminal, ready for evaluation trading or automated copying to your personal exchange accounts.",
      equityLabel: "Funded Account Equity",
      feedTitle: "Live Multi-Venue Feed",
      allAssets: "All Assets",
      latencyText: "Native WebSocket streaming latency: < 2ms",
      splitOrderBtn: "Launch Challenge Account",
      gatewaysTitle: "Execution & Copy Gateways",
      gatewaysSubtitle: "Simulation Engine + Direct CEX API Connectors",
      depthLabel: "Depth",
      manageCredentialsBtn: "Connect Exchange APIs in Terminal",
    },
    showcase: {
      slides: [
        {
          index: "01",
          title: "Funding Programs from $25,000 to $500,000 with Zero Hidden Traps",
          description: "Trade institutional capital without arbitrary time limits. Complete 1-step or 2-step evaluation challenges with realistic profit targets of 8% and 5%, a generous 10% maximum drawdown, and scale your funded account up to $2,000,000 with up to 90% profit share.",
          highlightStat: "Up to 90%",
          highlightLabel: "Trader profit share on all funded earnings",
          tags: [
            { label: "Challenge Models", value: "1-Step Express · 2-Step Standard · Direct" },
            { label: "Scaling Plan", value: "Up to $2,000,000 with 25% account bumps" },
            { label: "Payout Frequency", value: "Every 14 days · Express 24h review" }
          ]
        },
        {
          index: "02",
          title: "Trade on Our Proprietary High-Performance Web & Mobile Terminal",
          description: "Say goodbye to clunky MT5 white-labels and sluggish third-party platforms. Eklipse Funded runs on an in-house Canvas-powered KLineChart v10 engine, delivering 60 FPS charts, sub-millisecond execution, Level 2 order book depth, and customizable TradingView-grade timeframes.",
          highlightStat: "60 FPS",
          highlightLabel: "Hardware GPU-accelerated proprietary terminal",
          tags: [
            { label: "Technology", value: "Proprietary KLineChart v10 Engine" },
            { label: "Platform Independence", value: "Zero MT5/cTrader 3rd-party fees" },
            { label: "Order Execution", value: "Sub-2ms internal Simulation Engine" }
          ]
        },
        {
          index: "03",
          title: "Mirror Funded Positions to Real Exchanges via API (Exclusive Tool)",
          description: "Unlock hybrid monetization: connect your personal Binance, Bybit, or Kraken accounts via read & trade API keys. Our internal Copy Engine automatically mirrors positions opened on your Eklipse Funded account directly to your external exchange accounts in real time.",
          highlightStat: "< 12 ms",
          highlightLabel: "Cross-venue API replication speed",
          tags: [
            { label: "Security", value: "Strict Non-Custodial (Zero withdrawal access)" },
            { label: "Destinations", value: "Binance · Bybit · Kraken · OKX" },
            { label: "Risk Control", value: "Proportional lot sizing & inherited SL/TP" }
          ]
        },
        {
          index: "04",
          title: "Official Mobile APKs: Institutional Power in Your Pocket",
          description: "Never miss a trade or breach a risk threshold on the go. We are engineering the official Android APK and native mobile releases for Eklipse Trading Terminal, providing a full-screen, gesture-optimized canvas without restrictive app-store wrappers.",
          highlightStat: "100% Native",
          highlightLabel: "Mobile canvas architecture without WebView lag",
          tags: [
            { label: "Platform", value: "Android APKs + Responsive Web PWA" },
            { label: "Realtime Feeds", value: "Binary WebSocket Stream (Redis Powered)" },
            { label: "Biometrics", value: "Instant 2FA & Emergency Panic Switch" }
          ]
        },
        {
          index: "05",
          title: "Server-Side Risk Guardian: Objective Rules Without Trailing Traps",
          description: "Trade with absolute peace of mind. Our rules are evaluated 100% on the server side using balance and end-of-day equity. No predatory intraday peak trailing drawdown rules that disqualify you while you have an active winning trade open.",
          highlightStat: "0 Days",
          highlightLabel: "Minimum trading days required to pass",
          tags: [
            { label: "Drawdown Calculation", value: "Static & EOD Balance-Based (Fair & Transparent)" },
            { label: "Daily Loss Limit", value: "Calculated at 00:00 UTC broker reset" },
            { label: "Compliance", value: "Immediate dashboard status: Pass · Warning · Breach" }
          ]
        }
      ],
      ctaBtn: "Choose Your Funding Plan",
    },
    calculator: {
      titleStart: "Funding Profit.",
      titleEnd: "Institutional Scaling & Payout Estimator.",
      subtitle: "Calculate your projected returns across evaluation phases, funded account tiers, and scaling stages up to $2,000,000 with up to 90% trader profit split.",
      capitalParamsTitle: "Capital & Challenge Tier",
      capitalParamsSubtitle: "Select challenge balance to project potential earnings",
      assignedCapital: "Challenge Account Capital",
      buyAt: "Tier Model",
      sellAt: "Profit Target",
      simulatingBtn: "Calculating Scaling & Payouts...",
      simulateBtn: "Calculate Projected Earnings",
      breakdownTitle: "Net Profit & Scaling Breakdown",
      breakdownSubtitle: "Audited financial projection under Eklipse Funded terms",
      positiveSpread: "PROFIT TARGET ACHIEVED",
      netProfitLabel: "Trader Net Share (90%)",
      netSpreadEffective: "Challenge Target (8%)",
      afterFees: "ready for immediate withdrawal",
      grossSpread: "Gross Trading Profit:",
      takerFees: "Evaluation Fee (Refundable):",
      traderShare: "Trader Profit Payout (90%):",
      infraFee: "Firm Operational Retainer (10%):",
      successToast: (buy: string, sell: string) => `Projection calculated! On a $${buy} account reaching ${sell}, your estimated payout is approved within 24h.`,
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
      sec1Desc: "Eklipse automatically rejects any API key with withdrawal or external transfer permissions enabled.",
      sec2Title: "2. Low-Cost Route Advising",
      sec2Desc: "If the trader opts for a manual transfer, the engine identifies low-cost Layer-2 networks below $0.50.",
      sec3Title: "3. AES-256 Client-Side Encryption",
      sec3Desc: "API secrets are encrypted with user-derived keys before being loaded into terminal volatile memory.",
      auditVerified: "Permission Audit Verified in Real Time",
    },
    copyTrading: {
      titleStart: "Direct CEX Copy Trading.",
      titleEnd: "From Eklipse Funded to Binance & Bybit.",
      subtitle: "Mirror trades from your Eklipse Funded account directly to your personal accounts on Binance, Bybit, Kraken, or MT5 with sub-millisecond precision and automatic lot size normalization.",
      step1Tag: "01 // FUNDED MASTER TRADE",
      step1Title: "Funded Account Order Trigger",
      step1Desc: "You execute a trade on your Eklipse Funded terminal with GPU-accelerated Canvas speed.",
      step2Tag: "02 // LOT NORMALIZATION",
      step2Title: "Dynamic Risk & Lot Mapper",
      step2Desc: "Our internal mapper normalizes position sizing to match the exact risk and leverage configured on your personal exchange account.",
      step2ComputeTime: "Compute latency: 1.2 milliseconds",
      step3Tag: "03 // API DISPATCH",
      step3Title: "Direct Exchange Execution",
      step3Desc: "The order is executed concurrently on your external exchange via high-speed API keys without custodial risk.",
      stopLossGuarantee: "Integrated Stop-Loss Inheritance: Copied positions automatically inherit your exact master SL and TP levels.",
      leverageAudit: "Strict algorithm protection to prevent accidental over-leveraging",
    },
    telegram: {
      titleStart: "Command Your Funding Empire from",
      titleEnd: "Telegram.",
      subtitle: "Monitor your challenge drawdown, receive instant fill notifications, and trigger emergency position closures directly from Telegram with military-grade encryption.",
      webhookLatency: "Telegram Webhook Latency",
      protocolTitle: "Real-time Telemetry & Execution Protocol",
      protocolSubtitle: "Encrypted point-to-point bridge with your server",
      f1Title: "Live Order & Fill Telemetry",
      f1Desc: "Push notification in under 50ms upon order execution, including exact fill price, slippage, and PnL impact.",
      f2Title: "Global Panic Switch (/panic_close_all)",
      f2Desc: "Instantly cancel all pending orders and close all open positions across your funded and copy accounts.",
      f3Title: "Strict Whitelist & 2FA Confirmation",
      f3Desc: "The bot only responds to your verified Telegram ID, requiring biometric confirmation before executing emergency commands.",
      selectCommand: "Select command to preview simulator:",
      botVerified: "verified bot · online",
      nodeOperative: "NODE 100% OPERATIONAL",
      confirmEmergencyBtn: "CONFIRM EMERGENCY CLOSE",
      cancelBtn: "Cancel",
      tlsNotice: "TLS 1.3 Encrypted Tunnel",
    },
    cta: {
      titleStart: "Trade with Institutional Capital on",
      titleEnd: "Eklipse Funded",
      subtitle: "Choose your evaluation program, showcase your discipline on our proprietary 60 FPS terminal, and withdraw profits every 14 days with exclusive tools to mirror trades to your personal exchanges.",
      accessTerminalBtn: "Start Funding Challenge",
      exploreGatewaysBtn: "View Programs & Rules",
    },
    footer: {
      brandDesc: "Eklipse Funded is the next-generation proprietary trading firm built upon a universal Trading OS. Featuring high-performance GPU Canvas terminal, 24-hour payouts, up to 90% profit split, and built-in API copy tools to external exchanges.",
      quickLinks: "Funding Programs",
      legal: "Rules & Compliance",
      disclaimer: "Eklipse Funded offers simulated evaluation accounts. External exchange copy tools operate under strict non-custodial security with zero withdrawal permissions.",
      riskTitle: "Operational Risk Disclosure & Disclaimer",
      riskDisclaimerFull: "Trading financial instruments, cryptocurrencies, Forex, and futures involves substantial risk of loss. Eklipse Funded provides evaluation programs and proprietary software infrastructure. Past performance in simulated accounts is not indicative of future results. All exchange connectivity operates non-custodially at the sole discretion of the user.",
      connectorsTitle: "Execution & Copy Gateways",
      connectorsCount: "+20 Exchanges & Venues",
      securityTitle: "Institutional Security & Solvency",
    },
  },
  es: {
    nav: {
      multiVenue: "Programas de Fondeo",
      arbitrage: "Terminal Propia",
      modules: "Herramientas Copy CEX",
      rebalance: "Reglas y Scaling",
      copyTrading: "Herramientas Exchange",
      calculator: "Calculadora de Fondeo",
      openTerminal: "Empezar Reto",
      terminalBtn: "Terminal",
    },
    hero: {
      headlineStart: "Patrocinamos tu viaje de trading con",
      headlineEnd: "Fondeo Inmediato",
      profitBadge: "Recibe ganancias desde el 35% hasta el 80%",
      subheadline: "",
      openTerminalBtn: "Fondearme ahora",
      exploreModulesBtn: "Probar Herramientas",
      note: "¿Challenge activo? Herramientas gratuitas + acumulas Puntos GC para descuentos.",
      telemetry: {
        t1Title: "Terminal Propia v10",
        t1Desc: "Canvas a 60 FPS acelerado por GPU, 100% independiente de MT5",
        t2Title: "Reparto hasta el 90%",
        t2Desc: "Liquidación garantizada en 24h en cripto y transferencia bancaria",
        t3Title: "Copia a CEX vía API",
        t3Desc: "Replica tus operaciones de fondeo directamente en Binance y Bybit",
        t4Title: "Reglas Transparentes",
        t4Desc: "Drawdown estático/EOD sin trampas de trailing flotante intradía",
      },
      liveTelemetry: {
        title: "Motor de Simulación Eklipse Funded Activo",
        desc: "Procesando cotizaciones en streaming tick-a-tick con libros L2 de alta fidelidad y ejecución sub-milisegundo sin intermediarios.",
      },
      rotatingWords: [
        "Terminal Propia",
        "Motor Canvas",
        "Trading OS",
        "Scaling $2M",
        "APKs Oficiales",
        "Payouts 24h",
      ],
    },
    multiVenue: {
      titleStart: "Capital Global.",
      titleEnd: "Cero Comisiones de Plataformas Terceras.",
      subtitle: "Opera con condiciones de mercado institucionales en nuestra terminal propia. Libros L2 en vivo en streaming directo para cuentas de evaluación o copia automatizada a tus cuentas privadas de exchange.",
      equityLabel: "Equidad en Cuenta de Fondeo",
      feedTitle: "Feed en Streaming de la Terminal",
      allAssets: "Todos los Activos",
      latencyText: "Latencia de transmisión WebSocket: < 2ms",
      splitOrderBtn: "Iniciar Cuenta de Reto",
      gatewaysTitle: "Pasarelas de Ejecución y Copia",
      gatewaysSubtitle: "Motor de Simulación + Conectores API Directos a CEX",
      depthLabel: "Profundidad",
      manageCredentialsBtn: "Conectar APIs de Exchanges en Terminal",
    },
    showcase: {
      slides: [
        {
          index: "01",
          title: "Programas de Fondeo de $25,000 a $500,000 sin Reglas Trampa",
          description: "Opera capital institucional sin límites arbitrarios de tiempo. Supera retos de evaluación de 1 o 2 fases con objetivos accesibles del 8% y 5%, pérdida máxima del 10%, y escala tu cuenta hasta $2,000,000 con un reparto de hasta el 90% de los beneficios.",
          highlightStat: "Hasta 90%",
          highlightLabel: "Reparto de beneficios para el trader financiado",
          tags: [
            { label: "Modelos de Reto", value: "1-Fase Express · 2-Fases Estándar · Cuentas Directas" },
            { label: "Plan de Escalado", value: "Hasta $2,000,000 con incrementos del 25%" },
            { label: "Frecuencia de Pagos", value: "Cada 14 días · Revisión express en 24h" }
          ]
        },
        {
          index: "02",
          title: "Opera en Nuestra Propia Terminal de Trading Web y Móvil",
          description: "Dile adiós a las soluciones lentas de MT5 y a las plataformas genéricas de terceros. Eklipse Funded funciona sobre un motor KLineChart v10 desarrollado en Canvas HTML5 nativo, ofreciendo 60 FPS, profundidad L2, ejecución instantánea y temporalidades personalizables.",
          highlightStat: "60 FPS",
          highlightLabel: "Terminal propietaria acelerada por hardware GPU",
          tags: [
            { label: "Tecnología", value: "Motor Propietario KLineChart v10" },
            { label: "Independencia Total", value: "Cero costes a brokers o licencias de MT5" },
            { label: "Ejecución de Órdenes", value: "Sub-2ms con motor de simulación interno" }
          ]
        },
        {
          index: "03",
          title: "Copia Operaciones de Fondeo a Exchanges Reales vía API (Herramienta Única)",
          description: "Monetización híbrida exclusiva: vincula tus cuentas personales de Binance, Bybit o Kraken mediante claves API no custodiales. Nuestro motor de copia replica automáticamente las operaciones abiertas en tu cuenta de fondeo directamente a tus exchanges reales en tiempo real.",
          highlightStat: "< 12 ms",
          highlightLabel: "Velocidad de replicación API entre sedes",
          tags: [
            { label: "Seguridad", value: "Estrictamente No Custodial (Sin permiso de retiro)" },
            { label: "Destinos Soportados", value: "Binance · Bybit · Kraken · OKX" },
            { label: "Control de Riesgo", value: "Lotes proporcionales y Stop-Loss heredado" }
          ]
        },
        {
          index: "04",
          title: "Hoja de Ruta a las APKs Oficiales de Eklipse",
          description: "Lleva el poder de la terminal en tu bolsillo. Estamos desarrollando las aplicaciones nativas y APKs oficiales para Android y dispositivos móviles, optimizadas con gestos táctiles y Canvas nativo sin las limitaciones de los navegadores móviles.",
          highlightStat: "100% Nativo",
          highlightLabel: "Arquitectura Canvas móvil sin latencia de WebView",
          tags: [
            { label: "Plataforma", value: "APKs Oficiales Android + PWA Web" },
            { label: "Feeds en Tiempo Real", value: "Stream WebSocket binario (con Redis)" },
            { label: "Biometría", value: "2FA instantáneo y Botón de Pánico" }
          ]
        },
        {
          index: "05",
          title: "Risk Guardian en Servidor: Reglas Claras sin Trampas de Trailing",
          description: "Opera con tranquilidad absoluta. Nuestras reglas se calculan en backend basándose en el balance y la equidad al cierre del día. Cero trampas de trailing drawdown que te descalifiquen mientras tienes una posición ganadora abierta en mercado.",
          highlightStat: "0 Días",
          highlightLabel: "Días mínimos obligatorios para aprobar",
          tags: [
            { label: "Cálculo de Drawdown", value: "Estático y Basado en Balance EOD (Justo y Transparente)" },
            { label: "Límite Diario", value: "Calculado a las 00:00 UTC al reset del broker" },
            { label: "Monitoreo", value: "Estado en dashboard: Aprobado · Advertencia · Breach" }
          ]
        }
      ],
      ctaBtn: "Elegir Plan de Fondeo",
    },
    calculator: {
      titleStart: "Beneficios de Fondeo.",
      titleEnd: "Estimador de Ganancias y Plan de Escalado.",
      subtitle: "Calcula tus retornos proyectados a través de las fases de evaluación, niveles de cuenta financiada y escalado hasta $2,000,000 con reparto de hasta el 90%.",
      capitalParamsTitle: "Nivel de Capital y Desafío",
      capitalParamsSubtitle: "Selecciona el tamaño de cuenta para proyectar beneficios",
      assignedCapital: "Capital de Cuenta de Fondeo",
      buyAt: "Modelo de Reto",
      sellAt: "Objetivo de Reto",
      simulatingBtn: "Calculando Escalado y Pagos...",
      simulateBtn: "Calcular Ganancias Proyectadas",
      breakdownTitle: "Desglose de Beneficio Neto y Escalado",
      breakdownSubtitle: "Proyección financiera auditada bajo términos de Eklipse Funded",
      positiveSpread: "OBJETIVO DE FONDEO ALCANZADO",
      netProfitLabel: "Retiro Neto del Trader (90%)",
      netSpreadEffective: "Objetivo de Fase (8%)",
      afterFees: "listo para liquidación inmediata",
      grossSpread: "Beneficio Bruto Generado:",
      takerFees: "Tarifa de Reto (100% Reembolsable):",
      traderShare: "Reparto para el Trader (90%):",
      infraFee: "Retención Operativa de la Firma (10%):",
      successToast: (buy: string, sell: string) => `¡Proyección calculada! En una cuenta de $${buy} alcanzando el ${sell}, tu retiro es aprobado en 24h.`,
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
      sec1Desc: "Eklipse rechaza automáticamente cualquier clave API que tenga habilitados permisos de retiro o transferencia externa.",
      sec2Title: "2. Enrutamiento por Redes Low-Cost",
      sec2Desc: "Si el trader decide realizar una transferencia física opcional, el motor recomienda enrutadores de capa 2 inferiores a $0.50.",
      sec3Title: "3. Cifrado AES-256 en Reposo",
      sec3Desc: "Los secretos de API se cifran con claves derivadas del usuario antes de ser validados en la memoria volátil del terminal.",
      auditVerified: "Auditoría de Permisos Verificada en Tiempo Real",
    },
    copyTrading: {
      titleStart: "Copy Trading Directo a CEX.",
      titleEnd: "De Eklipse Funded a Binance y Bybit.",
      subtitle: "Replica las operaciones de tu cuenta fondeada directamente hacia tus cuentas personales en Binance, Bybit, Kraken o MT5, con normalización instantánea de lotaje y apalancamiento.",
      step1Tag: "01 // TRADE EN CUENTA FONDEADA",
      step1Title: "Disparo de Orden en Terminal",
      step1Desc: "Ejecutas una operación en tu terminal propia de Eklipse Funded con velocidad Canvas GPU.",
      step2Tag: "02 // NORMALIZACIÓN CANÓNICA",
      step2Title: "SymbolMapper & Lot Calibrator",
      step2Desc: "Traduce el símbolo y calibra el tamaño de lote proporcional a la equidad y apalancamiento de tu exchange personal.",
      step2ComputeTime: "Tiempo de cómputo: 1.2 milisegundos",
      step3Tag: "03 // EJECUCIÓN VÍA API",
      step3Title: "Despacho a tu Exchange Real",
      step3Desc: "La orden se replica simultáneamente en tu cuenta de exchange personal sin permisos de retiro ni riesgo custodial.",
      stopLossGuarantee: "Protección Stop-Loss Integrada: Las órdenes en exchange heredan automáticamente el SL/TP de tu orden maestra.",
      leverageAudit: "Algoritmo auditado para evitar sobre-apalancamiento involuntario",
    },
    telegram: {
      titleStart: "Comanda tu Cuenta de Fondeo desde",
      titleEnd: "Telegram.",
      subtitle: "Monitorea tu drawdown diario, recibe telemetría instantánea de Fills y ejecuta el cierre de emergencia directamente desde tu móvil con cifrado de grado militar.",
      webhookLatency: "Latencia Webhook Telegram",
      protocolTitle: "Protocolo de Notificaciones y Ejecución",
      protocolSubtitle: "Enlace punto a punto con tu servidor personal",
      f1Title: "Telemetría en Vivo de Órdenes y Fills",
      f1Desc: "Notificación push en menos de 50ms al completarse una orden en tu cuenta de fondeo o exchange copiado.",
      f2Title: "Panic Switch Global (/panic_close_all)",
      f2Desc: "Cancela todas las órdenes activas y liquida posiciones a mercado en caso de eventos macroeconómicos adversos.",
      f3Title: "Whitelist Estricta y Autenticación 2FA",
      f3Desc: "El bot solo acepta comandos procedentes de tu Telegram ID verificado con confirmación biométrica.",
      selectCommand: "Selecciona comando para probar en simulador:",
      botVerified: "bot verificado · en línea",
      nodeOperative: "NODO 100% OPERATIVO",
      confirmEmergencyBtn: "CONFIRMAR CIERRE TOTAL",
      cancelBtn: "Cancelar",
      tlsNotice: "Enlace cifrado TLS 1.3",
    },
    credentials: {
      title: "Conexiones API de Exchanges",
      subtitle: "Conecta tus cuentas personales de Binance o Bybit para copiar tus operaciones financiadas en tiempo real",
      step1: "1. Crea tus claves API en tu exchange con permisos exclusivos de Lectura y Trading (Deshabilita Retiros)",
      step2: "2. Introduce tu API Key y Secret a continuación",
      step3: "3. Comienza a copiar posiciones automáticamente desde tu terminal de Eklipse Funded",
      apiKeyLabel: "API Key",
      apiSecretLabel: "API Secret",
      passphraseLabel: "Passphrase (si aplica)",
      connectBtn: "Vincular API de Exchange",
      cancelBtn: "Cancelar",
      tlsNotice: "Túnel Cifrado TLS 1.3",
    },
    cta: {
      titleStart: "Opera con Capital Institucional en",
      titleEnd: "Eklipse Funded",
      subtitle: "Elige tu reto de evaluación, demuestra tu disciplina en nuestra terminal propia y retira tus beneficios cada 14 días con herramientas exclusivas para copiar operaciones a tus exchanges vía API.",
      accessTerminalBtn: "Empezar Reto de Fondeo",
      exploreGatewaysBtn: "Explorar Programas y Reglas",
    },
    footer: {
      brandDesc: "Eklipse Funded es la empresa de fondeo tecnológica de próxima generación construida sobre un Trading OS integral. Cuenta con terminal propia en Canvas GPU a 60 FPS, liquidaciones en 24 horas, hasta 90% de profit split y herramientas de copia a exchanges vía API.",
      quickLinks: "Programas de Fondeo",
      legal: "Reglas y Cumplimiento",
      disclaimer: "Eklipse Funded ofrece programas de evaluación y cuentas de trading simuladas. Las herramientas de conexión a exchanges operan bajo protocolo estrictamente no custodial sin permisos de retiro.",
      riskTitle: "Aviso de Alto Riesgo Operativo y Descargo de Responsabilidad",
      riskDisclaimerFull: "El trading en los mercados financieros, criptoactivos, divisas y futuros conlleva un alto riesgo de pérdida de capital. Eklipse Funded ofrece programas de evaluación educativa y cuentas simuladas con capital de la firma tras superar las fases de reto. Las herramientas de conexión a exchanges se proporcionan para conveniencia del usuario bajo arquitectura no custodial.",
      connectorsTitle: "Pasarelas & Capacidad de Conexión",
      connectorsCount: "+20 Exchanges & Pasarelas",
      securityTitle: "Seguridad y Solvencia Institucional",
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
      ? "Eklipse Funded · Empresa de Fondeo de Próxima Generación con Terminal Propia"
      : "Eklipse Funded · Next-Generation Prop Firm with Proprietary Terminal";

    // Dynamic Meta Description
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute(
        'content',
        isEs
          ? "Eklipse Funded: Empresa de fondeo con terminal propia en Canvas a 60 FPS, retos hasta $500,000, 90% de profit share, pagos en 24h y herramientas para copiar a Binance y Bybit vía API."
          : "Eklipse Funded: Next-generation proprietary trading firm with in-house 60 FPS Canvas terminal, funding challenges up to $500,000, 90% profit split, 24h payouts, and API copy trading to Binance and Bybit."
      );
    }

    // Dynamic OpenGraph Title & Description
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) {
      ogTitle.setAttribute(
        'content',
        isEs
          ? "Eklipse Funded · Empresa de Fondeo con Terminal Propia & Copy a Exchanges"
          : "Eklipse Funded · Proprietary Terminal Prop Firm & CEX Copy Trading"
      );
    }
    const ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc) {
      ogDesc.setAttribute(
        'content',
        isEs
          ? "Eklipse Funded: Cuentas de fondeo hasta $500k, terminal propia en Canvas a 60 FPS, liquidaciones en 24h, 90% de beneficio y copia a Binance/Bybit vía API."
          : "Eklipse Funded: Capital accounts up to $500k, proprietary 60 FPS Canvas terminal, 24h payouts, 90% profit split, and API copy tools to Binance/Bybit."
      );
    }

    // Dynamic Twitter Title & Description
    const twTitle = document.querySelector('meta[name="twitter:title"]');
    if (twTitle) {
      twTitle.setAttribute(
        'content',
        isEs
          ? "Eklipse · Terminal Multi-Exchange & Prop-Firm"
          : "Eklipse · Multi-Exchange & Prop-Firm Terminal"
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
