<?php

require_once '../config/cors.php';
require_once '../config/database.php';
require_once '../utils/Auth.php';
require_once '../utils/Response.php';

header('Content-Type: application/json');

try {
    $auth = Auth::verifyAuth();
    $db = Database::getInstance()->getConnection();

    $role = $auth['role'];
    $userId = $auth['id'];

    if ($role === 'admin') {
        $stmt = $db->prepare("
            SELECT
                r.*,
                e.nom as espace_nom,
                e.type as espace_type,
                e.prix_heure,
                e.prix_jour,
                u.nom as user_nom,
                u.prenom as user_prenom,
                u.email as user_email
            FROM reservations r
            LEFT JOIN espaces e ON r.espace_id = e.id
            LEFT JOIN users u ON r.user_id = u.id
            ORDER BY r.date_debut DESC
        ");
        $stmt->execute();
    } else {
        $stmt = $db->prepare("
            SELECT
                r.*,
                e.nom as espace_nom,
                e.type as espace_type,
                e.prix_heure,
                e.prix_jour
            FROM reservations r
            LEFT JOIN espaces e ON r.espace_id = e.id
            WHERE r.user_id = ?
            ORDER BY r.date_debut DESC
        ");
        $stmt->execute([$userId]);
    }

    $reservations = $stmt->fetchAll();

    Response::success($reservations);

} catch (Exception $e) {
    error_log("Erreur liste réservations: " . $e->getMessage());
    Response::error("Erreur serveur", 500);
}
