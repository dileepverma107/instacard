"use client";

import { useState } from "react";
import { ChevronRight, ChevronDown } from "lucide-react";
import { LinkIconBadge } from "./LinkIconBadge";
import type { LinkBlock } from "@/lib/types";
import type { TemplateTheme } from "@/lib/templateTheme";

export interface LinkItemProps {
  link: Pick<LinkBlock, "id" | "label" | "sub_label" | "icon" | "url" | "sub_links">;
  theme: TemplateTheme;
  mode: "live" | "preview";
  /** Base path for the click-tracking redirect route (e.g. "/r"). When set,
   *  hrefs go through `${linkHrefBase}/${link.id}` instead of the raw URL. */
  linkHrefBase?: string;
  animClassName?: string;
  animStyle?: React.CSSProperties;
}

export function LinkItem({
  link,
  theme: t,
  mode,
  linkHrefBase,
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
      </span>
      {hasSubLinks ? (
        <ChevronDown
          className={`h-4 w-4 shrink-0 transition-transform ${t.chevron} ${expanded ? "rotate-180" : ""}`}
        />
      ) : (
        <ChevronRight className={`h-4 w-4 shrink-0 ${t.chevron}`} />
      )}
    </>
  );

  return (
    <div className={animClassName} style={animStyle}>
      {hasSubLinks ? (
        <button type="button" onClick={() => setExpanded((v) => !v)} className={rowClassName}>
          {rowContent}
        </button>
      ) : mode === "live" ? (
        <a
          href={mainHref}
          target="_blank"
          rel="noopener noreferrer"
          className={rowClassName}
        >
          {rowContent}
        </a>
      ) : (
        <div className={rowClassName}>{rowContent}</div>
      )}

      {hasSubLinks && expanded && (
        <div className="mt-1.5 space-y-1.5 pl-4">
          {subLinks.map((sub) => {
            const subContent = (
              <>
                <LinkIconBadge
                  url={sub.url}
                  icon="link"
                  fallbackWrapClass={t.iconWrap}
                  fallbackIconClass={t.icon}
                  className="h-8 w-8"
                />
                <span className={`truncate text-sm ${t.linkLabel}`}>{sub.label || "Untitled"}</span>
              </>
            );
            const subClassName = `flex items-center gap-2.5 rounded-xl border px-3 py-2 transition ${t.linkBlock}`;

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
      )}
    </div>
  );
}
