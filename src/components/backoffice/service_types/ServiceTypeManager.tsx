import React, { useState } from 'react';
import { Briefcase, Plus, Edit2, CheckCircle2, Clock, DollarSign } from 'lucide-react';
import { useData } from '../../../context/DataContext';
import { useLanguage } from '../../../context/LanguageContext';
import { ServiceType } from '../../../types';
import { Modal } from '../../common/Modal';
import { formatCurrency } from '../../../utils/formatters';

export const ServiceTypeManager: React.FC = () => {
  const { serviceTypes, saveServiceType } = useData();
  const { t } = useLanguage();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<ServiceType | null>(null);

  const [formData, setFormData] = useState({
    name_ar: '',
    name_en: '',
    category: 'التراخيص المحليات',
    default_fee: 3000,
    estimated_days: 10,
    required_documents_str: ''
  });

  const openAddModal = () => {
    setEditingService(null);
    setFormData({
      name_ar: '',
      name_en: '',
      category: 'التراخيص المحليات',
      default_fee: 3000,
      estimated_days: 10,
      required_documents_str: 'صورة بطاقة الرقم القومي, عقد الملكية المسجل, الرسم الهندسي'
    });
    setIsModalOpen(true);
  };

  const openEditModal = (srv: ServiceType) => {
    setEditingService(srv);
    setFormData({
      name_ar: srv.name_ar,
      name_en: srv.name_en,
      category: srv.category,
      default_fee: srv.default_fee,
      estimated_days: srv.estimated_days,
      required_documents_str: srv.required_documents.join(', ')
    });
    setIsModalOpen(true);
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
      required_documents: docs
    });

    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-emerald-600" />
            {t('دليل أنواع الخدمات وقائمة الرسوم والمستندات', 'Service Types & Fee Catalog')}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
            {t('إدارة التراخيص المتاحة، الرسوم الافتراضية، وقائمة المستندات المطلوبة مسبقاً لكل خدمة', 'Manage services, default base fees, and document checklists')}
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-emerald-900 hover:bg-emerald-800 text-white font-extrabold text-xs shadow-md transition"
        >
          <Plus className="w-4 h-4 text-gold-400" />
          <span>{t('إضافة نوع خدمة جديد', 'Add New Service Type')}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {serviceTypes.map(srv => (
          <div key={srv.id} className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                  {srv.category}
                </span>
                <span className="text-xs font-bold text-slate-400 flex items-center gap-1 font-mono">
                  <Clock className="w-3.5 h-3.5" />
                  {srv.estimated_days} يوم
                </span>
              </div>

              <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                {srv.name_ar}
              </h3>
              <div className="text-xs font-mono font-bold text-emerald-700 dark:text-emerald-400 mt-1">
                الرسوم: {formatCurrency(srv.default_fee)}
              </div>

              <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs space-y-1">
                <span className="text-slate-400 font-bold block mb-1">المستندات المطلوبة ({srv.required_documents.length}):</span>
                {srv.required_documents.map((d, i) => (
                  <div key={i} className="text-slate-600 dark:text-slate-300 font-medium flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>{d}</span>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => openEditModal(srv)}
              className="w-full py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-200 transition flex items-center justify-center gap-1.5"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>{t('تعديل بيانات الخدمة', 'Edit Service')}</span>
            </button>
          </div>
        ))}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingService ? t('تعديل خدمة حكومية', 'Edit Service Type') : t('إضافة خدمة حكومية جديدة', 'Add Service Type')}
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
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

          <div className="grid grid-cols-2 gap-3">
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
              <label className="block font-bold mb-1">{t('مدة الإنجاز المتوقعة (أيام)', 'Estimated Days')} *</label>
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
            <label className="block font-bold mb-1">{t('قائمة المستندات المطلوبة (مفصولة بفاصلة ,)', 'Required Docs (comma separated)')} *</label>
            <textarea
              rows={3}
              required
              value={formData.required_documents_str}
              onChange={e => setFormData({ ...formData, required_documents_str: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded-xl border font-bold">
              {t('إلغاء', 'Cancel')}
            </button>
            <button type="submit" className="px-6 py-2 rounded-xl bg-emerald-900 text-white font-bold">
              {t('حفظ', 'Save')}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
