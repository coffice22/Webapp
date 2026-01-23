# Coffice - Plateforme de Coworking

Application web complète pour la gestion d'espaces de coworking au Mohammadia Mall, Alger.

## 🚀 Installation

**Pour une installation détaillée, consultez: [INSTALLATION.md](INSTALLATION.md)**

### Installation rapide (développement local)

```bash
# 1. Installation des dépendances
npm install

# 2. Configuration de l'environnement
cp .env.example .env
# Éditer .env avec vos paramètres MySQL

# 3. Initialisation de la base de données
# Visitez: http://localhost/api/install.php
# ⚠️ Supprimez ce fichier après l'installation!

# 4. Création d'un compte administrateur
php scripts/create_admin_simple.php

# 5. Build de l'application
npm run build
```

### Test rapide

```bash
# Tester l'API en local
npm run test:local
```

## 📋 Version Actuelle: v3.2.0

### 🎉 Nouveautés v3.2.0 (Dernière version)

#### 🔔 Système de Notifications Complet
- **Centre de notifications** avec badge temps réel dans la navbar
- **Page notifications dédiée** avec filtres avancés (type, statut)
- Marquage lu/non lu individuel et en masse
- Suppression de notifications
- Affichage avec icônes et dates relatives

#### 📄 Pages de Détail Complètes
- **Détail Réservation** (`/app/reservations/:id`)
  - Informations espace, dates, client, tarifs
  - Historique et notes complètes
  - Annulation depuis la page de détail

- **Détail Espace** (`/app/admin/spaces/:id`)
  - Informations complètes : type, capacité, équipements
  - Tous les tarifs (horaire, journalier, mensuel)
  - Statistiques et disponibilité
  - Actions admin : modifier, supprimer

- **Détail Utilisateur** (`/app/admin/users/:id`)
  - Profil complet : infos personnelles et professionnelles
  - Statut email vérifié/non vérifié
  - Rôle et permissions
  - Historique d'inscription

#### 🚫 Annulation de Réservations
- Bouton "Annuler" sur chaque réservation
- Modal de confirmation
- Statuts annulables : en_attente, confirmée
- Actualisation automatique après annulation

#### 📊 Statistiques API en Temps Réel
- Dashboard Reports utilise les endpoints API
- Sélecteur de période (jour, semaine, mois, année)
- Bouton actualiser avec animation
- Données en temps réel depuis MySQL
- Breakdown par type et par espace

#### 🔗 Navigation Améliorée
- Liens "Détails" sur toutes les cartes
- Entrée "Notifications" dans le menu
- Breadcrumb navigation cohérente
- Routes complètes pour toutes les pages

#### ✅ API 100% Utilisée
**Tous les 44 endpoints backend sont maintenant accessibles depuis le frontend !**

### Nouveautés v3.1.0

- ✅ **Configuration MySQL pure**: Migration complète vers MySQL
- ✅ **Script d'installation automatique**: Installation en un clic
- ✅ **Page Abonnements Admin complète**: CRUD complet avec stats
- ✅ **Création manuelle de domiciliations**: Par les admins
- ✅ **Amélioration de la gestion d'erreurs**: Messages détaillés

## 🎯 Fonctionnalités Complètes

### Pour les Utilisateurs

- ✅ Inscription/connexion avec système de parrainage
- ✅ Réservation d'espaces (horaire/journalier/hebdomadaire)
- ✅ **Annulation de réservations** (statuts éligibles)
- ✅ **Visualisation détaillée** de chaque réservation
- ✅ **Centre de notifications** avec filtres avancés
- ✅ Gestion des abonnements mensuels
- ✅ Demande de domiciliation d'entreprise
- ✅ Dashboard personnel avec statistiques
- ✅ Historique complet et notifications temps réel
- ✅ Profil et paramètres personnalisables
- ✅ Programme de parrainage avec code unique

### Pour les Administrateurs

#### Gestion
- ✅ **Gestion complète des utilisateurs** avec pages de détail
- ✅ **CRUD espaces de coworking** avec fiches détaillées
- ✅ **Gestion des réservations** avec vue détaillée
- ✅ **Page Abonnements complète** avec stats et export
- ✅ **Validation des domiciliations** avec création manuelle
- ✅ **Gestion codes promo** avec activation/désactivation
- ✅ **Suivi des parrainages** avec récompenses

#### Analytics & Reporting
- ✅ **Statistiques en temps réel** depuis l'API
- ✅ **Revenus par période** (jour, semaine, mois, année)
- ✅ **Dashboard Analytics** avec KPIs
- ✅ **Rapports exportables** (CSV, JSON)
- ✅ **Breakdown par espace** et par type
- ✅ **Taux d'occupation** et conversion

#### Système
- ✅ **Centre de notifications** pour admins
- ✅ **Système ERP intégré**
- ✅ **Inventaire et maintenance**
- ✅ **Logs et audit trail**
- ✅ **Gestion des permissions**

## Architecture Technique

### Stack Technique

