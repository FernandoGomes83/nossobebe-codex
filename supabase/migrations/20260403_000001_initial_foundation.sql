create extension if not exists pgcrypto;

create type public.order_status as enum (
  'draft',
  'checkout_pending',
  'payment_pending',
  'paid',
  'in_production',
  'ready',
  'delivered',
  'expired',
  'refunded',
  'cancelled'
);

create type public.checkout_provider as enum ('mercado_pago');
create type public.checkout_status as enum ('created', 'pending', 'approved', 'failed', 'cancelled', 'expired');
create type public.payment_status as enum ('pending', 'approved', 'failed', 'refunded', 'chargeback');
create type public.product_kind as enum ('pack', 'song', 'art', 'world', 'name_meaning', 'guide');
create type public.upload_status as enum ('pending', 'processed', 'deleted', 'rejected');
create type public.deliverable_kind as enum ('song_mp3', 'song_video', 'art_image', 'world_poster', 'name_art', 'guide_pdf', 'zip_bundle');
create type public.actor_type as enum ('system', 'admin', 'customer', 'webhook');
create type public.job_status as enum ('pending', 'processing', 'sent', 'failed', 'cancelled');

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create table public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  created_at timestamptz not null default timezone('utc', now())
);

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.admin_users
    where user_id = auth.uid()
  );
$$;

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  public_token uuid not null unique default gen_random_uuid(),
  customer_email_ciphertext text not null,
  customer_email_hash text not null,
  baby_name text not null,
  birth_date date not null,
  birth_time time,
  birth_city text not null,
  birth_weight_text text,
  parent_names text,
  music_style text,
  music_tone text,
  special_words text,
  art_style text,
  status public.order_status not null default 'draft',
  total_amount_cents integer not null default 0,
  currency text not null default 'BRL',
  promised_delivery_at timestamptz,
  paid_at timestamptz,
  production_started_at timestamptz,
  ready_at timestamptz,
  delivered_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint orders_total_amount_non_negative check (total_amount_cents >= 0),
  constraint orders_customer_email_hash_non_empty check (length(customer_email_hash) > 0),
  constraint orders_baby_name_non_empty check (length(trim(baby_name)) > 0),
  constraint orders_birth_city_non_empty check (length(trim(birth_city)) > 0)
);

create index orders_status_idx on public.orders (status, created_at desc);
create index orders_customer_email_hash_idx on public.orders (customer_email_hash);
create index orders_public_token_idx on public.orders (public_token);

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_kind public.product_kind not null,
  quantity integer not null default 1,
  unit_price_cents integer not null,
  total_price_cents integer not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  constraint order_items_quantity_positive check (quantity > 0),
  constraint order_items_prices_non_negative check (
    unit_price_cents >= 0
    and total_price_cents >= 0
  )
);

create index order_items_order_id_idx on public.order_items (order_id);

create table public.checkout_sessions (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  provider public.checkout_provider not null,
  status public.checkout_status not null default 'created',
  external_reference text not null unique,
  provider_checkout_id text,
  provider_init_point text,
  amount_cents integer not null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint checkout_sessions_amount_non_negative check (amount_cents >= 0)
);

create index checkout_sessions_order_id_idx on public.checkout_sessions (order_id);
create index checkout_sessions_status_idx on public.checkout_sessions (status);

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  checkout_session_id uuid references public.checkout_sessions(id) on delete set null,
  provider public.checkout_provider not null,
  provider_payment_id text not null unique,
  status public.payment_status not null,
  amount_cents integer not null,
  paid_at timestamptz,
  raw_payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint payments_amount_non_negative check (amount_cents >= 0)
);

create index payments_order_id_idx on public.payments (order_id);
create index payments_status_idx on public.payments (status);

create table public.webhook_events (
  id uuid primary key default gen_random_uuid(),
  provider public.checkout_provider not null,
  event_type text not null,
  idempotency_key text not null unique,
  payload jsonb not null,
  processed_at timestamptz,
  created_at timestamptz not null default timezone('utc', now())
);

create index webhook_events_provider_idx on public.webhook_events (provider, created_at desc);

create table public.uploads (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references public.orders(id) on delete set null,
  bucket_name text not null,
  storage_path text not null unique,
  original_filename text not null,
  mime_type text not null,
  size_bytes bigint not null,
  sha256 text not null,
  status public.upload_status not null default 'pending',
  delete_after timestamptz,
  processed_at timestamptz,
  deleted_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint uploads_size_positive check (size_bytes > 0)
);

