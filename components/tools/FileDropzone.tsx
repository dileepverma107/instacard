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
      onClick={() => inputRef.current?.click()}
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
      className={`flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed px-6 py-16 text-center transition ${
        dragging
          ? "border-pink-500 bg-pink-500/5"
          : "border-neutral-300 bg-neutral-50 hover:border-neutral-400 dark:border-neutral-700 dark:bg-neutral-900/50 dark:hover:border-neutral-600"
      }`}
    >
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-tr from-amber-400 via-pink-500 to-purple-600">
        <UploadCloud className="h-6 w-6 text-white" />
      </span>
      <p className="text-base font-semibold text-neutral-900 dark:text-white">{label}</p>
      {sublabel && <p className="text-sm text-neutral-500 dark:text-neutral-400">{sublabel}</p>}
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
