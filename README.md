# El Safwa Office — Services Management System
### شركة الصفوة للخدمات الحكومية والإلكترونية وخدمات الجماهير (ترخيص رقم ٦٧٩ مجموعة ب)

An Arabic-first (RTL) web application and services management platform built for **El Safwa Office** in Sharqia Governorate, Egypt (Minya El Qamh & Aziziyya branches).

---

## 📚 Project Documentation & Business Specifications

Comprehensive project specifications, business requirements, relational database DDL, and operational guides have been prepared in the [`documents/`](./documents/) folder:

- **[Project Requirements & Business Guide](./documents/PROJECT_REQUIREMENTS_AND_BUSINESS_GUIDE.md)**: Complete business overview, RBAC matrix, service catalog, functional requirements, relational SQLite schema, and deliverable summaries.
- **[Arabic Operational Guide](./documents/BUSINESS_OPERATIONS_ARABIC.md)**: دليل العمليات التشغيلية ومتطلبات المنظومة باللغة العربية.

---

## 🌟 Key Features

1. **🌐 Split Architecture:**
   - **Public Citizen Portal:** Browse 12 government services, submit requests, receive instant tracking reference numbers (`SFW-YYYY-XXXXX`), and track progress with phone verification.
   - **Protected Internal Back Office:** Gated authentication with role-based access for Admins, Branch Managers, and Employees.
2. **✅ Task Execution Checklist:** Real-time procedural checklist for every request with live progress bar (`60% مكتمل - ٣ من ٥ مهمات`) and custom task additions.
3. **📷 Dual-Mode Document Scanner & File Archive:**
   - **Hardware Desktop Scanner (TWAIN/WIA):** Connects to Epson, Canon, HP LaserJet MFP, and Fujitsu document scanners with ADF and DPI controls.
   - **Camera Document Scanner:** Direct camera capture with high-contrast B&W text scan filter.
   - In-browser PDF and image viewer.
4. **📊 Executive Analytics & Visual Charts:** Recharts Donut status chart and comparative multi-branch revenue bar chart.
5. **💰 Treasury & Official Arabic Receipts:** Installment tracking, balance due calculation, and print-ready Arabic cash receipts (`@media print`).
6. **💾 100% Local Relational SQLite Database:** Self-contained relational database engine with local persistence.
7. **🏛️ Minimalist Executive Swiss UI Architecture:** Clean solid flat surfaces, zero gradients, and working Light/Dark modes.

---

## 🚀 Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Run local development server
npm run dev

# 3. Build production bundle
npm run build
```

---
*License No. 679 Group B — El Safwa Office, Minya El Qamh & Aziziyya, Sharqia, Egypt.*
