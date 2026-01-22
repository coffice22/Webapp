# Guide de Dépannage - Coffice

## 🔍 Diagnostic des Erreurs 500

Les erreurs 500 (Internal Server Error) lors de la création de réservations ou la mise à jour d'utilisateurs indiquent un problème côté serveur PHP/MySQL.

### Étape 1: Vérifier la connexion à la base de données

**Visitez:** `https://coffice.dz/api/test_connection.php`

Ce script va:

- ✅ Vérifier que le fichier `.env` existe et est chargé
- ✅ Vérifier les variables MySQL (DB_HOST, DB_NAME, etc.)
- ✅ Tester la connexion à MySQL
- ✅ Vérifier que la base de données existe
- ✅ Lister toutes les tables
- ✅ Compter les enregistrements

**⚠️ IMPORTANT:** Supprimez ce fichier après le test par sécurité!

### Étape 2: Résoudre les problèmes courants

#### Problème: "Base de données n'existe pas"

**Solution:**

1. Visitez: `https://coffice.dz/api/install.php`
2. Le script va créer automatiquement la base et toutes les tables
3. Supprimez `api/install.php` après l'installation

#### Problème: "Erreur de connexion MySQL"

**Solutions possibles:**

1. **Vérifiez les identifiants dans `.env`**

   ```env
   DB_HOST=localhost
   DB_PORT=3306
   DB_NAME=cofficed_coffice
   DB_USER=cofficed_user
   DB_PASSWORD=votre_mot_de_passe_ici
   ```

2. **Vérifiez que MySQL est démarré**
   - Via cPanel: MySQL Databases
   - Via terminal: `systemctl status mysql`

3. **Vérifiez les permissions de l'utilisateur**
   - L'utilisateur MySQL doit avoir TOUS les privilèges sur la base
   - Via cPanel: MySQL Databases > Assign User to Database

#### Problème: "Tables manquantes"

**Solution:**
Exécutez le script d'installation: `https://coffice.dz/api/install.php`

### Étape 3: Mode Debug

Le fichier `.env` est configuré en mode développement pour afficher les erreurs détaillées:

```env
APP_ENV=development
```

**Avec ce mode activé**, les erreurs 500 afficheront le message exact du problème dans la console navigateur (F12).

**Pour la production**, changez en:

```env
APP_ENV=production
```

### Étape 4: Vérifier les logs PHP

Les logs d'erreur détaillés se trouvent dans:

- `/var/log/php-errors.log`
- Ou via cPanel > Logs > Error Log

Recherchez les erreurs avec:

```bash
tail -f /var/log/php-errors.log | grep -E "(reservation|user update)"
```

## 🐛 Problèmes Spécifiques

### Erreur: "Cannot create reservation"

**Causes possibles:**

1. Base de données non créée → Exécutez `api/install.php`
2. Table `reservations` manquante → Exécutez `api/install.php`
3. Table `espaces` vide → Exécutez `api/install.php` (insère les espaces de base)
4. Espace_id invalide → Vérifiez que l'espace existe

**Test manuel:**

```bash
curl -X POST https://coffice.dz/api/reservations/create.php \
  -H "Authorization: Bearer VOTRE_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "espace_id": "ID_ESPACE",
    "date_debut": "2026-01-23 10:00:00",
    "date_fin": "2026-01-23 12:00:00",
    "participants": 1
  }'
```

### Erreur: "Cannot update user"

**Causes possibles:**

1. Table `users` manquante → Exécutez `api/install.php`
2. Champs de la table incompatibles → Re-importez le schéma SQL
3. User_id invalide → Vérifiez l'authentification

**Test manuel:**

```bash
curl -X PUT "https://coffice.dz/api/users/update.php?id=USER_ID" \
  -H "Authorization: Bearer VOTRE_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "nom": "Test",
    "prenom": "User"
  }'
```

## 🔧 Réinitialisation Complète

Si tout échoue, réinitialisez complètement:

### Option 1: Via cPanel

1. **Supprimer la base de données**
   - cPanel > MySQL Databases
   - Supprimer `cofficed_coffice`

2. **Recréer la base**
   - Créer une nouvelle base: `cofficed_coffice`
   - Créer un utilisateur: `cofficed_user`
   - Associer avec tous les privilèges

3. **Réinstaller**
   - Visitez: `https://coffice.dz/api/install.php`

### Option 2: Via SQL

```sql
-- Supprimer
DROP DATABASE IF EXISTS cofficed_coffice;

-- Recréer
CREATE DATABASE cofficed_coffice CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Puis visitez: api/install.php
```

## 📋 Checklist de Dépannage

Avant de demander de l'aide, vérifiez:

- [ ] Fichier `.env` existe et est configuré
- [ ] Variables MySQL correctement remplies (pas de placeholders)
- [ ] MySQL est démarré
- [ ] Base de données `cofficed_coffice` existe
- [ ] Utilisateur MySQL a tous les privilèges
- [ ] Script `api/test_connection.php` réussit tous les tests
- [ ] Script `api/install.php` a été exécuté avec succès
- [ ] Mode debug activé (`APP_ENV=development`)
- [ ] Logs PHP consultés
- [ ] Console navigateur (F12) vérifiée

## 🆘 Erreurs Fréquentes et Solutions

### "SQLSTATE[HY000] [1045] Access denied"

❌ **Problème:** Mauvais identifiants MySQL
✅ **Solution:** Vérifiez `DB_USER` et `DB_PASSWORD` dans `.env`

### "SQLSTATE[HY000] [2002] Connection refused"

❌ **Problème:** MySQL n'est pas démarré ou `DB_HOST` incorrect
✅ **Solution:** Vérifiez que MySQL tourne et que `DB_HOST=localhost`

### "SQLSTATE[42S02]: Base table or view not found"

❌ **Problème:** Table manquante
✅ **Solution:** Exécutez `api/install.php`

### "SQLSTATE[42000]: Syntax error or access violation"

❌ **Problème:** Erreur SQL ou permissions insuffisantes
✅ **Solution:** Vérifiez les privilèges de l'utilisateur MySQL

### "Undefined index: DB_HOST"

❌ **Problème:** Variables `.env` non chargées
✅ **Solution:** Vérifiez que le fichier `.env` est à la racine du projet

## 📞 Support

Si le problème persiste après avoir suivi ce guide:

1. Partagez le résultat de `api/test_connection.php`
2. Partagez les logs d'erreur PHP
3. Partagez les erreurs de la console navigateur (F12)
4. Indiquez votre environnement (OS, version PHP, version MySQL)

---

**Dernière mise à jour:** 2026-01-22
