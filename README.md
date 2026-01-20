# Coffice - Plateforme de Coworking

Application web complète pour la gestion d'espaces de coworking au Mohammadia Mall, Alger.

## Installation Rapide

### Prérequis
- PHP 8.1+ (extensions: pdo_mysql, json, mbstring, openssl)
- MySQL 8.0+
- Node.js 18+
- Apache/Nginx avec mod_rewrite

### Installation en 5 étapes

```bash
# 1. Cloner et installer
git clone [votre-repo]
cd coffice-app
npm install

# 2. Configuration
cp .env.example .env
# Éditer .env avec vos paramètres

# 3. Base de données
mysql -u root -p -e "CREATE DATABASE coffice CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
mysql -u root -p coffice < database/coffice.sql

# 4. Créer l'administrateur
php scripts/create_admin_simple.php
# Email: admin@coffice.dz / Password: Admin@Coffice2025

# 5. Build et déploiement
npm run build
# Copier dist/ vers votre serveur web
```

### Test de l'installation

```bash
# Tester toutes les fonctionnalités
php scripts/test_api.php

# Ou avec npm
npm run test:local
```

## Architecture

### Stack Technique
- **Frontend:** React 18 + TypeScript + Vite + TailwindCSS
- **Backend:** PHP 8.1 + MySQL REST API
- **State:** Zustand + React Query
- **Auth:** JWT avec refresh tokens

### Structure
```
coffice-app/
├── api/                  # Backend PHP
│   ├── auth/            # Authentification
│   ├── espaces/         # Gestion espaces
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
- Validation des domiciliations
- Gestion codes promo et abonnements
- Statistiques et revenus en temps réel
- Système ERP intégré

### Module ERP (Admin)
- Gestion des membres et abonnements
- Gestion des espaces et disponibilité
- Réservations et calendrier
- Facturation et paiements
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

## Support

**Contact:** contact@coffice.dz
**Adresse:** Mohammadia Mall, 4ème étage, Bureau 1178, Alger

## Licence

Propriétaire - Tous droits réservés © 2025 Coffice
