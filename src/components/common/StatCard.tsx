import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  colorTheme?: 'emerald' | 'gold' | 'sapphire' | 'amber' | 'rose' | 'purple';
  trend?: string;
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  colorTheme = 'emerald',
  trend,
  onClick
}) => {
  const themeStyles = {
    emerald: {
      bg: 'bg-emerald-50 dark:bg-emerald-950/40',
      border: 'border-emerald-200 dark:border-emerald-800/60',
      iconBg: 'bg-emerald-800 text-gold-400',
      valueText: 'text-emerald-950 dark:text-emerald-300'
    },
    gold: {
      bg: 'bg-amber-50 dark:bg-amber-950/30',
      border: 'border-amber-200 dark:border-amber-800/60',
      iconBg: 'bg-gold-500 text-slate-950',
      valueText: 'text-amber-950 dark:text-amber-300'
    },
    sapphire: {
      bg: 'bg-blue-50 dark:bg-blue-950/40',
      border: 'border-blue-200 dark:border-blue-800/60',
      iconBg: 'bg-blue-800 text-white',
      valueText: 'text-blue-950 dark:text-blue-300'
    },
    amber: {
      bg: 'bg-orange-50 dark:bg-orange-950/40',
      border: 'border-orange-200 dark:border-orange-800/60',
      iconBg: 'bg-orange-600 text-white',
      valueText: 'text-orange-950 dark:text-orange-300'
    },
    rose: {
      bg: 'bg-rose-50 dark:bg-rose-950/40',
      border: 'border-rose-200 dark:border-rose-800/60',
      iconBg: 'bg-rose-700 text-white',
      valueText: 'text-rose-950 dark:text-rose-300'
    },
    purple: {
      bg: 'bg-purple-50 dark:bg-purple-950/40',
      border: 'border-purple-200 dark:border-purple-800/60',
      iconBg: 'bg-purple-800 text-white',
      valueText: 'text-purple-950 dark:text-purple-300'
    }
  }[colorTheme];

  return (
    <div 
      onClick={onClick}
      className={`p-4 rounded-2xl border ${themeStyles.bg} ${themeStyles.border} shadow-sm transition-all duration-200 ${onClick ? 'cursor-pointer hover:-translate-y-0.5 hover:shadow-md' : ''}`}
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 block mb-1">
            {title}
          </span>
          <div className={`text-2xl font-extrabold tracking-tight ${themeStyles.valueText}`}>
            {value}
          </div>
          {subtitle && (
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-medium">
              {subtitle}
            </p>
          )}
        </div>

        <div className={`w-11 h-11 rounded-xl ${themeStyles.iconBg} flex items-center justify-center shadow-sm shrink-0`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      {trend && (
        <div className="mt-3 pt-2 border-t border-slate-200/60 dark:border-slate-800/60 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
          {trend}
        </div>
      )}
    </div>
  );
};
