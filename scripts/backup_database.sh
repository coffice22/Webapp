#!/bin/bash

# Script de backup automatique de la base de données
# À exécuter avec un cron job quotidien

# Configuration
DB_HOST="localhost"
DB_NAME="coffice"
DB_USER="root"
DB_PASS=""
BACKUP_DIR="/var/backups/coffice"
DATE=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="coffice_backup_$DATE.sql"
DAYS_TO_KEEP=30

# Couleurs pour les messages
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Créer le dossier de backup s'il n'existe pas
mkdir -p "$BACKUP_DIR"

echo -e "${YELLOW}=== Début du backup de la base de données ===${NC}"
echo "Date: $(date)"
echo "Base: $DB_NAME"
echo "Fichier: $BACKUP_FILE"

# Effectuer le backup
if mysqldump -h "$DB_HOST" -u "$DB_USER" ${DB_PASS:+-p"$DB_PASS"} \
    --single-transaction \
    --routines \
    --triggers \
    --add-drop-table \
    "$DB_NAME" > "$BACKUP_DIR/$BACKUP_FILE" 2>&1; then

    # Compresser le fichier
    gzip "$BACKUP_DIR/$BACKUP_FILE"

    BACKUP_SIZE=$(du -h "$BACKUP_DIR/$BACKUP_FILE.gz" | cut -f1)
    echo -e "${GREEN}✓ Backup réussi${NC}"
    echo "Taille: $BACKUP_SIZE"
    echo "Emplacement: $BACKUP_DIR/$BACKUP_FILE.gz"

    # Nettoyer les anciens backups
    echo -e "\n${YELLOW}Nettoyage des anciens backups (> $DAYS_TO_KEEP jours)...${NC}"
    find "$BACKUP_DIR" -name "coffice_backup_*.sql.gz" -type f -mtime +$DAYS_TO_KEEP -delete
    REMAINING=$(find "$BACKUP_DIR" -name "coffice_backup_*.sql.gz" -type f | wc -l)
    echo "Backups restants: $REMAINING"

    # Calculer l'espace total utilisé
    TOTAL_SIZE=$(du -sh "$BACKUP_DIR" | cut -f1)
    echo "Espace total utilisé: $TOTAL_SIZE"

    # Enregistrer dans la table backups (optionnel)
    # mysql -h "$DB_HOST" -u "$DB_USER" ${DB_PASS:+-p"$DB_PASS"} "$DB_NAME" <<EOF
    # INSERT INTO backups (filename, type, size, path, status, created_at)
    # VALUES ('$BACKUP_FILE.gz', 'full', $(stat -f%z "$BACKUP_DIR/$BACKUP_FILE.gz"), '$BACKUP_DIR/$BACKUP_FILE.gz', 'success', NOW());
    # EOF

    echo -e "\n${GREEN}=== Backup terminé avec succès ===${NC}"
    exit 0

else
    echo -e "${RED}✗ Erreur lors du backup${NC}"
    echo -e "\n${RED}=== Backup échoué ===${NC}"
    exit 1
fi
