import { forwardRef } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success';
type Size = 'sm' | 'md' | 'lg' | 'xl';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
  loading?: boolean;
}

const VARIANTS: Record<Variant, string> = {
  primary:   'bg-cyan-500 text-white font-semibold hover:bg-cyan-400 active:scale-95',
  secondary: 'bg-slate-800 text-slate-100 font-medium hover:bg-slate-700 active:scale-95 border border-slate-700',
  ghost:     'text-slate-300 hover:bg-slate-800 active:scale-95',
  danger:    'bg-red-600 text-white font-semibold hover:bg-red-500 active:scale-95',
  success:   'bg-emerald-600 text-white font-semibold hover:bg-emerald-500 active:scale-95',
};

const SIZES: Record<Size, string> = {
  sm: 'text-sm px-3 py-2 rounded-xl',
  md: 'text-sm px-4 py-3 rounded-2xl',
  lg: 'text-base px-5 py-3.5 rounded-2xl',
  xl: 'text-lg px-6 py-4 rounded-2xl',
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', fullWidth, loading, disabled, className = '', children, ...rest }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={`
          inline-flex items-center justify-center gap-2 transition-all duration-150
          disabled:opacity-40 disabled:cursor-not-allowed
          ${VARIANTS[variant]}
          ${SIZES[size]}
          ${fullWidth ? 'w-full' : ''}
          ${className}
        `}
        {...rest}
      >
        {loading && (
          <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
export default Button;
