import { useState } from 'react';
import { Printer } from 'lucide-react';
import { useUser } from '../../app/AuthContext';
import { DomainError, store } from '../../data/engine';
import { useDb } from '../../data/hooks';
import { PAYMENT_KIND, PAYMENT_METHOD } from '../../data/meta';
import { financeOf } from '../../data/selectors';
import type { PaymentKind, PaymentMethod, PaymentRecord, RequestRecord } from '../../data/types';
import { amountInWords, digitsOnly, formatDateTime, formatMoney } from '../../lib/format';
import { Button } from '../../ui/Button';
import { Dialog } from '../../ui/Dialog';
import { Alert } from '../../ui/Feedback';
import { Field, Input, Select } from '../../ui/Field';
import { LogoMark } from '../../ui/Logo';
import { useToast } from '../../ui/Toast';

export function PaymentDialog({ request, open, onClose, onRecorded }: { request: RequestRecord; open: boolean; onClose: () => void; onRecorded: (p: PaymentRecord) => void }) {
  const user = useUser();
  const db = useDb();
  const finance = financeOf(db, request.id);
  const [kind, setKind] = useState<PaymentKind>(finance.officeDue > 0 ? 'office_fee' : 'gov_fee_deposit');
  const suggested = kind === 'office_fee' ? finance.officeDue : Math.max(0, finance.govEstimate - finance.govDeposited);
  const [amount, setAmount] = useState(String(suggested || ''));
  const [method, setMethod] = useState<PaymentMethod>('cash');
  const [note, setNote] = useState('');
  const [error, setError] = useState<string | null>(null);

  const submit = () => {
    try {
      onRecorded(store.recordPayment(user, request.id, { kind, method, amount: Number(amount), note }));
    } catch (e) {
      setError(e instanceof DomainError ? e.message : 'تعذّر تسجيل المبلغ.');
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="تحصيل مبلغ وإصدار إيصال"
      description={`${request.ref} — رقم الإيصال يصدر تلقائيًا ولا يتكرر`}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            إلغاء
          </Button>
          <Button onClick={submit}>تحصيل وإصدار الإيصال</Button>
        </>
      }
    >
      <div className="space-y-4">
        {error && <Alert tone="danger">{error}</Alert>}
        <fieldset>
          <legend className="mb-2 text-[13px] font-medium text-ink-2">نوع المبلغ</legend>
          <div className="grid gap-2 sm:grid-cols-2">
            {(Object.keys(PAYMENT_KIND) as PaymentKind[]).map((k) => (
              <label key={k} className={`flex cursor-pointer flex-col rounded-xl border p-3 ${kind === k ? 'border-brand bg-brand-soft/60' : 'border-line hover:border-line-strong'}`}>
                <input
                  type="radio"
                  name="kind"
                  className="sr-only"
                  checked={kind === k}
                  onChange={() => {
                    setKind(k);
                    setAmount(String((k === 'office_fee' ? finance.officeDue : Math.max(0, finance.govEstimate - finance.govDeposited)) || ''));
                  }}
                />
                <span className="text-sm font-medium text-ink">{PAYMENT_KIND[k].label}</span>
                <span className="mt-0.5 text-xs text-ink-3">{k === 'office_fee' ? `المتبقي: ${formatMoney(finance.officeDue)}` : 'تُصرف للجهة بإيصال رسمي — ليست إيرادًا للمكتب'}</span>
              </label>
            ))}
          </div>
        </fieldset>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="المبلغ (ج.م)" required>
            <Input inputMode="numeric" dir="ltr" value={amount} onChange={(e) => setAmount(digitsOnly(e.target.value))} />
          </Field>
          <Field label="طريقة الدفع" required>
            <Select value={method} onChange={(e) => setMethod(e.target.value as PaymentMethod)}>
              {(Object.keys(PAYMENT_METHOD) as PaymentMethod[]).map((m) => (
                <option key={m} value={m}>
                  {PAYMENT_METHOD[m]}
                </option>
              ))}
            </Select>
          </Field>
        </div>
        {Number(amount) > 0 && <p className="rounded-lg bg-surface-2 px-3 py-2 text-sm text-ink-2">{amountInWords(Number(amount))}</p>}
        <Field label="ملاحظة (اختياري)">
          <Input value={note} onChange={(e) => setNote(e.target.value)} placeholder="مثال: دفعة ثانية من الأتعاب" />
        </Field>
      </div>
    </Dialog>
  );
}

