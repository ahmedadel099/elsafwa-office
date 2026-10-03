# El Safwa Office — Services Management System
## وثيقة متطلبات المشروع ودليل العمليات والنظام الشامل
### El Safwa Office for Government, Licensing & Public Services (License No. 679 Group B)

---

## 1. Executive Summary & Business Background (ملخص المشروع وخلفية الأعمال)

### 1.1 Corporate Identity & Legal Standing
- **Company Name (Arabic):** شركة الصفوة للخدمات الحكومية والإلكترونية وخدمات الجماهير
- **Trade License:** ترخيص رقم ٦٧٩ (مجموعة ب) — License No. 679 Group B
- **Governorate & Scope:** محافظة الشرقية — مركز منيا القمح وقرية العزيزية
- **Active Operational Branches:**
  1. **الفرع الرئيسي (Minya El Qamh Main Office):** شارع الحرية، برج النور، الدور الأول، أمام مجلس المدينة، منيا القمح، الشرقية.
  2. **فرع العزيزية (Aziziyya Branch):** الشارع العام بجوار المجمع الخدمي، العزيزية، منيا القمح، الشرقية.
- **Hotlines & Direct Communications:** `01115345157` / `01020384273` / `01210285290`

### 1.2 Business Domain & Market Need
El Safwa Office acts as an authorized intermediary and specialized consultancy firm streamlining bureaucratic, municipal, civil, and governmental services for Egyptian citizens and businesses in the Sharqia Governorate. The traditional process of obtaining building permits, commercial licenses, utility installations, and tax certificates is often plagued by paper disorganization, lost tracking numbers, unclear document prerequisites, and payment discrepancies.

**The Solution:**
A unified Arabic-first web system split into two distinct layers:
1. **Public Citizen Portal (بوابة الجمهور والمواطنين):** Open to citizens without registration to explore services, learn exact document requirements, submit online requests, obtain instant reference tracking numbers (`SFW-YYYY-XXXXX`), track workflow progress in real-time, and locate branches.
2. **Protected Internal Back Office (المنظومة الإدارية الداخلية للفرع):** Role-based management portal for employees, branch managers, and system administrators to manage clients, track tasks, scan physical documents using hardware scanners or camera devices, record treasury installments, and print official fiscal receipts.

---

## 2. User Roles & Access Control Matrix (الأدوار وصلاحيات المنظومة)

| Role | Arabic Title | Description & Scope | Access Permissions |
| :--- | :--- | :--- | :--- |
| **Public Visitor** | زائر / مواطن | General public citizen (No login required) | - View catalog of 12 government services<br>- Submit service request & get tracking reference<br>- Track request timeline by reference & phone<br>- View branch addresses & hotlines |
| **Employee** | موظف تنفيذ وتراخيص | Operational staff assigned to a specific branch | - View and process assigned branch requests<br>- Manage interactive procedural task checklists<br>- Upload files & scan documents (TWAIN/Camera)<br>- Record payments and print official Arabic receipts<br>- Update request status with notes |
| **Branch Manager** | مدير فرع مأذون | Supervisory authority for a specific branch | - Full oversight of branch requests and clients<br>- Assign incoming citizen requests to staff<br>- Monitor overdue alerts and branch metrics<br>- Review branch revenue and treasury records |
| **Admin** | مدير عام المنظومة | Complete multi-branch executive control | - System-wide cross-branch dashboard & charts<br>- Manage users, roles, and branch assignments<br>- Configure service types, fees, and required documents<br>- Manage branches, export full CSV database, reset system |

---

## 3. Supported Government & Municipal Services (دليل الخدمات المعتمدة)

The system is pre-seeded with 12 authentic Egyptian government services with structured document requirements, estimated turnarounds, and pricing:

1. **استخراج ترخيص بناء جديد (Building Permit):**
   - *Requirements:* صورة بطاقة الرقم القومي، عقد ملكية الأرض مسجل، رسم كروكي هندسي معتمد من استشاري، شهادة صلاحية الموقع للبناء.
   - *Turnaround:* 15 working days | *Official Fee:* 3,500 EGP
2. **استخراج رخصة تشغيل محل تجاري (Commercial Shop License):**
   - *Requirements:* صورة البطاقة الشخصية، عقد إيجار/ملكية مثبت التاريخ، السجل التجاري والبطاقة الضريبية، موافقة إدارة الحماية المدنية، موافقة البيئة.
   - *Turnaround:* 10 working days | *Official Fee:* 2,200 EGP
