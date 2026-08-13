# InstaCard — product documentation

**Tagline:** The portfolio that feels like an extension of your Instagram profile.

**Version:** v0.1 (planning draft)
**Owner:** [your name]
**Status:** Pre-build, ready for architecture sign-off

---

## 1. Problem and opportunity

Creators put one link in their Instagram bio. Everything — brand deals, YouTube, shop, contact — gets crammed behind that single link. The dominant tools (Linktree, Beacons, Stan Store) solve this with a generic "list of links" page that looks the same for a fashion creator, a coder, and a chef.

The opportunity: Instagram's in-app browser is where 90%+ of that traffic actually lands, on a phone, inside Instagram's own chrome. Nobody has designed specifically for that container. A page that visually continues the Instagram experience — rather than dropping the visitor onto a generic website — should convert better for the two things creators actually get paid for: brand inquiries and product sales.

**Important constraint to design around:** Instagram's in-app browser is a WebView Instagram itself controls. InstaCard cannot inject a native popup into Instagram's own UI — it can only make its own page *feel* like a continuation of that UI. This is a design constraint, not a technical trick, and the product positioning should never claim otherwise.

## 2. Target user

**Primary:** Micro and mid-tier Instagram creators (10K–500K followers) — photographers, fitness coaches, meme pages, educators, small brand founders — who currently use a bio-link tool and want something that looks less templated and converts brand deals better.

**Secondary (later):** Small local businesses using Instagram as their primary storefront (salons, cafes, tutors) who want a single link for booking/menu/contact.

## 3. Differentiation

| | Linktree / Beacons | InstaCard |
|---|---|---|
| Design language | Generic web page | Mimics Instagram's in-app browser chrome and interaction patterns |
| Setup | Manual link-by-link | Instagram handle in → AI drafts the whole card |
| Positioning | "Link in bio" | "Instagram-first creator portfolio" |
| Primary metric sold to creators | Clicks | Brand inquiries and conversions |

Do not compete on the "link in bio" category name — that's Linktree's territory and a losing SEO fight for a solo builder. Compete on "creator portfolio that looks native to Instagram."

## 4. MVP scope

**In scope for v1 (build this first):**
- Creator signup (email or Instagram OAuth)
- Manual profile builder: avatar, name, follower count, bio line, up to 6 link blocks (icon, label, sub-label, URL)
- One polished template, mobile-only, styled like the in-app browser mockup already reviewed
- Public page at `instacard.in/@handle`
- Basic click analytics (per-link click count)
- Free tier with InstaCard branding footer

**Explicitly out of scope for v1** (build later, listed in roadmap):
- AI-generated portfolio from Instagram username
- Custom domains
- Multiple templates
- Payment/checkout inside the card
- Lead capture forms
- Team/agency accounts managing multiple creators

Keeping v1 this narrow means it can be built and shipped by one developer in weeks, not months, and validates the core bet — does an Instagram-native design actually convert better — before spending effort on AI generation or billing.

## 5. Premium tier (₹299/year)

