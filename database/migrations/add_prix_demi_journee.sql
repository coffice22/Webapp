-- Migration: Ajout du champ prix_demi_journee à la table espaces
-- Date: 2025-12-14
-- Description: Ajoute le prix pour la demi-journée (4 heures)

-- Vérifier si la colonne existe déjà
SET @col_exists = (SELECT COUNT(*)
                   FROM INFORMATION_SCHEMA.COLUMNS
                   WHERE TABLE_SCHEMA = DATABASE()
                   AND TABLE_NAME = 'espaces'
                   AND COLUMN_NAME = 'prix_demi_journee');

-- Ajouter la colonne seulement si elle n'existe pas
SET @sql = IF(@col_exists = 0,
    'ALTER TABLE espaces ADD COLUMN prix_demi_journee DECIMAL(10,2) NOT NULL DEFAULT 0 AFTER prix_heure',
    'SELECT "La colonne prix_demi_journee existe déjà" as message'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Message de confirmation
SELECT 'Migration terminée: prix_demi_journee ajoutée' as status;
