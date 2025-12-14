-- =====================================================
-- COFFICE - Schema MySQL Complet
-- Application de Coworking - Mohammadia Mall, Alger
-- Date: 2025-12-14
-- =====================================================

SET FOREIGN_KEY_CHECKS=0;
SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+01:00";

-- =====================================================
-- TABLES PRINCIPALES
-- =====================================================

-- Table: users
CREATE TABLE IF NOT EXISTS users (
  id CHAR(36) PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  nom VARCHAR(100) NOT NULL,
  prenom VARCHAR(100) NOT NULL,
  telephone VARCHAR(20),
  role ENUM('admin', 'user') NOT NULL DEFAULT 'user',
  statut ENUM('actif', 'inactif', 'suspendu') NOT NULL DEFAULT 'actif',
  avatar TEXT,
  profession VARCHAR(100),
  entreprise VARCHAR(200),
  adresse TEXT,
  bio TEXT,
  wilaya VARCHAR(100),
  commune VARCHAR(100),
  type_entreprise ENUM('auto_entrepreneur', 'eurl', 'sarl', 'spa', 'snc', 'scs', 'freelance', 'autre'),
  nif VARCHAR(50),
  nis VARCHAR(50),
  registre_commerce VARCHAR(50),
  article_imposition VARCHAR(50),
  numero_auto_entrepreneur VARCHAR(50),
  raison_sociale VARCHAR(200),
  date_creation_entreprise DATETIME,
  capital DECIMAL(15,2),
  siege_social TEXT,
  activite_principale VARCHAR(200),
  forme_juridique VARCHAR(100),
  absences INT DEFAULT 0,
  banned_until DATETIME,
  derniere_connexion DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_role (role),
  INDEX idx_role_statut (role, statut),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: espaces
CREATE TABLE IF NOT EXISTS espaces (
  id CHAR(36) PRIMARY KEY,
  nom VARCHAR(100) NOT NULL,
  type ENUM('box_4', 'box_3', 'open_space', 'salle_reunion', 'poste_informatique') NOT NULL,
  capacite INT NOT NULL,
  prix_heure DECIMAL(10,2) NOT NULL,
  prix_demi_journee DECIMAL(10,2) NOT NULL DEFAULT 0,
  prix_jour DECIMAL(10,2) NOT NULL,
  prix_semaine DECIMAL(10,2) NOT NULL DEFAULT 0,
  description TEXT,
  equipements JSON,
  disponible BOOLEAN DEFAULT TRUE,
  etage INT DEFAULT 4,
  image_url TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_type (type),
  INDEX idx_disponible (disponible)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: abonnements
CREATE TABLE IF NOT EXISTS abonnements (
  id CHAR(36) PRIMARY KEY,
  nom VARCHAR(100) NOT NULL,
  type VARCHAR(50) NOT NULL,
  prix DECIMAL(10,2) NOT NULL,
  prix_avec_domiciliation DECIMAL(10,2),
  duree_mois INT DEFAULT 1,
  description TEXT,
  avantages JSON,
  actif BOOLEAN DEFAULT TRUE,
  statut ENUM('actif', 'inactif', 'archive') NOT NULL DEFAULT 'actif',
  ordre INT DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_actif (actif),
  INDEX idx_statut (statut)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: abonnements_utilisateurs
CREATE TABLE IF NOT EXISTS abonnements_utilisateurs (
  id CHAR(36) PRIMARY KEY,
  user_id CHAR(36) NOT NULL,
  abonnement_id CHAR(36) NOT NULL,
  date_debut DATETIME NOT NULL,
  date_fin DATETIME NOT NULL,
  statut ENUM('actif', 'expire', 'suspendu', 'annule') NOT NULL DEFAULT 'actif',
  auto_renouvellement BOOLEAN DEFAULT FALSE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (abonnement_id) REFERENCES abonnements(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_statut (statut),
  INDEX idx_dates (date_debut, date_fin)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: reservations
CREATE TABLE IF NOT EXISTS reservations (
  id CHAR(36) PRIMARY KEY,
  user_id CHAR(36) NOT NULL,
  espace_id CHAR(36) NOT NULL,
  date_debut DATETIME NOT NULL,
  date_fin DATETIME NOT NULL,
  statut ENUM('confirmee', 'en_attente', 'en_cours', 'annulee', 'terminee') NOT NULL DEFAULT 'en_attente',
  type_reservation ENUM('heure', 'jour', 'semaine') NOT NULL DEFAULT 'heure',
  montant_total DECIMAL(10,2) NOT NULL,
  reduction DECIMAL(10,2) DEFAULT 0,
  code_promo_id CHAR(36),
  montant_paye DECIMAL(10,2) DEFAULT 0,
  mode_paiement VARCHAR(50),
  notes TEXT,
  participants INT NOT NULL DEFAULT 1,
  annulee_par CHAR(36),
  raison_annulation TEXT,
  date_annulation DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (espace_id) REFERENCES espaces(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_espace_id (espace_id),
  INDEX idx_statut (statut),
  INDEX idx_dates (date_debut, date_fin),
  INDEX idx_date_debut (date_debut),
  INDEX idx_date_fin (date_fin),
  INDEX idx_user_espace (user_id, espace_id),
  INDEX idx_user_date_statut (user_id, date_debut, statut),
  INDEX idx_espace_date_statut (espace_id, date_debut, statut),
  INDEX idx_annulee_par (annulee_par),
  INDEX idx_code_promo_id (code_promo_id),
  INDEX idx_participants (participants),
  CONSTRAINT chk_participants_positive CHECK (participants > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: domiciliations
CREATE TABLE IF NOT EXISTS domiciliations (
  id CHAR(36) PRIMARY KEY,
  user_id CHAR(36) NOT NULL,
  raison_sociale VARCHAR(200) NOT NULL,
  forme_juridique VARCHAR(100) NOT NULL,
  capital DECIMAL(15,2),
  activite_principale VARCHAR(200),
  nif VARCHAR(50),
  nis VARCHAR(50),
  registre_commerce VARCHAR(50),
  article_imposition VARCHAR(50),
  numero_auto_entrepreneur VARCHAR(50),
  wilaya VARCHAR(100),
  commune VARCHAR(100),
  adresse_actuelle TEXT,
  representant_nom VARCHAR(100),
  representant_prenom VARCHAR(100),
  representant_telephone VARCHAR(20),
  representant_email VARCHAR(255),
  statut ENUM('en_attente', 'en_cours', 'validee', 'active', 'refusee', 'expiree', 'resiliee') NOT NULL DEFAULT 'en_attente',
  date_debut DATETIME,
  date_fin DATETIME,
  montant_mensuel DECIMAL(10,2),
  documents JSON,
  notes_admin TEXT,
  visible_sur_site BOOLEAN DEFAULT FALSE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_statut (statut),
  INDEX idx_visible (visible_sur_site),
  INDEX idx_user_statut (user_id, statut),
  INDEX idx_dates (date_debut, date_fin)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: transactions
CREATE TABLE IF NOT EXISTS transactions (
  id CHAR(36) PRIMARY KEY,
  user_id CHAR(36) NOT NULL,
  type ENUM('abonnement', 'reservation', 'domiciliation', 'remboursement') NOT NULL,
  montant DECIMAL(10,2) NOT NULL,
  statut ENUM('en_attente', 'completee', 'echouee', 'remboursee') NOT NULL DEFAULT 'en_attente',
  mode_paiement VARCHAR(50),
  reference VARCHAR(100) UNIQUE,
  description TEXT,
  metadata JSON,
  date_paiement DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_type (type),
  INDEX idx_statut (statut),
  INDEX idx_reference (reference),
  INDEX idx_user_type_statut (user_id, type, statut),
  INDEX idx_date_paiement (date_paiement)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: codes_promo
CREATE TABLE IF NOT EXISTS codes_promo (
  id CHAR(36) PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL,
  type ENUM('pourcentage', 'montant_fixe') NOT NULL,
  valeur DECIMAL(10,2) NOT NULL,
  date_debut DATETIME NOT NULL,
  date_fin DATETIME NOT NULL,
  utilisations_max INT,
  utilisations_actuelles INT DEFAULT 0,
  montant_min DECIMAL(10,2) DEFAULT 0,
  description TEXT,
  conditions TEXT,
  types_application JSON,
  actif BOOLEAN DEFAULT TRUE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_code (code),
  INDEX idx_actif (actif),
  INDEX idx_dates (date_debut, date_fin),
  INDEX idx_actif_dates (actif, date_debut, date_fin)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: utilisations_codes_promo
CREATE TABLE IF NOT EXISTS utilisations_codes_promo (
  id CHAR(36) PRIMARY KEY,
  code_promo_id CHAR(36) NOT NULL,
  user_id CHAR(36) NOT NULL,
  reservation_id CHAR(36),
  abonnement_id CHAR(36),
  domiciliation_id CHAR(36),
  montant_reduction DECIMAL(10,2) NOT NULL,
  montant_avant DECIMAL(10,2) NOT NULL,
  montant_apres DECIMAL(10,2) NOT NULL,
  type_utilisation ENUM('reservation', 'abonnement', 'domiciliation') NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (code_promo_id) REFERENCES codes_promo(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (reservation_id) REFERENCES reservations(id) ON DELETE SET NULL,
  FOREIGN KEY (abonnement_id) REFERENCES abonnements_utilisateurs(id) ON DELETE SET NULL,
  FOREIGN KEY (domiciliation_id) REFERENCES domiciliations(id) ON DELETE SET NULL,
  INDEX idx_code_promo_id (code_promo_id),
  INDEX idx_user_id (user_id),
  INDEX idx_reservation_id (reservation_id),
  INDEX idx_abonnement_id (abonnement_id),
  INDEX idx_domiciliation_id (domiciliation_id),
  INDEX idx_type_utilisation (type_utilisation),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: parrainages
CREATE TABLE IF NOT EXISTS parrainages (
  id CHAR(36) PRIMARY KEY,
  parrain_id CHAR(36) NOT NULL,
  code_parrain VARCHAR(50) UNIQUE NOT NULL,
  parraines INT DEFAULT 0,
  recompenses_totales DECIMAL(10,2) DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (parrain_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_parrain_id (parrain_id),
  INDEX idx_code_parrain (code_parrain)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: parrainages_details
CREATE TABLE IF NOT EXISTS parrainages_details (
  id CHAR(36) PRIMARY KEY,
  parrainage_id CHAR(36) NOT NULL,
  filleul_id CHAR(36) NOT NULL,
  recompense_parrain DECIMAL(10,2) DEFAULT 0,
  recompense_filleul DECIMAL(10,2) DEFAULT 0,
  statut ENUM('en_attente', 'valide', 'paye') NOT NULL DEFAULT 'en_attente',
  date_inscription DATETIME DEFAULT CURRENT_TIMESTAMP,
  date_validation DATETIME,
  FOREIGN KEY (parrainage_id) REFERENCES parrainages(id) ON DELETE CASCADE,
  FOREIGN KEY (filleul_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_parrainage_id (parrainage_id),
  INDEX idx_filleul_id (filleul_id),
  INDEX idx_parrainage_filleul (parrainage_id, filleul_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: notifications
CREATE TABLE IF NOT EXISTS notifications (
  id CHAR(36) PRIMARY KEY,
  user_id CHAR(36) NOT NULL,
  type ENUM('reservation', 'abonnement', 'domiciliation', 'paiement', 'promo', 'parrainage', 'systeme') NOT NULL,
  titre VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  lue BOOLEAN DEFAULT FALSE,
  metadata JSON,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_lue (lue),
  INDEX idx_user_lu_created (user_id, lue, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: documents_uploads
CREATE TABLE IF NOT EXISTS documents_uploads (
  id CHAR(36) PRIMARY KEY,
  user_id CHAR(36) NOT NULL,
  entity_type ENUM('domiciliation', 'user', 'reservation', 'autre') NOT NULL,
  entity_id CHAR(36),
  nom_fichier VARCHAR(255) NOT NULL,
  nom_original VARCHAR(255) NOT NULL,
  type_fichier VARCHAR(100),
  taille INT,
  chemin_fichier TEXT NOT NULL,
  uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_entity (entity_type, entity_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABLES AVANCEES
-- =====================================================

-- Table: rate_limits
CREATE TABLE IF NOT EXISTS rate_limits (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  key_name VARCHAR(255) NOT NULL,
  attempts INT NOT NULL DEFAULT 0,
  expires_at DATETIME NOT NULL,
  UNIQUE KEY key_name (key_name),
  INDEX idx_expires_at (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: logs
CREATE TABLE IF NOT EXISTS logs (
  id CHAR(36) PRIMARY KEY,
  level ENUM('info','warning','error','security') NOT NULL,
  message TEXT NOT NULL,
  context JSON DEFAULT NULL,
  user_id CHAR(36) DEFAULT NULL,
  ip_address VARCHAR(45) DEFAULT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_level (level),
  INDEX idx_user_id (user_id),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: activites
CREATE TABLE IF NOT EXISTS activites (
  id CHAR(36) PRIMARY KEY,
  user_id CHAR(36) NOT NULL,
  type VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  metadata JSON DEFAULT NULL,
  ip_address VARCHAR(45) DEFAULT NULL,
  user_agent TEXT,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_user_id (user_id),
  INDEX idx_type (type),
  INDEX idx_created_at (created_at),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: csrf_tokens
CREATE TABLE IF NOT EXISTS csrf_tokens (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  token VARCHAR(64) NOT NULL UNIQUE,
  user_id CHAR(36) NOT NULL,
  expires_at DATETIME NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_token (token),
  INDEX idx_user_id (user_id),
  INDEX idx_expires_at (expires_at),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- VUES
-- =====================================================

DROP VIEW IF EXISTS active_reservations;
CREATE VIEW active_reservations AS
SELECT
    r.id,
    r.user_id,
    r.espace_id,
    u.nom,
    u.prenom,
    u.email,
    e.nom as espace_nom,
    e.type as espace_type,
    r.date_debut,
    r.date_fin,
    r.statut,
    r.montant_total,
    r.reduction,
    r.participants
FROM reservations r
INNER JOIN users u ON r.user_id = u.id
INNER JOIN espaces e ON r.espace_id = e.id
WHERE r.statut IN ('confirmee', 'en_cours')
AND r.date_fin >= NOW();

DROP VIEW IF EXISTS daily_stats;
CREATE VIEW daily_stats AS
SELECT
    DATE(created_at) as date,
    COUNT(*) as total_reservations,
    SUM(montant_total - COALESCE(reduction, 0)) as revenue,
    SUM(CASE WHEN statut = 'confirmee' THEN 1 ELSE 0 END) as confirmed_count,
    SUM(CASE WHEN statut = 'annulee' THEN 1 ELSE 0 END) as cancelled_count,
    AVG(montant_total - COALESCE(reduction, 0)) as avg_amount
FROM reservations
GROUP BY DATE(created_at);

-- =====================================================
-- PROCEDURES STOCKEES
-- =====================================================

DELIMITER $$

DROP PROCEDURE IF EXISTS calculate_occupancy_rate$$
CREATE PROCEDURE calculate_occupancy_rate(
    IN p_date_debut DATE,
    IN p_date_fin DATE
)
BEGIN
    SELECT
        DATE(r.date_debut) as date,
        COUNT(DISTINCT r.espace_id) as espaces_occupes,
        (SELECT COUNT(*) FROM espaces) as total_espaces,
        ROUND((COUNT(DISTINCT r.espace_id) * 100.0) / (SELECT COUNT(*) FROM espaces), 2) as taux_occupation
    FROM reservations r
    WHERE r.statut IN ('confirmee', 'en_cours')
    AND DATE(r.date_debut) BETWEEN p_date_debut AND p_date_fin
    GROUP BY DATE(r.date_debut)
    ORDER BY date;
END$$

DROP PROCEDURE IF EXISTS cleanup_expired_data$$
CREATE PROCEDURE cleanup_expired_data()
BEGIN
    DELETE FROM rate_limits WHERE expires_at < NOW();
    DELETE FROM logs WHERE created_at < DATE_SUB(NOW(), INTERVAL 90 DAY);
    DELETE FROM activites WHERE created_at < DATE_SUB(NOW(), INTERVAL 90 DAY);
    DELETE FROM csrf_tokens WHERE expires_at < NOW();
    SELECT 'Cleanup completed' as message;
END$$

DELIMITER ;

-- =====================================================
-- DONNEES INITIALES
-- =====================================================

-- Espaces avec nouvelles images
INSERT INTO espaces (id, nom, type, capacite, prix_heure, prix_jour, prix_semaine, description, equipements, image_url) VALUES
(UUID(), 'Open Space', 'open_space', 12, 0, 1200, 20000, 'Espace de travail collaboratif 80m², 12 postes équipés', '["Wi-Fi 50-100 Mbps", "Accès communauté", "Café/thé", "Climatisation"]', '/espace_de_cowoking_vue_.jpeg'),
(UUID(), 'Private Booth Aurès', 'box_3', 2, 0, 6000, 40000, 'Box privé 2 places idéal pour duo ou consulting', '["Wi-Fi haut débit", "Table/chaises", "Climatisation", "Insonorisation"]', '/private_booth_aurès.jpeg'),
(UUID(), 'Private Booth Hoggar', 'box_3', 2, 0, 6000, 40000, 'Box privé 2 places confortable et climatisé', '["Wi-Fi haut débit", "Table/chaises", "Climatisation", "Insonorisation"]', '/private_booth_hoggar.jpeg'),
(UUID(), 'Private Booth Atlas', 'box_4', 4, 0, 10000, 65000, 'Box privé 4 places spacieux, accès 7h-20h', '["Wi-Fi haut débit", "Table/chaises", "Climatisation", "Écran de présentation"]', '/private_booth_atlas_2.jpeg'),
(UUID(), 'Salle de Réunion Premium', 'salle_reunion', 12, 2500, 12000, 0, 'Salle 35-40m² avec terrasse panoramique, TV 80"', '["TV 80 pouces", "Système audio", "Tableau blanc", "Terrasse", "Wi-Fi", "Eau", "Climatisation"]', '/salle_de_réunion_5.jpeg')
ON DUPLICATE KEY UPDATE nom=VALUES(nom);

-- Abonnements
INSERT INTO abonnements (id, nom, type, prix, prix_avec_domiciliation, description, avantages, actif, statut, ordre) VALUES
(UUID(), 'Solo', 'solo', 14000, NULL, 'Pour freelances et indépendants', '["Accès open space 8h-18h", "Wi-Fi 50 Mbps", "Accès communauté"]', TRUE, 'actif', 1),
(UUID(), 'Pro', 'pro', 32000, NULL, 'Startups et consultants', '["Accès tous espaces 7h-20h", "Wi-Fi 100 Mbps", "Salle réunion 2h/mois", "-25% services additionnels"]', TRUE, 'actif', 2),
(UUID(), 'Executive', 'entreprise', 55000, NULL, 'Entreprises et PME', '["Accès illimité 24/7", "Wi-Fi illimité", "Domiciliation INCLUSE", "-40% services additionnels"]', TRUE, 'actif', 3)
ON DUPLICATE KEY UPDATE nom=VALUES(nom);

SET FOREIGN_KEY_CHECKS=1;

-- =====================================================
-- FIN DU SCHEMA
-- =====================================================
