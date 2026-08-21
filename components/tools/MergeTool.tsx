"use client";

import { useState } from "react";
import { FileText, X, GripVertical, Loader2, Download, Plus } from "lucide-react";
import { FileDropzone } from "./FileDropzone";
import { ToolWorkspace } from "./ToolWorkspace";
import { mergePdfs, downloadBytes, formatFileSize } from "@/lib/pdf/operations";

// Cycled per file so each one is visually distinguishable, like separate
// colored groups in a traditional PDF organizer.
const FILE_COLORS = ["bg-blue-700", "bg-indigo-700", "bg-sky-700", "bg-cyan-700"];

export function MergeTool() {
  const [files, setFiles] = useState<File[]>([]);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [status, setStatus] = useState<"idle" | "working" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  function addFiles(newFiles: File[]) {
    setFiles((prev) => [...prev, ...newFiles.filter((f) => f.type === "application/pdf")]);
  }

  function removeFile(i: number) {
    setFiles((prev) => prev.filter((_, idx) => idx !== i));
  }

  function reorder(from: number, to: number) {
    setFiles((prev) => {
      const next = [...prev];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
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

  if (files.length === 0) {
    return (
      <FileDropzone
        accept="application/pdf"
        multiple
        label="Select PDF files"
        sublabel="Choose two or more files to merge"
        onFiles={addFiles}
      />
    );
  }

  return (
    <ToolWorkspace
      main={
        <div className="space-y-3">
          {files.map((file, i) => (
            <div
              key={`${file.name}-${i}`}
              draggable
              onDragStart={() => setDragIndex(i)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => {
                if (dragIndex !== null && dragIndex !== i) reorder(dragIndex, i);
                setDragIndex(null);
              }}
              className="flex cursor-grab items-center gap-3 rounded-2xl border border-neutral-200 bg-white p-3.5 shadow-sm transition active:cursor-grabbing dark:border-white/10 dark:bg-white/[0.03]"
            >
              <GripVertical className="h-4 w-4 shrink-0 text-neutral-300 dark:text-neutral-600" />
              <span
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${FILE_COLORS[i % FILE_COLORS.length]}`}
              >
                <FileText className="h-4.5 w-4.5 text-white" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-neutral-900 dark:text-white">
                  {file.name}
                </p>
                <p className="text-xs text-neutral-400">
                  File {i + 1} · {formatFileSize(file.size)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => removeFile(i)}
                className="rounded-lg p-1.5 text-neutral-400 hover:bg-red-50 hover:text-red-500 dark:text-neutral-500 dark:hover:bg-red-500/10 dark:hover:text-red-400"
                aria-label="Remove file"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}

          <label className="flex cursor-pointer items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-neutral-200 py-4 text-sm font-medium text-neutral-500 transition hover:border-neutral-300 hover:text-neutral-700 dark:border-white/10 dark:text-neutral-400 dark:hover:border-white/20 dark:hover:text-neutral-200">
            <Plus className="h-4 w-4" />
            Add more files
            <input
              type="file"
              accept="application/pdf"
              multiple
              onChange={(e) => e.target.files && addFiles(Array.from(e.target.files))}
              className="hidden"
            />
          </label>
        </div>
      }
      sidebar={
        <div className="space-y-5">
          <div>
            <p className="text-sm font-semibold text-neutral-900 dark:text-white">
              {files.length} file{files.length === 1 ? "" : "s"} selected
            </p>
            <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
              Drag files to set the order they&apos;ll be merged in.
            </p>
          </div>

          {error && <p className="text-sm text-red-500 dark:text-red-400">{error}</p>}

          <button
            type="button"
            onClick={handleMerge}
            disabled={files.length < 2 || status === "working"}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-700 px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-700/25 transition hover:bg-blue-800 hover:shadow-xl hover:shadow-blue-700/30 disabled:opacity-40 disabled:shadow-none"
          >
            {status === "working" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            Merge & Download
          </button>
        </div>
      }
    />
  );
}
