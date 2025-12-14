<?php
/**
 * API: Détails d'une réservation
 * GET /api/reservations/show.php?id=xxx
 */

require_once '../config/cors.php';
require_once '../config/database.php';
require_once '../utils/Auth.php';
require_once '../utils/Response.php';

try {
    $auth = Auth::verifyAuth();
    $reservationId = $_GET['id'] ?? null;

    if (!$reservationId) {
        Response::error("ID réservation requis", 400);
    }

    $database = Database::getInstance();
    $db = $database->getConnection();

    $query = "SELECT r.*, e.nom as espace_nom, e.type as espace_type,
                     u.nom as user_nom, u.prenom as user_prenom
              FROM reservations r
              LEFT JOIN espaces e ON r.espace_id = e.id
              LEFT JOIN users u ON r.user_id = u.id
              WHERE r.id = :id";

    // Les users ne peuvent voir que leurs propres réservations
    if ($auth['role'] !== 'admin') {
        $query .= " AND r.user_id = :user_id";
    }

    $stmt = $db->prepare($query);
    $stmt->bindParam(':id', $reservationId);

    if ($auth['role'] !== 'admin') {
        $stmt->bindParam(':user_id', $auth['id']);
    }

    $stmt->execute();

    if ($stmt->rowCount() === 0) {
        Response::error("Réservation non trouvée", 404);
    }

    $reservation = $stmt->fetch(PDO::FETCH_ASSOC);
    Response::success($reservation);

} catch (Exception $e) {
    error_log("Reservation show error: " . $e->getMessage());
    Response::serverError("Erreur lors de la récupération de la réservation");
}
?>
