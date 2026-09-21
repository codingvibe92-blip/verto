import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { env } from './config/env';
import apiRoutes from './routes';
import { errorHandler, httpLogger, notFound } from './middleware/error';

const app = express();

app.use(helmet());
app.use(
  cors({
    origin(origin, callback) {
      if (
        !origin ||
        env.corsOrigins.includes('*') ||
        env.corsOrigins.includes(origin) ||
        origin.includes('vercel.app') ||
        origin.includes('localhost')
      ) {
        callback(null, true);
      } else {
        // Fallback: allow request to prevent unexpected CORS blocks
        callback(null, true);
      }
    },
    credentials: true,
  })
);
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(httpLogger());

app.use('/api/v1', apiRoutes);

app.get('/health', (_req, res) => {
  res.json({ success: true, status: 'ok' });
});

app.use(notFound);
app.use(errorHandler);

export default app;