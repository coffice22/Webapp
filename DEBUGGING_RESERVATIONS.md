# Guide de Débogage - Problème de Création de Réservations

## Problème Identifié

La création de réservations échoue avec le message "Erreur lors de la création de la réservation".

## Causes Possibles

1. **Les espaces n'existent pas dans la base de données**
2. **UUID de l'espace invalide ou inexistant**
3. **Problème de conversion de dates**
4. **Conflit de réservation**

## Étapes de Débogage

### 1. Vérifier les Espaces dans la Base

Exécutez le script d'initialisation :

```bash
php scripts/init_espaces.php
```

Ce script va :
- Vérifier si des espaces existent
- Afficher les UUIDs des espaces existants
- Créer les espaces s'ils n'existent pas

### 2. Consulter les Logs PHP

Les logs ont été ajoutés pour déboguer. Consultez les logs PHP de votre serveur :

**Pour Apache :**
```bash
tail -f /var/log/apache2/error.log
```

**Pour cPanel :**
- Connectez-vous à cPanel
- Allez dans "Erreurs" ou "Error Log"
- Recherchez les logs récents avec "RESERVATION CREATE REQUEST"

**Logs à surveiller :**
```
=== RESERVATION CREATE REQUEST ===
Raw input: {...}
Decoded data: {...}
User ID: ...
Checking espace with ID: ...
Espace found: ... (...)
```

### 3. Tester l'Endpoint Espaces

Testez si les espaces sont correctement retournés par l'API :

```bash
curl https://votredomaine.com/api/espaces/index.php
```

Ou via le navigateur :
```
https://votredomaine.com/api/debug/test-espaces.php
```

### 4. Vérifier la Base de Données Manuellement

Connectez-vous à phpMyAdmin et exécutez :

```sql
-- Voir tous les espaces
SELECT id, nom, type, disponible FROM espaces;

-- Voir les réservations existantes
SELECT * FROM reservations ORDER BY created_at DESC LIMIT 10;

-- Vérifier s'il y a des conflits
SELECT
    e.nom,
    COUNT(r.id) as nb_reservations
FROM espaces e
LEFT JOIN reservations r ON e.id = r.espace_id
WHERE r.statut NOT IN ('annulee', 'terminee')
GROUP BY e.id, e.nom;
```

### 5. Vérifications Frontend

Ouvrez la console du navigateur (F12) et vérifiez :

1. **Les données envoyées** :
   - Cliquez sur "Confirmer" dans le formulaire de réservation
   - Regardez la section "Debug Info" qui s'affiche
   - Copiez le JSON et vérifiez les valeurs

2. **Les requêtes réseau** :
   - Onglet "Network" > "XHR"
   - Trouvez la requête vers `reservations/create.php`
   - Regardez la réponse du serveur

## Solutions

### Solution 1 : Initialiser les Espaces

Si les espaces n'existent pas :

```bash
cd /path/to/coffice
php scripts/init_espaces.php
```

### Solution 2 : Réinitialiser la Base

Si la base est corrompue, réexécutez le script SQL :

```bash
mysql -u votreuser -p votrebase < database/coffice.sql
```

⚠️ **Attention** : Cela va supprimer toutes les données existantes !

### Solution 3 : Vérifier le Format des Dates

Le frontend envoie les dates au format ISO8601 :
```
2026-01-27T14:00:51.772Z
```

Le PHP les convertit en :
```
2026-01-27 14:00:51
```

Vérifiez dans les logs si la conversion fonctionne correctement.

### Solution 4 : Vérifier les Permissions MySQL

Assurez-vous que l'utilisateur MySQL a les bonnes permissions :

```sql
GRANT SELECT, INSERT, UPDATE, DELETE ON cofficed_coffice.* TO 'cofficed_user'@'localhost';
FLUSH PRIVILEGES;
```

## Informations de Debug Ajoutées

Les modifications suivantes ont été apportées à `api/reservations/create.php` :

1. ✅ Log de la requête brute reçue
2. ✅ Log de l'ID utilisateur
3. ✅ Log de l'ID espace recherché
4. ✅ Log si l'espace est trouvé ou non
5. ✅ Liste des espaces disponibles en cas d'erreur
6. ✅ Log des données complètes avant INSERT
7. ✅ Log des erreurs PDO détaillées

## Prochaines Étapes

1. Exécutez `php scripts/init_espaces.php`
2. Essayez de créer une réservation
3. Consultez les logs PHP
4. Partagez le contenu des logs si le problème persiste

## Support

Si le problème persiste après avoir suivi ces étapes :

1. Copiez le contenu de "Debug Info" depuis l'interface
2. Copiez les logs PHP pertinents
3. Vérifiez la sortie de `php scripts/init_espaces.php`
4. Partagez ces informations pour obtenir de l'aide
