import type { CreatorType, LinkType } from "./types";

export interface LinkPreset {
  label: string;
  sub_label: string;
  icon: string;
  type: LinkType;
}

export const LINK_PRESETS: Record<CreatorType, LinkPreset[]> = {
  general: [
    { label: "My Instagram", sub_label: "Follow for more", icon: "instagram", type: "social" },
    { label: "Contact me", sub_label: "Say hello", icon: "mail", type: "contact" },
    { label: "Brand collabs", sub_label: "Rate card & past work", icon: "briefcase", type: "brand" },
  ],
  fashion_beauty: [
    { label: "Shop my looks", sub_label: "Curated outfits", icon: "shopping-bag", type: "product" },
    { label: "Get my presets", sub_label: "Editing presets", icon: "camera", type: "product" },
    { label: "Brand collabs", sub_label: "Rate card & past work", icon: "briefcase", type: "brand" },
    { label: "Book a styling session", sub_label: "1:1 consultations", icon: "message-circle", type: "contact" },
  ],
  fitness_health: [
    { label: "Book a 1:1 session", sub_label: "Limited slots this week", icon: "message-circle", type: "contact" },
    { label: "My workout plans", sub_label: "Programs & guides", icon: "heart-pulse", type: "product" },
    { label: "Free nutrition guide", sub_label: "Download PDF", icon: "link", type: "portfolio" },
    { label: "Brand & sponsorships", sub_label: "Partner with me", icon: "briefcase", type: "brand" },
  ],
  music_audio: [
    { label: "Listen to my latest single", sub_label: "Streaming everywhere", icon: "music", type: "portfolio" },
    { label: "Tour dates", sub_label: "Catch me live", icon: "star", type: "portfolio" },
    { label: "Merch store", sub_label: "Shop now", icon: "shopping-bag", type: "product" },
    { label: "Booking & collabs", sub_label: "For gigs and features", icon: "briefcase", type: "brand" },
  ],
  education_coaching: [
    { label: "Enroll in my course", sub_label: "Limited seats", icon: "graduation-cap", type: "product" },
    { label: "Book a coaching call", sub_label: "1:1 sessions", icon: "message-circle", type: "contact" },
    { label: "Free resources", sub_label: "Guides & templates", icon: "link", type: "portfolio" },
    { label: "Student testimonials", sub_label: "See the results", icon: "star", type: "portfolio" },
  ],
  business_local: [
    { label: "Book an appointment", sub_label: "Check availability", icon: "message-circle", type: "contact" },
    { label: "View menu", sub_label: "See what's on offer", icon: "store", type: "portfolio" },
    { label: "Get directions", sub_label: "Find us", icon: "globe", type: "contact" },
    { label: "Order online", sub_label: "Delivery & pickup", icon: "shopping-bag", type: "product" },
  ],
  gaming_streaming: [
    { label: "Watch me live", sub_label: "Twitch / YouTube", icon: "youtube", type: "social" },
    { label: "Join my Discord", sub_label: "Community server", icon: "message-circle", type: "social" },
    { label: "Support me", sub_label: "Donations & subs", icon: "star", type: "contact" },
    { label: "My gear & setup", sub_label: "What I use", icon: "gamepad-2", type: "product" },
  ],
  food_culinary: [
    { label: "My recipes", sub_label: "Free & full recipes", icon: "utensils", type: "portfolio" },
    { label: "Book a table", sub_label: "Reservations", icon: "message-circle", type: "contact" },
    { label: "Order online", sub_label: "Delivery & pickup", icon: "shopping-bag", type: "product" },
    { label: "Catering & events", sub_label: "Enquire now", icon: "briefcase", type: "brand" },
  ],
  photography_art: [
    { label: "View my portfolio", sub_label: "Latest work", icon: "camera", type: "portfolio" },
    { label: "Prints & shop", sub_label: "Buy prints", icon: "shopping-bag", type: "product" },
    { label: "Book a shoot", sub_label: "Check availability", icon: "message-circle", type: "contact" },
    { label: "Brand collabs", sub_label: "Rate card & past work", icon: "briefcase", type: "brand" },
  ],
};
