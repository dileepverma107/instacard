"use client";

import { useState } from "react";
import { ChevronRight, ChevronDown, ArrowUpRight, Star } from "lucide-react";
import { LinkIconBadge } from "./LinkIconBadge";
import { CountdownBadge } from "./CountdownBadge";
import type { LinkBlock } from "@/lib/types";
import type { TemplateTheme } from "@/lib/templateTheme";

export interface LinkItemProps {
  link: Pick<
    LinkBlock,
    "id" | "label" | "sub_label" | "icon" | "url" | "sub_links" | "is_featured" | "ends_at"
  >;
  theme: TemplateTheme;
  mode: "live" | "preview";
  /** Base path for the click-tracking redirect route (e.g. "/r"). When set,
   *  hrefs go through `${linkHrefBase}/${link.id}` instead of the raw URL. */
  linkHrefBase?: string;
  /** Full Tailwind gradient classes (e.g. "bg-gradient-to-tr from-amber-400 via-pink-500 to-purple-600"). */
  accentGradient?: string;
  animClassName?: string;
  animStyle?: React.CSSProperties;
}

const DEFAULT_ACCENT_GRADIENT = "bg-gradient-to-tr from-amber-400 via-pink-500 to-purple-600";

export function LinkItem({
  link,
  theme: t,
  mode,
  linkHrefBase,
  accentGradient = DEFAULT_ACCENT_GRADIENT,
  animClassName,
  animStyle,
}: LinkItemProps) {
  const [expanded, setExpanded] = useState(false);
  const subLinks = link.sub_links ?? [];
  const hasSubLinks = subLinks.length > 0;
  const mainHref = linkHrefBase ? `${linkHrefBase}/${link.id}` : link.url;
  const subHref = (subId: string) =>
    linkHrefBase ? `${linkHrefBase}/${link.id}?sub=${subId}` : subLinks.find((s) => s.id === subId)?.url;

  const rowClassName = `flex w-full items-center gap-3 rounded-2xl border px-4 py-3 transition ${t.linkBlock}`;

  const rowContent = (
    <>
      <LinkIconBadge
        url={link.url}
        icon={link.icon}
        fallbackWrapClass={t.iconWrap}
        fallbackIconClass={t.icon}
      />
      <span className="min-w-0 flex-1 text-left">
        <span className={`block truncate text-sm font-medium ${t.linkLabel}`}>
          {link.label || "Untitled link"}
        </span>
        {link.sub_label && (
          <span className={`block truncate text-xs ${t.linkSub}`}>{link.sub_label}</span>
        )}
        {link.ends_at && (
          <CountdownBadge targetIso={link.ends_at} className={`text-[11px] ${t.linkSub}`} />
        )}
      </span>
      {hasSubLinks ? (
        <ChevronDown
          className={`h-4 w-4 shrink-0 transition-transform duration-300 ${t.chevron} ${expanded ? "rotate-180" : ""}`}
        />
      ) : (
        <ChevronRight className={`h-4 w-4 shrink-0 ${t.chevron}`} />
      )}
    </>
  );

  const mainRow = hasSubLinks ? (
    <button type="button" onClick={() => setExpanded((v) => !v)} className={rowClassName}>
      {rowContent}
    </button>
  ) : mode === "live" ? (
    <a href={mainHref} target="_blank" rel="noopener noreferrer" className={rowClassName}>
      {rowContent}
    </a>
  ) : (
    <div className={rowClassName}>{rowContent}</div>
  );

  return (
    <div className={`relative ${animClassName ?? ""}`} style={animStyle}>
      {link.is_featured ? (
        <div className={`rounded-[1.15rem] p-[2px] ${accentGradient}`}>{mainRow}</div>
      ) : (
        mainRow
      )}

      {link.is_featured && (
        <span
          className={`absolute -top-2 right-3 z-10 flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold text-white shadow ${accentGradient}`}
        >
          <Star className="h-2.5 w-2.5 fill-current" /> Featured
        </span>
      )}

      {/* sub-links: a connected mini-list, deliberately lighter than the parent card */}
      {hasSubLinks && (
        <div
          className={`grid transition-all duration-300 ease-out ${
            expanded ? "mt-1.5 grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
          }`}
        >
          <div className="relative overflow-hidden pl-[1.625rem]">
            <div className={`absolute left-[0.9375rem] top-0 bottom-2 w-px ${t.divider}`} />
            <div className="space-y-0.5 py-1">
              {subLinks.map((sub) => {
                const subContent = (
                  <>
                    <span className={`absolute -left-[1.625rem] h-1.5 w-1.5 rounded-full ${t.divider}`} />
                    <LinkIconBadge
                      url={sub.url}
                      icon="link"
                      fallbackWrapClass={t.iconWrap}
                      fallbackIconClass={t.icon}
                      className="h-6 w-6"
                    />
                    <span className={`min-w-0 flex-1 truncate text-xs ${t.linkSub}`}>
                      {sub.label || "Untitled"}
                    </span>
                    <ArrowUpRight
                      className={`h-3 w-3 shrink-0 opacity-0 transition-opacity group-hover:opacity-60 ${t.chevron}`}
                    />
                  </>
                );
                const subClassName = `group relative flex items-center gap-2 rounded-lg px-2 py-1.5 transition hover:bg-black/[0.03] dark:hover:bg-white/[0.06]`;

                return mode === "live" ? (
                  <a
                    key={sub.id}
                    href={subHref(sub.id) ?? sub.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={subClassName}
                  >
                    {subContent}
                  </a>
                ) : (
                  <div key={sub.id} className={subClassName}>
                    {subContent}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
