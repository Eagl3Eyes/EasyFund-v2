import app from './app';
import { env } from './config/env';
import { connectToDatabase, closeDatabase } from './config/database';

async function main() {
  try {
    // Connect to MongoDB
    await connectToDatabase();

    // Start server
    const server = app.listen(env.PORT, () => {
      console.log(`EasyFund API running on port ${env.PORT} [${env.NODE_ENV}]`);
    });

    // Graceful shutdown
    const shutdown = async (signal: string) => {
      console.log(`\n${signal} received. Shutting down gracefully...`);
      server.close(async () => {
        await closeDatabase();
        console.log('Server closed');
        process.exit(0);
      });

      // Force shutdown after 10s
      setTimeout(() => {
        console.error('Forced shutdown after timeout');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

main();
