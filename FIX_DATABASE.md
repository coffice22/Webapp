# 🔧 Correctif Base de Données

## Problème Identifié

La table `reservations` manque la colonne `rappel_envoye` nécessaire pour le système de rappels automatiques.

## Solution

### Option 1: Script MySQL Direct (Recommandé)

```bash
mysql -u cofficed_user -p cofficed_coffice
```

Puis exécuter:

```sql
ALTER TABLE reservations
ADD COLUMN rappel_envoye TINYINT(1) DEFAULT 0 COMMENT 'Rappel email envoyé (0=non, 1=oui)'
AFTER participants;

CREATE INDEX idx_rappel_envoye ON reservations(rappel_envoye, date_debut, statut);
```

### Option 2: Script Shell Automatique

```bash
chmod +x INSTALL_MIGRATION.sh
./INSTALL_MIGRATION.sh
```

### Option 3: Fichier SQL Direct

```bash
mysql -u cofficed_user -p cofficed_coffice < database/migrations/003_add_rappel_envoye.sql
```

## Vérification

Pour vérifier que la migration a fonctionné:

```sql
DESCRIBE reservations;
```

Vous devriez voir la colonne `rappel_envoye` dans la liste.

## Impact

Cette colonne permet au script `scripts/send_reminders.php` de:

- Ne pas envoyer plusieurs fois le même rappel
- Optimiser les requêtes avec un index dédié
- Tracer les rappels envoyés

## Test

Après avoir appliqué la migration, tester le script:

```bash
php scripts/send_reminders.php
```

Le script devrait s'exécuter sans erreur et afficher les réservations trouvées pour le lendemain.
