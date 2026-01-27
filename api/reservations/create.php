<?php

require_once '../config/cors.php';
require_once '../config/database.php';
require_once '../utils/Auth.php';
require_once '../utils/Response.php';
require_once '../utils/UuidHelper.php';

header('Content-Type: application/json');

try {
    $auth = Auth::verifyAuth();

    $input = file_get_contents("php://input");
    $data = json_decode($input);

    if (!$data) {
        Response::error("Données invalides", 400);
    }

    if (empty($data->espace_id)) {
        Response::error("L'ID de l'espace est requis", 400);
    }

    if (empty($data->date_debut)) {
        Response::error("La date de début est requise", 400);
    }

    if (empty($data->date_fin)) {
        Response::error("La date de fin est requise", 400);
    }

    $db = Database::getInstance()->getConnection();

    $stmt = $db->prepare("SELECT * FROM espaces WHERE id = ? AND disponible = 1");
    $stmt->execute([$data->espace_id]);
    $espace = $stmt->fetch();

    if (!$espace) {
        Response::error("Espace non trouvé ou non disponible", 404);
    }

    $debut = new DateTime($data->date_debut);
    $fin = new DateTime($data->date_fin);

    if ($fin <= $debut) {
        Response::error("La date de fin doit être après la date de début", 400);
    }

    $heures = ($fin->getTimestamp() - $debut->getTimestamp()) / 3600;

    $montant = 0;
    $type = 'heure';

    if ($heures < 24) {
        $montant = ceil($heures) * $espace['prix_heure'];
        $type = 'heure';
    } else {
        $jours = ceil($heures / 24);
        $montant = $jours * $espace['prix_jour'];
        $type = 'jour';
    }

    $stmt = $db->prepare("
        SELECT COUNT(*) as count FROM reservations
        WHERE espace_id = ?
        AND statut IN ('confirmee', 'en_attente', 'en_cours')
        AND NOT (date_fin <= ? OR date_debut >= ?)
    ");
    $stmt->execute([$data->espace_id, $data->date_debut, $data->date_fin]);
    $conflit = $stmt->fetch();

    if ($conflit['count'] > 0) {
        Response::error("Cet espace est déjà réservé pour ces dates", 409);
    }

    $id = UuidHelper::generate();
    $participants = isset($data->participants) ? (int)$data->participants : 1;
    $notes = isset($data->notes) ? $data->notes : null;

    $stmt = $db->prepare("
        INSERT INTO reservations (
            id, user_id, espace_id, date_debut, date_fin,
            statut, type_reservation, montant_total,
            montant_paye, participants, notes
        ) VALUES (?, ?, ?, ?, ?, 'en_attente', ?, ?, 0, ?, ?)
    ");

    $result = $stmt->execute([
        $id,
        $auth['id'],
        $data->espace_id,
        $data->date_debut,
        $data->date_fin,
        $type,
        $montant,
        $participants,
        $notes
    ]);

    if (!$result) {
        Response::error("Erreur lors de la création", 500);
    }

    $stmt = $db->prepare("
        SELECT r.*, e.nom as espace_nom, e.type as espace_type, e.prix_heure, e.prix_jour
        FROM reservations r
        LEFT JOIN espaces e ON r.espace_id = e.id
        WHERE r.id = ?
    ");
    $stmt->execute([$id]);
    $reservation = $stmt->fetch();

    Response::success($reservation, "Réservation créée avec succès", 201);

} catch (Exception $e) {
    error_log("Erreur création réservation: " . $e->getMessage());
    Response::error("Erreur serveur: " . $e->getMessage(), 500);
}
