# Scripts d'Administration Coffice

## Scripts disponibles

### create_admin_simple.php
Création d'un compte administrateur via ligne de commande.

**Usage :**
```bash
php scripts/create_admin_simple.php
```

**Crée un admin avec :**
- Email : admin@coffice.dz
- Password : Admin@Coffice2025

**Recommandé pour :** Installation serveur avec accès SSH/Terminal.

---

### create_admin_web.php
Création d'un compte administrateur via navigateur web.

**Usage :**
```
http://votre-domaine.com/scripts/create_admin_web.php
```

**Important :** Supprimez ce fichier immédiatement après utilisation pour des raisons de sécurité.

**Recommandé pour :** Hébergement mutualisé sans accès terminal.

---

### apply_migration.php
Application de migrations SQL sur la base de données.

**Usage :**
```bash
php scripts/apply_migration.php path/to/migration.sql
```

**Exemple :**
```bash
php scripts/apply_migration.php database/migrations/001_coffice_complete.sql
```

---

### backup_database.sh
Script de sauvegarde automatique de la base de données MySQL.

**Usage :**
```bash
bash scripts/backup_database.sh
```

**Configuration :** Éditez les variables dans le script :
- DB_USER
- DB_PASSWORD
- DB_NAME
- BACKUP_DIR

**Recommandé :** Ajouter au cron pour sauvegardes automatiques.

---

## Installation Rapide

### 1. Première installation complète
```bash
# Importer le schéma
mysql -u root -p < database/coffice.sql

# Appliquer les migrations
php scripts/apply_migration.php database/migrations/001_coffice_complete.sql

# Créer l'administrateur
php scripts/create_admin_simple.php
```

### 2. Configuration des sauvegardes
```bash
# Éditer le script de backup
nano scripts/backup_database.sh

# Tester le backup
bash scripts/backup_database.sh

# Ajouter au cron (tous les jours à 2h)
crontab -e
# Ajouter : 0 2 * * * /path/to/scripts/backup_database.sh
```

## Sécurité

1. Ne jamais commiter les credentials dans les scripts
2. Supprimer `create_admin_web.php` après utilisation
3. Restreindre l'accès au dossier `scripts/` en production
4. Changer le mot de passe admin par défaut après première connexion
5. Garder les backups dans un endroit sécurisé

## Notes

- Tous les scripts nécessitent PHP 8.1+
- Les scripts utilisent les variables d'environnement du fichier `.env`
- Les migrations sont idempotentes et peuvent être exécutées plusieurs fois