- **Frontend:** React 18 + TypeScript + Vite + TailwindCSS
- **Backend:** PHP 8.1 + MySQL 8.0 REST API
- **State Management:** Zustand + React Query
- **Authentification:** JWT avec refresh tokens
- **UI/UX:** Framer Motion + TailwindCSS
- **Optimisation:** Code splitting, lazy loading, caching

### Structure du Projet

```
coffice-app/
├── api/                     # Backend PHP REST API
│   ├── auth/               # Authentification JWT
│   ├── espaces/            # Gestion des espaces
│   ├── reservations/       # Réservations + annulation
│   ├── domiciliations/     # Domiciliations
│   ├── notifications/      # Système de notifications
│   ├── admin/              # Stats et analytics
│   ├── abonnements/        # Gestion abonnements
│   ├── codes-promo/        # Codes promotionnels
│   ├── parrainages/        # Programme parrainage
│   ├── users/              # Gestion utilisateurs
│   └── utils/              # Utilitaires et helpers
│
├── database/               # Base de données MySQL
│   ├── coffice.sql         # Schéma complet
│   └── backups/            # Sauvegardes
│
├── src/                    # Frontend React + TypeScript
│   ├── components/         # Composants réutilisables
│   │   ├── ui/            # Composants UI de base
│   │   └── dashboard/     # Composants dashboard
│   ├── pages/             # Pages de l'application
│   │   └── dashboard/     # Pages dashboard
│   │       ├── admin/     # Pages admin
│   │       └── *.tsx      # Pages utilisateur
│   ├── store/             # State management (Zustand)
│   ├── lib/               # API client + utilitaires
│   ├── hooks/             # Custom React hooks
│   ├── types/             # TypeScript types
│   ├── utils/             # Fonctions utilitaires
│   └── constants/         # Constantes de l'app
│
└── scripts/               # Scripts administratifs
    ├── create_admin_simple.php
    ├── test_api.php
    └── backup_database.sh
```

## 🔌 Endpoints API (44/44 utilisés)

### Authentification (5)
- `POST /api/auth/login.php` - Connexion
- `POST /api/auth/register.php` - Inscription
- `POST /api/auth/logout.php` - Déconnexion
- `GET /api/auth/me.php` - Profil utilisateur
- `POST /api/auth/refresh.php` - Refresh token

### Utilisateurs (4)
- `GET /api/users/index.php` - Liste utilisateurs
- `GET /api/users/show.php?id=` - Détail utilisateur
- `PUT /api/users/update.php?id=` - Modifier utilisateur
- `DELETE /api/users/delete.php?id=` - Supprimer utilisateur

### Espaces (5)
- `GET /api/espaces/index.php` - Liste espaces
- `GET /api/espaces/show.php?id=` - Détail espace
- `POST /api/espaces/create.php` - Créer espace
- `PUT /api/espaces/update.php` - Modifier espace
- `DELETE /api/espaces/delete.php` - Supprimer espace

### Réservations (6)
- `GET /api/reservations/index.php` - Liste réservations
- `GET /api/reservations/show.php?id=` - Détail réservation
- `POST /api/reservations/create.php` - Créer réservation
- `PUT /api/reservations/update.php` - Modifier réservation
- `POST /api/reservations/cancel.php` - Annuler réservation
- `GET /api/reservations/user.php?user_id=` - Par utilisateur

### Notifications (4)
- `GET /api/notifications/index.php` - Liste notifications
- `PUT /api/notifications/read.php?id=` - Marquer comme lu
- `PUT /api/notifications/read-all.php` - Tout marquer lu
- `DELETE /api/notifications/delete.php?id=` - Supprimer

### Domiciliations (6)
- `GET /api/domiciliations/index.php` - Liste domiciliations
- `GET /api/domiciliations/user.php?user_id=` - Par utilisateur
- `POST /api/domiciliations/create.php` - Créer demande
- `PUT /api/domiciliations/update.php` - Modifier
- `POST /api/domiciliations/validate.php` - Valider
- `POST /api/domiciliations/reject.php` - Rejeter
- `POST /api/domiciliations/activate.php` - Activer

### Abonnements (4)
- `GET /api/abonnements/index.php` - Liste abonnements
- `POST /api/abonnements/create.php` - Créer
- `PUT /api/abonnements/update.php` - Modifier
- `DELETE /api/abonnements/delete.php` - Supprimer

### Codes Promo (5)
- `GET /api/codes-promo/index.php` - Liste codes
- `POST /api/codes-promo/create.php` - Créer code
- `PUT /api/codes-promo/update.php?id=` - Modifier
- `DELETE /api/codes-promo/delete.php?id=` - Supprimer
- `POST /api/codes-promo/validate.php` - Valider code

### Parrainages (2)
- `GET /api/parrainages/index.php` - Liste parrainages
- `POST /api/parrainages/verify.php` - Vérifier code

### Admin & Analytics (3)
- `GET /api/admin/stats.php` - Statistiques globales
- `GET /api/admin/revenue.php?period=` - Revenus par période
- `GET /api/check.php` - Health check

## 🎨 Espaces & Tarifs

### Open Space (12 places)
- Journée: 1 200 DA | Semaine: 20 000 DA | Mois: 15 000 DA

