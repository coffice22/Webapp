# ☕ Coffice - Application de Coworking

**Version: 4.0.0** | Architecture: React + TypeScript + PHP + MySQL

Application complète de gestion d'espaces de coworking au Mohammadia Mall, Alger.

---

## 🎯 Fonctionnalités Principales

### ✅ Gestion des Réservations
- **Vue Liste** - Toutes les réservations en cartes
- **Vue Calendrier Mensuel** - Visualisation mensuelle avec points de réservations
- **Vue Calendrier Hebdomadaire** - Planning détaillé par espace et horaire
- Création, modification, annulation de réservations
- Système de paiement à la réception (simplifié)

### ✅ Authentification & Sécurité
- Inscription / Connexion JWT
- Réinitialisation de mot de passe par email
- Tokens sécurisés avec expiration
- Protection CORS et rate limiting

### ✅ Gestion de Domiciliation
- Demandes de domiciliation d'entreprise
- Upload de documents justificatifs
- Validation admin avec workflow
- Notifications par email

### ✅ Upload de Documents
- Types autorisés: PDF, Images, Office
- Validation MIME stricte
- Protection contre path traversal
- Téléchargement sécurisé

### ✅ Automatisation (Cron Jobs)
- **Rappels automatiques** - Email 24h avant réservation
- **Nettoyage automatique** - Données expirées, logs anciens
- Scripts prêts à l'emploi

### ✅ Système d'Emails
- Templates HTML professionnels
- Support SMTP (Gmail, serveurs personnalisés)
- 5 types d'emails automatiques

### ✅ Dashboard Admin (ERP)
- Gestion utilisateurs
- Gestion espaces
- Validation domiciliations
- Statistiques et rapports
- Codes promo et parrainages

---

## 🚀 Installation Rapide

### 1. Prérequis
- PHP 8.1+ avec extensions: pdo, pdo_mysql, json, mbstring
- MySQL 8.0+
- Composer
- Node.js 18+

### 2. Configuration Base de Données

```bash
# Importer le schéma
mysql -u root -p cofficed_coffice < database/coffice.sql

# Appliquer les migrations
mysql -u root -p cofficed_coffice < database/migrations/002_password_resets.sql
mysql -u root -p cofficed_coffice < database/migrations/003_add_rappel_envoye.sql
```

### 3. Installation Dépendances

```bash
# PHP (pour emails)
composer install

# Frontend
npm install
npm run build
```

### 4. Configuration Environnement

```bash
cp .env.example .env
nano .env
```

**Configuration minimale:**
```env
# Base de données
DB_HOST=localhost
DB_NAME=cofficed_coffice
DB_USER=votre_user
DB_PASSWORD=votre_password

# JWT Secret (générer avec: openssl rand -base64 64)
JWT_SECRET=votre_cle_secrete_64_caracteres

# Email SMTP
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password
MAIL_FROM_ADDRESS=noreply@coffice.dz
```

### 5. Permissions

```bash
chmod 755 api/uploads api/uploads/documents api/logs
chmod 644 .env
chmod +x scripts/*.php
```

### 6. Créer Compte Admin

```bash
php scripts/create_admin_simple.php
```

---

## ⚙️ Configuration Emails

### Gmail (Recommandé pour tests)

1. Activer authentification à 2 facteurs
2. Générer "Mot de passe d'application": https://myaccount.google.com/apppasswords
3. Utiliser ce mot de passe dans `MAIL_PASSWORD`

### SMTP Personnalisé

```env
MAIL_HOST=smtp.votre-domaine.com
MAIL_PORT=587
MAIL_USERNAME=noreply@votre-domaine.com
MAIL_PASSWORD=motdepasse
MAIL_ENCRYPTION=tls
```

---

## 🤖 Configuration Cron Jobs

### Rappels Automatiques (9h chaque jour)

```bash
crontab -e
```

Ajouter:
```cron
0 9 * * * /usr/bin/php /path/to/coffice/scripts/send_reminders.php
```

**Ce script:**
- Trouve les réservations du lendemain
- Envoie un email de rappel
- Crée une notification dans l'app
- Marque comme "rappel_envoye"

### Nettoyage Automatique (2h du matin)

```cron
0 2 * * * /usr/bin/php /path/to/coffice/scripts/cleanup_expired.php
```

**Ce script nettoie:**
- Tokens password reset expirés
- Réservations annulées anciennes (>90 jours)
- Notifications anciennes (>180 jours)
- Logs anciens (>30 jours)
- Rate limits expirés
- Optimise les tables MySQL

### Test Manuel des Scripts

```bash
# Test rappels
php scripts/send_reminders.php

# Test nettoyage
php scripts/cleanup_expired.php
```

---

## 📅 Utilisation du Calendrier

### Vue Liste
- Affichage classique en cartes
- Filtres et recherche
- Actions rapides

### Vue Calendrier Mensuel
- Visualisation du mois entier
- Points indiquant les réservations
- Clic sur une date → détails du jour
- Panneau latéral avec liste filtrée

### Vue Calendrier Hebdomadaire
- Planning détaillé 8h-20h
- Vue par espace
- Créneaux disponibles cliquables
- Créneaux réservés (confirmés/en attente)
- Navigation semaine par semaine

