-- ============================================================
-- Spa and Co — Données de démarrage (seed)
-- Exécuter après 001_schema.sql
-- ============================================================

-- ─── Clients ──────────────────────────────────────────────
insert into public.clients (first_name, last_name, email, phone, loyalty_points, is_vip, last_visit, total_spent, visits_count, join_date) values
('Aïssatou', 'Diop',    'aissatou.diop@example.com',    '+221 77 111 22 33', 120, true,  '2026-06-15', 485000, 18, '2024-06-01'),
('Moussa',   'Fall',    'moussa.fall@example.com',      '+221 77 222 33 44', 40,  false, '2026-06-12', 125000, 6,  '2025-01-15'),
('Fatou',    'Ndiaye',  'fatou.ndiaye@example.com',     '+221 77 333 44 55', 0,   false, '2026-06-10', 36000,  2,  '2026-04-20'),
('Cheikh',   'Sarr',    'cheikh.sarr@example.com',      '+221 77 444 55 66', 210, true,  '2026-06-17', 720000, 24, '2023-11-10'),
('Mariama',  'Bâ',      'mariama.ba@example.com',       '+221 77 555 66 77', 65,  false, '2026-06-08', 210000, 9,  '2025-03-05'),
('Ousmane',  'Gueye',   'ousmane.gueye@example.com',    '+221 77 666 77 88', 90,  false, '2026-06-14', 290000, 12, '2024-09-20'),
('Rokhaya',  'Thiaw',   'rokhaya.thiaw@example.com',    '+221 77 123 45 67', 175, true,  '2026-06-18', 560000, 20, '2024-02-28'),
('Ibrahima', 'Cissé',   'ibrahima.cisse@example.com',   '+221 77 234 56 78', 30,  false, '2026-05-30', 90000,  4,  '2025-08-12'),
('Ndèye',    'Sall',    'ndeye.sall@example.com',       '+221 77 345 67 89', 55,  false, '2026-06-05', 175000, 7,  '2025-02-14'),
('Aminata',  'Traoré',  'aminata.traore@example.com',   '+221 77 456 78 90', 85,  false, '2026-06-11', 250000, 10, '2024-11-30'),
('Binta',    'Kane',    'binta.kane@example.com',       '+221 77 567 89 01', 15,  false, '2026-05-20', 45000,  3,  '2026-03-01'),
('Lamine',   'Diallo',  'lamine.diallo@example.com',    '+221 77 678 90 12', 140, true,  '2026-06-16', 420000, 15, '2024-04-15'),
('Khadija',  'Mbaye',   'khadija.mbaye@example.com',    '+221 77 789 01 23', 20,  false, '2026-06-02', 60000,  5,  '2026-01-10'),
('Mamadou',  'Sy',      'mamadou.sy@example.com',       '+221 77 890 12 34', 95,  false, '2026-06-09', 310000, 11, '2024-07-22'),
('Adja',     'Touré',   'adja.toure@example.com',       '+221 77 901 23 45', 200, true,  '2026-06-18', 650000, 22, '2023-08-05'),
('Serigne',  'Ndiaye',  'serigne.ndiaye@example.com',   '+221 77 012 34 56', 45,  false, '2026-05-25', 135000, 8,  '2025-05-18'),
('Coumba',   'Diop',    'coumba.diop@example.com',      '+221 77 123 45 68', 10,  false, '2026-04-30', 30000,  2,  '2026-04-01'),
('Modou',    'Fall',    'modou.fall@example.com',       '+221 77 234 56 79', 70,  false, '2026-06-13', 220000, 9,  '2025-01-20'),
('Bintou',   'Kouyaté', 'bintou.kouyate@example.com',   '+221 77 345 67 90', 155, true,  '2026-06-17', 490000, 17, '2024-03-12'),
('Khalil',   'Dieng',   'khalil.dieng@example.com',     '+221 77 456 78 91', 35,  false, '2026-06-07', 105000, 6,  '2025-06-08');

