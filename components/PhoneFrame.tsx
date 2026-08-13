export function PhoneFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto w-[300px] rounded-[2.5rem] border-[6px] border-neutral-800 bg-neutral-800 shadow-2xl">
      <div className="relative h-[610px] w-full overflow-hidden rounded-[2rem] bg-neutral-950">
        <div className="absolute left-1/2 top-0 z-10 h-5 w-28 -translate-x-1/2 rounded-b-2xl bg-neutral-800" />
        <div className="h-full w-full">{children}</div>
      </div>
    </div>
  );
}
