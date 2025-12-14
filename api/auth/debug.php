<?php
/**
 * ENDPOINT DE DIAGNOSTIC - AUTHENTIFICATION JWT
 * GET /api/auth/debug.php
 *
 * Test COMPLET de la chaîne d'authentification
 * Utilisez cet endpoint pour diagnostiquer les problèmes de 401
 */

require_once '../config/cors.php';
require_once '../utils/Auth.php';

header('Content-Type: application/json');

$debug = [];

// 1. Tester la récupération du header Authorization
$debug['step_1_check_headers'] = [
    'description' => 'Vérification de tous les emplacements possibles du header Authorization',
    'methods' => []
];

// Méthode 1: getallheaders()
if (function_exists('getallheaders')) {
    $headers = getallheaders();
    $debug['step_1_check_headers']['methods']['getallheaders'] = [
        'available' => true,
        'authorization' => $headers['Authorization'] ?? $headers['authorization'] ?? null
    ];
} else {
    $debug['step_1_check_headers']['methods']['getallheaders'] = ['available' => false];
}

// Méthode 2: $_SERVER
$debug['step_1_check_headers']['methods']['$_SERVER'] = [
    'HTTP_AUTHORIZATION' => $_SERVER['HTTP_AUTHORIZATION'] ?? null,
    'REDIRECT_HTTP_AUTHORIZATION' => $_SERVER['REDIRECT_HTTP_AUTHORIZATION'] ?? null
];

// Méthode 3: apache_request_headers()
if (function_exists('apache_request_headers')) {
    $headers = apache_request_headers();
    $debug['step_1_check_headers']['methods']['apache_request_headers'] = [
        'available' => true,
        'authorization' => $headers['Authorization'] ?? $headers['authorization'] ?? null
    ];
} else {
    $debug['step_1_check_headers']['methods']['apache_request_headers'] = ['available' => false];
}

// Méthode 4: getenv()
$debug['step_1_check_headers']['methods']['getenv'] = [
    'HTTP_AUTHORIZATION' => getenv('HTTP_AUTHORIZATION') ?: null,
    'REDIRECT_HTTP_AUTHORIZATION' => getenv('REDIRECT_HTTP_AUTHORIZATION') ?: null
];

// Méthode 5: $_ENV
$debug['step_1_check_headers']['methods']['$_ENV'] = [
    'HTTP_AUTHORIZATION' => $_ENV['HTTP_AUTHORIZATION'] ?? null,
    'REDIRECT_HTTP_AUTHORIZATION' => $_ENV['REDIRECT_HTTP_AUTHORIZATION'] ?? null
];

// 2. Tester getBearerToken() avec debug
$debug['step_2_extract_token'] = [
    'description' => 'Extraction du token Bearer depuis le header'
];

$token = Auth::getBearerToken(true);
$debug['step_2_extract_token']['token_found'] = $token !== null;
$debug['step_2_extract_token']['token_preview'] = $token ? substr($token, 0, 30) . '...' : null;

// 3. Si token trouvé, tester la validation
if ($token) {
    $debug['step_3_validate_token'] = [
        'description' => 'Validation du token JWT'
    ];

    // Récupérer la clé secrète utilisée
    $reflection = new ReflectionClass('Auth');
    $method = $reflection->getMethod('getSecretKey');
    $method->setAccessible(true);
    $secret = $method->invoke(null);

    $debug['step_3_validate_token']['secret_key_preview'] = substr($secret, 0, 20) . '...';

    // Tester la validation
    try {
        $userData = Auth::validateToken($token);

        if ($userData) {
            $debug['step_3_validate_token']['valid'] = true;
            $debug['step_3_validate_token']['user_data'] = [
                'id' => $userData->id,
                'email' => $userData->email,
                'role' => $userData->role
            ];
            $debug['step_3_validate_token']['expiration'] = date('Y-m-d H:i:s', $userData->exp);
            $debug['step_3_validate_token']['expired'] = $userData->exp < time();
        } else {
            $debug['step_3_validate_token']['valid'] = false;
            $debug['step_3_validate_token']['error'] = 'validateToken returned false';
        }
    } catch (Exception $e) {
        $debug['step_3_validate_token']['valid'] = false;
        $debug['step_3_validate_token']['error'] = $e->getMessage();
    }
} else {
    $debug['step_3_validate_token'] = [
        'description' => 'Validation du token JWT',
        'skipped' => 'No token found in step 2'
    ];
}

// 4. Environnement et configuration
$debug['step_4_environment'] = [
    'description' => 'Vérification de l\'environnement',
    'php_version' => phpversion(),
    'server_software' => $_SERVER['SERVER_SOFTWARE'] ?? 'Unknown',
    'request_method' => $_SERVER['REQUEST_METHOD'],
    'request_uri' => $_SERVER['REQUEST_URI'] ?? null,
    'env_file_exists' => file_exists(__DIR__ . '/../.env') || file_exists(__DIR__ . '/../../.env')
];

// 5. Résultat final
$all_steps_ok =
    $token !== null &&
    isset($debug['step_3_validate_token']['valid']) &&
    $debug['step_3_validate_token']['valid'] === true &&
    (!isset($debug['step_3_validate_token']['expired']) || $debug['step_3_validate_token']['expired'] === false);

$debug['result'] = [
    'authentication_working' => $all_steps_ok,
    'summary' => $all_steps_ok
        ? 'Authentication chain is working correctly'
        : 'Authentication chain has issues - check details above'
];

// Afficher le debug
echo json_encode($debug, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
?>
