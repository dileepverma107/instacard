"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { ChevronDown, Menu, X } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { TOOL_CATEGORIES, LIVE_TOOL_SLUGS } from "@/lib/toolsCatalog";

const TOP_LEVEL_SLUGS = ["merge-pdf", "split-pdf", "organize-pdf"];

export function ToolsHeader() {
  const pathname = usePathname();
  const [allToolsOpen, setAllToolsOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const topLevelTools = TOOL_CATEGORIES.flatMap((c) => c.tools).filter((t) =>
    TOP_LEVEL_SLUGS.includes(t.slug),
  );

  return (
    <header className="sticky top-0 z-30 border-b border-neutral-200/80 bg-white/90 backdrop-blur-xl dark:border-white/10 dark:bg-neutral-950/90">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3.5">
        <div className="flex items-center gap-6">
          <Link href="/tools" className="flex items-center gap-2">
            <Image src="/logo.png" alt="InstaCard" width={26} height={26} className="rounded-lg" />
            <span className="text-sm font-semibold tracking-tight text-neutral-900 dark:text-white">
              PDF Tools
            </span>
          </Link>

          <nav className="hidden items-center gap-1 lg:flex">
            {topLevelTools.map((tool) => {
              const active = pathname === `/tools/${tool.slug}`;
              return (
                <Link
                  key={tool.slug}
                  href={`/tools/${tool.slug}`}
                  className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                    active
                      ? "bg-blue-600/10 text-blue-700 dark:text-blue-400"
                      : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-300 dark:hover:bg-white/5 dark:hover:text-white"
                  }`}
                >
                  {tool.name}
                </Link>
              );
            })}

            <div
              className="relative"
              onMouseEnter={() => setAllToolsOpen(true)}
              onMouseLeave={() => setAllToolsOpen(false)}
            >
              <button
                type="button"
                className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-neutral-600 transition hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-300 dark:hover:bg-white/5 dark:hover:text-white"
              >
                All PDF Tools
                <ChevronDown className="h-3.5 w-3.5" />
              </button>
              {allToolsOpen && (
                <div className="absolute left-0 top-full flex w-[560px] gap-6 rounded-2xl border border-neutral-200 bg-white p-5 shadow-xl dark:border-white/10 dark:bg-neutral-900">
                  {TOOL_CATEGORIES.map((category) => (
                    <div key={category.name} className="flex-1">
                      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-400 dark:text-neutral-500">
                        {category.name}
                      </p>
                      <div className="space-y-0.5">
                        {category.tools.map((tool) => {
                          const isLive = LIVE_TOOL_SLUGS.has(tool.slug);
                          const active = pathname === `/tools/${tool.slug}`;
                          return isLive ? (
                            <Link
                              key={tool.slug}
                              href={`/tools/${tool.slug}`}
                              className={`block rounded-lg px-2 py-1.5 text-sm transition ${
                                active
                                  ? "font-medium text-blue-700 dark:text-blue-400"
                                  : "text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-white/5"
                              }`}
                            >
                              {tool.name}
                            </Link>
                          ) : (
                            <div
                              key={tool.slug}
                              className="flex items-center justify-between rounded-lg px-2 py-1.5 text-sm text-neutral-400 dark:text-neutral-600"
                            >
                              {tool.name}
                              <span className="rounded-full bg-neutral-100 px-1.5 py-0.5 text-[10px] dark:bg-white/5">
                                Soon
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Link
            href="/"
            className="hidden rounded-lg bg-blue-700 px-4 py-1.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-800 sm:block"
          >
            InstaCard Home
          </Link>
          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            className="rounded-lg p-2 text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-white/5 lg:hidden"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="max-h-[70vh] overflow-y-auto border-t border-neutral-200 bg-white px-6 py-4 dark:border-white/10 dark:bg-neutral-950 lg:hidden">
          {TOOL_CATEGORIES.map((category) => (
            <div key={category.name} className="mb-4">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-400 dark:text-neutral-500">
                {category.name}
              </p>
              <div className="space-y-0.5">
                {category.tools.map((tool) => {
                  const isLive = LIVE_TOOL_SLUGS.has(tool.slug);
                  return isLive ? (
                    <Link
                      key={tool.slug}
                      href={`/tools/${tool.slug}`}
                      onClick={() => setMobileOpen(false)}
                      className="block rounded-lg px-2 py-2 text-sm text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-white/5"
                    >
                      {tool.name}
                    </Link>
                  ) : (
                    <div
                      key={tool.slug}
                      className="flex items-center justify-between rounded-lg px-2 py-2 text-sm text-neutral-400 dark:text-neutral-600"
                    >
                      {tool.name}
                      <span className="rounded-full bg-neutral-100 px-1.5 py-0.5 text-[10px] dark:bg-white/5">
                        Soon
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </header>
  );
}
