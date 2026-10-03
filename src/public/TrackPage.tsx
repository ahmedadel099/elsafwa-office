import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Check, Clock, FileWarning, MessageSquareText, Phone, ShieldCheck } from 'lucide-react';
import { store, type TrackingView } from '../data/engine';
import { STATUS } from '../data/meta';
import { cn } from '../lib/cn';
import { digitsOnly, formatDate, formatDateTime, formatPhone } from '../lib/format';
import { useLocation } from '../lib/router';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Alert } from '../ui/Feedback';
import { Field, Input } from '../ui/Field';

type Stage = { name: 'lookup' } | { name: 'otp'; maskedPhone: string; demoCode: string } | { name: 'result'; view: TrackingView };

export function TrackPage() {
  const { query } = useLocation();
  const [ref, setRef] = useState(query.get('ref') ?? '');
  const [phone, setPhone] = useState(query.get('phone') ?? '');
  const [code, setCode] = useState('');
  const [stage, setStage] = useState<Stage>({ name: 'lookup' });
  const [error, setError] = useState<string | null>(null);
  const autoStarted = useRef(false);

  const start = (event?: FormEvent) => {
    event?.preventDefault();
    setError(null);
    const result = store.startTracking(ref, phone);
    if (result.ok) {
      setCode('');
      setStage({ name: 'otp', maskedPhone: result.maskedPhone, demoCode: result.demoCode });
    } else setError(result.message);
  };

  useEffect(() => {
    if (!autoStarted.current && query.get('ref') && query.get('phone')) {
      autoStarted.current = true;
      start();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const verify = (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    const result = store.verifyTracking(ref, code);
    if (result.ok) setStage({ name: 'result', view: result.view });
    else {
      setError(result.message);
      if (result.expired) setStage({ name: 'lookup' });
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-semibold text-ink">تتبّع معاملتك</h1>
      <p className="mt-2 text-ink-2">لحماية بياناتك، نرسل رمز تحقق إلى الموبايل المسجّل قبل عرض أي تفاصيل.</p>

      {stage.name !== 'result' && (
        <div className="mt-8 max-w-md rounded-2xl border border-line bg-surface p-6 shadow-card">
          {error && (
            <Alert tone="danger" className="mb-5">
              {error}
            </Alert>
          )}
          {stage.name === 'lookup' ? (
            <form onSubmit={start} className="space-y-4">
              <Field label="رقم المعاملة" hint="مكتوب على إيصال الاستلام">
                <Input inputSize="lg" dir="ltr" placeholder="SFW-2026-00101" value={ref} onChange={(e) => setRef(e.target.value.toUpperCase())} />
              </Field>
              <Field label="الموبايل المسجّل">
                <Input inputSize="lg" dir="ltr" inputMode="tel" placeholder="01xxxxxxxxx" value={phone} onChange={(e) => setPhone(digitsOnly(e.target.value).slice(0, 11))} />
              </Field>
              <Button type="submit" size="lg" className="w-full" disabled={!ref.trim() || phone.length < 11}>
                إرسال رمز التحقق
              </Button>
            </form>
          ) : (
            <form onSubmit={verify} className="space-y-4">
              <p className="text-sm text-ink-2">
                أرسلنا رمزًا من 6 أرقام إلى <span className="ltr-nums font-medium text-ink">{stage.maskedPhone}</span>. صالح لمدة 5 دقائق.
              </p>
              <div className="flex items-start gap-3 rounded-xl border border-dashed border-line-strong bg-surface-2 p-3 text-sm">
                <MessageSquareText className="mt-0.5 size-4 shrink-0 text-ink-3" aria-hidden />
                <p className="text-ink-2">
                  <span className="block text-xs text-ink-3">رسالة SMS (محاكاة نسخة العرض)</span>
                  الصفوة: رمز التحقق لمتابعة معاملتك هو <span className="ltr-nums font-semibold text-ink">{stage.demoCode}</span>. لا تشاركه مع أحد.
                </p>
              </div>
              <Field label="رمز التحقق">
                <Input inputSize="lg" dir="ltr" inputMode="numeric" autoComplete="one-time-code" maxLength={6} value={code} onChange={(e) => setCode(digitsOnly(e.target.value).slice(0, 6))} className="text-center tracking-[0.5em]" autoFocus />
              </Field>
              <Button type="submit" size="lg" className="w-full" disabled={code.length !== 6}>
                تأكيد وعرض المعاملة
              </Button>
              <Button variant="ghost" className="w-full" onClick={() => setStage({ name: 'lookup' })}>
                تغيير البيانات
              </Button>
            </form>
          )}
        </div>
      )}

      {stage.name === 'result' && <TrackingResult view={stage.view} onDone={() => setStage({ name: 'lookup' })} />}
    </div>
  );
}

function TrackingResult({ view, onDone }: { view: TrackingView; onDone: () => void }) {
  const meta = STATUS[view.status];
  const needsClient = view.status === 'awaiting_client';
  return (
    <div className="mt-8 space-y-4">
      <div className="rounded-2xl border border-line bg-surface p-6 shadow-card">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="ltr-nums text-sm font-semibold text-brand-ink">{view.ref}</p>
            <h2 className="mt-1 text-xl font-semibold text-ink">{view.service}</h2>
            <p className="mt-1 text-sm text-ink-3">
              {view.branch.name} · استلمنا الطلب {formatDate(view.received_at)}
            </p>
          </div>
          <Badge tone={meta.tone} icon={meta.icon}>
            {meta.publicLabel}
          </Badge>
        </div>
        {view.status !== 'completed' && view.status !== 'cancelled' && view.status !== 'rejected' && (
          <p className="mt-4 flex items-center gap-2 rounded-lg bg-surface-2 px-3 py-2 text-sm text-ink-2">
            <Clock className="size-4 text-ink-3" aria-hidden /> الموعد التقديري: {formatDate(view.target_date)} — يعتمد على سرعة الجهة المختصة.
          </p>
        )}
        {needsClient && view.updates[0] && (
          <Alert tone="warning" icon={FileWarning} className="mt-4" title="مطلوب منك">
            {view.updates[0].message}
          </Alert>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-line bg-surface p-6">
          <h3 className="font-semibold text-ink">مراحل المعاملة</h3>
          <ol className="mt-4 space-y-3">
            {view.milestones.map((m, i) => {
              const current = !m.done && view.milestones.slice(0, i).every((x) => x.done);
              return (
                <li key={m.title} className="flex gap-3">
                  <span className={cn('mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full border-2', m.done ? 'border-success bg-success text-surface' : current ? 'border-brand' : 'border-line-strong')}>
                    {m.done && <Check className="size-3.5" strokeWidth={3} aria-hidden />}
                  </span>
                  <div>
                    <p className={cn('text-sm', m.done ? 'text-ink' : current ? 'font-medium text-ink' : 'text-ink-3')}>{m.title}</p>
                    {m.done_at && <p className="text-xs text-ink-3">{formatDate(m.done_at)}</p>}
                    {current && <p className="text-xs text-brand-ink">جاري العمل عليها</p>}
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
        <div className="rounded-2xl border border-line bg-surface p-6">
          <h3 className="font-semibold text-ink">آخر التحديثات</h3>
          <ol className="mt-4 space-y-4">
            {view.updates.map((u, i) => (
              <li key={i} className="border-s-2 border-line ps-3">
                <p className="text-sm text-ink">{u.message}</p>
                <p className="text-xs text-ink-3">{formatDateTime(u.at)}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line bg-surface p-5 text-sm">
        <p className="flex items-center gap-2 text-ink-2">
          <ShieldCheck className="size-4 text-success" aria-hidden /> لأي استفسار تواصل مع {view.branch.name}:
          {view.branch.phones.map((p) => (
            <a key={p} href={`tel:${p}`} className="ltr-nums inline-flex items-center gap-1 font-medium text-ink hover:underline">
              <Phone className="size-3.5" aria-hidden />
              {formatPhone(p)}
            </a>
          ))}
        </p>
        <Button variant="ghost" size="sm" onClick={onDone}>
          إنهاء العرض
        </Button>
      </div>
    </div>
  );
}
