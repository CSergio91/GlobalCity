---
name: video-upscaling-and-chroma-key-engine
description: "Motor integral de ingeniería para escalado de video a 4K UHD/2.5K QHD (Lanczos-4 + Unsharp Masking) y extracción profesional de fondo verde (Chroma Keying con Despill verde y bordes alfa suavizados) para plataformas web interactivas y canvas a 60 FPS."
version: "1.0.0"
category: "Multimedia Engineering & Computer Vision"
author: "EKLIPSE Multimedia & Computer Vision Architect"
status: "Authoritative"
---

# Video Upscaling & Chroma Key Engine: Manual Maestro de Ingeniería
### *Super-Resolución a 4K, Extracción de Fondo Verde (Chroma Key) y Optimización WebP para Canvas de Alto Rendimiento*

Este manual codifica los estándares de visión por computador, procesamiento de video y optimización web para:
1. **Escalar videos de 1080p a 4K UHD (3840×2160) y 2.5K QHD (2560×1440)** con preservación de aristas y micro-contraste.
2. **Remover fondos verdes (*Chroma Keying*)** de videos (como mascotas meme coin, avatares y elementos flotantes) con supresión de derrame verde (*green despill*) y canal alfa transparente RGBA limpio.
3. **Generar secuencias WebP ultra-optimizadas** para integración fluida en scroll canvas a 60 FPS con persistencia en `CacheStorage`.

---

## 1. Fundamentos Matemáticos de Escalado (Super-Resolución)

El simple escalado bilineal o bicúbico produce imágenes borrosas en pantallas de alta densidad (Retina, 4K, DPR >= 1.5). Para lograr un aspecto institucional nítido, se utiliza una tubería de 3 etapas:

### A. Interpolación Lanczos-4 (`cv2.INTER_LANCZOS4`)
Utiliza la función sinc truncada con ventana de Hann sobre un radio de 4 muestras (matriz de 8×8 píxeles):
$$Sinc(x) = \frac{\sin(\pi x)}{\pi x}$$
$$L(x) = \begin{cases} Sinc(x) \cdot Sinc(x/4) & \text{si } |x| < 4 \\ 0 & \text{en otro caso} \end{cases}$$
- **Ventaja:** Preserva frecuencias espaciales altas (estrellas, siluetas de edificios y horizontes) sin generar escalonamiento pixelado.

### B. Filtro de Realce de Micro-Contraste (Unsharp Masking - USM)
Para contrarrestar la pérdida inherente de definición de los sensores de cámara o compresión H.264 previa:
1. Se genera una versión gaussiana desenfocada: $G = \text{GaussianBlur}(I, \sigma=1.2 \dots 1.5)$.
2. Se pondera la diferencia:
   $$\text{Enhanced} = \text{clamp}(I \cdot (1 + \alpha) - G \cdot \alpha, 0, 255)$$
   Donde $\alpha \in [0.25, 0.45]$. Esto intensifica los detalles de aristas sin introducir ruido en áreas oscuras o cielo.

---

## 2. Motor de Chroma Keying Profesional (Extracción de Fondo Verde)

Un mal recorte de croma deja halos verdes y bordes duros. El motor implementa una técnica de 4 pasos:

### A. Segmentación en Espacio de Color HSV
El espacio RGB es sensible a la iluminación y sombras. En HSV (Matiz, Saturación, Valor), el verde se aísla con independencia del brillo:
- **Hue (Matiz):** Rango típico $[35^\circ, 85^\circ]$ en OpenCV ($[0, 179]$).
- **Saturation (Saturación):** Mínimo $\ge 50$ para no confundir blancos o grises neutros.
- **Value (Brillo):** Mínimo $\ge 50$ para no confundir negros o sombras profundas.

### B. Supresión de Derrame Verde (*Green Despill / Spill Suppression*)
El fondo verde refleja luz sobre el personaje (pelaje, bordes, ropa). Para neutralizarlo en los píxeles semi-transparentes o perimetrales:
```python
# Despill por promedio ponderado de canales Azul y Rojo
g = frame[:, :, 1]
b = frame[:, :, 0]
r = frame[:, :, 2]
max_rb = np.maximum(r, b)
# Si el verde excede el máximo de R y B, se recorta suavemente
despilled_g = np.where(g > max_rb, (r * 0.5 + b * 0.5).astype(np.uint8), g)
frame[:, :, 1] = despilled_g
```

### C. Suavizado de Máscara Alfa (Anti-Aliased Feathering)
1. Dilatación morfológica ligera de 1-2 píxeles (`cv2.morphologyEx`) para eliminar ruido de fondo.
2. Desenfoque gaussiano suave ($\sigma=1.0 \dots 1.5$) sobre el canal alfa para crear una transición sub-píxel imperceptible.
3. El resultado es una imagen **RGBA de 4 canales** con alfa limpio.

---

## 3. Formatos de Salida y Rendimiento Web

| Formato | Uso Recomendado | Ventajas | Consideraciones |
| :--- | :--- | :--- | :--- |
| **MP4 4K (`hero_4k.mp4`)** | Reproducción directa en video players / background video | Compatibilidad universal | No tiene transparencia |
| **WebP Secuencia (`frame_%03d.webp`)** | Scroll Canvas interactivo con scrubbing de fotogramas | Carga no bloqueante, 60 FPS, CacheStorage persistente | Requiere un canvas HTML5 |
| **WebP Transparente RGBA** | Overlays de Pepe / personajes flotantes sobre el Hero | Canal alfa real, 70% menos peso que PNG | Perfecto para superponer sobre el eclipse |

---

## 4. Scripts Automatizados Disponibles

La carpeta `scripts/` de esta skill proporciona herramientas listas para ejecutar:

1. **`upscale_video_4k.py`**:
   - Escala un video a 4K UHD (3840×2160) o 2.5K QHD con Lanczos-4 y Unsharp Masking.
   - Genera el video MP4 listo para previsualización.
2. **`chroma_key_extractor.py`**:
   - Extrae el fondo verde de cualquier video con despill y máscara alfa suave.
   - Exporta secuencias WebP transparentes o WebP animado listo para React.
3. **`extract_sequence_webp.py`**:
   - Extrae fotogramas en WebP 4K/2K optimizados para el componente `HeroScrollCanvas`.

---

## 5. Parámetros Estándar de Ejecución

- **Resolución 4K UHD:** `3840 x 2160` píxeles.
- **Resolución 2.5K QHD:** `2560 x 1440` píxeles.
- **Calidad WebP recomendada:** `quality=85, method=6` (balance óptimo nitidez/peso).
- **Tolerancia Chroma Key HSV:**
  - `lower_bound = np.array([35, 60, 60])`
  - `upper_bound = np.array([85, 255, 255])`
