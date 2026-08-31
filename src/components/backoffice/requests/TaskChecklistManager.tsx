import React, { useState, useEffect } from 'react';
import { CheckSquare, Square, Plus, CheckCircle2, ListTodo, Progress } from 'lucide-react';
import { useLanguage } from '../../../context/LanguageContext';
import { RequestRecord } from '../../../types';

interface TaskItem {
  id: string;
  title: string;
  is_completed: boolean;
  completed_at?: string;
}

interface TaskChecklistManagerProps {
  request: RequestRecord;
}

export const TaskChecklistManager: React.FC<TaskChecklistManagerProps> = ({ request }) => {
  const { t } = useLanguage();
  const storageKey = `ELSafwa_Tasks_${request.id}`;

  const defaultTasksForService = (): TaskItem[] => [
    { id: 't1', title: 'مراجعة أصل عقد الأرض / العقار أو عقد الإيجار', is_completed: true, completed_at: '2026-02-02' },
    { id: 't2', title: 'فحص البطاقة الضريبية واستخراج السجل التجاري المعاين', is_completed: true, completed_at: '2026-02-03' },
    { id: 't3', title: 'مراجعة واستلام الرسم الهندسي المعاين من الاستشاري', is_completed: false },
    { id: 't4', title: 'تقديم الملف رسمياً لمجلس المدينة وقسم التراخيص', is_completed: false },
    { id: 't5', title: 'تحديد واستكمال معاينة الحماية المدنية والسلامة والصحة المهنية', is_completed: false },
    { id: 't6', title: 'طباعة واستلام ترخيص المعاملة النهائي المعتمد', is_completed: false }
  ];

  const [tasks, setTasks] = useState<TaskItem[]>(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error(e);
    }
    return defaultTasksForService();
  });

  const [newTaskTitle, setNewTaskTitle] = useState('');

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(tasks));
    } catch (e) {
      console.error(e);
    }
  }, [tasks, storageKey]);

  const toggleTask = (taskId: string) => {
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        return {
          ...t,
          is_completed: !t.is_completed,
          completed_at: !t.is_completed ? new Date().toISOString().split('T')[0] : undefined
        };
      }
      return t;
    }));
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    const newTask: TaskItem = {
      id: `task-${Date.now()}`,
      title: newTaskTitle.trim(),
      is_completed: false
    };

    setTasks(prev => [...prev, newTask]);
    setNewTaskTitle('');
  };

  const completedCount = tasks.filter(t => t.is_completed).length;
  const totalCount = tasks.length;
  const progressPercent = totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);

  return (
    <div className="space-y-5 p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
      {/* Header & Completion Progress Bar */}
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h4 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <ListTodo className="w-4 h-4 text-emerald-600" />
              {t('قائمة خطوات ومهمات تنفيذ المعاملة (Done vs Pending Checklist)', 'Execution Task Checklist')}
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
              {t(`نسبة الإنجاز الإجرائي: ${progressPercent}% - تم تنفيذ ${completedCount} من أصل ${totalCount} مهمات`, `Progress: ${progressPercent}% (${completedCount}/${totalCount} Tasks Done)`)}
            </p>
          </div>

          <span className={`px-3 py-1 rounded-full text-xs font-black font-mono ${progressPercent === 100 ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-gold-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300'}`}>
            {progressPercent}%
          </span>
        </div>

        {/* Dynamic Progress Bar */}
        <div className="w-full h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
          <div 
            className="h-full bg-emerald-600 transition-all duration-500 rounded-full"
            style={{ width: `${progressPercent}%` }}
          ></div>
        </div>
      </div>

      {/* Task List Items */}
      <div className="space-y-2 text-xs font-medium">
        {tasks.map((task) => (
          <div 
            key={task.id}
            onClick={() => toggleTask(task.id)}
            className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 cursor-pointer ${
              task.is_completed
                ? 'bg-emerald-50/60 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/60 text-slate-900 dark:text-slate-100'
                : 'bg-slate-50 dark:bg-slate-950/60 border-slate-200/60 dark:border-slate-800/60 text-slate-700 dark:text-slate-300 hover:border-emerald-400'
            }`}
          >
            <div className="flex items-center gap-3">
              {task.is_completed ? (
                <CheckSquare className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              ) : (
                <Square className="w-4 h-4 text-slate-400 shrink-0" />
              )}

              <span className={task.is_completed ? 'line-through text-slate-500 dark:text-slate-400 font-bold' : 'font-bold'}>
                {task.title}
              </span>
            </div>

            {task.is_completed && task.completed_at && (
              <span className="text-[10px] font-mono text-emerald-700 dark:text-emerald-400 font-bold">
                ✓ تم: {task.completed_at}
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Add Custom Task Item Form */}
      <form onSubmit={handleAddTask} className="flex gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
        <input
          type="text"
          placeholder={t('إضافة مهمة إجرائية جديدة للطلب...', 'Add custom task...')}
          value={newTaskTitle}
          onChange={e => setNewTaskTitle(e.target.value)}
          className="flex-1 px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-bold focus:outline-none"
        />
        <button
          type="submit"
          className="px-4 py-2 rounded-xl bg-emerald-900 text-white font-extrabold text-xs hover:bg-emerald-800 transition shadow-sm flex items-center gap-1 shrink-0"
        >
          <Plus className="w-4 h-4 text-gold-400" />
          <span>{t('إضافة', 'Add')}</span>
        </button>
      </form>
    </div>
  );
};
