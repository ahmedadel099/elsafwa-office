import { useState } from 'react';
import { ArrowLeft, Clock, FileText, SearchX } from 'lucide-react';
import { SERVICE_CATEGORIES } from '../data/catalog';
import { useDb } from '../data/hooks';
import { cn } from '../lib/cn';
import { Link } from '../lib/router';
import { EmptyState } from '../ui/Feedback';
import { Input } from '../ui/Field';

export function ServicesPage() {
  const db = useDb();
  const [q, setQ] = useState('');
  const [category, setCategory] = useState<string>('');
  const services = db.services.filter((s) => s.is_active && (!category || s.category === category) && (!q.trim() || s.name.includes(q.trim()) || s.summary.includes(q.trim())));

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-semibold text-ink">دليل الخدمات</h1>
      <p className="mt-2 max-w-2xl text-ink-2">لكل خدمة: الجهة المختصة، المستندات المطلوبة، خطوات الإجراء، والمدة المتوقعة. المدد تقديرية وتعتمد على الجهة.</p>

      <div className="mt-8 flex flex-col gap-4 lg:flex-row lg:items-center">
        <div className="w-full lg:w-80">
          <Input inputSize="lg" type="search" aria-label="ابحث عن خدمة" placeholder="ابحث عن خدمة… مثال: ترخيص محل" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="التصنيف">
          {['', ...SERVICE_CATEGORIES].map((c) => (
            <button
              key={c || 'all'}
              type="button"
              role="radio"
              aria-checked={category === c}
              onClick={() => setCategory(c)}
              className={cn('h-9 rounded-full border px-4 text-sm transition-colors', category === c ? 'border-brand bg-brand text-on-brand' : 'border-line bg-surface text-ink-2 hover:border-line-strong')}
            >
              {c || 'كل الخدمات'}
            </button>
          ))}
        </div>
      </div>

      {services.length === 0 ? (
        <EmptyState icon={SearchX} title="لم نجد خدمة بهذا الاسم" description="اتصل بنا ونقولك هل نقدر نساعدك." className="mt-8" />
      ) : (
        <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((s) => (
            <li key={s.id}>
              <Link to={`/services/${s.id}`} className="group flex h-full flex-col rounded-2xl border border-line bg-surface p-5 shadow-card transition-colors hover:border-brand/50">
                <p className="text-xs font-medium text-ink-3">{s.category}</p>
                <h2 className="mt-1.5 font-semibold text-ink group-hover:text-brand-ink">{s.name}</h2>
                <p className="mt-2 flex-1 text-sm text-ink-2">{s.summary}</p>
                <div className="mt-4 flex items-center gap-4 border-t border-line pt-4 text-[13px] text-ink-3">
                  <span className="flex items-center gap-1.5">
                    <FileText className="size-4" aria-hidden /> {s.required_documents.length} مستندات
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="size-4" aria-hidden /> ~{s.estimated_days} يوم عمل
                  </span>
                  <ArrowLeft className="ms-auto size-4 text-brand-ink ltr:rotate-180" aria-hidden />
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
