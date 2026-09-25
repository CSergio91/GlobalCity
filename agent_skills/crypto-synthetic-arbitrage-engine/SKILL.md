---
name: crypto-synthetic-arbitrage-engine
description: "Ingeniería de arbitraje cripto sintético multi-exchange en sub-100ms: cálculo de profundidad L2 VWAP, despacho concurrente asíncrono, rollback de pierna huérfana y modelo Gas Tank."
version: "2.0.0"
category: "Quantitative Trading & Arbitrage Systems"
author: "AI Studio Fintech Systems Architect"
status: "Production Ready / Institutional Standard"
---

# Crypto Synthetic Arbitrage Engine (Sub-100ms L2 Execution & Gas Tank)

Esta skill proporciona los fundamentos matemáticos, algorítmicos y de concurrencia asíncrona para implementar un sistema de **arbitraje cripto sintético simultáneo** entre múltiples exchanges (ej. Bybit, OKX, Binance), eliminando por completo los riesgos de latencia y transferencias en blockchain.

---

## 1. Tesis Operativa: Arbitraje Sintético vs. On-Chain Tradicional

```
[ Arbitraje On-Chain (INVIABLE) ]
Comprar en Ex A ──► Retirar a Blockchain (Gas Fee) ──► Esperar Confirmación (2-30 min) ──► Vender en Ex B
                     *La divergencia desaparece en segundos y el riesgo direccional destruye el margen.*

[ Arbitraje Sintético Simultáneo (INSTITUCIONAL) ]
Prefondeo Equilibrado (ej. USDT en Bybit y BTC en OKX)
              │
    Detecta Oportunidad
              ▼
   Disparo Concurrente Sub-100ms vía WebSockets / REST
    ├── Comprar en Bybit (Consume USDT, recibe BTC)
    └── Vender en OKX (Consume BTC, recibe USDT)
              │
    Beneficio Neto Bloqueado de Forma Instantánea (Cero tráfico on-chain)
```

---

## 2. Modelo Matemático y Calculadora de Profit Real L2 (VWAP)

Para evitar pérdidas por deslizamiento (*slippage*), el motor no toma el mejor precio superficial del bid/ask, sino que calcula el **Precio Medio Ponderado por Volumen (VWAP)** recorriendo los niveles del libro de órdenes Nivel 2 hasta completar el capital a invertir.

### Fórmulas del Algoritmo
1. **Spread Bruto (%):**
   $$\text{Spread Bruto (\%)} = \frac{P_{\text{venta\_VWAP}} - P_{\text{compra\_VWAP}}}{P_{\text{compra\_VWAP}}} \times 100$$

2. **Coste Total de Comisiones (Total Fees en \$):**
   $$\text{Fees}_{\text{total}} = (\text{Capital} \times \text{Fee}_{\text{taker\_compra}}) + (\text{Retorno Bruto} \times \text{Fee}_{\text{taker\_venta}})$$
   *(Tarifas taker estándar: 0,045% a 0,055% según el nivel VIP del exchange).*

3. **Ganancia Neta (\$) y Reparto:**
   $$\text{Ganancia Neta} = (\text{Retorno Bruto} - \text{Capital}) - \text{Fees}_{\text{total}}$$
   $$\text{Margen Plataforma (\$)} = \text{Ganancia Neta} \times 20\%$$
   $$\text{Beneficio Usuario (\$)} = \text{Ganancia Neta} \times 80\%$$

4. **Filtro de Seguridad de Umbral Mínimo:**
   $$\text{Spread Neto} > 0,25\%$$
   *Si el spread neto después de comisiones y slippage es inferior al 0,25%, la orden se descarta automáticamente.*

---

## 3. Algoritmo de Cálculo VWAP sobre Orderbook L2 (TypeScript / Python)

```python
from decimal import Decimal
from typing import List, Tuple

def calculate_vwap_for_capital(orders: List[Tuple[Decimal, Decimal]], target_capital: Decimal) -> Decimal:
    """
    orders: lista de [precio, cantidad] ordenados por mejor precio.
    target_capital: capital en moneda cotizada (ej. USDT) a emplear.
    """
    accumulated_cost = Decimal("0")
    accumulated_qty = Decimal("0")

    for price, qty in orders:
        level_cost = price * qty
        remaining_capital = target_capital - accumulated_cost

        if remaining_capital <= Decimal("0"):
            break

        if level_cost <= remaining_capital:
            accumulated_cost += level_cost
            accumulated_qty += qty
        else:
            # Consumir fracción del nivel
            fraction_qty = remaining_capital / price
            accumulated_cost += remaining_capital
            accumulated_qty += fraction_qty
            break

    if accumulated_qty == Decimal("0"):
        return Decimal("0")

    return accumulated_cost / accumulated_qty
```

