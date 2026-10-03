import { CheckSquare, Clock, Landmark, Printer, Scale, SearchX } from 'lucide-react';
import { useDb } from '../data/hooks';
import { formatMoney } from '../lib/format';
import { Link } from '../lib/router';
import { Button, ButtonLink } from '../ui/Button';
import { EmptyState } from '../ui/Feedback';

export function ServiceDetailPage({ id }: { id: string }) {
  const db = useDb();
  const service = db.services.find((s) => s.id === id && s.is_active);

  if (!service) {
    return <EmptyState icon={SearchX} title="الخدمة غير موجودة" action={<ButtonLink to="/services">دليل الخدمات</ButtonLink>} className="py-24" />;
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <nav aria-label="مسار التنقل" className="text-[13px] text-ink-3">
        <Link to="/services" className="hover:text-ink hover:underline">
          دليل الخدمات
        </Link>{' '}
        / {service.category}
      </nav>
      <h1 className="mt-3 text-3xl font-semibold text-ink">{service.name}</h1>
      <p className="mt-2 max-w-3xl text-lg text-ink-2">{service.summary}</p>

      <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="space-y-10">
          <section className="print-area" aria-labelledby="docs-title">
            <div className="flex items-center justify-between gap-3">
              <h2 id="docs-title" className="text-xl font-semibold text-ink">
                المستندات المطلوبة
              </h2>
              <Button variant="ghost" size="sm" icon={Printer} onClick={() => window.print()} className="no-print">
                اطبع القائمة
              </Button>
            </div>
            <p className="mt-1 hidden text-sm print:block">الصفوة للخدمات الحكومية والإلكترونية — {service.name}</p>
            <ul className="mt-4 divide-y divide-line rounded-2xl border border-line bg-surface">
              {service.required_documents.map((d) => (
                <li key={d.name} className="flex gap-3 px-5 py-3.5">
                  <CheckSquare className="mt-0.5 size-5 shrink-0 text-brand-ink" aria-hidden />
                  <div>
                    <p className="text-ink">{d.name}</p>
                    {(d.original || d.note) && <p className="text-[13px] text-ink-3">{[d.original && 'أحضر الأصل للاطلاع', d.note].filter(Boolean).join(' · ')}</p>}
                  </div>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-[13px] text-ink-3">قد تطلب الجهة مستندات إضافية حسب حالتك؛ نراجعها معك قبل فتح الملف.</p>
          </section>

          <section aria-labelledby="steps-title">
            <h2 id="steps-title" className="text-xl font-semibold text-ink">
              خطوات الإجراء
            </h2>
            <ol className="mt-4 space-y-0">
              {service.steps.map((step, index) => (
                <li key={step.id} className="relative flex gap-4 pb-6 last:pb-0">
                  {index < service.steps.length - 1 && <span className="absolute start-[15px] top-8 bottom-0 w-px bg-line" aria-hidden />}
                  <span className="z-10 flex size-8 shrink-0 items-center justify-center rounded-full border border-line bg-surface text-sm font-semibold text-brand-ink tabular">{index + 1}</span>
                  <div className="pt-1">
                    <p className="text-ink">{step.title}</p>
                    {step.description && <p className="text-[13px] text-ink-2">{step.description}</p>}
                    <p className="text-[13px] text-ink-3">
                      {step.owner === 'client' ? 'مطلوب منك' : step.owner === 'authority' ? 'لدى الجهة المختصة' : 'يتولاها المكتب'}
                      {step.days ? ` · حوالي ${step.days} يوم عمل` : ''}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </section>
        </div>

        <aside className="space-y-4">
          <div className="rounded-2xl border border-line bg-surface p-5 shadow-card lg:sticky lg:top-24">
            <dl className="space-y-4 text-sm">
              <div className="flex gap-3">
                <Clock className="mt-0.5 size-5 shrink-0 text-ink-3" aria-hidden />
                <div>
                  <dt className="text-ink-3">المدة المتوقعة</dt>
                  <dd className="font-medium text-ink">حوالي {service.estimated_days} يوم عمل</dd>
                </div>
              </div>
              <div className="flex gap-3">
                <Landmark className="mt-0.5 size-5 shrink-0 text-ink-3" aria-hidden />
                <div>
                  <dt className="text-ink-3">الجهة المختصة</dt>
                  <dd className="text-ink">{service.authority}</dd>
                </div>
              </div>
              <div className="flex gap-3">
                <Scale className="mt-0.5 size-5 shrink-0 text-ink-3" aria-hidden />
                <div>
                  <dt className="text-ink-3">التكلفة</dt>
                  <dd className="text-ink">
                    أتعاب المكتب تبدأ من <span className="font-semibold tabular">{formatMoney(service.office_fee)}</span>
                    <span className="mt-1 block text-[13px] text-ink-3">+ الرسوم الحكومية حسب الجهة، تُسدد بإيصال رسمي باسمك.</span>
                  </dd>
                </div>
              </div>
            </dl>
            <ButtonLink to={`/apply?service=${service.id}`} size="lg" className="mt-6 w-full">
              ابدأ الطلب
            </ButtonLink>
            <p className="mt-3 text-center text-xs text-ink-3">لن ندفع أي مبلغ نيابة عنك قبل موافقتك.</p>
          </div>
        </aside>
      </div>
    </div>
  );
}
