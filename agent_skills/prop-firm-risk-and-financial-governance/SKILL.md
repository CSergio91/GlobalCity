---
name: prop-firm-risk-and-financial-governance
description: "Modelado financiero, unit economics, gobernanza de reservas de tesorería (regla de ratio >= 2.0) y parametrización de reglas de riesgo de trading (EOD Drawdown, consistencia del 40%, microscalping, anti-hedging)."
version: "2.0.0"
category: "Fintech Financial Engineering & Risk Governance"
author: "AI Studio Fintech Systems Architect"
status: "Production Ready / Institutional Standard"
---

# Prop Firm Risk & Financial Governance (Unit Economics, Solvency & Trading Rules)

Esta skill proporciona las matemáticas financieras, las reglas de gobernanza patrimonial y la parametrización analítica del motor de riesgo para garantizar la viabilidad a largo plazo de una empresa de fondeo (*Prop Trading Firm*).

---

## 1. Economía Unitaria (Unit Economics) de Referencia

Modelo económico estandarizado sobre una cohorte proyectada de **1.000 evaluaciones vendidas**:

| Concepto Financiero | Parámetros de Modelado | Impacto Contable |
| :--- | :--- | :--- |
| **Ingresos por Evaluaciones** | 1.000 retos $\times$ precio medio de 110 € | **+110.000 €** |
| **Ingresos por Reinicios (Resets)** | 880 reprobados $\times$ 35% tasa de reintento $\times$ 110 € | **+33.880 €** |
| **Total Ingresos Brutos Operativos** | Sumatorio de ventas y reincorporaciones | **+143.880 €** |
| **Costes de Adquisición Digital (CAC)** | 1.000 compras $\times$ CAC medio de 28 € | **-28.000 €** |
| **Comisiones a Canales de Afiliación** | 20% liquidado sobre facturación de retos | **-28.776 €** |
| **Procesamiento de Cobros y Contracargos** | Tasa media combinada del 5,5% (adquirencia y reservas) | **-7.913 €** |
| **Servicios Cloud, Nodos y Conectividad** | Servidores, APIs institucionales y datos | **-9.000 €** |
| **Pagos Liquidados a Traders Rentables** | $1.000 \times 12\%\text{ pasan} \times 30\%\text{ cobran} \times 700\text{ € pago (80/20)}$ | **-20.160 €** |
| **Margen de Contribución Neto Consolidado** | Resultado operativo neto de la cohorte | **+50.031 € (34,8%)** |

### Supuestos Clave del Modelo
- **Tasa de Aprobación de Evaluaciones:** 12%.
- **Tasa de Traders Fondeados que Alcanzan Cobro Efectivo:** 30%.
- **Pago Medio Solicitado por Trader Exitoso:** 700 € (con reparto 80/20 a favor del trader).
- **Tasa de Reintentos de Reprobados:** 35%.

---

## 2. Umbral de Rentabilidad (Break-Even) y Escenarios

El punto de equilibrio operativo (*break-even*) se sitúa en torno a **370 evaluaciones vendidas al mes**:

```
[ < 370 evaluaciones/mes ] ──► Déficit operativo mensual (Consumo de caja)
[ = 370 evaluaciones/mes ] ──► Equilibrio exacto (Break-Even Operativo)
[ > 370 evaluaciones/mes ] ──► Beneficio operativo neto compuesto
```

### Tabla de Sensibilidad por Escenarios
| Métrica | Escenario Pesimista | Escenario Base | Escenario Optimista |
| :--- | :--- | :--- | :--- |
| **Evaluaciones / Mes** | 150 retos | 500 retos | 1.500 retos |
| **Ingresos Brutos** | 21.600 € | 71.900 € | 215.800 € |
| **Costes Variables** | 15.900 € | 51.900 € | 152.100 € |
| **Costes Fijos** | 11.000 € | 14.000 € | 22.000 € |
| **Resultado Mensual** | **-5.300 €** | **+6.000 €** | **+41.700 €** |

---

## 3. Asignación del Fondo de Caja Inicial (145.000 € para 12 Meses)

El factor que destruye empresas en este sector es el **descalce temporal de tesorería** (*payout cliff*): pagar ganancias antes de que el flujo de nuevas cuotas madure.

