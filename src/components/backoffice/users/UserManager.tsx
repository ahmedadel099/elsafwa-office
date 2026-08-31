import React, { useState } from 'react';
import { UserCheck, Plus, Shield, Building, Mail, Phone } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { useData } from '../../../context/DataContext';
import { useLanguage } from '../../../context/LanguageContext';
import { Profile, UserRole } from '../../../types';
import { Modal } from '../../common/Modal';

export const UserManager: React.FC = () => {
  const { allProfiles, allBranches } = useAuth();
  const { saveProfile } = useData();
  const { t } = useLanguage();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProfile, setEditingProfile] = useState<Profile | null>(null);

  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    branch_id: allBranches[0]?.id || 'br-minya-el-qamh',
    role: 'employee' as UserRole
  });

  const openAddModal = () => {
    setEditingProfile(null);
    setFormData({
      full_name: '',
      email: '',
      phone: '',
      branch_id: allBranches[0]?.id || 'br-minya-el-qamh',
      role: 'employee'
    });
    setIsModalOpen(true);
  };

  const openEditModal = (p: Profile) => {
    setEditingProfile(p);
    setFormData({
      full_name: p.full_name,
      email: p.email,
      phone: p.phone,
      branch_id: p.branch_id,
      role: p.role
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveProfile({
      id: editingProfile?.id,
      full_name: formData.full_name.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      branch_id: formData.branch_id,
      role: formData.role
    });
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-emerald-600" />
            {t('إدارة موظفي المنظومة والأدوار والصلاحيات', 'Staff & User Roles Management')}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
            {t('إضافة موظف، تخصيص الفرع، وتحديد صلاحيات الأدوار (أدمن / مدير فرع / موظف تنفيذ)', 'Assign user roles, branch scoping, and staff profiles')}
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-emerald-900 hover:bg-emerald-800 text-white font-extrabold text-xs shadow-md transition"
        >
          <Plus className="w-4 h-4 text-gold-400" />
          <span>{t('إضافة موظف جديد', 'Add New Staff User')}</span>
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden text-xs">
        <table className="w-full text-start">
          <thead className="bg-slate-100 dark:bg-slate-950 text-slate-500 dark:text-slate-400 font-extrabold border-b border-slate-200 dark:border-slate-800">
            <tr>
              <th className="p-4 text-start">{t('اسم الموظف', 'Name')}</th>
              <th className="p-4 text-start">{t('البريد والهاتف', 'Contact')}</th>
              <th className="p-4 text-start">{t('الفرع المسند', 'Assigned Branch')}</th>
              <th className="p-4 text-start">{t('الدور والصلاحية', 'Role')}</th>
              <th className="p-4 text-end">{t('إجراءات', 'Actions')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
            {allProfiles.map(p => {
              const bObj = allBranches.find(b => b.id === p.branch_id);
              return (
                <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="p-4 font-extrabold text-slate-900 dark:text-white">
                    {p.full_name}
                  </td>
                  <td className="p-4 font-mono">
                    <div>{p.email}</div>
                    <div className="text-slate-400">{p.phone}</div>
                  </td>
                  <td className="p-4 font-bold text-slate-700 dark:text-slate-300">
                    {bObj?.name_ar || 'منيا القمح'}
                  </td>
                  <td className="p-4">
                    <span className={`px-2.5 py-0.5 rounded-xl font-bold text-[10px] ${
                      p.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                      p.role === 'branch_manager' ? 'bg-blue-100 text-blue-800' :
                      'bg-emerald-100 text-emerald-800'
                    }`}>
                      {p.role === 'admin' ? 'مدير عام (Admin)' : p.role === 'branch_manager' ? 'مدير فرع' : 'موظف تنفيذ'}
                    </span>
                  </td>
                  <td className="p-4 text-end">
                    <button
                      onClick={() => openEditModal(p)}
                      className="px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 font-bold hover:bg-slate-200 transition"
                    >
                      {t('تعديل', 'Edit')}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingProfile ? t('تعديل موظف', 'Edit User') : t('إضافة موظف جديد', 'Add User')}
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold mb-1">{t('الاسم بالكامل', 'Full Name')} *</label>
            <input
              type="text"
              required
              value={formData.full_name}
              onChange={e => setFormData({ ...formData, full_name: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold mb-1">{t('البريد الإلكتروني', 'Email')} *</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono font-bold"
              />
            </div>

            <div>
              <label className="block font-bold mb-1">{t('رقم الهاتف', 'Phone')} *</label>
              <input
                type="tel"
                required
                value={formData.phone}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono font-bold"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold mb-1">{t('الدور / الصلاحية', 'Role')} *</label>
              <select
                value={formData.role}
                onChange={e => setFormData({ ...formData, role: e.target.value as UserRole })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold"
              >
                <option value="admin">مدير عام للنظام (Admin)</option>
                <option value="branch_manager">مدير فرع (Branch Manager)</option>
                <option value="employee">موظف تنفيذ (Employee)</option>
              </select>
            </div>

            <div>
              <label className="block font-bold mb-1">{t('الفرع المسند', 'Branch')} *</label>
              <select
                value={formData.branch_id}
                onChange={e => setFormData({ ...formData, branch_id: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold"
              >
                {allBranches.map(b => (
                  <option key={b.id} value={b.id}>{b.name_ar}</option>
                ))}
              </select>
            </div>
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
