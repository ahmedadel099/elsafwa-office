import { useEffect, useRef, useState } from 'react';
import { Camera, FileUp, RotateCcw } from 'lucide-react';
import { useUser } from '../../app/AuthContext';
import { DomainError, store } from '../../data/engine';
import type { RequestRecord } from '../../data/types';
import { cn } from '../../lib/cn';
import { formatFileSize } from '../../lib/format';
import { Button } from '../../ui/Button';
import { Dialog } from '../../ui/Dialog';
import { Alert } from '../../ui/Feedback';
import { Checkbox, Field, Select } from '../../ui/Field';
import { useToast } from '../../ui/Toast';

const OTHER = 'مستند آخر';

interface Pending {
  name: string;
  mime: string;
  size: number;
  dataUrl: string;
}

function readFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

/** Upload a file or capture a page with the device camera (document scanning). */
export function UploadDialog({ request, docTypes, initialType, open, onClose }: { request: RequestRecord; docTypes: string[]; initialType?: string; open: boolean; onClose: () => void }) {
  const user = useUser();
  const { toast } = useToast();
  const [docType, setDocType] = useState(initialType ?? docTypes[0] ?? OTHER);
  const [mode, setMode] = useState<'file' | 'camera'>('file');
  const [pending, setPending] = useState<Pending | null>(null);
  const [originalHeld, setOriginalHeld] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  };

  useEffect(() => {
    if (mode !== 'camera' || pending) return;
    let cancelled = false;
    navigator.mediaDevices
      ?.getUserMedia({ video: { facingMode: 'environment' } })
      .then((stream) => {
        if (cancelled) return stream.getTracks().forEach((t) => t.stop());
        streamRef.current = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;
      })
      .catch(() => setError('تعذّر فتح الكاميرا. اسمح للمتصفح باستخدامها أو ارفع ملفًا بدلًا من ذلك.'));
    return () => {
      cancelled = true;
      stopCamera();
    };
  }, [mode, pending]);

  const accept = async (file: File) => {
    setError(null);
    try {
      setPending({ name: file.name, mime: file.type, size: file.size, dataUrl: await readFile(file) });
    } catch {
      setError('تعذّرت قراءة الملف.');
    }
  };

  const capture = () => {
    const video = videoRef.current;
    if (!video || !video.videoWidth) return;
    const canvas = document.createElement('canvas');
    const scale = Math.min(1, 1600 / video.videoWidth);
    canvas.width = video.videoWidth * scale;
    canvas.height = video.videoHeight * scale;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    // Greyscale + contrast so phone captures read like a scanned page.
    ctx.filter = 'grayscale(1) contrast(1.35) brightness(1.08)';
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.82);
    stopCamera();
    setPending({ name: `مسح-${request.ref}-${Date.now()}.jpg`, mime: 'image/jpeg', size: Math.round((dataUrl.length * 3) / 4), dataUrl });
  };

  const save = () => {
    if (!pending) return;
    try {
      store.uploadDocument(user, request.id, { doc_type: docType, file_name: pending.name, mime: pending.mime, size: pending.size, data_url: pending.dataUrl, original_held: originalHeld });
      toast('تم حفظ المستند في ملف المعاملة');
      onClose();
    } catch (e) {
      setError(e instanceof DomainError ? e.message : 'تعذّر حفظ المستند.');
    }
  };

  return (
    <Dialog
      open={open}
      onClose={() => {
        stopCamera();
        onClose();
      }}
      title="إضافة مستند"
      description={`${request.ref} — يُحفظ داخل ملف المعاملة ويُسجَّل من رفعه ومتى`}
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            إلغاء
          </Button>
          <Button onClick={save} disabled={!pending}>
            حفظ المستند
          </Button>
        </>
      }
    >
      <div className="space-y-5">
        {error && <Alert tone="danger">{error}</Alert>}
        <Field label="نوع المستند" required>
          <Select value={docType} onChange={(e) => setDocType(e.target.value)}>
            {[...docTypes, OTHER].map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </Select>
        </Field>

        <div className="inline-flex rounded-lg border border-line bg-surface-2 p-1" role="radiogroup" aria-label="طريقة الإضافة">
          {(
            [
              ['file', 'رفع ملف', FileUp],
              ['camera', 'تصوير بالكاميرا', Camera],
            ] as const
          ).map(([value, label, Icon]) => (
            <button
              key={value}
              type="button"
              role="radio"
              aria-checked={mode === value}
              onClick={() => {
                setPending(null);
                setError(null);
                setMode(value);
              }}
              className={cn('flex h-8 items-center gap-2 rounded-md px-3 text-sm font-medium', mode === value ? 'bg-surface text-ink shadow-sm' : 'text-ink-3 hover:text-ink')}
            >
              <Icon className="size-4" aria-hidden />
              {label}
            </button>
          ))}
        </div>

        {pending ? (
          <div className="flex items-center gap-4 rounded-xl border border-line bg-surface-2 p-3">
            {pending.mime.startsWith('image/') ? (
              <img src={pending.dataUrl} alt="معاينة المستند" className="h-24 w-20 rounded-md border border-line object-cover" />
            ) : (
              <div className="flex h-24 w-20 items-center justify-center rounded-md border border-line bg-surface text-xs font-semibold text-danger">PDF</div>
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-ink">{pending.name}</p>
              <p className="text-xs text-ink-3">{formatFileSize(pending.size)}</p>
            </div>
            <Button variant="ghost" size="sm" icon={RotateCcw} onClick={() => setPending(null)}>
              تغيير
            </Button>
          </div>
        ) : mode === 'file' ? (
          <label
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragging(false);
              const file = e.dataTransfer.files[0];
              if (file) void accept(file);
            }}
            className={cn(
              'flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-10 text-center transition-colors',
              dragging ? 'border-brand bg-brand-soft/50' : 'border-line-strong hover:border-brand hover:bg-surface-2',
            )}
          >
            <FileUp className="size-8 text-ink-3" aria-hidden />
            <span className="mt-3 text-sm font-medium text-ink">اسحب الملف هنا أو اضغط للاختيار</span>
            <span className="mt-1 text-xs text-ink-3">PDF أو صورة · الحد الأقصى 2 م.ب في نسخة العرض</span>
            <input
              type="file"
              accept="application/pdf,image/png,image/jpeg,image/webp"
              className="sr-only"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void accept(file);
              }}
            />
          </label>
        ) : (
          <div className="overflow-hidden rounded-xl border border-line bg-ink">
            <video ref={videoRef} autoPlay playsInline muted className="aspect-[4/3] w-full object-cover" />
            <div className="flex justify-center bg-surface p-3">
              <Button icon={Camera} onClick={capture}>
                التقاط الصفحة
              </Button>
            </div>
          </div>
        )}

        <Checkbox
          label="الأصل محفوظ لدى المكتب"
          description="فعّلها لو استلمت أصل المستند من العميل؛ ستظهر في قائمة الأصول المطلوب ردّها عند التسليم."
          checked={originalHeld}
          onChange={(e) => setOriginalHeld(e.target.checked)}
        />
        <p className="text-xs text-ink-3">ربط الماسح الضوئي المكتبي (TWAIN/WIA) يتم في النسخة الفعلية عبر برنامج وسيط مثبت على جهاز الفرع.</p>
      </div>
    </Dialog>
  );
}
