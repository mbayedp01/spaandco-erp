-- ============================================================
--  Ajout : paiement réparti sur plusieurs modes pour une même
--  transaction (ex: 20 000 F = 15 000 Wave + 5 000 Cash).
--  payment_method reste le résumé ("Mixte" si plusieurs modes),
--  payment_splits porte le détail : [{method, amount}, ...]
-- ============================================================

alter table public.cash_transactions
  add column if not exists payment_splits jsonb;
