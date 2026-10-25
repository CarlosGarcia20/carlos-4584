import { z } from 'zod';

const hasMaxTwoDecimals = (value: number): boolean => {
   const cents = value * 100;
   return Math.abs(cents - Math.round(cents)) < 1e-9;
};

export const rechargeSchema = z.object({
   cardNumber: z
      .string()
      .transform((value) => value.replace(/[\s-]/g, ''))
      .pipe(z.string().regex(/^\d{16}$/, 'El número de tarjeta debe tener 16 dígitos')),
   expirationDate: z
      .string()
      .trim()
      .regex(/^(0[1-9]|1[0-2])\/\d{2}$/, 'Usa el formato MM/AA'),
   cvv: z.string().trim().regex(/^\d{3}$/, 'El CVV debe tener 3 dígitos'),
   cardholderName: z
      .string()
      .trim()
      .min(1, 'Ingresa el nombre del titular')
      .max(100, 'El nombre es demasiado largo'),
   amount: z
      .string()
      .trim()
      .min(1, 'Ingresa un monto')
      .transform((value) => Number(value))
      .pipe(
         z
            .number('Ingresa un monto válido')
            .positive('El monto debe ser mayor que cero')
            .max(50_000, 'El monto máximo es $50,000')
            .refine(hasMaxTwoDecimals, 'Usa máximo 2 decimales'),
      ),
});

export type RechargeInput = z.input<typeof rechargeSchema>;