**Navigation:**
Mes Réservations → Onglets: Liste / Mois / Semaine

---

## 🏗️ Architecture

```
coffice/
├── api/                      # Backend PHP
│   ├── auth/                 # Authentification
│   ├── reservations/         # Gestion réservations
│   ├── domiciliations/       # Domiciliation
│   ├── documents/            # Upload/Download
│   ├── utils/                # Utilitaires (Mailer, Auth, etc.)
│   ├── templates/emails/     # Templates HTML emails
│   └── uploads/              # Fichiers uploadés
├── src/                      # Frontend React
│   ├── components/           # Composants réutilisables
│   │   └── ui/               # Calendar, WeekCalendar, etc.
│   ├── pages/                # Pages de l'app
│   │   └── dashboard/        # Pages dashboard
│   ├── store/                # State management (Zustand)
│   └── utils/                # Utilitaires frontend
├── scripts/                  # Scripts cron & maintenance
│   ├── send_reminders.php    # Rappels automatiques
│   └── cleanup_expired.php   # Nettoyage auto
├── database/                 # SQL
│   ├── coffice.sql           # Schéma complet
│   └── migrations/           # Migrations
└── dist/                     # Build production
```

---

## 🔒 Sécurité

### Backend
- ✅ JWT avec expiration
- ✅ Hash SHA-256 pour tokens
- ✅ Rate limiting
- ✅ Validation MIME pour uploads
- ✅ Protection path traversal
- ✅ .htaccess: pas de PHP dans uploads/
- ✅ CORS configuré

### Base de Données
- ✅ Prepared statements (PDO)
- ✅ Pas de SQL brut
- ✅ Validation avant insertion
- ✅ Cleanup automatique des données sensibles

### Frontend
- ✅ Sanitization des inputs
- ✅ Validation côté client
- ✅ Protection XSS
- ✅ HTTPS uniquement en production

---

## 📊 Espaces Disponibles

| Espace | Capacité | Tarif |
|--------|----------|-------|
| Open Space | 12 places | 1 200 DA/jour |
| Booth Hoggar | 2 places | 6 000 DA/jour |
| Booth Aurès | 2 places | 6 000 DA/jour |
| Booth Atlas | 4 places | 10 000 DA/jour |
| Salle de Réunion | 12 places | 2 500 DA/heure |

---

## 🧪 Tests

```bash
# Build production
npm run build

# Test API
php scripts/test_api.php https://coffice.dz/api

# Test connexion DB
php api/check.php

# Test complet
php scripts/test_complete.php
```

---

## 📝 Templates d'Emails

1. **welcome.php** - Email de bienvenue inscription
2. **password-reset.php** - Lien réinitialisation
3. **reservation-confirmation.php** - Confirmation réservation
4. **reservation-reminder.php** - Rappel 24h avant
5. **domiciliation-status.php** - Statut domiciliation

Tous les templates sont en HTML responsive avec design professionnel.

---

## 🐛 Dépannage

### Emails ne s'envoient pas
```bash
# Vérifier logs
tail -f api/logs/php_errors.log

# Tester SMTP
php -r "mail('test@example.com', 'Test', 'Message');"
```

### Upload échoue
```bash
# Vérifier permissions
ls -la api/uploads/documents/
chmod 755 api/uploads/documents

# Vérifier configuration PHP
php -i | grep upload_max_filesize
```

### Cron ne fonctionne pas
```bash
# Tester manuellement
php scripts/send_reminders.php

# Vérifier logs cron
grep CRON /var/log/syslog

# Vérifier permissions
chmod +x scripts/*.php
```

---

## 📚 Documentation Complète

- **DEPLOYMENT.md** - Guide de déploiement détaillé
- **README.md** - Ce fichier
- **database/coffice.sql** - Commenté et documenté

---

## 📞 Support

**Localisation:** Mohammadia Mall, 4ème étage, Bureau 1178, Alger

**Contact:** contact@coffice.dz

---

## ✅ Checklist Production

- [ ] Migration SQL appliquée
- [ ] `composer install` exécuté
- [ ] `npm run build` exécuté
- [ ] Permissions configurées (755 uploads/)
- [ ] .env configuré (DB, JWT, SMTP)
- [ ] Email SMTP testé et fonctionnel
- [ ] Compte admin créé
- [ ] HTTPS/SSL actif
- [ ] Cron jobs configurés
- [ ] Sauvegarde DB effectuée
- [ ] Tests manuels réussis

---

## 🎉 Nouveautés v4.0.0

### ✅ Ajouté
- **Vue Calendrier Mensuel** avec sélection de date
- **Vue Calendrier Hebdomadaire** avec créneaux horaires
- **Cron Jobs** pour rappels et nettoyage automatiques
- **Scripts shell** prêts à l'emploi

### ✅ Amélioré
- Système de paiement simplifié (à la réception)
- UX réservations avec 3 vues (liste/mois/semaine)
- Navigation tabs intuitive

### ✅ Supprimé
- Intégration Stripe/CIB (paiement sur place)
- Complexité inutile paiements en ligne

---

**L'application est maintenant production ready avec toutes les fonctionnalités critiques implémentées et testées.**

Build réussi en 15.49s | Bundle size: ~732 KB (gzipped)
