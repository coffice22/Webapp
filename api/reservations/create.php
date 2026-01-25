<?php

/**
 * API: Créer une réservation
 * POST /api/reservations/create.php
 */

require_once '../config/cors.php';
require_once '../config/database.php';
require_once '../utils/Auth.php';
require_once '../utils/Response.php';
require_once '../utils/UuidHelper.php';

// Charger .env pour APP_ENV
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

try {
    $auth = Auth::verifyAuth();
    $data = json_decode(file_get_contents("php://input"));

    // Validation stricte des champs requis
    $missingFields = [];
    if (empty($data->espace_id)) $missingFields[] = 'espace_id';
    if (empty($data->date_debut)) $missingFields[] = 'date_debut';
    if (empty($data->date_fin)) $missingFields[] = 'date_fin';

    if (!empty($missingFields)) {
        Response::validationError("Champs requis manquants", ['missing' => $missingFields]);
    }

    // Valider le nombre de participants
    $participants = isset($data->participants) ? (int)$data->participants : 1;
    if ($participants < 1) {
        Response::validationError("Le nombre de participants doit être au moins 1");
    }
    if ($participants > 100) {
        Response::validationError("Le nombre de participants ne peut pas dépasser 100");
    }

    $db = Database::getInstance()->getConnection();

    // Démarrer une transaction
    $db->beginTransaction();

    try {
        // Récupérer les informations de l'espace avec un verrou pour éviter les race conditions
        $query = "SELECT id, nom, prix_heure, prix_jour, prix_semaine, disponible, capacite
                  FROM espaces
                  WHERE id = :espace_id
                  FOR UPDATE";

        $stmt = $db->prepare($query);
        $stmt->execute([':espace_id' => $data->espace_id]);
        $espace = $stmt->fetch();

        if (!$espace) {
            $db->rollBack();
            Response::error("Espace introuvable", 404);
        }

        if (!$espace['disponible']) {
            $db->rollBack();
            Response::error("Cet espace n'est pas disponible", 400);
        }

        // Vérifier la capacité de l'espace
        if ($participants > $espace['capacite']) {
            $db->rollBack();
            Response::error("La capacité maximale de cet espace est de " . $espace['capacite'] . " personne(s)", 400);
        }

        // Vérifier disponibilité pour les dates avec verrouillage pour éviter race conditions
        // FOR UPDATE verrouille les lignes trouvées jusqu'à la fin de la transaction
        $query = "SELECT id FROM reservations
                  WHERE espace_id = :espace_id
                  AND statut IN ('confirmee', 'en_attente', 'en_cours')
                  AND NOT (date_fin <= :debut OR date_debut >= :fin)
                  FOR UPDATE";

        $stmt = $db->prepare($query);
        $stmt->execute([
            ':espace_id' => $data->espace_id,
            ':debut' => $data->date_debut,
            ':fin' => $data->date_fin
        ]);

        $conflits = $stmt->fetchAll();
        if (count($conflits) > 0) {
            $db->rollBack();
            Response::conflict("Cet espace n'est pas disponible pour ces dates");
        }

        // CALCULER LE MONTANT CÔTÉ SERVEUR (ne pas faire confiance au client)
        $debut = new DateTime($data->date_debut);
        $fin = new DateTime($data->date_fin);
        $now = new DateTime();

        if ($debut < $now) {
            $db->rollBack();
            Response::error("La date de début doit être dans le futur", 400);
        }

        if ($fin < $now) {
            $db->rollBack();
            Response::error("La date de fin doit être dans le futur", 400);
        }

        $heures = ($fin->getTimestamp() - $debut->getTimestamp()) / 3600;

        if ($heures <= 0) {
            $db->rollBack();
            Response::error("La date de fin doit être après la date de début", 400);
        }

        // Calculer le montant
        $montant_total = 0;
        $type_reservation = 'heure';

        if ($heures < 24) {
            $montant_total = ceil($heures) * $espace['prix_heure'];
            $type_reservation = 'heure';
        } else {
            $jours = ceil($heures / 24);

            // Appliquer le tarif semaine si disponible et si >= 7 jours
            if ($jours >= 7 && !empty($espace['prix_semaine'])) {
                $semaines = floor($jours / 7);
                $jours_restants = $jours % 7;
                $montant_total = ($semaines * $espace['prix_semaine']) + ($jours_restants * $espace['prix_jour']);
                $type_reservation = $semaines > 0 ? 'semaine' : 'jour';
            } else {
                $montant_total = $jours * $espace['prix_jour'];
                $type_reservation = 'jour';
            }
        }

        $reduction = 0;
        $code_promo_id = null;

        // Gérer le code promo si fourni
        if (!empty($data->code_promo)) {
            // Verrouiller le code promo pour éviter les utilisations simultanées
            $query = "SELECT id, code, type, valeur, utilisations_actuelles, utilisations_max,
                             montant_min, types_application
                      FROM codes_promo
                      WHERE code = :code
                      AND actif = 1
                      AND date_debut <= NOW()
                      AND date_fin >= NOW()
                      LIMIT 1
                      FOR UPDATE";

            $stmt = $db->prepare($query);
            $stmt->execute([':code' => $data->code_promo]);
            $promo = $stmt->fetch();

            if ($promo) {
                // Vérifier le nombre d'utilisations
                if ($promo['utilisations_max'] !== null && $promo['utilisations_actuelles'] >= $promo['utilisations_max']) {
                    $db->rollBack();
                    Response::error("Ce code promo a atteint sa limite d'utilisation", 400);
                }

                // Vérifier que l'utilisateur n'a pas déjà utilisé ce code
                $query = "SELECT COUNT(*) as count FROM utilisations_codes_promo
                          WHERE code_promo_id = :promo_id AND user_id = :user_id";
                $stmt = $db->prepare($query);
                $stmt->execute([':promo_id' => $promo['id'], ':user_id' => $auth['id']]);
                if ($stmt->fetch()['count'] > 0) {
                    $db->rollBack();
                    Response::error("Vous avez déjà utilisé ce code promo", 400);
                }

                // Vérifier le montant minimum
                if ($montant_total < $promo['montant_min']) {
                    $db->rollBack();
                    Response::error("Le montant minimum pour ce code promo est " . $promo['montant_min'] . " DA", 400);
                }

                // Vérifier le type applicable
                if (!empty($promo['types_application'])) {
                    $typesApplicables = json_decode($promo['types_application'], true);
                    if (!empty($typesApplicables) && !in_array('reservation', $typesApplicables) && !in_array('tous', $typesApplicables)) {
                        $db->rollBack();
                        Response::error("Ce code promo n'est pas applicable aux réservations", 400);
                    }
                }

                // Calculer la réduction
                if ($promo['type'] === 'pourcentage') {
                    $reduction = $montant_total * ($promo['valeur'] / 100);
                } else {
                    $reduction = $promo['valeur'];
                }

                // Ne pas réduire en dessous de 0 et pas plus que le montant total
                $reduction = min($reduction, $montant_total);
                $reduction = max($reduction, 0);

                $code_promo_id = $promo['id'];
            }
        }

        $montant_final = $montant_total - $reduction;

        // Créer la réservation
        $reservation_id = UuidHelper::generate();

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
        $stmt->execute([
            ':id' => $reservation_id,
            ':user_id' => $auth['id'],
            ':espace_id' => $data->espace_id,
            ':date_debut' => $data->date_debut,
            ':date_fin' => $data->date_fin,
            ':statut' => 'en_attente',
            ':type_reservation' => $type_reservation,
            ':montant_total' => $montant_total,
            ':reduction' => $reduction,
            ':code_promo_id' => $code_promo_id,
            ':montant_paye' => 0,
            ':mode_paiement' => $data->mode_paiement ?? null,
            ':notes' => $data->notes ?? null,
            ':participants' => $participants
        ]);

        // Enregistrer l'utilisation du code promo
        if ($code_promo_id) {
            $util_id = UuidHelper::generate();

            $query = "INSERT INTO utilisations_codes_promo
                      (id, code_promo_id, user_id, reservation_id, montant_reduction,
                       montant_avant, montant_apres, type_utilisation, created_at)
                      VALUES
                      (:id, :promo_id, :user_id, :reservation_id, :reduction,
                       :avant, :apres, 'reservation', NOW())";

            $stmt = $db->prepare($query);
            $stmt->execute([
                ':id' => $util_id,
                ':promo_id' => $code_promo_id,
                ':user_id' => $auth['id'],
                ':reservation_id' => $reservation_id,
                ':reduction' => $reduction,
                ':avant' => $montant_total,
                ':apres' => $montant_final
            ]);

            // Incrémenter le compteur d'utilisations
            $query = "UPDATE codes_promo
                      SET utilisations_actuelles = utilisations_actuelles + 1
                      WHERE id = :id";

            $stmt = $db->prepare($query);
            $stmt->execute([':id' => $code_promo_id]);
        }

        // Commit de la transaction
        $db->commit();

        // Récupérer la réservation créée
        $query = "SELECT r.*, e.nom as espace_nom, e.type as espace_type
                  FROM reservations r
                  LEFT JOIN espaces e ON r.espace_id = e.id
                  WHERE r.id = :id";

        $stmt = $db->prepare($query);
        $stmt->execute([':id' => $reservation_id]);
        $reservation = $stmt->fetch();

        // Retourner 201 Created comme requis par REST
        http_response_code(201);
        Response::success($reservation, "Réservation créée avec succès", 201);

    } catch (Exception $e) {
        // Rollback en cas d'erreur
        $db->rollBack();
        throw $e;
    }

} catch (Exception $e) {
    error_log("Create reservation error: " . $e->getMessage());
    error_log("Create reservation trace: " . $e->getTraceAsString());

    $isDev = ($_ENV['APP_ENV'] ?? 'production') === 'development';

    if ($isDev) {
        Response::error("Création réservation échouée: " . $e->getMessage(), 500);
    } else {
        Response::serverError("Erreur lors de la création de la réservation");
    }
}
