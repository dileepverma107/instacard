"use client";

import { useState } from "react";
import JSZip from "jszip";
import { Loader2, Download, FileText } from "lucide-react";
import { FileDropzone } from "./FileDropzone";
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
        label="Choose a PDF file or drag it here"
        onFiles={handleFile}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-white px-4 py-3 dark:border-neutral-800 dark:bg-neutral-900/50">
        <FileText className="h-4 w-4 shrink-0 text-pink-500 dark:text-pink-400" />
        <span className="flex-1 truncate text-sm text-neutral-900 dark:text-white">{file.name}</span>
        <span className="text-xs text-neutral-500">{pageCount} pages</span>
      </div>

      <div className="flex gap-2">
        {(["individual", "custom"] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setMode(m)}
            className={`flex-1 rounded-xl border px-4 py-2.5 text-sm font-medium transition ${
              mode === m
                ? "border-pink-500 bg-pink-500/10 text-neutral-900 dark:text-white"
                : "border-neutral-200 text-neutral-500 hover:border-neutral-300 dark:border-neutral-800 dark:text-neutral-400 dark:hover:border-neutral-700"
            }`}
          >
            {m === "individual" ? "Split into single pages" : "Custom ranges"}
          </button>
        ))}
      </div>

      {mode === "custom" && (
        <div>
          <input
            value={customRanges}
            onChange={(e) => setCustomRanges(e.target.value)}
            placeholder="e.g. 1-3, 4-6, 7-10"
            className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-sm text-neutral-900 placeholder-neutral-400 outline-none focus:border-pink-500 dark:border-neutral-700 dark:bg-neutral-950 dark:text-white dark:placeholder-neutral-500"
          />
          <p className="mt-1.5 text-xs text-neutral-500">
            Each range becomes its own PDF file, bundled in a zip.
          </p>
        </div>
      )}

      {error && <p className="text-sm text-red-500 dark:text-red-400">{error}</p>}

      <button
        type="button"
        onClick={handleSplit}
        disabled={status === "working"}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-tr from-amber-400 via-pink-500 to-purple-600 px-4 py-3 text-sm font-semibold text-white transition disabled:opacity-40"
      >
        {status === "working" ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Download className="h-4 w-4" />
        )}
        Split & Download
      </button>
    </div>
  );
}
