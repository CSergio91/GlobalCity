# GlobalCity - Hoja de Ruta Operativa y Checklist de Desarrollo
> **Estrategia de Implementación Secuencial:** De menor a mayor complejidad algorítmica y de infraestructura.
> **Regla de Finalización por Módulo:** Cada sección solo se considera concluida cuando incluye (1) ergonomía mobile-first compacta, (2) sistema de ayudas con highlight por coordenadas y (3) traducción nativa completa Inglés/Español.

---

## Estado Global del Proyecto
- **Versión de Arquitectura:** 2.1.0 Institutional Pro
- **Protocolo de Datos:** Zero-Knowledge LocalStorage + Singleton Pub/Sub WebSockets (1 conexión única)
- **Compatibilidad de IA:** Diseñado para integración nativa con Model Context Protocol (MCP) y Agentes LLM.
- **Ergonomía Móvil:** Densidad pro-trader sin elementos gigantes, máxima visibilidad y respuesta táctil.

---

## Checklist Secuencial de Módulos (Orden de Complejidad)

### FASE 1: Conectores CCXT, Brokers DMA & Workspace Limpio (Nivel 1 - Básico)
- [x] Purgar datos ficticios/mock del almacenamiento (`INITIAL_SEED_ACCOUNTS = []`).
- [x] Catálogo CCXT ampliado a 28+ venues (Tier 1 Futuros, DEXs L1, Regulados, MT4, MT5, cTrader, QuickFIX).
- [x] Filtros por categoría y barra de búsqueda predictiva en tiempo real.
- [x] Guardado cifrado y seguro en navegador (`localStorage`) con reactividad instantánea vía `CustomEvent`.
- [x] Regla de 1 única conexión WebSocket persistente multiplexada con Singleton Dispatcher (Anti-Abort y Debounce).
- [x] Espacio de trabajo (Workspace) minimalista de alta densidad ("Zoom Alejado"), apilando conexiones una debajo de otra.
- [x] Optimización móvil paralela: tarjetas de fila apiladas compactas con acciones táctiles directas.
- [ ] **Highlight Onboarding:** Sistema de ayudas guiadas por coordenadas en los controles de conexión.
- [ ] **Traducción Nativa EN/ES:** Cobertura bilingüe total en el formulario, catálogo y estados de conexión.

### FASE 2: Portafolio Agregado & Margen Consolidado Reactivo (Nivel 2 - Intermedio)
- [ ] Cálculo unificado de equidad neta (`Equity = Sum(BalanceUsd)`).
- [ ] Monitor de Margen Libre disponible para colocación de nuevas garantías.
- [ ] Tabla de activos en tiempo real con WebSocket Binance multiplexado + Micro-ticks Forex/Metales.
- [ ] Alertas visuales de discrepancias de colateral o cuentas en Standby/Error.
- [ ] **Ergonomía Móvil:** Ribbon y tablas compactas con scroll horizontal suave y números legibles.
- [ ] **Highlight Onboarding:** Guía interactiva por coordenadas para explicar equidad, margen y feeds en vivo.
- [ ] **Traducción Nativa EN/ES:** Textos, tooltips y métricas 100% bilingües.

### FASE 3: Smart Order Router (EMS / Fragmentación de Órdenes) (Nivel 3 - Intermedio+)
- [ ] Fragmentación algorítmica de orden padre entre los exchanges conectados activos.
- [ ] Ponderación dinámica de lotaje según margen libre disponible en cada subcuenta.
- [ ] Simulación de despacho concurrente no bloqueante (`Promise.allSettled`).
- [ ] Normalización de símbolos entre cripto (`BTC/USDT`), forex (`EURUSD`) y metales (`XAUUSD`).
- [ ] **Ergonomía Móvil:** Controles de órdenes compactos aptos para ejecución rápida con una mano.
- [ ] **Highlight Onboarding:** Explicación paso a paso de la fragmentación EMS y mitigación de slippage.
- [ ] **Traducción Nativa EN/ES:** Formulario de órdenes, botones de compra/venta y confirmaciones bilingües.

