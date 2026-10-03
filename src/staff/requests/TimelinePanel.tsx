import { useState } from 'react';
import { ArrowLeftRight, CheckCircle2, Coins, FilePlus2, Lock, MessageSquare, Sparkles, UserPlus, Users } from 'lucide-react';
import { useAuth, useUser } from '../../app/AuthContext';
import { DomainError, store } from '../../data/engine';
import { useDb } from '../../data/hooks';
import type { RequestEvent, RequestRecord } from '../../data/types';
import { cn } from '../../lib/cn';
import { formatDateTime } from '../../lib/format';
import { Badge } from '../../ui/Badge';
import { Button } from '../../ui/Button';
import { Textarea } from '../../ui/Field';
import { useToast } from '../../ui/Toast';

const ICONS: Record<RequestEvent['kind'], typeof Sparkles> = {
  created: Sparkles,
  status: ArrowLeftRight,
  note: MessageSquare,
  step: CheckCircle2,
  payment: Coins,
  document: FilePlus2,
  assignment: UserPlus,
};

type Filter = 'all' | 'public' | 'internal';

export function TimelinePanel({ request }: { request: RequestRecord }) {
  const user = useUser();
  const { can } = useAuth();
  const db = useDb();
  const { toast } = useToast();
  const [filter, setFilter] = useState<Filter>('all');
  const [note, setNote] = useState('');
  const [visibility, setVisibility] = useState<'internal' | 'public'>('internal');

  const events = db.events
    .filter((e) => e.request_id === request.id && (filter === 'all' || e.visibility === filter))
    .sort((a, b) => b.at.localeCompare(a.at));

  const add = () => {
    try {
      store.addNote(user, request.id, note, visibility);
      setNote('');
      toast(visibility === 'public' ? 'تمت إضافة التحديث وسيظهر للعميل' : 'تمت إضافة الملاحظة الداخلية');
    } catch (e) {
      toast(e instanceof DomainError ? e.message : 'تعذّر الحفظ', { tone: 'danger' });
    }
  };

  return (
    <div className="p-5">
      {can('requests.update') && (
        <div className="mb-6 rounded-xl border border-line p-3">
          <label htmlFor="note" className="sr-only">
            إضافة ملاحظة
          </label>
          <Textarea id="note" rows={2} placeholder="اكتب ملاحظة أو تحديثًا…" value={note} onChange={(e) => setNote(e.target.value)} className="border-0 px-1 focus:ring-0" />
          <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
            <div className="inline-flex rounded-lg border border-line bg-surface-2 p-0.5 text-[13px]" role="radiogroup" aria-label="من يرى الملاحظة">
              {(
                [
                  ['internal', 'داخلية', Lock],
                  ['public', 'تظهر للعميل', Users],
                ] as const
              ).map(([value, label, Icon]) => (
                <button key={value} type="button" role="radio" aria-checked={visibility === value} onClick={() => setVisibility(value)} className={cn('flex h-7 items-center gap-1.5 rounded-md px-2.5', visibility === value ? 'bg-surface font-medium text-ink shadow-sm' : 'text-ink-3')}>
                  <Icon className="size-3.5" aria-hidden />
                  {label}
                </button>
              ))}
            </div>
            <Button size="sm" onClick={add} disabled={!note.trim()}>
              إضافة
            </Button>
          </div>
        </div>
      )}

      <div className="mb-4 flex gap-1 text-[13px]" role="radiogroup" aria-label="تصفية السجل">
        {(
          [
            ['all', 'الكل'],
            ['public', 'الظاهر للعميل'],
            ['internal', 'الداخلي'],
          ] as const
        ).map(([value, label]) => (
          <button key={value} type="button" role="radio" aria-checked={filter === value} onClick={() => setFilter(value)} className={cn('h-8 rounded-full px-3', filter === value ? 'bg-ink text-canvas' : 'text-ink-2 hover:bg-surface-3')}>
            {label}
          </button>
        ))}
      </div>

      <ol className="relative space-y-5 border-s border-line ps-6">
        {events.map((event) => {
          const Icon = ICONS[event.kind];
          const actor = event.actor_id === 'public' ? 'العميل عبر الموقع' : db.profiles.find((p) => p.id === event.actor_id)?.full_name ?? '—';
          return (
            <li key={event.id} className="relative">
              <span className={cn('absolute -start-[37px] flex size-6 items-center justify-center rounded-full ring-4 ring-surface', event.visibility === 'public' ? 'bg-brand-soft text-brand-ink' : 'bg-surface-3 text-ink-3')}>
                <Icon className="size-3.5" aria-hidden />
              </span>
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-sm text-ink">{event.message}</p>
                {event.visibility === 'internal' && (
                  <Badge tone="neutral" size="sm" icon={Lock}>
                    داخلي
                  </Badge>
                )}
              </div>
              <p className="mt-0.5 text-xs text-ink-3">
                {actor} · {formatDateTime(event.at)}
              </p>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
