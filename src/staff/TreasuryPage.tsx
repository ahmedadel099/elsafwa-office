import { useMemo, useState } from 'react';
import { Banknote, Landmark, Printer, Receipt, Scale } from 'lucide-react';
import { useUser } from '../app/AuthContext';
import { useDb } from '../data/hooks';
import { PAYMENT_KIND, PAYMENT_METHOD } from '../data/meta';
import type { PaymentMethod, PaymentRecord } from '../data/types';
import { cn } from '../lib/cn';
import { formatDateTime, formatMoney } from '../lib/format';
import { Link } from '../lib/router';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Card, CardHeader } from '../ui/Card';
import { EmptyState } from '../ui/Feedback';
import { Select } from '../ui/Field';
import { PageHeader, Stat, Table, TableWrap, Td, Th } from '../ui/Layout';
import { ReceiptDialog } from './requests/MoneyDialogs';

type Period = 'today' | 'week' | 'month' | 'all';

const PERIODS: Record<Period, string> = { today: 'اليوم', week: 'آخر 7 أيام', month: 'هذا الشهر', all: 'الكل' };

function inPeriod(iso: string, period: Period): boolean {
  const date = new Date(iso);
  const now = new Date();
  if (period === 'all') return true;
  if (period === 'today') return date.toDateString() === now.toDateString();
  if (period === 'week') return now.getTime() - date.getTime() <= 7 * 86_400_000;
  return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
}

