import { sha256 } from '../lib/sha256';
import type { AuditEvent, DatabaseState, Role } from './types';

/*
 * Tamper-evident audit trail: every entry stores the hash of the previous
 * entry, so editing or deleting any row breaks the chain from that point on.
 * In production the chain is written by the API into an INSERT-only table and
 * its head is anchored daily (see documents/02-technology-and-security.md).
 */

export const GENESIS_HASH = '0'.repeat(64);

export interface AuditActor {
  id: string;
  name: string;
  role: Role | 'public' | 'system';
  branch_id?: string;
}

export const PUBLIC_ACTOR: AuditActor = { id: 'public', name: 'زائر الموقع', role: 'public' };

export function auditPayload(event: Omit<AuditEvent, 'hash'>): string {
  return [
    event.seq,
    event.id,
    event.at,
    event.actor_id,
    event.actor_name,
    event.actor_role,
    event.branch_id ?? '',
    event.action,
    event.entity_type,
    event.entity_id,
    event.summary,
    event.ip,
    event.prev_hash,
  ].join('|');
}

export function appendAudit(
  state: DatabaseState,
  actor: AuditActor,
  action: string,
  entity: { type: string; id: string; branch_id?: string },
  summary: string,
  at = new Date().toISOString(),
): void {
  const previous = state.audit[state.audit.length - 1];
  const seq = (previous?.seq ?? 0) + 1;
  const event: Omit<AuditEvent, 'hash'> = {
    seq,
    id: `aud-${seq}`,
    at,
    actor_id: actor.id,
    actor_name: actor.name,
    actor_role: actor.role,
    branch_id: entity.branch_id ?? actor.branch_id,
    action,
    entity_type: entity.type,
    entity_id: entity.id,
    summary,
    ip: actor.role === 'public' ? 'زائر من الإنترنت' : 'جهاز الفرع',
    prev_hash: previous?.hash ?? GENESIS_HASH,
  };
  state.audit.push({ ...event, hash: sha256(auditPayload(event)) });
}

export function verifyChain(events: AuditEvent[]): { ok: boolean; checked: number; brokenAt?: number } {
  let previousHash = GENESIS_HASH;
  for (const event of events) {
    const { hash, ...rest } = event;
    if (event.prev_hash !== previousHash || sha256(auditPayload(rest)) !== hash) {
      return { ok: false, checked: events.length, brokenAt: event.seq };
    }
    previousHash = hash;
  }
  return { ok: true, checked: events.length };
}
