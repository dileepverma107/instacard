"use client";

import { useTransition } from "react";
import { Download, Trash2 } from "lucide-react";
import type { BrandInquiry } from "@/lib/types";
import { deleteBrandInquiry } from "@/app/dashboard/actions";

function toCsv(inquiries: BrandInquiry[]): string {
  const header = "Company,Contact,Email,Budget,Message,Submitted at";
  const rows = inquiries.map((i) =>
    [
      i.company,
      i.contact_name ?? "",
      i.email,
      i.budget ?? "",
      i.message ?? "",
      new Date(i.created_at).toISOString(),
    ]
      .map((v) => `"${v.replace(/"/g, '""')}"`)
      .join(","),
  );
  return [header, ...rows].join("\n");
}

export function BrandInquiriesPanel({
  inquiries,
  onDeleted,
}: {
  inquiries: BrandInquiry[];
  onDeleted: (id: string) => void;
}) {
  const [pending, startTransition] = useTransition();

  function handleExport() {
    const blob = new Blob([toCsv(inquiries)], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "instacard-brand-inquiries.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleDelete(id: string) {
    startTransition(async () => {
      const result = await deleteBrandInquiry(id);
      if (result.ok) onDeleted(id);
    });
  }

  return (
    <div className="mt-4">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
          {inquiries.length} {inquiries.length === 1 ? "inquiry" : "inquiries"} received
        </p>
        <button
          type="button"
          onClick={handleExport}
          disabled={inquiries.length === 0}
          className="flex items-center gap-1.5 rounded-lg border border-neutral-300 bg-white/80 px-3 py-1.5 text-xs font-medium text-neutral-700 shadow-sm transition hover:bg-white disabled:opacity-40 dark:border-white/10 dark:bg-white/5 dark:text-neutral-300 dark:hover:bg-white/10"
        >
          <Download className="h-3.5 w-3.5" /> Export CSV
        </button>
      </div>

      {inquiries.length === 0 ? (
        <p className="rounded-xl border border-dashed border-neutral-200 px-4 py-6 text-center text-sm text-neutral-400 dark:border-white/10 dark:text-neutral-500">
          No brand inquiries yet — turn on your media kit and share your card to start getting them.
        </p>
      ) : (
        <div className="space-y-2">
          {inquiries.map((inquiry) => (
            <div
              key={inquiry.id}
              className="rounded-xl border border-neutral-200 p-3 text-sm dark:border-white/10"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-medium text-neutral-900 dark:text-white">{inquiry.company}</p>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">
                    {inquiry.contact_name ? `${inquiry.contact_name} · ` : ""}
                    {inquiry.email}
                    {inquiry.budget ? ` · Budget: ${inquiry.budget}` : ""}
                  </p>
                  {inquiry.message && (
                    <p className="mt-1 text-xs text-neutral-600 dark:text-neutral-300">
                      {inquiry.message}
                    </p>
                  )}
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <span className="text-xs text-neutral-400 dark:text-neutral-500">
                    {new Date(inquiry.created_at).toLocaleDateString()}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleDelete(inquiry.id)}
                    disabled={pending}
                    className="rounded-md p-1 text-red-400 hover:bg-red-50 disabled:opacity-40 dark:hover:bg-red-500/10"
                    aria-label="Delete inquiry"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
