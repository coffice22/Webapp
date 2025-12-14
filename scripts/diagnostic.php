<?php
/**
 * Script de Diagnostic Coffice
 * Teste toutes les liaisons et configurations de l'application
 *
 * Usage CLI: php diagnostic.php
 * Usage Web: Accéder via navigateur (à sécuriser en production)
 */

error_reporting(E_ALL);
ini_set('display_errors', 1);

class CoffficeDiagnostic {
    private $results = [];
    private $errors = [];
    private $warnings = [];
    private $success = [];
    private $dbConnection = null;
    private $config = [];

    public function __construct() {
        $this->loadEnvironment();
    }

    private function loadEnvironment() {
        $envFile = dirname(__DIR__) . '/.env';
        if (file_exists($envFile)) {
            $lines = file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
            foreach ($lines as $line) {
                if (strpos(trim($line), '#') === 0) continue;
                list($key, $value) = explode('=', $line, 2);
                $this->config[trim($key)] = trim($value);
            }
        }
    }

    public function runAllTests() {
        $this->printHeader("🔍 DIAGNOSTIC COFFICE - DÉBUT DES TESTS");

        $this->testPHPConfiguration();
        $this->testFilePermissions();
        $this->testEnvironmentVariables();
        $this->testDatabaseConnection();
        $this->testDatabaseStructure();
        $this->testAPIEndpoints();
        $this->testCORS();
        $this->testAuthentication();
        $this->testCriticalFunctionalities();

        $this->printSummary();
    }

    private function testPHPConfiguration() {
        $this->printSection("⚙️ Configuration PHP");

        $requiredExtensions = ['pdo', 'pdo_mysql', 'json', 'openssl', 'mbstring', 'curl'];
        foreach ($requiredExtensions as $ext) {
            if (extension_loaded($ext)) {
                $this->addSuccess("Extension PHP '$ext' : OK");
            } else {
                $this->addError("Extension PHP '$ext' : MANQUANTE");
            }
        }

        $phpVersion = PHP_VERSION;
        if (version_compare($phpVersion, '7.4.0', '>=')) {
            $this->addSuccess("Version PHP $phpVersion : OK");
        } else {
            $this->addError("Version PHP $phpVersion : Trop ancienne (min 7.4)");
        }

        $memoryLimit = ini_get('memory_limit');
        $this->addInfo("Limite mémoire PHP : $memoryLimit");

        $maxExecutionTime = ini_get('max_execution_time');
        $this->addInfo("Temps d'exécution max : $maxExecutionTime secondes");

        if (function_exists('apache_get_modules')) {
            $modules = apache_get_modules();
            $requiredModules = ['mod_rewrite', 'mod_headers'];
            foreach ($requiredModules as $module) {
                if (in_array($module, $modules)) {
                    $this->addSuccess("Module Apache '$module' : OK");
                } else {
                    $this->addWarning("Module Apache '$module' : Non détecté");
                }
            }
        }
    }

    private function testFilePermissions() {
        $this->printSection("📁 Permissions des fichiers");

        $paths = [
            'api' => dirname(__DIR__) . '/api',
            'logs (si existe)' => dirname(__DIR__) . '/logs',
            '.env' => dirname(__DIR__) . '/.env',
            'public' => dirname(__DIR__) . '/public',
            'dist' => dirname(__DIR__) . '/dist',
        ];

        foreach ($paths as $name => $path) {
            if (file_exists($path)) {
                if (is_readable($path)) {
                    $perms = substr(sprintf('%o', fileperms($path)), -4);
                    $this->addSuccess("$name : Lisible (perms: $perms)");

                    if (is_dir($path) && !is_writable($path)) {
                        $this->addWarning("$name : Non inscriptible (peut causer des problèmes)");
                    }
                } else {
                    $this->addError("$name : Non lisible");
                }
            } else {
                $this->addWarning("$name : N'existe pas");
            }
        }

        $htaccessFiles = [
            dirname(__DIR__) . '/.htaccess',
            dirname(__DIR__) . '/api/.htaccess',
            dirname(__DIR__) . '/dist/.htaccess',
        ];

        foreach ($htaccessFiles as $htaccess) {
            if (file_exists($htaccess)) {
                $this->addSuccess(".htaccess trouvé : " . basename(dirname($htaccess)));
            } else {
                $this->addWarning(".htaccess manquant : " . basename(dirname($htaccess)));
            }
        }
    }

