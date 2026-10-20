export type SnailPayMode = 'normal' | 'down'

export const config = {
    port: Number(process.env.PORT ?? 3001),

};

export function getSnailPayMode(): SnailPayMode {
  return process.env.SNAILPAY_MODE === 'down' ? 'down' : 'normal';
}