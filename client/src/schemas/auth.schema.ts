import { z } from "zod";

export type FieldErrors = Record<string, string>

export function getFieldErrors(error: z.ZodError): FieldErrors {
    const errors: FieldErrors = {}
    for (const issue of error.issues) {
        const field = issue.path[0]
        if (typeof field === 'string' && !(field in errors)) {
            errors[field] = issue.message;
        }
    }
    return errors;
}

const emailSchema = z
    .string()
    .trim()
    .toLowerCase()
    .pipe(z.email('Correo electrónico no válido'));

export const registerSchema = z
    .object({
        fullName: z
            .string()
            .trim()
            .min(1, 'Ingresa tu nombre completo')
            .max(100, 'El nombre es demasiado largo')
            .refine((value) => value.split(/\s+/).length >= 2, 'Ingresa tu nombre y apellido'),
        email: emailSchema,
        password: z
            .string()
            .min(8, 'Mínimo 8 caracteres')
            .max(128, 'Máximo 128 caracteres')
            .regex(/[A-Za-z]/, 'Debe incluir al menos una letra')
            .regex(/\d/, 'Debe incluir al menos un número'),
        confirmPassword: z.string().min(1, 'Confirma tu contraseña'),
    })
    .refine((data) => data.password === data.confirmPassword, {
        path: ['confirmPassword'],
        message: 'Las contraseñas no coinciden',
    });

export const loginSchema = z.object({
    email: emailSchema,
    password: z.string().min(1, 'Ingresa tu contraseña'),
});

export type RegisterInput = z.input<typeof registerSchema>;
export type LoginInput = z.input<typeof loginSchema>;