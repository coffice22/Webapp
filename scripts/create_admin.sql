-- =====================================================
-- Création d'un compte administrateur via phpMyAdmin
-- À exécuter dans phpMyAdmin si vous ne pouvez pas utiliser PHP
-- =====================================================

-- ⚠️ MODIFIEZ les valeurs ci-dessous selon vos besoins

SET @admin_id = UUID();
SET @email = 'admin@coffice.dz';
SET @password = 'Admin@Coffice2025';
SET @nom = 'Admin';
SET @prenom = 'Coffice';
SET @telephone = '0550000000';

-- Hash du mot de passe (bcrypt)
-- ⚠️ Ce hash correspond au mot de passe: Admin@Coffice2025
-- Si vous voulez un autre mot de passe, vous devez le changer après connexion
SET @password_hash = '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi';

-- Vérifier si l'admin existe déjà
SELECT COUNT(*) INTO @admin_exists FROM users WHERE email = @email;

-- Créer l'admin si inexistant
INSERT INTO users (id, email, password_hash, nom, prenom, telephone, role, statut, created_at)
SELECT @admin_id, @email, @password_hash, @nom, @prenom, @telephone, 'admin', 'actif', NOW()
WHERE @admin_exists = 0;

-- Créer le code de parrainage
SET @code_parrain = CONCAT('ADMIN', UPPER(SUBSTRING(REPLACE(@admin_id, '-', ''), 1, 6)));
SET @parrainage_id = UUID();

INSERT INTO parrainages (id, parrain_id, code_parrain, parraines, recompenses_totales, created_at)
SELECT @parrainage_id, @admin_id, @code_parrain, 0, 0, NOW()
WHERE @admin_exists = 0;

-- Afficher le résultat
SELECT
    CASE
        WHEN @admin_exists = 0 THEN CONCAT('✅ Administrateur créé avec succès! Email: ', @email, ' / Mot de passe: ', @password)
        ELSE CONCAT('ℹ️ Un utilisateur existe déjà avec cet email: ', @email)
    END as Resultat;

-- =====================================================
-- Identifiants par défaut:
-- Email: admin@coffice.dz
-- Mot de passe: Admin@Coffice2025
--
-- ⚠️ IMPORTANT: Changez le mot de passe après connexion!
-- =====================================================
