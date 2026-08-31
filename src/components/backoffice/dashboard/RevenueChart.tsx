import React from 'react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Legend 
} from 'recharts';
import { useData } from '../../../context/DataContext';
import { useLanguage } from '../../../context/LanguageContext';
import { STATUS_META, formatCurrency } from '../../../utils/formatters';
import { RequestStatus } from '../../../types';

export const RevenueChart: React.FC = () => {
  const { metrics, branches } = useData();
  const { t } = useLanguage();

  // Status Pie Chart Data
  const pieData = (Object.keys(STATUS_META) as RequestStatus[]).map(statusKey => {
    const count = metrics.statusBreakdown[statusKey] || 0;
    return {
      name: STATUS_META[statusKey].label_ar,
      value: count,
      color: STATUS_META[statusKey].bgLight
    };
  }).filter(d => d.value > 0);

  const COLORS = ['#044E39', '#D4AF37', '#1E3A8A', '#9333EA', '#49DE80', '#F59E0B', '#F43F5E', '#14B8A6'];

  // Branch Comparison Bar Chart Data
  const barData = Object.values(metrics.branchBreakdown).map(b => ({
    name: b.branchName,
    requests: b.count,
    revenue: b.revenue
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Chart 1: Status Distribution Donut Chart */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
          {t('الرسم البياني لتوزيع حالات المعاملات', 'Status Distribution Chart')}
        </h3>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={85}
                paddingAngle={4}
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value: any) => [`${value} معاملات`, 'المجموع']} 
                contentStyle={{ borderRadius: '12px', fontWeight: 'bold', fontSize: '12px' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 text-xs font-bold pt-2 border-t border-slate-100 dark:border-slate-800">
          {pieData.map((entry, idx) => (
            <div key={idx} className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></span>
              <span className="text-slate-600 dark:text-slate-300">{entry.name}: <strong className="font-mono text-slate-900 dark:text-white">{entry.value}</strong></span>
            </div>
          ))}
        </div>
      </div>

      {/* Chart 2: Branch Comparison Bar Chart */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-gold-500"></span>
          {t('مقارنة الطلبات والتحصيل المالي بالفروع', 'Branch Volume & Revenue Chart')}
        </h3>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData} margin={{ top: 20, right: 20, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis dataKey="name" stroke="#64748b" style={{ fontSize: '11px', fontWeight: 'bold' }} />
              <YAxis yAxisId="left" orientation="left" stroke="#044E39" style={{ fontSize: '11px', fontWeight: 'bold' }} />
              <Tooltip 
                formatter={(val: any, name: any) => [
                  name === 'revenue' ? formatCurrency(val) : `${val} معاملة`, 
                  name === 'revenue' ? 'التحصيل' : 'الطلبات'
                ]}
                contentStyle={{ borderRadius: '12px', fontWeight: 'bold', fontSize: '12px' }}
              />
              <Bar yAxisId="left" dataKey="requests" fill="#044E39" radius={[8, 8, 0, 0]} name="عدد المعاملات" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="text-center text-xs font-bold text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
          {t('مقارنة دورية بين الفرع الرئيسي بمنيا القمح وفرع العزيزية', 'Multi-branch comparative breakdown')}
        </div>
      </div>
    </div>
  );
};
