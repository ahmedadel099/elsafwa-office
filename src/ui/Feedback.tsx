import type { ReactNode } from 'react';
import { AlertTriangle, CheckCircle2, Info, OctagonAlert, type LucideIcon } from 'lucide-react';
import { cn } from '../lib/cn';
import { toneSoft, type Tone } from './Badge';

const alertIcons: Partial<Record<Tone, LucideIcon>> = {
  info: Info,
  success: CheckCircle2,
  warning: AlertTriangle,
  danger: OctagonAlert,
  brand: Info,
  neutral: Info,
};

interface AlertProps {
  tone?: Tone;
  title?: ReactNode;
  children?: ReactNode;
  action?: ReactNode;
  icon?: LucideIcon;
  className?: string;
}

export function Alert({ tone = 'info', title, children, action, icon, className }: AlertProps) {
  const Icon = icon ?? alertIcons[tone] ?? Info;
  return (
    <div role={tone === 'danger' ? 'alert' : 'status'} className={cn('flex items-start gap-3 rounded-xl px-4 py-3 text-sm', toneSoft[tone], className)}>
      <Icon className="mt-0.5 size-[18px] shrink-0" aria-hidden />
      <div className="min-w-0 flex-1">
        {title && <p className="font-semibold">{title}</p>}
        {children && <div className={cn(title && 'mt-0.5', 'text-ink-2')}>{children}</div>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

interface EmptyStateProps {
  icon: LucideIcon;
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center px-6 py-12 text-center', className)}>
      <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-surface-3 text-ink-3">
        <Icon className="size-6" aria-hidden />
      </div>
      <p className="font-semibold text-ink">{title}</p>
      {description && <p className="mt-1 max-w-sm text-sm text-ink-3">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

interface ProgressProps {
  value: number;
  tone?: 'brand' | 'success' | 'warning' | 'danger';
  label: string;
  className?: string;
}

const barTones = { brand: 'bg-brand', success: 'bg-success', warning: 'bg-warning', danger: 'bg-danger' };

export function Progress({ value, tone = 'brand', label, className }: ProgressProps) {
  const clamped = Math.max(0, Math.min(100, Math.round(value)));
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={clamped}
      className={cn('h-1.5 w-full overflow-hidden rounded-full bg-surface-3', className)}
    >
      <div className={cn('h-full rounded-full transition-[width] duration-500', barTones[tone])} style={{ width: `${clamped}%` }} />
    </div>
  );
}
