# Changelog - Coffice Application

## [3.0.1] - 2026-01-20

### Corrections
- **Domiciliation** : Correction du problème de mise à jour des informations d'entreprise
- Ajout de l'onglet "Mon Entreprise" au menu utilisateur pour permettre l'accès au formulaire
- Amélioration de la gestion des erreurs dans la mise à jour du profil utilisateur
- Correction de la fonction handleSubmit dans MyCompany.tsx pour gérer les appels directs

### Ajouts
- **Nouvelle page Parrainage** : Interface complète avec code unique, statistiques et partage social
- Ajout de "Mon Entreprise" dans le menu de navigation utilisateur
- Ajout de "Parrainage" dans le menu de navigation utilisateur

### Suppressions
- Suppression de l'onglet "Codes Promo" pour les utilisateurs normaux (conservé uniquement pour les admins)

### Améliorations
- Meilleure expérience utilisateur pour le flux de domiciliation complet
- Interface de parrainage moderne avec bouton de copie et partage social natif
- Navigation simplifiée et plus intuitive pour les utilisateurs

## [3.0.0] - 2026-01-20

### Schema MySQL Consolidé

#### Base de données
- **Schema unique consolidé** : `database/coffice.sql` contient maintenant TOUT
- Suppression des fichiers de migration séparés (tout intégré dans le schema principal)
- Installation simplifiée en une seule commande : `mysql -u root -p < database/coffice.sql`

#### Nouvelles fonctionnalités de base de données

**Table `users`**
- Ajout du champ `credit` (DECIMAL 10,2) pour le système de parrainage
- Crédit de 3000 DA pour le parrain et 3000 DA pour le filleul lors d'un parrainage réussi
- Index optimisé sur le champ `credit`

**Table `espaces`**
- Ajout du champ `prix_demi_journee` pour la tarification demi-journée (4h)
- Ajout du champ `prix_mois` pour les abonnements mensuels par espace
- 5 niveaux de tarification : heure, demi-journée, jour, semaine, mois

**Table `reservations`**
- Extension de l'ENUM `type_reservation` : 'heure', 'demi_journee', 'jour', 'semaine', 'mois'
- Index ajouté sur `type_reservation` pour optimisation
- Champ `participants` déjà présent et fonctionnel

**Table `domiciliations`**
- Ajout `representant_fonction` : fonction du représentant légal
- Ajout `domaine_activite` : domaine d'activité de l'entreprise
- Ajout `adresse_siege_social` : adresse du siège social actuel
- Ajout `coordonnees_fiscales` : coordonnées fiscales complètes
- Ajout `coordonnees_administratives` : coordonnées administratives
- Ajout `date_creation_entreprise` : date de création de l'entreprise

**Table `abonnements`**
- 4 nouveaux abonnements mensuels par espace :
  - Open Space Mensuel : 15 000 DA/mois
  - Hoggar Mensuel : 35 000 DA/mois
  - Atlas Mensuel : 45 000 DA/mois
  - Aurès Mensuel : 45 000 DA/mois

### Optimisations

#### Index de performance
- Index sur `users.credit`
- Index sur `espaces.type`
- Index sur `abonnements.type`
- Index sur `reservations.type_reservation`

#### Vues SQL
- `active_reservations` : mise à jour avec le champ `type_reservation`
- `daily_stats` : statistiques quotidiennes optimisées

#### Procédures stockées
- `calculate_occupancy_rate` : calcul du taux d'occupation
- `cleanup_expired_data` : nettoyage automatique des données expirées

### Données initiales

**Espaces créés (5)**
1. Open Space - 12 places (1200/jour, 20000/semaine, 15000/mois)
2. Private Booth Aurès - 2 places (6000/jour, 40000/semaine, 45000/mois)
3. Private Booth Hoggar - 2 places (6000/jour, 40000/semaine, 35000/mois)
4. Private Booth Atlas - 4 places (10000/jour, 65000/semaine, 45000/mois)
5. Salle de Réunion Premium - 12 places (2500/heure, 5000/demi-journée, 12000/jour)

**Abonnements créés (7)**
1. Solo - 14 000 DA/mois
2. Pro - 32 000 DA/mois
3. Executive - 55 000 DA/mois
4. Open Space Mensuel - 15 000 DA/mois
5. Hoggar Mensuel - 35 000 DA/mois
6. Atlas Mensuel - 45 000 DA/mois
7. Aurès Mensuel - 45 000 DA/mois

### Documentation

#### Fichiers créés/mis à jour
- `INSTALLATION.md` : Guide d'installation rapide (5 minutes)
- `database/migrations/README.md` : Documentation migrations consolidée
- `scripts/README.md` : Documentation scripts d'administration
- `README.md` : Documentation principale mise à jour
- `CHANGELOG.md` : Ce fichier

#### Scripts obsolètes supprimés
- `create_admin.php`
- `create_admin_auto.php`
- `create_admin.sql`
- `diagnostic.php`

### Sécurité et conformité

#### Base de données
- Toutes les contraintes de clés étrangères actives
- Contraintes CHECK sur les champs critiques (ex: participants > 0)
- Index optimisés pour les performances
- Charset UTF8MB4 pour support Unicode complet
- Collation unicode_ci pour recherches insensibles à la casse

#### Structure
- ENUM types pour garantir l'intégrité des données
- Valeurs par défaut sécurisées
- Timestamps automatiques (created_at, updated_at)
- Cascade DELETE approprié pour éviter les orphelins

### Compatibilité

#### MySQL
- Testé avec MySQL 8.0+
- Compatible MariaDB 10.5+
- Utilise des fonctionnalités modernes (JSON, procédures stockées, vues)

#### PHP
- Backend compatible PHP 8.1+
- API REST complète
- Validation côté serveur

#### Frontend
- React 18 + TypeScript
- Build optimisé (Vite)
- Bundle size : ~670 KB total

### Instructions de mise à niveau

#### Depuis une version antérieure

**ATTENTION : Sauvegarde obligatoire avant mise à niveau !**

```bash
# 1. Sauvegarde complète
mysqldump -u root -p coffice > backup_coffice_$(date +%Y%m%d_%H%M%S).sql

# 2. Réinitialisation (supprime toutes les données)
mysql -u root -p -e "DROP DATABASE IF EXISTS coffice;"
mysql -u root -p -e "CREATE DATABASE coffice CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# 3. Installation du nouveau schema
mysql -u root -p coffice < database/coffice.sql

# 4. Recréer le compte admin
php scripts/create_admin_simple.php

# 5. Rebuild frontend
npm run build
```

#### Nouvelle installation

```bash
# Installation simple
mysql -u root -p < database/coffice.sql
php scripts/create_admin_simple.php
npm run build
```

### Notes importantes

1. **Toutes les migrations sont intégrées** dans `database/coffice.sql`
2. **Une seule commande** pour créer la base complète
3. **Pas de migrations séparées** à appliquer
4. **Schema v3.0** prêt pour la production
5. **Données de test** incluses (espaces et abonnements)

### Prochaines étapes recommandées

1. Configurer les sauvegardes automatiques (`scripts/backup_database.sh`)
2. Configurer SSL/HTTPS en production
3. Tester le système de parrainage
4. Vérifier tous les types de réservation
5. Tester le système de domiciliation complet

---

## [2.0.0] - Versions antérieures

Voir historique Git pour les versions précédentes.