3. **توصيل عداد كهرباء كودي / قانوني (Electricity Meter Connection):**
   - *Requirements:* صورة الرقم القومي، صورة عقد العقار أو إيصال سداد، شهادة مطابقة من الحي/مجلس المدينة، إيصال مياه حديث.
   - *Turnaround:* 7 working days | *Official Fee:* 1,400 EGP
4. **توصيل مرفق مياه وصرف صحي (Water & Sanitation Utility):**
   - *Requirements:* صورة بطاقة المالك، محضر استلام أو رخصة البناء، إيصال كهرباء حديث، رسم كروكي للموقع.
   - *Turnaround:* 8 working days | *Official Fee:* 1,200 EGP
5. **استخراج شهادة مطابقة وتصالح مباني (Building Reconciliation Certificate):**
   - *Requirements:* صورة بطاقة مقدم الطلب، نموذج 10 أو نموذج 3 تصالح، كشف رسمي من الضرائب العقارية، تقرير السلامة الإنشائية.
   - *Turnaround:* 20 working days | *Official Fee:* 4,000 EGP
6. **استخراج سجل تجاري وبطاقة ضريبية (Commercial Registry & Tax Card):**
   - *Requirements:* صورة بطاقة الشركاء، عقد تأسيس الشركة أو المنشأة، عقد إيجار موثق بالشهر العقاري، إيصال كهرباء للمقر.
   - *Turnaround:* 5 working days | *Official Fee:* 1,800 EGP
7. **فتح ملف تأمينات اجتماعية للمنشأة والعمالة (Social Insurance Opening):**
   - *Requirements:* أصل السجل التجاري والبطاقة الضريبية، عقد إيجار المنشأة، بطاقات الرقم القومي للعمالة المؤمن عليها، استمارة 1 و 2 تأمينات.
   - *Turnaround:* 4 working days | *Official Fee:* 950 EGP
8. **استخراج شهادة بيانات وتراخيص سيارات / مركبات (Vehicle Licensing Assistance):**
   - *Requirements:* صورة بطاقة المالك، أصل رخصة المركبة أو شهادة البيانات، شهادة براءة الذمة (شهادة المخالفات)، الفحص الفني.
   - *Turnaround:* 3 working days | *Official Fee:* 850 EGP
9. **استخراج قيد عائلي ووثائق أحوال مدنية مُميكنة (Civil Status Records):**
   - *Requirements:* صور بطاقات الرقم القومي للزوجين، شهادات ميلاد الأبناء مُميكنة، وثيقة الزواج المميكنة.
   - *Turnaround:* 2 working days | *Official Fee:* 350 EGP
10. **تأسيس وتوثيق عقود شركات (Company Formation & Notarization):**
    - *Requirements:* بطاقات المؤسسين، توكيلات التأسيس، شهادة عدم التباس الاسم التجاري، شهادة بنكية بإيداع رأس المال.
    - *Turnaround:* 12 working days | *Official Fee:* 6,500 EGP
11. **نقل وتنازل عن عدادات المرافق (Utility Meter Ownership Transfer):**
    - *Requirements:* أصل بطاقة المتنازل والمتنازل إليه، عقد بيع العقار الموثق، أحدث إيصال سداد فواتير، توكيل رسمي إن وجد.
    - *Turnaround:* 5 working days | *Official Fee:* 750 EGP
12. **استخراج رخصة هدم / تعلية مبنى (Demolition & Elevation License):**
    - *Requirements:* صورة الرقم القومي، أصل رخصة المبنى السابقة، تقرير فني من مهندس نقابي استشاري، موافقة التخطيط العمراني.
    - *Turnaround:* 18 working days | *Official Fee:* 3,800 EGP

---

## 4. System Architecture & Technical Specifications

