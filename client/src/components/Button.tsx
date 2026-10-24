import type { ComponentProps } from 'react';

type Variant = 'primary' | 'secondary'

interface ButtonProps extends ComponentProps<'button'> {
	isLoading?: boolean;
	variant?: Variant
}

const VARIANT_CLASSES: Record<Variant, string> = {
	primary: 'bg-emerald-500 text-slate-950 hover:bg-emerald-400',
	secondary: 'border border-slate-700 bg-transparent text-slate-200 hover:bg-slate-800'
}

export function Button({
	isLoading = false,
	variant = 'primary',
	disabled,
	className = '',
	children,
	...props
}: ButtonProps) {
	return (
		<button
			disabled={disabled || isLoading}
			className={`rounded-lg px-4 py-2 font-semibold transition focus:outline-none focus:ring-2 focus:ring-emerald-300 disabled:cursor-not-allowed disabled:opacity-60 ${VARIANT_CLASSES[variant]} ${className}`}
			{...props}
		>
			{children}
		</button>
	);
}