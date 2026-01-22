# Guide d'Installation Coffice

## Prérequis

- Serveur web avec PHP 8.1+ et MySQL 8.0+
- Accès cPanel ou terminal SSH
- Node.js 18+ (pour le build frontend)

## Installation Backend PHP/MySQL

### Étape 1: Configuration de la base de données

1. **Créer la base de données MySQL via cPanel**
   - Connectez-vous à cPanel
   - Allez dans "Bases de données MySQL"
   - Créez une nouvelle base de données nommée `cofficed_coffice`
   - Créez un utilisateur `cofficed_user` avec un mot de passe sécurisé
   - Associez l'utilisateur à la base avec tous les privilèges

### Étape 2: Configuration du fichier .env

2. **Copier et configurer .env**

   ```bash
   cp .env.example .env
   ```

3. **Éditer le fichier .env** avec vos vraies valeurs:

   ```env
   # URL de l'API Backend
   VITE_API_URL=https://coffice.dz/api

   # Configuration MySQL (IMPORTANT: remplacer par vos vraies valeurs)
   DB_HOST=localhost
   DB_PORT=3306
   DB_NAME=cofficed_coffice
   DB_USER=cofficed_user
   DB_PASSWORD=votre_mot_de_passe_mysql_fort_ici
   DB_CHARSET=utf8mb4

   # URL de l'application
   APP_URL=https://coffice.dz
   APP_ENV=production

   # Clé secrète JWT (générer avec: openssl rand -base64 64)
   JWT_SECRET=votre_cle_secrete_jwt_generee_ici

   # Stockage
   UPLOAD_MAX_SIZE=5242880
   UPLOAD_DIR=uploads

   # Sécurité
   RATE_LIMIT_MAX_ATTEMPTS=60
   RATE_LIMIT_DECAY_MINUTES=1
   SESSION_LIFETIME=10080
   PASSWORD_MIN_LENGTH=6
   ```

4. **Générer une clé JWT secrète**

   ```bash
   # Sur Linux/Mac
   openssl rand -base64 64

   # Sur Windows (PowerShell)
   [Convert]::ToBase64String((1..64 | ForEach-Object { Get-Random -Maximum 256 }))
   ```

   Copiez le résultat dans `JWT_SECRET=`

### Étape 3: Installation automatique de la base de données

5. **Exécuter le script d'installation**
   - Visitez: `https://coffice.dz/api/install.php`
   - Le script va automatiquement:
     - Vérifier la configuration
     - Se connecter à MySQL
     - Créer la base de données si nécessaire
     - Importer le schéma complet (tables, index, procédures, triggers)
     - Insérer les données initiales (espaces, abonnements)
     - Vérifier l'installation

6. **Vérifier le résultat**
   - Si tout est OK: message "✅ Installation terminée avec succès!"
   - Conservez le JSON retourné pour diagnostic si besoin

7. **IMPORTANT: Supprimer le fichier d'installation**
   ```bash
   rm api/install.php
   ```
   **Pour des raisons de sécurité, supprimez ce fichier immédiatement après installation!**

### Étape 4: Créer un compte administrateur

8. **Via le script PHP**

   ```bash
   php scripts/create_admin_web.php
   ```

   Ou via ligne de commande:

   ```bash
   php scripts/create_admin_simple.php
   ```

## Installation Frontend React

### Build pour production

```bash
# Installer les dépendances
npm install

# Build de production
npm run build

# Les fichiers sont générés dans /dist
```

### Déploiement

1. **Upload des fichiers**
   - Uploadez tout le contenu de `/dist` vers le dossier racine web
   - Uploadez tout le dossier `/api` vers le serveur

2. **Configuration Apache (.htaccess)**

   Fichier `.htaccess` racine (déjà inclus):

   ```apache
   RewriteEngine On
   RewriteBase /

   # Ne pas rediriger les fichiers existants
   RewriteCond %{REQUEST_FILENAME} !-f
   RewriteCond %{REQUEST_FILENAME} !-d

   # Ne pas rediriger les appels API
   RewriteCond %{REQUEST_URI} !^/api/

   # Rediriger vers index.html pour le routing React
   RewriteRule ^ index.html [L]
   ```