export function DisbursementDialog({ request, open, onClose }: { request: RequestRecord; open: boolean; onClose: () => void }) {
  const user = useUser();
  const db = useDb();
  const { toast } = useToast();
  const service = db.services.find((s) => s.id === request.service_id);
  const [authority, setAuthority] = useState(service?.authority.split('—')[0].trim() ?? '');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [receipt, setReceipt] = useState('');
  const [error, setError] = useState<string | null>(null);

  const submit = () => {
    try {
      store.recordDisbursement(user, request.id, { authority, description, amount: Number(amount), official_receipt_no: receipt });
      toast('تم تسجيل سداد الرسوم الحكومية');
      onClose();
    } catch (e) {
      setError(e instanceof DomainError ? e.message : 'تعذّر التسجيل.');
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="تسجيل سداد رسوم للجهة"
      description="من أمانة العميل — لا يُقبل بدون رقم الإيصال الحكومي الرسمي"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            إلغاء
          </Button>
          <Button onClick={submit}>تسجيل السداد</Button>
        </>
      }
    >
      <div className="space-y-4">
        {error && <Alert tone="danger">{error}</Alert>}
        <Field label="الجهة" required>
          <Input value={authority} onChange={(e) => setAuthority(e.target.value)} />
        </Field>
        <Field label="بيان الرسم" required>
          <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="مثال: رسم معاينة" />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="المبلغ (ج.م)" required>
            <Input inputMode="numeric" dir="ltr" value={amount} onChange={(e) => setAmount(digitsOnly(e.target.value))} />
          </Field>
          <Field label="رقم الإيصال الحكومي" required hint="ارفع صورة الإيصال في المستندات">
            <Input value={receipt} onChange={(e) => setReceipt(e.target.value)} />
          </Field>
        </div>
      </div>
    </Dialog>
  );
}

/** A5 printable receipt. Production adds the ETA e-receipt UUID/QR when the office is in scope. */
export function ReceiptDialog({ payment, onClose }: { payment: PaymentRecord; onClose: () => void }) {
  const user = useUser();
  const db = useDb();
  const request = db.requests.find((r) => r.id === payment.request_id)!;
  const client = db.clients.find((c) => c.id === request.client_id);
  const service = db.services.find((s) => s.id === request.service_id);
  const branch = db.branches.find((b) => b.id === payment.branch_id);
  const receiver = db.profiles.find((p) => p.id === payment.received_by);
  const finance = financeOf(db, request.id);

  return (
    <Dialog
      open
      onClose={onClose}
      title={`إيصال ${payment.receipt_no}`}
      size="md"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            إغلاق
          </Button>
          <Button
            icon={Printer}
            onClick={() => {
              store.logReceiptPrint(user, payment.id);
              window.print();
            }}
          >
            طباعة
          </Button>
        </>
      }
    >
      <div className="print-area rounded-xl border border-line bg-white p-6 text-[13px] text-black">
        <div className="flex items-start justify-between gap-4 border-b border-black/20 pb-4">
          <div className="flex items-center gap-3">
            <LogoMark />
            <div>
              <p className="text-base font-semibold">الصفوة للخدمات الحكومية والإلكترونية</p>
              <p className="text-xs text-black/60">{branch?.name} · {branch?.phones.join(' / ')}</p>
            </div>
          </div>
          <div className="text-end text-xs">
            <p className="ltr-nums text-sm font-semibold">{payment.receipt_no}</p>
            <p>{formatDateTime(payment.received_at)}</p>
          </div>
        </div>

        <p className="my-4 text-center text-base font-semibold">
          إيصال استلام {payment.kind === 'office_fee' ? 'أتعاب خدمة' : 'أمانة رسوم حكومية'}
          {payment.voided && <span className="ms-2 text-red-700">(ملغي)</span>}
        </p>

        <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5">
          <dt className="text-black/60">استلمنا من</dt>
          <dd className="font-medium">{client?.business_name ? `${client.business_name} — ${client.full_name}` : client?.full_name}</dd>
          <dt className="text-black/60">عن المعاملة</dt>
          <dd>
            <span className="ltr-nums">{request.ref}</span> — {service?.name}
          </dd>
          <dt className="text-black/60">المبلغ</dt>
          <dd className="text-base font-semibold">{formatMoney(payment.amount)}</dd>
          <dt className="text-black/60">بالحروف</dt>
          <dd>{amountInWords(payment.amount)}</dd>
          <dt className="text-black/60">طريقة الدفع</dt>
          <dd>{PAYMENT_METHOD[payment.method]}</dd>
          {payment.note && (
            <>
              <dt className="text-black/60">ملاحظة</dt>
              <dd>{payment.note}</dd>
            </>
          )}
        </dl>

        <div className="mt-4 grid grid-cols-3 gap-2 rounded-lg bg-black/[0.04] p-3 text-center text-xs">
          <div>
            <p className="text-black/60">إجمالي الأتعاب</p>
            <p className="font-semibold">{formatMoney(finance.officeFee)}</p>
          </div>
          <div>
            <p className="text-black/60">المسدد منها</p>
            <p className="font-semibold">{formatMoney(finance.officePaid)}</p>
          </div>
          <div>
            <p className="text-black/60">المتبقي</p>
            <p className="font-semibold">{formatMoney(finance.officeDue)}</p>
          </div>
        </div>

        {payment.kind === 'gov_fee_deposit' && <p className="mt-3 text-xs text-black/70">هذا المبلغ أمانة لسداد الرسوم الحكومية باسمكم، ويُسلَّم لكم الإيصال الرسمي للجهة، ويُرد أي فائض.</p>}

        <div className="mt-8 flex justify-between text-xs">
          <p>المستلم: {receiver?.full_name}</p>
          <p>توقيع العميل: ................</p>
        </div>
        <p className="mt-6 border-t border-black/20 pt-3 text-[11px] text-black/60">
          الصفوة مكتب خاص لخدمات الوساطة في إنهاء الإجراءات، وليس جهة حكومية. الرسوم الحكومية تُسدد للجهات المختصة بإيصالات رسمية.
        </p>
      </div>
    </Dialog>
  );
}
