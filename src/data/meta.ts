import {
  Ban,
  BadgeCheck,
  CheckCheck,
  CircleX,
  FileSearch,
  Hourglass,
  Inbox,
  Landmark,
  PackageCheck,
  ScanSearch,
  type LucideIcon,
} from 'lucide-react';
import type { Tone } from '../ui/Badge';
import type { BallInCourt, Channel, PaymentKind, PaymentMethod, Priority, RequestStatus, Role, StepOwner } from './types';

interface StatusMeta {
  label: string;
  /** Wording shown to the client on the public tracking page. */
  publicLabel: string;
  tone: Tone;
  icon: LucideIcon;
  ball: BallInCourt;
}

export const STATUS: Record<RequestStatus, StatusMeta> = {
  new: { label: 'جديد', publicLabel: 'تم استلام طلبك', tone: 'info', icon: Inbox, ball: 'office' },
  under_review: { label: 'مراجعة المستندات', publicLabel: 'جاري مراجعة الأوراق', tone: 'info', icon: FileSearch, ball: 'office' },
  awaiting_client: { label: 'بانتظار العميل', publicLabel: 'مطلوب منك استكمال', tone: 'warning', icon: Hourglass, ball: 'client' },
  submitted: { label: 'مُقدَّم للجهة', publicLabel: 'تم التقديم للجهة المختصة', tone: 'violet', icon: Landmark, ball: 'authority' },
  inspection: { label: 'معاينة / لجنة', publicLabel: 'في مرحلة المعاينة والفحص', tone: 'violet', icon: ScanSearch, ball: 'authority' },
  approved: { label: 'صدرت الموافقة', publicLabel: 'صدرت الموافقة', tone: 'success', icon: BadgeCheck, ball: 'office' },
  ready: { label: 'جاهز للتسليم', publicLabel: 'جاهز للاستلام من الفرع', tone: 'success', icon: PackageCheck, ball: 'client' },
  completed: { label: 'تم التسليم', publicLabel: 'تم التسليم', tone: 'neutral', icon: CheckCheck, ball: 'closed' },
  rejected: { label: 'مرفوض من الجهة', publicLabel: 'تعذّر الإصدار — تواصل معنا', tone: 'danger', icon: CircleX, ball: 'closed' },
  cancelled: { label: 'ملغي', publicLabel: 'تم إلغاء الطلب', tone: 'neutral', icon: Ban, ball: 'closed' },
};

export const STATUS_ORDER: RequestStatus[] = [
  'new',
  'under_review',
  'awaiting_client',
  'submitted',
  'inspection',
  'approved',
  'ready',
  'completed',
  'rejected',
  'cancelled',
];

/** Allowed workflow transitions — the engine rejects anything else. */
export const TRANSITIONS: Record<RequestStatus, RequestStatus[]> = {
  new: ['under_review', 'awaiting_client', 'cancelled'],
  under_review: ['awaiting_client', 'submitted', 'cancelled'],
  awaiting_client: ['under_review', 'submitted', 'cancelled'],
  submitted: ['inspection', 'awaiting_client', 'approved', 'rejected'],
  inspection: ['awaiting_client', 'approved', 'rejected'],
  approved: ['ready'],
  ready: ['completed'],
  rejected: ['under_review', 'cancelled'],
  completed: [],
  cancelled: [],
};

export const BALL: Record<BallInCourt, { label: string; tone: Tone }> = {
  office: { label: 'على المكتب', tone: 'brand' },
  client: { label: 'على العميل', tone: 'warning' },
  authority: { label: 'لدى الجهة', tone: 'violet' },
  closed: { label: 'مغلقة', tone: 'neutral' },
};

export const PRIORITY: Record<Priority, { label: string; tone: Tone }> = {
  normal: { label: 'عادية', tone: 'neutral' },
  high: { label: 'مهمة', tone: 'warning' },
  urgent: { label: 'عاجلة', tone: 'danger' },
};

export const STEP_OWNER: Record<StepOwner, string> = {
  office: 'المكتب',
  client: 'العميل',
  authority: 'الجهة',
};

export const CHANNEL: Record<Channel, string> = {
  walk_in: 'زيارة الفرع',
  online: 'الموقع الإلكتروني',
  phone: 'مكالمة هاتفية',
};

export const PAYMENT_METHOD: Record<PaymentMethod, string> = {
  cash: 'نقدي',
  instapay: 'إنستاباي',
  card: 'بطاقة (POS)',
  wallet: 'محفظة إلكترونية',
  bank_transfer: 'تحويل بنكي',
};

export const PAYMENT_KIND: Record<PaymentKind, { label: string; short: string; tone: Tone }> = {
  office_fee: { label: 'أتعاب الخدمة', short: 'أتعاب', tone: 'brand' },
  gov_fee_deposit: { label: 'أمانة رسوم حكومية', short: 'أمانة رسوم', tone: 'accent' },
};

