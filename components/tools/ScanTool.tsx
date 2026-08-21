"use client";

import { useEffect, useRef, useState } from "react";
import { Camera, X, ArrowUp, ArrowDown, Loader2, Download } from "lucide-react";
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

  return (
    <div className="space-y-6">
      <div
        onClick={() => inputRef.current?.click()}
        className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-neutral-300 bg-neutral-50 px-6 py-16 text-center transition hover:border-neutral-400 dark:border-neutral-700 dark:bg-neutral-900/50 dark:hover:border-neutral-600"
      >
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-tr from-amber-400 via-pink-500 to-purple-600">
          <Camera className="h-6 w-6 text-white" />
        </span>
        <p className="text-base font-semibold text-neutral-900 dark:text-white">Take a photo or choose images</p>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">On mobile this opens your camera directly</p>
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

      {images.length > 0 && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {images.map((img, i) => (
            <div
              key={img.previewUrl}
              className="group relative overflow-hidden rounded-xl border-2 border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img.previewUrl} alt={`Scan ${i + 1}`} className="w-full" />
              <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-black/70 px-2 py-1 text-xs text-white">
                <span>{i + 1}</span>
                <div className="flex items-center gap-2">
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
      )}

      {error && <p className="text-sm text-red-500 dark:text-red-400">{error}</p>}

      <button
        type="button"
        onClick={handleCreate}
        disabled={images.length === 0 || status === "working"}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-tr from-amber-400 via-pink-500 to-purple-600 px-4 py-3 text-sm font-semibold text-white transition disabled:opacity-40"
      >
        {status === "working" ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Download className="h-4 w-4" />
        )}
        Create PDF {images.length > 0 ? `(${images.length} pages)` : ""}
      </button>
    </div>
  );
}
