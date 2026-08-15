import { ImageResponse } from "next/og";
import { getPublishedCreator } from "./page";
import { formatCount } from "@/lib/format";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "InstaCard profile";

export default async function Image({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params;
  const result = await getPublishedCreator(handle);

  const name = result?.creator.name || `@${handle}`;
  const bio = result?.creator.bio_line || "";
  const followers = result ? formatCount(result.creator.follower_count) : "";
  const avatarUrl = result?.creator.avatar_url;
  const initial = (result?.creator.name || handle || "?").charAt(0).toUpperCase();

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#0a0a0a",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            padding: 4,
            borderRadius: "9999px",
            background: "linear-gradient(to top right, #f59e0b, #ec4899, #9333ea)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 180,
              height: 180,
              borderRadius: "9999px",
              background: "#0a0a0a",
              overflow: "hidden",
            }}
          >
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatarUrl} width={172} height={172} style={{ objectFit: "cover", borderRadius: "9999px" }} alt="" />
            ) : (
              <span style={{ fontSize: 72, color: "rgba(255,255,255,0.6)", fontWeight: 700 }}>
                {initial}
              </span>
            )}
          </div>
        </div>

        <div style={{ display: "flex", fontSize: 56, fontWeight: 700, color: "white", marginTop: 32 }}>
          {name}
        </div>

        {followers && (
          <div style={{ display: "flex", fontSize: 28, color: "rgba(255,255,255,0.5)", marginTop: 8 }}>
            {followers} followers
          </div>
        )}

        {bio && (
          <div
            style={{
              display: "flex",
              fontSize: 26,
              color: "rgba(255,255,255,0.7)",
              marginTop: 20,
              maxWidth: 800,
              textAlign: "center",
            }}
          >
            {bio}
          </div>
        )}

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginTop: 48,
            fontSize: 24,
            color: "rgba(255,255,255,0.4)",
          }}
        >
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: 8,
              background: "linear-gradient(to top right, #f59e0b, #ec4899, #9333ea)",
            }}
          />
          InstaCard
        </div>
      </div>
    ),
    { ...size },
  );
}