- Remove InstaCard branding
- Custom domain (creator's own `.in`/`.com`, or a `name.instacard.in` subdomain)
- Instagram-style entrance animation and transitions
- Full analytics (unique visitors, click-through by link, referrer)
- WhatsApp/email lead-capture CTA
- Multiple templates
- "Brand collaboration" dedicated block (rate card, past collabs, contact form)

Monetization is a straightforward annual subscription, no usage-based pricing — creators want predictable cost, and metered pricing adds billing complexity not worth it at this scale.

## 6. User flows

**Creator onboarding (v1, manual):**
1. Sign up with email
2. Enter name, handle, avatar, follower count, bio line
3. Add up to 6 link blocks, each with a title, one-line description, icon, and destination URL
4. Preview on a simulated phone frame (exactly like the demo you already saw)
5. Publish → gets `instacard.in/@handle`
6. Copies link into Instagram bio

**Visitor flow:**
1. Sees creator's Instagram bio, taps the InstaCard link
2. Instagram opens its in-app browser, loads the InstaCard page
3. Page renders the profile card, visitor taps a link block
4. Either navigates within the WebView (external link, opens in same WebView) or triggers an action (WhatsApp deep link, mailto)
5. Click event logged against that link for the creator's analytics

## 7. System architecture

```
Instagram bio link
        |
        v
InstaCard page  (Next.js, edge-rendered)
        |
        v
API layer  (auth, links, events)
     /        \
    v          v
Database    Instagram API
(creators,  (profile + stats
 links,      fetch, v2 only)
 plans)
```

**Frontend — creator's public page**
Server-rendered (not client-heavy SPA) so the page loads fast inside Instagram's WebView on 4G. Next.js on Vercel edge functions is the right fit: near-instant cold start, automatic CDN caching per creator page, and it scales to zero cost when a creator has no traffic.

**Frontend — creator dashboard**
Separate authenticated app (can live in the same Next.js project under `/dashboard`) where creators edit their card, see analytics, manage billing.

**Backend / API layer**
A thin API layer (can be Next.js API routes or a separate small Node/Express service) handling: auth (magic link or Instagram OAuth), CRUD for creator profile and links, click-event ingestion, and — in v2 — calls out to Instagram's Graph API to pull profile stats, and to a payment gateway for subscriptions.

**Database**
Postgres (Supabase or Neon — both have generous free tiers and handle auth out of the box, reducing what you build yourself). Core tables: `creators`, `links`, `click_events`, `subscriptions`.

**Analytics**
For v1, a simple `click_events` table is enough (creator_id, link_id, timestamp, referrer). No need for a dedicated analytics pipeline until volume actually demands it — premature infrastructure is the most common reason solo-builder projects stall.

**Hosting cost at this scale:** Vercel free/hobby tier + Supabase free tier comfortably covers the first several hundred creators. Real cost only shows up past a few thousand active creators, well after ₹299/year revenue justifies it.

## 8. Data model (core entities)

- **creator** — id, handle, name, avatar_url, follower_count, bio_line, plan (free/premium), created_at
- **link** — id, creator_id, type (portfolio/brand/product/social/contact/custom), label, sub_label, icon, url, sort_order, is_featured
- **click_event** — id, link_id, creator_id, timestamp, referrer, user_agent
- **subscription** — id, creator_id, status, renews_at, payment_provider_ref

This is intentionally small. Resist adding tables (tags, teams, media library) until a real feature needs them.

## 9. Tech stack recommendation

| Layer | Choice | Why |
|---|---|---|
| Frontend + API | Next.js (App Router) | One codebase for public pages, dashboard, and API routes |
| Hosting | Vercel | Edge rendering, generous free tier, zero-ops deploys |
| Database + auth | Supabase (Postgres) | Auth, database, and storage in one free-tier service |
| Payments | Razorpay | Built for Indian creators, handles UPI/cards/subscriptions |
| Analytics | Custom `click_events` table + a simple dashboard chart | Avoids a third-party analytics bill at this stage |
| Domain/DNS (premium) | Cloudflare for custom domain routing | Free tier handles per-creator custom domains via CNAME |

## 10. Legal and platform-risk notes

- Do not claim InstaCard can inject UI into Instagram's native interface — it cannot, and marketing copy should be precise about this (see section 1).
- If pulling follower/engagement stats automatically (v2 AI-generation feature), use Instagram's official Graph API with the creator's own consent/login — do not scrape public profile pages. Scraping violates Instagram's terms and is a real account-suspension risk for creators who connect their handle.
- Standard consumer SaaS terms apply: privacy policy (what click/analytics data is stored), terms of service, and a clear data-deletion path for a creator who cancels.

## 11. Roadmap

**Phase 1 — MVP (validate the core bet)**
Manual profile builder, one template, free tier, basic analytics. Goal: 50–100 creators using it, see if in-app-browser-native design actually lifts click-through vs. their old Linktree.

**Phase 2 — Monetize**
Premium tier via Razorpay, branding removal, custom domain, second template, WhatsApp/email lead capture.

**Phase 3 — AI-assisted onboarding**
Instagram OAuth connection → auto-pull bio, recent posts, follower count via Graph API → AI drafts the card, creator edits and publishes. This is the biggest lift in signup conversion but depends on Phase 1 proving the core page actually works.

**Phase 4 — Scale features**
Multiple templates, agency/team accounts for managing several creators, deeper analytics (unique visitors, geographic split, A/B testing link order).

## 12. Success metrics

- **Activation:** % of signups who publish a live card within 24 hours
- **Retention:** % of creators still active (edited or checked analytics) at 30/90 days
- **Core hypothesis metric:** click-through rate on the InstaCard page vs. the creator's previous bio-link tool, self-reported or measured pre/post switch
- **Monetization:** free-to-premium conversion rate, target realistic v1 goal 3–5%

---

*Next step: lock the data model and Phase 1 feature list, then start with the Next.js project scaffold, Supabase schema, and the public creator-page template using the mockup already built as the visual reference.*
