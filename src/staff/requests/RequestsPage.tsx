import { useMemo } from 'react';
import { Download, Globe, Phone, SearchX, Store, X } from 'lucide-react';
import { useAuth, useUser } from '../../app/AuthContext';
import { store } from '../../data/engine';
import { useDb } from '../../data/hooks';
import { BALL, CHANNEL, PRIORITY, STATUS } from '../../data/meta';
import { ballOf, financeOf, isClosed, progressOf, scopeRequests, slaOf } from '../../data/selectors';
import type { Channel, RequestRecord } from '../../data/types';
import { downloadCsv } from '../../lib/csv';
import { digitsOnly, formatDate, formatMoney, formatShortDate } from '../../lib/format';
import { Link, navigate, useLocation } from '../../lib/router';
import { Button } from '../../ui/Button';
import { Card } from '../../ui/Card';
import { EmptyState, Progress } from '../../ui/Feedback';
import { Input, Select } from '../../ui/Field';
import { Avatar, PageHeader, Table, TableWrap, Td, Th, Tr } from '../../ui/Layout';
import { Tabs } from '../../ui/Tabs';
import { useToast } from '../../ui/Toast';
import { PriorityBadge, SlaBadge, StatusBadge } from '../components';

type View = 'open' | 'office' | 'client' | 'authority' | 'overdue' | 'closed';

const VIEWS: Array<{ id: View; label: string; test: (r: RequestRecord) => boolean }> = [
  { id: 'open', label: 'المفتوحة', test: (r) => !isClosed(r) },
  { id: 'office', label: BALL.office.label, test: (r) => ballOf(r) === 'office' },
  { id: 'client', label: BALL.client.label, test: (r) => ballOf(r) === 'client' },
  { id: 'authority', label: BALL.authority.label, test: (r) => ballOf(r) === 'authority' },
  { id: 'overdue', label: 'متأخرة', test: (r) => slaOf(r).state === 'overdue' },
  { id: 'closed', label: 'مغلقة', test: (r) => isClosed(r) },
];

const CHANNEL_ICON: Record<Channel, typeof Store> = { walk_in: Store, online: Globe, phone: Phone };