    private function testEnvironmentVariables() {
        $this->printSection("🔐 Variables d'environnement");

        $requiredVars = [
            'DB_HOST' => 'Hôte de la base de données',
            'DB_NAME' => 'Nom de la base de données',
            'DB_USER' => 'Utilisateur de la base de données',
            'DB_PASSWORD' => 'Mot de passe de la base de données',
            'JWT_SECRET' => 'Clé secrète JWT',
        ];

        foreach ($requiredVars as $var => $description) {
            if (isset($this->config[$var]) && !empty($this->config[$var])) {
                if ($var === 'DB_PASSWORD' || $var === 'JWT_SECRET') {
                    $length = strlen($this->config[$var]);
                    $this->addSuccess("$var : Défini ($length caractères)");

                    if ($length < 16) {
                        $this->addWarning("$var : Trop court (min recommandé: 16 caractères)");
                    }
                } else {
                    $this->addSuccess("$var : " . $this->config[$var]);
                }
            } else {
                $this->addError("$var : MANQUANT ($description)");
            }
        }
    }

    private function testDatabaseConnection() {
        $this->printSection("🗄️ Connexion à la base de données");

        if (!isset($this->config['DB_HOST']) || !isset($this->config['DB_NAME']) ||
            !isset($this->config['DB_USER']) || !isset($this->config['DB_PASSWORD'])) {
            $this->addError("Configuration de base de données incomplète");
            return;
        }

        try {
            $dsn = "mysql:host={$this->config['DB_HOST']};dbname={$this->config['DB_NAME']};charset=utf8mb4";
            $this->dbConnection = new PDO($dsn, $this->config['DB_USER'], $this->config['DB_PASSWORD']);
            $this->dbConnection->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

            $this->addSuccess("Connexion MySQL réussie");

            $stmt = $this->dbConnection->query("SELECT VERSION()");
            $version = $stmt->fetchColumn();
            $this->addSuccess("Version MySQL : $version");

            $stmt = $this->dbConnection->query("SELECT DATABASE()");
            $dbName = $stmt->fetchColumn();
            $this->addSuccess("Base de données active : $dbName");

            $stmt = $this->dbConnection->query("SHOW VARIABLES LIKE 'character_set_database'");
            $charset = $stmt->fetch(PDO::FETCH_ASSOC);
            if ($charset['Value'] === 'utf8mb4') {
                $this->addSuccess("Charset de la base : utf8mb4");
            } else {
                $this->addWarning("Charset de la base : {$charset['Value']} (utf8mb4 recommandé)");
            }

        } catch (PDOException $e) {
            $this->addError("Connexion MySQL échouée : " . $e->getMessage());
            $this->dbConnection = null;
        }
    }

