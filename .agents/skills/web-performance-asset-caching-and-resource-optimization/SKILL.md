---
name: web-performance-asset-caching-and-resource-optimization
description: "Estándar de optimización extrema de rendimiento web, políticas de caché inmutable a 1 año (HTTP 31536000s), Service Worker CacheStorage, decodificación asíncrona de imágenes, minimización de peticiones y aceleración por GPU para Global City."
version: "1.0.0"
category: "Web Performance & Resource Engineering"
author: "AI Studio Fintech Systems Architect"
status: "Mandatory Operational Standard"
---

# Global City: Web Performance, Asset Caching & Resource Optimization

Esta especificación codifica la **arquitectura obligatoria de alto rendimiento, compresión de recursos y políticas de caché inmutable** para todas las vistas, componentes y servicios de **Global City**.

El objetivo es garantizar tiempos de carga sub-segundo (< 400ms), puntuación de 98+ en Core Web Vitals (LCP, FID/INP, CLS = 0), y **cero descargas redundantes de imágenes o assets estáticos**.

---

## 1. Principio Fundamental: "Descargar una sola vez, servir desde caché para siempre"

Todo recurso estático que forme parte del bundle o de los assets visuales debe regirse por la regla de **Caché Inmutable de 1 Año**:

### A. Cabeceras HTTP de Servidor (Nginx / Hostinger / Cloudflare / Vite Preview)
```http
# Para todos los assets versionados con hash (JS, CSS, imágenes, fuentes)
Cache-Control: public, max-age=31536000, immutable
X-Content-Type-Options: nosniff

# Para index.html y rutas SPA (debe revalidar para desplegar nuevas versiones)
Cache-Control: no-cache, no-store, must-revalidate
```

### B. Hash Inmutable en Nombres de Archivo
Vite compila automáticamente los archivos con hash de contenido (ej. `global_city_night_skyline-DPre6usf.jpg`).
- Si el archivo no cambia, el navegador **NUNCA** lo vuelve a solicitar a la red durante 365 días.
- Si el archivo se actualiza, el hash cambia automáticamente forzando la actualización instantánea sin problemas de caché obsoleto (*cache busting*).

---

## 2. Estrategia de Caché en Cliente (Service Worker & CacheStorage)

Para imágenes de fondo pesadas y fuentes tipográficas:
1. **Interceptación de Peticiones:** El Service Worker almacena en `CacheStorage` bajo la clave `globalcity-assets-v1` cualquier imagen que se solicite.
2. **Estrategia Cache-First:**
   - Si la imagen existe en `CacheStorage`, se entrega en **0ms** desde memoria RAM/disco local sin consultar la red.
   - Si no existe, se descarga una única vez, se almacena en el caché local del navegador y se sirve.

---

## 3. Optimización de Imágenes y Gráficos

### A. Reglas de Carga en Elementos `<img>` y Fondos CSS
1. **Decodificación Asíncrona:** Toda imagen debe incluir `decoding="async"` para evitar congelar el hilo principal de JavaScript (*main thread*) mientras se descomprime.
2. **Priorización LCP:**
   - La imagen del Hero / Login debe tener `fetchpriority="high"`.
   - Las imágenes secundarias o fuera de la vista inicial (*below the fold*) deben incluir `loading="lazy"`.
3. **SVGs para Divisores y Elementos Decorativos:**
   - Las ondas, curvas y festoneados orgánicos **NUNCA deben ser archivos de imagen rasterizados (PNG/JPG)**.
   - Deben ser **SVGs vectoriales inline** renderizados directamente en el DOM:
     - 0 peticiones de red adicionales (0 bytes transferidos en HTTP).
     - Escalabilidad infinita a cualquier resolución de pantalla (Retina / 4K).
     - Animación GPU fluida a 60fps con puro CSS.

---

## 4. Animaciones Ligeras y Aceleración por GPU

### A. Regla de Oro de Rendimiento en CSS: "Transform & Opacity Only"
Para evitar recalcular el diseño (*reflow/relayout*) o repintar píxeles pesados (*repaint*):
- **PROHIBIDO:** Animar `width`, `height`, `top`, `left`, `margin`, `padding`, `filter: blur()`.
- **PERMITIDO:** Animar exclusivamente `transform: translate3d(...)`, `transform: scale(...)`, `transform: rotate(...)` y `opacity`.

### B. Promoción a Capa de Composición por Hardware
Para que las ondas animadas y transiciones no consuman CPU:
```css
.animated-wave {
  will-change: transform;
  transform: translateZ(0); /* Forzar aceleración GPU */
}
```

---

## 5. Diseño Responsivo "At-a-Glance" (Mobile First)

En pantallas móviles (< 640px):
- **Cero muros de texto:** Máximo 1-2 líneas de titular y 1 línea de subtítulo.
- **Altura compacta:** La tarjeta de autenticación debe caber en el *viewport* estándar (100dvh) sin obligar al usuario a hacer scroll infinito para encontrar los botones de acción.
- **Divisor visual proporcional:** La cabecera visual ocupa entre el 28% y 33% de la altura total en móvil, dejando el 67% para la interacción limpia de los inputs y botones de acceso.

---

## 6. Checklist de Auditoría para Nuevos Componentes
- [ ] ¿Los assets estáticos tienen hash inmutable?
- [ ] ¿Los divisores y curvas están en SVG inline?
- [ ] ¿Las animaciones corren exclusivamente sobre `transform` y `opacity`?
- [ ] ¿Las imágenes pesadas tienen `decoding="async"` y dimensiones explícitas?
- [ ] ¿En móvil todos los controles principales son visibles sin scroll?
- [ ] ¿El bundle JS principal se mantiene < 150kB comprimido (gzip)?
