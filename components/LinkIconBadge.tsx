"use client";

import { useState } from "react";
import { LinkIconGlyph } from "./LinkIcon";

const FAVICON_SIZE = 64;
// Google's favicon service returns HTTP 200 with a generic globe placeholder
// (fixed ~16px, ignoring `sz`) when it has no real favicon for a domain —
// it never errors, so a real favicon is distinguished by actually being
// rendered at (close to) the requested size.
const MIN_REAL_FAVICON_SIZE = FAVICON_SIZE * 0.75;

function faviconSrc(rawUrl: string): string | null {
  if (!rawUrl) return null;
  try {
    const withProtocol = /^[a-z][a-z0-9+.-]*:/i.test(rawUrl) ? rawUrl : `https://${rawUrl}`;
    const parsed = new URL(withProtocol);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return null;
    return `https://www.google.com/s2/favicons?sz=${FAVICON_SIZE}&domain=${parsed.hostname}`;
  } catch {
    return null;
  }
}

export function LinkIconBadge({
  url,
  icon,
  fallbackWrapClass,
  fallbackIconClass,
  className = "h-10 w-10",
}: {
  url: string;
  icon: string;
  fallbackWrapClass: string;
  fallbackIconClass: string;
  className?: string;
}) {
  const src = faviconSrc(url);
  const [failed, setFailed] = useState(false);

  if (src && !failed) {
    return (
      <span
        className={`flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-white p-2 shadow-sm ring-1 ring-black/5 ${className}`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt=""
          className="h-full w-full object-contain"
          onError={() => setFailed(true)}
          onLoad={(e) => {
            if (e.currentTarget.naturalWidth < MIN_REAL_FAVICON_SIZE) setFailed(true);
          }}
        />
      </span>
    );
  }

  return (
    <span
      className={`flex shrink-0 items-center justify-center rounded-full ${fallbackWrapClass} ${className}`}
    >
      <LinkIconGlyph name={icon} className={`h-1/2 w-1/2 ${fallbackIconClass}`} />
    </span>
  );
}
