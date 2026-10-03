import React, { useState } from 'react';
import { 
  Plus, 
  Trash2, 
  ArrowUp, 
  ArrowDown, 
  Save, 
  RotateCcw, 
  Clock, 
  FileText, 
  CheckCircle2, 
  Tag, 
  AlertCircle,
  X
} from 'lucide-react';
import { useData } from '../../../context/DataContext';
import { useLanguage } from '../../../context/LanguageContext';
import { RequestRecord, RequestStep, WorkflowStepTemplate } from '../../../types';
import { Modal } from '../../common/Modal';

interface StepDesignerModalProps {
  request: RequestRecord;
  isOpen: boolean;
  onClose: () => void;
  onSaved?: () => void;
}

export const StepDesignerModal: React.FC<StepDesignerModalProps> = ({
  request,
  isOpen,
  onClose,
  onSaved
}) => {
  const { serviceTypes, getRequestSteps, updateRequestSteps, resetRequestStepsToServiceTemplate } = useData();
  const { t } = useLanguage();

  const currentService = serviceTypes.find(s => s.id === request.service_type_id);
  const existingSteps = getRequestSteps(request.id);

  // Editable steps state
  const [steps, setSteps] = useState<RequestStep[]>(() => {
    if (existingSteps && existingSteps.length > 0) {
      return JSON.parse(JSON.stringify(existingSteps));
    }
    // Fallback if none exist yet
    const templateSteps = currentService?.workflow_steps || [];
    return templateSteps.map((ts, idx) => ({
      id: `step-${request.id}-${idx + 1}-${Date.now()}`,
      request_id: request.id,
      title: ts.title,
      description: ts.description,
      order: idx + 1,
      estimated_days: ts.estimated_days || 2,
      status: 'pending' as const,
      required_documents: ts.required_documents || [],
      attached_document_ids: [],
      created_at: new Date().toISOString()
    }));
  });

  const [activeStepDocInput, setActiveStepDocInput] = useState<{ [stepIndex: number]: string }>({});
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Common suggested documents from service
  const availableDocSuggestions = Array.from(
    new Set([
      ...(currentService?.required_documents || []),
      'صورة بطاقة الرقم القومي',
      'عقد الملكية المسجل',
      'عقد الإيجار الموثق',
      'السجل التجاري والبطاقة الضريبية',
      'الرسم الهندسي المعتمد',
      'شهادة صلاحية الموقع',
      'تقرير السلامة الإنشائية الاستشاري',
      'موافقة الحماية المدنية',
      'إيصال سداد الرسوم',
      'التوكيل الرسمي المعتمد'
    ])
  );

  // Add a new step
  const handleAddNewStep = () => {
    const newStepIndex = steps.length + 1;
    const newStep: RequestStep = {
      id: `step-${request.id}-${newStepIndex}-${Date.now()}`,
      request_id: request.id,
      title: `خطوة إجرائية رقم ${newStepIndex}`,
      description: '',
      order: newStepIndex,
      estimated_days: 2,
      status: 'pending',
      required_documents: [],
      attached_document_ids: [],
      created_at: new Date().toISOString()
    };
    setSteps(prev => [...prev, newStep]);
  };

  // Remove a step
  const handleRemoveStep = (index: number) => {
    if (steps.length <= 1) {
      alert(t('يجب الإبقاء على خطوة تنفيذية واحدة على الأقل بالمعاملة', 'At least one step must remain'));
      return;
    }
    setSteps(prev => {
      const filtered = prev.filter((_, idx) => idx !== index);
      return filtered.map((s, idx) => ({ ...s, order: idx + 1 }));
    });
  };

  // Move step up
  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    setSteps(prev => {
      const copy = [...prev];
      const temp = copy[index - 1];
      copy[index - 1] = copy[index];
      copy[index] = temp;
      return copy.map((s, idx) => ({ ...s, order: idx + 1 }));
    });
  };

  // Move step down
  const handleMoveDown = (index: number) => {
    if (index === steps.length - 1) return;
    setSteps(prev => {
      const copy = [...prev];
      const temp = copy[index + 1];
      copy[index + 1] = copy[index];
      copy[index] = temp;
      return copy.map((s, idx) => ({ ...s, order: idx + 1 }));
    });
  };

  // Update step field
  const handleStepChange = (index: number, field: keyof RequestStep, value: any) => {
    setSteps(prev => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  // Add required document to a specific step
  const handleAddDocToStep = (index: number, docName: string) => {
    const clean = docName.trim();
    if (!clean) return;
    setSteps(prev => {
      const copy = [...prev];
      const currentDocs = copy[index].required_documents || [];
      if (!currentDocs.includes(clean)) {
        copy[index] = {
          ...copy[index],
          required_documents: [...currentDocs, clean]
        };
      }
      return copy;
    });
    setActiveStepDocInput(prev => ({ ...prev, [index]: '' }));
  };

  // Remove document from a step
  const handleRemoveDocFromStep = (stepIndex: number, docToRemove: string) => {
    setSteps(prev => {
      const copy = [...prev];
      copy[stepIndex] = {
        ...copy[stepIndex],
        required_documents: (copy[stepIndex].required_documents || []).filter(d => d !== docToRemove)
      };
      return copy;
    });
  };

  // Save Steps to DB
  const handleSaveAll = () => {
    // Validate titles
    const emptyTitle = steps.find(s => !s.title.trim());
    if (emptyTitle) {
      alert(t('يرجى كتابة عنوان لكل خطوة إجرائية', 'Please enter a title for every step'));
      return;
    }

    updateRequestSteps(request.id, steps);
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      onSaved?.();
      onClose();
    }, 600);
  };

  // Reset to default template
  const handleResetToTemplate = () => {
    if (confirm(t('هل أنت متأكد من استعادة المخطط الافتراضي للخدمة؟ سيتم استبدال الخطوات الحالية بمخطط الخدمة الأصلي.', 'Reset to default service workflow? This replaces current steps.'))) {
      const reset = resetRequestStepsToServiceTemplate(request.id);
      setSteps(JSON.parse(JSON.stringify(reset)));
    }
  };

  const totalCalculatedDays = steps.reduce((sum, s) => sum + (Number(s.estimated_days) || 0), 0);
  const totalRequiredDocsCount = steps.reduce((sum, s) => sum + (s.required_documents?.length || 0), 0);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('تصميم مسار خطوات ومستندات المعاملة', 'Request Workflow Steps & Documents Designer')}
      subtitle={`${request.tracking_ref} - ${request.service_name_ar}`}
      maxWidth="4xl"
    >
      <div className="space-y-6 text-xs font-sans">
        {/* Designer Summary Banner */}
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-900 text-gold-400 flex items-center justify-center font-bold shrink-0 shadow-sm">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <div className="font-extrabold text-sm text-slate-900 dark:text-white">
                {t('مخطط التنفيذ الزمني والمستندي للمعاملة', 'Execution & Document Delivery Timeline')}
              </div>
              <div className="text-slate-600 dark:text-slate-300 text-[11px] font-medium mt-0.5">
                {t('صمم كل خطوة مع مدتها بالأيام والمستندات المطلوبة خصيصاً لها لضمان دقة الرقابة والإنجاز', 'Configure duration and per-step required documents for full SLA audit')}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono font-bold">
            <div className="bg-white dark:bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200">
              <span className="text-slate-400 block text-[9px] uppercase">إجمالي المدة:</span>
              <span className="text-emerald-700 dark:text-emerald-400 font-black text-sm">{totalCalculatedDays} {t('يوم عمل', 'days')}</span>
            </div>

            <div className="bg-white dark:bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200">
              <span className="text-slate-400 block text-[9px] uppercase">إجمالي الخطوات:</span>
              <span className="text-blue-700 dark:text-blue-400 font-black text-sm">{steps.length} {t('خطوات', 'steps')}</span>
            </div>

            <div className="bg-white dark:bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200">
              <span className="text-slate-400 block text-[9px] uppercase">المستندات المطلوبة:</span>
              <span className="text-amber-700 dark:text-amber-400 font-black text-sm">{totalRequiredDocsCount} {t('مستند', 'docs')}</span>
            </div>
          </div>
        </div>

        {/* Action Controls Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleAddNewStep}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-900 hover:bg-emerald-800 text-white font-extrabold text-xs shadow-sm transition hover:scale-105 active:scale-95"
            >
              <Plus className="w-4 h-4 text-gold-400" />
              <span>{t('إضافة خطوة إجرائية جديدة', 'Add New Step')}</span>
            </button>

            <button
              type="button"
              onClick={handleResetToTemplate}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-100 transition"
              title={t('استعادة المخطط الافتراضي لنوع الخدمة', 'Reset to service default template')}
            >
              <RotateCcw className="w-3.5 h-3.5 text-amber-500" />
              <span>{t('استعادة مخطط الخدمة الافتراضي', 'Reset to Service Default')}</span>
            </button>
          </div>

          <div className="text-[11px] text-slate-400 font-medium">
            {t('يمكنك إعادة ترتيب الخطوات باستخدام أسهم الصعود والنزول', 'Use up/down arrows to reorder steps sequence')}
          </div>
        </div>

        {/* Steps List */}
        <div className="space-y-4 max-h-[55vh] overflow-y-auto pe-1">
          {steps.map((step, idx) => (
            <div 
              key={step.id || idx}
              className="p-4 rounded-2xl bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 hover:border-emerald-500/50 dark:hover:border-emerald-500/50 shadow-sm transition space-y-3"
            >
              {/* Step Card Header */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 flex-1 min-w-[240px]">
                  <span className="w-7 h-7 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-900 dark:text-emerald-300 font-black font-mono flex items-center justify-center shrink-0 border border-emerald-300 dark:border-emerald-800">
                    {idx + 1}
                  </span>

                  <input
                    type="text"
                    required
                    value={step.title}
                    onChange={e => handleStepChange(idx, 'title', e.target.value)}
                    placeholder={t('عنوان الخطوة الإجرائية (مثال: المعاينة الهندسية)', 'Step Title')}
                    className="flex-1 px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-extrabold focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>

                {/* Duration & Order Controls */}
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800 px-3 py-1 rounded-xl border border-slate-200 dark:border-slate-700">
                    <Clock className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-[11px] font-bold text-slate-500">المدة:</span>
                    <input
                      type="number"
                      min={1}
                      max={90}
                      value={step.estimated_days}
                      onChange={e => handleStepChange(idx, 'estimated_days', Math.max(1, Number(e.target.value)))}
                      className="w-12 px-1.5 py-0.5 text-center rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 font-mono font-black text-emerald-700 dark:text-emerald-400 focus:outline-none"
                    />
                    <span className="text-[11px] font-bold text-slate-500">{t('يوم', 'days')}</span>
                  </div>

                  {/* Reorder Buttons */}
                  <div className="flex items-center gap-0.5 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-xl border border-slate-200 dark:border-slate-700">
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => handleMoveUp(idx)}
                      className="p-1 rounded-lg hover:bg-white dark:hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition"
                      title={t('تحريك للأعلى', 'Move Up')}
                    >
                      <ArrowUp className="w-3.5 h-3.5 text-slate-600 dark:text-slate-300" />
                    </button>
                    <button
                      type="button"
                      disabled={idx === steps.length - 1}
                      onClick={() => handleMoveDown(idx)}
                      className="p-1 rounded-lg hover:bg-white dark:hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition"
                      title={t('تحريك للأسفل', 'Move Down')}
                    >
                      <ArrowDown className="w-3.5 h-3.5 text-slate-600 dark:text-slate-300" />
                    </button>
                  </div>

                  {/* Delete Step Button */}
                  <button
                    type="button"
                    onClick={() => handleRemoveStep(idx)}
                    className="p-1.5 rounded-xl bg-rose-50 dark:bg-rose-950 text-rose-600 hover:bg-rose-100 dark:hover:bg-rose-900 transition"
                    title={t('حذف هذه الخطوة', 'Delete Step')}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Step Description / Instructions */}
              <div>
                <input
                  type="text"
                  value={step.description || ''}
                  onChange={e => handleStepChange(idx, 'description', e.target.value)}
                  placeholder={t('تعليمات أو وصف تفصيلي لما يتم في هذه الخطوة (اختياري)...', 'Step instructions/description...')}
                  className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 text-[11px] font-medium focus:outline-none"
                />
              </div>

              {/* Step Required Documents Designer */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 space-y-2">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-extrabold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-amber-500" />
                    <span>{t('المستندات المطلوبة خصيصاً لهذه الخطوة:', 'Required Documents for this Step:')}</span>
                    <span className="font-mono text-slate-400">({step.required_documents?.length || 0})</span>
                  </span>

                  <span className="text-[10px] text-slate-400 font-medium">
                    {t('لا يمكن للموظف إتمام هذه الخطوة إلا بعد استيفاء هذه المستندات', 'Step requires these docs to be completed')}
                  </span>
                </div>

                {/* Document Tags */}
                <div className="flex flex-wrap items-center gap-1.5">
                  {step.required_documents?.map((doc, dIdx) => (
                    <span 
                      key={dIdx} 
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200 font-bold text-[11px]"
                    >
                      <Tag className="w-3 h-3 text-amber-600" />
                      <span>{doc}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveDocFromStep(idx, doc)}
                        className="ms-1 hover:text-rose-600 text-amber-500 transition"
                        title={t('حذف هذا المستند', 'Remove doc')}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}

                  {(!step.required_documents || step.required_documents.length === 0) && (
                    <span className="text-slate-400 text-[11px] italic">
                      {t('لا يتطلب مستندات مرفقة محددة', 'No specific documents required for this step')}
                    </span>
                  )}
                </div>

                {/* Add Document Input & Quick Suggestions */}
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <div className="flex-1 flex gap-1.5 min-w-[200px]">
                    <input
                      type="text"
                      placeholder={t('اكتب اسم مستند جديد واضغط إضافة...', 'Type doc name and click add...')}
                      value={activeStepDocInput[idx] || ''}
                      onChange={e => setActiveStepDocInput({ ...activeStepDocInput, [idx]: e.target.value })}
                      onKeyDown={e => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddDocToStep(idx, activeStepDocInput[idx] || '');
                        }
                      }}
                      className="flex-1 px-3 py-1 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-bold focus:outline-none"
                    />

                    <button
                      type="button"
                      onClick={() => handleAddDocToStep(idx, activeStepDocInput[idx] || '')}
                      className="px-3 py-1 rounded-xl bg-slate-800 text-white font-bold text-xs hover:bg-slate-700 transition"
                    >
                      {t('إضافة', 'Add')}
                    </button>
                  </div>

                  {/* Dropdown Suggestions */}
                  <select
                    onChange={e => {
                      if (e.target.value) {
                        handleAddDocToStep(idx, e.target.value);
                        e.target.value = '';
                      }
                    }}
                    className="px-2.5 py-1 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] font-bold focus:outline-none"
                  >
                    <option value="">{t('⚡ اختر من المستندات الشائعة...', '⚡ Pick from common documents...')}</option>
                    {availableDocSuggestions.map((sDoc, sIdx) => (
                      <option key={sIdx} value={sDoc}>{sDoc}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-slate-500 font-bold">
              {t(`تم تجهيز ${steps.length} خطوات بـ ${totalRequiredDocsCount} مستند مطلوب بإجمالي ${totalCalculatedDays} يوم`, `${steps.length} steps configured (${totalRequiredDocsCount} docs, ${totalCalculatedDays} days)`)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-100 transition"
            >
              {t('إلغاء', 'Cancel')}
            </button>

            <button
              type="button"
              onClick={handleSaveAll}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-900 hover:bg-emerald-800 text-white font-black shadow-md transition hover:scale-105 active:scale-95"
            >
              <Save className="w-4 h-4 text-gold-400" />
              <span>{saveSuccess ? t('✓ تم الحفظ بنجاح', 'Saved Successfully') : t('حفظ واعتماد مسار الخطوات', 'Save & Apply Workflow')}</span>
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
