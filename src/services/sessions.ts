export interface PendingState {
  type: 'deviceName';
}

export interface SessionData {
  token: string;
  email: string;
  pending?: PendingState;
}

const sessions = new Map<number, SessionData>();

export function getSession(id: number): SessionData | undefined {
  return sessions.get(id);
}

export function setSession(id: number, data: { token: string; email: string }): void {
  sessions.set(id, data);
}

export function updateSession(id: number, patch: Partial<SessionData>): SessionData | undefined {
  const current = sessions.get(id);
  if (!current) return undefined;
  const next = { ...current, ...patch } as SessionData;
  sessions.set(id, next);
  return next;
}

export function clearSession(id: number): void {
  sessions.delete(id);
}

export function clearPending(id: number): void {
  const s = sessions.get(id);
  if (s) delete s.pending;
}

export function setPending(id: number, pending: PendingState): void {
  const s = sessions.get(id);
  if (s) s.pending = pending;
}