### Private Booth Hoggar (2 places)
- Journée: 6 000 DA | Semaine: 40 000 DA | Mois: 35 000 DA

### Private Booth Aurès (2 places)
- Journée: 6 000 DA | Semaine: 40 000 DA | Mois: 45 000 DA

### Private Booth Atlas (4 places)
- Journée: 10 000 DA | Semaine: 65 000 DA | Mois: 45 000 DA

### Salle de Réunion Premium (12 places)
- Heure: 2 500 DA | Journée: 12 000 DA

## 💳 Abonnements

### Solo - 14 000 DA/mois
- Accès open space 8h-18h
- Wi-Fi 50 Mbps
- Accès communauté

### Pro - 32 000 DA/mois
- Accès tous espaces 7h-20h
- Wi-Fi 100 Mbps
- 2h salle réunion/mois
- -25% sur services

### Executive - 55 000 DA/mois
- Accès illimité 24/7
- Wi-Fi illimité
- Domiciliation incluse
- -40% sur services

## 🔧 Configuration Serveur

### Apache (.htaccess)

```apache
RewriteEngine On
RewriteBase /
RewriteRule ^index\.html$ - [L]
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]
```

### Nginx

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

## 🔐 Sécurité

- ✅ Authentification JWT avec refresh tokens
- ✅ Protection CSRF et XSS
- ✅ Rate limiting sur API
- ✅ Validation données (client + serveur)
- ✅ Transactions SQL avec locks
- ✅ Logs de sécurité détaillés
- ✅ Hashing passwords (bcrypt)
- ✅ Sanitization des inputs
- ✅ Protection contre injection SQL
- ✅ Headers de sécurité HTTP

## 📜 Scripts Disponibles

```bash
# Développement
npm run dev              # Serveur de développement
npm run build            # Build de production
npm run preview          # Prévisualiser le build
npm run type-check       # Vérification TypeScript
npm run lint             # Linter ESLint

# Tests
npm run test             # Tests API production
npm run test:local       # Tests API local

# Scripts PHP
php scripts/create_admin_simple.php    # Créer admin
php scripts/test_api.php               # Tests API complets
bash scripts/backup_database.sh        # Backup base de données
```

## 🌍 Variables d'Environnement

```env
# Database MySQL
DB_HOST=localhost
DB_NAME=coffice
DB_USER=votre_utilisateur
DB_PASSWORD=votre_mot_de_passe

# JWT Secrets (générer avec: openssl rand -hex 32)
JWT_SECRET=votre_secret_jwt_minimum_32_caracteres
JWT_REFRESH_SECRET=votre_secret_refresh_minimum_32_caracteres

# Application
APP_ENV=production
VITE_API_URL=https://votre-domaine.com/api
```

## ✅ Checklist Déploiement

- [ ] Base de données MySQL créée et migrée
- [ ] Compte administrateur créé
- [ ] Fichier .env configuré avec secrets uniques
- [ ] Build frontend compilé (`npm run build`)
- [ ] Fichiers uploadés sur le serveur
- [ ] Serveur web configuré (Apache/Nginx)
- [ ] PHP 8.1+ installé et configuré
- [ ] API accessible et fonctionnelle
- [ ] SSL/HTTPS activé (Let's Encrypt recommandé)
- [ ] Permissions correctes (755 pour dossiers, 644 pour fichiers)
- [ ] Sauvegardes automatiques configurées
- [ ] Tests API passés avec succès
- [ ] Monitoring et logs configurés

## 🐛 Dépannage

### API ne répond pas

```bash
# Vérifier PHP-FPM
systemctl status php8.1-fpm
systemctl restart php8.1-fpm

# Vérifier permissions
chmod -R 755 api/
chown -R www-data:www-data api/
```

### Erreur de connexion base de données

```bash
# Vérifier MySQL
systemctl status mysql
systemctl restart mysql

# Tester connexion
mysql -u votre_user -p coffice

# Vérifier .env
cat .env
```

### Routes React renvoient 404

Vérifier la configuration du serveur web :
- Apache : Activer `mod_rewrite` et vérifier `.htaccess`
- Nginx : Vérifier `try_files` dans la configuration

### Erreurs 500

```bash
# Logs Apache
tail -f /var/log/apache2/error.log

# Logs Nginx
tail -f /var/log/nginx/error.log

# Logs PHP
tail -f /var/log/php8.1-fpm.log
```

### Notifications ne s'affichent pas

- Vérifier que l'endpoint `/api/notifications/index.php` fonctionne
- Vérifier la console navigateur pour erreurs JS
- Tester avec : `curl -H "Authorization: Bearer TOKEN" https://api/notifications/index.php`

## 📞 Support

**Email:** contact@coffice.dz
**Téléphone:** +213 795 380 124
**WhatsApp:** [Contactez-nous](https://wa.me/213795380124)
**Adresse:** Mohammadia Mall, 4ème étage, Bureau 1178, Alger, Algérie

## 📄 Licence

Propriétaire - Tous droits réservés © 2025 Coffice

---

**Développé avec ❤️ pour Coffice Coworking Space**