    private function testDatabaseStructure() {
        $this->printSection("🏗️ Structure de la base de données");

        if (!$this->dbConnection) {
            $this->addError("Pas de connexion à la base de données");
            return;
        }

        $requiredTables = [
            'users' => ['id', 'email', 'password_hash', 'nom', 'prenom', 'role'],
            'espaces' => ['id', 'nom', 'type', 'capacite', 'prix_heure', 'prix_jour'],
            'reservations' => ['id', 'user_id', 'espace_id', 'date_debut', 'date_fin', 'statut'],
            'domiciliations' => ['id', 'user_id', 'statut', 'date_debut', 'date_fin'],
            'codes_promo' => ['id', 'code', 'valeur', 'type', 'actif'],
            'parrainages' => ['id', 'parrain_id', 'code_parrain'],
            'parrainages_details' => ['id', 'parrainage_id', 'filleul_id', 'statut'],
        ];

        try {
            $stmt = $this->dbConnection->query("SHOW TABLES");
            $tables = $stmt->fetchAll(PDO::FETCH_COLUMN);

            $this->addInfo("Tables trouvées : " . count($tables));

            foreach ($requiredTables as $tableName => $requiredColumns) {
                if (in_array($tableName, $tables)) {
                    $this->addSuccess("Table '$tableName' : Existe");

                    $stmt = $this->dbConnection->query("DESCRIBE `$tableName`");
                    $columns = $stmt->fetchAll(PDO::FETCH_COLUMN);

                    $missingColumns = array_diff($requiredColumns, $columns);
                    if (empty($missingColumns)) {
                        $this->addSuccess("  Colonnes requises : OK");
                    } else {
                        $this->addWarning("  Colonnes manquantes : " . implode(', ', $missingColumns));
                    }

                    $stmt = $this->dbConnection->query("SELECT COUNT(*) FROM `$tableName`");
                    $count = $stmt->fetchColumn();
                    $this->addInfo("  Nombre d'enregistrements : $count");

                } else {
                    $this->addError("Table '$tableName' : MANQUANTE");
                }
            }

            $stmt = $this->dbConnection->prepare("
                SELECT TABLE_NAME, ENGINE, TABLE_COLLATION
                FROM information_schema.TABLES
                WHERE TABLE_SCHEMA = ?
            ");
            $stmt->execute([$this->config['DB_NAME']]);

            while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                if ($row['ENGINE'] !== 'InnoDB') {
                    $this->addWarning("Table {$row['TABLE_NAME']} : Moteur {$row['ENGINE']} (InnoDB recommandé)");
                }
            }

        } catch (PDOException $e) {
            $this->addError("Erreur lors de la vérification de la structure : " . $e->getMessage());
        }
    }

    private function testAPIEndpoints() {
        $this->printSection("🌐 Endpoints API");

        $baseUrl = $this->getBaseUrl();

        $endpoints = [
            'GET /api/espaces/index.php' => ['method' => 'GET', 'auth' => false],
            'GET /api/auth/debug.php' => ['method' => 'GET', 'auth' => false],
            'POST /api/auth/login.php' => ['method' => 'POST', 'auth' => false],
        ];

        foreach ($endpoints as $endpoint => $config) {
            $url = $baseUrl . '/' . ltrim(explode(' ', $endpoint)[1], '/');

            $ch = curl_init($url);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
            curl_setopt($ch, CURLOPT_TIMEOUT, 10);
            curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
            curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $config['method']);

            if ($config['method'] === 'POST') {
                curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode([]));
                curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
            }

            $response = curl_exec($ch);
            $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            $error = curl_error($ch);
            curl_close($ch);

