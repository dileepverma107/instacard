import { ChevronLeft, MoreHorizontal, ChevronRight } from "lucide-react";
import { LinkIconGlyph } from "./LinkIcon";
import { formatCount } from "@/lib/format";
import type { LinkBlock } from "@/lib/types";

export interface CreatorCardProps {
  name: string;
  handle: string;
  avatarUrl: string | null;
  followerCount: number;
  bioLine: string;
  links: Pick<LinkBlock, "id" | "label" | "sub_label" | "icon" | "url">[];
  showBranding: boolean;
  /** "live" renders real navigable anchors (public page). "preview" renders inert blocks (dashboard). */
  mode: "live" | "preview";
  getHref?: (linkId: string) => string;
}

export function CreatorCard({
  name,
  handle,
  avatarUrl,
  followerCount,
  bioLine,
  links,
  showBranding,
  mode,
  getHref,
}: CreatorCardProps) {
  return (
    <div className="flex h-full w-full flex-col bg-neutral-950 text-white">
      {/* IG-style profile nav bar — visual continuity with the app the visitor just left */}
      <div className="flex items-center justify-between border-b border-white/5 px-4 py-3">
        <ChevronLeft className="h-5 w-5 text-white/70" strokeWidth={2} />
        <span className="text-sm font-semibold">@{handle || "handle"}</span>
        <MoreHorizontal className="h-5 w-5 text-white/70" strokeWidth={2} />
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-6 pt-6">
        {/* avatar with story-style gradient ring */}
        <div className="flex flex-col items-center text-center">
          <div className="rounded-full bg-gradient-to-tr from-amber-400 via-pink-500 to-purple-600 p-[3px]">
            <div className="rounded-full bg-neutral-950 p-[2px]">
              {avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={avatarUrl}
                  alt={name}
                  className="h-20 w-20 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-neutral-800 text-2xl font-semibold text-white/60">
                  {(name || handle || "?").charAt(0).toUpperCase()}
                </div>
              )}
            </div>
          </div>

          <h1 className="mt-3 text-base font-semibold">{name || "Your name"}</h1>

          <div className="mt-2 flex items-center gap-4 text-sm text-white/80">
            <div className="text-center">
              <div className="font-semibold">{formatCount(followerCount)}</div>
              <div className="text-xs text-white/50">followers</div>
            </div>
            <div className="h-6 w-px bg-white/10" />
            <div className="text-center">
              <div className="font-semibold">{links.length}</div>
              <div className="text-xs text-white/50">links</div>
            </div>
          </div>

          {bioLine && (
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-white/70">{bioLine}</p>
          )}
        </div>

        {/* link blocks */}
        <div className="mt-6 space-y-2.5">
          {links.length === 0 && (
            <div className="rounded-2xl border border-dashed border-white/10 px-4 py-8 text-center text-sm text-white/40">
              No links yet
            </div>
          )}
          {links.map((link) => {
            const content = (
              <>
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/10">
                  <LinkIconGlyph name={link.icon} className="h-5 w-5 text-white" />
                </span>
                <span className="min-w-0 flex-1 text-left">
                  <span className="block truncate text-sm font-medium text-white">
                    {link.label || "Untitled link"}
                  </span>
                  {link.sub_label && (
                    <span className="block truncate text-xs text-white/50">{link.sub_label}</span>
                  )}
                </span>
                <ChevronRight className="h-4 w-4 shrink-0 text-white/30" />
              </>
            );

            const className =
              "flex w-full items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 transition active:scale-[0.98] active:bg-white/[0.08]";

            return mode === "live" ? (
              <a
                key={link.id}
                href={getHref ? getHref(link.id) : link.url}
                target="_blank"
                rel="noopener noreferrer"
                className={className}
              >
                {content}
              </a>
            ) : (
              <div key={link.id} className={className}>
                {content}
              </div>
            );
          })}
        </div>
      </div>

      {showBranding && (
        <div className="border-t border-white/5 py-3 text-center text-xs text-white/30">
          Made with{" "}
          <span className="font-semibold text-white/50">InstaCard</span>
        </div>
      )}
    </div>
  );
}
