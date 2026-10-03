import React, { useState } from 'react';
import { 
  Briefcase, 
  Plus, 
  Edit2, 
  CheckCircle2, 
  Clock, 
  DollarSign, 
  ListTodo, 
  Sliders, 
  ArrowUp, 
  ArrowDown, 
  Trash2, 
  FileText, 
  Tag, 
  X,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { useData } from '../../../context/DataContext';
import { useLanguage } from '../../../context/LanguageContext';
import { ServiceType, WorkflowStepTemplate } from '../../../types';
import { Modal } from '../../common/Modal';
import { formatCurrency } from '../../../utils/formatters';

export const ServiceTypeManager: React.FC = () => {
  const { serviceTypes, saveServiceType } = useData();
  const { t } = useLanguage();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<ServiceType | null>(null);
  const [modalTab, setModalTab] = useState<'info' | 'workflow'>('info');
  const [expandedWorkflowServiceId, setExpandedWorkflowServiceId] = useState<string | null>(null);

  const [formData, setFormData] = useState<{
    name_ar: string;
    name_en: string;
    category: string;
    default_fee: number;
    estimated_days: number;
    required_documents_str: string;
    workflow_steps: WorkflowStepTemplate[];
  }>({
    name_ar: '',
    name_en: '',
    category: 'التراخيص المحليات',
    default_fee: 3000,
    estimated_days: 10,
    required_documents_str: '',
    workflow_steps: []
  });

  const [activeStepDocInput, setActiveStepDocInput] = useState<{ [stepIdx: number]: string }>({});

  const openAddModal = () => {
    setEditingService(null);
    setModalTab('info');
    const defaultSteps: WorkflowStepTemplate[] = [
      {
        id: 'st-add-1',
        title: 'استلام ومراجعة المستندات الثبوتية',
        description: 'فحص أصول الأوراق والتوكيلات ومطابقة هوية صاحب المعاملة',
        order: 1,
        estimated_days: 2,
        required_documents: ['صورة بطاقة الرقم القومي', 'عقد الملكية المسجل']
      },
      {
        id: 'st-add-2',
        title: 'المعاينة الفنية وإعداد المخطط الهندسي',
        description: 'معاينة الموقع ومطابقة الاشتراطات التخطيطية',
        order: 2,
        estimated_days: 4,
        required_documents: ['الرسم الهندسي المعتمد']
      },
      {
        id: 'st-add-3',
        title: 'توريد الرسوم واستلام الترخيص النهائي',
        description: 'سداد الرسوم المقررة للمركز التكنولوجي واستلام المحرر المعتمد',
        order: 3,
        estimated_days: 4,
        required_documents: []
      }
    ];

    setFormData({
      name_ar: '',
      name_en: '',
      category: 'التراخيص المحليات',
      default_fee: 3000,
      estimated_days: 10,
      required_documents_str: 'صورة بطاقة الرقم القومي, عقد الملكية المسجل, الرسم الهندسي المعتمد',
      workflow_steps: defaultSteps
    });
    setIsModalOpen(true);
  };

  const openEditModal = (srv: ServiceType) => {
    setEditingService(srv);
    setModalTab('info');
    
    // Ensure workflow_steps exist
    const steps: WorkflowStepTemplate[] = (srv.workflow_steps && srv.workflow_steps.length > 0)
      ? JSON.parse(JSON.stringify(srv.workflow_steps))
      : [
          {
            id: `st-${srv.id}-1`,
            title: 'المراجعة والاستيفاء المبدئي للملف',
            description: 'فحص الأوراق ومطابقتها',
            order: 1,
            estimated_days: 2,
            required_documents: srv.required_documents.slice(0, 2)
          },
          {
            id: `st-${srv.id}-2`,
            title: 'التقديم للجهة الحكومية المختصة والمتابعة',
            description: 'توريد الملف بالمركز التكنولوجي',
            order: 2,
            estimated_days: Math.max(1, srv.estimated_days - 4),
            required_documents: srv.required_documents.slice(2)
          },
          {
            id: `st-${srv.id}-3`,
            title: 'صدور الموافقة وتسليم الترخيص النهائي',
            description: 'استلام المحرر المعتمد',
            order: 3,
            estimated_days: 2,
            required_documents: []
          }
        ];

    setFormData({
      name_ar: srv.name_ar,
      name_en: srv.name_en,
      category: srv.category,
      default_fee: srv.default_fee,
      estimated_days: srv.estimated_days,
      required_documents_str: srv.required_documents.join(', '),
      workflow_steps: steps
    });
    setIsModalOpen(true);
  };

  // Step Designer handlers in form
  const handleAddStepToForm = () => {
    const nextOrder = formData.workflow_steps.length + 1;
    const newStep: WorkflowStepTemplate = {
      id: `st-new-${Date.now()}`,
      title: `مرحلة تنفيذية ${nextOrder}`,
      description: '',
      order: nextOrder,
      estimated_days: 2,
      required_documents: []
    };
    const updatedSteps = [...formData.workflow_steps, newStep];
    const totalDays = updatedSteps.reduce((sum, s) => sum + (Number(s.estimated_days) || 0), 0);

    setFormData({
      ...formData,
      workflow_steps: updatedSteps,
      estimated_days: totalDays
    });
  };

  const handleRemoveStepFromForm = (idx: number) => {
    if (formData.workflow_steps.length <= 1) {
      alert(t('يجب الإبقاء على خطوة تنفيذية واحدة على الأقل بالخدمة', 'At least one step required'));
      return;
    }
    const filtered = formData.workflow_steps.filter((_, i) => i !== idx).map((s, i) => ({ ...s, order: i + 1 }));
    const totalDays = filtered.reduce((sum, s) => sum + (Number(s.estimated_days) || 0), 0);
    setFormData({
      ...formData,
      workflow_steps: filtered,
      estimated_days: totalDays
    });
  };

  const handleMoveStep = (idx: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= formData.workflow_steps.length) return;

    const copy = [...formData.workflow_steps];
    const temp = copy[idx];
    copy[idx] = copy[targetIdx];
    copy[targetIdx] = temp;
    const reordered = copy.map((s, i) => ({ ...s, order: i + 1 }));

    setFormData({
      ...formData,
      workflow_steps: reordered
    });
  };

  const handleStepFieldChange = (idx: number, field: keyof WorkflowStepTemplate, val: any) => {
    const copy = [...formData.workflow_steps];
    copy[idx] = { ...copy[idx], [field]: val };

    let totalDays = formData.estimated_days;
    if (field === 'estimated_days') {
      totalDays = copy.reduce((sum, s) => sum + (Number(s.estimated_days) || 0), 0);
    }

    setFormData({
      ...formData,
      workflow_steps: copy,
      estimated_days: totalDays
    });
  };

  const handleAddDocToStep = (idx: number, docName: string) => {
    const clean = docName.trim();
    if (!clean) return;

    const copy = [...formData.workflow_steps];
    const currentDocs = copy[idx].required_documents || [];
    if (!currentDocs.includes(clean)) {
      copy[idx] = {
        ...copy[idx],
        required_documents: [...currentDocs, clean]
      };
    }

    // Also ensure it's in required_documents_str if not already
    const allDocs = formData.required_documents_str.split(',').map(s => s.trim()).filter(Boolean);
    if (!allDocs.includes(clean)) {
      allDocs.push(clean);
    }

    setFormData({
      ...formData,
      workflow_steps: copy,
      required_documents_str: allDocs.join(', ')
    });

    setActiveStepDocInput(prev => ({ ...prev, [idx]: '' }));
  };

  const handleRemoveDocFromStep = (stepIdx: number, docName: string) => {
    const copy = [...formData.workflow_steps];
    copy[stepIdx] = {
      ...copy[stepIdx],
      required_documents: (copy[stepIdx].required_documents || []).filter(d => d !== docName)
    };

    setFormData({
      ...formData,
      workflow_steps: copy
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const docs = formData.required_documents_str.split(',').map(s => s.trim()).filter(Boolean);

    saveServiceType({
      id: editingService?.id,
      name_ar: formData.name_ar.trim(),
      name_en: formData.name_en.trim() || formData.name_ar.trim(),
      category: formData.category.trim(),
      default_fee: Number(formData.default_fee),
      estimated_days: Number(formData.estimated_days),
      required_documents: docs,
      workflow_steps: formData.workflow_steps
    });

    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 animate-fade-in font-sans">
      {/* Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-emerald-600" />
            <span>{t('دليل أنواع الخدمات ومسارات الخطوات والمستندات', 'Service Types & Step Workflow Catalog')}</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
            {t('تصميم مراحل التنفيذ الإجرائية، مدد الإنجاز (SLA)، وقائمة المستندات المطلوبة لكل خطوة على حدة', 'Design step-by-step checklists, SLA durations, and per-step required document catalogs')}
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-emerald-900 hover:bg-emerald-800 text-white font-extrabold text-xs shadow-md transition hover:scale-105 active:scale-95"
        >
          <Plus className="w-4 h-4 text-gold-400" />
          <span>{t('إضافة نوع خدمة جديد', 'Add New Service Type')}</span>
        </button>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {serviceTypes.map(srv => {
          const stepsCount = srv.workflow_steps?.length || 0;
          const isExpanded = expandedWorkflowServiceId === srv.id;

          return (
            <div 
              key={srv.id} 
              className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-4 hover:border-emerald-500/40 transition"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                    {srv.category}
                  </span>
                  <span className="text-xs font-bold text-slate-400 flex items-center gap-1 font-mono">
                    <Clock className="w-3.5 h-3.5 text-emerald-600" />
                    {srv.estimated_days} {t('يوم', 'days')}
                  </span>
                </div>

                <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                  {srv.name_ar}
                </h3>
                <div className="text-xs font-mono font-bold text-emerald-700 dark:text-emerald-400">
                  الرسوم الافتراضية: {formatCurrency(srv.default_fee)}
                </div>

                {/* Steps Workflow Badge */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800/60 text-amber-900 dark:text-amber-300 text-xs font-extrabold">
                    <ListTodo className="w-3.5 h-3.5 text-amber-600" />
                    <span>{stepsCount} {t('مراحل تنفيذية ومستندية', 'Workflow Steps')}</span>
                  </span>

                  {stepsCount > 0 && (
                    <button
                      type="button"
                      onClick={() => setExpandedWorkflowServiceId(isExpanded ? null : srv.id)}
                      className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 hover:underline flex items-center gap-1"
                    >
                      <span>{isExpanded ? t('إخفاء المسار', 'Hide') : t('معاينة المسار', 'Preview')}</span>
                      {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    </button>
                  )}
                </div>

                {/* Expandable Workflow Steps Preview */}
                {isExpanded && srv.workflow_steps && (
                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2.5 text-xs animate-fade-in">
                    <span className="font-extrabold text-slate-700 dark:text-slate-300 block text-[11px]">
                      {t('مخطط الخطوات والمدد والمستندات المطلوبة:', 'Workflow Steps & Requirements:')}
                    </span>
                    <div className="space-y-2">
                      {srv.workflow_steps.map((st, sIdx) => (
                        <div key={st.id || sIdx} className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 space-y-1">
                          <div className="flex items-center justify-between font-bold text-slate-900 dark:text-white text-[11px]">
                            <span className="flex items-center gap-1.5">
                              <span className="w-4 h-4 rounded-full bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-300 flex items-center justify-center font-mono text-[9px]">
                                {sIdx + 1}
                              </span>
                              <span>{st.title}</span>
                            </span>
                            <span className="font-mono text-emerald-700 dark:text-emerald-400 text-[10px]">
                              {st.estimated_days} يوم
                            </span>
                          </div>

                          {st.required_documents && st.required_documents.length > 0 && (
                            <div className="flex flex-wrap gap-1 pt-1">
                              {st.required_documents.map((rd, rIdx) => (
                                <span key={rIdx} className="px-1.5 py-0.5 rounded bg-amber-100/70 dark:bg-amber-950/70 text-amber-900 dark:text-amber-200 text-[9px] font-bold border border-amber-300/50">
                                  📄 {rd}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Overall Required Docs Overview */}
                <div className="pt-2 text-xs space-y-1">
                  <span className="text-slate-400 font-bold block mb-1">
                    {t('إجمالي المستندات المطلوبة', 'Total Required Docs')} ({srv.required_documents.length}):
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {srv.required_documents.map((d, i) => (
                      <span key={i} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-bold">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>{d}</span>
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={() => openEditModal(srv)}
                className="w-full py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-extrabold text-xs hover:bg-slate-200 dark:hover:bg-slate-700 transition flex items-center justify-center gap-1.5"
              >
                <Sliders className="w-3.5 h-3.5 text-emerald-600" />
                <span>{t('تعديل الخدمة وتصميم مسار خطواتها', 'Edit Service & Steps Workflow')}</span>
              </button>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Service Modal with Step Workflow Designer */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingService ? t('تعديل الخدمة وتصميم خطواتها ومستنداتها', 'Edit Service & Step Workflow') : t('إضافة خدمة وتصميم خطواتها الإجرائية', 'Add Service & Step Workflow')}
        subtitle={editingService?.name_ar || t('خدمة حكومية جديدة', 'New Service')}
        maxWidth="4xl"
      >
        <form onSubmit={handleSubmit} className="space-y-6 text-xs font-sans">
          {/* Tabs: Basic Info vs Step Workflow Designer */}
          <div className="flex border-b border-slate-200 dark:border-slate-800 gap-2 pb-1">
            <button
              type="button"
              onClick={() => setModalTab('info')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition font-extrabold ${
                modalTab === 'info'
                  ? 'bg-emerald-900 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Briefcase className="w-4 h-4 text-gold-400" />
              <span>{t('البيانات الأساسية والرسوم', 'Basic Info & Fees')}</span>
            </button>

            <button
              type="button"
              onClick={() => setModalTab('workflow')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition font-extrabold ${
                modalTab === 'workflow'
                  ? 'bg-emerald-900 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <ListTodo className="w-4 h-4 text-gold-400" />
              <span>{t('تصميم مسار الخطوات والجدول الزمني والمستندات', 'Step Workflow & Docs Designer')} ({formData.workflow_steps.length})</span>
            </button>
          </div>

          {/* TAB 1: Basic Info */}
          {modalTab === 'info' && (
            <div className="space-y-4 animate-fade-in">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold mb-1">{t('اسم الخدمة بالعربية', 'Arabic Name')} *</label>
                  <input
                    type="text"
                    required
                    value={formData.name_ar}
                    onChange={e => setFormData({ ...formData, name_ar: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold mb-1">{t('اسم الخدمة بالإنجليزية', 'English Name')}</label>
                  <input
                    type="text"
                    value={formData.name_en}
                    onChange={e => setFormData({ ...formData, name_en: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold mb-1">{t('التصنيف', 'Category')} *</label>
                  <select
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold"
                  >
                    <option value="التراخيص المحليات">التراخيص المحليات</option>
                    <option value="التراخيص والهندسة">التراخيص والهندسة</option>
                    <option value="المرافق والخدمات">المرافق والخدمات</option>
                    <option value="تراخيص مهنية وتخصصية">تراخيص مهنية وتخصصية</option>
                    <option value="خدمات الاستثمار والشركات">خدمات الاستثمار والشركات</option>
                    <option value="الخدمات الحكومية الجماهيرية">الخدمات الحكومية الجماهيرية</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold mb-1">{t('الرسوم الافتراضية (ج.م)', 'Default Fee')} *</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={formData.default_fee}
                    onChange={e => setFormData({ ...formData, default_fee: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold mb-1">{t('إجمالي مدة الإنجاز (أيام)', 'Total Estimated Days')} *</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={formData.estimated_days}
                    onChange={e => setFormData({ ...formData, estimated_days: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold mb-1">{t('قائمة المستندات العامة المطلوبة (مفصولة بفاصلة ,)', 'Overall Required Docs (comma separated)')} *</label>
                <textarea
                  rows={3}
                  required
                  value={formData.required_documents_str}
                  onChange={e => setFormData({ ...formData, required_documents_str: e.target.value })}
                  placeholder="صورة بطاقة الرقم القومي, عقد الملكية, الرسم الهندسي..."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold"
                />
              </div>

              <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 flex items-center justify-between">
                <span>{t('يمكنك الانتقال لتبويب "تصميم مسار الخطوات" لتخصيص كل خطوة ومستنداتها ومدتها بالتفصيل.', 'Switch to "Step Workflow Designer" to configure each step and docs in detail.')}</span>
                <button
                  type="button"
                  onClick={() => setModalTab('workflow')}
                  className="px-3.5 py-1.5 rounded-xl bg-amber-600 text-white font-black hover:bg-amber-700 transition"
                >
                  {t('الانتقال للمسار ←', 'Go to Steps Designer →')}
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: Step Workflow Designer */}
          {modalTab === 'workflow' && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                <div>
                  <span className="font-extrabold text-slate-900 dark:text-white block text-sm">
                    {t('تصميم خطوات تنفيذ هذه الخدمة ومستندات كل مرحلة', 'Design Service Execution Steps & Per-Step Docs')}
                  </span>
                  <span className="text-slate-500 font-medium text-[11px]">
                    {t('أي طلب جديد يتم فتحه لهذه الخدمة سيرث هذه الخطوات والجدول الزمني تلقائياً', 'Any new request under this service will automatically inherit these steps')}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleAddStepToForm}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-900 hover:bg-emerald-800 text-white font-black shadow-sm transition hover:scale-105"
                >
                  <Plus className="w-4 h-4 text-gold-400" />
                  <span>{t('إضافة خطوة جديدة', 'Add Step')}</span>
                </button>
              </div>

              {/* Steps List */}
              <div className="space-y-3 max-h-[50vh] overflow-y-auto pe-1">
                {formData.workflow_steps.map((st, idx) => (
                  <div key={st.id || idx} className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2 flex-1 min-w-[200px]">
                        <span className="w-6 h-6 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-900 dark:text-emerald-300 font-mono font-bold flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>
                        <input
                          type="text"
                          required
                          value={st.title}
                          onChange={e => handleStepFieldChange(idx, 'title', e.target.value)}
                          placeholder="عنوان الخطوة (مثال: المعاينة الهندسية)"
                          className="flex-1 px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-extrabold text-slate-900 dark:text-white"
                        />
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-800 px-2.5 py-1 rounded-xl border border-slate-200 dark:border-slate-700">
                          <Clock className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-[11px] text-slate-400">المدة:</span>
                          <input
                            type="number"
                            min={1}
                            max={60}
                            value={st.estimated_days}
                            onChange={e => handleStepFieldChange(idx, 'estimated_days', Math.max(1, Number(e.target.value)))}
                            className="w-10 px-1 text-center font-mono font-black text-emerald-700 dark:text-emerald-400 bg-white dark:bg-slate-900 border rounded"
                          />
                          <span className="text-[11px] text-slate-400">يوم</span>
                        </div>

                        {/* Reorder & Delete */}
                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={() => handleMoveStep(idx, 'up')}
                          className="p-1 rounded-lg border hover:bg-slate-100 disabled:opacity-30"
                          title="تحريك للأعلى"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          disabled={idx === formData.workflow_steps.length - 1}
                          onClick={() => handleMoveStep(idx, 'down')}
                          className="p-1 rounded-lg border hover:bg-slate-100 disabled:opacity-30"
                          title="تحريك للأسفل"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveStepFromForm(idx)}
                          className="p-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100"
                          title="حذف الخطوة"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Step Description */}
                    <div>
                      <input
                        type="text"
                        value={st.description || ''}
                        onChange={e => handleStepFieldChange(idx, 'description', e.target.value)}
                        placeholder="وصف الإجراء أو التعليمات المطلوب اتباعها في هذه المرحلة..."
                        className="w-full px-3 py-1 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 text-[11px]"
                      />
                    </div>

                    {/* Per-step Required Documents */}
                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1.5">
                      <span className="font-extrabold text-[11px] text-slate-700 dark:text-slate-300 block">
                        {t('المستندات المطلوبة خصيصاً لهذه المرحلة:', 'Required Documents for this Step:')}
                      </span>

                      <div className="flex flex-wrap gap-1.5">
                        {st.required_documents?.map((rd, rIdx) => (
                          <span key={rIdx} className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-amber-50 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200 font-bold text-[10px]">
                            <Tag className="w-3 h-3 text-amber-600" />
                            <span>{rd}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveDocFromStep(idx, rd)}
                              className="ms-1 hover:text-rose-600 text-amber-600"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ))}

                        {(!st.required_documents || st.required_documents.length === 0) && (
                          <span className="text-slate-400 text-[10px] italic">
                            {t('لا توجد مستندات معينة ملزمة لهذه الخطوة', 'No specific docs required')}
                          </span>
                        )}
                      </div>

                      {/* Add Doc to Step Input */}
                      <div className="flex gap-2 pt-1">
                        <input
                          type="text"
                          placeholder="اكتب مستنداً مطلوباً لهذه الخطوة..."
                          value={activeStepDocInput[idx] || ''}
                          onChange={e => setActiveStepDocInput({ ...activeStepDocInput, [idx]: e.target.value })}
                          onKeyDown={e => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddDocToStep(idx, activeStepDocInput[idx] || '');
                            }
                          }}
                          className="flex-1 px-2.5 py-1 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold"
                        />
                        <button
                          type="button"
                          onClick={() => handleAddDocToStep(idx, activeStepDocInput[idx] || '')}
                          className="px-3 py-1 rounded-xl bg-slate-800 text-white font-bold text-xs hover:bg-slate-700"
                        >
                          {t('إضافة مستند', 'Add Doc')}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Modal Footer */}
          <div className="flex justify-between items-center pt-3 border-t border-slate-100 dark:border-slate-800">
            <span className="text-slate-400 font-mono text-[11px]">
              {formData.workflow_steps.length} {t('خطوات', 'steps')} • {formData.estimated_days} {t('أيام إجمالية', 'total days')}
            </span>

            <div className="flex gap-2">
              <button 
                type="button" 
                onClick={() => setIsModalOpen(false)} 
                className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 font-bold"
              >
                {t('إلغاء', 'Cancel')}
              </button>
              <button 
                type="submit" 
                className="px-6 py-2 rounded-xl bg-emerald-900 hover:bg-emerald-800 text-white font-black shadow-md transition"
              >
                {t('حفظ الخدمة ومسارها', 'Save Service & Workflow')}
              </button>
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
};
