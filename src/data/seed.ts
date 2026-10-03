/*
 * Demo seed. Every name, phone and national-ID number below is FICTIONAL
 * (structurally valid so the validators accept them). Dates are relative to
 * "today" so the dashboard always shows a realistic mix of on-time, due-soon
 * and overdue work.
 */

import { sha256 } from '../lib/sha256';
import { addBusinessDays } from '../lib/format';
import { appendAudit, PUBLIC_ACTOR, type AuditActor } from './audit';
import { SERVICE_CATALOG } from './catalog';
import type {
  Branch,
  Client,
  Credential,
  DatabaseState,
  Disbursement,
  DocumentRecord,
  PaymentRecord,
  PowerOfAttorney,
  Profile,
  RequestEvent,
  RequestRecord,
  RequestStatus,
} from './types';

export const SCHEMA_VERSION = 3;

/** Demo-only credentials (shown on the login page). Production: Argon2id hashes + mandatory MFA. */
export const DEMO_PASSWORD = 'Safwa@2026';
export const DEMO_MFA_CODE = '246810';

export function hashPassword(password: string, salt: string): string {
  return sha256(`${salt}:${password}`);
}

/* --------------------------------- helpers -------------------------------- */

function at(daysAgo: number, hour = 10, minute = 0): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
}

const BRANCHES: Branch[] = [
  {
    id: 'br-mq',
    name: 'الفرع الرئيسي — منيا القمح',
    short: 'منيا القمح',
    city: 'منيا القمح',
    address: 'شارع الحرية، برج النور، الدور الأول — أمام مجلس المدينة، منيا القمح، الشرقية',
    phones: ['01115345157', '01020384273'],
    hours: 'من الأحد إلى الخميس، 9 صباحًا – 5 مساءً · السبت حتى 2 ظهرًا',
    receipt_prefix: 'MQ',
    is_active: true,
    created_at: at(400),
  },
  {
    id: 'br-az',
    name: 'فرع العزيزية',
    short: 'العزيزية',
    city: 'العزيزية — منيا القمح',
    address: 'الشارع العام بجوار المجمع الخدمي، العزيزية، مركز منيا القمح، الشرقية',
    phones: ['01210285290'],
    hours: 'من الأحد إلى الخميس، 9 صباحًا – 4 مساءً',
    receipt_prefix: 'AZ',
    is_active: true,
    created_at: at(300),
  },
];

const PROFILES: Profile[] = [
  { id: 'usr-admin', full_name: 'أحمد إبراهيم عبد الغني', email: 'admin@elsafwa.demo', phone: '01000000101', branch_id: 'br-mq', role: 'admin', title: 'المدير العام', is_active: true, mfa_enabled: true, created_at: at(400) },
  { id: 'usr-mgr-mq', full_name: 'محمود عبد السلام يوسف', email: 'mahmoud@elsafwa.demo', phone: '01000000102', branch_id: 'br-mq', role: 'branch_manager', title: 'مدير فرع منيا القمح', is_active: true, mfa_enabled: true, created_at: at(390) },
  { id: 'usr-mgr-az', full_name: 'طارق الشريف حسن', email: 'tarek@elsafwa.demo', phone: '01000000103', branch_id: 'br-az', role: 'branch_manager', title: 'مدير فرع العزيزية', is_active: true, mfa_enabled: true, created_at: at(290) },
  { id: 'usr-eslam', full_name: 'إسلام حسن عطية', email: 'eslam@elsafwa.demo', phone: '01000000104', branch_id: 'br-mq', role: 'employee', title: 'مسؤول تراخيص ومرافق', is_active: true, mfa_enabled: false, created_at: at(380) },
  { id: 'usr-heba', full_name: 'هبة السيد منصور', email: 'heba@elsafwa.demo', phone: '01000000105', branch_id: 'br-mq', role: 'employee', title: 'استقبال وخدمة عملاء', is_active: true, mfa_enabled: false, created_at: at(200) },
  { id: 'usr-mona', full_name: 'منى فاروق إبراهيم', email: 'mona@elsafwa.demo', phone: '01000000106', branch_id: 'br-az', role: 'employee', title: 'شركات ومستندات', is_active: true, mfa_enabled: false, created_at: at(280) },
  { id: 'usr-karim', full_name: 'كريم عادل سليمان', email: 'karim@elsafwa.demo', phone: '01000000107', branch_id: 'br-mq', role: 'accountant', title: 'محاسب وأمين خزينة', is_active: true, mfa_enabled: true, created_at: at(350) },
];

