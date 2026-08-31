import app from './app';
import { env } from './config/env';
import { connectToDatabase, closeDatabase } from './config/database';
import { startScheduledJobs, stopScheduledJobs } from './jobs/scheduled';
import logger from './utils/logger';

async function main() {
  try {
    await connectToDatabase();
    startScheduledJobs();

    const server = app.listen(env.PORT, () => {
      logger.info(`EasyFund API running on port ${env.PORT} [${env.NODE_ENV}]`);
    });

    const shutdown = async (signal: string) => {
      logger.info(`${signal} received. Shutting down gracefully...`);
      stopScheduledJobs();
      server.close(async () => {
        await closeDatabase();
        logger.info('Server closed');
        process.exit(0);
      });
      setTimeout(() => {
        logger.error('Forced shutdown after timeout');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));
  } catch (error) {
    logger.error({ err: error }, 'Failed to start server');
    process.exit(1);
  }
}

main();
