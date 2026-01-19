# Migrations Base de Données

## Migration Principale

### 001_coffice_complete.sql
Migration unique et consolidée contenant toutes les modifications nécessaires pour la version finale de Coffice.

**Inclut :**
- Ajout des prix demi-journée et mensuels aux espaces
- Ajout du système de crédit utilisateur pour les parrainages
- Champs complets pour les domiciliations
- Nouveaux types de réservation (demi_journee, mois)
- Abonnements mensuels par espace (Open Space, Hoggar, Atlas, Aurès)
- Index pour optimisation des performances

## Application de la Migration

### Première installation
```bash
# 1. Créer et importer le schéma principal
mysql -u root -p < database/coffice.sql

# 2. Appliquer la migration complète
mysql -u root -p coffice < database/migrations/001_coffice_complete.sql
```

### Installation déjà existante
```bash
# Appliquer uniquement la migration
mysql -u root -p coffice < database/migrations/001_coffice_complete.sql
```

## Vérification

Après l'application, vérifier que :
1. Tous les espaces ont un `prix_mois` défini
2. Les nouveaux abonnements mensuels sont créés
3. Les index sont en place

```sql
-- Vérifier les espaces
SELECT nom, type, prix_jour, prix_mois FROM espaces;

-- Vérifier les abonnements mensuels
SELECT nom, type, prix FROM abonnements WHERE type LIKE '%_monthly';

-- Vérifier les index
SHOW INDEX FROM espaces;
SHOW INDEX FROM abonnements;
```

## Notes Importantes

- Cette migration est **idempotente** : elle peut être exécutée plusieurs fois sans erreur
- Utilise `ADD COLUMN IF NOT EXISTS` pour éviter les doublons
- Utilise `ON DUPLICATE KEY UPDATE` pour les insertions sécurisées
- Tous les changements sont compatibles avec les données existantes
