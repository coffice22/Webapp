<?php

require_once '../config/cors.php';
require_once '../config/database.php';
require_once '../utils/Auth.php';
require_once '../utils/Response.php';

header('Content-Type: application/json');

try {
    $auth = Auth::verifyAuth();

    $input = file_get_contents("php://input");
    $data = json_decode($input);

    if (!$data || empty($data->id)) {
        Response::error("ID requis", 400);
    }

    $db = Database::getInstance()->getConnection();

    $stmt = $db->prepare("SELECT * FROM reservations WHERE id = ?");
    $stmt->execute([$data->id]);
    $reservation = $stmt->fetch();

    if (!$reservation) {
        Response::error("Réservation non trouvée", 404);
    }

    if ($auth['role'] !== 'admin' && $reservation['user_id'] !== $auth['id']) {
        Response::error("Accès refusé", 403);
    }

    if ($reservation['statut'] === 'annulee') {
        Response::error("Réservation déjà annulée", 400);
    }

    $stmt = $db->prepare("UPDATE reservations SET statut = 'annulee' WHERE id = ?");
    $result = $stmt->execute([$data->id]);

    if (!$result) {
        Response::error("Erreur lors de l'annulation", 500);
    }

    $stmt = $db->prepare("
        SELECT r.*, e.nom as espace_nom, e.type as espace_type
        FROM reservations r
        LEFT JOIN espaces e ON r.espace_id = e.id
        WHERE r.id = ?
    ");
    $stmt->execute([$data->id]);
    $updated = $stmt->fetch();

    Response::success($updated, "Réservation annulée avec succès");

} catch (Exception $e) {
    error_log("Erreur annulation réservation: " . $e->getMessage());
    Response::error("Erreur serveur", 500);
}
