import { randomBytes, randomInt, randomUUID } from 'node:crypto';
import { getSnailPayMode } from '../config/config.js';
import type { PaymentRequest } from '../validators/payment.schema.js';
import type {
  PaymentEcho,
  PaymentResponse,
  PaymentResult,
  PaymentStatus,
  StatusDetail,
} from '../types/snailpay.js';

// tarjeta de prueba para cobro exitoso
export const APPROVED_CARD = {
  number: '1234123412341234',
  expiration: '12/26',
  cvv: '543',
} as const;

export const insufficientFundsCard = '4000000000000002';

export function isServiceDown(simulateHeader: string | undefined): boolean {
  return getSnailPayMode() === 'down' || simulateHeader === 'down';
}

export function extractEcho(body: unknown): PaymentEcho {
  const raw: Record<string, unknown> =
    typeof body === 'object' && body !== null ? (body as Record<string, unknown>) : {};
  const text = (value: unknown, max: number): string | null =>
    typeof value === 'string' && value.length <= max ? value : null;

  return {
    transaction_amount:
      typeof raw.transaction_amount === 'number' && Number.isFinite(raw.transaction_amount)
        ? raw.transaction_amount
        : null,
    payer_id: text(raw.payer_id, 64),
    payer_email: text(raw.payer_email, 254),
    card_number: text(raw.card_number, 32),
    cvv: text(raw.cvv, 8),
  };
}

export function buildResponse(
  status: PaymentStatus,
  detail: StatusDetail,
  echo: PaymentEcho,
  now: Date,
  authorizationCode: string | null = null,
): PaymentResponse {
  return {
    id: randomUUID(),
    status,
    status_detail: detail,
    transaction_amount: echo.transaction_amount,
    date_created: now.toISOString(),
    authorization_code: authorizationCode,
    reference: `SNP-${randomBytes(4).toString('hex').toUpperCase()}`,
    payer_id: echo.payer_id,
    payer_email: echo.payer_email,
    card_number: echo.card_number,
    cvv: echo.cvv,
  };
}

function isExpired(expiration: string, now: Date): boolean {
  const month = Number(expiration.slice(0, 2));
  const year = 2000 + Number(expiration.slice(3, 5));
  const currentYear = now.getUTCFullYear();
  const currentMonth = now.getUTCMonth() + 1;
  return year < currentYear || (year === currentYear && month < currentMonth);
}

export function processPayment(input: PaymentRequest, now: Date = new Date()): PaymentResult {
  const echo: PaymentEcho = {
    transaction_amount: input.transaction_amount,
    payer_id: input.payer_id,
    payer_email: input.payer_email,
    card_number: input.card_number,
    cvv: input.cvv,
  };

  const reject = (detail: StatusDetail): PaymentResult => ({
    httpStatus: 402,
    body: buildResponse('rejected', detail, echo, now),
  });

  const matchesApprovedCard =
    input.card_number === APPROVED_CARD.number &&
    input.expiration_date === APPROVED_CARD.expiration &&
    input.cvv === APPROVED_CARD.cvv;

  if (matchesApprovedCard) {
    const authorizationCode = String(randomInt(100000, 1000000));
    return {
      httpStatus: 201,
      body: buildResponse('approved', 'accredited', echo, now, authorizationCode),
    };
  }

  if (input.card_number === insufficientFundsCard) return reject('insufficient_funds');
  if (input.card_number === APPROVED_CARD.number && input.cvv !== APPROVED_CARD.cvv) {
    return reject('invalid_security_code');
  }

  if (isExpired(input.expiration_date, now)) return reject('expired_card');
  return reject('card_declined');
}