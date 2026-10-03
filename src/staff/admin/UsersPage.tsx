import { useState } from 'react';
import { Check, Minus, Pencil, ShieldCheck, ShieldOff, UserPlus } from 'lucide-react';
import { useUser } from '../../app/AuthContext';
import { DomainError, store } from '../../data/engine';
import { useDb } from '../../data/hooks';
import { PERMISSION_LABELS, PERMISSIONS, ROLE, type Permission } from '../../data/meta';
import type { Profile, Role } from '../../data/types';
import { formatRelative } from '../../lib/format';
import { Badge } from '../../ui/Badge';
import { Button } from '../../ui/Button';
import { Card, CardHeader } from '../../ui/Card';
import { Dialog } from '../../ui/Dialog';
import { Alert } from '../../ui/Feedback';
import { Checkbox, Field, Input, Select } from '../../ui/Field';
import { Avatar, PageHeader, Table, TableWrap, Td, Th } from '../../ui/Layout';
import { useToast } from '../../ui/Toast';

type Draft = Omit<Profile, 'id' | 'created_at' | 'last_login_at'> & { id?: string };

const ROLES = Object.keys(ROLE) as Role[];

function UserDialog({ initial, onClose }: { initial: Draft; onClose: () => void }) {
  const user = useUser();
  const db = useDb();
  const { toast } = useToast();
  const [draft, setDraft] = useState(initial);
  const [error, setError] = useState<string | null>(null);

  const save = () => {
    try {
      store.saveUser(user, draft);
      toast(initial.id ? 'تم حفظ بيانات الموظف' : 'تمت إضافة الموظف', { description: initial.id ? undefined : 'في النسخة الفعلية يصله رابط لتعيين كلمة المرور وتفعيل التحقق بخطوتين.' });
      onClose();
    } catch (e) {
      setError(e instanceof DomainError ? e.message : 'تعذّر الحفظ');
    }
  };

  return (
    <Dialog
      open
      onClose={onClose}
      title={initial.id ? 'تعديل موظف' : 'إضافة موظف'}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            إلغاء
          </Button>
          <Button onClick={save}>حفظ</Button>
        </>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2">
        {error && <Alert tone="danger" className="sm:col-span-2">{error}</Alert>}
        <Field label="الاسم" required className="sm:col-span-2">
          <Input value={draft.full_name} onChange={(e) => setDraft({ ...draft, full_name: e.target.value })} />
        </Field>
        <Field label="البريد الإلكتروني" required>
          <Input type="email" dir="ltr" value={draft.email} onChange={(e) => setDraft({ ...draft, email: e.target.value })} />
        </Field>
        <Field label="الموبايل">
          <Input dir="ltr" value={draft.phone} onChange={(e) => setDraft({ ...draft, phone: e.target.value })} />
        </Field>
        <Field label="المسمى الوظيفي">
          <Input value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} />
        </Field>
        <Field label="الدور">
          <Select value={draft.role} onChange={(e) => setDraft({ ...draft, role: e.target.value as Role })}>
            {ROLES.map((r) => (
              <option key={r} value={r}>
                {ROLE[r].label}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="الفرع">
          <Select value={draft.branch_id} onChange={(e) => setDraft({ ...draft, branch_id: e.target.value })}>
            {db.branches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </Select>
        </Field>
        <Checkbox className="sm:col-span-2" label="إلزام التحقق بخطوتين" description="موصى به لكل الحسابات، وإلزامي للمديرين والخزينة." checked={draft.mfa_enabled} onChange={(e) => setDraft({ ...draft, mfa_enabled: e.target.checked })} />
        <Checkbox className="sm:col-span-2" label="الحساب مفعّل" description="الإيقاف يمنع الدخول فورًا ويُبقي سجل نشاطه كما هو." checked={draft.is_active} onChange={(e) => setDraft({ ...draft, is_active: e.target.checked })} />
      </div>
    </Dialog>
  );
}

export function UsersPage() {
  const db = useDb();
  const [editing, setEditing] = useState<Draft | null>(null);
  const permissions = Object.keys(PERMISSION_LABELS) as Permission[];

  return (
    <>
      <PageHeader
        title="الموظفون والصلاحيات"
        description="لا يوجد تسجيل ذاتي — كل حساب يضيفه المدير العام، ويُوقف ولا يُحذف للحفاظ على السجل"
        actions={
          <Button icon={UserPlus} onClick={() => setEditing({ full_name: '', email: '', phone: '', title: '', role: 'employee', branch_id: db.branches[0].id, is_active: true, mfa_enabled: true })}>
            إضافة موظف
          </Button>
        }
      />
      <Card>
        <TableWrap>
          <Table>
            <thead>
              <tr>
                <Th>الموظف</Th>
                <Th>الدور</Th>
                <Th>الفرع</Th>
                <Th>التحقق بخطوتين</Th>
                <Th>آخر دخول</Th>
                <Th>
                  <span className="sr-only">إجراءات</span>
                </Th>
              </tr>
            </thead>
            <tbody>
              {db.profiles.map((p) => (
                <tr key={p.id} className={p.is_active ? '' : 'opacity-60'}>
                  <Td>
                    <div className="flex items-center gap-3">
                      <Avatar name={p.full_name} />
                      <div>
                        <p className="font-medium text-ink">{p.full_name}</p>
                        <p className="text-xs text-ink-3">
                          {p.title} · <span className="ltr-nums">{p.email}</span>
                        </p>
                      </div>
                    </div>
                  </Td>
                  <Td>
                    <Badge tone={p.role === 'admin' ? 'violet' : p.role === 'branch_manager' ? 'info' : p.role === 'accountant' ? 'accent' : 'neutral'} size="sm">
                      {ROLE[p.role].label}
                    </Badge>
                    {!p.is_active && (
                      <Badge tone="danger" size="sm" className="ms-1">
                        موقوف
                      </Badge>
                    )}
                  </Td>
                  <Td>{db.branches.find((b) => b.id === p.branch_id)?.short}</Td>
                  <Td>
                    {p.mfa_enabled ? (
                      <span className="inline-flex items-center gap-1 text-[13px] text-success">
                        <ShieldCheck className="size-4" aria-hidden /> مفعّل
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[13px] text-warning">
                        <ShieldOff className="size-4" aria-hidden /> غير مفعّل
                      </span>
                    )}
                  </Td>
                  <Td className="text-[13px]">{p.last_login_at ? formatRelative(p.last_login_at) : '—'}</Td>
                  <Td className="text-end">
                    <Button size="sm" variant="ghost" icon={Pencil} onClick={() => setEditing({ ...p })}>
                      تعديل
                    </Button>
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
        </TableWrap>
      </Card>

      <Card className="mt-4">
        <CardHeader title="مصفوفة الصلاحيات" description="الصلاحية تُفحص داخل كل عملية في الخادم، وليس بإخفاء الأزرار فقط. غير المدير العام يرى بيانات فرعه فقط." />
        <TableWrap>
          <Table>
            <thead>
              <tr>
                <Th>الصلاحية</Th>
                {ROLES.map((r) => (
                  <Th key={r} className="text-center">
                    {ROLE[r].label}
                  </Th>
                ))}
              </tr>
            </thead>
            <tbody>
              {permissions.map((perm) => (
                <tr key={perm}>
                  <Td className="text-ink">{PERMISSION_LABELS[perm]}</Td>
                  {ROLES.map((r) => (
                    <Td key={r} className="text-center">
                      {PERMISSIONS[r].includes(perm) ? <Check className="mx-auto size-4 text-success" aria-label="مسموح" /> : <Minus className="mx-auto size-4 text-ink-3/50" aria-label="غير مسموح" />}
                    </Td>
                  ))}
                </tr>
              ))}
            </tbody>
          </Table>
        </TableWrap>
      </Card>

      {editing && <UserDialog initial={editing} onClose={() => setEditing(null)} />}
    </>
  );
}
