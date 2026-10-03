import { useState } from 'react';
import { Ban, Landmark, Plus, Printer, Receipt } from 'lucide-react';
import { useAuth, useUser } from '../../app/AuthContext';
import { DomainError, store } from '../../data/engine';
import { useDb } from '../../data/hooks';
import { PAYMENT_KIND, PAYMENT_METHOD } from '../../data/meta';
import { financeOf } from '../../data/selectors';
import type { PaymentRecord, RequestRecord } from '../../data/types';
import { cn } from '../../lib/cn';
import { formatDateTime, formatMoney } from '../../lib/format';
import { Badge } from '../../ui/Badge';
import { Button } from '../../ui/Button';
import { Dialog } from '../../ui/Dialog';
import { Field, Textarea } from '../../ui/Field';
import { Table, TableWrap, Td, Th } from '../../ui/Layout';
import { useToast } from '../../ui/Toast';
import { DisbursementDialog, PaymentDialog, ReceiptDialog } from './MoneyDialogs';

function Figure({ label, value, tone }: { label: string; value: number; tone?: 'danger' | 'accent' | 'success' }) {
  return (
    <div>
      <p className="text-[13px] text-ink-3">{label}</p>
      <p className={cn('mt-0.5 text-lg font-semibold tabular', tone === 'danger' ? 'text-danger' : tone === 'accent' ? 'text-accent' : tone === 'success' ? 'text-success' : 'text-ink')}>{formatMoney(value)}</p>
    </div>
  );
}

