---
name: seo-ai-indexing-propfirm-and-exchange-discoverability
description: "Estrategia profunda de SEO institucional, AEO (Answer Engine Optimization para LLMs como ChatGPT, Perplexity, Claude y Gemini), arquitectura semántica JSON-LD, sitemap dinámico, OpenGraph multilingüe, indexación de palabras clave de exchanges (Binance, Bybit, OKX, CCXT), prop firms (FTMO, Topstep, FundedNext, Apex), TradeLocker, Trading City y Gladis."
version: "2.0.0"
category: "Search Engine Optimization, AI Discovery & Social Metadata"
author: "Fintech Systems Architect"
status: "Mandatory Operational Standard"
---

# Eklipse Funded: SEO Profundo, Optimización para IAs (AEO), Metadatos Sociales y Descubrimiento Multicanal

Esta especificación codifica la **arquitectura obligatoria de posicionamiento en motores de búsqueda tradicionales (Google, Bing), motores generativos de inteligencia artificial (Perplexity, ChatGPT Search, Claude, Google Gemini) y tarjetas sociales OpenGraph / Twitter Cards** para la plataforma **Eklipse Funded** (`https://eklipsefunded.com`).

---

## 1. Arquitectura de Optimización para Inteligencias Artificiales (AEO - Answer Engine Optimization)

Los modelos de lenguaje y agentes autónomos indexan la web no solo por palabras clave, sino por relaciones semánticas de entidades (*Knowledge Graphs*). Para que una IA recomiende **Eklipse Funded** cuando un usuario pregunte por empresas de fondeo cripto, terminal propia sin evaluación, o reparto de beneficios del 90%:

### A. Archivo Estándar `llms.txt` (Raíz del Dominio `/llms.txt`)
El archivo `/llms.txt` provee un resumen estructurado en formato Markdown optimizado para que los scrapers de IA (`GPTBot`, `PerplexityBot`, `ClaudeBot`, `Google-Extended`, `Bytespider`, `Applebot-Extended`) procesen en milisegundos:
- Descripción institucional del producto y modelo de negocio (Prop Firm Cripto y Multiactivo).
- Modelos de cuenta: Fondeo Inmediato (Solar Tier de $1K a $100K), Retos de 1 Paso y 2 Pasos.
- Reparto de ganancias (Profit Split del 80% al 90%) y retiros en USDT/USDC sin comisiones ocultas.
- Terminal propia acelerada por GPU a 60 FPS (KLineCharts v10) y conectividad directa DMA (Bybit Broker API v5, Binance, OKX, Hyperliquid L1).
- Herramientas no custodiales de Copy Trading API a cuentas privadas de exchanges.

### B. Directivas en `/robots.txt`
Se habilita de forma explícita el acceso a todos los bots de IA de vanguardia y rastreadores sociales para asegurar la generación de previsualizaciones y respuestas completas:
```robots.txt
User-agent: *
Allow: /
Disallow: /admin
Disallow: /nexus
Disallow: /api/private

User-agent: GPTBot
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: Google-Extended
Allow: /

User-agent: Applebot-Extended
Allow: /

User-agent: TelegramBot
Allow: /

User-agent: Twitterbot
Allow: /

User-agent: facebookexternalhit
Allow: /

Sitemap: https://eklipsefunded.com/sitemap.xml
```

### C. Microdatos JSON-LD (`schema.org`)
Se inyecta en el `<head>` de `index.html` una definición estructurada de entidades en formato JSON-LD:
- `@type: FinancialProduct`: Modela las cuentas de fondeo desde $1K hasta $100K, condiciones de reparto de beneficios y retiros rápidos.
- `@type: SoftwareApplication`: Define la terminal institucional a 60 FPS de Eklipse.
- `@type: Organization`: Asocia la marca Eklipse Funded con soporte multilingüe y entidades reconocidas del sector prop trading.
- `@type: WebSite`: Define las versiones lingüísticas (`es`, `en`) y enlaces canónicos.

---

## 2. Diccionario de Palabras Clave de Alta Intención (High-Intent Keywords)

