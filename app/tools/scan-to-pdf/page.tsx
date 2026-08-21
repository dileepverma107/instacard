import type { Metadata } from "next";
import { ToolShell } from "@/components/tools/ToolShell";
import { ScanTool } from "@/components/tools/ScanTool";

export const metadata: Metadata = {
  title: "Scan to PDF — Free & Private | InstaCard Tools",
  description: "Turn camera photos into a single PDF document. Runs entirely in your browser.",
  alternates: { canonical: "/tools/scan-to-pdf" },
};

export default function ScanToPdfPage() {
  return (
    <ToolShell title="Scan to PDF" description="Capture document photos and combine them into one PDF.">
      <ScanTool />
    </ToolShell>
  );
}
