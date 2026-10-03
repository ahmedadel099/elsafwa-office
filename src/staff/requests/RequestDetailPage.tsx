import { useEffect, useRef, useState } from 'react';
import { ArrowLeftRight, Coins, FileStack, FileWarning, History, ListChecks, ScrollText, SearchX, UserRound } from 'lucide-react';
import { useAuth, useUser } from '../../app/AuthContext';
import { DomainError, store } from '../../data/engine';
import { useDb } from '../../data/hooks';
import { BALL, CHANNEL, STATUS, STEP_OWNER } from '../../data/meta';
import { financeOf, isClosed, missingDocuments, progressOf } from '../../data/selectors';
import { formatDate, formatMoney, formatPhone } from '../../lib/format';
import { Link } from '../../lib/router';
import { Badge } from '../../ui/Badge';
import { Button, ButtonLink } from '../../ui/Button';
import { Card, CardHeader, DetailList } from '../../ui/Card';
import { EmptyState } from '../../ui/Feedback';
import { Select } from '../../ui/Field';
import { PageHeader } from '../../ui/Layout';
import { TabPanel, Tabs } from '../../ui/Tabs';
import { useToast } from '../../ui/Toast';
import { BallBadge, MaskedNationalId, PriorityBadge, SlaBadge, StatusBadge } from '../components';
import { DocumentsPanel } from './DocumentsPanel';
import { FinancePanel } from './FinancePanel';
import { StatusDialog } from './StatusDialog';
import { StepsPanel } from './StepsPanel';
import { TimelinePanel } from './TimelinePanel';

type Tab = 'steps' | 'documents' | 'finance' | 'timeline';

