import { useState, type ComponentProps } from 'react';
import { TextField } from './TextField';

type PasswordFieldProps = Omit<ComponentProps<typeof TextField>, 'type' | 'endAdornment'>;

export function PasswordField(props: PasswordFieldProps) {
   const [isVisible, setIsVisible] = useState(false);

   return (
      <TextField
         {...props}
         type={isVisible ? 'text' : 'password'}
         endAdornment={
            <button
               type="button"
               onClick={() => setIsVisible((visible) => !visible)}
               aria-label={isVisible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
               className="rounded px-2 py-1 text-xs font-medium text-slate-400 hover:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
               {isVisible ? 'Ocultar' : 'Mostrar'}
            </button>
         }
      />
   );
}