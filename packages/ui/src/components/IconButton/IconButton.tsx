import type { ButtonHTMLAttributes, ReactNode } from 'react';
export type IconButtonVariant='primary'|'secondary'|'ghost'|'danger';
export type IconButtonSize='sm'|'md'|'lg';
export interface IconButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>,'children'|'aria-label'>{ 'aria-label':string; icon:ReactNode; variant?:IconButtonVariant; size?:IconButtonSize; loading?:boolean; }
export function IconButton({'aria-label':label,icon,variant='ghost',size='md',loading=false,disabled,className,type='button',...props}:IconButtonProps){return <button {...props} type={type} aria-label={label} aria-busy={loading||undefined} disabled={disabled||loading} className={['cui-icon-button',className].filter(Boolean).join(' ')} data-variant={variant} data-size={size}><span aria-hidden="true">{loading?'…':icon}</span></button>}
