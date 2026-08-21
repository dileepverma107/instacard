"use client";

import { useState } from "react";
import { Loader2, Download, FileText } from "lucide-react";
import { FileDropzone } from "./FileDropzone";
import { PdfPageGrid, type PdfPageGridMode } from "./PdfPageGrid";
import { ToolWorkspace } from "./ToolWorkspace";
import { renderPageThumbnails, type PageThumbnail } from "@/lib/pdf/render";
import { rebuildFromPages, downloadBytes, formatFileSize, type OrderedPage } from "@/lib/pdf/operations";

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
        label="Select PDF file"
        sublabel="Choose a file to get started"
        onFiles={handleFile}
      />
    );
  }

  if (status === "loading") {
    return (
      <div className="flex flex-col items-center gap-3 py-24 text-neutral-500 dark:text-neutral-400">
        <Loader2 className="h-6 w-6 animate-spin" />
        Rendering pages…
      </div>
    );
  }

  return (
    <ToolWorkspace
      main={<PdfPageGrid pages={thumbnails} mode={mode} onChange={setResult} />}
      sidebar={
        <div className="space-y-5">
          <div>
            <div className="flex items-center gap-2 text-sm font-semibold text-neutral-900 dark:text-white">
              <FileText className="h-4 w-4 shrink-0 text-blue-600 dark:text-blue-400" />
              <span className="truncate">{file.name}</span>
            </div>
            <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
              {thumbnails.length} pages · {formatFileSize(file.size)}
            </p>
          </div>

          <p className="text-sm text-neutral-500 dark:text-neutral-400">{hint}</p>

          {error && <p className="text-sm text-red-500 dark:text-red-400">{error}</p>}

          <button
            type="button"
            onClick={handleSave}
            disabled={result.length === 0 || status === "working"}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-700 px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-700/25 transition hover:bg-blue-800 hover:shadow-xl hover:shadow-blue-700/30 disabled:opacity-40 disabled:shadow-none"
          >
            {status === "working" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            {actionLabel} ({result.length})
          </button>
        </div>
      }
    />
  );
}
