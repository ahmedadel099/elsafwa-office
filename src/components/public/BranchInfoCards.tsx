import React from 'react';
import { Building, MapPin, PhoneCall, Clock, CheckCircle } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useLanguage } from '../../context/LanguageContext';

export const BranchInfoCards: React.FC = () => {
  const { branches } = useData();
  const { t } = useLanguage();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-gold-500"></span>
          {t('فروع ومكاتب شركة الصفوة بمحافظة الشرقية', 'El Safwa Branch Offices in Sharqia')}
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
          {t('يمكنكم زيارة أقرب فرع لتقديم أصول المستندات أو استلام التراخيص المعتمدة', 'Visit our nearest office location or reach out via hotline')}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {branches.map(b => (
          <div 
            key={b.id} 
            className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all duration-200 relative overflow-hidden"
          >
            <div className="absolute top-0 end-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none"></div>

            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-900 text-gold-400 flex items-center justify-center shrink-0 shadow-md">
                <Building className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-lg text-slate-900 dark:text-white leading-snug">
                  {t(b.name_ar, b.name_en)}
                </h3>
                <span className="inline-block mt-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                  {b.city}
                </span>
              </div>
            </div>

            <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300 pt-3 border-t border-slate-100 dark:border-slate-800 font-medium">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>{b.address}</span>
              </div>

              <div className="flex items-center gap-2.5">
                <PhoneCall className="w-4 h-4 text-emerald-600 shrink-0" />
                <div className="flex flex-wrap gap-2 font-mono font-bold text-slate-900 dark:text-white">
                  {b.phones.map((phone, idx) => (
                    <a key={idx} href={`tel:${phone}`} className="hover:text-emerald-600 transition underline">
                      {phone}
                    </a>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2.5 text-slate-400">
                <Clock className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{t('مواعيد العمل: يومياً من ٩ صباحاً حتى ٦ مساءً (ما عدا الجمعة)', 'Working Hours: Daily 9 AM - 6 PM (Except Friday)')}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
