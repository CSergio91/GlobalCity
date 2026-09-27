import type { Plugin, ViteDevServer } from 'vite';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

export interface TelegramAuthSession {
  nonce: string;
  telegramId: string | number;
  firstName: string;
  lastName?: string;
  username?: string;
  photoUrl?: string;
  authDate: number;
  authenticatedAt: string;
}

export function telegramAuthPlugin(): Plugin {
  return {
    name: 'globalcity-telegram-auth',
    configureServer(server: ViteDevServer) {
      const botToken = process.env.TELEGRAM_BOT_TOKEN || process.env.VITE_TELEGRAM_BOT_TOKEN || '';
      const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
      const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';

      const supabase = (supabaseUrl && supabaseKey) 
        ? createClient(supabaseUrl, supabaseKey) 
        : null;

      // Almacén en memoria de sesiones autorizadas
      const authenticatedSessions = new Map<string, TelegramAuthSession>();
      let latestAuthSession: TelegramAuthSession | null = null;
      let lastUpdateId = 0;
      let isPolling = false;

      // Enviar mensaje con botón al usuario en Telegram
      async function sendTelegramMessage(chatId: number | string, text: string, returnUrl?: string) {
        if (!botToken) return;
        try {
          const body: any = {
            chat_id: chatId,
            text,
            parse_mode: 'Markdown'
          };
          // Telegram rechaza URLs con protocolo http o localhost en inline_keyboard
          if (returnUrl && returnUrl.startsWith('https://')) {
            body.reply_markup = {
              inline_keyboard: [
                [
                  { text: '🚀 Abrir Global City Terminal', url: returnUrl }
                ]
              ]
            };
          }
          const res = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
          });
          const data = await res.json();
          if (!data.ok) {
            console.warn('[TelegramBot] Advertencia al enviar mensaje:', data.description);
            // Reintento sin reply_markup si fue error de URL
            if (body.reply_markup) {
              delete body.reply_markup;
              await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
              });
            }
          }
        } catch (err: any) {
          console.warn('[TelegramBot] No se pudo enviar mensaje:', err?.message || err);
        }
      }

      // Procesar comando /start
      async function handleTelegramMessage(msg: any) {
        if (!msg || !msg.text) return;
        const text = msg.text.trim();
        const from = msg.from;
        if (!from) return;

        if (text.startsWith('/start')) {
          const parts = text.split(' ');
          const nonce = parts[1] ? parts[1].trim() : '';
          const userId = from.id;
          const firstName = from.first_name || 'Trader';
          const lastName = from.last_name || '';
          const username = from.username ? `@${from.username}` : `@trader_${String(userId).slice(-4)}`;

          const sessionData: TelegramAuthSession = {
            nonce: nonce || `direct_${userId}_${Date.now()}`,
            telegramId: userId,
            firstName,
            lastName,
            username,
            authDate: msg.date || Math.floor(Date.now() / 1000),
            authenticatedAt: new Date().toISOString()
          };

          // 1. Guardar en memoria local
          if (nonce) {
            authenticatedSessions.set(nonce, sessionData);
          }
          authenticatedSessions.set(`user_${userId}`, sessionData);
          latestAuthSession = sessionData;

          // 2. Guardar en Supabase Cloud si está disponible
          if (supabase) {
            try {
              await supabase.from('telegram_auth_sessions').upsert({
                nonce: sessionData.nonce,
                status: 'authenticated',
                telegram_id: userId,
                first_name: firstName,
                last_name: lastName,
                username,
                auth_date: sessionData.authDate,
                authenticated_at: sessionData.authenticatedAt
              });
            } catch (err: any) {
              // Si la tabla aún no existe en Supabase, la sesión en memoria funciona igualmente
              console.warn('[Supabase] telegram_auth_sessions fallback:', err?.message || err);
            }
          }

          // 3. Responder al chat de Telegram con botón interactivo
          const host = server.config.server.host || 'localhost';
          const port = server.config.server.port || 3000;
          const hostHeader = typeof host === 'string' && host !== '0.0.0.0' ? host : 'localhost';
          const returnUrl = `http://${hostHeader}:${port}/?tg_auth=1&tg_id=${userId}&tg_user=${encodeURIComponent(username)}&tg_first=${encodeURIComponent(firstName)}${nonce ? `&tg_nonce=${nonce}` : ''}`;

          console.log(`[TelegramBot] ✅ Usuario autenticado: ${firstName} (${username}, ID: ${userId})`);

          await sendTelegramMessage(
            msg.chat.id,
            `🎯 *GLOBAL CITY TRADING OS — ACCESO AUTORIZADO*\n` +
            `━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
            `¡Hola *${firstName}*! Tu cuenta de Telegram ha sido verificada con éxito.\n\n` +
            `⚡ *ID de Operador:* \`${userId}\`\n` +
            `🛡️ *Nivel de Conexión:* Control Plane Verificado\n\n` +
            `Haz clic en el botón de abajo para acceder inmediatamente a la Sala de Operaciones:`,
            returnUrl
          );
        }
      }

      // Polling continuo y seguro de Telegram
      async function pollUpdates() {
        if (!botToken) return;
        isPolling = true;
        try {
          const res = await fetch(`https://api.telegram.org/bot${botToken}/getUpdates?timeout=15&offset=${lastUpdateId + 1}`);
          if (res.ok) {
            const data = await res.json();
            if (data.ok && Array.isArray(data.result)) {
              for (const update of data.result) {
                lastUpdateId = Math.max(lastUpdateId, update.update_id);
                if (update.message) {
                  await handleMessageSafe(update.message);
                }
              }
            }
          }
        } catch {
          // Breve pausa ante problemas de red
          await new Promise((r) => setTimeout(r, 2000));
        } finally {
          setTimeout(pollUpdates, 500);
        }
      }

      async function handleMessageSafe(msg: any) {
        try {
          await handleTelegramMessage(msg);
        } catch (e: any) {
          console.warn('[TelegramBot] Error al procesar mensaje:', e?.message || e);
        }
      }

      // Iniciar el listener de Telegram en segundo plano de Vite
      if (botToken) {
        console.log('[TelegramBot] 🚀 Iniciando listener de Telegram para Global City...');
        pollUpdates();
      }

      // Endpoint 1: Consultar estado de sesión por nonce
      server.middlewares.use('/api/auth/telegram-status', async (req, res) => {
        const url = new URL(req.url || '', `http://${req.headers.host || 'localhost'}`);
        const nonce = url.searchParams.get('nonce') || '';

        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Access-Control-Allow-Origin', '*');

        if (!nonce) {
          res.statusCode = 400;
          return res.end(JSON.stringify({ error: 'Nonce requerido' }));
        }

        // 1. Buscar en memoria
        const inMemory = authenticatedSessions.get(nonce);
        if (inMemory) {
          res.statusCode = 200;
          return res.end(JSON.stringify({
            authenticated: true,
            source: 'memory',
            user: {
              id: inMemory.telegramId,
              first_name: inMemory.firstName,
              last_name: inMemory.lastName,
              username: inMemory.username,
              photo_url: inMemory.photoUrl,
              auth_date: inMemory.authDate
            }
          }));
        }

        // 2. Si no está en memoria pero hay sesión reciente global (ej: start sin nonce)
        if (latestAuthSession && (Date.now() - new Date(latestAuthSession.authenticatedAt).getTime() < 300000)) {
          // Si el usuario acaba de pulsar /start en los últimos 5 minutos
          res.statusCode = 200;
          return res.end(JSON.stringify({
            authenticated: true,
            source: 'latest_recent',
            user: {
              id: latestAuthSession.telegramId,
              first_name: latestAuthSession.firstName,
              last_name: latestAuthSession.lastName,
              username: latestAuthSession.username,
              photo_url: latestAuthSession.photoUrl,
              auth_date: latestAuthSession.authDate
            }
          }));
        }

        // 3. Consultar en Supabase si está disponible
        if (supabase) {
          try {
            const { data } = await supabase
              .from('telegram_auth_sessions')
              .select('*')
              .eq('nonce', nonce)
              .maybeSingle();

            if (data && data.status === 'authenticated') {
              res.statusCode = 200;
              return res.end(JSON.stringify({
                authenticated: true,
                source: 'supabase',
                user: {
                  id: data.telegram_id,
                  first_name: data.first_name,
                  last_name: data.last_name,
                  username: data.username,
                  photo_url: data.photo_url,
                  auth_date: data.auth_date
                }
              }));
            }
          } catch {
            // Silencioso
          }
        }

        res.statusCode = 200;
        return res.end(JSON.stringify({ authenticated: false }));
      });

      // Endpoint 2: Obtener última autenticación registrada
      server.middlewares.use('/api/auth/telegram-latest', (_req, res) => {
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Access-Control-Allow-Origin', '*');

        if (latestAuthSession) {
          res.statusCode = 200;
          return res.end(JSON.stringify({
            authenticated: true,
            user: {
              id: latestAuthSession.telegramId,
              first_name: latestAuthSession.firstName,
              last_name: latestAuthSession.lastName,
              username: latestAuthSession.username,
              photo_url: latestAuthSession.photoUrl,
              auth_date: latestAuthSession.authDate
            }
          }));
        }

        res.statusCode = 200;
        return res.end(JSON.stringify({ authenticated: false }));
      });
    }
  };
}
