import Link from "next/link";
import type { Metadata } from "next";
import { Check, X } from "lucide-react";
import { PhoneFrame } from "@/components/PhoneFrame";
import { CreatorCard } from "@/components/CreatorCard";
import { AdSense } from "@/components/AdSense";

const ADSENSE_CLIENT_ID = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID;

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

const SAMPLE_LINKS = [
  {
    id: "1",
    label: "Shop my Lightroom presets",
    sub_label: "presets.co/maya",
    icon: "shopping-bag",
    url: "#",
    sub_links: [],
    is_featured: true,
    ends_at: null,
  },
  {
    id: "2",
    label: "Brand collabs & rate card",
    sub_label: "Get in touch",
    icon: "briefcase",
    url: "#",
    sub_links: [],
    is_featured: false,
    ends_at: null,
  },
  {
    id: "3",
    label: "Latest YouTube video",
    sub_label: "48K views this week",
    icon: "youtube",
    url: "#",
    sub_links: [],
    is_featured: false,
    ends_at: null,
  },
  {
    id: "4",
    label: "DM me on WhatsApp",
    sub_label: "Fastest way to reach me",
    icon: "message-circle",
    url: "#",
    sub_links: [],
    is_featured: false,
    ends_at: null,
  },
];

const structuredData = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "InstaCard",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  url: "https://instacards.in",
  description:
    "InstaCard is the link-in-bio page built for Instagram's in-app browser — an Instagram-native creator portfolio, not another generic link list.",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
};

export default function LandingPage() {
  return (
    <main className="flex-1 bg-neutral-950 text-white">
      {ADSENSE_CLIENT_ID && <AdSense clientId={ADSENSE_CLIENT_ID} />}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-2">
          <span className="h-7 w-7 rounded-lg bg-gradient-to-tr from-amber-400 via-pink-500 to-purple-600" />
          <span className="text-base font-semibold tracking-tight">InstaCard</span>
        </div>
        <Link
          href="/login"
          className="rounded-lg border border-white/15 px-4 py-2 text-sm font-medium text-white/90 transition hover:bg-white/5"
        >
          Sign in
        </Link>
      </nav>

      {/* hero */}
      <section className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-12 px-6 py-12 lg:grid-cols-2 lg:py-20">
        <div>
          <p className="mb-4 inline-block rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-white/60">
            Built for Instagram&apos;s in-app browser
          </p>
          <h1 className="text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
            The portfolio that feels like an extension of your Instagram profile.
          </h1>
          <p className="mt-5 max-w-lg text-lg text-white/60">
            Linktree and Beacons drop your followers onto a generic web page. InstaCard keeps the
            experience native — so the link in your bio converts brand deals and sales instead of
            just clicks.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              href="/login"
              className="rounded-xl bg-gradient-to-tr from-amber-400 via-pink-500 to-purple-600 px-6 py-3 text-sm font-semibold text-white"
            >
              Create your card — free
            </Link>
            <a href="#compare" className="text-sm font-medium text-white/70 hover:text-white">
              See how it&apos;s different →
            </a>
          </div>
        </div>

        <div className="flex justify-center">
          <PhoneFrame>
            <CreatorCard
              name="Maya Fernandes"
              handle="maya.shoots"
              avatarUrl={null}
              followerCount={128000}
              bioLine="Travel photographer 📸 Based in Goa. Presets, prints & collabs below."
              links={SAMPLE_LINKS}
              showBranding
              mode="preview"
            />
          </PhoneFrame>
        </div>
      </section>

      {/* differentiation */}
      <section id="compare" className="border-t border-white/10 bg-neutral-900/50 py-20">
        <div className="mx-auto max-w-4xl px-6">
          <h2 className="text-center text-2xl font-semibold sm:text-3xl">
            Not another link-in-bio page
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-center text-white/50">
            90% of your bio-link traffic lands inside Instagram&apos;s own in-app browser. Nobody
            designs for that. We do.
          </p>

          <div className="mt-12 overflow-hidden rounded-2xl border border-white/10">
            <div className="grid grid-cols-3 bg-white/[0.03] text-sm">
              <div className="p-4 text-white/40"></div>
              <div className="p-4 font-medium text-white/60">Linktree / Beacons</div>
              <div className="p-4 font-medium text-white">InstaCard</div>
            </div>
            {[
              ["Design language", "Generic web page", "Mimics Instagram's own UI"],
              ["Positioning", "“Link in bio”", "Instagram-first creator portfolio"],
              ["Sold on", "Clicks", "Brand inquiries & conversions"],
            ].map(([label, left, right]) => (
              <div key={label} className="grid grid-cols-3 border-t border-white/10 text-sm">
                <div className="p-4 text-white/40">{label}</div>
                <div className="flex items-center gap-2 p-4 text-white/60">
                  <X className="h-4 w-4 shrink-0 text-white/30" /> {left}
                </div>
                <div className="flex items-center gap-2 p-4 text-white">
                  <Check className="h-4 w-4 shrink-0 text-emerald-400" /> {right}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* how it works */}
      <section className="py-20">
        <div className="mx-auto max-w-4xl px-6">
          <h2 className="text-center text-2xl font-semibold sm:text-3xl">
            Live in under two minutes
          </h2>
          <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-3">
            {[
              ["1", "Build your card", "Add your avatar, bio, and up to 6 link blocks."],
              ["2", "Preview it live", "See exactly how it renders on a phone as you type."],
              ["3", "Drop it in your bio", "Publish to instacard.in/@you and copy it into Instagram."],
            ].map(([n, title, body]) => (
              <div key={n}>
                <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-tr from-amber-400 via-pink-500 to-purple-600 text-sm font-semibold">
                  {n}
                </div>
                <h3 className="font-semibold">{title}</h3>
                <p className="mt-1.5 text-sm text-white/50">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-white/10 py-10 text-center text-sm text-white/40">
        <p>© {new Date().getFullYear()} InstaCard. Not affiliated with Instagram or Meta.</p>
        <div className="mt-2 flex items-center justify-center gap-4">
          <Link href="/privacy" className="hover:text-white/70">
            Privacy
          </Link>
          <Link href="/terms" className="hover:text-white/70">
            Terms
          </Link>
        </div>
      </footer>
    </main>
  );
}
