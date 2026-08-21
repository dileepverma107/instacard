"use client";

import { useEffect, useRef, useState } from "react";
import { Camera, X, ArrowUp, ArrowDown, Loader2, Download, Plus } from "lucide-react";
import { ToolWorkspace } from "./ToolWorkspace";
import { imagesToPdf, downloadBytes } from "@/lib/pdf/operations";

interface CapturedImage {
  file: File;
  previewUrl: string;
}

export function ScanTool() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [images, setImages] = useState<CapturedImage[]>([]);
  const [status, setStatus] = useState<"idle" | "working" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    return () => images.forEach((img) => URL.revokeObjectURL(img.previewUrl));
    // Only clean up on unmount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function addImages(fileList: FileList | null) {
    if (!fileList) return;
    const newImages = Array.from(fileList)
      .filter((f) => f.type === "image/jpeg" || f.type === "image/png")
      .map((file) => ({ file, previewUrl: URL.createObjectURL(file) }));
    setImages((prev) => [...prev, ...newImages]);
  }

  function removeImage(i: number) {
    setImages((prev) => {
      URL.revokeObjectURL(prev[i].previewUrl);
      return prev.filter((_, idx) => idx !== i);
    });
  }

  function move(i: number, dir: -1 | 1) {
    setImages((prev) => {
      const next = [...prev];
      const j = i + dir;
      if (j < 0 || j >= next.length) return prev;
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });
  }

  async function handleCreate() {
    setStatus("working");
    setError(null);
    try {
      const bytes = await imagesToPdf(images.map((img) => img.file));
      downloadBytes(bytes, "scanned.pdf");
      setStatus("idle");
    } catch {
      setError("Couldn't create a PDF from these images.");
      setStatus("error");
    }
  }

  const capture = (
    <div
      onClick={() => inputRef.current?.click()}
      className="mx-auto flex max-w-xl cursor-pointer flex-col items-center justify-center gap-5 rounded-3xl border-2 border-dashed border-neutral-200 bg-white/60 px-6 py-20 text-center transition hover:border-neutral-300 dark:border-white/10 dark:bg-white/[0.02] dark:hover:border-white/20"
    >
      <span className="flex items-center gap-2 rounded-2xl bg-gradient-to-tr from-amber-400 via-pink-500 to-purple-600 px-8 py-4 text-base font-semibold text-white shadow-lg shadow-pink-500/20">
        <Camera className="h-5 w-5" />
        Take a photo or choose images
      </span>
      <p className="text-sm text-neutral-500 dark:text-neutral-400">
        On mobile this opens your camera directly
      </p>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        multiple
        onChange={(e) => addImages(e.target.files)}
        className="hidden"
      />
    </div>
  );

  if (images.length === 0) return capture;

  return (
    <ToolWorkspace
      main={
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-5 sm:grid-cols-3">
            {images.map((img, i) => (
              <div
                key={img.previewUrl}
                className="group relative overflow-hidden rounded-2xl border-2 border-neutral-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg dark:border-white/10 dark:bg-neutral-900"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img.previewUrl} alt={`Scan ${i + 1}`} className="w-full" />
                <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-black/60 px-2.5 py-1.5 text-xs text-white backdrop-blur-sm">
                  <span className="font-medium">{i + 1}</span>
                  <div className="flex items-center gap-2.5">
                    <button
                      type="button"
                      onClick={() => move(i, -1)}
                      disabled={i === 0}
                      className="hover:text-pink-400 disabled:opacity-30"
                      aria-label="Move earlier"
                    >
                      <ArrowUp className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => move(i, 1)}
                      disabled={i === images.length - 1}
                      className="hover:text-pink-400 disabled:opacity-30"
                      aria-label="Move later"
                    >
                      <ArrowDown className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeImage(i)}
                      className="hover:text-red-400"
                      aria-label="Remove"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <label className="flex cursor-pointer items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-neutral-200 py-4 text-sm font-medium text-neutral-500 transition hover:border-neutral-300 hover:text-neutral-700 dark:border-white/10 dark:text-neutral-400 dark:hover:border-white/20 dark:hover:text-neutral-200">
            <Plus className="h-4 w-4" />
            Add more photos
            <input
              type="file"
              accept="image/*"
              capture="environment"
              multiple
              onChange={(e) => addImages(e.target.files)}
              className="hidden"
            />
          </label>
        </div>
      }
      sidebar={
        <div className="space-y-5">
          <div>
            <p className="text-sm font-semibold text-neutral-900 dark:text-white">
              {images.length} page{images.length === 1 ? "" : "s"} captured
            </p>
            <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
              Use the arrows to reorder pages before creating the PDF.
            </p>
          </div>

          {error && <p className="text-sm text-red-500 dark:text-red-400">{error}</p>}

          <button
            type="button"
            onClick={handleCreate}
            disabled={status === "working"}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-tr from-amber-400 via-pink-500 to-purple-600 px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-pink-500/20 transition hover:shadow-xl hover:shadow-pink-500/30 disabled:opacity-40 disabled:shadow-none"
          >
            {status === "working" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            Create PDF
          </button>
        </div>
      }
    />
  );
}
