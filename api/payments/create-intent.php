<?php

/**
 * Create Payment Intent - Créer une intention de paiement
 * POST /api/payments/create-intent
 *
 * Body: {
 *   "amount": 5000,
 *   "currency": "dzd",
 *   "description": "Réservation espace coworking",
 *   "reservation_id": "uuid"
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

    if (!$input || !isset($input['amount'])) {
        Response::error('Montant requis', 400);
        exit;
    }

    $amount = floatval($input['amount']);
    $currency = $input['currency'] ?? 'dzd';
    $description = $input['description'] ?? 'Paiement Coffice';
    $reservationId = $input['reservation_id'] ?? null;
    $paymentMethod = $input['payment_method'] ?? 'stripe';

    if ($amount <= 0) {
        Response::error('Montant invalide', 400);
        exit;
    }

    $stripeEnabled = !empty(env('STRIPE_SECRET_KEY'));
    $cibEnabled = !empty(env('CIB_MERCHANT_ID'));

    if ($paymentMethod === 'stripe' && !$stripeEnabled) {
        Response::error('Paiement par carte non disponible. Veuillez choisir un autre mode de paiement.', 400);
        exit;
    }

    if ($paymentMethod === 'cib' && !$cibEnabled) {
        Response::error('Paiement CIB non disponible. Veuillez choisir un autre mode de paiement.', 400);
        exit;
    }

    if ($paymentMethod === 'stripe' && $stripeEnabled) {
        try {
            require_once __DIR__ . '/../../vendor/autoload.php';
            \Stripe\Stripe::setApiKey(env('STRIPE_SECRET_KEY'));

            $paymentIntent = \Stripe\PaymentIntent::create([
                'amount' => intval($amount * 100),
                'currency' => strtolower($currency),
                'description' => $description,
                'metadata' => [
                    'user_id' => $authUser['id'],
                    'reservation_id' => $reservationId ?? '',
                    'email' => $authUser['email']
                ]
            ]);

            Logger::info('Stripe payment intent created', [
                'user_id' => $authUser['id'],
                'amount' => $amount,
                'intent_id' => $paymentIntent->id
            ]);

            Response::success([
                'client_secret' => $paymentIntent->client_secret,
                'payment_intent_id' => $paymentIntent->id,
                'amount' => $amount,
                'currency' => $currency
            ], 'Intention de paiement créée');

        } catch (\Stripe\Exception\ApiErrorException $e) {
            Logger::error('Stripe API error', [
                'error' => $e->getMessage(),
                'user_id' => $authUser['id']
            ]);
            Response::error('Erreur lors de la création du paiement: ' . $e->getMessage(), 500);
        }
    } elseif ($paymentMethod === 'cib' && $cibEnabled) {
        $transactionId = 'CIB-' . UuidHelper::generate();

        $cibData = [
            'merchant_id' => env('CIB_MERCHANT_ID'),
            'amount' => $amount,
            'currency' => '012',
            'transaction_id' => $transactionId,
            'return_url' => env('APP_URL') . '/api/payments/cib-callback',
            'cancel_url' => env('APP_URL') . '/app/reservations'
        ];

        Logger::info('CIB payment intent created', [
            'user_id' => $authUser['id'],
            'amount' => $amount,
            'transaction_id' => $transactionId
        ]);

        Response::success([
            'payment_url' => 'https://payment.cib.dz/payment',
            'transaction_id' => $transactionId,
            'cib_data' => $cibData
        ], 'Intention de paiement CIB créée');

    } else {
        $transactionId = 'MANUAL-' . UuidHelper::generate();

        Logger::info('Manual payment intent created', [
            'user_id' => $authUser['id'],
            'amount' => $amount,
            'transaction_id' => $transactionId
        ]);

        Response::success([
            'transaction_id' => $transactionId,
            'payment_method' => $paymentMethod,
            'amount' => $amount,
            'requires_manual_confirmation' => true
        ], 'Paiement manuel à confirmer');
    }

} catch (Exception $e) {
    Logger::error('Error in create payment intent', [
        'error' => $e->getMessage(),
        'trace' => $e->getTraceAsString()
    ]);
    Response::error('Erreur lors de la création du paiement', 500);
}
