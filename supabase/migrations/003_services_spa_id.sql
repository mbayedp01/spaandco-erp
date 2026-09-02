-- ============================================================
--  Ajout : isolation des prestations par établissement
--  La table services n'avait pas de spa_id — toutes les
--  prestations étaient partagées entre tous les spas.
-- ============================================================

alter table public.services
  add column if not exists spa_id uuid references public.establishments(id) on delete set null;
