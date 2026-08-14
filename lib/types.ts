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

export type CreatorType =
  | "general"
  | "fashion_beauty"
  | "fitness_health"
  | "music_audio"
  | "education_coaching"
  | "business_local"
  | "gaming_streaming"
  | "food_culinary"
  | "photography_art";

export interface CreatorTypeMeta {
  id: CreatorType;
  name: string;
  icon: string;
}

export const CREATOR_TYPES: CreatorTypeMeta[] = [
  { id: "general", name: "General creator", icon: "star" },
  { id: "fashion_beauty", name: "Fashion & Beauty", icon: "shirt" },
  { id: "fitness_health", name: "Fitness & Health", icon: "heart-pulse" },
  { id: "music_audio", name: "Music & Audio", icon: "music" },
  { id: "education_coaching", name: "Education & Coaching", icon: "graduation-cap" },
  { id: "business_local", name: "Business & Local Shop", icon: "store" },
  { id: "gaming_streaming", name: "Gaming & Streaming", icon: "gamepad-2" },
  { id: "food_culinary", name: "Food & Culinary", icon: "utensils" },
  { id: "photography_art", name: "Photography & Art", icon: "camera" },
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
  creator_type: CreatorType;
  is_published: boolean;
  lead_capture_enabled: boolean;
  lead_capture_heading: string;
  lead_capture_button_text: string;
  created_at: string;
  updated_at: string;
}

export interface Lead {
  id: string;
  creator_id: string;
  name: string | null;
  contact: string;
  created_at: string;
}

export interface SubLink {
  id: string;
  label: string;
  url: string;
}

export interface LinkBlock {
  id: string;
  creator_id: string;
  type: LinkType;
  label: string;
  sub_label: string;
  icon: string;
  url: string;
  sub_links: SubLink[];
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
export const MAX_SUB_LINKS = 4;

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
  "heart-pulse",
  "graduation-cap",
  "store",
  "gamepad-2",
  "utensils",
] as const;
