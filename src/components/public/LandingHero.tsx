import React from 'react';
import { 
  Award, 
  PhoneCall, 
  MapPin, 
  Search, 
  PlusCircle, 
  ShieldCheck
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

interface LandingHeroProps {
  onNavigateToForm: () => void;
  onNavigateToTracker: () => void;
}

export const LandingHero: React.FC<LandingHeroProps> = ({ onNavigateToForm, onNavigateToTracker }) => {
  const { t } = useLanguage();

  return (
    <div className="rounded-3xl bg-slate-900 text-white dark:bg-[#111827] p-8 md:p-12 border border-slate-800 shadow-xl mb-10">
      <div className="max-w-4xl space-y-6">
        {/* Verified License Badge */}
        <div className="inline-flex items-center gap-2 bg-slate-800 border border-slate-700 text-amber-400 px-3.5 py-1.5 rounded-xl text-xs font-bold">
          <Award className="w-4 h-4 text-amber-400" />
          <span>{t('شركة الصفوة للخدمات الحكومية (ترخيص ٦٧٩ - مجموعة ب)', 'El Safwa Public Services Company (License No. 679 Group B)')}</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight text-white">
          {t('البوابة الإلكترونية الموحدة لتقديم ومتابعة المعاملات والتراخيص', 'Unified Public Portal for Government Licensing & Services')}
        </h1>

        <p className="text-slate-300 text-sm md:text-base leading-relaxed max-w-2xl font-medium">
          {t(
            'يسر شركة الصفوة تقديم كافة خدمات التراخيص، تصاريح البناء، مرافق الكهرباء والمياه، التأسيس، والتأمينات بمحافظة الشرقية (منيا القمح والعزيزية) بسهولة وشفافية متناهية.',
            'El Safwa Office provides complete government licensing, building permits, utility connections, company formation, and insurance services in Sharqia with speed and transparency.'
          )}
        </p>

        {/* Hero Action CTA Buttons */}
        <div className="flex flex-wrap items-center gap-4 pt-2">
          <button
            onClick={onNavigateToForm}
            className="flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-sm shadow-md transition"
          >
            <PlusCircle className="w-5 h-5" />
            <span>{t('تقديم طلب جديد الآن', 'Submit New Request')}</span>
          </button>

          <button
            onClick={onNavigateToTracker}
            className="flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm border border-slate-700 transition"
          >
            <Search className="w-5 h-5 text-amber-400" />
            <span>{t('متابعة حالة طلب سابق برقم التتبع', 'Track Existing Request')}</span>
          </button>
        </div>

        {/* Highlight Feature Badges */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-slate-800 text-xs">
          <div className="flex items-center gap-3 bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
            <div className="w-9 h-9 rounded-lg bg-emerald-950 text-emerald-400 flex items-center justify-center shrink-0 font-bold border border-emerald-800">
              <PhoneCall className="w-4 h-4" />
            </div>
            <div>
              <div className="font-extrabold text-white">{t('خدمة العملاء', 'Customer Hotline')}</div>
              <div className="font-mono text-amber-400 mt-0.5 font-bold">01115345157 / 01020384273</div>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
            <div className="w-9 h-9 rounded-lg bg-emerald-950 text-emerald-400 flex items-center justify-center shrink-0 font-bold border border-emerald-800">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <div className="font-extrabold text-white">{t('المقر والفرع الرئيسي', 'Main Office Location')}</div>
              <div className="text-slate-300 mt-0.5 font-semibold">{t('العزيزية / منيا القمح - الشرقية', 'Aziziyya - Minya El Qamh')}</div>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
            <div className="w-9 h-9 rounded-lg bg-emerald-950 text-emerald-400 flex items-center justify-center shrink-0 font-bold border border-emerald-800">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <div className="font-extrabold text-white">{t('رقم مرجعي لكل معاملة', 'Unique Tracking Reference')}</div>
              <div className="text-slate-300 mt-0.5 font-semibold">{t('تتبع زمني دقيق ولحظي', 'Real-time Status History')}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
