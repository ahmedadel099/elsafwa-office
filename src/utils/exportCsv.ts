// Export Filtered Requests to CSV with UTF-8 BOM for Microsoft Excel Arabic Support

import { RequestRecord } from '../types';
import { STATUS_META, PRIORITY_META } from './formatters';

export function exportRequestsToCSV(requests: RequestRecord[], filename = 'تقرير_طلبات_شركة_الصفوة.csv') {
  if (!requests || requests.length === 0) {
    alert('لا يوجد طلبات لتصديرها');
    return;
  }

  const headers = [
    'رقم التتبع',
    'اسم العميل',
    'رقم الهاتف',
    'الرقم القومي',
    'نوع الخدمة',
    'الفرع',
    'الحالة الحالية',
    'الأولوية',
    'تاريخ الاستلام',
    'المستهدف',
    'إجمالي الرسوم',
    'المسدد',
    'المتبقي',
    'الموظف المسؤول',
    'رقم الجهة الحكومية',
    'رقم السجل الداخلي'
  ];

  const rows = requests.map(r => [
    r.tracking_ref,
    r.client_name || '',
    r.client_phone || '',
    r.client_national_id || '',
    r.service_name_ar || '',
    r.branch_name_ar || '',
    STATUS_META[r.status]?.label_ar || r.status,
    PRIORITY_META[r.priority]?.label_ar || r.priority,
    r.received_date || '',
    r.target_date || '',
    r.total_fee || 0,
    r.paid_amount || 0,
    r.balance_due || 0,
    r.assigned_employee_name || '',
    r.govt_ref || '',
    r.office_ref || ''
  ]);

  // Add UTF-8 BOM byte sequence (\uFEFF)
  const csvContent = '\uFEFF' + [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
  ].join('\r\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
