import Link from "next/link";
import { signOutAction } from "./actions";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-neutral-100">
      <header className="border-b border-neutral-200 bg-white">
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
              className="rounded-lg border border-neutral-300 px-3 py-1.5 text-sm text-neutral-600 transition hover:bg-neutral-50"
            >
              Sign out
            </button>
          </form>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
    </div>
  );
}
