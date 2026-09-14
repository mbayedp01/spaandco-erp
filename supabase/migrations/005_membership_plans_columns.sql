-- ============================================================
--  membership_plans n'avait que id/name/price/remise/color/
--  avantages/created_at — les colonnes ci-dessous sont utilisées
--  par le formulaire de création de plan mais n'ont jamais été
--  migrées, ce qui faisait échouer l'insert ("column does not
--  exist") et plantait la page (crash "Application error").
-- ============================================================

alter table public.membership_plans
  add column if not exists spa_id            uuid references public.establishments(id) on delete set null,
  add column if not exists active             boolean not null default true,
  add column if not exists description        text,
  add column if not exists duration_days      int,
  add column if not exists sessions_count     int,
  add column if not exists payment_frequency  text,
  add column if not exists services           text[] not null default '{}',
  add column if not exists conditions         text;
