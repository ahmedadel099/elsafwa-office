import { useState } from 'react';
import { Clock, MapPin, Pencil, Phone, Plus } from 'lucide-react';
import { useUser } from '../../app/AuthContext';
import { DomainError, store } from '../../data/engine';
import { useDb } from '../../data/hooks';
import { isClosed } from '../../data/selectors';
import type { Branch } from '../../data/types';
import { formatPhone } from '../../lib/format';
import { Button } from '../../ui/Button';
import { Card, CardHeader } from '../../ui/Card';
import { Dialog } from '../../ui/Dialog';
import { Alert } from '../../ui/Feedback';
import { Field, Input, Textarea } from '../../ui/Field';
import { PageHeader } from '../../ui/Layout';
import { useToast } from '../../ui/Toast';

export function BranchesPage() {
  const user = useUser();
  const db = useDb();
  const { toast } = useToast();
  const [editing, setEditing] = useState<Branch | null>(null);
  const isNew = Boolean(editing && !db.branches.some((b) => b.id === editing.id));
  const [phones, setPhones] = useState('');
  const [error, setError] = useState<string | null>(null);

  const save = () => {
    if (!editing) return;
    try {
      store.saveBranch(user, { ...editing, short: editing.short.trim() || editing.name.trim(), city: editing.city.trim() || editing.short.trim() || editing.name.trim(), phones:phones.split(/[,،\n]/).map((p) => p.trim()).filter(Boolean) });
      toast(isNew ? 'تمت إضافة الفرع' : 'تم حفظ بيانات الفرع');
      setEditing(null);
    } catch (e) {
      setError(e instanceof DomainError ? e.message : 'تعذّر الحفظ');
    }
  };

  return (
    <>
      <PageHeader
        title="الفروع"
        description="بيانات الفروع كما تظهر للعملاء على الموقع وفي الإيصالات"
        actions={
          <Button
            icon={Plus}
            onClick={() => {
              setError(null);
              setPhones('');
              setEditing({ id: `br-${crypto.randomUUID().slice(0, 6)}`, name: '', short: '', city: '', address: '', phones: [], hours: 'من الأحد إلى الخميس، 9 صباحًا – 5 مساءً', receipt_prefix: '', is_active: true, created_at: new Date().toISOString() });
            }}
          >
            إضافة فرع
          </Button>
        }
      />
      <div className="grid gap-4 lg:grid-cols-2">
        {db.branches.map((b) => {
          const staff = db.profiles.filter((p) => p.branch_id === b.id && p.is_active).length;
          const open = db.requests.filter((r) => r.branch_id === b.id && !isClosed(r)).length;
          return (
            <Card key={b.id}>
              <CardHeader
                title={b.name}
                description={`${staff} موظفين · ${open} معاملة مفتوحة · بادئة الإيصالات ${b.receipt_prefix}`}
                actions={
                  <Button
                    variant="secondary"
                    size="sm"
                    icon={Pencil}
                    onClick={() => {
                      setEditing({ ...b });
                      setPhones(b.phones.join('، '));
                    }}
                  >
                    تعديل
                  </Button>
                }
              />
              <ul className="space-y-3 p-5 text-sm text-ink-2">
                <li className="flex gap-2">
                  <MapPin className="mt-0.5 size-4 shrink-0 text-ink-3" aria-hidden />
                  {b.address}
                </li>
                <li className="flex gap-2">
                  <Phone className="mt-0.5 size-4 shrink-0 text-ink-3" aria-hidden />
                  <span className="ltr-nums">{b.phones.map(formatPhone).join(' / ')}</span>
                </li>
                <li className="flex gap-2">
                  <Clock className="mt-0.5 size-4 shrink-0 text-ink-3" aria-hidden />
                  {b.hours}
                </li>
              </ul>
            </Card>
          );
        })}
      </div>

      {editing && (
        <Dialog
          open
          onClose={() => setEditing(null)}
          title={isNew ? 'إضافة فرع' : `تعديل ${editing.name}`}
          footer={
            <>
              <Button variant="secondary" onClick={() => setEditing(null)}>
                إلغاء
              </Button>
              <Button onClick={save}>حفظ</Button>
            </>
          }
        >
          <div className="space-y-4">
            {error && <Alert tone="danger">{error}</Alert>}
            <Field label="اسم الفرع" required>
              <Input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} placeholder="مثال: فرع الزقازيق" />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="اسم مختصر" hint="يظهر في القوائم والجداول">
                <Input value={editing.short} onChange={(e) => setEditing({ ...editing, short: e.target.value })} />
              </Field>
              <Field label="بادئة أرقام الإيصالات" required hint={isNew ? 'حرفان أو ثلاثة بالإنجليزية، ثابتة بعد الحفظ' : 'ثابتة للحفاظ على تسلسل الإيصالات'}>
                <Input dir="ltr" value={editing.receipt_prefix} disabled={!isNew} onChange={(e) => setEditing({ ...editing, receipt_prefix: e.target.value.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 3) })} />
              </Field>
            </div>
            <Field label="العنوان" required>
              <Textarea rows={2} value={editing.address} onChange={(e) => setEditing({ ...editing, address: e.target.value })} />
            </Field>
            <Field label="أرقام الهاتف" hint="افصل بين الأرقام بفاصلة">
              <Input dir="ltr" value={phones} onChange={(e) => setPhones(e.target.value)} />
            </Field>
            <Field label="مواعيد العمل">
              <Input value={editing.hours} onChange={(e) => setEditing({ ...editing, hours: e.target.value })} />
            </Field>
          </div>
        </Dialog>
      )}
    </>
  );
}
