<?php

/**
 * Payment Webhook - Recevoir les webhooks de Stripe
 * POST /api/payments/webhook
 */

require_once __DIR__ . '/../bootstrap.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    Response::error('Méthode non autorisée', 405);
    exit;
}

try {
    $stripeEnabled = !empty(env('STRIPE_SECRET_KEY')) && !empty(env('STRIPE_WEBHOOK_SECRET'));

    if (!$stripeEnabled) {
        Logger::warning('Stripe webhook received but not configured');
        Response::error('Webhooks non configurés', 400);
        exit;
    }

    require_once __DIR__ . '/../../vendor/autoload.php';
    \Stripe\Stripe::setApiKey(env('STRIPE_SECRET_KEY'));

    $payload = file_get_contents('php://input');
    $sigHeader = $_SERVER['HTTP_STRIPE_SIGNATURE'] ?? '';

    try {
        $event = \Stripe\Webhook::constructEvent(
            $payload,
            $sigHeader,
            env('STRIPE_WEBHOOK_SECRET')
        );
    } catch (\UnexpectedValueException $e) {
        Logger::error('Invalid webhook payload', ['error' => $e->getMessage()]);
        Response::error('Payload invalide', 400);
        exit;
    } catch (\Stripe\Exception\SignatureVerificationException $e) {
        Logger::error('Invalid webhook signature', ['error' => $e->getMessage()]);
        Response::error('Signature invalide', 400);
        exit;
    }

    Logger::info('Stripe webhook received', ['type' => $event->type]);

    switch ($event->type) {
        case 'payment_intent.succeeded':
            $paymentIntent = $event->data->object;
            handlePaymentSuccess($db, $paymentIntent);
            break;

        case 'payment_intent.payment_failed':
            $paymentIntent = $event->data->object;
            handlePaymentFailure($db, $paymentIntent);
            break;

        default:
            Logger::info('Unhandled webhook event type', ['type' => $event->type]);
    }

    Response::success(['received' => true]);

} catch (Exception $e) {
    Logger::error('Error in payment webhook', [
        'error' => $e->getMessage(),
        'trace' => $e->getTraceAsString()
    ]);
    Response::error('Erreur lors du traitement du webhook', 500);
}

function handlePaymentSuccess($db, $paymentIntent) {
    try {
        $userId = $paymentIntent->metadata->user_id ?? null;
        $reservationId = $paymentIntent->metadata->reservation_id ?? null;

        if (!$userId || !$reservationId) {
            Logger::warning('Payment succeeded but missing metadata', [
                'payment_intent_id' => $paymentIntent->id
            ]);
            return;
        }

        $db->beginTransaction();

        $transactionId = UuidHelper::generate();

        $insertTxn = $db->prepare('
            INSERT INTO transactions
            (id, user_id, reservation_id, montant, type, mode_paiement, statut, reference_externe, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
        ');

        $insertTxn->execute([
            $transactionId,
            $userId,
            $reservationId,
            $paymentIntent->amount / 100,
            'reservation',
            'carte',
            'completee',
            $paymentIntent->id
        ]);

        $updateReservation = $db->prepare('
            UPDATE reservations
            SET statut = ?, updated_at = NOW()
            WHERE id = ?
        ');
        $updateReservation->execute(['confirmee', $reservationId]);

        $notificationId = UuidHelper::generate();
        $notificationStmt = $db->prepare('
            INSERT INTO notifications
            (id, user_id, titre, message, type, created_at)
            VALUES (?, ?, ?, ?, ?, NOW())
        ');

        $notificationStmt->execute([
            $notificationId,
            $userId,
            'Paiement confirmé',
            'Votre paiement a été confirmé avec succès. Votre réservation est confirmée.',
            'paiement'
        ]);

        $db->commit();

        Logger::info('Payment processed successfully', [
            'user_id' => $userId,
            'reservation_id' => $reservationId,
            'amount' => $paymentIntent->amount / 100,
            'payment_intent_id' => $paymentIntent->id
        ]);

    } catch (Exception $e) {
        $db->rollBack();
        Logger::error('Error handling payment success', [
            'error' => $e->getMessage(),
            'payment_intent_id' => $paymentIntent->id
        ]);
    }
}

function handlePaymentFailure($db, $paymentIntent) {
    try {
        $userId = $paymentIntent->metadata->user_id ?? null;
        $reservationId = $paymentIntent->metadata->reservation_id ?? null;

        if (!$userId || !$reservationId) {
            return;
        }

        $notificationId = UuidHelper::generate();
        $notificationStmt = $db->prepare('
            INSERT INTO notifications
            (id, user_id, titre, message, type, created_at)
            VALUES (?, ?, ?, ?, ?, NOW())
        ');

        $notificationStmt->execute([
            $notificationId,
            $userId,
            'Paiement échoué',
            'Votre paiement n\'a pas pu être traité. Veuillez réessayer.',
            'paiement'
        ]);

        Logger::info('Payment failed', [
            'user_id' => $userId,
            'reservation_id' => $reservationId,
            'payment_intent_id' => $paymentIntent->id
        ]);

    } catch (Exception $e) {
        Logger::error('Error handling payment failure', [
            'error' => $e->getMessage(),
            'payment_intent_id' => $paymentIntent->id
        ]);
    }
}
