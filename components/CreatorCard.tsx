import { ChevronLeft, MoreHorizontal, ChevronRight } from "lucide-react";
import { LinkIconGlyph } from "./LinkIcon";
import { formatCount } from "@/lib/format";
import type { LinkBlock, Template } from "@/lib/types";

export interface CreatorCardProps {
  name: string;
  handle: string;
  avatarUrl: string | null;
  followerCount: number;
  bioLine: string;
  links: Pick<LinkBlock, "id" | "label" | "sub_label" | "icon" | "url">[];
  showBranding: boolean;
  template?: Template;
  /** "live" renders real navigable anchors and plays the entrance animation (public page).
   *  "preview" renders inert, static blocks (dashboard live preview). */
  mode: "live" | "preview";
  getHref?: (linkId: string) => string;
}

const THEME: Record<
  Template,
  {
    page: string;
    topBar: string;
    topIcon: string;
    handleText: string;
    ring: string;
    avatarInset: string;
    avatarFallback: string;
    name: string;
    statNumber: string;
    statLabel: string;
    divider: string;
    bio: string;
    emptyState: string;
    linkBlock: string;
    iconWrap: string;
    icon: string;
    linkLabel: string;
    linkSub: string;
    chevron: string;
    footerBorder: string;
    footerText: string;
    footerBrand: string;
  }
> = {
  aurora: {
    page: "bg-neutral-950 text-white",
    topBar: "border-white/5",
    topIcon: "text-white/70",
    handleText: "text-white",
    ring: "bg-gradient-to-tr from-amber-400 via-pink-500 to-purple-600",
    avatarInset: "bg-neutral-950",
    avatarFallback: "bg-neutral-800 text-white/60",
    name: "text-white",
    statNumber: "text-white",
    statLabel: "text-white/50",
    divider: "bg-white/10",
    bio: "text-white/70",
    emptyState: "border-white/10 text-white/40",
    linkBlock:
      "border-white/10 bg-white/[0.04] active:scale-[0.98] active:bg-white/[0.08]",
    iconWrap: "bg-white/10",
    icon: "text-white",
    linkLabel: "text-white",
    linkSub: "text-white/50",
    chevron: "text-white/30",
    footerBorder: "border-white/5",
    footerText: "text-white/30",
    footerBrand: "text-white/50",
  },
  paper: {
    page: "bg-white text-neutral-900",
    topBar: "border-neutral-200",
    topIcon: "text-neutral-400",
    handleText: "text-neutral-900",
    ring: "bg-gradient-to-tr from-rose-200 via-orange-200 to-sky-200",
    avatarInset: "bg-white",
    avatarFallback: "bg-neutral-100 text-neutral-400",
    name: "text-neutral-900",
    statNumber: "text-neutral-900",
    statLabel: "text-neutral-400",
    divider: "bg-neutral-200",
    bio: "text-neutral-500",
    emptyState: "border-neutral-200 text-neutral-300",
    linkBlock:
      "border-neutral-200 bg-neutral-50 active:scale-[0.98] active:bg-neutral-100",
    iconWrap: "bg-neutral-900/5",
    icon: "text-neutral-700",
    linkLabel: "text-neutral-900",
    linkSub: "text-neutral-400",
    chevron: "text-neutral-300",
    footerBorder: "border-neutral-200",
    footerText: "text-neutral-300",
    footerBrand: "text-neutral-500",
  },
  neon: {
    page: "bg-black text-white",
    topBar: "border-fuchsia-500/20",
    topIcon: "text-fuchsia-200/70",
    handleText: "text-white",
    ring: "bg-gradient-to-tr from-fuchsia-500 via-purple-500 to-cyan-400 animate-pulse",
    avatarInset: "bg-black",
    avatarFallback: "bg-fuchsia-950 text-fuchsia-200",
    name: "bg-gradient-to-r from-fuchsia-300 via-purple-200 to-cyan-200 bg-clip-text text-transparent",
    statNumber: "text-white",
    statLabel: "text-fuchsia-200/50",
    divider: "bg-fuchsia-500/20",
    bio: "text-fuchsia-100/70",
    emptyState: "border-fuchsia-500/20 text-fuchsia-200/40",
    linkBlock:
      "border-fuchsia-500/25 bg-white/[0.03] shadow-[0_0_20px_-8px_rgba(217,70,239,0.5)] active:scale-[0.98] active:bg-white/[0.07]",
    iconWrap: "bg-fuchsia-500/10",
    icon: "text-fuchsia-200",
    linkLabel: "text-white",
    linkSub: "text-fuchsia-200/40",
    chevron: "text-fuchsia-300/40",
    footerBorder: "border-fuchsia-500/20",
    footerText: "text-fuchsia-200/30",
    footerBrand: "text-fuchsia-200/60",
  },
};

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
  getHref,
}: CreatorCardProps) {
  const t = THEME[template];
  const animated = mode === "live";

  function enter(delayMs: number) {
    return animated
      ? { className: "animate-card-in", style: { animationDelay: `${delayMs}ms` } }
      : {};
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
        <div className="flex flex-col items-center text-center" {...enter(0)}>
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
            const content = (
              <>
                <span
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${t.iconWrap}`}
                >
                  <LinkIconGlyph name={link.icon} className={`h-5 w-5 ${t.icon}`} />
                </span>
                <span className="min-w-0 flex-1 text-left">
                  <span className={`block truncate text-sm font-medium ${t.linkLabel}`}>
                    {link.label || "Untitled link"}
                  </span>
                  {link.sub_label && (
                    <span className={`block truncate text-xs ${t.linkSub}`}>{link.sub_label}</span>
                  )}
                </span>
                <ChevronRight className={`h-4 w-4 shrink-0 ${t.chevron}`} />
              </>
            );

            const className = `flex w-full items-center gap-3 rounded-2xl border px-4 py-3 transition ${t.linkBlock}`;
            const { className: animClass, style } = enter(120 + i * 60);

            return mode === "live" ? (
              <a
                key={link.id}
                href={getHref ? getHref(link.id) : link.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`${className} ${animClass ?? ""}`}
                style={style}
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
        <div className={`border-t py-3 text-center text-xs ${t.footerBorder} ${t.footerText}`}>
          Made with <span className={`font-semibold ${t.footerBrand}`}>InstaCard</span>
        </div>
      )}
    </div>
  );
}
