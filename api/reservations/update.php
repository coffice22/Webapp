<?php
/**
 * API: Mise à jour d'une réservation
 * PUT /api/reservations/update.php
 */

require_once '../config/cors.php';
require_once '../config/database.php';
require_once '../utils/Auth.php';
require_once '../utils/Response.php';

try {
    $auth = Auth::verifyAuth();
    $data = json_decode(file_get_contents("php://input"));

    if (empty($data->id)) {
        Response::error("ID réservation requis", 400);
    }

    $database = Database::getInstance();
    $db = $database->getConnection();

    // Vérifier que la réservation existe et appartient à l'utilisateur
    $query = "SELECT user_id FROM reservations WHERE id = :id LIMIT 1";
    $stmt = $db->prepare($query);
    $stmt->bindParam(':id', $data->id);
    $stmt->execute();

    if ($stmt->rowCount() === 0) {
        Response::error("Réservation non trouvée", 404);
    }

    $reservation = $stmt->fetch(PDO::FETCH_ASSOC);

    // Les users ne peuvent modifier que leurs propres réservations
    if ($auth['role'] !== 'admin' && $reservation['user_id'] !== $auth['id']) {
        Response::error("Accès non autorisé", 403);
    }

    // Construire la requête de mise à jour
    $updateFields = [];
    $params = [':id' => $data->id];

    $allowedFields = ['date_debut', 'date_fin', 'participants', 'notes'];

    // Admin peut aussi modifier le statut et le mode de paiement
    if ($auth['role'] === 'admin') {
        $allowedFields[] = 'statut';
        $allowedFields[] = 'mode_paiement';
        $allowedFields[] = 'montant_paye';
    }

    foreach ($allowedFields as $field) {
        if (isset($data->$field)) {
            $updateFields[] = "$field = :$field";
            $params[":$field"] = $data->$field;
        }
    }

    if (empty($updateFields)) {
        Response::error("Aucune donnée à mettre à jour", 400);
    }

    $query = "UPDATE reservations SET " . implode(', ', $updateFields) . " WHERE id = :id";
    $stmt = $db->prepare($query);
    $stmt->execute($params);

    Response::success(null, "Réservation mise à jour avec succès");

} catch (Exception $e) {
    error_log("Update reservation error: " . $e->getMessage());
    Response::serverError("Erreur lors de la mise à jour");
}
?>
