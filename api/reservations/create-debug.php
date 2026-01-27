<?php

/**
 * VERSION DEBUG de l'API de création de réservation
 * À utiliser TEMPORAIREMENT pour identifier le problème
 */

require_once '../config/cors.php';
require_once '../config/database.php';
require_once '../utils/Auth.php';
require_once '../utils/Response.php';
require_once '../utils/UuidHelper.php';

// Charger .env
$envFile = __DIR__ . '/../../.env';
if (file_exists($envFile)) {
    $lines = file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        $line = trim($line);
        if ($line === '' || $line[0] === '#' || strpos($line, '=') === false) {
            continue;
        }
        [$key, $value] = explode('=', $line, 2);
        $key = trim($key);
        $value = trim($value);
        if ($key !== '' && !isset($_ENV[$key])) {
            $_ENV[$key] = $value;
            putenv("$key=$value");
        }
    }
}

// LOGS DÉTAILLÉS
error_log("========== RESERVATION CREATE DEBUG ==========");
error_log("Method: " . $_SERVER['REQUEST_METHOD']);
error_log("Headers: " . json_encode(getallheaders()));

$rawInput = file_get_contents("php://input");
error_log("Raw input: " . $rawInput);

try {
    // TEST 1: AUTH
    error_log("TEST 1: Vérification authentification...");
    $auth = Auth::verifyAuth();
    error_log("✓ Auth OK - User ID: " . $auth['id'] . ", Role: " . $auth['role']);

    // TEST 2: PARSING JSON
    error_log("TEST 2: Parsing JSON...");
    $data = json_decode($rawInput);

    if (json_last_error() !== JSON_ERROR_NONE) {
        error_log("✗ JSON invalide: " . json_last_error_msg());
        Response::error("JSON invalide: " . json_last_error_msg(), 400);
    }

    error_log("✓ JSON valide");
    error_log("Données parsées: " . json_encode($data, JSON_PRETTY_PRINT));

    // TEST 3: VALIDATION CHAMPS
    error_log("TEST 3: Validation des champs...");
    $missingFields = [];
    if (empty($data->espace_id)) {
        $missingFields[] = 'espace_id';
    }
    if (empty($data->date_debut)) {
        $missingFields[] = 'date_debut';
    }
    if (empty($data->date_fin)) {
        $missingFields[] = 'date_fin';
    }

    if (!empty($missingFields)) {
        error_log("✗ Champs manquants: " . implode(', ', $missingFields));
        Response::validationError("Champs requis manquants", ['missing' => $missingFields]);
    }
    error_log("✓ Tous les champs requis sont présents");

    // TEST 4: CONNEXION DB
    error_log("TEST 4: Connexion base de données...");
    $db = Database::getInstance()->getConnection();
    error_log("✓ Connexion DB réussie");

    // TEST 5: VÉRIFIER ESPACE
    error_log("TEST 5: Vérification de l'espace ID: " . $data->espace_id);
    $query = "SELECT id, nom, prix_heure, prix_jour, prix_semaine, disponible, capacite
              FROM espaces
              WHERE id = :espace_id";
    $stmt = $db->prepare($query);
    $stmt->execute([':espace_id' => $data->espace_id]);
    $espace = $stmt->fetch();

    if (!$espace) {
        error_log("✗ Espace non trouvé: " . $data->espace_id);

        // Lister les espaces disponibles
        $stmt = $db->query("SELECT id, nom FROM espaces LIMIT 5");
        $espaces = $stmt->fetchAll();
        error_log("Espaces disponibles: " . json_encode($espaces));

        Response::error("Espace introuvable. ID fourni: " . $data->espace_id, 404);
    }

    error_log("✓ Espace trouvé: " . $espace['nom']);
    error_log("  Disponible: " . ($espace['disponible'] ? 'Oui' : 'Non'));
    error_log("  Capacité: " . $espace['capacite']);
    error_log("  Prix/h: " . $espace['prix_heure']);

    if (!$espace['disponible']) {
        error_log("✗ Espace non disponible");
        Response::error("Cet espace n'est pas disponible", 400);
    }

    // TEST 6: VALIDATION DATES
    error_log("TEST 6: Validation des dates...");
    error_log("  Date début: " . $data->date_debut);
    error_log("  Date fin: " . $data->date_fin);

    try {
        $debut = new DateTime($data->date_debut);
        $fin = new DateTime($data->date_fin);
        error_log("✓ Dates valides");

        $heures = ($fin->getTimestamp() - $debut->getTimestamp()) / 3600;
        error_log("  Durée: " . $heures . " heures");

        if ($heures <= 0) {
            error_log("✗ Durée invalide");
            Response::error("La date de fin doit être après la date de début", 400);
        }

    } catch (Exception $e) {
        error_log("✗ Erreur parsing dates: " . $e->getMessage());
        Response::error("Format de date invalide", 400);
    }

    // TEST 7: CALCUL MONTANT
    error_log("TEST 7: Calcul du montant...");
    $montant_total = 0;
    $type_reservation = 'heure';

    if ($heures < 24) {
        $montant_total = ceil($heures) * $espace['prix_heure'];
        $type_reservation = 'heure';
    } else {
        $jours = ceil($heures / 24);
        if ($jours >= 7 && !empty($espace['prix_semaine'])) {
            $semaines = floor($jours / 7);
            $jours_restants = $jours % 7;
            $montant_total = ($semaines * $espace['prix_semaine']) + ($jours_restants * $espace['prix_jour']);
            $type_reservation = 'semaine';
        } else {
            $montant_total = $jours * $espace['prix_jour'];
            $type_reservation = 'jour';
        }
    }

    error_log("✓ Montant calculé: " . $montant_total . " DA");
    error_log("  Type: " . $type_reservation);

    // TEST 8: CRÉATION RÉSERVATION
    error_log("TEST 8: Création de la réservation...");

    $db->beginTransaction();

    try {
        $reservation_id = UuidHelper::generate();
        $participants = isset($data->participants) ? (int)$data->participants : 1;

        $query = "INSERT INTO reservations (
                    id, user_id, espace_id, date_debut, date_fin,
                    statut, type_reservation, montant_total, reduction,
                    code_promo_id, montant_paye, mode_paiement, notes, participants
                  ) VALUES (
                    :id, :user_id, :espace_id, :date_debut, :date_fin,
                    :statut, :type_reservation, :montant_total, :reduction,
                    :code_promo_id, :montant_paye, :mode_paiement, :notes, :participants
                  )";

        $stmt = $db->prepare($query);
        $result = $stmt->execute([
            ':id' => $reservation_id,
            ':user_id' => $auth['id'],
            ':espace_id' => $data->espace_id,
            ':date_debut' => $data->date_debut,
            ':date_fin' => $data->date_fin,
            ':statut' => 'en_attente',
            ':type_reservation' => $type_reservation,
            ':montant_total' => $montant_total,
            ':reduction' => 0,
            ':code_promo_id' => null,
            ':montant_paye' => 0,
            ':mode_paiement' => null,
            ':notes' => $data->notes ?? null,
            ':participants' => $participants
        ]);

        if (!$result) {
            error_log("✗ Échec INSERT: " . json_encode($stmt->errorInfo()));
            throw new Exception("Échec de l'insertion");
        }

        $db->commit();
        error_log("✓ Réservation créée avec succès - ID: " . $reservation_id);

        // Récupérer la réservation créée
        $query = "SELECT r.*, e.nom as espace_nom, e.type as espace_type
                  FROM reservations r
                  LEFT JOIN espaces e ON r.espace_id = e.id
                  WHERE r.id = :id";
        $stmt = $db->prepare($query);
        $stmt->execute([':id' => $reservation_id]);
        $reservation = $stmt->fetch();

        error_log("========== SUCCESS ==========");
        Response::success($reservation, "Réservation créée avec succès", 201);

    } catch (Exception $e) {
        $db->rollBack();
        error_log("✗ Erreur transaction: " . $e->getMessage());
        throw $e;
    }

} catch (Exception $e) {
    error_log("========== ERREUR FATALE ==========");
    error_log("Message: " . $e->getMessage());
    error_log("File: " . $e->getFile() . ":" . $e->getLine());
    error_log("Trace: " . $e->getTraceAsString());
    error_log("===================================");

    Response::error("Erreur: " . $e->getMessage(), 500);
}
