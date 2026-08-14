"use client";

import { useTransition } from "react";
import { Download, Trash2 } from "lucide-react";
import type { Lead } from "@/lib/types";
import { deleteLead } from "@/app/dashboard/actions";

function toCsv(leads: Lead[]): string {
  const header = "Name,Contact,Submitted at";
  const rows = leads.map((l) =>
    [l.name ?? "", l.contact, new Date(l.created_at).toISOString()]
      .map((v) => `"${v.replace(/"/g, '""')}"`)
      .join(","),
  );
  return [header, ...rows].join("\n");
}

export function LeadsPanel({
  leads,
  onDeleted,
}: {
  leads: Lead[];
  onDeleted: (id: string) => void;
}) {
  const [pending, startTransition] = useTransition();

  function handleExport() {
    const blob = new Blob([toCsv(leads)], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "instacard-leads.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleDelete(id: string) {
    startTransition(async () => {
      const result = await deleteLead(id);
      if (result.ok) onDeleted(id);
    });
  }

  return (
    <div className="mt-4">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
          {leads.length} {leads.length === 1 ? "lead" : "leads"} collected
        </p>
        <button
          type="button"
          onClick={handleExport}
          disabled={leads.length === 0}
          className="flex items-center gap-1.5 rounded-lg border border-neutral-300 bg-white/80 px-3 py-1.5 text-xs font-medium text-neutral-700 shadow-sm transition hover:bg-white disabled:opacity-40 dark:border-white/10 dark:bg-white/5 dark:text-neutral-300 dark:hover:bg-white/10"
        >
          <Download className="h-3.5 w-3.5" /> Export CSV
        </button>
      </div>

      {leads.length === 0 ? (
        <p className="rounded-xl border border-dashed border-neutral-200 px-4 py-6 text-center text-sm text-neutral-400 dark:border-white/10 dark:text-neutral-500">
          No leads yet — turn on lead capture and share your card to start collecting.
        </p>
      ) : (
        <div className="overflow-hidden rounded-xl border border-neutral-200 dark:border-white/10">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-neutral-200 bg-neutral-50 text-xs text-neutral-500 dark:border-white/10 dark:bg-white/5 dark:text-neutral-400">
                <th className="px-3 py-2 font-medium">Name</th>
                <th className="px-3 py-2 font-medium">Contact</th>
                <th className="px-3 py-2 font-medium">Submitted</th>
                <th className="px-3 py-2" />
              </tr>
            </thead>
            <tbody>
              {leads.map((lead) => (
                <tr
                  key={lead.id}
                  className="border-b border-neutral-100 last:border-0 dark:border-white/5"
                >
                  <td className="px-3 py-2 text-neutral-900 dark:text-white">{lead.name || "—"}</td>
                  <td className="px-3 py-2 text-neutral-700 dark:text-neutral-300">{lead.contact}</td>
                  <td className="px-3 py-2 text-neutral-400 dark:text-neutral-500">
                    {new Date(lead.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-3 py-2 text-right">
                    <button
                      type="button"
                      onClick={() => handleDelete(lead.id)}
                      disabled={pending}
                      className="rounded-md p-1 text-red-400 hover:bg-red-50 disabled:opacity-40 dark:hover:bg-red-500/10"
                      aria-label="Delete lead"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
