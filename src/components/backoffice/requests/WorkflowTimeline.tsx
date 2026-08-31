import React from 'react';
import { Clock, CheckCircle2, User, FileText, ArrowLeft, ArrowRight } from 'lucide-react';
import { useData } from '../../../context/DataContext';
import { useLanguage } from '../../../context/LanguageContext';
import { STATUS_META, formatDateArabic } from '../../../utils/formatters';

interface WorkflowTimelineProps {
  requestId: string;
}

export const WorkflowTimeline: React.FC<WorkflowTimelineProps> = ({ requestId }) => {
  const { getRequestStatusHistory } = useData();
  const { t, dir } = useLanguage();

  const history = getRequestStatusHistory(requestId);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
          <Clock className="w-4 h-4 text-emerald-600" />
          {t('السجل التاريخي غير القابل للتعديل للتغييرات والملاحظات', 'Immutable Audit History Log')}
        </h4>
        <span className="text-xs font-mono font-bold text-slate-400">
          {history.length} {t('تحديثات مسجلة', 'entries')}
        </span>
      </div>

      <div className="relative border-s-2 border-slate-200 dark:border-slate-800 ms-3 space-y-6 py-2">
        {history.map((item, idx) => {
          const meta = STATUS_META[item.to_status];

          return (
            <div key={item.id} className="relative ps-6">
              {/* Dot */}
              <div className="absolute -start-[9px] top-1.5 w-4 h-4 rounded-full bg-emerald-600 border-2 border-white dark:border-slate-900 shadow-sm"></div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/60 dark:border-slate-800/60 space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {item.from_status && (
                      <span className="text-xs text-slate-400 font-bold line-through">
                        {STATUS_META[item.from_status]?.label_ar}
                      </span>
                    )}
                    {item.from_status && (
                      dir === 'rtl' ? <ArrowLeft className="w-3.5 h-3.5 text-slate-400" /> : <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                    )}
                    <span className={`px-2.5 py-0.5 rounded-xl font-extrabold text-xs ${meta?.badgeClass}`}>
                      {meta?.label_ar}
                    </span>
                  </div>

                  <span className="text-[11px] font-mono text-slate-400">
                    {formatDateArabic(item.created_at)}
                  </span>
                </div>

                <p className="text-xs text-slate-700 dark:text-slate-300 font-medium leading-relaxed bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200/60 dark:border-slate-800/60">
                  {item.comment}
                </p>

                <div className="text-[11px] text-slate-400 flex items-center gap-1 font-bold">
                  <User className="w-3 h-3 text-emerald-600" />
                  <span>المسؤول: {item.changed_by_user_name || 'موظف المنظومة'}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
