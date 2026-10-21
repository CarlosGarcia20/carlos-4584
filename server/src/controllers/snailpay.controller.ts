import type { Request, Response } from 'express';
import { parsePayment } from '../validators/payment.schema.js';
import {
  buildResponse,
  extractEcho,
  isServiceDown,
  processPayment,
} from '../services/snailpay.service.js';

export function createPayment(req: Request, res: Response): void {
  const now = new Date();
  const echo = extractEcho(req.body);


  // Error del sistema para cuando el servicio este caído y no acepte mas pagos
  if (isServiceDown(req.header('x-snailpay'))) {
    res.status(503).json(buildResponse('error', 'service_unavailable', echo, now));
    return;
  }

  // Validación de datos con zod
  const parsed = parsePayment(req.body);
  if (!parsed.success) {
    res.status(400).json(buildResponse('rejected', parsed.detail, echo, now));
    return;
  }

  const result = processPayment(parsed.data, now);
  res.status(result.httpStatus).json(result.body);
}