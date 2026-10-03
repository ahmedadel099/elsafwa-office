import type { HTMLAttributes, ReactNode, TdHTMLAttributes, ThHTMLAttributes } from 'react';
import { ChevronLeft, TrendingDown, TrendingUp, type LucideIcon } from 'lucide-react';
import { cn } from '../lib/cn';
import { Link } from '../lib/router';
import { initials } from '../lib/format';
import { toneSoft, type Tone } from './Badge';

/* ------------------------------ Page header ------------------------------ */

interface Crumb {
  label: string;
  to?: string;
}

interface PageHeaderProps {
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  breadcrumbs?: Crumb[];
  meta?: ReactNode;
}

export function PageHeader({ title, description, actions, breadcrumbs, meta }: PageHeaderProps) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0">
        {breadcrumbs && (
          <nav aria-label="مسار التنقل" className="mb-2">
            <ol className="flex flex-wrap items-center gap-1 text-[13px] text-ink-3">
              {breadcrumbs.map((crumb, index) => (
                <li key={index} className="flex items-center gap-1">
                  {index > 0 && <ChevronLeft className="size-3.5 ltr:rotate-180" aria-hidden />}
                  {crumb.to ? (
                    <Link to={crumb.to} className="hover:text-ink hover:underline">
                      {crumb.label}
                    </Link>
                  ) : (
                    <span aria-current="page">{crumb.label}</span>
                  )}
                </li>
              ))}
            </ol>
          </nav>
        )}
        <h1 tabIndex={-1} className="text-2xl font-semibold text-ink outline-none">
          {title}
        </h1>
        {description && <p className="mt-1 text-sm text-ink-3">{description}</p>}
        {meta && <div className="mt-3 flex flex-wrap items-center gap-2">{meta}</div>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

/* --------------------------------- Avatar -------------------------------- */

const avatarTones: Tone[] = ['brand', 'info', 'violet', 'accent', 'success', 'warning'];

export function Avatar({ name, size = 'md', className }: { name: string; size?: 'sm' | 'md' | 'lg'; className?: string }) {
  const hash = Array.from(name).reduce((sum, ch) => sum + ch.charCodeAt(0), 0);
  const tone = avatarTones[hash % avatarTones.length];
  const dims = { sm: 'size-7 text-[11px]', md: 'size-9 text-[13px]', lg: 'size-12 text-base' }[size];
  return (
    <span aria-hidden className={cn('inline-flex shrink-0 items-center justify-center rounded-full font-semibold', dims, toneSoft[tone], className)}>
      {initials(name)}
    </span>
  );
}

/* ---------------------------------- Stat --------------------------------- */

interface StatProps {
  label: string;
  value: ReactNode;
  icon: LucideIcon;
  tone?: Tone;
  hint?: ReactNode;
  trend?: { value: string; direction: 'up' | 'down'; good: boolean };
  to?: string;
  linkLabel?: string;
}

export function Stat({ label, value, icon: Icon, tone = 'brand', hint, trend, to, linkLabel }: StatProps) {
  const TrendIcon = trend?.direction === 'down' ? TrendingDown : TrendingUp;
  return (
    <div className="flex flex-col rounded-xl border border-line bg-surface p-4 shadow-card">
      <div className="flex items-start justify-between gap-3">
        <p className="text-[13px] font-medium text-ink-3">{label}</p>
        <span className={cn('flex size-9 items-center justify-center rounded-lg', toneSoft[tone])}>
          <Icon className="size-[18px]" aria-hidden />
        </span>
      </div>
      <p className="mt-1 text-2xl font-semibold text-ink tabular">{value}</p>
      <div className="mt-2 flex min-h-5 flex-wrap items-center justify-between gap-2 text-[13px]">
        {trend ? (
          <span className={cn('inline-flex items-center gap-1 font-medium', trend.good ? 'text-success' : 'text-danger')}>
            <TrendIcon className="size-3.5" aria-hidden />
            <span className="ltr-nums">{trend.value}</span>
          </span>
        ) : (
          hint && <span className="text-ink-3">{hint}</span>
        )}
        {to && (
          <Link to={to} className="font-medium text-brand-ink hover:underline">
            {linkLabel ?? 'عرض'}
          </Link>
        )}
      </div>
      {trend && hint && <p className="mt-0.5 text-[13px] text-ink-3">{hint}</p>}
    </div>
  );
}

/* ---------------------------------- Table -------------------------------- */

export function TableWrap({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('scrollbar-thin overflow-x-auto', className)} {...props} />;
}

export function Table({ className, ...props }: HTMLAttributes<HTMLTableElement>) {
  return <table className={cn('w-full border-collapse text-sm', className)} {...props} />;
}

export function Th({ className, ...props }: ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      scope="col"
      className={cn('sticky top-0 border-b border-line bg-surface-2 px-4 py-2.5 text-start text-xs font-semibold whitespace-nowrap text-ink-3', className)}
      {...props}
    />
  );
}

export function Td({ className, ...props }: TdHTMLAttributes<HTMLTableCellElement>) {
  return <td className={cn('border-b border-line px-4 py-3 align-middle text-ink-2', className)} {...props} />;
}

export function Tr({ className, interactive, ...props }: HTMLAttributes<HTMLTableRowElement> & { interactive?: boolean }) {
  return <tr className={cn(interactive && 'cursor-pointer transition-colors hover:bg-surface-2', className)} {...props} />;
}

/* ---------------------------------- Misc --------------------------------- */

export function Kbd({ children }: { children: ReactNode }) {
  return (
    <kbd className="inline-flex h-5 min-w-5 items-center justify-center rounded border border-line-strong bg-surface-2 px-1 font-sans text-[11px] text-ink-3">
      {children}
    </kbd>
  );
}

export function SectionTitle({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <div className="mb-3 flex items-center justify-between gap-3">
      <h2 className="text-[15px] font-semibold text-ink">{children}</h2>
      {action}
    </div>
  );
}
