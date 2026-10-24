import { useState, type FormEvent } from 'react';
import { Link } from 'react-router';
import { AuthLayout } from '../components/AuthLayout';
import { Button } from '../components/Button';
import { FormAlert } from '../components/FormAlert';
import { TextField } from '../components/TextField';
import type { FieldErrors } from '../schemas/auth.schema';
import { PasswordField } from '../components/PasswordField';
import { useAuth } from '../hooks/UseAuth';

export function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFieldErrors({});
    setFormError(null);
    setIsSubmitting(true);

    try {
      const result = await login({ email, password });
      if (result.ok) return;

      if (result.code === 'VALIDATION') {
        setFieldErrors(result.fieldErrors);
      } else {
        setFormError('Correo o contraseña incorrectos');
      }
    } catch {
      setFormError('Ocurrió un error inesperado. Inténtalo de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthLayout
      title="Iniciar sesión"
      footer={
        <>
          ¿Aún no tienes cuenta?{' '}
          <Link to="/register" className="font-medium text-emerald-400 hover:underline">
            Regístrate
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        {formError && <FormAlert message={formError} />}
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
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          {...(fieldErrors.password && { error: fieldErrors.password })}
        />
        <Button type="submit" isLoading={isSubmitting} className="w-full">
          {isSubmitting ? 'Ingresando…' : 'Iniciar sesión'}
        </Button>
      </form>
    </AuthLayout>
  );
}