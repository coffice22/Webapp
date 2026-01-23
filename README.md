# Coffice - Plateforme de Coworking

Application web complète pour la gestion d'espaces de coworking au Mohammadia Mall, Alger.

**Version: 3.2.0** | Architecture: React + TypeScript + PHP + MySQL

---

## 📋 Table des Matières

- [Aperçu](#aperçu)
- [Installation](#installation)
- [Architecture](#architecture)
- [Fonctionnalités](#fonctionnalités)
- [API Endpoints](#api-endpoints)
- [Configuration](#configuration)
- [Déploiement](#déploiement)
- [Sécurité](#sécurité)
- [Dépannage](#dépannage)

---

## 🎯 Aperçu

Coffice est une plateforme complète de gestion de coworking avec :

- **Frontend moderne** : React 18 + TypeScript + TailwindCSS + Framer Motion
- **Backend robuste** : PHP 8.1+ REST API avec MySQL 8.0
- **Authentification JWT** : Tokens avec refresh automatique
- **State Management** : Zustand + React Query
- **44 endpoints API** : Tous utilisés et fonctionnels
- **Système de notifications** : Centre de notifications en temps réel
- **ERP intégré** : Gestion complète des opérations

### Espaces Disponibles

- **Open Space** (12 places) : 1 200 DA/jour
- **Private Booth Hoggar** (2 places) : 6 000 DA/jour
- **Private Booth Aurès** (2 places) : 6 000 DA/jour
- **Private Booth Atlas** (4 places) : 10 000 DA/jour
- **Salle de Réunion Premium** (12 places) : 2 500 DA/heure

---

## 🚀 Installation

### Prérequis

- **Serveur** : Apache/Nginx avec PHP 8.1+ et MySQL 8.0+
- **Node.js** : Version 18+ (pour le build frontend)
- **Extensions PHP** : pdo, pdo_mysql, json, mbstring, openssl

### Étape 1: Configuration de l'environnement

```bash
# Cloner le projet
cd /path/to/project

# Copier et configurer .env
cp .env.example .env

# Éditer .env avec vos paramètres
nano .env
```

**Configuration .env obligatoire:**

```env
# API Backend
VITE_API_URL=https://coffice.dz/api

# Base de données MySQL
DB_HOST=localhost
DB_PORT=3306
DB_NAME=cofficed_coffice
DB_USER=cofficed_user
DB_PASSWORD=votre_mot_de_passe_securise

# Sécurité JWT (générer avec: openssl rand -base64 64)
JWT_SECRET=votre_cle_secrete_jwt_minimum_64_caracteres

# Application
APP_URL=https://coffice.dz
APP_ENV=production
```

### Étape 2: Installation de la base de données

**Option A - Via cPanel:**

1. Créer la base de données MySQL via "Bases de données MySQL"
2. Créer un utilisateur avec mot de passe fort
3. Associer l'utilisateur avec tous les privilèges
4. Importer `database/coffice.sql` via phpMyAdmin

**Option B - Via terminal:**

```bash
# Créer la base de données
mysql -u root -p -e "CREATE DATABASE cofficed_coffice CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# Créer l'utilisateur
mysql -u root -p -e "CREATE USER 'cofficed_user'@'localhost' IDENTIFIED BY 'votre_mot_de_passe';"

# Donner les privilèges
mysql -u root -p -e "GRANT ALL PRIVILEGES ON cofficed_coffice.* TO 'cofficed_user'@'localhost';"

# Importer le schéma
mysql -u cofficed_user -p cofficed_coffice < database/coffice.sql
```

### Étape 3: Créer un administrateur

```bash
# Via script CLI
php scripts/create_admin_simple.php

# Entrez les informations demandées:
# Email: admin@coffice.dz
# Mot de passe: votre_mot_de_passe_admin
# Nom: Admin
# Prénom: Coffice
```

### Étape 4: Build du frontend

```bash
# Installer les dépendances
npm install

# Build de production
npm run build

# Les fichiers compilés sont dans /dist
```

### Étape 5: Vérification

```bash
# Tester l'API
curl https://coffice.dz/api/check.php

# Devrait retourner un JSON avec status: "ok"
```

---

## 🏗️ Architecture

### Stack Technique

| Composant | Technologie                  |
| --------- | ---------------------------- |
| Frontend  | React 18 + TypeScript + Vite |
| Styling   | TailwindCSS + Framer Motion  |
| State     | Zustand + React Query        |
| Backend   | PHP 8.1 REST API             |
| Database  | MySQL 8.0 (InnoDB)           |
| Auth      | JWT avec refresh tokens      |
| Server    | Apache/Nginx                 |

### Structure du Projet

```
coffice-app/
├── api/                        # Backend PHP REST API
│   ├── auth/                  # Authentification (login, register, refresh)
│   ├── users/                 # Gestion utilisateurs (CRUD)
│   ├── espaces/               # Gestion espaces (CRUD)
│   ├── reservations/          # Réservations + annulation
│   ├── domiciliations/        # Domiciliations d'entreprise
│   ├── notifications/         # Système de notifications
│   ├── abonnements/           # Gestion abonnements mensuels
│   ├── codes-promo/           # Codes promotionnels
│   ├── parrainages/           # Programme de parrainage
│   ├── admin/                 # Stats et analytics
│   ├── config/                # Database + CORS
│   ├── utils/                 # Auth, Validator, Sanitizer, etc.
│   └── .htaccess             # Configuration Apache
│
├── database/
│   ├── coffice.sql           # Schéma complet MySQL
│   └── backups/              # Sauvegardes
│
├── src/                       # Frontend React + TypeScript
│   ├── components/           # Composants réutilisables
│   │   ├── ui/              # Button, Card, Input, Modal, etc.
│   │   ├── dashboard/       # DashboardLayout, ReservationForm
│   │   ├── erp/             # Modules ERP
│   │   └── payment/         # PaymentForm, PaymentSummary
│   ├── pages/               # Pages principales
│   │   ├── dashboard/       # Pages utilisateur
│   │   │   └── admin/       # Pages admin
│   │   ├── Home.tsx
│   │   ├── Dashboard.tsx
│   │   ├── Login.tsx
│   │   └── Register.tsx
│   ├── store/               # State Management Zustand
│   │   ├── authStore.ts    # Auth state
│   │   ├── store.ts        # App data
│   │   └── erpStore.ts     # ERP system
│   ├── lib/                 # API client
│   ├── hooks/               # Custom hooks
│   ├── types/               # TypeScript types
│   ├── utils/               # Utilities
│   └── constants/           # App constants
│
├── scripts/                  # Scripts utilitaires
│   ├── create_admin_simple.php
│   └── test_api.php
│
├── .env                      # Configuration (À CONFIGURER!)
├── .htaccess                # Routing React
├── package.json             # Dependencies
└── vite.config.ts           # Vite config
```

### Flux de Données

```
User Action → React Component → Zustand Store → API Client
                                                      ↓
                                                  PHP Endpoint
                                                      ↓
                                                  MySQL DB
                                                      ↓
                                              JSON Response
                                                      ↓
                                              API Client → Store → Component → UI Update
```

---

## ✨ Fonctionnalités

### Pour les Utilisateurs

- ✅ **Inscription/Connexion** avec JWT et refresh tokens
- ✅ **Réservation d'espaces** (horaire/journalier/hebdomadaire/mensuel)
- ✅ **Annulation de réservations** (statuts en_attente, confirmée)
- ✅ **Détail des réservations** (infos complètes, historique)
- ✅ **Centre de notifications** avec filtres et marquage lu
- ✅ **Gestion d'abonnements** mensuels
- ✅ **Demande de domiciliation** d'entreprise
- ✅ **Dashboard personnel** avec statistiques
- ✅ **Programme de parrainage** avec code unique
- ✅ **Profil et paramètres** personnalisables

### Pour les Administrateurs

#### Gestion Complète

- ✅ **Utilisateurs** : Liste, détails, modification, suppression
- ✅ **Espaces** : CRUD avec fiches détaillées et tarification
- ✅ **Réservations** : Validation, annulation, vue détaillée
- ✅ **Abonnements** : CRUD avec statistiques et export
- ✅ **Domiciliations** : Validation, rejet, activation
- ✅ **Codes promo** : Création, activation/désactivation
- ✅ **Parrainages** : Suivi et attribution de récompenses

#### Analytics & Reporting

- ✅ **Statistiques en temps réel** via API
- ✅ **Revenus par période** (jour, semaine, mois, année)
- ✅ **Dashboard Analytics** avec KPIs
- ✅ **Rapports exportables** (CSV, JSON)
- ✅ **Breakdown par espace** et par type
- ✅ **Taux d'occupation** et de conversion

#### Système

- ✅ **Centre de notifications** pour admins
- ✅ **Système ERP intégré** (inventaire, maintenance)
- ✅ **Logs et audit trail**
- ✅ **Gestion des permissions**

---

## 🔌 API Endpoints (44 endpoints)

### Authentification (5 endpoints)

| Méthode | Endpoint                 | Description                 |
| ------- | ------------------------ | --------------------------- |
| POST    | `/api/auth/login.php`    | Connexion utilisateur       |
| POST    | `/api/auth/register.php` | Inscription avec parrainage |
| POST    | `/api/auth/logout.php`   | Déconnexion                 |
| GET     | `/api/auth/me.php`       | Profil utilisateur actuel   |
| POST    | `/api/auth/refresh.php`  | Refresh access token        |

### Utilisateurs (4 endpoints)

| Méthode | Endpoint                    | Description                   |
| ------- | --------------------------- | ----------------------------- |
| GET     | `/api/users/index.php`      | Liste utilisateurs (admin)    |
| GET     | `/api/users/show.php?id=`   | Détails utilisateur           |
| PUT     | `/api/users/update.php?id=` | Modifier utilisateur          |
| DELETE  | `/api/users/delete.php?id=` | Supprimer utilisateur (admin) |

### Espaces (5 endpoints)

| Méthode | Endpoint                    | Description              |
| ------- | --------------------------- | ------------------------ |
| GET     | `/api/espaces/index.php`    | Liste des espaces        |
| GET     | `/api/espaces/show.php?id=` | Détails espace           |
| POST    | `/api/espaces/create.php`   | Créer espace (admin)     |
| PUT     | `/api/espaces/update.php`   | Modifier espace (admin)  |
| DELETE  | `/api/espaces/delete.php`   | Supprimer espace (admin) |

### Réservations (5 endpoints)

| Méthode | Endpoint                         | Description          |
| ------- | -------------------------------- | -------------------- |
| GET     | `/api/reservations/index.php`    | Liste réservations   |
| GET     | `/api/reservations/show.php?id=` | Détails réservation  |
| POST    | `/api/reservations/create.php`   | Créer réservation    |
| PUT     | `/api/reservations/update.php`   | Modifier réservation |
| POST    | `/api/reservations/cancel.php`   | Annuler réservation  |

### Notifications (4 endpoints)

| Méthode | Endpoint                            | Description            |
| ------- | ----------------------------------- | ---------------------- |
| GET     | `/api/notifications/index.php`      | Liste notifications    |
| PUT     | `/api/notifications/read.php?id=`   | Marquer comme lu       |
| PUT     | `/api/notifications/read-all.php`   | Tout marquer lu        |
| DELETE  | `/api/notifications/delete.php?id=` | Supprimer notification |

### Domiciliations (7 endpoints)

| Méthode | Endpoint                           | Description               |
| ------- | ---------------------------------- | ------------------------- |
| GET     | `/api/domiciliations/index.php`    | Liste domiciliations      |
| GET     | `/api/domiciliations/user.php`     | Domiciliation utilisateur |
| POST    | `/api/domiciliations/create.php`   | Créer demande             |
| PUT     | `/api/domiciliations/update.php`   | Modifier demande          |
| POST    | `/api/domiciliations/validate.php` | Valider (admin)           |
| POST    | `/api/domiciliations/reject.php`   | Rejeter (admin)           |
| POST    | `/api/domiciliations/activate.php` | Activer service (admin)   |

### Abonnements (4 endpoints)

| Méthode | Endpoint                      | Description                  |
| ------- | ----------------------------- | ---------------------------- |
| GET     | `/api/abonnements/index.php`  | Liste abonnements            |
| POST    | `/api/abonnements/create.php` | Créer abonnement (admin)     |
| PUT     | `/api/abonnements/update.php` | Modifier abonnement (admin)  |
| DELETE  | `/api/abonnements/delete.php` | Supprimer abonnement (admin) |

### Codes Promo (5 endpoints)

| Méthode | Endpoint                        | Description            |
| ------- | ------------------------------- | ---------------------- |
| GET     | `/api/codes-promo/index.php`    | Liste codes promo      |
| POST    | `/api/codes-promo/create.php`   | Créer code (admin)     |
| PUT     | `/api/codes-promo/update.php`   | Modifier code (admin)  |
| DELETE  | `/api/codes-promo/delete.php`   | Supprimer code (admin) |
| POST    | `/api/codes-promo/validate.php` | Valider code           |

### Parrainages (2 endpoints)

| Méthode | Endpoint                      | Description              |
| ------- | ----------------------------- | ------------------------ |
| GET     | `/api/parrainages/index.php`  | Liste parrainages        |
| POST    | `/api/parrainages/verify.php` | Vérifier code parrainage |

### Admin & Analytics (3 endpoints)

| Méthode | Endpoint                         | Description           |
| ------- | -------------------------------- | --------------------- |
| GET     | `/api/admin/stats.php`           | Statistiques globales |
| GET     | `/api/admin/revenue.php?period=` | Revenus par période   |
| GET     | `/api/check.php`                 | Health check système  |

---

## ⚙️ Configuration

### Variables d'Environnement (.env)

```env
# ==================================================
# CONFIGURATION FRONTEND
# ==================================================
VITE_API_URL=https://coffice.dz/api

# ==================================================
# CONFIGURATION BASE DE DONNÉES MYSQL
# ==================================================
DB_HOST=localhost
DB_PORT=3306
DB_NAME=cofficed_coffice
DB_USER=cofficed_user
DB_PASSWORD=CofficeADMIN2025!
DB_CHARSET=utf8mb4

# ==================================================
# APPLICATION
# ==================================================
APP_URL=https://coffice.dz
APP_ENV=production

# ==================================================
# SÉCURITÉ JWT
# Générer avec: openssl rand -base64 64
# ==================================================
JWT_SECRET=votre_cle_secrete_minimum_64_caracteres

# ==================================================
# STOCKAGE
# ==================================================
UPLOAD_MAX_SIZE=5242880
UPLOAD_DIR=uploads

# ==================================================
# SÉCURITÉ
# ==================================================
RATE_LIMIT_MAX_ATTEMPTS=60
RATE_LIMIT_DECAY_MINUTES=1
SESSION_LIFETIME=10080
PASSWORD_MIN_LENGTH=6
```

### Configuration Apache (.htaccess racine)

```apache
RewriteEngine On
RewriteBase /

# Ne pas rediriger les fichiers existants
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d

# Ne pas rediriger les appels API
RewriteCond %{REQUEST_URI} !^/api/

# Rediriger vers React app
RewriteRule ^ index.html [L]
```

### Configuration Nginx

```nginx
server {
    listen 80;
    server_name coffice.dz;
    root /var/www/coffice/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        alias /var/www/coffice/api;
        location ~ \.php$ {
            fastcgi_pass unix:/var/run/php/php8.1-fpm.sock;
            include fastcgi_params;
            fastcgi_param SCRIPT_FILENAME $request_filename;
        }
    }
}
```

---

## 🚢 Déploiement

### Checklist Déploiement

- [ ] Base de données MySQL créée et schéma importé
- [ ] Compte administrateur créé
- [ ] Fichier `.env` configuré avec secrets uniques
- [ ] JWT_SECRET généré aléatoirement (64+ caractères)
- [ ] Build frontend compilé (`npm run build`)
- [ ] Fichiers uploadés sur le serveur
- [ ] Serveur web configuré (Apache/Nginx)
- [ ] PHP 8.1+ installé avec extensions requises
- [ ] API accessible et fonctionnelle
- [ ] SSL/HTTPS activé (Let's Encrypt recommandé)
- [ ] Permissions correctes (755 dossiers, 644 fichiers)
- [ ] Fichier `.env` protégé (chmod 600)
- [ ] APP_ENV=production dans .env
- [ ] Sauvegardes automatiques configurées
- [ ] Tests API passés avec succès
- [ ] Monitoring et logs configurés

### Commandes de Déploiement

```bash
# Build de production
npm run build

# Copier les fichiers dist vers le serveur
scp -r dist/* user@server:/var/www/coffice/

# Copier l'API
scp -r api/ user@server:/var/www/coffice/

# Configurer les permissions
ssh user@server "chmod -R 755 /var/www/coffice/api"
ssh user@server "chmod 600 /var/www/coffice/.env"

# Redémarrer PHP-FPM
ssh user@server "systemctl restart php8.1-fpm"
```

---

## 🔐 Sécurité

### Mesures de Sécurité Implémentées

- ✅ **Authentification JWT** avec refresh tokens (1h/30j)
- ✅ **Password hashing** avec bcrypt (cost 10)
- ✅ **Protection CSRF** via tokens
- ✅ **Protection XSS** : Sanitization complète des inputs
- ✅ **Protection SQL Injection** : PDO prepared statements
- ✅ **Rate Limiting** : 60 requêtes/minute par IP
- ✅ **CORS configuré** : Whitelist d'origines autorisées
- ✅ **Headers de sécurité HTTP** :
  - X-Content-Type-Options: nosniff
  - X-Frame-Options: SAMEORIGIN
  - X-XSS-Protection: 1; mode=block
  - Referrer-Policy: strict-origin-when-cross-origin
  - Permissions-Policy: restrictive
- ✅ **Transactions SQL** avec locks pour éviter race conditions
- ✅ **Logs de sécurité** détaillés
- ✅ **Validation données** client + serveur
- ✅ **Session sécurisée** : httponly, secure (HTTPS)

### Bonnes Pratiques

1. **Toujours utiliser HTTPS** en production
2. **Sauvegardes régulières** de la base de données
3. **Monitoring des logs** pour détecter activités suspectes
4. **Rotation des JWT secrets** tous les 6 mois
5. **Mise à jour régulière** des dépendances
6. **Firewall configuré** : Bloquer accès direct à MySQL
7. **Principe du moindre privilège** pour les utilisateurs DB

---

## 🐛 Dépannage

### Problèmes Courants

#### API ne répond pas (500/502)

```bash
# Vérifier PHP-FPM
systemctl status php8.1-fpm
systemctl restart php8.1-fpm

# Vérifier logs
tail -f /var/log/php8.1-fpm.log
tail -f /var/log/apache2/error.log

# Vérifier permissions
chmod -R 755 api/
chown -R www-data:www-data api/
```

#### Erreur de connexion base de données

```bash
# Vérifier MySQL
systemctl status mysql
systemctl restart mysql

# Tester connexion
mysql -u cofficed_user -p cofficed_coffice

# Vérifier .env
cat .env | grep DB_

# Tester depuis PHP
php -r "new PDO('mysql:host=localhost;dbname=cofficed_coffice', 'cofficed_user', 'password');"
```

#### Routes React renvoient 404

**Apache:**

```bash
# Activer mod_rewrite
a2enmod rewrite
systemctl restart apache2

# Vérifier .htaccess
cat .htaccess
```

**Nginx:**

```bash
# Vérifier configuration
nginx -t

# Vérifier try_files
cat /etc/nginx/sites-enabled/coffice
```

#### JWT Token invalide ou expiré

```bash
# Vérifier JWT_SECRET dans .env
cat .env | grep JWT_SECRET

# Régénérer secret
openssl rand -base64 64

# Vider localStorage navigateur
# Dans console: localStorage.clear()
```

#### Notifications ne s'affichent pas

```bash
# Tester l'endpoint
curl -H "Authorization: Bearer TOKEN" https://coffice.dz/api/notifications/index.php

# Vérifier console navigateur
# F12 > Console > Rechercher erreurs

# Vérifier la table notifications
mysql -u cofficed_user -p cofficed_coffice -e "SELECT COUNT(*) FROM notifications;"
```

#### Build Vite échoue

```bash
# Nettoyer node_modules
rm -rf node_modules package-lock.json
npm install

# Nettoyer cache Vite
rm -rf node_modules/.vite

# Rebuild
npm run build
```

### Scripts Utilitaires

```bash
# Vérifier installation complète
php api/check.php

# Tester tous les endpoints API
php scripts/test_api.php https://coffice.dz/api

# Créer un admin
php scripts/create_admin_simple.php

# Backup base de données
mysqldump -u cofficed_user -p cofficed_coffice > backup_$(date +%Y%m%d).sql
```

---

## 📜 Scripts Disponibles

```bash
# Développement
npm run dev              # Serveur de développement (port 8080)
npm run build            # Build de production
npm run preview          # Prévisualiser le build
npm run type-check       # Vérification TypeScript
npm run lint             # Linter ESLint

# Tests
npm run test             # Tests API production
npm run test:local       # Tests API local
```

---

## 📞 Support & Contact

**Coffice Coworking Space**

- 📧 Email: contact@coffice.dz
- 📱 Téléphone: +213 795 380 124
- 💬 WhatsApp: [Contactez-nous](https://wa.me/213795380124)
- 📍 Adresse: Mohammadia Mall, 4ème étage, Bureau 1178, Alger, Algérie

**Horaires d'ouverture:**

- Lundi - Vendredi: 8h00 - 20h00
- Samedi: 9h00 - 18h00
- Dimanche: Fermé

---

## 📄 Licence

Propriétaire - Tous droits réservés © 2025 Coffice

**Version:** 3.2.0
**Dernière mise à jour:** Janvier 2025

---

**Développé avec ❤️ pour Coffice Coworking Space**
