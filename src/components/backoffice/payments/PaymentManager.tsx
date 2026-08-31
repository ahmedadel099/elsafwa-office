import React, { useState } from 'react';
import { 
  CreditCard, 
  PlusCircle, 
  Printer, 
  DollarSign, 
  AlertCircle, 
  CheckCircle2,
  Calendar,
  UserCheck
} from 'lucide-react';
import { useData } from '../../../context/DataContext';
import { useAuth } from '../../../context/AuthContext';
import { useLanguage } from '../../../context/LanguageContext';
import { RequestRecord, PaymentRecord, PaymentMethod } from '../../../types';
import { formatCurrency, formatDateArabic, PAYMENT_METHOD_LABELS } from '../../../utils/formatters';
import { PrintableReceipt } from './PrintableReceipt';

interface PaymentManagerProps {
  request?: RequestRecord;
}

export const PaymentManager: React.FC<PaymentManagerProps> = ({ request: reqProp }) => {
  const { requests, getRequestPayments, addPayment } = useData();
  const { currentUser } = useAuth();
  const { t } = useLanguage();

  const [selectedRequestId, setSelectedRequestId] = useState<string>(reqProp?.id || requests[0]?.id || '');
  const activeRequest = reqProp || requests.find(r => r.id === selectedRequestId);

  const payments = activeRequest ? getRequestPayments(activeRequest.id) : [];

  const totalFee = activeRequest?.total_fee || 0;
  const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
  const balanceDue = Math.max(0, totalFee - totalPaid);

  const [amount, setAmount] = useState<number | ''>('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [activeReceiptPayment, setActiveReceiptPayment] = useState<PaymentRecord | null>(null);

  const handleAddPayment = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!activeRequest) return setError(t('يرجى اختيار المعاملة المطلوب السداد لها', 'Select request'));
    const numAmount = Number(amount);
    if (!numAmount || numAmount <= 0) return setError(t('يرجى إدخال مبلغ صحيح لسند القبض', 'Enter valid payment amount'));

    try {
      const newPay = addPayment({
        request_id: activeRequest.id,
        amount: numAmount,
        payment_method: paymentMethod,
        received_by: currentUser?.id || 'usr-admin',
        notes: notes.trim() || undefined
      });

      setAmount('');
      setNotes('');
      setActiveReceiptPayment(newPay);
    } catch (err: any) {
      setError(err.message || 'حدث خطأ أثناء حفظ التحصيل');
    }
  };

  if (!activeRequest) {
    return (
      <div className="p-8 text-center text-slate-400 font-bold bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
        {t('لا يوجد معاملات مسجلة لإدارة الخزينة', 'No requests available for payment handling')}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Request Selection (If rendered globally) */}
      {!reqProp && (
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between gap-4">
          <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
            {t('اختر المعاملة للتحصيل والاطلاع على الخزينة:', 'Select Request for Payments:')}
          </span>
          <select
            value={selectedRequestId}
            onChange={e => setSelectedRequestId(e.target.value)}
            className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-extrabold focus:outline-none"
          >
            {requests.map(r => (
              <option key={r.id} value={r.id}>
                {r.tracking_ref} - {r.client_name} ({r.service_name_ar})
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Balance Summary Header Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
        <div className="p-4 rounded-3xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
          <span className="text-xs font-bold text-slate-400 block mb-1">{t('إجمالي الرسوم المحددة للمعاملة', 'Total Request Fee')}</span>
          <div className="text-xl font-black text-slate-900 dark:text-white font-mono">
            {formatCurrency(totalFee)}
          </div>
        </div>

        <div className="p-4 rounded-3xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60">
          <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 block mb-1">{t('إجمالي المقبوض والمسدد فعلياً', 'Total Paid')}</span>
          <div className="text-xl font-black text-emerald-950 dark:text-emerald-300 font-mono">
            {formatCurrency(totalPaid)}
          </div>
        </div>

        <div className="p-4 rounded-3xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60">
          <span className="text-xs font-bold text-rose-800 dark:text-rose-300 block mb-1">{t('المتبقي غير المسدد (الرصيد)', 'Balance Due')}</span>
          <div className="text-xl font-black text-rose-950 dark:text-rose-300 font-mono">
            {formatCurrency(balanceDue)}
          </div>
        </div>
      </div>

      {/* Record New Payment Form */}
      <form onSubmit={handleAddPayment} className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <h4 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
          <PlusCircle className="w-4 h-4 text-emerald-600" />
          {t('تسجيل دفعة / سند قبض جديد للطلب', 'Record New Payment Installment')}
        </h4>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs font-bold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              {t('المبلغ المحصل (جنيه مصري)', 'Amount (EGP)')} *
            </label>
            <input
              type="number"
              required
              min={1}
              placeholder="e.g. 1500"
              value={amount}
              onChange={e => setAmount(Number(e.target.value) || '')}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-mono font-bold focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              {t('وسيلة الدفع / السداد', 'Payment Method')} *
            </label>
            <select
              value={paymentMethod}
              onChange={e => setPaymentMethod(e.target.value as PaymentMethod)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-bold focus:outline-none"
            >
              <option value="cash">نقداً بالخزينة (Cash)</option>
              <option value="vodafone_cash">فودافون كاش / محفظة (Vodafone Cash)</option>
              <option value="bank_transfer">تحويل بنكي (Bank Transfer)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              {t('ملاحظات وسند السداد', 'Notes / Reference')}
            </label>
            <input
              type="text"
              placeholder={t('مثال: دفعة ثانية تحت الحساب', 'Payment notes')}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-bold focus:outline-none"
            />
          </div>
        </div>

        <div className="flex items-center justify-end">
          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-900 hover:bg-emerald-800 text-white font-extrabold text-xs shadow-md transition"
          >
            <CreditCard className="w-4 h-4 text-gold-400" />
            <span>{t('تأكيد التحصيل وإصدار الإيصال', 'Record & Generate Receipt')}</span>
          </button>
        </div>
      </form>

      {/* Payment Receipts History Table */}
      <div className="space-y-3">
        <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">
          {t('سجل إيصالات المقبوضات والدفعات السابقة', 'Payment Receipts Log')} ({payments.length})
        </h4>

        {payments.length === 0 ? (
          <div className="p-6 text-center text-slate-400 text-xs font-bold bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800">
            {t('لم يتم تسجيل أي دفعات مالية لهذا الطلب بعد', 'No payment receipts logged')}
          </div>
        ) : (
          payments.map(pay => (
            <div key={pay.id} className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-wrap items-center justify-between gap-3 text-xs">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-extrabold text-xs text-emerald-700 dark:text-emerald-400">
                    {pay.receipt_no}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold">
                    {PAYMENT_METHOD_LABELS[pay.payment_method]}
                  </span>
                </div>
                <div className="text-slate-500 dark:text-slate-400 mt-1">
                  تاريخ التحصيل: {formatDateArabic(pay.payment_date)} • المستلم: {pay.received_by_name}
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-end font-mono font-black text-base text-slate-900 dark:text-white">
                  {formatCurrency(pay.amount)}
                </div>

                <button
                  onClick={() => setActiveReceiptPayment(pay)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-extrabold hover:bg-emerald-100 transition border border-emerald-200 dark:border-emerald-800/60"
                >
                  <Printer className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{t('طباعة الإيصال', 'Print Receipt')}</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Printable Receipt Dialog */}
      {activeReceiptPayment && activeRequest && (
        <PrintableReceipt
          request={activeRequest}
          payment={activeReceiptPayment}
          onClose={() => setActiveReceiptPayment(null)}
        />
      )}
    </div>
  );
};
