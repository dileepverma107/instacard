"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import type { LinkBlock } from "@/lib/types";

export function AnalyticsPanel({
  links,
  clickCounts,
  totalClicks,
  pageViews,
}: {
  links: LinkBlock[];
  clickCounts: Record<string, number>;
  totalClicks: number;
  pageViews: number;
}) {
  const ctr = pageViews > 0 ? (totalClicks / pageViews) * 100 : 0;
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    // Theme is only known client-side; render the default (dark) chart
    // colors until mounted so server and first client render match.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);
  const isDark = mounted ? resolvedTheme === "dark" : true;

  const gridColor = isDark ? "#3f3f46" : "#e5e5e5";
  const tickColor = isDark ? "#a1a1aa" : "#525252";
  const tooltipBg = isDark ? "#27272a" : "#fafafa";

  const data = links.map((link) => ({
    name: link.label || "Untitled",
    clicks: clickCounts[link.id] ?? 0,
  }));

  return (
    <div className="max-w-3xl animate-card-in">
      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-2xl border border-white/60 bg-white/70 p-5 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.04]">
          <div className="text-2xl font-semibold text-neutral-900 dark:text-white">
            {pageViews}
          </div>
          <div className="text-sm text-neutral-500 dark:text-neutral-400">Page views</div>
        </div>
        <div className="rounded-2xl border border-white/60 bg-white/70 p-5 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.04]">
          <div className="text-2xl font-semibold text-neutral-900 dark:text-white">
            {totalClicks}
          </div>
          <div className="text-sm text-neutral-500 dark:text-neutral-400">Total clicks</div>
        </div>
        <div className="rounded-2xl border border-white/60 bg-white/70 p-5 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.04]">
          <div className="text-2xl font-semibold text-neutral-900 dark:text-white">
            {ctr.toFixed(1)}%
          </div>
          <div className="text-sm text-neutral-500 dark:text-neutral-400">Click-through rate</div>
        </div>
        <div className="rounded-2xl border border-white/60 bg-white/70 p-5 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.04]">
          <div className="text-2xl font-semibold text-neutral-900 dark:text-white">
            {links.length}
          </div>
          <div className="text-sm text-neutral-500 dark:text-neutral-400">Active links</div>
        </div>
      </div>

      <div className="rounded-2xl border border-white/60 bg-white/70 p-5 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.04]">
        <h2 className="mb-4 text-sm font-semibold text-neutral-900 dark:text-white">
          Clicks per link
        </h2>
        {links.length === 0 ? (
          <p className="text-sm text-neutral-400 dark:text-neutral-500">
            Add links to start tracking clicks.
          </p>
        ) : (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} layout="vertical" margin={{ left: 8, right: 16 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={gridColor} />
                <XAxis
                  type="number"
                  allowDecimals={false}
                  tick={{ fontSize: 12, fill: tickColor }}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={120}
                  tick={{ fontSize: 12, fill: tickColor }}
                />
                <Tooltip
                  cursor={{ fill: isDark ? "#ffffff0d" : "#fafafa" }}
                  contentStyle={{
                    backgroundColor: tooltipBg,
                    border: "none",
                    borderRadius: 8,
                    color: isDark ? "#fff" : "#171717",
                  }}
                />
                <Bar dataKey="clicks" fill="#ec4899" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      <p className="mt-4 text-xs text-neutral-400 dark:text-neutral-500">
        Unique visitors, referrer breakdowns, and time-series charts are part of the Premium plan.
      </p>
    </div>
  );
}
