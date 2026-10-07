---
name: seo-ai-indexing-propfirm-and-exchange-discoverability
description: "Estrategia profunda de SEO institucional, AEO (Answer Engine Optimization para LLMs como ChatGPT, Perplexity, Claude y Gemini), arquitectura semántica JSON-LD, sitemap dinámico, OpenGraph multilingüe, indexación de palabras clave de exchanges (Binance, Bybit, OKX, CCXT), prop firms (FTMO, Topstep, FundedNext, Apex), TradeLocker, Trading City y Gladis."
version: "1.0.0"
category: "Search Engine Optimization, AI Discovery & Social Metadata"
author: "AI Studio Fintech Systems Architect"
status: "Mandatory Operational Standard"
---

# Global City: SEO Profundo, Optimización para IAs (AEO), Metadatos Sociales y Descubrimiento Multicanal

Esta especificación codifica la **arquitectura obligatoria de posicionamiento en motores de búsqueda tradicionales (Google, Bing), motores generativos de inteligencia artificial (Perplexity, ChatGPT Search, Claude, Google Gemini) y tarjetas sociales OpenGraph / Twitter Cards** para la plataforma **Global City**.

---

## 1. Arquitectura de Optimización para Inteligencias Artificiales (AEO - Answer Engine Optimization)

Los modelos de lenguaje y agentes autónomos indexan la web no solo por palabras clave, sino por relaciones semánticas de entidades (*Knowledge Graphs*). Para que una IA recomiende **Global City** cuando un usuario pregunte por arbitraje sintético, software no custodial o gestión de prop firms:

### A. Archivo Estándar `llms.txt` (Raíz del Dominio)
El archivo `/llms.txt` provee un resumen estructurado en formato Markdown optimizado para que los scrapers de IA (como `GPTBot`, `PerplexityBot`, `ClaudeBot`, `Google-Extended`) procesen en milisegundos:
- Descripción institucional del producto.
- Casos de uso de infraestructura (conexión multi-exchange, pasarelas FIX, arbitraje sin custodia).
- Plataformas integradas y protocolos de conectividad.

### B. Directivas en `/robots.txt`
Se debe habilitar de forma explícita el acceso a los bots de IA de vanguardia para asegurar su indexación:
```robots.txt
User-agent: *
Allow: /

User-agent: GPTBot
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: Google-Extended
Allow: /

User-agent: TelegramBot
Allow: /

Sitemap: https://globalcitytrading.com/sitemap.xml
```

### C. Microdatos JSON-LD (`schema.org`)
Se inyecta en el `<head>` del HTML una definición estructurada de entidades en formato JSON-LD:
- `@type: SoftwareApplication`: Define la categoría `FinanceApplication`, capacidades operativas y precio accesible.
- `@type: Organization`: Asocia la marca Global City con las entidades clave de su ecosistema (`Trading City`, `Gladis`, `FTMO`, `Bybit`, etc.).
- `@type: WebSite`: Define las versiones lingüísticas (`es`, `en`) y enlaces canónicos.

---

## 2. Diccionario de Palabras Clave de Alta Intención (High-Intent Keywords)

El público objetivo de Global City está conformado por traders cuantitativos, operadores de arbitraje, usuarios de bots en Telegram y traders de cuentas fondeadas (Prop Firms).

### A. Exchanges y Sedes Cripto
`Binance`, `Bybit`, `Bybit v5`, `OKX`, `OKX DMA`, `Hyperliquid`, `Hyperliquid L1`, `Kraken`, `Bitget`, `MEXC`, `KuCoin`, `Gate.io`, `Coinbase Prime`, `BingX`, `dYdX v4`, `Deribit`, `Phemex`.

### B. Empresas de Fondeo (Prop Firms) & Retos
`FTMO`, `FundedNext`, `The Funded Trader`, `Apex Trader Funding`, `Topstep`, `MyForexFunds`, `E8 Markets`, `Funding Pips`, `Goat Funded Trader`, `Alpha Capital Group`, `City Traders Imperium`, `The 5%ers`, `Fast Track Trading`, `Bulenox`, `TradeDay`.
- *Keywords de búsqueda:* "pasar reto prop firm con software", "copy trading entre cuentas de fondeo", "evitar slippage en prop firms", "como conectar MT5 y TradeLocker para prop firm".

