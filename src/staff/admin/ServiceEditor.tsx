import { useState, type KeyboardEvent } from 'react';
import { ArrowDown, ArrowUp, Clock, FileText, ListChecks, Plus, Settings2, Trash2, X } from 'lucide-react';
import { useUser } from '../../app/AuthContext';
import { SERVICE_CATEGORIES } from '../../data/catalog';
import { DomainError, store } from '../../data/engine';
import { STEP_OWNER } from '../../data/meta';
import type { ServiceDocument, ServiceStepTemplate, ServiceType, StepOwner } from '../../data/types';
import { cn } from '../../lib/cn';
import { digitsOnly } from '../../lib/format';
import { Button, IconButton } from '../../ui/Button';
import { Dialog } from '../../ui/Dialog';
import { Alert } from '../../ui/Feedback';
import { Checkbox, Field, Input, Select, Textarea } from '../../ui/Field';
import { TabPanel, Tabs } from '../../ui/Tabs';
import { useToast } from '../../ui/Toast';

export function newServiceDraft(): ServiceType {
  return {
    id: `srv-${crypto.randomUUID().slice(0, 8)}`,
    code: '',
    name: '',
    name_en: '',
    category: SERVICE_CATEGORIES[0],
    summary: '',
    authority: '',
    legal_basis: '',
    channel: '',
    required_documents: [{ name: 'صورة بطاقة الرقم القومي' }],
    steps: [
      { id: 's1', title: 'استلام ومراجعة المستندات', owner: 'office', days: 1 },
      { id: 's2', title: 'تقديم الطلب للجهة المختصة', owner: 'office', days: 1, milestone: true },
      { id: 's3', title: 'تسليم المستند النهائي للعميل', owner: 'office', days: 1, milestone: true },
    ],
    office_fee: 0,
    gov_fee_estimate: 0,
    gov_fee_note: 'تُحدد حسب الجهة وتُسدد بإيصال رسمي.',
    estimated_days: 3,
    requires_poa: false,
    open_questions: [],
    is_active: true,
    updated_at: new Date().toISOString(),
  };
}

/** Chip list with an "add" input — used for general and per-step documents. */
function ChipsEditor({ items, onChange, placeholder, label }: { items: string[]; onChange: (items: string[]) => void; placeholder: string; label: string }) {
  const [value, setValue] = useState('');
  const add = () => {
    const name = value.trim();
    if (name && !items.includes(name)) onChange([...items, name]);
    setValue('');
  };
  const onKey = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      add();
    }
  };
  return (
    <div>
      {items.length > 0 && (
        <ul className="mb-2 flex flex-wrap gap-1.5" aria-label={label}>
          {items.map((item) => (
            <li key={item} className="inline-flex items-center gap-1.5 rounded-full bg-accent-soft py-1 ps-3 pe-1.5 text-[13px] text-accent">
              <FileText className="size-3.5" aria-hidden />
              {item}
              <button type="button" onClick={() => onChange(items.filter((x) => x !== item))} className="rounded-full p-0.5 hover:bg-accent/15" aria-label={`حذف ${item}`}>
                <X className="size-3.5" aria-hidden />
              </button>
            </li>
          ))}
        </ul>
      )}
      <div className="flex gap-2">
        <Input aria-label={label} placeholder={placeholder} value={value} onChange={(e) => setValue(e.target.value)} onKeyDown={onKey} className="h-9" />
        <Button size="sm" variant="secondary" icon={Plus} onClick={add} disabled={!value.trim()} className="h-9">
          إضافة
        </Button>
      </div>
    </div>
  );
}

