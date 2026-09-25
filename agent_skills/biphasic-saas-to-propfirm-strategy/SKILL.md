---
name: biphasic-saas-to-propfirm-strategy
description: "Estrategia de lanzamiento y producto bifásico: monetización desde el día 1 mediante Terminal SaaS B2C no custodial y transición modular del 85% del stack hacia una Prop Firm institucional."
version: "2.0.0"
category: "Fintech Product Strategy & Phased Deployment"
author: "AI Studio Fintech Systems Architect"
status: "Production Ready / Institutional Standard"
---

# Biphasic Strategy: Multi-Exchange SaaS Hub to Prop Firm

Esta skill define la hoja de ruta de producto, el modelo de monetización híbrido y la arquitectura de transición para validar, monetizar y blindar tecnológicamente una infraestructura de trading en dos fases estratégicas consecutivas.

---

## 1. La Tesis del Enfoque Bifásico

Lanzar una empresa de fondeo (*Prop Firm*) de forma inmediata impone barreras severas: capital inicial de respaldo, pasarelas de alto riesgo, escrutinio regulatorio y desconfianza de los usuarios.

El **enfoque bifásico** resuelve este obstáculo:

```
┌────────────────────────────────────────────────────────┐
│      FASE 1: TERMINAL SAAS MULTI-EXCHANGE (B2C)        │
│  • Modelo No Custodial: Usuarios conectan sus APIs     │
│  • Fricción Legal CERO (Sin custodia, sin derivados)   │
│  • Monetización Día 1: Suscripciones MRR (29€–79€/mes) │
│  • Rebates de Afiliados de Exchanges (30%–50%)         │
│  • Construye el 85% del Stack Tecnológico Crítico      │
└──────────────────────────┬─────────────────────────────┘
                           │
             Transición Orgánica y Modular
                           │
                           ▼
┌────────────────────────────────────────────────────────┐
│        FASE 2: EMPRESA DE FONDEO CRIPTO (B2B/B2C)      │
│  • Activación del Broker Program corporativo en CEX/DEX│
│  • Emisión automatizada de subcuentas y retos de eval  │
│  • Motor de riesgo, WebSockets y terminal ya auditados │
│  • Base de usuarios fidelizada y costes de CAC reducidos│
└────────────────────────────────────────────────────────┘
```

---

## 2. Reutilización Arquitectónica del 85% del Código

La arquitectura de la Fase 1 está deliberadamente diseñada para que el paso a la Fase 2 sea simplemente activar un proveedor de cuentas institucionales en el backend:

| Componente Técnico | Uso en Fase 1 (Terminal SaaS) | Uso en Fase 2 (Prop Firm) |
| :--- | :--- | :--- |
| **Cálculo de Drawdown** | Alertas de psicotrading para el usuario | Descalificación y corte automático de cuenta |
| **Ingesta WebSocket** | Visualización en vivo de cotizaciones y saldo | Detección síncrona de vulneración de límites |
| **Risk Guardian** | Bloqueo voluntario ante rachas perdedoras (*tilt*) | *Kill Switch* institucional y liquidación a mercado |
| **Terminal de Órdenes** | Despacho hacia cuentas personales | Despacho hacia subcuentas con capital de la firma |
| **Multi-Order Splitting** | Fragmentación entre cuentas del propio usuario | Fragmentación táctica del EMS entre venues |

---

## 3. Especificaciones del MVP de Fase 1 (SaaS B2C)

### A. Dashboard Patrimonial Unificado
- Agregación en tiempo real del balance total, equidad y desglose de inventario de activos conectando múltiples exchanges: Bybit, OKX, Binance y KuCoin.
- Monitorización de margen libre y apalancamiento consolidado.

### B. Multi-Order Splitting & Ejecución Simultánea
- Capacidad de emitir órdenes concurrentes asíncronas con un solo clic hacia múltiples exchanges o subcuentas.
- Asignación proporcional de tamaño de contrato según el balance relativo de cada cuenta conectada.

### C. Risk Guardian (Gestor de Psicotrading)
- **Daily Loss Limit:** Límite diario de pérdidas personalizable por el usuario.
- **Cool-Down Lock:** Bloqueo temporal de la interfaz tras alcanzar una pérdida predefinida (para frenar el *revenge trading*).
- **Position Size Calculator:** Cálculo automático del lotaje exacto en función del nivel de Stop Loss y el porcentaje de riesgo deseado.

### D. Métricas Cuantitativas y Analítica
- Ratio de Acierto (*Win Rate*), Factor de Beneficio (*Profit Factor*), Curva de Equidad Histórica y desglose analítico por instrumento.

