// Formatters and Constants for El Safwa Office System

import { RequestStatus, RequestPriority, PaymentMethod } from '../types';

// Format Currency to EGP (جنيه مصري)
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('ar-EG', {
    style: 'currency',
    currency: 'EGP',
    maximumFractionDigits: 0
  }).format(amount);
}

// Format Date string to readable Arabic
export function formatDateArabic(dateStr?: string): string {
  if (!dateStr) return 'غير محدد';
  try {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  } catch {
    return dateStr;
  }
}

// Status Meta Definitions (Arabic labels, icons, badge styles)
export const STATUS_META: Record<RequestStatus, {
  label_ar: string;
  label_en: string;
  badgeClass: string;
  bgLight: string;
  stepIndex: number;
}> = {
  new: {
    label_ar: 'طلب جديد',
    label_en: 'New Submission',
    badgeClass: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 border border-blue-200 dark:border-blue-800',
    bgLight: '#eff6ff',
    stepIndex: 1
  },
  under_review: {
    label_ar: 'قيد المراجعة',
    label_en: 'Under Review',
    badgeClass: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 border border-amber-200 dark:border-amber-800',
    bgLight: '#fffbeb',
    stepIndex: 2
  },
  docs_missing: {
    label_ar: 'مستندات ناقصة',
    label_en: 'Documents Missing',
    badgeClass: 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300 border border-orange-200 dark:border-orange-800',
    bgLight: '#fff7ed',
    stepIndex: 2
  },
  submitted_authority: {
    label_ar: 'تم التقديم للجهة',
    label_en: 'Submitted to Authority',
    badgeClass: 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300 border border-purple-200 dark:border-purple-800',
    bgLight: '#faf5ff',
    stepIndex: 3
  },
  under_inspection: {
    label_ar: 'قيد المعاينة',
    label_en: 'Under Inspection',
    badgeClass: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800',
    bgLight: '#eef2ff',
    stepIndex: 4
  },
  approved: {
    label_ar: 'تمت الموافقة',
    label_en: 'Approved',
    badgeClass: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800',
    bgLight: '#ecfdf5',
    stepIndex: 5
  },
  rejected: {
    label_ar: 'مرفوض',
    label_en: 'Rejected',
    badgeClass: 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300 border border-rose-200 dark:border-rose-800',
    bgLight: '#fff1f2',
    stepIndex: 5
  },
  completed: {
    label_ar: 'مكتمل ومستلم',
    label_en: 'Completed',
    badgeClass: 'bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-300 border border-teal-200 dark:border-teal-800 font-bold',
    bgLight: '#f0fdf4',
    stepIndex: 6
  },
  cancelled: {
    label_ar: 'ملغي',
    label_en: 'Cancelled',
    badgeClass: 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-400',
    bgLight: '#f1f5f9',
    stepIndex: 0
  }
};

// Priority Meta Definitions
export const PRIORITY_META: Record<RequestPriority, {
  label_ar: string;
  badgeClass: string;
}> = {
  low: { label_ar: 'عادي', badgeClass: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300' },
  normal: { label_ar: 'متوسط', badgeClass: 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' },
  high: { label_ar: 'مهم', badgeClass: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300' },
  urgent: { label_ar: 'عاجل جداً', badgeClass: 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300 font-bold animate-pulse' }
};

// Payment Method Labels
export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  cash: 'نقداً بالخزينة',
  bank_transfer: 'تحويل بنكي',
  vodafone_cash: 'فودافون كاش / محفظة'
};
