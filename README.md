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

## 📋 Fonctionnalités

- ✅ Gestion complète des espaces de coworking
- ✅ Système de réservation en temps réel
- ✅ Service de domiciliation d'entreprise
- ✅ Gestion des abonnements et codes promo
- ✅ Programme de parrainage
- ✅ Dashboard administrateur complet
- ✅ Système ERP intégré
- ✅ Authentification JWT sécurisée
- ✅ Interface responsive et moderne

## Architecture

### Stack Technique

- **Frontend:** React 18 + TypeScript + Vite + TailwindCSS
- **Backend:** PHP 8.1 + MySQL REST API
- **State Management:** Zustand + React Query
- **Authentification:** JWT avec refresh tokens
- **Optimisation:** Code splitting, lazy loading

### Structure du projet

```
coffice-app/
├── api/                  # Backend PHP
│   ├── auth/            # Authentification JWT
│   ├── espaces/         # Gestion des espaces
│   ├── reservations/    # Réservations
│   ├── domiciliations/  # Domiciliations
│   └── utils/           # Utilitaires
├── database/            # Base de données
│   ├── coffice.sql      # Schéma complet
│   └── migrations/      # Migrations SQL
├── src/                 # Frontend React
│   ├── components/      # Composants UI
│   ├── pages/          # Pages
│   ├── store/          # State management
│   └── lib/            # API client
└── scripts/            # Scripts admin
```

## 📦 Version Actuelle: v3.1.0

### Nouveautés v3.1.0

- ✅ **Configuration MySQL pure**: Suppression complète de Supabase, migration vers MySQL
- ✅ **Script d'installation automatique**: Installation en un clic via `api/install.php`
- ✅ **Page Abonnements Admin complète**: CRUD complet avec stats, export CSV, filtres
- ✅ **Création manuelle de domiciliations**: Les admins peuvent créer des domiciliations pour n'importe quel utilisateur
- ✅ **Amélioration de la gestion d'erreurs**: Messages d'erreur plus détaillés et debugging amélioré
- ✅ **Documentation d'installation complète**: Guide pas-à-pas dans INSTALLATION.md

## Fonctionnalités

### Utilisateurs

- Inscription/connexion avec système de parrainage
- Réservation d'espaces (hourly/daily/weekly)
- Gestion des abonnements mensuels
- Demande de domiciliation d'entreprise
- Tableau de bord personnel
- Historique et notifications

### Administrateurs

- Gestion complète des utilisateurs
- CRUD espaces de coworking
- **NOUVEAU:** Page Abonnements complète avec stats, recherche, export CSV
- **NOUVEAU:** Création manuelle de domiciliations pour n'importe quel utilisateur
- Validation et activation des domiciliations
- Gestion codes promo et parrainages
- Statistiques et revenus en temps réel
- Système ERP intégré
- Inventaire et maintenance
- Statistiques et rapports
- Analytics et KPIs

## Espaces & Tarifs

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

## Abonnements

### Solo - 14 000 DA/mois

- Accès open space 8h-18h | Wi-Fi 50 Mbps | Accès communauté

### Pro - 32 000 DA/mois

- Accès tous espaces 7h-20h | Wi-Fi 100 Mbps | 2h salle réunion/mois | -25% services

### Executive - 55 000 DA/mois

- Accès illimité 24/7 | Wi-Fi illimité | Domiciliation incluse | -40% services

## Configuration Serveur

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

## Sécurité

- Authentification JWT avec refresh tokens
- Protection CSRF et XSS
- Rate limiting sur API
- Validation données (client + serveur)
- Transactions SQL avec locks
- Logs de sécurité
- Hashing passwords (bcrypt)
- Sanitization des inputs

## Scripts Disponibles

```bash
npm run dev           # Développement
npm run build         # Build production
npm run test          # Tests API production
npm run test:local    # Tests API local
npm run type-check    # Vérification TypeScript

# Scripts PHP
php scripts/create_admin_simple.php       # Créer admin
php scripts/test_api.php                  # Tests complets
bash scripts/backup_database.sh           # Backup DB
```

## Variables d'Environnement

```env
# Database
DB_HOST=localhost
DB_NAME=coffice
DB_USER=votre_user
DB_PASSWORD=votre_password

# JWT (générer avec: openssl rand -hex 32)
JWT_SECRET=votre_secret_minimum_32_caracteres
JWT_REFRESH_SECRET=votre_secret_refresh_minimum_32_caracteres

# Application
APP_ENV=production
VITE_API_URL=https://votre-domaine.com/api
```

## Checklist Déploiement

- [ ] Base de données créée et migrée
- [ ] Compte admin créé
- [ ] Fichier .env configuré avec secrets uniques
- [ ] Build frontend compilé
- [ ] Serveur web configuré
- [ ] API accessible
- [ ] SSL/HTTPS activé
- [ ] Permissions correctes (755/644)
- [ ] Sauvegardes automatiques configurées
- [ ] Tests passés avec succès

## Dépannage

### API ne répond pas

```bash
systemctl status php8.1-fpm
chmod -R 755 api/
```

### Erreur de connexion DB

```bash
systemctl status mysql
# Vérifier .env credentials
```

### Routes React 404

Vérifier RewriteEngine (Apache) ou try_files (Nginx)

### Erreur 500

```bash
tail -f /var/log/apache2/error.log
tail -f /var/log/nginx/error.log
```

## Nouveautés v3.1.0

### Améliorations Admin

**Page Abonnements Admin (Nouvelle)**

- Création, modification et suppression des types d'abonnements
- Gestion complète des avantages et tarifs
- Activation/désactivation en un clic
- Export CSV des données
- Statistiques en temps réel

**Page Domiciliations Admin (Améliorée)**

- Création manuelle de domiciliations pour n'importe quel utilisateur
- Formulaire complet avec toutes les informations entreprise
- Création directe avec statut actif
- Génération automatique de transaction
- Sélection de l'utilisateur depuis la liste

**Optimisations API**

- Endpoint de création de domiciliation amélioré pour les admins
- Permissions étendues pour création admin
- Validation renforcée des données

## Support

**Contact:** contact@coffice.dz
**Adresse:** Mohammadia Mall, 4ème étage, Bureau 1178, Alger

## Licence

Propriétaire - Tous droits réservés © 2025 Coffice
