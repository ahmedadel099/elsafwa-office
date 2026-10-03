import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '../lib/cn';

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('rounded-xl border border-line bg-surface shadow-card', className)} {...props} />;
}

interface CardHeaderProps {
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  icon?: ReactNode;
  className?: string;
  /** Heading level for document outline (defaults to h2). */
  as?: 'h2' | 'h3';
}

export function CardHeader({ title, description, actions, icon, className, as: Heading = 'h2' }: CardHeaderProps) {
  return (
    <div className={cn('flex flex-wrap items-start justify-between gap-3 border-b border-line px-5 py-4', className)}>
      <div className="flex min-w-0 items-start gap-3">
        {icon}
        <div className="min-w-0">
          <Heading className="text-[15px] font-semibold text-ink">{title}</Heading>
          {description && <p className="mt-0.5 text-[13px] text-ink-3">{description}</p>}
        </div>
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

export function CardBody({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('p-5', className)} {...props} />;
}

/** Label/value rows for detail panels. */
export function DetailList({ items, className }: { items: Array<{ label: ReactNode; value: ReactNode }>; className?: string }) {
  return (
    <dl className={cn('divide-y divide-line', className)}>
      {items.map((item, index) => (
        <div key={index} className="flex items-start justify-between gap-4 py-2.5 text-sm">
          <dt className="shrink-0 text-ink-3">{item.label}</dt>
          <dd className="min-w-0 text-end font-medium text-ink">{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}
