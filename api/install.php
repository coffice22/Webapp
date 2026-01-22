<?php

/**
 * Script d'installation de la base de données Coffice
 * À exécuter une seule fois pour initialiser la base de données
 * URL: https://coffice.dz/api/install.php
 */

header('Content-Type: application/json; charset=utf-8');

// Charger la configuration
function loadEnvFile()
{
    $envFile = __DIR__ . '/../.env';

    if (!file_exists($envFile)) {
        return [
            'success' => false,
            'error' => 'Fichier .env introuvable. Copiez .env.example vers .env et configurez-le.'
        ];
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
            putenv("$key=$value");
        }
    }

    return ['success' => true];
}

// Vérifier la configuration
function checkConfiguration()
{
    $required = ['DB_HOST', 'DB_NAME', 'DB_USER', 'DB_PASSWORD', 'JWT_SECRET'];
    $missing = [];
    $placeholders = [];

    foreach ($required as $key) {
        $value = $_ENV[$key] ?? '';

        if (empty($value)) {
            $missing[] = $key;
        } elseif (stripos($value, 'VOTRE_') !== false || stripos($value, 'GENERER') !== false) {
            $placeholders[] = $key;
        }
    }

    if (!empty($missing)) {
        return [
            'success' => false,
            'error' => 'Variables manquantes dans .env: ' . implode(', ', $missing)
        ];
    }

    if (!empty($placeholders)) {
        return [
            'success' => false,
            'error' => 'Variables non configurées dans .env: ' . implode(', ', $placeholders) . '. Remplacez les placeholders par vos vraies valeurs.'
        ];
    }

    return ['success' => true];
}

// Test de connexion MySQL
function testConnection()
{
    $host = $_ENV['DB_HOST'] ?? 'localhost';
    $port = $_ENV['DB_PORT'] ?? '3306';
    $username = $_ENV['DB_USER'] ?? '';
    $password = $_ENV['DB_PASSWORD'] ?? '';

    try {
        $dsn = "mysql:host={$host};port={$port};charset=utf8mb4";
        $pdo = new PDO($dsn, $username, $password, [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION
        ]);
        return ['success' => true, 'connection' => $pdo];
    } catch (PDOException $e) {
        return [
            'success' => false,
            'error' => 'Impossible de se connecter à MySQL: ' . $e->getMessage()
        ];
    }
}

// Créer la base de données
function createDatabase($pdo)
{
    $dbName = $_ENV['DB_NAME'] ?? '';
    $charset = $_ENV['DB_CHARSET'] ?? 'utf8mb4';

    try {
        $pdo->exec("CREATE DATABASE IF NOT EXISTS `{$dbName}` CHARACTER SET {$charset} COLLATE {$charset}_unicode_ci");
        $pdo->exec("USE `{$dbName}`");
        return ['success' => true];
    } catch (PDOException $e) {
        return [
            'success' => false,
            'error' => 'Impossible de créer la base de données: ' . $e->getMessage()
        ];
    }
}

// Importer le schéma SQL
function importSchema($pdo)
{
    $sqlFile = __DIR__ . '/../database/coffice.sql';

    if (!file_exists($sqlFile)) {
        return [
            'success' => false,
            'error' => 'Fichier SQL introuvable: database/coffice.sql'
        ];
    }

    try {
        $sql = file_get_contents($sqlFile);

        // Nettoyer le SQL
        $sql = preg_replace('/^--.*$/m', '', $sql); // Supprimer commentaires --
        $sql = preg_replace('/\/\*.*?\*\//s', '', $sql); // Supprimer commentaires /* */

        // Diviser en commandes individuelles
        $statements = array_filter(
            array_map('trim', explode(';', $sql)),
            function ($stmt) { return !empty($stmt); }
        );

        $executed = 0;
        $errors = [];

        foreach ($statements as $statement) {
            try {
                $pdo->exec($statement);
                $executed++;
            } catch (PDOException $e) {
                // Ignorer les erreurs "table exists" et "duplicate entry"
                if (strpos($e->getMessage(), 'already exists') === false &&
                    strpos($e->getMessage(), 'Duplicate entry') === false) {
                    $errors[] = substr($statement, 0, 100) . '... : ' . $e->getMessage();
                }
            }
        }

        if (empty($errors)) {
            return [
                'success' => true,
                'executed' => $executed,
                'message' => "Schéma importé avec succès ({$executed} commandes exécutées)"
            ];
        } else {
            return [
                'success' => false,
                'executed' => $executed,
                'errors' => $errors,
                'message' => "Schéma partiellement importé avec des erreurs"
            ];
        }
    } catch (Exception $e) {
        return [
            'success' => false,
            'error' => 'Erreur lors de l\'import: ' . $e->getMessage()
        ];
    }
}

