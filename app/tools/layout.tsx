import { ToolsHeader } from "@/components/tools/ToolsHeader";

export default function ToolsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-neutral-50 dark:bg-neutral-950">
      <ToolsHeader />
      {children}
    </div>
  );
}
