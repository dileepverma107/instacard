import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — InstaCard",
};

export default function PrivacyPage() {
  return (
    <main className="min-h-dvh bg-neutral-950 px-6 py-16 text-white">
      <div className="mx-auto max-w-2xl">
        <Link href="/" className="mb-10 flex items-center gap-2">
          <Image src="/logo.png" alt="InstaCard" width={28} height={28} className="rounded-lg" />
          <span className="text-base font-semibold tracking-tight">InstaCard</span>
        </Link>

        <h1 className="text-3xl font-bold tracking-tight">Privacy Policy</h1>
        <p className="mt-2 text-sm text-white/40">Last updated: August 2026</p>

        <div className="mt-8 space-y-8 text-sm leading-relaxed text-white/70">
          <p>
            This Privacy Policy explains what information InstaCard (&quot;we&quot;, &quot;us&quot;) collects, why, and how
            it&apos;s used, for both creators who make a card and visitors who view one.
          </p>

          <section>
            <h2 className="mb-2 text-base font-semibold text-white">1. Information we collect</h2>
            <ul className="list-disc space-y-2 pl-5">
              <li>
                <span className="font-medium text-white/90">Creator account data</span> — email address,
                password (hashed, never stored in plain text), profile details you add (name, bio, handle,
                photo, links, follower count, accent color, gallery images, rate card, and any other card
                content you choose to fill in).
              </li>
              <li>
                <span className="font-medium text-white/90">Visitor analytics</span> — when someone views a
                published card or taps a link, we log an anonymous page view or click event (timestamp,
                referrer, and browser user-agent). We do not store IP addresses or use this data to identify
                individual visitors.
              </li>
              <li>
                <span className="font-medium text-white/90">Leads &amp; brand inquiries</span> — if a visitor
                submits their email/contact info through a creator&apos;s subscribe form, or a brand submits an
                inquiry through a creator&apos;s media kit, that information is stored and made visible only to
                the creator whose card received it.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="mb-2 text-base font-semibold text-white">2. How we use it</h2>
            <p>
              To operate your card (rendering it publicly at your handle), show you analytics about your own
              card&apos;s performance, deliver leads and brand inquiries to your dashboard, and keep the service
              secure and working. We do not sell personal data, and we do not use visitor data for
              advertising.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-base font-semibold text-white">3. Third-party processors</h2>
            <p>We rely on the following infrastructure providers to run InstaCard:</p>
            <ul className="mt-2 list-disc space-y-2 pl-5">
              <li>
                <span className="font-medium text-white/90">Supabase</span> — database, authentication, and
                file storage (profile photos, gallery images, media kit logos).
              </li>
              <li>
                <span className="font-medium text-white/90">Vercel</span> — application hosting and delivery.
              </li>
            </ul>
            <p className="mt-2">
              Each provider processes data solely to provide their respective service to InstaCard and is
              bound by their own privacy and security commitments.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-base font-semibold text-white">4. Cookies &amp; sessions</h2>
            <p>
              We use a small number of essential cookies set by Supabase Auth to keep creators signed in
              between visits. These are required for the dashboard to function and are not used for
              cross-site tracking or advertising.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-base font-semibold text-white">5. Data retention &amp; deletion</h2>
            <p>
              Your card data is retained for as long as your account exists. To request deletion of your
              account and all associated data (card, links, leads, brand inquiries, analytics), email us at{" "}
              <a href="mailto:privacy@instacard.app" className="text-white underline">
                privacy@instacard.app
              </a>
              . Visitors who submitted a lead or brand inquiry to a creator can request removal of that
              specific record by contacting the creator directly, or us at the same address.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-base font-semibold text-white">6. Changes to this policy</h2>
            <p>
              We may update this policy as InstaCard evolves. Material changes will be reflected by updating
              the &quot;Last updated&quot; date above.
            </p>
          </section>

          <p className="border-t border-white/10 pt-6 text-xs text-white/40">
            This policy is provided for transparency and general informational purposes and is not a
            substitute for professional legal advice.
          </p>
        </div>
      </div>
    </main>
  );
}
