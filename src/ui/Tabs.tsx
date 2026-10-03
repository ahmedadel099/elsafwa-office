import { useId, useRef, type KeyboardEvent, type ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '../lib/cn';

export interface TabItem<T extends string> {
  id: T;
  label: string;
  icon?: LucideIcon;
  count?: number;
}

interface TabsProps<T extends string> {
  items: TabItem<T>[];
  value: T;
  onChange: (value: T) => void;
  label: string;
  className?: string;
}

/** WAI-ARIA tabs with roving focus; arrow keys follow the reading direction. */
export function Tabs<T extends string>({ items, value, onChange, label, className }: TabsProps<T>) {
  const baseId = useId();
  const refs = useRef<Array<HTMLButtonElement | null>>([]);

  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const rtl = document.documentElement.dir === 'rtl';
    const forward = rtl ? 'ArrowLeft' : 'ArrowRight';
    const backward = rtl ? 'ArrowRight' : 'ArrowLeft';
    let next = -1;
    if (event.key === forward) next = (index + 1) % items.length;
    if (event.key === backward) next = (index - 1 + items.length) % items.length;
    if (event.key === 'Home') next = 0;
    if (event.key === 'End') next = items.length - 1;
    if (next < 0) return;
    event.preventDefault();
    onChange(items[next].id);
    refs.current[next]?.focus();
  };

  return (
    <div role="tablist" aria-label={label} className={cn('scrollbar-thin flex gap-1 overflow-x-auto overflow-y-hidden border-b border-line', className)}>
      {items.map((item, index) => {
        const selected = item.id === value;
        const Icon = item.icon;
        return (
          <button
            key={item.id}
            ref={(el) => {
              refs.current[index] = el;
            }}
            id={`${baseId}-tab-${item.id}`}
            role="tab"
            type="button"
            aria-selected={selected}
            tabIndex={selected ? 0 : -1}
            onClick={() => onChange(item.id)}
            onKeyDown={(event) => onKeyDown(event, index)}
            className={cn(
              'relative -mb-px inline-flex h-11 shrink-0 items-center gap-2 border-b-2 px-3 text-sm font-medium transition-colors',
              selected ? 'border-brand text-ink' : 'border-transparent text-ink-3 hover:text-ink',
            )}
          >
            {Icon && <Icon className="size-4" aria-hidden />}
            {item.label}
            {item.count !== undefined && (
              <span className={cn('rounded-full px-1.5 text-xs tabular', selected ? 'bg-brand-soft text-brand-ink' : 'bg-surface-3 text-ink-3')}>
                {item.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

export function TabPanel({ children, className, label }: { children: ReactNode; className?: string; label?: string }) {
  return (
    <div role="tabpanel" aria-label={label} className={cn('animate-fade-up', className)}>
      {children}
    </div>
  );
}
