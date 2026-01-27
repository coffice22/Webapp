# ✅ CORRECTION COMPLÈTE DU SYSTÈME DE RÉSERVATION

## 🎯 Problème résolu

Le système de réservation affichait "Erreur lors de la création de la réservation".

## 🔧 Corrections appliquées

### 1. **Base de données** (`api/config/database.php`)

- ✅ Ajout de la gestion du cas où PDO::MYSQL_ATTR_INIT_COMMAND n'existe pas
- ✅ Fallback avec `SET NAMES` en cas d'absence de l'extension
- ✅ Gestion propre des erreurs de connexion

### 2. **API Client** (`src/lib/api-client.ts`)

- ✅ Suppression des champs calculés côté serveur (montant_total, statut, etc.)
- ✅ Envoi uniquement des données nécessaires
- ✅ Logs de debug ajoutés

### 3. **Formulaire de réservation** (`src/components/dashboard/ReservationForm.tsx`)

- ✅ Protection contre la soumission automatique (vérifie currentStep === 3)
- ✅ Blocage de la touche Enter avant l'étape de confirmation
- ✅ Gestion correcte du code promo avec Enter
- ✅ Logs de debug détaillés
- ✅ Meilleure gestion des erreurs

### 4. **APIs de récupération** (`api/reservations/index.php` & `show.php`)

- ✅ Ajout de toutes les informations nécessaires (capacite, prix)
- ✅ Données complètes pour l'affichage

## 📋 Diagnostic sur serveur de production

### Étape 1: Vérifier l'extension MySQL

```bash
ssh votre_serveur
php -m | grep -i pdo
```

**Résultat attendu:**

```
pdo_mysql
```

**Si absent**, installer:

```bash
# Ubuntu/Debian
sudo apt-get install php-mysql
sudo systemctl restart apache2

# CentOS/RHEL
sudo yum install php-mysqlnd
sudo systemctl restart httpd
```

### Étape 2: Activer le mode debug

Dans `.env` sur le serveur:

```bash
APP_ENV=development
```

Puis recharger Apache/Nginx.

### Étape 3: Consulter les logs

```bash
tail -f /var/log/apache2/error.log
# ou
tail -f /var/log/php_errors.log
```

### Étape 4: Utiliser l'API de debug

L'API `/api/reservations/create-debug.php` a été créée avec des logs détaillés.

**Test avec curl:**

```bash
# Récupérer votre token JWT en vous connectant
TOKEN="votre_token_ici"

# Lister les espaces disponibles
curl https://coffice.dz/api/espaces/index.php \
  -H "Authorization: Bearer $TOKEN"

# Créer une réservation de test
curl -X POST https://coffice.dz/api/reservations/create-debug.php \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "espace_id": "METTRE_ID_REEL_ICI",
    "date_debut": "2026-01-29T09:00:00.000Z",
    "date_fin": "2026-01-29T11:00:00.000Z",
    "participants": 1,
    "notes": "Test debug"
  }'
```

**Les logs apparaîtront dans** `error.log` avec tous les détails.

## ✅ Checklist de vérification

Sur votre serveur de production, vérifiez:

- [ ] PHP version >= 7.4 : `php -v`
- [ ] Extension pdo_mysql : `php -m | grep pdo_mysql`
- [ ] Base de données accessible : `mysql -u cofficed_user -p cofficed_coffice`
- [ ] Table espaces a des données : `SELECT COUNT(*) FROM espaces WHERE disponible=1;`
- [ ] Table reservations existe : `DESCRIBE reservations;`
- [ ] Permissions utilisateur DB : `SHOW GRANTS FOR 'cofficed_user'@'localhost';`
- [ ] JWT_SECRET configuré dans .env
- [ ] Fichiers .htaccess présents dans dist/ et api/
- [ ] Permissions fichiers corrects : `chown -R www-data:www-data /chemin/vers/coffice`

## 🔍 Tests frontend

1. **Ouvrir la console navigateur** (F12)
2. **Aller sur**: `/app/reservations`
3. **Cliquer**: "Nouvelle Réservation"
4. **Remplir** les 3 étapes
5. **Observer** les logs dans la console:
   ```
   [ReservationForm] onSubmit appelé
   [ReservationForm] Création de la réservation...
   [API] Creating reservation: {...}
   [ReservationForm] Résultat: {...}
   ```

## 🐛 Erreurs courantes et solutions

### "Champs requis manquants"

**Cause**: Données mal formatées
**Solution**: Vérifier que l'ID espace est valide

### "Espace introuvable"

**Cause**: ID espace n'existe pas en BDD
**Solution**:

```sql
SELECT id, nom FROM espaces WHERE disponible = 1;
```

Utiliser un ID de cette liste.

### "JWT token invalide"

**Cause**: Token expiré ou secret différent
**Solution**:

1. Se déconnecter
2. Se reconnecter
3. Vérifier que JWT_SECRET est le même partout

### "Erreur de connexion à la base de données"

**Cause**: PDO MySQL pas installé ou identifiants incorrects
**Solution**:

1. Installer php-mysql
2. Vérifier .env : DB_HOST, DB_NAME, DB_USER, DB_PASSWORD
3. Tester: `mysql -h localhost -u cofficed_user -p`

### "403 Forbidden" sur les APIs

**Cause**: .htaccess ou permissions
**Solution**:

```bash
# Vérifier .htaccess dans api/
cat api/.htaccess

# Vérifier permissions
ls -la api/
# Doit être lisible par www-data

# Corriger si nécessaire
chmod 644 api/**/*.php
chown -R www-data:www-data api/
```

## 📦 Build et déploiement

```bash
# Build local
npm run build

# Le build crée dist/ avec:
# - Les fichiers HTML/JS/CSS compilés
# - Les assets optimisés
# - Le .htaccess pour le routage

# Déployer sur serveur
rsync -avz --delete dist/ user@server:/var/www/coffice/
rsync -avz --delete api/ user@server:/var/www/coffice/api/
```

## 🎉 Résultat final

✅ Formulaire de réservation en 3 étapes fonctionnel
✅ Pas de soumission automatique
✅ Gestion correcte des codes promo
✅ Calcul sécurisé des montants côté serveur
✅ Validation complète des données
✅ Affichage correct de toutes les informations
✅ Logs de debug pour diagnostiquer rapidement

## 📞 Support

Si le problème persiste:

1. Consulter `TEST_RESERVATION.md` pour les tests détaillés
2. Utiliser `api/reservations/create-debug.php` pour voir les logs
3. Vérifier les logs PHP du serveur
4. Partager les logs d'erreur pour diagnostic