create index uploads_order_id_idx on public.uploads (order_id);
create index uploads_status_idx on public.uploads (status);

create table public.deliverables (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  kind public.deliverable_kind not null,
  bucket_name text not null,
  storage_path text not null unique,
  mime_type text not null,
  size_bytes bigint not null,
  published_at timestamptz,
  expires_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint deliverables_size_positive check (size_bytes > 0)
);

create index deliverables_order_id_idx on public.deliverables (order_id);
create index deliverables_kind_idx on public.deliverables (kind);

create table public.order_status_events (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  from_status public.order_status,
  to_status public.order_status not null,
  actor_type public.actor_type not null,
  actor_user_id uuid,
  note text,
  created_at timestamptz not null default timezone('utc', now())
);

create index order_status_events_order_id_idx on public.order_status_events (order_id, created_at desc);

create table public.drip_subscriptions (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  email_hash text not null,
  consented_at timestamptz,
  unsubscribed_at timestamptz,
  unsubscribe_token uuid not null unique default gen_random_uuid(),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index drip_subscriptions_order_id_idx on public.drip_subscriptions (order_id);
create index drip_subscriptions_email_hash_idx on public.drip_subscriptions (email_hash);

create table public.drip_jobs (
  id uuid primary key default gen_random_uuid(),
  subscription_id uuid not null references public.drip_subscriptions(id) on delete cascade,
  template_key text not null,
  scheduled_for timestamptz not null,
  status public.job_status not null default 'pending',
  attempts integer not null default 0,
  payload jsonb not null default '{}'::jsonb,
  last_error text,
  sent_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index drip_jobs_status_idx on public.drip_jobs (status, scheduled_for);

create trigger set_admin_users_updated_at
before update on public.orders
for each row execute function public.set_updated_at();

create trigger set_checkout_sessions_updated_at
before update on public.checkout_sessions
for each row execute function public.set_updated_at();

create trigger set_payments_updated_at
before update on public.payments
for each row execute function public.set_updated_at();

create trigger set_uploads_updated_at
before update on public.uploads
for each row execute function public.set_updated_at();

create trigger set_deliverables_updated_at
before update on public.deliverables
for each row execute function public.set_updated_at();

create trigger set_drip_subscriptions_updated_at
before update on public.drip_subscriptions
for each row execute function public.set_updated_at();

create trigger set_drip_jobs_updated_at
before update on public.drip_jobs
for each row execute function public.set_updated_at();

alter table public.admin_users enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.checkout_sessions enable row level security;
alter table public.payments enable row level security;
alter table public.webhook_events enable row level security;
alter table public.uploads enable row level security;
alter table public.deliverables enable row level security;
alter table public.order_status_events enable row level security;
alter table public.drip_subscriptions enable row level security;
alter table public.drip_jobs enable row level security;

create policy "admin users can read own row"
on public.admin_users
for select
to authenticated
using (user_id = auth.uid());

create policy "admins can manage admin_users"
on public.admin_users
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "admins can manage orders"
on public.orders
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "admins can manage order_items"
on public.order_items
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "admins can manage checkout_sessions"
on public.checkout_sessions
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "admins can manage payments"
on public.payments
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "admins can manage webhook_events"
on public.webhook_events
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "admins can manage uploads"
on public.uploads
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "admins can manage deliverables"
on public.deliverables
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "admins can manage order_status_events"
on public.order_status_events
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "admins can manage drip_subscriptions"
on public.drip_subscriptions
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "admins can manage drip_jobs"
on public.drip_jobs
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  (
    'baby-uploads',
    'baby-uploads',
    false,
    10485760,
    array['image/jpeg', 'image/png', 'image/heic', 'image/heif']
  ),
  (
    'deliverables',
    'deliverables',
    false,
    52428800,
    array['audio/mpeg', 'video/mp4', 'image/png', 'application/pdf', 'application/zip']
  )
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy "admins can manage storage objects"
on storage.objects
for all
to authenticated
using (
  bucket_id in ('baby-uploads', 'deliverables')
  and public.is_admin()
)
with check (
  bucket_id in ('baby-uploads', 'deliverables')
  and public.is_admin()
);
