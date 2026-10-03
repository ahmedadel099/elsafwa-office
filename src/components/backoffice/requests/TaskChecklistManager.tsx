import React, { useState } from 'react';
import { 
  CheckSquare, 
  Square, 
  Plus, 
  CheckCircle2, 
  ListTodo, 
  Clock, 
  AlertTriangle, 
  FileText, 
  UploadCloud, 
  Eye, 
  Download, 
  Trash2, 
  Sliders, 
  Printer, 
  ShieldCheck, 
  RotateCcw,
  Calendar,
  User,
  Paperclip,
  Check,
  ChevronDown
} from 'lucide-react';
import { useData } from '../../../context/DataContext';
import { useAuth } from '../../../context/AuthContext';
import { useLanguage } from '../../../context/LanguageContext';
import { RequestRecord, RequestStep, DocumentRecord } from '../../../types';
import { formatDateArabic } from '../../../utils/formatters';
import { StepDesignerModal } from './StepDesignerModal';
import { StepDocAttachModal } from './StepDocAttachModal';
import { DocumentViewerModal } from '../documents/DocumentViewerModal';

interface TaskChecklistManagerProps {
  request: RequestRecord;
}

export const TaskChecklistManager: React.FC<TaskChecklistManagerProps> = ({ request }) => {
  const { 
    getRequestSteps, 
    toggleStepCompletion, 
    setStepStatus, 
    saveRequestStep, 
    unlinkDocumentFromStep, 
    getRequestDocuments,
    resetRequestStepsToServiceTemplate 
  } = useData();
  const { currentUser } = useAuth();
  const { t, dir } = useLanguage();

  const steps = getRequestSteps(request.id);
  const requestDocs = getRequestDocuments(request.id);

  const [isDesignerOpen, setIsDesignerOpen] = useState(false);
  const [attachingDocStep, setAttachingDocStep] = useState<{ step: RequestStep; targetDoc?: string } | null>(null);
  const [viewingDoc, setViewingDoc] = useState<DocumentRecord | null>(null);
  const [quickStepTitle, setQuickStepTitle] = useState('');
  const [quickStepDays, setQuickStepDays] = useState(2);

  // Status mapping
  const STEP_STATUS_META = {
    completed: {
      label_ar: 'مكتمل بنجاح',
      label_en: 'Completed',
      badgeClass: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800',
      dotClass: 'bg-emerald-600 ring-4 ring-emerald-100 dark:ring-emerald-950'
    },
    in_progress: {
      label_ar: 'قيد التنفيذ والمتابعة',
      label_en: 'In Progress',
      badgeClass: 'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200 border-amber-300 dark:border-amber-800',
      dotClass: 'bg-amber-500 animate-pulse ring-4 ring-amber-100 dark:ring-amber-950'
    },
    pending: {
      label_ar: 'معلق بالمسار',
      label_en: 'Pending',
      badgeClass: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700',
      dotClass: 'bg-slate-400 ring-4 ring-slate-100 dark:ring-slate-900'
    },
    blocked: {
      label_ar: 'موقوف مؤقتاً',
      label_en: 'Blocked',
      badgeClass: 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border-rose-300 dark:border-rose-800',
      dotClass: 'bg-rose-600 ring-4 ring-rose-100 dark:ring-rose-950'
    }
  };

  // Calculations
  const totalSteps = steps.length;
  const completedSteps = steps.filter(s => s.status === 'completed').length;
  const progressPercent = totalSteps === 0 ? 0 : Math.round((completedSteps / totalSteps) * 100);

  // Document fulfillment calculation
  let totalRequiredDocs = 0;
  let fulfilledRequiredDocs = 0;

  steps.forEach(step => {
    const reqDocs = step.required_documents || [];
    totalRequiredDocs += reqDocs.length;

    // Check how many of these required docs are attached to the step or in requestDocs
    reqDocs.forEach(rDoc => {
      const isAttached = requestDocs.some(
        d => (d.document_type === rDoc || d.file_name.includes(rDoc)) && 
             (step.attached_document_ids?.includes(d.id) || d.step_id === step.id)
      );
      if (isAttached) fulfilledRequiredDocs++;
    });
  });

  const docFulfillmentPercent = totalRequiredDocs === 0 ? 100 : Math.round((fulfilledRequiredDocs / totalRequiredDocs) * 100);

  // Quick Add Step
  const handleQuickAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickStepTitle.trim()) return;

    saveRequestStep({
      request_id: request.id,
      title: quickStepTitle.trim(),
      estimated_days: Number(quickStepDays) || 2,
      status: 'pending',
      required_documents: []
    });

    setQuickStepTitle('');
    setQuickStepDays(2);
  };

  // Toggle step completion with confirmation if docs missing
  const handleToggleStep = (step: RequestStep) => {
    const isNowCompleting = step.status !== 'completed';
    
    // Check if step has required documents that are not uploaded
    if (isNowCompleting && step.required_documents && step.required_documents.length > 0) {
      const stepAttachedDocs = requestDocs.filter(d => step.attached_document_ids?.includes(d.id) || d.step_id === step.id);
      const attachedTypes = stepAttachedDocs.map(d => d.document_type);
      const missing = step.required_documents.filter(rd => !attachedTypes.includes(rd));

      if (missing.length > 0) {
        const proceed = confirm(
          t(
            `تنبيه: الخطوة تحتوي على (${missing.length}) مستندات مطلوبة لم يتم إرفاقها بعد:\n• ${missing.join('\n• ')}\n\nهل ترغب في اعتماد إنجاز هذه الخطوة والتخطي؟`,
            `Warning: (${missing.length}) required documents are missing for this step. Do you want to complete anyway?`
          )
        );
        if (!proceed) return;
      }
    }

    toggleStepCompletion(step.id, currentUser?.full_name || 'موظف المنظومة', isNowCompleting);
  };

  // Find document record by ID
  const getDocById = (docId: string) => requestDocs.find(d => d.id === docId);

  // Print Step Workflow
  const handlePrintWorkflow = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Printable Title Block (Only shown in print) */}
      <div className="hidden print:block text-center border-b pb-4 mb-4">
        <h2 className="text-xl font-black">شركة الصفوة للخدمات الحكومية والتراخيص</h2>
        <p className="text-xs">بيان مسار تنفيذ خطوات المعاملة والمستندات المطلوبة</p>
        <div className="flex justify-between text-xs font-mono mt-2">
          <span>كود التتبع: <strong>{request.tracking_ref}</strong></span>
          <span>العميل: <strong>{request.client_name}</strong></span>
          <span>الخدمة: <strong>{request.service_name_ar}</strong></span>
          <span>تاريخ الاستلام: <strong>{formatDateArabic(request.received_date)}</strong></span>
        </div>
      </div>

      {/* Header & Overview Stats Bar */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h4 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <ListTodo className="w-5 h-5 text-emerald-600" />
              <span>{t('مخطط خطوات ومهمات المعاملة (Workflow & Step Checklist)', 'Workflow & Step Checklist')}</span>
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
              {t(`نسبة الإنجاز الإجرائي: ${progressPercent}% (${completedSteps} من ${totalSteps} خطوات) • استيفاء المستندات: ${docFulfillmentPercent}% (${fulfilledRequiredDocs}/${totalRequiredDocs})`, `Steps Progress: ${progressPercent}% (${completedSteps}/${totalSteps}) • Docs: ${docFulfillmentPercent}%`)}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 no-print">
            {/* Design Steps Button */}
            <button
              type="button"
              onClick={() => setIsDesignerOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-900 hover:bg-emerald-800 text-white font-extrabold text-xs shadow-md transition hover:scale-105 active:scale-95"
            >
              <Sliders className="w-4 h-4 text-gold-400" />
              <span>{t('تصميم وتخصيص خطوات ومستندات المعاملة', 'Design Steps & Docs')}</span>
            </button>

            {/* Print Sheet */}
            <button
              type="button"
              onClick={handlePrintWorkflow}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs hover:bg-slate-100 transition"
              title={t('طباعة بيان الخطوات والمستندات', 'Print Step Checklist Sheet')}
            >
              <Printer className="w-4 h-4 text-emerald-600" />
              <span>{t('طباعة البيان', 'Print')}</span>
            </button>
          </div>
        </div>

        {/* Dual Progress Bars: Step Execution & Documents Match */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          {/* 1. Step Execution Progress */}
          <div className="space-y-1.5 bg-slate-50 dark:bg-slate-950/60 p-3.5 rounded-2xl border border-slate-200/60 dark:border-slate-800/60">
            <div className="flex justify-between items-center text-xs font-bold">
              <span className="text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>{t('إنجاز الخطوات والمراحل:', 'Steps Completed:')}</span>
              </span>
              <span className="font-mono font-black text-emerald-700 dark:text-emerald-400">
                {progressPercent}% ({completedSteps}/{totalSteps})
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
              <div 
                className="h-full bg-emerald-600 transition-all duration-500 rounded-full"
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
          </div>

          {/* 2. Step Documents Match Progress */}
          <div className="space-y-1.5 bg-slate-50 dark:bg-slate-950/60 p-3.5 rounded-2xl border border-slate-200/60 dark:border-slate-800/60">
            <div className="flex justify-between items-center text-xs font-bold">
              <span className="text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-500" />
                <span>{t('استيفاء المستندات الإلزامية للخطوات:', 'Step Docs Fulfilled:')}</span>
              </span>
              <span className="font-mono font-black text-amber-700 dark:text-amber-400">
                {docFulfillmentPercent}% ({fulfilledRequiredDocs}/{totalRequiredDocs})
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
              <div 
                className="h-full bg-amber-500 transition-all duration-500 rounded-full"
                style={{ width: `${docFulfillmentPercent}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Sequential Steps Timeline */}
      <div className="space-y-6">
        {steps.length === 0 ? (
          <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <ListTodo className="w-10 h-10 text-slate-400 mx-auto" />
            <h4 className="font-extrabold text-sm text-slate-800 dark:text-slate-200">
              {t('لم يتم تصميم خطوات إجرائية مخصصة لهذا الطلب بعد', 'No steps configured for this request')}
            </h4>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              {t('يمكنك استدعاء المخطط الافتراضي لنوع الخدمة أو تصميم مسار خطوات جديد مع المستندات المطلوبة لكل خطوة', 'You can load the service default workflow or create custom steps')}
            </p>
            <button
              type="button"
              onClick={() => resetRequestStepsToServiceTemplate(request.id)}
              className="px-5 py-2.5 rounded-xl bg-emerald-900 text-white font-extrabold text-xs shadow-md"
            >
              {t('تحميل مخطط الخدمة الافتراضي الآن', 'Load Default Workflow Steps')}
            </button>
          </div>
        ) : (
          <div className="relative border-s-2 border-emerald-600/30 dark:border-emerald-800/50 ms-4 space-y-6 py-2">
            {steps.map((step, idx) => {
              const meta = STEP_STATUS_META[step.status] || STEP_STATUS_META.pending;
              const isDone = step.status === 'completed';

              // Attached docs
              const stepAttachedDocs = requestDocs.filter(
                d => step.attached_document_ids?.includes(d.id) || d.step_id === step.id
              );

              return (
                <div key={step.id || idx} className="relative ps-6 group">
                  {/* Timeline Indicator Dot */}
                  <div 
                    onClick={() => handleToggleStep(step)}
                    className={`absolute -start-[11px] top-4 w-5 h-5 rounded-full cursor-pointer flex items-center justify-center font-bold text-[10px] text-white shadow-sm transition hover:scale-125 ${meta.dotClass}`}
                    title={t(isDone ? 'اضغط لإلغاء الإنجاز' : 'اضغط لاعتماد الإنجاز', 'Toggle completion')}
                  >
                    {isDone ? <Check className="w-3 h-3 text-white" /> : (idx + 1)}
                  </div>

                  {/* Step Milestone Card */}
                  <div className={`p-5 rounded-3xl border transition shadow-sm space-y-4 ${
                    isDone
                      ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/60'
                      : step.status === 'blocked'
                      ? 'bg-rose-50/40 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/60'
                      : step.status === 'in_progress'
                      ? 'bg-white dark:bg-slate-900 border-amber-300 dark:border-amber-700/80 ring-1 ring-amber-300/40'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                  }`}>
                    {/* Top Row: Order, Title, Status & Target Date */}
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-3 flex-1 min-w-[220px]">
                        <span className="w-7 h-7 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-mono font-black text-xs flex items-center justify-center shrink-0 border border-slate-200 dark:border-slate-700">
                          {idx + 1}
                        </span>

                        <div>
                          <h5 className={`font-black text-sm text-slate-900 dark:text-white flex items-center gap-2 ${isDone ? 'line-through text-slate-500 dark:text-slate-400' : ''}`}>
                            <span>{step.title}</span>
                          </h5>
                          {step.description && (
                            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                              {step.description}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Right Side: Timeline & Status Selector */}
                      <div className="flex flex-wrap items-center gap-2">
                        {/* Timeline SLA Badge */}
                        <div className="flex items-center gap-2 text-xs font-mono font-bold bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
                          <Clock className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{step.estimated_days} {t('أيام عمل', 'days')}</span>
                          {step.target_date && (
                            <>
                              <span className="text-slate-300">|</span>
                              <span className="text-slate-600 dark:text-slate-300">المستهدف: {formatDateArabic(step.target_date)}</span>
                            </>
                          )}
                        </div>

                        {/* Status Dropdown Selector */}
                        <select
                          value={step.status}
                          onChange={e => setStepStatus(step.id, e.target.value as any, currentUser?.full_name)}
                          className={`px-3 py-1.5 rounded-xl font-extrabold text-xs border focus:outline-none cursor-pointer ${meta.badgeClass}`}
                        >
                          <option value="pending">⏳ {t('معلق بالمسار', 'Pending')}</option>
                          <option value="in_progress">⚡ {t('قيد التنفيذ', 'In Progress')}</option>
                          <option value="completed">✓ {t('مكتمل بنجاح', 'Completed')}</option>
                          <option value="blocked">⛔ {t('موقوف مؤقتاً', 'Blocked')}</option>
                        </select>

                        {/* Completion Checkbox Button */}
                        <button
                          type="button"
                          onClick={() => handleToggleStep(step)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-black text-xs transition ${
                            isDone 
                              ? 'bg-emerald-600 text-white shadow-sm'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-emerald-100 hover:text-emerald-900'
                          }`}
                        >
                          {isDone ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                          <span>{isDone ? t('مكتمل', 'Done') : t('إنجاز الخطوة', 'Mark Done')}</span>
                        </button>
                      </div>
                    </div>

                    {/* Completion Audit Log Info */}
                    {isDone && step.completed_at && (
                      <div className="text-[11px] font-mono text-emerald-700 dark:text-emerald-400 font-bold bg-emerald-100/60 dark:bg-emerald-950/40 p-2 rounded-xl flex items-center justify-between border border-emerald-200 dark:border-emerald-800/60">
                        <div className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>تم إنجاز هذه الخطوة بنجاح في: <strong>{step.completed_at}</strong></span>
                        </div>
                        {step.completed_by_name && (
                          <span>المسؤول: <strong>{step.completed_by_name}</strong></span>
                        )}
                      </div>
                    )}

                    {step.status === 'blocked' && step.notes && (
                      <div className="text-[11px] text-rose-700 dark:text-rose-400 font-bold bg-rose-50 dark:bg-rose-950/60 p-2.5 rounded-xl border border-rose-200 dark:border-rose-800 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 shrink-0" />
                        <span>سبب التعليق: {step.notes}</span>
                      </div>
                    )}

                    {/* Step Required Documents Checklist Box */}
                    <div className="p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-950/50 border border-slate-200/60 dark:border-slate-800/60 space-y-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-amber-500" />
                          <span className="font-extrabold text-xs text-slate-800 dark:text-slate-200">
                            {t('المستندات المطلوبة لإتمام هذه المرحلة:', 'Step Required Documents:')}
                          </span>
                          <span className="text-[11px] font-mono font-bold text-slate-500">
                            ({step.required_documents?.length || 0})
                          </span>
                        </div>

                        {/* Attach Doc to this Step Trigger */}
                        <button
                          type="button"
                          onClick={() => setAttachingDocStep({ step })}
                          className="flex items-center gap-1 px-3 py-1 rounded-xl bg-gold-400 text-slate-950 font-black text-[11px] hover:bg-gold-300 transition shadow-sm no-print"
                        >
                          <UploadCloud className="w-3.5 h-3.5" />
                          <span>{t('إرفاق أو ربط مستند بالخطوة', 'Attach / Link Doc')}</span>
                        </button>
                      </div>

                      {/* Required Documents List */}
                      {(!step.required_documents || step.required_documents.length === 0) ? (
                        <div className="text-slate-400 text-xs italic">
                          {t('لا تشترط هذه المرحلة مستندات معينة', 'No specific documents required for this step.')}
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                          {step.required_documents.map((reqDocName, rIdx) => {
                            // Find if this document has been uploaded for this step or exists in request
                            const matchingDoc = stepAttachedDocs.find(
                              d => d.document_type === reqDocName || d.file_name.toLowerCase().includes(reqDocName.toLowerCase())
                            ) || requestDocs.find(d => d.document_type === reqDocName && d.step_id === step.id);

                            return (
                              <div 
                                key={rIdx}
                                className={`p-3 rounded-2xl border text-xs flex items-center justify-between gap-2 transition ${
                                  matchingDoc
                                    ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
                                    : 'bg-amber-50/70 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900/60 text-amber-900 dark:text-amber-200'
                                }`}
                              >
                                <div className="flex items-center gap-2 flex-1 min-w-0">
                                  {matchingDoc ? (
                                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                                  ) : (
                                    <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                                  )}

                                  <div className="truncate">
                                    <div className="font-extrabold truncate">{reqDocName}</div>
                                    <div className="text-[10px] opacity-80 mt-0.5 truncate font-mono">
                                      {matchingDoc ? `✓ ${matchingDoc.file_name} (v${matchingDoc.version})` : t('⚠️ ناقص وغير مرفق', 'Missing / Not Attached')}
                                    </div>
                                  </div>
                                </div>

                                {/* Actions for this specific required document */}
                                <div className="flex items-center gap-1 shrink-0 no-print">
                                  {matchingDoc ? (
                                    <>
                                      <button
                                        type="button"
                                        onClick={() => setViewingDoc(matchingDoc)}
                                        className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200 hover:bg-emerald-200 transition"
                                        title={t('معاينة المستند', 'Preview')}
                                      >
                                        <Eye className="w-3.5 h-3.5" />
                                      </button>

                                      <a
                                        href={matchingDoc.file_path}
                                        download={matchingDoc.file_name}
                                        className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200 hover:bg-emerald-200 transition"
                                        title={t('تحميل المستند', 'Download')}
                                      >
                                        <Download className="w-3.5 h-3.5" />
                                      </a>
                                    </>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={() => setAttachingDocStep({ step, targetDoc: reqDocName })}
                                      className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-black text-[10px] shadow-sm transition"
                                    >
                                      <UploadCloud className="w-3 h-3" />
                                      <span>{t('استيفاء ورفع', 'Upload')}</span>
                                    </button>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* Additional Attached Files (Non-Standard or Extra) */}
                      {stepAttachedDocs.filter(d => !step.required_documents?.includes(d.document_type)).length > 0 && (
                        <div className="pt-2 border-t border-slate-200/50 dark:border-slate-800/50 space-y-1.5">
                          <span className="text-[10px] font-bold text-slate-400 block">
                            {t('مرفقات ومستندات إضافية لهذه الخطوة:', 'Additional Attached Files:')}
                          </span>
                          <div className="flex flex-wrap gap-2">
                            {stepAttachedDocs
                              .filter(d => !step.required_documents?.includes(d.document_type))
                              .map(extraDoc => (
                                <div 
                                  key={extraDoc.id}
                                  className="inline-flex items-center gap-2 px-2.5 py-1 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold shadow-sm"
                                >
                                  <Paperclip className="w-3.5 h-3.5 text-emerald-600" />
                                  <span className="truncate max-w-[150px]">{extraDoc.file_name}</span>
                                  <button
                                    type="button"
                                    onClick={() => setViewingDoc(extraDoc)}
                                    className="hover:text-emerald-600 transition"
                                    title={t('معاينة', 'Preview')}
                                  >
                                    <Eye className="w-3 h-3" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => unlinkDocumentFromStep(step.id, extraDoc.id)}
                                    className="hover:text-rose-600 text-slate-400 transition"
                                    title={t('إلغاء الربط', 'Unlink')}
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </div>
                              ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Quick Add Custom Step Form */}
      <form onSubmit={handleQuickAdd} className="p-4 rounded-3xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 flex flex-wrap items-center gap-3 no-print">
        <div className="flex-1 min-w-[200px]">
          <input
            type="text"
            placeholder={t('إضافة خطوة إجرائية سريعة جديدة لهذه المعاملة...', 'Quick add custom step...')}
            value={quickStepTitle}
            onChange={e => setQuickStepTitle(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-bold focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs">
          <Clock className="w-3.5 h-3.5 text-emerald-600" />
          <span className="text-slate-500 font-bold">{t('المدة:', 'Duration:')}</span>
          <input
            type="number"
            min={1}
            max={60}
            value={quickStepDays}
            onChange={e => setQuickStepDays(Math.max(1, Number(e.target.value)))}
            className="w-12 px-1 py-0.5 text-center rounded border border-slate-200 dark:border-slate-700 font-mono font-black text-emerald-700 dark:text-emerald-400"
          />
          <span className="text-slate-500 font-bold">{t('يوم', 'days')}</span>
        </div>

        <button
          type="submit"
          className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-emerald-900 hover:bg-emerald-800 text-white font-extrabold text-xs shadow-sm transition shrink-0"
        >
          <Plus className="w-4 h-4 text-gold-400" />
          <span>{t('إضافة الخطوة', 'Add Step')}</span>
        </button>
      </form>

      {/* Step Designer Modal */}
      {isDesignerOpen && (
        <StepDesignerModal
          request={request}
          isOpen={isDesignerOpen}
          onClose={() => setIsDesignerOpen(false)}
        />
      )}

      {/* Step Document Attach / Link Modal */}
      {attachingDocStep && (
        <StepDocAttachModal
          request={request}
          step={attachingDocStep.step}
          targetDocType={attachingDocStep.targetDoc}
          isOpen={!!attachingDocStep}
          onClose={() => setAttachingDocStep(null)}
        />
      )}

      {/* Document Viewer Modal */}
      {viewingDoc && (
        <DocumentViewerModal
          document={viewingDoc}
          isOpen={!!viewingDoc}
          onClose={() => setViewingDoc(null)}
        />
      )}
    </div>
  );
};
