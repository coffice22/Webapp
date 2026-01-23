#!/bin/bash

# Script d'installation de la migration 003

DB_NAME="cofficed_coffice"
DB_USER="cofficed_user"
DB_PASSWORD="CofficeADMIN2025!"

echo "======================================"
echo "Installation Migration 003"
echo "======================================"
echo ""

# Appliquer la migration
echo "Application de la migration..."
mysql -u "$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" < database/migrations/003_add_rappel_envoye.sql

if [ $? -eq 0 ]; then
    echo "✓ Migration 003 appliquée avec succès"
else
    echo "✗ Erreur lors de l'application de la migration"
    exit 1
fi

echo ""
echo "======================================"
echo "Migration terminée"
echo "======================================"
