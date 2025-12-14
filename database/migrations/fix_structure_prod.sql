-- =====================================================
-- Migration: Correction de la structure pour la production
-- Date: 2025-12-14
-- Description: Assure la compatibilité entre le schéma et le code
-- =====================================================

-- Conversion du charset de la base de données en utf8mb4
ALTER DATABASE cofficed_coffice CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- =====================================================
-- Table: users
-- =====================================================
-- S'assurer que la colonne password_hash existe
ALTER TABLE users
MODIFY COLUMN password_hash VARCHAR(255) NOT NULL;

-- Ajouter un alias 'password' via une vue ou trigger si nécessaire
-- (Le code peut chercher 'password' au lieu de 'password_hash')

-- Conversion du charset de la table
ALTER TABLE users CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- =====================================================
-- Table: espaces
-- =====================================================
-- S'assurer que prix_jour existe (au lieu de prix_journee)
ALTER TABLE espaces
MODIFY COLUMN prix_jour DECIMAL(10,2) NOT NULL;

-- Ajouter prix_journee comme alias si le code l'utilise
ALTER TABLE espaces
ADD COLUMN IF NOT EXISTS prix_journee DECIMAL(10,2) GENERATED ALWAYS AS (prix_jour) VIRTUAL;

-- Conversion du charset
ALTER TABLE espaces CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- =====================================================
-- Table: codes_promo
-- =====================================================
-- S'assurer que valeur existe (stocke la réduction)
ALTER TABLE codes_promo
MODIFY COLUMN valeur DECIMAL(10,2) NOT NULL;

-- Ajouter reduction comme alias si le code l'utilise
ALTER TABLE codes_promo
ADD COLUMN IF NOT EXISTS reduction DECIMAL(10,2) GENERATED ALWAYS AS (valeur) VIRTUAL;

-- Conversion du charset
ALTER TABLE codes_promo CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- =====================================================
-- Table: parrainages
-- =====================================================
-- La structure est correcte (parrain_id, code_parrain)
-- filleul_id et statut sont dans parrainages_details

-- Conversion du charset
ALTER TABLE parrainages CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE parrainages_details CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- =====================================================
-- Table: reservations
-- =====================================================
ALTER TABLE reservations CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- =====================================================
-- Table: domiciliations
-- =====================================================
ALTER TABLE domiciliations CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- =====================================================
-- Autres tables importantes
-- =====================================================
ALTER TABLE IF EXISTS abonnements CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE IF EXISTS abonnements_utilisateurs CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE IF EXISTS paiements CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE IF EXISTS factures CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE IF EXISTS notifications CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE IF EXISTS logs CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE IF EXISTS utilisations_codes_promo CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- =====================================================
-- Vérification des index pour la performance
-- =====================================================

-- Index sur users
CREATE INDEX IF NOT EXISTS idx_users_email_statut ON users(email, statut);
CREATE INDEX IF NOT EXISTS idx_users_telephone ON users(telephone);

-- Index sur reservations
CREATE INDEX IF NOT EXISTS idx_reservations_dates ON reservations(date_debut, date_fin);
CREATE INDEX IF NOT EXISTS idx_reservations_statut_dates ON reservations(statut, date_debut, date_fin);

-- Index sur domiciliations
CREATE INDEX IF NOT EXISTS idx_domiciliations_dates ON domiciliations(date_debut, date_fin);
CREATE INDEX IF NOT EXISTS idx_domiciliations_user_statut ON domiciliations(user_id, statut);

-- =====================================================
-- Vérification de la structure des moteurs
-- =====================================================

-- S'assurer que toutes les tables utilisent InnoDB
ALTER TABLE users ENGINE=InnoDB;
ALTER TABLE espaces ENGINE=InnoDB;
ALTER TABLE reservations ENGINE=InnoDB;
ALTER TABLE domiciliations ENGINE=InnoDB;
ALTER TABLE codes_promo ENGINE=InnoDB;
ALTER TABLE parrainages ENGINE=InnoDB;
ALTER TABLE parrainages_details ENGINE=InnoDB;

-- =====================================================
-- Nettoyage et optimisation
-- =====================================================

-- Optimiser les tables après conversion
OPTIMIZE TABLE users;
OPTIMIZE TABLE espaces;
OPTIMIZE TABLE reservations;
OPTIMIZE TABLE domiciliations;
OPTIMIZE TABLE codes_promo;
OPTIMIZE TABLE parrainages;
OPTIMIZE TABLE parrainages_details;

-- FIN DE LA MIGRATION
