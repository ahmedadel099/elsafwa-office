/*
 * Demo data engine — an in-browser stand-in for the real API.
 *
 * It deliberately mirrors the production rules so the demo behaves like the
 * real system: authorization is checked inside every command (not just hidden
 * in the UI), every command writes a hash-chained audit entry, workflow
 * transitions are validated, receipts are numbered per branch without reuse,
 * and money is split between office fees and government-fee trust funds.
 *
 * Data lives in this browser's localStorage only. It is NOT secure storage —
 * see documents/02-technology-and-security.md for the production design.
 */

import { addBusinessDays } from '../lib/format';
import { parseMobile, parseNationalId } from '../lib/validation';
import { appendAudit, PUBLIC_ACTOR, verifyChain, type AuditActor } from './audit';
import { can, STATUS, TRANSITIONS, type Permission } from './meta';
import { createSeed, hashPassword, DEMO_MFA_CODE, SCHEMA_VERSION } from './seed';
import type {
  Branch,
  Channel,
  Client,
  DatabaseState,
  Disbursement,
  DocumentRecord,
  PaymentKind,
  PaymentMethod,
  PaymentRecord,
  Priority,
  Profile,
  RequestEvent,
  RequestRecord,
  RequestStatus,
  Role,
  ServiceType,
} from './types';

const STORAGE_KEY = 'elsafwa.demo.db';
const MAX_UPLOAD_BYTES = 2 * 1024 * 1024;
const MAX_FAILED_LOGINS = 5;
const LOCKOUT_MS = 5 * 60_000;

export class DomainError extends Error {}

/** Copy the service's current procedure into the request so later catalog edits never rewrite open files. */
function snapshotSteps(service: ServiceType): RequestRecord['steps'] {
  return service.steps.map((step) => ({
    id: step.id,
    title: step.title,
    description: step.description,
    owner: step.owner,
    days: step.days,
    documents: step.documents?.length ? [...step.documents] : undefined,
    milestone: Boolean(step.milestone),
  }));
}

function asAuditActor(profile: Profile): AuditActor {
  return { id: profile.id, name: profile.full_name, role: profile.role, branch_id: profile.branch_id };
}

function uid(prefix: string): string {
  return `${prefix}-${crypto.randomUUID().slice(0, 8)}`;
}

export interface TrackingView {
  ref: string;
  service: string;
  branch: Branch;
  status: RequestStatus;
  received_at: string;
  target_date: string;
  milestones: Array<{ title: string; done: boolean; done_at?: string }>;
  updates: Array<{ at: string; message: string }>;
  missing_documents: string[];
}

interface TrackingChallenge {
  requestId: string;
  code: string;
  expiresAt: number;
  attempts: number;
}

class DemoStore {
  private state: DatabaseState;
  private listeners = new Set<() => void>();
  private failedLogins = new Map<string, { count: number; lockedUntil: number }>();
  private trackingChallenges = new Map<string, TrackingChallenge>();

  constructor() {
    this.state = this.load();
  }

  /* ----------------------------- store plumbing ----------------------------- */

