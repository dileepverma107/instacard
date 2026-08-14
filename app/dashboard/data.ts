import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { BrandInquiry, Creator, Lead, LinkBlock } from "@/lib/types";
import { customAlphabet } from "nanoid";

const suffix = customAlphabet("abcdefghijklmnopqrstuvwxyz0123456789", 5);

function defaultHandle(email: string | undefined) {
  const base = (email?.split("@")[0] ?? "creator").replace(/[^a-z0-9_.]/gi, "").toLowerCase();
  return `${base.slice(0, 20) || "creator"}${suffix()}`;
}

export async function getOrCreateCreator(): Promise<{ creator: Creator; links: LinkBlock[] }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not signed in");

  const { data: existing } = await supabase
    .from("creators")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  let creator = existing as Creator | null;

  if (!creator) {
    const { data: created, error } = await supabase
      .from("creators")
      .insert({
        user_id: user.id,
        handle: defaultHandle(user.email),
        name: "",
        bio_line: "",
      })
      .select("*")
      .single();
    if (error) throw error;
    creator = created as Creator;
  }

  const { data: links } = await supabase
    .from("links")
    .select("*")
    .eq("creator_id", creator.id)
    .order("sort_order", { ascending: true });

  return { creator, links: (links as LinkBlock[]) ?? [] };
}

export async function getClickCounts(creatorId: string): Promise<Record<string, number>> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("click_events")
    .select("link_id")
    .eq("creator_id", creatorId);

  const counts: Record<string, number> = {};
  for (const row of data ?? []) {
    counts[row.link_id] = (counts[row.link_id] ?? 0) + 1;
  }
  return counts;
}

export async function getLeads(creatorId: string): Promise<Lead[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("leads")
    .select("*")
    .eq("creator_id", creatorId)
    .order("created_at", { ascending: false });

  return (data as Lead[]) ?? [];
}

export async function getBrandInquiries(creatorId: string): Promise<BrandInquiry[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("brand_inquiries")
    .select("*")
    .eq("creator_id", creatorId)
    .order("created_at", { ascending: false });

  return (data as BrandInquiry[]) ?? [];
}
