# Changelog - Coffice Application

## [4.2.0] - 2026-01-25

### ✨ Nouvelles fonctionnalités

#### Système de parrainage complet

- Génération automatique des codes de parrainage lors de l'inscription (format: CPF + 6 caractères)
- Ajout du champ `code_parrainage` dans la table `users`
- Création automatique d'entrée dans la table `parrainages` à l'inscription
- Interface utilisateur complète pour afficher les statistiques de parrainage
- Bonus automatique de 3000 DA pour le parrain et le filleul
- Migration `006_add_code_parrainage.sql` pour les utilisateurs existants

#### Page d'abonnements

- Nouvelle page `/app/abonnements` pour les utilisateurs
- Interface responsive avec cards pour chaque abonnement
- Badge "Populaire" pour les abonnements vedettes
- Modal de confirmation avec workflow clair
- Affichage des avantages et durées en format lisible
- Intégration dans le menu de navigation

#### Améliorations de la domiciliation

- Affichage du tarif mensuel pour les demandes validées
- Meilleure présentation des informations de rejet
- Workflow plus clair avec étapes numérotées
- Messages d'aide contextuels

### 🐛 Corrections de bugs

#### Bug du parrainage (chargement infini)

- **Problème**: La page parrainage restait bloquée sur "Chargement..."
- **Cause**: Les utilisateurs n'avaient pas de code de parrainage généré
- **Solution**:
  - Ajout du champ dans la table users
  - Génération automatique à l'inscription
  - API corrigée pour retourner les données des parrainages_details
  - Conversion camelCase pour le frontend

#### API parrainage

- Correction de l'endpoint `/api/parrainages/index.php`
- Requêtes SQL optimisées pour utiliser `parrainages_details`
- Transformation des données en camelCase pour le frontend
- Meilleure gestion des cas vides

### 🔧 Améliorations techniques

#### Base de données

- Nouvelle migration pour le système de parrainage
- Indexation du champ `code_parrainage`
- Génération automatique des codes pour utilisateurs existants
- Création automatique des entrées parrainages manquantes

#### API Backend

- `register.php`: Génération du code parrainage + création entrée parrainages
- `me.php`: Retourne le code parrainage et le crédit de l'utilisateur
- `parrainages/index.php`: Requêtes optimisées avec jointures sur users

#### Frontend

- Nouveau composant `Abonnements.tsx`
- Route ajoutée dans Dashboard
- Menu navigation mis à jour avec icône CreditCard
- Meilleure gestion du state pour le parrainage

### 🗑️ Nettoyage

- Suppression complète des références à Supabase
- Suppression des fichiers FTP et GitHub Actions
- Vérification de l'absence de dépendances Supabase dans le code
- Architecture 100% MySQL

### 📝 Documentation

- README mis à jour avec la version 4.2.0
- Instructions de migration complètes
- Liste des nouveautés détaillée
- Changelog complet créé

---

## [4.1.0] - 2026-01-21

### 🚀 Performance

- Index database critiques (+70% vitesse)
- Pagination optimisée (-97% mémoire)
- Requêtes optimisées (13→1)

### 🔒 Sécurité

- Politique mot de passe forte
- Audit logging complet
- Headers HTTP sécurisés
- Protection XSS/CSRF

### 📦 Déploiement

- GitHub Actions auto-deploy
- Script deploy.sh
- Documentation simplifiée

---

## [4.0.0] - 2026-01-20

### Version initiale avec fonctionnalités complètes

- Gestion des réservations
- Dashboard admin (ERP)
- Domiciliation d'entreprises
- Système de notifications
- Codes promo
- Architecture MySQL + PHP + React