-- ─── Personnel ────────────────────────────────────────────
insert into public.staff (first_name, last_name, email, role, specialty, salary, status, rating) values
('Awa',      'Sow',    'awa.sow@spaandco.sn',    'Thérapeute',     'Massages corps & pierres',      280000, 'active',  4.9),
('Bineta',   'Kane',   'bineta.kane@spaandco.sn', 'Thérapeute',    'Soins visage & corps',          260000, 'active',  4.7),
('Rokhaya',  'Diallo', 'rokhaya.diallo@spaandco.sn','Esthéticienne','Beauté ongles & cils',         240000, 'active',  4.8),
('Ndèye',    'Mbaye',  'ndeye.mbaye@spaandco.sn',  'Réceptionniste','Accueil & planification',      180000, 'absent',  null),
('Ibrahima', 'Seck',   'ibrahima.seck@spaandco.sn','Manager',       'Direction générale',           450000, 'active',  null),
('Aminata',  'Cissé',  'aminata.cisse@spaandco.sn','Esthéticienne', 'Soins visage & peeling',       230000, 'conge',   4.6),
('Coumba',   'Ndiaye', 'coumba.ndiaye@spaandco.sn','Thérapeute',   'Massage bien-être & ayurvéda', 250000, 'active',  4.5),
('Fatima',   'Ly',     'fatima.ly@spaandco.sn',    'Réceptionniste','Caisse & facturation',         175000, 'active',  null);

-- ─── Prestations ──────────────────────────────────────────
insert into public.services (name, category, description, duration, price, active) values
('Massage suédois',           'Massages',    'Massage relaxant aux manœuvres longues et fluides pour détendre les muscles.',               60, 25000, true),
('Massage aux pierres chaudes','Massages',   'Pierres de basalte chauffées pour une détente musculaire profonde.',                          90, 35000, true),
('Massage profond',           'Massages',    'Travail des couches musculaires profondes pour les tensions chroniques.',                     75, 32000, true),
('Massage dos & nuque',       'Massages',    'Ciblé sur le dos, épaules et nuque, idéal en pause déjeuner.',                               30, 15000, true),
('Massage ayurvédique',       'Massages',    'Technique indienne aux huiles chaudes pour équilibrer corps et esprit.',                      90, 40000, true),
('Soin hydratant visage',     'Soins visage','Soin nourrissant avec masque et sérum pour une peau lumineuse.',                              45, 18000, true),
('Lifting visage',            'Soins visage','Soin raffermissant avec techniques de drainage et modelage.',                                 60, 30000, true),
('Soin anti-âge',             'Soins visage','Protocole complet anti-rides avec actifs premium.',                                           60, 38000, true),
('Peeling doux',              'Soins visage','Exfoliation douce pour révéler un teint éclatant.',                                           45, 22000, true),
('Gommage corps',             'Soins corps', 'Exfoliation au sel marin pour une peau douce et régénérée.',                                  50, 20000, true),
('Enveloppement aux algues',  'Soins corps', 'Enveloppement reminéralisant aux algues marines du Sénégal.',                                 60, 28000, true),
('Enveloppement chocolat',    'Soins corps', 'Soin antioxydant et hydratant au cacao pur.',                                                 60, 30000, true),
('Manucure soin',             'Beauté',      'Soin complet des mains avec pose de vernis semi-permanent.',                                  45, 12000, true),
('Pédicure soin',             'Beauté',      'Soin complet des pieds avec gommage et pose de vernis.',                                      50, 12000, true),
('Extension de cils',         'Beauté',      'Pose de cils volume russe pour un regard intense.',                                           90, 25000, false);

