import { useState } from 'react';
import { CheckCircle2, CircleDashed, FileImage, FileText, PackageOpen, Trash2, Undo2, Upload } from 'lucide-react';
import { useAuth, useUser } from '../../app/AuthContext';
import { DomainError, store } from '../../data/engine';
import { useDb } from '../../data/hooks';
import type { DocumentRecord, RequestRecord } from '../../data/types';
import { formatDateTime, formatFileSize } from '../../lib/format';
import { Badge } from '../../ui/Badge';
import { Button } from '../../ui/Button';
import { Dialog } from '../../ui/Dialog';
import { Alert, EmptyState } from '../../ui/Feedback';
import { Field, Textarea } from '../../ui/Field';
import { useToast } from '../../ui/Toast';
import { UploadDialog } from './UploadDialog';

export function DocumentsPanel({ request }: { request: RequestRecord }) {
  const user = useUser();
  const { can } = useAuth();
  const db = useDb();
  const { toast } = useToast();
  const service = db.services.find((s) => s.id === request.service_id);
  const docs = db.documents.filter((d) => d.request_id === request.id);
  const required = service?.required_documents ?? [];
  const uploadedTypes = new Set(docs.map((d) => d.doc_type));
  const [upload, setUpload] = useState<{ type?: string } | null>(null);
  const [viewing, setViewing] = useState<DocumentRecord | null>(null);
  const [deleting, setDeleting] = useState<DocumentRecord | null>(null);
  const [reason, setReason] = useState('');
  const heldOriginals = docs.filter((d) => d.original_held && !d.returned_at);

  const run = (fn: () => void, success: string) => {
    try {
      fn();
      toast(success);
    } catch (e) {
      toast(e instanceof DomainError ? e.message : 'تعذّر تنفيذ الإجراء', { tone: 'danger' });
    }
  };

  return (
    <div className="space-y-6 p-5">
      <section>
        <div className="mb-3 flex items-center justify-between gap-3">
          <h3 className="text-sm font-semibold text-ink">
            المستندات المطلوبة للخدمة <span className="font-normal text-ink-3">({required.filter((r) => uploadedTypes.has(r.name)).length} من {required.length})</span>
          </h3>
          {can('documents.upload') && (
            <Button size="sm" icon={Upload} onClick={() => setUpload({})}>
              إضافة مستند
            </Button>
          )}
        </div>
        <ul className="divide-y divide-line rounded-xl border border-line">
          {required.map((doc) => {
            const ok = uploadedTypes.has(doc.name);
            return (
              <li key={doc.name} className="flex items-center gap-3 px-4 py-3">
                {ok ? <CheckCircle2 className="size-5 shrink-0 text-success" aria-label="مستلم" /> : <CircleDashed className="size-5 shrink-0 text-warning" aria-label="ناقص" />}
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-ink">{doc.name}</p>
                  {(doc.original || doc.note) && <p className="text-xs text-ink-3">{[doc.original && 'يلزم الاطلاع على الأصل', doc.note].filter(Boolean).join(' · ')}</p>}
                </div>
                {!ok && can('documents.upload') && (
                  <Button size="sm" variant="ghost" onClick={() => setUpload({ type: doc.name })}>
                    رفع
                  </Button>
                )}
              </li>
            );
          })}
        </ul>
      </section>

      {heldOriginals.length > 0 && (
        <Alert tone="accent" icon={PackageOpen} title={`${heldOriginals.length} أصل محفوظ لدى المكتب`}>
          يجب ردّها للعميل عند التسليم مع توقيعه على الاستلام: {heldOriginals.map((d) => d.doc_type).join('، ')}.
        </Alert>
      )}

      <section>
        <h3 className="mb-3 text-sm font-semibold text-ink">الملفات المرفوعة</h3>
        {docs.length === 0 ? (
          <EmptyState icon={FileText} title="لا توجد ملفات بعد" description="ارفع المستندات أو صوّرها بكاميرا الجهاز." className="rounded-xl border border-line py-8" />
        ) : (
          <ul className="divide-y divide-line rounded-xl border border-line">
            {docs.map((doc) => {
              const uploader = db.profiles.find((p) => p.id === doc.uploaded_by);
              const Icon = doc.mime.startsWith('image/') ? FileImage : FileText;
              return (
                <li key={doc.id} className="flex flex-wrap items-center gap-3 px-4 py-3">
                  <span className="flex size-10 items-center justify-center rounded-lg bg-danger-soft text-danger">
                    <Icon className="size-5" aria-hidden />
                  </span>
                  <div className="min-w-0 flex-1">
                    <button
                      type="button"
                      className="block max-w-full truncate text-start text-sm font-medium text-ink hover:text-brand-ink hover:underline"
                      onClick={() => {
                        store.logDocumentView(user, doc.id);
                        setViewing(doc);
                      }}
                    >
                      {doc.doc_type}
                    </button>
                    <p className="text-xs text-ink-3">
                      {formatFileSize(doc.size)} · {uploader?.full_name} · {formatDateTime(doc.uploaded_at)}
                    </p>
                  </div>
                  {doc.original_held &&
                    (doc.returned_at ? (
                      <Badge tone="neutral" size="sm">
                        رُدّ الأصل
                      </Badge>
                    ) : (
                      <Badge tone="accent" size="sm">
                        الأصل لدينا
                      </Badge>
                    ))}
                  <div className="flex items-center gap-1">
                    {doc.original_held && !doc.returned_at && can('documents.upload') && (
                      <Button size="sm" variant="ghost" icon={Undo2} onClick={() => run(() => store.returnOriginal(user, doc.id), 'تم تسجيل ردّ الأصل للعميل')}>
                        رد الأصل
                      </Button>
                    )}
                    {can('documents.delete') && (
                      <Button size="sm" variant="ghost" icon={Trash2} aria-label={`حذف ${doc.doc_type}`} onClick={() => setDeleting(doc)}>
                        <span className="sr-only">حذف</span>
                      </Button>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {upload && <UploadDialog open request={request} docTypes={required.map((r) => r.name)} initialType={upload.type} onClose={() => setUpload(null)} />}

      {viewing && (
        <Dialog open onClose={() => setViewing(null)} title={viewing.doc_type} description={viewing.file_name} size="lg">
          {viewing.data_url ? (
            viewing.mime === 'application/pdf' ? (
              <iframe title={viewing.doc_type} src={viewing.data_url} className="h-[60vh] w-full rounded-lg border border-line" />
            ) : (
              <img src={viewing.data_url} alt={viewing.doc_type} className="mx-auto max-h-[60vh] rounded-lg border border-line" />
            )
          ) : (
            <EmptyState icon={FileText} title="ملف تجريبي بدون محتوى" description="مستندات بيانات العرض وصفية فقط. ارفع ملفًا حقيقيًا لتجربة المعاينة." />
          )}
          <p className="mt-4 text-xs text-ink-3">في النسخة الفعلية تُعرض المستندات بعلامة مائية باسم الموظف ووقت العرض، ويُسجَّل كل عرض في سجل النشاط.</p>
        </Dialog>
      )}

      {deleting && (
        <Dialog
          open
          onClose={() => setDeleting(null)}
          title="حذف مستند"
          description={deleting.doc_type}
          size="sm"
          footer={
            <>
              <Button variant="secondary" onClick={() => setDeleting(null)}>
                تراجع
              </Button>
              <Button
                variant="danger"
                icon={Trash2}
                onClick={() =>
                  run(() => {
                    store.deleteDocument(user, deleting.id, reason);
                    setDeleting(null);
                    setReason('');
                  }, 'تم حذف المستند وتسجيل السبب')
                }
              >
                حذف
              </Button>
            </>
          }
        >
          <Field label="سبب الحذف" required hint="يُحفظ السبب واسمك في سجل النشاط">
            <Textarea rows={2} value={reason} onChange={(e) => setReason(e.target.value)} />
          </Field>
        </Dialog>
      )}
    </div>
  );
}
