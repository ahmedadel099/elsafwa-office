import { useMemo, useState } from 'react';
import { Search, UserPlus } from 'lucide-react';
import { useUser } from '../../app/AuthContext';
import { DomainError, store } from '../../data/engine';
import { useDb } from '../../data/hooks';
import { CHANNEL, PRIORITY } from '../../data/meta';
import type { Channel, Client, Priority } from '../../data/types';
import { cn } from '../../lib/cn';
import { digitsOnly, formatMoney, maskNationalId } from '../../lib/format';
import { navigate } from '../../lib/router';
import { parseNationalId } from '../../lib/validation';
import { Button } from '../../ui/Button';
import { Dialog } from '../../ui/Dialog';
import { Alert } from '../../ui/Feedback';
import { Checkbox, Field, Input, Select, Textarea } from '../../ui/Field';
import { Avatar } from '../../ui/Layout';
import { useToast } from '../../ui/Toast';

export function NewRequestDialog({ open, onClose, clientId }: { open: boolean; onClose: () => void; clientId?: string }) {
  const user = useUser();
  const db = useDb();
  const { toast } = useToast();
  const branchId = user.role === 'admin' ? db.branches[0].id : user.branch_id;

  const [mode, setMode] = useState<'existing' | 'new'>(clientId ? 'existing' : 'existing');
  const [search, setSearch] = useState('');
  const [selectedClient, setSelectedClient] = useState<string | undefined>(clientId);
  const [newClient, setNewClient] = useState({ full_name: '', national_id: '', phone: '', address: '', consent: false });
  const [branch, setBranch] = useState(branchId);
  const [serviceId, setServiceId] = useState('');
  const service = db.services.find((s) => s.id === serviceId);
  const [officeFee, setOfficeFee] = useState('');
  const [govFee, setGovFee] = useState('');
  const [priority, setPriority] = useState<Priority>('normal');
  const [channel, setChannel] = useState<Channel>('walk_in');
  const [assignee, setAssignee] = useState(user.role === 'employee' ? user.id : '');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);

  const matches = useMemo(() => {
    const needle = search.trim();
    if (needle.length < 2) return [];
    const digits = digitsOnly(needle);
    return db.clients
      .filter((c) => user.role === 'admin' || c.branch_id === user.branch_id)
      .filter((c) => c.full_name.includes(needle) || (c.business_name ?? '').includes(needle) || (digits.length >= 4 && (c.phone.includes(digits) || c.national_id === digits)))
      .slice(0, 5);
  }, [search, db.clients, user]);

  const nidInfo = newClient.national_id.length === 14 ? parseNationalId(newClient.national_id) : null;
  const chosen: Client | undefined = db.clients.find((c) => c.id === selectedClient);
  const staff = db.profiles.filter((p) => p.is_active && p.role !== 'accountant' && (p.role === 'admin' || p.branch_id === branch));

  const submit = () => {
    setError(null);
    try {
      if (!service) throw new DomainError('اختر الخدمة.');
      let cid = selectedClient;
      if (mode === 'new') {
        cid = store.createClient(user, { kind: 'individual', ...newClient, branch_id: branch }).id;
      }
      if (!cid) throw new DomainError('اختر العميل أو أضف عميلًا جديدًا.');
      const created = store.createRequest(user, {
        client_id: cid,
        service_id: service.id,
        branch_id: branch,
        assignee_id: assignee || undefined,
        priority,
        channel,
        office_fee: Number(officeFee || service.office_fee),
        gov_fee_estimate: Number(govFee || service.gov_fee_estimate),
        notes,
      });
      toast(`تم فتح المعاملة ${created.ref}`);
      onClose();
      navigate(`/app/requests/${created.id}`);
    } catch (e) {
      setError(e instanceof DomainError ? e.message : 'تعذّر إنشاء المعاملة.');
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      size="lg"
      title="معاملة جديدة"
      description="يُفتح ملف برقم مستقل، وتُنسخ خطوات الخدمة الحالية إليه"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            إلغاء
          </Button>
          <Button onClick={submit}>فتح المعاملة</Button>
        </>
      }
    >
      <div className="space-y-6">
        {error && <Alert tone="danger">{error}</Alert>}

        <section>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-ink">1. العميل</h3>
            <div className="inline-flex rounded-lg border border-line bg-surface-2 p-0.5 text-[13px]" role="radiogroup" aria-label="نوع العميل">
              {(
                [
                  ['existing', 'عميل مسجّل'],
                  ['new', 'عميل جديد'],
                ] as const
              ).map(([value, label]) => (
                <button key={value} type="button" role="radio" aria-checked={mode === value} onClick={() => setMode(value)} className={cn('h-7 rounded-md px-3', mode === value ? 'bg-surface font-medium text-ink shadow-sm' : 'text-ink-3')}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          {mode === 'existing' ? (
            chosen ? (
              <div className="flex items-center gap-3 rounded-xl border border-brand/40 bg-brand-soft/40 p-3">
                <Avatar name={chosen.full_name} />
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-ink">{chosen.business_name ?? chosen.full_name}</p>
                  <p className="ltr-nums text-xs text-ink-3">
                    {chosen.phone} · {chosen.national_id ? maskNationalId(chosen.national_id) : 'بدون رقم قومي'}
                  </p>
                </div>
                <Button size="sm" variant="ghost" onClick={() => setSelectedClient(undefined)}>
                  تغيير
                </Button>
              </div>
            ) : (
              <div>
                <Input aria-label="بحث عن عميل" placeholder="اكتب الاسم أو الموبايل أو الرقم القومي" value={search} onChange={(e) => setSearch(e.target.value)} leading={<Search className="size-4" />} autoFocus />
                {matches.length > 0 && (
                  <ul className="mt-2 divide-y divide-line rounded-xl border border-line">
                    {matches.map((c) => (
                      <li key={c.id}>
                        <button type="button" onClick={() => setSelectedClient(c.id)} className="flex w-full items-center gap-3 px-3 py-2.5 text-start hover:bg-surface-2">
                          <Avatar name={c.full_name} size="sm" />
                          <span className="flex-1 text-sm text-ink">{c.business_name ?? c.full_name}</span>
                          <span className="ltr-nums text-xs text-ink-3">{c.phone}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
                {search.trim().length >= 2 && matches.length === 0 && (
                  <p className="mt-2 flex items-center gap-2 text-[13px] text-ink-3">
                    لا يوجد عميل مطابق.
                    <button type="button" className="inline-flex items-center gap-1 font-medium text-brand-ink hover:underline" onClick={() => setMode('new')}>
                      <UserPlus className="size-4" aria-hidden /> إضافة عميل جديد
                    </button>
                  </p>
                )}
              </div>
            )
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="الاسم رباعيًا كما في البطاقة" required className="sm:col-span-2">
                <Input value={newClient.full_name} onChange={(e) => setNewClient({ ...newClient, full_name: e.target.value })} />
              </Field>
              <Field
                label="الرقم القومي"
                required
                hint={nidInfo?.ok ? `مواليد ${nidInfo.info.birthDate} · ${nidInfo.info.governorate} · ${nidInfo.info.gender}` : 'يُقبل بالأرقام العربية أو الإنجليزية'}
                error={nidInfo && !nidInfo.ok ? nidInfo.error : null}
              >
                <Input inputMode="numeric" dir="ltr" maxLength={14} value={newClient.national_id} onChange={(e) => setNewClient({ ...newClient, national_id: digitsOnly(e.target.value).slice(0, 14) })} />
              </Field>
              <Field label="الموبايل" required>
                <Input inputMode="tel" dir="ltr" value={newClient.phone} onChange={(e) => setNewClient({ ...newClient, phone: digitsOnly(e.target.value).slice(0, 11) })} placeholder="01xxxxxxxxx" />
              </Field>
              <Field label="العنوان" className="sm:col-span-2">
                <Input value={newClient.address} onChange={(e) => setNewClient({ ...newClient, address: e.target.value })} />
              </Field>
              <Checkbox
                className="sm:col-span-2"
                label="العميل اطّلع على إشعار الخصوصية ووافق على معالجة بياناته لغرض المعاملة"
                description="يُحفظ وقت الموافقة ونسخة الإشعار في ملف العميل (قانون حماية البيانات الشخصية 151 لسنة 2020)."
                checked={newClient.consent}
                onChange={(e) => setNewClient({ ...newClient, consent: e.target.checked })}
              />
            </div>
          )}
        </section>

        <section>
          <h3 className="mb-3 text-sm font-semibold text-ink">2. الخدمة</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="الخدمة" required className="sm:col-span-2">
              <Select
                value={serviceId}
                onChange={(e) => {
                  setServiceId(e.target.value);
                  const s = db.services.find((x) => x.id === e.target.value);
                  setOfficeFee(s ? String(s.office_fee) : '');
                  setGovFee(s ? String(s.gov_fee_estimate) : '');
                }}
              >
                <option value="">اختر الخدمة</option>
                {Array.from(new Set(db.services.filter((s) => s.is_active).map((s) => s.category))).map((category) => (
                  <optgroup key={category} label={category}>
                    {db.services
                      .filter((s) => s.is_active && s.category === category)
                      .map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                  </optgroup>
                ))}
              </Select>
            </Field>
            {service && (
              <Alert tone="info" className="sm:col-span-2" title={`${service.steps.length} خطوات · مدة تقديرية ${service.estimated_days} يوم عمل`}>
                {service.required_documents.length} مستندات مطلوبة{service.requires_poa ? ' · يتطلب توكيلًا للمكتب' : ''}. {service.gov_fee_note}
              </Alert>
            )}
            <Field label="أتعاب المكتب المتفق عليها (ج.م)" required>
              <Input inputMode="numeric" dir="ltr" value={officeFee} onChange={(e) => setOfficeFee(digitsOnly(e.target.value))} />
            </Field>
            <Field label="تقدير الرسوم الحكومية (ج.م)" hint={service ? `القيمة الافتراضية ${formatMoney(service.gov_fee_estimate)}` : undefined}>
              <Input inputMode="numeric" dir="ltr" value={govFee} onChange={(e) => setGovFee(digitsOnly(e.target.value))} />
            </Field>
          </div>
        </section>

        <section>
          <h3 className="mb-3 text-sm font-semibold text-ink">3. التنظيم</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            {user.role === 'admin' && (
              <Field label="الفرع">
                <Select value={branch} onChange={(e) => setBranch(e.target.value)}>
                  {db.branches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </Select>
              </Field>
            )}
            <Field label="المسؤول">
              <Select value={assignee} onChange={(e) => setAssignee(e.target.value)}>
                <option value="">بدون إسناد الآن</option>
                {staff.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.full_name}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="الأولوية">
              <Select value={priority} onChange={(e) => setPriority(e.target.value as Priority)}>
                {(Object.keys(PRIORITY) as Priority[]).map((p) => (
                  <option key={p} value={p}>
                    {PRIORITY[p].label}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="طريقة الطلب">
              <Select value={channel} onChange={(e) => setChannel(e.target.value as Channel)}>
                {(Object.keys(CHANNEL) as Channel[]).map((c) => (
                  <option key={c} value={c}>
                    {CHANNEL[c]}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="ملاحظات" className="sm:col-span-2">
              <Textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />
            </Field>
          </div>
        </section>
      </div>
    </Dialog>
  );
}
