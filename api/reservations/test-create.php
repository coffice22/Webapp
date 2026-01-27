<?php

require_once '../config/cors.php';
require_once '../config/database.php';
require_once '../utils/Auth.php';
require_once '../utils/Response.php';
require_once '../utils/UuidHelper.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    Response::error("Methode non autorisee", 405);
}

$debug = [
    'php_version' => phpversion(),
    'timestamp' => date('Y-m-d H:i:s'),
    'steps' => []
];

try {
    $debug['steps'][] = '1. Starting test-create';

    $auth = Auth::verifyAuth();
    $userId = $auth['id'];
    $debug['steps'][] = '2. Auth OK - User ID: ' . substr($userId, 0, 8) . '...';

    $input = file_get_contents("php://input");
    $data = json_decode($input, true);
    $debug['steps'][] = '3. JSON parsed';
    $debug['input_received'] = $data;

    if (!$data) {
        Response::json(['success' => false, 'error' => 'Donnees JSON invalides', 'debug' => $debug]);
        exit;
    }

    $espaceId = $data['espace_id'] ?? null;
    $dateDebut = $data['date_debut'] ?? null;
    $dateFin = $data['date_fin'] ?? null;
    $participants = isset($data['participants']) ? intval($data['participants']) : 1;
    $notes = isset($data['notes']) ? trim($data['notes']) : '';

    $debug['parsed_data'] = [
        'espace_id' => $espaceId,
        'date_debut' => $dateDebut,
        'date_fin' => $dateFin,
        'participants' => $participants
    ];
    $debug['steps'][] = '4. Data extracted';

    if (empty($espaceId)) {
        Response::json(['success' => false, 'error' => "L'espace est requis", 'debug' => $debug]);
        exit;
    }

    if (empty($dateDebut) || empty($dateFin)) {
        Response::json(['success' => false, 'error' => 'Dates requises', 'debug' => $debug]);
        exit;
    }

    $dateDebut = str_replace(['T', 'Z'], [' ', ''], $dateDebut);
    $dateDebut = preg_replace('/\.\d{3}$/', '', $dateDebut);
    $dateFin = str_replace(['T', 'Z'], [' ', ''], $dateFin);
    $dateFin = preg_replace('/\.\d{3}$/', '', $dateFin);

    $debug['dates_converted'] = [
        'debut' => $dateDebut,
        'fin' => $dateFin
    ];
    $debug['steps'][] = '5. Dates converted';

    $debut = strtotime($dateDebut);
    $fin = strtotime($dateFin);

    if ($debut === false || $fin === false) {
        Response::json(['success' => false, 'error' => 'Format date invalide', 'debug' => $debug]);
        exit;
    }

    $debutMysql = date('Y-m-d H:i:s', $debut);
    $finMysql = date('Y-m-d H:i:s', $fin);
    $debug['mysql_dates'] = ['debut' => $debutMysql, 'fin' => $finMysql];
    $debug['steps'][] = '6. MySQL dates ready';

    $db = Database::getInstance()->getConnection();
    $debug['steps'][] = '7. Database connected';

    $stmt = $db->prepare("SELECT id, nom, type, capacite, prix_heure, prix_jour, disponible FROM espaces WHERE id = ?");
    $stmt->execute([$espaceId]);
    $espace = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$espace) {
        Response::json(['success' => false, 'error' => "Espace introuvable avec ID: $espaceId", 'debug' => $debug]);
        exit;
    }

    $debug['espace_found'] = $espace;
    $debug['steps'][] = '8. Espace found: ' . $espace['nom'];

    if (!$espace['disponible']) {
        Response::json(['success' => false, 'error' => "Espace non disponible", 'debug' => $debug]);
        exit;
    }
    $debug['steps'][] = '9. Espace is available';

    if ($participants > $espace['capacite']) {
        $participants = $espace['capacite'];
    }

    $stmt = $db->prepare("
        SELECT id FROM reservations
        WHERE espace_id = ?
        AND statut NOT IN ('annulee', 'terminee')
        AND (
            (date_debut < ? AND date_fin > ?)
            OR (date_debut < ? AND date_fin > ?)
            OR (date_debut >= ? AND date_fin <= ?)
        )
        LIMIT 1
    ");
    $stmt->execute([
        $espaceId,
        $finMysql, $debutMysql,
        $finMysql, $debutMysql,
        $debutMysql, $finMysql
    ]);
    $existingReservation = $stmt->fetch();
    $debug['steps'][] = '10. Conflict check done';

    if ($existingReservation) {
        Response::json(['success' => false, 'error' => 'Creneau deja reserve', 'debug' => $debug]);
        exit;
    }
    $debug['steps'][] = '11. No conflict found';

    $heures = ($fin - $debut) / 3600;
    $prixHeure = floatval($espace['prix_heure']);
    $prixJour = floatval($espace['prix_jour']);

    if ($heures <= 4) {
        $montant = ceil($heures) * $prixHeure;
        $type = 'heure';
    } elseif ($heures <= 8) {
        $montant = $prixJour / 2;
        $type = 'demi_journee';
    } elseif ($heures <= 24) {
        $montant = $prixJour;
        $type = 'jour';
    } else {
        $jours = ceil($heures / 24);
        $montant = $jours * $prixJour;
        $type = 'jour';
    }

    $debug['pricing'] = [
        'heures' => $heures,
        'type' => $type,
        'montant' => $montant
    ];
    $debug['steps'][] = '12. Pricing calculated';

    $id = UuidHelper::generate();
    $debug['steps'][] = '13. UUID generated: ' . substr($id, 0, 8) . '...';

    $stmt = $db->prepare("
        INSERT INTO reservations
        (id, user_id, espace_id, date_debut, date_fin, statut, type_reservation, montant_total, montant_paye, participants, notes, created_at)
        VALUES (?, ?, ?, ?, ?, 'en_attente', ?, ?, 0, ?, ?, NOW())
    ");

    $debug['insert_params'] = [
        'id' => substr($id, 0, 8) . '...',
        'user_id' => substr($userId, 0, 8) . '...',
        'espace_id' => substr($espaceId, 0, 8) . '...',
        'date_debut' => $debutMysql,
        'date_fin' => $finMysql,
        'type' => $type,
        'montant' => $montant,
        'participants' => $participants
    ];
    $debug['steps'][] = '14. Preparing INSERT';

    $result = $stmt->execute([
        $id,
        $userId,
        $espaceId,
        $debutMysql,
        $finMysql,
        $type,
        $montant,
        $participants,
        $notes
    ]);

    if (!$result) {
        $errorInfo = $stmt->errorInfo();
        $debug['sql_error'] = $errorInfo;
        Response::json(['success' => false, 'error' => 'INSERT failed: ' . $errorInfo[2], 'debug' => $debug]);
        exit;
    }
    $debug['steps'][] = '15. INSERT successful';

    $stmt = $db->prepare("
        SELECT r.*, e.nom as espace_nom, e.type as espace_type
        FROM reservations r
        JOIN espaces e ON r.espace_id = e.id
        WHERE r.id = ?
    ");
    $stmt->execute([$id]);
    $reservation = $stmt->fetch(PDO::FETCH_ASSOC);
    $debug['steps'][] = '16. Reservation retrieved';

    Response::json([
        'success' => true,
        'data' => $reservation,
        'message' => 'Reservation creee avec succes',
        'debug' => $debug
    ], 201);

} catch (Exception $e) {
    $debug['exception'] = [
        'message' => $e->getMessage(),
        'file' => $e->getFile(),
        'line' => $e->getLine()
    ];
    error_log("Test-create error: " . $e->getMessage() . "\n" . $e->getTraceAsString());
    Response::json([
        'success' => false,
        'error' => $e->getMessage(),
        'debug' => $debug
    ], 500);
}
