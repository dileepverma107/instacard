"use client";

import Script from "next/script";

export function AdSense({ clientId }: { clientId: string }) {
  return (
    <Script
      async
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${clientId}`}
      crossOrigin="anonymous"
      strategy="afterInteractive"
    />
  );
}
