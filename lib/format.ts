export function formatCount(n: number): string {
  if (n < 1000) return String(n);
  if (n < 1_000_000) {
    const v = n / 1000;
    return `${v % 1 === 0 ? v.toFixed(0) : v.toFixed(1)}K`;
  }
  const v = n / 1_000_000;
  return `${v % 1 === 0 ? v.toFixed(0) : v.toFixed(1)}M`;
}
