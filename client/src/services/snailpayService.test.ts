import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { REQUEST_TIMEOUT_MS, chargeCard, type ChargeRequest } from './snailpayService';

const request: ChargeRequest = {
  cardNumber: '1234123412341234',
  expirationDate: '12/26',
  cvv: '543',
  cardholderName: 'Ana Pérez',
  amount: 500,
  payerId: 'user-1',
  payerEmail: 'ana@example.com',
};

const approvedBody = {
  id: 'op-1',
  status: 'approved',
  status_detail: 'accredited',
  transaction_amount: 500,
  date_created: '2026-10-24T00:00:00.000Z',
  authorization_code: '123456',
  reference: 'SNP-ABCD1234',
  payer_id: 'user-1',
  payer_email: 'ana@example.com',
  card_number: '1234123412341234',
  cvv: '543',
};

const fetchMock = vi.fn();

const jsonResponse = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

beforeEach(() => {
  vi.stubGlobal('fetch', fetchMock);
});

afterEach(() => {
  fetchMock.mockReset();
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

describe('chargeCard', () => {
  it('aprueba cuando SnailPay confirma el cobro', async () => {
    fetchMock.mockResolvedValue(jsonResponse(201, approvedBody));

    const outcome = await chargeCard(request);

    expect(outcome.type).toBe('approved');
  });

  it('envía los datos con los nombres que espera SnailPay', async () => {
    fetchMock.mockResolvedValue(jsonResponse(201, approvedBody));

    await chargeCard(request);

    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toMatch(/\/api\/snailpay\/payments$/);
    expect(JSON.parse(String(init.body))).toEqual({
      card_number: '1234123412341234',
      expiration_date: '12/26',
      cvv: '543',
      cardholder_name: 'Ana Pérez',
      transaction_amount: 500,
      payer_id: 'user-1',
      payer_email: 'ana@example.com',
    });
  });

  it('reporta un error de transacción con su detalle', async () => {
    fetchMock.mockResolvedValue(
      jsonResponse(402, {
        ...approvedBody,
        status: 'rejected',
        status_detail: 'insufficient_funds',
        authorization_code: null,
      }),
    );

    expect(await chargeCard(request)).toEqual({ type: 'rejected', detail: 'insufficient_funds' });
  });

  it('reporta el error del sistema de SnailPay', async () => {
    fetchMock.mockResolvedValue(
      jsonResponse(503, {
        ...approvedBody,
        status: 'error',
        status_detail: 'service_unavailable',
        authorization_code: null,
      }),
    );

    expect(await chargeCard(request)).toEqual({ type: 'unavailable' });
  });

  it('trata una respuesta 5xx sin JSON como servicio no disponible', async () => {
    fetchMock.mockResolvedValue(new Response('<html>Bad gateway</html>', { status: 502 }));

    expect(await chargeCard(request)).toEqual({ type: 'unavailable' });
  });

  it.each([
    ['el monto no coincide', { transaction_amount: 9999 }],
    ['el pagador no coincide', { payer_id: 'otro-usuario' }],
    ['falta el código de autorización', { authorization_code: null }],
  ])('no acredita nada si %s', async (_caso, cambio) => {
    fetchMock.mockResolvedValue(jsonResponse(201, { ...approvedBody, ...cambio }));

    expect(await chargeCard(request)).toEqual({ type: 'invalid_response' });
  });

  it('no acredita nada con un cuerpo que no es JSON válido', async () => {
    fetchMock.mockResolvedValue(new Response('no es json', { status: 200 }));

    expect(await chargeCard(request)).toEqual({ type: 'invalid_response' });
  });

  it('detecta cuando no hay conexión', async () => {
    fetchMock.mockRejectedValue(new TypeError('Failed to fetch'));

    expect(await chargeCard(request)).toEqual({ type: 'network' });
  });

  it('corta la espera cuando SnailPay tarda demasiado', async () => {
    vi.useFakeTimers();
    fetchMock.mockImplementation(
      (_url: string, init: RequestInit) =>
        new Promise((_resolve, reject) => {
          init.signal?.addEventListener('abort', () =>
            reject(new DOMException('Aborted', 'AbortError')),
          );
        }),
    );

    const pending = chargeCard(request);
    await vi.advanceTimersByTimeAsync(REQUEST_TIMEOUT_MS);

    await expect(pending).resolves.toEqual({ type: 'timeout' });
  });
});
