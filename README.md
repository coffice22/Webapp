# Coffice - Plateforme de Coworking

> ⚠️ **IMPORTANT**: Voir `CORRECTION_RESERVATION.md` pour la correction complète du système de réservation

---

# Coffice - Plateforme de Coworking

Application web complète de gestion d'espaces de coworking située au Mohammadia Mall, Alger.

## 📋 Vue d'ensemble

Coffice est une plateforme moderne de réservation et gestion d'espaces de coworking comprenant :

- 2 box de 4 places
- 1 box de 3 places
- 1 table open space de 12 places (dont 2 postes informatiques)
- 1 salle de réunion avec terrasse
- 1 kitchenette équipée

## 🚀 Technologies

### Frontend

- **React 18** avec TypeScript
- **Vite** - Build tool moderne
- **TailwindCSS** - Design system
- **Framer Motion** - Animations
- **React Router** - Navigation
- **Zustand** - State management
- **React Hook Form** - Gestion des formulaires
- **date-fns** - Manipulation des dates

### Backend

- **PHP 8+** - API REST
- **MySQL** - Base de données
- **JWT** - Authentication

## 📦 Installation

### Prérequis

- Node.js 18+
- PHP 8+
- MySQL 8+
- Composer

### Configuration

1. **Cloner le projet**

```bash
git clone <repository-url>
cd coffice-app
```

2. **Installer les dépendances frontend**

```bash
npm install
```

3. **Configurer l'environnement**

```bash
cp .env.example .env
```

Éditer `.env` avec vos paramètres :

```env
# Base de données
DB_HOST=localhost
DB_PORT=3306
DB_NAME=coffice
DB_USER=root
DB_PASSWORD=

# JWT
JWT_SECRET=votre-clé-secrète-très-longue-et-sécurisée
JWT_EXPIRY=86400

# Email (optionnel)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=votre@email.com
SMTP_PASS=votre-mot-de-passe
SMTP_FROM=noreply@coffice.dz
```

4. **Créer la base de données**

```bash
mysql -u root -p < database/coffice.sql
```

Ou via le script :

```bash
chmod +x setup-database.sh
./setup-database.sh
```

5. **Lancer l'application**

**Développement :**

```bash
npm run dev
```

**Production :**

```bash
npm run build
```

## 🎯 Fonctionnalités Principales

### Pour les Utilisateurs

#### 🏠 Accueil

- Présentation des espaces
- Informations de contact
- Formulaire de demande de renseignements

#### 📅 Réservations

- Calendrier interactif
- Réservation d'espaces par heure/jour
- Gestion de ses réservations
- Historique complet

#### 🏢 Domiciliation

- Demande de domiciliation commerciale
- Upload de documents (KBIS, etc.)
- Suivi du statut de la demande
- Validation administrative

#### 🎁 Programme de Parrainage

- **Code unique** généré automatiquement pour chaque utilisateur
- **Partage facile** : copie de code et lien direct
- **Statistiques en temps réel** :
  - Nombre de personnes parrainées
  - Récompenses totales gagnées
  - Récompenses payées
  - Récompenses en attente
- **Liste des filleuls** avec statut et dates
- **Récompenses** :
  - Le parrain gagne des crédits
  - Le filleul reçoit 3000 DA à l'inscription
- **Auto-remplissage** : le code est pré-rempli via le lien de parrainage

#### 💳 Paiement

- Résumé des réservations
- Application des codes promo
- Utilisation des crédits de parrainage
- Validation des paiements

### Pour les Administrateurs

#### 📊 Dashboard Admin

- Vue d'ensemble des statistiques
- Graphiques de revenus
- Taux d'occupation des espaces

#### 👥 Gestion des Utilisateurs

- Liste complète des utilisateurs
- Détails et historique
- Gestion des rôles

#### 🏢 Gestion des Espaces

- CRUD complet des espaces
- Configuration des tarifs
- Disponibilités et horaires

#### 📅 Gestion des Réservations

- Validation des réservations
- Annulations et modifications
- Export des données

#### 🎫 Codes Promo

- Création de codes promotionnels
- Gestion des validités
- Statistiques d'utilisation

#### 💼 Abonnements

- Création de formules d'abonnement
- Gestion des membres
- Renouvellements

#### 🎁 Suivi des Parrainages

- Liste de tous les parrainages
- Validation des récompenses
- Statistiques globales
- Top parrains

## 🔐 Sécurité

### Authentification

- JWT tokens avec expiration
- Refresh tokens
- Password hashing (bcrypt)
- Protection CSRF

### API

- Rate limiting
- Validation des entrées
- Sanitization des données
- CORS configuré
- Protection contre les injections SQL

### Base de données

