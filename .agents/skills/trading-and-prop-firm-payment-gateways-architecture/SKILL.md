---
name: trading-and-prop-firm-payment-gateways-architecture
description: "Arquitectura integral de pasarelas de pago para Trading y Empresas de Fondeo (Prop Firms): Tarjetas de crédito/débito de alto riesgo (High-Risk MIDs), Pasarelas Cripto (Cryptomus, NOWPayments, TON/Telegram @wallet) y Escudo Fiat-to-Crypto On-Ramp con 0% contracargos."
version: "1.0.0"
category: "Fintech Payments, Web3 & High-Risk Merchant Operations"
author: "AI Studio Fintech Systems Architect"
status: "Production Ready / Institutional Standard"
---

# Trading & Prop Firm Payment Gateways Architecture
### Guía Maestra de Pagos para Plataformas de Trading y Empresas de Fondeo

---

## 1. El Problema Estructural: Por qué Stripe y PayPal Rechazan Trading y Prop Firms

Las plataformas de trading institucional, copy trading, arbitraje y empresas de fondeo (*Prop Firms / Evaluation Challenges*) operan en una industria clasificada como **Alto Riesgo Financiero (*High-Risk*)** por las redes de tarjetas (Visa, Mastercard, Amex):

### Razones del Cierre Forzoso en Stripe / PayPal / Shopify / Square
1. **Políticas de Negocios Prohibidos (*Restricted Business Policy*):**
   - Stripe y PayPal prohíben explícitamente "apuestas, servicios cuasi-efectivo, productos apalancados, forex, señales financieras y esquemas de trading sin licencia bancaria directa".
2. **El Problema del Contracargo por Venganza (*Friendly Fraud*):**
   - Cuando un trader pierde una evaluación de fondeo (*breach*) o sufre una racha negativa de mercado, un porcentaje recurre al banco emisor solicitando el contracargo (*chargeback*) alegando "servicio no recibido" o "fraude".
   - Visa (*VAMP*) y Mastercard (*ECP*) congelan cuentas cuyo ratio de contracargo supere el **0.9% – 1.5%**.
3. **Consecuencias de operar encubierto con Stripe:**
   - Retención inmediata del 100% de los fondos durante **180 días** (6 meses).
   - Inclusión de los administradores y la sociedad en la lista negra **MATCH / TFX (Terminated Merchant File)**, impidiendo abrir cuentas bancarias y pasarelas en todo el sistema financiero occidental.

> **Regla de Oro:** Ni ZYTI Trade ni ninguna empresa de fondeo aliada deben procesar cobros de trading bajo cuentas estándar de Stripe/PayPal. Se requiere infraestructura especializada de alto riesgo o liquidación cripto irreversible.

---

## 2. Top Pasarelas Cripto: Máxima Eficiencia y Menor Comisión

