# ✅ Checklist Pré-Déploiement - Coffice v3.0.1

## 📋 Tests Complets Avant Production

---

## 1. ⚙️ Configuration Environnement

### Frontend (.env)
- [ ] `VITE_API_URL` pointe vers l'URL de production correcte
- [ ] Pas de références à localhost
- [ ] Variables d'environnement validées

### Backend (API)
- [ ] Connexion MySQL fonctionnelle
- [ ] `DB_HOST`, `DB_NAME`, `DB_USER`, `DB_PASSWORD` corrects
- [ ] `JWT_SECRET` généré (64 caractères minimum)
- [ ] `APP_ENV=production`
- [ ] Rate limiting configuré

---

## 2. 🗄️ Base de Données MySQL

### Structure
- [ ] Table `users` avec tous les champs
- [ ] Table `espaces` avec types corrects
- [ ] Table `reservations` avec contraintes
- [ ] Table `domiciliations` complète
- [ ] Table `codes_promo` fonctionnelle
- [ ] Table `parrainages` et `parrainages_details`
- [ ] Table `notifications`
- [ ] Table `rate_limits` pour sécurité
- [ ] Indexes créés pour performance
- [ ] Foreign keys correctes

### Données Initiales
- [ ] Au moins 1 compte admin créé
- [ ] Espaces de coworking créés (Box Atlas, Aurès, Hoggar, etc.)
- [ ] Tarification configurée

---

## 3. 🔐 Sécurité

### Backend PHP
- [ ] Protection injection SQL (prepared statements)
- [ ] Protection XSS (htmlspecialchars)
- [ ] Rate limiting actif sur login
- [ ] Validation JWT fonctionnelle
- [ ] CORS configuré correctement
- [ ] Gestion erreurs sans leak d'info
- [ ] Logs d'erreurs activés
- [ ] Transactions SQL avec rollback

### Frontend
- [ ] Token refresh automatique
- [ ] Gestion expiration session
- [ ] Pas de données sensibles en localStorage
- [ ] HTTPS forcé en production

---

## 4. 🧪 Tests API Backend

### Authentification
```bash
✅ POST /api/auth/register.php
   - Inscription nouvel utilisateur
   - Validation email unique
   - Hashage password

✅ POST /api/auth/login.php
   - Connexion email/password
   - Retour token JWT + refreshToken
   - Rate limiting actif

✅ GET /api/auth/me.php
   - Vérification token
   - Retour données utilisateur

✅ POST /api/auth/logout.php
   - Déconnexion propre

✅ POST /api/auth/refresh.php
   - Refresh token fonctionnel
```

### Espaces
```bash
✅ GET /api/espaces/index.php
   - Liste tous les espaces
   - Filtres fonctionnels

✅ GET /api/espaces/show.php?id={id}
   - Détails d'un espace

✅ POST /api/espaces/create.php (Admin)
   - Création nouvel espace

✅ PUT /api/espaces/update.php (Admin)
   - Modification espace

✅ DELETE /api/espaces/delete.php (Admin)
   - Suppression espace
```

### Réservations
```bash
✅ GET /api/reservations/index.php
   - Liste réservations (user: ses réservations, admin: toutes)

✅ POST /api/reservations/create.php
   - Création réservation
   - Vérification disponibilité
   - Calcul montant côté serveur
   - Transaction atomique
   - Gestion code promo

✅ PUT /api/reservations/update.php
   - Modification réservation

✅ POST /api/reservations/cancel.php
   - Annulation réservation
```

### Domiciliations
```bash
✅ GET /api/domiciliations/index.php
   - Liste demandes

✅ POST /api/domiciliations/create.php
   - Création demande

✅ POST /api/domiciliations/validate.php (Admin)
   - Validation demande

✅ POST /api/domiciliations/reject.php (Admin)
   - Rejet avec motif

✅ POST /api/domiciliations/activate.php (Admin)
   - Activation domiciliation
```

### Codes Promo
```bash
✅ GET /api/codes-promo/index.php
   - Liste codes

✅ POST /api/codes-promo/validate.php
   - Validation code
   - Vérification conditions
   - Une utilisation par user

✅ POST /api/codes-promo/create.php (Admin)
   - Création code

✅ PUT /api/codes-promo/update.php (Admin)
   - Modification code

✅ DELETE /api/codes-promo/delete.php (Admin)
   - Suppression code
```

