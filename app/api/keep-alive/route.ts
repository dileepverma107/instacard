import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Pinged daily by Vercel Cron (see vercel.json) purely to keep the Supabase
// free-tier project from auto-pausing after 7 days of inactivity.
export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const supabase = await createClient();
  await supabase.from("creators").select("id", { count: "exact", head: true });

  return NextResponse.json({ ok: true, pingedAt: new Date().toISOString() });
}
