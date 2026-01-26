<?php

/**
 * Script de test de connexion à la base de données
 * Vérifie que toutes les tables nécessaires existent
 */

header('Content-Type: application/json');

require_once __DIR__ . '/config/database.php';

$results = [
    'connection' => false,
    'tables' => [],
    'missing_tables' => [],
    'errors' => []
];

try {
    $db = Database::getInstance()->getConnection();
    $results['connection'] = true;

    // Liste des tables requises
    $requiredTables = [
        'users',
        'espaces',
        'reservations',
        'abonnements',
        'domiciliations',
        'codes_promo',
        'utilisations_codes_promo',
        'notifications',
        'documents_uploads',
        'password_resets',
        'logs',
        'rate_limits'
    ];

    // Vérifier chaque table
    foreach ($requiredTables as $table) {
        try {
            $stmt = $db->query("SELECT 1 FROM $table LIMIT 1");
            $results['tables'][] = $table;
        } catch (PDOException $e) {
            $results['missing_tables'][] = $table;
            $results['errors'][] = "Table $table: " . $e->getMessage();
        }
    }

    // Vérifier les colonnes critiques
    try {
        $stmt = $db->query("DESCRIBE reservations");
        $columns = $stmt->fetchAll(PDO::FETCH_COLUMN);

        $requiredColumns = ['id', 'user_id', 'espace_id', 'date_debut', 'date_fin', 'statut', 'montant_total', 'participants'];
        $missingColumns = array_diff($requiredColumns, $columns);

        if (!empty($missingColumns)) {
            $results['errors'][] = "Colonnes manquantes dans reservations: " . implode(', ', $missingColumns);
        }

        $results['reservation_columns'] = $columns;
    } catch (PDOException $e) {
        $results['errors'][] = "Impossible de vérifier les colonnes: " . $e->getMessage();
    }

    $results['success'] = empty($results['missing_tables']) && empty($results['errors']);

} catch (Exception $e) {
    $results['errors'][] = "Erreur de connexion: " . $e->getMessage();
}

echo json_encode($results, JSON_PRETTY_PRINT);
