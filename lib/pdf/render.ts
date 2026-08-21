"use client";

export interface PageThumbnail {
  /** Which source file this page came from (0-based) — lets multi-file tools tell pages apart. */
  fileIndex: number;
  /** Page index within that source file (0-based). */
  pageIndex: number;
  dataUrl: string;
}

async function loadPdfjs() {
  const pdfjsLib = await import("pdfjs-dist");
  pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    "pdfjs-dist/build/pdf.worker.min.mjs",
    import.meta.url,
  ).toString();
  return pdfjsLib;
}

export async function renderPageThumbnails(
  file: File,
  fileIndex = 0,
  scale = 0.35,
): Promise<PageThumbnail[]> {
  const pdfjsLib = await loadPdfjs();
  const buffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;
  const thumbnails: PageThumbnail[] = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const viewport = page.getViewport({ scale });
    const canvas = document.createElement("canvas");
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) continue;
    await page.render({ canvasContext: ctx, viewport, canvas }).promise;
    thumbnails.push({ fileIndex, pageIndex: i - 1, dataUrl: canvas.toDataURL("image/png") });
  }

  return thumbnails;
}

export async function getPageCount(file: File): Promise<number> {
  const pdfjsLib = await loadPdfjs();
  const buffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;
  return pdf.numPages;
}
