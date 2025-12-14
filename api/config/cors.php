<?php
/**
 * Configuration CORS et chargement .env
 */

// Charger le fichier .env si il existe
$envFile = __DIR__ . '/../.env';
if (file_exists($envFile)) {
    $lines = file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        // Ignorer les commentaires et lignes vides
        $line = trim($line);
        if ($line === '' || strpos($line, '#') === 0) {
            continue;
        }

        // Parser la ligne KEY=VALUE
        if (strpos($line, '=') !== false) {
            list($key, $value) = explode('=', $line, 2);
            $key = trim($key);
            $value = trim($value);

            // Enlever les guillemets si présents
            $value = trim($value, '"\'');

            // Définir la variable d'environnement
            putenv("$key=$value");
            $_ENV[$key] = $value;
        }
    }
}

// Configuration CORS sécurisée
$allowed_origins = [
    'https://test.coffice.dz',
    'https://coffice.dz',
    'https://www.coffice.dz',
    'http://localhost:5173', // Développement Vite
    'http://localhost:3000'  // Développement alternatif
];

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';

// Vérifier si l'origine est autorisée
if (in_array($origin, $allowed_origins)) {
    header("Access-Control-Allow-Origin: $origin");
    header("Access-Control-Allow-Credentials: true");
} elseif ($_ENV['APP_ENV'] === 'development' || getenv('APP_ENV') === 'development') {
    // En développement, autoriser toutes les origines
    header("Access-Control-Allow-Origin: *");
}

header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Gérer les requêtes OPTIONS (preflight)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}
?>
