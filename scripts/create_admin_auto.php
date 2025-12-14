<?php
/**
 * Script de création automatique d'un administrateur
 * Usage: php scripts/create_admin_auto.php
 *
 * Crée un compte admin avec les identifiants par défaut:
 * Email: admin@coffice.dz
 * Mot de passe: Admin@Coffice2025
 */

require_once __DIR__ . '/../api/config/database.php';
require_once __DIR__ . '/../api/utils/UuidHelper.php';

echo "\n╔══════════════════════════════════════════╗\n";
echo "║   CRÉATION ADMIN - COFFICE COWORKING    ║\n";
echo "╚══════════════════════════════════════════╝\n\n";

// Vérifier l'extension PDO MySQL
if (!extension_loaded('pdo_mysql')) {
    echo "❌ ERREUR: L'extension PDO MySQL n'est pas installée\n";
    echo "   Installez-la avec: sudo apt-get install php-mysql\n";
    echo "   Ou activez-la dans php.ini\n\n";
    exit(1);
}

// Identifiants par défaut
$email = "admin@coffice.dz";
$password = "Admin@Coffice2025";
$nom = "Admin";
$prenom = "Coffice";
$telephone = "0550000000";

try {
    $db = Database::getInstance()->getConnection();

    // Vérifier si l'email existe déjà
    $query = "SELECT id, role FROM users WHERE email = :email";
    $stmt = $db->prepare($query);
    $stmt->execute([':email' => $email]);
    $existing = $stmt->fetch();

    if ($existing) {
        if ($existing['role'] === 'admin') {
            echo "✅ Un admin existe déjà avec cet email: $email\n";
            echo "   Utilisez ce compte pour vous connecter.\n\n";
            echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";
            echo "Email: $email\n";
            echo "Mot de passe: $password\n";
            echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";
            echo "\n🔐 Connectez-vous sur /connexion\n\n";
            exit(0);
        }

        // Promouvoir l'utilisateur existant
        $query = "UPDATE users SET role = 'admin', updated_at = NOW() WHERE id = :id";
        $stmt = $db->prepare($query);
        $stmt->execute([':id' => $existing['id']]);

        echo "✅ Utilisateur promu en administrateur!\n";
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";
        echo "Email: $email\n";
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";
        echo "\n🔐 Connectez-vous sur /connexion\n\n";
        exit(0);
    }

    // Hasher le mot de passe avec bcrypt
    $password_hash = password_hash($password, PASSWORD_BCRYPT);

    // Générer l'ID
    $user_id = UuidHelper::generate();

    // Insérer l'admin
    $query = "INSERT INTO users (id, email, password_hash, nom, prenom, telephone, role, statut, created_at)
              VALUES (:id, :email, :password, :nom, :prenom, :telephone, 'admin', 'actif', NOW())";

    $stmt = $db->prepare($query);
    $result = $stmt->execute([
        ':id' => $user_id,
        ':email' => $email,
        ':password' => $password_hash,
        ':nom' => $nom,
        ':prenom' => $prenom,
        ':telephone' => $telephone
    ]);

    if (!$result) {
        throw new Exception("Erreur lors de la création de l'admin");
    }

    // Créer le code de parrainage
    $code_parrain = 'ADMIN' . strtoupper(substr(str_replace('-', '', $user_id), 0, 6));
    $parrainage_id = UuidHelper::generate();

    $query = "INSERT INTO parrainages (id, parrain_id, code_parrain, parraines, recompenses_totales, created_at)
              VALUES (:id, :parrain_id, :code_parrain, 0, 0, NOW())";

    $stmt = $db->prepare($query);
    $stmt->execute([
        ':id' => $parrainage_id,
        ':parrain_id' => $user_id,
        ':code_parrain' => $code_parrain
    ]);

    echo "✅ Administrateur créé avec succès!\n";
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";
    echo "Email: $email\n";
    echo "Mot de passe: $password\n";
    echo "Nom: $nom $prenom\n";
    echo "Code parrainage: $code_parrain\n";
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";
    echo "\n🔐 Connectez-vous sur /connexion\n";
    echo "\n⚠️  IMPORTANT: Changez le mot de passe après la première connexion!\n\n";

} catch (Exception $e) {
    echo "\n❌ Erreur: " . $e->getMessage() . "\n\n";
    exit(1);
}
?>
