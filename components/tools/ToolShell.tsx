export function ToolShell({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <main className="px-6 py-10 sm:py-14">
      <div className="mx-auto max-w-3xl">
        <div className="text-center">
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white sm:text-3xl">
            {title}
          </h1>
          <p className="mt-2 text-neutral-500 dark:text-neutral-400">{description}</p>
        </div>
        <div className="mt-8 rounded-3xl border border-neutral-200/80 bg-white/70 p-6 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.03] sm:p-8">
          {children}
        </div>
      </div>
    </main>
  );
}