export function RequestsPage() {
  const user = useUser();
  const { can } = useAuth();
  const db = useDb();
  const { toast } = useToast();
  const { query } = useLocation();

  const view = (VIEWS.some((v) => v.id === query.get('view')) ? query.get('view') : 'open') as View;
  const q = query.get('q') ?? '';
  const service = query.get('service') ?? '';
  const branch = query.get('branch') ?? '';
  const assignee = query.get('assignee') ?? '';
  const priority = query.get('priority') ?? '';

  const setParam = (key: string, value: string) => {
    const next = new URLSearchParams(query);
    if (value) next.set(key, value);
    else next.delete(key);
    navigate(`/app/requests?${next.toString()}`, { replace: true });
  };

  const lookup = useMemo(
    () => ({
      clients: new Map(db.clients.map((c) => [c.id, c])),
      services: new Map(db.services.map((s) => [s.id, s])),
      profiles: new Map(db.profiles.map((p) => [p.id, p])),
      branches: new Map(db.branches.map((b) => [b.id, b])),
    }),
    [db],
  );

  const scoped = scopeRequests(db, user);
  const counts = Object.fromEntries(VIEWS.map((v) => [v.id, scoped.filter(v.test).length])) as Record<View, number>;

  const rows = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const needleDigits = digitsOnly(q);
    return scoped
      .filter(VIEWS.find((v) => v.id === view)!.test)
      .filter((r) => !service || r.service_id === service)
      .filter((r) => !branch || r.branch_id === branch)
      .filter((r) => !assignee || (assignee === 'none' ? !r.assignee_id : r.assignee_id === assignee))
      .filter((r) => !priority || r.priority === priority)
      .filter((r) => {
        if (!needle) return true;
        const client = lookup.clients.get(r.client_id);
        return (
          r.ref.toLowerCase().includes(needle) ||
          (r.authority_ref ?? '').toLowerCase().includes(needle) ||
          (client?.full_name ?? '').includes(q.trim()) ||
          (client?.business_name ?? '').includes(q.trim()) ||
          (needleDigits.length >= 4 && ((client?.phone ?? '').includes(needleDigits) || (client?.phone_alt ?? '').includes(needleDigits) || (client?.national_id ?? '') === needleDigits))
        );
      })
      .sort((a, b) => (view === 'closed' ? b.updated_at.localeCompare(a.updated_at) : slaOf(a).days - slaOf(b).days));
  }, [scoped, view, service, branch, assignee, priority, q, lookup]);

  const filtersActive = Boolean(q || service || branch || assignee || priority);
  const staff = db.profiles.filter((p) => p.is_active && (user.role === 'admin' || p.branch_id === user.branch_id) && p.role !== 'accountant');

  const exportCsv = () => {
    store.logExport(user, rows.length);
    downloadCsv(
      `معاملات-الصفوة-${new Date().toISOString().slice(0, 10)}.csv`,
      ['رقم المعاملة', 'العميل', 'الموبايل', 'الخدمة', 'الفرع', 'الحالة', 'المسؤول', 'تاريخ الاستلام', 'الموعد المستهدف', 'الأتعاب', 'المحصل من الأتعاب', 'المتبقي'],
      rows.map((r) => {
        const f = financeOf(db, r.id);
        const client = lookup.clients.get(r.client_id);
        return [r.ref, client?.business_name ?? client?.full_name ?? '', client?.phone ?? '', lookup.services.get(r.service_id)?.name ?? '', lookup.branches.get(r.branch_id)?.short ?? '', STATUS[r.status].label, lookup.profiles.get(r.assignee_id ?? '')?.full_name ?? 'غير مسند', formatDate(r.received_at), formatDate(r.target_date), f.officeFee, f.officePaid, f.officeDue];
      }),
    );
    toast('تم تصدير الملف', { description: 'سُجّلت عملية التصدير في سجل النشاط. الملف لا يتضمن الأرقام القومية.' });
  };

  return (
    <>
      <PageHeader
        title="المعاملات"
        description={user.role === 'admin' ? 'كل معاملات الفرعين' : `معاملات ${db.branches.find((b) => b.id === user.branch_id)?.name}`}
        actions={
          can('requests.export') && (
            <Button variant="secondary" icon={Download} onClick={exportCsv} disabled={rows.length === 0}>
              تصدير Excel
            </Button>
          )
        }
      />

      <Card>
        <Tabs label="طوابير المعاملات" items={VIEWS.map((v) => ({ id: v.id, label: v.label, count: counts[v.id] }))} value={view} onChange={(v) => setParam('view', v === 'open' ? '' : v)} className="px-3" />

        <div className="flex flex-wrap items-center gap-2 border-b border-line p-3">
          <div className="w-full sm:w-72">
            <Input type="search" aria-label="بحث" placeholder="رقم المعاملة، الاسم، الموبايل، أو رقم الجهة" value={q} onChange={(e) => setParam('q', e.target.value)} />
          </div>
          <Select aria-label="الخدمة" value={service} onChange={(e) => setParam('service', e.target.value)} className="w-auto min-w-40">
            <option value="">كل الخدمات</option>
            {db.services.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </Select>
          {user.role === 'admin' && (
            <Select aria-label="الفرع" value={branch} onChange={(e) => setParam('branch', e.target.value)} className="w-auto">
              <option value="">كل الفروع</option>
              {db.branches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.short}
                </option>
              ))}
            </Select>
          )}
          <Select aria-label="المسؤول" value={assignee} onChange={(e) => setParam('assignee', e.target.value)} className="w-auto">
            <option value="">كل الموظفين</option>
            <option value="none">غير مسندة</option>
            {staff.map((p) => (
              <option key={p.id} value={p.id}>
                {p.full_name}
              </option>
            ))}
          </Select>
          <Select aria-label="الأولوية" value={priority} onChange={(e) => setParam('priority', e.target.value)} className="w-auto">
            <option value="">كل الأولويات</option>
            {Object.entries(PRIORITY).map(([key, meta]) => (
              <option key={key} value={key}>
                {meta.label}
              </option>
            ))}
          </Select>
          {filtersActive && (
            <Button variant="ghost" size="sm" icon={X} onClick={() => navigate(view === 'open' ? '/app/requests' : `/app/requests?view=${view}`, { replace: true })}>
              مسح الفلاتر
            </Button>
          )}
        </div>

        {rows.length === 0 ? (
          <EmptyState icon={SearchX} title="لا توجد معاملات مطابقة" description="جرّب تغيير الفلاتر أو البحث برقم المعاملة كاملًا." />
        ) : (
          <TableWrap>
            <Table>
              <thead>
                <tr>
                  <Th>المعاملة</Th>
                  <Th>العميل</Th>
                  <Th>الخدمة</Th>
                  <Th>الحالة</Th>
                  <Th>التقدّم</Th>
                  <Th>المسؤول</Th>
                  <Th>الموعد المستهدف</Th>
                  <Th className="text-end">متبقي أتعاب</Th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => {
                  const client = lookup.clients.get(r.client_id);
                  const owner = r.assignee_id ? lookup.profiles.get(r.assignee_id) : undefined;
                  const progress = progressOf(r);
                  const due = financeOf(db, r.id).officeDue;
                  const ChannelIcon = CHANNEL_ICON[r.channel];
                  return (
                    <Tr key={r.id} interactive onClick={() => navigate(`/app/requests/${r.id}`)}>
                      <Td>
                        <Link to={`/app/requests/${r.id}`} className="ltr-nums font-semibold whitespace-nowrap text-brand-ink hover:underline" onClick={(e) => e.stopPropagation()}>
                          {r.ref}
                        </Link>
                        <p className="mt-0.5 flex items-center gap-1 text-xs whitespace-nowrap text-ink-3">
                          <ChannelIcon className="size-3" aria-label={CHANNEL[r.channel]} />
                          {formatShortDate(r.received_at)}
                        </p>
                      </Td>
                      <Td>
                        <p className="font-medium whitespace-nowrap text-ink">{client?.business_name ?? client?.full_name}</p>
                        {client?.business_name && <p className="text-xs text-ink-3">{client.full_name}</p>}
                      </Td>
                      <Td className="max-w-56">
                        <p className="truncate">{lookup.services.get(r.service_id)?.name}</p>
                        {user.role === 'admin' && <p className="text-xs text-ink-3">{lookup.branches.get(r.branch_id)?.short}</p>}
                      </Td>
                      <Td>
                        <div className="flex flex-wrap items-center gap-1.5">
                          <StatusBadge status={r.status} size="sm" />
                          <PriorityBadge priority={r.priority} />
                        </div>
                      </Td>
                      <Td className="w-36">
                        <div className="flex min-w-28 items-center gap-2">
                          <Progress value={progress.percent} label={`تقدّم ${r.ref}`} tone={progress.percent === 100 ? 'success' : 'brand'} />
                          <span className="text-xs text-ink-3 tabular">
                            {progress.done}/{progress.total}
                          </span>
                        </div>
                      </Td>
                      <Td>
                        {owner ? (
                          <span className="flex items-center gap-2 whitespace-nowrap">
                            <Avatar name={owner.full_name} size="sm" />
                            <span className="text-[13px]">{owner.full_name.split(' ').slice(0, 2).join(' ')}</span>
                          </span>
                        ) : (
                          <span className="text-[13px] text-warning">غير مسندة</span>
                        )}
                      </Td>
                      <Td>
                        <SlaBadge request={r} />
                      </Td>
                      <Td className="text-end font-medium tabular whitespace-nowrap">{due > 0 ? formatMoney(due) : <span className="text-ink-3">—</span>}</Td>
                    </Tr>
                  );
                })}
              </tbody>
            </Table>
          </TableWrap>
        )}
        <p className="px-5 py-3 text-[13px] text-ink-3">عدد النتائج: {rows.length}</p>
      </Card>
    </>
  );
}
