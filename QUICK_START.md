# 🚀 Quick Start - Déploiement Coffice v4.2.0

**Tu as cloné le repo sur `public_html` ?** Voici les 3 étapes simples pour finaliser le déploiement.

---

## ⚡ Méthode rapide (Recommandée)

### 1️⃣ Déployer les fichiers (2 minutes)

```bash
cd public_html
bash deploy-prod.sh
```

Ce script va :

- ✅ Nettoyer les fichiers de développement
- ✅ Copier le build de production à la racine
- ✅ Créer les dossiers nécessaires
- ✅ Configurer les permissions

### 2️⃣ Configurer la base de données (3 minutes)

```bash
bash setup-database.sh
```

Le script va te demander :

- Nom de la base (appuie sur Entrée pour `cofficed_coffice`)
- Utilisateur MySQL
- Mot de passe MySQL

Il va automatiquement :

- ✅ Créer la base si nécessaire
- ✅ Importer le schéma
- ✅ Exécuter toutes les migrations (002 à 006)
- ✅ Optimiser les tables

### 3️⃣ Créer le fichier `.env` (1 minute)

```bash
nano .env
```

Copie-colle et remplace les valeurs :

```env
DB_HOST=localhost
DB_NAME=cofficed_coffice
DB_USER=cofficed_coffice
DB_PASSWORD=TON_MOT_DE_PASSE

JWT_SECRET=GENERE_UN_SECRET_32_CARACTERES_MINIMUM

MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=ton@email.com
MAIL_PASSWORD=ton_app_password
MAIL_FROM_ADDRESS=noreply@coffice.dz
MAIL_FROM_NAME=Coffice
```

**Sauvegarder** : `Ctrl+O` puis `Ctrl+X`

---

## ✅ C'est tout !

### Teste maintenant :

```bash
# Test API
curl https://coffice.dz/api/check.php

# Test connexion DB
curl https://coffice.dz/api/test_db_connection.php
```

### Ouvre dans le navigateur :

- 🌐 `https://coffice.dz`
- Crée un compte test
- Vérifie que ton code parrainage s'affiche (format: CPF + 6 caractères)

---

## 👤 Créer un compte admin

```bash
mysql -u cofficed_coffice -p cofficed_coffice
```

```sql
UPDATE users
SET role = 'admin'
WHERE email = 'ton@email.com';

exit;
```

---

## 📚 Documentation complète

- **Checklist détaillée** : `DEPLOY_CHECKLIST.md`
- **Guide complet** : `DEPLOIEMENT.md`
- **Changelog** : `CHANGELOG.md`
- **README** : `README.md`

---

## 🆘 Problèmes ?

### Page blanche

```bash
# Vérifier que index.html est à la racine
ls -la index.html
```

### API erreur 500

```bash
# Vérifier les logs
tail -50 api/logs/app.log
```

### Code parrainage manquant

```bash
mysql -u cofficed_coffice -p cofficed_coffice
```

```sql
UPDATE users
SET code_parrainage = CONCAT('CPF', UPPER(SUBSTRING(MD5(CONCAT(id, email, UNIX_TIMESTAMP())), 1, 6)))
WHERE code_parrainage IS NULL;
```

---

## 📞 Support

**Contact** : contact@coffice.dz

---

**Version** : 4.2.0 ✨
