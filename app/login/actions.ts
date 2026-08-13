"use server";

import { createClient } from "@/lib/supabase/server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export type LoginState = { status: "idle" | "sent" | "error"; message?: string };
export type PasswordState = { status: "idle" | "error"; message?: string };

export async function sendMagicLink(
  _prevState: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const email = String(formData.get("email") || "").trim();
  if (!email || !email.includes("@")) {
    return { status: "error", message: "Enter a valid email address." };
  }

  const supabase = await createClient();
  const originHeader = (await headers()).get("origin");
  const origin = originHeader ?? process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${origin}/auth/callback`,
    },
  });

  if (error) {
    return { status: "error", message: error.message };
  }

  return { status: "sent", message: `Check ${email} for your sign-in link.` };
}

function readCredentials(formData: FormData): { email: string; password: string } {
  return {
    email: String(formData.get("email") || "").trim(),
    password: String(formData.get("password") || ""),
  };
}

export async function signUpWithPassword(
  _prevState: PasswordState,
  formData: FormData,
): Promise<PasswordState> {
  const { email, password } = readCredentials(formData);
  if (!email || !email.includes("@")) {
    return { status: "error", message: "Enter a valid email address." };
  }
  if (password.length < 6) {
    return { status: "error", message: "Password must be at least 6 characters." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) {
    return { status: "error", message: error.message };
  }
  if (!data.session) {
    return {
      status: "error",
      message:
        "Account created, but email confirmation is required. Ask the project owner to disable " +
        "\"Confirm email\" under Authentication → Providers → Email in Supabase, or check your inbox.",
    };
  }

  redirect("/dashboard");
}

export async function signInWithPassword(
  _prevState: PasswordState,
  formData: FormData,
): Promise<PasswordState> {
  const { email, password } = readCredentials(formData);
  if (!email || !password) {
    return { status: "error", message: "Enter your email and password." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    return { status: "error", message: error.message };
  }

  redirect("/dashboard");
}
