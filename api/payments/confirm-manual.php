<?php

/**
 * Confirm Manual Payment - Confirmer un paiement manuel (cash/virement)
 * POST /api/payments/confirm-manual
 *
 * Body: {
 *   "reservation_id": "uuid",
 *   "amount": 5000,
 *   "payment_method": "cash" | "virement",
 *   "reference": "REF123" (optionnel pour virement)
 * }
 */

require_once __DIR__ . '/../bootstrap.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    Response::error('Méthode non autorisée', 405);
    exit;
}

try {
    $authUser = Auth::verifyAuth();

    $input = json_decode(file_get_contents('php://input'), true);

    if (!$input || !isset($input['reservation_id']) || !isset($input['amount'])) {
        Response::error('Données manquantes', 400);
        exit;
    }

    $reservationId = $input['reservation_id'];
    $amount = floatval($input['amount']);
    $paymentMethod = $input['payment_method'] ?? 'cash';
    $reference = $input['reference'] ?? null;

    if (!UuidHelper::isValid($reservationId)) {
        Response::error('ID de réservation invalide', 400);
        exit;
    }

    if (!in_array($paymentMethod, ['cash', 'virement', 'virement bancaire'])) {
        Response::error('Mode de paiement invalide', 400);
        exit;
    }

    $stmt = $db->prepare('
        SELECT r.*, e.nom as espace_nom
        FROM reservations r
        LEFT JOIN espaces e ON r.espace_id = e.id
        WHERE r.id = ?
    ');
    $stmt->execute([$reservationId]);
    $reservation = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$reservation) {
        Response::error('Réservation non trouvée', 404);
        exit;
    }

    if ($authUser['role'] !== 'admin' && $reservation['user_id'] !== $authUser['id']) {
        Response::error('Accès non autorisé', 403);
        exit;
    }

    if ($amount != $reservation['prix_total']) {
        Response::error('Le montant ne correspond pas au prix de la réservation', 400);
        exit;
    }

    $db->beginTransaction();

    try {
        $transactionId = UuidHelper::generate();
        $transactionReference = $paymentMethod === 'virement' && $reference
            ? $reference
            : 'MANUAL-' . substr($transactionId, 0, 8);

        $insertTxn = $db->prepare('
            INSERT INTO transactions
            (id, user_id, reservation_id, montant, type, mode_paiement, statut, reference_externe, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
        ');

        $insertTxn->execute([
            $transactionId,
            $authUser['id'],
            $reservationId,
            $amount,
            'reservation',
            $paymentMethod,
            'en_attente',
            $transactionReference
        ]);

        $updateReservation = $db->prepare('
            UPDATE reservations
            SET statut = ?, updated_at = NOW()
            WHERE id = ?
        ');
        $updateReservation->execute(['en_attente', $reservationId]);

        $db->commit();

        Logger::info('Manual payment confirmed', [
            'user_id' => $authUser['id'],
            'reservation_id' => $reservationId,
            'amount' => $amount,
            'payment_method' => $paymentMethod,
            'transaction_id' => $transactionId
        ]);

        $notificationId = UuidHelper::generate();
        $notificationStmt = $db->prepare('
            INSERT INTO notifications
            (id, user_id, titre, message, type, created_at)
            VALUES (?, ?, ?, ?, ?, NOW())
        ');

        $notificationStmt->execute([
            $notificationId,
            $authUser['id'],
            'Paiement en attente',
            'Votre paiement par ' . $paymentMethod . ' est en attente de confirmation par l\'équipe.',
            'paiement'
        ]);

        Response::success([
            'transaction_id' => $transactionId,
            'reference' => $transactionReference,
            'statut' => 'en_attente',
            'message' => 'Votre paiement est en attente de confirmation. Vous recevrez une notification une fois validé.'
        ], 'Paiement enregistré', 201);

    } catch (Exception $e) {
        $db->rollBack();
        throw $e;
    }

} catch (PDOException $e) {
    Logger::error('Database error in confirm manual payment', ['error' => $e->getMessage()]);
    Response::error('Erreur lors de la confirmation du paiement', 500);
} catch (Exception $e) {
    Logger::error('Error in confirm manual payment', [
        'error' => $e->getMessage(),
        'trace' => $e->getTraceAsString()
    ]);
    Response::error('Erreur lors du traitement', 500);
}
