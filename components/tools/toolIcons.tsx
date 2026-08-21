import {
  Layers, Scissors, FileMinus, FileOutput, Grid3x3, Camera,
  Shrink, Wrench, ScanText, Image as ImageIcon, FileText,
  Droplet, Hash, Crop, Lock, Unlock, PenLine,
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
  image: ImageIcon,
  "file-text": FileText,
  droplet: Droplet,
  hash: Hash,
  crop: Crop,
  lock: Lock,
  unlock: Unlock,
  "pen-line": PenLine,
};

// One shade per category so the mega-menu stays scannable while staying
// inside the blue family (no Instagram gradient).
export const CATEGORY_COLORS: Record<string, string> = {
  "Organize PDF": "bg-blue-600",
  "Optimize PDF": "bg-sky-600",
  "Convert PDF": "bg-indigo-600",
  "Edit PDF": "bg-cyan-600",
  "PDF Security": "bg-slate-600",
};
