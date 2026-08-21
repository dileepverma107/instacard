"use client";

import { useState } from "react";
import { Loader2, Download, FileText } from "lucide-react";
import { FileDropzone } from "./FileDropzone";
import { PdfPageGrid, type PdfPageGridMode } from "./PdfPageGrid";
import { renderPageThumbnails, type PageThumbnail } from "@/lib/pdf/render";
import { rebuildFromPages, downloadBytes, type OrderedPage } from "@/lib/pdf/operations";

export function PageGridTool({
  mode,
  hint,
  outputFilename,
  actionLabel,
}: {
  mode: PdfPageGridMode;
  hint: string;
  outputFilename: string;
  actionLabel: string;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [thumbnails, setThumbnails] = useState<PageThumbnail[]>([]);
  const [result, setResult] = useState<OrderedPage[]>([]);
  const [status, setStatus] = useState<"idle" | "loading" | "working" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleFile(files: File[]) {
    const f = files[0];
    if (!f) return;
    setStatus("loading");
    setError(null);
    try {
      const pages = await renderPageThumbnails(f);
      setFile(f);
      setThumbnails(pages);
      setStatus("idle");
    } catch {
      setError("Couldn't read this PDF — it may be corrupted.");
      setStatus("error");
    }
  }

  async function handleSave() {
    if (!file) return;
    setStatus("working");
    setError(null);
    try {
      const bytes = await rebuildFromPages(file, result);
      downloadBytes(bytes, outputFilename);
      setStatus("idle");
    } catch {
      setError("Something went wrong while saving your PDF.");
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

  if (status === "loading") {
    return (
      <div className="flex flex-col items-center gap-3 py-16 text-neutral-400">
        <Loader2 className="h-6 w-6 animate-spin" />
        Rendering pages…
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 rounded-xl border border-neutral-800 bg-neutral-900/50 px-4 py-3">
        <FileText className="h-4 w-4 shrink-0 text-pink-400" />
        <span className="flex-1 truncate text-sm text-white">{file.name}</span>
        <span className="text-xs text-neutral-500">{thumbnails.length} pages</span>
      </div>

      <p className="text-sm text-neutral-400">{hint}</p>

      <PdfPageGrid pages={thumbnails} mode={mode} onChange={setResult} />

      {error && <p className="text-sm text-red-400">{error}</p>}

      <button
        type="button"
        onClick={handleSave}
        disabled={result.length === 0 || status === "working"}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-tr from-amber-400 via-pink-500 to-purple-600 px-4 py-3 text-sm font-semibold text-white transition disabled:opacity-40"
      >
        {status === "working" ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Download className="h-4 w-4" />
        )}
        {actionLabel} ({result.length} page{result.length === 1 ? "" : "s"})
      </button>
    </div>
  );
}
