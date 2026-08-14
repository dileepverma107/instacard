"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { Download } from "lucide-react";

export function QrCodeCard({ url }: { url: string }) {
  const [dataUrl, setDataUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!url) return;
    let cancelled = false;
    QRCode.toDataURL(url, {
      width: 320,
      margin: 1,
      color: { dark: "#171717", light: "#ffffff" },
    }).then((generated) => {
      if (!cancelled) setDataUrl(generated);
    });
    return () => {
      cancelled = true;
    };
  }, [url]);

  function handleDownload() {
    if (!dataUrl) return;
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = "instacard-qr.png";
    a.click();
  }

  if (!url) return null;

  return (
    <div className="flex items-center gap-4 rounded-xl border border-neutral-200 bg-white/60 p-4 dark:border-white/10 dark:bg-white/[0.03]">
      <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-white">
        {dataUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={dataUrl} alt="QR code for your card" className="h-full w-full" />
        ) : (
          <div className="h-full w-full animate-pulse bg-neutral-100" />
        )}
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium text-neutral-900 dark:text-white">Scan to open your card</p>
        <p className="text-xs text-neutral-500 dark:text-neutral-400">
          Great for print, business cards, or event signage.
        </p>
        <button
          type="button"
          onClick={handleDownload}
          disabled={!dataUrl}
          className="mt-2 flex items-center gap-1.5 rounded-lg border border-neutral-300 bg-white/80 px-3 py-1.5 text-xs font-medium text-neutral-700 shadow-sm transition hover:bg-white disabled:opacity-40 dark:border-white/10 dark:bg-white/5 dark:text-neutral-300 dark:hover:bg-white/10"
        >
          <Download className="h-3.5 w-3.5" /> Download PNG
        </button>
      </div>
    </div>
  );
}
