import React from 'react';
import { 
  User, 
  Phone, 
  CreditCard, 
  MapPin, 
  Building, 
  FileText, 
  X, 
  Calendar,
  CheckCircle2
} from 'lucide-react';
import { useData } from '../../../context/DataContext';
import { useAuth } from '../../../context/AuthContext';
import { useLanguage } from '../../../context/LanguageContext';
import { Client } from '../../../types';
import { formatCurrency, formatDateArabic, STATUS_META } from '../../../utils/formatters';

interface ClientDetailDrawerProps {
  client: Client;
  onClose: () => void;
}

export const ClientDetailDrawer: React.FC<ClientDetailDrawerProps> = ({ client, onClose }) => {
  const { requests, branches } = useData();
  const { allBranches } = useAuth();
  const { t } = useLanguage();

  const clientRequests = requests.filter(r => r.client_id === client.id);
  const branchObj = allBranches.find(b => b.id === client.branch_id);

  const totalFees = clientRequests.reduce((sum, r) => sum + (r.total_fee || 0), 0);
  const totalPaid = clientRequests.reduce((sum, r) => sum + (r.paid_amount || 0), 0);
  const totalDue = Math.max(0, totalFees - totalPaid);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end bg-slate-950/60 backdrop-blur-sm animate-fade-in no-print">
      <div 
        className="w-full max-w-2xl bg-white dark:bg-slate-900 h-full shadow-2xl border-s border-slate-200 dark:border-slate-800 flex flex-col justify-between overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="p-6 bg-emerald-900 text-white flex items-center justify-between border-b border-emerald-950">
          <div>
            <span className="text-[11px] font-extrabold text-gold-400 block mb-1 uppercase tracking-wider">
              {t('ملف العميل والتعاملات السابقة', 'Client Profile Drawer')}
            </span>
            <h3 className="text-xl font-black text-white">
              {client.full_name}
            </h3>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-emerald-950/60 text-emerald-200 hover:text-white hover:bg-emerald-950 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Body Scrollable */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Info Card Grid */}
          <div className="bg-slate-50 dark:bg-slate-950/60 p-5 rounded-2xl border border-slate-200/60 dark:border-slate-800/60 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-medium">
            <div>
              <span className="text-slate-400 font-bold block mb-1">{t('رقم الهاتف الأساسي:', 'Primary Phone:')}</span>
              <div className="font-mono font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-emerald-600" />
                {client.primary_phone}
              </div>
            </div>

            {client.secondary_phone && (
              <div>
                <span className="text-slate-400 font-bold block mb-1">{t('رقم هاتف ثانوي:', 'Secondary Phone:')}</span>
                <div className="font-mono text-slate-700 dark:text-slate-300">
                  {client.secondary_phone}
                </div>
              </div>
            )}

            <div>
              <span className="text-slate-400 font-bold block mb-1">{t('الرقم القومي:', 'National ID:')}</span>
              <div className="font-mono text-slate-900 dark:text-white flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5 text-emerald-600" />
                {client.national_id}
              </div>
            </div>

            <div>
              <span className="text-slate-400 font-bold block mb-1">{t('الفرع المباشر:', 'Branch:')}</span>
              <div className="text-slate-900 dark:text-white flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-emerald-600" />
                {branchObj?.name_ar || 'الصفوة'}
              </div>
            </div>

            <div className="sm:col-span-2">
              <span className="text-slate-400 font-bold block mb-1">{t('العنوان التفصيلي:', 'Address:')}</span>
              <div className="text-slate-900 dark:text-white flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                {client.address}
              </div>
            </div>

            {client.notes && (
              <div className="sm:col-span-2 pt-2 border-t border-slate-200/60 dark:border-slate-800/60">
                <span className="text-slate-400 font-bold block mb-1">{t('ملاحظات خاصة:', 'Notes:')}</span>
                <p className="text-slate-600 dark:text-slate-300 font-medium">{client.notes}</p>
              </div>
            )}
          </div>

          {/* Financial Summary */}
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60">
              <span className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300 block mb-1">{t('إجمالي المعاملات', 'Total Fees')}</span>
              <div className="text-base font-extrabold text-emerald-950 dark:text-emerald-300 font-mono">
                {formatCurrency(totalFees)}
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/60">
              <span className="text-[11px] font-bold text-blue-800 dark:text-blue-300 block mb-1">{t('المسدد فعلياً', 'Total Paid')}</span>
              <div className="text-base font-extrabold text-blue-950 dark:text-blue-300 font-mono">
                {formatCurrency(totalPaid)}
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60">
              <span className="text-[11px] font-bold text-rose-800 dark:text-rose-300 block mb-1">{t('المتبقي غير المسدد', 'Balance Due')}</span>
              <div className="text-base font-extrabold text-rose-950 dark:text-rose-300 font-mono">
                {formatCurrency(totalDue)}
              </div>
            </div>
          </div>

          {/* Client Request History List */}
          <div>
            <h4 className="text-sm font-extrabold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-600" />
              {t('سجل الطلبات والمعاملات المسجلة للعميل', 'Request History')} ({clientRequests.length})
            </h4>

            <div className="space-y-3">
              {clientRequests.length === 0 ? (
                <div className="p-6 text-center text-slate-400 text-xs font-bold bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800">
                  {t('لم يتم تسجيل أي طلبات سابقة لهذا العميل بعد', 'No requests logged for this client')}
                </div>
              ) : (
                clientRequests.map(req => (
                  <div key={req.id} className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono font-extrabold text-xs text-emerald-700 dark:text-emerald-400">
                        {req.tracking_ref}
                      </span>
                      <span className={`px-2.5 py-0.5 rounded-xl font-bold text-[10px] ${STATUS_META[req.status]?.badgeClass}`}>
                        {STATUS_META[req.status]?.label_ar}
                      </span>
                    </div>

                    <div className="text-xs font-bold text-slate-900 dark:text-white">
                      {req.service_name_ar}
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono pt-2 border-t border-slate-100 dark:border-slate-800">
                      <span>تاريخ الاستلام: {formatDateArabic(req.received_date)}</span>
                      <span>الرسوم: {formatCurrency(req.total_fee)}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Drawer Footer Close Action */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 text-white font-bold text-xs hover:bg-slate-700 transition"
          >
            {t('إغلاق', 'Close Drawer')}
          </button>
        </div>
      </div>
    </div>
  );
};