- Requêtes préparées (PDO)
- Transactions pour l'intégrité
- Audit logging
- Sauvegardes automatiques

## 🌐 API Endpoints

### Auth

```
POST   /api/auth/register       - Inscription
POST   /api/auth/login          - Connexion
POST   /api/auth/logout         - Déconnexion
GET    /api/auth/me             - Utilisateur actuel
POST   /api/auth/refresh        - Refresh token
POST   /api/auth/forgot-password - Mot de passe oublié
POST   /api/auth/reset-password  - Réinitialisation
```

### Réservations

```
GET    /api/reservations        - Liste
POST   /api/reservations/create - Créer
GET    /api/reservations/show   - Détails
PUT    /api/reservations/update - Modifier
DELETE /api/reservations/cancel - Annuler
```

### Espaces

```
GET    /api/espaces             - Liste
POST   /api/espaces/create      - Créer (admin)
GET    /api/espaces/show        - Détails
PUT    /api/espaces/update      - Modifier (admin)
DELETE /api/espaces/delete      - Supprimer (admin)
```

### Parrainage

```
GET    /api/parrainages         - Liste des parrainages
POST   /api/parrainages/verify  - Vérifier un code
```

### Domiciliation

```
GET    /api/domiciliations      - Liste
POST   /api/domiciliations/create - Créer
PUT    /api/domiciliations/validate - Valider (admin)
PUT    /api/domiciliations/reject   - Rejeter (admin)
```

## 📱 Responsive Design

L'application est entièrement responsive avec des breakpoints optimisés :

- Mobile : < 768px
- Tablet : 768px - 1024px
- Desktop : > 1024px

## 🎨 Design System

### Couleurs

- **Primary** : Bleu (#0066CC)
- **Accent** : Teal (#0D9488)
- **Success** : Vert (#10B981)
- **Warning** : Orange (#F59E0B)
- **Danger** : Rouge (#EF4444)

### Typographie

- **Display** : System fonts avec fallbacks
- **Body** : Inter, system-ui
- **Line heights** : 120% (headings), 150% (body)

### Espacements

- Système de 8px (0.5rem, 1rem, 1.5rem, etc.)
- Grille responsive avec gap uniforme

## 📈 Performance

### Optimisations

- Code splitting automatique (Vite)
- Lazy loading des routes
- Images optimisées
- Minification CSS/JS
- Gzip compression
- Cache headers

### Métriques cibles

- First Contentful Paint : < 1.5s
- Time to Interactive : < 3s
- Lighthouse Score : > 90

## 🧪 Tests

```bash
# Tests API
npm run test

# Tests locaux
npm run test:local
```

## 🚀 Déploiement

### Production

1. **Build**

```bash
npm run build
```

2. **Upload**

```bash
./deploy-prod.sh
```

### Configuration serveur

**Apache (.htaccess)**

```apache
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^ index.html [L]
```

**Nginx**

```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```

## 📝 Structure du Projet

```
coffice-app/
├── api/                    # Backend PHP
│   ├── auth/              # Authentification
│   ├── reservations/      # Gestion réservations
│   ├── espaces/           # Gestion espaces
│   ├── parrainages/       # Système parrainage
│   ├── config/            # Configuration
│   └── utils/             # Utilitaires
├── src/                   # Frontend React
│   ├── components/        # Composants réutilisables
│   ├── pages/             # Pages de l'application
│   ├── store/             # State management (Zustand)
│   ├── hooks/             # Custom hooks
│   ├── utils/             # Utilitaires
│   └── types/             # Types TypeScript
├── database/              # SQL et migrations
├── public/                # Assets statiques
└── dist/                  # Build de production
```

## 🤝 Contribution

1. Fork le projet
2. Créer une branche (`git checkout -b feature/amélioration`)
3. Commit les changements (`git commit -m 'Ajout fonctionnalité'`)
4. Push vers la branche (`git push origin feature/amélioration`)
5. Ouvrir une Pull Request

## 📄 Licence

Projet propriétaire - Tous droits réservés © 2026 Coffice

## 📞 Contact

- **Adresse** : 4ème étage, Bureau 1178, Mohammadia Mall, Alger
- **Email** : contact@coffice.dz
- **Téléphone** : +213 XX XX XX XX

## 🔄 Version

**v4.2.3** - Janvier 2026

### Dernières mises à jour

- ✅ Page de parrainage refaite complètement
- ✅ Statistiques en temps réel
- ✅ Auto-remplissage du code depuis l'URL
- ✅ Liste détaillée des filleuls
- ✅ Design moderne et responsive
- ✅ Protection contre les dates invalides
- ✅ Gestion robuste des erreurs

---

**Développé avec ❤️ à Alger**
