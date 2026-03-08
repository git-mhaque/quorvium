import cors from 'cors';
import express from 'express';
import { createServer } from 'http';
import { ZodError } from 'zod';

import { env } from './env.js';
import { authRouter } from './routes/auth.js';
import { boardsRouter } from './routes/boards.js';
import { createSocketServer } from './socket.js';

const app = express();
app.use(
  cors({
    origin: env.clientOrigin,
    credentials: true
  })
);
app.use(express.json());

app.get('/healthz', (_req, res) => {
  res.json({ ok: true, service: 'quorvium-api' });
});

app.use('/api/boards', boardsRouter);
app.use('/api/auth', authRouter);

app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    if (err instanceof ZodError) {
      return res.status(400).json({ error: 'Invalid request payload', details: err.flatten() });
    }
    const message = err instanceof Error ? err.message : 'Unexpected error';
    // eslint-disable-next-line no-console
    console.error('[Error]', message, err);
    return res.status(500).json({ error: message });
  }
);

const httpServer = createServer(app);
const io = createSocketServer(httpServer);

httpServer.listen(env.port, () => {
  // eslint-disable-next-line no-console
  console.log(`Quorvium API listening on http://localhost:${env.port}`);
  // eslint-disable-next-line no-console
  console.log(`Socket server namespace: ${io.of('/').name}`);
});
