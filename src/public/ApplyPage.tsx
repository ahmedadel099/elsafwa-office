import { useState } from 'react';
import { CheckCircle2, Copy, Printer } from 'lucide-react';
import { DomainError, store } from '../data/engine';
import { useDb } from '../data/hooks';
import { cn } from '../lib/cn';
import { digitsOnly } from '../lib/format';
import { Link, useLocation } from '../lib/router';
import { parseMobile, parseNationalId } from '../lib/validation';
import { Button, ButtonLink } from '../ui/Button';
import { Alert } from '../ui/Feedback';
import { Checkbox, Field, Input, Select, Textarea } from '../ui/Field';

const STEPS = ['الخدمة والفرع', 'بياناتك', 'المراجعة والإرسال'];

export function ApplyPage() {
  const db = useDb();
  const { query } = useLocation();
  const services = db.services.filter((s) => s.is_active);
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({ service_id: query.get('service') ?? '', branch_id: db.branches[0]?.id ?? '', full_name: '', phone: '', national_id: '', notes: '', consent: false });
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const service = services.find((s) => s.id === form.service_id);
  const branch = db.branches.find((b) => b.id === form.branch_id);

  const next = () => {
    setError(null);
    if (step === 0 && !service) return setError('اختر الخدمة المطلوبة.');
    if (step === 1) {
      if (form.full_name.trim().split(/\s+/).length < 3) return setError('اكتب اسمك ثلاثيًا على الأقل.');
      const phone = parseMobile(form.phone);
      if (!phone.ok) return setError(phone.error);
      if (form.national_id) {
        const nid = parseNationalId(form.national_id);
        if (!nid.ok) return setError(nid.error);
      }
    }
    setStep(step + 1);
  };

  const submit = () => {
    setError(null);
    try {
      setDone(store.submitPublicRequest(form).ref);
    } catch (e) {
      setError(e instanceof DomainError ? e.message : 'تعذّر إرسال الطلب، حاول مرة أخرى.');
    }
  };

  if (done) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 sm:px-6">
        <div className="print-area rounded-2xl border border-line bg-surface p-8 text-center shadow-card">
          <CheckCircle2 className="mx-auto size-12 text-success" aria-hidden />
          <h1 className="mt-4 text-2xl font-semibold text-ink">وصلنا طلبك</h1>
          <p className="mt-2 text-ink-2">سنتصل بك على {form.phone} خلال يوم عمل لتحديد موعد تسليم الأوراق في {branch?.name}.</p>
          <div className="mt-6 rounded-xl bg-brand-soft px-4 py-5">
            <p className="text-sm text-brand-ink">رقم المعاملة</p>
            <p className="ltr-nums mt-1 text-3xl font-semibold tracking-wide text-ink">{done}</p>
          </div>
          <p className="mt-4 text-sm text-ink-3">احتفظ بالرقم لتتبّع طلبك. لم يتم تحصيل أي مبلغ؛ الأتعاب والرسوم تُحدد وتُدفع في الفرع بإيصال.</p>
          {service && (
            <div className="mt-6 text-start">
              <p className="text-sm font-semibold text-ink">أحضر معك عند الزيارة:</p>
              <ul className="mt-2 list-disc space-y-1 ps-5 text-sm text-ink-2">
                {service.required_documents.map((d) => (
                  <li key={d.name}>{d.name}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
        <div className="no-print mt-6 flex flex-wrap justify-center gap-3">
          <Button
            variant="secondary"
            icon={Copy}
            onClick={() => {
              void navigator.clipboard?.writeText(done);
              setCopied(true);
            }}
          >
            {copied ? 'تم النسخ' : 'نسخ الرقم'}
          </Button>
          <Button variant="secondary" icon={Printer} onClick={() => window.print()}>
            طباعة
          </Button>
          <ButtonLink to={`/track?ref=${done}&phone=${form.phone}`}>تتبّع الطلب</ButtonLink>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-semibold text-ink">ابدأ طلبك</h1>
      <p className="mt-2 text-ink-2">سجّل طلبك وسنتواصل معك لتحديد موعد تسليم الأوراق. لا يلزم دفع أي مبلغ الآن.</p>

      <ol className="mt-8 flex gap-2" aria-label="مراحل الطلب">
        {STEPS.map((label, index) => (
          <li key={label} className="flex-1" aria-current={index === step ? 'step' : undefined}>
            <div className={cn('h-1.5 rounded-full', index <= step ? 'bg-brand' : 'bg-surface-3')} />
            <p className={cn('mt-2 text-[13px]', index === step ? 'font-medium text-ink' : 'text-ink-3')}>
              {index + 1}. {label}
            </p>
          </li>
        ))}
      </ol>

      <div className="mt-6 rounded-2xl border border-line bg-surface p-6 shadow-card">
        {error && (
          <Alert tone="danger" className="mb-5">
            {error}
          </Alert>
        )}

        {step === 0 && (
          <div className="space-y-5">
            <Field label="الخدمة المطلوبة" required>
              <Select value={form.service_id} onChange={(e) => setForm({ ...form, service_id: e.target.value })}>
                <option value="">اختر الخدمة</option>
                {services.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </Select>
            </Field>
            {service && (
              <Alert tone="info" title={`${service.required_documents.length} مستندات مطلوبة · حوالي ${service.estimated_days} يوم عمل`}>
                <Link to={`/services/${service.id}`} className="font-medium underline">
                  اطّلع على القائمة والخطوات
                </Link>
              </Alert>
            )}
            <fieldset>
              <legend className="mb-2 text-[13px] font-medium text-ink-2">الفرع الأقرب لك</legend>
              <div className="grid gap-2 sm:grid-cols-2">
                {db.branches.map((b) => (
                  <label key={b.id} className={cn('cursor-pointer rounded-xl border p-3', form.branch_id === b.id ? 'border-brand bg-brand-soft/60' : 'border-line hover:border-line-strong')}>
                    <input type="radio" name="branch" className="sr-only" checked={form.branch_id === b.id} onChange={() => setForm({ ...form, branch_id: b.id })} />
                    <span className="block text-sm font-medium text-ink">{b.name}</span>
                    <span className="mt-0.5 block text-xs text-ink-3">{b.address}</span>
                  </label>
                ))}
              </div>
            </fieldset>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-5">
            <Field label="الاسم كما في البطاقة" required hint="ثلاثي على الأقل">
              <Input inputSize="lg" autoComplete="name" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} />
            </Field>
            <Field label="رقم الموبايل" required hint="نتواصل عليه ونرسل عليه رمز التتبع">
              <Input inputSize="lg" dir="ltr" inputMode="tel" autoComplete="tel" placeholder="01xxxxxxxxx" value={form.phone} onChange={(e) => setForm({ ...form, phone: digitsOnly(e.target.value).slice(0, 11) })} />
            </Field>
            <Field label="الرقم القومي (اختياري)" hint="يمكنك تركه الآن؛ سنطّلع على البطاقة الأصلية عند زيارتك الفرع">
              <Input inputSize="lg" dir="ltr" inputMode="numeric" value={form.national_id} onChange={(e) => setForm({ ...form, national_id: digitsOnly(e.target.value).slice(0, 14) })} />
            </Field>
            <Field label="تفاصيل تساعدنا (اختياري)" hint="مثال: نوع النشاط، عنوان العقار — لا تكتب كلمات مرور أو بيانات بنكية">
              <Textarea rows={3} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
            </Field>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-5">
            <dl className="divide-y divide-line rounded-xl border border-line text-sm">
              {[
                ['الخدمة', service?.name],
                ['الفرع', branch?.name],
                ['الاسم', form.full_name],
                ['الموبايل', form.phone],
                ['الرقم القومي', form.national_id || 'سيُستكمل في الفرع'],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between gap-4 px-4 py-2.5">
                  <dt className="text-ink-3">{label}</dt>
                  <dd className="text-ink">{value}</dd>
                </div>
              ))}
            </dl>
            <Checkbox
              label={
                <>
                  قرأت{' '}
                  <Link to="/privacy" className="font-medium text-brand-ink underline">
                    إشعار الخصوصية
                  </Link>{' '}
                  وأوافق على استخدام بياناتي لغرض متابعة هذا الطلب فقط
                </>
              }
              checked={form.consent}
              onChange={(e) => setForm({ ...form, consent: e.target.checked })}
            />
          </div>
        )}

        <div className="mt-8 flex justify-between gap-3">
          {step > 0 ? (
            <Button variant="secondary" onClick={() => setStep(step - 1)}>
              السابق
            </Button>
          ) : (
            <span />
          )}
          {step < 2 ? (
            <Button onClick={next}>التالي</Button>
          ) : (
            <Button onClick={submit} disabled={!form.consent}>
              إرسال الطلب
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
