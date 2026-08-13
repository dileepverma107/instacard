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
      <div className="mb-6 flex gap-1 rounded-xl bg-neutral-200/60 p-1 w-fit">
        {(["card", "analytics"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-lg px-4 py-1.5 text-sm font-medium capitalize transition ${
              tab === t ? "bg-white text-neutral-900 shadow-sm" : "text-neutral-500"
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