export const ROLE: Record<Role, { label: string; description: string }> = {
  admin: { label: 'مدير عام', description: 'كل الفروع، إعدادات الخدمات والموظفين والفروع، وسجل النشاط الكامل' },
  branch_manager: { label: 'مدير فرع', description: 'كل معاملات فرعه، الإسناد، إلغاء الإيصالات بعد المراجعة، وسجل نشاط الفرع' },
  employee: { label: 'موظف خدمة', description: 'تسجيل العملاء والمعاملات، الخطوات والمستندات، وتحصيل المبالغ بإيصال' },
  accountant: { label: 'محاسب / خزينة', description: 'الخزينة والإيصالات وصرف الرسوم الحكومية والتقارير المالية' },
};

export type Permission =
  | 'requests.view'
  | 'requests.create'
  | 'requests.update'
  | 'requests.assign'
  | 'requests.export'
  | 'clients.view'
  | 'clients.create'
  | 'clients.reveal_nid'
  | 'documents.upload'
  | 'documents.delete'
  | 'payments.record'
  | 'payments.void'
  | 'disbursements.record'
  | 'treasury.view'
  | 'services.manage'
  | 'users.manage'
  | 'branches.manage'
  | 'audit.view'
  | 'demo.reset';

const ALL: Permission[] = [
  'requests.view',
  'requests.create',
  'requests.update',
  'requests.assign',
  'requests.export',
  'clients.view',
  'clients.create',
  'clients.reveal_nid',
  'documents.upload',
  'documents.delete',
  'payments.record',
  'payments.void',
  'disbursements.record',
  'treasury.view',
  'services.manage',
  'users.manage',
  'branches.manage',
  'audit.view',
  'demo.reset',
];

export const PERMISSIONS: Record<Role, Permission[]> = {
  admin: ALL,
  branch_manager: ALL.filter((p) => !['services.manage', 'users.manage', 'branches.manage', 'demo.reset'].includes(p)),
  employee: [
    'requests.view',
    'requests.create',
    'requests.update',
    'clients.view',
    'clients.create',
    'clients.reveal_nid',
    'documents.upload',
    'payments.record',
    'disbursements.record',
  ],
  accountant: ['requests.view', 'clients.view', 'payments.record', 'disbursements.record', 'treasury.view'],
};

export function can(role: Role, permission: Permission): boolean {
  return PERMISSIONS[role].includes(permission);
}

export const PERMISSION_LABELS: Record<Permission, string> = {
  'requests.view': 'عرض المعاملات',
  'requests.create': 'تسجيل معاملة',
  'requests.update': 'تحديث الحالة والخطوات',
  'requests.assign': 'إسناد المعاملات',
  'requests.export': 'تصدير البيانات',
  'clients.view': 'عرض العملاء',
  'clients.create': 'إضافة عميل',
  'clients.reveal_nid': 'كشف الرقم القومي (مُسجَّل)',
  'documents.upload': 'رفع المستندات',
  'documents.delete': 'حذف مستند',
  'payments.record': 'تحصيل وإصدار إيصال',
  'payments.void': 'إلغاء إيصال',
  'disbursements.record': 'تسجيل صرف رسوم حكومية',
  'treasury.view': 'تقارير الخزينة',
  'services.manage': 'إدارة الخدمات والإجراءات',
  'users.manage': 'إدارة الموظفين',
  'branches.manage': 'إدارة الفروع',
  'audit.view': 'سجل النشاط',
  'demo.reset': 'إعادة ضبط بيانات العرض',
};

export const AUDIT_ACTIONS: Record<string, string> = {
  'auth.login': 'تسجيل دخول',
  'auth.login_failed': 'محاولة دخول فاشلة',
  'auth.locked': 'إيقاف مؤقت للحساب',
  'auth.logout': 'تسجيل خروج',
  'auth.session_expired': 'انتهاء الجلسة لعدم النشاط',
  'client.created': 'إضافة عميل',
  'client.viewed': 'فتح ملف عميل',
  'client.nid_revealed': 'كشف الرقم القومي كاملًا',
  'request.created': 'تسجيل معاملة',
  'request.viewed': 'فتح معاملة',
  'request.status_changed': 'تغيير حالة معاملة',
  'request.step_completed': 'إنجاز خطوة',
  'request.step_reopened': 'إعادة فتح خطوة',
  'request.assigned': 'إسناد معاملة',
  'request.note_added': 'إضافة ملاحظة',
  'document.uploaded': 'رفع مستند',
  'document.viewed': 'عرض مستند',
  'document.deleted': 'حذف مستند',
  'document.original_returned': 'رد أصل للعميل',
  'payment.recorded': 'تحصيل مبلغ',
  'payment.voided': 'إلغاء إيصال',
  'receipt.printed': 'طباعة إيصال',
  'disbursement.recorded': 'صرف رسوم حكومية',
  'export.requests': 'تصدير بيانات المعاملات',
  'service.created': 'إضافة خدمة',
  'service.updated': 'تعديل خدمة',
  'user.created': 'إضافة موظف',
  'user.updated': 'تعديل موظف',
  'branch.created': 'إضافة فرع',
  'branch.updated': 'تعديل فرع',
  'client.updated': 'تعديل بيانات عميل',
  'public.request_submitted': 'طلب جديد من الموقع',
  'public.tracking_viewed': 'استعلام عن طلب',
  'public.tracking_failed': 'استعلام فاشل',
  'audit.verified': 'التحقق من سلامة السجل',
  'demo.reset': 'إعادة ضبط بيانات العرض',
};
