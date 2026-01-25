# ✅ Checklist de Déploiement - Coffice v4.2.0

## 📍 Situation actuelle

Le repo a été cloné sur `public_html/`. Suivez cette checklist pour finaliser le déploiement.

---

## 🔧 Étape 1 : Nettoyage du serveur

Sur le serveur, supprimez les fichiers de développement :

```bash
cd public_html

# Supprimer les fichiers de développement (ne servent qu'en local)
rm -rf node_modules/
rm -rf src/
rm -f package.json package-lock.json
rm -f tsconfig.json tsconfig.node.json
rm -f vite.config.ts postcss.config.js tailwind.config.js
rm -rf .git/
rm -f .gitignore
```

**Important** : Gardez uniquement :

- `dist/` → sera copié à la racine
- `api/` → backend PHP
- `database/` → migrations
- `.env` → configuration
- `.htaccess` → configuration serveur

---

## 🗂️ Étape 2 : Structure finale

Déplacez le contenu de `dist/` à la racine :

```bash
# Copier le contenu de dist/ vers la racine
cp -r dist/* ./

# Vérifier la structure (doit ressembler à ça)
ls -la
# Devrait afficher :
# index.html
# assets/
# api/
# database/
# .htaccess
# .env
```

---

## 🔐 Étape 3 : Configuration `.env`

Créez/modifiez le fichier `.env` avec vos vraies valeurs :

```bash
nano .env
```

```env
# Base de données
DB_HOST=localhost
DB_NAME=cofficed_coffice
DB_USER=cofficed_coffice
DB_PASSWORD=VOTRE_MOT_DE_PASSE

# JWT Secret (générez un secret unique de 32+ caractères)
JWT_SECRET=GENEREZ_UN_SECRET_ICI_32_CARACTERES_MIN

# Email (Configuration Gmail App Password)
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=votre@email.com
MAIL_PASSWORD=votre_app_password
MAIL_FROM_ADDRESS=noreply@coffice.dz
MAIL_FROM_NAME=Coffice

# Environnement
APP_ENV=production
APP_DEBUG=false
```

**Sécurité** :

```bash
chmod 644 .env
```

---

## 🗄️ Étape 4 : Base de données

### A. Importer le schéma de base

```bash
mysql -u cofficed_coffice -p cofficed_coffice < database/coffice.sql
```

### B. Exécuter les migrations (dans l'ordre)

```bash
mysql -u cofficed_coffice -p cofficed_coffice < database/migrations/002_password_resets.sql
mysql -u cofficed_coffice -p cofficed_coffice < database/migrations/003_add_rappel_envoye.sql
mysql -u cofficed_coffice -p cofficed_coffice < database/migrations/004_performance_indexes.sql
mysql -u cofficed_coffice -p cofficed_coffice < database/migrations/005_audit_logging.sql
mysql -u cofficed_coffice -p cofficed_coffice < database/migrations/006_add_code_parrainage.sql
```

### C. Optimiser les tables

```bash
mysql -u cofficed_coffice -p cofficed_coffice -e "ANALYZE TABLE users, reservations, domiciliations, espaces, parrainages, parrainages_details;"
```

---

## 📁 Étape 5 : Permissions

```bash
# Dossiers d'upload
mkdir -p api/uploads/documents
chmod 755 api/uploads
chmod 755 api/uploads/documents

# Dossier logs
mkdir -p api/logs
chmod 755 api/logs

# Fichiers sensibles
chmod 644 .env
chmod 644 .htaccess
```

---

## 🧪 Étape 6 : Tests

### A. Test API

```bash
curl https://coffice.dz/api/check.php
```

**Attendu** : `{"status":"ok","php_version":"8.x.x",...}`

### B. Test connexion DB

```bash
curl https://coffice.dz/api/test_db_connection.php
```

**Attendu** : `{"success":true,...}`

### C. Test frontend

1. Ouvrir `https://coffice.dz` dans un navigateur
2. F12 → Console (vérifier aucune erreur)
3. Tester l'inscription
4. Tester la connexion
5. Vérifier le code de parrainage généré

---

## 🔍 Étape 7 : Vérifications de sécurité

### A. Headers HTTP

```bash
curl -I https://coffice.dz/api/auth/me.php
```

Doit contenir :

- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`

### B. HTTPS actif

```bash
curl -I https://coffice.dz
```

Vérifier que la redirection HTTP → HTTPS fonctionne.

---

## 📊 Étape 8 : Créer un compte admin

```bash
mysql -u cofficed_coffice -p cofficed_coffice
```

```sql
-- Remplacer EMAIL et MOT_DE_PASSE
UPDATE users
SET role = 'admin'
WHERE email = 'votre@email.com';
```

---

## ✅ Checklist finale

Cochez au fur et à mesure :

- [ ] Fichiers de dev supprimés (src/, node_modules/, etc.)
- [ ] Contenu de dist/ copié à la racine
- [ ] Fichier .env configuré avec vraies valeurs
- [ ] Base de données créée
- [ ] Schéma importé (coffice.sql)
- [ ] Toutes migrations exécutées (002 à 006)
- [ ] Tables optimisées (ANALYZE)
- [ ] Permissions correctes (755 pour dossiers, 644 pour fichiers)
- [ ] API répond correctement (/api/check.php)
- [ ] Test connexion DB réussi
- [ ] Site accessible sans erreur
- [ ] Console navigateur sans erreur (F12)
- [ ] Inscription fonctionnelle
- [ ] Connexion fonctionnelle
- [ ] Code parrainage généré automatiquement
- [ ] HTTPS actif et certificat valide
- [ ] Compte admin créé

---

## 🐛 Problèmes fréquents

### "Module parse failed"

**Cause** : Fichiers source (src/) présents sur le serveur
**Solution** : Supprimer src/ et node_modules/

### API erreur 500

**Cause** : Configuration .env incorrecte ou permissions
**Solution** : Vérifier logs dans `api/logs/app.log`

### Page blanche

**Cause** : Structure incorrecte (index.html pas à la racine)
**Solution** : S'assurer que dist/ a été copié à la racine

### Pas de code parrainage

**Cause** : Migration 006 non exécutée
**Solution** : Exécuter `006_add_code_parrainage.sql`

---

## 📞 Support

**Logs à vérifier** :

- `api/logs/app.log` → Logs backend
- Console navigateur (F12) → Erreurs frontend

**Contact** : contact@coffice.dz

---

**Version** : 4.2.0 | Dernière mise à jour : Janvier 2026
