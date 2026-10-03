# Feature Specification: Office Operations MVP (records, workflow, treasury, audit)

**Feature Branch**: `001-office-operations-mvp`

**Created**: 2026-10-03

**Status**: Draft — pending review with El Safwa office (see `documents/01-business-analysis.md` §7 for the open questions)

**Input**: "The office needs to record all its transactions in a system instead of paper, with a log of everything done, which employee did it and when; there will be financial records, and the data is highly sensitive."

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Open a file and track a request step by step (Priority: P1)

A front-desk employee registers a client (identity verified against the original ID card, privacy consent recorded), opens a request for a service, and the request gets that service's procedure steps. Staff tick steps as they happen, change the status, and always see whose move it is (office / client / authority).

**Why this priority**: This replaces the paper file — the core of the business.

**Independent Test**: Create a client and a request for "ترخيص محل عام", complete steps, move it through statuses to "تم التسليم", and confirm the timeline shows who did each action and when.

**Acceptance Scenarios**:

1. **Given** a new client, **When** the employee saves without the client's privacy consent, **Then** the system refuses and explains why.
2. **Given** a national ID typed in Arabic-Indic digits, **When** saved, **Then** it is normalised to 0-9, validated (14 digits, valid birth date, known governorate code) and stored encrypted.
3. **Given** a request created today, **When** the service's procedure is later edited by the admin, **Then** the open request keeps the steps it started with.
4. **Given** status "submitted", **When** the employee tries to move it to "new", **Then** the transition is rejected; moving to "submitted" requires the authority's reference number.
5. **Given** any status change, **Then** a client-facing message and a mandatory internal note are recorded separately.

---

### User Story 2 — Money with receipts, and client money kept apart (Priority: P1)

The cashier records payments as either **office fee** (revenue) or **government-fee deposit** (client money held in trust), issues a numbered receipt, and records every payment to an authority with the official government receipt number.

**Why this priority**: Money disputes and tax exposure are the highest business risk.

**Independent Test**: Record a fee and a deposit on one request, record a disbursement, print the receipt, void a receipt as a different manager, and verify balances.

**Acceptance Scenarios**:

1. **Given** a payment, **Then** a receipt number unique per branch and year is issued and never reused (voided receipts keep their number).
2. **Given** a receipt issued by user A, **When** A tries to void it, **Then** the system refuses (maker–checker); a manager B can void it with a written reason.
3. **Given** a disbursement without an official receipt number, **Then** it is rejected.
4. **Given** a request, **Then** the finance view shows agreed fee / paid / due, and deposits / disbursed / trust balance separately.
5. **Given** a receipt, **Then** it shows the amount in Arabic words (تفقيط), payment method, receiver, and the "private office, not a government body" statement.

---

### User Story 3 — Everything is logged and tamper-evident (Priority: P1)

Every write and every view of sensitive data (open client file, reveal national ID, view document, print receipt, export) is logged with user, role, branch, time, device and target. Admins search the log and verify its integrity.

**Why this priority**: Explicit owner requirement; also the main deterrent against internal leaks.

**Independent Test**: Perform actions as two users, filter the log by user, run integrity verification (passes), simulate tampering (fails at the exact entry).

**Acceptance Scenarios**:

1. **Given** any command, **Then** an audit entry is appended in the same transaction; no API exists to update or delete entries.
2. **Given** a modified or deleted audit row, **When** verification runs, **Then** it reports the first broken sequence number.
3. **Given** a branch manager, **Then** they see only their branch's log; the admin sees all.

---

### User Story 4 — Documents and originals custody (Priority: P2)

Staff see required vs received documents per service, upload or camera-scan files, flag originals held by the office, and record returning them at handover.

**Independent Test**: Upload a PDF and a camera capture, flag an original, return it, confirm the client-visible timeline shows the return and the log shows each view.

**Acceptance Scenarios**:

1. **Given** a file that is not PDF/PNG/JPEG/WEBP or exceeds the size limit, **Then** it is rejected.
2. **Given** originals held for a request, **When** the request is marked delivered, **Then** staff are warned about any original not yet returned. [NEEDS CLARIFICATION: block delivery or only warn?]
3. Deleting a document requires the `documents.delete` permission and a reason.

---

### User Story 5 — Public site: service guide, pre-request, OTP tracking (Priority: P2)

Citizens read each service's documents/steps/estimated time and starting fee, submit a pre-request (national ID optional), and track it with reference + mobile + one-time code.

**Acceptance Scenarios**:

