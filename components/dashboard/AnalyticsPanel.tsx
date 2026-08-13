"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { LinkBlock } from "@/lib/types";

export function AnalyticsPanel({
  links,
  clickCounts,
  totalClicks,
}: {
  links: LinkBlock[];
  clickCounts: Record<string, number>;
  totalClicks: number;
}) {
  const data = links.map((link) => ({
    name: link.label || "Untitled",
    clicks: clickCounts[link.id] ?? 0,
  }));

  return (
    <div className="max-w-3xl">
      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-white/60 bg-white/70 p-5 shadow-sm backdrop-blur-xl">
          <div className="text-2xl font-semibold text-neutral-900">{totalClicks}</div>
          <div className="text-sm text-neutral-500">Total clicks</div>
        </div>
        <div className="rounded-2xl border border-white/60 bg-white/70 p-5 shadow-sm backdrop-blur-xl">
          <div className="text-2xl font-semibold text-neutral-900">{links.length}</div>
          <div className="text-sm text-neutral-500">Active links</div>
        </div>
      </div>

      <div className="rounded-2xl border border-white/60 bg-white/70 p-5 shadow-sm backdrop-blur-xl">
        <h2 className="mb-4 text-sm font-semibold text-neutral-900">Clicks per link</h2>
        {links.length === 0 ? (
          <p className="text-sm text-neutral-400">Add links to start tracking clicks.</p>
        ) : (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} layout="vertical" margin={{ left: 8, right: 16 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e5e5e5" />
                <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12 }} />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={120}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip cursor={{ fill: "#fafafa" }} />
                <Bar dataKey="clicks" fill="#ec4899" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      <p className="mt-4 text-xs text-neutral-400">
        Unique visitors, referrer breakdowns, and time-series charts are part of the Premium plan.
      </p>
    </div>
  );
}
