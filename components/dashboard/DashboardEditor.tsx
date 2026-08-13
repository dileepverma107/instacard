"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { ArrowDown, ArrowUp, Trash2, Plus, Copy, Check } from "lucide-react";
import { PhoneFrame } from "@/components/PhoneFrame";
import { CreatorCard } from "@/components/CreatorCard";
import { LINK_ICONS, MAX_LINKS, type Creator, type LinkBlock, type LinkType } from "@/lib/types";
import { saveCard, type SaveLinkInput } from "@/app/dashboard/actions";

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
  };
}

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
  const [isPublished, setIsPublished] = useState(creator.is_published);
  const [links, setLinks] = useState<EditableLink[]>(
    initialLinks.map((l) => ({
      tempId: l.id,
      id: l.id,
      type: l.type,
      label: l.label,
      sub_label: l.sub_label,
      icon: l.icon,
      url: l.url,
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

  function handleSave() {
    setFeedback(null);
    startTransition(async () => {
      const result = await saveCard({
        handle,
        name,
        bio_line: bioLine,
        follower_count: followerCount,
        avatar_url: avatarUrl,
        is_published: isPublished,
        links: links.map(({ type, label, sub_label, icon, url }) => ({
          type,
          label,
          sub_label,
          icon,
          url,
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
  useEffect(() => setOrigin(window.location.origin), []);
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
        <section className="rounded-2xl border border-neutral-200 bg-white p-6">
          <h2 className="mb-4 text-sm font-semibold text-neutral-900">Profile</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Handle">
              <div className="flex items-center rounded-xl border border-neutral-300 pl-3 focus-within:border-pink-500">
                <span className="text-sm text-neutral-400">@</span>
                <input
                  value={handle}
                  onChange={(e) => setHandle(e.target.value.toLowerCase())}
                  className="w-full rounded-xl px-2 py-2.5 text-sm outline-none"
                  placeholder="yourname"
                />
              </div>
            </Field>
            <Field label="Display name">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border border-neutral-300 px-3 py-2.5 text-sm outline-none focus:border-pink-500"
                placeholder="Jordan Rivera"
              />
            </Field>
            <Field label="Follower count">
              <input
                type="number"
                min={0}
                value={followerCount}
                onChange={(e) => setFollowerCount(Number(e.target.value))}
                className="w-full rounded-xl border border-neutral-300 px-3 py-2.5 text-sm outline-none focus:border-pink-500"
              />
            </Field>
            <Field label="Avatar URL">
              <input
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                className="w-full rounded-xl border border-neutral-300 px-3 py-2.5 text-sm outline-none focus:border-pink-500"
                placeholder="https://…"
              />
            </Field>
            <Field label="Bio line" className="sm:col-span-2">
              <textarea
                value={bioLine}
                onChange={(e) => setBioLine(e.target.value)}
                rows={2}
                maxLength={140}
                className="w-full resize-none rounded-xl border border-neutral-300 px-3 py-2.5 text-sm outline-none focus:border-pink-500"
                placeholder="Fitness coach helping busy parents get strong in 20 min/day."
              />
            </Field>
          </div>
        </section>

        {/* links */}
        <section className="rounded-2xl border border-neutral-200 bg-white p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-neutral-900">
              Links <span className="font-normal text-neutral-400">({links.length}/{MAX_LINKS})</span>
            </h2>
            <button
              onClick={addLink}
              disabled={links.length >= MAX_LINKS}
              className="flex items-center gap-1 rounded-lg bg-neutral-900 px-3 py-1.5 text-xs font-medium text-white disabled:opacity-40"
            >
              <Plus className="h-3.5 w-3.5" /> Add link
            </button>
          </div>

          <div className="space-y-3">
            {links.map((link, i) => (
              <div key={link.tempId} className="rounded-xl border border-neutral-200 p-4">
                <div className="mb-3 flex items-center gap-2">
                  <select
                    value={link.type}
                    onChange={(e) => updateLink(link.tempId, { type: e.target.value as LinkType })}
                    className="rounded-lg border border-neutral-300 px-2 py-1.5 text-xs capitalize outline-none"
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
                    className="rounded-lg border border-neutral-300 px-2 py-1.5 text-xs capitalize outline-none"
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
                    className="rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-pink-500"
                  />
                  <input
                    value={link.sub_label}
                    onChange={(e) => updateLink(link.tempId, { sub_label: e.target.value })}
                    placeholder="Sub-label (optional)"
                    className="rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-pink-500"
                  />
                  <input
                    value={link.url}
                    onChange={(e) => updateLink(link.tempId, { url: e.target.value })}
                    placeholder="https://…"
                    className="rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-pink-500 sm:col-span-2"
                  />
                </div>
              </div>
            ))}
            {links.length === 0 && (
              <p className="text-sm text-neutral-400">No links yet — add up to {MAX_LINKS}.</p>
            )}
          </div>
        </section>

        {/* publish */}
        <section className="rounded-2xl border border-neutral-200 bg-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-neutral-900">Publish</h2>
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
            className="rounded-xl bg-gradient-to-tr from-amber-400 via-pink-500 to-purple-600 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
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
