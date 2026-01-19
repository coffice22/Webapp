/*
  # Correction des champs manquants

  1. Modifications de la table `users`
    - Ajout du champ `credit` pour gérer les bonus de parrainage et crédits utilisateurs

  2. Modifications de la table `domiciliations`
    - Ajout du champ `representant_fonction` pour la fonction du représentant légal
    - Ajout du champ `domaine_activite` pour le domaine d'activité de l'entreprise
    - Ajout du champ `adresse_siege_social` pour l'adresse du siège social actuel
    - Ajout du champ `coordonnees_fiscales` pour les coordonnées fiscales
    - Ajout du champ `coordonnees_administratives` pour les coordonnées administratives
    - Ajout du champ `date_creation_entreprise` pour la date de création de l'entreprise

  3. Notes importantes
    - Ces champs sont essentiels pour le bon fonctionnement des fonctionnalités de parrainage et domiciliation
    - Le champ `credit` est initialisé à 0 par défaut pour tous les utilisateurs existants
*/

-- Ajouter le champ credit à la table users s'il n'existe pas
ALTER TABLE users
ADD COLUMN IF NOT EXISTS credit DECIMAL(10,2) DEFAULT 0 COMMENT 'Crédit disponible pour l\'utilisateur (bonus parrainage, etc.)';

-- Ajouter les champs manquants à la table domiciliations
ALTER TABLE domiciliations
ADD COLUMN IF NOT EXISTS representant_fonction VARCHAR(100) COMMENT 'Fonction du représentant légal',
ADD COLUMN IF NOT EXISTS domaine_activite VARCHAR(200) COMMENT 'Domaine d\'activité de l\'entreprise',
ADD COLUMN IF NOT EXISTS adresse_siege_social TEXT COMMENT 'Adresse du siège social actuel',
ADD COLUMN IF NOT EXISTS coordonnees_fiscales TEXT COMMENT 'Coordonnées fiscales de l\'entreprise',
ADD COLUMN IF NOT EXISTS coordonnees_administratives TEXT COMMENT 'Coordonnées administratives de l\'entreprise',
ADD COLUMN IF NOT EXISTS date_creation_entreprise DATE COMMENT 'Date de création de l\'entreprise';

-- Créer un index sur le champ credit pour optimiser les requêtes
CREATE INDEX IF NOT EXISTS idx_users_credit ON users(credit);

-- Vérification : afficher la structure mise à jour
SHOW COLUMNS FROM users LIKE 'credit';
SHOW COLUMNS FROM domiciliations WHERE Field IN ('representant_fonction', 'domaine_activite', 'adresse_siege_social', 'coordonnees_fiscales', 'coordonnees_administratives', 'date_creation_entreprise');