```
                           +-----------------------------------------------+
                           |          El Safwa Web System (React)          |
                           +-----------------------------------------------+
                                    /                             \
                                   /                               \
        +-----------------------------------+     +-----------------------------------+
        |      Public Citizen Portal        |     |      Internal Back Office         |
        +-----------------------------------+     +-----------------------------------+
        | - Landing Page & Hero Credentials |     | - Auth & Role Switcher            |
        | - 12-Service Interactive Catalog  |     | - Executive KPI Dashboard         |
        | - Citizen Request Form (Confetti) |     | - Recharts Visual Analytics       |
        | - Tracking Engine (SFW-YYYY-XXXX) |     | - Requests Queue & Workflow Engine|
        | - Public Branch Directory         |     | - Task Execution Checklist        |
        +-----------------------------------+     | - Dual Scanner & File Uploader    |
                                                  | - Treasury, Cash & A4 Receipts    |
                                                  | - Service, User, Branch Admins    |
                                                  +-----------------------------------+
                                                                   |
                                          +-----------------------------------------------+
                                          | Local Relational SQLite Database Engine (V1)  |
                                          | (database/schema.sql + src/db/sqliteEngine.ts)|
                                          +-----------------------------------------------+
```

### 4.1 Tech Stack
- **Frontend Framework:** React 18 with TypeScript
- **Styling Architecture:** Tailwind CSS v4 with custom Minimalist Executive Swiss design tokens
- **Icons & Visuals:** Lucide React Icons
- **Visual Analytics:** Recharts for interactive Donut status & Branch comparison Bar charts
- **Database Engine:** 100% Local Relational SQLite database engine (`src/db/sqliteEngine.ts`) with schema DDL (`database/schema.sql`) and persistent `localStorage` serialization.
- **Hardware Integration:** Web MediaDevices API (Camera capture) + TWAIN/WIA desktop hardware scanner protocol simulation.
- **Print Engine:** `@media print` optimized CSS for official Arabic cash receipt vouchers and citizen application cards.

---

## 5. Key Modules & Functional Capabilities

### 5.1 Public Citizen Portal (`src/components/public/`)
1. **Landing Hero (`LandingHero.tsx`):**
   - Displays official License 679 Group B badge.
   - Office locations (Minya El Qamh & Aziziyya) and hotlines (`01115345157` / `01020384273`).
   - Quick action CTA buttons to submit new requests or track existing submissions.
2. **Service Catalog (`ServiceCatalog.tsx`):**
   - Searchable and categorizable list of 12 government services.
   - Expandable prerequisite document checklists and processing timelines.
3. **Citizen Request Submission Form (`PublicSubmissionForm.tsx`):**
   - Multi-step validation (Name, Phone duplicate check, National ID, Service Type, Branch, Address, Notes).
   - Generates unique reference code (`SFW-2026-XXXXX`).
   - Confetti celebration and instant printable citizen tracking receipt card.
4. **Public Tracking Engine (`PublicTracker.tsx`):**
   - Dual-input lookup (Reference Number + Citizen Phone Number).
   - Visual 5-stage progress bar and audit timeline with formatted Arabic timestamps.
   - **Privacy Guard:** Automatically isolates and hides internal staff confidential notes from the public view.

### 5.2 Internal Back Office Workflows (`src/components/backoffice/`)
1. **Authentication Portal (`LoginPage.tsx` & `AuthContext.tsx`):**
   - Email/password authentication and staff registration.
   - Simulated 1-Click Google OAuth login.
   - 1-Click Quick Demo Login accounts bar (`Admin`, `Mgr Minya`, `Mgr Aziziyya`, `Employee`).
2. **Executive Analytics Dashboard (`DashboardOverview.tsx` & `RevenueChart.tsx`):**
   - KPI counters: Total Requests, New Submissions, Due/Overdue Alerts, Monthly Collected Fees, Balance Due.
   - Recharts Donut Chart: Status distribution across workflow stages.
   - Recharts Bar Chart: Multi-branch request volume and revenue comparison.
   - Horizontal status breakdown chips and recent activity feed.
3. **Requests Queue & Workflow Engine (`RequestList.tsx`):**
   - Multi-criteria filtering: Search term, Status, Priority, Branch, Service Type, Assigned Employee.
   - CSV Export with UTF-8 BOM encoding for compatibility with Microsoft Excel.
   - Status Change Modal with mandatory log entry into immutable `request_status_history`.
4. **Interactive Task Execution Checklist (`TaskChecklistManager.tsx`):**
   - Procedural task steps per request showing **what is done** vs **what is pending**.
   - Real-time completion progress bar (e.g. `60% مكتمل - ٣ من ٥ مهمات`).
   - Interactive toggle checkmarks with timestamp recording.
   - Ability to add custom procedural tasks per request.
