import { cn } from '../lib/cn';

/** Brand mark: a seal-like rounded square carrying the letter "ص". */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={cn('size-9 shrink-0', className)} aria-hidden>
      <rect width="40" height="40" rx="11" className="fill-brand" />
      <rect x="3.5" y="3.5" width="33" height="33" rx="8.5" fill="none" className="stroke-on-brand" strokeOpacity="0.28" />
      <text
        x="20"
        y="26.5"
        textAnchor="middle"
        className="fill-on-brand"
        style={{ font: '700 19px "IBM Plex Sans Arabic", system-ui, sans-serif' }}
      >
        ص
      </text>
      <circle cx="30.5" cy="10" r="2.2" className="fill-accent" />
    </svg>
  );
}

export function Logo({ compact = false, className }: { compact?: boolean; className?: string }) {
  return (
    <span className={cn('flex items-center gap-2.5', className)}>
      <LogoMark />
      {!compact && (
        <span className="flex flex-col leading-tight">
          <span className="text-[15px] font-semibold text-ink">الصفوة</span>
          <span className="text-xs text-ink-3">للخدمات الحكومية والإلكترونية</span>
        </span>
      )}
    </span>
  );
}
