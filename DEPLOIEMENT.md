# 📤 Guide de Déploiement - Coffice v4.2.0

## 🎯 Prérequis

- Serveur web avec PHP 8.1+ et MySQL 8.0+
- Accès SSH ou FTP au serveur
- Node.js 18+ (pour le build local)
- Base de données MySQL configurée

---

## 📋 Étapes de déploiement

### 1. Build local

```bash
# Installer les dépendances
npm install

# Build de production
npm run build
```

Le build génère un dossier `dist/` avec les fichiers optimisés.

### 2. Upload sur le serveur

Uploadez **UNIQUEMENT** ces fichiers/dossiers :

```
public_html/
├── index.html           (depuis dist/)
├── assets/              (depuis dist/)
├── api/                 (tout le dossier)
├── database/migrations/ (seulement les migrations)
├── .htaccess
└── .env
```

**⚠️ Ne jamais uploader :**
- `src/`
- `node_modules/`
- `package.json`
- `package-lock.json`
- `*.config.js`
- `*.config.ts`

### 3. Configuration `.env`

Créez ou modifiez le fichier `.env` sur le serveur :

```env
# Base de données
DB_HOST=localhost
DB_NAME=cofficed_coffice
DB_USER=votre_user
DB_PASSWORD=votre_password

# JWT
JWT_SECRET=votre_secret_32_caracteres_minimum

# Email
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=votre@email.com
MAIL_PASSWORD=votre_app_password
MAIL_FROM_ADDRESS=noreply@coffice.dz
MAIL_FROM_NAME=Coffice
```

### 4. Migrations de la base de données

Connectez-vous en SSH et exécutez :

```bash
# Se connecter à MySQL
mysql -u root -p

# Créer la base si elle n'existe pas
CREATE DATABASE IF NOT EXISTS cofficed_coffice;
USE cofficed_coffice;

# Importer le schéma de base
source /chemin/vers/database/coffice.sql;

# Exécuter les migrations dans l'ordre
source /chemin/vers/database/migrations/002_password_resets.sql;
source /chemin/vers/database/migrations/003_add_rappel_envoye.sql;
source /chemin/vers/database/migrations/004_performance_indexes.sql;
source /chemin/vers/database/migrations/005_audit_logging.sql;
source /chemin/vers/database/migrations/006_add_code_parrainage.sql;

# Optimiser les tables
ANALYZE TABLE users, reservations, domiciliations, espaces, parrainages;

exit;
```

### 5. Permissions

```bash
# Dossiers d'upload et logs
chmod 755 api/uploads
chmod 755 api/uploads/documents
chmod 755 api/logs

# Fichier .env (sécurité)
chmod 644 .env
```

### 6. Vérification

1. **Test API** : `curl https://votre-domaine.com/api/check.php`
   - Doit retourner : `{"status": "ok", ...}`

2. **Test frontend** : Ouvrir le site dans un navigateur
   - Vérifier la console F12 (pas d'erreurs)
   - Tester la connexion
   - Créer un compte test

3. **Test MIME types** : `curl -I https://votre-domaine.com/assets/index-XXX.js`
   - Doit contenir : `Content-Type: application/javascript`

---

## 🔄 Mise à jour depuis v4.1.0

Si vous mettez à jour depuis la version 4.1.0 :

### 1. Sauvegarde

```bash
# Sauvegarde base de données
mysqldump -u root -p cofficed_coffice > backup_$(date +%Y%m%d).sql

# Sauvegarde fichiers
tar -czf backup_files_$(date +%Y%m%d).tar.gz api/uploads/
```

### 2. Migration spécifique v4.2.0

Exécutez **uniquement** :

```bash
mysql -u root -p cofficed_coffice < database/migrations/006_add_code_parrainage.sql
```

Cette migration :
- Ajoute le champ `code_parrainage` aux utilisateurs
- Génère les codes pour les utilisateurs existants
- Crée les entrées parrainages manquantes

### 3. Upload nouveaux fichiers

Uploadez les fichiers modifiés :
- `dist/` (nouveau build)
- `api/auth/register.php`
- `api/auth/me.php`
- `api/parrainages/index.php`

---

## 🐛 Dépannage

### Erreur MIME Type

**Symptôme** : `Expected a JavaScript module script...`

**Solution** :
1. Vérifier que `src/` et `node_modules/` ne sont pas sur le serveur
2. Vérifier `.htaccess` présent à la racine
3. Vider le cache du navigateur

### API Erreur 500

```bash
# Vérifier les logs
tail -50 api/logs/app.log

# Vérifier la connexion DB
php api/test_db_connection.php
```

### Page blanche

1. F12 → Console (voir erreurs JavaScript)
2. Vérifier structure : `index.html` et `assets/` à la racine
3. Vérifier permissions des fichiers

### Code parrainage manquant

Si un utilisateur n'a pas de code parrainage :

```sql
UPDATE users
SET code_parrainage = CONCAT('CPF', UPPER(SUBSTRING(MD5(CONCAT(id, email, UNIX_TIMESTAMP())), 1, 6)))
WHERE code_parrainage IS NULL;
```

---

## ✅ Checklist post-déploiement

- [ ] API répond correctement (`/api/check.php`)
- [ ] Site accessible sans erreur console
- [ ] Connexion/Inscription fonctionnelle
- [ ] Réservations créables
- [ ] Codes de parrainage générés
- [ ] Emails envoyés correctement
- [ ] Dashboard admin accessible
- [ ] HTTPS actif (SSL)

---

## 📧 Support

En cas de problème :
- Vérifier les logs : `api/logs/app.log`
- Vérifier la console navigateur (F12)
- Contacter : contact@coffice.dz

---

**Version du guide** : 4.2.0 | Janvier 2026
