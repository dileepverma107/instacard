"use client";

import { useActionState } from "react";
import Link from "next/link";
import { sendMagicLink, type LoginState } from "./actions";

const initialState: LoginState = { status: "idle" };

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(sendMagicLink, initialState);

  return (
    <main className="flex min-h-dvh items-center justify-center bg-neutral-950 px-6 py-16">
      <div className="w-full max-w-sm">
        <Link href="/" className="mb-10 flex items-center justify-center gap-2">
          <span className="h-8 w-8 rounded-lg bg-gradient-to-tr from-amber-400 via-pink-500 to-purple-600" />
          <span className="text-lg font-semibold tracking-tight text-white">InstaCard</span>
        </Link>

        <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-8">
          <h1 className="text-xl font-semibold text-white">Sign in or sign up</h1>
          <p className="mt-1 text-sm text-neutral-400">
            We&apos;ll email you a magic link. No password needed.
          </p>

          <form action={formAction} className="mt-6 space-y-3">
            <input
              type="email"
              name="email"
              placeholder="you@example.com"
              required
              autoFocus
              className="w-full rounded-xl border border-neutral-700 bg-neutral-950 px-4 py-3 text-sm text-white placeholder-neutral-500 outline-none focus:border-pink-500"
            />
            <button
              type="submit"
              disabled={pending}
              className="w-full rounded-xl bg-gradient-to-tr from-amber-400 via-pink-500 to-purple-600 px-4 py-3 text-sm font-semibold text-white transition disabled:opacity-60"
            >
              {pending ? "Sending link…" : "Send magic link"}
            </button>
          </form>

          {state.status === "sent" && (
            <p className="mt-4 text-sm text-emerald-400">{state.message}</p>
          )}
          {state.status === "error" && (
            <p className="mt-4 text-sm text-red-400">{state.message}</p>
          )}
        </div>

        <p className="mt-6 text-center text-xs text-neutral-500">
          By continuing you agree to InstaCard&apos;s Terms and Privacy Policy.
        </p>
      </div>
    </main>
  );
}
