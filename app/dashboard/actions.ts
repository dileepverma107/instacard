"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { MAX_LINKS, TEMPLATES, type LinkType, type Template } from "@/lib/types";

const HANDLE_RE = /^[a-z0-9_.]{2,30}$/;

export interface SaveLinkInput {
  id?: string;
  type: LinkType;
  label: string;
  sub_label: string;
  icon: string;
  url: string;
}

export interface SaveCardInput {
  handle: string;
  name: string;
  bio_line: string;
  follower_count: number;
  avatar_url: string;
  template: Template;
  is_published: boolean;
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
  if (!TEMPLATES.some((t) => t.id === input.template)) {
    return { ok: false, error: "Unknown template." };
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
      is_published: input.is_published,
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
      sort_order: i,
      is_featured: i === 0,
    }));
    const { error: insertError } = await supabase.from("links").insert(rows);
    if (insertError) return { ok: false, error: insertError.message };
  }

  revalidatePath("/dashboard");
  revalidatePath(`/${handle}`);
  return { ok: true };
}

export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
