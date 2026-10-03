-- ====================================================================
-- El Safwa Office — Services Management System
-- Database Schema for SQLite / Local Relational Database Engine
-- License No. 679 Group B | Minya El Qamh & Aziziyya Branches
-- ====================================================================

-- 1. Branches Table
CREATE TABLE IF NOT EXISTS branches (
    id TEXT PRIMARY KEY,
    name_ar TEXT NOT NULL,
    name_en TEXT NOT NULL,
    city TEXT NOT NULL,
    address TEXT NOT NULL,
    phones TEXT NOT NULL, -- JSON array of phone strings
    is_active INTEGER DEFAULT 1,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- 2. Profiles (Staff Users)
CREATE TABLE IF NOT EXISTS profiles (
    id TEXT PRIMARY KEY,
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT NOT NULL,
    branch_id TEXT NOT NULL,
    is_active INTEGER DEFAULT 1,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (branch_id) REFERENCES branches(id)
);

-- 3. User Roles (Separated Security Roles)
CREATE TABLE IF NOT EXISTS user_roles (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    role TEXT CHECK(role IN ('admin', 'branch_manager', 'employee')) NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES profiles(id)
);

-- 4. Service Types
CREATE TABLE IF NOT EXISTS service_types (
    id TEXT PRIMARY KEY,
    name_ar TEXT NOT NULL,
    name_en TEXT NOT NULL,
    category TEXT NOT NULL,
    default_fee REAL DEFAULT 0,
    required_documents TEXT NOT NULL, -- JSON array of required doc names
    estimated_days INTEGER DEFAULT 7,
    is_active INTEGER DEFAULT 1,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- 5. Clients
CREATE TABLE IF NOT EXISTS clients (
    id TEXT PRIMARY KEY,
    full_name TEXT NOT NULL,
    national_id TEXT UNIQUE NOT NULL,
    primary_phone TEXT UNIQUE NOT NULL,
    secondary_phone TEXT,
    address TEXT NOT NULL,
    branch_id TEXT NOT NULL,
    notes TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (branch_id) REFERENCES branches(id)
);

-- 6. Requests (Core Workflow Engine)
CREATE TABLE IF NOT EXISTS requests (
    id TEXT PRIMARY KEY,
    tracking_ref TEXT UNIQUE NOT NULL, -- Format: SFW-2026-XXXXX
    client_id TEXT NOT NULL,
    service_type_id TEXT NOT NULL,
    branch_id TEXT NOT NULL,
    assigned_employee_id TEXT,
    status TEXT CHECK(status IN (
        'new',
        'under_review',
        'docs_missing',
        'submitted_authority',
        'under_inspection',
        'approved',
        'rejected',
        'completed',
        'cancelled'
    )) DEFAULT 'new',
    priority TEXT CHECK(priority IN ('low', 'normal', 'high', 'urgent')) DEFAULT 'normal',
    govt_ref TEXT,
    office_ref TEXT,
    total_fee REAL DEFAULT 0,
    received_date TEXT DEFAULT CURRENT_DATE,
    target_date TEXT,
    completed_date TEXT,
    notes TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (client_id) REFERENCES clients(id),
    FOREIGN KEY (service_type_id) REFERENCES service_types(id),
    FOREIGN KEY (branch_id) REFERENCES branches(id),
    FOREIGN KEY (assigned_employee_id) REFERENCES profiles(id)
);

-- 7. Request Status Audit History (Immutable Timeline)
CREATE TABLE IF NOT EXISTS request_status_history (
    id TEXT PRIMARY KEY,
    request_id TEXT NOT NULL,
    from_status TEXT,
    to_status TEXT NOT NULL,
    changed_by_user_id TEXT NOT NULL,
    comment TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (request_id) REFERENCES requests(id),
    FOREIGN KEY (changed_by_user_id) REFERENCES profiles(id)
);

-- 8. Documents Archive
CREATE TABLE IF NOT EXISTS documents (
    id TEXT PRIMARY KEY,
    request_id TEXT NOT NULL,
    document_type TEXT NOT NULL, -- e.g. national_id, deed, engineering_drawing, receipt, authority_approval, other
    file_name TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_size INTEGER DEFAULT 0,
    uploaded_by TEXT NOT NULL,
    version INTEGER DEFAULT 1,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (request_id) REFERENCES requests(id)
);

-- 9. Payments & Fees
CREATE TABLE IF NOT EXISTS payments (
    id TEXT PRIMARY KEY,
    request_id TEXT NOT NULL,
    amount REAL NOT NULL,
    payment_date TEXT DEFAULT CURRENT_DATE,
    payment_method TEXT CHECK(payment_method IN ('cash', 'bank_transfer', 'vodafone_cash')) DEFAULT 'cash',
    received_by TEXT NOT NULL,
    receipt_no TEXT UNIQUE NOT NULL,
    notes TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (request_id) REFERENCES requests(id),
    FOREIGN KEY (received_by) REFERENCES profiles(id)
);

-- ====================================================================
-- INDEXES FOR MAXIMUM LOCAL PERFORMANCE
-- ====================================================================
CREATE INDEX IF NOT EXISTS idx_requests_tracking_ref ON requests(tracking_ref);
CREATE INDEX IF NOT EXISTS idx_requests_status ON requests(status);
CREATE INDEX IF NOT EXISTS idx_requests_branch ON requests(branch_id);
CREATE INDEX IF NOT EXISTS idx_requests_client ON requests(client_id);
CREATE INDEX IF NOT EXISTS idx_clients_phone ON clients(primary_phone);
CREATE INDEX IF NOT EXISTS idx_clients_national_id ON clients(national_id);
CREATE INDEX IF NOT EXISTS idx_history_request ON request_status_history(request_id);
CREATE INDEX IF NOT EXISTS idx_payments_request ON payments(request_id);