export function RequestDetailPage({ id }: { id: string }) {
  const user = useUser();
  const { can } = useAuth();
  const db = useDb();
  const { toast } = useToast();
  const [tab, setTab] = useState<Tab>('steps');
  const [statusOpen, setStatusOpen] = useState(false);
  const logged = useRef<string | null>(null);

  const request = db.requests.find((r) => r.id === id);
  const visible = request && (user.role === 'admin' || request.branch_id === user.branch_id);

  useEffect(() => {
    if (visible && logged.current !== id) {
      logged.current = id;
      store.logRequestView(user, id);
    }
  }, [id, visible, user]);

  if (!request || !visible) {
    return <EmptyState icon={SearchX} title="المعاملة غير موجودة" description="ربما تخص فرعًا آخر أو تم كتابة الرقم خطأ." action={<ButtonLink to="/app/requests">العودة للمعاملات</ButtonLink>} />;
  }

  const client = db.clients.find((c) => c.id === request.client_id);
  const service = db.services.find((s) => s.id === request.service_id);
  const branch = db.branches.find((b) => b.id === request.branch_id);
  const progress = progressOf(request);
  const finance = financeOf(db, request.id);
  const missing = missingDocuments(db, request);
  const poa = db.powers_of_attorney.find((p) => p.client_id === request.client_id && !p.revoked_at);
  const staff = db.profiles.filter((p) => p.is_active && p.role !== 'accountant' && (p.role === 'admin' || p.branch_id === request.branch_id));
  const closed = isClosed(request);

  const assign = (assigneeId: string) => {
    try {
      store.assign(user, request.id, assigneeId);
      toast('تم إسناد المعاملة');
    } catch (e) {
      toast(e instanceof DomainError ? e.message : 'تعذّر الإسناد', { tone: 'danger' });
    }
  };

  return (
    <>
      <PageHeader
        breadcrumbs={[{ label: 'المعاملات', to: '/app/requests' }, { label: request.ref }]}
        title={service?.name ?? 'معاملة'}
        meta={
          <>
            <span className="ltr-nums text-sm font-semibold text-brand-ink">{request.ref}</span>
            <StatusBadge status={request.status} />
            <BallBadge status={request.status} />
            <PriorityBadge priority={request.priority} />
          </>
        }
        actions={
          can('requests.update') &&
          !closed && (
            <Button icon={ArrowLeftRight} onClick={() => setStatusOpen(true)}>
              تحديث الحالة
            </Button>
          )
        }
      />

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <Card className="min-w-0">
          <Tabs
            label="أقسام المعاملة"
            value={tab}
            onChange={setTab}
            className="px-3"
            items={[
              { id: 'steps', label: 'خطوات الإجراء', icon: ListChecks, count: request.steps.length },
              { id: 'documents', label: 'المستندات', icon: FileStack, count: db.documents.filter((d) => d.request_id === request.id).length },
              { id: 'finance', label: 'المالية', icon: Coins },
              { id: 'timeline', label: 'السجل', icon: History },
            ]}
          />
          <TabPanel label="محتوى القسم">
            {tab === 'steps' && <StepsPanel request={request} />}
            {tab === 'documents' && <DocumentsPanel request={request} />}
            {tab === 'finance' && <FinancePanel request={request} />}
            {tab === 'timeline' && <TimelinePanel request={request} />}
          </TabPanel>
        </Card>

        <div className="space-y-4">
          {!closed && (
            <Card className="border-brand/30 bg-brand-soft/40">
              <div className="p-4">
                <p className="text-xs font-medium text-brand-ink">المطلوب الآن · {BALL[STATUS[request.status].ball].label}</p>
                <p className="mt-1 font-semibold text-ink">{progress.current ? progress.current.title : 'كل الخطوات منجزة — حدّث الحالة'}</p>
                {progress.current && <p className="mt-0.5 text-xs text-ink-3">المسؤول عن الخطوة: {STEP_OWNER[progress.current.owner]}</p>}
                {missing.length > 0 && (
                  <button type="button" onClick={() => setTab('documents')} className="mt-3 flex items-center gap-1.5 text-[13px] font-medium text-warning hover:underline">
                    <FileWarning className="size-4" aria-hidden />
                    {missing.length} مستند ناقص
                  </button>
                )}
              </div>
            </Card>
          )}

          <Card>
            <CardHeader
              as="h3"
              title="العميل"
              icon={<UserRound className="mt-0.5 size-4 text-ink-3" aria-hidden />}
              actions={
                client && (
                  <Link to={`/app/clients/${client.id}`} className="text-[13px] font-medium text-brand-ink hover:underline">
                    ملف العميل
                  </Link>
                )
              }
            />
            {client && (
              <DetailList
                className="px-5"
                items={[
                  { label: 'الاسم', value: client.business_name ? `${client.full_name} (${client.business_name})` : client.full_name },
                  { label: 'الموبايل', value: <span className="ltr-nums">{formatPhone(client.phone)}</span> },
                  { label: 'الرقم القومي', value: <MaskedNationalId client={client} /> },
                  {
                    label: 'التوكيل',
                    value: poa ? (
                      <span>
                        {poa.scope === 'general' ? 'عام' : 'خاص'} رقم <span className="ltr-nums">{poa.number}</span>
                      </span>
                    ) : service?.requires_poa ? (
                      <Badge tone="warning" size="sm">
                        مطلوب ولم يُسجَّل
                      </Badge>
                    ) : (
                      'غير مطلوب'
                    ),
                  },
                ]}
              />
            )}
          </Card>

          <Card>
            <CardHeader as="h3" title="بيانات المعاملة" icon={<ScrollText className="mt-0.5 size-4 text-ink-3" aria-hidden />} />
            <DetailList
              className="px-5"
              items={[
                {
                  label: 'المسؤول',
                  value:
                    can('requests.assign') && !closed ? (
                      <Select aria-label="إسناد إلى" value={request.assignee_id ?? ''} onChange={(e) => assign(e.target.value)} className="h-8 min-w-40 text-[13px]">
                        <option value="" disabled>
                          اختر موظفًا
                        </option>
                        {staff.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.full_name}
                          </option>
                        ))}
                      </Select>
                    ) : (
                      db.profiles.find((p) => p.id === request.assignee_id)?.full_name ?? <span className="text-warning">غير مسندة</span>
                    ),
                },
                { label: 'الفرع', value: branch?.short },
                { label: 'طريقة الطلب', value: CHANNEL[request.channel] },
                { label: 'تاريخ الاستلام', value: formatDate(request.received_at) },
                { label: 'الموعد المستهدف', value: <SlaBadge request={request} /> },
                { label: 'رقم لدى الجهة', value: request.authority_ref ? <span className="text-[13px]">{request.authority_ref}</span> : '—' },
              ]}
            />
            {request.notes && <p className="border-t border-line px-5 py-3 text-[13px] text-ink-2">{request.notes}</p>}
          </Card>

          <Card>
            <CardHeader as="h3" title="الموقف المالي" icon={<Coins className="mt-0.5 size-4 text-ink-3" aria-hidden />} />
            <DetailList
              className="px-5"
              items={[
                { label: 'الأتعاب', value: formatMoney(finance.officeFee) },
                { label: 'المتبقي من الأتعاب', value: <span className={finance.officeDue > 0 ? 'text-danger' : 'text-success'}>{formatMoney(finance.officeDue)}</span> },
                { label: 'رصيد أمانة الرسوم', value: <span className="text-accent">{formatMoney(finance.govBalance)}</span> },
              ]}
            />
          </Card>

          {service && (
            <Card>
              <CardHeader as="h3" title="مرجع الإجراء" icon={<FileStack className="mt-0.5 size-4 text-ink-3" aria-hidden />} />
              <div className="space-y-2 px-5 py-4 text-[13px] text-ink-2">
                <p>
                  <span className="text-ink-3">الجهة: </span>
                  {service.authority}
                </p>
                <p>
                  <span className="text-ink-3">السند: </span>
                  {service.legal_basis}
                </p>
              </div>
            </Card>
          )}
        </div>
      </div>

      {statusOpen && <StatusDialog open request={request} onClose={() => setStatusOpen(false)} />}
    </>
  );
}
