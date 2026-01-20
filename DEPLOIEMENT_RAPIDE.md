# Déploiement Rapide - Coffice v3.0

## Installation en 5 commandes

```bash
# 1. Base de données
mysql -u root -p < database/coffice.sql

# 2. Administrateur
php scripts/create_admin_simple.php

# 3. Configuration
cp .env.example .env && nano .env

# 4. Dépendances
npm install

# 5. Build
npm run build
```

## Identifiants par défaut

**Admin créé :**
- Email : `admin@coffice.dz`
- Password : `Admin@Coffice2025`

**IMPORTANT :** Changez le mot de passe immédiatement après la première connexion !

## Vérification rapide

```bash
# Vérifier la base de données
mysql -u root -p coffice -e "SELECT COUNT(*) as espaces FROM espaces; SELECT COUNT(*) as abonnements FROM abonnements;"

# Vérifier le build
ls -lh dist/

# Tester l'API
curl http://localhost/api/espaces/index.php
```

## Structure déployée

```
Production/
├── dist/                  # Frontend (à copier vers /var/www/coffice/dist)
│   ├── index.html
│   └── assets/
├── api/                   # Backend (à copier vers /var/www/coffice/api)
│   ├── auth/
│   ├── espaces/
│   ├── reservations/
│   └── ...
├── public/                # Images (à copier vers /var/www/coffice/public)
│   ├── booth-*.jpeg
│   └── espace-*.jpeg
└── .env                   # Configuration (à placer dans /var/www/coffice/.env)
```

## Configuration Apache

```apache
<VirtualHost *:80>
    ServerName coffice.dz
    ServerAlias www.coffice.dz
    DocumentRoot /var/www/coffice/dist

    <Directory /var/www/coffice/dist>
        Options -Indexes +FollowSymLinks
        AllowOverride All
        Require all granted

        # React Router
        RewriteEngine On
        RewriteBase /
        RewriteRule ^index\.html$ - [L]
        RewriteCond %{REQUEST_FILENAME} !-f
        RewriteCond %{REQUEST_FILENAME} !-d
        RewriteRule . /index.html [L]
    </Directory>

    # API Backend
    Alias /api /var/www/coffice/api
    <Directory /var/www/coffice/api>
        Options -Indexes +FollowSymLinks
        AllowOverride All
        Require all granted
    </Directory>

    # Images publiques
    Alias /public /var/www/coffice/public
    <Directory /var/www/coffice/public>
        Options -Indexes
        Require all granted
    </Directory>

    ErrorLog ${APACHE_LOG_DIR}/coffice_error.log
    CustomLog ${APACHE_LOG_DIR}/coffice_access.log combined
</VirtualHost>
```

## Configuration Nginx

```nginx
server {
    listen 80;
    server_name coffice.dz www.coffice.dz;
    root /var/www/coffice/dist;
    index index.html;

    # Frontend
    location / {
        try_files $uri $uri/ /index.html;
    }

    # API Backend
    location /api {
        alias /var/www/coffice/api;
        location ~ \.php$ {
            include snippets/fastcgi-php.conf;
            fastcgi_pass unix:/var/run/php/php8.1-fpm.sock;
            fastcgi_param SCRIPT_FILENAME $request_filename;
        }
    }

    # Images publiques
    location /public {
        alias /var/www/coffice/public;
    }

    access_log /var/log/nginx/coffice_access.log;
    error_log /var/log/nginx/coffice_error.log;
}
```

## Variables d'environnement (.env)

```env
# Base de données
DB_HOST=localhost
DB_NAME=coffice
DB_USER=coffice_user
DB_PASSWORD=CHANGE_ME_STRONG_PASSWORD

# JWT (générez des valeurs uniques !)
JWT_SECRET=GENERATE_RANDOM_32_CHARS_HERE
JWT_REFRESH_SECRET=GENERATE_ANOTHER_RANDOM_32_CHARS

# Application
APP_ENV=production
APP_URL=https://coffice.dz
VITE_API_URL=https://coffice.dz/api

# Email (optionnel)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=noreply@coffice.dz
SMTP_PASS=email_password
SMTP_FROM=noreply@coffice.dz
```

## Générer des secrets JWT sécurisés

```bash
# Générer 2 secrets aléatoires de 32 caractères
openssl rand -hex 32
openssl rand -hex 32
```

## Checklist post-déploiement

- [ ] Base de données créée et peuplée
- [ ] Admin créé et mot de passe changé
- [ ] Variables .env configurées avec secrets uniques
- [ ] Frontend compilé et déployé
- [ ] Backend API accessible
- [ ] Serveur web configuré (Apache/Nginx)
- [ ] SSL/HTTPS activé (Let's Encrypt recommandé)
- [ ] Permissions fichiers correctes (755 pour dossiers, 644 pour fichiers)
- [ ] Test de connexion admin réussi
- [ ] Test de réservation réussi
- [ ] Sauvegardes automatiques configurées

## Sauvegardes automatiques

```bash
# Éditer le script de backup
nano scripts/backup_database.sh

# Rendre exécutable
chmod +x scripts/backup_database.sh

# Tester manuellement
./scripts/backup_database.sh

# Ajouter au cron (tous les jours à 2h du matin)
crontab -e
# Ajouter cette ligne :
0 2 * * * /var/www/coffice/scripts/backup_database.sh
```

## Monitoring et maintenance

### Logs à surveiller
- `/var/log/apache2/coffice_error.log` (Apache)
- `/var/log/nginx/coffice_error.log` (Nginx)
- `/var/log/mysql/error.log` (MySQL)

### Commandes utiles

```bash
# Vérifier l'espace disque
df -h

# Vérifier MySQL
systemctl status mysql

# Vérifier Apache
systemctl status apache2

# Vérifier Nginx
systemctl status nginx

# Vérifier PHP-FPM
systemctl status php8.1-fpm

# Nettoyer la base (tous les 3 mois)
mysql -u root -p coffice -e "CALL cleanup_expired_data();"
```

## Résolution de problèmes

### "Database connection failed"
```bash
# Vérifier MySQL
systemctl status mysql
mysql -u coffice_user -p coffice -e "SELECT 1;"
```

### "API 500 Error"
```bash
# Vérifier les logs PHP
tail -f /var/log/apache2/coffice_error.log
# ou
tail -f /var/log/nginx/coffice_error.log

# Vérifier les permissions
chmod -R 755 /var/www/coffice/api
chown -R www-data:www-data /var/www/coffice
```

### "Page blanche / 404"
```bash
# Vérifier le mod_rewrite (Apache)
a2enmod rewrite
systemctl restart apache2

# Vérifier try_files (Nginx)
nginx -t
systemctl restart nginx
```

## Support technique

**Documentation complète :**
- [README.md](README.md) - Documentation générale
- [INSTALLATION.md](INSTALLATION.md) - Guide d'installation détaillé
- [DEPLOIEMENT.md](DEPLOIEMENT.md) - Guide de déploiement complet
- [CHANGELOG.md](CHANGELOG.md) - Historique des versions

**Contact :**
- Email : contact@coffice.dz
- Adresse : Mohammadia Mall, 4ème étage, Bureau 1178, Alger
