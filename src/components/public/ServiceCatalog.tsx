import React, { useState } from 'react';
import { 
  Building, 
  Zap, 
  FileSpreadsheet, 
  Store, 
  ShieldAlert, 
  Stethoscope, 
  UtensilsCrossed, 
  Briefcase, 
  Factory, 
  Coffee, 
  HeartHandshake, 
  Wrench,
  CheckCircle2,
  Clock,
  ChevronDown,
  ChevronUp,
  ArrowLeft,
  ArrowRight
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useLanguage } from '../../context/LanguageContext';
import { formatCurrency } from '../../utils/formatters';

interface ServiceCatalogProps {
  onSelectServiceToApply: (serviceTypeId: string) => void;
}

export const ServiceCatalog: React.FC<ServiceCatalogProps> = ({ onSelectServiceToApply }) => {
  const { serviceTypes } = useData();
  const { t, dir } = useLanguage();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const getServiceIcon = (nameAr: string) => {
    if (nameAr.includes('بناء') || nameAr.includes('هدم')) return Building;
    if (nameAr.includes('مرافق') || nameAr.includes('كهرباء')) return Zap;
    if (nameAr.includes('رسومات')) return FileSpreadsheet;
    if (nameAr.includes('تجاري')) return Store;
    if (nameAr.includes('تصالح')) return ShieldAlert;
    if (nameAr.includes('طبية') || nameAr.includes('عيادات')) return Stethoscope;
    if (nameAr.includes('فرن') || nameAr.includes('سياحي')) return UtensilsCrossed;
    if (nameAr.includes('شركات') || nameAr.includes('تأسيس')) return Briefcase;
    if (nameAr.includes('صناعية') || nameAr.includes('هيئة')) return Factory;
    if (nameAr.includes('كافيهات')) return Coffee;
    if (nameAr.includes('تأمينات')) return HeartHandshake;
    return Wrench;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-emerald-600"></span>
            {t('دليل التراخيص والخدمات الحكومية المتاحة', 'Available Government Services & Licensing Catalog')}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
            {t('اختر الخدمة المطلوبة للإطلاع على المستندات والرسوم المحددة ثم ابدأ تقديم طلبك إلكترونياً', 'Browse service requirements, estimated timeline, and document checklists')}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {serviceTypes.map(srv => {
          const Icon = getServiceIcon(srv.name_ar);
          const isExpanded = expandedId === srv.id;

          return (
            <div 
              key={srv.id} 
              className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all duration-200 flex flex-col justify-between group"
            >
              <div>
                {/* Header Badge & Category */}
                <div className="flex items-center justify-between gap-2 mb-4">
                  <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60">
                    {srv.category}
                  </span>
                  <span className="text-xs font-bold text-slate-400 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {srv.estimated_days} {t('يوم عمل', 'days')}
                  </span>
                </div>

                {/* Service Icon & Title */}
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-900 text-gold-400 flex items-center justify-center shrink-0 shadow-md group-hover:scale-105 transition-transform">
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base text-slate-900 dark:text-white leading-snug group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                      {t(srv.name_ar, srv.name_en)}
                    </h3>
                    <div className="text-xs font-extrabold text-emerald-800 dark:text-emerald-300 mt-1">
                      {t('الرسوم التقديرية:', 'Estimated Fee:')} {formatCurrency(srv.default_fee)}
                    </div>
                  </div>
                </div>

                {/* Expandable Document Checklist */}
                <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : srv.id)}
                    className="w-full flex items-center justify-between text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-emerald-700 transition py-1"
                  >
                    <span>
                      {t('المستندات المطلوبة للخدمة', 'Required Documents Checklist')} ({srv.required_documents.length})
                    </span>
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-emerald-600" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                  </button>

                  {isExpanded && (
                    <ul className="mt-3 space-y-2 text-xs text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-950/60 p-3 rounded-2xl border border-slate-200/60 dark:border-slate-800/60">
                      {srv.required_documents.map((doc, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                          <span>{doc}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

              {/* Apply Action Button */}
              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => onSelectServiceToApply(srv.id)}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-900 hover:bg-emerald-800 text-white font-extrabold text-xs shadow-md shadow-emerald-950/20 transition hover:scale-[1.02] active:scale-[0.98]"
                >
                  <span>{t('تقديم طلب جديد لهذه الخدمة', 'Apply For Service')}</span>
                  {dir === 'rtl' ? <ArrowLeft className="w-4 h-4 text-gold-400" /> : <ArrowRight className="w-4 h-4 text-gold-400" />}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