const CLIENTS: Client[] = [
  { id: 'cli-farid', kind: 'individual', full_name: 'فريد السيد المحمدي', national_id: '27503121300456', phone: '01012345678', phone_alt: '01122334455', address: 'شارع سعد زغلول، منيا القمح', branch_id: 'br-mq', notes: 'عميل دائم — محل بقالة ومبنى سكني', consent: { at: at(60), version: 'privacy-v1', channel: 'walk_in' }, created_at: at(60) },
  { id: 'cli-sameh', kind: 'individual', full_name: 'سامح عبد الوهاب بدوي', national_id: '28211051300123', phone: '01298765432', address: 'حي الزهور، العزيزية', branch_id: 'br-az', notes: 'طبيب باطنة — عيادة خاصة', consent: { at: at(30), version: 'privacy-v1', channel: 'walk_in' }, created_at: at(30) },
  { id: 'cli-tarek', kind: 'individual', full_name: 'طارق منصور الجيزاوي', national_id: '29008201300789', phone: '01005544332', phone_alt: '01555443322', address: 'قرية ملامس، منيا القمح', branch_id: 'br-mq', consent: { at: at(41), version: 'privacy-v1', channel: 'walk_in' }, created_at: at(41) },
  { id: 'cli-shaimaa', kind: 'business', full_name: 'شيماء متولي عبده', business_name: 'مؤسسة شيماء للتوريدات', national_id: '29506151300999', phone: '01144332211', address: 'بجوار المدرسة الثانوية، العزيزية', branch_id: 'br-az', consent: { at: at(36), version: 'privacy-v1', channel: 'walk_in' }, created_at: at(36) },
  { id: 'cli-mohamed', kind: 'individual', full_name: 'محمد عبد الحميد سالم', national_id: '28802101300345', phone: '01066778899', address: 'شارع المحطة، منيا القمح', branch_id: 'br-mq', consent: { at: at(3), version: 'privacy-v1', channel: 'walk_in' }, created_at: at(3) },
  { id: 'cli-yasmin', kind: 'individual', full_name: 'ياسمين أحمد فوزي', national_id: '', phone: '01223344556', address: '', branch_id: 'br-mq', notes: 'سُجِّل من الموقع — يلزم التحقق من الهوية بأصل البطاقة عند الحضور', consent: { at: at(0, 8, 40), version: 'privacy-v1', channel: 'online' }, created_at: at(0, 8, 40) },
  { id: 'cli-saeed', kind: 'individual', full_name: 'سعيد رمضان الشافعي', national_id: '27911231300567', phone: '01099887766', address: 'كفر العزيزية', branch_id: 'br-az', consent: { at: at(8), version: 'privacy-v1', channel: 'walk_in' }, created_at: at(8) },
  { id: 'cli-noor', kind: 'business', full_name: 'عادل محمود النور', business_name: 'شركة النور للمقاولات العامة', national_id: '27407071300234', phone: '01511223344', address: 'المنطقة الصناعية، منيا القمح', branch_id: 'br-mq', notes: 'يمثل الشركة بموجب توكيل', consent: { at: at(22), version: 'privacy-v1', channel: 'walk_in' }, created_at: at(22) },
  { id: 'cli-hala', kind: 'individual', full_name: 'هالة عبد العزيز حسن', national_id: '26302141300876', phone: '01277665544', address: 'شارع الجيش، العزيزية', branch_id: 'br-az', consent: { at: at(6), version: 'privacy-v1', channel: 'phone' }, created_at: at(6) },
  { id: 'cli-ahmed', kind: 'individual', full_name: 'أحمد كمال الدسوقي', national_id: '29303031300654', phone: '01033221100', address: 'ميدان المحطة، منيا القمح', branch_id: 'br-mq', notes: 'كافيه جديد — يرغب في تشغيل شاشات', consent: { at: at(13), version: 'privacy-v1', channel: 'walk_in' }, created_at: at(13) },
  { id: 'cli-mostafa', kind: 'individual', full_name: 'مصطفى إبراهيم عيد', national_id: '28509191300432', phone: '01155667788', address: 'العزيزية', branch_id: 'br-az', consent: { at: at(26), version: 'privacy-v1', channel: 'walk_in' }, created_at: at(26) },
];

