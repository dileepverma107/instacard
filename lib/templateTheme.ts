import type { Template } from "./types";

export interface TemplateTheme {
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

export const THEME: Record<Template, TemplateTheme> = {
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
    linkBlock: "border-white/10 bg-white/[0.04] active:scale-[0.98] active:bg-white/[0.08]",
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
    linkBlock: "border-neutral-200 bg-neutral-50 active:scale-[0.98] active:bg-neutral-100",
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
