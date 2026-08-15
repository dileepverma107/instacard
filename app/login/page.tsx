"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import {
  sendMagicLink,
  signInWithPassword,
  signUpWithPassword,
  type LoginState,
  type PasswordState,
} from "./actions";

const initialMagicState: LoginState = { status: "idle" };
const initialPasswordState: PasswordState = { status: "idle" };

export default function LoginPage() {
  const [mode, setMode] = useState<"password" | "magic">("password");
  const [passwordFlow, setPasswordFlow] = useState<"signin" | "signup">("signin");

  const [magicState, magicAction, magicPending] = useActionState(sendMagicLink, initialMagicState);
  const [signinState, signinAction, signinPending] = useActionState(
    signInWithPassword,
    initialPasswordState,
  );
  const [signupState, signupAction, signupPending] = useActionState(
    signUpWithPassword,
    initialPasswordState,
  );

  const passwordState = passwordFlow === "signin" ? signinState : signupState;
  const passwordPending = passwordFlow === "signin" ? signinPending : signupPending;
  const passwordAction = passwordFlow === "signin" ? signinAction : signupAction;

  return (
    <main className="flex min-h-dvh items-center justify-center bg-neutral-950 px-6 py-16">
      <div className="w-full max-w-sm">
        <Link href="/" className="mb-10 flex items-center justify-center gap-2">
          <span className="h-8 w-8 rounded-lg bg-gradient-to-tr from-amber-400 via-pink-500 to-purple-600" />
          <span className="text-lg font-semibold tracking-tight text-white">InstaCard</span>
        </Link>

        <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-8">
          <div className="mb-6 flex gap-1 rounded-xl bg-neutral-950 p-1">
            {(["password", "magic"] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`flex-1 rounded-lg py-1.5 text-sm font-medium transition ${
                  mode === m ? "bg-neutral-800 text-white" : "text-neutral-500"
                }`}
              >
                {m === "password" ? "Email & password" : "Magic link"}
              </button>
            ))}
          </div>

          {mode === "password" ? (
            <>
              <h1 className="text-xl font-semibold text-white">
                {passwordFlow === "signin" ? "Sign in" : "Create your account"}
              </h1>
              <p className="mt-1 text-sm text-neutral-400">
                {passwordFlow === "signin"
                  ? "Welcome back."
                  : "Takes 10 seconds, no email confirmation needed."}
              </p>

              <form action={passwordAction} className="mt-6 space-y-3">
                <input
                  type="email"
                  name="email"
                  placeholder="you@example.com"
                  required
                  autoFocus
                  className="w-full rounded-xl border border-neutral-700 bg-neutral-950 px-4 py-3 text-sm text-white placeholder-neutral-500 outline-none focus:border-pink-500"
                />
                <input
                  type="password"
                  name="password"
                  placeholder="Password"
                  required
                  minLength={6}
                  autoComplete={passwordFlow === "signin" ? "current-password" : "new-password"}
                  className="w-full rounded-xl border border-neutral-700 bg-neutral-950 px-4 py-3 text-sm text-white placeholder-neutral-500 outline-none focus:border-pink-500"
                />
                <button
                  type="submit"
                  disabled={passwordPending}
                  className="w-full rounded-xl bg-gradient-to-tr from-amber-400 via-pink-500 to-purple-600 px-4 py-3 text-sm font-semibold text-white transition disabled:opacity-60"
                >
                  {passwordPending
                    ? "Please wait…"
                    : passwordFlow === "signin"
                      ? "Sign in"
                      : "Create account"}
                </button>
              </form>

              {passwordState.status === "error" && (
                <p className="mt-4 text-sm text-red-400">{passwordState.message}</p>
              )}

              <button
                onClick={() => setPasswordFlow((f) => (f === "signin" ? "signup" : "signin"))}
                className="mt-5 text-sm text-neutral-400 hover:text-white"
              >
                {passwordFlow === "signin" ? (
                  <>
                    New to InstaCard? <span className="font-medium text-pink-400">Create an account</span>
                  </>
                ) : (
                  <>
                    Already have an account? <span className="font-medium text-pink-400">Sign in</span>
                  </>
                )}
              </button>
            </>
          ) : (
            <>
              <h1 className="text-xl font-semibold text-white">Sign in with a magic link</h1>
              <p className="mt-1 text-sm text-neutral-400">
                We&apos;ll email you a one-time sign-in link.
              </p>

              <form action={magicAction} className="mt-6 space-y-3">
                <input
                  type="email"
                  name="email"
                  placeholder="you@example.com"
                  required
                  className="w-full rounded-xl border border-neutral-700 bg-neutral-950 px-4 py-3 text-sm text-white placeholder-neutral-500 outline-none focus:border-pink-500"
                />
                <button
                  type="submit"
                  disabled={magicPending}
                  className="w-full rounded-xl bg-gradient-to-tr from-amber-400 via-pink-500 to-purple-600 px-4 py-3 text-sm font-semibold text-white transition disabled:opacity-60"
                >
                  {magicPending ? "Sending link…" : "Send magic link"}
                </button>
              </form>

              {magicState.status === "sent" && (
                <p className="mt-4 text-sm text-emerald-400">{magicState.message}</p>
              )}
              {magicState.status === "error" && (
                <p className="mt-4 text-sm text-red-400">{magicState.message}</p>
              )}
            </>
          )}
        </div>

        <p className="mt-6 text-center text-xs text-neutral-500">
          By continuing you agree to InstaCard&apos;s{" "}
          <Link href="/terms" className="underline hover:text-neutral-300">
            Terms
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="underline hover:text-neutral-300">
            Privacy Policy
          </Link>
          .
        </p>
      </div>
    </main>
  );
}
