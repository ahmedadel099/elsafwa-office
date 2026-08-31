import React from 'react';
import { Award, PhoneCall, MapPin, CheckCircle, Printer, X } from 'lucide-react';
import { RequestRecord, PaymentRecord } from '../../../types';
import { formatCurrency, formatDateArabic, PAYMENT_METHOD_LABELS } from '../../../utils/formatters';

interface PrintableReceiptProps {
  request: RequestRecord;
  payment: PaymentRecord;
  onClose: () => void;
}

export const PrintableReceipt: React.FC<PrintableReceiptProps> = ({ request, payment, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-2xl bg-white text-slate-900 rounded-3xl shadow-2xl overflow-hidden border border-slate-300 relative">
        {/* Modal Controls (No Print) */}
        <div className="p-4 bg-slate-100 border-b border-slate-200 flex items-center justify-between no-print">
          <span className="text-xs font-extrabold text-slate-700">
            معاينة وطباعة إيصال استلام النقدية والرسوم الرسمية
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-900 text-white font-bold text-xs hover:bg-emerald-800 transition shadow-sm"
            >
              <Printer className="w-4 h-4 text-gold-400" />
              <span>طباعة الإيصال الآن</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-200 text-slate-700 hover:bg-slate-300 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Official Receipt Body */}
        <div className="p-8 space-y-6 printable-area bg-white text-slate-950 font-tajawal">
          {/* Header Branding */}
          <div className="border-b-2 border-slate-900 pb-4 flex items-center justify-between gap-4">
            <div>
              <div className="inline-block bg-slate-900 text-gold-400 font-extrabold text-[11px] px-2.5 py-0.5 rounded mb-1">
                ترخيص رقم ٦٧٩ ( مجموعة ب )
              </div>
              <h2 className="text-xl font-black tracking-tight text-slate-950">
                شركة الصفوة للخدمات الحكومية والإلكترونية
              </h2>
              <p className="text-xs font-bold text-slate-700 mt-0.5">
                خدمات التراخيص والمرافق والتأسيس والتصالح - محافظة الشرقية
              </p>
            </div>

            <div className="text-end text-xs font-mono font-bold space-y-1">
              <div className="text-emerald-900 font-black text-sm">{payment.receipt_no}</div>
              <div>التاريخ: {formatDateArabic(payment.payment_date)}</div>
              <div>رقم التتبع: <span className="font-black text-emerald-900">{request.tracking_ref}</span></div>
            </div>
          </div>

          <div className="text-center bg-slate-100 py-2 rounded-xl border border-slate-300 font-black text-base text-slate-900">
            إيصال استلام نقدية رسمـي (سند قبض)
          </div>

          {/* Client & Transaction Details */}
          <div className="grid grid-cols-2 gap-4 text-xs font-medium bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <div>
              <span className="text-slate-500 block mb-0.5 font-bold">المستلم منه (اسم العميل):</span>
              <div className="font-black text-sm text-slate-950">{request.client_name}</div>
            </div>

            <div>
              <span className="text-slate-500 block mb-0.5 font-bold">الرقم القومي:</span>
              <div className="font-mono font-bold text-slate-900">{request.client_national_id}</div>
            </div>

            <div>
              <span className="text-slate-500 block mb-0.5 font-bold">نوع الخدمة / المعاملة:</span>
              <div className="font-bold text-slate-950">{request.service_name_ar}</div>
            </div>

            <div>
              <span className="text-slate-500 block mb-0.5 font-bold">طريقة السداد:</span>
              <div className="font-bold text-emerald-900">{PAYMENT_METHOD_LABELS[payment.payment_method]}</div>
            </div>
          </div>

          {/* Amount Breakdown Table */}
          <div className="border border-slate-300 rounded-2xl overflow-hidden text-xs">
            <table className="w-full text-start border-collapse">
              <thead className="bg-slate-900 text-white font-bold">
                <tr>
                  <th className="p-3 text-start">البيان والتفاصيل</th>
                  <th className="p-3 text-end">المبلغ المحصل (ج.م)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                <tr>
                  <td className="p-3 font-bold">
                    دفعة مسددة لحساب معاملة ({request.service_name_ar}) - {payment.notes || 'سداد أتعاب ورسوم إلكترونية'}
                  </td>
                  <td className="p-3 text-end font-mono font-black text-sm text-emerald-900">
                    {formatCurrency(payment.amount)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Financial Summary Calculation */}
          <div className="bg-slate-100 p-4 rounded-2xl border border-slate-300 grid grid-cols-3 gap-2 text-center text-xs">
            <div>
              <span className="text-slate-500 block mb-0.5 font-bold">إجمالي أتعاب المعاملة:</span>
              <div className="font-mono font-extrabold text-slate-950">{formatCurrency(request.total_fee)}</div>
            </div>

            <div>
              <span className="text-slate-500 block mb-0.5 font-bold">إجمالي المسدد حتى تاريخه:</span>
              <div className="font-mono font-black text-emerald-900 text-sm">{formatCurrency(request.paid_amount || payment.amount)}</div>
            </div>

            <div>
              <span className="text-slate-500 block mb-0.5 font-bold">المتبقي غير المسدد:</span>
              <div className="font-mono font-extrabold text-rose-700">{formatCurrency(request.balance_due || 0)}</div>
            </div>
          </div>

          {/* Signatures & Verification Block */}
          <div className="pt-6 border-t border-slate-300 flex items-center justify-between gap-4 text-xs font-bold">
            <div className="text-center space-y-8">
              <div>المستلم / امين الخزينة</div>
              <div className="text-slate-400 font-normal">({payment.received_by_name || 'خزينة الصفوة'})</div>
            </div>

            {/* Simulated Stamp */}
            <div className="w-24 h-24 rounded-full border-4 border-dashed border-emerald-900 text-emerald-900 flex flex-col items-center justify-center text-[10px] font-black text-center rotate-[-12deg] p-1 shadow-sm">
              <span>شركة الصفوة</span>
              <span>خزينة الخصم والتحصيل</span>
              <span>معتمد 679 (ب)</span>
            </div>

            <div className="text-center space-y-8">
              <div>توقيع وتفويض العميل</div>
              <div className="text-slate-400 font-normal">........................</div>
            </div>
          </div>

          {/* Footer Contact Info */}
          <div className="text-[10px] text-slate-500 text-center pt-4 border-t border-slate-200 space-y-0.5">
            <div>شركة الصفوة للخدمات الحكومية - المقر الرئيسي: منيا القمح / العزيزية - الشرقية</div>
            <div className="font-mono">هاتف الخزينة والاستعلامات: 01115345157 / 01020384273 / 01210285290</div>
          </div>
        </div>
      </div>
    </div>
  );
};
