import { z } from "zod";
import type { StatusDetail } from "../types/snailpay.js";

const hasMaxTwoDecimals = (value: number): boolean => {
    const cents = value * 100
    return Math.abs(cents - Math.round(cents)) < 1e-9
}

export const paymentSchema = z.object({
    card_number: z.string()
        .transform((value) => value.replace(/[\s-]/g, ''))
        .pipe(z.string().regex(/^\d{16}$/)),
    expiration_date: z.string().regex(/^(0[1-9]|1[0-2])\/\d{2}$/),
    cvv: z.string().regex(/^\d{3}$/),
    cardholder_name: z.string().trim().min(1).max(100),
    transaction_amount: z.number().positive().max(50_000).refine(hasMaxTwoDecimals),
    payer_id: z.string().trim().min(1).max(64),
    payer_email: z.string().max(254).pipe(z.email())
})

export type PaymentRequest = z.infer<typeof paymentSchema>;

const DETAIL_BY_FIELD: Record<string, StatusDetail> = {
  card_number: 'invalid_card_number',
  expiration_date: 'invalid_expiration_date',
  cvv: 'invalid_cvv',
  cardholder_name: 'invalid_cardholder_name',
  transaction_amount: 'invalid_amount',
  payer_id: 'invalid_payer',
  payer_email: 'invalid_payer',
};

export type ParseResult =
  | { success: true; data: PaymentRequest }
  | { success: false; detail: StatusDetail };

export function parsePayment(body: unknown): ParseResult {
  const result = paymentSchema.safeParse(body);

  if (result.success) {
    return { success: true, data: result.data };
  }
  const field = result.error.issues[0]?.path[0];
  const detail = typeof field === 'string' ? DETAIL_BY_FIELD[field] : undefined;
  return { success: false, detail: detail ?? 'invalid_request' };
}