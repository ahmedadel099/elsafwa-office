import { useState } from 'react';
import { CircleHelp, Clock, Eye, FileText, Lock, Pencil, Plus } from 'lucide-react';
import { useAuth } from '../../app/AuthContext';
import { useDb } from '../../data/hooks';
import { STEP_OWNER } from '../../data/meta';
import type { ServiceType } from '../../data/types';
import { cn } from '../../lib/cn';
import { formatMoney } from '../../lib/format';
import { Badge } from '../../ui/Badge';
import { Button } from '../../ui/Button';
import { Card, CardHeader } from '../../ui/Card';
import { Alert } from '../../ui/Feedback';
import { PageHeader } from '../../ui/Layout';
import { newServiceDraft, ServiceEditor } from './ServiceEditor';

export function ServicesAdminPage() {
  const { can } = useAuth();
  const db = useDb();
  const [selectedId, setSelectedId] = useState(db.services[0]?.id);
  const [editing, setEditing] = useState<{ service: ServiceType; isNew: boolean } | null>(null);
  const selected = db.services.find((s) => s.id === selectedId);
  const categories = Array.from(new Set(db.services.map((s) => s.category)));

  return (
    <>
      <PageHeader
        title="الخدمات والإجراءات"
        description="الدليل المرجعي للموظفين: الجهة، السند القانوني، المستندات، والخطوات ومددها لكل خدمة"
        actions={
          can('services.manage') ? (
            <Button icon={Plus} onClick={() => setEditing({ service: newServiceDraft(), isNew: true })}>
              إضافة خدمة
            </Button>
          ) : (
            <Badge tone="neutral" icon={Lock}>
              عرض فقط — التعديل للمدير العام
            </Badge>
          )
        }
      />
      <Alert tone="warning" className="mb-4" title="مسودة تحتاج اعتماد المكتب">
        الخطوات والمستندات مبنية على تحليل مبدئي للقوانين واللوائح. كل خدمة لها أسئلة مفتوحة يجب تأكيدها مع المكتب قبل التشغيل، والرسوم المعروضة للتوضيح فقط.
      </Alert>

      <div className="grid gap-4 lg:grid-cols-[20rem_minmax(0,1fr)]">
        <Card className="h-fit">
          <nav aria-label="قائمة الخدمات" className="p-2">
            {categories.map((category) => (
              <div key={category} className="mb-3">
                <p className="px-3 py-1.5 text-xs font-medium text-ink-3">{category}</p>
                <ul>
                  {db.services
                    .filter((s) => s.category === category)
                    .map((s) => (
                      <li key={s.id}>
                        <button
                          type="button"
                          onClick={() => setSelectedId(s.id)}
                          aria-current={s.id === selectedId ? 'true' : undefined}
                          className={cn('flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-start text-sm', s.id === selectedId ? 'bg-brand-soft font-medium text-brand-ink' : 'text-ink-2 hover:bg-surface-3')}
                        >
                          <span className="truncate">{s.name}</span>
                          {!s.is_active && (
                            <Badge size="sm" tone="neutral">
                              موقوفة
                            </Badge>
                          )}
                        </button>
                      </li>
                    ))}
                </ul>
              </div>
            ))}
          </nav>
        </Card>

        {selected && (
          <div className="space-y-4">
            <Card>
              <CardHeader
                title={
                  <>
                    {selected.name}
                    {selected.name_en && <span className="ms-2 text-sm font-normal text-ink-3" dir="ltr">{selected.name_en}</span>}
                  </>
                }
                description={selected.summary}
                actions={
                  can('services.manage') && (
                    <Button variant="secondary" icon={Pencil} onClick={() => setEditing({ service: selected, isNew: false })}>
                      تعديل
                    </Button>
                  )
                }
              />
              <dl className="grid gap-x-6 gap-y-4 p-5 text-sm sm:grid-cols-2">
                <div>
                  <dt className="text-ink-3">الجهة المختصة</dt>
                  <dd className="mt-0.5 text-ink">{selected.authority}</dd>
                </div>
                <div>
                  <dt className="text-ink-3">قناة التقديم</dt>
                  <dd className="mt-0.5 text-ink">{selected.channel}</dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="text-ink-3">السند القانوني</dt>
                  <dd className="mt-0.5 text-ink">{selected.legal_basis}</dd>
                </div>
                <div>
                  <dt className="text-ink-3">الأتعاب الافتراضية</dt>
                  <dd className="mt-0.5 font-medium text-ink tabular">{formatMoney(selected.office_fee)}</dd>
                </div>
                <div>
                  <dt className="text-ink-3">الرسوم الحكومية (تقدير)</dt>
                  <dd className="mt-0.5 text-ink">
                    <span className="font-medium tabular">{formatMoney(selected.gov_fee_estimate)}</span> <span className="text-xs text-ink-3">— {selected.gov_fee_note}</span>
                  </dd>
                </div>
                <div>
                  <dt className="text-ink-3">المدة التقديرية</dt>
                  <dd className="mt-0.5 text-ink">{selected.estimated_days} يوم عمل</dd>
                </div>
                <div>
                  <dt className="text-ink-3">توكيل للمكتب</dt>
                  <dd className="mt-0.5 text-ink">{selected.requires_poa ? 'مطلوب غالبًا' : 'غير مطلوب عادةً'}</dd>
                </div>
              </dl>
            </Card>

            <div className="grid gap-4 xl:grid-cols-2">
              <Card>
                <CardHeader as="h3" title="المستندات المطلوبة" />
                <ul className="divide-y divide-line">
                  {selected.required_documents.map((d) => (
                    <li key={d.name} className="px-5 py-3 text-sm text-ink">
                      {d.name}
                      {(d.original || d.note) && <p className="text-xs text-ink-3">{[d.original && 'يلزم الأصل', d.note].filter(Boolean).join(' · ')}</p>}
                    </li>
                  ))}
                </ul>
              </Card>
              <Card>
                <CardHeader as="h3" title="خطوات الإجراء" description={`${selected.steps.length} خطوات · ${selected.estimated_days} يوم عمل`} />
                <ol className="divide-y divide-line">
                  {selected.steps.map((s, i) => (
                    <li key={s.id} className="flex items-start gap-3 px-5 py-3 text-sm">
                      <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-surface-3 text-[11px] text-ink-3 tabular">{i + 1}</span>
                      <div className="min-w-0 flex-1">
                        <p className="text-ink">{s.title}</p>
                        {s.description && <p className="text-xs text-ink-3">{s.description}</p>}
                        {s.documents && s.documents.length > 0 && (
                          <p className="mt-1 flex flex-wrap items-center gap-1 text-xs text-accent">
                            <FileText className="size-3" aria-hidden /> {s.documents.join('، ')}
                          </p>
                        )}
                      </div>
                      {s.days && (
                        <span className="flex shrink-0 items-center gap-1 text-xs text-ink-3">
                          <Clock className="size-3.5" aria-hidden /> {s.days} يوم
                        </span>
                      )}
                      <Badge size="sm" tone="neutral">
                        {STEP_OWNER[s.owner]}
                      </Badge>
                      {s.milestone && <Eye className="mt-0.5 size-4 text-ink-3" aria-label="تظهر للعميل" />}
                    </li>
                  ))}
                </ol>
              </Card>
            </div>

            {selected.open_questions.length > 0 && (
              <Card>
                <CardHeader as="h3" title="أسئلة مفتوحة للمكتب" icon={<CircleHelp className="mt-0.5 size-4 text-warning" aria-hidden />} description="تُحسم في اجتماع جمع المتطلبات" />
                <ul className="list-disc space-y-1.5 px-5 py-4 ps-9 text-sm text-ink-2">
                  {selected.open_questions.map((q) => (
                    <li key={q}>{q}</li>
                  ))}
                </ul>
              </Card>
            )}
          </div>
        )}
      </div>

      {editing && (
        <ServiceEditor
          service={editing.service}
          isNew={editing.isNew}
          onClose={() => setEditing(null)}
          onSaved={(saved) => {
            setEditing(null);
            setSelectedId(saved.id);
          }}
        />
      )}
    </>
  );
}
