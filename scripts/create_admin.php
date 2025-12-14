<?php
/**
 * Script de création d'un administrateur
 * Usage: php scripts/create_admin.php
 */

require_once __DIR__ . '/../api/config/database.php';
require_once __DIR__ . '/../api/utils/Auth.php';
require_once __DIR__ . '/../api/utils/UuidHelper.php';

echo "\n╔══════════════════════════════════════════╗\n";
echo "║   CRÉATION ADMIN - COFFICE COWORKING    ║\n";
echo "╚══════════════════════════════════════════╝\n\n";

try {
    $database = new Database();
    $db = $database->getConnection();

    // Demander les informations
    echo "Email admin: ";
    $email = trim(fgets(STDIN));

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        die("❌ Email invalide\n");
    }

    // Vérifier si l'email existe déjà
    $query = "SELECT id, role FROM users WHERE email = :email AND deleted_at IS NULL";
    $stmt = $db->prepare($query);
    $stmt->execute([':email' => $email]);
    $existing = $stmt->fetch();

    if ($existing) {
        if ($existing['role'] === 'admin') {
            die("❌ Un admin existe déjà avec cet email\n");
        }

        echo "\n⚠️  Un utilisateur existe avec cet email. Le promouvoir en admin? (oui/non): ";
        $confirm = trim(fgets(STDIN));

        if (strtolower($confirm) !== 'oui') {
            die("Opération annulée\n");
        }

        // Promouvoir l'utilisateur existant
        $query = "UPDATE users SET role = 'admin', updated_at = NOW() WHERE id = :id";
        $stmt = $db->prepare($query);
        $stmt->execute([':id' => $existing['id']]);

        echo "\n✅ Utilisateur promu en administrateur avec succès!\n";
        echo "Email: $email\n";
        echo "Connectez-vous sur /connexion\n\n";
        exit(0);
    }

    echo "Mot de passe (min 12 caractères): ";
    system('stty -echo');
    $password = trim(fgets(STDIN));
    system('stty echo');
    echo "\n";

    if (strlen($password) < 12) {
        die("❌ Le mot de passe doit contenir au moins 12 caractères\n");
    }

    // Valider la force du mot de passe
    if (!preg_match('/[A-Z]/', $password) ||
        !preg_match('/[a-z]/', $password) ||
        !preg_match('/[0-9]/', $password)) {
        die("❌ Le mot de passe doit contenir au moins une majuscule, une minuscule et un chiffre\n");
    }

    echo "Confirmation du mot de passe: ";
    system('stty -echo');
    $password_confirm = trim(fgets(STDIN));
    system('stty echo');
    echo "\n";

    if ($password !== $password_confirm) {
        die("❌ Les mots de passe ne correspondent pas\n");
    }

    echo "Nom: ";
    $nom = trim(fgets(STDIN));

    if (empty($nom)) {
        die("❌ Le nom est requis\n");
    }

    echo "Prénom: ";
    $prenom = trim(fgets(STDIN));

    if (empty($prenom)) {
        die("❌ Le prénom est requis\n");
    }

    echo "Téléphone (optionnel): ";
    $telephone = trim(fgets(STDIN));

    // Hasher le mot de passe
    $password_hash = Auth::hashPassword($password);

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
        ':telephone' => !empty($telephone) ? $telephone : null
    ]);

    if (!$result) {
        die("❌ Erreur lors de la création de l'admin\n");
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

    echo "\n✅ Administrateur créé avec succès!\n";
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";
    echo "Email: $email\n";
    echo "Nom: $nom $prenom\n";
    echo "Code parrainage: $code_parrain\n";
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";
    echo "\n🔐 Connectez-vous sur /connexion\n\n";

} catch (Exception $e) {
    echo "\n❌ Erreur: " . $e->getMessage() . "\n\n";
    exit(1);
}
?>
