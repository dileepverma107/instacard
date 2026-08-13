export type LinkType = "portfolio" | "brand" | "product" | "social" | "contact" | "custom";

export type Plan = "free" | "premium";

export interface Creator {
  id: string;
  user_id: string;
  handle: string;
  name: string;
  avatar_url: string | null;
  follower_count: number;
  bio_line: string;
  plan: Plan;
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
