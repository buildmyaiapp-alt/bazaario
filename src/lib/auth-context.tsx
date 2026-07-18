"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from "firebase/auth";
import { firebaseAuth } from "@/lib/firebase-client";

type AuthUser = { id: string; name: string; email: string };

type AuthContextValue = {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ error?: string }>;
  register: (name: string, email: string, password: string) => Promise<{ error?: string }>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

const FRIENDLY_ERRORS: Record<string, string> = {
  "auth/email-already-in-use": "An account with this email already exists",
  "auth/invalid-credential": "Invalid email or password",
  "auth/invalid-email": "Enter a valid email",
  "auth/weak-password": "Password must be at least 6 characters",
  "auth/too-many-requests": "Too many attempts. Please try again later",
};

function friendlyError(err: unknown): string {
  const code = (err as { code?: string })?.code;
  return (code && FRIENDLY_ERRORS[code]) || "Something went wrong. Please try again.";
}

async function establishSession(idToken: string): Promise<AuthUser> {
  const res = await fetch("/api/auth/session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idToken }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? "Could not sign in");
  return data;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const res = await fetch("/api/auth/me");
    const data = await res.json();
    setUser(data.user);
    setLoading(false);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time session fetch on mount, can't run during SSR render
    refresh();
  }, [refresh]);

  const login = useCallback(async (email: string, password: string) => {
    try {
      const cred = await signInWithEmailAndPassword(firebaseAuth, email, password);
      const idToken = await cred.user.getIdToken();
      setUser(await establishSession(idToken));
      return {};
    } catch (err) {
      return { error: friendlyError(err) };
    }
  }, []);

  const register = useCallback(async (name: string, email: string, password: string) => {
    try {
      const cred = await createUserWithEmailAndPassword(firebaseAuth, email, password);
      await updateProfile(cred.user, { displayName: name });
      const idToken = await cred.user.getIdToken(true);
      setUser(await establishSession(idToken));
      return {};
    } catch (err) {
      return { error: friendlyError(err) };
    }
  }, []);

  const logout = useCallback(async () => {
    await signOut(firebaseAuth);
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