1. **Given** a tracking lookup with a wrong reference or phone, **Then** the same generic error is shown (no enumeration) and the attempt is logged.
2. **Given** a correct code, **Then** only client-facing updates and milestones are shown — never internal notes, staff names or amounts.
3. **Given** an online pre-request, **Then** it creates an unverified client record that is never auto-merged with an existing client.

---

### User Story 6 — Dashboard and work queues (Priority: P2)

Managers and staff see open requests by ball-in-court, overdue / due-soon, unassigned, workload per employee, and today's/month's collections split fee vs trust.

---

### User Story 7 — Administration (Priority: P3)

Admin manages services (procedure versions), users (invite-only, MFA, deactivate not delete), branches, and the permission matrix.

### Edge Cases

- Client represented by an agent (POA) vs company representative — whose ID is verified?
- Authority rejects; client fixes and resubmits (rejected → under_review).
- Government fee higher than the deposit (office advanced money) → negative trust balance shown as client debt.
- Two staff edit the same request concurrently → optimistic concurrency, no lost updates.
- Browser closed mid-session / idle 15 minutes → session ends, logged.
- Power or internet outage at a branch → [NEEDS CLARIFICATION: offline intake needed?]

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Staff accounts are created by an admin only (no self-registration); login requires password + MFA; 5 failed attempts lock the account temporarily; idle sessions end after 15 minutes.
- **FR-002**: Every command MUST check permission and branch scope inside the handler; UI hiding is not sufficient.
- **FR-003**: Clients: national ID validated and encrypted at rest, masked in UI, revealed only with permission (logged); consent recorded with version, time and channel.
- **FR-004**: Powers of attorney recorded per client (number, notary office, scope, agents, dates); requests for services that need one show a warning when none is valid.
- **FR-005**: Service catalog is data: authority, legal basis, channel, required documents (original or copy), ordered steps with owner and client visibility, default fee, government-fee estimate, estimated business days, open questions. Changes are versioned.
- **FR-006**: Requests snapshot the service steps at creation; status changes follow an allowed-transition table; target date = received date + estimated business days (Fri/Sat excluded).
- **FR-007**: Each request timeline separates client-visible messages from internal notes.
- **FR-008**: Payments are typed (office fee / government-fee deposit), numbered per branch-year without reuse, never deleted; voiding requires a reason and a different authorised user.
- **FR-009**: Disbursements to authorities require the official receipt number (and image).
- **FR-010**: Append-only, hash-chained audit log for all writes, sensitive reads and auth events, with search, export and integrity verification.
- **FR-011**: Exports require permission, exclude national IDs by default, and are logged.
- **FR-012**: Public tracking requires reference + registered mobile + OTP (5-minute expiry, 3 attempts) and shows client-facing data only.
- **FR-013**: All UI is Arabic RTL, WCAG 2.2 AA; strings externalised for future English.
- **FR-014**: Receipts printable on A5 with amount in words; e-receipt UUID/QR when the office is in scope of the ETA e-receipt system. [NEEDS CLARIFICATION: is the office VAT-registered / in e-receipt scope?]
- **FR-015**: Daily cash session open/close with counted cash vs expected and variance approval. [NEEDS CLARIFICATION: one drawer per branch or per cashier?]
- **FR-016**: Data subject requests (access, correction, erasure where legally allowed) can be logged and fulfilled.

### Key Entities

- **Branch**, **User** (role, branch, MFA), **Client** (individual/business, encrypted identifiers, consent), **PowerOfAttorney**, **ServiceType/ServiceVersion/Step/RequiredDocument**, **Request** (status, ball-in-court, steps snapshot, assignee, authority ref, fees), **RequestEvent** (public/internal), **Document** (+ custody of originals), **Payment/Receipt**, **Disbursement**, **CashSession**, **LedgerEntry**, **AuditEvent**.

## Success Criteria *(mandatory)*

- **SC-001**: 100% of requests opened after go-live have a digital file; zero new paper-only files after month 2.
- **SC-002**: Staff can answer "where is request X and whose move is it" in under 30 seconds.
- **SC-003**: Every amount received has a numbered receipt; daily cash variance resolved the same day.
- **SC-004**: Audit integrity verification passes daily; any tampering is detected within 24 hours.
- **SC-005**: No client personal data appears in application logs (automated test).
- **SC-006**: Independent penetration test before launch with no open high/critical findings.

## Assumptions

- Arabic-only UI at launch; English later.
- No direct integration with government systems in the MVP; authority references and receipts are recorded manually.
- Hosting inside Egypt; staff access through VPN/Zero-Trust.
- The procedures in `src/data/catalog.ts` are a researched draft and must be validated with the office before use with real clients.
