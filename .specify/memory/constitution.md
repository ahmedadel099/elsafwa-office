# El Safwa Office System — Constitution

## Mission
Replace the office's paper files with one trustworthy record per request: every step, document, amount
and action has an owner, a time, and a trace — while client data stays protected.

## Principle 1 — Security and privacy by default (NON-NEGOTIABLE)
- Egypt PDPL (Law 151/2020): consent recorded, data minimised, hosted in Egypt, encrypted in transit
  and at rest, field-level encryption for national ID / phone / address.
- Least privilege, branch scoping, MFA for all staff, no self-registration.
- Authorization is enforced inside every command handler, never only in the UI.
- No personal data in application logs.

## Principle 2 — Everything is audited (NON-NEGOTIABLE)
Every write, every view of sensitive data and every auth event writes an append-only, hash-chained
audit entry in the same transaction. No code path may update or delete audit entries. Each feature
ships with a test proving its audit entries.

## Principle 3 — Money integrity
Office fees (revenue) and government-fee deposits (client money) are never mixed. Receipts are
numbered per branch/year, never deleted; corrections are reversals; voids need a reason and a second
person. No disbursement without an official government receipt. Money uses decimal types only.

## Principle 4 — Procedures are data, and honest
Service steps/documents live in a versioned catalog maintained by the office, not in code. Open
requests keep the version they started with. Public content never implies the office is a
government body; fees and timelines are labelled as estimates.

## Principle 5 — Arabic-first, accessible
Arabic RTL is the primary experience; WCAG 2.2 AA; digits normalised on input; strings externalised.

## Principle 6 — Code quality
Clean Architecture (Domain has no outward dependencies), small handlers, validation at the boundary,
locked dependencies with supply-chain checks in CI.

## Definition of Done
Spec acceptance criteria met · unit + integration tests (real PostgreSQL) · authz + audit tested ·
no PII in logs · RTL reviewed · CI green · peer review (two reviewers for auth/finance/audit changes).

## Governance
Amend via pull request. `/speckit-plan`, `/speckit-tasks` and `/speckit-analyze` must check features
against these principles. Humans approve `spec.md` before `plan.md`, and `plan.md` before `tasks.md`.

Version: 1.0.0 | Ratified: pending office review
