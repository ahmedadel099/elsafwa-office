import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from 'react';
import { CheckCircle2, OctagonAlert, X } from 'lucide-react';
import { cn } from '../lib/cn';

type ToastTone = 'success' | 'danger';

interface ToastItem {
  id: number;
  title: string;
  description?: string;
  tone: ToastTone;
}

interface ToastApi {
  toast: (title: string, options?: { description?: string; tone?: ToastTone }) => void;
}

const ToastContext = createContext<ToastApi | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const nextId = useRef(1);

  const dismiss = useCallback((id: number) => setItems((current) => current.filter((t) => t.id !== id)), []);

  const toast = useCallback<ToastApi['toast']>(
    (title, options = {}) => {
      const id = nextId.current++;
      setItems((current) => [...current.slice(-2), { id, title, description: options.description, tone: options.tone ?? 'success' }]);
      window.setTimeout(() => dismiss(id), 4500);
    },
    [dismiss],
  );

  const api = useMemo(() => ({ toast }), [toast]);

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div aria-live="polite" className="no-print pointer-events-none fixed bottom-4 start-4 z-[60] flex w-[min(24rem,calc(100%-2rem))] flex-col gap-2">
        {items.map((item) => {
          const Icon = item.tone === 'success' ? CheckCircle2 : OctagonAlert;
          return (
            <div key={item.id} className="pointer-events-auto flex animate-fade-up items-start gap-3 rounded-xl border border-line bg-surface p-3.5 shadow-pop">
              <Icon className={cn('mt-0.5 size-5 shrink-0', item.tone === 'success' ? 'text-success' : 'text-danger')} aria-hidden />
              <div className="min-w-0 flex-1 text-sm">
                <p className="font-semibold text-ink">{item.title}</p>
                {item.description && <p className="mt-0.5 text-ink-3">{item.description}</p>}
              </div>
              <button type="button" onClick={() => dismiss(item.id)} className="rounded p-0.5 text-ink-3 hover:text-ink" aria-label="إخفاء التنبيه">
                <X className="size-4" aria-hidden />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastApi {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within ToastProvider');
  return context;
}
