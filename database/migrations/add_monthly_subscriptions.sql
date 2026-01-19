-- =====================================================
-- Migration: Ajout des abonnements mensuels par espace
-- Date: 2026-01-19
-- Description: Ajoute les nouveaux abonnements mensuels
--              pour les espaces individuels
-- =====================================================

-- Ajouter un nouveau champ pour le prix mensuel aux espaces
ALTER TABLE espaces
ADD COLUMN IF NOT EXISTS prix_mois DECIMAL(10,2) NOT NULL DEFAULT 0 AFTER prix_semaine;

-- Mettre à jour les prix mensuels pour chaque espace
UPDATE espaces
SET prix_mois = 15000
WHERE type = 'open_space';

UPDATE espaces
SET prix_mois = 35000
WHERE nom = 'Private Booth Hoggar';

UPDATE espaces
SET prix_mois = 45000
WHERE nom IN ('Private Booth Atlas', 'Private Booth Aurès');

-- Créer de nouveaux abonnements mensuels spécifiques
-- Abonnement Open Space Mensuel
INSERT INTO abonnements (id, nom, type, prix, prix_avec_domiciliation, duree_mois, description, avantages, actif, statut, ordre) VALUES
(UUID(), 'Open Space Mensuel', 'open_space_monthly', 15000, NULL, 1, 'Accès mensuel à l\'espace de coworking open space', '["Accès open space 8h-18h", "Wi-Fi haut débit", "Café/thé inclus", "12 postes disponibles"]', TRUE, 'actif', 10),
(UUID(), 'Hoggar Mensuel', 'booth_hoggar_monthly', 35000, NULL, 1, 'Box privé Hoggar 2 places - Abonnement mensuel', '["Accès 7h-20h", "Wi-Fi haut débit", "Climatisation", "Insonorisation", "2 places"]', TRUE, 'actif', 11),
(UUID(), 'Atlas Mensuel', 'booth_atlas_monthly', 45000, NULL, 1, 'Box privé Atlas 4 places - Abonnement mensuel', '["Accès 7h-20h", "Wi-Fi haut débit", "Climatisation", "Écran présentation", "4 places"]', TRUE, 'actif', 12),
(UUID(), 'Aurès Mensuel', 'booth_aures_monthly', 45000, NULL, 1, 'Box privé Aurès 2 places - Abonnement mensuel', '["Accès 7h-20h", "Wi-Fi haut débit", "Climatisation", "Insonorisation", "2 places"]', TRUE, 'actif', 13)
ON DUPLICATE KEY UPDATE nom=VALUES(nom);

-- Ajouter un index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_abonnements_type ON abonnements(type);

-- Mise à jour des types de réservation pour inclure 'mois'
ALTER TABLE reservations
MODIFY COLUMN type_reservation ENUM('heure', 'demi_journee', 'jour', 'semaine', 'mois') NOT NULL DEFAULT 'heure';

-- =====================================================
-- FIN DE LA MIGRATION
-- =====================================================
