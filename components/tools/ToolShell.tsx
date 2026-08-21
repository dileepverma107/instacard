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
    <main className="relative px-6 py-10 sm:py-14">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-72 overflow-hidden">
        <div className="absolute left-1/4 top-0 h-64 w-64 rounded-full bg-pink-500/20 blur-[100px] dark:bg-pink-500/15" />
        <div className="absolute right-1/4 top-0 h-64 w-64 rounded-full bg-purple-500/20 blur-[100px] dark:bg-purple-500/15" />
      </div>

      <div className="mx-auto max-w-6xl">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-white sm:text-4xl">
            {title}
          </h1>
          <p className="mt-2 text-neutral-500 dark:text-neutral-400">{description}</p>
        </div>
        <div className="mt-10">{children}</div>
      </div>
    </main>
  );
}
