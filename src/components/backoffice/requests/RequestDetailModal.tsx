import React, { useState } from 'react';
import { 
  FileText, 
  Clock, 
  FolderKanban, 
  CreditCard, 
  User, 
  Building, 
  ListTodo,
  CheckCircle2
} from 'lucide-react';
import { useData } from '../../../context/DataContext';
import { useAuth } from '../../../context/AuthContext';
import { useLanguage } from '../../../context/LanguageContext';
import { RequestRecord } from '../../../types';
import { Modal } from '../../common/Modal';
import { WorkflowTimeline } from './WorkflowTimeline';
import { TaskChecklistManager } from './TaskChecklistManager';
import { DocumentManager } from '../documents/DocumentManager';
import { PaymentManager } from '../payments/PaymentManager';
import { STATUS_META, PRIORITY_META, formatCurrency, formatDateArabic } from '../../../utils/formatters';

interface RequestDetailModalProps {
  request: RequestRecord;
  isOpen: boolean;
  onClose: () => void;
}

export const RequestDetailModal: React.FC<RequestDetailModalProps> = ({ request, isOpen, onClose }) => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'overview' | 'checklist' | 'timeline' | 'documents' | 'payments'>('overview');

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`${t('تفاصيل المعاملة والطلب:', 'Request Details:')} ${request.tracking_ref}`}
      subtitle={`${request.client_name} - ${request.service_name_ar}`}
      maxWidth="4xl"
    >
      {/* 5 Tabs Header Navigation */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 mb-6 gap-2 overflow-x-auto text-xs font-extrabold pb-1">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition ${
            activeTab === 'overview'
              ? 'bg-emerald-900 text-white shadow-md'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <FileText className="w-4 h-4 text-gold-400" />
          <span>{t('تفاصيل الطلب', 'Overview')}</span>
        </button>

        <button
          onClick={() => setActiveTab('checklist')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition ${
            activeTab === 'checklist'
              ? 'bg-emerald-900 text-white shadow-md'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <ListTodo className="w-4 h-4 text-gold-400" />
          <span>{t('قائمة المهمات الإجرائية (Done/Pending)', 'Task Checklist')}</span>
        </button>

        <button
          onClick={() => setActiveTab('timeline')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition ${
            activeTab === 'timeline'
              ? 'bg-emerald-900 text-white shadow-md'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Clock className="w-4 h-4 text-gold-400" />
          <span>{t('سجل التتبع والملاحظات', 'Timeline Log')}</span>
        </button>

        <button
          onClick={() => setActiveTab('documents')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition ${
            activeTab === 'documents'
              ? 'bg-emerald-900 text-white shadow-md'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <FolderKanban className="w-4 h-4 text-gold-400" />
          <span>{t('أرشيف المستندات والماسح الضوئي', 'Documents & Scanner')}</span>
        </button>

        <button
          onClick={() => setActiveTab('payments')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition ${
            activeTab === 'payments'
              ? 'bg-emerald-900 text-white shadow-md'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <CreditCard className="w-4 h-4 text-gold-400" />
          <span>{t('الخزينة والإيصالات', 'Payments')}</span>
        </button>
      </div>

      {/* Tab Content 1: Overview */}
      {activeTab === 'overview' && (
        <div className="space-y-6 text-xs">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/60 dark:border-slate-800/60 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className={`px-3.5 py-1.5 rounded-xl font-black text-xs ${STATUS_META[request.status]?.badgeClass}`}>
                {STATUS_META[request.status]?.label_ar}
              </span>

              <span className={`px-2.5 py-1 rounded-lg font-bold text-xs ${PRIORITY_META[request.priority]?.badgeClass}`}>
                {PRIORITY_META[request.priority]?.label_ar}
              </span>
            </div>

            <div className="flex items-center gap-4 text-slate-500 font-mono">
              <span>تاريخ الاستلام: <strong>{formatDateArabic(request.received_date)}</strong></span>
              {request.target_date && <span>المستهدف: <strong>{formatDateArabic(request.target_date)}</strong></span>}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
              <h4 className="font-extrabold text-slate-900 dark:text-white border-b pb-2 flex items-center gap-1.5">
                <User className="w-4 h-4 text-emerald-600" />
                {t('بيانات صاحب المعاملة (العميل)', 'Client Details')}
              </h4>
              <div><span className="text-slate-400 font-bold">الاسم:</span> <strong className="text-slate-900 dark:text-white">{request.client_name}</strong></div>
              <div><span className="text-slate-400 font-bold">الهاتف:</span> <strong className="font-mono text-emerald-700 dark:text-emerald-400">{request.client_phone}</strong></div>
              <div><span className="text-slate-400 font-bold">الرقم القومي:</span> <strong className="font-mono text-slate-700 dark:text-slate-300">{request.client_national_id}</strong></div>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
              <h4 className="font-extrabold text-slate-900 dark:text-white border-b pb-2 flex items-center gap-1.5">
                <Building className="w-4 h-4 text-emerald-600" />
                {t('بيانات الخدمة والإسناد', 'Service & Registry')}
              </h4>
              <div><span className="text-slate-400 font-bold">نوع الخدمة:</span> <strong className="text-slate-900 dark:text-white">{request.service_name_ar}</strong></div>
              <div><span className="text-slate-400 font-bold">الفرع المسؤول:</span> <strong>{request.branch_name_ar}</strong></div>
              <div><span className="text-slate-400 font-bold">الموظف المباشر:</span> <strong>{request.assigned_employee_name}</strong></div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 flex items-center justify-between">
            <div>
              <span className="text-slate-500 font-bold block mb-0.5">إجمالي رسوم المعاملة:</span>
              <div className="text-lg font-black font-mono text-emerald-900 dark:text-emerald-300">{formatCurrency(request.total_fee)}</div>
            </div>

            <div>
              <span className="text-slate-500 font-bold block mb-0.5">المسدد:</span>
              <div className="text-base font-black font-mono text-blue-800 dark:text-blue-300">{formatCurrency(request.paid_amount || 0)}</div>
            </div>

            <div>
              <span className="text-slate-500 font-bold block mb-0.5">المتبقي:</span>
              <div className="text-base font-black font-mono text-rose-800 dark:text-rose-300">{formatCurrency(request.balance_due || 0)}</div>
            </div>
          </div>
        </div>
      )}

      {/* Tab Content 2: Task Checklist */}
      {activeTab === 'checklist' && (
        <TaskChecklistManager request={request} />
      )}

      {/* Tab Content 3: Workflow Timeline */}
      {activeTab === 'timeline' && (
        <WorkflowTimeline requestId={request.id} />
      )}

      {/* Tab Content 4: Documents Archive & Scanner */}
      {activeTab === 'documents' && (
        <DocumentManager request={request} />
      )}

      {/* Tab Content 5: Payments & Receipts */}
      {activeTab === 'payments' && (
        <PaymentManager request={request} />
      )}
    </Modal>
  );
};
