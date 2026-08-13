"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import {
  ArrowDown,
  ArrowUp,
  Trash2,
  Plus,
  Copy,
  Check,
  Upload,
  Loader2,
  User,
  Link2,
  Palette,
  Rocket,
  ChevronDown,
} from "lucide-react";
import { PhoneFrame } from "@/components/PhoneFrame";
import { CreatorCard } from "@/components/CreatorCard";
import { LinkIconBadge } from "@/components/LinkIconBadge";
import { createClient } from "@/lib/supabase/client";
import {
  LINK_ICONS,
  MAX_LINKS,
  MAX_SUB_LINKS,
  TEMPLATES,
  type Creator,
  type LinkBlock,
  type LinkType,
  type SubLink,
  type Template,
} from "@/lib/types";
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
  };
}

function emptySubLink(): SubLink {
  return { id: crypto.randomUUID(), label: "", url: "" };
}

const cardClass = "rounded-3xl border border-white/60 bg-white/70 p-6 shadow-sm backdrop-blur-xl";
const sectionIconClass =
  "flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-tr from-amber-400/20 via-pink-500/20 to-purple-600/20 text-pink-600";
const inputClass =
  "w-full rounded-2xl border border-neutral-200 bg-white/80 px-3.5 py-2.5 text-sm text-neutral-900 placeholder-neutral-400 shadow-sm outline-none transition focus:border-pink-400 focus:bg-white focus:ring-4 focus:ring-pink-500/10";
const compactInputClass =
  "rounded-xl border border-neutral-200 bg-white/80 px-2.5 py-1.5 text-xs text-neutral-900 placeholder-neutral-400 shadow-sm outline-none transition focus:border-pink-400 focus:bg-white focus:ring-4 focus:ring-pink-500/10";
const selectClass =
  "rounded-xl border border-neutral-200 bg-white/80 px-2.5 py-1.5 text-xs capitalize text-neutral-700 shadow-sm outline-none transition focus:border-pink-400 focus:ring-4 focus:ring-pink-500/10";