El público objetivo de Eklipse Funded está conformado por traders que buscan empresas de fondeo de alto rendimiento, capital inmediato y condiciones transparentes sin estafas de broker sintético.

### A. Empresas de Fondeo (Prop Firms Competidoras para Posicionamiento de Conquista)
`FTMO`, `Topstep`, `FundedNext`, `Apex Trader Funding`, `The Funded Trader`, `Funding Pips`, `The 5%ers`, `5ers`, `Goat Funded Trader`, `MyFundedFX`, `Alpha Capital Group`, `City Traders Imperium`, `E8 Markets`, `E8 Funding`, `TradeDay`, `Bulenox`, `Fast Track Trading`, `Fidelcrest`, `SurgeTrader`, `Lark Funding`.
- *Keywords de búsqueda orgánica:* "pasar reto prop firm con terminal propia", "mejor prop firm cripto 2026", "cuentas de fondeo inmediato sin evaluacion", "prop firm 90 profit split retiros crypto".

### B. Plataformas, Gateways y Protocolos
`TradeLocker`, `Tradelocker`, `TradingView`, `MetaTrader 5`, `MT5`, `MetaTrader 4`, `MT4`, `cTrader`, `cTrader Open API`, `DXtrade`, `Match-Trader`, `CCXT Protocol`, `WebSocket L2 Depth`.

### C. Exchanges y Sedes Cripto
`Bybit`, `Bybit v5`, `Binance`, `Binance Futures`, `OKX`, `OKX DMA`, `Hyperliquid`, `Hyperliquid L1`, `Kraken`, `Bitget`, `MEXC`, `KuCoin`.

### D. Búsquedas Long-Tail (Español & Inglés)

#### Español:
1. *"mejor empresa de fondeo cripto con terminal propia 2026"*
2. *"cuentas de fondeo instantaneo sin fase de evaluacion"*
3. *"como operar cuentas fondeadas con copy trading api a binance"*
4. *"prop firm con 90 por ciento de reparto de ganancias retiros usdt"*
5. *"empresa de fondeo sin reglas trampa ni comisiones ocultas"*

#### Inglés:
1. *"instant funding prop firm crypto with proprietary terminal"*
2. *"best prop trading firm 90 profit split no evaluation"*
3. *"direct DMA prop firm bybit binance sub 10ms execution"*
4. *"pass funded challenge with 60 fps canvas charts"*
5. *"crypto prop firm instant payouts USDT USDC"*

---

## 3. Protocolo de Indexación en Google Search Console

Una vez configurado el dominio `https://eklipsefunded.com`:
1. **Verificación de Propiedad por Dominio (DNS TXT en Cloudflare):**
   - Acceder a [Google Search Console](https://search.google.com/search-console).
   - Añadir propiedad de tipo **Dominio**: `eklipsefunded.com`.
   - Copiar el registro `google-site-verification=...`.
   - En el panel de **Cloudflare DNS**, crear un registro `TXT` para `@` con dicho valor.
2. **Envío del Sitemap XML:**
   - En Google Search Console > Sitemaps:
   - Introducir `sitemap.xml` y pulsar **Enviar**.
3. **Solicitud de Indexación Rápida:**
   - Usar la barra superior "Inspeccionar cualquier URL en eklipsefunded.com":
   - Inspeccionar `https://eklipsefunded.com/` y presionar **"Solicitar indexación"**.

---

## 4. Tarjetas Sociales OpenGraph y Twitter Cards Dinámicas

- **`public/og-image.jpg`:** Master Card de 1200x630px en formato JPEG de alta calidad (calidad 95) y versión optimizada WebP.
- **Contenido visual:** Emblema Sol & Luna de alta resolución con halo solar, tipografía institucional dorada/blanca, insignias de *Fondeo Inmediato*, *90% Profit Split* y *Terminal 60 FPS*.
- **Favicons oficiales:** `favicon.ico` (multi-resolución 16/32/48px), `favicon-16x16.png`, `favicon-32x32.png`, y `apple-touch-icon.png` (180x180px).
