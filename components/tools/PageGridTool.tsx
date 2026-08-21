"use client";

import { useRef, useState } from "react";
import { Loader2, Download, FileText, Plus } from "lucide-react";
import { FileDropzone } from "./FileDropzone";
import { PdfPageGrid, type PdfPageGridMode } from "./PdfPageGrid";
import { ToolWorkspace } from "./ToolWorkspace";
import { FILE_COLORS } from "./toolIcons";
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
  const multiFile = mode === "organize";
  const addMoreRef = useRef<HTMLInputElement>(null);

  const [files, setFiles] = useState<File[]>([]);
  const [thumbnails, setThumbnails] = useState<PageThumbnail[]>([]);
  const [result, setResult] = useState<OrderedPage[]>([]);
  const [status, setStatus] = useState<"idle" | "loading" | "working" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleFiles(newFiles: File[]) {
    setStatus("loading");
    setError(null);
    try {
      if (multiFile) {
        const startIndex = files.length;
        const perFile = await Promise.all(
          newFiles.map((f, i) => renderPageThumbnails(f, startIndex + i)),
        );
        setFiles((prev) => [...prev, ...newFiles]);
        setThumbnails((prev) => [...prev, ...perFile.flat()]);
      } else {
        const f = newFiles[0];
        if (!f) return;
        const pages = await renderPageThumbnails(f, 0);
        setFiles([f]);
        setThumbnails(pages);
      }
      setStatus("idle");
    } catch {
      setError("Couldn't read this PDF — it may be corrupted.");
      setStatus("error");
    }
  }

  function resetAll() {
    setFiles([]);
    setThumbnails([]);
    setResult([]);
  }

  async function handleSave() {
    if (files.length === 0) return;
    setStatus("working");
    setError(null);
    try {
      const bytes = await rebuildFromPages(files, result);
      downloadBytes(bytes, outputFilename);
      setStatus("idle");
    } catch {
      setError("Something went wrong while saving your PDF.");
      setStatus("error");
    }
  }

  if (files.length === 0) {
    return (
      <FileDropzone
        accept="application/pdf"
        multiple={multiFile}
        label="Select PDF file"
        sublabel="Choose a file to get started"
        onFiles={handleFiles}
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
      main={
        <PdfPageGrid
          pages={thumbnails}
          mode={mode}
          fileColors={multiFile ? FILE_COLORS.map((c) => c.border) : undefined}
          onChange={setResult}
        />
      }
      sidebar={
        <div className="space-y-5">
          <div>
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-neutral-900 dark:text-white">Files</p>
              <button
                type="button"
                onClick={resetAll}
                className="text-xs font-medium text-red-500 hover:underline dark:text-red-400"
              >
                Reset all
              </button>
            </div>
            <div className="mt-2 space-y-1.5">
              {files.map((file, i) => (
                <div
                  key={`${file.name}-${i}`}
                  className={`flex items-center gap-2 rounded-xl px-2.5 py-2 text-xs font-medium text-white ${multiFile ? FILE_COLORS[i % FILE_COLORS.length].bg : "bg-blue-700"}`}
                >
                  <FileText className="h-3.5 w-3.5 shrink-0" />
                  <span className="min-w-0 flex-1 truncate">{file.name}</span>
                </div>
              ))}
            </div>
            <p className="mt-2 text-xs text-neutral-500 dark:text-neutral-400">
              {thumbnails.length} pages · {formatFileSize(files.reduce((sum, f) => sum + f.size, 0))}
            </p>
          </div>

          {multiFile && (
            <button
              type="button"
              onClick={() => addMoreRef.current?.click()}
              className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-neutral-200 py-2.5 text-xs font-medium text-neutral-500 transition hover:border-neutral-300 hover:text-neutral-700 dark:border-white/10 dark:text-neutral-400 dark:hover:border-white/20 dark:hover:text-neutral-200"
            >
              <Plus className="h-3.5 w-3.5" />
              Add more files
              <input
                ref={addMoreRef}
                type="file"
                accept="application/pdf"
                multiple
                onChange={(e) => e.target.files && handleFiles(Array.from(e.target.files))}
                className="hidden"
              />
            </button>
          )}

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
