export function ToolWorkspace({
  main,
  sidebar,
}: {
  main: React.ReactNode;
  sidebar: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_310px]">
      <div>{main}</div>
      <aside className="lg:sticky lg:top-24 lg:h-fit">
        <div className="rounded-3xl border border-neutral-200/80 bg-white/70 p-5 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.04]">
          {sidebar}
        </div>
      </aside>
    </div>
  );
}
