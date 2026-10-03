import { FlaskConical } from 'lucide-react';

export function DemoBanner() {
  return (
    <div className="no-print flex items-center justify-center gap-2 bg-ink px-4 py-1.5 text-center text-xs text-canvas">
      <FlaskConical className="size-3.5 shrink-0" aria-hidden />
      <span>نسخة عرض تجريبية — كل الأسماء والأرقام وهمية، والبيانات محفوظة في هذا المتصفح فقط.</span>
    </div>
  );
}
