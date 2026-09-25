import type { ButtonHTMLAttributes, ReactNode } from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';
export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  loadingLabel?: string;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
}

export function Button({ variant='primary', size='md', loading=false, loadingLabel='Loading', leadingIcon, trailingIcon, children, disabled, className, type='button', ...props }: ButtonProps) {
  return <button {...props} type={type} className={['cui-button', className].filter(Boolean).join(' ')} data-variant={variant} data-size={size} disabled={disabled || loading} aria-busy={loading || undefined}>
    {leadingIcon ? <span aria-hidden="true">{leadingIcon}</span> : null}
    <span>{loading ? loadingLabel : children}</span>
    {!loading && trailingIcon ? <span aria-hidden="true">{trailingIcon}</span> : null}
  </button>;
}
