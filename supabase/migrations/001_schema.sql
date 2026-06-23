-- ============================================================
-- Spa and Co — Schéma de base de données
-- ============================================================

-- Extensions
create extension if not exists "uuid-ossp";

-- ─── Établissements ───────────────────────────────────────

create table if not exists public.establishments (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  city       text not null,
  address    text,
  phone      text,
  status     text not null default 'actif',
  created_at timestamptz not null default now()
);

-- ─── Clients ──────────────────────────────────────────────

create table if not exists public.clients (
  id            uuid primary key default gen_random_uuid(),
  first_name    text not null,
  last_name     text not null,
  email         text unique,
  phone         text,
  loyalty_points int  not null default 0,
  is_vip        boolean not null default false,
  last_visit    date,
  total_spent   numeric not null default 0,
  visits_count  int  not null default 0,
  join_date     date not null default current_date,
  created_at    timestamptz not null default now()
);

-- ─── Personnel ────────────────────────────────────────────

create table if not exists public.staff (
  id         uuid primary key default gen_random_uuid(),
  first_name text not null,
  last_name  text not null,
  email      text unique,
  role       text not null,
  specialty  text,
  salary     numeric,
  status     text not null default 'active',
  rating     numeric,
  spa_id     uuid references public.establishments(id) on delete set null,
  created_at timestamptz not null default now()
);

-- ─── Prestations ──────────────────────────────────────────

create table if not exists public.services (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  category    text,
  description text,
  duration    int,
  price       numeric,
  active      boolean not null default true,
  created_at  timestamptz not null default now()
);

-- ─── Rendez-vous ──────────────────────────────────────────

create table if not exists public.appointments (
  id           uuid primary key default gen_random_uuid(),
  client_id    uuid references public.clients(id) on delete set null,
  staff_id     uuid references public.staff(id) on delete set null,
  service_id   uuid references public.services(id) on delete set null,
  client_name  text,
  staff_name   text,
  service_name text,
  date         date not null,
  time         text,
  duration     int,
  price        numeric,
  status       text not null default 'pending',
  day          int,
  spa_id       uuid references public.establishments(id) on delete set null,
  created_at   timestamptz not null default now()
);

-- ─── Stocks ───────────────────────────────────────────────

create table if not exists public.inventory (
  id           uuid primary key default gen_random_uuid(),
  name         text not null,
  category     text,
  quantity     int  not null default 0,
  unit         text,
  min_quantity int  not null default 5,
  supplier     text,
  unit_price   numeric,
  spa_id       uuid references public.establishments(id) on delete set null,
  created_at   timestamptz not null default now()
);

-- ─── Fournisseurs ─────────────────────────────────────────

create table if not exists public.suppliers (
  id             uuid primary key default gen_random_uuid(),
  name           text not null,
  category       text,
  contact        text,
  phone          text,
  email          text,
  monthly_spend  numeric not null default 0,
  last_order     date,
  status         text not null default 'actif',
  pending_orders int  not null default 0,
  spa_id         uuid references public.establishments(id) on delete set null,
  created_at     timestamptz not null default now()
);

-- ─── Caisse ───────────────────────────────────────────────

create table if not exists public.cash_transactions (
  id             uuid primary key default gen_random_uuid(),
  date           date not null default current_date,
  label          text,
  category       text,
  amount         numeric not null,
  type           text not null, -- 'recette' | 'charge'
  payment_method text,
  spa_id         uuid references public.establishments(id) on delete set null,
  created_at     timestamptz not null default now()
);

-- ─── Plans d'abonnement ───────────────────────────────────

create table if not exists public.membership_plans (
  id        uuid primary key default gen_random_uuid(),
  name      text not null,
  price     numeric not null,
  remise    int  not null default 0,
  color     text,
  avantages text[] not null default '{}',
  created_at timestamptz not null default now()
);

-- ─── Abonnements ──────────────────────────────────────────

create table if not exists public.memberships (
  id            uuid primary key default gen_random_uuid(),
  client_id     uuid references public.clients(id) on delete set null,
  plan_id       uuid references public.membership_plans(id) on delete set null,
  client_name   text,
  plan_name     text,
  since         date,
  next_billing  date,
  status        text not null default 'actif',
  soins_restants text,
  created_at    timestamptz not null default now()
);

-- ─── Campagnes marketing ──────────────────────────────────

create table if not exists public.campaigns (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  type       text not null, -- 'SMS' | 'Email' | 'Promo'
  target     text,
  status     text not null default 'brouillon',
  sent       int  not null default 0,
  opened     int  not null default 0,
  date       date,
  created_at timestamptz not null default now()
);

-- ============================================================
-- Row Level Security (RLS)
-- ============================================================

alter table public.establishments    enable row level security;
alter table public.clients           enable row level security;
alter table public.staff             enable row level security;
alter table public.services          enable row level security;
alter table public.appointments      enable row level security;
alter table public.inventory         enable row level security;
alter table public.suppliers         enable row level security;
alter table public.cash_transactions enable row level security;
alter table public.membership_plans  enable row level security;
alter table public.memberships       enable row level security;
alter table public.campaigns         enable row level security;

create policy "auth_all" on public.establishments    for all using (auth.role() = 'authenticated');
create policy "auth_all" on public.clients           for all using (auth.role() = 'authenticated');
create policy "auth_all" on public.staff             for all using (auth.role() = 'authenticated');
create policy "auth_all" on public.services          for all using (auth.role() = 'authenticated');
create policy "auth_all" on public.appointments      for all using (auth.role() = 'authenticated');
create policy "auth_all" on public.inventory         for all using (auth.role() = 'authenticated');
create policy "auth_all" on public.suppliers         for all using (auth.role() = 'authenticated');
create policy "auth_all" on public.cash_transactions for all using (auth.role() = 'authenticated');
create policy "auth_all" on public.membership_plans  for all using (auth.role() = 'authenticated');
create policy "auth_all" on public.memberships       for all using (auth.role() = 'authenticated');
create policy "auth_all" on public.campaigns         for all using (auth.role() = 'authenticated');
