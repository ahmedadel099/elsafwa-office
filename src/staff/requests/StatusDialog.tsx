import { useState } from 'react';
import { useUser } from '../../app/AuthContext';
import { DomainError, store } from '../../data/engine';
import { STATUS, TRANSITIONS } from '../../data/meta';
import type { RequestRecord, RequestStatus } from '../../data/types';
import { cn } from '../../lib/cn';
import { Button } from '../../ui/Button';
import { Dialog } from '../../ui/Dialog';
import { Alert } from '../../ui/Feedback';
import { Field, Input, Textarea } from '../../ui/Field';
import { useToast } from '../../ui/Toast';

export function StatusDialog({ request, open, onClose }: { request: RequestRecord; open: boolean; onClose: () => void }) {
  const user = useUser();
  const { toast } = useToast();
  const options = TRANSITIONS[request.status];
  const [to, setTo] = useState<RequestStatus | null>(options[0] ?? null);
  const [publicMessage, setPublicMessage] = useState(options[0] ? STATUS[options[0]].publicLabel : '');
  const [internalNote, setInternalNote] = useState('');
  const [authorityRef, setAuthorityRef] = useState(request.authority_ref ?? '');
  const [error, setError] = useState<string | null>(null);

  const choose = (status: RequestStatus) => {
    setTo(status);
    setPublicMessage(STATUS[status].publicLabel);
  };

  const submit = () => {
    if (!to) return;
    try {
      store.changeStatus(user, request.id, { to, publicMessage, internalNote, authority_ref: authorityRef });
      toast(`أصبحت الحالة: ${STATUS[to].label}`, { description: 'تم إشعار العميل في صفحة التتبع وسُجّل الإجراء.' });
      onClose();
    } catch (e) {
      setError(e instanceof DomainError ? e.message : 'تعذّر حفظ التغيير.');
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="تحديث حالة المعاملة"
      description={`${request.ref} — الحالة الحالية: ${STATUS[request.status].label}`}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            إلغاء
          </Button>
          <Button onClick={submit} disabled={!to}>
            حفظ التحديث
          </Button>
        </>
      }
    >
      {options.length === 0 ? (
        <Alert tone="neutral">المعاملة مغلقة ولا يمكن تغيير حالتها.</Alert>
      ) : (
        <div className="space-y-5">
          {error && <Alert tone="danger">{error}</Alert>}
          <fieldset>
            <legend className="mb-2 text-[13px] font-medium text-ink-2">الحالة الجديدة</legend>
            <div className="grid gap-2 sm:grid-cols-2">
              {options.map((status) => {
                const meta = STATUS[status];
                const Icon = meta.icon;
                const selected = to === status;
                return (
                  <label
                    key={status}
                    className={cn(
                      'flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition-colors',
                      selected ? 'border-brand bg-brand-soft/60' : 'border-line hover:border-line-strong',
                    )}
                  >
                    <input type="radio" name="status" className="sr-only" checked={selected} onChange={() => choose(status)} />
                    <Icon className={cn('mt-0.5 size-5 shrink-0', selected ? 'text-brand-ink' : 'text-ink-3')} aria-hidden />
                    <span>
                      <span className="block text-sm font-medium text-ink">{meta.label}</span>
                      <span className="block text-xs text-ink-3">يظهر للعميل: {meta.publicLabel}</span>
                    </span>
                  </label>
                );
              })}
            </div>
          </fieldset>

          {to === 'submitted' && (
            <Field label="رقم الطلب أو الإيصال لدى الجهة" required hint="يُستخدم للمتابعة ويظهر في ملف المعاملة فقط">
              <Input value={authorityRef} onChange={(e) => setAuthorityRef(e.target.value)} />
            </Field>
          )}

          <Field label="رسالة للعميل (تظهر في صفحة التتبع)" hint="اكتبها بلغة بسيطة — بدون تفاصيل داخلية أو أسماء موظفين">
            <Textarea rows={2} value={publicMessage} onChange={(e) => setPublicMessage(e.target.value)} />
          </Field>
          <Field label="ملاحظة داخلية" required hint="ماذا حدث بالضبط؟ تبقى داخل المكتب وتُحفظ في سجل المتابعة">
            <Textarea rows={3} value={internalNote} onChange={(e) => setInternalNote(e.target.value)} />
          </Field>
        </div>
      )}
    </Dialog>
  );
}
