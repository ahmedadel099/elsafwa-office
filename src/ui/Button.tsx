import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '../lib/cn';
import { Link } from '../lib/router';

type Variant = 'primary' | 'secondary' | 'ghost' | 'soft' | 'danger';
type Size = 'sm' | 'md' | 'lg';

const base =
  'inline-flex items-center justify-center gap-2 rounded-lg font-medium whitespace-nowrap select-none transition-colors duration-150 disabled:pointer-events-none disabled:opacity-50';

const variants: Record<Variant, string> = {
  primary: 'bg-brand text-on-brand shadow-sm hover:bg-brand-strong',
  secondary: 'border border-line-strong bg-surface text-ink hover:bg-surface-3',
  ghost: 'text-ink-2 hover:bg-surface-3 hover:text-ink',
  soft: 'bg-brand-soft text-brand-ink hover:bg-brand-soft/70',
  danger: 'border border-line-strong bg-surface text-danger hover:border-danger/40 hover:bg-danger-soft',
};

const sizes: Record<Size, string> = {
  sm: 'h-8 px-3 text-[13px]',
  md: 'h-10 px-4 text-sm',
  lg: 'h-12 px-6 text-base',
};

const iconSizes: Record<Size, string> = { sm: 'size-4', md: 'size-4', lg: 'size-5' };

interface CommonProps {
  variant?: Variant;
  size?: Size;
  icon?: LucideIcon;
  /** Icon placed after the label (e.g. a directional arrow). */
  trailingIcon?: LucideIcon;
  children?: ReactNode;
  className?: string;
}

export function buttonClasses({ variant = 'primary', size = 'md', className }: Pick<CommonProps, 'variant' | 'size' | 'className'>) {
  return cn(base, variants[variant], sizes[size], className);
}

type ButtonProps = CommonProps & ButtonHTMLAttributes<HTMLButtonElement> & { loading?: boolean };

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', size = 'md', icon: Icon, trailingIcon: TrailingIcon, loading, children, className, type = 'button', disabled, ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={buttonClasses({ variant, size, className })}
      {...rest}
    >
      {loading ? (
        <span className={cn(iconSizes[size], 'animate-spin rounded-full border-2 border-current border-t-transparent')} aria-hidden />
      ) : (
        Icon && <Icon className={iconSizes[size]} aria-hidden />
      )}
      {children}
      {TrailingIcon && <TrailingIcon className={cn(iconSizes[size], 'rtl:-scale-x-100')} aria-hidden />}
    </button>
  );
});

type ButtonLinkProps = CommonProps & { to: string; title?: string; 'aria-label'?: string };

export function ButtonLink({ to, variant = 'primary', size = 'md', icon: Icon, trailingIcon: TrailingIcon, children, className, ...rest }: ButtonLinkProps) {
  return (
    <Link to={to} className={buttonClasses({ variant, size, className })} {...rest}>
      {Icon && <Icon className={iconSizes[size]} aria-hidden />}
      {children}
      {TrailingIcon && <TrailingIcon className={cn(iconSizes[size], 'rtl:-scale-x-100')} aria-hidden />}
    </Link>
  );
}

type IconButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> & {
  icon: LucideIcon;
  label: string;
  variant?: Variant;
  size?: Size;
};

/** Square icon-only button; `label` becomes the accessible name and tooltip. */
export function IconButton({ icon: Icon, label, variant = 'ghost', size = 'md', className, type = 'button', ...rest }: IconButtonProps) {
  const square = { sm: 'size-8', md: 'size-10', lg: 'size-12' }[size];
  return (
    <button type={type} aria-label={label} title={label} className={cn(base, variants[variant], square, 'p-0', className)} {...rest}>
      <Icon className={iconSizes[size]} aria-hidden />
    </button>
  );
}
