"use client";

import { useEffect, useState } from "react";
import { RotateCw, Trash2, Check } from "lucide-react";
import type { PageThumbnail } from "@/lib/pdf/render";
import type { OrderedPage } from "@/lib/pdf/operations";

interface GridPage extends PageThumbnail {
  rotation: number;
  /** true = excluded from the final output. */
  removed: boolean;
}

export type PdfPageGridMode = "organize" | "remove" | "keep";

export function PdfPageGrid({
  pages,
  mode,
  onChange,
}: {
  pages: PageThumbnail[];
  /** organize = reorder & rotate everything; remove = click to exclude; keep = click to include (extract). */
  mode: PdfPageGridMode;
  onChange: (result: OrderedPage[]) => void;
}) {
  const [items, setItems] = useState<GridPage[]>(() =>
    pages.map((p) => ({ ...p, rotation: 0, removed: mode === "keep" })),
  );
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  useEffect(() => {
    onChange(
      items.filter((p) => !p.removed).map((p) => ({ index: p.index, rotation: p.rotation })),
    );
    // Only the pages/mode props should reset this — onChange identity churns every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items]);

  function toggle(i: number) {
    setItems((prev) => prev.map((p, idx) => (idx === i ? { ...p, removed: !p.removed } : p)));
  }

  function rotate(i: number) {
    setItems((prev) =>
      prev.map((p, idx) => (idx === i ? { ...p, rotation: (p.rotation + 90) % 360 } : p)),
    );
  }

  function reorder(from: number, to: number) {
    setItems((prev) => {
      const next = [...prev];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return next;
    });
  }

  const selectable = mode !== "organize";

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
      {items.map((page, i) => (
        <div
          key={page.index}
          draggable={mode === "organize"}
          onDragStart={() => setDragIndex(i)}
          onDragOver={(e) => e.preventDefault()}
          onDrop={() => {
            if (dragIndex !== null && dragIndex !== i) reorder(dragIndex, i);
            setDragIndex(null);
          }}
          onClick={() => selectable && toggle(i)}
          className={`group relative overflow-hidden rounded-xl border-2 bg-neutral-900 transition ${
            selectable
              ? `cursor-pointer ${page.removed ? "border-neutral-800 opacity-30" : "border-pink-500"}`
              : "cursor-grab border-neutral-800 active:cursor-grabbing"
          }`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={page.dataUrl}
            alt={`Page ${page.index + 1}`}
            style={{ transform: `rotate(${page.rotation}deg)` }}
            className="w-full bg-white transition-transform"
          />
          {mode === "organize" && page.removed && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/70 text-xs font-medium text-white">
              Removed
            </div>
          )}
          <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-black/70 px-2 py-1 text-xs text-white">
            <span>Page {page.index + 1}</span>
            {mode === "organize" ? (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    rotate(i);
                  }}
                  className="hover:text-pink-400"
                  aria-label="Rotate page"
                >
                  <RotateCw className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggle(i);
                  }}
                  className="hover:text-red-400"
                  aria-label="Remove page"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              !page.removed && <Check className="h-3.5 w-3.5 text-pink-400" />
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
