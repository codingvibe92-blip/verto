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
      if (!origin || env.corsOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
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