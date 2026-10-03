import { Check, Clock, Eye, FileText } from 'lucide-react';
import { useAuth, useUser } from '../../app/AuthContext';
import { DomainError, store } from '../../data/engine';
import { useDb } from '../../data/hooks';
import { STEP_OWNER } from '../../data/meta';
import { isClosed, progressOf } from '../../data/selectors';
import type { RequestRecord, StepOwner } from '../../data/types';
import { cn } from '../../lib/cn';
import { formatDateTime } from '../../lib/format';
import { Badge, type Tone } from '../../ui/Badge';
import { Progress } from '../../ui/Feedback';
import { useToast } from '../../ui/Toast';

const OWNER_TONE: Record<StepOwner, Tone> = { office: 'brand', client: 'warning', authority: 'violet' };

export function StepsPanel({ request }: { request: RequestRecord }) {
  const user = useUser();
  const { can } = useAuth();
  const db = useDb();
  const { toast } = useToast();
  const progress = progressOf(request);
  const editable = can('requests.update') && !isClosed(request);

  const toggle = (stepId: string) => {
    try {
      store.toggleStep(user, request.id, stepId);
    } catch (e) {
      toast(e instanceof DomainError ? e.message : 'تعذّر تحديث الخطوة', { tone: 'danger' });
    }
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 pt-5">
        <p className="text-sm text-ink-2">
          أُنجز <span className="font-semibold text-ink tabular">{progress.done}</span> من <span className="tabular">{progress.total}</span> خطوات
        </p>
        <p className="flex items-center gap-1.5 text-xs text-ink-3">
          <Eye className="size-3.5" aria-hidden /> الخطوات المعلّمة تظهر للعميل في صفحة التتبع
        </p>
      </div>
      <div className="px-5 pt-3">
        <Progress value={progress.percent} label="نسبة إنجاز خطوات المعاملة" tone={progress.percent === 100 ? 'success' : 'brand'} />
      </div>

      <ol className="mt-4 divide-y divide-line border-t border-line">
        {request.steps.map((step, index) => {
          const done = Boolean(step.done_at);
          const current = progress.current?.id === step.id;
          const doer = step.done_by ? db.profiles.find((p) => p.id === step.done_by) : undefined;
          return (
            <li key={step.id} className={cn('flex items-start gap-4 px-5 py-4', current && 'bg-brand-soft/40')}>
              <button
                type="button"
                role="checkbox"
                aria-checked={done}
                aria-label={`${done ? 'إلغاء إنجاز' : 'تعليم كمنجزة'}: ${step.title}`}
                disabled={!editable}
                onClick={() => toggle(step.id)}
                className={cn(
                  'mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full border-2 transition-colors disabled:cursor-not-allowed',
                  done ? 'border-success bg-success text-surface' : current ? 'border-brand bg-surface' : 'border-line-strong bg-surface',
                  editable && !done && 'hover:border-brand',
                )}
              >
                {done ? <Check className="size-3.5" strokeWidth={3} aria-hidden /> : <span className="text-[11px] font-semibold text-ink-3 tabular">{index + 1}</span>}
              </button>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className={cn('text-sm font-medium', done ? 'text-ink-3 line-through decoration-ink-3/40' : 'text-ink')}>{step.title}</p>
                  {current && (
                    <Badge tone="brand" size="sm">
                      الخطوة الحالية
                    </Badge>
                  )}
                </div>
                {step.description && <p className="mt-0.5 text-[13px] text-ink-3">{step.description}</p>}
                {step.documents && step.documents.length > 0 && (
                  <p className="mt-1 flex flex-wrap items-center gap-1 text-xs text-accent">
                    <FileText className="size-3" aria-hidden /> مستندات الخطوة: {step.documents.join('، ')}
                  </p>
                )}
                <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink-3">
                  <Badge tone={OWNER_TONE[step.owner]} size="sm" dot>
                    {STEP_OWNER[step.owner]}
                  </Badge>
                  {step.days && (
                    <span className="flex items-center gap-1">
                      <Clock className="size-3" aria-hidden /> {step.days} يوم عمل
                    </span>
                  )}
                  {step.milestone && (
                    <span className="flex items-center gap-1">
                      <Eye className="size-3" aria-hidden /> يظهر للعميل
                    </span>
                  )}
                  {done && (
                    <span>
                      {doer?.full_name ?? '—'} · {formatDateTime(step.done_at)}
                    </span>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
