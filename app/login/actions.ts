"use server";

import { createClient } from "@/lib/supabase/server";
import { headers } from "next/headers";

export type LoginState = { status: "idle" | "sent" | "error"; message?: string };

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
