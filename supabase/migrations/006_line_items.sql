-- ============================================================
--  Détail des prestations avec praticien(s) par ligne.
--  Stocke chaque prestation individuellement pour que le reçu
--  puisse afficher quel thérapeute a réalisé quelle prestation.
--  Format : [{ name, price, qty, performers }]
-- ============================================================

alter table public.cash_transactions
  add column if not exists line_items jsonb;
