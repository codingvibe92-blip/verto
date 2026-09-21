import app from './app';
import { env } from './config/env';
import { checkConnection } from './database/pool';
import logger from './utils/logger';

async function main(): Promise<void> {
  await checkConnection();

  app.listen(env.port, () => {
    logger.info(`CRUNCHX API running on http://localhost:${env.port} (${env.nodeEnv})`);
  });
}

main().catch((err) => {
  logger.error('Failed to start server', err);
  process.exit(1);
});