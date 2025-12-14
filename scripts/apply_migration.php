<?php
/**
 * Script d'application des migrations
 * Applique automatiquement les migrations SQL à la base de données
 *
 * Usage: php scripts/apply_migration.php [nom_du_fichier_migration]
 */

error_reporting(E_ALL);
ini_set('display_errors', 1);

class MigrationRunner {
    private $db;
    private $config = [];

    public function __construct() {
        $this->loadEnvironment();
        $this->connect();
    }

    private function loadEnvironment() {
        $envFile = dirname(__DIR__) . '/.env';
        if (!file_exists($envFile)) {
            $this->error("Fichier .env introuvable");
        }

        $lines = file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
        foreach ($lines as $line) {
            if (strpos(trim($line), '#') === 0) continue;
            list($key, $value) = explode('=', $line, 2);
            $this->config[trim($key)] = trim($value);
        }
    }

    private function connect() {
        try {
            $dsn = "mysql:host={$this->config['DB_HOST']};dbname={$this->config['DB_NAME']};charset=utf8mb4";
            $this->db = new PDO($dsn, $this->config['DB_USER'], $this->config['DB_PASSWORD']);
            $this->db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            $this->success("Connexion à la base de données réussie");
        } catch (PDOException $e) {
            $this->error("Erreur de connexion : " . $e->getMessage());
        }
    }

    public function applyMigration($migrationFile) {
        $this->info("\n" . str_repeat("=", 70));
        $this->info("APPLICATION DE LA MIGRATION");
        $this->info(str_repeat("=", 70) . "\n");

        $migrationPath = dirname(__DIR__) . '/database/migrations/' . $migrationFile;

        if (!file_exists($migrationPath)) {
            $this->error("Fichier de migration introuvable : $migrationPath");
        }

        $this->info("📄 Fichier : $migrationFile");
        $this->info("📍 Chemin : $migrationPath\n");

        // Créer un backup avant la migration
        $this->createBackup();

        // Lire le contenu du fichier
        $sql = file_get_contents($migrationPath);

        if (empty($sql)) {
            $this->error("Le fichier de migration est vide");
        }

        // Diviser en requêtes individuelles
        $statements = $this->parseSQL($sql);

        $this->info("🔢 Nombre de requêtes à exécuter : " . count($statements) . "\n");

        $executed = 0;
        $failed = 0;

        foreach ($statements as $index => $statement) {
            $statement = trim($statement);
            if (empty($statement)) continue;

            try {
                $this->db->exec($statement);
                $executed++;
                $this->success("✓ Requête " . ($index + 1) . " exécutée");
            } catch (PDOException $e) {
                $failed++;

                // Certaines erreurs peuvent être ignorées
                $ignorableErrors = [
                    'Duplicate column name',
                    'Duplicate key name',
                    'already exists',
                ];

                $canIgnore = false;
                foreach ($ignorableErrors as $ignorable) {
                    if (stripos($e->getMessage(), $ignorable) !== false) {
                        $canIgnore = true;
                        break;
                    }
                }

                if ($canIgnore) {
                    $this->warning("⚠ Requête " . ($index + 1) . " ignorée (déjà appliquée)");
                } else {
                    $this->error("✗ Requête " . ($index + 1) . " échouée : " . $e->getMessage(), false);
                }
            }
        }

        $this->info("\n" . str_repeat("=", 70));
        $this->info("RÉSUMÉ");
        $this->info(str_repeat("=", 70));
        $this->success("✅ Requêtes exécutées : $executed");
        if ($failed > 0) {
            $this->warning("⚠️  Requêtes échouées/ignorées : $failed");
        }
        $this->info(str_repeat("=", 70) . "\n");

        if ($failed === 0) {
            $this->success("🎉 Migration appliquée avec succès !");
        } else {
            $this->warning("⚠️  Migration appliquée avec quelques avertissements");
        }
    }

