import type { Metadata } from "next";
import { ToolShell } from "@/components/tools/ToolShell";
import { PageGridTool } from "@/components/tools/PageGridTool";

export const metadata: Metadata = {
  title: "Remove Pages from PDF — Free & Private | InstaCard Tools",
  description: "Delete unwanted pages from a PDF. Runs entirely in your browser.",
  alternates: { canonical: "/tools/remove-pages" },
};

export default function RemovePagesPage() {
  return (
    <ToolShell title="Remove Pages" description="Delete unwanted pages from your PDF.">
      <PageGridTool
        mode="remove"
        hint="Click a page to mark it for removal — click again to keep it."
        outputFilename="pages-removed.pdf"
        actionLabel="Save PDF"
      />
    </ToolShell>
  );
}
