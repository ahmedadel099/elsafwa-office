import React, { useState, useEffect } from 'react';
import { 
  Search, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Building, 
  Calendar, 
  ShieldCheck, 
  FileText,
  ChevronLeft,
  ChevronRight,
  Info,
  ListTodo
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useLanguage } from '../../context/LanguageContext';
import { TrackingSearchResult, RequestStatus } from '../../types';
import { STATUS_META, formatDateArabic } from '../../utils/formatters';

interface PublicTrackerProps {
  initialRef?: string;
  initialPhone?: string;
}

export const PublicTracker: React.FC<PublicTrackerProps> = ({ initialRef = '', initialPhone = '' }) => {
  const { trackPublicRequest } = useData();
  const { t, dir } = useLanguage();

  const [trackingRef, setTrackingRef] = useState(initialRef);
  const [phone, setPhone] = useState(initialPhone);
  const [result, setResult] = useState<TrackingSearchResult | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialRef && initialPhone) {
      handleSearch(initialRef, initialPhone);
    }
  }, [initialRef, initialPhone]);

  const handleSearch = (refStr: string, phoneStr: string) => {
    setError(null);
    if (!refStr.trim()) return setError(t('يرجى إدخال رقم التتبع المرجعي', 'Please enter tracking reference'));
    if (!phoneStr.trim()) return setError(t('يرجى إدخال رقم الهاتف المسجل عند تقديم الطلب', 'Please enter registered phone number'));

    const res = trackPublicRequest(refStr, phoneStr);
    setResult(res);
    setHasSearched(true);

    if (!res) {
      setError(t('لم يتم العثور على طلب بهاتين البيانات، يرجى التأكد من رقم التتبع ورقم الهاتف المقترن به.', 'No matching request found for this reference and phone combination.'));
    }
  };

  const workflowSteps: Array<{ key: RequestStatus; label: string }> = [
    { key: 'new', label: 'تلقي الطلب' },
    { key: 'under_review', label: 'المراجعة والاستيفاء' },
    { key: 'submitted_authority', label: 'التقديم للجهة المختصة' },
    { key: 'under_inspection', label: 'المعاينة والفحص' },
    { key: 'approved', label: 'صدور الموافقة' },
    { key: 'completed', label: 'تسليم الترخيص' }
  ];

  const getCurrentStepIndex = (status: RequestStatus) => {
    if (status === 'completed') return 5;
    if (status === 'approved') return 4;
    if (status === 'under_inspection') return 3;
    if (status === 'submitted_authority') return 2;
    if (status === 'under_review' || status === 'docs_missing') return 1;
    return 0;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Search Header Form */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xl text-center">
        <div className="w-14 h-14 rounded-2xl bg-emerald-900 text-gold-400 mx-auto flex items-center justify-center mb-4 shadow-md">
          <Search className="w-7 h-7" />
        </div>
        <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          {t('استعلام وتتبع حالة الطلب والمعاملة', 'Public Request Tracking Portal')}
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xl mx-auto">
          {t('أدخل رقم التتبع الخاص بك (مثال: SFW-2026-00101) ورقم الهاتف المسجل بالطلب للتحقق من الموقف تنفيذه لحظة بلحظة', 'Enter reference number and registered phone to view live status timeline')}
        </p>

        <form 
          onSubmit={(e) => {
            e.preventDefault();
            handleSearch(trackingRef, phone);
          }}
          className="mt-6 max-w-2xl mx-auto grid grid-cols-1 sm:grid-cols-5 gap-3"
        >
          <div className="sm:col-span-2">
            <input
              type="text"
              required
              placeholder="SFW-2026-00101"
              value={trackingRef}
              onChange={e => setTrackingRef(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-mono font-extrabold text-center uppercase focus:ring-2 focus:ring-emerald-600 focus:outline-none"
            />
          </div>

          <div className="sm:col-span-2">
            <input
              type="tel"
              required
              placeholder={t('رقم الهاتف المسجل', 'Registered Phone')}
              value={phone}
              onChange={e => setPhone(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-mono font-bold text-center focus:ring-2 focus:ring-emerald-600 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            className="sm:col-span-1 py-3 px-4 rounded-xl bg-emerald-900 hover:bg-emerald-800 text-white font-extrabold text-xs shadow-md transition hover:scale-105 active:scale-95 flex items-center justify-center gap-1.5"
          >
            <Search className="w-4 h-4 text-gold-400" />
            <span>{t('بحث', 'Search')}</span>
          </button>
        </form>

        {error && (
          <div className="mt-4 p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs font-bold flex items-center justify-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Results View */}
      {result && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-emerald-200 dark:border-emerald-800/80 shadow-2xl space-y-8 animate-fade-in">
          {/* Request Header Summary */}
          <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
            <div>
              <span className="text-[11px] font-bold text-slate-400 block mb-1">
                {t('الخدمة المطلوبة:', 'Requested Service:')}
              </span>
              <h3 className="text-xl font-black text-slate-900 dark:text-white">
                {result.service_name_ar}
              </h3>
              <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-2 font-medium">
                <span className="flex items-center gap-1">
                  <Building className="w-3.5 h-3.5 text-emerald-600" />
                  {result.branch_name_ar}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1 font-mono">
                  <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                  {t('تاريخ التقديم:', 'Submitted:')} {formatDateArabic(result.received_date)}
                </span>
              </div>
            </div>

            <div className="text-center sm:text-end">
              <span className={`inline-block px-4 py-2 rounded-2xl text-xs font-extrabold ${STATUS_META[result.status]?.badgeClass}`}>
                {STATUS_META[result.status]?.label_ar}
              </span>
              {result.target_date && (
                <div className="text-[11px] text-slate-400 mt-2 font-mono">
                  {t('الموعد المستهدف للموافقة:', 'Target Date:')} {formatDateArabic(result.target_date)}
                </div>
              )}
            </div>
          </div>

          {/* Visual Progress Bar Stepper */}
          <div>
            <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-6">
              {t('مسار وتدرج مراحل تنفيذ المعاملة', 'Workflow Progress Stepper')}
            </h4>

            <div className="relative flex items-center justify-between max-w-3xl mx-auto px-4">
              <div className="absolute top-1/2 start-8 end-8 h-1 bg-slate-200 dark:bg-slate-800 -translate-y-1/2 -z-0"></div>
              <div 
                className="absolute top-1/2 start-8 h-1 bg-emerald-600 -translate-y-1/2 transition-all duration-500 -z-0"
                style={{
                  width: `${(getCurrentStepIndex(result.status) / (workflowSteps.length - 1)) * 100}%`
                }}
              ></div>

              {workflowSteps.map((step, idx) => {
                const currentIdx = getCurrentStepIndex(result.status);
                const isPassed = idx <= currentIdx;
                const isCurrent = idx === currentIdx;

                return (
                  <div key={step.key} className="relative z-10 flex flex-col items-center">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                      isCurrent 
                        ? 'bg-gold-400 text-slate-950 ring-4 ring-gold-400/30 font-extrabold scale-110' 
                        : isPassed 
                        ? 'bg-emerald-800 text-white' 
                        : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                    }`}>
                      {isPassed ? <CheckCircle2 className="w-5 h-5" /> : idx + 1}
                    </div>
                    <span className={`text-[11px] font-bold mt-2 text-center max-w-[80px] hidden sm:block ${
                      isCurrent ? 'text-emerald-800 dark:text-emerald-300 font-extrabold' : 'text-slate-500'
                    }`}>
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Detailed Request Steps Checklist & Document Readiness */}
          {result.steps && result.steps.length > 0 && (
            <div className="pt-6 border-t border-slate-100 dark:border-slate-800 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h4 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <ListTodo className="w-4 h-4 text-emerald-600" />
                  <span>{t('الموقف التنفيذي التفصيلي للخطوات والمستندات', 'Step-by-Step Execution & Document Checklist')}</span>
                </h4>
                <span className="text-xs font-mono font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-800/60">
                  {result.steps.filter(s => s.status === 'completed').length} / {result.steps.length} {t('خطوات منجزة', 'steps done')}
                </span>
              </div>

              <div className="space-y-3">
                {result.steps.map((st, sIdx) => {
                  const isDone = st.status === 'completed';
                  const isInProgress = st.status === 'in_progress';
                  const isBlocked = st.status === 'blocked';

                  return (
                    <div 
                      key={st.id || sIdx}
                      className={`p-4 rounded-2xl border transition ${
                        isDone 
                          ? 'bg-emerald-50/50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/60'
                          : isInProgress
                          ? 'bg-amber-50/50 dark:bg-amber-950/30 border-amber-300 dark:border-amber-700/80 shadow-sm'
                          : isBlocked
                          ? 'bg-rose-50/50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800/60'
                          : 'bg-slate-50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800'
                      }`}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <span className={`w-6 h-6 rounded-lg font-mono font-bold text-xs flex items-center justify-center shrink-0 ${
                            isDone 
                              ? 'bg-emerald-600 text-white' 
                              : isInProgress 
                              ? 'bg-amber-500 text-white animate-pulse' 
                              : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                          }`}>
                            {isDone ? '✓' : (sIdx + 1)}
                          </span>

                          <div>
                            <span className={`font-bold text-xs ${isDone ? 'line-through text-slate-500' : 'text-slate-900 dark:text-white'}`}>
                              {st.title}
                            </span>
                            {st.description && (
                              <p className="text-[11px] text-slate-500 mt-0.5">{st.description}</p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className={`px-2.5 py-0.5 rounded-lg text-[10px] font-black ${
                            isDone 
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' 
                              : isInProgress 
                              ? 'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200' 
                              : isBlocked
                              ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                              : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                          }`}>
                            {isDone ? '✓ تم الإنجاز' : isInProgress ? '⚡ جاري العمل' : isBlocked ? '⚠️ موقوف مؤقتاً' : '⏳ معلق'}
                          </span>

                          {st.target_date && (
                            <span className="text-[10px] font-mono text-slate-400">
                              {formatDateArabic(st.target_date)}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Required Documents in step */}
                      {st.required_documents && st.required_documents.length > 0 && (
                        <div className="mt-2.5 pt-2 border-t border-slate-200/50 dark:border-slate-800/50 flex flex-wrap items-center gap-1.5 text-[10px]">
                          <span className="text-slate-400 font-bold">المستندات المطلوبة:</span>
                          {st.required_documents.map((rd, rIdx) => (
                            <span key={rIdx} className="px-2 py-0.5 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold">
                              📄 {rd}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Public Status Timeline Logs */}
          <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
            <h4 className="text-sm font-extrabold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-600" />
              {t('السجل الزمني للتحديثات والملاحظات العامة', 'Status Update Timeline')}
            </h4>

            <div className="space-y-4">
              {result.status_history.map((item, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/60 dark:border-slate-800/60 flex items-start gap-4">
                  <div className="w-3 h-3 rounded-full bg-emerald-600 mt-1.5 shrink-0"></div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-extrabold text-xs text-slate-900 dark:text-white">
                        {STATUS_META[item.to_status]?.label_ar}
                      </span>
                      <span className="text-[11px] font-mono text-slate-400">
                        {formatDateArabic(item.created_at)}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 font-medium leading-relaxed">
                      {item.comment}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Citizen Guidance Notice */}
          <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-3">
            <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block mb-0.5">{t('ملاحظة هامة للمتعاملين:', 'Notice:')}</span>
              {t(
                'في حال وجود أوراق مستندات ناقصة، يرجى التوجه لفرع الصفوة الموضح أعلاه لاستكمال الملف، أو التواصل هاتفياً على الرقم 01115345157.',
                'If any document is marked missing, please visit El Safwa branch office to complete your file.'
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
