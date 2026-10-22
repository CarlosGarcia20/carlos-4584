import express from 'express'
import helmet from 'helmet';
import { corsMiddleware } from './middleware/cors.js';

import { snailpayRouter } from './routes/snailpay.routes.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';

export const app = express();

app.use(helmet())
app.use(express.json())
app.use(corsMiddleware())

app.get('/health', (_req, res) => {
  res.json({ ok: true });
});

app.use('/api/snailpay', snailpayRouter)

app.use(notFoundHandler)
app.use(errorHandler)