import type { Metadata } from "next";
import { ToolShell } from "@/components/tools/ToolShell";
import { PageGridTool } from "@/components/tools/PageGridTool";

export const metadata: Metadata = {
  title: "Organize PDF — Free & Private | InstaCard Tools",
  description: "Reorder, rotate, and remove PDF pages by dragging thumbnails. Runs entirely in your browser.",
  alternates: { canonical: "/tools/organize-pdf" },
};

export default function OrganizePdfPage() {
  return (
    <ToolShell title="Organize PDF" description="Sort pages of your PDF file however you like.">
      <PageGridTool
        mode="organize"
        hint="Drag pages to reorder them. Use the icons on each page to rotate or remove it."
        outputFilename="organized.pdf"
        actionLabel="Save PDF"
      />
    </ToolShell>
  );
}
