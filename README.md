# Coffice - Plateforme de Coworking

Application web complète de gestion d'espaces de coworking au Mohammadia Mall, Alger.

## Vue d'ensemble

Coffice est une plateforme moderne de réservation et gestion d'espaces de coworking comprenant :
- 2 box de 4 places
- 1 box de 3 places
- 1 table open space de 12 places (dont 2 postes informatiques)
- 1 salle de réunion avec terrasse
- 1 kitchenette équipée

## Technologies

### Frontend
- React 18 avec TypeScript
- Vite - Build tool moderne
- TailwindCSS - Design system
- React Router - Navigation
- React Hook Form - Gestion des formulaires
- date-fns - Manipulation des dates

### Backend
- PHP 8+ - API REST
- MySQL - Base de données
- JWT - Authentication

## Installation

### Prérequis
- Node.js 18+
- PHP 8+
- MySQL 8+

### Configuration

1. Cloner le projet
```bash
git clone <repository-url>
cd coffice-app
```

2. Installer les dépendances frontend
```bash
npm install
```

3. Configurer l'environnement
```bash
cp .env.example .env
```

Modifier `.env` avec vos informations :
```env
# Base de données
DB_HOST=localhost
DB_NAME=cofficed_coffice
DB_USER=cofficed_user
DB_PASSWORD=votre_mot_de_passe

# JWT Secret (générer avec: openssl rand -base64 64)
JWT_SECRET=votre_secret_jwt

# API URL
VITE_API_URL=https://coffice.dz/api
```

4. Créer la base de données
```bash
mysql -u root -p < database/coffice.sql
```

5. Build frontend
```bash
npm run build
```

## Développement

```bash
npm run dev
```

Le site sera accessible sur http://localhost:5173

## Déploiement

Voir `DEPLOIEMENT.md` pour les instructions détaillées de déploiement en production.

## Structure du projet

```
coffice-app/
├── api/                    # Backend PHP
│   ├── config/            # Configuration DB, CORS
│   ├── utils/             # Auth, Response, etc.
│   ├── auth/              # Endpoints authentification
│   ├── espaces/           # Endpoints espaces
│   ├── reservations/      # Endpoints réservations
│   ├── domiciliations/    # Endpoints domiciliations
│   └── users/             # Endpoints utilisateurs
├── src/                   # Frontend React
│   ├── components/        # Composants réutilisables
│   ├── pages/             # Pages de l'application
│   ├── lib/               # API client
│   ├── store/             # State management
│   ├── types/             # Types TypeScript
│   └── utils/             # Utilitaires
├── database/              # Scripts SQL
└── dist/                  # Build de production
```

## Fonctionnalités

### Utilisateurs
- Inscription / Connexion
- Gestion du profil
- Réservation d'espaces
- Suivi des réservations
- Demande de domiciliation
- Parrainage

### Administrateurs
- Dashboard complet
- Gestion des espaces
- Gestion des réservations
- Gestion des utilisateurs
- Gestion des domiciliations
- Statistiques et rapports
- Codes promo
- Abonnements

## API Backend

### Authentification
- `POST /api/auth/register` - Inscription
- `POST /api/auth/login` - Connexion
- `POST /api/auth/logout` - Déconnexion
- `GET /api/auth/me` - Profil utilisateur

### Espaces
- `GET /api/espaces/index.php` - Liste des espaces
- `GET /api/espaces/show.php?id=xxx` - Détails d'un espace
- `POST /api/espaces/create.php` - Créer un espace (admin)
- `PUT /api/espaces/update.php` - Modifier un espace (admin)
- `DELETE /api/espaces/delete.php` - Supprimer un espace (admin)

### Réservations
- `GET /api/reservations/index.php` - Liste des réservations
- `GET /api/reservations/show.php?id=xxx` - Détails d'une réservation
- `POST /api/reservations/create.php` - Créer une réservation
- `POST /api/reservations/cancel.php` - Annuler une réservation

### Domiciliations
- `GET /api/domiciliations/index.php` - Liste (admin)
- `GET /api/domiciliations/user.php?user_id=xxx` - Par utilisateur
- `POST /api/domiciliations/create.php` - Créer une demande
- `POST /api/domiciliations/validate.php` - Valider (admin)
- `POST /api/domiciliations/reject.php` - Rejeter (admin)

## Tests

### Test API
```bash
php scripts/test_api.php https://coffice.dz/api
```

### Test local
```bash
php scripts/test_api.php http://localhost/api
```

## Débogage

### Problèmes de Réservations

Si vous rencontrez des erreurs lors de la création de réservations :

1. **Vérifier et initialiser les espaces** :
   ```bash
   php scripts/init_espaces.php
   ```

2. **Consulter le guide complet** :
   Voir `DEBUGGING_RESERVATIONS.md` pour :
   - Étapes de débogage détaillées
   - Consultation des logs PHP
   - Vérification de la base de données
   - Solutions aux problèmes courants

3. **Activer les logs détaillés** :
   Les logs ont été ajoutés dans `api/reservations/create.php`
   Consultez les logs Apache/PHP pour voir les détails des erreurs.

## Support

Pour toute question ou problème, consulter la documentation ou contacter l'équipe de développement.

## Licence

Propriétaire - Coffice © 2024
