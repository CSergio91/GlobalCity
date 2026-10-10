import { supabase } from './supabase';

/**
 * Eklipse Funded — OAuth Popup Lifecycle & Handshake Sentinel
 * 
 * Intercepta de forma ultra-rápida la ventana emergente de autenticación OAuth
 * (Google, Telegram, etc.) cuando es redirigida desde GoTrue/Google hacia el origen local o VPS.
 * 
 * Funcionalidad:
 * 1. Detecta si la ventana actual es el popup hijo (window.name === 'GoogleAuthPopup' o window.opener).
 * 2. Extrae de forma segura los tokens de acceso del hash (#access_token=...&refresh_token=...).
 * 3. Notifica a la ventana madre usando 3 canales redundantes que sobreviven al aislamiento COOP:
 *    - BroadcastChannel ('eklipse_auth_channel')
 *    - localStorage event ('eklipse_oauth_payload')
 *    - window.opener.postMessage (si COOP no lo desvinculó)
 * 4. Hidrata el cliente local de Supabase para almacenar la sesión en almacenamiento seguro.
 * 5. Cierra el popup automáticamente o despliega una micro-cápsula editorial de éxito
 *    para que nunca cargue la aplicación completa dentro del popup pequeño.
 */
export function initOAuthPopupHandshake(): boolean {
  if (typeof window === 'undefined') return false;

  const hash = window.location.hash || '';
  const search = window.location.search || '';
  const hasTokens = hash.includes('access_token') || hash.includes('refresh_token') || search.includes('code=');
  const isPopup = window.name === 'GoogleAuthPopup' || Boolean(window.opener);

  if (!hasTokens) return false;

  // Si tiene tokens pero NO es un popup (ej. redirección en ventana completa en móvil), dejamos que App se monte normalmente.
  if (!isPopup && !hash.includes('access_token')) return false;

  // Si es popup (o ventana con tokens explícitos de OAuth callback)
  if (isPopup) {
    const payload = {
      type: 'EKLIPSE_AUTH_SUCCESS',
      hash: hash,
      search: search,
      timestamp: Date.now()
    };

    // 1. Canal 1: BroadcastChannel (inmune a Cross-Origin-Opener-Policy)
    try {
      const bc = new BroadcastChannel('eklipse_auth_channel');
      bc.postMessage(payload);
      setTimeout(() => {
        try { bc.close(); } catch (_) {}
      }, 1000);
    } catch (_) {}

    // 2. Canal 2: LocalStorage Event (escuchado reactivamente por todas las pestañas del mismo origen)
    try {
      localStorage.setItem('eklipse_oauth_payload', JSON.stringify(payload));
      localStorage.setItem('eklipse_oauth_completed', String(Date.now()));
    } catch (_) {}

    // 3. Canal 3: Direct postMessage si window.opener sigue disponible
    try {
      if (window.opener) {
        window.opener.postMessage(payload, '*');
      }
    } catch (_) {}

    // 4. Hidratar Supabase con los tokens si están presentes
    try {
      supabase.auth.getSession().catch(() => {});
    } catch (_) {}

    // 5. Renderizar pantalla de cierre elegante antes de cerrar
    renderPopupCloseScreen();

    // 6. Intentar cierre automático
    setTimeout(() => {
      try {
        window.close();
      } catch (_) {}
    }, 250);

    return true;
  }

  return false;
}

/**
 * Renderiza una vista minimalista y refinada al estilo Eklipse Celestial
 * en caso de que el navegador restrinja el cierre programático automático de ventanas.
 */
function renderPopupCloseScreen() {
  try {
    const container = document.getElementById('root') || document.body;
    container.innerHTML = `
      <div style="
        min-height: 100vh;
        width: 100%;
        background-color: #06070B;
        color: #ffffff;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 24px;
        text-align: center;
        box-sizing: border-box;
      ">
        <div style="
          width: 56px;
          height: 56px;
          border-radius: 16px;
          background: rgba(16, 185, 129, 0.15);
          border: 1px solid rgba(16, 185, 129, 0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 16px;
          box-shadow: 0 0 25px rgba(16, 185, 129, 0.3);
        ">
          <svg style="width: 28px; height: 28px; color: #10B981;" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"></path>
          </svg>
        </div>

        <div style="
          font-size: 11px;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #F59E0B;
          font-family: monospace;
          font-weight: 700;
          margin-bottom: 6px;
        ">
          Eklipse Solar Gateway
        </div>

        <h2 style="
          font-size: 18px;
          font-weight: 800;
          margin: 0 0 8px 0;
          color: #ffffff;
        ">
          Autenticación Exitosa
        </h2>

        <p style="
          font-size: 12px;
          color: #94A3B8;
          margin: 0 0 20px 0;
          line-height: 1.5;
          max-width: 280px;
        ">
          Tu cuenta ha sido validada institucionalmente. Puedes cerrar esta ventana para volver a tu terminal.
        </p>

        <button 
          id="eklipse-close-btn"
          style="
            background: linear-gradient(135deg, #F59E0B, #D97706);
            color: #06070B;
            border: none;
            padding: 10px 24px;
            border-radius: 12px;
            font-size: 13px;
            font-weight: 700;
            font-family: monospace;
            cursor: pointer;
            box-shadow: 0 0 20px rgba(245, 158, 11, 0.3);
          "
        >
          Cerrar Ventana
        </button>
      </div>
    `;

    const btn = document.getElementById('eklipse-close-btn');
    if (btn) {
      btn.addEventListener('click', () => {
        try { window.close(); } catch (_) {}
      });
    }
  } catch (_) {}
}
