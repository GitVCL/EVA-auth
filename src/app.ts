import express from 'express';
import { corsConfig } from './config/cors';
import { env } from './config/env';
import { authRouter } from './routes/auth.routes';

export const app = express();

app.use(express.json({ limit: '1mb' }));
app.use(corsConfig);

app.use('/api/auth', authRouter);

app.get('/api/health', (_req, res) => {
  res.json({
    ok: true,
    service: 'auth',
    env: env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

app.use((_req, res) => {
  res.status(404).json({ ok: false, error: 'Rota nao encontrada' });
});