export function TreasuryPage() {
  const user = useUser();
  const db = useDb();
  const [period, setPeriod] = useState<Period>('month');
  const [branch, setBranch] = useState(user.role === 'admin' ? '' : user.branch_id);
  const [receipt, setReceipt] = useState<PaymentRecord | null>(null);

  const requestsById = useMemo(() => new Map(db.requests.map((r) => [r.id, r])), [db.requests]);
  const payments = db.payments.filter((p) => (!branch || p.branch_id === branch) && inPeriod(p.received_at, period)).sort((a, b) => b.received_at.localeCompare(a.received_at));
  const disbursements = db.disbursements.filter((d) => (!branch || requestsById.get(d.request_id)?.branch_id === branch) && inPeriod(d.paid_at, period));
  const valid = payments.filter((p) => !p.voided);
  const sum = (items: Array<{ amount: number }>) => items.reduce((s, x) => s + x.amount, 0);
  const office = sum(valid.filter((p) => p.kind === 'office_fee'));
  const trustIn = sum(valid.filter((p) => p.kind === 'gov_fee_deposit'));
  const trustOut = sum(disbursements);
  const byMethod = (Object.keys(PAYMENT_METHOD) as PaymentMethod[]).map((m) => ({ method: m, amount: sum(valid.filter((p) => p.method === m)) })).filter((x) => x.amount > 0);
  const cash = sum(valid.filter((p) => p.method === 'cash'));

  return (
    <>
      <PageHeader
        title="الخزينة والإيصالات"
        description="الأتعاب إيراد للمكتب، أما أمانات الرسوم فهي أموال العملاء وتُتابع منفصلة حتى تُصرف بإيصال رسمي"
        actions={
          <>
            {user.role === 'admin' && (
              <Select aria-label="الفرع" value={branch} onChange={(e) => setBranch(e.target.value)} className="w-auto">
                <option value="">كل الفروع</option>
                {db.branches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.short}
                  </option>
                ))}
              </Select>
            )}
            <Select aria-label="الفترة" value={period} onChange={(e) => setPeriod(e.target.value as Period)} className="w-auto">
              {(Object.keys(PERIODS) as Period[]).map((p) => (
                <option key={p} value={p}>
                  {PERIODS[p]}
                </option>
              ))}
            </Select>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="أتعاب محصّلة" value={formatMoney(office)} icon={Receipt} hint={`${valid.filter((p) => p.kind === 'office_fee').length} إيصال`} />
        <Stat label="أمانات رسوم مستلمة" value={formatMoney(trustIn)} icon={Landmark} tone="accent" hint="أموال عملاء — ليست إيرادًا" />
        <Stat label="مسدد للجهات" value={formatMoney(trustOut)} icon={Scale} tone="violet" hint={`${disbursements.length} إيصال حكومي`} />
        <Stat label="النقدية المتوقعة بالدرج" value={formatMoney(cash)} icon={Banknote} tone="success" hint="تُطابق مع العد الفعلي عند الإقفال" />
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1fr)_20rem]">
        <Card>
          <CardHeader title="الإيصالات" description={`${payments.length} إيصال · المُلغى يبقى برقمه للمراجعة`} />
          {payments.length === 0 ? (
            <EmptyState icon={Receipt} title="لا توجد إيصالات في هذه الفترة" />
          ) : (
            <TableWrap>
              <Table>
                <thead>
                  <tr>
                    <Th>الإيصال</Th>
                    <Th>المعاملة</Th>
                    <Th>النوع</Th>
                    <Th>الطريقة</Th>
                    <Th>المستلم</Th>
                    <Th className="text-end">المبلغ</Th>
                    <Th>
                      <span className="sr-only">طباعة</span>
                    </Th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((p) => {
                    const request = requestsById.get(p.request_id);
                    return (
                      <tr key={p.id} className={cn(p.voided && 'opacity-60')}>
                        <Td>
                          <span className="ltr-nums font-medium text-ink">{p.receipt_no}</span>
                          <p className="text-xs text-ink-3">{formatDateTime(p.received_at)}</p>
                        </Td>
                        <Td>
                          {request && (
                            <Link to={`/app/requests/${request.id}`} className="ltr-nums text-brand-ink hover:underline">
                              {request.ref}
                            </Link>
                          )}
                        </Td>
                        <Td>
                          <Badge tone={PAYMENT_KIND[p.kind].tone} size="sm">
                            {PAYMENT_KIND[p.kind].short}
                          </Badge>
                          {p.voided && (
                            <Badge tone="danger" size="sm" className="ms-1">
                              ملغي
                            </Badge>
                          )}
                        </Td>
                        <Td>{PAYMENT_METHOD[p.method]}</Td>
                        <Td className="text-[13px]">{db.profiles.find((x) => x.id === p.received_by)?.full_name}</Td>
                        <Td className={cn('text-end font-semibold tabular text-ink', p.voided && 'line-through')}>{formatMoney(p.amount)}</Td>
                        <Td>
                          <Button size="sm" variant="ghost" icon={Printer} onClick={() => setReceipt(p)} aria-label={`طباعة ${p.receipt_no}`}>
                            <span className="sr-only">طباعة</span>
                          </Button>
                        </Td>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>
            </TableWrap>
          )}
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader as="h3" title="حسب طريقة الدفع" />
            <ul className="space-y-3 p-5">
              {byMethod.length === 0 && <li className="text-sm text-ink-3">لا يوجد</li>}
              {byMethod.map(({ method, amount }) => (
                <li key={method} className="flex items-center justify-between text-sm">
                  <span className="text-ink-2">{PAYMENT_METHOD[method]}</span>
                  <span className="font-semibold text-ink tabular">{formatMoney(amount)}</span>
                </li>
              ))}
            </ul>
          </Card>
          <Card>
            <CardHeader as="h3" title="ضوابط الخزينة" />
            <ul className="list-disc space-y-2 px-5 py-4 ps-9 text-[13px] text-ink-2">
              <li>كل مبلغ يُحصّل بإيصال مرقم تلقائيًا لا يتكرر.</li>
              <li>الإيصال لا يُحذف؛ الإلغاء بسبب مكتوب وبواسطة مدير غير مُصدر الإيصال.</li>
              <li>لا صرف رسوم لجهة بدون رقم الإيصال الحكومي وصورته.</li>
              <li>إقفال يومي يطابق النقدية الفعلية مع النظام ويُسجَّل الفرق.</li>
            </ul>
          </Card>
        </div>
      </div>

      {receipt && <ReceiptDialog payment={receipt} onClose={() => setReceipt(null)} />}
    </>
  );
}