-- ─── Stocks ───────────────────────────────────────────────
insert into public.inventory (name, category, quantity, unit, min_quantity, supplier, unit_price) values
('Huile de massage argan',     'Huiles',          24, 'bouteille', 10, 'NaturaBio SN',   8500),
('Huile essentielle lavande',  'Huiles',           8, 'flacon',    10, 'NaturaBio SN',   6000),
('Huile de coco vierge',       'Huiles',          18, 'pot',        8, 'NaturaBio SN',   5500),
('Gommage au sel marin',       'Soins corps',     15, 'pot',        5, 'Beauté Dakar',   4500),
('Crème hydratante visage',    'Soins visage',     3, 'tube',       8, 'DermaSpa',      12000),
('Sérum anti-âge',             'Soins visage',     5, 'flacon',     6, 'DermaSpa',      22000),
('Masque purifiant argile',    'Soins visage',    11, 'tube',       5, 'DermaSpa',       9000),
('Pierres basalte (set)',      'Équipement',       6, 'set',        3, 'ProSpa Import', 45000),
('Table de massage',           'Équipement',       4, 'pièce',      2, 'ProSpa Import',320000),
('Serviettes coton',           'Linge',           42, 'pièce',     20, 'Textile Sénégal',3500),
('Peignoirs spa',              'Linge',           18, 'pièce',     10, 'Textile Sénégal',8500),
('Gel de soin ongles',         'Beauté',           4, 'flacon',     5, 'Beauté Dakar',   7000),
('Algues marines sèches',      'Soins corps',     12, 'kg',         4, 'NaturaBio SN',  15000),
('Cacao poudre cosmétique',    'Soins corps',      9, 'kg',         3, 'NaturaBio SN',  12000),
('Vernis semi-permanent',      'Beauté',          30, 'flacon',    10, 'Beauté Dakar',   3500),
('Huile de chanvre',           'Huiles',           7, 'flacon',     5, 'NaturaBio SN',  11000);

-- ─── Fournisseurs ─────────────────────────────────────────
insert into public.suppliers (name, category, contact, phone, email, monthly_spend, last_order, status, pending_orders) values
('NaturaBio SN',           'Huiles & Produits naturels',     'Fatou Diallo',    '+221 77 100 10 01', 'contact@naturabio.sn',    180000, '2026-06-10', 'actif',   2),
('DermaSpa',               'Soins visage & corps',           'Marc Dupont',     '+221 77 200 20 02', 'marc@dermaspa.fr',        220000, '2026-06-05', 'actif',   1),
('ProSpa Import',          'Équipement professionnel',       'Lee Chang',       '+221 77 300 30 03', 'info@prospa.sn',          95000,  '2026-05-28', 'actif',   0),
('Beauté Dakar',           'Beauté & Ongles',                'Aminata Sarr',    '+221 77 400 40 04', 'beaute.dakar@gmail.com',  75000,  '2026-06-12', 'actif',   1),
('Textile Sénégal',        'Linge & Textiles',               'Ibou Ndiaye',     '+221 77 500 50 05', 'textile.sn@outlook.com',  60000,  '2026-05-20', 'actif',   0),
('Wellness Africa',        'Soins corps & Accessoires',      'Sophie Martin',   '+221 77 600 60 06', 'sophia@wellness.africa',  45000,  '2026-04-15', 'inactif', 0),
('AromaPlus',              'Huiles essentielles',            'Khadija Traoré',  '+221 77 700 70 07', 'khadija@aromaplus.sn',    35000,  '2026-06-08', 'actif',   0),
('MedEsthétique Pro',      'Matériel médico-esthétique',     'Dr. Fall',        '+221 77 800 80 08', 'contact@medesthetique.sn',110000, '2026-05-15', 'actif',   0);

-- ─── Caisse ───────────────────────────────────────────────
insert into public.cash_transactions (date, label, category, amount, type, payment_method) values
('2026-06-18', 'Aïssatou Diop — Massage suédois',       'Soins',          25000, 'recette', 'Carte'),
('2026-06-18', 'Cheikh Sarr — Pierres chaudes',          'Soins',          35000, 'recette', 'Cash'),
('2026-06-18', 'Fatou Ndiaye — Soin visage',             'Soins',          18000, 'recette', 'Carte'),
('2026-06-18', 'Moussa Fall — Gommage corps',            'Soins',          20000, 'recette', 'Mobile Money'),
('2026-06-18', 'Mariama Bâ — Massage suédois',           'Soins',          25000, 'recette', 'Carte'),
('2026-06-18', 'Fournitures salon',                      'Charges',         8500, 'charge',  'Cash'),
('2026-06-17', 'Rokhaya Thiaw — Lifting visage',         'Soins',          30000, 'recette', 'Carte'),
('2026-06-17', 'Ousmane Gueye — Massage profond',        'Soins',          32000, 'recette', 'Cash'),
('2026-06-17', 'Ndèye Sall — Manucure',                  'Beauté',         12000, 'recette', 'Mobile Money'),
('2026-06-17', 'Abonnements clients (3)',                'Abonnements',    85000, 'recette', 'Virement'),
('2026-06-17', 'Achat produits NaturaBio',               'Stock',          68000, 'charge',  'Virement'),
('2026-06-16', 'Adja Touré — Soin anti-âge',             'Soins',          38000, 'recette', 'Carte'),
('2026-06-16', 'Lamine Diallo — Massage ayurvédique',    'Soins',          40000, 'recette', 'Cash'),
('2026-06-16', 'Bintou Kouyaté — Enveloppement',         'Soins',          28000, 'recette', 'Carte'),
('2026-06-16', 'Maintenance équipement',                 'Charges',        35000, 'charge',  'Virement');

