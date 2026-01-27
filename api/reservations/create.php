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

try {
    $auth = Auth::verifyAuth();
    $userId = $auth['id'];

    $input = file_get_contents("php://input");
    $data = json_decode($input, true);

    if (!$data) {
        Response::error("Donnees JSON invalides", 400);
    }

    $espaceId = $data['espace_id'] ?? null;
    $dateDebut = $data['date_debut'] ?? null;
    $dateFin = $data['date_fin'] ?? null;
    $participants = isset($data['participants']) ? intval($data['participants']) : 1;
    $notes = isset($data['notes']) ? trim($data['notes']) : '';

    if (empty($espaceId)) {
        Response::error("L'espace est requis", 400);
    }

    if (empty($dateDebut)) {
        Response::error("La date de debut est requise", 400);
    }

    if (empty($dateFin)) {
        Response::error("La date de fin est requise", 400);
    }

    $dateDebut = str_replace(['T', 'Z'], [' ', ''], $dateDebut);
    $dateDebut = preg_replace('/\.\d{3}$/', '', $dateDebut);
    $dateFin = str_replace(['T', 'Z'], [' ', ''], $dateFin);
    $dateFin = preg_replace('/\.\d{3}$/', '', $dateFin);

    $debut = strtotime($dateDebut);
    $fin = strtotime($dateFin);

    if ($debut === false) {
        Response::error("Format de date de debut invalide", 400);
    }

    if ($fin === false) {
        Response::error("Format de date de fin invalide", 400);
    }

    if ($fin <= $debut) {
        Response::error("La date de fin doit etre apres la date de debut", 400);
    }

    $debutMysql = date('Y-m-d H:i:s', $debut);
    $finMysql = date('Y-m-d H:i:s', $fin);

    $db = Database::getInstance()->getConnection();

    $stmt = $db->prepare("SELECT * FROM espaces WHERE id = ?");
    $stmt->execute([$espaceId]);
    $espace = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$espace) {
        Response::error("Espace introuvable", 404);
    }

    if (!$espace['disponible']) {
        Response::error("Cet espace n'est pas disponible", 400);
    }

    if ($participants < 1) {
        $participants = 1;
    }

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

    if ($stmt->fetch()) {
        Response::error("Ce creneau est deja reserve", 409);
    }

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

    $id = UuidHelper::generate();

    $stmt = $db->prepare("
        INSERT INTO reservations
        (id, user_id, espace_id, date_debut, date_fin, statut, type_reservation, montant_total, montant_paye, participants, notes, created_at)
        VALUES (?, ?, ?, ?, ?, 'en_attente', ?, ?, 0, ?, ?, NOW())
    ");

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
        Response::error("Erreur lors de la creation", 500);
    }

    $stmt = $db->prepare("
        SELECT r.*, e.nom as espace_nom, e.type as espace_type
        FROM reservations r
        JOIN espaces e ON r.espace_id = e.id
        WHERE r.id = ?
    ");
    $stmt->execute([$id]);
    $reservation = $stmt->fetch(PDO::FETCH_ASSOC);

    Response::success($reservation, "Reservation creee avec succes", 201);

} catch (Exception $e) {
    error_log("Erreur reservation create: " . $e->getMessage());
    Response::error("Erreur serveur", 500);
}
