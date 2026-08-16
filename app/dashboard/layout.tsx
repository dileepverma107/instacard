import Link from "next/link";
import Image from "next/image";
import { signOutAction } from "./actions";
import { ThemeToggle } from "@/components/ThemeToggle";
import { AdSense } from "@/components/AdSense";

const ADSENSE_CLIENT_ID = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID;

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-dvh bg-neutral-50 dark:bg-neutral-950">
      {ADSENSE_CLIENT_ID && <AdSense clientId={ADSENSE_CLIENT_ID} />}
      {/* Instagram-gradient ambient backdrop */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-24 -top-24 h-[26rem] w-[26rem] rounded-full bg-purple-500/30 blur-[100px] dark:bg-purple-500/20" />
        <div className="absolute -right-32 top-10 h-[28rem] w-[28rem] rounded-full bg-pink-500/25 blur-[110px] dark:bg-pink-500/15" />
        <div className="absolute bottom-0 left-1/3 h-[24rem] w-[24rem] rounded-full bg-amber-400/25 blur-[100px] dark:bg-amber-400/15" />
      </div>

      <header className="sticky top-0 z-20 border-b border-white/60 bg-white/70 backdrop-blur-xl dark:border-white/10 dark:bg-neutral-950/70">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/logo.png" alt="InstaCard" width={28} height={28} className="rounded-lg" />
            <span className="text-base font-semibold tracking-tight text-neutral-900 dark:text-white">
              InstaCard
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <form action={signOutAction}>
              <button
                type="submit"
                className="rounded-lg border border-neutral-300 bg-white/60 px-3 py-1.5 text-sm text-neutral-600 transition hover:bg-white dark:border-white/10 dark:bg-white/5 dark:text-neutral-300 dark:hover:bg-white/10"
              >
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>
      <main className="relative mx-auto max-w-6xl px-6 py-8">{children}</main>
    </div>
  );
}
