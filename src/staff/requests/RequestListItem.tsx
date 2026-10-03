import { ChevronLeft } from 'lucide-react';
import { useDb } from '../../data/hooks';
import { progressOf } from '../../data/selectors';
import type { RequestRecord } from '../../data/types';
import { Link } from '../../lib/router';
import { SlaBadge, StatusBadge } from '../components';

/** Compact, clickable request row used in dashboards and client files. */
export function RequestListItem({ request, showClient = true }: { request: RequestRecord; showClient?: boolean }) {
  const db = useDb();
  const client = db.clients.find((c) => c.id === request.client_id);
  const service = db.services.find((s) => s.id === request.service_id);
  const progress = progressOf(request);

  return (
    <li>
      <Link to={`/app/requests/${request.id}`} className="group flex items-center gap-4 px-5 py-3.5 transition-colors hover:bg-surface-2">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="ltr-nums text-[13px] font-semibold text-brand-ink">{request.ref}</span>
            {showClient && <span className="truncate text-sm font-medium text-ink">{client?.business_name ?? client?.full_name}</span>}
          </div>
          <p className="mt-0.5 truncate text-[13px] text-ink-3">
            {service?.name}
            {progress.current && <> · الخطوة الحالية: {progress.current.title}</>}
          </p>
        </div>
        <div className="hidden shrink-0 sm:block">
          <StatusBadge status={request.status} size="sm" />
        </div>
        <div className="w-28 shrink-0 text-end">
          <SlaBadge request={request} />
        </div>
        <ChevronLeft className="size-4 shrink-0 text-ink-3 transition-transform group-hover:-translate-x-0.5 ltr:rotate-180" aria-hidden />
      </Link>
    </li>
  );
}
