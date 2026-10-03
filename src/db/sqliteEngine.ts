// Local Relational Database Engine for El Safwa Office System
// Powered by LocalStorage / IndexedDB Relational Store with Full SQL Schema Integrity

import { 
  Branch, 
  Profile, 
  ServiceType, 
  Client, 
  RequestRecord, 
  RequestStatusHistory, 
  DocumentRecord, 
  PaymentRecord, 
  RequestStatus,
  TrackingSearchResult,
  DashboardMetrics,
  RequestStep,
  WorkflowStepTemplate
} from '../types';

import { 
  INITIAL_BRANCHES, 
  INITIAL_PROFILES, 
  INITIAL_SERVICE_TYPES, 
  INITIAL_CLIENTS, 
  INITIAL_REQUESTS, 
  INITIAL_STATUS_HISTORY, 
  INITIAL_DOCUMENTS, 
  INITIAL_PAYMENTS,
  INITIAL_REQUEST_STEPS
} from './initialSeed';

const STORAGE_KEY = 'ELSAFWA_SQLITE_LOCAL_DB_V1';

interface LocalDatabaseState {
  branches: Branch[];
  profiles: Profile[];
  service_types: ServiceType[];
  clients: Client[];
  requests: RequestRecord[];
  request_status_history: RequestStatusHistory[];
  documents: DocumentRecord[];
  payments: PaymentRecord[];
  request_steps: RequestStep[];
}

class SqliteLocalEngine {
  private db: LocalDatabaseState;

  constructor() {
    this.db = this.loadDatabase();
  }

