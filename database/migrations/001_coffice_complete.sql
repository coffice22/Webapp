-- =====================================================
-- COFFICE - Migration Complète et Consolidée
-- Date: 2026-01-19
-- Description: Migration unique regroupant toutes les
--              modifications nécessaires pour la version finale
-- =====================================================

-- =====================================================
-- 1. MODIFICATIONS TABLE ESPACES
-- =====================================================

-- Ajout du champ prix_demi_journee pour la tarification demi-journée
ALTER TABLE espaces
ADD COLUMN IF NOT EXISTS prix_demi_journee DECIMAL(10,2) NOT NULL DEFAULT 0 AFTER prix_heure;

-- Ajout du champ prix_mois pour les abonnements mensuels
ALTER TABLE espaces
ADD COLUMN IF NOT EXISTS prix_mois DECIMAL(10,2) NOT NULL DEFAULT 0 AFTER prix_semaine;

-- Mise à jour des prix mensuels par espace
UPDATE espaces SET prix_mois = 15000 WHERE type = 'open_space';
UPDATE espaces SET prix_mois = 35000 WHERE nom = 'Private Booth Hoggar';
UPDATE espaces SET prix_mois = 45000 WHERE nom IN ('Private Booth Atlas', 'Private Booth Aurès');

-- =====================================================
-- 2. MODIFICATIONS TABLE USERS
-- =====================================================

-- Ajout du champ credit pour les bonus de parrainage
ALTER TABLE users
ADD COLUMN IF NOT EXISTS credit DECIMAL(10,2) DEFAULT 0
COMMENT 'Crédit disponible pour l\'utilisateur (bonus parrainage, etc.)';

-- Index pour optimiser les requêtes sur le crédit
CREATE INDEX IF NOT EXISTS idx_users_credit ON users(credit);

-- =====================================================
-- 3. MODIFICATIONS TABLE DOMICILIATIONS
-- =====================================================

-- Ajout des champs manquants pour les informations complètes
ALTER TABLE domiciliations
ADD COLUMN IF NOT EXISTS representant_fonction VARCHAR(100)
  COMMENT 'Fonction du représentant légal',
ADD COLUMN IF NOT EXISTS domaine_activite VARCHAR(200)
  COMMENT 'Domaine d\'activité de l\'entreprise',
ADD COLUMN IF NOT EXISTS adresse_siege_social TEXT
  COMMENT 'Adresse du siège social actuel',
ADD COLUMN IF NOT EXISTS coordonnees_fiscales TEXT
  COMMENT 'Coordonnées fiscales de l\'entreprise',
ADD COLUMN IF NOT EXISTS coordonnees_administratives TEXT
  COMMENT 'Coordonnées administratives de l\'entreprise',
ADD COLUMN IF NOT EXISTS date_creation_entreprise DATE
  COMMENT 'Date de création de l\'entreprise';

-- =====================================================
-- 4. MODIFICATIONS TABLE RESERVATIONS
-- =====================================================

-- Extension des types de réservation pour inclure 'mois' et 'demi_journee'
ALTER TABLE reservations
MODIFY COLUMN type_reservation ENUM('heure', 'demi_journee', 'jour', 'semaine', 'mois')
NOT NULL DEFAULT 'heure';

-- =====================================================
-- 5. ABONNEMENTS MENSUELS PAR ESPACE
-- =====================================================

-- Création des nouveaux abonnements mensuels spécifiques
INSERT INTO abonnements (id, nom, type, prix, prix_avec_domiciliation, duree_mois, description, avantages, actif, statut, ordre)
VALUES
  (UUID(), 'Open Space Mensuel', 'open_space_monthly', 15000, NULL, 1,
   'Accès mensuel à l\'espace de coworking open space',
   '["Accès open space 8h-18h", "Wi-Fi haut débit", "Café/thé inclus", "12 postes disponibles"]',
   TRUE, 'actif', 10),

  (UUID(), 'Hoggar Mensuel', 'booth_hoggar_monthly', 35000, NULL, 1,
   'Box privé Hoggar 2 places - Abonnement mensuel',
   '["Accès 7h-20h", "Wi-Fi haut débit", "Climatisation", "Insonorisation", "2 places"]',
   TRUE, 'actif', 11),

  (UUID(), 'Atlas Mensuel', 'booth_atlas_monthly', 45000, NULL, 1,
   'Box privé Atlas 4 places - Abonnement mensuel',
   '["Accès 7h-20h", "Wi-Fi haut débit", "Climatisation", "Écran présentation", "4 places"]',
   TRUE, 'actif', 12),

  (UUID(), 'Aurès Mensuel', 'booth_aures_monthly', 45000, NULL, 1,
   'Box privé Aurès 2 places - Abonnement mensuel',
   '["Accès 7h-20h", "Wi-Fi haut débit", "Climatisation", "Insonorisation", "2 places"]',
   TRUE, 'actif', 13)
ON DUPLICATE KEY UPDATE nom=VALUES(nom);

-- =====================================================
-- 6. INDEX POUR PERFORMANCES
-- =====================================================

-- Index sur le type d'abonnement
CREATE INDEX IF NOT EXISTS idx_abonnements_type ON abonnements(type);

-- Index sur le type d'espace
CREATE INDEX IF NOT EXISTS idx_espaces_type ON espaces(type);

-- =====================================================
-- 7. VÉRIFICATIONS ET VALIDATION
-- =====================================================

-- Vérifier que tous les espaces ont des prix mensuels définis
SELECT
  nom,
  type,
  prix_jour,
  prix_mois,
  CASE
    WHEN prix_mois = 0 THEN 'ATTENTION: Prix mensuel non défini'
    ELSE 'OK'
  END as status
FROM espaces
ORDER BY type, nom;

-- Compter les nouveaux abonnements mensuels créés
SELECT COUNT(*) as nouveaux_abonnements
FROM abonnements
WHERE type LIKE '%_monthly';

-- =====================================================
-- FIN DE LA MIGRATION
-- =====================================================

SELECT 'Migration complète terminée avec succès!' as message;
