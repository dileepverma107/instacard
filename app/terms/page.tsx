import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service — InstaCard",
};

export default function TermsPage() {
  return (
    <main className="min-h-dvh bg-neutral-950 px-6 py-16 text-white">
      <div className="mx-auto max-w-2xl">
        <Link href="/" className="mb-10 flex items-center gap-2">
          <Image src="/logo.png" alt="InstaCard" width={28} height={28} className="rounded-lg" />
          <span className="text-base font-semibold tracking-tight">InstaCard</span>
        </Link>

        <h1 className="text-3xl font-bold tracking-tight">Terms of Service</h1>
        <p className="mt-2 text-sm text-white/40">Last updated: August 2026</p>

        <div className="mt-8 space-y-8 text-sm leading-relaxed text-white/70">
          <p>
            These Terms govern your use of InstaCard. By creating an account or publishing a card, you agree
            to them. InstaCard is an independent product and is not affiliated with, endorsed by, or
            sponsored by Instagram or Meta.
          </p>

          <section>
            <h2 className="mb-2 text-base font-semibold text-white">1. Your account</h2>
            <p>
              You&apos;re responsible for the accuracy of the information on your card and for keeping your
              login credentials secure. You must be at least 13 years old to create an account.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-base font-semibold text-white">2. Acceptable use</h2>
            <p>You agree not to use InstaCard to publish a card that:</p>
            <ul className="mt-2 list-disc space-y-2 pl-5">
              <li>Impersonates another person or brand, or misrepresents your identity or follower count.</li>
              <li>Links to illegal content, malware, phishing pages, or scams.</li>
              <li>Infringes someone else&apos;s intellectual property or violates their privacy.</li>
              <li>Is used to harass, spam, or collect personal data from visitors without a legitimate purpose.</li>
            </ul>
            <p className="mt-2">
              We may suspend or remove any card or account that violates these terms.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-base font-semibold text-white">3. Your content</h2>
            <p>
              You retain ownership of the content you upload (photos, bio, rate card, gallery). By publishing
              a card, you grant InstaCard a limited license to host and display that content publicly at your
              chosen handle, solely to operate the service.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-base font-semibold text-white">4. Leads &amp; brand inquiries</h2>
            <p>
              If you enable lead capture or a media kit on your card, you are responsible for how you use the
              contact information visitors submit to you, including complying with applicable data protection
              and marketing laws in your jurisdiction.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-base font-semibold text-white">5. Service availability</h2>
            <p>
              InstaCard is provided &quot;as is&quot;, without warranties of any kind. We aim for high availability
              but don&apos;t guarantee uninterrupted access, and we&apos;re not liable for losses arising from
              downtime, data loss, or third-party service outages (e.g. our hosting or database providers).
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-base font-semibold text-white">6. Termination</h2>
            <p>
              You may delete your account at any time. We may suspend or terminate accounts that violate
              these Terms or applicable law.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-base font-semibold text-white">7. Changes to these terms</h2>
            <p>
              We may update these Terms as InstaCard evolves. Continued use of the service after a change
              means you accept the updated Terms.
            </p>
          </section>

          <p className="border-t border-white/10 pt-6 text-xs text-white/40">
            These terms are provided for general informational purposes and are not a substitute for
            professional legal advice.
          </p>
        </div>
      </div>
    </main>
  );
}
