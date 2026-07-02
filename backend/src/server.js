import http from 'node:http';
import createApp from './app.js';
import config from './config/index.js';
import logger from './utils/logger.js';
import { isServerless } from './utils/runtime.js';
import { connectDatabase, disconnectDatabase } from './loaders/database.js';
import { initCache, getRedisClient } from './cache/index.js';
import { initQueue, closeQueue } from './queues/index.js';
import { initStorage } from './storage/index.js';
import { initSocket } from './loaders/socket.js';

let appPromise = null;

const bootInfra = async () => {
  await connectDatabase();
  await initCache();
  await initQueue();
  await initStorage();
};

const getApp = async () => {
  if (!appPromise) {
    await bootInfra();
    appPromise = Promise.resolve(createApp());
  }
  return appPromise;
};

/** Vercel / serverless entry — cached boot, no listen(). */
export default async (req, res) => {
  const app = await getApp();
  app(req, res);
};

/**
 * Composition root for local/traditional hosting. Initializes infrastructure,
 * starts the HTTP server, and wires graceful shutdown.
 */
const start = async () => {
  await bootInfra();

  const app = createApp();
  const server = http.createServer(app);
  await initSocket(server);

  server.listen(config.port, () => {
    logger.info(`🚀 Server [${config.env}] listening on port ${config.port}`);
    logger.info(`📚 Docs at http://localhost:${config.port}/docs`);
  });

  const shutdown = async (signal) => {
    logger.warn(`${signal} received — shutting down gracefully`);
    server.close(async () => {
      try {
        await closeQueue();
        await getRedisClient()?.quit();
        await disconnectDatabase();
        logger.info('Cleanup complete. Bye 👋');
        process.exit(0);
      } catch (err) {
        logger.error(`Shutdown error: ${err.message}`);
        process.exit(1);
      }
    });

    setTimeout(() => {
      logger.error('Forced shutdown after timeout');
      process.exit(1);
    }, 10000).unref();
  };

  ['SIGINT', 'SIGTERM'].forEach((sig) => process.on(sig, () => shutdown(sig)));

  process.on('unhandledRejection', (reason) => {
    logger.error(`Unhandled rejection: ${reason?.message || reason}`);
    shutdown('unhandledRejection');
  });
  process.on('uncaughtException', (err) => {
    logger.error(`Uncaught exception: ${err.message}`, { stack: err.stack });
    shutdown('uncaughtException');
  });

  return server;
};

if (!isServerless()) {
  start().catch((err) => {
    logger.error(`Fatal boot error: ${err.message}`, { stack: err.stack });
    process.exit(1);
  });
}