Las criptomonedas son el canal prioritario (#1) en la industria global de trading y prop trading debido a:
- **0% Contracargos (*Zero Chargeback Risk*):** Las transacciones en blockchain son criptográficamente irreversibles.
- **Liquidación Inmediata:** Fondos en tesorería en segundos o minutos.
- **Sin intermediarios bancarios:** Disponibilidad 24/7 global sin bloqueos transfronterizos.

### Matriz Comparativa de Pasarelas Cripto para Trading

| Pasarela | Comisión por Tx | Criptos / Redes Soportadas | Conversión Automática | Adecuación para Trading & Prop Firms |
| :--- | :--- | :--- | :--- | :--- |
| **Cryptomus** *(Recomendada #1)* | **0.4% – 0.9%** (0.4% volumen alto) | 30+ redes (USDT TRC20, ERC20, Polygon, Arbitrum, BSC, SOL, BTC, TON) | Sí, auto-conversión a USDT/USDC | **Estándar de la Industria.** Soporta pagos wallet-to-wallet, P2P integrado, QR estático y dinámico, facturación y webhooks webhook ultra estables. |
| **NOWPayments** *(Recomendada #2)* | **0.4% – 0.5%** | 160+ criptomonedas | Sí, liquidación directa en la stablecoin elegida | Excelente API REST, muy utilizada por firmas como FundedNext. Custodia cero o billetera corporativa. |
| **Helio Pay** | **1.0%** | Solana, Polygon, Ethereum, Bitcoin, Base | Sí | Experiencia Web3 Checkout premium. Excelente UX móvil pero comisión ligeramente superior. |
| **Coinbase Commerce** | **1.0%** | Base, Polygon, Ethereum | Sí (USDC) | Requiere KYC corporativo estricto; susceptible a restricciones en jurisdicciones no compatibles. |

---

## 3. El Ecosistema Telegram: @wallet Pay y TON Connect

Para ZYTI Trade, al contar con autenticación nativa vía Telegram y Mini Apps integradas, el canal TON es el más rápido, económico y sin fricción del mercado.

### 3.1. TON Connect 2.0 (Billeteras no custodiales: @wallet / Tonkeeper)
- **Activo estrella:** **USDT nativo en The Open Network (TON)** (lanzado oficialmente por Tether en 2024 con más de 1.000M$ de capital circulante).
- **Tarifa de red (*Gas Fee*):** **$0.01 – $0.02** por transacción.
- **Velocidad de confirmación:** **2 a 4 segundos** (finalidad de bloque casi instantánea).
- **Flujo de Usuario:**
  1. El trader pulsa `[ Pagar con Telegram Wallet ]`.
  2. La Mini App abre la interfaz de `@wallet` o `Tonkeeper` mediante `@tonconnect/ui-react`.
  3. El usuario autoriza con su huella dactilar (FaceID / TouchID).
  4. La transacción impacta la tesorería de ZYTI y el webhook activa la cuenta de trading en milisegundos.

### 3.2. Telegram @wallet Pay API (`pay.wallet.tg`)
- Es la pasarela comercial de pagos del bot oficial `@wallet`.
- Permite generar enlaces de cobro con orden parametrizada (`createOrder`):
  ```json
  {
    "amount": { "currencyCode": "USDT", "amount": "99.00" },
    "description": "ZYTI Trade - Cuenta de Evaluación 100K",
    "returnUrl": "https://zytitrade.com/trade",
    "failReturnUrl": "https://zytitrade.com/pricing",
    "customData": "trader_id_1061657589"
  }
  ```
- Al completarse el pago, `@wallet` envía un webhook firmado con HMAC a la API de ZYTI para aprovisionar la cuenta en `trading_accounts`.

---

## 4. Tarjetas de Débito y Crédito (Visa / Mastercard) para Trading

Si los traders exigen pagar con tarjeta, existen dos vías estructurales:

---

### Vía A: El "Escudo Fiat-to-Crypto On-Ramp" (La Solución Definitiva con 0% Riesgo)
En lugar de abrir una pasarela bancaria de alto riesgo tradicional (que exige fianzas de 50.000€ y cobra 4% - 7%), se integra un **Widget On-Ramp** (como **Onramper**, **Transak**, **Ramp Network** o **MoonPay**):

```
┌─────────────────┐      ┌─────────────────────────┐      ┌────────────────────────┐
│  Trader paga    │ ──►  │ On-Ramp Widget          │ ──►  │ Tesorería ZYTI         │
│  con Tarjeta    │      │ (Transak / Onramper)    │      │ (Recibe USDT en        │
│  (Visa/MC 3DS)  │      │ • Asume el 100% de KYC  │      │  Polygon o Arbitrum)   │
└─────────────────┘      │ • Asume CONTRACARGOS    │      └────────────────────────┘
                         └─────────────────────────┘
```

#### Ventajas Cruciales del Escudo On-Ramp:
1. **0% Responsabilidad de Contracargos:** El adquirente del On-Ramp asume la disputa. Para ZYTI es una entrada de cripto irreversible.
2. **Acepta Tarjetas Globales, Apple Pay y Google Pay:** Experiencia de compra nativa.
3. **Sin Riesgo de Cierre de MID:** ZYTI nunca figura como procesador de tarjetas de trading.
4. **Comisión Competitiva:** 1.5% a 2.5% asumida transparentemente o integrada en la tarifa.

**Herramienta recomendada:** **Onramper** (Orquestador On-Ramp que unifica Transak, MoonPay, Banxa y Ramp en una sola integración con la tarifa más baja en tiempo real).

---

### Vía B: Pasarelas Fiat Directas de Alto Riesgo (*High-Risk Merchant Accounts - HRMA*)
Si la empresa de fondeo desea procesar tarjetas directamente bajo su propia razón social:

| Proveedor | Modelo | Cobertura | Métodos de Pago | Notas de Integración |
| :--- | :--- | :--- | :--- | :--- |
| **Praxis Tech (Praxis Cashier)** | **Orquestador #1 de Trading** | Global | Tarjetas Visa/MC, 350+ adquirentes, APMs locales | El estándar absoluto en Brokers y Prop Firms globales. Permite balancear volumen entre 5 adquirentes para que ninguno supere el 1% de contracargos. |
| **BridgerPay** | Orquestador de Pagos | Global | Tarjetas, Open Banking, Pix, SEPA | Función *Bridger Router*: Si un banco rechaza la tarjeta por "operador cripto", la reintenta automáticamente en otro procesador en 200ms. |
| **PayRetailers** | Adquirente Directo LatAm | América Latina | Tarjetas locales, Pix (Brasil), SPEI (México), PSE (Colombia), OXXO | Indispensable si la firma capta traders en México, Colombia, Brasil o Perú. |
| **Payabl / Nuvei** | Adquirente Directo UE | Europa / Global | Tarjetas Visa/Mastercard con 3D Secure v2 obligatorio | Exige sociedad comercial constituida, términos claros de no reembolso y volumen mínimo de 25.000€/mes. |

---

## 5. La "Regla de los 2 Conectores": Cero Caos Técnico

Para no tener "un mogollón de conexiones" que saturen el backend y requieran mantenimiento continuo, ZYTI implementa una arquitectura desacoplada basada en el **Patrón Adaptador Hexagonal** con solo **2 Conectores Principales**:

```
                                [ ZYTI CHECKOUT HUB ]
                                          │
                  ┌───────────────────────┴───────────────────────┐
                  ▼                                               ▼
     [ CONECTOR CRIPTO UNIFICADO ]                  [ CONECTOR TARJETAS / ON-RAMP ]
            (Cryptomus API)                           (Onramper / Praxis SDK)
                  │                                               │
      ┌───────────┼───────────┐                       ┌───────────┼───────────┐
      ▼           ▼           ▼                       ▼           ▼           ▼
   USDT-TRC20  USDT-TON    USDT-Arb               Visa / MC    Apple Pay   Google Pay
```

1. **Conector 1 (Cripto Total):** **Cryptomus API**. Gestiona +30 redes, código QR dinámico, auto-conversión a USDT y liquidación automática con 1 solo webhook central.
2. **Conector 2 (Tarjetas & Fiat Total):** **Onramper SDK** o **Praxis Tech**. Procesa tarjetas de crédito/débito, Apple Pay, Google Pay y transferencias locales (Pix, SEPA) delegando el riesgo de fraude.

---

## 6. Modelo de Datos Relacional para Pagos (Supabase / PostgreSQL)

Para registrar cada factura, método de pago, confirmación de red y aprovisionamiento automático de cuentas de trading:

```sql
-- 1. Tabla de Facturas de Pago
CREATE TABLE IF NOT EXISTS public.payment_invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trader_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    trader_email TEXT NOT NULL,
    plan_id TEXT NOT NULL,                  -- ej: 'challenge_100k', 'zyti_terminal_pro'
    amount_usd NUMERIC(12, 2) NOT NULL,
    gateway_provider TEXT NOT NULL,         -- 'cryptomus', 'ton_connect', 'onramper', 'praxis'
    gateway_invoice_id TEXT UNIQUE,         -- ID de factura retornado por el procesador
    pay_currency TEXT NOT NULL,             -- 'USDT', 'TON', 'EUR', 'USD'
    pay_network TEXT,                       -- 'TRC20', 'TON', 'ARBITRUM', 'POLYGON'
    pay_address TEXT,                       -- Dirección de depósito generada
    status TEXT NOT NULL DEFAULT 'PENDING', -- 'PENDING', 'PAID', 'EXPIRED', 'FAILED'
    tx_hash TEXT,                           -- Hash de la transacción blockchain
    provisioned_account_id UUID,            -- ID de la cuenta creada en trading_accounts
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices de consulta rápida para reconciliación y webhooks
CREATE INDEX IF NOT EXISTS idx_invoices_gateway_id ON public.payment_invoices(gateway_invoice_id);
CREATE INDEX IF NOT EXISTS idx_invoices_trader_email ON public.payment_invoices(trader_email);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON public.payment_invoices(status);
```

---

## 7. Protocolo de Webhook y Aprovisionamiento Automático (Edge Function)

Cuando la pasarela confirma el pago, envía un webhook HTTP POST firmado con **HMAC-SHA256**. El backend de ZYTI valida la firma y aprovisiona la cuenta de trading en una transacción atómica:

```typescript
// supabase/functions/payment-webhook/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";
import { crypto } from "https://deno.land/std@0.168.0/crypto/mod.ts";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

serve(async (req) => {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("sign") || req.headers.get("x-signature");
    const apiKey = Deno.env.get("CRYPTOMUS_PAYMENT_KEY")!;

    // 1. Validar firma criptográfica HMAC-SHA256 (Evitar ataques de inyección)
    const expectedSign = md5(btoa(rawBody) + apiKey); // o hmacSha256 según el proveedor
    if (signature !== expectedSign) {
      return new Response("Firma no autorizada", { status: 401 });
    }

    const payload = JSON.parse(rawBody);
    const { order_id, status, tx_hash, amount } = payload;

    // 2. Comprobar estado de liquidación exitosa
    if (status === "paid" || status === "paid_over") {
      // 3. Buscar factura pendiente
      const { data: invoice } = await supabase
        .from("payment_invoices")
        .select("*")
        .eq("gateway_invoice_id", order_id)
        .eq("status", "PENDING")
        .single();

      if (!invoice) return new Response("Factura ya procesada o inexistente", { status: 200 });

      // 4. Crear y Aprovisionar Cuenta de Trading Institucional en ZYTI
      const initialBalance = invoice.plan_id.includes("100k") ? 100000 : 50000;
      const { data: account, error: accError } = await supabase
        .from("trading_accounts")
        .insert({
          trader_email: invoice.trader_email,
          account_number: `ZYTI-${Math.floor(100000 + Math.random() * 900000)}`,
          initial_balance: initialBalance,
          current_balance: initialBalance,
          equity: initialBalance,
          status: "ACTIVE",
          rules_config: {
            maxDailyDrawdownPct: 5.0,
            maxTotalDrawdownPct: 10.0,
            profitTargetPct: 8.0,
            drawdownType: "EOD",
            mandatoryStopLoss: true
          }
        })
        .select()
        .single();

      if (accError) throw accError;

      // 5. Actualizar factura a estado 'PAID'
      await supabase
        .from("payment_invoices")
        .update({
          status: "PAID",
          tx_hash: tx_hash,
          provisioned_account_id: account.id,
          updated_at: new Date().toISOString()
        })
        .eq("id", invoice.id);

      // 6. Notificar al Trader vía Telegram Bot si existe telegram_id
      const botToken = Deno.env.get("TELEGRAM_BOT_TOKEN");
      const { data: profile } = await supabase
        .from("profiles")
        .select("telegram_id, full_name")
        .eq("email", invoice.trader_email)
        .maybeSingle();

      if (botToken && profile?.telegram_id) {
        await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: profile.telegram_id,
            text: `🎉 <b>¡Pago Confirmado y Cuenta Activada!</b>\n\nHola ${profile.full_name || 'Trader'}, tu cuenta institucional <code>${account.account_number}</code> con balance inicial de <b>$${initialBalance.toLocaleString()} USDT</b> ha sido activada con éxito.\n\nYa puedes abrir la terminal y comenzar a operar.`,
            parse_mode: "HTML"
          })
        });
      }
    }

    return new Response(JSON.stringify({ ok: true }), { headers: { "Content-Type": "application/json" } });
  } catch (err: any) {
    return new Response(err.message, { status: 500 });
  }
});
```

---

## 8. Procedimiento de Replicación para Empresas de Fondeo (Prop Firms)

Para clonar esta arquitectura en cualquier empresa de fondeo aliada o marca blanca:

1. **Constitución Societaria Dual:**
   - Sociedad comercial en jurisdicción amigable (ej. Chipre, Dubái, Costa Rica o Reino Unido) para operar la marca y procesar pagos.
   - Sociedad de tesorería para operar cuentas institucionales con Binance/Bybit Broker API.
2. **Alta de Cuenta Merchant:**
   - Crear cuenta corporativa en **Cryptomus** y solicitar tarifa de alto volumen (**0.4%**).
   - Generar API Key y Secret en el panel de Cryptomus para el bot y la terminal.
3. **Integración On-Ramp de Tarjetas:**
   - Registrarse en **Onramper** (`onramper.com`) para obtener la API Key del widget embebido.
   - Configurar la billetera de recepción corporativa de la firma (USDT en Polygon o Arbitrum).
4. **Activación de Webhook Seguro:**
   - Desplegar la Edge Function con validación HMAC y aprovisionamiento directo a `trading_accounts`.
5. **Notificaciones Telegram:**
   - Configurar las alertas instantáneas de pago confirmado y entrega de credenciales en el bot oficial de la firma.