const POWERS_OF_ATTORNEY: PowerOfAttorney[] = [
  { id: 'poa-1', client_id: 'cli-farid', number: '1842 / ب', notary_office: 'مكتب توثيق منيا القمح', scope: 'special', subject: 'تراخيص المحل وتوصيل المرافق باسم الموكل', agents: ['إسلام حسن عطية', 'محمود عبد السلام يوسف'], issued_at: at(58), expires_at: undefined },
  { id: 'poa-2', client_id: 'cli-tarek', number: '977 / أ', notary_office: 'مكتب توثيق منيا القمح', scope: 'special', subject: 'طلب التصالح على مخالفات العقار رقم 14 قرية ملامس', agents: ['إسلام حسن عطية'], issued_at: at(40) },
  { id: 'poa-3', client_id: 'cli-noor', number: '2210 / ب', notary_office: 'مكتب توثيق الزقازيق', scope: 'general', subject: 'توكيل عام شركات — شركة النور للمقاولات العامة', agents: ['محمود عبد السلام يوسف'], issued_at: at(120), expires_at: at(-245) },
];

/* --------------------------- request scenarios ---------------------------- */

interface Scenario {
  id: string;
  ref: number;
  client: string;
  service: string;
  branch: string;
  assignee?: string;
  status: RequestStatus;
  priority?: RequestRecord['priority'];
  channel?: RequestRecord['channel'];
  receivedDaysAgo: number;
  /** How many of the service's steps are done. */
  stepsDone: number;
  authorityRef?: string;
  targetOffsetDays?: number;
  timeline: Array<{ daysAgo: number; to?: RequestStatus; message: string; internal?: string; by: string }>;
  payments: Array<{ daysAgo: number; kind: PaymentRecord['kind']; method: PaymentRecord['method']; amount: number; by: string; note?: string }>;
  disbursements?: Array<{ daysAgo: number; authority: string; description: string; amount: number; receipt: string; by: string }>;
  documents: Array<{ type: string; original?: boolean; daysAgo: number; by: string }>;
}