export function ServiceEditor({ service, isNew, onClose, onSaved }: { service: ServiceType; isNew: boolean; onClose: () => void; onSaved: (s: ServiceType) => void }) {
  const user = useUser();
  const { toast } = useToast();
  const [draft, setDraft] = useState<ServiceType>(() => structuredClone(service));
  const [tab, setTab] = useState<'basic' | 'steps'>('basic');
  const [error, setError] = useState<string | null>(null);
  const totalDays = draft.steps.reduce((sum, s) => sum + (s.days ?? 0), 0);

  const set = <K extends keyof ServiceType>(key: K, value: ServiceType[K]) => setDraft((d) => ({ ...d, [key]: value }));
  const setStep = (id: string, patch: Partial<ServiceStepTemplate>) => setDraft((d) => ({ ...d, steps: d.steps.map((s) => (s.id === id ? { ...s, ...patch } : s)) }));
  const moveStep = (index: number, delta: number) =>
    setDraft((d) => {
      const steps = [...d.steps];
      const [step] = steps.splice(index, 1);
      steps.splice(index + delta, 0, step);
      return { ...d, steps };
    });

  const save = () => {
    setError(null);
    try {
      const saved = store.saveService(user, draft);
      toast(isNew ? 'تمت إضافة الخدمة' : 'تم حفظ الخدمة', { description: isNew ? 'أصبحت متاحة في المعاملات الجديدة وفي دليل الموقع.' : 'المعاملات المفتوحة تحتفظ بخطواتها الأصلية؛ التعديل يسري على الجديدة.' });
      onSaved(saved);
    } catch (e) {
      setError(e instanceof DomainError ? e.message : 'تعذّر الحفظ');
      if (e instanceof DomainError && /خطوة|مدة/.test(e.message)) setTab('steps');
    }
  };

  return (
    <Dialog
      open
      onClose={onClose}
      size="xl"
      title={isNew ? 'إضافة خدمة وتصميم خطواتها الإجرائية' : `تعديل: ${service.name}`}
      description="كل تعديل يُسجَّل في سجل النشاط باسمك"
      footer={
        <div className="flex w-full flex-wrap items-center justify-between gap-3">
          <p className="text-[13px] text-ink-3">
            <span className="tabular">{draft.steps.length}</span> خطوات · <span className="tabular">{totalDays}</span> يوم عمل إجمالًا
          </p>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={onClose}>
              إلغاء
            </Button>
            <Button onClick={save}>حفظ الخدمة ومسارها</Button>
          </div>
        </div>
      }
    >
      {error && (
        <Alert tone="danger" className="mb-4">
          {error}
        </Alert>
      )}
      <Tabs
        label="أقسام الخدمة"
        value={tab}
        onChange={setTab}
        className="mb-5"
        items={[
          { id: 'basic', label: 'البيانات الأساسية والرسوم', icon: Settings2 },
          { id: 'steps', label: 'مسار الخطوات والمدد والمستندات', icon: ListChecks, count: draft.steps.length },
        ]}
      />

      {tab === 'basic' ? (
        <TabPanel label="البيانات الأساسية">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="اسم الخدمة بالعربية" required>
              <Input value={draft.name} onChange={(e) => set('name', e.target.value)} autoFocus />
            </Field>
            <Field label="اسم الخدمة بالإنجليزية">
              <Input dir="ltr" value={draft.name_en ?? ''} onChange={(e) => set('name_en', e.target.value)} />
            </Field>
            <Field label="التصنيف" required>
              <Select value={draft.category} onChange={(e) => set('category', e.target.value)}>
                {SERVICE_CATEGORIES.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </Select>
            </Field>
            <Field label="الكود الداخلي" hint="اختياري، مثال: LIC-06">
              <Input dir="ltr" value={draft.code} onChange={(e) => set('code', e.target.value)} />
            </Field>
            <Field label="أتعاب المكتب الافتراضية (ج.م)" required>
              <Input dir="ltr" inputMode="numeric" value={draft.office_fee} onChange={(e) => set('office_fee', Number(digitsOnly(e.target.value)) || 0)} />
            </Field>
            <Field label="تقدير الرسوم الحكومية (ج.م)" hint="للعرض فقط؛ الفعلي يُسجَّل من الإيصال الرسمي">
              <Input dir="ltr" inputMode="numeric" value={draft.gov_fee_estimate} onChange={(e) => set('gov_fee_estimate', Number(digitsOnly(e.target.value)) || 0)} />
            </Field>
            <Field label="إجمالي مدة الإنجاز" hint="يُحسب تلقائيًا من مدد الخطوات">
              <Input value={`${totalDays} يوم عمل`} readOnly disabled />
            </Field>
            <Field label="ملاحظة الرسوم الحكومية">
              <Input value={draft.gov_fee_note} onChange={(e) => set('gov_fee_note', e.target.value)} />
            </Field>
            <Field label="الجهة المختصة" className="sm:col-span-2">
              <Input value={draft.authority} onChange={(e) => set('authority', e.target.value)} placeholder="مثال: مجلس مدينة منيا القمح — المركز التكنولوجي" />
            </Field>
            <Field label="السند القانوني">
              <Input value={draft.legal_basis} onChange={(e) => set('legal_basis', e.target.value)} />
            </Field>
            <Field label="قناة التقديم">
              <Input value={draft.channel} onChange={(e) => set('channel', e.target.value)} />
            </Field>
            <Field label="وصف مختصر يظهر للعملاء" className="sm:col-span-2">
              <Textarea rows={2} value={draft.summary} onChange={(e) => set('summary', e.target.value)} />
            </Field>
            <div className="sm:col-span-2">
              <p className="mb-2 text-[13px] font-medium text-ink-2">
                المستندات العامة المطلوبة <span className="text-danger">*</span>
              </p>
              <ul className="mb-2 space-y-1.5">
                {draft.required_documents.map((doc, index) => (
                  <li key={doc.name} className="flex items-center gap-3 rounded-lg border border-line px-3 py-2 text-sm">
                    <FileText className="size-4 shrink-0 text-ink-3" aria-hidden />
                    <span className="flex-1 text-ink">{doc.name}</span>
                    <label className="flex items-center gap-1.5 text-xs text-ink-2">
                      <input
                        type="checkbox"
                        className="accent-brand"
                        checked={Boolean(doc.original)}
                        onChange={(e) => set('required_documents', draft.required_documents.map((d, i): ServiceDocument => (i === index ? { ...d, original: e.target.checked } : d)))}
                      />
                      يلزم الأصل
                    </label>
                    <IconButton icon={Trash2} label={`حذف ${doc.name}`} size="sm" onClick={() => set('required_documents', draft.required_documents.filter((_, i) => i !== index))} />
                  </li>
                ))}
              </ul>
              <ChipsEditor
                label="إضافة مستند عام"
                items={[]}
                placeholder="اكتب اسم المستند ثم Enter"
                onChange={(names) => {
                  const name = names[0];
                  if (name && !draft.required_documents.some((d) => d.name === name)) set('required_documents', [...draft.required_documents, { name }]);
                }}
              />
            </div>
            <Checkbox className="sm:col-span-2" label="تتطلب توكيلًا للمكتب غالبًا" checked={draft.requires_poa} onChange={(e) => set('requires_poa', e.target.checked)} />
            <Checkbox className="sm:col-span-2" label="الخدمة متاحة لاستقبال طلبات جديدة وتظهر في دليل الموقع" checked={draft.is_active} onChange={(e) => set('is_active', e.target.checked)} />
          </div>
          <Alert tone="info" className="mt-5" action={<Button size="sm" variant="secondary" onClick={() => setTab('steps')}>انتقل لمسار الخطوات</Button>}>
            حدّد في تبويب "مسار الخطوات" ترتيب الخطوات ومدة كل خطوة ومن المسؤول عنها والمستندات الخاصة بها.
          </Alert>
        </TabPanel>
      ) : (
        <TabPanel label="مسار الخطوات">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line bg-surface-2 p-4">
            <div>
              <p className="font-semibold text-ink">تصميم خطوات تنفيذ الخدمة</p>
              <p className="text-[13px] text-ink-3">كل معاملة جديدة لهذه الخدمة تبدأ بنسخة من هذا المسار، ويُحسب موعدها المستهدف من مجموع المدد.</p>
            </div>
            <Button
              icon={Plus}
              onClick={() => setDraft((d) => ({ ...d, steps: [...d.steps, { id: `s${Date.now()}`, title: '', owner: 'office', days: 1 }] }))}
            >
              إضافة خطوة
            </Button>
          </div>

          <ol className="space-y-3">
            {draft.steps.map((step, index) => (
              <li key={step.id} className="rounded-xl border border-line bg-surface p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-brand-soft text-sm font-semibold text-brand-ink tabular">{index + 1}</span>
                  <Input aria-label={`عنوان الخطوة ${index + 1}`} placeholder="عنوان الخطوة" value={step.title} onChange={(e) => setStep(step.id, { title: e.target.value })} className="h-9 min-w-56 flex-1" />
                  <label className="flex h-9 items-center gap-1.5 rounded-lg border border-line-strong px-2 text-[13px] text-ink-3">
                    <Clock className="size-4" aria-hidden />
                    المدة
                    <input
                      aria-label={`مدة الخطوة ${index + 1} بالأيام`}
                      dir="ltr"
                      inputMode="numeric"
                      value={step.days ?? ''}
                      onChange={(e) => setStep(step.id, { days: Number(digitsOnly(e.target.value)) || undefined })}
                      className={cn('w-10 rounded border bg-surface text-center text-ink tabular focus:outline-none focus:ring-2 focus:ring-brand/20', !step.days ? 'border-danger' : 'border-line')}
                    />
                    يوم
                  </label>
                  <Select aria-label="المسؤول عن الخطوة" value={step.owner} onChange={(e) => setStep(step.id, { owner: e.target.value as StepOwner })} className="h-9 w-28">
                    {(Object.keys(STEP_OWNER) as StepOwner[]).map((o) => (
                      <option key={o} value={o}>
                        {STEP_OWNER[o]}
                      </option>
                    ))}
                  </Select>
                  <div className="flex">
                    <IconButton icon={ArrowUp} label="تحريك لأعلى" size="sm" disabled={index === 0} onClick={() => moveStep(index, -1)} />
                    <IconButton icon={ArrowDown} label="تحريك لأسفل" size="sm" disabled={index === draft.steps.length - 1} onClick={() => moveStep(index, 1)} />
                    <IconButton icon={Trash2} label="حذف الخطوة" size="sm" disabled={draft.steps.length === 1} onClick={() => setDraft((d) => ({ ...d, steps: d.steps.filter((s) => s.id !== step.id) }))} />
                  </div>
                </div>
                <Input aria-label="وصف الخطوة" placeholder="وصف مختصر لما يحدث في هذه الخطوة (اختياري)" value={step.description ?? ''} onChange={(e) => setStep(step.id, { description: e.target.value })} className="mt-3 h-9" />
                <div className="mt-3 border-t border-line pt-3">
                  <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                    <p className="text-[13px] font-medium text-ink-2">مستندات مطلوبة خصيصًا لهذه الخطوة</p>
                    <label className="flex items-center gap-1.5 text-xs text-ink-2">
                      <input type="checkbox" className="accent-brand" checked={Boolean(step.milestone)} onChange={(e) => setStep(step.id, { milestone: e.target.checked })} />
                      تظهر للعميل في صفحة التتبع
                    </label>
                  </div>
                  <ChipsEditor label={`مستندات الخطوة ${index + 1}`} items={step.documents ?? []} placeholder="اكتب مستندًا مطلوبًا لهذه الخطوة…" onChange={(documents) => setStep(step.id, { documents })} />
                </div>
              </li>
            ))}
          </ol>
        </TabPanel>
      )}
    </Dialog>
  );
}