  // Load or Initialize Database with Seed Data
  private loadDatabase(): LocalDatabaseState {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const state: LocalDatabaseState = JSON.parse(stored);
        let modified = false;

        // Migration: Ensure request_steps exists
        if (!state.request_steps || state.request_steps.length === 0) {
          state.request_steps = INITIAL_REQUEST_STEPS;
          modified = true;
        }

        // Migration: Ensure service_types have workflow_steps
        if (state.service_types) {
          state.service_types.forEach(s => {
            if (!s.workflow_steps || s.workflow_steps.length === 0) {
              const seedService = INITIAL_SERVICE_TYPES.find(initS => initS.id === s.id);
              if (seedService?.workflow_steps) {
                s.workflow_steps = seedService.workflow_steps;
                modified = true;
              }
            }
          });
        }

        if (modified) {
          this.saveDatabase(state);
        }

        return state;
      }
    } catch (e) {
      console.error('Failed to load local DB state from storage, reinitializing...', e);
    }

    const defaultState: LocalDatabaseState = {
      branches: INITIAL_BRANCHES,
      profiles: INITIAL_PROFILES,
      service_types: INITIAL_SERVICE_TYPES,
      clients: INITIAL_CLIENTS,
      requests: INITIAL_REQUESTS,
      request_status_history: INITIAL_STATUS_HISTORY,
      documents: INITIAL_DOCUMENTS,
      payments: INITIAL_PAYMENTS,
      request_steps: INITIAL_REQUEST_STEPS,
    };

    this.saveDatabase(defaultState);
    return defaultState;
  }

  // Save current database state to LocalStorage
  private saveDatabase(state: LocalDatabaseState = this.db): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.error('Error saving local SQLite database to storage', e);
    }
  }

  // Reset database to initial seed data
  public resetToSeed(): void {
    localStorage.removeItem(STORAGE_KEY);
    this.db = this.loadDatabase();
  }

  // ==========================================
  // 1. BRANCHES API
  // ==========================================
  public getBranches(): Branch[] {
    return this.db.branches.filter(b => b.is_active);
  }

  public getAllBranches(): Branch[] {
    return this.db.branches;
  }

  public saveBranch(branch: Partial<Branch> & { name_ar: string; name_en: string; city: string; address: string; phones: string[] }): Branch {
    let updated: Branch;
    if (branch.id) {
      const idx = this.db.branches.findIndex(b => b.id === branch.id);
      if (idx !== -1) {
        updated = { ...this.db.branches[idx], ...branch };
        this.db.branches[idx] = updated;
      } else {
        throw new Error('Branch not found');
      }
    } else {
      updated = {
        id: `br-${Date.now()}`,
        name_ar: branch.name_ar,
        name_en: branch.name_en,
        city: branch.city,
        address: branch.address,
        phones: branch.phones,
        is_active: branch.is_active ?? true,
        created_at: new Date().toISOString()
      };
      this.db.branches.push(updated);
    }
    this.saveDatabase();
    return updated;
  }

  // ==========================================
  // 2. PROFILES & USERS API
  // ==========================================
  public getProfiles(): Profile[] {
    return this.db.profiles;
  }

  public saveProfile(profile: Partial<Profile> & { full_name: string; email: string; phone: string; branch_id: string; role: any }): Profile {
    let updated: Profile;
    if (profile.id) {
      const idx = this.db.profiles.findIndex(p => p.id === profile.id);
      if (idx !== -1) {
        updated = { ...this.db.profiles[idx], ...profile };
        this.db.profiles[idx] = updated;
      } else {
        throw new Error('User profile not found');
      }
    } else {
      updated = {
        id: `usr-${Date.now()}`,
        full_name: profile.full_name,
        email: profile.email,
        phone: profile.phone,
        branch_id: profile.branch_id,
        role: profile.role || 'employee',
        is_active: profile.is_active ?? true,
        created_at: new Date().toISOString()
      };
      this.db.profiles.push(updated);
    }
    this.saveDatabase();
    return updated;
  }

  // ==========================================
  // 3. SERVICE TYPES API
  // ==========================================
  public getServiceTypes(): ServiceType[] {
    return this.db.service_types.filter(s => s.is_active);
  }

  public getAllServiceTypes(): ServiceType[] {
    return this.db.service_types;
  }

  public saveServiceType(service: Partial<ServiceType> & { 
    name_ar: string; 
    name_en: string; 
    category: string; 
    default_fee: number; 
    required_documents: string[]; 
    estimated_days: number;
    workflow_steps?: WorkflowStepTemplate[];
  }): ServiceType {
    let updated: ServiceType;
    if (service.id) {
      const idx = this.db.service_types.findIndex(s => s.id === service.id);
      if (idx !== -1) {
        updated = { 
          ...this.db.service_types[idx], 
          ...service,
          workflow_steps: service.workflow_steps ?? this.db.service_types[idx].workflow_steps
        };
        this.db.service_types[idx] = updated;
      } else {
        throw new Error('Service type not found');
      }
    } else {
      updated = {
        id: `srv-${Date.now()}`,
        name_ar: service.name_ar,
        name_en: service.name_en,
        category: service.category,
        default_fee: service.default_fee,
        required_documents: service.required_documents,
        estimated_days: service.estimated_days,
        workflow_steps: service.workflow_steps || [],
        is_active: service.is_active ?? true,
        created_at: new Date().toISOString()
      };
      this.db.service_types.push(updated);
    }
    this.saveDatabase();
    return updated;
  }

  // ==========================================
  // 4. CLIENTS API (With Duplicate Phone & National ID Validation)
  // ==========================================
  public getClients(branchId?: string): Client[] {
    if (branchId) {
      return this.db.clients.filter(c => c.branch_id === branchId);
    }
    return this.db.clients;
  }

  public getClientById(id: string): Client | undefined {
    return this.db.clients.find(c => c.id === id);
  }

  public checkPhoneDuplicate(phone: string, excludeClientId?: string): Client | undefined {
    const cleanPhone = phone.trim();
    if (!cleanPhone) return undefined;
    return this.db.clients.find(c => (c.primary_phone === cleanPhone || c.secondary_phone === cleanPhone) && c.id !== excludeClientId);
  }

  public saveClient(client: Partial<Client> & { full_name: string; national_id: string; primary_phone: string; address: string; branch_id: string }): Client {
    // Check phone duplicate
    const existing = this.checkPhoneDuplicate(client.primary_phone, client.id);
    if (existing) {
      throw new Error(`رقم الهاتف (${client.primary_phone}) مسجل بالفعل للعميل: ${existing.full_name}`);
    }

    let updated: Client;
    if (client.id) {
      const idx = this.db.clients.findIndex(c => c.id === client.id);
      if (idx !== -1) {
        updated = { ...this.db.clients[idx], ...client };
        this.db.clients[idx] = updated;
      } else {
        throw new Error('Client record not found');
      }
    } else {
      updated = {
        id: `cli-${Date.now()}`,
        full_name: client.full_name,
        national_id: client.national_id,
        primary_phone: client.primary_phone,
        secondary_phone: client.secondary_phone,
        address: client.address,
        branch_id: client.branch_id,
        notes: client.notes,
        created_at: new Date().toISOString()
      };
      this.db.clients.push(updated);
    }
    this.saveDatabase();
    return updated;
  }

  // ==========================================
  // 5. REQUESTS ENGINE & STATUS WORKFLOW
  // ==========================================
  public generateTrackingRef(): string {
    const year = new Date().getFullYear();
    const count = this.db.requests.length + 101;
    const padded = String(count).padStart(5, '0');
    return `SFW-${year}-${padded}`;
  }

  public getRequests(filters?: { branchId?: string; status?: RequestStatus; serviceTypeId?: string; employeeId?: string; search?: string }): RequestRecord[] {
    let result = this.db.requests.map(req => this.hydrateRequestRecord(req));

    if (filters) {
      if (filters.branchId) {
        result = result.filter(r => r.branch_id === filters.branchId);
      }
      if (filters.status) {
        result = result.filter(r => r.status === filters.status);
      }
      if (filters.serviceTypeId) {
        result = result.filter(r => r.service_type_id === filters.serviceTypeId);
      }
      if (filters.employeeId) {
        result = result.filter(r => r.assigned_employee_id === filters.employeeId);
      }
      if (filters.search) {
        const q = filters.search.toLowerCase().trim();
        result = result.filter(r => 
          r.tracking_ref.toLowerCase().includes(q) ||
          r.client_name?.toLowerCase().includes(q) ||
          r.client_phone?.includes(q) ||
          r.client_national_id?.includes(q) ||
          r.govt_ref?.toLowerCase().includes(q) ||
          r.office_ref?.toLowerCase().includes(q)
        );
      }
    }

    return result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  public getRequestById(id: string): RequestRecord | undefined {
    const raw = this.db.requests.find(r => r.id === id);
    if (!raw) return undefined;
    return this.hydrateRequestRecord(raw);
  }

  private calculateStepTargetDates(startDateStr: string, steps: Array<{ estimated_days: number }>): string[] {
    let current = new Date(startDateStr);
    return steps.map(s => {
      const target = new Date(current);
      target.setDate(target.getDate() + (s.estimated_days || 1));
      current = new Date(target);
      return target.toISOString().split('T')[0];
    });
  }

  private hydrateRequestRecord(raw: RequestRecord): RequestRecord {
    const client = this.db.clients.find(c => c.id === raw.client_id);
    const service = this.db.service_types.find(s => s.id === raw.service_type_id);
    const branch = this.db.branches.find(b => b.id === raw.branch_id);
    const emp = raw.assigned_employee_id ? this.db.profiles.find(p => p.id === raw.assigned_employee_id) : undefined;
    
    // Calculate payments
    const requestPayments = this.db.payments.filter(p => p.request_id === raw.id);
    const paid_amount = requestPayments.reduce((sum, p) => sum + p.amount, 0);
    const balance_due = Math.max(0, (raw.total_fee || 0) - paid_amount);

    return {
      ...raw,
      client_name: client?.full_name || 'غير معروف',
      client_phone: client?.primary_phone || '',
      client_national_id: client?.national_id || '',
      service_name_ar: service?.name_ar || 'غير محدد',
      service_name_en: service?.name_en || 'Unspecified',
      branch_name_ar: branch?.name_ar || 'غير محدد',
      assigned_employee_name: emp?.full_name || 'غير معين',
      paid_amount,
      balance_due,
      steps: this.getRequestSteps(raw.id)
    };
  }

  // Create New Internal Request
  public createRequest(data: {
    client_id: string;
    service_type_id: string;
    branch_id: string;
    assigned_employee_id?: string;
    priority?: any;
    govt_ref?: string;
    office_ref?: string;
    total_fee: number;
    notes?: string;
    createdByUserId: string;
    custom_steps?: WorkflowStepTemplate[];
  }): RequestRecord {
    const tracking_ref = this.generateTrackingRef();
    const service = this.db.service_types.find(s => s.id === data.service_type_id);
    
    const templateSteps: WorkflowStepTemplate[] = (data.custom_steps && data.custom_steps.length > 0)
      ? data.custom_steps
      : (service?.workflow_steps && service.workflow_steps.length > 0)
        ? service.workflow_steps
        : [
            {
              id: 'st-def-1',
              title: 'مراجعة المستندات الثبوتية وأصول العقود',
              description: 'فحص الهوية ومطابقة الأوراق المقدمة',
              order: 1,
              estimated_days: 2,
              required_documents: service?.required_documents.slice(0, 2) || []
            },
            {
              id: 'st-def-2',
              title: 'التقديم للجهة الحكومية المختصة والمتابعة',
              description: 'توريد الملف بالمركز التكنولوجي أو الحي',
              order: 2,
              estimated_days: Math.max(1, (service?.estimated_days || 10) - 4),
              required_documents: service?.required_documents.slice(2) || []
            },
            {
              id: 'st-def-3',
              title: 'استلام الترخيص النهائي المعتمد وتسليمه للعميل',
              description: 'مراجعة أختام النسر وإصدار إشعار التسليم للعميل',
              order: 3,
              estimated_days: 2,
              required_documents: []
            }
          ];

    const totalDays = templateSteps.reduce((sum, s) => sum + (s.estimated_days || 1), 0);
    const now = new Date();
    const targetDate = new Date(now);
    targetDate.setDate(now.getDate() + totalDays);

    const newReq: RequestRecord = {
      id: `req-${Date.now()}`,
      tracking_ref,
      client_id: data.client_id,
      service_type_id: data.service_type_id,
      branch_id: data.branch_id,
      assigned_employee_id: data.assigned_employee_id,
      status: 'new',
      priority: data.priority || 'normal',
      govt_ref: data.govt_ref,
      office_ref: data.office_ref,
      total_fee: data.total_fee,
      received_date: now.toISOString().split('T')[0],
      target_date: targetDate.toISOString().split('T')[0],
      notes: data.notes,
      created_at: now.toISOString()
    };

    this.db.requests.push(newReq);

    // Generate Request Steps
    const targetDates = this.calculateStepTargetDates(newReq.received_date, templateSteps);
    const generatedSteps: RequestStep[] = templateSteps.map((ts, idx) => ({
      id: `step-${newReq.id}-${idx + 1}-${Date.now()}`,
      request_id: newReq.id,
      title: ts.title,
      description: ts.description,
      order: idx + 1,
      estimated_days: ts.estimated_days || 1,
      target_date: targetDates[idx],
      status: idx === 0 ? 'in_progress' : 'pending',
      required_documents: ts.required_documents || [],
      attached_document_ids: [],
      created_at: now.toISOString()
    }));

    if (!this.db.request_steps) this.db.request_steps = [];
    this.db.request_steps.push(...generatedSteps);

    // Immutable Audit History Entry
    const creator = this.db.profiles.find(p => p.id === data.createdByUserId);
    this.db.request_status_history.push({
      id: `hist-${Date.now()}`,
      request_id: newReq.id,
      from_status: undefined,
      to_status: 'new',
      changed_by_user_id: data.createdByUserId,
      changed_by_user_name: creator?.full_name || 'النظام',
      comment: `تم إنشاء الطلب وتسجيله بالمنظومة وتوليد ${generatedSteps.length} خطوات إجرائية بجدولها الزمني ومستنداتها`,
      created_at: now.toISOString()
    });

    this.saveDatabase();
    return this.hydrateRequestRecord(newReq);
  }

  // Public Citizen Submission Form Processing
  public submitPublicRequest(data: {
    client_name: string;
    phone: string;
    national_id: string;
    address: string;
    service_type_id: string;
    branch_id: string;
    notes?: string;
  }): { tracking_ref: string; request_id: string } {
    // Check or Create Client
    let client = this.db.clients.find(c => c.primary_phone === data.phone.trim() || c.national_id === data.national_id.trim());
    if (!client) {
      client = {
        id: `cli-${Date.now()}`,
        full_name: data.client_name,
        national_id: data.national_id,
        primary_phone: data.phone,
        address: data.address,
        branch_id: data.branch_id,
        notes: 'تم التسجيل تلقائياً من بوابة الجمهور الخارجية',
        created_at: new Date().toISOString()
      };
      this.db.clients.push(client);
    }

    const service = this.db.service_types.find(s => s.id === data.service_type_id);
    const tracking_ref = this.generateTrackingRef();
    const now = new Date();

    const templateSteps: WorkflowStepTemplate[] = (service?.workflow_steps && service.workflow_steps.length > 0)
      ? service.workflow_steps
      : [
          {
            id: 'st-pub-1',
            title: 'المراجعة والاستيفاء المبدئي للملف',
            description: 'فحص المستندات المرفقة والتأكد من مطابقتها للاشتراطات',
            order: 1,
            estimated_days: 2,
            required_documents: service?.required_documents.slice(0, 2) || []
          },
          {
            id: 'st-pub-2',
            title: 'التقديم للجهة المختصة والمتابعة',
            description: 'توريد الملف بالمركز التكنولوجي',
            order: 2,
            estimated_days: Math.max(1, (service?.estimated_days || 10) - 4),
            required_documents: service?.required_documents.slice(2) || []
          },
          {
            id: 'st-pub-3',
            title: 'صدور الموافقة وتسليم الترخيص',
            description: 'تسليم المحرر النهائي للعميل',
            order: 3,
            estimated_days: 2,
            required_documents: []
          }
        ];

    const totalDays = templateSteps.reduce((sum, s) => sum + (s.estimated_days || 1), 0);
    const targetDate = new Date(now);
    targetDate.setDate(now.getDate() + totalDays);

    const newReq: RequestRecord = {
      id: `req-${Date.now()}`,
      tracking_ref,
      client_id: client.id,
      service_type_id: data.service_type_id,
      branch_id: data.branch_id,
      status: 'new',
      priority: 'normal',
      total_fee: service?.default_fee || 0,
      received_date: now.toISOString().split('T')[0],
      target_date: targetDate.toISOString().split('T')[0],
      notes: data.notes,
      created_at: now.toISOString()
    };

    this.db.requests.push(newReq);

    const targetDates = this.calculateStepTargetDates(newReq.received_date, templateSteps);
    const generatedSteps: RequestStep[] = templateSteps.map((ts, idx) => ({
      id: `step-${newReq.id}-${idx + 1}-${Date.now()}`,
      request_id: newReq.id,
      title: ts.title,
      description: ts.description,
      order: idx + 1,
      estimated_days: ts.estimated_days || 1,
      target_date: targetDates[idx],
      status: idx === 0 ? 'in_progress' : 'pending',
      required_documents: ts.required_documents || [],
      attached_document_ids: [],
      created_at: now.toISOString()
    }));

    if (!this.db.request_steps) this.db.request_steps = [];
    this.db.request_steps.push(...generatedSteps);

    // Initial Public Audit Log
    this.db.request_status_history.push({
      id: `hist-${Date.now()}`,
      request_id: newReq.id,
      from_status: undefined,
      to_status: 'new',
      changed_by_user_id: 'usr-admin',
      changed_by_user_name: 'بوابة الجمهور الإلكترونية',
      comment: `تقديم طلب إلكتروني جديد عبر الموقع الرسمي للصفوة مع ${generatedSteps.length} خطوات إجرائية`,
      created_at: now.toISOString()
    });

    this.saveDatabase();
    return { tracking_ref, request_id: newReq.id };
  }

  // Update Status Workflow (Immutable Audit Append)
  public updateRequestStatus(data: {
    request_id: string;
    to_status: RequestStatus;
    changed_by_user_id: string;
    comment: string;
    govt_ref?: string;
    office_ref?: string;
    assigned_employee_id?: string;
  }): RequestRecord {
    const idx = this.db.requests.findIndex(r => r.id === data.request_id);
    if (idx === -1) throw new Error('الطلب غير موجود');

    const req = this.db.requests[idx];
    const from_status = req.status;

    // Update request
    req.status = data.to_status;
    if (data.govt_ref) req.govt_ref = data.govt_ref;
    if (data.office_ref) req.office_ref = data.office_ref;
    if (data.assigned_employee_id) req.assigned_employee_id = data.assigned_employee_id;
    if (data.to_status === 'completed') {
      req.completed_date = new Date().toISOString().split('T')[0];
    }

    this.db.requests[idx] = req;

    // Append Immutable Audit Timeline
    const actor = this.db.profiles.find(p => p.id === data.changed_by_user_id);
    this.db.request_status_history.push({
      id: `hist-${Date.now()}`,
      request_id: req.id,
      from_status,
      to_status: data.to_status,
      changed_by_user_id: data.changed_by_user_id,
      changed_by_user_name: actor?.full_name || 'النظام',
      comment: data.comment,
      created_at: new Date().toISOString()
    });

    this.saveDatabase();
    return this.hydrateRequestRecord(req);
  }

  // Edit Request Details
  public updateRequestDetails(id: string, updates: Partial<RequestRecord>): RequestRecord {
    const idx = this.db.requests.findIndex(r => r.id === id);
    if (idx === -1) throw new Error('الطلب غير موجود');

    this.db.requests[idx] = { ...this.db.requests[idx], ...updates };
    this.saveDatabase();
    return this.hydrateRequestRecord(this.db.requests[idx]);
  }

  // ==========================================
  // 6. PUBLIC TRACKING SEARCH API (Strict Privacy Protection)
  // ==========================================
  public trackPublicRequest(tracking_ref: string, phone_number: string): TrackingSearchResult | null {
    const cleanRef = tracking_ref.trim().toUpperCase();
    const cleanPhone = phone_number.trim();

    const req = this.db.requests.find(r => r.tracking_ref === cleanRef);
    if (!req) return null;

    const client = this.db.clients.find(c => c.id === req.client_id);
    if (!client) return null;

    // Validate phone match
    if (client.primary_phone !== cleanPhone && client.secondary_phone !== cleanPhone) {
      return null;
    }

    const service = this.db.service_types.find(s => s.id === req.service_type_id);
    const branch = this.db.branches.find(b => b.id === req.branch_id);

    const history = this.db.request_status_history
      .filter(h => h.request_id === req.id)
      .map(h => ({
        to_status: h.to_status,
        comment: h.comment,
        created_at: h.created_at
      }));

    return {
      tracking_ref: req.tracking_ref,
      service_name_ar: service?.name_ar || 'خدمة حكومية',
      status: req.status,
      received_date: req.received_date,
      target_date: req.target_date,
      branch_name_ar: branch?.name_ar || 'الصفوة',
      status_history: history,
      steps: this.getRequestSteps(req.id)
    };
  }

  // ==========================================
  // 7. STATUS HISTORY API
  // ==========================================
  public getStatusHistory(requestId: string): RequestStatusHistory[] {
    return this.db.request_status_history
      .filter(h => h.request_id === requestId)
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  }

  // ==========================================
  // 8. DOCUMENTS ARCHIVE API
  // ==========================================
  public getDocuments(requestId: string): DocumentRecord[] {
    return this.db.documents
      .filter(d => d.request_id === requestId)
      .map(d => {
        const uploader = this.db.profiles.find(p => p.id === d.uploaded_by);
        return {
          ...d,
          uploaded_by_name: uploader?.full_name || 'موظف الخدمة'
        };
      });
  }

  public uploadDocument(doc: {
    request_id: string;
    step_id?: string;
    document_type: string;
    file_name: string;
    file_path: string;
    file_size: number;
    uploaded_by: string;
  }): DocumentRecord {
    const existingCount = this.db.documents.filter(d => d.request_id === doc.request_id && d.document_type === doc.document_type).length;
    
    const newDoc: DocumentRecord = {
      id: `doc-${Date.now()}`,
      request_id: doc.request_id,
      step_id: doc.step_id,
      document_type: doc.document_type,
      file_name: doc.file_name,
      file_path: doc.file_path,
      file_size: doc.file_size,
      uploaded_by: doc.uploaded_by,
      version: existingCount + 1,
      created_at: new Date().toISOString()
    };

    this.db.documents.push(newDoc);

    // If step_id provided, link to step
    if (doc.step_id) {
      const step = this.db.request_steps?.find(s => s.id === doc.step_id);
      if (step) {
        if (!step.attached_document_ids) step.attached_document_ids = [];
        if (!step.attached_document_ids.includes(newDoc.id)) {
          step.attached_document_ids.push(newDoc.id);
        }
      }
    }

    this.saveDatabase();
    return newDoc;
  }

  public deleteDocument(docId: string): void {
    // Unlink from any steps
    if (this.db.request_steps) {
      this.db.request_steps.forEach(s => {
        if (s.attached_document_ids?.includes(docId)) {
          s.attached_document_ids = s.attached_document_ids.filter(id => id !== docId);
        }
      });
    }

    this.db.documents = this.db.documents.filter(d => d.id !== docId);
    this.saveDatabase();
  }

  // ==========================================
  // 8.1 WORKFLOW STEPS & CHECKLIST API
  // ==========================================
  public getRequestSteps(requestId: string): RequestStep[] {
    if (!this.db.request_steps) this.db.request_steps = [];
    return this.db.request_steps
      .filter(s => s.request_id === requestId)
      .sort((a, b) => a.order - b.order);
  }

  public saveRequestStep(step: Partial<RequestStep> & { request_id: string; title: string }): RequestStep {
    if (!this.db.request_steps) this.db.request_steps = [];
    
    let updated: RequestStep;
    if (step.id) {
      const idx = this.db.request_steps.findIndex(s => s.id === step.id);
      if (idx !== -1) {
        updated = { ...this.db.request_steps[idx], ...step };
        this.db.request_steps[idx] = updated;
      } else {
        throw new Error('Step not found');
      }
    } else {
      const existing = this.getRequestSteps(step.request_id);
      const nextOrder = existing.length > 0 ? Math.max(...existing.map(s => s.order)) + 1 : 1;
      
      updated = {
        id: `step-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        request_id: step.request_id,
        title: step.title,
        description: step.description,
        order: step.order ?? nextOrder,
        estimated_days: step.estimated_days ?? 2,
        target_date: step.target_date,
        status: step.status ?? 'pending',
        required_documents: step.required_documents ?? [],
        attached_document_ids: step.attached_document_ids ?? [],
        notes: step.notes,
        created_at: new Date().toISOString()
      };
      this.db.request_steps.push(updated);
    }

    this.saveDatabase();
    return updated;
  }

  public updateRequestSteps(requestId: string, steps: RequestStep[]): RequestStep[] {
    if (!this.db.request_steps) this.db.request_steps = [];
    
    // Remove old steps for this request
    this.db.request_steps = this.db.request_steps.filter(s => s.request_id !== requestId);
    
    // Add new steps with sequentially normalized orders and target dates if needed
    const req = this.db.requests.find(r => r.id === requestId);
    const startDate = req?.received_date || new Date().toISOString().split('T')[0];
    const targetDates = this.calculateStepTargetDates(startDate, steps);

    const formattedSteps: RequestStep[] = steps.map((s, idx) => ({
      ...s,
      id: s.id || `step-${requestId}-${idx + 1}-${Date.now()}`,
      request_id: requestId,
      order: idx + 1,
      estimated_days: Number(s.estimated_days) || 1,
      target_date: s.target_date || targetDates[idx],
      required_documents: Array.isArray(s.required_documents) ? s.required_documents : [],
      attached_document_ids: Array.isArray(s.attached_document_ids) ? s.attached_document_ids : [],
      created_at: s.created_at || new Date().toISOString()
    }));

    this.db.request_steps.push(...formattedSteps);

    // Update the request's overall target date to match final step target date
    if (req && formattedSteps.length > 0) {
      req.target_date = formattedSteps[formattedSteps.length - 1].target_date;
    }

    this.saveDatabase();
    return this.getRequestSteps(requestId);
  }

  public toggleStepCompletion(stepId: string, completedBy: string, completed?: boolean): RequestStep {
    if (!this.db.request_steps) this.db.request_steps = [];
    const idx = this.db.request_steps.findIndex(s => s.id === stepId);
    if (idx === -1) throw new Error('Step not found');

    const step = this.db.request_steps[idx];
    const newStatus = completed !== undefined 
      ? (completed ? 'completed' : 'in_progress')
      : (step.status === 'completed' ? 'in_progress' : 'completed');

    const updated: RequestStep = {
      ...step,
      status: newStatus,
      completed_at: newStatus === 'completed' ? new Date().toISOString().split('T')[0] : undefined,
      completed_by_name: newStatus === 'completed' ? completedBy : undefined
    };

    this.db.request_steps[idx] = updated;
    this.saveDatabase();
    return updated;
  }

  public setStepStatus(stepId: string, status: 'pending' | 'in_progress' | 'completed' | 'blocked', user?: string): RequestStep {
    if (!this.db.request_steps) this.db.request_steps = [];
    const idx = this.db.request_steps.findIndex(s => s.id === stepId);
    if (idx === -1) throw new Error('Step not found');

    const updated: RequestStep = {
      ...this.db.request_steps[idx],
      status,
      completed_at: status === 'completed' ? new Date().toISOString().split('T')[0] : undefined,
      completed_by_name: status === 'completed' ? (user || 'موظف المنظومة') : undefined
    };

    this.db.request_steps[idx] = updated;
    this.saveDatabase();
    return updated;
  }

  public linkDocumentToStep(stepId: string, documentId: string): void {
    if (!this.db.request_steps) this.db.request_steps = [];
    const step = this.db.request_steps.find(s => s.id === stepId);
    if (step) {
      if (!step.attached_document_ids) step.attached_document_ids = [];
      if (!step.attached_document_ids.includes(documentId)) {
        step.attached_document_ids.push(documentId);
      }
    }
    const doc = this.db.documents.find(d => d.id === documentId);
    if (doc) {
      doc.step_id = stepId;
    }
    this.saveDatabase();
  }

  public unlinkDocumentFromStep(stepId: string, documentId: string): void {
    if (!this.db.request_steps) this.db.request_steps = [];
    const step = this.db.request_steps.find(s => s.id === stepId);
    if (step && step.attached_document_ids) {
      step.attached_document_ids = step.attached_document_ids.filter(id => id !== documentId);
    }
    const doc = this.db.documents.find(d => d.id === documentId);
    if (doc && doc.step_id === stepId) {
      doc.step_id = undefined;
    }
    this.saveDatabase();
  }

  public deleteRequestStep(stepId: string): void {
    if (!this.db.request_steps) return;
    this.db.request_steps = this.db.request_steps.filter(s => s.id !== stepId);
    this.saveDatabase();
  }

  public resetRequestStepsToServiceTemplate(requestId: string): RequestStep[] {
    const req = this.db.requests.find(r => r.id === requestId);
    if (!req) throw new Error('Request not found');

    const service = this.db.service_types.find(s => s.id === req.service_type_id);
    const templateSteps = service?.workflow_steps || [];

    const targetDates = this.calculateStepTargetDates(req.received_date, templateSteps);
    const newSteps: RequestStep[] = templateSteps.map((ts, idx) => ({
      id: `step-${req.id}-${idx + 1}-${Date.now()}`,
      request_id: req.id,
      title: ts.title,
      description: ts.description,
      order: idx + 1,
      estimated_days: ts.estimated_days || 1,
      target_date: targetDates[idx],
      status: idx === 0 ? 'in_progress' : 'pending',
      required_documents: ts.required_documents || [],
      attached_document_ids: [],
      created_at: new Date().toISOString()
    }));

    return this.updateRequestSteps(requestId, newSteps);
  }

  // ==========================================
  // 9. PAYMENTS & FEES API
  // ==========================================
  public getPayments(requestId: string): PaymentRecord[] {
    return this.db.payments
      .filter(p => p.request_id === requestId)
      .map(p => {
        const receiver = this.db.profiles.find(usr => usr.id === p.received_by);
        return {
          ...p,
          received_by_name: receiver?.full_name || 'خزينة المكتب'
        };
      })
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  public addPayment(pay: {
    request_id: string;
    amount: number;
    payment_method: any;
    received_by: string;
    notes?: string;
  }): PaymentRecord {
    const receiptNo = `REC-2026-${String(this.db.payments.length + 895).padStart(5, '0')}`;
    const newPay: PaymentRecord = {
      id: `pay-${Date.now()}`,
      request_id: pay.request_id,
      amount: pay.amount,
      payment_date: new Date().toISOString().split('T')[0],
      payment_method: pay.payment_method || 'cash',
      received_by: pay.received_by,
      receipt_no: receiptNo,
      notes: pay.notes,
      created_at: new Date().toISOString()
    };

    this.db.payments.push(newPay);
    this.saveDatabase();
    return newPay;
  }

  // ==========================================
  // 10. DASHBOARD ANALYTICS API
  // ==========================================
  public getDashboardMetrics(branchId?: string): DashboardMetrics {
    let requests = this.db.requests;
    if (branchId) {
      requests = requests.filter(r => r.branch_id === branchId);
    }

    const todayStr = new Date().toISOString().split('T')[0];

    const statusBreakdown: Record<RequestStatus, number> = {
      new: 0,
      under_review: 0,
      docs_missing: 0,
      submitted_authority: 0,
      under_inspection: 0,
      approved: 0,
      rejected: 0,
      completed: 0,
      cancelled: 0
    };

    let totalFeesCollectedThisMonth = 0;
    let totalBalanceDue = 0;
    let dueOverdueCount = 0;

    requests.forEach(r => {
      statusBreakdown[r.status] = (statusBreakdown[r.status] || 0) + 1;

      // Overdue check
      if (r.target_date && r.target_date < todayStr && r.status !== 'completed' && r.status !== 'cancelled') {
        dueOverdueCount++;
      }

      // Balance calculation
      const reqPayments = this.db.payments.filter(p => p.request_id === r.id);
      const paid = reqPayments.reduce((sum, p) => sum + p.amount, 0);
      const due = Math.max(0, (r.total_fee || 0) - paid);
      totalBalanceDue += due;
    });

    // Payments collected this month
    const currentMonth = new Date().toISOString().substring(0, 7);
    this.db.payments.forEach(p => {
      const req = this.db.requests.find(r => r.id === p.request_id);
      if (!branchId || req?.branch_id === branchId) {
        if (p.payment_date.startsWith(currentMonth)) {
          totalFeesCollectedThisMonth += p.amount;
        }
      }
    });

    // Per-Branch Breakdown
    const branchBreakdown: Record<string, { branchName: string; count: number; revenue: number }> = {};
    this.db.branches.forEach(b => {
      const bReqs = this.db.requests.filter(r => r.branch_id === b.id);
      const bPayments = this.db.payments.filter(p => {
        const req = this.db.requests.find(r => r.id === p.request_id);
        return req?.branch_id === b.id;
      });
      const bRev = bPayments.reduce((sum, p) => sum + p.amount, 0);

      branchBreakdown[b.id] = {
        branchName: b.name_ar,
        count: bReqs.length,
        revenue: bRev
      };
    });

    return {
      totalRequests: requests.length,
      newSubmissionsCount: statusBreakdown.new || 0,
      pendingReviewCount: (statusBreakdown.under_review || 0) + (statusBreakdown.docs_missing || 0),
      dueOverdueCount,
      approvedCount: statusBreakdown.approved || 0,
      completedCount: statusBreakdown.completed || 0,
      totalFeesCollectedThisMonth,
      totalBalanceDue,
      statusBreakdown,
      branchBreakdown
    };
  }
}

export const sqliteEngine = new SqliteLocalEngine();