```
┌────────────────────────────────────────────────────────┐
│               TOTAL CAJA: 145.000 € (100%)             │
├────────────────────────────┬───────────────────────────┤
│ Colchón Operativo (6 meses)│ 60.000 € (41%)            │
│ Reserva Intocable de Pagos │ 40.000 € (28%)            │
│ Marketing de Lanzamiento   │ 25.000 € (17%)            │
│ Estructuración Legal/Fiscal│ 12.000 € (8%)             │
│ Tecnología & Setup Inicial │  8.000 € (6%)             │
└────────────────────────────┴───────────────────────────┘
```

---

## 4. Regla de Gobierno Financiero Inquebrantable (Ratio de Cobertura $\ge 2,0$)

La dirección de la firma y los sistemas automáticos deben vigilar permanentemente el cociente de solvencia:

$$\text{Ratio de Cobertura de Pagos} = \frac{R_{\text{disp}}}{P_{\text{comp}}} \ge 2,0$$

Donde:
- $R_{\text{disp}}$: Reservas líquidas inmovilizadas en cuentas bancarias segregadas o carteras corporativas en stablecoins de alta solvencia (USDC/USDT).
- $P_{\text{comp}}$: Importe total de liquidaciones devengadas pendientes de desembolso efectivo.

### Protocolo de Alerta Temprana y Parada Automática
- **Si $\text{Ratio} \ge 2,0$:** Operativa estándar. Escalamiento de campañas de marketing.
- **Si $1,5 \le \text{Ratio} < 2,0$:** Alerta nivel amarillo. Reducción del 50% en gasto publicitario y revisión manual de cohortes.
- **Si $\text{Ratio} < 1,5$:** **PARADA DE EMERGENCIA.**
  1. Congelación inmediata del presupuesto publicitario.
  2. Suspensión de la emisión de nuevas cuentas fondeadas.
  3. Todo flujo entrante se desvía exclusivamente a satisfacer los pagos comprometidos con los operadores.

---

## 5. Parametrización Matemática de Reglas de Trading

### A. End-of-Day (EOD) Drawdown vs. Intraday Trailing Drawdown
- **Intraday Trailing (Tradicional y Friccional):** Calcula la pérdida siguiendo el pico flotante no realizado de cada tick. Si una posición sube $+3.000\$$ y retrocede a $+1.500\$$, penaliza al operador con $1.500\$$ de drawdown.
- **End-of-Day Trailing (Estándar Moderno de Alta Conversión):**
  Calcula el drawdown exclusivamente contra el balance cerrado al final de la sesión operativa (16:45–17:00 EST o corte 00:00 UTC):
  $$\text{Drawdown Floor}_{T} = \max(\text{Drawdown Floor}_{T-1}, \text{Balance Cerrado}_T - \text{Trailing Max})$$

### B. Regla de Consistencia del 40% (Anti-Overleveraging)
Impide que un trader pase una evaluación o solicite retiros gracias a una sola operación de suerte con apalancamiento extremo:
$$\frac{\text{Ganancia de la Mejor Jornada}}{\text{Beneficio Bruto Total Acumulado en el Ciclo}} \le 0,40$$
*Ejemplo:* Si un trader gana $2.000\$$ en un anuncio del FOMC, para poder tramitar su retiro debe acumular un mínimo de:
$$\text{Beneficio Mínimo Requerido} = \frac{2.000\$}{0,40} = 5.000\$$
distribuido consistentemente a lo largo de varias sesiones.

### C. Restricción de Microscalping (< 10 segundos)
- Ninguna cuenta puede obtener más del 50% de sus ganancias de transacciones abiertas y cerradas en menos de 10 segundos.
- *Propósito:* Eliminar arbitrajes de latencia tóxica que explotan demoras entre el motor simulador y el mercado real.

### D. Prohibición de Anti-Hedging y Reverse Hedging
- Prohibido abrir posiciones simultáneas en sentido contrario sobre el mismo activo o activos fuertemente correlacionados (ej. Largo en S&P 500 y Corto en Nasdaq 100).
- Detección de cuentas coordinadas mediante:
  - *Device Fingerprinting* (huella de navegador y hardware).
  - *IP Clustering* y coincidencia en milisegundos de envío de órdenes.

---

## 6. Checklist de Verificación para Agentes de IA

- [ ] ¿El sistema calcula el ratio de solvencia de forma continua y alerta si desciende de 2.0?
- [ ] ¿El motor de riesgo implementa la fórmula EOD sin penalizar el flotante intradía en las cuentas configuradas con esta modalidad?
- [ ] ¿La regla de consistencia del 40% valida de forma determinista la distribución de beneficios antes de permitir una solicitud de retiro?
- [ ] ¿Se detectan y rechazan operaciones de microscalping inferiores a 10 segundos?
