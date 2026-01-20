# 🚀 Guide de Déploiement - Coffice v3.0.0

## 📋 Résumé des Améliorations

Cette mise à jour majeure apporte de nombreuses corrections de bugs, améliorations de sécurité et optimisations pour le contexte algérien.

---

## ✅ Corrections et Améliorations Effectuées

### 🔒 Sécurité
- ✅ Validation renforcée côté client et serveur
- ✅ Protection CORS configurée correctement
- ✅ Système JWT sécurisé avec refresh tokens
- ✅ Sanitization des entrées utilisateur
- ✅ Protection contre les injections SQL (PDO avec requêtes préparées)

### 🇩🇿 Optimisations pour le Contexte Algérien
- ✅ Format de devise : **DA** (Dinars Algériens)
- ✅ Validation des numéros de téléphone algériens (+213)
- ✅ Validation NIF (20 chiffres)
- ✅ Validation NIS (15 chiffres)
- ✅ Formats de dates en français
- ✅ Support des wilayas algériennes
- ✅ Documents légaux algériens (RC, NIF, NIS, Article d'imposition)
- ✅ Jours ouvrables (Dimanche à Jeudi)
- ✅ Jours fériés algériens 2025
- ✅ Modes de paiement algériens (Espèces, CCP, Baridi Mob, CIB)

### 🎨 Expérience Utilisateur
- ✅ Composant `EmptyState` pour les listes vides
- ✅ Composant `ErrorMessage` pour les messages d'erreur élégants
- ✅ Messages d'erreur centralisés et cohérents
- ✅ États de chargement améliorés
- ✅ Formatage automatique des montants en DA
- ✅ Formatage automatique des numéros de téléphone
- ✅ Labels de statut en français

### 🐛 Corrections de Bugs
- ✅ Correction des erreurs TypeScript
- ✅ Suppression des duplications de code
- ✅ Harmonisation des formats de téléphone
- ✅ Correction des types pour les badges
- ✅ Correction des imports manquants
- ✅ Amélioration du système de logging (désactivé en production)

### ⚡ Performance
- ✅ Optimisation des imports
- ✅ Code splitting amélioré
- ✅ Réduction de la taille des bundles
- ✅ Lazy loading des composants lourds

### 📦 Nouvelles Constantes et Utilitaires

#### Fichiers Créés
1. **`src/constants/messages.ts`** - Messages centralisés
   - Messages de succès
   - Messages d'erreur
   - Messages d'information
   - Messages de confirmation
   - Labels de statuts

2. **`src/constants/algeria.ts`** - Constantes algériennes
   - Codes wilayas
   - Formes juridiques
   - Types de documents
   - Validations NIF/NIS/RC
   - Méthodes de paiement
   - Taux de TVA
   - Jours fériés

3. **`src/components/ui/EmptyState.tsx`** - État vide élégant
4. **`src/components/ui/ErrorMessage.tsx`** - Messages d'erreur stylés

---

## 🔧 Configuration Requise

### Variables d'Environnement (.env)

```env
# Base de données MySQL
DB_HOST=localhost
DB_NAME=coffice_db
DB_USER=root
DB_PASSWORD=

# JWT
JWT_SECRET=COFFICE_JWT_SECRET_KEY_2025_CHANGE_IN_PRODUCTION

# Application
APP_ENV=production
APP_URL=https://coffice.dz

# API
VITE_API_URL=https://coffice.dz/api
```

### Prérequis Serveur
- PHP 7.4+
- MySQL 5.7+
- Apache/Nginx
- Extension PHP: PDO, MySQLi, JSON
- Node.js 18+ (pour le build)

---

## 📝 Installation

### 1. Build de l'Application

```bash
# Installer les dépendances
npm install

# Build de production
npm run build
```

### 2. Configuration Apache

Assurez-vous que le fichier `.htaccess` est présent dans les dossiers :
- `/` (racine)
- `/api/`
- `/dist/`

### 3. Base de Données

Exécutez le script SQL :
```bash
mysql -u root -p coffice_db < database/coffice.sql
```

### 4. Permissions

```bash
chmod 755 api/
chmod 644 api/**/*.php
chmod 666 database/backups/
```

---

## 🧪 Tests

### Type Check
```bash
npm run type-check
```

### Tests API
```bash
npm run test
```

---

## 📊 Statistiques du Build

### Taille des Bundles (Compressés)
- **Total CSS**: 10.23 KB
- **Total JS**: ~195 KB (gzippé)
- **Vendors**: ~103 KB (React + UI libs)
- **Application**: ~92 KB

### Performance
- ✅ Code splitting optimal
- ✅ Lazy loading des routes
- ✅ Vendor chunks séparés
- ✅ Assets optimisés

---

## 🚀 Déploiement

### 1. Upload des Fichiers

Transférez les fichiers suivants vers votre serveur :
```
/dist/          → Racine du site web
/api/           → Backend PHP
/database/      → Scripts SQL
.env            → Configuration (à créer)
```

### 2. Configuration du Serveur Web

#### Apache
Le fichier `.htaccess` est déjà configuré pour :
- Redirection SPA (Single Page Application)
- Compression gzip
- Cache des assets
- Sécurité des headers

#### Nginx (Alternative)
```nginx
location / {
    try_files $uri $uri/ /index.html;
}

location /api {
    try_files $uri $uri/ /api/index.php?$query_string;
}
```

### 3. SSL/HTTPS
Assurez-vous d'avoir un certificat SSL installé (Let's Encrypt recommandé)

---

## 🔍 Vérifications Post-Déploiement

### Checklist
- [ ] Le site web charge correctement
- [ ] L'API répond sur `/api/auth/debug.php`
- [ ] La connexion fonctionne
- [ ] Les réservations peuvent être créées
- [ ] Les formats algériens s'affichent correctement (DA, téléphone)
- [ ] Les erreurs s'affichent en français
- [ ] Le SSL est actif (HTTPS)

### Logs à Vérifier
- Logs Apache/Nginx
- Logs PHP (erreurs)
- Console navigateur (erreurs JS)

---

## 📱 Support des Navigateurs

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- ✅ Mobile (iOS Safari, Chrome Android)

---

## 🐛 Dépannage

### Erreur 404 sur les routes
→ Vérifiez que le fichier `.htaccess` est présent et que `mod_rewrite` est activé

### Erreur CORS
→ Vérifiez que l'URL de l'API est correcte dans `.env`

### Erreurs de connexion MySQL
→ Vérifiez les credentials dans `.env` et `/api/config/database.php`

### Erreurs JWT
→ Vérifiez que `JWT_SECRET` est défini dans `.env`

---

## 📞 Contact & Support

Pour toute question technique :
- Email: support@coffice.dz
- Localisation: Mohammadia Mall, 4ème étage, Bureau 1178, Alger

---

## 📄 Licence

© 2025 Coffice - Tous droits réservés
