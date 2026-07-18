"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";

export default function AccountPage() {
  return (
    <Suspense fallback={null}>
      <AccountForm />
    </Suspense>
  );
}

function AccountForm() {
  const { user, login, register, logout, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") ?? "/";

  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    const result =
      mode === "login" ? await login(email, password) : await register(name, email, password);
    setSubmitting(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    router.push(redirectTo);
  }

  if (loading) return null;

  if (user) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-10">
        <h1 className="mb-4 text-2xl font-semibold text-gray-900">Your Account</h1>
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <p className="text-lg font-medium">{user.name}</p>
          <p className="mb-6 text-gray-500">{user.email}</p>
          <div className="flex gap-3">
            <Link href="/orders" className="rounded-md bg-slate-800 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700">
              View Orders
            </Link>
            <button
              onClick={() => logout()}
              className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-sm px-4 py-10">
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h1 className="mb-4 text-xl font-semibold text-gray-900">
          {mode === "login" ? "Sign in" : "Create account"}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-3">
          {mode === "register" && (
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Your name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              />
            </div>
          )}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-full bg-orange-500 py-2.5 text-sm font-semibold text-white hover:bg-orange-600 disabled:opacity-50"
          >
            {submitting ? "Please wait…" : mode === "login" ? "Sign in" : "Create account"}
          </button>
        </form>

        <p className="mt-4 text-sm text-gray-600">
          {mode === "login" ? "New to Bazario?" : "Already have an account?"}{" "}
          <button
            onClick={() => {
              setMode(mode === "login" ? "register" : "login");
              setError("");
            }}
            className="font-medium text-orange-600 hover:underline"
          >
            {mode === "login" ? "Create your account" : "Sign in"}
          </button>
        </p>
      </div>
    </div>
  );
}
