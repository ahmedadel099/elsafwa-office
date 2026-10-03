import { daysUntil } from '../lib/format';
import { STATUS } from './meta';
import type { BallInCourt, DatabaseState, Profile, RequestRecord, RequestStatus } from './types';

export function isClosed(request: RequestRecord): boolean {
  return STATUS[request.status].ball === 'closed';
}

export function ballOf(request: RequestRecord): BallInCourt {
  return STATUS[request.status].ball;
}

export type Sla = { state: 'closed' | 'overdue' | 'due_soon' | 'on_track'; days: number };

export function slaOf(request: RequestRecord): Sla {
  const days = daysUntil(request.target_date);
  if (isClosed(request)) return { state: 'closed', days };
  if (days < 0) return { state: 'overdue', days };
  if (days <= 3) return { state: 'due_soon', days };
  return { state: 'on_track', days };
}

export function progressOf(request: RequestRecord) {
  const total = request.steps.length;
  const done = request.steps.filter((s) => s.done_at).length;
  const current = request.steps.find((s) => !s.done_at);
  return { total, done, percent: total ? (done / total) * 100 : 0, current };
}

export function financeOf(state: DatabaseState, requestId: string) {
  const request = state.requests.find((r) => r.id === requestId);
  const payments = state.payments.filter((p) => p.request_id === requestId && !p.voided);
  const officePaid = payments.filter((p) => p.kind === 'office_fee').reduce((sum, p) => sum + p.amount, 0);
  const govDeposited = payments.filter((p) => p.kind === 'gov_fee_deposit').reduce((sum, p) => sum + p.amount, 0);
  const govSpent = state.disbursements.filter((d) => d.request_id === requestId).reduce((sum, d) => sum + d.amount, 0);
  const officeFee = request?.office_fee ?? 0;
  return {
    officeFee,
    officePaid,
    officeDue: Math.max(0, officeFee - officePaid),
    govEstimate: request?.gov_fee_estimate ?? 0,
    govDeposited,
    govSpent,
    /** Positive: client money still held in trust. Negative: the office advanced money the client owes. */
    govBalance: govDeposited - govSpent,
  };
}

export function missingDocuments(state: DatabaseState, request: RequestRecord): string[] {
  const service = state.services.find((s) => s.id === request.service_id);
  const uploaded = new Set(state.documents.filter((d) => d.request_id === request.id).map((d) => d.doc_type));
  return (service?.required_documents ?? []).map((d) => d.name).filter((name) => !uploaded.has(name));
}

/** Branch scoping: admins see everything, everyone else only their own branch. */
export function scopeRequests(state: DatabaseState, user: Profile): RequestRecord[] {
  return user.role === 'admin' ? state.requests : state.requests.filter((r) => r.branch_id === user.branch_id);
}

export function lookups(state: DatabaseState) {
  const clients = new Map(state.clients.map((c) => [c.id, c]));
  const services = new Map(state.services.map((s) => [s.id, s]));
  const branches = new Map(state.branches.map((b) => [b.id, b]));
  const profiles = new Map(state.profiles.map((p) => [p.id, p]));
  return { clients, services, branches, profiles };
}

function sameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

export function dashboardOf(state: DatabaseState, user: Profile) {
  const requests = scopeRequests(state, user);
  const open = requests.filter((r) => !isClosed(r));
  const ids = new Set(requests.map((r) => r.id));
  const payments = state.payments.filter((p) => ids.has(p.request_id) && !p.voided);
  const now = new Date();

  const byBall: Record<BallInCourt, number> = { office: 0, client: 0, authority: 0, closed: 0 };
  requests.forEach((r) => byBall[ballOf(r)]++);

  const byStatus = Object.fromEntries(Object.keys(STATUS).map((k) => [k, 0])) as Record<RequestStatus, number>;
  requests.forEach((r) => byStatus[r.status]++);

  const collectedToday = payments.filter((p) => sameDay(new Date(p.received_at), now)).reduce((s, p) => s + p.amount, 0);
  const monthPayments = payments.filter((p) => {
    const d = new Date(p.received_at);
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
  });

  const officeOutstanding = open.reduce((sum, r) => sum + financeOf(state, r.id).officeDue, 0);
  const trustHeld = requests.reduce((sum, r) => sum + Math.max(0, financeOf(state, r.id).govBalance), 0);

  const overdue = open.filter((r) => slaOf(r).state === 'overdue');
  const dueSoon = open.filter((r) => slaOf(r).state === 'due_soon');

  const workload = state.profiles
    .filter((p) => p.is_active && (user.role === 'admin' || p.branch_id === user.branch_id) && (p.role === 'employee' || p.role === 'branch_manager'))
    .map((p) => ({ profile: p, open: open.filter((r) => r.assignee_id === p.id).length }))
    .sort((a, b) => b.open - a.open);

  const branches = state.branches
    .filter((b) => user.role === 'admin' || b.id === user.branch_id)
    .map((b) => ({
      branch: b,
      open: open.filter((r) => r.branch_id === b.id).length,
      collectedMonth: monthPayments.filter((p) => p.branch_id === b.id).reduce((s, p) => s + p.amount, 0),
    }));

  return {
    openCount: open.length,
    byBall,
    byStatus,
    overdue,
    dueSoon,
    unassigned: open.filter((r) => !r.assignee_id),
    collectedToday,
    collectedMonthOffice: monthPayments.filter((p) => p.kind === 'office_fee').reduce((s, p) => s + p.amount, 0),
    collectedMonthTrust: monthPayments.filter((p) => p.kind === 'gov_fee_deposit').reduce((s, p) => s + p.amount, 0),
    officeOutstanding,
    trustHeld,
    workload,
    branches,
  };
}
