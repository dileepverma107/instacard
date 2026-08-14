"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import {
  ArrowDown,
  ArrowUp,
  Trash2,
  Plus,
  Copy,
  Check,
  Loader2,
  User,
  Link2,
  Palette,
  Rocket,
  ChevronDown,
  Star,
  Sparkles,
  Circle,
  Camera,
  Mail,
  Briefcase,
  Image as ImageIcon,
  type LucideIcon,
} from "lucide-react";
import { PhoneFrame } from "@/components/PhoneFrame";
import { CreatorCard } from "@/components/CreatorCard";
import { LinkIconBadge } from "@/components/LinkIconBadge";
import { LinkIconGlyph } from "@/components/LinkIcon";
import { LeadsPanel } from "./LeadsPanel";
import { BrandInquiriesPanel } from "./BrandInquiriesPanel";
import { QrCodeCard } from "./QrCodeCard";
import { createClient } from "@/lib/supabase/client";
import {
  ACCENT_PRESETS,
  CREATOR_TYPES,
  LINK_ICONS,
  MAX_GALLERY_IMAGES,
  MAX_LINKS,
  MAX_PAST_COLLABS,
  MAX_RATE_CARD_ITEMS,
  MAX_SUB_LINKS,
  TEMPLATES,
  type Accent,
  type BrandInquiry,
  type Creator,
  type CreatorType,
  type GalleryImage,
  type Lead,
  type LinkBlock,
  type LinkType,
  type PastCollab,
  type RateCardItem,
  type SubLink,
  type Template,
} from "@/lib/types";
import { LINK_PRESETS } from "@/lib/linkPresets";
import { saveCard, type SaveLinkInput } from "@/app/dashboard/actions";

const MAX_AVATAR_BYTES = 5 * 1024 * 1024;

const LINK_TYPES: LinkType[] = ["portfolio", "brand", "product", "social", "contact", "custom"];

interface EditableLink extends SaveLinkInput {
  tempId: string;
}

function emptyLink(): EditableLink {
  return {
    tempId: crypto.randomUUID(),
    type: "custom",
    label: "",
    sub_label: "",
    icon: "link",
    url: "",
    sub_links: [],
    is_featured: false,
    starts_at: null,
    ends_at: null,
  };
}

function emptySubLink(): SubLink {
  return { id: crypto.randomUUID(), label: "", url: "" };
}

function emptyRateCardItem(): RateCardItem {
  return { id: crypto.randomUUID(), label: "", price: "" };
}

function emptyPastCollab(): PastCollab {
  return { id: crypto.randomUUID(), name: "", logo_url: "" };
}

function emptyGalleryImage(): GalleryImage {
  return { id: crypto.randomUUID(), url: "" };
}

