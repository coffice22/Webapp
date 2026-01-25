/*
  # Migration : Ajout du code parrainage aux utilisateurs

  1. Modifications
    - Ajout du champ `code_parrainage` dans la table `users`
    - Génération automatique des codes pour les utilisateurs existants
    - Index pour optimiser les recherches

  2. Sécurité
    - Code unique par utilisateur
    - Format : CPF + 6 caractères alphanumériques (ex: CPF8XK2J9)

  3. Notes
    - Cette migration est nécessaire pour le bon fonctionnement du système de parrainage
    - Les codes sont générés automatiquement si absents
*/

-- Ajout du champ code_parrainage dans la table users
ALTER TABLE users
ADD COLUMN IF NOT EXISTS code_parrainage VARCHAR(20) UNIQUE COMMENT 'Code unique de parrainage de l\'utilisateur';

-- Index pour optimiser les recherches de codes parrainage
CREATE INDEX IF NOT EXISTS idx_code_parrainage ON users(code_parrainage);

-- Génération automatique des codes pour les utilisateurs existants
UPDATE users
SET code_parrainage = CONCAT('CPF', UPPER(SUBSTRING(MD5(CONCAT(id, email, UNIX_TIMESTAMP())), 1, 6)))
WHERE code_parrainage IS NULL OR code_parrainage = '';

-- Créer automatiquement les entrées dans la table parrainages pour les utilisateurs existants
INSERT INTO parrainages (id, parrain_id, code_parrain, parraines, recompenses_totales, created_at)
SELECT
    UUID(),
    u.id,
    u.code_parrainage,
    0,
    0,
    NOW()
FROM users u
WHERE u.code_parrainage IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM parrainages p WHERE p.parrain_id = u.id
  );
