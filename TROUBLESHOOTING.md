# 🔍 Guide de Dépannage - Coffice

## Erreur: "Erreur lors de la création de la réservation"

### Diagnostic

1. **Vérifier la connexion à la base de données:**

```bash
# Via navigateur ou curl
curl http://localhost/api/test_db_connection.php
# OU
curl https://coffice.dz/api/test_db_connection.php
```

Ce script teste:

- La connexion MySQL
- L'existence de toutes les tables
- Les colonnes critiques de la table reservations

### Solutions Possibles

#### Problème 1: Base de données non initialisée

**Symptôme:** Les tables n'existent pas

**Solution:**

```bash
# 1. Importer le schéma complet
mysql -u cofficed_user -p cofficed_coffice < database/coffice.sql

# 2. Appliquer les migrations
mysql -u cofficed_user -p cofficed_coffice < database/migrations/002_password_resets.sql
mysql -u cofficed_user -p cofficed_coffice < database/migrations/003_add_rappel_envoye.sql
```

#### Problème 2: Colonne rappel_envoye manquante

**Symptôme:** Le script de rappels échoue

**Solution:**

```bash
mysql -u cofficed_user -p cofficed_coffice < database/migrations/003_add_rappel_envoye.sql
```

#### Problème 3: Connexion MySQL incorrecte

**Symptôme:** Erreur "Erreur de connexion à la base de données"

**Solution:** Vérifier le fichier `.env`:

```env
DB_HOST=localhost
DB_PORT=3306
DB_NAME=cofficed_coffice
DB_USER=cofficed_user
DB_PASSWORD=CofficeADMIN2025!
```

Tester la connexion:

```bash
mysql -u cofficed_user -p -h localhost cofficed_coffice
```

#### Problème 4: Permissions incorrectes

**Symptôme:** Erreur "Access denied"

**Solution:**

```sql
-- Se connecter en root
mysql -u root -p

-- Créer/modifier les permissions
GRANT ALL PRIVILEGES ON cofficed_coffice.* TO 'cofficed_user'@'localhost';
FLUSH PRIVILEGES;
```

#### Problème 5: Logs PHP non activés

**Symptôme:** Pas de détails d'erreur

**Solution:**

```bash
# Vérifier/créer le dossier de logs
mkdir -p api/logs
chmod 755 api/logs
touch api/logs/php_errors.log
chmod 666 api/logs/php_errors.log

# Activer le mode développement dans .env
APP_ENV=development
```

Puis consulter les logs:

```bash
tail -f api/logs/php_errors.log
```

#### Problème 6: Environnement de développement

**Symptôme:** Message d'erreur générique sans détails

**Solution:** Activer le mode debug dans `.env`:

```env
APP_ENV=development
```

Cela affichera les messages d'erreur détaillés dans les réponses API.

### Checklist Complète

- [ ] Base de données créée: `cofficed_coffice`
- [ ] Utilisateur MySQL créé: `cofficed_user`
- [ ] Schéma importé: `database/coffice.sql`
- [ ] Migration 002 appliquée: `password_resets`
- [ ] Migration 003 appliquée: `rappel_envoye`
- [ ] `.env` correctement configuré
- [ ] Dossier `api/logs` existe et est accessible en écriture
- [ ] Dossier `api/uploads` existe et est accessible en écriture
- [ ] PHP version 8.1+
- [ ] MySQL version 8.0+
- [ ] Extensions PHP: pdo, pdo_mysql, mbstring, json

### Test Final

```bash
# Test connexion DB
php -f api/test_db_connection.php

# Test création réservation (avec données valides)
curl -X POST https://coffice.dz/api/reservations/create.php \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "espace_id": "UUID_ESPACE",
    "date_debut": "2026-01-25T10:00:00",
    "date_fin": "2026-01-25T12:00:00",
    "participants": 1
  }'
```

### Support Avancé

Si le problème persiste après avoir suivi tous ces steps:

1. Activer le mode développement dans `.env`
2. Reproduire l'erreur
3. Consulter les logs: `tail -100 api/logs/php_errors.log`
4. Vérifier les logs MySQL: `tail -100 /var/log/mysql/error.log`
5. Noter le message d'erreur exact retourné par l'API

### Logs Utiles

```bash
# Logs PHP
tail -f api/logs/php_errors.log

# Logs Apache
tail -f /var/log/apache2/error.log

# Logs MySQL
tail -f /var/log/mysql/error.log

# Logs de l'application (si existe)
tail -f api/logs/app.log
```
