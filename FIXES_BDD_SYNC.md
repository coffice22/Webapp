# Corrections - Synchronisation BDD et Prix Demi-journée

**Date:** 14 Décembre 2025
**Ticket:** Problèmes de synchronisation et ajout prix demi-journée

## ✅ Problèmes Résolus

### 1. **Ajout du prix demi-journée**
- ✅ Ajout du champ `prix_demi_journee` dans la table `espaces` (BDD MySQL)
- ✅ Mise à jour des APIs PHP (`create.php`, `update.php`, `index.php`)
- ✅ Mise à jour du type TypeScript `Espace`
- ✅ Mise à jour du store Zustand pour mapper le champ
- ✅ Ajout du champ dans le formulaire admin
- ✅ Affichage du prix demi-journée dans l'interface

### 2. **Synchronisation BDD-Application**
- ✅ Vérification de l'API client MySQL (déjà correctement configurée)
- ✅ API URL configurée sur `https://test.coffice.dz/api`
- ✅ Mapping correct des données snake_case (PHP) → camelCase (React)
- ✅ Récupération des images via `image_url` → `imageUrl`

## 📝 Instructions de Migration

### Étape 1: Exécuter le script SQL de migration

Connectez-vous à votre base de données MySQL et exécutez:

```bash
mysql -u cofficed_user -p cofficed_coffice < database/migrations/add_prix_demi_journee.sql
```

OU utilisez phpMyAdmin pour exécuter:

```sql
ALTER TABLE espaces
ADD COLUMN prix_demi_journee DECIMAL(10,2) NOT NULL DEFAULT 0
AFTER prix_heure;
```

### Étape 2: Vérifier les données existantes

Mettez à jour les espaces existants avec des prix demi-journée:

```sql
-- Exemple: Prix demi-journée = 4x le prix heure
UPDATE espaces
SET prix_demi_journee = prix_heure * 4
WHERE prix_demi_journee = 0;
```

### Étape 3: Déployer le code

```bash
npm run build
```

Le build est généré dans `/dist` - déployez sur votre serveur.

## 🔍 Points de Vérification

### API Backend (PHP)
- ✅ `/api/espaces/index.php` retourne `prix_demi_journee`
- ✅ `/api/espaces/create.php` accepte `prix_demi_journee`
- ✅ `/api/espaces/update.php` accepte `prix_demi_journee`

### Frontend (React)
- ✅ Le formulaire d'ajout/modification d'espace inclut le champ
- ✅ L'affichage des espaces montre: Prix/h • Prix/dj • Prix/j
- ✅ Le type TypeScript `Espace` inclut `prixDemiJournee`

## 🚨 À Vérifier Manuellement

### 1. Doublons d'espaces
Les doublons que vous voyez dans l'interface viennent probablement de:
- La BDD MySQL contient peut-être des doublons
- Vérifiez avec: `SELECT nom, COUNT(*) FROM espaces GROUP BY nom HAVING COUNT(*) > 1;`
- Supprimez les doublons si nécessaire

### 2. Images non affichées
Les images doivent être accessibles via URL complète:
- Format attendu: `https://test.coffice.dz/uploads/espaces/nom_image.jpg`
- Vérifiez que le dossier `uploads/espaces/` existe sur le serveur
- Vérifiez les permissions du dossier (755)
- Mettez à jour les URLs des images dans la BDD si nécessaire

```sql
-- Exemple de mise à jour
UPDATE espaces
SET image_url = CONCAT('https://test.coffice.dz/uploads/espaces/', nom, '.jpg')
WHERE image_url IS NULL OR image_url = '';
```

### 3. Utilisateurs non visibles
Si les nouveaux utilisateurs ne sont pas visibles:
1. Vérifiez les logs PHP: `/api/logs/` ou `/var/log/apache2/error.log`
2. Testez l'endpoint directement: `curl -H "Authorization: Bearer TOKEN" https://test.coffice.dz/api/users/index.php`
3. Vérifiez que l'admin a un token JWT valide

## 📊 Structure de la BDD

### Table `espaces` (mise à jour)
```sql
CREATE TABLE espaces (
  id CHAR(36) PRIMARY KEY,
  nom VARCHAR(100) NOT NULL,
  type ENUM('box_4', 'box_3', 'open_space', 'salle_reunion', 'poste_informatique'),
  capacite INT NOT NULL,
  prix_heure DECIMAL(10,2) NOT NULL,
  prix_demi_journee DECIMAL(10,2) NOT NULL DEFAULT 0,  -- NOUVEAU
  prix_jour DECIMAL(10,2) NOT NULL,
  prix_semaine DECIMAL(10,2) NOT NULL DEFAULT 0,
  description TEXT,
  equipements JSON,
  disponible BOOLEAN DEFAULT TRUE,
  etage INT DEFAULT 4,
  image_url TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

## 🔧 Commandes Utiles

### Vérifier la connexion à la BDD
```bash
php -r "
require 'api/config/database.php';
try {
    \$db = Database::getInstance()->getConnection();
    echo 'Connexion réussie!\n';
} catch (Exception \$e) {
    echo 'Erreur: ' . \$e->getMessage() . '\n';
}
"
```

### Tester un endpoint
```bash
# Récupérer les espaces
curl -X GET https://test.coffice.dz/api/espaces/index.php

# Avec authentification
curl -X GET -H "Authorization: Bearer VOTRE_TOKEN" https://test.coffice.dz/api/users/index.php
```

## 📌 Prochaines Étapes Recommandées

1. **Nettoyer les doublons dans la BDD**
2. **Upload des images des espaces** dans `/uploads/espaces/`
3. **Vérifier les logs** en cas de problème
4. **Tester la création/modification d'espaces** depuis l'admin
5. **Vérifier que les nouveaux utilisateurs apparaissent** dans l'admin

## 💡 Espaces Coffice (Référence)

Selon vos spécifications, l'espace devrait contenir:
- 2 box de 4 places (type: `box_4`)
- 1 box de 3 places (type: `box_3`)
- 1 table open space de 12 places (type: `open_space`, capacité: 12)
- 2 postes informatiques dans l'open space (type: `poste_informatique`)
- 1 salle de réunion avec terrasse (type: `salle_reunion`)

**Total:** 5 espaces différents à créer

## 🆘 En cas de Problème

1. Vérifiez les logs PHP: `tail -f /var/log/apache2/error.log`
2. Vérifiez les logs applicatifs: Console navigateur (F12)
3. Testez les endpoints manuellement avec curl/Postman
4. Vérifiez que le fichier `.env` est correct et accessible par PHP
5. Redémarrez Apache si nécessaire: `sudo systemctl restart apache2`
