<?php

/**
 * Script de vérification rapide de l'installation Coffice
 * À utiliser pour diagnostiquer les problèmes de configuration
 * URL: https://coffice.dz/api/check.php
 */

header('Content-Type: application/json; charset=utf-8');

$checks = [];

// 1. Vérifier version PHP
$checks['php_version'] = [
    'name' => 'Version PHP',
    'required' => '8.1',
    'current' => PHP_VERSION,
    'status' => version_compare(PHP_VERSION, '8.1.0', '>=') ? 'ok' : 'error',
    'message' => version_compare(PHP_VERSION, '8.1.0', '>=')
        ? 'PHP ' . PHP_VERSION . ' OK'
        : 'PHP 8.1+ requis, version actuelle: ' . PHP_VERSION
];

// 2. Vérifier extensions PHP
$requiredExtensions = ['pdo', 'pdo_mysql', 'json', 'mbstring', 'openssl'];
$missingExtensions = [];

foreach ($requiredExtensions as $ext) {
    if (!extension_loaded($ext)) {
        $missingExtensions[] = $ext;
    }
}

$checks['php_extensions'] = [
    'name' => 'Extensions PHP',
    'required' => implode(', ', $requiredExtensions),
    'status' => empty($missingExtensions) ? 'ok' : 'error',
    'message' => empty($missingExtensions)
        ? 'Toutes les extensions requises sont installées'
        : 'Extensions manquantes: ' . implode(', ', $missingExtensions)
];

// 3. Vérifier fichier .env
$envFile = __DIR__ . '/../.env';
$checks['env_file'] = [
    'name' => 'Fichier .env',
    'status' => file_exists($envFile) ? 'ok' : 'error',
    'message' => file_exists($envFile)
        ? 'Fichier .env trouvé'
        : 'Fichier .env manquant. Copiez .env.example vers .env'
];

// 4. Charger et vérifier variables .env
if (file_exists($envFile)) {
    $lines = file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        $line = trim($line);
        if ($line === '' || $line[0] === '#' || strpos($line, '=') === false) {
            continue;
        }

        [$key, $value] = explode('=', $line, 2);
        $key = trim($key);
        $value = trim($value);

        if ($key !== '') {
            $_ENV[$key] = $value;
        }
    }

    $requiredVars = ['DB_HOST', 'DB_NAME', 'DB_USER', 'DB_PASSWORD', 'JWT_SECRET', 'VITE_API_URL'];
    $missingVars = [];
    $placeholderVars = [];

    foreach ($requiredVars as $var) {
        $value = $_ENV[$var] ?? '';

        if (empty($value)) {
            $missingVars[] = $var;
        } elseif (stripos($value, 'VOTRE_') !== false || stripos($value, 'GENERER') !== false) {
            $placeholderVars[] = $var;
        }
    }

    if (!empty($missingVars)) {
        $checks['env_vars'] = [
            'name' => 'Variables .env',
            'status' => 'error',
            'message' => 'Variables manquantes: ' . implode(', ', $missingVars)
        ];
    } elseif (!empty($placeholderVars)) {
        $checks['env_vars'] = [
            'name' => 'Variables .env',
            'status' => 'warning',
            'message' => 'Variables non configurées (placeholders): ' . implode(', ', $placeholderVars)
        ];
    } else {
        $checks['env_vars'] = [
            'name' => 'Variables .env',
            'status' => 'ok',
            'message' => 'Toutes les variables requises sont configurées'
        ];
    }
}

// 5. Test connexion MySQL
$checks['mysql_connection'] = [
    'name' => 'Connexion MySQL',
    'status' => 'pending'
];