### FASE 4: Radar de Arbitraje Sintético Simultáneo L2 (Nivel 4 - Avanzado)
- [ ] Cálculo de divergencias de precio (spread neto = ask_v2 - bid_v1 - fees_taker).
- [ ] Escaneo en tiempo real de oportunidades entre libros de órdenes de venues conectados.
- [ ] Ejecución en un solo clic con deducción virtual de balance de gas tank.
- [ ] Auditoría de latencia de ejecución en milisegundos.
- [ ] **Ergonomía Móvil:** Tarjetas de radar condensadas para visualización táctil rápida.
- [ ] **Highlight Onboarding:** Guía del cálculo de fees taker y ejecución atómica en 1-clic.
- [ ] **Traducción Nativa EN/ES:** Estados de oportunidad, spreads y alertas bilingües.

### FASE 5: Copy Trading Cruzado Multibroker (Nivel 5 - Avanzado)
- [ ] Selector de cuenta Maestra (Master Account) y múltiples cuentas Esclavas (Slave Accounts).
- [ ] Conversión automática de contratos perp a lotes estándar (cTrader / MetaTrader 5).
- [ ] Multiplicadores de riesgo personalizables por subcuenta (0.5x, 1.0x, 2.0x).
- [ ] Interruptor de apagado de emergencia (Emergency Kill-Switch / Flatten All).
- [ ] **Ergonomía Móvil:** Configuración simplificada de réplica con interruptores táctiles.
- [ ] **Highlight Onboarding:** Tutorial guiado sobre asignación de cuenta Maestra y factores de riesgo.
- [ ] **Traducción Nativa EN/ES:** Panel de replicación y alertas bilingües.

### FASE 6: Telegram Webhooks & Notificaciones Push Cifradas (Nivel 6 - Integración)
- [ ] Vinculación autenticada mediante Telegram Login Widget y Bot `@GlobalCityMaster_bot`.
- [ ] Webhook para recibir alertas instantáneas de margin calls, ejecuciones y splits.
- [ ] Comandos rápidos de Telegram (`/balance`, `/status`, `/kill`).
- [ ] **Ergonomía Móvil:** Enlace directo con la app oficial de Telegram en smartphones.
- [ ] **Highlight Onboarding:** Guía interactiva para conectar el chat bot y verificar webhook SSL.
- [ ] **Traducción Nativa EN/ES:** Mensajes del bot, comandos y panel bilingüe.

### FASE 7: Risk Engine & Regulación Financiera Institucional (Nivel 7 - Complejo)
- [ ] Control de Maximum Drawdown diario (5%) y total (10%) para formato Prop Firm.
- [ ] Bloqueo de trading en fines de semana o noticias de alto impacto macroeconómico.
- [ ] Reglas de consistencia operativa y apalancamiento máximo dinámico.
- [ ] **Ergonomía Móvil:** Medidores de riesgo visuales y compactos (tipo velocímetro o barra de progreso).
- [ ] **Highlight Onboarding:** Explicación interactiva de las reglas de capital y límites de pérdida.
- [ ] **Traducción Nativa EN/ES:** Términos de gobernanza, drawdown y reglas bilingües.

### FASE 8: Servidor MCP (Model Context Protocol) & Agente IA Autónomo (Nivel 8 - Máxima Complejidad)
- [ ] Creación de herramientas MCP (`list_connected_venues`, `get_consolidated_equity`, `dispatch_routed_order`).
- [ ] Dock inferior expansible estilo Grok / ChatGPT / Cursor para interacción conversacional con el trader.
- [ ] Análisis cuantitativo asistido por IA sobre histórico de operaciones y slippage.
- [ ] Conexión del MCP Server con base de datos en nube o backend central.
- [ ] **Ergonomía Móvil:** Dock inferior colapsable optimizado para teclado virtual de smartphone.
- [ ] **Highlight Onboarding:** Demostración guiada de las capacidades conversacionales del agente MCP.
- [ ] **Traducción Nativa EN/ES:** Respuestas, sugerencias e interfaz del chat en inglés y español.

---

## Estándar de Experiencia de Usuario (UI/UX)
1. **Espacio de Trabajo (Workspace):** Densidad pro-trader, limpio, sin ruido visual, aprovechamiento vertical y horizontal del canvas.
2. **Navegación Lateral Desplegable:** Acceso instantáneo al menú lateral desde el encabezado superior al hacer hover o clic.
3. **Chat IA Integrado (Dock Inferior):** Barra compacta en reposo para no estorbar el trading, expandible al interactuar.
4. **Ergonomía Móvil Estricta:** Componentes optimizados para uso táctil con una sola mano, sin tipografías desmesuradas.
5. **Calidad de Cierre de Sección:** Cada módulo culmina con su Onboarding Highlight por coordenadas y Traducción Dual Nativa (EN/ES).
