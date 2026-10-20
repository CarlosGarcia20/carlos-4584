import express from 'express'
import cors from 'cors'
import helmet from 'helmet';
import { config } from './config/config.js'
export const app = express();

app.use(express.json())

app.get('/health', (_req, res) => {
  res.json({ ok: true });
});