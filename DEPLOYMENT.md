# 🚀 Guide de Déploiement - Coffice v3.1.0

## 📋 Prérequis

- PHP 7.4 ou supérieur
- MySQL 5.7 ou supérieur
- Composer (pour les dépendances PHP)
- Node.js 18+ et npm (pour le frontend)
- Serveur web (Apache/Nginx)

## 🔧 Installation

### 1. Configuration de la Base de Données

```bash
# Importer le schéma principal
mysql -u root -p cofficed_coffice < database/coffice.sql

# Appliquer la migration password_resets
mysql -u root -p cofficed_coffice < database/migrations/002_password_resets.sql
```

### 2. Installation des Dépendances PHP

```bash
# Installer Composer si nécessaire
curl -sS https://getcomposer.org/installer | php
mv composer.phar /usr/local/bin/composer

# Installer les dépendances (PHPMailer, Stripe)
composer install
```

### 3. Configuration de l'Environnement

```bash
# Copier le fichier .env et configurer
cp .env.example .env
nano .env
```

**Configuration minimale requise :**

```env
# Base de données
DB_HOST=localhost
DB_NAME=cofficed_coffice
DB_USER=cofficed_user
DB_PASSWORD=VotreMotDePasse

# Email (Gmail example)
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password
MAIL_FROM_ADDRESS=noreply@coffice.dz

# Paiement (optionnel)
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
```

### 4. Permissions des Dossiers

```bash
chmod 755 api/uploads
chmod 755 api/uploads/documents
chmod 755 api/logs
chmod 644 .env
```

### 5. Build du Frontend

```bash
npm install
npm run build
```

## 📧 Configuration Email

### Gmail

1. Activer l'authentification à deux facteurs
2. Créer un "Mot de passe d'application"
3. Utiliser ce mot de passe dans `MAIL_PASSWORD`

### SMTP Personnalisé

```env
MAIL_HOST=smtp.votre-domaine.com
MAIL_PORT=587
MAIL_USERNAME=noreply@votre-domaine.com
MAIL_PASSWORD=motdepasse
MAIL_ENCRYPTION=tls
```

## 💳 Configuration Paiement

### Stripe (Recommandé)

1. Créer un compte sur [stripe.com](https://stripe.com)
2. Obtenir les clés API dans Dashboard > Developers > API keys
3. Configurer le webhook: `https://coffice.dz/api/payments/webhook`
4. Copier le secret du webhook

```env
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### CIB (Algérie)

Contacter CIB pour obtenir:
- Merchant ID
- Secret Key
- Documentation d'intégration

```env
CIB_MERCHANT_ID=votre_merchant_id
CIB_SECRET_KEY=votre_secret_key
```

### Mode Manuel (Sans Gateway)

Laisser les variables vides. Le système permettra:
- Paiement en espèces (à confirmer sur place)
- Virement bancaire (avec référence)

## 🔐 Sécurité

### SSL/HTTPS

```bash
# Installer Certbot (Let's Encrypt)
sudo apt install certbot python3-certbot-apache
sudo certbot --apache -d coffice.dz
```

### Configuration Apache

```apache
<VirtualHost *:443>
    ServerName coffice.dz
    DocumentRoot /var/www/coffice

    SSLEngine on
    SSLCertificateFile /etc/letsencrypt/live/coffice.dz/fullchain.pem
    SSLCertificateKeyFile /etc/letsencrypt/live/coffice.dz/privkey.pem

    <Directory /var/www/coffice>
        AllowOverride All
        Require all granted
    </Directory>

    # Protection API
    <Directory /var/www/coffice/api/uploads>
        php_flag engine off
    </Directory>
</VirtualHost>
```

## 📝 Tâches Post-Déploiement

### 1. Créer le Compte Admin

```bash
php scripts/create_admin_simple.php
```

Ou visiter: `https://coffice.dz/scripts/create_admin_web.php`

### 2. Tester l'API

```bash
php scripts/test_api.php https://coffice.dz/api
```

### 3. Configuration Cron (Recommandé)

```bash
crontab -e
```

Ajouter:
```cron
# Nettoyage quotidien (2h du matin)
0 2 * * * mysql cofficed_coffice -e "CALL cleanup_expired_data()"

# Nettoyage tokens password reset expirés
0 */6 * * * mysql cofficed_coffice -e "CALL cleanup_expired_password_resets()"

# Rappels de réservation (tous les jours à 9h)
0 9 * * * php /var/www/coffice/scripts/send_reminders.php
```

## 🧪 Tests

### Backend
```bash
# Test connexion DB
php api/check.php

# Test API complète
php scripts/test_complete.php
```

### Frontend
```bash
# Build de production
npm run build

# Preview
npm run preview
```

## 🚨 Dépannage

### Problème: Email ne s'envoie pas

**Solution:**
1. Vérifier les logs: `tail -f api/logs/php_errors.log`
2. Tester SMTP: `php scripts/test_email.php`
3. Vérifier le firewall (port 587 ouvert)

### Problème: Upload échoue

**Solution:**
```bash
# Vérifier permissions
ls -la api/uploads/
chmod 755 api/uploads/documents

# Vérifier configuration PHP
php -i | grep upload_max_filesize
php -i | grep post_max_size
```

### Problème: Paiement Stripe échoue

**Solution:**
1. Mode test: `sk_test_...` et `pk_test_...`
2. Vérifier webhook reçu: Dashboard Stripe > Developers > Webhooks
3. Logs: `api/logs/php_errors.log`

## 📊 Monitoring

### Logs à Surveiller

```bash
# Erreurs PHP
tail -f api/logs/php_errors.log

# Accès Apache
tail -f /var/log/apache2/access.log

# Erreurs Apache
tail -f /var/log/apache2/error.log
```

### Métriques Importantes

- Espace disque: `df -h`
- Usage MySQL: `SHOW PROCESSLIST;`
- Connexions actives
- Temps de réponse API

## 🔄 Mises à Jour

```bash
# Sauvegarder la DB
mysqldump -u root -p cofficed_coffice > backup_$(date +%Y%m%d).sql

# Pull dernières modifications
git pull origin main

# Installer nouvelles dépendances
composer install
npm install

# Build
npm run build

# Appliquer migrations
mysql -u root -p cofficed_coffice < database/migrations/XXX_migration.sql
```

## 📞 Support

Pour toute question:
- Email: support@coffice.dz
- Documentation: https://docs.coffice.dz
- GitHub Issues: https://github.com/coffice/app/issues
