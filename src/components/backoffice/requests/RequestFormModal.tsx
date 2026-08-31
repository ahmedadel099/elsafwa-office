import React, { useState } from 'react';
import { PlusCircle, UserCheck, AlertCircle, FileText, Building, CreditCard } from 'lucide-react';
import { useData } from '../../../context/DataContext';
import { useAuth } from '../../../context/AuthContext';
import { useLanguage } from '../../../context/LanguageContext';
import { Modal } from '../../common/Modal';

interface RequestFormModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RequestFormModal: React.FC<RequestFormModalProps> = ({ isOpen, onClose }) => {
  const { clients, serviceTypes, branches, createRequest, saveClient } = useData();
  const { currentUser, currentBranchId, allBranches, allProfiles } = useAuth();
  const { t } = useLanguage();

  const [isNewClientMode, setIsNewClientMode] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState(clients[0]?.id || '');
  
  // New Client Form Data
  const [newClient, setNewClient] = useState({
    full_name: '',
    national_id: '',
    primary_phone: '',
    address: '',
    branch_id: currentBranchId || branches[0]?.id || 'br-minya-el-qamh'
  });

  // Request Form Data
  const [reqData, setReqData] = useState({
    service_type_id: serviceTypes[0]?.id || '',
    branch_id: currentBranchId || branches[0]?.id || 'br-minya-el-qamh',
    assigned_employee_id: currentUser?.id || '',
    priority: 'normal' as const,
    govt_ref: '',
    office_ref: '',
    total_fee: serviceTypes[0]?.default_fee || 0,
    notes: ''
  });

  const [error, setError] = useState<string | null>(null);

