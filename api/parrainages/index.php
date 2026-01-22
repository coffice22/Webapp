<?php

/**
 * API: Liste des parrainages
 * GET /api/parrainages/index.php?user_id=xxx
 */

require_once '../config/cors.php';
require_once '../config/database.php';
require_once '../utils/Auth.php';
require_once '../utils/Response.php';

try {
    $auth = Auth::verifyAuth();
    $userId = $_GET['user_id'] ?? null;

    $database = Database::getInstance();
    $db = $database->getConnection();

    // Admin peut voir tous les parrainages
    if ($auth['role'] === 'admin' && !$userId) {
        $query = "SELECT p.*, u.nom, u.prenom, u.email
                  FROM parrainages p
                  LEFT JOIN users u ON p.parrain_id = u.id
                  ORDER BY p.created_at DESC";
        $stmt = $db->prepare($query);
    } else {
        // User voit uniquement ses parrainages
        $targetUserId = $userId ?: $auth['id'];

        // Vérifier l'autorisation
        if ($auth['role'] !== 'admin' && $targetUserId !== $auth['id']) {
            Response::error("Accès non autorisé", 403);
        }

        $query = "SELECT * FROM parrainages WHERE parrain_id = :parrain_id";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':parrain_id', $targetUserId);
    }

    $stmt->execute();
    $parrainages = $stmt->fetchAll(PDO::FETCH_ASSOC);

    Response::success($parrainages);

} catch (Exception $e) {
    error_log("Parrainages error: " . $e->getMessage());
    Response::serverError("Erreur lors de la récupération des parrainages");
}