  private load(): DatabaseState {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as DatabaseState;
        if (parsed.version === SCHEMA_VERSION) return parsed;
      }
    } catch {
      // Storage blocked or corrupted: fall back to a fresh seed.
    }
    const seed = createSeed();
    this.persist(seed);
    return seed;
  }

  private persist(state: DatabaseState): boolean {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      return true;
    } catch {
      return false;
    }
  }

  private commit(mutate: (draft: DatabaseState) => void): void {
    const draft = structuredClone(this.state);
    mutate(draft);
    if (!this.persist(draft)) {
      throw new DomainError('مساحة التخزين في هذا المتصفح امتلأت. احذف بعض المرفقات أو أعد ضبط بيانات العرض.');
    }
    this.state = draft;
    this.listeners.forEach((listener) => listener());
  }

  subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };

  getState = (): DatabaseState => this.state;

  /* ------------------------------ authorization ----------------------------- */

  private authorize(actor: Profile, permission: Permission, branchId?: string): void {
    const current = this.state.profiles.find((p) => p.id === actor.id);
    if (!current || !current.is_active) throw new DomainError('الحساب غير مفعّل.');
    if (!can(current.role, permission)) throw new DomainError('ليست لديك صلاحية لتنفيذ هذا الإجراء.');
    if (branchId && current.role !== 'admin' && current.branch_id !== branchId) {
      throw new DomainError('هذا السجل يخص فرعًا آخر.');
    }
  }

  private requireRequest(draft: DatabaseState, requestId: string): RequestRecord {
    const request = draft.requests.find((r) => r.id === requestId);
    if (!request) throw new DomainError('المعاملة غير موجودة.');
    return request;
  }

  private pushEvent(draft: DatabaseState, event: Omit<RequestEvent, 'id' | 'at'> & { at?: string }): void {
    draft.events.push({ id: uid('evt'), at: event.at ?? new Date().toISOString(), ...event });
  }

  /* ---------------------------------- auth ---------------------------------- */

  login(email: string, password: string): { status: 'ok' | 'mfa'; profile: Profile } | { status: 'error'; message: string } {
    const key = email.trim().toLowerCase();
    const lock = this.failedLogins.get(key);
    if (lock && lock.lockedUntil > Date.now()) {
      const minutes = Math.ceil((lock.lockedUntil - Date.now()) / 60_000);
      return { status: 'error', message: `تم إيقاف المحاولات مؤقتًا بعد ${MAX_FAILED_LOGINS} محاولات خاطئة. حاول بعد ${minutes} دقيقة.` };
    }

    const profile = this.state.profiles.find((p) => p.email.toLowerCase() === key);
    const credential = profile && this.state.credentials.find((c) => c.profile_id === profile.id);
    const valid = Boolean(profile && profile.is_active && credential && hashPassword(password, credential.salt) === credential.hash);

    if (!valid || !profile) {
      const count = (lock?.count ?? 0) + 1;
      const lockedUntil = count >= MAX_FAILED_LOGINS ? Date.now() + LOCKOUT_MS : 0;
      this.failedLogins.set(key, { count: lockedUntil ? 0 : count, lockedUntil });
      this.commit((draft) => {
        appendAudit(draft, profile ? asAuditActor(profile) : PUBLIC_ACTOR, lockedUntil ? 'auth.locked' : 'auth.login_failed', { type: 'session', id: key }, `محاولة دخول خاطئة بالبريد ${key}`);
      });
      // Same message whether the email exists or not (no account enumeration).
      return { status: 'error', message: 'البريد الإلكتروني أو كلمة المرور غير صحيحة.' };
    }

    this.failedLogins.delete(key);
    if (profile.mfa_enabled) return { status: 'mfa', profile };
    this.recordLogin(profile, 'بكلمة المرور');
    return { status: 'ok', profile };
  }

  verifyMfa(profile: Profile, code: string): boolean {
    if (code.trim() !== DEMO_MFA_CODE) {
      this.commit((draft) => appendAudit(draft, asAuditActor(profile), 'auth.login_failed', { type: 'session', id: profile.id }, 'رمز تحقق ثنائي غير صحيح'));
      return false;
    }
    this.recordLogin(profile, 'بكلمة المرور + رمز التحقق الثنائي');
    return true;
  }

  /** Demo shortcut used by the "quick login" buttons. */
  demoLogin(profileId: string): Profile {
    const profile = this.state.profiles.find((p) => p.id === profileId);
    if (!profile) throw new DomainError('الحساب غير موجود.');
    this.recordLogin(profile, 'دخول سريع (وضع العرض)');
    return profile;
  }

  private recordLogin(profile: Profile, method: string): void {
    this.commit((draft) => {
      const target = draft.profiles.find((p) => p.id === profile.id);
      if (target) target.last_login_at = new Date().toISOString();
      appendAudit(draft, asAuditActor(profile), 'auth.login', { type: 'session', id: profile.id }, `دخول ${method}`);
    });
  }

  logout(profile: Profile, reason: 'manual' | 'idle' = 'manual'): void {
    this.commit((draft) =>
      appendAudit(
        draft,
        asAuditActor(profile),
        reason === 'idle' ? 'auth.session_expired' : 'auth.logout',
        { type: 'session', id: profile.id },
        reason === 'idle' ? 'إنهاء الجلسة تلقائيًا بعد فترة عدم نشاط' : 'تسجيل خروج',
      ),
    );
  }

  /* --------------------------------- clients -------------------------------- */

  createClient(
    actor: Profile,
    input: { kind: Client['kind']; full_name: string; business_name?: string; national_id: string; phone: string; phone_alt?: string; address: string; branch_id: string; notes?: string; consent: boolean },
  ): Client {
    this.authorize(actor, 'clients.create', input.branch_id);
    if (input.full_name.trim().split(/\s+/).length < 3) throw new DomainError('اكتب الاسم ثلاثيًا على الأقل كما في البطاقة.');
    const nid = parseNationalId(input.national_id);
    if (!nid.ok) throw new DomainError(nid.error);
    const phone = parseMobile(input.phone);
    if (!phone.ok) throw new DomainError(phone.error);
    let phoneAlt: string | undefined;
    if (input.phone_alt?.trim()) {
      const alt = parseMobile(input.phone_alt);
      if (!alt.ok) throw new DomainError('رقم الموبايل الإضافي غير صحيح.');
      phoneAlt = alt.value;
    }
    if (!input.consent) throw new DomainError('لا يمكن حفظ بيانات العميل بدون موافقته على سياسة الخصوصية.');
    if (this.state.clients.some((c) => c.national_id === nid.value)) throw new DomainError('يوجد عميل مسجل بنفس الرقم القومي.');

    const now = new Date().toISOString();
    const client: Client = {
      id: uid('cli'),
      kind: input.kind,
      full_name: input.full_name.trim(),
      business_name: input.business_name?.trim() || undefined,
      national_id: nid.value,
      phone: phone.value,
      phone_alt: phoneAlt,
      address: input.address.trim(),
      branch_id: input.branch_id,
      notes: input.notes?.trim() || undefined,
      consent: { at: now, version: 'privacy-v1', channel: 'walk_in' },
      created_at: now,
    };
    this.commit((draft) => {
      draft.clients.push(client);
      appendAudit(draft, asAuditActor(actor), 'client.created', { type: 'client', id: client.id, branch_id: client.branch_id }, `إضافة العميل ${client.full_name}`);
    });
    return client;
  }

  updateClient(actor: Profile, clientId: string, input: { full_name: string; business_name?: string; national_id: string; phone: string; phone_alt?: string; address: string; notes?: string }): void {
    const client = this.state.clients.find((c) => c.id === clientId);
    if (!client) throw new DomainError('العميل غير موجود.');
    this.authorize(actor, 'clients.create', client.branch_id);
    if (input.full_name.trim().split(/\s+/).length < 3) throw new DomainError('اكتب الاسم ثلاثيًا على الأقل كما في البطاقة.');
    const phone = parseMobile(input.phone);
    if (!phone.ok) throw new DomainError(phone.error);
    let phoneAlt: string | undefined;
    if (input.phone_alt?.trim()) {
      const alt = parseMobile(input.phone_alt);
      if (!alt.ok) throw new DomainError('رقم الموبايل الإضافي غير صحيح.');
      phoneAlt = alt.value;
    }
    let nationalId = '';
    if (input.national_id.trim()) {
      const nid = parseNationalId(input.national_id);
      if (!nid.ok) throw new DomainError(nid.error);
      nationalId = nid.value;
      if (this.state.clients.some((c) => c.id !== clientId && c.national_id === nationalId)) throw new DomainError('يوجد عميل آخر بنفس الرقم القومي — راجع ملفه بدل إنشاء ملف مكرر.');
    }
    const changed = (['full_name', 'phone', 'address'] as const).filter((k) => (k === 'phone' ? phone.value : input[k].trim()) !== client[k]);
    if (nationalId !== client.national_id) changed.push('national_id' as never);
    this.commit((draft) => {
      const target = draft.clients.find((c) => c.id === clientId);
      if (!target) return;
      const verifiedNow = !target.national_id && nationalId;
      Object.assign(target, {
        full_name: input.full_name.trim(),
        business_name: input.business_name?.trim() || undefined,
        national_id: nationalId,
        phone: phone.value,
        phone_alt: phoneAlt,
        address: input.address.trim(),
        notes: verifiedNow ? (input.notes?.trim() || '').replace('سُجِّل من الموقع — يلزم التحقق من الهوية بأصل البطاقة عند الحضور', 'سُجِّل من الموقع — تم التحقق من الهوية بالفرع') || undefined : input.notes?.trim() || undefined,
      });
      appendAudit(
        draft,
        asAuditActor(actor),
        'client.updated',
        { type: 'client', id: clientId, branch_id: target.branch_id },
        `تعديل بيانات ${target.full_name}${changed.length ? ` (${changed.map((k) => ({ full_name: 'الاسم', phone: 'الموبايل', address: 'العنوان', national_id: 'الرقم القومي' })[k as string]).join('، ')})` : ''}`,
      );
    });
  }

  logClientView(actor: Profile, clientId: string): void {
    const client = this.state.clients.find((c) => c.id === clientId);
    if (!client) return;
    this.authorize(actor, 'clients.view', client.branch_id);
    this.commit((draft) => appendAudit(draft, asAuditActor(actor), 'client.viewed', { type: 'client', id: clientId, branch_id: client.branch_id }, `فتح ملف ${client.full_name}`));
  }

  revealNationalId(actor: Profile, clientId: string): string {
    const client = this.state.clients.find((c) => c.id === clientId);
    if (!client) throw new DomainError('العميل غير موجود.');
    this.authorize(actor, 'clients.reveal_nid', client.branch_id);
    this.commit((draft) =>
      appendAudit(draft, asAuditActor(actor), 'client.nid_revealed', { type: 'client', id: clientId, branch_id: client.branch_id }, `كشف الرقم القومي للعميل ${client.full_name}`),
    );
    return client.national_id;
  }

  /* -------------------------------- requests -------------------------------- */

  private nextRequestRef(draft: DatabaseState): string {
    const year = new Date().getFullYear();
    const prefix = `SFW-${year}-`;
    const max = draft.requests.filter((r) => r.ref.startsWith(prefix)).reduce((m, r) => Math.max(m, Number(r.ref.slice(prefix.length)) || 0), 0);
    return `${prefix}${String(max + 1).padStart(5, '0')}`;
  }

  createRequest(
    actor: Profile,
    input: { client_id: string; service_id: string; branch_id: string; assignee_id?: string; priority: Priority; channel: Channel; office_fee: number; gov_fee_estimate: number; notes?: string },
  ): RequestRecord {
    this.authorize(actor, 'requests.create', input.branch_id);
    const client = this.state.clients.find((c) => c.id === input.client_id);
    const service = this.state.services.find((s) => s.id === input.service_id && s.is_active);
    if (!client) throw new DomainError('اختر العميل.');
    if (!service) throw new DomainError('اختر خدمة متاحة.');
    if (input.office_fee < 0 || input.gov_fee_estimate < 0) throw new DomainError('المبالغ لا يمكن أن تكون سالبة.');

    let created!: RequestRecord;
    this.commit((draft) => {
      const now = new Date().toISOString();
      created = {
        id: uid('req'),
        ref: this.nextRequestRef(draft),
        client_id: client.id,
        service_id: service.id,
        branch_id: input.branch_id,
        assignee_id: input.assignee_id || undefined,
        status: 'new',
        priority: input.priority,
        channel: input.channel,
        received_at: now,
        target_date: addBusinessDays(now, service.estimated_days),
        office_fee: Math.round(input.office_fee),
        gov_fee_estimate: Math.round(input.gov_fee_estimate),
        notes: input.notes?.trim() || undefined,
        steps: snapshotSteps(service),
        created_at: now,
        updated_at: now,
      };
      draft.requests.push(created);
      this.pushEvent(draft, { request_id: created.id, actor_id: actor.id, kind: 'created', to_status: 'new', message: 'تم فتح ملف المعاملة واستلام الطلب', visibility: 'public' });
      appendAudit(draft, asAuditActor(actor), 'request.created', { type: 'request', id: created.id, branch_id: created.branch_id }, `تسجيل ${created.ref} — ${service.name} للعميل ${client.full_name}`);
    });
    return created;
  }

  logRequestView(actor: Profile, requestId: string): void {
    const request = this.state.requests.find((r) => r.id === requestId);
    if (!request) return;
    this.authorize(actor, 'requests.view', request.branch_id);
    this.commit((draft) => appendAudit(draft, asAuditActor(actor), 'request.viewed', { type: 'request', id: requestId, branch_id: request.branch_id }, `فتح المعاملة ${request.ref}`));
  }

  changeStatus(actor: Profile, requestId: string, input: { to: RequestStatus; publicMessage?: string; internalNote: string; authority_ref?: string }): void {
    const request = this.state.requests.find((r) => r.id === requestId);
    if (!request) throw new DomainError('المعاملة غير موجودة.');
    this.authorize(actor, 'requests.update', request.branch_id);
    if (!TRANSITIONS[request.status].includes(input.to)) {
      throw new DomainError(`لا يمكن الانتقال من «${STATUS[request.status].label}» إلى «${STATUS[input.to].label}».`);
    }
    if (!input.internalNote.trim()) throw new DomainError('اكتب ملاحظة داخلية توضح الإجراء — مطلوبة لسجل المتابعة.');
    const client = this.state.clients.find((c) => c.id === request.client_id);
    if (input.to === 'submitted' && !client?.national_id) {
      throw new DomainError('سجّل الرقم القومي للعميل بعد الاطلاع على أصل البطاقة قبل التقديم لأي جهة (من ملف العميل ← تعديل البيانات).');
    }
    if (input.to === 'submitted' && !(input.authority_ref?.trim() || request.authority_ref)) {
      throw new DomainError('سجّل رقم الطلب/الإيصال لدى الجهة عند التقديم.');
    }

    this.commit((draft) => {
      const target = this.requireRequest(draft, requestId);
      const from = target.status;
      const now = new Date().toISOString();
      target.status = input.to;
      target.updated_at = now;
      if (input.authority_ref?.trim()) target.authority_ref = input.authority_ref.trim();
      if (input.to === 'completed') target.completed_at = now;
      this.pushEvent(draft, {
        request_id: requestId,
        actor_id: actor.id,
        kind: 'status',
        from_status: from,
        to_status: input.to,
        message: input.publicMessage?.trim() || STATUS[input.to].publicLabel,
        visibility: 'public',
      });
      this.pushEvent(draft, { request_id: requestId, actor_id: actor.id, kind: 'note', message: input.internalNote.trim(), visibility: 'internal' });
      appendAudit(draft, asAuditActor(actor), 'request.status_changed', { type: 'request', id: requestId, branch_id: target.branch_id }, `${target.ref}: ${STATUS[from].label} ← ${STATUS[input.to].label}`);
    });
  }

  toggleStep(actor: Profile, requestId: string, stepId: string): void {
    const request = this.state.requests.find((r) => r.id === requestId);
    if (!request) throw new DomainError('المعاملة غير موجودة.');
    this.authorize(actor, 'requests.update', request.branch_id);
    if (STATUS[request.status].ball === 'closed') throw new DomainError('المعاملة مغلقة؛ لا يمكن تعديل خطواتها.');

    this.commit((draft) => {
      const target = this.requireRequest(draft, requestId);
      const step = target.steps.find((s) => s.id === stepId);
      if (!step) throw new DomainError('الخطوة غير موجودة.');
      const completing = !step.done_at;
      step.done_at = completing ? new Date().toISOString() : undefined;
      step.done_by = completing ? actor.id : undefined;
      target.updated_at = new Date().toISOString();
      this.pushEvent(draft, {
        request_id: requestId,
        actor_id: actor.id,
        kind: 'step',
        message: completing ? `تم إنجاز خطوة: ${step.title}` : `أُعيد فتح خطوة: ${step.title}`,
        visibility: 'internal',
      });
      appendAudit(
        draft,
        asAuditActor(actor),
        completing ? 'request.step_completed' : 'request.step_reopened',
        { type: 'request', id: requestId, branch_id: target.branch_id },
        `${target.ref}: ${step.title}`,
      );
    });
  }

  assign(actor: Profile, requestId: string, assigneeId: string): void {
    const request = this.state.requests.find((r) => r.id === requestId);
    if (!request) throw new DomainError('المعاملة غير موجودة.');
    this.authorize(actor, 'requests.assign', request.branch_id);
    const assignee = this.state.profiles.find((p) => p.id === assigneeId && p.is_active);
    if (!assignee) throw new DomainError('اختر موظفًا مفعّلًا.');
    if (assignee.role !== 'admin' && assignee.branch_id !== request.branch_id) throw new DomainError('الموظف يتبع فرعًا آخر.');

    this.commit((draft) => {
      const target = this.requireRequest(draft, requestId);
      target.assignee_id = assigneeId;
      target.updated_at = new Date().toISOString();
      this.pushEvent(draft, { request_id: requestId, actor_id: actor.id, kind: 'assignment', message: `أُسندت المعاملة إلى ${assignee.full_name}`, visibility: 'internal' });
      appendAudit(draft, asAuditActor(actor), 'request.assigned', { type: 'request', id: requestId, branch_id: target.branch_id }, `${target.ref} ← ${assignee.full_name}`);
    });
  }

  addNote(actor: Profile, requestId: string, message: string, visibility: 'public' | 'internal'): void {
    const request = this.state.requests.find((r) => r.id === requestId);
    if (!request) throw new DomainError('المعاملة غير موجودة.');
    this.authorize(actor, 'requests.update', request.branch_id);
    if (!message.trim()) throw new DomainError('اكتب نص الملاحظة.');
    this.commit((draft) => {
      this.pushEvent(draft, { request_id: requestId, actor_id: actor.id, kind: 'note', message: message.trim(), visibility });
      appendAudit(
        draft,
        asAuditActor(actor),
        'request.note_added',
        { type: 'request', id: requestId, branch_id: request.branch_id },
        `${request.ref}: ملاحظة ${visibility === 'public' ? 'ظاهرة للعميل' : 'داخلية'}`,
      );
    });
  }

  /* -------------------------------- documents ------------------------------- */

  uploadDocument(actor: Profile, requestId: string, input: { doc_type: string; file_name: string; mime: string; size: number; data_url?: string; original_held: boolean }): void {
    const request = this.state.requests.find((r) => r.id === requestId);
    if (!request) throw new DomainError('المعاملة غير موجودة.');
    this.authorize(actor, 'documents.upload', request.branch_id);
    if (input.size > MAX_UPLOAD_BYTES) throw new DomainError('حجم الملف أكبر من 2 م.ب (حد نسخة العرض).');
    if (!/^(application\/pdf|image\/(png|jpeg|webp))$/.test(input.mime)) throw new DomainError('الأنواع المسموحة: PDF أو صور PNG/JPG/WEBP.');

    this.commit((draft) => {
      const doc: DocumentRecord = { id: uid('doc'), request_id: requestId, uploaded_by: actor.id, uploaded_at: new Date().toISOString(), ...input };
      draft.documents.push(doc);
      this.pushEvent(draft, { request_id: requestId, actor_id: actor.id, kind: 'document', message: `رفع مستند: ${input.doc_type}${input.original_held ? ' (الأصل محفوظ بالمكتب)' : ''}`, visibility: 'internal' });
      appendAudit(draft, asAuditActor(actor), 'document.uploaded', { type: 'document', id: doc.id, branch_id: request.branch_id }, `${request.ref}: ${input.doc_type}`);
    });
  }

  logDocumentView(actor: Profile, documentId: string): void {
    const doc = this.state.documents.find((d) => d.id === documentId);
    const request = doc && this.state.requests.find((r) => r.id === doc.request_id);
    if (!doc || !request) return;
    this.authorize(actor, 'requests.view', request.branch_id);
    this.commit((draft) => appendAudit(draft, asAuditActor(actor), 'document.viewed', { type: 'document', id: documentId, branch_id: request.branch_id }, `${request.ref}: عرض ${doc.doc_type}`));
  }

  returnOriginal(actor: Profile, documentId: string): void {
    const doc = this.state.documents.find((d) => d.id === documentId);
    const request = doc && this.state.requests.find((r) => r.id === doc.request_id);
    if (!doc || !request) throw new DomainError('المستند غير موجود.');
    this.authorize(actor, 'documents.upload', request.branch_id);
    this.commit((draft) => {
      const target = draft.documents.find((d) => d.id === documentId);
      if (target) target.returned_at = new Date().toISOString();
      this.pushEvent(draft, { request_id: request.id, actor_id: actor.id, kind: 'document', message: `تسليم أصل «${doc.doc_type}» للعميل`, visibility: 'public' });
      appendAudit(draft, asAuditActor(actor), 'document.original_returned', { type: 'document', id: documentId, branch_id: request.branch_id }, `${request.ref}: رد أصل ${doc.doc_type}`);
    });
  }

  deleteDocument(actor: Profile, documentId: string, reason: string): void {
    const doc = this.state.documents.find((d) => d.id === documentId);
    const request = doc && this.state.requests.find((r) => r.id === doc.request_id);
    if (!doc || !request) throw new DomainError('المستند غير موجود.');
    this.authorize(actor, 'documents.delete', request.branch_id);
    if (!reason.trim()) throw new DomainError('اذكر سبب الحذف.');
    this.commit((draft) => {
      draft.documents = draft.documents.filter((d) => d.id !== documentId);
      this.pushEvent(draft, { request_id: request.id, actor_id: actor.id, kind: 'document', message: `حذف مستند «${doc.doc_type}» — السبب: ${reason.trim()}`, visibility: 'internal' });
      appendAudit(draft, asAuditActor(actor), 'document.deleted', { type: 'document', id: documentId, branch_id: request.branch_id }, `${request.ref}: حذف ${doc.doc_type} — ${reason.trim()}`);
    });
  }

  /* ------------------------------ money & receipts --------------------------- */

  private nextReceiptNo(draft: DatabaseState, branch: Branch): string {
    const prefix = `${branch.receipt_prefix}-${new Date().getFullYear()}-`;
    const max = draft.payments.filter((p) => p.receipt_no.startsWith(prefix)).reduce((m, p) => Math.max(m, Number(p.receipt_no.slice(prefix.length)) || 0), 0);
    return `${prefix}${String(max + 1).padStart(5, '0')}`;
  }

  recordPayment(actor: Profile, requestId: string, input: { kind: PaymentKind; method: PaymentMethod; amount: number; note?: string }): PaymentRecord {
    const request = this.state.requests.find((r) => r.id === requestId);
    if (!request) throw new DomainError('المعاملة غير موجودة.');
    this.authorize(actor, 'payments.record', request.branch_id);
    const amount = Math.round(input.amount);
    if (!Number.isFinite(amount) || amount <= 0) throw new DomainError('أدخل مبلغًا صحيحًا أكبر من صفر.');
    if (amount > 1_000_000) throw new DomainError('المبلغ أكبر من الحد المسموح لعملية واحدة.');
    const branch = this.state.branches.find((b) => b.id === request.branch_id);
    if (!branch) throw new DomainError('الفرع غير موجود.');

    let payment!: PaymentRecord;
    this.commit((draft) => {
      payment = {
        id: uid('pay'),
        receipt_no: this.nextReceiptNo(draft, branch),
        request_id: requestId,
        branch_id: request.branch_id,
        kind: input.kind,
        method: input.method,
        amount,
        received_by: actor.id,
        received_at: new Date().toISOString(),
        note: input.note?.trim() || undefined,
      };
      draft.payments.push(payment);
      this.pushEvent(draft, { request_id: requestId, actor_id: actor.id, kind: 'payment', message: `تحصيل ${amount} ج.م بإيصال ${payment.receipt_no}`, visibility: 'internal' });
      appendAudit(draft, asAuditActor(actor), 'payment.recorded', { type: 'payment', id: payment.id, branch_id: request.branch_id }, `${payment.receipt_no}: ${amount} ج.م — ${request.ref}`);
    });
    return payment;
  }

  voidPayment(actor: Profile, paymentId: string, reason: string): void {
    const payment = this.state.payments.find((p) => p.id === paymentId);
    if (!payment) throw new DomainError('الإيصال غير موجود.');
    this.authorize(actor, 'payments.void', payment.branch_id);
    if (payment.voided) throw new DomainError('الإيصال ملغي بالفعل.');
    if (payment.received_by === actor.id) throw new DomainError('لا يجوز إلغاء إيصال أصدرته بنفسك — يلغيه مدير آخر (مبدأ الفصل بين المهام).');
    if (reason.trim().length < 5) throw new DomainError('اكتب سببًا واضحًا للإلغاء.');
    this.commit((draft) => {
      const target = draft.payments.find((p) => p.id === paymentId);
      if (target) target.voided = { at: new Date().toISOString(), by: actor.id, reason: reason.trim() };
      appendAudit(draft, asAuditActor(actor), 'payment.voided', { type: 'payment', id: paymentId, branch_id: payment.branch_id }, `إلغاء ${payment.receipt_no} — ${reason.trim()}`);
    });
  }

  logReceiptPrint(actor: Profile, paymentId: string): void {
    const payment = this.state.payments.find((p) => p.id === paymentId);
    if (!payment) return;
    this.commit((draft) => appendAudit(draft, asAuditActor(actor), 'receipt.printed', { type: 'payment', id: paymentId, branch_id: payment.branch_id }, `طباعة ${payment.receipt_no}`));
  }

  recordDisbursement(actor: Profile, requestId: string, input: { authority: string; description: string; amount: number; official_receipt_no: string }): void {
    const request = this.state.requests.find((r) => r.id === requestId);
    if (!request) throw new DomainError('المعاملة غير موجودة.');
    this.authorize(actor, 'disbursements.record', request.branch_id);
    const amount = Math.round(input.amount);
    if (!Number.isFinite(amount) || amount <= 0) throw new DomainError('أدخل مبلغًا صحيحًا.');
    if (!input.official_receipt_no.trim()) throw new DomainError('رقم الإيصال الحكومي مطلوب — لا صرف بدون إيصال رسمي.');
    if (!input.authority.trim() || !input.description.trim()) throw new DomainError('حدد الجهة وبيان الرسم.');
    this.commit((draft) => {
      const item: Disbursement = {
        id: uid('dsb'),
        request_id: requestId,
        authority: input.authority.trim(),
        description: input.description.trim(),
        amount,
        official_receipt_no: input.official_receipt_no.trim(),
        paid_at: new Date().toISOString(),
        paid_by: actor.id,
      };
      draft.disbursements.push(item);
      this.pushEvent(draft, { request_id: requestId, actor_id: actor.id, kind: 'payment', message: `سداد ${amount} ج.م لـ${item.authority} بإيصال رسمي ${item.official_receipt_no}`, visibility: 'internal' });
      appendAudit(draft, asAuditActor(actor), 'disbursement.recorded', { type: 'disbursement', id: item.id, branch_id: request.branch_id }, `${request.ref}: ${item.description} ${amount} ج.م`);
    });
  }

  logExport(actor: Profile, count: number): void {
    this.authorize(actor, 'requests.export');
    this.commit((draft) => appendAudit(draft, asAuditActor(actor), 'export.requests', { type: 'export', id: uid('exp') }, `تصدير ${count} معاملة إلى CSV`));
  }

  /* ---------------------------------- admin --------------------------------- */

  saveService(actor: Profile, service: ServiceType): ServiceType {
    this.authorize(actor, 'services.manage');
    if (!service.name.trim()) throw new DomainError('اسم الخدمة بالعربية مطلوب.');
    if (!service.category.trim()) throw new DomainError('اختر التصنيف.');
    if (service.required_documents.length === 0) throw new DomainError('أضف مستندًا مطلوبًا واحدًا على الأقل.');
    const steps = service.steps.filter((s) => s.title.trim());
    if (steps.length === 0) throw new DomainError('أضف خطوة واحدة على الأقل لمسار الخدمة.');
    if (steps.some((s) => !s.days || s.days < 1)) throw new DomainError('حدد مدة كل خطوة بيوم واحد على الأقل.');
    if (service.office_fee < 0 || service.gov_fee_estimate < 0) throw new DomainError('الرسوم لا يمكن أن تكون سالبة.');
    const isNew = !this.state.services.some((s) => s.id === service.id);
    if (this.state.services.some((s) => s.id !== service.id && s.name.trim() === service.name.trim())) throw new DomainError('توجد خدمة بنفس الاسم.');

    const saved: ServiceType = {
      ...service,
      name: service.name.trim(),
      name_en: service.name_en?.trim() || undefined,
      steps,
      estimated_days: steps.reduce((sum, s) => sum + (s.days ?? 0), 0),
      updated_at: new Date().toISOString(),
    };
    this.commit((draft) => {
      const index = draft.services.findIndex((s) => s.id === saved.id);
      if (index >= 0) draft.services[index] = saved;
      else draft.services.push(saved);
      appendAudit(
        draft,
        asAuditActor(actor),
        isNew ? 'service.created' : 'service.updated',
        { type: 'service', id: saved.id },
        isNew ? `إضافة خدمة ${saved.name} (${steps.length} خطوات، ${saved.estimated_days} يوم)` : `تعديل خدمة ${saved.name} — المعاملات المفتوحة تحتفظ بخطواتها الأصلية`,
      );
    });
    return saved;
  }

  saveUser(actor: Profile, input: Omit<Profile, 'id' | 'created_at' | 'last_login_at'> & { id?: string }): void {
    this.authorize(actor, 'users.manage');
    if (!input.full_name.trim() || !/^\S+@\S+\.\S+$/.test(input.email)) throw new DomainError('الاسم والبريد الإلكتروني مطلوبان.');
    if (this.state.profiles.some((p) => p.email.toLowerCase() === input.email.toLowerCase() && p.id !== input.id)) throw new DomainError('البريد مستخدم لحساب آخر.');
    if (input.id === actor.id && (!input.is_active || input.role !== 'admin')) throw new DomainError('لا يمكنك إيقاف حسابك أو تقليل صلاحياتك بنفسك.');
    this.commit((draft) => {
      const index = draft.profiles.findIndex((p) => p.id === input.id);
      if (index >= 0) {
        draft.profiles[index] = { ...draft.profiles[index], ...input, id: draft.profiles[index].id };
        appendAudit(draft, asAuditActor(actor), 'user.updated', { type: 'user', id: draft.profiles[index].id }, `تعديل بيانات ${input.full_name}`);
      } else {
        const id = uid('usr');
        draft.profiles.push({ ...input, id, created_at: new Date().toISOString() });
        const salt = crypto.randomUUID();
        draft.credentials.push({ profile_id: id, salt, hash: hashPassword(crypto.randomUUID(), salt) });
        appendAudit(draft, asAuditActor(actor), 'user.created', { type: 'user', id }, `إضافة ${input.full_name} — يُرسل رابط تعيين كلمة المرور على بريده`);
      }
    });
  }

  saveBranch(actor: Profile, branch: Branch): void {
    this.authorize(actor, 'branches.manage');
    if (!branch.name.trim() || !branch.address.trim()) throw new DomainError('اسم الفرع والعنوان مطلوبان.');
    if (!/^[A-Z]{2,3}$/.test(branch.receipt_prefix)) throw new DomainError('بادئة الإيصالات حرفان أو ثلاثة بالإنجليزية الكبيرة (مثال: ZG).');
    if (this.state.branches.some((b) => b.id !== branch.id && b.receipt_prefix === branch.receipt_prefix)) throw new DomainError('بادئة الإيصالات مستخدمة لفرع آخر.');
    for (const phone of branch.phones) if (!parseMobile(phone).ok && !/^0\d{8,9}$/.test(phone)) throw new DomainError(`رقم الهاتف ${phone} غير صحيح.`);
    const isNew = !this.state.branches.some((b) => b.id === branch.id);
    this.commit((draft) => {
      const index = draft.branches.findIndex((b) => b.id === branch.id);
      if (index >= 0) draft.branches[index] = branch;
      else draft.branches.push(branch);
      appendAudit(draft, asAuditActor(actor), isNew ? 'branch.created' : 'branch.updated', { type: 'branch', id: branch.id }, `${isNew ? 'إضافة' : 'تعديل بيانات'} ${branch.name}`);
    });
  }

  /* ------------------------------ audit integrity ---------------------------- */

  verifyAudit(actor: Profile): { ok: boolean; checked: number; brokenAt?: number } {
    this.authorize(actor, 'audit.view');
    const result = verifyChain(this.state.audit);
    this.commit((draft) =>
      appendAudit(draft, asAuditActor(actor), 'audit.verified', { type: 'audit', id: 'chain' }, result.ok ? `السجل سليم (${result.checked} عملية)` : `تم اكتشاف تعديل عند العملية رقم ${result.brokenAt}`),
    );
    return result;
  }

  /** Demo-only: edit an old audit row WITHOUT re-hashing, to show tamper detection. */
  simulateTampering(actor: Profile): number {
    this.authorize(actor, 'demo.reset');
    const victim = this.state.audit[Math.max(0, Math.floor(this.state.audit.length / 3))];
    this.commit((draft) => {
      const row = draft.audit.find((a) => a.seq === victim.seq);
      if (row) row.summary = `${row.summary} (تم تعديله يدويًا)`;
    });
    return victim.seq;
  }

  resetDemo(actor?: Profile): void {
    if (actor) this.authorize(actor, 'demo.reset');
    const seed = createSeed();
    if (actor) appendAudit(seed, asAuditActor(actor), 'demo.reset', { type: 'system', id: 'demo' }, 'إعادة ضبط بيانات العرض');
    this.failedLogins.clear();
    this.trackingChallenges.clear();
    this.persist(seed);
    this.state = seed;
    this.listeners.forEach((listener) => listener());
  }

  /* ------------------------------- public portal ----------------------------- */

  submitPublicRequest(input: { full_name: string; phone: string; national_id?: string; service_id: string; branch_id: string; notes?: string; consent: boolean }): { ref: string } {
    if (!input.consent) throw new DomainError('يجب الموافقة على سياسة الخصوصية لإرسال الطلب.');
    if (input.full_name.trim().split(/\s+/).length < 3) throw new DomainError('اكتب اسمك ثلاثيًا على الأقل.');
    const phone = parseMobile(input.phone);
    if (!phone.ok) throw new DomainError(phone.error);
    let nationalId = '';
    if (input.national_id?.trim()) {
      const nid = parseNationalId(input.national_id);
      if (!nid.ok) throw new DomainError(nid.error);
      nationalId = nid.value;
    }
    const service = this.state.services.find((s) => s.id === input.service_id && s.is_active);
    if (!service) throw new DomainError('اختر الخدمة المطلوبة.');
    if (!this.state.branches.some((b) => b.id === input.branch_id)) throw new DomainError('اختر الفرع.');

    let ref = '';
    this.commit((draft) => {
      const now = new Date().toISOString();
      // Online data is never merged into an existing file automatically: staff verify the
      // person's ID card at the branch first (prevents attaching requests to someone else's file).
      const client: Client = {
        id: uid('cli'),
        kind: 'individual',
        full_name: input.full_name.trim(),
        national_id: nationalId,
        phone: phone.value,
        address: '',
        branch_id: input.branch_id,
        notes: 'سُجِّل من الموقع — يلزم التحقق من الهوية بأصل البطاقة عند الحضور',
        consent: { at: now, version: 'privacy-v1', channel: 'online' },
        created_at: now,
      };
      draft.clients.push(client);
      const request: RequestRecord = {
        id: uid('req'),
        ref: this.nextRequestRef(draft),
        client_id: client.id,
        service_id: service.id,
        branch_id: input.branch_id,
        status: 'new',
        priority: 'normal',
        channel: 'online',
        received_at: now,
        target_date: addBusinessDays(now, service.estimated_days),
        office_fee: service.office_fee,
        gov_fee_estimate: service.gov_fee_estimate,
        notes: input.notes?.trim() || undefined,
        steps: snapshotSteps(service),
        created_at: now,
        updated_at: now,
      };
      ref = request.ref;
      draft.requests.push(request);
      this.pushEvent(draft, { request_id: request.id, actor_id: 'public', kind: 'created', to_status: 'new', message: 'استلمنا طلبك من الموقع، وسنتواصل معك لتحديد موعد تسليم الأوراق', visibility: 'public' });
      appendAudit(draft, PUBLIC_ACTOR, 'public.request_submitted', { type: 'request', id: request.id, branch_id: request.branch_id }, `${request.ref} — ${service.name}`);
    });
    return { ref };
  }

  startTracking(ref: string, phoneInput: string): { ok: true; maskedPhone: string; demoCode: string } | { ok: false; message: string } {
    const phone = parseMobile(phoneInput);
    const request = this.state.requests.find((r) => r.ref === ref.trim().toUpperCase());
    const client = request && this.state.clients.find((c) => c.id === request.client_id);
    const matches = phone.ok && client && (client.phone === phone.value || client.phone_alt === phone.value);
    if (!request || !client || !matches || !phone.ok) {
      this.commit((draft) => appendAudit(draft, PUBLIC_ACTOR, 'public.tracking_failed', { type: 'request', id: ref.trim().toUpperCase() || '—' }, 'رقم معاملة أو موبايل غير مطابق'));
      // Identical message whether the reference exists or not.
      return { ok: false, message: 'لم نجد معاملة بهذه البيانات. راجع رقم المعاملة ورقم الموبايل المسجل.' };
    }
    const code = String(Math.floor(100000 + Math.random() * 900000));
    this.trackingChallenges.set(request.ref, { requestId: request.id, code, expiresAt: Date.now() + 5 * 60_000, attempts: 0 });
    return { ok: true, maskedPhone: `${phone.value.slice(0, 3)}•••••${phone.value.slice(-3)}`, demoCode: code };
  }

  verifyTracking(ref: string, code: string): { ok: true; view: TrackingView } | { ok: false; message: string; expired?: boolean } {
    const key = ref.trim().toUpperCase();
    const challenge = this.trackingChallenges.get(key);
    if (!challenge || challenge.expiresAt < Date.now()) {
      this.trackingChallenges.delete(key);
      return { ok: false, message: 'انتهت صلاحية رمز التحقق. اطلب رمزًا جديدًا.', expired: true };
    }
    if (challenge.code !== code.trim()) {
      challenge.attempts += 1;
      if (challenge.attempts >= 3) {
        this.trackingChallenges.delete(key);
        return { ok: false, message: 'تم إدخال الرمز خطأ 3 مرات. اطلب رمزًا جديدًا.', expired: true };
      }
      return { ok: false, message: 'رمز التحقق غير صحيح.' };
    }
    this.trackingChallenges.delete(key);

    const request = this.state.requests.find((r) => r.id === challenge.requestId)!;
    const service = this.state.services.find((s) => s.id === request.service_id);
    const branch = this.state.branches.find((b) => b.id === request.branch_id)!;
    const uploaded = new Set(this.state.documents.filter((d) => d.request_id === request.id).map((d) => d.doc_type));
    this.commit((draft) => appendAudit(draft, PUBLIC_ACTOR, 'public.tracking_viewed', { type: 'request', id: request.id, branch_id: request.branch_id }, `استعلام العميل عن ${request.ref} بعد التحقق برمز الموبايل`));

    return {
      ok: true,
      view: {
        ref: request.ref,
        service: service?.name ?? '—',
        branch,
        status: request.status,
        received_at: request.received_at,
        target_date: request.target_date,
        milestones: request.steps.filter((s) => s.milestone).map((s) => ({ title: s.title, done: Boolean(s.done_at), done_at: s.done_at })),
        updates: this.state.events
          .filter((e) => e.request_id === request.id && e.visibility === 'public')
          .sort((a, b) => b.at.localeCompare(a.at))
          .map((e) => ({ at: e.at, message: e.message })),
        missing_documents: (service?.required_documents ?? []).map((d) => d.name).filter((name) => !uploaded.has(name)),
      },
    };
  }
}

export const store = new DemoStore();
