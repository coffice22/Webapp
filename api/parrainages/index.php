<?php

/**
 * API: Liste des parrainages
 * GET /api/parrainages/index.php?user_id=xxx
 */

require_once '../config/cors.php';
require_once '../config/database.php';
require_once '../utils/Auth.php';
require_once '../utils/Response.php';
require_once '../utils/Pagination.php';

try {
    $auth = Auth::verifyAuth();
    $userId = $_GET['user_id'] ?? null;

    $database = Database::getInstance();
    $db = $database->getConnection();

    // Paramètres de pagination
    $page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
    $limit = isset($_GET['limit']) ? min((int)$_GET['limit'], 100) : 20;
    $offset = ($page - 1) * $limit;

    // Filtres
    $statut = isset($_GET['statut']) ? $_GET['statut'] : null;

    // Admin peut voir tous les parrainages
    if ($auth['role'] === 'admin' && !$userId) {
        // Comptage
        $countQuery = "SELECT COUNT(*) as total FROM parrainages";
        $whereConditions = [];
        $params = [];

        if ($statut) {
            $whereConditions[] = "statut = :statut";
            $params[':statut'] = $statut;
        }

        if (!empty($whereConditions)) {
            $countQuery .= " WHERE " . implode(" AND ", $whereConditions);
        }

        $stmt = $db->prepare($countQuery);
        $stmt->execute($params);
        $totalCount = $stmt->fetch()['total'];

        // Données avec pagination
        $query = "SELECT p.*, u.nom, u.prenom, u.email
                  FROM parrainages p
                  LEFT JOIN users u ON p.parrain_id = u.id";

        if (!empty($whereConditions)) {
            $query .= " WHERE " . implode(" AND ", $whereConditions);
        }

        $query .= " ORDER BY p.created_at DESC LIMIT :limit OFFSET :offset";

        $stmt = $db->prepare($query);
        foreach ($params as $key => $value) {
            $stmt->bindValue($key, $value);
        }
        $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
        $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
    } else {
        // User voit uniquement ses parrainages
        $targetUserId = $userId ?: $auth['id'];

        // Vérifier l'autorisation
        if ($auth['role'] !== 'admin' && $targetUserId !== $auth['id']) {
            Response::error("Accès non autorisé", 403);
        }

        // Comptage
        $countQuery = "SELECT COUNT(*) as total FROM parrainages WHERE parrain_id = :parrain_id";
        $params = [':parrain_id' => $targetUserId];

        if ($statut) {
            $countQuery .= " AND statut = :statut";
            $params[':statut'] = $statut;
        }

        $stmt = $db->prepare($countQuery);
        $stmt->execute($params);
        $totalCount = $stmt->fetch()['total'];

        // Données
        $query = "SELECT * FROM parrainages WHERE parrain_id = :parrain_id";

        if ($statut) {
            $query .= " AND statut = :statut";
        }

        $query .= " ORDER BY created_at DESC LIMIT :limit OFFSET :offset";

        $stmt = $db->prepare($query);
        foreach ($params as $key => $value) {
            $stmt->bindValue($key, $value);
        }
        $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
        $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
    }

    $stmt->execute();
    $parrainages = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Réponse avec pagination
    $pagination = Pagination::paginate($totalCount, $page, $limit);

    Response::success([
        'data' => $parrainages,
        'pagination' => $pagination
    ]);

} catch (Exception $e) {
    error_log("Parrainages error: " . $e->getMessage());
    Response::serverError("Erreur lors de la récupération des parrainages");
}
