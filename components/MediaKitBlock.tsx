"use client";

import { useState } from "react";
import { Briefcase, Loader2, Check } from "lucide-react";
import type { TemplateTheme } from "@/lib/templateTheme";
import type { PastCollab, RateCardItem } from "@/lib/types";

export interface MediaKitBlockProps {
  creatorId: string;
  heading: string;
  rateCard: RateCardItem[];
  pastCollabs: PastCollab[];
  theme: TemplateTheme;
  /** "live" actually submits to the API; "preview" simulates success locally (dashboard preview). */
  mode: "live" | "preview";
  accentGradient?: string;
  animClassName?: string;
  animStyle?: React.CSSProperties;
}

const DEFAULT_ACCENT_GRADIENT = "bg-gradient-to-tr from-amber-400 via-pink-500 to-purple-600";

export function MediaKitBlock({
  creatorId,
  heading,
  rateCard,
  pastCollabs,
  theme: t,
  mode,
  accentGradient = DEFAULT_ACCENT_GRADIENT,
  animClassName,
  animStyle,
}: MediaKitBlockProps) {
  const [company, setCompany] = useState("");
  const [contactName, setContactName] = useState("");
  const [email, setEmail] = useState("");
  const [budget, setBudget] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!company.trim() || !email.trim()) return;

    if (mode === "preview") {
      setStatus("success");
      return;
    }

    setStatus("submitting");
    setError(null);
    try {
      const res = await fetch("/api/brand-inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ creatorId, company, contactName, email, budget, message }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || "Something went wrong.");
      setStatus("success");
      setCompany("");
      setContactName("");
      setEmail("");
      setBudget("");
      setMessage("");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  return (
    <div className={`rounded-2xl border p-4 ${t.linkBlock} ${animClassName ?? ""}`} style={animStyle}>
      <div className="flex items-center gap-2.5">
        <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${t.iconWrap}`}>
          <Briefcase className={`h-4 w-4 ${t.icon}`} />
        </span>
        <p className={`text-sm font-medium ${t.linkLabel}`}>{heading || "Work with me"}</p>
      </div>

      {rateCard.length > 0 && (
        <div className="mt-3 space-y-1.5">
          {rateCard.map((item) => (
            <div key={item.id} className="flex items-center justify-between text-sm">
              <span className={t.linkSub}>{item.label}</span>
              <span className={`font-medium ${t.linkLabel}`}>{item.price}</span>
            </div>
          ))}
        </div>
      )}

      {pastCollabs.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {pastCollabs.map((c) =>
            c.logo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={c.id}
                src={c.logo_url}
                alt={c.name}
                title={c.name}
                className="h-7 w-auto max-w-[5rem] rounded bg-white object-contain p-1"
              />
            ) : (
              <span
                key={c.id}
                className={`rounded-full px-2.5 py-1 text-xs ${t.iconWrap} ${t.linkSub}`}
              >
                {c.name}
              </span>
            ),
          )}
        </div>
      )}

      {status === "success" ? (
        <div className="mt-3 flex items-center gap-2.5 py-1">
          <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${t.iconWrap}`}>
            <Check className={`h-4 w-4 ${t.icon}`} />
          </span>
          <span className={`text-sm font-medium ${t.linkLabel}`}>
            Thanks — I&apos;ll get back to you soon!
          </span>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-3 space-y-2">
          <input
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            placeholder="Company / brand name"
            required
            className={`w-full rounded-xl border px-3 py-2 text-sm outline-none transition ${t.formInput}`}
          />
          <div className="grid grid-cols-2 gap-2">
            <input
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
              placeholder="Your name"
              className={`w-full rounded-xl border px-3 py-2 text-sm outline-none transition ${t.formInput}`}
            />
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              placeholder="Email"
              required
              className={`w-full rounded-xl border px-3 py-2 text-sm outline-none transition ${t.formInput}`}
            />
          </div>
          <input
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            placeholder="Budget (optional)"
            className={`w-full rounded-xl border px-3 py-2 text-sm outline-none transition ${t.formInput}`}
          />
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Tell me about the collab (optional)"
            rows={2}
            className={`w-full resize-none rounded-xl border px-3 py-2 text-sm outline-none transition ${t.formInput}`}
          />
          <button
            type="submit"
            disabled={status === "submitting"}
            className={`flex w-full items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-sm font-semibold text-white transition disabled:opacity-60 ${accentGradient}`}
          >
            {status === "submitting" && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            Send inquiry
          </button>
          {status === "error" && error && <p className="text-xs text-red-400">{error}</p>}
        </form>
      )}
    </div>
  );
}
