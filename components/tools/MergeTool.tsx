"use client";

import { useState } from "react";
import { FileText, X, ArrowUp, ArrowDown, Loader2, Download } from "lucide-react";
import { FileDropzone } from "./FileDropzone";
import { mergePdfs, downloadBytes } from "@/lib/pdf/operations";

export function MergeTool() {
  const [files, setFiles] = useState<File[]>([]);
  const [status, setStatus] = useState<"idle" | "working" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  function addFiles(newFiles: File[]) {
    setFiles((prev) => [...prev, ...newFiles.filter((f) => f.type === "application/pdf")]);
  }

  function removeFile(i: number) {
    setFiles((prev) => prev.filter((_, idx) => idx !== i));
  }

  function move(i: number, dir: -1 | 1) {
    setFiles((prev) => {
      const next = [...prev];
      const j = i + dir;
      if (j < 0 || j >= next.length) return prev;
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });
  }

  async function handleMerge() {
    setStatus("working");
    setError(null);
    try {
      const bytes = await mergePdfs(files);
      downloadBytes(bytes, "merged.pdf");
      setStatus("idle");
    } catch {
      setError("Couldn't merge these files — make sure they're all valid PDFs.");
      setStatus("error");
    }
  }

  return (
    <div className="space-y-6">
      <FileDropzone
        accept="application/pdf"
        multiple
        label="Choose PDF files or drag them here"
        sublabel="Add two or more files to merge"
        onFiles={addFiles}
      />

      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((file, i) => (
            <div
              key={`${file.name}-${i}`}
              className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-white px-4 py-3 dark:border-neutral-800 dark:bg-neutral-900/50"
            >
              <FileText className="h-4 w-4 shrink-0 text-pink-500 dark:text-pink-400" />
              <span className="flex-1 truncate text-sm text-neutral-900 dark:text-white">{file.name}</span>
              <button
                type="button"
                onClick={() => move(i, -1)}
                disabled={i === 0}
                className="text-neutral-400 hover:text-neutral-900 disabled:opacity-20 dark:text-neutral-500 dark:hover:text-white"
                aria-label="Move up"
              >
                <ArrowUp className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => move(i, 1)}
                disabled={i === files.length - 1}
                className="text-neutral-400 hover:text-neutral-900 disabled:opacity-20 dark:text-neutral-500 dark:hover:text-white"
                aria-label="Move down"
              >
                <ArrowDown className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => removeFile(i)}
                className="text-neutral-400 hover:text-red-500 dark:text-neutral-500 dark:hover:text-red-400"
                aria-label="Remove file"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {error && <p className="text-sm text-red-500 dark:text-red-400">{error}</p>}

      <button
        type="button"
        onClick={handleMerge}
        disabled={files.length < 2 || status === "working"}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-tr from-amber-400 via-pink-500 to-purple-600 px-4 py-3 text-sm font-semibold text-white transition disabled:opacity-40"
      >
        {status === "working" ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Download className="h-4 w-4" />
        )}
        Merge {files.length > 0 ? `${files.length} files` : "PDFs"} & Download
      </button>
    </div>
  );
}
