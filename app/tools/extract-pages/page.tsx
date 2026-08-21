import type { Metadata } from "next";
import { ToolShell } from "@/components/tools/ToolShell";
import { PageGridTool } from "@/components/tools/PageGridTool";

export const metadata: Metadata = {
  title: "Extract Pages from PDF — Free & Private | InstaCard Tools",
  description: "Pull specific pages out of a PDF into a new file. Runs entirely in your browser.",
  alternates: { canonical: "/tools/extract-pages" },
};

export default function ExtractPagesPage() {
  return (
    <ToolShell title="Extract Pages" description="Pull specific pages into a separate PDF file.">
      <PageGridTool
        mode="keep"
        hint="Click the pages you want to extract."
        outputFilename="extracted.pdf"
        actionLabel="Extract"
      />
    </ToolShell>
  );
}
