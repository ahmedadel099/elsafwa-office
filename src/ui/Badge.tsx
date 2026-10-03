import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '../lib/cn';

export type Tone = 'brand' | 'info' | 'success' | 'warning' | 'danger' | 'violet' | 'neutral' | 'accent';

export const toneSoft: Record<Tone, string> = {
  brand: 'bg-brand-soft text-brand-ink',
  info: 'bg-info-soft text-info',
  success: 'bg-success-soft text-success',
  warning: 'bg-warning-soft text-warning',
  danger: 'bg-danger-soft text-danger',
  violet: 'bg-violet-soft text-violet',
  neutral: 'bg-neutral-soft text-neutral',
  accent: 'bg-accent-soft text-accent',
};

export const toneDot: Record<Tone, string> = {
  brand: 'bg-brand',
  info: 'bg-info',
  success: 'bg-success',
  warning: 'bg-warning',
  danger: 'bg-danger',
  violet: 'bg-violet',
  neutral: 'bg-ink-3',
  accent: 'bg-accent',
};

interface BadgeProps {
  tone?: Tone;
  icon?: LucideIcon;
  dot?: boolean;
  size?: 'sm' | 'md';
  className?: string;
  children: ReactNode;
}

/** Status/label pill. Always pairs colour with text (and optionally an icon) — never colour alone. */
export function Badge({ tone = 'neutral', icon: Icon, dot, size = 'md', className, children }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex max-w-full items-center gap-1.5 rounded-full font-medium whitespace-nowrap',
        size === 'sm' ? 'h-6 px-2 text-xs' : 'h-7 px-2.5 text-[13px]',
        toneSoft[tone],
        className,
      )}
    >
      {dot && <span className={cn('size-1.5 shrink-0 rounded-full', toneDot[tone])} aria-hidden />}
      {Icon && <Icon className="size-3.5 shrink-0" aria-hidden />}
      <span className="truncate">{children}</span>
    </span>
  );
}
