---
name: crypto-prop-firm-operations-and-venues
description: "Arquitectura operativa y técnica para empresas de fondeo cripto con ejecución real en libros de órdenes de exchanges: Bybit Broker API v5, OKX DMA, Hyperliquid L1 con Agent Wallets y Builder Codes."
version: "2.0.0"
category: "Prop Firm Architecture & Institutional Venues"
author: "AI Studio Fintech Systems Architect"
status: "Production Ready / Institutional Standard"
---

# Crypto Prop Firm Operations & Venues (CEX Broker Programs & Hyperliquid L1)

Esta skill define la arquitectura técnica y operativa para desplegar una empresa de fondeo (*Proprietary Trading Firm*) de criptoactivos basada en el **modelo híbrido con ejecución real**. Supera las deficiencias de los modelos simulados (*B-Book*) conectando directamente con libros de órdenes institucionales en exchanges centralizados y descentralizados.

---

## 1. El Modelo Híbrido: Ventaja Competitiva y Arquitectura

```
                        ┌──────────────────────────────┐
                        │      EMPRESA DE FONDEO       │
                        └──────────────┬───────────────┘
                                       │
                ┌──────────────────────┴──────────────────────┐
                ▼                                             ▼
     [ FASE DE EVALUACIÓN ]                        [ FASE FONDEADA REAL ]
  • Entorno simulado propietario               • Capital real de la firma
  • Alimentado por libros L2 en vivo           • Ejecución directa en Orderbook de CEX/DEX
  • Cero riesgo de capital corporativo         • Trader audita su propio Fill ID / Tx Hash
  • Filtro de consistencia y disciplina        • Retorno recurrente de comisiones (Rebates)
```

### Tabla Comparativa de Modelos
| Modelo | Mecánica Operativa | Riesgo Capital | Riesgo Legal / Regulatorio | Verificabilidad |
| :--- | :--- | :--- | :--- | :--- |
| **Simulado Puro (B-Book Tradicional)** | Motor simulador interno, ninguna orden toca el mercado real. | Cero | **Extremo:** Foco de CNMV, BaFin, CFTC; cierre de pasarelas. | Nula (hay que fiarse de la firma). |
| **Sub-cuenta Real Inmediata** | Capital real desde el día 1 en el reto. | **Extremo** (quema capital en novatos) | Bajo | Alta. |
| **Híbrido Institucional (Nuestro Enfoque)** | **Evaluación simulada + Fondeo real en libro de órdenes.** | **Acotado** a los aprobados | **Bajo** (demostrable que no es concurso Ponzi) | **Absoluta:** El trader ve su orden en el libro de Bybit/OKX/Hyperliquid. |

---

## 2. Programas de Corretaje Institucional CEX (Broker Programs)

Para operar a escala institucional, la firma no usa cuentas personales, sino una cuenta matriz institucional (*Master Broker Account*) con subcuentas programáticas automatizadas.

```
                      ┌──────────────────────────────────┐
                      │    Master Broker Account (CEX)   │
                      │  (Custodia Central de Capital)   │
                      └─────────────────┬────────────────┘
                                        │
           ┌────────────────────────────┼────────────────────────────┐
           ▼                            ▼                            ▼
 ┌───────────────────┐        ┌───────────────────┐        ┌───────────────────┐
 │   Subcuenta #001  │        │   Subcuenta #002  │        │   Subcuenta #00N  │
 │ (Trader Fondeado) │        │ (Trader Fondeado) │        │ (Trader Fondeado) │
 │  • Claves Read/   │        │  • Claves Read/   │        │  • Claves Read/   │
 │    Trade fijas    │        │    Trade fijas    │        │    Trade fijas    │
 │  • Retiros: OFF   │        │  • Retiros: OFF   │        │  • Retiros: OFF   │
 │  • IP Restringida │        │  • IP Restringida │        │  • IP Restringida │
 └───────────────────┘        └───────────────────┘        └───────────────────┘
```

---

## 3. Integración Técnica CEX: Bybit y OKX

### A. Bybit Broker API v5
- **Creación Programática:** Endpoints para crear subcuentas instantáneas al momento de que un trader aprueba el reto.
- **Asignación de Credenciales:** Emisión de API Key con permisos estrictos `Read & Trade`. **Funciones de transferencia y retiro desactivadas de forma inmutable.**
- **IP Whitelisting Obligatorio:** Las credenciales solo aceptan peticiones desde las direcciones IP de los servidores de la firma o terminales autorizadas (ej. Tealstreet o proxy de la plataforma).
- **Modelo de Rebates:** Retorno directo a la tesorería corporativa del **40% al 50% de las comisiones transaccionales** (taker ~0.055%, maker ~0.020%) liquidado semanalmente.

### B. OKX Broker API v5 (Non-Disclosed Broker DMA)
- **Creación de Subcuenta:** `POST /api/v5/broker/nd/subaccount-create`
- **Generación de Claves API:** `POST /api/v5/broker/nd/subaccount-apikey-create` con passphrase encriptada.
- **Capacidad Transaccional:** Hasta 40 peticiones por segundo (`40 req/s`) por subcuenta aislada.
- **Protocolo de Parada de Emergencia (Liquidación Inmediata):**
  Si el trader toca el drawdown máximo:
  ```
  1. POST /api/v5/trade/cancel-order  (Cancela todas las órdenes activas)
  2. POST /api/v5/trade/close-position (Cierra posiciones a mercado inmediatamente)
  3. POST /api/v5/broker/nd/subaccount-apikey-modify (Revoca o deshabilita la API Key)
  ```

