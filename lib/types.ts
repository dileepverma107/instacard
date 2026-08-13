export type LinkType = "portfolio" | "brand" | "product" | "social" | "contact" | "custom";

export type Plan = "free" | "premium";

export type Template = "aurora" | "paper" | "neon";

export interface TemplateMeta {
  id: Template;
  name: string;
  description: string;
  swatch: string[];
}

export const TEMPLATES: TemplateMeta[] = [
  {
    id: "aurora",
    name: "Aurora",
    description: "Dark, warm gradient — the original InstaCard look.",
    swatch: ["#0a0a0a", "#f59e0b", "#ec4899", "#9333ea"],
  },
  {
    id: "paper",
    name: "Paper",
    description: "Clean, light, classic Instagram feel.",
    swatch: ["#ffffff", "#f5f5f5", "#171717", "#e5e5e5"],
  },
  {
    id: "neon",
    name: "Neon",
    description: "Loud neon gradient for a louder profile.",
    swatch: ["#000000", "#d946ef", "#a855f7", "#06b6d4"],
  },
];

export interface Creator {
  id: string;
  user_id: string;
  handle: string;
  name: string;
  avatar_url: string | null;
  follower_count: number;
  bio_line: string;
  plan: Plan;
  template: Template;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface LinkBlock {
  id: string;
  creator_id: string;
  type: LinkType;
  label: string;
  sub_label: string;
  icon: string;
  url: string;
  sort_order: number;
  is_featured: boolean;
  created_at: string;
}

export interface ClickEvent {
  id: string;
  link_id: string;
  creator_id: string;
  timestamp: string;
  referrer: string | null;
  user_agent: string | null;
}

export const MAX_LINKS = 6;

export const LINK_ICONS = [
  "link",
  "instagram",
  "youtube",
  "tiktok",
  "twitter",
  "globe",
  "shopping-bag",
  "briefcase",
  "mail",
  "message-circle",
  "camera",
  "music",
  "shirt",
  "star",
] as const;