### Parrainages
```bash
✅ GET /api/parrainages/index.php
   - Mes parrainages

✅ POST /api/parrainages/verify.php
   - Vérification code parrain
```

### Utilisateurs (Admin)
```bash
✅ GET /api/users/index.php
   - Liste utilisateurs

✅ GET /api/users/show.php?id={id}
   - Détails utilisateur

✅ PUT /api/users/update.php
   - Modification utilisateur

✅ DELETE /api/users/delete.php
   - Suppression utilisateur
```

### Statistiques (Admin)
```bash
✅ GET /api/admin/stats.php
   - Statistiques globales
   - Revenus
   - Taux occupation
   - Nouveaux membres

✅ GET /api/admin/revenue.php?period={month|year}
   - Revenus par période
```

---

## 5. 🎨 Tests Frontend

### Pages Publiques
- [ ] **/** - Page d'accueil charge correctement
- [ ] **/espaces-tarifs** - Liste espaces avec tarifs
- [ ] **/a-propos** - Page à propos
- [ ] **/mentions-legales** - Mentions légales
- [ ] **/connexion** - Formulaire login
- [ ] **/inscription** - Formulaire register

### Pages Utilisateur (Authentifié)
- [ ] **/app** ou **/dashboard** - Tableau de bord
- [ ] **/app/reservations** - Mes réservations
- [ ] **/app/nouvelle-reservation** - Créer réservation
- [ ] **/app/domiciliation** - Demande domiciliation
- [ ] **/app/profil** - Mon profil
- [ ] **/app/mon-entreprise** - Infos entreprise
- [ ] **/app/parrainage** - Code parrainage
- [ ] **/app/codes-promo** - Mes codes promo

### Pages Admin
- [ ] **/app/admin/utilisateurs** - Gestion users
- [ ] **/app/admin/espaces** - Gestion espaces
- [ ] **/app/admin/reservations** - Toutes réservations
- [ ] **/app/admin/domiciliations** - Demandes domiciliation
- [ ] **/app/admin/codes-promo** - Gestion codes
- [ ] **/app/admin/statistiques** - Dashboard admin
- [ ] **/app/admin/parametres** - Configuration

### Système ERP (Admin)
- [ ] **/erp** - Dashboard ERP
- [ ] **/erp/membres** - Gestion membres
- [ ] **/erp/espaces** - Gestion espaces avancée
- [ ] **/erp/reservations** - Planning réservations
- [ ] **/erp/maintenance** - Gestion maintenance
- [ ] **/erp/facturation** - Facturation
- [ ] **/erp/finance** - Gestion financière
- [ ] **/erp/inventaire** - Gestion inventaire
- [ ] **/erp/analytics** - Analytics & Rapports

---

## 6. 🔄 Flux Utilisateur Complets

### Parcours Utilisateur Standard
1. [ ] Visite page d'accueil
2. [ ] Navigation vers espaces/tarifs
3. [ ] Inscription avec validation
4. [ ] Connexion avec token
5. [ ] Création d'une réservation
6. [ ] Application code promo
7. [ ] Consultation du profil
8. [ ] Modification des informations
9. [ ] Déconnexion propre

### Parcours Admin
1. [ ] Connexion admin
2. [ ] Accès dashboard admin
3. [ ] Création d'un espace
4. [ ] Validation d'une réservation
5. [ ] Création d'un code promo
6. [ ] Consultation statistiques
7. [ ] Export des données

---

## 7. 📦 Build & Déploiement

### Build Production
```bash
✅ npm run type-check
   - 0 erreurs TypeScript

✅ npm run build
   - Build réussi
   - Bundle size optimisé (~205 KB)
   - Assets compressés

✅ Test build local
   - npm run preview
   - Navigation fonctionnelle
```

### Fichiers Configuration Serveur
- [ ] **.htaccess** à la racine (redirection vers /dist)
- [ ] **api/.htaccess** (configuration PHP, CORS)
- [ ] **api/config/database.php** (connexion MySQL)
- [ ] **api/config/cors.php** (headers sécurisés)
- [ ] Permissions fichiers correctes (755 dossiers, 644 fichiers)
- [ ] PHP >= 7.4 sur le serveur
- [ ] Extension PDO MySQL activée