---

## 4. Modelo de Monetización Híbrido

```
                               ┌────────────────────────────────┐
                               │   INGRESOS TOTALES DEL HUBS    │
                               └──────────────┬─────────────────┘
                                              │
                      ┌───────────────────────┴───────────────────────┐
                      ▼                                               ▼
          [ Suscripción SaaS (B2C) ]                      [ Rebates de Exchanges ]
      • Plan Gratuito (1 cuenta)                      • Acuerdos de Afiliado Institucional
      • Plan Pro (29 € / mes)                         • Retorno del 30% al 50% de las comisiones
      • Plan Institucional (79 € / mes)                 generadas por el volumen de los usuarios
      • Flujo predecible y recurrente (MRR)           • Escalamiento pasivo sin riesgo de mercado
```

---

## 5. Protocolo de Seguridad Máxima de Credenciales

1. **Permisos Exclusivos:** Las API Keys del usuario **exigen obligatoriamente permisos exclusivos de `Read & Trade`**.
2. **Rechazo de Permisos de Retiro:** Al registrar una clave, el sistema invoca una verificación previa; si detecta permisos de transferencia o retiro (`WITHDRAWAL`), **el alta es rechazada automáticamente**.
3. **Cifrado AES-256-GCM:** Todos los secretos y contraseñas de API se almacenan cifrados con claves administradas en entornos aislados de variables de servidor.

---

## 6. Hoja de Ruta de Ejecución Escalonada (Roadmap a 12 Meses)

```
[ Meses 1 – 2 ] MVP & Conexiones Básicas
Landing page, onboarding, cifrado AES-256-GCM, sincronización de balance con Bybit y OKX, WebSockets.
                     │
                     ▼
[ Meses 3 – 4 ] Terminal & Multi-Orden Concurrente
Soporte para Binance y KuCoin, ejecución simultánea con un clic, Risk Guardian básico, Beta privada con 100 traders.
                     │
                     ▼
[ Meses 5 – 7 ] Apertura Pública & Monetización SaaS
Pasarela de pago de suscripciones, formalización de programas de afiliados, escalado a 1.000 usuarios activos.
                     │
                     ▼
[ Meses 8 – 12 ] Transición Modular a Prop Firm
Homologación de Broker Program institucional, emisión programática de subcuentas, venta de retos de evaluación.
```

---

## 7. Telegram como Eje Central de Retención y Transición Bifásica

El Telegram Bot actúa como el **puente de fidelización y conversión con coste de adquisición (CAC) cercano a cero** entre la Fase 1 y la Fase 2:

1. **Retención en Fase 1 (Terminal SaaS B2C):**
   - El bot mantiene a los suscriptores activos mediante reportes semanales de rendimiento, alertas de arbitraje y notificaciones de ejecución.
   - Envío de notificaciones de rebates acumulados de comisiones de exchanges:
     `💰 REBATES DISPONIBLES: Has acumulado $142.50 USDT en comisiones devueltas por volumen operado en Bybit este mes.`
2. **Puente de Conversión Orgánica a Fase 2 (Prop Firm):**
   - Cuando se activa la empresa de fondeo, la base de usuarios de Telegram recibe invitaciones prioritarias a los primeros retos institucionales de evaluación con descuento exclusivo.
   - **Coste de Adquisición Reducido:** La comunidad de traders ya confía en el terminal y el motor de riesgo porque lo usaron en Fase 1.
3. **Gestión de Grupos y Salas de Trading Colaborativo:**
   - Creación y soporte de grupos de trading desk (como `Global City Funding`), donde los traders interactúan con `/signal`, `/duel` y rankings gamificados, multiplicando el volumen de operaciones.

---

## 8. Checklist de Verificación para Agentes de IA

- [ ] ¿La arquitectura de la Fase 1 utiliza exclusivamente el modelo no custodial (claves del cliente)?
- [ ] ¿El backend valida que ninguna clave API registrada tenga activados los permisos de retiro?
- [ ] ¿Los módulos de cálculo de métricas de riesgo están desacoplados para poder reutilizarse en la fase de evaluación de la Prop Firm?
- [ ] ¿El flujo transaccional permite la monetización paralela por suscripción recurrente y rebates de volumen?
- [ ] ¿Se utiliza Telegram como canal central de retención para Fase 1 y conversión a los retos de fondeo de Fase 2?
- [ ] ¿Los grupos de equipo cuentan con comandos colaborativos y aislamiento estricto de privacidad?

