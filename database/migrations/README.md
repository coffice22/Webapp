# Migrations Base de Données

## Information Importante

**Toutes les migrations ont été consolidées dans le schéma principal `database/coffice.sql`.**

Ce fichier contient la version complète et finale de la base de données avec toutes les modifications intégrées :
- Tous les champs nécessaires
- Tous les index optimisés
- Toutes les relations et contraintes
- Les données initiales (espaces et abonnements)

## Installation

### Nouvelle installation

```bash
mysql -u root -p < database/coffice.sql
```

Cette commande unique crée la base de données complète, prête à l'emploi.

### Mise à jour depuis une version antérieure

Si vous avez déjà une base de données Coffice et souhaitez mettre à jour :

```bash
# Sauvegarde obligatoire avant toute modification
mysqldump -u root -p coffice > backup_coffice_$(date +%Y%m%d_%H%M%S).sql

# Option 1: Réinitialisation complète (ATTENTION: supprime toutes les données)
mysql -u root -p -e "DROP DATABASE IF EXISTS coffice; CREATE DATABASE coffice CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
mysql -u root -p coffice < database/coffice.sql

# Option 2: Migration manuelle des données
# Contactez l'administrateur pour un script de migration personnalisé
```

## Structure de la Base

### Tables Principales
- `users` - Utilisateurs avec crédit parrainage
- `espaces` - Espaces avec tarification complète (heure, demi-journée, jour, semaine, mois)
- `reservations` - Réservations avec tous types (heure, demi_journee, jour, semaine, mois)
- `abonnements` - Abonnements et formules
- `domiciliations` - Domiciliations avec informations complètes

### Tables Relations
- `abonnements_utilisateurs` - Abonnements actifs
- `parrainages` - Système de parrainage
- `codes_promo` - Codes promotionnels
- `transactions` - Historique paiements

### Tables Support
- `notifications` - Notifications utilisateurs
- `documents_uploads` - Documents téléchargés
- `logs`, `activites`, `rate_limits`, `csrf_tokens` - Sécurité et audit

## Fonctionnalités Intégrées

### Tarification Multiple
- Prix à l'heure
- Prix demi-journée (4h)
- Prix à la journée
- Prix à la semaine
- Prix au mois

### Système de Crédit
- Crédit utilisateur pour parrainages (3000 DA par filleul)
- Crédit pour bonus et promotions

### Domiciliation Complète
- Informations entreprise complètes
- Coordonnées fiscales et administratives
- Représentant légal avec fonction
- Documents justificatifs

### Sécurité
- Rate limiting
- CSRF protection
- Logs d'activité
- Audit trail complet

## Vérification Post-Installation

```sql
-- Vérifier les espaces
SELECT nom, type, prix_jour, prix_mois FROM espaces;

-- Vérifier les abonnements
SELECT nom, type, prix FROM abonnements ORDER BY ordre;

-- Vérifier les index
SHOW INDEX FROM espaces;
SHOW INDEX FROM reservations;

-- Statistiques
SELECT
  (SELECT COUNT(*) FROM espaces) as total_espaces,
  (SELECT COUNT(*) FROM abonnements) as total_abonnements,
  (SELECT COUNT(*) FROM users) as total_users;
```

## Notes de Version

### v3.0 (2026-01-20)
- Schema consolidé unique
- Tous les champs intégrés
- Tarification complète (5 niveaux)
- Types de réservation étendus
- Système de crédit parrainage
- Domiciliation complète
- Index optimisés
- Prêt pour la production

## Support

Pour toute question sur la structure de la base de données :
- Consultez le fichier principal : `database/coffice.sql`
- Documentation technique : Commentaires SQL intégrés
- Scripts admin : `scripts/README.md`
