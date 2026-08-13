import { ChevronLeft, MoreHorizontal } from "lucide-react";
import { LinkItem } from "./LinkItem";
import { formatCount } from "@/lib/format";
import { THEME } from "@/lib/templateTheme";
import type { LinkBlock, Template } from "@/lib/types";

export interface CreatorCardProps {
  name: string;
  handle: string;
  avatarUrl: string | null;
  followerCount: number;
  bioLine: string;
  links: Pick<LinkBlock, "id" | "label" | "sub_label" | "icon" | "url" | "sub_links">[];
  showBranding: boolean;
  template?: Template;
  /** "live" renders real navigable anchors and plays the entrance animation (public page).
   *  "preview" renders inert, static blocks (dashboard live preview). */
  mode: "live" | "preview";
  linkHrefBase?: string;
}

export function CreatorCard({
  name,
  handle,
  avatarUrl,
  followerCount,
  bioLine,
  links,
  showBranding,
  template = "aurora",
  mode,
  linkHrefBase,
}: CreatorCardProps) {
  const t = THEME[template];
  const animated = mode === "live";

  function enter(delayMs: number): { className: string; style?: React.CSSProperties } {
    return animated
      ? { className: "animate-card-in", style: { animationDelay: `${delayMs}ms` } }
      : { className: "" };
  }

  return (
    <div className={`flex h-full w-full flex-col ${t.page}`}>
      {/* IG-style profile nav bar — visual continuity with the app the visitor just left */}
      <div className={`flex items-center justify-between border-b px-4 py-3 ${t.topBar}`}>
        <ChevronLeft className={`h-5 w-5 ${t.topIcon}`} strokeWidth={2} />
        <span className={`text-sm font-semibold ${t.handleText}`}>@{handle || "handle"}</span>
        <MoreHorizontal className={`h-5 w-5 ${t.topIcon}`} strokeWidth={2} />
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-6 pt-6">
        {/* avatar with story-style gradient ring */}
        <div
          className={`flex flex-col items-center text-center ${enter(0).className}`}
          style={enter(0).style}
        >
          <div className={`rounded-full p-[3px] ${t.ring}`}>
            <div className={`rounded-full p-[2px] ${t.avatarInset}`}>
              {avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={avatarUrl}
                  alt={name}
                  className="h-20 w-20 rounded-full object-cover"
                />
              ) : (
                <div
                  className={`flex h-20 w-20 items-center justify-center rounded-full text-2xl font-semibold ${t.avatarFallback}`}
                >
                  {(name || handle || "?").charAt(0).toUpperCase()}
                </div>
              )}
            </div>
          </div>

          <h1 className={`mt-3 text-base font-semibold ${t.name}`}>{name || "Your name"}</h1>

          <div className="mt-2 flex items-center gap-4 text-sm">
            <div className="text-center">
              <div className={`font-semibold ${t.statNumber}`}>{formatCount(followerCount)}</div>
              <div className={`text-xs ${t.statLabel}`}>followers</div>
            </div>
            <div className={`h-6 w-px ${t.divider}`} />
            <div className="text-center">
              <div className={`font-semibold ${t.statNumber}`}>{links.length}</div>
              <div className={`text-xs ${t.statLabel}`}>links</div>
            </div>
          </div>

          {bioLine && (
            <p className={`mt-3 max-w-xs text-sm leading-relaxed ${t.bio}`}>{bioLine}</p>
          )}
        </div>

        {/* link blocks */}
        <div className="mt-6 space-y-2.5">
          {links.length === 0 && (
            <div
              className={`rounded-2xl border border-dashed px-4 py-8 text-center text-sm ${t.emptyState}`}
            >
              No links yet
            </div>
          )}
          {links.map((link, i) => {
            const { className: animClassName, style: animStyle } = enter(120 + i * 60);
            return (
              <LinkItem
                key={link.id}
                link={link}
                theme={t}
                mode={mode}
                linkHrefBase={linkHrefBase}
                animClassName={animClassName}
                animStyle={animStyle}
              />
            );
          })}
        </div>
      </div>

      {showBranding && (
        <div className={`border-t py-3 text-center text-xs ${t.footerBorder} ${t.footerText}`}>
          Made with <span className={`font-semibold ${t.footerBrand}`}>InstaCard</span>
        </div>
      )}
    </div>
  );
}