const SCENARIOS: Scenario[] = [
  {
    id: 'req-101', ref: 101, client: 'cli-farid', service: 'srv-shop-license', branch: 'br-mq', assignee: 'usr-eslam', status: 'submitted', priority: 'high',
    receivedDaysAgo: 16, stepsDone: 4, authorityRef: 'م.ت/منيا القمح 2026/1184', targetOffsetDays: 2,
    timeline: [
      { daysAgo: 15, to: 'under_review', message: 'جاري مراجعة أوراق المحل', internal: 'عقد الإيجار مثبت التاريخ — سليم', by: 'usr-eslam' },
      { daysAgo: 9, to: 'submitted', message: 'تم تقديم طلب الترخيص للمركز التكنولوجي بمجلس مدينة منيا القمح', internal: 'رقم الطلب بالمركز 1184 — موعد المعاينة غير محدد بعد', by: 'usr-eslam' },
    ],
    payments: [
      { daysAgo: 16, kind: 'office_fee', method: 'cash', amount: 1500, by: 'usr-heba', note: 'دفعة أولى من الأتعاب' },
      { daysAgo: 16, kind: 'gov_fee_deposit', method: 'cash', amount: 2000, by: 'usr-heba', note: 'أمانة رسوم المعاينة والترخيص' },
    ],
    disbursements: [{ daysAgo: 9, authority: 'مجلس مدينة منيا القمح', description: 'رسم فحص ومعاينة طلب الترخيص', amount: 1150, receipt: 'ق.33 رقم 4471829', by: 'usr-eslam' }],
    documents: [
      { type: 'صورة بطاقة الرقم القومي سارية', daysAgo: 16, by: 'usr-heba' },
      { type: 'سند حيازة المحل (عقد إيجار مثبت التاريخ أو عقد ملكية)', original: true, daysAgo: 16, by: 'usr-heba' },
      { type: 'رسم هندسي للمحل معتمد من مهندس نقابي', daysAgo: 12, by: 'usr-eslam' },
    ],
  },
  {
    id: 'req-102', ref: 102, client: 'cli-sameh', service: 'srv-clinic', branch: 'br-az', assignee: 'usr-mona', status: 'inspection', priority: 'urgent',
    receivedDaysAgo: 26, stepsDone: 4, authorityRef: 'علاج حر/الشرقية 3391', targetOffsetDays: -4,
    timeline: [
      { daysAgo: 25, to: 'under_review', message: 'جاري مراجعة مستندات العيادة', internal: 'ينقص عقد التخلص الآمن من النفايات الطبية — تم إبلاغ الطبيب', by: 'usr-mona' },
      { daysAgo: 19, to: 'submitted', message: 'تم تقديم الطلب لإدارة العلاج الحر بمديرية الصحة بالشرقية', internal: 'رقم القيد 3391', by: 'usr-mona' },
      { daysAgo: 8, to: 'inspection', message: 'تم تحديد موعد المعاينة الميدانية للعيادة', internal: 'المعاينة اتأجلت مرتين من طرف الإدارة', by: 'usr-mgr-az' },
    ],
    payments: [
      { daysAgo: 26, kind: 'office_fee', method: 'instapay', amount: 3000, by: 'usr-mona' },
      { daysAgo: 26, kind: 'gov_fee_deposit', method: 'instapay', amount: 1500, by: 'usr-mona' },
    ],
    disbursements: [{ daysAgo: 19, authority: 'مديرية الشئون الصحية بالشرقية', description: 'رسوم فحص طلب ترخيص منشأة طبية', amount: 900, receipt: 'إيصال 99-117604', by: 'usr-mona' }],
    documents: [
      { type: 'صورة بطاقة الرقم القومي', daysAgo: 26, by: 'usr-mona' },
      { type: 'ترخيص مزاولة المهنة وكارنيه النقابة', daysAgo: 26, by: 'usr-mona' },
      { type: 'سند حيازة المقر', original: true, daysAgo: 26, by: 'usr-mona' },
      { type: 'رسم هندسي للمنشأة', daysAgo: 22, by: 'usr-mona' },
    ],
  },
  {
    id: 'req-103', ref: 103, client: 'cli-tarek', service: 'srv-reconciliation', branch: 'br-mq', assignee: 'usr-eslam', status: 'awaiting_client',
    receivedDaysAgo: 40, stepsDone: 2, targetOffsetDays: 12,
    timeline: [
      { daysAgo: 39, to: 'under_review', message: 'جاري مراجعة مستندات العقار', internal: 'المبنى 4 أدوار — يلزم تقرير سلامة إنشائية', by: 'usr-eslam' },
      { daysAgo: 30, to: 'awaiting_client', message: 'مطلوب منك: شهادة السلامة الإنشائية من مهندس استشاري نقابي', internal: 'العميل وعد بإحضارها خلال أسبوعين', by: 'usr-eslam' },
    ],
    payments: [{ daysAgo: 40, kind: 'office_fee', method: 'cash', amount: 2500, by: 'usr-eslam', note: 'نصف الأتعاب مقدمًا' }],
    documents: [
      { type: 'صورة بطاقة الرقم القومي', daysAgo: 40, by: 'usr-eslam' },
      { type: 'سند ملكية العقار أو ما يفيد الحيازة', original: true, daysAgo: 40, by: 'usr-eslam' },
    ],
  },
  {
    id: 'req-104', ref: 104, client: 'cli-shaimaa', service: 'srv-sole-proprietorship', branch: 'br-az', assignee: 'usr-mona', status: 'completed',
    receivedDaysAgo: 34, stepsDone: 99, authorityRef: 'سجل تجاري 14522 الزقازيق', targetOffsetDays: -20,
    timeline: [
      { daysAgo: 33, to: 'under_review', message: 'جاري مراجعة الأوراق', internal: 'العقد مثبت التاريخ', by: 'usr-mona' },
      { daysAgo: 31, to: 'submitted', message: 'تم التقديم لمكتب السجل التجاري', internal: 'قيد برقم 14522', by: 'usr-mona' },
      { daysAgo: 27, to: 'approved', message: 'تم قيد المنشأة في السجل التجاري واستخراج البطاقة الضريبية', internal: 'تم استلام مستخرج السجل والبطاقة', by: 'usr-mona' },
      { daysAgo: 26, to: 'ready', message: 'المستندات جاهزة للاستلام من الفرع', internal: 'تم الاتصال بالعميلة', by: 'usr-mona' },
      { daysAgo: 24, to: 'completed', message: 'تم تسليم مستخرج السجل التجاري والبطاقة الضريبية', internal: 'وقّعت العميلة على إقرار الاستلام', by: 'usr-mgr-az' },
    ],
    payments: [
      { daysAgo: 34, kind: 'office_fee', method: 'cash', amount: 1800, by: 'usr-mona' },
      { daysAgo: 34, kind: 'gov_fee_deposit', method: 'cash', amount: 900, by: 'usr-mona' },
    ],
    disbursements: [{ daysAgo: 31, authority: 'مكتب السجل التجاري', description: 'رسوم قيد منشأة فردية ومستخرج', amount: 860, receipt: 'سجل/14522-1', by: 'usr-mona' }],
    documents: [
      { type: 'صورة بطاقة الرقم القومي', daysAgo: 34, by: 'usr-mona' },
      { type: 'عقد إيجار أو تمليك المقر (مثبت التاريخ)', original: true, daysAgo: 34, by: 'usr-mona' },
    ],
  },
  {
    id: 'req-105', ref: 105, client: 'cli-mohamed', service: 'srv-electricity', branch: 'br-mq', assignee: 'usr-eslam', status: 'under_review',
    receivedDaysAgo: 3, stepsDone: 1,
    timeline: [{ daysAgo: 2, to: 'under_review', message: 'جاري مراجعة مستندات الوحدة', internal: 'مطلوب التأكد من وجود شهادة صلاحية المبنى للإشغال', by: 'usr-eslam' }],
    payments: [{ daysAgo: 3, kind: 'office_fee', method: 'cash', amount: 600, by: 'usr-heba' }],
    documents: [{ type: 'صورة بطاقة الرقم القومي', daysAgo: 3, by: 'usr-heba' }],
  },
  {
    id: 'req-106', ref: 106, client: 'cli-yasmin', service: 'srv-civil-records', branch: 'br-mq', status: 'new', channel: 'online',
    receivedDaysAgo: 0, stepsDone: 0,
    timeline: [],
    payments: [],
    documents: [],
  },
  {
    id: 'req-107', ref: 107, client: 'cli-saeed', service: 'srv-vehicle', branch: 'br-az', assignee: 'usr-mona', status: 'ready',
    receivedDaysAgo: 8, stepsDone: 5, authorityRef: 'مرور منيا القمح 5521',
    timeline: [
      { daysAgo: 7, to: 'under_review', message: 'جاري مراجعة أوراق المركبة', internal: 'لا توجد مخالفات مسجلة', by: 'usr-mona' },
      { daysAgo: 6, to: 'submitted', message: 'تم تقديم طلب التجديد لوحدة المرور', internal: 'الفحص الفني تم صباحًا مع العميل', by: 'usr-mona' },
      { daysAgo: 2, to: 'approved', message: 'تم تجديد رخصة المركبة', internal: 'تم استلام الرخصة الجديدة', by: 'usr-mona' },
      { daysAgo: 1, to: 'ready', message: 'الرخصة جاهزة للاستلام من فرع العزيزية', internal: 'تم إرسال رسالة للعميل', by: 'usr-mona' },
    ],
    payments: [
      { daysAgo: 8, kind: 'office_fee', method: 'cash', amount: 400, by: 'usr-mona' },
      { daysAgo: 8, kind: 'gov_fee_deposit', method: 'cash', amount: 1600, by: 'usr-mona' },
    ],
    disbursements: [{ daysAgo: 6, authority: 'وحدة مرور منيا القمح', description: 'رسوم التجديد والتأمين الإجباري', amount: 1530, receipt: 'مرور/5521-77', by: 'usr-mona' }],
    documents: [
      { type: 'صورة بطاقة الرقم القومي للمالك', daysAgo: 8, by: 'usr-mona' },
      { type: 'رخصة المركبة الحالية', original: true, daysAgo: 8, by: 'usr-mona' },
    ],
  },
  {
    id: 'req-108', ref: 108, client: 'cli-noor', service: 'srv-building-permit', branch: 'br-mq', assignee: 'usr-eslam', status: 'submitted',
    receivedDaysAgo: 21, stepsDone: 5, authorityRef: 'م.ت/منيا القمح 2026/0931', targetOffsetDays: 14,
    timeline: [
      { daysAgo: 20, to: 'under_review', message: 'جاري مراجعة الملف الهندسي', internal: 'المكتب الهندسي المتعاقد سلّم اللوحات', by: 'usr-eslam' },
      { daysAgo: 12, to: 'submitted', message: 'تم تقديم طلب الترخيص للمركز التكنولوجي', internal: 'رقم الطلب 0931', by: 'usr-mgr-mq' },
    ],
    payments: [
      { daysAgo: 21, kind: 'office_fee', method: 'bank_transfer', amount: 6000, by: 'usr-karim' },
      { daysAgo: 21, kind: 'gov_fee_deposit', method: 'bank_transfer', amount: 9000, by: 'usr-karim' },
    ],
    disbursements: [{ daysAgo: 12, authority: 'مجلس مدينة منيا القمح', description: 'رسوم فحص الرسومات وإصدار الترخيص', amount: 7400, receipt: 'ق.33 رقم 4469012', by: 'usr-eslam' }],
    documents: [
      { type: 'صورة بطاقة الرقم القومي للمالك أو الممثل القانوني', daysAgo: 21, by: 'usr-eslam' },
      { type: 'سند الملكية', original: true, daysAgo: 21, by: 'usr-eslam' },
      { type: 'الرسومات المعمارية والإنشائية معتمدة من مهندس نقابي', daysAgo: 18, by: 'usr-eslam' },
      { type: 'تقرير جسات التربة', daysAgo: 18, by: 'usr-eslam' },
    ],
  },
  {
    id: 'req-109', ref: 109, client: 'cli-hala', service: 'srv-insurance-individual', branch: 'br-az', assignee: 'usr-mona', status: 'approved', channel: 'phone',
    receivedDaysAgo: 6, stepsDone: 3,
    timeline: [
      { daysAgo: 5, to: 'under_review', message: 'جاري مراجعة طلب المعاش', internal: 'تم سحب برنت تأميني حديث', by: 'usr-mona' },
      { daysAgo: 4, to: 'submitted', message: 'تم تقديم الطلب لمكتب التأمينات المختص', internal: 'المكتب طلب صورة شهادة الوفاة الأصلية للاطلاع', by: 'usr-mona' },
      { daysAgo: 1, to: 'approved', message: 'تمت الموافقة على الطلب', internal: 'باقي استلام الإخطار', by: 'usr-mona' },
    ],
    payments: [{ daysAgo: 6, kind: 'office_fee', method: 'wallet', amount: 500, by: 'usr-mona' }],
    documents: [{ type: 'صورة بطاقة الرقم القومي', daysAgo: 6, by: 'usr-mona' }],
  },
  {
    id: 'req-110', ref: 110, client: 'cli-farid', service: 'srv-water', branch: 'br-mq', status: 'new', priority: 'high',
    receivedDaysAgo: 1, stepsDone: 0,
    timeline: [],
    payments: [],
    documents: [{ type: 'صورة بطاقة الرقم القومي', daysAgo: 1, by: 'usr-heba' }],
  },
  {
    id: 'req-111', ref: 111, client: 'cli-ahmed', service: 'srv-cafe', branch: 'br-mq', assignee: 'usr-eslam', status: 'awaiting_client',
    receivedDaysAgo: 13, stepsDone: 1, targetOffsetDays: -3,
    timeline: [
      { daysAgo: 12, to: 'under_review', message: 'جاري مراجعة مستندات الكافيه', internal: 'المكان محتاج تعديل مخارج الطوارئ قبل المعاينة', by: 'usr-eslam' },
      { daysAgo: 9, to: 'awaiting_client', message: 'مطلوب منك: الرسم الهندسي للمحل بعد تعديل مخارج الطوارئ', internal: 'اتصلنا بالعميل مرتين', by: 'usr-eslam' },
    ],
    payments: [{ daysAgo: 13, kind: 'office_fee', method: 'cash', amount: 1500, by: 'usr-heba' }],
    documents: [{ type: 'صورة بطاقة الرقم القومي سارية', daysAgo: 13, by: 'usr-heba' }],
  },
  {
    id: 'req-112', ref: 112, client: 'cli-mostafa', service: 'srv-company', branch: 'br-az', assignee: 'usr-mona', status: 'rejected',
    receivedDaysAgo: 28, stepsDone: 2,
    timeline: [
      { daysAgo: 27, to: 'under_review', message: 'جاري مراجعة بيانات الشركة', internal: 'شركة ذات مسئولية محدودة — شريكان', by: 'usr-mona' },
      { daysAgo: 24, to: 'submitted', message: 'تم تقديم طلب حجز الاسم التجاري', internal: '', by: 'usr-mona' },
      { daysAgo: 21, to: 'rejected', message: 'الاسم التجاري المقترح غير متاح — برجاء التواصل لاختيار اسم آخر', internal: 'الاسم ملتبس مع شركة قائمة', by: 'usr-mona' },
    ],
    payments: [{ daysAgo: 28, kind: 'office_fee', method: 'cash', amount: 2000, by: 'usr-mona' }],
    documents: [{ type: 'صور بطاقات الرقم القومي للشركاء والمديرين', daysAgo: 28, by: 'usr-mona' }],
  },
];

