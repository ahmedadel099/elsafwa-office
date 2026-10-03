import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { store } from '../data/engine';
import { navigate } from '../lib/router';
import { useDb } from '../data/hooks';
import { can, type Permission } from '../data/meta';
import type { Profile } from '../data/types';

/*
 * Demo session handling. Production uses server-side sessions in HttpOnly,
 * Secure, SameSite=Strict cookies issued by the API (BFF pattern) — never
 * tokens readable by JavaScript.
 */

const SESSION_KEY = 'elsafwa.session';
const IDLE_LIMIT_MS = 15 * 60_000;

interface Session {
  userId: string;
  lastActive: number;
}

function readSession(): Session | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as Session) : null;
  } catch {
    return null;
  }
}

function writeSession(session: Session | null) {
  try {
    if (session) sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
    else sessionStorage.removeItem(SESSION_KEY);
  } catch {
    // Storage unavailable: the session simply won't survive a reload.
  }
}

type LoginResult = { status: 'ok' } | { status: 'mfa' } | { status: 'error'; message: string };

interface AuthContextValue {
  user: Profile | null;
  pendingMfa: Profile | null;
  notice: string | null;
  login: (email: string, password: string) => LoginResult;
  verifyMfa: (code: string) => boolean;
  cancelMfa: () => void;
  demoLogin: (profileId: string) => void;
  logout: () => void;
  can: (permission: Permission) => boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const db = useDb();
  const [userId, setUserId] = useState<string | null>(() => {
    const session = readSession();
    return session && Date.now() - session.lastActive < IDLE_LIMIT_MS ? session.userId : null;
  });
  const [pendingMfa, setPendingMfa] = useState<Profile | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const lastActive = useRef(Date.now());

  // Always read the live profile so role/branch/activation changes apply immediately.
  const user = useMemo(() => {
    const profile = userId ? db.profiles.find((p) => p.id === userId) : undefined;
    return profile && profile.is_active ? profile : null;
  }, [db.profiles, userId]);

  const startSession = useCallback((profile: Profile) => {
    lastActive.current = Date.now();
    writeSession({ userId: profile.id, lastActive: lastActive.current });
    setPendingMfa(null);
    setNotice(null);
    setUserId(profile.id);
  }, []);

  const endSession = useCallback((reason: 'manual' | 'idle') => {
    const profile = userId ? store.getState().profiles.find((p) => p.id === userId) : undefined;
    if (profile) store.logout(profile, reason);
    writeSession(null);
    setUserId(null);
    setNotice(reason === 'idle' ? 'انتهت الجلسة تلقائيًا بعد 15 دقيقة بدون نشاط لحماية بيانات العملاء. سجّل الدخول مرة أخرى.' : null);
  }, [userId]);

  // Idle timeout: activity refreshes the session; inactivity ends it.
  useEffect(() => {
    if (!userId) return;
    const touch = () => {
      lastActive.current = Date.now();
    };
    const events = ['pointerdown', 'keydown', 'wheel', 'touchstart'] as const;
    events.forEach((name) => window.addEventListener(name, touch, { passive: true }));
    const timer = window.setInterval(() => {
      if (Date.now() - lastActive.current > IDLE_LIMIT_MS) endSession('idle');
      else writeSession({ userId, lastActive: lastActive.current });
    }, 30_000);
    return () => {
      events.forEach((name) => window.removeEventListener(name, touch));
      window.clearInterval(timer);
    };
  }, [userId, endSession]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      pendingMfa,
      notice,
      login: (email, password) => {
        const result = store.login(email, password);
        if (result.status === 'error') return result;
        if (result.status === 'mfa') {
          setPendingMfa(result.profile);
          return { status: 'mfa' };
        }
        startSession(result.profile);
        return { status: 'ok' };
      },
      verifyMfa: (code) => {
        if (!pendingMfa || !store.verifyMfa(pendingMfa, code)) return false;
        startSession(pendingMfa);
        return true;
      },
      cancelMfa: () => setPendingMfa(null),
      demoLogin: (profileId) => startSession(store.demoLogin(profileId)),
      logout: () => {
        endSession('manual');
        navigate('/staff/login', { replace: true });
      },
      can: (permission) => Boolean(user && can(user.role, permission)),
    }),
    [user, pendingMfa, notice, startSession, endSession],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}

/** For staff pages rendered only after the auth gate. */
export function useUser(): Profile {
  const { user } = useAuth();
  if (!user) throw new Error('useUser called outside an authenticated route');
  return user;
}
