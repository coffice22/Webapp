<?php

require_once '../config/cors.php';
require_once '../config/database.php';
require_once '../utils/Auth.php';
require_once '../utils/Response.php';
require_once '../utils/UuidHelper.php';

header('Content-Type: application/json');

function parseDateTime($dateStr)
{
    if (empty($dateStr)) {
        return null;
    }

    $dateStr = str_replace(['T', 'Z'], [' ', ''], $dateStr);
    $dateStr = preg_replace('/\.\d+/', '', $dateStr);

    $formats = [
        'Y-m-d H:i:s',
        'Y-m-d H:i',
        'Y-m-d\TH:i:s',
        'Y-m-d\TH:i:sP',
        'Y-m-d\TH:i:s.uP',
        'd/m/Y H:i:s',
        'd/m/Y H:i',
    ];

    foreach ($formats as $format) {
        $dt = DateTime::createFromFormat($format, trim($dateStr));
        if ($dt !== false) {
            return $dt;
        }
    }

    try {
        return new DateTime($dateStr);
    } catch (Exception $e) {
        return null;
    }
}

try {
    $auth = Auth::verifyAuth();

    $input = file_get_contents("php://input");
    $data = json_decode($input);

    if (!$data) {
        Response::error("Donnees invalides", 400);
    }

    if (empty($data->espace_id)) {
        Response::error("L'ID de l'espace est requis", 400);
    }

    if (empty($data->date_debut)) {
        Response::error("La date de debut est requise", 400);
    }

    if (empty($data->date_fin)) {
        Response::error("La date de fin est requise", 400);
    }

    $debut = parseDateTime($data->date_debut);
    $fin = parseDateTime($data->date_fin);

    if (!$debut) {
        Response::error("Format de date de debut invalide", 400);
    }

    if (!$fin) {
        Response::error("Format de date de fin invalide", 400);
    }

    if ($fin <= $debut) {
        Response::error("La date de fin doit etre apres la date de debut", 400);
    }

    $db = Database::getInstance()->getConnection();

    $stmt = $db->prepare("SELECT * FROM espaces WHERE id = ?");
    $stmt->execute([$data->espace_id]);
    $espace = $stmt->fetch();

    if (!$espace) {
        Response::error("Espace non trouve", 404);
    }

    if (!$espace['disponible']) {
        Response::error("Cet espace n'est pas disponible actuellement", 400);
    }

    $debutStr = $debut->format('Y-m-d H:i:s');
    $finStr = $fin->format('Y-m-d H:i:s');

    $heures = ($fin->getTimestamp() - $debut->getTimestamp()) / 3600;

    if ($heures <= 0) {
        Response::error("La duree de reservation doit etre positive", 400);
    }

    if ($heures > 8760) {
        Response::error("La duree maximale est de 1 an", 400);
    }

    $prixHeure = floatval($espace['prix_heure'] ?? 0);
    $prixJour = floatval($espace['prix_jour'] ?? 0);

    $montant = 0;
    $type = 'heure';

    if ($heures < 8) {
        $montant = ceil($heures) * $prixHeure;
        $type = 'heure';
    } elseif ($heures < 24) {
        $montant = $prixJour;
        $type = 'jour';
    } else {
        $jours = ceil($heures / 24);
        $montant = $jours * $prixJour;
        $type = 'jour';
    }

    $stmt = $db->prepare("
        SELECT COUNT(*) as count FROM reservations
        WHERE espace_id = ?
        AND statut IN ('confirmee', 'en_attente', 'en_cours')
        AND NOT (date_fin <= ? OR date_debut >= ?)
    ");
    $stmt->execute([$data->espace_id, $debutStr, $finStr]);
    $conflit = $stmt->fetch();

    if ($conflit && $conflit['count'] > 0) {
        Response::error("Cet espace est deja reserve pour ce creneau", 409);
    }

    $id = UuidHelper::generate();
    $participants = isset($data->participants) ? max(1, (int)$data->participants) : 1;
    $notes = isset($data->notes) ? trim($data->notes) : null;

    if ($participants > $espace['capacite']) {
        $participants = $espace['capacite'];
    }

    $stmt = $db->prepare("
        INSERT INTO reservations (
            id, user_id, espace_id, date_debut, date_fin,
            statut, type_reservation, montant_total,
            montant_paye, participants, notes, created_at
        ) VALUES (?, ?, ?, ?, ?, 'en_attente', ?, ?, 0, ?, ?, NOW())
    ");

    $result = $stmt->execute([
        $id,
        $auth['id'],
        $data->espace_id,
        $debutStr,
        $finStr,
        $type,
        $montant,
        $participants,
        $notes
    ]);

    if (!$result) {
        Response::error("Erreur lors de la creation de la reservation", 500);
    }

    $stmt = $db->prepare("
        SELECT r.*, e.nom as espace_nom, e.type as espace_type, e.prix_heure, e.prix_jour
        FROM reservations r
        LEFT JOIN espaces e ON r.espace_id = e.id
        WHERE r.id = ?
    ");
    $stmt->execute([$id]);
    $reservation = $stmt->fetch();

    Response::success($reservation, "Reservation creee avec succes", 201);

} catch (Exception $e) {
    error_log("Erreur creation reservation: " . $e->getMessage());
    Response::error("Erreur serveur: " . $e->getMessage(), 500);
}