3. **Vérifier les permissions**
   ```bash
   chmod 755 api/
   chmod 644 api/*.php
   chmod 644 .env
   chmod 700 .env  # Protéger le fichier .env
   ```

## Vérification de l'installation

### Tests manuels

1. **Test API**

   ```bash
   curl https://coffice.dz/api/auth/debug.php
   ```

   Devrait retourner: `{"success":true,"message":"API PHP fonctionnelle"}`

2. **Test connexion base de données**
   Créez un fichier temporaire `api/test_db.php`:

   ```php
   <?php
   require_once 'config/database.php';
   $db = Database::getInstance()->getConnection();
   echo json_encode(['success' => true, 'message' => 'Connexion DB OK']);
   ?>
   ```

   Visitez: `https://coffice.dz/api/test_db.php`
   Puis supprimez le fichier!

3. **Test inscription**
   - Allez sur: `https://coffice.dz/inscription`
   - Créez un compte de test
   - Vérifiez que vous recevez le token JWT

4. **Test connexion admin**
   - Allez sur: `https://coffice.dz/connexion`
   - Connectez-vous avec le compte admin créé
   - Accédez au tableau de bord admin

### Script de test complet

```bash
php scripts/test_complete.php
```

## Structure des dossiers

```
coffice/
├── api/                    # Backend PHP
│   ├── auth/              # Endpoints authentification
│   ├── users/             # Endpoints utilisateurs
│   ├── espaces/           # Endpoints espaces
│   ├── reservations/      # Endpoints réservations
│   ├── domiciliations/    # Endpoints domiciliations
│   ├── abonnements/       # Endpoints abonnements
│   ├── codes-promo/       # Endpoints codes promo
│   ├── parrainages/       # Endpoints parrainages
│   ├── notifications/     # Endpoints notifications
│   ├── admin/             # Endpoints admin (stats, revenus)
│   ├── config/            # Configuration (database, CORS)
│   ├── utils/             # Utilitaires (Auth, Response, Validator, etc.)
│   └── .htaccess         # Protection API
├── database/
│   └── coffice.sql       # Schéma complet MySQL
├── dist/                  # Build frontend (après npm run build)
├── src/                   # Code source React
├── scripts/               # Scripts utilitaires
├── .env                   # Configuration (À CONFIGURER!)
├── .htaccess             # Routing React
└── package.json          # Dépendances Node

```

## Dépannage

### Erreur "Erreur de connexion à la base de données"

- Vérifiez les identifiants MySQL dans `.env`
- Vérifiez que l'utilisateur a tous les privilèges sur la base
- Vérifiez que MySQL est démarré

### Erreur "Invalid JWT"

- Régénérez une nouvelle clé JWT avec `openssl rand -base64 64`
- Assurez-vous que la clé est la même sur tout le serveur

### Erreur 500 sur l'API

- Activez les logs PHP: consultez `/var/log/php-errors.log`
- Vérifiez les permissions des fichiers
- Activez le mode debug: `APP_ENV=development` dans `.env`

### Problèmes CORS

- Vérifiez que `api/config/cors.php` est inclus
- Vérifiez les headers Apache
- Consultez la console navigateur pour les erreurs CORS

### Page blanche après déploiement

- Vérifiez que tous les fichiers de `/dist` sont uploadés
- Vérifiez le fichier `.htaccess` racine
- Vérifiez que `VITE_API_URL` pointe vers la bonne URL

## Sécurité - Checklist

- [ ] Fichier `.env` configuré avec de vraies valeurs (pas de placeholders)
- [ ] Clé JWT générée aléatoirement (64+ caractères)
- [ ] Mot de passe MySQL fort
- [ ] Fichier `api/install.php` supprimé après installation
- [ ] Fichier `.env` avec permissions 700 ou 600
- [ ] Mode production activé: `APP_ENV=production`
- [ ] HTTPS activé (certificat SSL)
- [ ] Backup régulier de la base de données

## Support

Pour toute question ou problème:

- Email: contact@coffice.dz
- Documentation complète: `README.md`
- Logs PHP: `/var/log/php-errors.log` ou cPanel > Logs
