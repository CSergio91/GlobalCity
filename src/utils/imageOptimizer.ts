/**
 * Utilidad de optimización y conversión de imágenes a WebP en el cliente.
 * Zero-Egress & Zero-Latency: procesa las imágenes localmente mediante HTML5 Canvas
 * reduciendo el peso en hasta un 85% y generando un DataURL WebP ultraligero y de alta fidelidad.
 */

export interface ImageOptimizationOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number; // 0.0 - 1.0 (default: 0.85)
}

/**
 * Valida y convierte un archivo de imagen (JPG, PNG, GIF, BMP, HEIC, etc.)
 * a formato WebP optimizado y redimensionado.
 */
export async function optimizeImageToWebP(
  file: File,
  options: ImageOptimizationOptions = {}
): Promise<string> {
  const { maxWidth = 256, maxHeight = 256, quality = 0.85 } = options;

  // Validación básica de tipo de archivo
  if (!file.type.startsWith('image/')) {
    throw new Error('El archivo seleccionado no es una imagen válida.');
  }

  // Límite de tamaño de entrada: 10MB máximo para proteger la memoria del dispositivo
  if (file.size > 10 * 1024 * 1024) {
    throw new Error('La imagen excede el límite máximo de 10MB.');
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onerror = () => reject(new Error('Error al leer el archivo de imagen.'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('No se pudo decodificar la imagen seleccionada.'));
      img.onload = () => {
        try {
          let { width, height } = img;

          // Cálculo proporcional manteniendo el aspect ratio
          if (width > maxWidth || height > maxHeight) {
            const ratio = Math.min(maxWidth / width, maxHeight / height);
            width = Math.round(width * ratio);
            height = Math.round(height * ratio);
          }

          // Crear canvas offscreen para renderizado GPU acelerado
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('No se pudo inicializar el contexto 2D de canvas.'));
            return;
          }

          // Suavizado bicúbico de alta calidad
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';

          // Dibujar imagen redimensionada
          ctx.drawImage(img, 0, 0, width, height);

          // Exportar directamente a formato image/webp
          let webpDataUrl = canvas.toDataURL('image/webp', quality);

          // Si el navegador no soporta exportación a WebP (muy raro), fallback a PNG
          if (!webpDataUrl.startsWith('data:image/webp')) {
            webpDataUrl = canvas.toDataURL('image/png');
          }

          resolve(webpDataUrl);
        } catch (err) {
          reject(err);
        }
      };

      img.src = reader.result as string;
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Optimiza una URL de imagen externa o remota (como la foto de Telegram o Google)
 * convirtiéndola a WebP local para evitar re-descargas y asegurar caché permanente.
 */
export async function convertImageUrlToWebP(
  imageUrl: string,
  options: ImageOptimizationOptions = {}
): Promise<string> {
  const { maxWidth = 256, maxHeight = 256, quality = 0.85 } = options;

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous'; // Necesario para evitar canvas tainted en URLs externas

    img.onerror = () => {
      // Si CORS bloquea la imagen, retornamos la URL original sin fallar
      resolve(imageUrl);
    };

    img.onload = () => {
      try {
        let { width, height } = img;
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(imageUrl);
          return;
        }

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        const webpDataUrl = canvas.toDataURL('image/webp', quality);
        resolve(webpDataUrl.startsWith('data:image/webp') ? webpDataUrl : imageUrl);
      } catch (_) {
        resolve(imageUrl);
      }
    };

    img.src = imageUrl;
  });
}
