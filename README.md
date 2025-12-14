# Coffice - Application de Coworking

Application complète de gestion d'espace de coworking située au Mohammadia Mall, Alger.

## Technologies

**Frontend**
- React 18 + TypeScript
- Vite
- TailwindCSS
- Zustand (State management)
- React Router
- React Query

**Backend**
- PHP 8+
- MySQL 8+
- JWT Authentication
- PDO

## Installation

### Prérequis
- Node.js 18+
- PHP 8+
- MySQL 8+
- Apache/Nginx

### Configuration

1. **Cloner et installer**
```bash
git clone <repository-url>
cd coffice-app
npm install
```

2. **Base de données**
```bash
mysql -u root -p -e "CREATE DATABASE cofficed_coffice CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
mysql -u root -p cofficed_coffice < database/coffice.sql
```

3. **Configuration**
```bash
cp .env.example .env
# Éditer .env avec vos paramètres
```

4. **Créer un administrateur**
```bash
php scripts/create_admin_simple.php
```

5. **Build**
```bash
npm run build
```

Voir [DEPLOIEMENT.md](DEPLOIEMENT.md) pour plus de détails.

## Structure

```
coffice-app/
├── api/                # Backend PHP
│   ├── auth/          # Authentification
│   ├── reservations/  # Réservations
│   ├── domiciliations/# Domiciliations
│   ├── codes-promo/   # Codes promo
│   ├── admin/         # Administration
│   └── utils/         # Utilitaires
├── database/          # Schema SQL
├── src/               # Frontend React
└── public/            # Assets
```

## Fonctionnalités

### Utilisateurs
- Inscription/Connexion JWT
- Gestion profil et entreprise
- Système de parrainage

### Réservations
- Réservation d'espaces (box, open space, salle)
- Calcul automatique des prix (heure/jour/semaine)
- Codes promo avec validation
- Protection race conditions

### Domiciliations
- Demandes de domiciliation
- Upload de documents
- Suivi administratif

### Administration
- Dashboard avec statistiques
- Gestion utilisateurs et espaces
- Codes promo
- Rapports financiers

### Sécurité
- JWT Authentication avec refresh tokens
- Rate limiting
- CSRF protection
- SQL injection protection (PDO)
- XSS protection (Sanitizer)
- Transactions SQL avec locks
- Logging complet

## Scripts

```bash
npm run dev          # Développement
npm run build        # Build production
npm run preview      # Preview build
npm run type-check   # Vérifier types
```

## API Endpoints

### Auth
- `POST /api/auth/register` - Inscription
- `POST /api/auth/login` - Connexion
- `GET /api/auth/me` - Utilisateur connecté

### Réservations
- `GET /api/reservations` - Liste
- `POST /api/reservations/create.php` - Créer
- `PUT /api/reservations/update.php` - Modifier
- `DELETE /api/reservations/cancel.php` - Annuler

### Domiciliations
- `GET /api/domiciliations` - Liste
- `POST /api/domiciliations/create.php` - Créer

### Admin
- `GET /api/admin/stats.php` - Statistiques
- `GET /api/admin/revenue.php` - Revenus

## Licence

Propriétaire - © 2025 Coffice Coworking