    private function createBackup() {
        $this->info("💾 Création d'un backup de sécurité...");

        $backupDir = dirname(__DIR__) . '/database/backups';
        if (!is_dir($backupDir)) {
            mkdir($backupDir, 0755, true);
        }

        $backupFile = $backupDir . '/backup_' . date('Y-m-d_H-i-s') . '.sql';

        $command = sprintf(
            'mysqldump -h %s -u %s -p%s %s > %s 2>&1',
            escapeshellarg($this->config['DB_HOST']),
            escapeshellarg($this->config['DB_USER']),
            escapeshellarg($this->config['DB_PASSWORD']),
            escapeshellarg($this->config['DB_NAME']),
            escapeshellarg($backupFile)
        );

        exec($command, $output, $returnCode);

        if ($returnCode === 0 && file_exists($backupFile)) {
            $size = $this->formatBytes(filesize($backupFile));
            $this->success("✓ Backup créé : $backupFile ($size)\n");
        } else {
            $this->warning("⚠ Impossible de créer le backup automatique");
            $this->warning("Continuez-vous quand même ? (y/N) : ");

            if (php_sapi_name() === 'cli') {
                $handle = fopen("php://stdin", "r");
                $line = trim(fgets($handle));
                fclose($handle);

                if (strtolower($line) !== 'y') {
                    $this->error("Migration annulée par l'utilisateur");
                }
            }
            echo "\n";
        }
    }

    private function parseSQL($sql) {
        // Retirer les commentaires
        $sql = preg_replace('/^--.*$/m', '', $sql);
        $sql = preg_replace('/\/\*.*?\*\//s', '', $sql);

        // Diviser par point-virgule (en ignorant ceux dans les chaînes)
        $statements = [];
        $current = '';
        $inString = false;
        $stringChar = '';

        for ($i = 0; $i < strlen($sql); $i++) {
            $char = $sql[$i];

            if (($char === '"' || $char === "'") && ($i === 0 || $sql[$i - 1] !== '\\')) {
                if (!$inString) {
                    $inString = true;
                    $stringChar = $char;
                } elseif ($char === $stringChar) {
                    $inString = false;
                }
            }

            if ($char === ';' && !$inString) {
                $statements[] = $current;
                $current = '';
            } else {
                $current .= $char;
            }
        }

        if (!empty(trim($current))) {
            $statements[] = $current;
        }

        return array_filter($statements, function($stmt) {
            return !empty(trim($stmt));
        });
    }

    private function formatBytes($bytes) {
        $units = ['B', 'KB', 'MB', 'GB'];
        $i = 0;
        while ($bytes >= 1024 && $i < count($units) - 1) {
            $bytes /= 1024;
            $i++;
        }
        return round($bytes, 2) . ' ' . $units[$i];
    }

    private function success($message) {
        $this->output($message, 'green');
    }

    private function warning($message) {
        $this->output($message, 'yellow');
    }

    private function error($message, $exit = true) {
        $this->output($message, 'red');
        if ($exit) {
            exit(1);
        }
    }

    private function info($message) {
        $this->output($message);
    }

    private function output($message, $color = null) {
        if (php_sapi_name() === 'cli') {
            $colors = [
                'green' => "\033[32m",
                'yellow' => "\033[33m",
                'red' => "\033[31m",
                'reset' => "\033[0m"
            ];

            if ($color && isset($colors[$color])) {
                echo $colors[$color] . $message . $colors['reset'] . "\n";
            } else {
                echo $message . "\n";
            }
        } else {
            echo $message . "<br>";
        }
    }
}

// Exécution du script
if (php_sapi_name() === 'cli') {
    $migrationFile = $argv[1] ?? 'fix_structure_prod.sql';

    echo "\n";
    echo "╔════════════════════════════════════════════════════════════════════╗\n";
    echo "║          COFFICE - Script d'Application de Migration              ║\n";
    echo "╚════════════════════════════════════════════════════════════════════╝\n";
    echo "\n";

    $runner = new MigrationRunner();
    $runner->applyMigration($migrationFile);

    echo "\n";
} else {
    echo "<!DOCTYPE html>
    <html>
    <head>
        <meta charset='UTF-8'>
        <title>Application de Migration</title>
        <style>
            body {
                font-family: monospace;
                max-width: 1200px;
                margin: 40px auto;
                padding: 20px;
                background: #1a1a1a;
                color: #00ff00;
            }
            .container {
                background: #000;
                padding: 30px;
                border: 2px solid #00ff00;
                border-radius: 8px;
            }
        </style>
    </head>
    <body>
        <div class='container'>";

    $migrationFile = $_GET['file'] ?? 'fix_structure_prod.sql';
    $runner = new MigrationRunner();
    $runner->applyMigration($migrationFile);

    echo "</div></body></html>";
}