/* ---------------------------------- build --------------------------------- */

function actorOf(id: string): AuditActor {
  const profile = PROFILES.find((p) => p.id === id);
  return profile ? { id, name: profile.full_name, role: profile.role, branch_id: profile.branch_id } : PUBLIC_ACTOR;
}

export function createSeed(): DatabaseState {
  const year = new Date().getFullYear();
  const services = SERVICE_CATALOG.map((s) => ({ ...s, updated_at: at(90) }));
  const credentials: Credential[] = PROFILES.map((p) => {
    const salt = `salt-${p.id}`;
    return { profile_id: p.id, salt, hash: hashPassword(DEMO_PASSWORD, salt) };
  });

  const requests: RequestRecord[] = [];
  const events: RequestEvent[] = [];
  const payments: PaymentRecord[] = [];
  const disbursements: Disbursement[] = [];
  const documents: DocumentRecord[] = [];
  // Chronological log of seed actions, replayed into the hash-chained audit trail.
  const log: Array<{ at: string; actor: AuditActor; action: string; entity: { type: string; id: string; branch_id?: string }; summary: string }> = [];
  const receiptCounters: Record<string, number> = {};
  let evt = 0;

  for (const s of SCENARIOS) {
    const service = services.find((x) => x.id === s.service);
    const client = CLIENTS.find((c) => c.id === s.client);
    if (!service || !client) throw new Error(`Seed references unknown service/client in ${s.id}`);

    const ref = `SFW-${year}-${String(s.ref).padStart(5, '0')}`;
    const receivedAt = s.channel === 'online' ? at(s.receivedDaysAgo, 8, 40) : at(s.receivedDaysAgo, 10, 15);
    const last = s.timeline[s.timeline.length - 1];
    const stepsDone = Math.min(s.stepsDone, service.steps.length);
    const stepActor = s.assignee ?? 'usr-heba';

    const request: RequestRecord = {
      id: s.id,
      ref,
      client_id: s.client,
      service_id: s.service,
      branch_id: s.branch,
      assignee_id: s.assignee,
      status: s.status,
      priority: s.priority ?? 'normal',
      channel: s.channel ?? 'walk_in',
      authority_ref: s.authorityRef,
      received_at: receivedAt,
      target_date: s.targetOffsetDays !== undefined ? at(-s.targetOffsetDays, 12) : addBusinessDays(receivedAt, service.estimated_days),
      completed_at: s.status === 'completed' && last ? at(last.daysAgo, 13) : undefined,
      office_fee: service.office_fee,
      gov_fee_estimate: service.gov_fee_estimate,
      steps: service.steps.map((step, index) => {
        const done = index < stepsDone;
        const daysAgo = Math.max(0, Math.round(s.receivedDaysAgo - ((index + 1) * s.receivedDaysAgo) / (stepsDone + 1)));
        return { id: step.id, title: step.title, description: step.description, owner: step.owner, days: step.days, documents: step.documents, milestone: Boolean(step.milestone), done_at: done ? at(daysAgo, 11, 30) : undefined, done_by: done ? stepActor : undefined };
      }),
      created_at: receivedAt,
      updated_at: last ? at(last.daysAgo, 12) : receivedAt,
    };
    requests.push(request);

    const createdBy = s.channel === 'online' ? 'public' : s.payments[0]?.by ?? stepActor;
    events.push({ id: `evt-${++evt}`, request_id: s.id, at: receivedAt, actor_id: createdBy, kind: 'created', to_status: 'new', message: s.channel === 'online' ? 'استلمنا طلبك من الموقع، وسنتواصل معك لتحديد موعد تسليم الأوراق' : 'تم فتح ملف المعاملة واستلام الطلب', visibility: 'public' });
    log.push({
      at: receivedAt,
      actor: createdBy === 'public' ? PUBLIC_ACTOR : actorOf(createdBy),
      action: createdBy === 'public' ? 'public.request_submitted' : 'request.created',
      entity: { type: 'request', id: s.id, branch_id: s.branch },
      summary: `${createdBy === 'public' ? '' : 'تسجيل '}${ref} — ${service.name}${createdBy === 'public' ? '' : ` للعميل ${client.full_name}`}`,
    });

    let previous: RequestStatus = 'new';
    for (const step of s.timeline) {
      const when = at(step.daysAgo, 12, 5);
      if (step.to) {
        events.push({ id: `evt-${++evt}`, request_id: s.id, at: when, actor_id: step.by, kind: 'status', from_status: previous, to_status: step.to, message: step.message, visibility: 'public' });
        log.push({ at: when, actor: actorOf(step.by), action: 'request.status_changed', entity: { type: 'request', id: s.id, branch_id: s.branch }, summary: `${ref}: تغيير الحالة` });
        previous = step.to;
      }
      if (step.internal) {
        events.push({ id: `evt-${++evt}`, request_id: s.id, at: when, actor_id: step.by, kind: 'note', message: step.internal, visibility: 'internal' });
      }
    }

    for (const p of s.payments) {
      const branch = BRANCHES.find((b) => b.id === s.branch)!;
      receiptCounters[branch.id] = (receiptCounters[branch.id] ?? 0) + 1;
      const receiptNo = `${branch.receipt_prefix}-${year}-${String(receiptCounters[branch.id] + 30).padStart(5, '0')}`;
      const when = at(p.daysAgo, 10, 40);
      const payment: PaymentRecord = { id: `pay-${s.id}-${receiptCounters[branch.id]}`, receipt_no: receiptNo, request_id: s.id, branch_id: s.branch, kind: p.kind, method: p.method, amount: p.amount, received_by: p.by, received_at: when, note: p.note };
      payments.push(payment);
      events.push({ id: `evt-${++evt}`, request_id: s.id, at: when, actor_id: p.by, kind: 'payment', message: `تحصيل ${p.amount} ج.م بإيصال ${receiptNo}`, visibility: 'internal' });
      log.push({ at: when, actor: actorOf(p.by), action: 'payment.recorded', entity: { type: 'payment', id: payment.id, branch_id: s.branch }, summary: `${receiptNo}: ${p.amount} ج.م — ${ref}` });
    }

    for (const [index, d] of (s.disbursements ?? []).entries()) {
      const when = at(d.daysAgo, 13, 20);
      disbursements.push({ id: `dsb-${s.id}-${index}`, request_id: s.id, authority: d.authority, description: d.description, amount: d.amount, official_receipt_no: d.receipt, paid_at: when, paid_by: d.by });
      events.push({ id: `evt-${++evt}`, request_id: s.id, at: when, actor_id: d.by, kind: 'payment', message: `سداد ${d.amount} ج.م لـ${d.authority} بإيصال رسمي ${d.receipt}`, visibility: 'internal' });
      log.push({ at: when, actor: actorOf(d.by), action: 'disbursement.recorded', entity: { type: 'disbursement', id: `dsb-${s.id}-${index}`, branch_id: s.branch }, summary: `${ref}: ${d.description} ${d.amount} ج.م` });
    }

    for (const [index, doc] of s.documents.entries()) {
      const when = at(doc.daysAgo, 10, 30 + index);
      const returned = s.status === 'completed' && doc.original;
      documents.push({
        id: `doc-${s.id}-${index}`,
        request_id: s.id,
        doc_type: doc.type,
        file_name: `${doc.type.split(' ').slice(0, 3).join('_')}.pdf`,
        mime: 'application/pdf',
        size: 380_000 + index * 145_000,
        original_held: Boolean(doc.original),
        returned_at: returned ? at(Math.max(0, (last?.daysAgo ?? 0)), 13) : undefined,
        uploaded_by: doc.by,
        uploaded_at: when,
      });
      log.push({ at: when, actor: actorOf(doc.by), action: 'document.uploaded', entity: { type: 'document', id: `doc-${s.id}-${index}`, branch_id: s.branch }, summary: `${ref}: ${doc.type}` });
    }
  }

  // Sign-ins and a failed attempt make the activity log feel real.
  log.push({ at: at(0, 8, 55), actor: actorOf('usr-eslam'), action: 'auth.login', entity: { type: 'session', id: 'usr-eslam' }, summary: 'دخول بكلمة المرور' });
  log.push({ at: at(0, 9, 2), actor: actorOf('usr-mona'), action: 'auth.login', entity: { type: 'session', id: 'usr-mona' }, summary: 'دخول بكلمة المرور' });
  log.push({ at: at(1, 22, 47), actor: PUBLIC_ACTOR, action: 'auth.login_failed', entity: { type: 'session', id: 'unknown' }, summary: 'محاولة دخول خاطئة ببريد غير مسجل (خارج مواعيد العمل)' });
  log.push({ at: at(2, 14, 10), actor: actorOf('usr-mgr-mq'), action: 'client.nid_revealed', entity: { type: 'client', id: 'cli-noor', branch_id: 'br-mq' }, summary: 'كشف الرقم القومي للعميل عادل محمود النور' });

  const state: DatabaseState = {
    version: SCHEMA_VERSION,
    branches: structuredClone(BRANCHES),
    profiles: structuredClone(PROFILES).map((p) => ({ ...p, last_login_at: p.id === 'usr-eslam' ? at(0, 8, 55) : p.id === 'usr-mona' ? at(0, 9, 2) : at(3, 9) })),
    credentials,
    services,
    clients: structuredClone(CLIENTS),
    powers_of_attorney: structuredClone(POWERS_OF_ATTORNEY),
    requests,
    events,
    documents,
    payments,
    disbursements,
    audit: [],
  };

  log.sort((a, b) => a.at.localeCompare(b.at)).forEach((entry) => appendAudit(state, entry.actor, entry.action, entry.entity, entry.summary, entry.at));
  return state;
}
