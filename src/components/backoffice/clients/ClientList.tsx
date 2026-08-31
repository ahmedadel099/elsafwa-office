import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  UserPlus, 
  Phone, 
  CreditCard, 
  MapPin, 
  Building, 
  FileText, 
  AlertTriangle,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useData } from '../../../context/DataContext';
import { useAuth } from '../../../context/AuthContext';
import { useLanguage } from '../../../context/LanguageContext';
import { Client } from '../../../types';
import { Modal } from '../../common/Modal';
import { ClientDetailDrawer } from './ClientDetailDrawer';

export const ClientList: React.FC = () => {
  const { clients, branches, saveClient, requests } = useData();
  const { currentBranchId, allBranches } = useAuth();
  const { t } = useLanguage();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBranchFilter, setSelectedBranchFilter] = useState<string>(currentBranchId || 'all');
  
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [newClientData, setNewClientData] = useState({
    full_name: '',
    national_id: '',
    primary_phone: '',
    secondary_phone: '',
    address: '',
    branch_id: currentBranchId || branches[0]?.id || 'br-minya-el-qamh',
    notes: ''
  });

  const filteredClients = clients.filter(client => {
    if (selectedBranchFilter !== 'all' && client.branch_id !== selectedBranchFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      return (
        client.full_name.toLowerCase().includes(q) ||
        client.primary_phone.includes(q) ||
        (client.secondary_phone && client.secondary_phone.includes(q)) ||
        client.national_id.includes(q) ||
        client.address.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleSaveClient = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!newClientData.full_name.trim()) return setFormError(t('يرجى إدخال اسم العميل كاملاً', 'Please enter client name'));
    if (!newClientData.national_id.trim() || newClientData.national_id.length !== 14) return setFormError(t('يرجى إدخال الرقم القومي الصحيح (14 رقم)', 'Please enter valid 14-digit National ID'));
    if (!newClientData.primary_phone.trim() || newClientData.primary_phone.length < 10) return setFormError(t('يرجى إدخال رقم هاتف صحيح', 'Please enter valid phone number'));

    try {
      saveClient({
        full_name: newClientData.full_name.trim(),
        national_id: newClientData.national_id.trim(),
        primary_phone: newClientData.primary_phone.trim(),
        secondary_phone: newClientData.secondary_phone.trim() || undefined,
        address: newClientData.address.trim(),
        branch_id: newClientData.branch_id,
        notes: newClientData.notes.trim() || undefined
      });

      setIsAddModalOpen(false);
      setNewClientData({
        full_name: '',
        national_id: '',
        primary_phone: '',
        secondary_phone: '',
        address: '',
        branch_id: currentBranchId || branches[0]?.id || 'br-minya-el-qamh',
        notes: ''
      });
    } catch (err: any) {
      setFormError(err.message || 'حدث خطأ أثناء حفظ بيانات العميل');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-600" />
            {t('دليل وسجل العملاء المتعاملين مع المكتب', 'Clients Directory')}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
            {t('عرض وإدارة ملفات العملاء وسجل المعاملات والتحصيل السابق', 'Manage client profiles and full historical request records')}
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-emerald-900 hover:bg-emerald-800 text-white font-extrabold text-xs shadow-md shadow-emerald-950/20 transition hover:scale-105 active:scale-95"
        >
          <UserPlus className="w-4 h-4 text-gold-400" />
          <span>{t('تسجيل عميل جديد', 'Register New Client')}</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute start-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={t('البحث بالاسم، رقم الهاتف، أو الرقم القومي...', 'Search by name, phone, or National ID...')}
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full ps-10 pe-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-bold focus:ring-2 focus:ring-emerald-600 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-400">{t('تصفية بالفرع:', 'Branch:')}</span>
          <select
            value={selectedBranchFilter}
            onChange={e => setSelectedBranchFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-bold focus:outline-none"
          >
            <option value="all">{t('كافة الفروع', 'All Branches')}</option>
            {allBranches.map(b => (
              <option key={b.id} value={b.id}>{b.name_ar}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Clients Table Directory */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-start text-xs">
            <thead className="bg-slate-100 dark:bg-slate-950 text-slate-500 dark:text-slate-400 font-extrabold uppercase border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-5 py-3.5 text-start">{t('الاسم بالكامل', 'Client Name')}</th>
                <th className="px-5 py-3.5 text-start">{t('رقم الهاتف المحمول', 'Phone Number')}</th>
                <th className="px-5 py-3.5 text-start">{t('الرقم القومي', 'National ID')}</th>
                <th className="px-5 py-3.5 text-start">{t('الفرع المسجل', 'Branch')}</th>
                <th className="px-5 py-3.5 text-center">{t('عدد الطلبات', 'Requests')}</th>
                <th className="px-5 py-3.5 text-end">{t('الإجراءات', 'Actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
              {filteredClients.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-slate-400 font-bold">
                    {t('لا يوجد عملاء مطابقين لمعايير البحث', 'No matching clients found')}
                  </td>
                </tr>
              ) : (
                filteredClients.map(client => {
                  const clientReqs = requests.filter(r => r.client_id === client.id);
                  const branchObj = allBranches.find(b => b.id === client.branch_id);

                  return (
                    <tr 
                      key={client.id}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition cursor-pointer"
                      onClick={() => setSelectedClient(client)}
                    >
                      <td className="px-5 py-3.5 font-extrabold text-slate-900 dark:text-white">
                        {client.full_name}
                      </td>
                      <td className="px-5 py-3.5 font-mono font-bold text-emerald-700 dark:text-emerald-400">
                        {client.primary_phone}
                      </td>
                      <td className="px-5 py-3.5 font-mono text-slate-600 dark:text-slate-400">
                        {client.national_id}
                      </td>
                      <td className="px-5 py-3.5 text-slate-600 dark:text-slate-300">
                        {branchObj?.name_ar || 'الصفوة'}
                      </td>
                      <td className="px-5 py-3.5 text-center font-bold">
                        <span className="inline-block px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                          {clientReqs.length}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-end">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedClient(client);
                          }}
                          className="px-3 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold hover:bg-emerald-100 transition"
                        >
                          {t('الملف الكامل', 'View Profile')}
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Client Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title={t('تسجيل عميل جديد بالمنظومة', 'Register New Client')}
        subtitle={t('تنبيه: سيتم التحقق تلقائياً لمنع تكرار أرقام الهواتف المسجلة', 'Phone number duplication check enabled')}
      >
        {formError && (
          <div className="mb-4 p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs font-bold flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        <form onSubmit={handleSaveClient} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              {t('الاسم بالكامل', 'Full Name')} *
            </label>
            <input
              type="text"
              required
              placeholder={t('أدخل اسم العميل ثلاثي أو رباعي', 'Full client name')}
              value={newClientData.full_name}
              onChange={e => setNewClientData({ ...newClientData, full_name: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-bold focus:ring-2 focus:ring-emerald-600 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {t('رقم الهاتف الأساسي', 'Primary Phone')} *
              </label>
              <input
                type="tel"
                required
                placeholder="010XXXXXXXX"
                value={newClientData.primary_phone}
                onChange={e => setNewClientData({ ...newClientData, primary_phone: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-mono font-bold focus:ring-2 focus:ring-emerald-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {t('رقم هاتف إضافي (اختياري)', 'Secondary Phone')}
              </label>
              <input
                type="tel"
                placeholder="011XXXXXXXX"
                value={newClientData.secondary_phone}
                onChange={e => setNewClientData({ ...newClientData, secondary_phone: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-mono font-bold focus:ring-2 focus:ring-emerald-600 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {t('الرقم القومي (14 رقم)', 'National ID')} *
              </label>
              <input
                type="text"
                required
                maxLength={14}
                placeholder="2900101XXXXXXXX"
                value={newClientData.national_id}
                onChange={e => setNewClientData({ ...newClientData, national_id: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-mono font-bold focus:ring-2 focus:ring-emerald-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {t('الفرع التابع له العميل', 'Client Branch')} *
              </label>
              <select
                value={newClientData.branch_id}
                onChange={e => setNewClientData({ ...newClientData, branch_id: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-bold focus:ring-2 focus:ring-emerald-600 focus:outline-none"
              >
                {allBranches.map(b => (
                  <option key={b.id} value={b.id}>{b.name_ar}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              {t('العنوان التفصيلي', 'Address')} *
            </label>
            <input
              type="text"
              required
              placeholder={t('العنوان بمركز منيا القمح أو الشرقية', 'Detailed address')}
              value={newClientData.address}
              onChange={e => setNewClientData({ ...newClientData, address: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-bold focus:ring-2 focus:ring-emerald-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              {t('ملاحظات خاصة بالعميل', 'Client Notes')}
            </label>
            <textarea
              rows={2}
              placeholder={t('أدخل أي تفاصيل إضافية...', 'Notes...')}
              value={newClientData.notes}
              onChange={e => setNewClientData({ ...newClientData, notes: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-bold focus:ring-2 focus:ring-emerald-600 focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 font-bold text-xs"
            >
              {t('إلغاء', 'Cancel')}
            </button>

            <button
              type="submit"
              className="px-6 py-2 rounded-xl bg-emerald-900 hover:bg-emerald-800 text-white font-extrabold text-xs shadow-md"
            >
              {t('حفظ بيانات العميل', 'Save Client')}
            </button>
          </div>
        </form>
      </Modal>

      {/* Client Detail Drawer */}
      {selectedClient && (
        <ClientDetailDrawer
          client={selectedClient}
          onClose={() => setSelectedClient(null)}
        />
      )}
    </div>
  );
};
