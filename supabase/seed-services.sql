-- ============================================================
-- CATALOGUE SPA & CO LUXURY — Insertion des prestations
-- À exécuter dans Supabase SQL Editor
-- spa_id = NULL → disponible dans tous les établissements
-- ============================================================

INSERT INTO services (name, category, description, duration, price, active, spa_id) VALUES

-- ── MASSAGES & MODELAGES 1H ──────────────────────────────────
('Massage Relaxant 1h',                   'Massages', 'Massage relaxant pour une détente profonde du corps et de l''esprit.',                                                                                        60,  35000, true, NULL),
('Massage Tonique 1h',                    'Massages', 'Massage tonique pour revitaliser le corps et stimuler la circulation.',                                                                                       60,  45000, true, NULL),
('Massage Tonique & Relaxant 1h',         'Massages', 'Alliance parfaite entre tonus et détente pour un équilibre corps-esprit.',                                                                                    60,  35000, true, NULL),
('Massage Ayurveda 1h',                   'Massages', 'Massage traditionnel ayurvédique aux huiles chaudes pour une harmonie totale.',                                                                               60,  45000, true, NULL),
('Massage Pierres Chaudes 1h',            'Massages', 'Massage aux pierres chaudes volcaniques pour un bien-être intense et profond.',                                                                               60,  45000, true, NULL),
('Massage Serviettes Chaudes 1h',         'Massages', 'Massage aux serviettes chaudes pour détendre les muscles en profondeur.',                                                                                     60,  40000, true, NULL),
('Massage Femme Enceinte 1h',             'Massages', 'Massage doux et adapté aux femmes enceintes pour soulager et détendre.',                                                                                     60,  35000, true, NULL),
('Massage Post-Accouchement 1h',          'Massages', 'Massage de récupération post-natale pour aider à retrouver le bien-être.',                                                                                   60,  35000, true, NULL),
('Massage Dampé (Traditionnel) 1h',       'Massages', 'Massage traditionnel Dampé pour une relaxation profonde et authentique.',                                                                                    60,  35000, true, NULL),
('Massage Huiles Essentielles 1h',        'Massages', 'Massage aux huiles essentielles naturelles pour revitaliser corps et esprit.',                                                                               60,  40000, true, NULL),
('Modelage Visage & Tête 1h',             'Massages', 'Modelage du visage et de la tête pour soulager les tensions et apporter sérénité.',                                                                         60,  25000, true, NULL),

-- ── MASSAGES 30 MIN ─────────────────────────────────────────
('Massage Relaxant 30mn',                 'Massages', 'Massage relaxant express pour une pause bien-être au quotidien.',                                                                                            30,  20000, true, NULL),
('Massage Tonique 30mn',                  'Massages', 'Massage tonique court pour revitaliser rapidement le corps.',                                                                                                30,  25000, true, NULL),
('Massage Tonique & Relaxant 30mn',       'Massages', 'Version courte de notre alliance tonus et détente.',                                                                                                        30,  28000, true, NULL),

-- ── SOINS DU VISAGE ─────────────────────────────────────────
('Soin Microneedling Traitement Acné',    'Soins visage', 'Stimule le renouvellement de la peau, atténue les cicatrices d''acné, resserre les pores pour une peau plus lisse et uniforme.',                        60,  65000, true, NULL),
('Soin Microneedling',                    'Soins visage', 'Stimule naturellement le renouvellement de la peau, améliore la texture, réduit les cicatrices, les rides et les imperfections pour un teint rajeuni.', 60,  70000, true, NULL),
('Soin Basique Express',                  'Soins visage', 'Soin rapide comprenant nettoyage, hydratation et protection pour un coup d''éclat immédiat.',                                                           30,  40000, true, NULL),
('Soin Enfant',                           'Soins visage', 'Soin doux adapté aux peaux sensibles des enfants pour hydrater, apaiser et protéger leur peau.',                                                       45,  68000, true, NULL),
('Soin Regard',                           'Soins visage', 'Atténue les cernes, les poches et les ridules tout en apportant fraîcheur et éclat au contour des yeux.',                                              30,  30000, true, NULL),
('Soin Peau Grasse',                      'Soins visage', 'Purifie les pores, régule l''excès de sébum et aide à prévenir les imperfections pour une peau saine.',                                                45,  55000, true, NULL),
('Remodelage Visage',                     'Soins visage', 'Massage raffermissant qui redessine les contours du visage, stimule la circulation et réduit les signes de fatigue.',                                   45,  30000, true, NULL),
('Soin Hydrofacial',                      'Soins visage', 'Nettoie, exfolie, hydrate et revitalise la peau en profondeur pour un teint frais et éclatant.',                                                       60,  48000, true, NULL),
('Soin Dermoplaning',                     'Soins visage', 'Exfolie en douceur, élimine les cellules mortes et le duvet pour une peau lisse, lumineuse et éclatante.',                                             45,  55000, true, NULL),

