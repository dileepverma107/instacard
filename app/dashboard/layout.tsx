import Link from "next/link";
import { signOutAction } from "./actions";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-dvh bg-neutral-50">
      {/* Instagram-gradient ambient backdrop */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-24 -top-24 h-[26rem] w-[26rem] rounded-full bg-purple-500/30 blur-[100px]" />
        <div className="absolute -right-32 top-10 h-[28rem] w-[28rem] rounded-full bg-pink-500/25 blur-[110px]" />
        <div className="absolute bottom-0 left-1/3 h-[24rem] w-[24rem] rounded-full bg-amber-400/25 blur-[100px]" />
      </div>

      <header className="sticky top-0 z-20 border-b border-white/60 bg-white/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2">
            <span className="h-7 w-7 rounded-lg bg-gradient-to-tr from-amber-400 via-pink-500 to-purple-600" />
            <span className="text-base font-semibold tracking-tight text-neutral-900">
              InstaCard
            </span>
          </Link>
          <form action={signOutAction}>
            <button
              type="submit"
              className="rounded-lg border border-neutral-300 bg-white/60 px-3 py-1.5 text-sm text-neutral-600 transition hover:bg-white"
            >
              Sign out
            </button>
          </form>
        </div>
      </header>
      <main className="relative mx-auto max-w-6xl px-6 py-8">{children}</main>
    </div>
  );
}