-- ─── Plans d'abonnement ───────────────────────────────────
insert into public.membership_plans (name, price, remise, color, avantages) values
('Bronze',   45000, 10, 'from-amber-400 to-amber-600',   array['2 soins/mois au choix','10% de remise sur les extras','Accès espace détente']),
('Silver',   85000, 15, 'from-slate-400 to-slate-600',   array['4 soins/mois au choix','15% de remise sur les extras','Accès espace détente','Boisson offerte à chaque visite']),
('Gold',    120000, 20, 'from-yellow-400 to-yellow-600', array['6 soins/mois au choix','20% de remise sur les extras','Accès espace détente','Boisson & collation offertes','Priorité réservation']),
('Platinum',200000, 30, 'from-primary-500 to-primary-700',array['Soins illimités','30% de remise sur les extras','Accès VIP espace détente','Boisson & collation offertes','Réservation prioritaire 24h/24','Cadeau mensuel surprise']);

-- ─── Abonnements ──────────────────────────────────────────
insert into public.memberships (client_name, plan_name, since, next_billing, status, soins_restants) values
('Aïssatou Diop',   'Gold',     '2025-06-01', '2026-07-01', 'actif',    '2'),
('Cheikh Sarr',     'Platinum', '2025-01-01', '2026-07-01', 'actif',    'illimité'),
('Rokhaya Thiaw',   'Silver',   '2025-09-01', '2026-07-01', 'actif',    '1'),
('Lamine Diallo',   'Gold',     '2025-11-01', '2026-07-01', 'actif',    '4'),
('Adja Touré',      'Platinum', '2024-08-01', '2026-07-01', 'actif',    'illimité'),
('Bintou Kouyaté',  'Gold',     '2026-02-01', '2026-07-01', 'actif',    '3'),
('Aminata Traoré',  'Silver',   '2026-01-01', '2026-07-01', 'actif',    '2'),
('Mariama Bâ',      'Bronze',   '2026-05-01', '2026-07-01', 'actif',    '0'),
('Ousmane Gueye',   'Silver',   '2025-08-01', '2026-07-01', 'suspendu', '1'),
('Khady Diouf',     'Bronze',   '2026-03-01', '2026-07-01', 'actif',    '1'),
('Ndèye Sall',      'Gold',     '2025-12-01', '2026-07-01', 'actif',    '2'),
('Ibrahima Cissé',  'Bronze',   '2026-06-01', '2026-07-01', 'actif',    '1');

-- ─── Campagnes ────────────────────────────────────────────
insert into public.campaigns (name, type, target, status, sent, opened, date) values
('Offre été 2026',           'Email', 'Tous les clients',       'active',   250, 137, '2026-06-15'),
('Rappel RDV semaine',       'SMS',   'RDV confirmés',          'active',    42,  42, '2026-06-17'),
('Programme fidélité',       'Email', 'Clients > 3 visites',    'active',    58,  29, '2026-06-10'),
('Promo massage -20%',       'Promo', 'Nouveaux clients',       'terminee', 120,  68, '2026-05-01'),
('Réactivation clients',     'SMS',   'Inactifs > 60 jours',    'terminee',  35,  18, '2026-04-20'),
('Anniversaire clients',     'Email', 'Anniversaires du mois',  'brouillon',  0,   0, '2026-07-01');
