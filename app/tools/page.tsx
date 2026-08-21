import Link from "next/link";
import type { Metadata } from "next";
import {
  Layers, Scissors, FileMinus, FileOutput, Grid3x3, Camera,
  Shrink, Wrench, ScanText, Image as ImageIcon, FileText,
  Droplet, Hash, Crop, Lock, Unlock, PenLine, Lock as LockIcon,
} from "lucide-react";
import { TOOL_CATEGORIES, LIVE_TOOL_SLUGS } from "@/lib/toolsCatalog";

export const metadata: Metadata = {
  title: "Free PDF Tools — InstaCard",
  description: "Merge, split, organize, and edit PDFs for free, right in your browser. No upload, no sign-up required.",
  alternates: { canonical: "/tools" },
};

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  layers: Layers,
  scissors: Scissors,
  "file-minus": FileMinus,
  "file-output": FileOutput,
  grid: Grid3x3,
  camera: Camera,
  shrink: Shrink,
  wrench: Wrench,
  "scan-text": ScanText,
  image: ImageIcon,
  "file-text": FileText,
  droplet: Droplet,
  hash: Hash,
  crop: Crop,
  lock: Lock,
  unlock: Unlock,
  "pen-line": PenLine,
};

export default function ToolsHubPage() {
  return (
    <main className="px-6 py-14 sm:py-20">
      <div className="mx-auto max-w-5xl">
        <div className="text-center">
          <p className="mb-4 inline-block rounded-full border border-neutral-200 bg-white px-3 py-1 text-xs font-medium text-neutral-500 dark:border-white/10 dark:bg-white/5 dark:text-neutral-400">
            100% free · runs in your browser
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-white sm:text-4xl">
            Every PDF tool you need
          </h1>
          <p className="mx-auto mt-3 max-w-lg text-neutral-500 dark:text-neutral-400">
            Files are never uploaded to a server unless you choose to save the result to your
            account — everything happens right here on your device.
          </p>
        </div>

        <div className="mt-14 space-y-12">
          {TOOL_CATEGORIES.map((category) => (
            <section key={category.name}>
              <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-neutral-400 dark:text-neutral-500">
                {category.name}
              </h2>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                {category.tools.map((tool) => {
                  const Icon = ICONS[tool.icon] ?? LockIcon;
                  const isLive = LIVE_TOOL_SLUGS.has(tool.slug);
                  const content = (
                    <>
                      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-tr from-amber-400 via-pink-500 to-purple-600">
                        <Icon className="h-4.5 w-4.5 text-white" />
                      </span>
                      <p className="mt-3 text-sm font-semibold text-neutral-900 dark:text-white">
                        {tool.name}
                      </p>
                      <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-500">
                        {tool.description}
                      </p>
                      {!isLive && (
                        <span className="mt-2 inline-block rounded-full bg-neutral-100 px-2 py-0.5 text-[10px] font-medium text-neutral-500 dark:bg-white/5 dark:text-neutral-400">
                          Coming soon
                        </span>
                      )}
                    </>
                  );
                  return isLive ? (
                    <Link
                      key={tool.slug}
                      href={`/tools/${tool.slug}`}
                      className="rounded-2xl border border-neutral-200/80 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-neutral-300 hover:shadow-md dark:border-white/10 dark:bg-white/[0.03] dark:hover:border-white/20 dark:hover:bg-white/[0.06]"
                    >
                      {content}
                    </Link>
                  ) : (
                    <div
                      key={tool.slug}
                      className="cursor-not-allowed rounded-2xl border border-neutral-200/80 bg-white p-4 opacity-50 dark:border-white/10 dark:bg-white/[0.03]"
                    >
                      {content}
                    </div>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}
