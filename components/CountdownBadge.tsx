"use client";

import { useEffect, useState } from "react";
import { Timer } from "lucide-react";

function formatRemaining(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  if (days > 0) return `${days}d ${hours}h left`;
  if (hours > 0) return `${hours}h ${minutes}m left`;
  if (minutes > 0) return `${minutes}m ${seconds}s left`;
  return `${seconds}s left`;
}

export function CountdownBadge({ targetIso, className }: { targetIso: string; className?: string }) {
  const [remaining, setRemaining] = useState<number | null>(null);

  useEffect(() => {
    function tick() {
      setRemaining(new Date(targetIso).getTime() - Date.now());
    }
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [targetIso]);

  if (remaining === null || remaining <= 0) return null;

  return (
    <span className={`inline-flex items-center gap-1 ${className ?? ""}`}>
      <Timer className="h-3 w-3" />
      {formatRemaining(remaining)}
    </span>
  );
}
