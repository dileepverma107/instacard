# InstaCard

The link-in-bio page built for Instagram's in-app browser. See
[`instacard-product-documentation.md`](instacard-product-documentation.md) for the full product spec —
this is the v1 (MVP) build: manual profile builder, one template, public card page, and basic
click analytics.

## Stack

- **Next.js 16** (App Router, TypeScript, Tailwind CSS v4)
- **Supabase** (Postgres + Auth) via `@supabase/ssr`
- **Recharts** for the analytics chart, **lucide-react** for icons

## 1. Create a Supabase project

1. Create a free project at [supabase.com](https://supabase.com).
2. In the SQL editor, run [`supabase/schema.sql`](supabase/schema.sql) — it creates the
   `creators`, `links`, `click_events`, and `subscriptions` tables plus row-level-security
   policies (owners can manage their own data; published cards and their links are publicly
   readable so `/[handle]` and `/r/[linkId]` work for anonymous visitors).
3. In **Authentication → URL Configuration**, add `http://localhost:3000/auth/callback` (and
   your production domain's `/auth/callback`) to the redirect allow-list. Email/magic-link auth
   is enabled by default.
4. Copy the **Project URL** and **anon public key** from Project Settings → API.

## 2. Configure environment variables

```bash
cp .env.local.example .env.local
```

Fill in `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

## 3. Run it

```bash
npm install
npm run dev
```

Visit `http://localhost:3000`, sign in with an email (a magic link is sent — Supabase's default
email provider works out of the box in dev), then build and publish your card from `/dashboard`.
Your published card is served at `/[handle]` (e.g. `/maya.shoots`) — that's the page you'd put
behind `instacard.in/@handle` once deployed.

## How it's organized

| Path | Purpose |
|---|---|
| `app/page.tsx` | Marketing landing page |
| `app/login` | Email magic-link sign-in |
| `app/auth/callback` | Exchanges the magic-link code for a session |
| `app/dashboard` | Authenticated profile + link editor with a live phone-frame preview, and basic analytics |
| `app/[handle]` | The public, server-rendered creator card (what visitors see) |
| `app/r/[linkId]` | Logs a `click_events` row, then redirects to the link's real URL |
| `components/CreatorCard.tsx` | The actual card UI — shared by the dashboard preview and the public page so they never drift apart |
| `lib/supabase/*` | Browser / server / middleware Supabase clients (`@supabase/ssr` pattern) |
| `supabase/schema.sql` | Full DB schema + RLS policies |

## Notes / what's intentionally not built (see roadmap in the product doc)

Custom domains, Instagram OAuth/AI-generated cards, payments (Razorpay), multiple templates, and
lead-capture forms are Phase 2+ and out of scope for this v1 build.

## Deploying

Push to a GitHub repo and import it into [Vercel](https://vercel.com) — it's a stock Next.js app,
no special config needed. Set the same two `NEXT_PUBLIC_SUPABASE_*` env vars in the Vercel
project settings, and add your production URL's `/auth/callback` to Supabase's redirect
allow-list.
