import { useEffect, useRef, useState } from 'react';
import { FileSignature, Pencil, Plus, SearchX, ShieldCheck } from 'lucide-react';
import { ClientFormDialog } from './ClientFormDialog';
import { useAuth, useUser } from '../../app/AuthContext';
import { store } from '../../data/engine';
import { useDb } from '../../data/hooks';
import { CHANNEL } from '../../data/meta';
import { financeOf } from '../../data/selectors';
import { formatDate, formatDateTime, formatMoney, formatPhone } from '../../lib/format';
import { parseNationalId } from '../../lib/validation';
import { Badge } from '../../ui/Badge';
import { Button, ButtonLink } from '../../ui/Button';
import { Card, CardHeader, DetailList } from '../../ui/Card';
import { Alert, EmptyState } from '../../ui/Feedback';
import { Avatar, PageHeader } from '../../ui/Layout';
import { MaskedNationalId } from '../components';
import { NewRequestDialog } from '../requests/NewRequestDialog';
import { RequestListItem } from '../requests/RequestListItem';

export function ClientDetailPage({ id }: { id: string }) {
  const user = useUser();
  const { can } = useAuth();
  const db = useDb();
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState(false);
  const logged = useRef<string | null>(null);
  const client = db.clients.find((c) => c.id === id);
  const visible = client && (user.role === 'admin' || client.branch_id === user.branch_id);

  useEffect(() => {
    if (visible && logged.current !== id) {
      logged.current = id;
      store.logClientView(user, id);
    }
  }, [id, visible, user]);

  if (!client || !visible) {
    return <EmptyState icon={SearchX} title="العميل غير موجود" action={<ButtonLink to="/app/clients">العودة للعملاء</ButtonLink>} />;
  }

  const requests = db.requests.filter((r) => r.client_id === client.id).sort((a, b) => b.received_at.localeCompare(a.received_at));
  const poas = db.powers_of_attorney.filter((p) => p.client_id === client.id);
  const due = requests.reduce((s, r) => s + financeOf(db, r.id).officeDue, 0);
  const trust = requests.reduce((s, r) => s + financeOf(db, r.id).govBalance, 0);
  const nid = client.national_id ? parseNationalId(client.national_id) : null;

  return (
    <>
      <PageHeader
        breadcrumbs={[{ label: 'العملاء', to: '/app/clients' }, { label: client.full_name }]}
        title={
          <span className="flex items-center gap-3">
            <Avatar name={client.full_name} size="lg" />
            {client.business_name ?? client.full_name}
          </span>
        }
        description={client.business_name ? `الممثل: ${client.full_name}` : undefined}
        actions={
          <>
            {can('clients.create') && (
              <Button variant="secondary" icon={Pencil} onClick={() => setEditing(true)}>
                تعديل البيانات
              </Button>
            )}
            {can('requests.create') && (
              <Button icon={Plus} onClick={() => setCreating(true)}>
                معاملة جديدة لهذا العميل
              </Button>
            )}
          </>
        }
      />

      {!client.national_id && (
        <Alert
          tone="warning"
          className="mb-4"
          title="الهوية لم يُتحقق منها"
          action={
            can('clients.create') && (
              <Button size="sm" variant="secondary" onClick={() => setEditing(true)}>
                تسجيل الرقم القومي
              </Button>
            )
          }
        >
          سُجّل العميل من الموقع. اطلب أصل البطاقة عند حضوره وسجّل الرقم القومي قبل التقديم لأي جهة.
        </Alert>
      )}

      <div className="grid gap-4 xl:grid-cols-[22rem_minmax(0,1fr)]">
        <div className="space-y-4">
          <Card>
            <CardHeader as="h2" title="البيانات الأساسية" />
            <DetailList
              className="px-5"
              items={[
                { label: 'الرقم القومي', value: <MaskedNationalId client={client} /> },
                ...(nid?.ok ? [{ label: 'محافظة الميلاد', value: nid.info.governorate }] : []),
                { label: 'الموبايل', value: <span className="ltr-nums">{formatPhone(client.phone)}</span> },
                ...(client.phone_alt ? [{ label: 'موبايل إضافي', value: <span className="ltr-nums">{formatPhone(client.phone_alt)}</span> }] : []),
                { label: 'العنوان', value: client.address || '—' },
                { label: 'الفرع', value: db.branches.find((b) => b.id === client.branch_id)?.short },
                { label: 'عميل منذ', value: formatDate(client.created_at) },
              ]}
            />
            {client.notes && <p className="border-t border-line px-5 py-3 text-[13px] text-ink-2">{client.notes}</p>}
          </Card>

          <Card>
            <CardHeader as="h2" title="الموافقة على معالجة البيانات" icon={<ShieldCheck className="mt-0.5 size-4 text-success" aria-hidden />} />
            <p className="px-5 py-4 text-[13px] text-ink-2">
              {client.consent ? (
                <>
                  وافق على إشعار الخصوصية (<span className="ltr-nums">{client.consent.version}</span>) في {formatDateTime(client.consent.at)} عبر {CHANNEL[client.consent.channel]}.
                </>
              ) : (
                'لا توجد موافقة مسجلة.'
              )}
            </p>
          </Card>

          <Card>
            <CardHeader as="h2" title="الموقف المالي" />
            <DetailList
              className="px-5"
              items={[
                { label: 'مستحقات أتعاب', value: <span className={due > 0 ? 'text-danger' : ''}>{formatMoney(due)}</span> },
                { label: 'أمانات رسوم لم تُصرف', value: formatMoney(Math.max(0, trust)) },
              ]}
            />
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader as="h2" title="المعاملات" description={`${requests.length} معاملة`} />
            {requests.length === 0 ? (
              <EmptyState icon={SearchX} title="لا توجد معاملات بعد" />
            ) : (
              <ul className="divide-y divide-line">
                {requests.map((r) => (
                  <RequestListItem key={r.id} request={r} showClient={false} />
                ))}
              </ul>
            )}
          </Card>

          <Card>
            <CardHeader as="h2" title="التوكيلات" description="سند تمثيل المكتب أمام الجهات — راجع النطاق والصلاحية قبل كل تقديم" icon={<FileSignature className="mt-0.5 size-4 text-ink-3" aria-hidden />} />
            {poas.length === 0 ? (
              <p className="px-5 py-6 text-sm text-ink-3">لا يوجد توكيل مسجل. بعض الجهات تشترط توكيلًا رسميًا للمكتب أو مندوبه.</p>
            ) : (
              <ul className="divide-y divide-line">
                {poas.map((p) => {
                  const expired = p.expires_at && p.expires_at < new Date().toISOString();
                  return (
                    <li key={p.id} className="px-5 py-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-medium text-ink">
                          توكيل {p.scope === 'general' ? 'عام' : 'خاص'} رقم <span className="ltr-nums">{p.number}</span>
                        </p>
                        {p.revoked_at ? <Badge tone="danger" size="sm">ملغي</Badge> : expired ? <Badge tone="warning" size="sm">منتهي</Badge> : <Badge tone="success" size="sm">ساري</Badge>}
                      </div>
                      <p className="mt-1 text-[13px] text-ink-2">{p.subject}</p>
                      <p className="mt-1 text-xs text-ink-3">
                        {p.notary_office} · {formatDate(p.issued_at)} · الوكلاء: {p.agents.join('، ')}
                      </p>
                    </li>
                  );
                })}
              </ul>
            )}
          </Card>
        </div>
      </div>

      {creating && <NewRequestDialog open clientId={client.id} onClose={() => setCreating(false)} />}
      {editing && <ClientFormDialog client={client} onClose={() => setEditing(false)} />}
    </>
  );
}
