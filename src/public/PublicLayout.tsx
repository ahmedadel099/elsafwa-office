import { useEffect, useState, type ReactNode } from 'react';
import { Menu, Phone, X } from 'lucide-react';
import { DemoBanner } from '../app/DemoBanner';
import { useDb } from '../data/hooks';
import { cn } from '../lib/cn';
import { formatPhone } from '../lib/format';
import { Link, useLocation } from '../lib/router';
import { ButtonLink } from '../ui/Button';
import { Logo } from '../ui/Logo';

const NAV = [
  { to: '/services', label: 'الخدمات' },
  { to: '/track', label: 'تتبّع معاملة' },
  { to: '/#branches', label: 'الفروع والتواصل' },
];

export const OFFICE_DISCLAIMER =
  'الصفوة مكتب خاص يقدّم خدمات الوساطة والمتابعة لإنهاء الإجراءات، وليس جهة حكومية. القرار في كل طلب للجهة المختصة، والرسوم الحكومية تُسدَّد لها بإيصالات رسمية تُسلَّم للعميل.';

export function PublicLayout({ children }: { children: ReactNode }) {
  const db = useDb();
  const { path } = useLocation();
  const [open, setOpen] = useState(false);
  const mainBranch = db.branches[0];

  useEffect(() => {
    setOpen(false);
    if (window.location.hash.includes('#branches')) document.getElementById('branches')?.scrollIntoView();
    else window.scrollTo({ top: 0 });
  }, [path]);

  return (
    <div className="flex min-h-dvh flex-col bg-canvas">
      <a href="#main" className="skip-link">
        تخطَّ إلى المحتوى
      </a>
      <DemoBanner />
      <header className="no-print sticky top-0 z-30 border-b border-line bg-surface/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-6 px-4 sm:px-6">
          <Link to="/" aria-label="الصفوة — الرئيسية">
            <Logo />
          </Link>
          <nav aria-label="القائمة الرئيسية" className="hidden md:block">
            <ul className="flex items-center gap-1">
              {NAV.map((item) => (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    aria-current={path === item.to ? 'page' : undefined}
                    className={cn('rounded-lg px-3 py-2 text-sm font-medium transition-colors', path === item.to ? 'text-brand-ink' : 'text-ink-2 hover:bg-surface-3 hover:text-ink')}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <div className="ms-auto flex items-center gap-2">
            {mainBranch && (
              <a href={`tel:${mainBranch.phones[0]}`} className="hidden items-center gap-2 rounded-lg px-3 py-2 text-sm text-ink-2 hover:bg-surface-3 lg:flex">
                <Phone className="size-4" aria-hidden />
                <span className="ltr-nums">{formatPhone(mainBranch.phones[0])}</span>
              </a>
            )}
            <ButtonLink to="/apply" className="hidden sm:inline-flex">
              ابدأ طلبك
            </ButtonLink>
            <button type="button" className="rounded-lg p-2 text-ink-2 hover:bg-surface-3 md:hidden" aria-label={open ? 'إغلاق القائمة' : 'فتح القائمة'} aria-expanded={open} onClick={() => setOpen(!open)}>
              {open ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>
        </div>
        {open && (
          <nav aria-label="القائمة" className="border-t border-line px-4 py-3 md:hidden">
            <ul className="space-y-1">
              {[...NAV, { to: '/apply', label: 'ابدأ طلبك' }].map((item) => (
                <li key={item.to}>
                  <Link to={item.to} className="block rounded-lg px-3 py-2.5 text-ink hover:bg-surface-3">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        )}
      </header>

      <main id="main" className="flex-1">
        {children}
      </main>

      <footer className="no-print border-t border-line bg-surface">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <Logo />
            <p className="mt-4 max-w-sm text-sm text-ink-3">متابعة المعاملات والتراخيص الحكومية للمواطنين وأصحاب الأنشطة في منيا القمح والعزيزية — محافظة الشرقية.</p>
            <p className="mt-3 text-xs text-ink-3">ترخيص رقم ٦٧٩ (مجموعة ب)</p>
          </div>
          <div>
            <p className="text-sm font-semibold text-ink">روابط</p>
            <ul className="mt-3 space-y-2 text-sm text-ink-2">
              <li>
                <Link to="/services" className="hover:text-ink hover:underline">
                  دليل الخدمات والمستندات
                </Link>
              </li>
              <li>
                <Link to="/track" className="hover:text-ink hover:underline">
                  تتبّع معاملة
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="hover:text-ink hover:underline">
                  الخصوصية وحماية البيانات
                </Link>
              </li>
              <li>
                <Link to="/staff/login" className="hover:text-ink hover:underline">
                  دخول الموظفين
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <p className="text-sm font-semibold text-ink">تواصل معنا</p>
            <ul className="mt-3 space-y-2 text-sm text-ink-2">
              {db.branches.map((b) => (
                <li key={b.id}>
                  <span className="block text-ink">{b.short}</span>
                  <span className="ltr-nums">{b.phones.map(formatPhone).join(' / ')}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="border-t border-line">
          <p className="mx-auto max-w-6xl px-4 py-4 text-xs leading-relaxed text-ink-3 sm:px-6">
            {OFFICE_DISCLAIMER} © {new Date().getFullYear()} الصفوة.
          </p>
        </div>
      </footer>
    </div>
  );
}
