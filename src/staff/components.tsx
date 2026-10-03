import { useState } from 'react';
import { AlarmClock, CalendarClock, CheckCircle2, Eye, EyeOff } from 'lucide-react';
import { useUser } from '../app/AuthContext';
import { store } from '../data/engine';
import { BALL, PRIORITY, STATUS } from '../data/meta';
import { slaOf } from '../data/selectors';
import type { Client, Priority, RequestRecord, RequestStatus } from '../data/types';
import { can } from '../data/meta';
import { formatShortDate, maskNationalId } from '../lib/format';
import { Badge } from '../ui/Badge';

export function StatusBadge({ status, size }: { status: RequestStatus; size?: 'sm' | 'md' }) {
  const meta = STATUS[status];
  return (
    <Badge tone={meta.tone} icon={meta.icon} size={size}>
      {meta.label}
    </Badge>
  );
}

export function BallBadge({ status }: { status: RequestStatus }) {
  const ball = BALL[STATUS[status].ball];
  return (
    <Badge tone={ball.tone} dot size="sm">
      {ball.label}
    </Badge>
  );
}

export function PriorityBadge({ priority }: { priority: Priority }) {
  if (priority === 'normal') return null;
  const meta = PRIORITY[priority];
  return (
    <Badge tone={meta.tone} size="sm">
      {meta.label}
    </Badge>
  );
}

/** Target date with a plain-language SLA state ("متأخرة 3 أيام", "باقي يومان"). */
export function SlaBadge({ request }: { request: RequestRecord }) {
  const sla = slaOf(request);
  if (sla.state === 'closed') {
    return <span className="text-[13px] text-ink-3">{formatShortDate(request.completed_at ?? request.updated_at)}</span>;
  }
  if (sla.state === 'overdue') {
    return (
      <Badge tone="danger" icon={AlarmClock} size="sm">
        متأخرة {Math.abs(sla.days)} يوم
      </Badge>
    );
  }
  if (sla.state === 'due_soon') {
    return (
      <Badge tone="warning" icon={CalendarClock} size="sm">
        {sla.days === 0 ? 'موعدها اليوم' : `باقي ${sla.days} يوم`}
      </Badge>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 text-[13px] text-ink-2">
      <CheckCircle2 className="size-3.5 text-success" aria-hidden />
      {formatShortDate(request.target_date)}
    </span>
  );
}

/**
 * National IDs are masked by default. Revealing requires the permission and
 * writes an audit entry ("who saw whose ID, when").
 */
export function MaskedNationalId({ client }: { client: Client }) {
  const user = useUser();
  const [revealed, setRevealed] = useState<string | null>(null);

  if (!client.national_id) return <span className="text-ink-3">لم يُسجَّل بعد</span>;

  const allowed = can(user.role, 'clients.reveal_nid');
  return (
    <span className="inline-flex items-center gap-2">
      <span className="ltr-nums font-medium tracking-wide">{revealed ?? maskNationalId(client.national_id)}</span>
      {allowed && (
        <button
          type="button"
          onClick={() => setRevealed(revealed ? null : store.revealNationalId(user, client.id))}
          className="inline-flex items-center gap-1 rounded px-1 text-xs font-medium text-brand-ink hover:underline"
          title={revealed ? 'إخفاء' : 'عرض الرقم كاملًا — يُسجَّل في سجل النشاط'}
        >
          {revealed ? <EyeOff className="size-3.5" aria-hidden /> : <Eye className="size-3.5" aria-hidden />}
          {revealed ? 'إخفاء' : 'عرض'}
        </button>
      )}
    </span>
  );
}
