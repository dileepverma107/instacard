-- InstaCard v1 schema
-- Run this in the Supabase SQL editor (or `supabase db push`) on a fresh project.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- creators
-- ---------------------------------------------------------------------------
create table if not exists creators (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references auth.users (id) on delete cascade,
  handle          text not null unique check (handle ~ '^[a-z0-9_.]{2,30}$'),
  name            text not null default '',
  avatar_url      text,
  follower_count  bigint not null default 0,
  bio_line        text not null default '',
  plan            text not null default 'free' check (plan in ('free', 'premium')),
  template        text not null default 'aurora' check (template in ('aurora', 'paper', 'neon')),
  accent_color    text not null default 'sunset' check (accent_color in (
                    'sunset', 'ocean', 'berry', 'forest', 'gold', 'mono'
                  )),
  creator_type    text not null default 'general' check (creator_type in (
                    'general', 'fashion_beauty', 'fitness_health', 'music_audio',
                    'education_coaching', 'business_local', 'gaming_streaming',
                    'food_culinary', 'photography_art'
                  )),
  is_published    boolean not null default false,
  lead_capture_enabled     boolean not null default false,
  lead_capture_heading     text not null default 'Get updates from me',
  lead_capture_button_text text not null default 'Subscribe',
  media_kit_enabled boolean not null default false,
  media_kit_heading text not null default 'Work with me',
  rate_card         jsonb not null default '[]'::jsonb,
  past_collabs      jsonb not null default '[]'::jsonb,
  gallery_enabled   boolean not null default false,
  gallery_heading   text not null default 'My work',
  gallery_images    jsonb not null default '[]'::jsonb,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists creators_user_id_idx on creators (user_id);

-- ---------------------------------------------------------------------------
-- links
-- ---------------------------------------------------------------------------
create table if not exists links (
  id           uuid primary key default gen_random_uuid(),
  creator_id   uuid not null references creators (id) on delete cascade,
  type         text not null default 'custom'
               check (type in ('portfolio', 'brand', 'product', 'social', 'contact', 'custom')),
  label        text not null default '',
  sub_label    text not null default '',
  icon         text not null default 'link',
  url          text not null default '',
  sub_links    jsonb not null default '[]'::jsonb,
  sort_order   int not null default 0,
  is_featured  boolean not null default false,
  starts_at    timestamptz,
  ends_at      timestamptz,
  created_at   timestamptz not null default now()
);

create index if not exists links_creator_id_idx on links (creator_id, sort_order);

-- ---------------------------------------------------------------------------
-- click_events
-- ---------------------------------------------------------------------------
create table if not exists click_events (
  id          uuid primary key default gen_random_uuid(),
  link_id     uuid not null references links (id) on delete cascade,
  creator_id  uuid not null references creators (id) on delete cascade,
  "timestamp" timestamptz not null default now(),
  referrer    text,
  user_agent  text
);

create index if not exists click_events_creator_id_idx on click_events (creator_id, "timestamp");
create index if not exists click_events_link_id_idx on click_events (link_id);

-- ---------------------------------------------------------------------------
-- page_views (public card loads — pairs with click_events for click-through rate)
-- ---------------------------------------------------------------------------
create table if not exists page_views (
  id          uuid primary key default gen_random_uuid(),
  creator_id  uuid not null references creators (id) on delete cascade,
  "timestamp" timestamptz not null default now(),
  referrer    text,
  user_agent  text
);

create index if not exists page_views_creator_id_idx on page_views (creator_id, "timestamp");

-- ---------------------------------------------------------------------------
-- subscriptions (premium tier, Phase 2)
-- ---------------------------------------------------------------------------
create table if not exists subscriptions (
  id                    uuid primary key default gen_random_uuid(),
  creator_id            uuid not null references creators (id) on delete cascade,
  status                text not null default 'inactive'
                        check (status in ('inactive', 'active', 'past_due', 'cancelled')),
  renews_at             timestamptz,
  payment_provider_ref  text,
  created_at            timestamptz not null default now()
);

create index if not exists subscriptions_creator_id_idx on subscriptions (creator_id);

-- ---------------------------------------------------------------------------
-- leads (lead-capture block submissions)
-- ---------------------------------------------------------------------------
create table if not exists leads (
  id          uuid primary key default gen_random_uuid(),
  creator_id  uuid not null references creators (id) on delete cascade,
  name        text,
  contact     text not null,
  created_at  timestamptz not null default now()
);

create index if not exists leads_creator_id_idx on leads (creator_id, created_at);

-- ---------------------------------------------------------------------------
-- brand_inquiries (media kit "work with me" form submissions)
-- ---------------------------------------------------------------------------
create table if not exists brand_inquiries (
  id            uuid primary key default gen_random_uuid(),
  creator_id    uuid not null references creators (id) on delete cascade,
  company       text not null,
  contact_name  text,
  email         text not null,
  budget        text,
  message       text,
  created_at    timestamptz not null default now()
);

create index if not exists brand_inquiries_creator_id_idx on brand_inquiries (creator_id, created_at);

-- ---------------------------------------------------------------------------
-- updated_at trigger for creators
-- ---------------------------------------------------------------------------
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists creators_set_updated_at on creators;
create trigger creators_set_updated_at
  before update on creators
  for each row execute function set_updated_at();

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
alter table creators enable row level security;
alter table links enable row level security;
alter table click_events enable row level security;
alter table subscriptions enable row level security;
alter table leads enable row level security;
alter table brand_inquiries enable row level security;
alter table page_views enable row level security;

-- creators: owner has full access
drop policy if exists "creators_owner_all" on creators;
create policy "creators_owner_all" on creators
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- creators: anyone can read a published card (needed for the public /[handle] page)
drop policy if exists "creators_public_read_published" on creators;
create policy "creators_public_read_published" on creators
  for select using (is_published = true);

-- links: owner has full access via parent creator
drop policy if exists "links_owner_all" on links;
create policy "links_owner_all" on links
  for all using (
    exists (select 1 from creators c where c.id = links.creator_id and c.user_id = auth.uid())
  ) with check (
    exists (select 1 from creators c where c.id = links.creator_id and c.user_id = auth.uid())
  );

-- links: anyone can read links belonging to a published card
drop policy if exists "links_public_read_published" on links;
create policy "links_public_read_published" on links
  for select using (
    exists (select 1 from creators c where c.id = links.creator_id and c.is_published = true)
  );

-- click_events: anyone (including anon visitors) can insert a click against a published link
drop policy if exists "click_events_public_insert" on click_events;
create policy "click_events_public_insert" on click_events
  for insert with check (
    exists (select 1 from creators c where c.id = click_events.creator_id and c.is_published = true)
  );

-- click_events: only the owning creator can read their analytics
drop policy if exists "click_events_owner_read" on click_events;
create policy "click_events_owner_read" on click_events
  for select using (
    exists (select 1 from creators c where c.id = click_events.creator_id and c.user_id = auth.uid())
  );

-- page_views: anyone (including anon visitors) can insert a view against a published card
drop policy if exists "page_views_public_insert" on page_views;
create policy "page_views_public_insert" on page_views
  for insert with check (
    exists (select 1 from creators c where c.id = page_views.creator_id and c.is_published = true)
  );

-- page_views: only the owning creator can read their analytics
drop policy if exists "page_views_owner_read" on page_views;
create policy "page_views_owner_read" on page_views
  for select using (
    exists (select 1 from creators c where c.id = page_views.creator_id and c.user_id = auth.uid())
  );

-- subscriptions: owner only
drop policy if exists "subscriptions_owner_all" on subscriptions;
create policy "subscriptions_owner_all" on subscriptions
  for all using (
    exists (select 1 from creators c where c.id = subscriptions.creator_id and c.user_id = auth.uid())
  ) with check (
    exists (select 1 from creators c where c.id = subscriptions.creator_id and c.user_id = auth.uid())
  );

-- leads: anyone can submit a lead against a creator who has lead capture on
drop policy if exists "leads_public_insert" on leads;
create policy "leads_public_insert" on leads
  for insert with check (
    exists (
      select 1 from creators c
      where c.id = leads.creator_id
        and c.is_published = true
        and c.lead_capture_enabled = true
    )
  );

-- leads: only the owning creator can read or delete their leads
drop policy if exists "leads_owner_read" on leads;
create policy "leads_owner_read" on leads
  for select using (
    exists (select 1 from creators c where c.id = leads.creator_id and c.user_id = auth.uid())
  );

drop policy if exists "leads_owner_delete" on leads;
create policy "leads_owner_delete" on leads
  for delete using (
    exists (select 1 from creators c where c.id = leads.creator_id and c.user_id = auth.uid())
  );

-- brand_inquiries: anyone can submit against a creator who has media kit on
drop policy if exists "brand_inquiries_public_insert" on brand_inquiries;
create policy "brand_inquiries_public_insert" on brand_inquiries
  for insert with check (
    exists (
      select 1 from creators c
      where c.id = brand_inquiries.creator_id
        and c.is_published = true
        and c.media_kit_enabled = true
    )
  );

-- brand_inquiries: only the owning creator can read or delete their inquiries
drop policy if exists "brand_inquiries_owner_read" on brand_inquiries;
create policy "brand_inquiries_owner_read" on brand_inquiries
  for select using (
    exists (select 1 from creators c where c.id = brand_inquiries.creator_id and c.user_id = auth.uid())
  );

drop policy if exists "brand_inquiries_owner_delete" on brand_inquiries;
create policy "brand_inquiries_owner_delete" on brand_inquiries
  for delete using (
    exists (select 1 from creators c where c.id = brand_inquiries.creator_id and c.user_id = auth.uid())
  );

-- ---------------------------------------------------------------------------
-- avatars storage bucket (profile picture uploads)
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

-- files are stored as "<user_id>/avatar-<timestamp>.<ext>" — the folder name
-- (first path segment) doubles as the ownership check.
drop policy if exists "avatars_public_read" on storage.objects;
create policy "avatars_public_read" on storage.objects
  for select using (bucket_id = 'avatars');

drop policy if exists "avatars_owner_insert" on storage.objects;
create policy "avatars_owner_insert" on storage.objects
  for insert with check (
    bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "avatars_owner_update" on storage.objects;
create policy "avatars_owner_update" on storage.objects
  for update using (
    bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "avatars_owner_delete" on storage.objects;
create policy "avatars_owner_delete" on storage.objects
  for delete using (
    bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text
  );
