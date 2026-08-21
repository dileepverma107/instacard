import { PDFDocument, degrees } from "pdf-lib";

export interface OrderedPage {
  /** Index into the source document (0-based). */
  index: number;
  /** Absolute rotation to apply, in degrees (0/90/180/270). */
  rotation: number;
}

export async function mergePdfs(files: File[]): Promise<Uint8Array> {
  const merged = await PDFDocument.create();
  for (const file of files) {
    const bytes = await file.arrayBuffer();
    const src = await PDFDocument.load(bytes);
    const pages = await merged.copyPages(src, src.getPageIndices());
    pages.forEach((page) => merged.addPage(page));
  }
  return merged.save();
}

export async function splitPdf(
  file: File,
  ranges: Array<{ start: number; end: number }>,
): Promise<Uint8Array[]> {
  const bytes = await file.arrayBuffer();
  const src = await PDFDocument.load(bytes);
  const outputs: Uint8Array[] = [];

  for (const { start, end } of ranges) {
    const doc = await PDFDocument.create();
    const indices = Array.from({ length: end - start + 1 }, (_, i) => start - 1 + i);
    const pages = await doc.copyPages(src, indices);
    pages.forEach((page) => doc.addPage(page));
    outputs.push(await doc.save());
  }

  return outputs;
}

/**
 * Rebuilds a PDF from a source file using exactly the given pages, in the
 * given order, each with its own rotation. Powers Organize (reorder +
 * rotate, all pages kept), Remove Pages (all pages minus the removed ones,
 * original order), and Extract Pages (only the selected pages).
 */
export async function rebuildFromPages(
  file: File,
  pages: OrderedPage[],
): Promise<Uint8Array> {
  const bytes = await file.arrayBuffer();
  const src = await PDFDocument.load(bytes);
  const doc = await PDFDocument.create();
  const copied = await doc.copyPages(
    src,
    pages.map((p) => p.index),
  );
  copied.forEach((page, i) => {
    const rotation = pages[i].rotation % 360;
    if (rotation) page.setRotation(degrees(rotation));
    doc.addPage(page);
  });
  return doc.save();
}

export async function imagesToPdf(files: File[]): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  for (const file of files) {
    const bytes = await file.arrayBuffer();
    const image = file.type === "image/png" ? await doc.embedPng(bytes) : await doc.embedJpg(bytes);
    const page = doc.addPage([image.width, image.height]);
    page.drawImage(image, { x: 0, y: 0, width: image.width, height: image.height });
  }
  return doc.save();
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function downloadBytes(bytes: Uint8Array, filename: string, mime = "application/pdf") {
  const blob = new Blob([new Uint8Array(bytes)], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
