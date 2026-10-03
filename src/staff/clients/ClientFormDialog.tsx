import { useState } from 'react';
import { useUser } from '../../app/AuthContext';
import { DomainError, store } from '../../data/engine';
import { useDb } from '../../data/hooks';
import type { Client } from '../../data/types';
import { digitsOnly } from '../../lib/format';
import { parseNationalId } from '../../lib/validation';
import { Button } from '../../ui/Button';
import { Dialog } from '../../ui/Dialog';
import { Alert } from '../../ui/Feedback';
import { Checkbox, Field, Input, Select, Textarea } from '../../ui/Field';
import { useToast } from '../../ui/Toast';

/** Create a client, or edit one (e.g. record the national ID of a client who first applied online). */
export function ClientFormDialog({ client, onClose, onSaved }: { client?: Client; onClose: () => void; onSaved?: (id: string) => void }) {
  const user = useUser();
  const db = useDb();
  const { toast } = useToast();
  const [form, setForm] = useState({
    kind: client?.kind ?? ('individual' as Client['kind']),
    full_name: client?.full_name ?? '',
    business_name: client?.business_name ?? '',
    national_id: client?.national_id ?? '',
    phone: client?.phone ?? '',
    phone_alt: client?.phone_alt ?? '',
    address: client?.address ?? '',
    notes: client?.notes ?? '',
    branch_id: client?.branch_id ?? (user.role === 'admin' ? db.branches[0].id : user.branch_id),
    consent: false,
  });
  const [error, setError] = useState<string | null>(null);
  const nid = form.national_id.length === 14 ? parseNationalId(form.national_id) : null;

  const save = () => {
    setError(null);
    try {
      if (client) {
        store.updateClient(user, client.id, form);
        toast('تم حفظ بيانات العميل');
        onSaved?.(client.id);
      } else {
        const created = store.createClient(user, form);
        toast('تمت إضافة العميل');
        onSaved?.(created.id);
      }
      onClose();
    } catch (e) {
      setError(e instanceof DomainError ? e.message : 'تعذّر الحفظ');
    }
  };

  return (
    <Dialog
      open
      onClose={onClose}
      title={client ? 'تعديل بيانات العميل' : 'إضافة عميل'}
      description={client && !client.national_id ? 'سجّل الرقم القومي بعد الاطلاع على أصل البطاقة لاستكمال التحقق من الهوية' : 'البيانات تُحفظ مشفرة وكل تعديل يُسجَّل باسمك'}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            إلغاء
          </Button>
          <Button onClick={save} disabled={!client && !form.consent}>
            حفظ
          </Button>
        </>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2">
        {error && <Alert tone="danger" className="sm:col-span-2">{error}</Alert>}
        <Field label="نوع العميل">
          <Select value={form.kind} onChange={(e) => setForm({ ...form, kind: e.target.value as Client['kind'] })}>
            <option value="individual">فرد</option>
            <option value="business">نشاط / شركة</option>
          </Select>
        </Field>
        {!client && user.role === 'admin' ? (
          <Field label="الفرع">
            <Select value={form.branch_id} onChange={(e) => setForm({ ...form, branch_id: e.target.value })}>
              {db.branches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </Select>
          </Field>
        ) : (
          <span className="hidden sm:block" />
        )}
        <Field label={form.kind === 'business' ? 'اسم الممثل القانوني كما في البطاقة' : 'الاسم رباعيًا كما في البطاقة'} required className="sm:col-span-2">
          <Input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} />
        </Field>
        {form.kind === 'business' && (
          <Field label="اسم النشاط / الشركة" className="sm:col-span-2">
            <Input value={form.business_name} onChange={(e) => setForm({ ...form, business_name: e.target.value })} />
          </Field>
        )}
        <Field
          label="الرقم القومي"
          required={!client}
          hint={nid?.ok ? `مواليد ${nid.info.birthDate} · ${nid.info.governorate} · ${nid.info.gender}` : 'يُقبل بالأرقام العربية أو الإنجليزية'}
          error={nid && !nid.ok ? nid.error : null}
        >
          <Input dir="ltr" inputMode="numeric" maxLength={14} value={form.national_id} onChange={(e) => setForm({ ...form, national_id: digitsOnly(e.target.value).slice(0, 14) })} />
        </Field>
        <Field label="الموبايل" required>
          <Input dir="ltr" inputMode="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: digitsOnly(e.target.value).slice(0, 11) })} />
        </Field>
        <Field label="موبايل إضافي">
          <Input dir="ltr" inputMode="tel" value={form.phone_alt} onChange={(e) => setForm({ ...form, phone_alt: digitsOnly(e.target.value).slice(0, 11) })} />
        </Field>
        <Field label="العنوان">
          <Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
        </Field>
        <Field label="ملاحظات" className="sm:col-span-2">
          <Textarea rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
        </Field>
        {!client && (
          <Checkbox
            className="sm:col-span-2"
            label="العميل اطّلع على إشعار الخصوصية ووافق على معالجة بياناته لغرض معاملاته"
            description="يُحفظ وقت الموافقة ونسخة الإشعار في ملف العميل."
            checked={form.consent}
            onChange={(e) => setForm({ ...form, consent: e.target.checked })}
          />
        )}
      </div>
    </Dialog>
  );
}