### C. Protocolos, Terminales y Frameworks de Conectividad
`CCXT`, `TradeLocker`, `Tradelocker`, `TradingView`, `MetaTrader 5`, `MT5`, `MetaTrader 4`, `MT4`, `cTrader Open API`, `cTrader Protobuf`, `Rithmic`, `R|API`, `FIX Protocol 4.4`, `FIX 5.0`, `CME Group`, `WebSocket L2 Depth`, `REST API Trading`.

### D. Ecosistema, Comunidad & Soluciones Propietarias
`Global City`, `Trading City`, `Gladis`, `Arbitraje Sintético`, `Arbitraje Cross-Exchange`, `Bot de Trading Telegram`, `Liquidación de Emergencia Telegram`, `Panic Switch Biométrico`, `Terminal No Custodial`, `Rebalanceo Delta Neutral`, `VWAP Execution Router`.

### E. Búsquedas Long-Tail en Google Search (Español & Inglés)

#### Español:
1. *"conectar multiples exchanges en una sola pantalla"*
2. *"arbitraje sintetico cripto sin riesgo direccional"*
3. *"como operar cuentas de fondeo desde telegram"*
4. *"plataforma no custodial para conectar cTrader MT5 y Bybit"*
5. *"terminal de trading trading city gladis"*
6. *"copy trading cruzado entre brokers y exchanges crypto"*
7. *"bot de telegram para cerrar todas las ordenes panic switch"*

#### Inglés:
1. *"unified multi-venue trading terminal crypto and forex"*
2. *"synthetic arbitrage scanner L2 orderbook"*
3. *"non-custodial multi-account prop firm manager"*
4. *"cross copy trading between MT5 cTrader and TradeLocker"*
5. *"Telegram bot execution for high frequency trading"*
6. *"CCXT and FIX protocol unified router"*
7. *"FTMO and Apex automated account pass system"*

---

## 3. Optimización OpenGraph y Twitter Cards Dinámicas

Para que al copiar y pegar el enlace de la plataforma en **Telegram, WhatsApp, Twitter/X, Discord o LinkedIn**, se genere una tarjeta visual de alta conversión:

### A. Etiquetas Estándar en `<head>`
- `og:site_name`: `Global City`
- `og:type`: `website`
- `og:image`: Imagen de 1200x630 píxeles con alto contraste (`/og-image.jpg`).
- `og:image:width`: `1200`
- `og:image:height`: `630`
- `twitter:card`: `summary_large_image`

### B. Sincronización Reactiva Multilingüe
El contexto de idioma de la aplicación (`LanguageContext.tsx`) debe actualizar dinámicamente los metadatos al alternar entre `ES/BTC` y `EN/USD`:
- **En Español:** Título y descripción centrados en *Terminal Institucional, Arbitraje Sintético, Prop Firms y Trading City*.
- **En Inglés:** Título y descripción centrados en *Institutional Multi-Venue Terminal, L2 Synthetic Arbitrage, Prop-Firm DMA and Telegram Ops*.

---

## 4. Arquitectura de Sitemap y Enlazado Canónico

### A. Sitemap XML (`/sitemap.xml`)
- Declaración de URLs canónicas.
- Directivas `xhtml:link` bidireccionales con atributos `hreflang="es"`, `hreflang="en"` y `hreflang="x-default"`.
- Inclusión del sitemap de imágenes (`image:image`) para posicionar el logo y capturas del terminal en Google Imágenes.

### B. Metadatos de Indexación
```html
<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
```

---

## 5. Checklist de Verificación para Nuevas Vistas

Al desarrollar nuevas páginas, secciones o módulos dentro de Global City:
1. **Title Semántico:** No más de 65 caracteres, incluyendo la marca `Global City` y el beneficio principal.
2. **Meta Description:** Entre 140 y 160 caracteres, conteniendo al menos 3 palabras clave institucionales (`exchanges`, `prop firms`, `no custodial`).
3. **Encabezados H1-H3 Jerárquicos:** Un único `<h1>` por vista principal y estructura semántica estricta.
4. **Textos Alternativos (`alt`):** Toda imagen debe llevar un texto `alt` descriptivo enriquecido con términos de búsqueda.
5. **Favicon Multi-Resolución:** Archivo `.ico` y versiones `.png` (16x16, 32x32, 180x180 para Apple Touch).
