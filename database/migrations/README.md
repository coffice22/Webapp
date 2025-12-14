# Migrations de Base de Données

## Migration de correction de structure (fix_structure_prod.sql)

Cette migration corrige les problèmes détectés dans la structure de la base de données en production.

### Problèmes corrigés :
1. ✅ Conversion du charset de `latin1` vers `utf8mb4` (support complet Unicode)
2. ✅ Assure la compatibilité des noms de colonnes
3. ✅ Ajoute les index manquants pour améliorer les performances
4. ✅ Convertit toutes les tables vers le moteur InnoDB
5. ✅ Optimise les tables après conversion

### Comment appliquer la migration :

#### Option 1 : Via phpMyAdmin
1. Connectez-vous à phpMyAdmin
2. Sélectionnez la base `cofficed_coffice`
3. Allez dans l'onglet "SQL"
4. Copiez-collez le contenu de `fix_structure_prod.sql`
5. Cliquez sur "Exécuter"

#### Option 2 : Via ligne de commande
```bash
mysql -u cofficed_user -p cofficed_coffice < database/migrations/fix_structure_prod.sql
```

#### Option 3 : Via PHP
```bash
php -r "
\$db = new PDO('mysql:host=localhost;dbname=cofficed_coffice', 'cofficed_user', 'votre_password');
\$sql = file_get_contents('database/migrations/fix_structure_prod.sql');
\$db->exec(\$sql);
echo 'Migration appliquée avec succès!';
"
```

### Vérification après migration :

Relancez le script de diagnostic pour vérifier que tout est correct :
```bash
php scripts/diagnostic.php
```

### Notes importantes :
- ⚠️ **Faites une sauvegarde** de la base avant d'appliquer la migration
- La migration utilise `ALTER TABLE` qui peut prendre du temps selon la taille des tables
- Aucune donnée ne sera perdue pendant la conversion
- La migration est idempotente (peut être exécutée plusieurs fois sans problème)

### Backup avant migration :
```bash
mysqldump -u cofficed_user -p cofficed_coffice > backup_$(date +%Y%m%d_%H%M%S).sql
```