-- ── WHERTEIMAR ──────────────────────────────────────────────
('Soin Éclat Wherteimar (Peau Grasse)',   'Soins visage', 'Purifie, matifie et révèle l''éclat des peaux grasses et sujettes aux imperfections.',                                                                 60,  65000, true, NULL),
('Soin Vitamine C Wherteimar',            'Soins visage', 'Illumine le teint, atténue les taches et protège la peau grâce à la puissance de la vitamine C.',                                                     60,  68000, true, NULL),
('Soin Éclaircissant Wherteimar',         'Soins visage', 'Unifie le teint, atténue les taches et apporte éclat et clarté à la peau.',                                                                            60,  68000, true, NULL),
('Soin Indispensable Wherteimar',         'Soins visage', 'Régule l''excès de sébum, resserre les pores et hydrate la peau en profondeur. (Peau grasse à mixte)',                                                60,  58000, true, NULL),
('Soin Indispensable Hydratant Wherteimar','Soins visage','Hydrate intensément, apaise et renforce la barrière cutanée. (Peau grasse uniquement) + Sérum inclus.',                                                 60,  65000, true, NULL),
('Diagnostic de la Peau',                 'Soins visage', 'Analyse complète de votre peau pour un soin parfaitement adapté à vos besoins.',                                                                        30,  20000, true, NULL),

-- ── SOINS ÉVÉNEMENTIELS ─────────────────────────────────────
('Soin Éclat Flash',                      'Soins visage', 'Coup d''éclat express pour illuminer le teint et lisser les traits.',                                                                                   30,  25000, true, NULL),
('Soin Radiance Prestige',                'Soins visage', 'Soin éclat profond pour un teint lumineux et un grain de peau affiné.',                                                                                 60,  30000, true, NULL),
('Soin Beauté Intense',                   'Soins visage', 'Hydrate, repulpe et ravive l''éclat pour une peau visiblement plus jeune et reposée.',                                                                  75,  38000, true, NULL),
('Soin Lift & Glow',                      'Soins visage', 'Effet tenseur et illuminateur immédiat pour un résultat bonne mine garanti.',                                                                           90,  45000, true, NULL),
('Rituel Mariée d''Exception',            'Soins visage', 'Soin complet sur-mesure : nettoyage, exfoliation, massage du visage, masque éclat et sérum coup d''éclat pour une peau parfaite le jour J.',          120, 65000, true, NULL),

-- ── EXTENSIONS DE CILS ──────────────────────────────────────
('Cil à Cil Classic',                     'Beauté', 'Un effet naturel et léger pour sublimer votre regard au quotidien.',                                                                                           90,  50000, true, NULL),
('Cil à Cil Bouqué',                      'Beauté', 'Plus dense et sophistiqué pour un regard intense et élégant.',                                                                                                120,  40000, true, NULL),
('Cil à Cil Volume Russe',                'Beauté', 'Un effet volumineux et raffiné pour un regard glamour et profond.',                                                                                            90,  65000, true, NULL),
('Cil à Cil Volume Russe Mixe',           'Beauté', 'Un volume intense et aérien pour un effet wahou garanti.',                                                                                                    60,  50000, true, NULL),
('Remplissage Cils',                      'Beauté', 'Entretien recommandé toutes les 2 à 3 semaines pour des cils toujours parfaits.',                                                                             60,  20000, true, NULL),
('Dépose Cils',                           'Beauté', 'Dépose en douceur sans abîmer vos cils naturels.',                                                                                                            30,  10000, true, NULL),

