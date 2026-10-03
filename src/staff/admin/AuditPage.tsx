import { useMemo, useState } from 'react';
import { Download, FlaskConical, Link2, RotateCcw, ShieldAlert, ShieldCheck } from 'lucide-react';
import { useAuth, useUser } from '../../app/AuthContext';
import { store } from '../../data/engine';
import { useDb } from '../../data/hooks';
import { AUDIT_ACTIONS, ROLE } from '../../data/meta';
import { downloadCsv } from '../../lib/csv';
import { formatDateTime } from '../../lib/format';
import { Button } from '../../ui/Button';
import { Card, CardHeader } from '../../ui/Card';
import { Alert, EmptyState } from '../../ui/Feedback';
import { Input, Select } from '../../ui/Field';
import { PageHeader, Table, TableWrap, Td, Th } from '../../ui/Layout';
import { useToast } from '../../ui/Toast';

const PAGE = 50;

export function AuditPage() {
  const user = useUser();
  const { can } = useAuth();
  const db = useDb();
  const { toast } = useToast();
  const [actor, setActor] = useState('');
  const [action, setAction] = useState('');
  const [q, setQ] = useState('');
  const [limit, setLimit] = useState(PAGE);
  const [verification, setVerification] = useState<ReturnType<typeof store.verifyAudit> | null>(null);

  const scoped = useMemo(() => db.audit.filter((a) => user.role === 'admin' || a.branch_id === user.branch_id), [db.audit, user]);
  const rows = useMemo(
    () =>
      scoped
        .filter((a) => !actor || a.actor_id === actor)
        .filter((a) => !action || a.action.startsWith(action))
        .filter((a) => !q.trim() || a.summary.includes(q.trim()))
        .slice()
        .reverse(),
    [scoped, actor, action, q],
  );
  const actors = Array.from(new Map(scoped.map((a) => [a.actor_id, a.actor_name])).entries());
  const groups = [
    ['auth', 'الدخول والجلسات'],
    ['client', 'العملاء'],
    ['request', 'المعاملات'],
    ['document', 'المستندات'],
    ['payment', 'التحصيل'],
    ['disbursement', 'صرف الرسوم'],
    ['receipt', 'طباعة الإيصالات'],
    ['export', 'التصدير'],
    ['public', 'الموقع العام'],
  ] as const;

  return (
    <>
      <PageHeader
        title="سجل النشاط"
        description="كل عملية تُسجَّل: من فعلها، ومتى، ومن أي جهاز، وعلى أي سجل. السجل للإضافة فقط ولا يمكن تعديله أو حذفه."
        actions={
          <>
            <Button
              variant="secondary"
              icon={Download}
              onClick={() => {
                downloadCsv(
                  `سجل-النشاط-${new Date().toISOString().slice(0, 10)}.csv`,
                  ['م', 'الوقت', 'المستخدم', 'الدور', 'العملية', 'التفاصيل', 'الجهاز', 'البصمة'],
                  rows.map((a) => [a.seq, formatDateTime(a.at), a.actor_name, a.actor_role in ROLE ? ROLE[a.actor_role as keyof typeof ROLE].label : a.actor_role, AUDIT_ACTIONS[a.action] ?? a.action, a.summary, a.ip, a.hash]),
                );
              }}
            >
              تصدير
            </Button>
            <Button
              icon={ShieldCheck}
              onClick={() => {
                const result = store.verifyAudit(user);
                setVerification(result);
              }}
            >
              التحقق من سلامة السجل
            </Button>
          </>
        }
      />

      {verification &&
        (verification.ok ? (
          <Alert tone="success" className="mb-4" title="السجل سليم">
            تم التحقق من تسلسل {verification.checked} عملية: كل سجل مرتبط ببصمة السجل السابق ولم يُعدَّل أي منها.
          </Alert>
        ) : (
          <Alert tone="danger" icon={ShieldAlert} className="mb-4" title={`تم اكتشاف تلاعب عند العملية رقم ${verification.brokenAt}`}>
            بصمة هذا السجل لا تطابق محتواه. في النسخة الفعلية يصل تنبيه فوري للمدير العام، ويُقارن السجل بالنسخة المؤرشفة خارج الخادم.
          </Alert>
        ))}

      <Card>
        <div className="flex flex-wrap items-center gap-2 border-b border-line p-3">
          <div className="w-full sm:w-64">
            <Input type="search" aria-label="بحث في التفاصيل" placeholder="بحث برقم معاملة أو اسم…" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          <Select aria-label="المستخدم" value={actor} onChange={(e) => setActor(e.target.value)} className="w-auto">
            <option value="">كل المستخدمين</option>
            {actors.map(([id, name]) => (
              <option key={id} value={id}>
                {name}
              </option>
            ))}
          </Select>
          <Select aria-label="نوع العملية" value={action} onChange={(e) => setAction(e.target.value)} className="w-auto">
            <option value="">كل العمليات</option>
            {groups.map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </Select>
          <span className="ms-auto text-[13px] text-ink-3">{rows.length} عملية</span>
        </div>

        {rows.length === 0 ? (
          <EmptyState icon={ShieldCheck} title="لا توجد عمليات مطابقة" />
        ) : (
          <TableWrap>
            <Table>
              <thead>
                <tr>
                  <Th>م</Th>
                  <Th>الوقت</Th>
                  <Th>المستخدم</Th>
                  <Th>العملية</Th>
                  <Th>التفاصيل</Th>
                  <Th>الجهاز</Th>
                  <Th>البصمة</Th>
                </tr>
              </thead>
              <tbody>
                {rows.slice(0, limit).map((a) => (
                  <tr key={a.id}>
                    <Td className="text-xs text-ink-3 tabular">{a.seq}</Td>
                    <Td className="text-[13px] whitespace-nowrap">{formatDateTime(a.at)}</Td>
                    <Td>
                      <p className="text-[13px] font-medium whitespace-nowrap text-ink">{a.actor_name}</p>
                      <p className="text-xs text-ink-3">{a.actor_role in ROLE ? ROLE[a.actor_role as keyof typeof ROLE].label : a.actor_role === 'public' ? 'من الإنترنت' : 'النظام'}</p>
                    </Td>
                    <Td className="text-[13px] whitespace-nowrap">{AUDIT_ACTIONS[a.action] ?? a.action}</Td>
                    <Td className="min-w-64 max-w-96 text-[13px]">{a.summary}</Td>
                    <Td className="text-xs whitespace-nowrap">{a.ip}</Td>
                    <Td>
                      <span className="ltr-nums inline-flex items-center gap-1 font-mono text-[11px] text-ink-3" title={`${a.hash}\nالسابق: ${a.prev_hash}`}>
                        <Link2 className="size-3" aria-hidden />
                        {a.hash.slice(0, 10)}…
                      </span>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </TableWrap>
        )}
        {rows.length > limit && (
          <div className="border-t border-line p-3 text-center">
            <Button variant="ghost" size="sm" onClick={() => setLimit(limit + PAGE)}>
              عرض المزيد
            </Button>
          </div>
        )}
      </Card>

      {can('demo.reset') && (
        <Card className="mt-4 border-dashed">
          <CardHeader
            as="h2"
            title="أدوات نسخة العرض"
            description="لتجربة اكتشاف التلاعب أمام المكتب ثم إرجاع البيانات لحالتها الأصلية"
            icon={<FlaskConical className="mt-0.5 size-4 text-ink-3" aria-hidden />}
            actions={
              <>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => {
                    const seq = store.simulateTampering(user);
                    setVerification(null);
                    toast(`تم تعديل العملية رقم ${seq} يدويًا`, { description: 'اضغط «التحقق من سلامة السجل» لترى النتيجة.', tone: 'danger' });
                  }}
                >
                  محاكاة تعديل غير مصرح
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  icon={RotateCcw}
                  onClick={() => {
                    store.resetDemo(user);
                    setVerification(null);
                    toast('تمت إعادة ضبط بيانات العرض');
                  }}
                >
                  إعادة ضبط البيانات
                </Button>
              </>
            }
          />
        </Card>
      )}
    </>
  );
}
