import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

function normalizeUrl(url: string) {
  if (/^(https?:|mailto:|tel:|whatsapp:)/i.test(url)) return url;
  return `https://${url}`;
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ linkId: string }> },
) {
  const { linkId } = await params;
  const supabase = await createClient();

  const { data: link } = await supabase
    .from("links")
    .select("id, url, creator_id")
    .eq("id", linkId)
    .maybeSingle();

  if (!link || !link.url) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  await supabase.from("click_events").insert({
    link_id: link.id,
    creator_id: link.creator_id,
    referrer: request.headers.get("referer"),
    user_agent: request.headers.get("user-agent"),
  });

  return NextResponse.redirect(normalizeUrl(link.url), { status: 307 });
}