-- ── MAINS & PIEDS ───────────────────────────────────────────
('Manucure Simple',                       'Beauté', 'Soin complet des ongles et cuticules avec pose de vernis simple.',                                                                                             40,  10000, true, NULL),
('Manucure Luxe',                         'Beauté', 'Soin complet avec gommage, massage et pose de vernis semi-permanent.',                                                                                        60,  25000, true, NULL),
('Pédicure Classique',                    'Beauté', 'Soin complet des pieds avec pose de vernis simple.',                                                                                                          45,  18000, true, NULL),
('Pédicure Luxe',                         'Beauté', 'Soin complet avec gommage, massage et pose de vernis semi-permanent.',                                                                                        60,  28000, true, NULL),
('Pose Semi-Permanent Mains',             'Beauté', 'Tenue longue durée et brillance intense.',                                                                                                                    20,  10000, true, NULL),
('Pose Semi-Permanent Pieds',             'Beauté', 'Tenue longue durée et brillance intense.',                                                                                                                    20,  10000, true, NULL),
('Rituel Mains & Pieds',                  'Beauté', 'Soin complet avec pose de vernis permanent mains et pieds.',                                                                                                  60,  45000, true, NULL),

-- ── ONGLERIE ────────────────────────────────────────────────
('Pose Capsule Simple',                   'Beauté', 'Pose capsule simple pour des ongles parfaits.',                                                                                                               30,  15000, true, NULL),
('Pose de Vernis Classique',              'Beauté', 'Pose de vernis avec un large choix de couleurs.',                                                                                                             15,   5000, true, NULL),
('Pose de Vernis Semi-Permanent',         'Beauté', 'Tenue longue durée, brillante et résistante aux chocs.',                                                                                                      45,  10000, true, NULL),
('Renforcement Ongles Naturels',          'Beauté', 'Renforce et protège vos ongles naturels pour plus de solidité.',                                                                                              60,  23000, true, NULL),
('Pose d''Ongles Gel / Acrylique',        'Beauté', 'Extensions sur mesure pour des ongles longs et élégants.',                                                                                                   90,  25000, true, NULL),
('Nail Art',                              'Beauté', 'Personnalisez vos ongles avec des motifs et strass uniques. (à partir de)',                                                                                   30,   2000, true, NULL),
('Pose Capsule Style Américaine',         'Beauté', 'Pose capsule style américaine pour un look sophistiqué.',                                                                                                      40,  20000, true, NULL),

-- ── HAMMAM & GOMMAGE ────────────────────────────────────────
('Hammam Détente',                        'Soins corps', 'Accès au hammam traditionnel pour un moment de relaxation profonde.',                                                                                    60,  35000, true, NULL),
('Rituel Hammam',                         'Soins corps', 'Accès hammam, gommage au savon noir et rinçage à l''eau tiède avec masque au choix.',                                                                   60,  50000, true, NULL),
('Gommage du Corps',                      'Soins corps', 'Gommage du corps pour une peau douce et purifiée.',                                                                                                     30,  20000, true, NULL),
('Rituel Complet Hammam',                 'Soins corps', 'Hammam, gommage au savon noir, enveloppement avec des masques au choix.',                                                                               90,  55000, true, NULL),
('Enveloppement Rhassoul & Algues',       'Soins corps', 'Enveloppement au rhassoul ou aux algues pour purifier et reminéraliser la peau.',                                                                       30,  20000, true, NULL),

