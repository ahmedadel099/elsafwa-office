import React, { useState } from 'react';
import { RefreshCw, AlertCircle, FileText, CheckCircle2 } from 'lucide-react';
import { useData } from '../../../context/DataContext';
import { useAuth } from '../../../context/AuthContext';
import { useLanguage } from '../../../context/LanguageContext';
import { RequestRecord, RequestStatus } from '../../../types';
import { Modal } from '../../common/Modal';
import { STATUS_META } from '../../../utils/formatters';

interface StatusChangeModalProps {
  request: RequestRecord;
  isOpen: boolean;
  onClose: () => void;
}

export const StatusChangeModal: React.FC<StatusChangeModalProps> = ({ request, isOpen, onClose }) => {
  const { updateRequestStatus, profiles } = useData() as any;
  const { currentUser, allProfiles } = useAuth();
  const { t } = useLanguage();

  const [toStatus, setToStatus] = useState<RequestStatus>(request.status);
  const [comment, setComment] = useState('');
  const [govtRef, setGovtRef] = useState(request.govt_ref || '');
  const [officeRef, setOfficeRef] = useState(request.office_ref || '');
  const [assignedEmployeeId, setAssignedEmployeeId] = useState(request.assigned_employee_id || '');
  
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (toStatus === request.status && !comment.trim()) {
      return setError(t('يرجى اختيار حالة جديدة أو إدخال ملاحظة تحديث', 'Please select new status or enter note'));
    }

    if (!comment.trim()) {
      return setError(t('ملاحظة تحديث الحالة إجبارية في سجل التتبع غير القابل للتعديل', 'Audit comment is mandatory for immutable status timeline'));
    }

    setIsSubmitting(true);

    try {
      updateRequestStatus({
        request_id: request.id,
        to_status: toStatus,
        changed_by_user_id: currentUser?.id || 'usr-admin',
        comment: comment.trim(),
        govt_ref: govtRef.trim() || undefined,
        office_ref: officeRef.trim() || undefined,
        assigned_employee_id: assignedEmployeeId || undefined
      });

      onClose();
    } catch (err: any) {
      setError(err.message || 'حدث خطأ أثناء تحديث حالة المعاملة');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('تحديث حالة المعاملة وتسجيل خطوة المسار', 'Update Request Status & Log History')}
      subtitle={`${t('رقم المعاملة:', 'Ref:')} ${request.tracking_ref} - ${request.client_name}`}
    >
      {error && (
        <div className="mb-4 p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs font-bold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Current vs Target Status */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between text-xs font-bold">
          <div>
            <span className="text-slate-400 block mb-1">{t('الحالة الحالية:', 'Current Status:')}</span>
            <span className={`px-3 py-1 rounded-xl text-xs font-extrabold ${STATUS_META[request.status]?.badgeClass}`}>
              {STATUS_META[request.status]?.label_ar}
            </span>
          </div>

          <div className="text-end">
            <span className="text-slate-400 block mb-1">{t('تغيير إلى الحالة:', 'New Status:')}</span>
            <select
              value={toStatus}
              onChange={e => setToStatus(e.target.value as RequestStatus)}
              className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-extrabold focus:ring-2 focus:ring-emerald-600 focus:outline-none"
            >
              {(Object.keys(STATUS_META) as RequestStatus[]).map(st => (
                <option key={st} value={st}>
                  {STATUS_META[st].label_ar}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* References & Staff Assignment */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              {t('رقم المباشرة / السجل بالجهة الحكومية (اختياري)', 'Govt Registry Ref #')}
            </label>
            <input
              type="text"
              placeholder="e.g. GOV-2026-8841"
              value={govtRef}
              onChange={e => setGovtRef(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-mono font-bold focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              {t('الموظف المسؤول عن المتابعة', 'Assigned Employee')}
            </label>
            <select
              value={assignedEmployeeId}
              onChange={e => setAssignedEmployeeId(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-bold focus:outline-none"
            >
              <option value="">{t('بدون تخصيص موظف', 'Unassigned')}</option>
              {allProfiles.map(p => (
                <option key={p.id} value={p.id}>{p.full_name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Mandatory Audit Note */}
        <div>
          <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-1">
            {t('ملاحظة وتفاصيل الإجراء المتخذ (إجباري للسجل التاريخي)', 'Mandatory Audit History Comment')} *
          </label>
          <textarea
            rows={3}
            required
            placeholder={t('مثال: تم تقديم ملف الأوراق رسمياً إلى قسم التراخيص بمجلس المدينة واستلام الرقم المرجعي...', 'Comment detailing action taken...')}
            value={comment}
            onChange={e => setComment(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-bold focus:ring-2 focus:ring-emerald-600 focus:outline-none"
          />
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 font-bold text-xs"
          >
            {t('إلغاء', 'Cancel')}
          </button>

          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2 rounded-xl bg-emerald-900 hover:bg-emerald-800 text-white font-extrabold text-xs shadow-md transition disabled:opacity-50"
          >
            {isSubmitting ? t('جاري الحفظ...', 'Saving...') : t('تأكيد وتسجيل بالحافظة التاريخية', 'Confirm Status Update')}
          </button>
        </div>
      </form>
    </Modal>
  );
};
