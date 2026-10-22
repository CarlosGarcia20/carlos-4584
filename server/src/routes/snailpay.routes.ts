import { Router } from 'express';
import { createPayment } from '../controllers/snailpay.controller.js';

export const snailpayRouter = Router();

snailpayRouter.post('/payments', createPayment);