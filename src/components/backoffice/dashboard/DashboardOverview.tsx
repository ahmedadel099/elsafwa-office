import React from 'react';
import { 
  FileText, 
  Clock, 
  AlertTriangle, 
  PlusCircle, 
  ArrowUpRight, 
  CreditCard,
  Building
} from 'lucide-react';
import { useData } from '../../../context/DataContext';
import { useAuth } from '../../../context/AuthContext';
import { useLanguage } from '../../../context/LanguageContext';
import { StatCard } from '../../common/StatCard';
import { RevenueChart } from './RevenueChart';
import { formatCurrency, formatDateArabic, STATUS_META } from '../../../utils/formatters';
import { RequestStatus } from '../../../types';

interface DashboardOverviewProps {
  onNavigateToTab: (tab: any) => void;
  onOpenCreateRequest: () => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({ onNavigateToTab, onOpenCreateRequest }) => {
  const { metrics, requests } = useData();
  const { currentRole, currentBranchId, allBranches } = useAuth();
  const { t } = useLanguage();

  const activeBranchObj = allBranches.find(b => b.id === currentBranchId);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome Hero Banner */}
      <div className="bg-slate-900 text-white dark:bg-[#111827] p-6 sm:p-8 rounded-2xl border border-slate-800 shadow-sm flex flex-wrap items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 bg-slate-800 text-emerald-400 border border-slate-700 px-3 py-1 rounded-md text-xs font-bold mb-3">
            <Building className="w-3.5 h-3.5" />
            {t('منظومة الصفوة لإدارة الخدمة والتراخيص', 'Smart Services Management Hub')}
          </div>

          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            {t('لوحة التحكم والتحليلات الإدارية المباشرة', 'Executive Dashboard & Live Analytics')}
          </h2>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl font-medium">
            {currentRole === 'admin'
              ? t('متابعة لحظية وموحدة لأداء كافة الفروع، مسار المعاملات، الإيصالات المالية، وسجلات المتابعة', 'Comprehensive multi-branch performance analytics')
              : t(`نطاق المتابعة الحالي: ${activeBranchObj?.name_ar || 'فرع منيا القمح'}`, `Current Scope: ${activeBranchObj?.name_ar}`)}
          </p>
        </div>

        <button
          onClick={onOpenCreateRequest}
          className="flex items-center gap-2 px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-sm transition shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          <span>{t('تسجيل معاملة / طلب جديد', 'Create New Request')}</span>
        </button>
      </div>

      {/* KPI Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title={t('إجمالي المعاملات والطلبات', 'Total Requests')}
          value={metrics.totalRequests}
          subtitle={t('كافة الطلبات بالمنظومة', 'All requests')}
          icon={FileText}
          colorTheme="emerald"
          onClick={() => onNavigateToTab('requests')}
        />

        <StatCard
          title={t('طلبات جديدة قيد التوجيه', 'New Submissions')}
          value={metrics.newSubmissionsCount}
          subtitle={t('تحتاج مراجعة واسناد', 'Needs staff assignment')}
          icon={Clock}
          colorTheme="gold"
          onClick={() => onNavigateToTab('requests')}
        />

        <StatCard
          title={t('طلبات متاخرة / قيد الموعد', 'Due / Overdue Alerts')}
          value={metrics.dueOverdueCount}
          subtitle={t('تجاوزت الموعد المستهدف', 'Exceeded target date')}
          icon={AlertTriangle}
          colorTheme="rose"
          onClick={() => onNavigateToTab('requests')}
        />

        <StatCard
          title={t('رسوم محصلة هذا الشهر', 'Fees Collected This Month')}
          value={formatCurrency(metrics.totalFeesCollectedThisMonth)}
          subtitle={t(`المتبقي غير المسدد: ${formatCurrency(metrics.totalBalanceDue)}`, `Balance Due: ${formatCurrency(metrics.totalBalanceDue)}`)}
          icon={CreditCard}
          colorTheme="sapphire"
          onClick={() => onNavigateToTab('payments')}
        />
      </div>

      {/* Recharts Visual Charts Section */}
      <RevenueChart />

      {/* Status Counters Horizontal Matrix */}
      <div className="bg-white dark:bg-[#111827] rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
            {t('توزيع حالات المعاملات الحالية (Workflow Statuses)', 'Current Status Distribution')}
          </h3>
          <button 
            onClick={() => onNavigateToTab('requests')}
            className="text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:underline flex items-center gap-1"
          >
            <span>{t('عرض الجدول الكامل', 'View Queue')}</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {(Object.keys(STATUS_META) as RequestStatus[]).map(statusKey => {
            const count = metrics.statusBreakdown[statusKey] || 0;
            const meta = STATUS_META[statusKey];

            return (
              <div 
                key={statusKey} 
                className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between"
              >
                <div>
                  <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block mb-0.5">
                    {meta.label_ar}
                  </span>
                  <span className="text-lg font-black text-slate-900 dark:text-white font-mono">
                    {count}
                  </span>
                </div>
                <span className={`w-3 h-3 rounded-full ${meta.badgeClass.includes('emerald') ? 'bg-emerald-600' : meta.badgeClass.includes('amber') ? 'bg-amber-500' : meta.badgeClass.includes('purple') ? 'bg-purple-600' : 'bg-slate-400'}`}></span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Requests Feed */}
      <div className="bg-white dark:bg-[#111827] rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Clock className="w-4 h-4 text-emerald-600" />
            {t('أحدث الطلبات المعاملات المسجلة', 'Recent Requests Feed')}
          </h3>

          <button 
            onClick={() => onNavigateToTab('requests')}
            className="text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:underline"
          >
            {t('عرض الكل', 'View All')}
          </button>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {requests.slice(0, 5).map(req => (
            <div key={req.id} className="py-3.5 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono font-bold flex items-center justify-center border border-slate-200 dark:border-slate-700">
                  SFW
                </div>
                <div>
                  <div className="font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                    <span className="font-mono text-emerald-700 dark:text-emerald-400">{req.tracking_ref}</span>
                    <span>•</span>
                    <span>{req.client_name}</span>
                  </div>
                  <div className="text-slate-500 dark:text-slate-400 mt-0.5">
                    {req.service_name_ar} ({req.branch_name_ar})
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className={`px-3 py-1 rounded-lg font-extrabold text-[11px] ${STATUS_META[req.status]?.badgeClass}`}>
                  {STATUS_META[req.status]?.label_ar}
                </span>
                <span className="text-slate-400 font-mono text-[11px]">
                  {formatDateArabic(req.received_date)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