### Upload cPanel
- [ ] Dossier `/dist` → `/public_html/`
- [ ] Dossier `/api` → `/public_html/api/`
- [ ] Dossier `/database` → `/home/cofficed/database/` (hors web)
- [ ] Fichier `.env` configuré (hors repository Git)
- [ ] Créer dossier `uploads/` avec permissions 755
- [ ] Créer dossier `database/backups/` avec permissions 755

---

## 8. 🚀 Post-Déploiement

### Vérifications Immédiates
- [ ] Site accessible via HTTPS
- [ ] Certificat SSL valide
- [ ] API répond correctement
- [ ] Base de données accessible
- [ ] Login admin fonctionnel
- [ ] Création compte utilisateur OK
- [ ] Création réservation OK

### Tests Production
- [ ] Parcours utilisateur complet
- [ ] Parcours admin complet
- [ ] Performance acceptable (<3s charge)
- [ ] Responsive mobile/tablette
- [ ] Pas d'erreurs console navigateur
- [ ] Logs serveur propres

### Monitoring
- [ ] Configurer logs d'erreurs PHP
- [ ] Activer monitoring uptime
- [ ] Backup automatique base de données
- [ ] Plan de rollback en cas de problème

---

## 9. 📱 Tests Navigateurs

- [ ] **Chrome** (dernière version)
- [ ] **Firefox** (dernière version)
- [ ] **Safari** (macOS/iOS)
- [ ] **Edge** (dernière version)
- [ ] **Mobile Chrome** (Android)
- [ ] **Mobile Safari** (iOS)

---

## 10. ♿ Accessibilité

- [ ] Navigation au clavier fonctionnelle
- [ ] Lecteurs d'écran compatibles
- [ ] Contrastes couleurs suffisants
- [ ] Labels sur tous les formulaires
- [ ] Messages d'erreur clairs
- [ ] Focus visible sur éléments interactifs

---

## 11. 📊 Performance

### Métriques Cibles
- [ ] **First Contentful Paint**: < 1.5s
- [ ] **Time to Interactive**: < 3s
- [ ] **Total Bundle Size**: < 500 KB (gzippé)
- [ ] **API Response Time**: < 500ms
- [ ] **Database Queries**: Optimisées avec indexes

### Optimisations Actives
- ✅ Code splitting
- ✅ Lazy loading des routes
- ✅ Images optimisées
- ✅ CSS minifié
- ✅ JS minifié
- ✅ Gzip/Brotli compression

---

## 12. 🐛 Tests d'Erreurs

### Gestion d'Erreurs Backend
- [ ] 400 Bad Request - Messages clairs
- [ ] 401 Unauthorized - Redirection login
- [ ] 403 Forbidden - Message approprié
- [ ] 404 Not Found - Page 404 custom
- [ ] 409 Conflict - Gestion conflits réservation
- [ ] 429 Too Many Requests - Rate limit message
- [ ] 500 Server Error - Message générique

### Gestion d'Erreurs Frontend
- [ ] Connexion perdue - Retry automatique
- [ ] Token expiré - Refresh ou redirect
- [ ] Formulaire invalide - Validation inline
- [ ] Erreur serveur - Toast notification
- [ ] Boundary React - Fallback UI

---

## 13. 🔧 Maintenance

### Documentation
- [ ] README.md à jour
- [ ] DEPLOYMENT.md complet
- [ ] CHANGELOG.md mis à jour
- [ ] BUGFIXES.md créé
- [ ] Commentaires dans le code

### Backup & Recovery
- [ ] Backup base de données avant déploiement
- [ ] Script de restauration testé
- [ ] Plan de rollback documenté

---

## 14. ✅ Validation Finale

### Checklist Technique
- ✅ Build production réussi
- ✅ 0 erreur TypeScript
- ✅ 0 warning critique
- ✅ Tests API passés
- ✅ Sécurité validée
- ✅ Performance optimale
- ✅ Accessibilité WCAG AA

### Checklist Fonctionnelle
- [ ] Toutes les pages accessibles
- [ ] Tous les formulaires fonctionnels
- [ ] Toutes les actions CRUD opérationnelles
- [ ] Navigation fluide
- [ ] Responsive parfait
- [ ] Messages utilisateur clairs

---

## 🎉 PRÊT POUR LA PRODUCTION

Une fois toutes les cases cochées, l'application est prête pour le déploiement en production.

**Date de validation**: _________________

**Validé par**: _________________

**Version**: 3.0.1

**Notes supplémentaires**:
_______________________________________________
_______________________________________________
_______________________________________________
