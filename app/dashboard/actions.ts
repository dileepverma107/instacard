"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import {
  ACCENT_PRESETS,
  CREATOR_TYPES,
  MAX_GALLERY_IMAGES,
  MAX_LINKS,
  MAX_PAST_COLLABS,
  MAX_RATE_CARD_ITEMS,
  MAX_SUB_LINKS,
  TEMPLATES,
  type Accent,
  type CreatorType,
  type GalleryImage,
  type LinkType,
  type PastCollab,
  type RateCardItem,
  type SubLink,
  type Template,
} from "@/lib/types";

const HANDLE_RE = /^[a-z0-9_.]{2,30}$/;

export interface SaveLinkInput {
  id?: string;
  type: LinkType;
  label: string;
  sub_label: string;
  icon: string;
  url: string;
  sub_links: SubLink[];
  is_featured: boolean;
  starts_at: string | null;
  ends_at: string | null;
}

export interface SaveCardInput {
  handle: string;
  name: string;
  bio_line: string;
  follower_count: number;
  avatar_url: string;
  template: Template;
  accent_color: Accent;
  creator_type: CreatorType;
  is_published: boolean;
  lead_capture_enabled: boolean;
  lead_capture_heading: string;
  lead_capture_button_text: string;
  media_kit_enabled: boolean;
  media_kit_heading: string;
  rate_card: RateCardItem[];
  past_collabs: PastCollab[];
  gallery_enabled: boolean;
  gallery_heading: string;
  gallery_images: GalleryImage[];
  links: SaveLinkInput[];
}

export type SaveCardResult = { ok: true } | { ok: false; error: string };

export async function saveCard(input: SaveCardInput): Promise<SaveCardResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not signed in." };

  const handle = input.handle.trim().toLowerCase();
  if (!HANDLE_RE.test(handle)) {
    return {
      ok: false,
      error: "Handle must be 2-30 characters: lowercase letters, numbers, dot, underscore.",
    };
  }
  if (input.links.length > MAX_LINKS) {
    return { ok: false, error: `Free plan supports up to ${MAX_LINKS} links.` };
  }
  if (input.links.some((l) => l.sub_links.length > MAX_SUB_LINKS)) {
    return { ok: false, error: `Each link supports up to ${MAX_SUB_LINKS} sub-links.` };
  }
  if (!TEMPLATES.some((t) => t.id === input.template)) {
    return { ok: false, error: "Unknown template." };
  }
  if (!CREATOR_TYPES.some((t) => t.id === input.creator_type)) {
    return { ok: false, error: "Unknown creator type." };
  }
  if (!ACCENT_PRESETS.some((a) => a.id === input.accent_color)) {
    return { ok: false, error: "Unknown accent color." };
  }
  if (input.rate_card.length > MAX_RATE_CARD_ITEMS) {
    return { ok: false, error: `Rate card supports up to ${MAX_RATE_CARD_ITEMS} items.` };
  }
  if (input.past_collabs.length > MAX_PAST_COLLABS) {
    return { ok: false, error: `You can list up to ${MAX_PAST_COLLABS} past collabs.` };
  }
  if (input.gallery_images.length > MAX_GALLERY_IMAGES) {
    return { ok: false, error: `Gallery supports up to ${MAX_GALLERY_IMAGES} images.` };
  }

  const { data: creator, error: creatorError } = await supabase
    .from("creators")
    .update({
      handle,
      name: input.name.trim(),
      bio_line: input.bio_line.trim(),
      follower_count: Math.max(0, Math.floor(input.follower_count) || 0),
      avatar_url: input.avatar_url.trim() || null,
      template: input.template,
      accent_color: input.accent_color,
      creator_type: input.creator_type,
      is_published: input.is_published,
      lead_capture_enabled: input.lead_capture_enabled,
      lead_capture_heading: input.lead_capture_heading.trim() || "Get updates from me",
      lead_capture_button_text: input.lead_capture_button_text.trim() || "Subscribe",
      media_kit_enabled: input.media_kit_enabled,
      media_kit_heading: input.media_kit_heading.trim() || "Work with me",
      rate_card: input.rate_card
        .filter((r) => r.label.trim() || r.price.trim())
        .map((r) => ({ id: r.id, label: r.label.trim(), price: r.price.trim() })),
      past_collabs: input.past_collabs
        .filter((c) => c.name.trim())
        .map((c) => ({ id: c.id, name: c.name.trim(), logo_url: c.logo_url.trim() })),
      gallery_enabled: input.gallery_enabled,
      gallery_heading: input.gallery_heading.trim() || "My work",
      gallery_images: input.gallery_images.filter((g) => g.url.trim()),
    })
    .eq("user_id", user.id)
    .select("id")
    .single();

  if (creatorError) {
    if (creatorError.code === "23505") {
      return { ok: false, error: "That handle is already taken." };
    }
    return { ok: false, error: creatorError.message };
  }

  const creatorId = creator.id as string;

  const { error: deleteError } = await supabase.from("links").delete().eq("creator_id", creatorId);
  if (deleteError) return { ok: false, error: deleteError.message };

  if (input.links.length > 0) {
    const rows = input.links.map((link, i) => ({
      creator_id: creatorId,
      type: link.type,
      label: link.label.trim(),
      sub_label: link.sub_label.trim(),
      icon: link.icon,
      url: link.url.trim(),
      sub_links: link.sub_links
        .filter((s) => s.label.trim() || s.url.trim())
        .map((s) => ({ id: s.id, label: s.label.trim(), url: s.url.trim() })),
      sort_order: i,
      is_featured: link.is_featured,
      starts_at: link.starts_at,
      ends_at: link.ends_at,
    }));
    const { error: insertError } = await supabase.from("links").insert(rows);
    if (insertError) return { ok: false, error: insertError.message };
  }

  revalidatePath("/dashboard");
  revalidatePath(`/${handle}`);
  return { ok: true };
}

export async function deleteLead(leadId: string): Promise<SaveCardResult> {
  const supabase = await createClient();
  const { error } = await supabase.from("leads").delete().eq("id", leadId);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/dashboard");
  return { ok: true };
}

export async function deleteBrandInquiry(inquiryId: string): Promise<SaveCardResult> {
  const supabase = await createClient();
  const { error } = await supabase.from("brand_inquiries").delete().eq("id", inquiryId);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/dashboard");
  return { ok: true };
}

export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