### Requisitos Institucionales de Entrada (KYB Corporativo)
Para acceder a estos Broker Programs se debe formalizar el proceso de Know Your Business:
1. Acta de constitución y certificado de vigencia de la sociedad gestora.
2. Identificación de beneficiarios efectivos (*Ultimate Beneficial Owners - UBO*) con participación superior al 25%.
3. Manual interno de cumplimiento y prevención de blanqueo de capitales (AML/CFT).
4. Justificación fehaciente del origen de los fondos (*Source of Funds*).

---

## 4. Alternativa Descentralizada On-Chain: Hyperliquid L1

Para operar con libros de órdenes transparentes sin riesgo de custodia en exchanges centralizados ni burocracia bancaria:

```
┌────────────────────────────────────────────────────────┐
│               CARTERA MATRIZ CUSTODIA                  │
│       (Mantiene el Colateral USDC en Hyperliquid)      │
└──────────────────────────┬─────────────────────────────┘
                           │
       Autoriza mediante approveAgent() on-chain
                           │
                           ▼
┌────────────────────────────────────────────────────────┐
│                AGENT WALLET (SUB-CLAVE)                │
│    • Entregada al Trader Fondeado                      │
│    • Puede emitir y cancelar órdenes en el L1          │
│    • NO TIENE PERMISOS de retiro ni movimiento de fondos│
└──────────────────────────┬─────────────────────────────┘
                           │
      Firma cada orden inyectando Builder Code
                           │
                           ▼
┌────────────────────────────────────────────────────────┐
│           TESORERÍA DE LA EMPRESA DE FONDEO            │
│ • Recibe hasta 10 bps (0,10%) en perpetuos             │
│ • Liquidación instantánea en cada bloque de la cadena  │
└────────────────────────────────────────────────────────┘
```

### 1. Agent Wallets (Carteras de Agente)
Hyperliquid permite que la cartera principal autorice una clave privada secundaria delegada exclusivamente para operar:
- El trader fondeado recibe la clave privada del agente.
- Con ella firma transacciones de trading sobre el balance de la firma.
- El protocolo garantiza que el agente no puede transferir colateral fuera de la cuenta matriz.

### 2. Monetización Nativa vía Builder Codes
- La firma registra su `builder_address`.
- Previa firma de `approveBuilderFee` en la configuración de la cuenta, cada orden inyecta el código en su payload.
- El contrato inteligente de Hyperliquid desvía automáticamente hasta **10 puntos básicos (0,10%) en contratos perpetuos** y hasta **100 puntos básicos (1,0%) en transacciones al contado** directamente hacia la billetera corporativa.

---

## 5. Capa de Abstracción de Mercados (Venue Abstraction Layer - VAL)

Para blindar la firma de la dependencia de un único exchange:

```python
from abc import ABC, abstractmethod

class VenueAbstractionLayer(ABC):
    @abstractmethod
    async def create_funded_account(self, user_id: str, initial_margin: float) -> dict:
        """Crea subcuenta en CEX o provisiona Agent Wallet en Hyperliquid."""
        pass

    @abstractmethod
    async def revoke_access(self, subaccount_id: str) -> bool:
        """Revoca API keys o desvincula la Agent Wallet de inmediato."""
        pass

    @abstractmethod
    async def emergency_flatten_positions(self, subaccount_id: str) -> None:
        """Cancela órdenes pendientes y liquida todas las posiciones a mercado."""
        pass

    @abstractmethod
    async def get_realtime_equity(self, subaccount_id: str) -> float:
        """Obtiene equidad en tiempo real combinando balance colateral y PnL no realizado."""
        pass
```

---

## 6. Proveedores de Tecnología Llave en Mano (Turnkey / White-Label)

Si el objetivo de negocio requiere un lanzamiento acelerado (*Time-to-market* en 2–4 semanas):
- **FPFX Tech (PropAccount):** El estándar de la industria en administración de riesgos, métricas de retos y paneles de usuario con soporte multi-broker.
- **Match-Trade Technologies (Match-Prop):** Plataforma llave en mano con gráficos de TradingView integrados, CRM y pasarela cripto nativa (Match2Pay).
- **Tickblaze / Trade Tech Solutions:** Soluciones orientadas a trading cuantitativo y algorítmico conectables por API.

---

## 7. Checklist de Verificación para Agentes de IA

- [ ] ¿Las claves API generadas en CEX tienen desactivados de forma irrevocable los permisos de `WITHDRAWAL` y `TRANSFER`?
- [ ] ¿Las direcciones IP de los servidores de backend están debidamente configuradas en la lista blanca (*whitelisting*) del exchange?
- [ ] ¿En Hyperliquid se utiliza exclusivamente el patrón de *Agent Wallet* y se comprueba la inyección del *Builder Code* en el payload?
- [ ] ¿Existe una rutina de contingencia para conmutar de venue mediante la `VenueAbstractionLayer` si un exchange impone restricciones operativas?
