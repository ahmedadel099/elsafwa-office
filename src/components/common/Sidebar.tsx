import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  FolderKanban, 
  CreditCard, 
  Briefcase, 
  UserCheck, 
  Building,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';

export type TabKey = 
  | 'dashboard' 
  | 'clients' 
  | 'requests' 
  | 'documents' 
  | 'payments' 
  | 'service_types' 
  | 'users' 
  | 'branches';

interface SidebarProps {
  activeTab: TabKey;
  setActiveTab: (tab: TabKey) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const { currentRole, currentUser, currentBranchId, allBranches, switchToPublicPortal } = useAuth();
  const { t } = useLanguage();

  const activeBranchObj = allBranches.find(b => b.id === currentBranchId);

  const menuItems = [
    { key: 'dashboard', label_ar: 'لوحة التحليلات', label_en: 'Dashboard', icon: LayoutDashboard, roleAccess: ['admin', 'branch_manager', 'employee'] },
    { key: 'requests', label_ar: 'منظومة المعاملات والطلبات', label_en: 'Requests Queue', icon: FileText, roleAccess: ['admin', 'branch_manager', 'employee'] },
    { key: 'clients', label_ar: 'سجل العملاء الجماهير', label_en: 'Clients Directory', icon: Users, roleAccess: ['admin', 'branch_manager', 'employee'] },
    { key: 'documents', label_ar: 'أرشيف المستندات والمسح الضوئي', label_en: 'Documents & Scanner', icon: FolderKanban, roleAccess: ['admin', 'branch_manager', 'employee'] },
    { key: 'payments', label_ar: 'الخزينة والرسوم والايصالات', label_en: 'Payments & Receipts', icon: CreditCard, roleAccess: ['admin', 'branch_manager', 'employee'] },
    { key: 'service_types', label_ar: 'دليل ورسوم التراخيص والخدمات', label_en: 'Service Types Catalog', icon: Briefcase, roleAccess: ['admin'] },
    { key: 'users', label_ar: 'الموظفين وصلاحيات الأدوار', label_en: 'Users & Roles', icon: UserCheck, roleAccess: ['admin'] },
    { key: 'branches', label_ar: 'إدارة الفروع والمكاتب', label_en: 'Branches Management', icon: Building, roleAccess: ['admin'] },
  ];

  return (
    <aside className="w-64 bg-white dark:bg-[#111827] text-slate-900 dark:text-slate-100 flex flex-col shrink-0 min-h-[calc(100vh-68px)] border-e border-slate-200 dark:border-slate-800 transition-colors duration-150 no-print">
      {/* Scope Info Card */}
      <div className="p-4 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2 mb-1">
          <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span className="text-[11px] font-extrabold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
            {currentRole === 'admin' ? t('مدير النظام العام', 'System Administrator') : 
             currentRole === 'branch_manager' ? t('مدير فرع مأذون', 'Branch Manager') : 
             t('موظف تنفيذ وتراخيص', 'Service Employee')}
          </span>
        </div>
        <div className="text-sm font-black text-slate-900 dark:text-white truncate">
          {currentUser ? currentUser.full_name : t('مستخدم بالنظام', 'System User')}
        </div>
        <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 font-semibold">
          {currentRole === 'admin' 
            ? t('كافة فروع الشركة', 'All Branches Scope')
            : activeBranchObj?.name_ar || t('فرع منيا القمح', 'Minya Branch')}
        </div>
      </div>

      {/* Nav Menu Items */}
      <nav className="p-3 space-y-1 flex-1">
        {menuItems.map(item => {
          if (!item.roleAccess.includes(currentRole)) return null;

          const Icon = item.icon;
          const isActive = activeTab === item.key;

          return (
            <button
              key={item.key}
              onClick={() => setActiveTab(item.key as TabKey)}
              className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl font-bold text-xs transition ${
                isActive
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950 font-black shadow-sm'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400 dark:text-emerald-600' : 'text-slate-400'}`} />
              <span>{t(item.label_ar, item.label_en)}</span>
            </button>
          );
        })}
      </nav>

      {/* Switch to Public Portal Link */}
      <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
        <button
          onClick={switchToPublicPortal}
          className="w-full flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 transition text-xs font-bold"
        >
          <span className="flex items-center gap-2">
            <ExternalLink className="w-4 h-4 text-emerald-600" />
            {t('عرض بوابة الجمهور', 'View Public Portal')}
          </span>
          <span className="bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-[10px] px-2 py-0.5 rounded-md font-extrabold">
            {t('عام', 'Public')}
          </span>
        </button>
      </div>

      <div className="p-3 text-[11px] text-slate-400 text-center border-t border-slate-200 dark:border-slate-800 font-mono">
        {t('شركة الصفوة - ترخيص ٦٧٩ (ب)', 'El Safwa Office - Lic 679 B')}
      </div>
    </aside>
  );
};