export function FinancePanel({ request }: { request: RequestRecord }) {
  const user = useUser();
  const { can } = useAuth();
  const db = useDb();
  const { toast } = useToast();
  const f = financeOf(db, request.id);
  const payments = db.payments.filter((p) => p.request_id === request.id).sort((a, b) => b.received_at.localeCompare(a.received_at));
  const disbursements = db.disbursements.filter((d) => d.request_id === request.id);
  const [paying, setPaying] = useState(false);
  const [disbursing, setDisbursing] = useState(false);
  const [receipt, setReceipt] = useState<PaymentRecord | null>(null);
  const [voiding, setVoiding] = useState<PaymentRecord | null>(null);
  const [reason, setReason] = useState('');

  return (
    <div className="space-y-6 p-5">
      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-xl border border-line p-4">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-ink">
            <Receipt className="size-4 text-brand-ink" aria-hidden /> أتعاب الخدمة
          </h3>
          <div className="mt-3 grid grid-cols-3 gap-3">
            <Figure label="المتفق عليه" value={f.officeFee} />
            <Figure label="المحصّل" value={f.officePaid} tone="success" />
            <Figure label="المتبقي" value={f.officeDue} tone={f.officeDue > 0 ? 'danger' : undefined} />
          </div>
        </section>
        <section className="rounded-xl border border-line p-4">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-ink">
            <Landmark className="size-4 text-accent" aria-hidden /> أمانات الرسوم الحكومية
          </h3>
          <div className="mt-3 grid grid-cols-3 gap-3">
            <Figure label="المستلم من العميل" value={f.govDeposited} />
            <Figure label="المسدد للجهات" value={f.govSpent} />
            <Figure label={f.govBalance >= 0 ? 'رصيد الأمانة' : 'دفعه المكتب مقدمًا'} value={Math.abs(f.govBalance)} tone={f.govBalance >= 0 ? 'accent' : 'danger'} />
          </div>
          <p className="mt-2 text-xs text-ink-3">التقدير المبدئي للرسوم: {formatMoney(f.govEstimate)}</p>
        </section>
      </div>

      <section>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-sm font-semibold text-ink">الإيصالات</h3>
          {can('payments.record') && (
            <Button size="sm" icon={Plus} onClick={() => setPaying(true)}>
              تحصيل مبلغ
            </Button>
          )}
        </div>
        {payments.length === 0 ? (
          <p className="rounded-xl border border-line px-4 py-6 text-center text-sm text-ink-3">لم يُحصّل أي مبلغ بعد.</p>
        ) : (
          <div className="overflow-hidden rounded-xl border border-line">
            <TableWrap>
              <Table>
                <thead>
                  <tr>
                    <Th>رقم الإيصال</Th>
                    <Th>النوع</Th>
                    <Th>الطريقة</Th>
                    <Th>المستلم</Th>
                    <Th className="text-end">المبلغ</Th>
                    <Th>
                      <span className="sr-only">إجراءات</span>
                    </Th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((p) => (
                    <tr key={p.id} className={cn(p.voided && 'opacity-60')}>
                      <Td>
                        <span className="ltr-nums font-medium text-ink">{p.receipt_no}</span>
                        <p className="text-xs text-ink-3">{formatDateTime(p.received_at)}</p>
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
                      <Td className="text-end whitespace-nowrap">
                        <Button size="sm" variant="ghost" icon={Printer} onClick={() => setReceipt(p)}>
                          طباعة
                        </Button>
                        {!p.voided && can('payments.void') && p.received_by !== user.id && (
                          <Button size="sm" variant="ghost" icon={Ban} onClick={() => setVoiding(p)}>
                            إلغاء
                          </Button>
                        )}
                      </Td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </TableWrap>
          </div>
        )}
      </section>

      <section>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-sm font-semibold text-ink">مدفوعات للجهات (بإيصالات رسمية)</h3>
          {can('disbursements.record') && (
            <Button size="sm" variant="secondary" icon={Plus} onClick={() => setDisbursing(true)}>
              تسجيل سداد رسوم
            </Button>
          )}
        </div>
        {disbursements.length === 0 ? (
          <p className="rounded-xl border border-line px-4 py-6 text-center text-sm text-ink-3">لم تُسدَّد رسوم لأي جهة بعد.</p>
        ) : (
          <ul className="divide-y divide-line rounded-xl border border-line">
            {disbursements.map((d) => (
              <li key={d.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-ink">{d.description}</p>
                  <p className="text-xs text-ink-3">
                    {d.authority} · إيصال رسمي <span className="ltr-nums">{d.official_receipt_no}</span> · {formatDateTime(d.paid_at)}
                  </p>
                </div>
                <p className="font-semibold text-ink tabular">{formatMoney(d.amount)}</p>
              </li>
            ))}
          </ul>
        )}
      </section>

      {paying && (
        <PaymentDialog
          open
          request={request}
          onClose={() => setPaying(false)}
          onRecorded={(p) => {
            setPaying(false);
            setReceipt(p);
            toast(`تم إصدار الإيصال ${p.receipt_no}`);
          }}
        />
      )}
      {disbursing && <DisbursementDialog open request={request} onClose={() => setDisbursing(false)} />}
      {receipt && <ReceiptDialog payment={receipt} onClose={() => setReceipt(null)} />}
      {voiding && (
        <Dialog
          open
          size="sm"
          onClose={() => setVoiding(null)}
          title={`إلغاء الإيصال ${voiding.receipt_no}`}
          description="الإيصال لا يُحذف — يبقى برقمه مع علامة الإلغاء والسبب"
          footer={
            <>
              <Button variant="secondary" onClick={() => setVoiding(null)}>
                تراجع
              </Button>
              <Button
                variant="danger"
                onClick={() => {
                  try {
                    store.voidPayment(user, voiding.id, reason);
                    toast('تم إلغاء الإيصال');
                    setVoiding(null);
                    setReason('');
                  } catch (e) {
                    toast(e instanceof DomainError ? e.message : 'تعذّر الإلغاء', { tone: 'danger' });
                  }
                }}
              >
                تأكيد الإلغاء
              </Button>
            </>
          }
        >
          <Field label="سبب الإلغاء" required>
            <Textarea rows={2} value={reason} onChange={(e) => setReason(e.target.value)} />
          </Field>
        </Dialog>
      )}
    </div>
  );
}
