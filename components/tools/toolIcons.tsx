import {
  Layers, Scissors, FileMinus, FileOutput, Grid3x3, Camera,
  Shrink, Wrench, ScanText, FileImage, FileType, Presentation,
  FileSpreadsheet, Globe, Droplet, Hash, Crop, Lock, Unlock, PenLine,
} from "lucide-react";

export const TOOL_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  layers: Layers,
  scissors: Scissors,
  "file-minus": FileMinus,
  "file-output": FileOutput,
  grid: Grid3x3,
  camera: Camera,
  shrink: Shrink,
  wrench: Wrench,
  "scan-text": ScanText,
  jpg: FileImage,
  word: FileType,
  powerpoint: Presentation,
  excel: FileSpreadsheet,
  html: Globe,
  droplet: Droplet,
  hash: Hash,
  crop: Crop,
  lock: Lock,
  unlock: Unlock,
  "pen-line": PenLine,
};

// One shade per category, used as the default badge color.
export const CATEGORY_COLORS: Record<string, string> = {
  "Organize PDF": "bg-blue-600",
  "Optimize PDF": "bg-sky-600",
  "Convert PDF": "bg-indigo-600",
  "Edit PDF": "bg-cyan-600",
  "PDF Security": "bg-slate-600",
};

// Per-file-format overrides so Convert PDF's icons stay visually distinct
// from one another instead of every tool sharing the category color.
export const ICON_COLORS: Record<string, string> = {
  jpg: "bg-sky-500",
  word: "bg-blue-600",
  powerpoint: "bg-orange-500",
  excel: "bg-emerald-600",
  html: "bg-cyan-600",
};

// Cycled per source file (Merge, and multi-file Organize) so each file's
// pages stay visually distinguishable, like separate colored groups.
export const FILE_COLORS = [
  { bg: "bg-blue-700", border: "border-blue-400" },
  { bg: "bg-indigo-700", border: "border-indigo-400" },
  { bg: "bg-sky-700", border: "border-sky-400" },
  { bg: "bg-cyan-700", border: "border-cyan-400" },
];
