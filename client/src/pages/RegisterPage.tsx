import { useState, type FormEvent } from 'react';
import { Link } from 'react-router';
import { AuthLayout } from '../components/AuthLayout';
import { Button } from '../components/Button';
import { FormAlert } from '../components/FormAlert';
import { TextField } from '../components/TextField';
import type { FieldErrors } from '../schemas/auth.schema';
import { PasswordField } from '../components/PasswordField';
import { useAuth } from '../hooks/UseAuth';

export function RegisterPage() {
   const { register } = useAuth();
   const [fullName, setFullName] = useState('');
   const [email, setEmail] = useState('');
   const [password, setPassword] = useState('');
   const [confirmPassword, setConfirmPassword] = useState('');
   const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
   const [formError, setFormError] = useState<string | null>(null);
   const [isSubmitting, setIsSubmitting] = useState(false);

   async function handleSubmit(event: FormEvent<HTMLFormElement>) {
      event.preventDefault();
      setFieldErrors({});
      setFormError(null);
      setIsSubmitting(true);

      try {
         const result = await register({ fullName, email, password, confirmPassword });
         if (result.ok) return;

         if (result.code === 'VALIDATION') {
            setFieldErrors(result.fieldErrors);
         } else {
            setFieldErrors({ email: 'Este correo ya está registrado' });
         }
      } catch {
         setFormError('Ocurrió un error inesperado. Inténtalo de nuevo.');
      } finally {
         setIsSubmitting(false);
      }
   }

   return (
      <AuthLayout
         title="Crear cuenta"
         footer={
            <>
               ¿Ya tienes cuenta?{' '}
               <Link to="/login" className="font-medium text-emerald-400 hover:underline">
                  Inicia sesión
               </Link>
            </>
         }
      >
         <form onSubmit={handleSubmit} noValidate className="space-y-4">
            {formError && <FormAlert message={formError} />}
            <TextField
               label="Nombre completo"
               autoComplete="name"
               value={fullName}
               onChange={(event) => setFullName(event.target.value)}
               {...(fieldErrors.fullName && { error: fieldErrors.fullName })}
            />
            <TextField
               label="Correo electrónico"
               type="email"
               autoComplete="email"
               value={email}
               onChange={(event) => setEmail(event.target.value)}
               {...(fieldErrors.email && { error: fieldErrors.email })}
            />
            <PasswordField
               label="Contraseña"
               autoComplete="new-password"
               hint="Mínimo 8 caracteres, con letras y números"
               value={password}
               onChange={(event) => setPassword(event.target.value)}
               {...(fieldErrors.password && { error: fieldErrors.password })}
            />
            <PasswordField
               label="Confirmar contraseña"
               autoComplete="new-password"
               value={confirmPassword}
               onChange={(event) => setConfirmPassword(event.target.value)}
               {...(fieldErrors.confirmPassword && { error: fieldErrors.confirmPassword })}
            />
            <Button type="submit" isLoading={isSubmitting} className="w-full">
               {isSubmitting ? 'Creando cuenta…' : 'Crear cuenta'}
            </Button>
         </form>
      </AuthLayout>
   );
}