            if ($error) {
                $this->addError("$endpoint : Erreur CURL - $error");
            } elseif ($httpCode >= 200 && $httpCode < 500) {
                $this->addSuccess("$endpoint : Accessible (HTTP $httpCode)");

                $json = json_decode($response, true);
                if (json_last_error() === JSON_ERROR_NONE) {
                    $this->addSuccess("  Réponse JSON valide");
                } else {
                    $this->addWarning("  Réponse non-JSON");
                }
            } else {
                $this->addError("$endpoint : HTTP $httpCode");
            }
        }
    }

    private function testCORS() {
        $this->printSection("🔓 Configuration CORS");

        $baseUrl = $this->getBaseUrl();
        $testUrl = $baseUrl . '/api/espaces/index.php';

        $ch = curl_init($testUrl);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_HEADER, true);
        curl_setopt($ch, CURLOPT_NOBODY, true);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);

        $response = curl_exec($ch);
        curl_close($ch);

        $requiredHeaders = [
            'Access-Control-Allow-Origin',
            'Access-Control-Allow-Methods',
            'Access-Control-Allow-Headers',
        ];

        foreach ($requiredHeaders as $header) {
            if (stripos($response, $header) !== false) {
                $this->addSuccess("Header CORS '$header' : Présent");
            } else {
                $this->addWarning("Header CORS '$header' : Absent");
            }
        }
    }

    private function testAuthentication() {
        $this->printSection("🔑 Système d'authentification");

        if (!isset($this->config['JWT_SECRET']) || empty($this->config['JWT_SECRET'])) {
            $this->addError("JWT_SECRET non configuré");
            return;
        }

        $this->addSuccess("JWT_SECRET configuré");

        $authFile = dirname(__DIR__) . '/api/utils/Auth.php';
        if (file_exists($authFile)) {
            $this->addSuccess("Fichier Auth.php : Existe");

            $content = file_get_contents($authFile);
            if (strpos($content, 'jwt') !== false || strpos($content, 'JWT') !== false) {
                $this->addSuccess("Implémentation JWT détectée");
            }
        } else {
            $this->addError("Fichier Auth.php : MANQUANT");
        }

        if ($this->dbConnection) {
            try {
                $stmt = $this->dbConnection->query("
                    SELECT COUNT(*) FROM users WHERE role = 'admin'
                ");
                $adminCount = $stmt->fetchColumn();

                if ($adminCount > 0) {
                    $this->addSuccess("Administrateurs trouvés : $adminCount");
                } else {
                    $this->addWarning("Aucun administrateur trouvé");
                }

            } catch (PDOException $e) {
                $this->addWarning("Impossible de vérifier les admins : " . $e->getMessage());
            }
        }
    }

    private function testCriticalFunctionalities() {
        $this->printSection("⚡ Fonctionnalités critiques");

        if ($this->dbConnection) {
            try {
                $stmt = $this->dbConnection->prepare("
                    SELECT e.*,
                           COUNT(r.id) as nombre_reservations
                    FROM espaces e
                    LEFT JOIN reservations r ON e.id = r.espace_id
                    GROUP BY e.id
                    LIMIT 5
                ");
                $stmt->execute();
                $this->addSuccess("Requête espaces/réservations : OK");

                $stmt = $this->dbConnection->query("
                    SELECT * FROM codes_promo WHERE actif = 1 LIMIT 1
                ");
                $this->addSuccess("Système codes promo : OK");

                $stmt = $this->dbConnection->query("
                    SELECT COUNT(*) FROM domiciliations WHERE statut = 'active'
                ");
                $activeCount = $stmt->fetchColumn();
                $this->addInfo("Domiciliations actives : $activeCount");

                $stmt = $this->dbConnection->query("
                    SELECT COUNT(*) FROM parrainages
                ");
                $parrainCount = $stmt->fetchColumn();
                $this->addInfo("Parrainages enregistrés : $parrainCount");

            } catch (PDOException $e) {
                $this->addError("Erreur fonctionnalités : " . $e->getMessage());
            }
        }

        $criticalFiles = [
            '/api/reservations/create.php' => 'Création de réservations',
            '/api/auth/login.php' => 'Connexion utilisateur',
            '/api/domiciliations/create.php' => 'Création domiciliation',
            '/api/codes-promo/validate.php' => 'Validation codes promo',
        ];

        foreach ($criticalFiles as $file => $description) {
            $fullPath = dirname(__DIR__) . $file;
            if (file_exists($fullPath) && is_readable($fullPath)) {
                $this->addSuccess("$description : Fichier OK");
            } else {
                $this->addError("$description : Fichier problématique");
            }
        }
    }

    private function getBaseUrl() {
        if (php_sapi_name() === 'cli') {
            return isset($this->config['BASE_URL']) ? $this->config['BASE_URL'] : 'http://localhost';
        }

        $protocol = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
        $host = $_SERVER['HTTP_HOST'] ?? 'localhost';
        return "$protocol://$host";
    }

    private function printHeader($text) {
        $this->output("\n" . str_repeat("=", 70));
        $this->output($text);
        $this->output(str_repeat("=", 70) . "\n");
    }

    private function printSection($text) {
        $this->output("\n" . $text);
        $this->output(str_repeat("-", 70));
    }

    private function addSuccess($message) {
        $this->success[] = $message;
        $this->output("✅ " . $message, 'green');
    }

    private function addWarning($message) {
        $this->warnings[] = $message;
        $this->output("⚠️  " . $message, 'yellow');
    }

    private function addError($message) {
        $this->errors[] = $message;
        $this->output("❌ " . $message, 'red');
    }

    private function addInfo($message) {
        $this->output("ℹ️  " . $message, 'blue');
    }

    private function output($message, $color = null) {
        if (php_sapi_name() === 'cli') {
            $colors = [
                'green' => "\033[32m",
                'yellow' => "\033[33m",
                'red' => "\033[31m",
                'blue' => "\033[34m",
                'reset' => "\033[0m"
            ];

            if ($color && isset($colors[$color])) {
                echo $colors[$color] . $message . $colors['reset'] . "\n";
            } else {
                echo $message . "\n";
            }
        } else {
            $colorMap = [
                'green' => '#22c55e',
                'yellow' => '#eab308',
                'red' => '#ef4444',
                'blue' => '#3b82f6',
            ];

            $style = $color && isset($colorMap[$color]) ? "color: {$colorMap[$color]};" : "";
            echo "<div style='$style font-family: monospace;'>" . htmlspecialchars($message) . "</div>";
        }
    }

    private function printSummary() {
        $this->printHeader("📊 RÉSUMÉ DU DIAGNOSTIC");

        $total = count($this->success) + count($this->warnings) + count($this->errors);

        $this->output("\nTests réussis   : " . count($this->success) . " ✅", 'green');
        $this->output("Avertissements : " . count($this->warnings) . " ⚠️", 'yellow');
        $this->output("Erreurs        : " . count($this->errors) . " ❌", 'red');
        $this->output("\nTotal          : $total tests\n");

        if (count($this->errors) > 0) {
            $this->output("\n🔴 PROBLÈMES CRITIQUES À RÉSOUDRE :", 'red');
            foreach ($this->errors as $error) {
                $this->output("  • $error");
            }
        }

        if (count($this->warnings) > 0) {
            $this->output("\n🟡 AVERTISSEMENTS À VÉRIFIER :", 'yellow');
            foreach ($this->warnings as $warning) {
                $this->output("  • $warning");
            }
        }

        if (count($this->errors) === 0 && count($this->warnings) === 0) {
            $this->output("\n🎉 TOUT EST OPÉRATIONNEL ! L'application est prête pour la production.", 'green');
        } elseif (count($this->errors) === 0) {
            $this->output("\n✅ Système fonctionnel avec quelques avertissements mineurs.", 'green');
        } else {
            $this->output("\n⚠️  Veuillez corriger les erreurs critiques avant de mettre en production.", 'red');
        }

        $this->output("\n" . str_repeat("=", 70) . "\n");
    }
}

if (php_sapi_name() !== 'cli') {
    echo '<!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>Diagnostic Coffice</title>
        <style>
            body {
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
                max-width: 1200px;
                margin: 40px auto;
                padding: 20px;
                background: #f5f5f5;
            }
            .container {
                background: white;
                padding: 30px;
                border-radius: 8px;
                box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            }
        </style>
    </head>
    <body>
        <div class="container">';
}

$diagnostic = new CoffficeDiagnostic();
$diagnostic->runAllTests();

if (php_sapi_name() !== 'cli') {
    echo '</div></body></html>';
}