// Vérifier l'installation
function verifyInstallation($pdo)
{
    try {
        $tables = $pdo->query("SHOW TABLES")->fetchAll(PDO::FETCH_COLUMN);

        $requiredTables = [
            'users', 'espaces', 'reservations', 'domiciliations',
            'abonnements', 'codes_promo', 'parrainages', 'notifications', 'transactions'
        ];

        $missing = array_diff($requiredTables, $tables);

        if (empty($missing)) {
            return [
                'success' => true,
                'tables' => count($tables),
                'message' => 'Installation vérifiée: ' . count($tables) . ' tables trouvées'
            ];
        } else {
            return [
                'success' => false,
                'error' => 'Tables manquantes: ' . implode(', ', $missing)
            ];
        }
    } catch (PDOException $e) {
        return [
            'success' => false,
            'error' => 'Erreur lors de la vérification: ' . $e->getMessage()
        ];
    }
}

// Script principal
try {
    $results = [
        'step1_env' => ['name' => 'Chargement configuration', 'status' => 'pending'],
        'step2_config' => ['name' => 'Vérification configuration', 'status' => 'pending'],
        'step3_connection' => ['name' => 'Test connexion MySQL', 'status' => 'pending'],
        'step4_database' => ['name' => 'Création base de données', 'status' => 'pending'],
        'step5_schema' => ['name' => 'Import schéma SQL', 'status' => 'pending'],
        'step6_verify' => ['name' => 'Vérification installation', 'status' => 'pending']
    ];

    // Étape 1: Charger .env
    $envResult = loadEnvFile();
    $results['step1_env'] = array_merge($results['step1_env'], $envResult);
    $results['step1_env']['status'] = $envResult['success'] ? 'success' : 'error';

    if (!$envResult['success']) {
        throw new Exception($envResult['error']);
    }

    // Étape 2: Vérifier configuration
    $configResult = checkConfiguration();
    $results['step2_config'] = array_merge($results['step2_config'], $configResult);
    $results['step2_config']['status'] = $configResult['success'] ? 'success' : 'error';

    if (!$configResult['success']) {
        throw new Exception($configResult['error']);
    }

    // Étape 3: Test connexion
    $connectionResult = testConnection();
    $results['step3_connection'] = array_merge($results['step3_connection'], $connectionResult);
    $results['step3_connection']['status'] = $connectionResult['success'] ? 'success' : 'error';

    if (!$connectionResult['success']) {
        throw new Exception($connectionResult['error']);
    }

    $pdo = $connectionResult['connection'];

    // Étape 4: Créer base de données
    $dbResult = createDatabase($pdo);
    $results['step4_database'] = array_merge($results['step4_database'], $dbResult);
    $results['step4_database']['status'] = $dbResult['success'] ? 'success' : 'error';

    if (!$dbResult['success']) {
        throw new Exception($dbResult['error']);
    }

    // Étape 5: Importer schéma
    $schemaResult = importSchema($pdo);
    $results['step5_schema'] = array_merge($results['step5_schema'], $schemaResult);
    $results['step5_schema']['status'] = $schemaResult['success'] ? 'success' : 'warning';

    // Étape 6: Vérifier installation
    $verifyResult = verifyInstallation($pdo);
    $results['step6_verify'] = array_merge($results['step6_verify'], $verifyResult);
    $results['step6_verify']['status'] = $verifyResult['success'] ? 'success' : 'error';

    $allSuccess = $verifyResult['success'];

    echo json_encode([
        'success' => $allSuccess,
        'message' => $allSuccess
            ? '✅ Installation terminée avec succès! Vous pouvez maintenant supprimer ce fichier (api/install.php) par sécurité.'
            : '⚠️ Installation terminée avec des avertissements. Vérifiez les détails ci-dessous.',
        'steps' => $results,
        'database' => $_ENV['DB_NAME'] ?? '',
        'timestamp' => date('Y-m-d H:i:s')
    ], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage(),
        'steps' => $results,
        'timestamp' => date('Y-m-d H:i:s')
    ], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
}
