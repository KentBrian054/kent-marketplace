-- Run in a dedicated Marketplace project.
begin;
create table public.listings (
  id uuid primary key default gen_random_uuid(),
  title varchar(255) not null check (length(trim(title)) > 0),
  description text check (length(description) <= 2000),
  price decimal(10,2) not null check (price >= 0),
  category varchar(100) not null,
  seller_email varchar(255) not null,
  image_url text,
  location varchar(255) default 'Palo Alto, CA',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table public.messages (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings(id) on delete cascade,
  buyer_email varchar(255) not null,
  seller_email varchar(255) not null,
  message text not null check(length(trim(message)) between 1 and 1000),
  created_at timestamptz not null default now()
);
create index on public.listings (category);
create index on public.listings (created_at desc);
create index on public.messages (listing_id);
alter table public.listings enable row level security;
alter table public.messages enable row level security;
revoke all on public.listings, public.messages from public, anon, authenticated;
grant select, insert on public.listings, public.messages to service_role;
create function public.marketplace_set_updated_at() returns trigger
language plpgsql set search_path = '' as $$
begin new.updated_at = now(); return new; end; $$;
create trigger marketplace_updated_at before update on public.listings
for each row execute function public.marketplace_set_updated_at();
insert into storage.buckets (id,name,public,file_size_limit,allowed_mime_types)
values ('listing-images','listing-images',true,4194304,array['image/jpeg','image/png','image/webp']);
commit;
