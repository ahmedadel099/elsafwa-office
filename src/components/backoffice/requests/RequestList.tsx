import React, { useState } from 'react';
import { 
  FileText, 
  Search, 
  Filter, 
  Download, 
  PlusCircle, 
  RefreshCw, 
  Calendar, 
  User, 
  Building, 
  Eye, 
  Clock,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { useData } from '../../../context/DataContext';
import { useAuth } from '../../../context/AuthContext';
import { useLanguage } from '../../../context/LanguageContext';
import { RequestRecord, RequestStatus } from '../../../types';
import { STATUS_META, PRIORITY_META, formatCurrency, formatDateArabic } from '../../../utils/formatters';
import { exportRequestsToCSV } from '../../../utils/exportCsv';
import { RequestFormModal } from './RequestFormModal';
import { RequestDetailModal } from './RequestDetailModal';
import { StatusChangeModal } from './StatusChangeModal';

export const RequestList: React.FC = () => {
  const { requests, serviceTypes, branches } = useData();
  const { currentBranchId, allBranches, allProfiles } = useAuth();
  const { t } = useLanguage();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [branchFilter, setBranchFilter] = useState<string>(currentBranchId || 'all');
  const [serviceFilter, setServiceFilter] = useState<string>('all');
  const [employeeFilter, setEmployeeFilter] = useState<string>('all');

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedRequestForDetail, setSelectedRequestForDetail] = useState<RequestRecord | null>(null);
  const [selectedRequestForStatus, setSelectedRequestForStatus] = useState<RequestRecord | null>(null);

  const filteredRequests = requests.filter(req => {
    if (branchFilter !== 'all' && req.branch_id !== branchFilter) return false;
    if (statusFilter !== 'all' && req.status !== statusFilter) return false;
    if (serviceFilter !== 'all' && req.service_type_id !== serviceFilter) return false;
    if (employeeFilter !== 'all' && req.assigned_employee_id !== employeeFilter) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      return (
        req.tracking_ref.toLowerCase().includes(q) ||
        req.client_name?.toLowerCase().includes(q) ||
        req.client_phone?.includes(q) ||
        req.client_national_id?.includes(q) ||
        req.govt_ref?.toLowerCase().includes(q) ||
        req.office_ref?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <FileText className="w-5 h-5 text-emerald-600" />
            {t('منظومة إدارة المعاملات والطلبات الحالية', 'Requests Queue & Workflow Engine')}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
            {t('متابعة مراحل التنفيذ، تغيير الحالة، المرفقات، وسداد الرسوم', 'Track status timeline, document archives, and fees')}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => exportRequestsToCSV(filteredRequests)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs hover:bg-slate-100 transition"
          >
            <Download className="w-4 h-4 text-emerald-600" />
            <span>{t('تصدير إكسل (CSV)', 'Export CSV')}</span>
          </button>

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-900 hover:bg-emerald-800 text-white font-extrabold text-xs shadow-md transition hover:scale-105 active:scale-95"
          >
            <PlusCircle className="w-4 h-4 text-gold-400" />
            <span>{t('تسجيل معاملة جديدة', 'New Request')}</span>
          </button>
        </div>
      </div>

      {/* Multi-Criteria Search & Filter Controls */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute start-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={t('البحث برقم التتبع SFW، اسم العميل، الهاتف، الرقم القومي، أو رقم الجهة...', 'Search by tracking code, client name, phone, or Govt Ref #...')}
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full ps-10 pe-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-bold focus:ring-2 focus:ring-emerald-600 focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold focus:outline-none"
          >
            <option value="all">{t('كافة الحالات', 'All Statuses')}</option>
            {(Object.keys(STATUS_META) as RequestStatus[]).map(st => (
              <option key={st} value={st}>{STATUS_META[st].label_ar}</option>
            ))}
          </select>

          {/* Branch Filter */}
          <select
            value={branchFilter}
            onChange={e => setBranchFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold focus:outline-none"
          >
            <option value="all">{t('كافة الفروع', 'All Branches')}</option>
            {allBranches.map(b => (
              <option key={b.id} value={b.id}>{b.name_ar}</option>
            ))}
          </select>

          {/* Service Type Filter */}
          <select
            value={serviceFilter}
            onChange={e => setServiceFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold focus:outline-none"
          >
            <option value="all">{t('كافة أنواع الخدمات', 'All Service Types')}</option>
            {serviceTypes.map(s => (
              <option key={s.id} value={s.id}>{s.name_ar}</option>
            ))}
          </select>

          {/* Employee Filter */}
          <select
            value={employeeFilter}
            onChange={e => setEmployeeFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold focus:outline-none"
          >
            <option value="all">{t('كافة الموظفين', 'All Staff')}</option>
            {allProfiles.map(p => (
              <option key={p.id} value={p.id}>{p.full_name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Requests Queue Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-start text-xs">
            <thead className="bg-slate-100 dark:bg-slate-950 text-slate-500 dark:text-slate-400 font-extrabold uppercase border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-5 py-3.5 text-start">{t('كود التتبع / المعاملة', 'Tracking Ref')}</th>
                <th className="px-5 py-3.5 text-start">{t('صاحب المعاملة (العميل)', 'Client Name')}</th>
                <th className="px-5 py-3.5 text-start">{t('الخدمة والفرع', 'Service & Branch')}</th>
                <th className="px-5 py-3.5 text-start">{t('الحالة والأولوية', 'Status & Priority')}</th>
                <th className="px-5 py-3.5 text-start">{t('المستهدف والرسوم', 'Target & Fee')}</th>
                <th className="px-5 py-3.5 text-end">{t('الإجراءات', 'Actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
              {filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-slate-400 font-bold">
                    {t('لا يوجد طلبات مطابقة للبحث', 'No matching requests found')}
                  </td>
                </tr>
              ) : (
                filteredRequests.map(req => (
                  <tr 
                    key={req.id}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition cursor-pointer"
                    onClick={() => setSelectedRequestForDetail(req)}
                  >
                    <td className="px-5 py-3.5 font-mono font-extrabold text-emerald-800 dark:text-emerald-400">
                      <div>{req.tracking_ref}</div>
                      {req.govt_ref && (
                        <div className="text-[10px] text-slate-400 font-normal">جهة: {req.govt_ref}</div>
                      )}
                    </td>

                    <td className="px-5 py-3.5 font-extrabold text-slate-900 dark:text-white">
                      <div>{req.client_name}</div>
                      <div className="font-mono text-[11px] text-slate-400 font-normal">{req.client_phone}</div>
                    </td>

                    <td className="px-5 py-3.5 text-slate-700 dark:text-slate-300">
                      <div className="font-bold">{req.service_name_ar}</div>
                      <div className="text-[10px] text-slate-400">{req.branch_name_ar}</div>
                    </td>

                    <td className="px-5 py-3.5">
                      <div className="flex flex-col gap-1 items-start">
                        <span className={`px-2.5 py-0.5 rounded-xl text-[10px] font-extrabold ${STATUS_META[req.status]?.badgeClass}`}>
                          {STATUS_META[req.status]?.label_ar}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${PRIORITY_META[req.priority]?.badgeClass}`}>
                          {PRIORITY_META[req.priority]?.label_ar}
                        </span>
                      </div>
                    </td>

                    <td className="px-5 py-3.5 text-slate-600 dark:text-slate-400 font-mono">
                      <div>{formatCurrency(req.total_fee)}</div>
                      <div className="text-[10px] text-slate-400">استلام: {formatDateArabic(req.received_date)}</div>
                    </td>

                    <td className="px-5 py-3.5 text-end space-x-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedRequestForStatus(req);
                        }}
                        className="px-2.5 py-1 rounded-xl bg-amber-50 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-bold hover:bg-amber-100 transition text-[11px]"
                      >
                        {t('تحديث الحالة', 'Status')}
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedRequestForDetail(req);
                        }}
                        className="px-2.5 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold hover:bg-emerald-100 transition text-[11px]"
                      >
                        {t('تفاصيل', 'Details')}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Request Modal */}
      {isCreateModalOpen && (
        <RequestFormModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
        />
      )}

      {/* Status Update Modal */}
      {selectedRequestForStatus && (
        <StatusChangeModal
          request={selectedRequestForStatus}
          isOpen={!!selectedRequestForStatus}
          onClose={() => setSelectedRequestForStatus(null)}
        />
      )}

      {/* Request Comprehensive Details Modal */}
      {selectedRequestForDetail && (
        <RequestDetailModal
          request={selectedRequestForDetail}
          isOpen={!!selectedRequestForDetail}
          onClose={() => setSelectedRequestForDetail(null)}
        />
      )}
    </div>
  );
};