if (isset($_ENV['DB_HOST']) && isset($_ENV['DB_USER']) && isset($_ENV['DB_PASSWORD'])) {
    try {
        $host = $_ENV['DB_HOST'] ?? 'localhost';
        $port = $_ENV['DB_PORT'] ?? '3306';
        $username = $_ENV['DB_USER'] ?? '';
        $password = $_ENV['DB_PASSWORD'] ?? '';

        $dsn = "mysql:host={$host};port={$port};charset=utf8mb4";
        $pdo = new PDO($dsn, $username, $password, [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION
        ]);

        $checks['mysql_connection'] = [
            'name' => 'Connexion MySQL',
            'status' => 'ok',
            'message' => 'Connexion MySQL réussie',
            'details' => "Host: {$host}:{$port}"
        ];
    } catch (PDOException $e) {
        $checks['mysql_connection'] = [
            'name' => 'Connexion MySQL',
            'status' => 'error',
            'message' => 'Impossible de se connecter: ' . $e->getMessage()
        ];
    }
} else {
    $checks['mysql_connection'] = [
        'name' => 'Connexion MySQL',
        'status' => 'warning',
        'message' => 'Variables MySQL non configurées dans .env'
    ];
}

// 6. Vérifier base de données
if (isset($pdo) && isset($_ENV['DB_NAME'])) {
    try {
        $dbName = $_ENV['DB_NAME'];
        $stmt = $pdo->query("SHOW DATABASES LIKE '{$dbName}'");
        $exists = $stmt->rowCount() > 0;

        if ($exists) {
            $pdo->exec("USE `{$dbName}`");
            $tables = $pdo->query("SHOW TABLES")->fetchAll(PDO::FETCH_COLUMN);

            $checks['database'] = [
                'name' => 'Base de données',
                'status' => 'ok',
                'message' => "Base '{$dbName}' existe avec " . count($tables) . ' tables',
                'tables' => count($tables)
            ];
        } else {
            $checks['database'] = [
                'name' => 'Base de données',
                'status' => 'warning',
                'message' => "Base '{$dbName}' n'existe pas. Exécutez api/install.php"
            ];
        }
    } catch (PDOException $e) {
        $checks['database'] = [
            'name' => 'Base de données',
            'status' => 'error',
            'message' => 'Erreur: ' . $e->getMessage()
        ];
    }
}

// 7. Vérifier permissions
$checks['permissions'] = [
    'name' => 'Permissions fichiers',
    'status' => 'ok',
    'checks' => []
];

$fileChecks = [
    'api/' => is_readable(__DIR__),
    'api/config/' => is_readable(__DIR__ . '/config'),
    '.env' => is_readable(__DIR__ . '/../.env')
];

foreach ($fileChecks as $file => $readable) {
    $checks['permissions']['checks'][$file] = $readable ? 'readable' : 'not readable';
    if (!$readable) {
        $checks['permissions']['status'] = 'warning';
    }
}

// Résumé global
$overallStatus = 'ok';
foreach ($checks as $check) {
    if ($check['status'] === 'error') {
        $overallStatus = 'error';
        break;
    } elseif ($check['status'] === 'warning' && $overallStatus !== 'error') {
        $overallStatus = 'warning';
    }
}

// Recommandations
$recommendations = [];

if ($overallStatus === 'error') {
    $recommendations[] = "❌ Des erreurs critiques ont été détectées. Corrigez-les avant de continuer.";
} elseif ($overallStatus === 'warning') {
    $recommendations[] = "⚠️ Des avertissements ont été détectés. Vérifiez la configuration.";
} else {
    $recommendations[] = "✅ Tout semble correct! Vous pouvez déployer l'application.";
}

if (isset($checks['env_vars']) && $checks['env_vars']['status'] !== 'ok') {
    $recommendations[] = "Configurez le fichier .env avec vos vraies valeurs";
    $recommendations[] = "Générez une clé JWT: openssl rand -base64 64";
}

if (isset($checks['database']) && $checks['database']['status'] === 'warning') {
    $recommendations[] = "Exécutez le script d'installation: https://coffice.dz/api/install.php";
}

// Réponse JSON
echo json_encode([
    'success' => $overallStatus !== 'error',
    'status' => $overallStatus,
    'checks' => $checks,
    'recommendations' => $recommendations,
    'timestamp' => date('Y-m-d H:i:s'),
    'message' => $overallStatus === 'ok'
        ? '✅ Installation prête pour le déploiement'
        : ($overallStatus === 'warning'
            ? '⚠️ Configuration à finaliser'
            : '❌ Erreurs à corriger')
], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