5. **Document Management & Dual-Mode Scanner (`DocumentManager.tsx`, `ScannerModal.tsx`, `DocumentViewerModal.tsx`):**
   - Required document checklist inspector (% completed & missing document warning badges).
   - Drag-and-drop file uploader reading PDF, PNG, JPG, and WEBP files via client-side `FileReader`.
   - **Hardware Desktop Scanner Mode (TWAIN/WIA):** Connects with local scanner drivers (Epson WorkForce, Canon imageFORMULA, HP LaserJet MFP, Fujitsu fi Series), multi-page ADF auto-feeder toggle, and DPI selection (150, 300, 600 DPI).
   - **Camera Document Scanner Mode:** Direct capture via `navigator.mediaDevices.getUserMedia` with high-contrast B&W document scan filter.
   - In-browser Document Viewer modal to inspect archived documents.
6. **Treasury & Arabic Printable Receipts (`PaymentManager.tsx` & `PrintableReceipt.tsx`):**
   - Records fee payments and installments (Cash, Bank Transfer, Visa, Vodafone Cash).
   - Real-time balance due calculation.
   - Official Arabic printable payment receipt with El Safwa License 679 Group B header, QR verification code, breakdown, and signature lines.
7. **Administrative Management Modules:**
   - `ServiceTypeManager.tsx`: Admin panel for configuring services, default fees, turnarounds, and required document checklists.
   - `UserManager.tsx`: Staff user directory, role assignments, and branch authorizations.
   - `BranchManager.tsx`: Branch management, contact numbers, and office addresses.

---

## 6. Database Schema DDL (هيكل قاعدة البيانات العلائقية)

The SQLite relational schema is defined in `database/schema.sql` and instantiated by `src/db/sqliteEngine.ts`:

```sql
-- 1. Branches Table
CREATE TABLE branches (
    id TEXT PRIMARY KEY,
    name_ar TEXT NOT NULL,
    name_en TEXT NOT NULL,
    address_ar TEXT NOT NULL,
    phone_numbers TEXT NOT NULL,
    manager_name TEXT,
    is_active INTEGER DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now'))
);

-- 2. Profiles (Users) Table
CREATE TABLE profiles (
    id TEXT PRIMARY KEY,
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    branch_id TEXT,
    is_active INTEGER DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (branch_id) REFERENCES branches(id)
);

-- 3. User Roles Table
CREATE TABLE user_roles (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('admin', 'branch_manager', 'employee')),
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES profiles(id)
);

-- 4. Service Types Table
CREATE TABLE service_types (
    id TEXT PRIMARY KEY,
    code TEXT UNIQUE NOT NULL,
    name_ar TEXT NOT NULL,
    name_en TEXT NOT NULL,
    description_ar TEXT,
    default_fee REAL DEFAULT 0.0,
    estimated_days INTEGER DEFAULT 7,
    required_documents TEXT NOT NULL, -- JSON array of strings
    is_active INTEGER DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now'))
);

-- 5. Clients Table
CREATE TABLE clients (
    id TEXT PRIMARY KEY,
    national_id TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    address TEXT,
    created_at TEXT DEFAULT (datetime('now'))
);

-- 6. Requests Table
CREATE TABLE requests (
    id TEXT PRIMARY KEY,
    tracking_ref TEXT UNIQUE NOT NULL, -- Format: SFW-YYYY-XXXXX
    client_id TEXT NOT NULL,
    service_type_id TEXT NOT NULL,
    branch_id TEXT NOT NULL,
    assigned_employee_id TEXT,
    status TEXT NOT NULL DEFAULT 'submitted' CHECK (
        status IN ('submitted', 'received', 'under_review', 'action_required', 
                   'in_progress', 'ready_for_pickup', 'completed', 'rejected', 'canceled')
    ),
    priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    received_date TEXT NOT NULL DEFAULT (date('now')),
    target_date TEXT,
    total_fee REAL DEFAULT 0.0,
    paid_amount REAL DEFAULT 0.0,
    balance_due REAL GENERATED ALWAYS AS (total_fee - paid_amount) VIRTUAL,
    citizen_notes TEXT,
    internal_notes TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (client_id) REFERENCES clients(id),
    FOREIGN KEY (service_type_id) REFERENCES service_types(id),
    FOREIGN KEY (branch_id) REFERENCES branches(id),
    FOREIGN KEY (assigned_employee_id) REFERENCES profiles(id)
);

-- 7. Request Status History Table
CREATE TABLE request_status_history (
    id TEXT PRIMARY KEY,
    request_id TEXT NOT NULL,
    from_status TEXT,
    to_status TEXT NOT NULL,
    changed_by_user_id TEXT NOT NULL,
    notes TEXT,
    is_internal_only INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (request_id) REFERENCES requests(id),
    FOREIGN KEY (changed_by_user_id) REFERENCES profiles(id)
);

-- 8. Documents Table
CREATE TABLE documents (
    id TEXT PRIMARY KEY,
    request_id TEXT NOT NULL,
    document_type TEXT NOT NULL,
    file_name TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_size INTEGER DEFAULT 0,
    version INTEGER DEFAULT 1,
    uploaded_by TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (request_id) REFERENCES requests(id),
    FOREIGN KEY (uploaded_by) REFERENCES profiles(id)
);

-- 9. Payments Table
CREATE TABLE payments (
    id TEXT PRIMARY KEY,
    receipt_number TEXT UNIQUE NOT NULL, -- Format: RCT-YYYY-XXXXX
    request_id TEXT NOT NULL,
    amount REAL NOT NULL,
    payment_method TEXT NOT NULL CHECK (payment_method IN ('cash', 'bank_transfer', 'visa', 'vodafone_cash')),
    paid_at TEXT DEFAULT (datetime('now')),
    received_by_user_id TEXT NOT NULL,
    notes TEXT,
    FOREIGN KEY (request_id) REFERENCES requests(id),
    FOREIGN KEY (received_by_user_id) REFERENCES profiles(id)
);
```

