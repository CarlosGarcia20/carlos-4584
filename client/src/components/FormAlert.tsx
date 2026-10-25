interface FormAlertProps {
   message: string;
   variant?: 'error' | 'success';
}

const STYLES = {
   error: 'border-red-500/40 bg-red-500/10 text-red-300',
   success: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300',
} as const;

export function FormAlert({ message, variant = 'error' }: FormAlertProps) {
   return (
      <div
         role={variant === 'error' ? 'alert' : 'status'}
         className={`rounded-lg border px-3 py-2 text-sm ${STYLES[variant]}`}
      >
         {message}
      </div>
   );
}