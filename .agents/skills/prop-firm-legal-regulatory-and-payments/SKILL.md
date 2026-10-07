---
name: prop-firm-legal-regulatory-and-payments
description: "Marco legal, regulatorio, fiscal, estructura societaria dual y pasarelas de pago de alto riesgo (MiCA, CFTC vs MFF, contratos B2B W-8BEN, mitigación de contracargos Visa VAMP / Mastercard ECP)."
version: "2.0.0"
category: "Fintech Legal, Compliance & Payment Operations"
author: "AI Studio Fintech Systems Architect"
status: "Production Ready / Institutional Standard"
---

# Prop Firm Legal, Regulatory, Corporate Structuring & Payment Systems

Esta skill proporciona el marco de blindaje legal, regulatorio, fiscal y de pagos para operar una empresa de fondeo (*Prop Trading Firm*) con cumplimiento normativo riguroso y resiliencia bancaria.

---

## 1. Dicotomía Jurídica Fundamental: Educación vs. Intermediación Financiera

Para evitar incurrir en infracciones por prestación no autorizada de servicios de inversión sujetos a reserva de actividad (MiFID II en la UE o normativas de la CFTC/NFA en EE. UU.):

| Dimensión | Fase de Evaluación (Demo Challenge) | Fase Fondeada (Funded / Real Account) |
| :--- | :--- | :--- |
| **Vínculo Jurídico** | Términos y Condiciones de **Licencia de Software Educativo**. | **Contrato Mercantil de Prestación de Servicios Profesionales Independientes** (*Independent Contractor Agreement*). |
| **Objeto de la Transacción** | Venta de acceso temporal a una plataforma de simulación y herramientas analíticas. | Honorarios variables (*performance fee*) abonados al operador por su pericia técnica en la gestión del capital corporativo. |
| **Tratamiento Contable de Entrada** | Venta de producto digital (SaaS / Educación) con facturación comercial estándar. | **Inexistente:** El operador no realiza ningún depósito de capital. Los fondos pertenecen en todo momento a la firma. |
| **Canalización Fiscal de Salida** | Ninguna (no procede liquidación de beneficios). | Gasto operativo deducible para la empresa en concepto de honorarios profesionales por servicios B2B recibidos. |

---

## 2. Estructura Societaria Dual (Segregación de Riesgos)

Para aislar el capital operativo de la firma de las contingencias comerciales de consumo y disputas bancarias, se implementa una arquitectura corporativa en dos entidades:

```
┌────────────────────────────────────────────────────────┐
│     SOCIEDAD COMERCIALIZADORA (Commercial Entity)      │
│  • Constituida en jurisdicción con banca comercial     │
│  • Titular de la web, dominios y marca comercial       │
│  • Suscribe contratos con adquirentes y pasarelas      │
│  • Factura retos educativos a los clientes minoristas  │
│  • Absorbe contracargos y reclamaciones de consumo     │
└──────────────────────────┬─────────────────────────────┘
                           │
       Acuerdo de Servicios Intersocietarios (Licencia & Liquidez)
                           │
                           ▼
┌────────────────────────────────────────────────────────┐
│     SOCIEDAD GESTORA DE TESORERÍA (Treasury Entity)    │
│  • Constituida en jurisdicción pro-fintech/cripto      │
│  • Titular legal de cuentas institucionales (CEX/DEX)  │
│  • Custodia del capital colateral y cobro de rebates   │
│  • Suscribe contratos B2B con traders aprobados        │
│  • Recaba formularios fiscales W-8BEN / W-9            │
└────────────────────────────────────────────────────────┘
```

---

## 3. Análisis Forense: Lecciones del Caso CFTC vs. My Forex Funds (2023–2025)

El caso de *Traders Global Group Inc.* sentó la jurisprudencia y el manual de lo que los reguladores globales persiguen formalmente:

### Las Tres Prácticas Perseguidas como Fraude Financiero
1. **Falseamiento de Contraparte y Conflicto de Interés:** Vender públicamente que el éxito del trader enriquece a la firma porque se opera en mercados reales, cuando en realidad se les mantenía en un servidor demo simulado donde la firma monetizaba el 100% de las pérdidas (*B-Book encubierto*).
2. **Manipulación Algorítmica del Servidor de Ejecución:** Instalación deliberada de plugins en terminales para inyectar deslizamientos asimétricos (*manipulated slippage*), ampliación artificial del spread y retrasos premeditados (*fill delays*) para forzar la vulneración del límite de pérdida máxima.
3. **Estructura Financiera Tipo Esquema Ponzi:** Abonar las ganancias de los usuarios rentables exclusivamente con el flujo de entrada de nuevas cuotas de evaluación y reinicios (*resets*), al carecer de ingresos genuinos de mercado.

> **Importante para la arquitectura:** Aunque el caso fue desestimado con perjuicio en mayo de 2025 debido a mala conducta procesal de la fiscalía de la CFTC, los principios sustantivos siguen rigiendo las inspecciones de la CNMV, BaFin, Consob y ESMA. **La ejecución real y verificable en libros de órdenes de exchanges es el único antídoto estructural.**

---

## 4. Marco Regulatorio Cripto: MiCA y Travel Rule

- **Reglamento MiCA (UE 2023/1114):** Las firmas deben evitar actuar como intermediarios de custodia de clientes. El uso de cuentas institucionales propias donde el trader no deposita capital evita la catalogación forzosa como *CASP (Crypto-Asset Service Provider)*.
- **Reglamento de Transferencia de Fondos (TFR - UE 2023/1113 / Travel Rule):**
  - Cualquier liquidación de beneficios en stablecoins (USDT, USDC) debe recopilar y validar la identidad del titular de la billetera receptora.
  - Se prohíben pagos a direcciones de origen anónimo o billeteras mezcladoras (*mixers*).

