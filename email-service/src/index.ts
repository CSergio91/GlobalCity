import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import Redis from 'ioredis';
import { handleWelcome } from './handlers/welcomeHandler';
import { handleNewAccount } from './handlers/newAccountHandler';
import { handleBreach } from './handlers/breachHandler';
import { handlePaused } from './handlers/pausedHandler';
import { handleReseted } from './handlers/resetedHandler';
import { handlePasswordReset } from './handlers/passwordResetHandler';
import { handleNeedSupport } from './handlers/needSupportHandler';
import { handlePassed } from './handlers/passedHandler';
import { handlePayoutRequested, handlePayoutApproved, handlePayoutRejected } from './handlers/payoutHandler';

const PORT = process.env.PORT || 3005;
const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';
const EMAIL_CHANNEL = 'eklipse:email:events';

// ============================================================================
// ROUTER DE EVENTOS
// ============================================================================
async function routeEmailEvent(type: string, data: any) {
  console.info(`[EmailService] Procesando evento de correo: ${type} -> ${data.toEmail}`);
  switch (type.toUpperCase()) {
    case 'WELCOME':
      return await handleWelcome(data);
    case 'NEW_ACCOUNT':
    case 'NEW_ACCOUNT_PURCHASED':
    case 'WELCOME_CHALLENGE':
      return await handleNewAccount(data);
    case 'ACCOUNT_BREACHED':
    case 'BREACH':
      return await handleBreach(data);
    case 'ACCOUNT_PAUSED':
    case 'PAUSE':
      return await handlePaused(data);
    case 'ACCOUNT_RESETED':
    case 'RESET':
      return await handleReseted(data);
    case 'PASSWORD_RESET':
      return await handlePasswordReset(data);
    case 'ACCOUNT_PASSED':
    case 'CHALLENGE_PASSED':
    case 'PASSED':
      return await handlePassed(data);
    case 'PAYOUT_REQUESTED':
    case 'PAYOUT_SUBMITTED':
      return await handlePayoutRequested(data);
    case 'PAYOUT_APPROVED':
    case 'PAYOUT_PAID':
    case 'PAYOUT_SETTLED':
      return await handlePayoutApproved(data);
    case 'PAYOUT_REJECTED':
    case 'PAYOUT_DENIED':
      return await handlePayoutRejected(data);
    case 'NEED_SUPPORT':
    case 'SUPPORT_REPLY':
      return await handleNeedSupport(data);
    default:
      console.warn(`[EmailService] Tipo de evento no reconocido: ${type}`);
      return { success: false, error: `Unknown event type: ${type}` };
  }
}

// ============================================================================
// SUSCRIPTOR REDIS PUB/SUB
// ============================================================================
let redisSubscriber: Redis | null = null;

function setupRedisSubscriber() {
  try {
    redisSubscriber = new Redis(REDIS_URL, {
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
      retryStrategy: (times) => {
        const delay = Math.min(times * 1000, 10000);
        console.warn(`[EmailService] Reintentando conexión a Redis en ${delay}ms...`);
        return delay;
      },
    });

    redisSubscriber.on('connect', () => {
      console.info(`[EmailService] Conectado exitosamente a Redis en ${REDIS_URL}`);
    });

    redisSubscriber.on('error', (err) => {
      console.warn(`[EmailService] Advertencia de Redis:`, err.message);
    });

    redisSubscriber.subscribe(EMAIL_CHANNEL, (err, count) => {
      if (err) {
        console.error(`[EmailService] Error suscribiéndose a ${EMAIL_CHANNEL}:`, err);
      } else {
        console.info(`[EmailService] Suscrito a canal '${EMAIL_CHANNEL}' (${count} suscripciones activas)`);
      }
    });

    redisSubscriber.on('message', async (channel, message) => {
      if (channel !== EMAIL_CHANNEL) return;
      try {
        const parsed = JSON.parse(message);
        const { type, data } = parsed;
        if (!type || !data) {
          console.warn('[EmailService] Mensaje descartado: falta type o data', message);
          return;
        }
        await routeEmailEvent(type, data);
      } catch (err: any) {
        console.error('[EmailService] Error parseando mensaje de Redis:', err.message, message);
      }
    });
  } catch (err: any) {
    console.error('[EmailService] Error inicializando suscriptor Redis:', err.message);
  }
}

// ============================================================================
// SERVIDOR HTTP AUXILIAR Y HEALTH CHECK
// ============================================================================
const app = express();
app.use(cors());
app.use(express.json());

// Health check para Docker / Kubernetes / Monitoreo
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'eklipse-email-service',
    timestamp: new Date().toISOString(),
    redisConnected: redisSubscriber?.status === 'ready' || redisSubscriber?.status === 'connect',
  });
});

// Endpoint HTTP directo para despachar correos (alternativo a Redis Pub/Sub)
app.post('/send', async (req, res) => {
  try {
    const { type, data } = req.body;
    if (!type || !data || !data.toEmail) {
      return res.status(400).json({ error: 'type, data and data.toEmail are required' });
    }
    const result = await routeEmailEvent(type, data);
    return res.json(result);
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// Iniciar servidor
const server = app.listen(PORT, () => {
  console.info(`[EmailService] Microservicio escuchando en http://0.0.0.0:${PORT}`);
  setupRedisSubscriber();
});

// Graceful shutdown
const shutdown = () => {
  console.info('[EmailService] Cerrando microservicio con gracia...');
  if (redisSubscriber) {
    redisSubscriber.disconnect();
  }
  server.close(() => {
    console.info('[EmailService] Servidor cerrado. Proceso terminado.');
    process.exit(0);
  });
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
