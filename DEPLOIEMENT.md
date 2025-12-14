# Instructions de Déploiement - Coffice Coworking

## Étapes de Déploiement

### 1. Importer la Base de Données

```bash
# Créer la base de données
mysql -u votre_utilisateur -p -e "CREATE DATABASE cofficed_coffice CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# Importer le schéma complet
mysql -u votre_utilisateur -p cofficed_coffice < database/coffice.sql
```

### 2. Créer le Compte Administrateur

**Option A - Via Terminal cPanel (Recommandé)**:

Si vous avez accès au Terminal dans cPanel:
1. Ouvrez **Terminal** dans cPanel
2. Naviguez vers votre dossier: `cd public_html` (ou le nom de votre dossier)
3. Exécutez: `php scripts/create_admin_simple.php`

**Option B - Via Navigateur (Si pas de Terminal)**:

1. Uploadez tous les fichiers sur votre hébergement
2. Accédez à: `http://votre-domaine.com/scripts/create_admin_web.php`
3. Le script créera l'administrateur automatiquement
4. **⚠️ IMPORTANT**: Supprimez le fichier `scripts/create_admin_web.php` après utilisation

**Option C - Via phpMyAdmin**:

Si les deux options ci-dessus ne fonctionnent pas:
1. Ouvrez phpMyAdmin dans cPanel
2. Sélectionnez votre base de données
3. Allez dans l'onglet SQL
4. Collez ce script (voir `scripts/create_admin.sql` si besoin)

Le script créera un compte admin avec:
- **Email**: admin@coffice.dz
- **Mot de passe**: Admin@Coffice2025

**⚠️ IMPORTANT**: Changez le mot de passe après la première connexion!

### 3. Vérifier la Configuration

Assurez-vous que le fichier `.env` contient les bonnes informations de connexion MySQL:

```
DB_HOST=localhost
DB_PORT=3306
DB_NAME=votre_base
DB_USER=votre_utilisateur
DB_PASSWORD=votre_mot_de_passe
DB_CHARSET=utf8mb4
JWT_SECRET=votre_secret_jwt_securise
```

### 4. Tester le Système de Réservation

1. Connectez-vous avec le compte admin
2. Créez quelques espaces de coworking
3. Testez la création d'une réservation:
   - Sélectionnez un espace
   - Choisissez des dates
   - Définissez le nombre de participants
   - Appliquez un code promo (optionnel)
   - Confirmez la réservation

## Sécurité des Réservations

Le système de réservation est maintenant totalement sécurisé avec:

### Protection contre les Erreurs

1. **Validation côté client**:
   - Vérification des dates (début < fin)
   - Date de début dans le futur
   - Durée minimale de 1 heure
   - Capacité de l'espace respectée
   - Nombre de participants valide

2. **Validation côté serveur**:
   - Toutes les validations côté client sont répétées
   - Calcul du montant côté serveur (ne fait pas confiance au client)
   - Vérification de la disponibilité de l'espace
   - Gestion des codes promo sécurisée

3. **Protection contre les Race Conditions**:
   - Utilisation de transactions SQL
   - Verrouillage avec `FOR UPDATE` sur les réservations
   - Verrouillage des codes promo pendant leur utilisation

4. **Gestion des Erreurs**:
   - Messages d'erreur clairs pour l'utilisateur
   - Logs des erreurs côté serveur
   - Rollback automatique en cas d'erreur

## Fonctionnalités de Réservation

Le système gère:
- Sélection d'espaces disponibles
- Calendrier avec dates et heures
- Nombre de participants avec validation de capacité
- Calcul automatique des tarifs (heure/jour/semaine)
- Application de codes promo
- Réductions automatiques
- Validation complète avant confirmation

## Support

Pour toute question ou problème:
1. Vérifiez les logs PHP dans `/tmp/` ou votre dossier de logs
2. Consultez la console du navigateur pour les erreurs frontend
3. Vérifiez que la migration SQL a été appliquée correctement
