-- ============================================================
--  Ajout : praticien(s) ayant réalisé la prestation en caisse
--  Permet d'attribuer une transaction (recette) à un ou plusieurs
--  praticiens, modifiable avant ou après la séance.
-- ============================================================

alter table public.cash_transactions
  add column if not exists performed_by text[] not null default '{}';
