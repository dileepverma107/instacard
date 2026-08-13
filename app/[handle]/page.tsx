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

  const { creator, links } = result;

  return (
    <div className="h-dvh bg-neutral-950">
      <div className="mx-auto h-dvh w-full max-w-md">
        <CreatorCard
          name={creator.name}
          handle={creator.handle}
          avatarUrl={creator.avatar_url}
          followerCount={creator.follower_count}
          bioLine={creator.bio_line}
          links={links}
          showBranding={creator.plan === "free"}
          template={creator.template}
          mode="live"
          linkHrefBase="/r"
        />
      </div>
    </div>
  );
}