  const handleServiceChange = (serviceId: string) => {
    const srv = serviceTypes.find(s => s.id === serviceId);
    setReqData(prev => ({
      ...prev,
      service_type_id: serviceId,
      total_fee: srv?.default_fee || prev.total_fee
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    let clientId = selectedClientId;

    if (isNewClientMode) {
      if (!newClient.full_name.trim()) return setError(t('يرجى إدخال اسم العميل', 'Please enter client name'));
      if (!newClient.primary_phone.trim()) return setError(t('يرجى إدخال رقم هاتف العميل', 'Please enter client phone'));
      if (!newClient.national_id.trim() || newClient.national_id.length !== 14) return setError(t('يرجى إدخال رقم قومي صحيح (14 رقم)', 'Valid 14-digit National ID required'));

      try {
        const saved = saveClient({
          full_name: newClient.full_name.trim(),
          national_id: newClient.national_id.trim(),
          primary_phone: newClient.primary_phone.trim(),
          address: newClient.address.trim(),
          branch_id: newClient.branch_id
        });
        clientId = saved.id;
      } catch (err: any) {
        return setError(err.message);
      }
    }

    if (!clientId) return setError(t('يرجى اختيار عميل مسجل بالمنظومة', 'Please select client'));
    if (!reqData.service_type_id) return setError(t('يرجى اختيار نوع الخدمة', 'Please select service type'));

    try {
      createRequest({
        client_id: clientId,
        service_type_id: reqData.service_type_id,
        branch_id: reqData.branch_id,
        assigned_employee_id: reqData.assigned_employee_id || undefined,
        priority: reqData.priority,
        govt_ref: reqData.govt_ref.trim() || undefined,
        office_ref: reqData.office_ref.trim() || undefined,
        total_fee: Number(reqData.total_fee) || 0,
        notes: reqData.notes.trim() || undefined,
        createdByUserId: currentUser?.id || 'usr-admin'
      });

      onClose();
    } catch (err: any) {
      setError(err.message || 'حدث خطأ أثناء إنشاء الطلب');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('تسجيل معاملة / طلب جديد بالنظام الداخلي', 'Register New Request')}
      subtitle={t('إصدار كود تتبع جديد وإسناد المعاملة للموظف المختص', 'Assign employee and generate tracking code')}
      maxWidth="2xl"
    >
      {error && (
        <div className="mb-4 p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs font-bold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Client Selection Switch */}
        <div className="p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-between gap-2 text-xs font-bold">
          <span className="text-slate-700 dark:text-slate-300">
            {t('صاحب المعاملة (العميل):', 'Client:')}
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsNewClientMode(false)}
              className={`px-3 py-1 rounded-xl transition ${!isNewClientMode ? 'bg-emerald-900 text-white font-extrabold shadow-sm' : 'text-slate-500'}`}
            >
              {t('عميل مسجل حالياً', 'Existing Client')}
            </button>
            <button
              type="button"
              onClick={() => setIsNewClientMode(true)}
              className={`px-3 py-1 rounded-xl transition ${isNewClientMode ? 'bg-emerald-900 text-white font-extrabold shadow-sm' : 'text-slate-500'}`}
            >
              {t('+ عميل جديد', '+ New Client')}
            </button>
          </div>
        </div>

        {/* Existing vs New Client Input */}
        {!isNewClientMode ? (
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              {t('اختر العميل المسجل بالدليل', 'Select Registered Client')} *
            </label>
            <select
              value={selectedClientId}
              onChange={e => setSelectedClientId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-bold focus:outline-none"
            >
              {clients.map(c => (
                <option key={c.id} value={c.id}>
                  {c.full_name} ({c.primary_phone}) - {c.national_id}
                </option>
              ))}
            </select>
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-3">
            <h4 className="text-xs font-extrabold text-emerald-800 dark:text-emerald-300">
              {t('بيانات العميل الجديد السريعة:', 'Quick New Client Registration:')}
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                type="text"
                required
                placeholder={t('اسم العميل بالكامل', 'Client Full Name')}
                value={newClient.full_name}
                onChange={e => setNewClient({ ...newClient, full_name: e.target.value })}
                className="px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold"
              />
              <input
                type="tel"
                required
                placeholder={t('رقم الهاتف المحمول', 'Phone Number')}
                value={newClient.primary_phone}
                onChange={e => setNewClient({ ...newClient, primary_phone: e.target.value })}
                className="px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono font-bold"
              />
              <input
                type="text"
                required
                maxLength={14}
                placeholder={t('الرقم القومي (14 رقم)', 'National ID')}
                value={newClient.national_id}
                onChange={e => setNewClient({ ...newClient, national_id: e.target.value })}
                className="px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono font-bold"
              />
              <input
                type="text"
                required
                placeholder={t('العنوان التفصيلي', 'Address')}
                value={newClient.address}
                onChange={e => setNewClient({ ...newClient, address: e.target.value })}
                className="px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold"
              />
            </div>
          </div>
        )}

        {/* Service & Branch */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              {t('نوع الخدمة / الترخيص', 'Service Type')} *
            </label>
            <select
              value={reqData.service_type_id}
              onChange={e => handleServiceChange(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-bold focus:outline-none"
            >
              {serviceTypes.map(srv => (
                <option key={srv.id} value={srv.id}>
                  {srv.name_ar} ({srv.default_fee} ج.م)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              {t('الفرع التابع له الطلب', 'Branch')} *
            </label>
            <select
              value={reqData.branch_id}
              onChange={e => setReqData({ ...reqData, branch_id: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-bold focus:outline-none"
            >
              {allBranches.map(b => (
                <option key={b.id} value={b.id}>{b.name_ar}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Priority & Fee */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              {t('درجة الأولوية', 'Priority')}
            </label>
            <select
              value={reqData.priority}
              onChange={e => setReqData({ ...reqData, priority: e.target.value as any })}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-bold focus:outline-none"
            >
              <option value="low">{t('عادي', 'Low')}</option>
              <option value="normal">{t('متوسط', 'Normal')}</option>
              <option value="high">{t('مهم', 'High')}</option>
              <option value="urgent">{t('عاجل جداً', 'Urgent')}</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              {t('إجمالي الرسوم (ج.م)', 'Total Fee (EGP)')} *
            </label>
            <input
              type="number"
              required
              min={0}
              value={reqData.total_fee}
              onChange={e => setReqData({ ...reqData, total_fee: Number(e.target.value) })}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-mono font-bold focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              {t('إسناد للموظف', 'Assign Employee')}
            </label>
            <select
              value={reqData.assigned_employee_id}
              onChange={e => setReqData({ ...reqData, assigned_employee_id: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-bold focus:outline-none"
            >
              <option value="">{t('غير معين', 'Unassigned')}</option>
              {allProfiles.map(p => (
                <option key={p.id} value={p.id}>{p.full_name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* References & Notes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input
            type="text"
            placeholder={t('رقم السجل الداخلي (اختياري)', 'Office Ref #')}
            value={reqData.office_ref}
            onChange={e => setReqData({ ...reqData, office_ref: e.target.value })}
            className="px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold"
          />
          <input
            type="text"
            placeholder={t('رقم الجهة الحكومية (اختياري)', 'Govt Ref #')}
            value={reqData.govt_ref}
            onChange={e => setReqData({ ...reqData, govt_ref: e.target.value })}
            className="px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
            {t('ملاحظات الموظف الأولية', 'Initial Notes')}
          </label>
          <textarea
            rows={2}
            placeholder={t('أدخل أي ملاحظات أولية...', 'Initial notes...')}
            value={reqData.notes}
            onChange={e => setReqData({ ...reqData, notes: e.target.value })}
            className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-bold focus:outline-none"
          />
        </div>

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
            className="px-6 py-2 rounded-xl bg-emerald-900 hover:bg-emerald-800 text-white font-extrabold text-xs shadow-md"
          >
            {t('إنشاء وإصدار رقم التتبع', 'Create Request')}
          </button>
        </div>
      </form>
    </Modal>
  );
};
