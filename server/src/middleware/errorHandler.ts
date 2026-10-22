import type { ErrorRequestHandler, RequestHandler } from 'express';
import { buildResponse, extractEcho } from '../services/snailpay.service.js';

export const notFoundHandler: RequestHandler = (_req, res) => {
  res.status(404).json({ error: 'not_found' });
};

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  const now = new Date();
  const empty = extractEcho(undefined);

  if (err?.type === 'entity.parse.failed') {
    res.status(400).json(buildResponse('rejected', 'invalid_request', empty, now));
    return;
  }
  if (err?.type === 'entity.too.large') {
    res.status(413).json(buildResponse('rejected', 'invalid_request', empty, now));
    return;
  }

  console.error('Error interno:', err instanceof Error ? err.name : 'desconocido');
  res.status(500).json(buildResponse('error', 'internal_error', empty, now));
};