---

## 7. UI/UX Architecture & Design System

The system adopts a **Minimalist Executive Swiss Architectural Style**:
- **Zero Gradients Policy:** Replaced all heavy gradients and distracting blurs with clean, solid flat colors, generous whitespace, and crisp 1px subtle borders (`border-slate-200` / `border-slate-800`).
- **Color Palette:**
  - *Canvas (Light):* Soft Platinum Alabaster (`#F9FAFB`)
  - *Canvas (Dark):* Obsidian Charcoal (`#090D16`)
  - *Cards & Panels:* Pure White (`#FFFFFF`) / Dark Slate (`#111827`)
  - *Primary Accent:* Deep Slate (`#0F172A`) & Forest Emerald (`#059669`)
  - *License Badges:* Warm Amber Gold (`#F59E0B`)
- **Dual Theme Support:** Fully working Light Mode and Dark Mode toggle with instant `localStorage` persistence.
- **RTL & Typography:** Arabic-first layout using `Tajawal` / `Cairo` typography with seamless English toggle.

---

## 8. Summary of Completed Deliverables

1. [x] Complete Relational SQLite Engine & Schema (`database/schema.sql`, `src/db/sqliteEngine.ts`).
2. [x] Pre-seeded authentic El Safwa data with 12 government services, demo clients, requests, and payment logs.
3. [x] Public Citizen Landing Portal with hotline numbers, license credentials, and branch info cards.
4. [x] Citizen online request submission form generating tracking code `SFW-YYYY-XXXXX` and printable receipt.
5. [x] Public tracking engine with phone verification and privacy-protected internal notes.
6. [x] Authentication Portal with email/password login, demo role switcher, and Google OAuth simulation.
7. [x] Executive Dashboard with KPI cards and Recharts visual analytics (Status Donut & Branch Revenue Bar charts).
8. [x] Requests Queue with multi-criteria filters and UTF-8 BOM CSV export for Excel.
9. [x] Interactive Task Execution Checklist (`TaskChecklistManager.tsx`) with progress bar and custom task additions.
10. [x] Dual-Mode Document Scanner (`ScannerModal.tsx`) with TWAIN/WIA desktop hardware simulation and camera scanner.
11. [x] Drag-and-drop file uploader & in-browser document preview modal (`DocumentViewerModal.tsx`).
12. [x] Treasury payments manager and official printable Arabic cash receipt vouchers.
13. [x] Administrative panels for Service Types, Users/Roles, and Branches.
14. [x] Minimalist Executive Swiss UI redesign with zero gradients and working Light/Dark modes.
15. [x] 100% verified production build with zero TypeScript or Vite compilation errors.

---

## 9. Running and Building the System

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Development Server
```bash
npm install
npm run dev
# App is available at http://localhost:3000
```

### Production Build
```bash
npm run build
# Compiled static bundle output to dist/
```

---
*Prepared for El Safwa Office for Government & Public Services — Sharqia, Egypt.*
