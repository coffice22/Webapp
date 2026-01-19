# Guide d'Installation Rapide - Coffice

## Installation en 5 minutes

### Étape 1 : Prérequis
- PHP 8.1+ avec extensions : pdo, pdo_mysql, json, mbstring, openssl
- MySQL 8.0+
- Node.js 18+
- Apache ou Nginx

### Étape 2 : Télécharger et configurer

```bash
# 1. Cloner le projet
git clone [votre-repo]
cd coffice-app

# 2. Installer les dépendances frontend
npm install

# 3. Créer le fichier .env
cp .env.example .env
nano .env  # Éditer avec vos paramètres
```

### Étape 3 : Base de données

```bash
# 1. Créer la base de données
mysql -u root -p -e "CREATE DATABASE coffice CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# 2. Importer le schéma principal
mysql -u root -p coffice < database/coffice.sql

# 3. Appliquer la migration complète
mysql -u root -p coffice < database/migrations/001_coffice_complete.sql
```

### Étape 4 : Créer l'administrateur

**Option A - Terminal (Recommandé)**
```bash
php scripts/create_admin_simple.php
```

**Option B - Navigateur web**
```
http://votre-domaine.com/scripts/create_admin_web.php
```
**Important :** Supprimez le fichier après utilisation !

**Identifiants créés :**
- Email : admin@coffice.dz
- Password : Admin@Coffice2025

### Étape 5 : Build et déploiement

```bash
# Build pour production
npm run build

# Les fichiers compilés sont dans le dossier dist/
# Copiez-les vers votre serveur web
```

## Configuration Apache

```apache
<VirtualHost *:80>
    ServerName coffice.dz
    DocumentRoot /var/www/coffice/dist

    <Directory /var/www/coffice/dist>
        Options -Indexes +FollowSymLinks
        AllowOverride All
        Require all granted

        # Redirection pour React Router
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
</VirtualHost>
```

## Configuration Nginx

```nginx
server {
    listen 80;
    server_name coffice.dz;
    root /var/www/coffice/dist;
    index index.html;

    # Frontend - React Router
    location / {
        try_files $uri $uri/ /index.html;
    }

    # API Backend
    location /api {
        alias /var/www/coffice/api;
        location ~ \.php$ {
            fastcgi_pass unix:/var/run/php/php8.1-fpm.sock;
            fastcgi_index index.php;
            include fastcgi_params;
            fastcgi_param SCRIPT_FILENAME $request_filename;
        }
    }
}
```

## Vérification de l'installation

### 1. Tester la base de données
```bash
mysql -u root -p coffice -e "SELECT COUNT(*) FROM espaces;"
mysql -u root -p coffice -e "SELECT COUNT(*) FROM users WHERE role='admin';"
```

### 2. Tester l'API
```bash
curl http://localhost/api/espaces/index.php
```

### 3. Tester l'authentification
```bash
curl -X POST http://localhost/api/auth/login.php \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@coffice.dz","password":"Admin@Coffice2025"}'
```

## Fichier .env minimal

```env
# Base de données
DB_HOST=localhost
DB_NAME=coffice
DB_USER=coffice_user
DB_PASSWORD=votre_password_securise

# JWT Secrets (générez des valeurs uniques)
JWT_SECRET=votre_secret_jwt_minimum_32_caracteres
JWT_REFRESH_SECRET=votre_secret_refresh_minimum_32_caracteres

# Application
APP_ENV=production
VITE_API_URL=https://votre-domaine.com/api
```

## Génération de secrets JWT

```bash
# Générer des secrets aléatoires sécurisés
openssl rand -hex 32
openssl rand -hex 32
```

## Checklist post-installation

- [ ] Base de données créée et migrée
- [ ] Compte admin créé et testé
- [ ] Fichier .env configuré avec secrets uniques
- [ ] Build frontend compilé et déployé
- [ ] Serveur web configuré (Apache/Nginx)
- [ ] API accessible et répond correctement
- [ ] Authentification fonctionnelle
- [ ] Permissions fichiers correctes (755/644)
- [ ] SSL/HTTPS configuré (Let's Encrypt)
- [ ] Sauvegardes automatiques configurées

## Problèmes courants

### "Connection refused" sur l'API
- Vérifier que PHP-FPM est actif : `systemctl status php8.1-fpm`
- Vérifier les permissions du dossier api/

### "Database connection failed"
- Vérifier les credentials dans .env
- Vérifier que MySQL est actif : `systemctl status mysql`

### "Page not found" sur les routes React
- Vérifier la configuration RewriteEngine (Apache)
- Vérifier try_files (Nginx)

### Erreur 500 sur l'API
- Vérifier les logs PHP : `/var/log/apache2/error.log`
- Vérifier les permissions : `chmod -R 755 api/`

## Support

Pour plus d'informations, consultez :
- [README.md](README.md) - Documentation complète
- [DEPLOIEMENT.md](DEPLOIEMENT.md) - Guide de déploiement détaillé
- `database/migrations/README.md` - Documentation des migrations
- `scripts/README.md` - Documentation des scripts

## Prochaines étapes

Après l'installation :
1. Connectez-vous avec le compte admin
2. Changez le mot de passe admin
3. Configurez les espaces de coworking
4. Testez une réservation
5. Configurez les codes promo si nécessaire
6. Créez des comptes utilisateurs de test

Bonne utilisation de Coffice !
