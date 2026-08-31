// TypeScript Interfaces for El Safwa Office Database & Application State

export type UserRole = 'admin' | 'branch_manager' | 'employee' | 'public';

export type RequestStatus = 
  | 'new'
  | 'under_review'
  | 'docs_missing'
  | 'submitted_authority'
  | 'under_inspection'
  | 'approved'
  | 'rejected'
  | 'completed'
  | 'cancelled';

export type RequestPriority = 'low' | 'normal' | 'high' | 'urgent';

export type PaymentMethod = 'cash' | 'bank_transfer' | 'vodafone_cash';

export interface Branch {
  id: string;
  name_ar: string;
  name_en: string;
  city: string;
  address: string;
  phones: string[]; // JSON stored array
  is_active: boolean;
  created_at: string;
}

export interface Profile {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  branch_id: string;
  role: UserRole;
  is_active: boolean;
  created_at: string;
}

export interface ServiceType {
  id: string;
  name_ar: string;
  name_en: string;
  category: string;
  default_fee: number;
  required_documents: string[]; // JSON array of required doc names
  estimated_days: number;
  is_active: boolean;
  created_at: string;
}

export interface Client {
  id: string;
  full_name: string;
  national_id: string;
  primary_phone: string;
  secondary_phone?: string;
  address: string;
  branch_id: string;
  notes?: string;
  created_at: string;
}

export interface RequestRecord {
  id: string;
  tracking_ref: string; // e.g. SFW-2026-00123
  client_id: string;
  service_type_id: string;
  branch_id: string;
  assigned_employee_id?: string;
  status: RequestStatus;
  priority: RequestPriority;
  govt_ref?: string;
  office_ref?: string;
  total_fee: number;
  received_date: string;
  target_date?: string;
  completed_date?: string;
  notes?: string;
  created_at: string;

  // Joined fields for rich UI
  client_name?: string;
  client_phone?: string;
  client_national_id?: string;
  service_name_ar?: string;
  service_name_en?: string;
  branch_name_ar?: string;
  assigned_employee_name?: string;
  paid_amount?: number;
  balance_due?: number;
}

export interface RequestStatusHistory {
  id: string;
  request_id: string;
  from_status?: RequestStatus;
  to_status: RequestStatus;
  changed_by_user_id: string;
  changed_by_user_name?: string;
  comment: string;
  created_at: string;
}

export interface DocumentRecord {
  id: string;
  request_id: string;
  document_type: string;
  file_name: string;
  file_path: string;
  file_size: number;
  uploaded_by: string;
  uploaded_by_name?: string;
  version: number;
  created_at: string;
}

export interface PaymentRecord {
  id: string;
  request_id: string;
  amount: number;
  payment_date: string;
  payment_method: PaymentMethod;
  received_by: string;
  received_by_name?: string;
  receipt_no: string;
  notes?: string;
  created_at: string;
}

export interface DashboardMetrics {
  totalRequests: number;
  newSubmissionsCount: number;
  pendingReviewCount: number;
  dueOverdueCount: number;
  approvedCount: number;
  completedCount: number;
  totalFeesCollectedThisMonth: number;
  totalBalanceDue: number;
  statusBreakdown: Record<RequestStatus, number>;
  branchBreakdown: Record<string, { branchName: string; count: number; revenue: number }>;
}

export interface TrackingSearchResult {
  tracking_ref: string;
  service_name_ar: string;
  status: RequestStatus;
  received_date: string;
  target_date?: string;
  branch_name_ar: string;
  status_history: Array<{
    to_status: RequestStatus;
    comment: string;
    created_at: string;
  }>;
}
