/**
 * ============================================================================
 * EKLIPSE FUNDED — INSTITUTIONAL API & WEBSOCKET GATEWAY CONFIGURATION
 * ============================================================================
 * Erradica URLs y puertos hardcodeados en el cliente.
 * Resuelve de forma limpia, determinista y escalable entre entornos:
 * 
 * 1. Producción (*.eklipsefunded.com):
 *    - API REST / HTTP   : https://api.eklipsefunded.com
 *    - WebSocket Gateway : wss://api.eklipsefunded.com/ws
 * 
 * 2. Desarrollo Local (localhost / 127.0.0.1):
 *    - API REST / HTTP   : http://localhost:8080 (o VITE_API_GATEWAY_URL)
 *    - WebSocket Gateway : ws://localhost:8080 (o VITE_WS_GATEWAY_URL)
 * 
 * 3. Red Local / LAN (ej. 192.168.x.x para móvil / tablet en WiFi de desarrollo):
 *    - API REST / HTTP   : http://${host}:8080
 *    - WebSocket Gateway : ws://${host}:8080
 * ============================================================================
 */

export function getApiBaseUrl(): string {
  // 1. Detección automática prioritaria en producción Cloudflare Edge (*.eklipsefunded.com)
  if (typeof window !== 'undefined') {
    const host = window.location.hostname.toLowerCase();
    if (host.endsWith('eklipsefunded.com')) {
      return 'https://api.eklipsefunded.com';
    }
  }

  // 2. Variable de entorno explícita (Vite)
  const envUrl = (import.meta as any).env?.VITE_API_GATEWAY_URL;
  if (envUrl && typeof envUrl === 'string' && envUrl.trim() !== '') {
    return envUrl.trim().replace(/\/+$/, '');
  }

  // 3. Detección en desarrollo local
  if (typeof window !== 'undefined') {
    const host = window.location.hostname.toLowerCase();
    const port = (import.meta as any).env?.VITE_BACKEND_PORT || '8088';
    if (host === 'localhost' || host === '127.0.0.1') {
      return `http://localhost:${port}`;
    }
    return `http://${host}:${port}`;
  }

  // 4. Fallback SSR / Node.js
  return 'http://localhost:8088';
}

export function getWsGatewayUrl(): string {
  // 1. Detección automática prioritaria en producción Cloudflare Edge (*.eklipsefunded.com o HTTPS)
  if (typeof window !== 'undefined') {
    const host = window.location.hostname.toLowerCase();
    if (host.endsWith('eklipsefunded.com')) {
      return 'wss://api.eklipsefunded.com/ws';
    }
  }

  // 2. Variable de entorno explícita (para pruebas locales o dev)
  const envWs = (import.meta as any).env?.VITE_WS_GATEWAY_URL;
  if (envWs && typeof envWs === 'string' && envWs.trim() !== '') {
    // Si estamos en HTTPS no podemos abrir ws:// inseguro
    if (typeof window !== 'undefined' && window.location.protocol === 'https:' && envWs.startsWith('ws://')) {
      return 'wss://api.eklipsefunded.com/ws';
    }
    return envWs.trim();
  }

  // 3. Detección automática en desarrollo local
  if (typeof window !== 'undefined') {
    const host = window.location.hostname.toLowerCase();
    const port = (import.meta as any).env?.VITE_BACKEND_PORT || '8088';
    if (host === 'localhost' || host === '127.0.0.1') {
      return `ws://localhost:${port}`;
    }
    return `ws://${host}:${port}`;
  }

  return 'ws://localhost:8088';
}

/**
 * Combina una ruta relativa con el dominio base canónico del entorno activo.
 * E.g.: apiEndpoint('/api/crm/account/reset') ->
 *   - Prod: https://api.eklipsefunded.com/api/crm/account/reset
 *   - Dev : http://localhost:8080/api/crm/account/reset
 */
export function apiEndpoint(path: string): string {
  const base = getApiBaseUrl();
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${base}${cleanPath}`;
}

/**
 * Cliente HTTP institucional unificado:
 * - Resuelve dinámicamente el gateway según entorno (Prod vs Dev).
 * - Asigna Content-Type JSON por defecto cuando hay body.
 * - Protegido con timeout por AbortController (evita peticiones colgadas).
 */
export async function apiFetch(
  path: string, 
  options: RequestInit = {}, 
  timeoutMs: number = 8000
): Promise<Response> {
  const url = apiEndpoint(path);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  const headers: Record<string, string> = {
    ...(options.headers as any)
  };

  if (options.body && typeof options.body === 'string' && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
      signal: controller.signal
    });
    return response;
  } finally {
    clearTimeout(timer);
  }
}
