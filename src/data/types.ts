// Domain model for the El Safwa demo. Field names mirror the production
// schema proposed in documents/02-technology-and-security.md.

export type Role = 'admin' | 'branch_manager' | 'employee' | 'accountant';

export type RequestStatus =
  | 'new'
  | 'under_review'
  | 'awaiting_client'
  | 'submitted'
  | 'inspection'
  | 'approved'
  | 'ready'
  | 'completed'
  | 'rejected'
  | 'cancelled';

/** Who must act next — the most useful lens for an intermediary office. */
export type BallInCourt = 'office' | 'client' | 'authority' | 'closed';

export type Priority = 'normal' | 'high' | 'urgent';

export type StepOwner = 'office' | 'client' | 'authority';

export type PaymentMethod = 'cash' | 'instapay' | 'card' | 'wallet' | 'bank_transfer';

/** Office fee is revenue; government-fee deposits are client money held in trust (أمانات). */
export type PaymentKind = 'office_fee' | 'gov_fee_deposit';

export type Channel = 'walk_in' | 'online' | 'phone';

export interface Branch {
  id: string;
  name: string;
  short: string;
  city: string;
  address: string;
  phones: string[];
  hours: string;
  receipt_prefix: string;
  is_active: boolean;
  created_at: string;
}

export interface Profile {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  branch_id: string;
  role: Role;
  title: string;
  is_active: boolean;
  mfa_enabled: boolean;
  last_login_at?: string;
  created_at: string;
}

export interface ServiceStepTemplate {
  id: string;
  title: string;
  description?: string;
  owner: StepOwner;
  /** Expected working days for this step; the service duration is their sum. */
  days?: number;
  /** Documents needed specifically at this step (on top of the service's general list). */
  documents?: string[];
  /** Shown to the client on the public tracking page. */
  milestone?: boolean;
}

export interface ServiceDocument {
  name: string;
  /** The original must be seen/held (not just a copy). */
  original?: boolean;
  note?: string;
}

export interface ServiceType {
  id: string;
  code: string;
  name: string;
  name_en?: string;
  category: string;
  summary: string;
  authority: string;
  legal_basis: string;
  channel: string;
  required_documents: ServiceDocument[];
  steps: ServiceStepTemplate[];
  office_fee: number;
  gov_fee_estimate: number;
  gov_fee_note: string;
  estimated_days: number;
  requires_poa: boolean;
  /** Points the analysis could not confirm — must be validated with the office. */
  open_questions: string[];
  is_active: boolean;
  updated_at: string;
}

export interface Consent {
  at: string;
  version: string;
  channel: Channel;
}

export interface Client {
  id: string;
  kind: 'individual' | 'business';
  full_name: string;
  business_name?: string;
  national_id: string;
  phone: string;
  phone_alt?: string;
  address: string;
  branch_id: string;
  notes?: string;
  consent?: Consent;
  created_at: string;
}

export interface PowerOfAttorney {
  id: string;
  client_id: string;
  number: string;
  notary_office: string;
  scope: 'general' | 'special';
  subject: string;
  agents: string[];
  issued_at: string;
  expires_at?: string;
  revoked_at?: string;
}

export interface RequestStep {
  id: string;
  title: string;
  description?: string;
  owner: StepOwner;
  days?: number;
  documents?: string[];
  milestone: boolean;
  done_at?: string;
  done_by?: string;
}

export interface RequestRecord {
  id: string;
  ref: string;
  client_id: string;
  service_id: string;
  branch_id: string;
  assignee_id?: string;
  status: RequestStatus;
  priority: Priority;
  channel: Channel;
  authority_ref?: string;
  received_at: string;
  target_date: string;
  completed_at?: string;
  office_fee: number;
  gov_fee_estimate: number;
  notes?: string;
  /** Snapshot of the service's steps at creation, so procedure changes never rewrite open files. */
  steps: RequestStep[];
  created_at: string;
  updated_at: string;
}

export interface RequestEvent {
  id: string;
  request_id: string;
  at: string;
  actor_id: string;
  kind: 'created' | 'status' | 'note' | 'step' | 'payment' | 'document' | 'assignment';
  from_status?: RequestStatus;
  to_status?: RequestStatus;
  message: string;
  visibility: 'public' | 'internal';
}

export interface DocumentRecord {
  id: string;
  request_id: string;
  doc_type: string;
  file_name: string;
  mime: string;
  size: number;
  data_url?: string;
  original_held: boolean;
  returned_at?: string;
  uploaded_by: string;
  uploaded_at: string;
}

export interface PaymentRecord {
  id: string;
  receipt_no: string;
  request_id: string;
  branch_id: string;
  kind: PaymentKind;
  method: PaymentMethod;
  amount: number;
  received_by: string;
  received_at: string;
  note?: string;
  voided?: { at: string; by: string; reason: string };
}

/** Money paid to an authority on the client's behalf, backed by an official receipt. */
export interface Disbursement {
  id: string;
  request_id: string;
  authority: string;
  description: string;
  amount: number;
  official_receipt_no: string;
  paid_at: string;
  paid_by: string;
}

export interface AuditEvent {
  seq: number;
  id: string;
  at: string;
  actor_id: string;
  actor_name: string;
  actor_role: Role | 'public' | 'system';
  branch_id?: string;
  action: string;
  entity_type: string;
  entity_id: string;
  summary: string;
  ip: string;
  prev_hash: string;
  hash: string;
}

/** Kept apart from Profile so password material never travels with user records. */
export interface Credential {
  profile_id: string;
  salt: string;
  hash: string;
}

export interface DatabaseState {
  version: number;
  branches: Branch[];
  profiles: Profile[];
  credentials: Credential[];
  services: ServiceType[];
  clients: Client[];
  powers_of_attorney: PowerOfAttorney[];
  requests: RequestRecord[];
  events: RequestEvent[];
  documents: DocumentRecord[];
  payments: PaymentRecord[];
  disbursements: Disbursement[];
  audit: AuditEvent[];
}