---

## 4. Arquitectura de Despacho Concurrente y Protocolo de Rollback

El ejecutor dispara ambas operaciones simultáneamente utilizando primitivas asíncronas concurrentes (`Promise.allSettled` en Node.js o `asyncio.gather` en Python):

```
                       ┌───────────────────────────────┐
                       │  Evaluador de Arbitraje L2    │
                       └──────────────┬────────────────┘
                                      │ Oportunidad Validada
                                      ▼
                       ┌───────────────────────────────┐
                       │ Concurrent Order Dispatcher   │
                       └──────┬─────────────────┬──────┘
                              │                 │
                Disparo Pata 1│                 │Disparo Pata 2
                              ▼                 ▼
                       ┌─────────────┐   ┌─────────────┐
                       │ Bybit Order │   │  OKX Order  │
                       └──────┬──────┘   └──────┬──────┘
                              │                 │
                              └────────┬────────┘
                                       │
                              ¿Ambas Ejecutadas?
                                       │
                      ┌────────────────┴────────────────┐
                      ▼                                 ▼
                   [ SÍ ]                            [ NO ]
                      │                                 │
           Registrar Operación Éxito        ┌───────────────────────┐
          Descontar Comisión Gas Tank       │ PROTOCOLO DE ROLLBACK │
                                            └───────────┬───────────┘
                                                        │
                                    Liquidar inmediatamente a mercado
                                    la pierna huérfana para neutralizar
                                    el riesgo direccional de inventario.
```

---

## 5. El Modelo "Gas Tank" (Créditos Virtuales de Intermediación)

Para cobrar la comisión de servicio (20% del beneficio generado) sin custodiar los fondos del usuario ni exigir permisos de retiro en las API keys:

1. **Permisos de API Keys:** Exclusivamente `Read & Trade`. **Retiros desactivados.**
2. **Monedero de Créditos (Gas Tank):** El usuario recarga un saldo interno de prepago en la plataforma (ej. 50 USDT).
3. **Deducción Automática:** Cada vez que el motor cierra un arbitraje exitoso, la comisión de la plataforma se descuenta del balance de créditos del Gas Tank.
4. **Protección de Saldo Cero:** Si el saldo del Gas Tank cae por debajo de 5 USDT, la ejecución automática se pausa y se emite una notificación de recarga.

---

## 6. Gestión de Rebalanceo Inter-Exchange sin Retiros por API

Para proteger la seguridad y no exponer las API keys al endpoint crítico `exchange.withdraw()`:
- **Threshold Alerts (Alertas de Desbalanceo):** Cuando una de las cuentas agota su inventario de USDT o del activo base, el sistema emite una alerta interactiva.
- **Instrucción de Rebalanceo Asistido:** Indica al usuario la cantidad óptima a mover a través de redes de bajísimo coste (como Arbitrum o Solana) para volver a equilibrar el 50/50, ejecutada directamente por el usuario con su 2FA personal.

---

## 7. Roadmap de Maduración Técnica

```
[ Paso 1: Radar Informativo ]
Interfaz con comparativa de spreads en tiempo real y calculadora interactiva L2 VWAP.
                 │
                 ▼
[ Paso 2: Arbitraje Asistido 1-Clic ]
El usuario conecta sus claves API (Read & Trade) y aprueba la ejecución manual instantánea.
                 │
                 ▼
[ Paso 3: Automatización Completa Algorítmica ]
Ejecución autónoma en background gobernada por parámetros predefinidos (spread mínimo, capital y Gas Tank).
```

---

## 8. Checklist de Verificación para Agentes de IA

- [ ] ¿El cálculo de spreads incluye **siempre** las comisiones taker de ambos venues y el slippage L2 acumulado?
- [ ] ¿El despachador concurrente cuenta con un bloque `try/catch` que dispara el rollback de emergencia si una orden falla?
- [ ] ¿Se prohíbe de forma absoluta solicitar permisos de `WITHDRAWAL` en las API keys del usuario para el arbitraje?
- [ ] ¿El sistema descuenta las comisiones del monedero virtual interno (*Gas Tank*) sin tocar el colateral de los exchanges?
