import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { 
  Send, 
  CheckCircle, 
  Copy, 
  Printer, 
  AlertCircle, 
  FileText, 
  User, 
  Phone, 
  CreditCard, 
  Building, 
  MapPin,
  Sparkles,
  ArrowRight,
  ArrowLeft
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useLanguage } from '../../context/LanguageContext';

interface PublicSubmissionFormProps {
  initialServiceTypeId?: string;
  onSuccessNavigateToTracker: (trackingRef: string, phone: string) => void;
  onCancel: () => void;
}

export const PublicSubmissionForm: React.FC<PublicSubmissionFormProps> = ({
  initialServiceTypeId,
  onSuccessNavigateToTracker,
  onCancel
}) => {
  const { branches, serviceTypes, submitPublicRequest } = useData();
  const { t, dir } = useLanguage();

  const [formData, setFormData] = useState({
    client_name: '',
    phone: '',
    national_id: '',
    address: '',
    service_type_id: initialServiceTypeId || (serviceTypes[0]?.id || ''),
    branch_id: branches[0]?.id || '',
    notes: '',
    file_name: ''
  });

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdRef, setCreatedRef] = useState<{ tracking_ref: string; phone: string } | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (initialServiceTypeId) {
      setFormData(prev => ({ ...prev, service_type_id: initialServiceTypeId }));
    }
  }, [initialServiceTypeId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!formData.client_name.trim()) return setError(t('يرجى إدخال الاسم بالكامل', 'Please enter your full name'));
    if (!formData.phone.trim() || formData.phone.length < 10) return setError(t('يرجى إدخال رقم هاتف صحيح (10 أرقام على الأقل)', 'Please enter a valid phone number'));
    if (!formData.national_id.trim() || formData.national_id.length !== 14) return setError(t('يرجى إدخال الرقم القومي المكون من 14 رقم', 'Please enter valid 14-digit National ID'));
    if (!formData.address.trim()) return setError(t('يرجى إدخال العنوان التفصيلي', 'Please enter full address'));
    if (!formData.service_type_id) return setError(t('يرجى اختيار نوع الخدمة المطلوبة', 'Please select service type'));
    if (!formData.branch_id) return setError(t('يرجى اختيار الفرع الأقرب لك', 'Please select office branch'));

    setIsSubmitting(true);

    try {
      const res = submitPublicRequest({
        client_name: formData.client_name.trim(),
        phone: formData.phone.trim(),
        national_id: formData.national_id.trim(),
        address: formData.address.trim(),
        service_type_id: formData.service_type_id,
        branch_id: formData.branch_id,
        notes: formData.notes.trim()
      });

      setCreatedRef({ tracking_ref: res.tracking_ref, phone: formData.phone.trim() });
      
      // Fire confetti celebration!
      confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
    } catch (err: any) {
      setError(err.message || 'حدث خطأ أثناء تقديم الطلب');
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyRefToClipboard = () => {
    if (!createdRef) return;
    navigator.clipboard.writeText(createdRef.tracking_ref);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const selectedService = serviceTypes.find(s => s.id === formData.service_type_id);

  if (createdRef) {
    return (
      <div className="max-w-2xl mx-auto bg-white dark:bg-slate-900 rounded-3xl p-8 border border-emerald-200 dark:border-emerald-800/80 shadow-2xl space-y-6 text-center animate-fade-in printable-area">
        <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 mx-auto flex items-center justify-center border-4 border-emerald-500/20">
          <CheckCircle className="w-10 h-10" />
        </div>

        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">
            {t('تم تسجيل طلبك بنجاح في منظومة شركة الصفوة!', 'Request Submitted Successfully!')}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {t('احفظ رقم التتبع التالي لمتابعة موقف طلبك في أي وقت عبر الموقع', 'Save your reference code to track status anytime')}
          </p>
        </div>

        {/* Copyable Reference Box */}
        <div className="bg-emerald-950 text-white p-6 rounded-2xl border-2 border-gold-400/40 relative shadow-inner">
          <span className="text-xs text-emerald-300 font-bold block mb-1">
            {t('رقم التتبع المرجعي الموحد (Tracking Reference)', 'Tracking Reference Code')}
          </span>
          <div className="text-3xl sm:text-4xl font-mono font-black text-gold-400 tracking-wider my-2 selection:bg-gold-400 selection:text-slate-950">
            {createdRef.tracking_ref}
          </div>
          <div className="text-xs text-emerald-200 mt-2 font-mono">
            {t('رقم الهاتف المسجل:', 'Registered Phone:')} {createdRef.phone}
          </div>

          <button
            onClick={copyRefToClipboard}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gold-400 text-slate-950 font-bold text-xs hover:bg-gold-300 transition shadow-sm"
          >
            <Copy className="w-4 h-4" />
            <span>{copied ? t('تم النسخ للحافظة!', 'Copied!') : t('نسخ رقم التتبع', 'Copy Code')}</span>
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-4 no-print">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 font-bold text-xs hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <Printer className="w-4 h-4" />
            <span>{t('طباعة إيصال تقديم الطلب', 'Print Receipt')}</span>
          </button>

          <button
            onClick={() => onSuccessNavigateToTracker(createdRef.tracking_ref, createdRef.phone)}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-900 text-white font-bold text-xs hover:bg-emerald-800 transition shadow-md"
          >
            <Sparkles className="w-4 h-4 text-gold-400" />
            <span>{t('الانتقال لصفحة تتبع الطلب الآن', 'Track Status Now')}</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xl">
      <div className="flex items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-gold-500"></span>
            {t('نموذج تقديم طلب خدمة جديد', 'Submit New Request Form')}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
            {t('يرجى ملء البيانات بدقة لإصدار كود تتبع رسمي لطلبك عبر مكاتب الصفوة', 'Please provide clean information to generate tracking reference code')}
          </p>
        </div>

        <button
          onClick={onCancel}
          className="text-xs font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
        >
          {t('إلغاء', 'Cancel')}
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs font-bold flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal Details Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-emerald-600" />
              {t('الاسم بالكامل (ثلاثي / رباعي)', 'Full Name')} *
            </label>
            <input
              type="text"
              required
              placeholder={t('أدخل اسمك كاملاً', 'e.g. احمد ابراهيم محمود')}
              value={formData.client_name}
              onChange={e => setFormData({ ...formData, client_name: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-bold focus:ring-2 focus:ring-emerald-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-emerald-600" />
              {t('رقم الهاتف المحمول (للتواصل والتتبع)', 'Mobile Phone Number')} *
            </label>
            <input
              type="tel"
              required
              placeholder="010XXXXXXXX / 011XXXXXXXX"
              value={formData.phone}
              onChange={e => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-mono font-bold focus:ring-2 focus:ring-emerald-600 focus:outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
              <CreditCard className="w-3.5 h-3.5 text-emerald-600" />
              {t('الرقم القومي (14 رقم)', 'National ID (14 digits)')} *
            </label>
            <input
              type="text"
              required
              maxLength={14}
              placeholder="2900101XXXXXXXX"
              value={formData.national_id}
              onChange={e => setFormData({ ...formData, national_id: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-mono font-bold focus:ring-2 focus:ring-emerald-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-emerald-600" />
              {t('العنوان ومحل الإقامة', 'Residential Address')} *
            </label>
            <input
              type="text"
              required
              placeholder={t('مثال: منيا القمح - شارع سعد زغلول', 'Address details')}
              value={formData.address}
              onChange={e => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-bold focus:ring-2 focus:ring-emerald-600 focus:outline-none"
            />
          </div>
        </div>

        {/* Service & Branch Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-emerald-600" />
              {t('نوع الخدمة / الترخيص المطلوب', 'Required Service Type')} *
            </label>
            <select
              value={formData.service_type_id}
              onChange={e => setFormData({ ...formData, service_type_id: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-bold focus:ring-2 focus:ring-emerald-600 focus:outline-none"
            >
              {serviceTypes.map(srv => (
                <option key={srv.id} value={srv.id}>
                  {srv.name_ar} ({srv.default_fee} ج.م)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
              <Building className="w-3.5 h-3.5 text-emerald-600" />
              {t('فرع مكتب الصفوة المفضل لتقديم الطلب', 'Preferred Office Branch')} *
            </label>
            <select
              value={formData.branch_id}
              onChange={e => setFormData({ ...formData, branch_id: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-bold focus:ring-2 focus:ring-emerald-600 focus:outline-none"
            >
              {branches.map(br => (
                <option key={br.id} value={br.id}>
                  {br.name_ar} ({br.city})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Selected Service Checklist Helper */}
        {selectedService && (
          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-xs">
            <span className="font-extrabold text-emerald-900 dark:text-emerald-300 block mb-2">
              {t('قائمة المستندات المطلوبة مسبقاً لهذه الخدمة:', 'Required Documents for Selected Service:')}
            </span>
            <div className="flex flex-wrap gap-2">
              {selectedService.required_documents.map((doc, i) => (
                <span key={i} className="bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 font-medium">
                  • {doc}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Notes & Optional File */}
        <div>
          <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-1">
            {t('ملاحظات إضافية / تفاصيل العقار أو المحل (اختياري)', 'Additional Notes / Property Details')}
          </label>
          <textarea
            rows={3}
            placeholder={t('أدخل أي ملاحظات إضافية تساعد فريق العمل...', 'Optional details...')}
            value={formData.notes}
            onChange={e => setFormData({ ...formData, notes: e.target.value })}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-bold focus:ring-2 focus:ring-emerald-600 focus:outline-none"
          />
        </div>

        {/* Action Submit */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={onCancel}
            className="px-5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 font-bold text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-100 transition"
          >
            {t('إلغاء', 'Cancel')}
          </button>

          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2 px-8 py-3 rounded-xl bg-emerald-900 hover:bg-emerald-800 text-white font-extrabold text-xs shadow-lg shadow-emerald-950/20 transition hover:scale-105 active:scale-95 disabled:opacity-50"
          >
            <Send className="w-4 h-4 text-gold-400" />
            <span>{isSubmitting ? t('جاري تسجيل الطلب...', 'Submitting...') : t('تأكيد وإرسال الطلب وحفظ الرقم المرجعي', 'Submit & Generate Reference')}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
