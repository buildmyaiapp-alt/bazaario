import { cookies } from "next/headers";
import { adminAuth } from "@/lib/firebase-admin";

const SESSION_COOKIE = "amazon_store_session";
const SESSION_MAX_AGE_MS = 1000 * 60 * 60 * 24 * 14; // Firebase session cookies cap out at 14 days

export type SessionPayload = {
  userId: string;
  name: string;
  email: string;
};

export async function createSession(idToken: string) {
  const sessionCookie = await adminAuth.createSessionCookie(idToken, { expiresIn: SESSION_MAX_AGE_MS });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, sessionCookie, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE_MS / 1000,
  });
}

export async function destroySession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE)?.value;
  if (!sessionCookie) return null;

  try {
    const decoded = await adminAuth.verifySessionCookie(sessionCookie, true);
    return {
      userId: decoded.uid,
      name: (decoded.name as string) ?? decoded.email ?? "",
      email: decoded.email ?? "",
    };
  } catch {
    return null;
  }
}
