import React, { useState } from 'react';
import { Building, Plus, Edit2, Phone, MapPin, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { useData } from '../../../context/DataContext';
import { useLanguage } from '../../../context/LanguageContext';
import { Branch } from '../../../types';
import { Modal } from '../../common/Modal';

export const BranchManager: React.FC = () => {
  const { allBranches } = useAuth();
  const { saveBranch } = useData();
  const { t } = useLanguage();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);

  const [formData, setFormData] = useState({
    name_ar: '',
    name_en: '',
    city: '',
    address: '',
    phones_str: ''
  });

  const openAddModal = () => {
    setEditingBranch(null);
    setFormData({
      name_ar: '',
      name_en: '',
      city: 'منيا القمح',
      address: '',
      phones_str: '01115345157, 01020384273'
    });
    setIsModalOpen(true);
  };

  const openEditModal = (b: Branch) => {
    setEditingBranch(b);
    setFormData({
      name_ar: b.name_ar,
      name_en: b.name_en,
      city: b.city,
      address: b.address,
      phones_str: b.phones.join(', ')
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const phones = formData.phones_str.split(',').map(p => p.trim()).filter(Boolean);

    saveBranch({
      id: editingBranch?.id,
      name_ar: formData.name_ar.trim(),
      name_en: formData.name_en.trim() || formData.name_ar.trim(),
      city: formData.city.trim(),
      address: formData.address.trim(),
      phones
    });

    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Building className="w-5 h-5 text-emerald-600" />
            {t('إدارة مكاتب وفروع شركة الصفوة', 'Branches Management')}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
            {t('إضافة وتعديل بيانات الفروع، العناوين، وأرقام التليفونات الرسمية المتاحة للجمهور', 'Manage branch locations and hotline phone numbers')}
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-emerald-900 hover:bg-emerald-800 text-white font-extrabold text-xs shadow-md transition"
        >
          <Plus className="w-4 h-4 text-gold-400" />
          <span>{t('إضافة فرع جديد', 'Add New Branch')}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {allBranches.map(b => (
          <div key={b.id} className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-extrabold text-lg text-slate-900 dark:text-white">
                  {b.name_ar}
                </h3>
                <span className="text-xs font-bold text-slate-400">{b.city}</span>
              </div>
              <button
                onClick={() => openEditModal(b)}
                className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-200 transition"
              >
                <Edit2 className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>{b.address}</span>
              </div>

              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="font-mono font-bold">{b.phones.join(' / ')}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingBranch ? t('تعديل بيانات فرع', 'Edit Branch') : t('إضافة فرع جديد', 'Add Branch')}
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold mb-1">{t('اسم الفرع بالعربية', 'Branch Name')} *</label>
            <input
              type="text"
              required
              value={formData.name_ar}
              onChange={e => setFormData({ ...formData, name_ar: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold"
            />
          </div>

          <div>
            <label className="block font-bold mb-1">{t('المدينة / المركز', 'City')} *</label>
            <input
              type="text"
              required
              value={formData.city}
              onChange={e => setFormData({ ...formData, city: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold"
            />
          </div>

          <div>
            <label className="block font-bold mb-1">{t('العنوان التفصيلي', 'Address')} *</label>
            <input
              type="text"
              required
              value={formData.address}
              onChange={e => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold"
            />
          </div>

          <div>
            <label className="block font-bold mb-1">{t('أرقام الهواتف المحمولة (مفصولة بفاصلة ,)', 'Phone numbers (comma separated)')} *</label>
            <input
              type="text"
              required
              value={formData.phones_str}
              onChange={e => setFormData({ ...formData, phones_str: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono font-bold"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded-xl border font-bold">
              {t('إلغاء', 'Cancel')}
            </button>
            <button type="submit" className="px-6 py-2 rounded-xl bg-emerald-900 text-white font-bold">
              {t('حفظ الفرع', 'Save')}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