export function DashboardEditor({
  creator,
  initialLinks,
}: {
  creator: Creator;
  initialLinks: LinkBlock[];
}) {
  const [handle, setHandle] = useState(creator.handle);
  const [name, setName] = useState(creator.name);
  const [bioLine, setBioLine] = useState(creator.bio_line);
  const [followerCount, setFollowerCount] = useState(creator.follower_count);
  const [avatarUrl, setAvatarUrl] = useState(creator.avatar_url ?? "");
  const [template, setTemplate] = useState<Template>(creator.template ?? "aurora");
  const [isPublished, setIsPublished] = useState(creator.is_published);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
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
        is_featured: i === 0,
        created_at: "",
      })),
    [links, creator.id],
  );

  function updateLink(tempId: string, patch: Partial<SaveLinkInput>) {
    setLinks((prev) => prev.map((l) => (l.tempId === tempId ? { ...l, ...patch } : l)));
  }

  function addLink() {
    if (links.length >= MAX_LINKS) return;
    setLinks((prev) => [...prev, emptyLink()]);
  }

  function removeLink(tempId: string) {
    setLinks((prev) => prev.filter((l) => l.tempId !== tempId));
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
        is_published: isPublished,
        links: links.map(({ type, label, sub_label, icon, url, sub_links }) => ({
          type,
          label,
          sub_label,
          icon,
          url,
          sub_links,
        })),
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

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_320px]">
      <div className="space-y-6">
        {/* profile */}
        <section className={cardClass}>
          <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-neutral-900">
            <span className={sectionIconClass}>
              <User className="h-4 w-4" />
            </span>
            Profile
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Handle">
              <div className="flex items-center gap-1.5 rounded-2xl border border-neutral-200 bg-white/80 px-3.5 py-2.5 text-sm shadow-sm transition focus-within:border-pink-400 focus-within:bg-white focus-within:ring-4 focus-within:ring-pink-500/10">
                <span className="text-neutral-400">@</span>
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
            <Field label="Profile photo" className="sm:col-span-2">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-tr from-amber-400 via-pink-500 to-purple-600 p-[2px]">
                  <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-full bg-white text-lg font-semibold text-neutral-400">
                    {avatarUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
                    ) : (
                      (name || handle || "?").charAt(0).toUpperCase()
                    )}
                  </div>
                </div>
                <div className="flex-1">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarFile}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="flex items-center gap-1.5 rounded-lg border border-neutral-300 bg-white/80 px-3 py-1.5 text-xs font-medium text-neutral-700 shadow-sm transition hover:bg-white disabled:opacity-60"
                  >
                    {uploading ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Upload className="h-3.5 w-3.5" />
                    )}
                    {uploading ? "Uploading…" : "Upload photo"}
                  </button>
                  <input
                    value={avatarUrl}
                    onChange={(e) => setAvatarUrl(e.target.value)}
                    className={`${compactInputClass} mt-2 w-full`}
                    placeholder="…or paste an image URL"
                  />
                  {uploadError && <p className="mt-1 text-xs text-red-500">{uploadError}</p>}
                </div>
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
        </section>

        {/* links */}
        <section className={cardClass}>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-neutral-900">
              <span className={sectionIconClass}>
                <Link2 className="h-4 w-4" />
              </span>
              Links <span className="font-normal text-neutral-400">({links.length}/{MAX_LINKS})</span>
            </h2>
            <button
              onClick={addLink}
              disabled={links.length >= MAX_LINKS}
              className="flex items-center gap-1 rounded-lg bg-neutral-900 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-neutral-800 disabled:opacity-40"
            >
              <Plus className="h-3.5 w-3.5" /> Add link
            </button>
          </div>

          <div className="space-y-3">
            {links.map((link, i) => (
              <div
                key={link.tempId}
                className="rounded-2xl border border-neutral-200 bg-white/60 p-4 shadow-sm"
              >
                <div className="mb-3 flex items-center gap-2">
                  <LinkIconBadge
                    url={link.url}
                    icon={link.icon}
                    fallbackWrapClass="bg-neutral-100"
                    fallbackIconClass="text-neutral-500"
                    className="h-8 w-8"
                  />
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
                  <div className="ml-auto flex items-center gap-1">
                    <button
                      onClick={() => moveLink(i, -1)}
                      disabled={i === 0}
                      className="rounded-md p-1 text-neutral-400 hover:bg-neutral-100 disabled:opacity-30"
                      aria-label="Move up"
                    >
                      <ArrowUp className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => moveLink(i, 1)}
                      disabled={i === links.length - 1}
                      className="rounded-md p-1 text-neutral-400 hover:bg-neutral-100 disabled:opacity-30"
                      aria-label="Move down"
                    >
                      <ArrowDown className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => removeLink(link.tempId)}
                      className="rounded-md p-1 text-red-400 hover:bg-red-50"
                      aria-label="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
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

                {/* sub-links */}
                <div className="mt-3 border-t border-dashed border-neutral-200 pt-3">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1 text-xs font-medium text-neutral-500">
                      <ChevronDown className="h-3.5 w-3.5" />
                      Sub-links{" "}
                      <span className="font-normal text-neutral-400">
                        ({link.sub_links.length}/{MAX_SUB_LINKS})
                      </span>
                    </span>
                    <button
                      onClick={() => addSubLink(link.tempId)}
                      disabled={link.sub_links.length >= MAX_SUB_LINKS}
                      className="flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-pink-600 hover:bg-pink-50 disabled:opacity-40"
                    >
                      <Plus className="h-3 w-3" /> Add sub-link
                    </button>
                  </div>
                  {link.sub_links.length > 0 && (
                    <p className="mt-1 text-xs text-neutral-400">
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
                          fallbackWrapClass="bg-neutral-100"
                          fallbackIconClass="text-neutral-500"
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
                          className="rounded-md p-1 text-red-400 hover:bg-red-50"
                          aria-label="Remove sub-link"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
            {links.length === 0 && (
              <p className="text-sm text-neutral-400">No links yet — add up to {MAX_LINKS}.</p>
            )}
          </div>
        </section>

        {/* template */}
        <section className={cardClass}>
          <h2 className="mb-1 flex items-center gap-2 text-sm font-semibold text-neutral-900">
            <span className={sectionIconClass}>
              <Palette className="h-4 w-4" />
            </span>
            Template
          </h2>
          <p className="mb-4 text-xs text-neutral-500">
            Free for everyone while we&apos;re in beta — some of these move to Premium later.
          </p>
          <div className="grid grid-cols-3 gap-3">
            {TEMPLATES.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTemplate(t.id)}
                className={`rounded-xl border bg-white/60 p-2 text-left shadow-sm transition ${
                  template === t.id
                    ? "border-pink-500 ring-2 ring-pink-500/20"
                    : "border-neutral-200 hover:border-neutral-300"
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
                <div className="flex items-center gap-1.5 text-xs font-medium text-neutral-900">
                  {t.name}
                  {template === t.id && <Check className="h-3 w-3 text-pink-500" />}
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* publish */}
        <section className={cardClass}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="flex items-center gap-2 text-sm font-semibold text-neutral-900">
                <span className={sectionIconClass}>
                  <Rocket className="h-4 w-4" />
                </span>
                Publish
              </h2>
              <p className="mt-1 flex items-center gap-2 text-xs text-neutral-500">
                {isPublished ? "Your card is live at " : "Your card is unpublished."}
                {isPublished && (
                  <>
                    <a
                      href={publicPath}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-pink-600 hover:underline"
                    >
                      {publicPath.replace(/^https?:\/\//, "")}
                    </a>
                    <button
                      onClick={copyLink}
                      aria-label="Copy link"
                      className="text-neutral-400 hover:text-neutral-600"
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
                isPublished ? "bg-emerald-500" : "bg-neutral-300"
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
        </section>

        <div className="flex items-center gap-3">
          <button
            onClick={handleSave}
            disabled={pending}
            className="rounded-xl bg-gradient-to-tr from-amber-400 via-pink-500 to-purple-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-pink-500/20 transition hover:shadow-pink-500/30 disabled:opacity-60"
          >
            {pending ? "Saving…" : "Save changes"}
          </button>
          {feedback && (
            <span className={`text-sm ${feedback.kind === "ok" ? "text-emerald-600" : "text-red-500"}`}>
              {feedback.text}
            </span>
          )}
        </div>
      </div>

      {/* live preview */}
      <div className="lg:sticky lg:top-6 lg:h-fit">
        <p className="mb-3 text-center text-xs font-medium uppercase tracking-wide text-neutral-400">
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
            template={template}
            mode="preview"
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
      <span className="mb-1.5 block text-xs font-medium text-neutral-500">{label}</span>
      {children}
    </label>
  );
}
