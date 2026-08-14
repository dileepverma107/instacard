import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { CreatorCard } from "@/components/CreatorCard";
import type { Creator, LinkBlock } from "@/lib/types";

async function getPublishedCreator(rawHandle: string) {
  const handle = rawHandle.replace(/^@/, "").toLowerCase();
  const supabase = await createClient();

  const { data: creator } = await supabase
    .from("creators")
    .select("*")
    .eq("handle", handle)
    .eq("is_published", true)
    .maybeSingle();

  if (!creator) return null;

  const { data: links } = await supabase
    .from("links")
    .select("*")
    .eq("creator_id", (creator as Creator).id)
    .order("sort_order", { ascending: true });

  return { creator: creator as Creator, links: (links as LinkBlock[]) ?? [] };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ handle: string }>;
}): Promise<Metadata> {
  const { handle } = await params;
  const result = await getPublishedCreator(handle);
  if (!result) return { title: "InstaCard" };

  const { creator } = result;
  return {
    title: `${creator.name || `@${creator.handle}`} · InstaCard`,
    description: creator.bio_line || `Check out ${creator.name || creator.handle} on InstaCard.`,
  };
}

export default async function PublicCardPage({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  const { handle } = await params;
  const result = await getPublishedCreator(handle);
  if (!result) notFound();

  const { creator, links: allLinks } = result;

  // This is a per-request Server Component render (not a client re-render),
  // so reading the current time here to filter scheduled links is correct.
  // eslint-disable-next-line react-hooks/purity
  const now = Date.now();
  const links = allLinks.filter((l) => {
    if (l.starts_at && new Date(l.starts_at).getTime() > now) return false;
    if (l.ends_at && new Date(l.ends_at).getTime() < now) return false;
    return true;
  });

  return (
    <div className="h-dvh bg-neutral-950">
      <div className="mx-auto h-dvh w-full max-w-md">
        <CreatorCard
          name={creator.name}
          handle={creator.handle}
          avatarUrl={creator.avatar_url}
          followerCount={creator.follower_count}
          bioLine={creator.bio_line}
          plan={creator.plan}
          links={links}
          showBranding={creator.plan === "free"}
          template={creator.template}
          accentColor={creator.accent_color}
          mode="live"
          linkHrefBase="/r"
          creatorId={creator.id}
          leadCapture={{
            enabled: creator.lead_capture_enabled,
            heading: creator.lead_capture_heading,
            buttonText: creator.lead_capture_button_text,
          }}
          mediaKit={{
            enabled: creator.media_kit_enabled,
            heading: creator.media_kit_heading,
            rateCard: creator.rate_card,
            pastCollabs: creator.past_collabs,
          }}
          gallery={{
            enabled: creator.gallery_enabled,
            heading: creator.gallery_heading,
            images: creator.gallery_images,
          }}
        />
      </div>
    </div>
  );
}
