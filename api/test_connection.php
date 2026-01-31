<?php

/**
 * Test rapide de connexion à la base de données
 * URL: https://coffice.dz/api/test_connection.php
 * SUPPRIMEZ CE FICHIER APRÈS LE TEST!
 */

header('Content-Type: application/json; charset=utf-8');

echo json_encode([
    'test' => 'Début du test',
    'timestamp' => date('Y-m-d H:i:s')
], JSON_PRETTY_PRINT) . "\n\n";

// Test 1: Charger le fichier .env
echo "Test 1: Chargement .env...\n";
$envFile = __DIR__ . '/../.env';

if (!file_exists($envFile)) {
    die(json_encode([
        'success' => false,
        'error' => 'Fichier .env introuvable'
    ], JSON_PRETTY_PRINT));
}

$lines = file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
foreach ($lines as $line) {
    $line = trim($line);
    if ($line === '' || $line[0] === '#' || strpos($line, '=') === false) {
        continue;
    }

    [$key, $value] = explode('=', $line, 2);
    $key = trim($key);
    $value = trim($value);

    if ($key !== '' && !isset($_ENV[$key])) {
        $_ENV[$key] = $value;
    }
}

echo "✅ .env chargé\n\n";

// Test 2: Vérifier les variables
echo "Test 2: Variables MySQL...\n";
$vars = [
    'DB_HOST' => $_ENV['DB_HOST'] ?? 'NON DÉFINI',
    'DB_PORT' => $_ENV['DB_PORT'] ?? 'NON DÉFINI',
    'DB_NAME' => $_ENV['DB_NAME'] ?? 'NON DÉFINI',
    'DB_USER' => $_ENV['DB_USER'] ?? 'NON DÉFINI',
    'DB_PASSWORD' => !empty($_ENV['DB_PASSWORD']) ? '***' . substr($_ENV['DB_PASSWORD'], -4) : 'NON DÉFINI'
];

echo json_encode($vars, JSON_PRETTY_PRINT) . "\n\n";

// Test 3: Connexion MySQL
echo "Test 3: Connexion MySQL...\n";

try {
    $host = $_ENV['DB_HOST'] ?? 'localhost';
    $port = $_ENV['DB_PORT'] ?? '3306';
    $username = $_ENV['DB_USER'] ?? '';
    $password = $_ENV['DB_PASSWORD'] ?? '';

    $dsn = "mysql:host={$host};port={$port};charset=utf8mb4";
    $pdo = new PDO($dsn, $username, $password, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION
    ]);

    echo "✅ Connexion MySQL réussie\n\n";

    // Test 4: Vérifier la base de données
    echo "Test 4: Base de données...\n";
    $dbName = $_ENV['DB_NAME'] ?? '';

    $stmt = $pdo->prepare("SHOW DATABASES LIKE ?");
    $stmt->execute([$dbName]);
    $exists = $stmt->rowCount() > 0;

    if ($exists) {
        $pdo->exec("USE `{$dbName}`");
        $tables = $pdo->query("SHOW TABLES")->fetchAll(PDO::FETCH_COLUMN);

        echo "✅ Base '{$dbName}' existe\n";
        echo "Tables trouvées: " . count($tables) . "\n";
        echo json_encode($tables, JSON_PRETTY_PRINT) . "\n\n";

        // Test 5: Vérifier les tables importantes
        echo "Test 5: Tables importantes...\n";
        $requiredTables = ['users', 'espaces', 'reservations', 'domiciliations'];
        $missing = array_diff($requiredTables, $tables);

        if (empty($missing)) {
            echo "✅ Toutes les tables importantes existent\n\n";
        } else {
            echo "⚠️ Tables manquantes: " . implode(', ', $missing) . "\n";
            echo "Exécutez: api/install.php\n\n";
        }

        // Test 6: Compter les enregistrements
        echo "Test 6: Données...\n";
        foreach ($requiredTables as $table) {
            if (in_array($table, $tables)) {
                $count = $pdo->query("SELECT COUNT(*) FROM `{$table}`")->fetchColumn();
                echo "- {$table}: {$count} enregistrements\n";
            }
        }

        echo "\n✅ TOUS LES TESTS RÉUSSIS!\n";
        echo "La base de données est correctement configurée.\n\n";
        echo "⚠️ IMPORTANT: Supprimez ce fichier (api/test_connection.php) par sécurité!\n";

    } else {
        echo "⚠️ Base '{$dbName}' n'existe pas\n";
        echo "Exécutez: api/install.php\n";
    }

} catch (PDOException $e) {
    echo "❌ Erreur connexion: " . $e->getMessage() . "\n\n";
    echo "Vérifiez:\n";
    echo "1. MySQL est démarré\n";
    echo "2. Les identifiants dans .env sont corrects\n";
    echo "3. L'utilisateur a les permissions nécessaires\n";
}
