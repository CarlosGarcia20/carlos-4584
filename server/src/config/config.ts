export type SnailPayMode = 'normal' | 'down'

export const config = {
  port: Number(process.env.PORT ?? 3001),
  corsOrigin: (process.env.CORS_ORIGINS ?? 'http://localhost:5173')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean)
};

export function getSnailPayMode(): SnailPayMode {
  return process.env.SNAILPAY_MODE === 'down' ? 'down' : 'normal';
}