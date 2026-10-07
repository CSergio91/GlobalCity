---
name: zyti-trade-performance-asset-caching-and-zero-egress-governance
description: Gobernanza de optimización extrema de rendimiento web, caché inmutable por 1 año para assets estáticos, patrón Single-Fetch Bootstrap para bases de datos (1 sola petición inicial) y persistencia Local-First en IndexedDB para erradicar el consumo de egress.
version: 1.0.0
category: Web Performance & Zero-Egress Architecture
status: Authoritative
---

# ZYTI TRADE — PERFORMANCE, ASSET CACHING & ZERO-EGRESS GOVERNANCE

## 1. PRINCIPIO FUNDAMENTAL: ZERO-EGRESS & INSTANT LOAD (0ms)
En una terminal financiera de alta frecuencia, saturar la base de datos relacional con peticiones recurrentes es inaceptable por latencia y costo de ancho de banda (egress).
**Regla de Oro:** El cliente web debe cargar instantáneamente en 0 milisegundos desde almacenamiento local al recargar la página, realizando **CERO peticiones redundantes**.

---

## 2. POLÍTICA DE CACHÉ INMUTABLE DE ASSETS POR 1 AÑO (31,536,000s)
1. **Headers HTTP Inmutables:**
   Todos los recursos estáticos empaquetados por Vite (imágenes, scripts JS con hash de contenido, hojas de estilo CSS compiladas y fuentes WOFF2) deben servirse con:
   ```http
   Cache-Control: public, max-age=31536000, immutable
   ```
2. **Control por Content-Hashing:**
   Si un archivo cambia en un nuevo despliegue, su nombre cambia automáticamente (ej. `index-CjvxjnK5.js`), invalidando la versión previa sin necesidad de purgas manuales de CDN.
3. **Imágenes y Favicons Locales:**
   Los logos y tarjetas OpenGraph se almacenan en el navegador en caché persistente (Cache Storage / Service Worker), evitando re-descargas en cada visita.

---

## 3. PATRÓN "SINGLE-FETCH BOOTSTRAP" (1 SOLA PETICIÓN A BASE DE DATOS)
1. **Prohibición de Waterfall Queries:**
   Está terminantemente prohibido hacer múltiples peticiones en cadena:
   ❌ `GET /user` -> luego `GET /accounts` -> luego `GET /workspaces` -> luego `GET /preferences`.
2. **Endpoint Agregador Único:**
   Se utiliza una sola llamada unificada:
   ✅ `GET /api/v1/bootstrap` (o RPC de PostgreSQL `rpc('get_user_bootstrap')`).
   - Retorna en un solo payload comprimido con Brotli:
     - Perfil y permisos del usuario.
     - Cuentas de exchanges vinculadas y llaves públicas cifradas.
     - Workspaces de gráficos y estado de la terminal.
3. **Persistencia Local-First en IndexedDB:**
   - La respuesta del bootstrap se guarda en `IndexedDB` bajo la clave `zyti_session_snapshot`.
   - En aperturas subsecuentes, la aplicación monta la terminal **de inmediato desde IndexedDB en menos de 5ms**.
   - Solo se envía una cabecera `If-None-Match` con ETag para recibir un `304 Not Modified` (0 bytes consumidos) si no hubo cambios.

---

## 4. INGESTIÓN DE MERCADO SIN PETICIONES REST
- El streaming de precios (Binance, Bybit, OKX) se realiza exclusivamente vía **WebSockets nativos** con compresión de frames.
- Los gráficos cargan su historial inicial desde IndexedDB o buffers locales en memoria RAM (Redis en el servidor), **nunca** consultando tablas relacionales por velas históricas repetidas.
