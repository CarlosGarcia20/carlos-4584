import { useId, type ComponentProps, type ReactNode } from 'react';

interface TextFieldProps extends ComponentProps<'input'> {
   label: string;
   error?: string;
   hint?: string;
   endAdornment?: ReactNode;
}

export function TextField({ 
   label, 
   error, 
   hint,
   endAdornment,
   id, 
   className = '', 
   ...inputProps 
}: TextFieldProps) {
   const generatedId = useId();
   const inputId = id ?? generatedId;
   const errorId = `${inputId}-error`;
   const hintId = `${inputId}-hint`;
   const describedBy = error ? errorId : hint ? hintId : undefined;

   return (
      <div>
         <label htmlFor={inputId} className="block text-sm font-medium text-slate-200">
            {label}
         </label>
         <div className='relative mt-1'>
            <input
               id={inputId}
               aria-invalid={error ? true : undefined}
               aria-describedby={describedBy}
               className={`block w-full rounded-lg border bg-slate-950 px-3 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 ${endAdornment ? 'pr-20' : ''
                  } ${error ? 'border-red-500' : 'border-slate-700'} ${className}`}
               {...inputProps}
            />
            {endAdornment && (
               <div className='absolute inset-y-0 right-1 flex items-center'>{endAdornment}</div>
            )}
         </div>
         {error ? (
            <p id={errorId} className="mt-1 text-sm text-red-400">
               {error}
            </p>
         ) : hint ? (
            <p id={hintId} className="mt-1 text-sm text-slate-500">
               {hint}
            </p>
         ) : null}
      </div>
   );
}