import { afterEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import { app } from './app.js';
import { processPayment } from './services/snailpay.service.js';
import { parsePayment } from './validators/payment.schema.js';

const URL = '/api/snailpay/payments';

const validBody = {
  card_number: '1234123412341234',
  expiration_date: '12/26',
  cvv: '543',
  cardholder_name: 'Ana Pérez',
  transaction_amount: 500,
  payer_id: 'user-1',
  payer_email: 'ana@example.com',
};

const responseKeys = [
  'id', 'status', 'status_detail', 'transaction_amount', 'date_created',
  'authorization_code', 'reference', 'payer_id', 'payer_email',
  'card_number', 'cvv',
];

afterEach(() => {
  delete process.env.SNAILPAY_MODE;
});

describe('POST /api/snailpay/payments', () => {
  it('aprueba el cobro con la tarjeta de prueba', async () => {
    const res = await request(app).post(URL).send(validBody);

    expect(res.status).toBe(201);
    expect(res.body.status).toBe('approved');
    expect(res.body.status_detail).toBe('accredited');
    expect(res.body.authorization_code).toMatch(/^\d{6}$/);
    expect(res.body.transaction_amount).toBe(500);
    expect(res.body.payer_id).toBe('user-1');
    expect(res.body.payer_email).toBe('ana@example.com');
  });

  it('todas las respuestas incluyen los mismos campos', async () => {
    const ok = await request(app).post(URL).send(validBody);
    const rejected = await request(app).post(URL).send({ ...validBody, cvv: '000' });
    const bad = await request(app).post(URL).send({ ...validBody, cvv: '1' });
    const down = await request(app).post(URL).set('x-snailpay', 'down').send(validBody);

    for (const res of [ok, rejected, bad, down]) {
      expect(Object.keys(res.body).sort()).toEqual([...responseKeys].sort());
    }
  });

  it.each([
    ['card_number', '123', 'invalid_card_number'],
    ['expiration_date', '13/26', 'invalid_expiration_date'],
    ['cvv', '12', 'invalid_cvv'],
    ['cardholder_name', '   ', 'invalid_cardholder_name'],
    ['transaction_amount', 0, 'invalid_amount'],
    ['transaction_amount', -5, 'invalid_amount'],
    ['transaction_amount', 10.123, 'invalid_amount'],
    ['payer_email', 'no-es-correo', 'invalid_payer'],
  ] as const)('rechaza datos inválidos: %s = %j', async (field, value, detail) => {
    const res = await request(app).post(URL).send({ ...validBody, [field]: value });

    expect(res.status).toBe(400);
    expect(res.body.status).toBe('rejected');
    expect(res.body.status_detail).toBe(detail);
    expect(res.body.authorization_code).toBeNull();
  });

  it('rechaza fondos insuficientes', async () => {
    const res = await request(app)
      .post(URL)
      .send({ ...validBody, card_number: '4000000000000002' });

    expect(res.status).toBe(402);
    expect(res.body.status_detail).toBe('insufficient_funds');
    expect(res.body.authorization_code).toBeNull();
  });

  it('rechaza la tarjeta de prueba con CVV incorrecto', async () => {
    const res = await request(app).post(URL).send({ ...validBody, cvv: '000' });

    expect(res.status).toBe(402);
    expect(res.body.status_detail).toBe('invalid_security_code');
  });

  it('rechaza una tarjeta vencida', async () => {
    const res = await request(app)
      .post(URL)
      .send({ ...validBody, card_number: '5555555555554444', expiration_date: '01/20' });

    expect(res.status).toBe(402);
    expect(res.body.status_detail).toBe('expired_card');
  });

  it('rechaza cualquier otra tarjeta válida', async () => {
    const res = await request(app)
      .post(URL)
      .send({ ...validBody, card_number: '5555555555554444', expiration_date: '12/40' });

    expect(res.status).toBe(402);
    expect(res.body.status_detail).toBe('card_declined');
  });

  it('simula error del sistema con el header', async () => {
    const res = await request(app).post(URL).set('x-snailpay', 'down').send(validBody);

    expect(res.status).toBe(503);
    expect(res.body.status).toBe('error');
    expect(res.body.status_detail).toBe('service_unavailable');
    expect(res.body.authorization_code).toBeNull();
  });

  it('simula error del sistema con la variable de entorno', async () => {
    process.env.SNAILPAY_MODE = 'down';
    const res = await request(app).post(URL).send(validBody);

    expect(res.status).toBe(503);
    expect(res.body.status).toBe('error');
  });

  it('responde 400 ante un JSON mal formado', async () => {
    const res = await request(app)
      .post(URL)
      .set('Content-Type', 'application/json')
      .send('{"card_number": ');

    expect(res.status).toBe(400);
    expect(res.body.status_detail).toBe('invalid_request');
  });
});

describe('processPayment (reglas con fecha inyectada)', () => {
  const input = parsePayment(validBody);
  if (!input.success) throw new Error('validBody debe ser válido');

  it('la tarjeta de prueba sigue aprobando después de su fecha de vencimiento', () => {
    const result = processPayment(input.data, new Date('2027-02-01T00:00:00Z'));
    expect(result.body.status).toBe('approved');
  });

  it('marca como vencida según la fecha actual', () => {
    const other = { ...input.data, card_number: '5555555555554444', expiration_date: '01/27' };
    expect(processPayment(other, new Date('2027-01-15T00:00:00Z')).body.status_detail).toBe(
      'card_declined',
    );
    expect(processPayment(other, new Date('2027-02-01T00:00:00Z')).body.status_detail).toBe(
      'expired_card',
    );
  });
});