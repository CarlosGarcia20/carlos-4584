import { z } from 'zod';

const API_URL: string = import.meta.env.VITE_API_URL ?? 'http://localhost:3001';
export const REQUEST_TIMEOUT_MS = 10_000;

const paymentResponseSchema = z.object({
   id: z.string(),
   status: z.enum(['approved', 'rejected', 'error']),
   status_detail: z.string(),
   transaction_amount: z.number().nullable(),
   date_created: z.string(),
   authorization_code: z.string().nullable(),
   reference: z.string(),
   payer_id: z.string().nullable(),
   payer_email: z.string().nullable(),
   card_number: z.string().nullable(),
   cvv: z.string().nullable(),
});

export type PaymentResponse = z.infer<typeof paymentResponseSchema>;

export interface ChargeRequest {
   cardNumber: string;
   expirationDate: string;
   cvv: string;
   cardholderName: string;
   amount: number;
   payerId: string;
   payerEmail: string;
}

export type ChargeOutcome =
   | { type: 'approved'; payment: PaymentResponse }
   | { type: 'rejected'; detail: string }
   | { type: 'unavailable' }
   | { type: 'timeout' }
   | { type: 'network' }
   | { type: 'invalid_response' };

function interpretResponse(status: number, body: unknown, request: ChargeRequest): ChargeOutcome {
   const parsed = paymentResponseSchema.safeParse(body);
   if (!parsed.success) {
      return status >= 500 ? { type: 'unavailable' } : { type: 'invalid_response' };
   }

   const payment = parsed.data;
   switch (payment.status) {
      case 'approved': {
         const isConsistent =
            status >= 200 &&
            status < 300 &&
            payment.authorization_code !== null &&
            payment.transaction_amount === request.amount &&
            payment.payer_id === request.payerId;
         return isConsistent ? { type: 'approved', payment } : { type: 'invalid_response' };
      }
      case 'rejected':
         return { type: 'rejected', detail: payment.status_detail };
      case 'error':
         return { type: 'unavailable' };
   }
}

export async function chargeCard(request: ChargeRequest): Promise<ChargeOutcome> {
   const controller = new AbortController();
   const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

   try {
      const response = await fetch(`${API_URL}/api/snailpay/payments`, {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({
            card_number: request.cardNumber,
            expiration_date: request.expirationDate,
            cvv: request.cvv,
            cardholder_name: request.cardholderName,
            transaction_amount: request.amount,
            payer_id: request.payerId,
            payer_email: request.payerEmail,
         }),
         signal: controller.signal,
      });
      const body: unknown = await response.json().catch(() => null);

      if (controller.signal.aborted) return { type: 'timeout' };
      return interpretResponse(response.status, body, request);
   } catch {
      return controller.signal.aborted ? { type: 'timeout' } : { type: 'network' };
   } finally {
      clearTimeout(timer);
   }
}