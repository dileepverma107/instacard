"use client";

import { useState } from "react";
import JSZip from "jszip";
import { Loader2, Download, FileText } from "lucide-react";
import { FileDropzone } from "./FileDropzone";
import { ToolWorkspace } from "./ToolWorkspace";
import { getPageCount } from "@/lib/pdf/render";
import { splitPdf } from "@/lib/pdf/operations";

type Mode = "individual" | "custom";

function parseRanges(input: string, pageCount: number): Array<{ start: number; end: number }> {
  const ranges: Array<{ start: number; end: number }> = [];
  for (const part of input.split(",")) {
    const trimmed = part.trim();
    if (!trimmed) continue;
    const match = trimmed.match(/^(\d+)(?:-(\d+))?$/);
    if (!match) throw new Error(`Invalid range: "${trimmed}"`);
    const start = Number(match[1]);
    const end = match[2] ? Number(match[2]) : start;
    if (start < 1 || end > pageCount || start > end) {
      throw new Error(`Range "${trimmed}" is out of bounds (this PDF has ${pageCount} pages).`);
    }
    ranges.push({ start, end });
  }
  if (ranges.length === 0) throw new Error("Enter at least one page range.");
  return ranges;
}

export function SplitTool() {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState<number | null>(null);
  const [mode, setMode] = useState<Mode>("individual");
  const [customRanges, setCustomRanges] = useState("");
  const [status, setStatus] = useState<"idle" | "working" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleFile(files: File[]) {
    const f = files[0];
    if (!f) return;
    setFile(f);
    setError(null);
    try {
      setPageCount(await getPageCount(f));
    } catch {
      setError("Couldn't read this PDF — it may be corrupted.");
      setFile(null);
    }
  }

  async function handleSplit() {
    if (!file || !pageCount) return;
    setStatus("working");
    setError(null);
    try {
      const ranges =
        mode === "individual"
          ? Array.from({ length: pageCount }, (_, i) => ({ start: i + 1, end: i + 1 }))
          : parseRanges(customRanges, pageCount);

      const results = await splitPdf(file, ranges);
      const zip = new JSZip();
      results.forEach((bytes, i) => {
        const { start, end } = ranges[i];
        const label = start === end ? `page-${start}` : `pages-${start}-${end}`;
        zip.file(`${label}.pdf`, bytes);
      });
      const blob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "split.zip";
      a.click();
      URL.revokeObjectURL(url);
      setStatus("idle");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong while splitting.");
      setStatus("error");
    }
  }

  if (!file) {
    return (
      <FileDropzone
        accept="application/pdf"
        label="Select PDF file"
        sublabel="Choose a file to get started"
        onFiles={handleFile}
      />
    );
  }

  return (
    <ToolWorkspace
      main={
        <div className="space-y-4">
          <div className="flex items-center gap-3 rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-white/[0.03]">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-700">
              <FileText className="h-4.5 w-4.5 text-white" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-neutral-900 dark:text-white">
                {file.name}
              </p>
              <p className="text-xs text-neutral-400">{pageCount} pages</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {(["individual", "custom"] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                className={`rounded-2xl border-2 p-4 text-left text-sm font-medium transition ${
                  mode === m
                    ? "border-blue-500 bg-blue-500/5 text-neutral-900 dark:text-white"
                    : "border-neutral-200 text-neutral-500 hover:border-neutral-300 dark:border-white/10 dark:text-neutral-400 dark:hover:border-white/20"
                }`}
              >
                {m === "individual" ? "Split into single pages" : "Custom ranges"}
                <p className="mt-1 text-xs font-normal text-neutral-400">
                  {m === "individual"
                    ? "Every page becomes its own file"
                    : "You choose the page ranges"}
                </p>
              </button>
            ))}
          </div>

          {mode === "custom" && (
            <div>
              <input
                value={customRanges}
                onChange={(e) => setCustomRanges(e.target.value)}
                placeholder="e.g. 1-3, 4-6, 7-10"
                className="w-full rounded-2xl border border-neutral-300 bg-white px-4 py-3.5 text-sm text-neutral-900 placeholder-neutral-400 outline-none focus:border-blue-500 dark:border-white/10 dark:bg-white/[0.03] dark:text-white dark:placeholder-neutral-500"
              />
              <p className="mt-1.5 text-xs text-neutral-500">
                Each range becomes its own PDF file, bundled in a zip.
              </p>
            </div>
          )}
        </div>
      }
      sidebar={
        <div className="space-y-5">
          <div>
            <p className="text-sm font-semibold text-neutral-900 dark:text-white">Ready to split</p>
            <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
              Output is a zip file with one PDF per range.
            </p>
          </div>

          {error && <p className="text-sm text-red-500 dark:text-red-400">{error}</p>}

          <button
            type="button"
            onClick={handleSplit}
            disabled={status === "working"}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-700 px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-700/25 transition hover:bg-blue-800 hover:shadow-xl hover:shadow-blue-700/30 disabled:opacity-40 disabled:shadow-none"
          >
            {status === "working" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            Split & Download
          </button>
        </div>
      }
    />
  );
}
