export interface ToolMeta {
  slug: string;
  name: string;
  description: string;
  icon: string;
}

export interface ToolCategory {
  name: string;
  tools: ToolMeta[];
}

export const TOOL_CATEGORIES: ToolCategory[] = [
  {
    name: "Organize PDF",
    tools: [
      { slug: "merge-pdf", name: "Merge PDF", description: "Combine PDFs in the order you want.", icon: "layers" },
      { slug: "split-pdf", name: "Split PDF", description: "Separate pages into independent PDF files.", icon: "scissors" },
      { slug: "remove-pages", name: "Remove Pages", description: "Delete unwanted pages from a PDF.", icon: "file-minus" },
      { slug: "extract-pages", name: "Extract Pages", description: "Pull specific pages into a new PDF.", icon: "file-output" },
      { slug: "organize-pdf", name: "Organize PDF", description: "Reorder and rotate pages however you like.", icon: "grid" },
      { slug: "scan-to-pdf", name: "Scan to PDF", description: "Turn camera photos into a single PDF.", icon: "camera" },
    ],
  },
  {
    name: "Optimize PDF",
    tools: [
      { slug: "compress-pdf", name: "Compress PDF", description: "Reduce file size.", icon: "shrink" },
      { slug: "repair-pdf", name: "Repair PDF", description: "Recover data from a damaged PDF.", icon: "wrench" },
      { slug: "ocr-pdf", name: "OCR PDF", description: "Make scanned PDFs searchable.", icon: "scan-text" },
    ],
  },
  {
    name: "Convert PDF",
    tools: [
      { slug: "jpg-to-pdf", name: "JPG to PDF", description: "Convert images to PDF.", icon: "image" },
      { slug: "word-to-pdf", name: "Word to PDF", description: "Convert DOC/DOCX to PDF.", icon: "file-text" },
      { slug: "pdf-to-word", name: "PDF to Word", description: "Convert PDF to an editable document.", icon: "file-text" },
      { slug: "pdf-to-jpg", name: "PDF to JPG", description: "Convert PDF pages to images.", icon: "image" },
    ],
  },
  {
    name: "Edit PDF",
    tools: [
      { slug: "watermark-pdf", name: "Add Watermark", description: "Stamp an image or text over your PDF.", icon: "droplet" },
      { slug: "page-numbers", name: "Add Page Numbers", description: "Number the pages of your PDF.", icon: "hash" },
      { slug: "crop-pdf", name: "Crop PDF", description: "Crop the margins of your PDF.", icon: "crop" },
    ],
  },
  {
    name: "PDF Security",
    tools: [
      { slug: "protect-pdf", name: "Protect PDF", description: "Add a password to your PDF.", icon: "lock" },
      { slug: "unlock-pdf", name: "Unlock PDF", description: "Remove a PDF's password.", icon: "unlock" },
      { slug: "sign-pdf", name: "Sign PDF", description: "Add your signature to a PDF.", icon: "pen-line" },
    ],
  },
];

export const LIVE_TOOL_SLUGS = new Set([
  "merge-pdf",
  "split-pdf",
  "remove-pages",
  "extract-pages",
  "organize-pdf",
  "scan-to-pdf",
]);
