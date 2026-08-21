import type { Metadata } from "next";
import { ToolShell } from "@/components/tools/ToolShell";
import { SplitTool } from "@/components/tools/SplitTool";

export const metadata: Metadata = {
  title: "Split PDF — Free & Private | InstaCard Tools",
  description: "Separate a PDF into individual pages or custom page ranges. Runs entirely in your browser.",
  alternates: { canonical: "/tools/split-pdf" },
};

export default function SplitPdfPage() {
  return (
    <ToolShell
      title="Split PDF"
      description="Separate one page or a whole set into independent PDF files."
    >
      <SplitTool />
    </ToolShell>
  );
}
