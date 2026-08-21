import type { Metadata } from "next";
import { ToolShell } from "@/components/tools/ToolShell";
import { MergeTool } from "@/components/tools/MergeTool";

export const metadata: Metadata = {
  title: "Merge PDF — Free & Private | InstaCard Tools",
  description: "Combine multiple PDF files into one, in the order you want. Runs entirely in your browser.",
  alternates: { canonical: "/tools/merge-pdf" },
};

export default function MergePdfPage() {
  return (
    <ToolShell
      title="Merge PDF"
      description="Combine PDFs in the order you want. Nothing leaves your browser."
    >
      <MergeTool />
    </ToolShell>
  );
}
