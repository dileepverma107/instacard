import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export function ToolShell({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-dvh bg-neutral-950 px-6 py-12 text-white">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/tools"
          className="mb-8 inline-flex items-center gap-1.5 text-sm text-neutral-400 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          All tools
        </Link>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{title}</h1>
        <p className="mt-2 text-neutral-400">{description}</p>
        <div className="mt-8">{children}</div>
      </div>
    </main>
  );
}
