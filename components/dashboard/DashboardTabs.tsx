"use client";

import { useState } from "react";
import type { Creator, LinkBlock } from "@/lib/types";
import { DashboardEditor } from "./DashboardEditor";
import { AnalyticsPanel } from "./AnalyticsPanel";

export function DashboardTabs({
  creator,
  links,
  clickCounts,
  totalClicks,
}: {
  creator: Creator;
  links: LinkBlock[];
  clickCounts: Record<string, number>;
  totalClicks: number;
}) {
  const [tab, setTab] = useState<"card" | "analytics">("card");

  return (
    <div>
      <div className="mb-6 flex w-fit gap-1 rounded-xl border border-white/60 bg-white/50 p-1 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-white/5">
        {(["card", "analytics"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-lg px-4 py-1.5 text-sm font-medium capitalize transition ${
              tab === t
                ? "bg-white text-neutral-900 shadow-sm dark:bg-neutral-800 dark:text-white"
                : "text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200"
            }`}
          >
            {t === "card" ? "Your card" : "Analytics"}
          </button>
        ))}
      </div>

      {tab === "card" ? (
        <DashboardEditor creator={creator} initialLinks={links} />
      ) : (
        <AnalyticsPanel links={links} clickCounts={clickCounts} totalClicks={totalClicks} />
      )}
    </div>
  );
}
