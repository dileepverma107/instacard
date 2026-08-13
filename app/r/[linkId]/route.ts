import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { SubLink } from "@/lib/types";

function normalizeUrl(url: string) {
  if (/^(https?:|mailto:|tel:|whatsapp:)/i.test(url)) return url;
  return `https://${url}`;
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ linkId: string }> },
) {
  const { linkId } = await params;
  const { searchParams } = new URL(request.url);
  const subId = searchParams.get("sub");
  const supabase = await createClient();

  const { data: link } = await supabase
    .from("links")
    .select("id, url, creator_id, sub_links")
    .eq("id", linkId)
    .maybeSingle();

  if (!link) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  let target = link.url as string;
  if (subId) {
    const sub = ((link.sub_links as SubLink[] | null) ?? []).find((s) => s.id === subId);
    if (!sub?.url) {
      return NextResponse.redirect(new URL("/", request.url));
    }
    target = sub.url;
  }

  if (!target) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  await supabase.from("click_events").insert({
    link_id: link.id,
    creator_id: link.creator_id,
    referrer: request.headers.get("referer"),
    user_agent: request.headers.get("user-agent"),
  });

  return NextResponse.redirect(normalizeUrl(target), { status: 307 });
}
