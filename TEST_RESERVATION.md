# TEST SYSTÈME DE RÉSERVATION - COFFICE

## Problème identifié
L'erreur "Erreur lors de la création de la réservation" se produit.

## Tests effectués

### 1. Structure du flux de données

**Frontend → API**
```javascript
// src/lib/api-client.ts:454-479
async createReservation(data: {
  espaceId: string;       // camelCase
  dateDebut: string;
  dateFin: string;
  participants?: number;
  notes?: string;
  codePromo?: string;
}) {
  // Transformation en snake_case
  const apiData = {
    espace_id: data.espaceId,      // ✓ Correct
    date_debut: data.dateDebut,    // ✓ Correct
    date_fin: data.dateFin,        // ✓ Correct
    participants: data.participants || 1,
    notes: data.notes || null,
    code_promo: data.codePromo || null,
  };

  return this.request("/reservations/create.php", {
    method: "POST",
    body: JSON.stringify(apiData),
  });
}
```

**API PHP attend** (create.php:39-41)
```php
if (empty($data->espace_id)) $missingFields[] = 'espace_id';   // ✓ Match
if (empty($data->date_debut)) $missingFields[] = 'date_debut'; // ✓ Match
if (empty($data->date_fin)) $missingFields[] = 'date_fin';     // ✓ Match
```

### 2. Format des dates

**Frontend envoie** (ReservationForm.tsx:319-323)
```typescript
dateDebut: data.dateDebut.toISOString(),  // Ex: "2026-01-27T12:00:00.000Z"
dateFin: data.dateFin.toISOString(),      // Ex: "2026-01-27T14:00:00.000Z"
```

**API PHP utilise**
```php
$debut = new DateTime($data->date_debut);  // ✓ Compatible ISO 8601
$fin = new DateTime($data->date_fin);
```

### 3. Points de vérification

#### ✓ Format de données : OK
- snake_case correctement appliqué
- Dates en format ISO 8601
- Participants avec valeur par défaut

#### ⚠️ À vérifier sur le serveur

1. **Extension PDO MySQL**
   ```bash
   php -m | grep -i pdo
   # Doit afficher: pdo_mysql
   ```

2. **Connexion base de données**
   ```bash
   php -r "new PDO('mysql:host=localhost;dbname=cofficed_coffice', 'cofficed_user', 'password');"
   ```

3. **Permissions table reservations**
   ```sql
   SHOW GRANTS FOR 'cofficed_user'@'localhost';
   -- Doit avoir INSERT, SELECT sur reservations
   ```

4. **Structure table**
   ```sql
   DESCRIBE reservations;
   -- Colonnes requises : id, user_id, espace_id, date_debut, date_fin, statut, montant_total
   ```

## Solution recommandée

### Étape 1 : Activer les logs détaillés

Modifier `/api/reservations/create.php` ligne 35 :
```php
$data = json_decode(file_get_contents("php://input"));

// AJOUTER LOGS
error_log("=== RESERVATION CREATE ===");
error_log("Raw input: " . file_get_contents("php://input"));
error_log("Parsed data: " . json_encode($data));
error_log("Auth: " . json_encode($auth));
```

### Étape 2 : Vérifier les erreurs PHP

Sur le serveur :
```bash
tail -f /var/log/php_errors.log
# ou
tail -f /var/log/apache2/error.log
```

### Étape 3 : Test avec curl

```bash
# Obtenir un token d'auth
TOKEN="votre_token_jwt"

# Tester création réservation
curl -X POST https://coffice.dz/api/reservations/create.php \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "espace_id": "ID_ESPACE_EXISTANT",
    "date_debut": "2026-01-28T09:00:00.000Z",
    "date_fin": "2026-01-28T11:00:00.000Z",
    "participants": 1,
    "notes": "Test",
    "code_promo": null
  }'
```

## Erreurs possibles et solutions

### Erreur 1: "Champs requis manquants"
**Cause**: Données pas envoyées ou format JSON invalide
**Solution**: Vérifier JSON.stringify dans api-client.ts

### Erreur 2: "Espace introuvable"
**Cause**: ID espace invalide
**Solution**: Vérifier que l'ID existe dans la table `espaces`

### Erreur 3: "Cet espace n'est pas disponible"
**Cause**: Colonne `disponible` = 0
**Solution**: `UPDATE espaces SET disponible = 1 WHERE id = 'ID'`

### Erreur 4: "Conflit de réservation"
**Cause**: Dates qui se chevauchent avec une réservation existante
**Solution**: Choisir d'autres dates ou vérifier les réservations existantes

### Erreur 5: "Session expirée"
**Cause**: Token JWT invalide ou expiré
**Solution**: Se reconnecter pour obtenir un nouveau token

### Erreur 6: Erreur DB sans message
**Cause**: Extension PDO MySQL manquante
**Solution**: Installer sur le serveur: `apt-get install php-mysql && systemctl restart apache2`

## Checklist de déploiement

- [ ] PHP >= 7.4 installé
- [ ] Extension pdo_mysql activée
- [ ] Base de données accessible
- [ ] Table `espaces` a au moins 1 espace disponible
- [ ] Table `reservations` existe avec la bonne structure
- [ ] Utilisateur DB a les permissions INSERT/SELECT
- [ ] JWT_SECRET configuré dans .env
- [ ] APP_ENV=development pour voir les erreurs détaillées
- [ ] Logs PHP activés et accessibles

## Prochaines étapes

1. Sur le serveur de production, vérifier les logs d'erreur PHP
2. Activer APP_ENV=development temporairement pour voir les erreurs
3. Tester avec curl pour isoler le problème (frontend vs backend)
4. Vérifier que la table espaces contient des données