---

## 5. Fiscalidad Transfronteriza: Formularios W-8BEN, W-9 y Facturación B2B

Dado que el operador no invierte su propio capital, **sus ingresos no constituyen ganancias patrimoniales de capital**.

```
[ Aprobación de Reto ] ──► [ Firma de Contrato B2B ] ──► [ Validación W-8BEN / W-9 ] ──► [ Liquidación de Honorarios ]
```

- **Operadores Residentes en EE. UU.:** Se exige el **Formulario W-9**. La firma emite al cierre del ejercicio el modelo **1099-NEC** (*Nonemployee Compensation*).
- **Operadores Internacionales (No EE. UU.):** Se exige el **Formulario W-8BEN** (personas físicas) o **W-8BEN-E** (entidades). Aplica exención de la retención en origen del 30% bajo convenios de doble imposición.
- **Tributación en Europa (ej. España):** El operador factura sus servicios como profesional independiente sujeto a IRPF/IVA según las reglas de localización territorial de servicios.

---

## 6. Cuellos de Botella en Pagos y Prevención de Contracargos

Las cuotas de prop trading son clasificadas por los bancos adquirentes dentro de códigos mercantiles de alto riesgo (*High-Risk MCC*).

### Umbrales Críticos de las Redes de Tarjetas
1. **Visa Acquirer Monitoring Program (VAMP):**
   - Límite de supervisión global: **1,5%** de contracargos/ventas.
   - Alerta temprana automática: **0,9%** de disputas en transacciones 3DS.
2. **Mastercard Excessive Chargeback Program (ECP / ECM):**
   - Nivel ECM: **1,5% a 2,99%** de ratio de contracargos con más de 100 eventos mensuales.
   - Nivel Crítico HECM: $> 3,0\%$ con multas directas y revocación de terminales (*MID termination*).

### Estrategia de Mitigación Multipasarela
```
                                 [ Usuario Compra Reto ]
                                            │
                        ┌───────────────────┴───────────────────┐
                        ▼                                       ▼
            [ Pasarela Cripto (Prioritaria) ]      [ Orquestador Fiat Alto Riesgo ]
            • NOWPayments / CPAY                   • Praxis / BridgerPay / PayRetailers
            • Coste: 0,5% a 1,0%                   • Balanceo entre múltiples adquirentes
            • 0% Contracargos (Irreversible)       • Obligatoriedad de 3D Secure v2
            • Cero reservas retenidas              • Detección de fraude y geobloqueo
```

### Protocolo de Evidencia para Disputas Bancarias
Ante cualquier intento de contracargo fraudulento (*friendly fraud*), el sistema debe consolidar automáticamente un expediente de defensa:
1. Registro de autenticación biométrica 3D-Secure con timestamp.
2. Dirección IP, geolocalización y huella de dispositivo (*fingerprint*).
3. Confirmación firmada de aceptación de Términos y Condiciones y política de no reembolso tras el inicio de la simulación.
4. Historial completo de logs de órdenes emitidas por el usuario en la plataforma.

---

## 7. Notificaciones de Cumplimiento, KYC y Liquidaciones B2B en Telegram

El Telegram Bot actúa como canal seguro y directo para la relación contractual y pagos mercantiles:

1. **Notificación de Aprobación de KYC y Contrato B2B (Privado):**
   - Cuando el operador supera la verificación de identidad (Sumsub/Persona) y se valida su W-8BEN/W-9:
     ```text
     ⚖️ CONTRATO MERCANTIL VALIDADO · GLOBAL CITY
     Operador: Carlos Sergio · ID Fiscal Validado
     Régimen: Prestación de Servicios de Análisis Cuantitativo B2B
     Estado: Habilitado para liquidaciones de beneficio (Profit Split 80/20).
     ```
2. **Notificación de Liquidación de Beneficios (Payout):**
   - Al ejecutarse la transferencia cripto (USDT TRC20/ERC20) o bancaria tras la solicitud de retiro aprobada:
     ```text
     💸 LIQUIDACIÓN B2B EMITIDA CON ÉXITO
     Importe: $3,850.00 USDT (80% Profit Split)
     Hash Tx: 0x7a89f...b291 (Verificado en Blockchain)
     Factura Mercantil adjunta generada en tu perfil.
     ```
3. **Alerta de Seguridad Financiera (Canal de Compliance de Equipo):**
   - Notificación de alerta temprana si una transacción con tarjeta es marcada por sospecha de contracargo, disparando la generación automática del expediente de defensa 3D Secure.

---

## 8. Checklist de Verificación para Agentes de IA

- [ ] ¿El portal presenta los retos como licencias de software y simuladores analíticos, sin promesas de retornos garantizados?
- [ ] ¿Se exige la firma digital del contrato mercantil B2B y el formulario W-8BEN/W-9 antes de emitir cualquier pago de beneficio?
- [ ] ¿Los fondos de clientes están formalmente segregados de la cuenta comercializadora?
- [ ] ¿El orquestador de pagos fuerza 3D Secure en todas las transacciones con tarjeta para cumplir los límites de Visa VAMP y Mastercard ECP?
- [ ] ¿Se envían confirmaciones criptográficas de liquidación B2B y estado de contratos a través del bot de Telegram?
- [ ] ¿El canal de Compliance recibe alertas instantáneas de contracargos con generación automática de pruebas forenses?

