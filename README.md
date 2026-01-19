# Coffice - Espace de Coworking

Application web complète pour la gestion d'espaces de coworking à Mohammadia Mall, Alger.

## Fonctionnalités

### Pour les utilisateurs
- Inscription et authentification avec système de parrainage
- Réservation d'espaces (Open Space, Box privés, Salle de réunion)
- Gestion des abonnements mensuels
- Demande de domiciliation d'entreprise
- Tableau de bord personnel
- Historique des réservations et paiements

### Pour les administrateurs
- Gestion complète des utilisateurs et espaces
- Validation et activation des domiciliations
- Gestion des codes promo et abonnements
- Statistiques et revenus en temps réel
- Système de notifications

## Technologies

### Frontend
- React 18 + TypeScript
- Vite (build tool)
- TailwindCSS
- Framer Motion (animations)
- Zustand (state management)
- React Router
- React Hook Form

### Backend
- PHP 8.1+
- MySQL 8.0+
- Architecture REST API

## Installation

### Prérequis
- Node.js 18+
- PHP 8.1+
- MySQL 8.0+
- Apache/Nginx

### Configuration

1. Cloner le repository
```bash
git clone [url]
cd coffice-app
```

2. Installer les dépendances
```bash
npm install
```

3. Configurer la base de données
```bash
mysql -u root -p < database/coffice.sql
mysql -u root -p coffice < database/migrations/add_prix_demi_journee.sql
mysql -u root -p coffice < database/migrations/add_monthly_subscriptions.sql
```

4. Configurer les variables d'environnement
```bash
cp .env.example .env
# Éditer .env avec vos paramètres
```

5. Lancer en développement
```bash
npm run dev
```

6. Build pour production
```bash
npm run build
```

## Structure du projet

```
coffice-app/
├── api/                    # Backend PHP
│   ├── auth/              # Authentification
│   ├── espaces/           # Gestion des espaces
│   ├── reservations/      # Réservations
│   ├── domiciliations/    # Domiciliations
│   ├── users/             # Utilisateurs
│   └── utils/             # Utilitaires
├── database/              # Base de données
│   ├── coffice.sql        # Schema principal
│   └── migrations/        # Migrations
├── public/                # Assets statiques
├── src/                   # Frontend React
│   ├── components/        # Composants réutilisables
│   ├── pages/            # Pages de l'application
│   ├── lib/              # API client
│   ├── store/            # State management
│   ├── types/            # Types TypeScript
│   └── utils/            # Fonctions utilitaires
└── scripts/              # Scripts d'administration
```

## Espaces disponibles

### Open Space (12 places)
- Journée : 1 200 DA
- Semaine : 20 000 DA
- Mois : 15 000 DA

### Private Booth Hoggar (2 places)
- Journée : 6 000 DA
- Semaine : 40 000 DA
- Mois : 35 000 DA

### Private Booth Aurès (2 places)
- Journée : 6 000 DA
- Semaine : 40 000 DA
- Mois : 45 000 DA

### Private Booth Atlas (4 places)
- Journée : 10 000 DA
- Semaine : 65 000 DA
- Mois : 45 000 DA

### Salle de Réunion Premium (12 places)
- Heure : 2 500 DA
- Journée : 12 000 DA

## Abonnements

### Solo - 14 000 DA/mois
- Accès open space 8h-18h
- Wi-Fi 50 Mbps
- Accès communauté

### Pro - 32 000 DA/mois
- Accès tous espaces 7h-20h
- Wi-Fi 100 Mbps
- Salle réunion 2h/mois
- -25% services additionnels

### Executive - 55 000 DA/mois
- Accès illimité 24/7
- Wi-Fi illimité
- Domiciliation INCLUSE
- -40% services additionnels

## Sécurité

- Authentification JWT avec refresh tokens
- Protection CSRF
- Rate limiting
- Validation des données côté serveur et client
- Logs de sécurité

## Support

Pour toute question ou problème :
- Email : contact@coffice.dz
- Téléphone : +213 XXX XXX XXX
- Adresse : Mohammadia Mall, 4ème étage, Bureau 1178, Alger

## Licence

Propriétaire - Tous droits réservés
