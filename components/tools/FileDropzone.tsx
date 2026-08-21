"use client";

import { useRef, useState } from "react";
import { UploadCloud } from "lucide-react";

export interface FileDropzoneProps {
  accept: string;
  multiple?: boolean;
  label: string;
  sublabel?: string;
  onFiles: (files: File[]) => void;
}

export function FileDropzone({ accept, multiple, label, sublabel, onFiles }: FileDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  function handleFiles(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;
    onFiles(Array.from(fileList));
  }

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        handleFiles(e.dataTransfer.files);
      }}
      className={`mx-auto flex max-w-xl flex-col items-center justify-center gap-5 rounded-3xl border-2 border-dashed px-6 py-20 text-center transition ${
        dragging
          ? "border-pink-500 bg-pink-500/5"
          : "border-neutral-200 bg-white/60 dark:border-white/10 dark:bg-white/[0.02]"
      }`}
    >
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="flex items-center gap-2 rounded-2xl bg-gradient-to-tr from-amber-400 via-pink-500 to-purple-600 px-8 py-4 text-base font-semibold text-white shadow-lg shadow-pink-500/20 transition hover:shadow-xl hover:shadow-pink-500/30 active:scale-[0.98]"
      >
        <UploadCloud className="h-5 w-5" />
        {label}
      </button>
      {sublabel && <p className="text-sm text-neutral-500 dark:text-neutral-400">{sublabel}</p>}
      <p className="text-xs text-neutral-400 dark:text-neutral-600">or drop files here</p>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={(e) => handleFiles(e.target.files)}
        className="hidden"
      />
    </div>
  );
}
