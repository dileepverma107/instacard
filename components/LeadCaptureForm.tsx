"use client";

import { useState } from "react";
import { Mail, Loader2, Check } from "lucide-react";
import type { TemplateTheme } from "@/lib/templateTheme";

export interface LeadCaptureFormProps {
  creatorId: string;
  heading: string;
  buttonText: string;
  theme: TemplateTheme;
  /** "live" actually submits to the API; "preview" simulates success locally (dashboard preview). */
  mode: "live" | "preview";
  animClassName?: string;
  animStyle?: React.CSSProperties;
}

export function LeadCaptureForm({
  creatorId,
  heading,
  buttonText,
  theme: t,
  mode,
  animClassName,
  animStyle,
}: LeadCaptureFormProps) {
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!contact.trim()) return;

    if (mode === "preview") {
      setStatus("success");
      return;
    }

    setStatus("submitting");
    setError(null);
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ creatorId, name, contact }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || "Something went wrong.");
      setStatus("success");
      setName("");
      setContact("");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  return (
    <div className={`rounded-2xl border p-4 ${t.linkBlock} ${animClassName ?? ""}`} style={animStyle}>
      {status === "success" ? (
        <div className="flex items-center gap-2.5 py-1">
          <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${t.iconWrap}`}>
            <Check className={`h-4 w-4 ${t.icon}`} />
          </span>
          <span className={`text-sm font-medium ${t.linkLabel}`}>Thanks — you&apos;re on the list!</span>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-2.5">
          <div className="flex items-center gap-2.5">
            <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${t.iconWrap}`}>
              <Mail className={`h-4 w-4 ${t.icon}`} />
            </span>
            <p className={`text-sm font-medium ${t.linkLabel}`}>{heading || "Get updates from me"}</p>
          </div>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Name (optional)"
            className={`w-full rounded-xl border px-3 py-2 text-sm outline-none transition ${t.formInput}`}
          />
          <input
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            placeholder="Email or WhatsApp number"
            required
            className={`w-full rounded-xl border px-3 py-2 text-sm outline-none transition ${t.formInput}`}
          />
          <button
            type="submit"
            disabled={status === "submitting"}
            className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-gradient-to-tr from-amber-400 via-pink-500 to-purple-600 px-3 py-2 text-sm font-semibold text-white transition disabled:opacity-60"
          >
            {status === "submitting" && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            {buttonText || "Subscribe"}
          </button>
          {status === "error" && error && <p className="text-xs text-red-400">{error}</p>}
        </form>
      )}
    </div>
  );
}
