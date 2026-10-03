import { useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react';
import {
  Building2,
  ClipboardList,
  ExternalLink,
  FileStack,
  FolderArchive,
  LayoutDashboard,
  LogOut,
  Menu,
  Moon,
  Plus,
  ScrollText,
  Search,
  Sun,
  UserCog,
  Users,
  Wallet,
  X,
  type LucideIcon,
} from 'lucide-react';
import { useAuth, useUser } from '../app/AuthContext';
import { useTheme } from '../app/ThemeContext';
import { DemoBanner } from '../app/DemoBanner';
import { useDb } from '../data/hooks';
import { ROLE, type Permission } from '../data/meta';
import { cn } from '../lib/cn';
import { Link, navigate, useLocation } from '../lib/router';
import { Button, IconButton } from '../ui/Button';
import { Avatar, Kbd } from '../ui/Layout';
import { Logo } from '../ui/Logo';
import { NewRequestDialog } from './requests/NewRequestDialog';

interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  permission?: Permission;
  match: (path: string) => boolean;
}

const NAV: Array<{ group: string; items: NavItem[] }> = [
  {
    group: 'العمل اليومي',
    items: [
      { to: '/app', label: 'لوحة المتابعة', icon: LayoutDashboard, match: (p) => p === '/app' },
      { to: '/app/requests', label: 'المعاملات', icon: ClipboardList, permission: 'requests.view', match: (p) => p.startsWith('/app/requests') },
      { to: '/app/clients', label: 'العملاء', icon: Users, permission: 'clients.view', match: (p) => p.startsWith('/app/clients') },
      { to: '/app/documents', label: 'أرشيف المستندات', icon: FolderArchive, permission: 'requests.view', match: (p) => p.startsWith('/app/documents') },
    ],
  },
  {
    group: 'المالية',
    items: [{ to: '/app/treasury', label: 'الخزينة والإيصالات', icon: Wallet, permission: 'treasury.view', match: (p) => p.startsWith('/app/treasury') }],
  },
  {
    group: 'الإدارة',
    items: [
      { to: '/app/services', label: 'الخدمات والإجراءات', icon: FileStack, match: (p) => p.startsWith('/app/services') },
      { to: '/app/users', label: 'الموظفون والصلاحيات', icon: UserCog, permission: 'users.manage', match: (p) => p.startsWith('/app/users') },
      { to: '/app/branches', label: 'الفروع', icon: Building2, permission: 'branches.manage', match: (p) => p.startsWith('/app/branches') },
      { to: '/app/audit', label: 'سجل النشاط', icon: ScrollText, permission: 'audit.view', match: (p) => p.startsWith('/app/audit') },
    ],
  },
];

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const user = useUser();
  const { can, logout } = useAuth();
  const db = useDb();
  const { path } = useLocation();
  const branch = db.branches.find((b) => b.id === user.branch_id);

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center px-5">
        <Link to="/app" onClick={onNavigate} aria-label="لوحة المتابعة">
          <Logo />
        </Link>
      </div>

      <nav aria-label="القائمة الرئيسية" className="scrollbar-thin flex-1 overflow-y-auto px-3 py-2">
        {NAV.map((section) => {
          const items = section.items.filter((item) => !item.permission || can(item.permission));
          if (items.length === 0) return null;
          return (
            <div key={section.group} className="mb-5">
              <p className="mb-1.5 px-3 text-xs font-medium text-ink-3">{section.group}</p>
              <ul className="space-y-0.5">
                {items.map((item) => {
                  const active = item.match(path);
                  const Icon = item.icon;
                  return (
                    <li key={item.to}>
                      <Link
                        to={item.to}
                        onClick={onNavigate}
                        aria-current={active ? 'page' : undefined}
                        className={cn(
                          'flex h-10 items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors',
                          active ? 'bg-brand-soft text-brand-ink' : 'text-ink-2 hover:bg-surface-3 hover:text-ink',
                        )}
                      >
                        <Icon className={cn('size-[18px]', active ? 'text-brand-ink' : 'text-ink-3')} aria-hidden />
                        {item.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </nav>

      <div className="border-t border-line p-3">
        <div className="flex items-center gap-3 rounded-lg px-2 py-2">
          <Avatar name={user.full_name} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-ink">{user.full_name}</p>
            <p className="truncate text-xs text-ink-3">
              {ROLE[user.role].label} · {user.role === 'admin' ? 'كل الفروع' : branch?.short}
            </p>
          </div>
          <IconButton icon={LogOut} label="تسجيل الخروج" size="sm" onClick={logout} />
        </div>
      </div>
    </div>
  );
}

function GlobalSearch() {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      const typing = target.closest('input, textarea, select, [contenteditable="true"]');
      if (event.key === '/' && !typing) {
        event.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    navigate(`/app/requests?q=${encodeURIComponent(query.trim())}`);
    setQuery('');
    inputRef.current?.blur();
  };

  return (
    <form role="search" onSubmit={submit} className="relative hidden w-full max-w-md md:block">
      <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-ink-3" aria-hidden />
      <input
        ref={inputRef}
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="ابحث برقم المعاملة أو اسم العميل أو الموبايل"
        aria-label="بحث في المعاملات"
        className="h-10 w-full rounded-lg border border-line bg-surface-2 ps-9 pe-10 text-sm text-ink placeholder:text-ink-3 focus:border-brand focus:bg-surface focus:outline-none focus:ring-3 focus:ring-brand/15"
      />
      <span className="pointer-events-none absolute end-3 top-1/2 -translate-y-1/2">
        <Kbd>/</Kbd>
      </span>
    </form>
  );
}

export function StaffLayout({ children }: { children: ReactNode }) {
  const { can } = useAuth();
  const { resolved, setPreference } = useTheme();
  const { path } = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [newRequestOpen, setNewRequestOpen] = useState(false);
  const mainRef = useRef<HTMLElement>(null);

  // Move focus to the page heading on navigation (screen-reader friendly) and scroll to top.
  useEffect(() => {
    setMenuOpen(false);
    window.scrollTo({ top: 0 });
    mainRef.current?.querySelector<HTMLElement>('h1')?.focus({ preventScroll: true });
  }, [path]);

  return (
    <div className="min-h-dvh bg-canvas">
      <a href="#main" className="skip-link">
        تخطَّ إلى المحتوى
      </a>

      <aside className="no-print fixed inset-y-0 start-0 z-30 hidden w-64 border-e border-line bg-surface lg:block">
        <SidebarContent />
      </aside>

      {menuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="القائمة">
          <button type="button" className="absolute inset-0 bg-ink/40" aria-label="إغلاق القائمة" onClick={() => setMenuOpen(false)} />
          <div className="absolute inset-y-0 start-0 w-72 animate-fade-up border-e border-line bg-surface shadow-pop">
            <div className="absolute end-2 top-3">
              <IconButton icon={X} label="إغلاق القائمة" size="sm" onClick={() => setMenuOpen(false)} />
            </div>
            <SidebarContent onNavigate={() => setMenuOpen(false)} />
          </div>
        </div>
      )}

      <div className="lg:ps-64">
        <DemoBanner />
        <header className="no-print sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-line bg-surface/90 px-4 backdrop-blur sm:px-6">
          <IconButton icon={Menu} label="فتح القائمة" className="lg:hidden" onClick={() => setMenuOpen(true)} />
          <GlobalSearch />
          <div className="ms-auto flex items-center gap-1.5">
            <IconButton
              icon={resolved === 'dark' ? Sun : Moon}
              label={resolved === 'dark' ? 'الوضع الفاتح' : 'الوضع الداكن'}
              onClick={() => setPreference(resolved === 'dark' ? 'light' : 'dark')}
            />
            <Link to="/" className="hidden h-10 items-center gap-1.5 rounded-lg px-3 text-sm text-ink-2 hover:bg-surface-3 hover:text-ink sm:inline-flex">
              <ExternalLink className="size-4" aria-hidden />
              موقع العملاء
            </Link>
            {can('requests.create') && (
              <Button icon={Plus} onClick={() => setNewRequestOpen(true)}>
                معاملة جديدة
              </Button>
            )}
          </div>
        </header>

        <main id="main" ref={mainRef} className="mx-auto w-full max-w-[1400px] px-4 py-6 sm:px-6 lg:py-8">
          {children}
        </main>
      </div>

      {newRequestOpen && <NewRequestDialog open onClose={() => setNewRequestOpen(false)} />}
    </div>
  );
}
