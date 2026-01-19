<?php
/**
 * API: Créer une demande de domiciliation
 * POST /api/domiciliations/create.php
 */

require_once '../config/cors.php';
require_once '../config/database.php';
require_once '../utils/Auth.php';
require_once '../utils/Response.php';
require_once '../utils/UuidHelper.php';

try {
    $auth = Auth::verifyAuth();

    $data = json_decode(file_get_contents("php://input"));

    if (!$data || json_last_error() !== JSON_ERROR_NONE) {
        Response::error("Données JSON invalides", 400);
    }

    if (empty($data->raison_sociale) || empty($data->forme_juridique)) {
        Response::error("Raison sociale et forme juridique requises", 400);
    }

    if (!empty($data->nif) && strlen($data->nif) !== 20) {
        Response::error("Le NIF doit contenir exactement 20 caractères", 400);
    }

    if (!empty($data->nis) && strlen($data->nis) !== 15) {
        Response::error("Le NIS doit contenir exactement 15 caractères", 400);
    }

    $database = Database::getInstance();
    $db = $database->getConnection();

    // Vérifier si l'utilisateur a déjà une domiciliation active
    $query = "SELECT id FROM domiciliations
              WHERE user_id = :user_id
              AND statut IN ('en_attente', 'en_cours', 'validee', 'active')";

    $stmt = $db->prepare($query);
    $stmt->bindParam(':user_id', $auth['id']);
    $stmt->execute();

    if ($stmt->rowCount() > 0) {
        Response::error("Vous avez déjà une demande de domiciliation en cours ou active", 400);
    }

    // Créer la demande
    $id = UuidHelper::generate();

    $query = "INSERT INTO domiciliations
              (id, user_id, raison_sociale, forme_juridique, capital,
               activite_principale, nif, nis, registre_commerce, article_imposition,
               numero_auto_entrepreneur, wilaya, commune, adresse_actuelle,
               representant_nom, representant_prenom, representant_fonction, representant_telephone,
               representant_email, domaine_activite, adresse_siege_social,
               coordonnees_fiscales, coordonnees_administratives, date_creation_entreprise,
               statut, montant_mensuel)
              VALUES
              (:id, :user_id, :raison_sociale, :forme_juridique, :capital,
               :activite_principale, :nif, :nis, :registre_commerce, :article_imposition,
               :numero_auto_entrepreneur, :wilaya, :commune, :adresse_actuelle,
               :representant_nom, :representant_prenom, :representant_fonction, :representant_telephone,
               :representant_email, :domaine_activite, :adresse_siege_social,
               :coordonnees_fiscales, :coordonnees_administratives, :date_creation_entreprise,
               'en_attente', :montant_mensuel)";

    $stmt = $db->prepare($query);
    $stmt->execute([
        ':id' => $id,
        ':user_id' => $auth['id'],
        ':raison_sociale' => $data->raison_sociale,
        ':forme_juridique' => $data->forme_juridique,
        ':capital' => $data->capital ?? null,
        ':activite_principale' => $data->activite_principale ?? null,
        ':nif' => $data->nif ?? null,
        ':nis' => $data->nis ?? null,
        ':registre_commerce' => $data->registre_commerce ?? null,
        ':article_imposition' => $data->article_imposition ?? null,
        ':numero_auto_entrepreneur' => $data->numero_auto_entrepreneur ?? null,
        ':wilaya' => $data->wilaya ?? null,
        ':commune' => $data->commune ?? null,
        ':adresse_actuelle' => $data->adresse_actuelle ?? null,
        ':representant_nom' => $data->representant_nom ?? null,
        ':representant_prenom' => $data->representant_prenom ?? null,
        ':representant_fonction' => $data->representant_fonction ?? null,
        ':representant_telephone' => $data->representant_telephone ?? null,
        ':representant_email' => $data->representant_email ?? null,
        ':domaine_activite' => $data->domaine_activite ?? null,
        ':adresse_siege_social' => $data->adresse_siege_social ?? null,
        ':coordonnees_fiscales' => $data->coordonnees_fiscales ?? null,
        ':coordonnees_administratives' => $data->coordonnees_administratives ?? null,
        ':date_creation_entreprise' => $data->date_creation_entreprise ?? null,
        ':montant_mensuel' => $data->montant_mensuel ?? 5000
    ]);

    Response::success(['id' => $id], "Demande de domiciliation créée avec succès", 201);

} catch (Exception $e) {
    error_log("Create domiciliation error: " . $e->getMessage());
    Response::serverError();
}
?>
