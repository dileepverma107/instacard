import type { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase/server";

const BASE_URL = "https://instacards.in";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient();
  const { data: creators } = await supabase
    .from("creators")
    .select("handle, updated_at")
    .eq("is_published", true);

  const creatorEntries: MetadataRoute.Sitemap = (creators ?? []).map((c) => ({
    url: `${BASE_URL}/${c.handle}`,
    lastModified: c.updated_at,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  return [
    { url: BASE_URL, changeFrequency: "weekly", priority: 1 },
    { url: `${BASE_URL}/login`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE_URL}/privacy`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${BASE_URL}/terms`, changeFrequency: "yearly", priority: 0.2 },
    ...creatorEntries,
  ];
}
