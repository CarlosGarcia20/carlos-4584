import { describe, expect, it } from 'vitest';
import request from 'supertest';
import { app } from './app.js';

describe('GET /health', () => {
  it('responde ok', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true });
  });
});

describe('CORS', () => {
  it('permite el origen configurado', async () => {
    const res = await request(app).get('/health').set('Origin', 'http://localhost:5173');
    expect(res.headers['access-control-allow-origin']).toBe('http://localhost:5173');
  });

  it('no agrega cabeceras CORS a un origen desconocido', async () => {
    const res = await request(app).get('/health').set('Origin', 'http://ejemplo.com');
    expect(res.headers['access-control-allow-origin']).toBeUndefined();
  });
});