-- ── MINCEUR & ENVELOPPEMENT ─────────────────────────────────
('Enveloppement Détox',                   'Soins corps', 'Élimine les toxines et affine la silhouette grâce à un enveloppement aux algues.',                                                                      45,  35000, true, NULL),
('Enveloppement Minceur',                 'Soins corps', 'Action ciblée pour réduire la cellulite et raffermir la peau.',                                                                                         60,  35000, true, NULL),
('Gommage Minceur',                       'Soins corps', 'Exfolie et stimule la circulation pour une peau plus lisse et tonifiée.',                                                                               30,   8000, true, NULL),
('Drainage Lymphatique',                  'Soins corps', 'Draine, détoxifie et élimine la rétention d''eau pour un corps plus léger.',                                                                            60,  40000, true, NULL),
('Massage Minceur',                       'Soins corps', 'Massage profond et tonifiant pour aider à sculpter votre silhouette.',                                                                                   60,  40000, true, NULL),
('Forfait Minceur',                       'Soins corps', 'Programme complet minceur : drainage lymphatique + enveloppement + massage.',                                                                            60,  65000, true, NULL),

-- ── OFFRES SIMPLES ──────────────────────────────────────────
('Évasion Détente',                       'Formules', 'Hammam détente + Massage relaxant.',                                                                                                                       120,  75000, true, NULL),
('Douceur & Relaxation',                  'Formules', 'Hammam détente + Gommage au savon noir + Massage relaxant + Soin du visage express.',                                                                     210, 115000, true, NULL),
('Silhouette & Bien Être',                'Formules', 'Hammam détente + Gommage + Enveloppement + Massage + Pédicure Manucure.',                                                                                 270, 145000, true, NULL),
('Beauté & Harmonie',                     'Formules', 'Hammam détente + Gommage + Massage relaxant + Pédicure Manucure simple.',                                                                                  210, 100000, true, NULL),
('Rituel Impérial',                       'Formules', 'Hammam détente + Gommage + Enveloppement + Massage au choix + Soin visage + Manucure & Pédicure.',                                                       300, 150000, true, NULL),

-- ── OFFRES COUPLE ───────────────────────────────────────────
('Bulle de Détente Duo',                  'Formules', 'Hammam + Gommage + Massage relaxant en duo. (pour 2 personnes)',                                                                                           120, 150000, true, NULL),
('Parenthèse Romantique Duo',             'Formules', 'Hammam détente + Gommage au savon noir + Massage relaxant en duo + Soin du visage express. (pour 2 personnes)',                                           240, 230000, true, NULL),
('Évasion à Deux',                        'Formules', 'Hammam + Gommage + Massage relaxant en duo + Enveloppement. (pour 2 personnes)',                                                                          360, 250000, true, NULL),
('Harmonie & Bien Être Duo',              'Formules', 'Hammam + Gommage + Massage relaxant en duo + Pédicure & Manucure simple. (pour 2 personnes)',                                                             180, 190000, true, NULL),

-- ── COIFFURE ────────────────────────────────────────────────
('Brushing',                              'Coiffure', 'Mise en forme et séchage des cheveux pour un résultat lisse et soyeux.',                                                                                    60,   8000, true, NULL),
('Lissage',                               'Coiffure', 'Lissage durable pour des cheveux lisses, brillants et faciles à coiffer.',                                                                                 120,  20000, true, NULL),
('Boucles / Wavy',                        'Coiffure', 'Boucles souples et naturelles pour un look glamour.',                                                                                                       90,  12000, true, NULL),
('Tressage',                              'Coiffure', 'Tressages variés et soignés adaptés à votre style.',                                                                                                       120,  15000, true, NULL),
('Chignon',                               'Coiffure', 'Chignon élégant pour toutes vos occasions spéciales.',                                                                                                      90,  15000, true, NULL),
('Soin Capillaire',                       'Coiffure', 'Soin profond pour nourrir, réparer et revitaliser vos cheveux.',                                                                                            90,  18000, true, NULL),
('Coloration',                            'Coiffure', 'Couleur sur mesure pour illuminer et personnaliser votre style.',                                                                                           150,  25000, true, NULL);