/** datetime-local inputs need "YYYY-MM-DDTHH:mm" in local time, with no trailing "Z". */
function toDatetimeLocal(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function fromDatetimeLocal(value: string): string | null {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

const cardClass =
  "rounded-3xl border border-white/60 bg-white/70 p-6 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.04]";

const ACCENTS = {
  violet: {
    icon: "bg-violet-500/10 text-violet-600 dark:bg-violet-500/15 dark:text-violet-400",
  },
  pink: {
    icon: "bg-pink-500/10 text-pink-600 dark:bg-pink-500/15 dark:text-pink-400",
  },
  amber: {
    icon: "bg-amber-500/10 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400",
  },
  emerald: {
    icon: "bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400",
  },
  sky: {
    icon: "bg-sky-500/10 text-sky-600 dark:bg-sky-500/15 dark:text-sky-400",
  },
  rose: {
    icon: "bg-rose-500/10 text-rose-600 dark:bg-rose-500/15 dark:text-rose-400",
  },
} as const;

function sectionIcon(accent: keyof typeof ACCENTS) {
  return `flex h-7 w-7 items-center justify-center rounded-lg ${ACCENTS[accent].icon}`;
}
function entrance(delayMs: number): { className: string; style: React.CSSProperties } {
  return { className: "animate-card-in", style: { animationDelay: `${delayMs}ms` } };
}

type Section = "profile" | "links" | "design" | "leads" | "mediaKit" | "publish";

const SECTIONS: { id: Section; label: string; icon: LucideIcon; accent: keyof typeof ACCENTS }[] = [
  { id: "profile", label: "Profile", icon: User, accent: "violet" },
  { id: "links", label: "Links", icon: Link2, accent: "pink" },
  { id: "design", label: "Design", icon: Palette, accent: "amber" },
  { id: "leads", label: "Leads", icon: Mail, accent: "sky" },
  { id: "mediaKit", label: "Media Kit", icon: Briefcase, accent: "rose" },
  { id: "publish", label: "Publish", icon: Rocket, accent: "emerald" },
];

const inputClass =
  "w-full rounded-2xl border border-neutral-200 bg-white/80 px-3.5 py-2.5 text-sm text-neutral-900 placeholder-neutral-400 shadow-sm outline-none transition focus:border-pink-400 focus:bg-white focus:ring-4 focus:ring-pink-500/10 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder-neutral-500 dark:focus:bg-white/10";
const compactInputClass =
  "rounded-xl border border-neutral-200 bg-white/80 px-2.5 py-1.5 text-xs text-neutral-900 placeholder-neutral-400 shadow-sm outline-none transition focus:border-pink-400 focus:bg-white focus:ring-4 focus:ring-pink-500/10 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder-neutral-500 dark:focus:bg-white/10";
const selectClass =
  "rounded-xl border border-neutral-200 bg-white/80 px-2.5 py-1.5 text-xs capitalize text-neutral-700 shadow-sm outline-none transition focus:border-pink-400 focus:ring-4 focus:ring-pink-500/10 dark:border-white/10 dark:bg-white/5 dark:text-neutral-300";
const mutedTextClass = "text-neutral-500 dark:text-neutral-400";
const faintTextClass = "text-neutral-400 dark:text-neutral-500";
const linkIconBadgeFallback = {
  wrap: "bg-neutral-100 dark:bg-white/10",
  icon: "text-neutral-500 dark:text-neutral-300",
};

export function DashboardEditor({
  creator,
  initialLinks,
  initialLeads,
  initialBrandInquiries,
}: {
  creator: Creator;
  initialLinks: LinkBlock[];
  initialLeads: Lead[];
  initialBrandInquiries: BrandInquiry[];
}) {
  const [handle, setHandle] = useState(creator.handle);
  const [name, setName] = useState(creator.name);
  const [bioLine, setBioLine] = useState(creator.bio_line);
  const [followerCount, setFollowerCount] = useState(creator.follower_count);
  const [avatarUrl, setAvatarUrl] = useState(creator.avatar_url ?? "");
  const [template, setTemplate] = useState<Template>(creator.template ?? "aurora");
  const [accentColor, setAccentColor] = useState<Accent>(creator.accent_color ?? "sunset");
  const [creatorType, setCreatorType] = useState<CreatorType>(creator.creator_type ?? "general");
  const [isPublished, setIsPublished] = useState(creator.is_published);
  const [leadCaptureEnabled, setLeadCaptureEnabled] = useState(creator.lead_capture_enabled);
  const [leadCaptureHeading, setLeadCaptureHeading] = useState(
    creator.lead_capture_heading || "Get updates from me",
  );
  const [leadCaptureButtonText, setLeadCaptureButtonText] = useState(
    creator.lead_capture_button_text || "Subscribe",
  );
  const [leads, setLeads] = useState<Lead[]>(initialLeads);
  const [mediaKitEnabled, setMediaKitEnabled] = useState(creator.media_kit_enabled);
  const [mediaKitHeading, setMediaKitHeading] = useState(creator.media_kit_heading || "Work with me");
  const [rateCard, setRateCard] = useState<RateCardItem[]>(creator.rate_card ?? []);
  const [pastCollabs, setPastCollabs] = useState<PastCollab[]>(creator.past_collabs ?? []);
  const [brandInquiries, setBrandInquiries] = useState<BrandInquiry[]>(initialBrandInquiries);
  const [galleryEnabled, setGalleryEnabled] = useState(creator.gallery_enabled);
  const [galleryHeading, setGalleryHeading] = useState(creator.gallery_heading || "My work");
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>(creator.gallery_images ?? []);
  const [activeSection, setActiveSection] = useState<Section>("profile");
  const [expandedLinks, setExpandedLinks] = useState<Set<string>>(new Set());
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [showAvatarUrlInput, setShowAvatarUrlInput] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [links, setLinks] = useState<EditableLink[]>(
    initialLinks.map((l) => ({
      tempId: l.id,
      id: l.id,
      type: l.type,
      label: l.label,
      sub_label: l.sub_label,
      icon: l.icon,
      url: l.url,
      sub_links: l.sub_links ?? [],
      is_featured: l.is_featured,
      starts_at: l.starts_at,
      ends_at: l.ends_at,
    })),
  );
  const [pending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<{ kind: "ok" | "error"; text: string } | null>(null);
  const [copied, setCopied] = useState(false);

  const previewLinks = useMemo(
    () =>
      links.map((l, i) => ({
        id: l.tempId,
        creator_id: creator.id,
        type: l.type,
        label: l.label,
        sub_label: l.sub_label,
        icon: l.icon,
        url: l.url,
        sub_links: l.sub_links,
        sort_order: i,
        is_featured: l.is_featured,
        starts_at: l.starts_at,
        ends_at: l.ends_at,
        created_at: "",
      })),
    [links, creator.id],
  );

  function updateLink(tempId: string, patch: Partial<SaveLinkInput>) {
    setLinks((prev) => prev.map((l) => (l.tempId === tempId ? { ...l, ...patch } : l)));
  }

  function addLink() {
    if (links.length >= MAX_LINKS) return;
    const link = emptyLink();
    setLinks((prev) => [...prev, link]);
    setExpandedLinks((prev) => new Set(prev).add(link.tempId));
  }

  function addPresetLink(preset: (typeof LINK_PRESETS)[CreatorType][number]) {
    if (links.length >= MAX_LINKS) return;
    const link: EditableLink = {
      ...emptyLink(),
      label: preset.label,
      sub_label: preset.sub_label,
      icon: preset.icon,
      type: preset.type,
    };
    setLinks((prev) => [...prev, link]);
    setExpandedLinks((prev) => new Set(prev).add(link.tempId));
  }

  function removeLink(tempId: string) {
    setLinks((prev) => prev.filter((l) => l.tempId !== tempId));
  }

  function toggleExpanded(tempId: string) {
    setExpandedLinks((prev) => {
      const next = new Set(prev);
      if (next.has(tempId)) next.delete(tempId);
      else next.add(tempId);
      return next;
    });
  }

  function toggleFeatured(tempId: string) {
    setLinks((prev) =>
      prev.map((l) => ({
        ...l,
        is_featured: l.tempId === tempId ? !l.is_featured : false,
      })),
    );
  }

  function moveLink(index: number, dir: -1 | 1) {
    setLinks((prev) => {
      const next = [...prev];
      const target = index + dir;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  function addSubLink(linkTempId: string) {
    setLinks((prev) =>
      prev.map((l) =>
        l.tempId === linkTempId && l.sub_links.length < MAX_SUB_LINKS
          ? { ...l, sub_links: [...l.sub_links, emptySubLink()] }
          : l,
      ),
    );
  }

  function updateSubLink(linkTempId: string, subId: string, patch: Partial<SubLink>) {
    setLinks((prev) =>
      prev.map((l) =>
        l.tempId === linkTempId
          ? {
              ...l,
              sub_links: l.sub_links.map((s) => (s.id === subId ? { ...s, ...patch } : s)),
            }
          : l,
      ),
    );
  }

  function removeSubLink(linkTempId: string, subId: string) {
    setLinks((prev) =>
      prev.map((l) =>
        l.tempId === linkTempId
          ? { ...l, sub_links: l.sub_links.filter((s) => s.id !== subId) }
          : l,
      ),
    );
  }

  function addRateCardItem() {
    if (rateCard.length >= MAX_RATE_CARD_ITEMS) return;
    setRateCard((prev) => [...prev, emptyRateCardItem()]);
  }
  function updateRateCardItem(id: string, patch: Partial<RateCardItem>) {
    setRateCard((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  }
  function removeRateCardItem(id: string) {
    setRateCard((prev) => prev.filter((r) => r.id !== id));
  }

  function addPastCollab() {
    if (pastCollabs.length >= MAX_PAST_COLLABS) return;
    setPastCollabs((prev) => [...prev, emptyPastCollab()]);
  }
  function updatePastCollab(id: string, patch: Partial<PastCollab>) {
    setPastCollabs((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c)));
  }
  function removePastCollab(id: string) {
    setPastCollabs((prev) => prev.filter((c) => c.id !== id));
  }

  function addGalleryImage() {
    if (galleryImages.length >= MAX_GALLERY_IMAGES) return;
    setGalleryImages((prev) => [...prev, emptyGalleryImage()]);
  }
  function updateGalleryImage(id: string, url: string) {
    setGalleryImages((prev) => prev.map((g) => (g.id === id ? { ...g, url } : g)));
  }
  function removeGalleryImage(id: string) {
    setGalleryImages((prev) => prev.filter((g) => g.id !== id));
  }

  async function handleAvatarFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setUploadError("Please choose an image file.");
      return;
    }
    if (file.size > MAX_AVATAR_BYTES) {
      setUploadError("Image must be under 5MB.");
      return;
    }

    setUploadError(null);
    setUploading(true);
    try {
      const supabase = createClient();
      const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const path = `${creator.user_id}/avatar-${Date.now()}.${ext}`;
      const { error } = await supabase.storage
        .from("avatars")
        .upload(path, file, { cacheControl: "3600", upsert: true });
      if (error) throw error;
      const { data } = supabase.storage.from("avatars").getPublicUrl(path);
      setAvatarUrl(data.publicUrl);
    } catch (err) {
      setUploadError(
        err instanceof Error
          ? err.message
          : "Upload failed. Make sure the 'avatars' storage bucket exists.",
      );
    } finally {
      setUploading(false);
    }
  }

  function handleSave() {
    setFeedback(null);
    startTransition(async () => {
      const result = await saveCard({
        handle,
        name,
        bio_line: bioLine,
        follower_count: followerCount,
        avatar_url: avatarUrl,
        template,
        accent_color: accentColor,
        creator_type: creatorType,
        is_published: isPublished,
        lead_capture_enabled: leadCaptureEnabled,
        lead_capture_heading: leadCaptureHeading,
        lead_capture_button_text: leadCaptureButtonText,
        media_kit_enabled: mediaKitEnabled,
        media_kit_heading: mediaKitHeading,
        rate_card: rateCard,
        past_collabs: pastCollabs,
        gallery_enabled: galleryEnabled,
        gallery_heading: galleryHeading,
        gallery_images: galleryImages,
        links: links.map(
          ({ type, label, sub_label, icon, url, sub_links, is_featured, starts_at, ends_at }) => ({
            type,
            label,
            sub_label,
            icon,
            url,
            sub_links,
            is_featured,
            starts_at,
            ends_at,
          }),
        ),
      });
      if (result.ok) {
        setFeedback({ kind: "ok", text: "Saved." });
      } else {
        setFeedback({ kind: "error", text: result.error });
      }
    });
  }

  const [origin, setOrigin] = useState("");
  useEffect(() => {
    // window is only available after mount; this is a one-off read of the
    // current deployment's origin, not a subscription to external state.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOrigin(window.location.origin);
  }, []);
  const publicPath = `${origin}/${handle}`;

  function copyLink() {
    navigator.clipboard?.writeText(publicPath);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  const existingLabels = new Set(links.map((l) => l.label.trim().toLowerCase()));
  const suggestedPresets = LINK_PRESETS[creatorType].filter(
    (p) => !existingLabels.has(p.label.toLowerCase()),
  );

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
      <div className="space-y-4">
        {/* section tabs + publish status */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex gap-1 rounded-xl border border-white/60 bg-white/50 p-1 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-white/5">
            {SECTIONS.map((s) => {
              const Icon = s.icon;
              const active = activeSection === s.id;
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setActiveSection(s.id)}
                  className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition sm:px-3 sm:text-sm ${
                    active
                      ? ACCENTS[s.accent].icon
                      : "text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">{s.label}</span>
                </button>
              );
            })}
          </div>

          <div
            className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium ${
              isPublished
                ? "border-emerald-300/60 bg-emerald-500/10 text-emerald-700 dark:border-emerald-500/30 dark:text-emerald-400"
                : "border-neutral-200 bg-white/60 text-neutral-500 dark:border-white/10 dark:bg-white/5 dark:text-neutral-400"
            }`}
          >
            <Circle
              className={`h-2 w-2 ${isPublished ? "fill-emerald-500 text-emerald-500" : "fill-neutral-400 text-neutral-400"}`}
            />
            {isPublished ? "Live" : "Draft"}
          </div>
        </div>

        {/* profile */}
        {activeSection === "profile" && (
        <section className={`${cardClass} ${entrance(0).className}`} style={entrance(0).style}>
          <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-neutral-900 dark:text-white">
            <span className={sectionIcon("violet")}>
              <User className="h-4 w-4" />
            </span>
            Profile
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col items-center gap-2.5 rounded-2xl border border-dashed border-neutral-200 bg-white/40 p-5 dark:border-white/10 dark:bg-white/[0.02] sm:col-span-2">
              <div className="relative">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  aria-label="Change photo"
                  className="block h-24 w-24 overflow-hidden rounded-full bg-gradient-to-tr from-amber-400 via-pink-500 to-purple-600 p-[3px] disabled:opacity-80"
                >
                  <span className="flex h-full w-full items-center justify-center overflow-hidden rounded-full bg-white text-2xl font-semibold text-neutral-400 dark:bg-neutral-900 dark:text-neutral-500">
                    {avatarUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
                    ) : (
                      (name || handle || "?").charAt(0).toUpperCase()
                    )}
                  </span>
                </button>
                {uploading && (
                  <span className="absolute inset-[3px] flex items-center justify-center rounded-full bg-black/40">
                    <Loader2 className="h-6 w-6 animate-spin text-white" />
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  aria-label="Upload photo"
                  title="Upload photo"
                  className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full bg-neutral-900 text-white ring-4 ring-white transition hover:bg-neutral-700 disabled:opacity-60 dark:bg-white dark:text-neutral-900 dark:ring-neutral-950"
                >
                  <Camera className="h-4 w-4" />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarFile}
                  className="hidden"
                />
              </div>

              <button
                type="button"
                onClick={() => setShowAvatarUrlInput((v) => !v)}
                className={`text-xs font-medium ${mutedTextClass} hover:underline`}
              >
                {showAvatarUrlInput ? "Hide URL field" : "or paste an image URL"}
              </button>

              {showAvatarUrlInput && (
                <input
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  className={`${compactInputClass} w-full max-w-xs text-center`}
                  placeholder="https://…"
                  autoFocus
                />
              )}

              {uploadError && (
                <p className="text-xs text-red-500 dark:text-red-400">{uploadError}</p>
              )}
            </div>
            <Field label="Handle">
              <div className="flex items-center gap-1.5 rounded-2xl border border-neutral-200 bg-white/80 px-3.5 py-2.5 text-sm text-neutral-900 shadow-sm transition focus-within:border-pink-400 focus-within:bg-white focus-within:ring-4 focus-within:ring-pink-500/10 dark:border-white/10 dark:bg-white/5 dark:text-white dark:focus-within:bg-white/10">
                <span className="text-neutral-400 dark:text-neutral-500">@</span>
                <input
                  value={handle}
                  onChange={(e) => setHandle(e.target.value.toLowerCase())}
                  className="w-full bg-transparent outline-none"
                  placeholder="yourname"
                />
              </div>
            </Field>
            <Field label="Display name">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={inputClass}
                placeholder="Jordan Rivera"
              />
            </Field>
            <Field label="Follower count">
              <input
                type="number"
                min={0}
                value={followerCount}
                onChange={(e) => setFollowerCount(Number(e.target.value))}
                className={inputClass}
              />
            </Field>
            <Field label="Creator type" className="sm:col-span-2">
              <p className={`-mt-1 mb-2 text-xs ${faintTextClass}`}>
                Unlocks quick-add link suggestions tailored to your niche.
              </p>
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
                {CREATOR_TYPES.map((ct) => (
                  <button
                    key={ct.id}
                    type="button"
                    onClick={() => setCreatorType(ct.id)}
                    title={ct.name}
                    className={`flex flex-col items-center gap-1 rounded-xl border p-2 text-center transition ${
                      creatorType === ct.id
                        ? "border-violet-500 bg-violet-500/10 ring-2 ring-violet-500/20"
                        : "border-neutral-200 bg-white/60 hover:border-neutral-300 dark:border-white/10 dark:bg-white/5 dark:hover:border-white/20"
                    }`}
                  >
                    <LinkIconGlyph
                      name={ct.icon}
                      className={`h-4 w-4 ${
                        creatorType === ct.id
                          ? "text-violet-600 dark:text-violet-400"
                          : "text-neutral-500 dark:text-neutral-400"
                      }`}
                    />
                    <span
                      className={`text-[10px] font-medium leading-tight ${
                        creatorType === ct.id
                          ? "text-violet-700 dark:text-violet-300"
                          : "text-neutral-600 dark:text-neutral-400"
                      }`}
                    >
                      {ct.name}
                    </span>
                  </button>
                ))}
              </div>
            </Field>
            <Field label="Bio line" className="sm:col-span-2">
              <textarea
                value={bioLine}
                onChange={(e) => setBioLine(e.target.value)}
                rows={2}
                maxLength={140}
                className={`${inputClass} resize-none`}
                placeholder="Fitness coach helping busy parents get strong in 20 min/day."
              />
            </Field>
          </div>

          <div className="mt-5 border-t border-neutral-200 pt-4 dark:border-white/10">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">
                Photo gallery{" "}
                <span className={`font-normal ${faintTextClass}`}>
                  ({galleryImages.length}/{MAX_GALLERY_IMAGES})
                </span>
              </h3>
              <button
                onClick={() => setGalleryEnabled((v) => !v)}
                className={`relative h-7 w-12 rounded-full transition ${
                  galleryEnabled ? "bg-violet-500" : "bg-neutral-300 dark:bg-white/10"
                }`}
                aria-label="Toggle photo gallery"
              >
                <span
                  className={`absolute top-1 h-5 w-5 rounded-full bg-white transition ${
                    galleryEnabled ? "left-6" : "left-1"
                  }`}
                />
              </button>
            </div>
            <p className={`mt-1 text-xs ${mutedTextClass}`}>
              An Instagram-style photo grid shown right below your bio.
            </p>

            {galleryEnabled && (
              <div className="mt-3">
                <Field label="Heading">
                  <input
                    value={galleryHeading}
                    onChange={(e) => setGalleryHeading(e.target.value)}
                    className={inputClass}
                    placeholder="My work"
                  />
                </Field>
                <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-5">
                  {galleryImages.map((img) => (
                    <div key={img.id} className="relative">
                      <div className="aspect-square overflow-hidden rounded-lg bg-neutral-100 dark:bg-white/10">
                        {img.url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={img.url} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center">
                            <ImageIcon className={`h-5 w-5 ${faintTextClass}`} />
                          </div>
                        )}
                      </div>
                      <input
                        value={img.url}
                        onChange={(e) => updateGalleryImage(img.id, e.target.value)}
                        placeholder="Image URL"
                        className={`${compactInputClass} mt-1 w-full`}
                      />
                      <button
                        onClick={() => removeGalleryImage(img.id)}
                        aria-label="Remove image"
                        className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white shadow"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                  {galleryImages.length < MAX_GALLERY_IMAGES && (
                    <button
                      onClick={addGalleryImage}
                      className="flex aspect-square flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-neutral-300 text-neutral-400 transition hover:border-neutral-400 hover:text-neutral-500 dark:border-white/15 dark:text-neutral-500 dark:hover:border-white/25"
                    >
                      <Plus className="h-5 w-5" />
                      <span className="text-[10px] font-medium">Add photo</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </section>
        )}

        {/* links */}
        {activeSection === "links" && (
        <section className={`${cardClass} ${entrance(0).className}`} style={entrance(0).style}>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-neutral-900 dark:text-white">
              <span className={sectionIcon("pink")}>
                <Link2 className="h-4 w-4" />
              </span>
              Links <span className={`font-normal ${faintTextClass}`}>({links.length}/{MAX_LINKS})</span>
            </h2>
            <button
              onClick={addLink}
              disabled={links.length >= MAX_LINKS}
              className="flex items-center gap-1 rounded-lg bg-neutral-900 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-neutral-800 disabled:opacity-40 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
            >
              <Plus className="h-3.5 w-3.5" /> Add link
            </button>
          </div>

          {suggestedPresets.length > 0 && links.length < MAX_LINKS && (
            <div className="mb-4 rounded-2xl border border-dashed border-pink-300/60 bg-pink-500/5 p-3 dark:border-pink-500/20 dark:bg-pink-500/5">
              <p className="mb-2 flex items-center gap-1.5 text-xs font-medium text-pink-700 dark:text-pink-300">
                <Sparkles className="h-3.5 w-3.5" />
                Suggested for {CREATOR_TYPES.find((c) => c.id === creatorType)?.name}
              </p>
              <div className="flex flex-wrap gap-2">
                {suggestedPresets.map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => addPresetLink(preset)}
                    disabled={links.length >= MAX_LINKS}
                    className="flex items-center gap-1.5 rounded-full border border-pink-300/60 bg-white/80 px-3 py-1.5 text-xs font-medium text-neutral-700 shadow-sm transition hover:border-pink-400 hover:bg-white disabled:opacity-40 dark:border-pink-500/30 dark:bg-white/5 dark:text-neutral-200 dark:hover:bg-white/10"
                  >
                    <LinkIconGlyph name={preset.icon} className="h-3.5 w-3.5 text-pink-500" />
                    {preset.label}
                    <Plus className="h-3 w-3 text-neutral-400" />
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-2">
            {links.map((link, i) => {
              const isOpen = expandedLinks.has(link.tempId);
              return (
              <div
                key={link.tempId}
                className={`rounded-2xl border bg-white/60 shadow-sm dark:bg-white/[0.03] ${
                  link.is_featured
                    ? "border-amber-300 ring-1 ring-amber-300/50 dark:border-amber-500/40 dark:ring-amber-500/20"
                    : "border-neutral-200 dark:border-white/10"
                }`}
              >
                <div className="flex items-center gap-2 p-3">
                  <button
                    type="button"
                    onClick={() => toggleExpanded(link.tempId)}
                    className="flex min-w-0 flex-1 items-center gap-2.5 text-left"
                  >
                    <ChevronDown
                      className={`h-4 w-4 shrink-0 transition-transform ${isOpen ? "" : "-rotate-90"} ${faintTextClass}`}
                    />
                    <LinkIconBadge
                      url={link.url}
                      icon={link.icon}
                      fallbackWrapClass={linkIconBadgeFallback.wrap}
                      fallbackIconClass={linkIconBadgeFallback.icon}
                      className="h-8 w-8"
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-neutral-900 dark:text-white">
                        {link.label || "Untitled link"}
                      </span>
                      <span className={`block truncate text-xs ${faintTextClass}`}>
                        {link.url || "No URL yet"}
                      </span>
                    </span>
                  </button>
                  <div className="flex shrink-0 items-center gap-1">
                    <button
                      onClick={() => toggleFeatured(link.tempId)}
                      className={`rounded-md p-1 transition ${
                        link.is_featured
                          ? "text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-500/10"
                          : "text-neutral-400 hover:bg-neutral-100 dark:text-neutral-500 dark:hover:bg-white/10"
                      }`}
                      title={link.is_featured ? "Remove featured" : "Mark as featured"}
                      aria-label="Toggle featured"
                    >
                      <Star className={`h-4 w-4 ${link.is_featured ? "fill-current" : ""}`} />
                    </button>
                    <button
                      onClick={() => moveLink(i, -1)}
                      disabled={i === 0}
                      className="rounded-md p-1 text-neutral-400 hover:bg-neutral-100 disabled:opacity-30 dark:text-neutral-500 dark:hover:bg-white/10"
                      aria-label="Move up"
                    >
                      <ArrowUp className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => moveLink(i, 1)}
                      disabled={i === links.length - 1}
                      className="rounded-md p-1 text-neutral-400 hover:bg-neutral-100 disabled:opacity-30 dark:text-neutral-500 dark:hover:bg-white/10"
                      aria-label="Move down"
                    >
                      <ArrowDown className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => removeLink(link.tempId)}
                      className="rounded-md p-1 text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10"
                      aria-label="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {isOpen && (
                <div className="border-t border-neutral-200 px-3 pb-3 pt-3 dark:border-white/10">
                <div className="mb-2 flex items-center gap-2">
                  <select
                    value={link.type}
                    onChange={(e) => updateLink(link.tempId, { type: e.target.value as LinkType })}
                    className={selectClass}
                  >
                    {LINK_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                  <select
                    value={link.icon}
                    onChange={(e) => updateLink(link.tempId, { icon: e.target.value })}
                    title="Fallback icon, used if a brand logo can't be found for the URL"
                    className={selectClass}
                  >
                    {LINK_ICONS.map((icon) => (
                      <option key={icon} value={icon}>
                        {icon}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <input
                    value={link.label}
                    onChange={(e) => updateLink(link.tempId, { label: e.target.value })}
                    placeholder="Label (e.g. Shop my presets)"
                    className={compactInputClass}
                  />
                  <input
                    value={link.sub_label}
                    onChange={(e) => updateLink(link.tempId, { sub_label: e.target.value })}
                    placeholder="Sub-label (optional)"
                    className={compactInputClass}
                  />
                  <input
                    value={link.url}
                    onChange={(e) => updateLink(link.tempId, { url: e.target.value })}
                    placeholder="https://… (its logo auto-fills the icon above)"
                    className={`${compactInputClass} sm:col-span-2`}
                  />
                </div>

                {/* scheduling */}
                <div className="mt-3 border-t border-dashed border-neutral-200 pt-3 dark:border-white/10">
                  <span className={`mb-1.5 flex items-center gap-1 text-xs font-medium ${mutedTextClass}`}>
                    Schedule (optional)
                  </span>
                  <p className={`mb-2 text-xs ${faintTextClass}`}>
                    Set an end time to show a live countdown and auto-hide the link after — great
                    for sales, drops, or event links.
                  </p>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    <label className="block">
                      <span className={`mb-1 block text-[11px] ${faintTextClass}`}>Visible from</span>
                      <input
                        type="datetime-local"
                        value={toDatetimeLocal(link.starts_at)}
                        onChange={(e) =>
                          updateLink(link.tempId, { starts_at: fromDatetimeLocal(e.target.value) })
                        }
                        className={`w-full ${compactInputClass}`}
                      />
                    </label>
                    <label className="block">
                      <span className={`mb-1 block text-[11px] ${faintTextClass}`}>
                        Ends (countdown shown until then)
                      </span>
                      <input
                        type="datetime-local"
                        value={toDatetimeLocal(link.ends_at)}
                        onChange={(e) =>
                          updateLink(link.tempId, { ends_at: fromDatetimeLocal(e.target.value) })
                        }
                        className={`w-full ${compactInputClass}`}
                      />
                    </label>
                  </div>
                </div>

                {/* sub-links */}
                <div className="mt-3 border-t border-dashed border-neutral-200 pt-3 dark:border-white/10">
                  <div className="flex items-center justify-between">
                    <span className={`flex items-center gap-1 text-xs font-medium ${mutedTextClass}`}>
                      <ChevronDown className="h-3.5 w-3.5" />
                      Sub-links{" "}
                      <span className={`font-normal ${faintTextClass}`}>
                        ({link.sub_links.length}/{MAX_SUB_LINKS})
                      </span>
                    </span>
                    <button
                      onClick={() => addSubLink(link.tempId)}
                      disabled={link.sub_links.length >= MAX_SUB_LINKS}
                      className="flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-pink-600 hover:bg-pink-50 disabled:opacity-40 dark:text-pink-400 dark:hover:bg-pink-500/10"
                    >
                      <Plus className="h-3 w-3" /> Add sub-link
                    </button>
                  </div>
                  {link.sub_links.length > 0 && (
                    <p className={`mt-1 text-xs ${faintTextClass}`}>
                      Visitors tap this link to expand a mini-menu instead of navigating straight
                      away — great for grouping a few destinations under one block.
                    </p>
                  )}
                  <div className="mt-2 space-y-2">
                    {link.sub_links.map((sub) => (
                      <div key={sub.id} className="flex items-center gap-2 pl-4">
                        <LinkIconBadge
                          url={sub.url}
                          icon="link"
                          fallbackWrapClass={linkIconBadgeFallback.wrap}
                          fallbackIconClass={linkIconBadgeFallback.icon}
                          className="h-7 w-7"
                        />
                        <input
                          value={sub.label}
                          onChange={(e) =>
                            updateSubLink(link.tempId, sub.id, { label: e.target.value })
                          }
                          placeholder="Label"
                          className={`w-28 sm:w-32 ${compactInputClass}`}
                        />
                        <input
                          value={sub.url}
                          onChange={(e) => updateSubLink(link.tempId, sub.id, { url: e.target.value })}
                          placeholder="https://…"
                          className={`min-w-0 flex-1 ${compactInputClass}`}
                        />
                        <button
                          onClick={() => removeSubLink(link.tempId, sub.id)}
                          className="rounded-md p-1 text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10"
                          aria-label="Remove sub-link"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
                </div>
                )}
              </div>
              );
            })}
            {links.length === 0 && (
              <p className={`text-sm ${faintTextClass}`}>No links yet — add up to {MAX_LINKS}.</p>
            )}
          </div>
        </section>
        )}

        {/* template */}
        {activeSection === "design" && (
        <section className={`${cardClass} ${entrance(0).className}`} style={entrance(0).style}>
          <h2 className="mb-1 flex items-center gap-2 text-sm font-semibold text-neutral-900 dark:text-white">
            <span className={sectionIcon("amber")}>
              <Palette className="h-4 w-4" />
            </span>
            Template
          </h2>
          <p className={`mb-4 text-xs ${mutedTextClass}`}>
            Free for everyone while we&apos;re in beta — some of these move to Premium later.
          </p>
          <div className="grid grid-cols-3 gap-3">
            {TEMPLATES.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTemplate(t.id)}
                className={`rounded-xl border bg-white/60 p-2 text-left shadow-sm transition dark:bg-white/5 ${
                  template === t.id
                    ? "border-pink-500 ring-2 ring-pink-500/20"
                    : "border-neutral-200 hover:border-neutral-300 dark:border-white/10 dark:hover:border-white/20"
                }`}
              >
                <div
                  className="mb-2 flex h-14 w-full overflow-hidden rounded-lg"
                  style={{ backgroundColor: t.swatch[0] }}
                >
                  {t.swatch.slice(1).map((c, i) => (
                    <span key={i} className="h-full flex-1" style={{ backgroundColor: c }} />
                  ))}
                </div>
                <div className="flex items-center gap-1.5 text-xs font-medium text-neutral-900 dark:text-white">
                  {t.name}
                  {template === t.id && <Check className="h-3 w-3 text-pink-500" />}
                </div>
              </button>
            ))}
          </div>

          <h3 className="mb-1 mt-6 text-sm font-semibold text-neutral-900 dark:text-white">
            Accent color
          </h3>
          <p className={`mb-3 text-xs ${mutedTextClass}`}>
            Used for your featured link, lead capture, and media kit buttons.
          </p>
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
            {ACCENT_PRESETS.map((a) => (
              <button
                key={a.id}
                type="button"
                onClick={() => setAccentColor(a.id)}
                title={a.name}
                className={`flex flex-col items-center gap-1.5 rounded-xl border p-2 transition ${
                  accentColor === a.id
                    ? "border-pink-500 ring-2 ring-pink-500/20"
                    : "border-neutral-200 hover:border-neutral-300 dark:border-white/10 dark:hover:border-white/20"
                }`}
              >
                <span
                  className="h-6 w-full rounded-md"
                  style={{
                    background: `linear-gradient(to top right, ${a.swatch.join(", ")})`,
                  }}
                />
                <span className="text-[10px] font-medium text-neutral-600 dark:text-neutral-400">
                  {a.name}
                </span>
              </button>
            ))}
          </div>
        </section>
        )}

        {/* leads */}
        {activeSection === "leads" && (
        <section className={`${cardClass} ${entrance(0).className}`} style={entrance(0).style}>
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-neutral-900 dark:text-white">
              <span className={sectionIcon("sky")}>
                <Mail className="h-4 w-4" />
              </span>
              Lead capture
            </h2>
            <button
              onClick={() => setLeadCaptureEnabled((v) => !v)}
              className={`relative h-7 w-12 rounded-full transition ${
                leadCaptureEnabled ? "bg-sky-500" : "bg-neutral-300 dark:bg-white/10"
              }`}
              aria-label="Toggle lead capture"
            >
              <span
                className={`absolute top-1 h-5 w-5 rounded-full bg-white transition ${
                  leadCaptureEnabled ? "left-6" : "left-1"
                }`}
              />
            </button>
          </div>
          <p className={`mt-1 text-xs ${mutedTextClass}`}>
            Adds a small sign-up form to the bottom of your card so visitors can leave their email
            or WhatsApp — build a list you own, instead of relying only on Instagram reach.
          </p>

          {leadCaptureEnabled && (
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Heading">
                <input
                  value={leadCaptureHeading}
                  onChange={(e) => setLeadCaptureHeading(e.target.value)}
                  className={inputClass}
                  placeholder="Get updates from me"
                />
              </Field>
              <Field label="Button text">
                <input
                  value={leadCaptureButtonText}
                  onChange={(e) => setLeadCaptureButtonText(e.target.value)}
                  className={inputClass}
                  placeholder="Subscribe"
                />
              </Field>
            </div>
          )}

          <div className="mt-5 border-t border-neutral-200 pt-4 dark:border-white/10">
            <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">
              Collected leads
            </h3>
            <LeadsPanel
              leads={leads}
              onDeleted={(id) => setLeads((prev) => prev.filter((l) => l.id !== id))}
            />
          </div>
        </section>
        )}

        {/* media kit */}
        {activeSection === "mediaKit" && (
        <section className={`${cardClass} ${entrance(0).className}`} style={entrance(0).style}>
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-neutral-900 dark:text-white">
              <span className={sectionIcon("rose")}>
                <Briefcase className="h-4 w-4" />
              </span>
              Media kit
            </h2>
            <button
              onClick={() => setMediaKitEnabled((v) => !v)}
              className={`relative h-7 w-12 rounded-full transition ${
                mediaKitEnabled ? "bg-rose-500" : "bg-neutral-300 dark:bg-white/10"
              }`}
              aria-label="Toggle media kit"
            >
              <span
                className={`absolute top-1 h-5 w-5 rounded-full bg-white transition ${
                  mediaKitEnabled ? "left-6" : "left-1"
                }`}
              />
            </button>
          </div>
          <p className={`mt-1 text-xs ${mutedTextClass}`}>
            Adds a rate card, past brand collabs, and a &quot;work with me&quot; inquiry form to your card —
            gives brands a reason to actually reach out and pay you.
          </p>

          {mediaKitEnabled && (
            <>
              <div className="mt-4">
                <Field label="Heading">
                  <input
                    value={mediaKitHeading}
                    onChange={(e) => setMediaKitHeading(e.target.value)}
                    className={inputClass}
                    placeholder="Work with me"
                  />
                </Field>
              </div>

              <div className="mt-5 border-t border-neutral-200 pt-4 dark:border-white/10">
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">
                    Rate card{" "}
                    <span className={`font-normal ${faintTextClass}`}>
                      ({rateCard.length}/{MAX_RATE_CARD_ITEMS})
                    </span>
                  </h3>
                  <button
                    onClick={addRateCardItem}
                    disabled={rateCard.length >= MAX_RATE_CARD_ITEMS}
                    className="flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-rose-600 hover:bg-rose-50 disabled:opacity-40 dark:text-rose-400 dark:hover:bg-rose-500/10"
                  >
                    <Plus className="h-3 w-3" /> Add item
                  </button>
                </div>
                <div className="space-y-2">
                  {rateCard.map((item) => (
                    <div key={item.id} className="flex items-center gap-2">
                      <input
                        value={item.label}
                        onChange={(e) => updateRateCardItem(item.id, { label: e.target.value })}
                        placeholder="e.g. Instagram Reel"
                        className={`flex-1 ${compactInputClass}`}
                      />
                      <input
                        value={item.price}
                        onChange={(e) => updateRateCardItem(item.id, { price: e.target.value })}
                        placeholder="₹15,000"
                        className={`w-28 ${compactInputClass}`}
                      />
                      <button
                        onClick={() => removeRateCardItem(item.id)}
                        className="rounded-md p-1 text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10"
                        aria-label="Remove rate card item"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                  {rateCard.length === 0 && (
                    <p className={`text-sm ${faintTextClass}`}>No rate card items yet.</p>
                  )}
                </div>
              </div>

              <div className="mt-5 border-t border-neutral-200 pt-4 dark:border-white/10">
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">
                    Past collabs{" "}
                    <span className={`font-normal ${faintTextClass}`}>
                      ({pastCollabs.length}/{MAX_PAST_COLLABS})
                    </span>
                  </h3>
                  <button
                    onClick={addPastCollab}
                    disabled={pastCollabs.length >= MAX_PAST_COLLABS}
                    className="flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-rose-600 hover:bg-rose-50 disabled:opacity-40 dark:text-rose-400 dark:hover:bg-rose-500/10"
                  >
                    <Plus className="h-3 w-3" /> Add brand
                  </button>
                </div>
                <div className="space-y-2">
                  {pastCollabs.map((collab) => (
                    <div key={collab.id} className="flex items-center gap-2">
                      <span
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${linkIconBadgeFallback.wrap}`}
                      >
                        {collab.logo_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={collab.logo_url}
                            alt=""
                            className="h-full w-full rounded-lg object-contain"
                          />
                        ) : (
                          <ImageIcon className={`h-4 w-4 ${linkIconBadgeFallback.icon}`} />
                        )}
                      </span>
                      <input
                        value={collab.name}
                        onChange={(e) => updatePastCollab(collab.id, { name: e.target.value })}
                        placeholder="Brand name"
                        className={`w-28 sm:w-32 ${compactInputClass}`}
                      />
                      <input
                        value={collab.logo_url}
                        onChange={(e) => updatePastCollab(collab.id, { logo_url: e.target.value })}
                        placeholder="Logo URL (optional)"
                        className={`min-w-0 flex-1 ${compactInputClass}`}
                      />
                      <button
                        onClick={() => removePastCollab(collab.id)}
                        className="rounded-md p-1 text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10"
                        aria-label="Remove past collab"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                  {pastCollabs.length === 0 && (
                    <p className={`text-sm ${faintTextClass}`}>No past collabs added yet.</p>
                  )}
                </div>
              </div>
            </>
          )}

          <div className="mt-5 border-t border-neutral-200 pt-4 dark:border-white/10">
            <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">
              Brand inquiries
            </h3>
            <BrandInquiriesPanel
              inquiries={brandInquiries}
              onDeleted={(id) => setBrandInquiries((prev) => prev.filter((i) => i.id !== id))}
            />
          </div>
        </section>
        )}

        {/* publish */}
        {activeSection === "publish" && (
        <section className={`${cardClass} ${entrance(0).className}`} style={entrance(0).style}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="flex items-center gap-2 text-sm font-semibold text-neutral-900 dark:text-white">
                <span className={sectionIcon("emerald")}>
                  <Rocket className="h-4 w-4" />
                </span>
                Publish
              </h2>
              <p className={`mt-1 flex items-center gap-2 text-xs ${mutedTextClass}`}>
                {isPublished ? "Your card is live at " : "Your card is unpublished."}
                {isPublished && (
                  <>
                    <a
                      href={publicPath}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-pink-600 hover:underline dark:text-pink-400"
                    >
                      {publicPath.replace(/^https?:\/\//, "")}
                    </a>
                    <button
                      onClick={copyLink}
                      aria-label="Copy link"
                      className="text-neutral-400 hover:text-neutral-600 dark:text-neutral-500 dark:hover:text-neutral-300"
                    >
                      {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                    </button>
                  </>
                )}
              </p>
            </div>
            <button
              onClick={() => setIsPublished((p) => !p)}
              className={`relative h-7 w-12 rounded-full transition ${
                isPublished ? "bg-emerald-500" : "bg-neutral-300 dark:bg-white/10"
              }`}
              aria-label="Toggle publish"
            >
              <span
                className={`absolute top-1 h-5 w-5 rounded-full bg-white transition ${
                  isPublished ? "left-6" : "left-1"
                }`}
              />
            </button>
          </div>
          {isPublished && (
            <div className="mt-4">
              <QrCodeCard url={publicPath} />
            </div>
          )}
        </section>
        )}

        {/* save — always visible regardless of active tab */}
        <div className="flex items-center gap-3 border-t border-neutral-200/70 pt-4 dark:border-white/10">
          <button
            onClick={handleSave}
            disabled={pending}
            className="rounded-xl bg-gradient-to-tr from-amber-400 via-pink-500 to-purple-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-pink-500/20 transition hover:shadow-pink-500/30 disabled:opacity-60"
          >
            {pending ? "Saving…" : "Save changes"}
          </button>
          {feedback && (
            <span
              className={`text-sm ${
                feedback.kind === "ok"
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-red-500 dark:text-red-400"
              }`}
            >
              {feedback.text}
            </span>
          )}
        </div>
      </div>

      {/* live preview */}
      <div className="lg:sticky lg:top-6 lg:h-fit">
        <p className={`mb-3 text-center text-xs font-medium uppercase tracking-wide ${faintTextClass}`}>
          Live preview
        </p>
        <PhoneFrame>
          <CreatorCard
            name={name}
            handle={handle}
            avatarUrl={avatarUrl || null}
            followerCount={followerCount}
            bioLine={bioLine}
            links={previewLinks}
            showBranding={creator.plan === "free"}
            plan={creator.plan}
            template={template}
            accentColor={accentColor}
            mode="preview"
            creatorId={creator.id}
            leadCapture={{
              enabled: leadCaptureEnabled,
              heading: leadCaptureHeading,
              buttonText: leadCaptureButtonText,
            }}
            mediaKit={{
              enabled: mediaKitEnabled,
              heading: mediaKitHeading,
              rateCard,
              pastCollabs,
            }}
            gallery={{
              enabled: galleryEnabled,
              heading: galleryHeading,
              images: galleryImages,
            }}
          />
        </PhoneFrame>
      </div>
    </div>
  );
}

function Field({
  label,
  className,
  children,
}: {
  label: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <label className={`block ${className ?? ""}`}>
      <span className={`mb-1.5 block text-xs font-medium ${mutedTextClass}`}>{label}</span>
      {children}
    </label>
  );
}
