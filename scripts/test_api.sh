#!/bin/bash

# Script de test complet de l'API Coffice
# Usage: ./scripts/test_api.sh [URL_API]
# Exemple: ./scripts/test_api.sh https://coffice.dz/api

# Configuration
API_URL="${1:-http://localhost:8080/api}"
TIMESTAMP=$(date +%s)
TEST_EMAIL="test_${TIMESTAMP}@coffice.dz"
TEST_PASSWORD="Test@123456"
ADMIN_EMAIL="admin@coffice.dz"
ADMIN_PASSWORD="Admin@Coffice2025"

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

# Compteurs
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# Variables pour stocker les données
USER_TOKEN=""
ADMIN_TOKEN=""
USER_ID=""
ESPACE_ID=""
RESERVATION_ID=""
DOMICILIATION_ID=""

# Fonction pour afficher les résultats
log_test() {
    local name="$1"
    local passed="$2"
    local error="$3"

    TOTAL_TESTS=$((TOTAL_TESTS + 1))

    if [ "$passed" = "true" ]; then
        PASSED_TESTS=$((PASSED_TESTS + 1))
        echo -e "${GREEN}✓ ${name}${NC}"
    else
        FAILED_TESTS=$((FAILED_TESTS + 1))
        echo -e "${RED}✗ ${name}${NC}"
        if [ -n "$error" ]; then
            echo -e "${RED}  Erreur: ${error}${NC}"
        fi
    fi
}

# Fonction pour faire une requête API
api_request() {
    local method="$1"
    local endpoint="$2"
    local data="$3"
    local token="$4"

    local url="${API_URL}${endpoint}"
    local headers=(-H "Content-Type: application/json")

    if [ -n "$token" ]; then
        headers+=(-H "Authorization: Bearer ${token}")
    fi

    if [ "$method" = "GET" ]; then
        curl -s -X GET "${headers[@]}" "$url"
    else
        curl -s -X "$method" "${headers[@]}" -d "$data" "$url"
    fi
}

# Début des tests
echo -e "${BLUE}╔═══════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   COFFICE - Test Complet de l'API                     ║${NC}"
echo -e "${BLUE}╚═══════════════════════════════════════════════════════╝${NC}"
echo -e "\n${YELLOW}URL API: ${API_URL}${NC}"
echo -e "${YELLOW}Date: $(date '+%d/%m/%Y %H:%M:%S')${NC}\n"

# TESTS AUTHENTIFICATION
echo -e "\n${CYAN}=== TESTS AUTHENTIFICATION ===${NC}"

# Test 1: Inscription utilisateur
response=$(api_request "POST" "/auth/register.php" "{
    \"email\": \"${TEST_EMAIL}\",
    \"password\": \"${TEST_PASSWORD}\",
    \"prenom\": \"Test\",
    \"nom\": \"User\",
    \"telephone\": \"0555123456\"
}")

if echo "$response" | grep -q '"success":true'; then
    USER_ID=$(echo "$response" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
    log_test "Inscription utilisateur" "true"
else
    log_test "Inscription utilisateur" "false" "$response"
fi

# Test 2: Connexion utilisateur
response=$(api_request "POST" "/auth/login.php" "{
    \"email\": \"${TEST_EMAIL}\",
    \"password\": \"${TEST_PASSWORD}\"
}")

if echo "$response" | grep -q '"token"'; then
    USER_TOKEN=$(echo "$response" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
    log_test "Connexion utilisateur" "true"
else
    log_test "Connexion utilisateur" "false" "$response"
fi

# Test 3: Récupération profil utilisateur
if [ -n "$USER_TOKEN" ]; then
    response=$(api_request "GET" "/auth/me.php" "" "$USER_TOKEN")

    if echo "$response" | grep -q '"success":true'; then
        log_test "Récupération profil utilisateur" "true"
    else
        log_test "Récupération profil utilisateur" "false"
    fi
fi

# Test 4: Connexion admin
response=$(api_request "POST" "/auth/login.php" "{
    \"email\": \"${ADMIN_EMAIL}\",
    \"password\": \"${ADMIN_PASSWORD}\"
}")

if echo "$response" | grep -q '"token"'; then
    ADMIN_TOKEN=$(echo "$response" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
    log_test "Connexion administrateur" "true"
else
    log_test "Connexion administrateur" "false" "$response"
fi

# Test 5: Déconnexion
if [ -n "$USER_TOKEN" ]; then
    response=$(api_request "POST" "/auth/logout.php" "" "$USER_TOKEN")

    if echo "$response" | grep -q '"success":true'; then
        log_test "Déconnexion" "true"
    else
        log_test "Déconnexion" "false"
    fi

    # Reconnecter pour les tests suivants
    response=$(api_request "POST" "/auth/login.php" "{
        \"email\": \"${TEST_EMAIL}\",
        \"password\": \"${TEST_PASSWORD}\"
    }")
    USER_TOKEN=$(echo "$response" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
fi

# TESTS GESTION DES ESPACES
echo -e "\n${CYAN}=== TESTS GESTION DES ESPACES ===${NC}"

# Test 6: Liste des espaces (public)
response=$(api_request "GET" "/espaces/index.php")

if echo "$response" | grep -q '"success":true'; then
    ESPACE_ID=$(echo "$response" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
    log_test "Liste des espaces (public)" "true"
else
    log_test "Liste des espaces (public)" "false"
fi

# Test 7: Détails d'un espace
if [ -n "$ESPACE_ID" ]; then
    response=$(api_request "GET" "/espaces/show.php?id=${ESPACE_ID}")

    if echo "$response" | grep -q '"success":true'; then
        log_test "Détails d'un espace" "true"
    else
        log_test "Détails d'un espace" "false"
    fi
fi

# Test 8: Création espace (admin)
if [ -n "$ADMIN_TOKEN" ]; then
    response=$(api_request "POST" "/espaces/create.php" "{
        \"nom\": \"Espace Test ${TIMESTAMP}\",
        \"type\": \"bureau\",
        \"capacite\": 4,
        \"prixHeure\": 2000,
        \"prixJour\": 10000,
        \"description\": \"Espace de test\",
        \"statut\": \"disponible\"
    }" "$ADMIN_TOKEN")

    if echo "$response" | grep -q '"success":true'; then
        log_test "Création d'un espace (admin)" "true"
    else
        log_test "Création d'un espace (admin)" "false"
    fi
fi

# TESTS RÉSERVATIONS
echo -e "\n${CYAN}=== TESTS RÉSERVATIONS ===${NC}"

# Test 9: Créer une réservation
if [ -n "$USER_TOKEN" ] && [ -n "$ESPACE_ID" ]; then
    tomorrow=$(date -d "tomorrow 09:00:00" -Iseconds 2>/dev/null || date -v+1d -u +"%Y-%m-%dT09:00:00Z")
    end_date=$(date -d "tomorrow 17:00:00" -Iseconds 2>/dev/null || date -v+1d -u +"%Y-%m-%dT17:00:00Z")

    response=$(api_request "POST" "/reservations/create.php" "{
        \"espaceId\": \"${ESPACE_ID}\",
        \"dateDebut\": \"${tomorrow}\",
        \"dateFin\": \"${end_date}\",
        \"typeReservation\": \"jour\",
        \"notes\": \"Réservation de test\"
    }" "$USER_TOKEN")

    if echo "$response" | grep -q '"success":true'; then
        RESERVATION_ID=$(echo "$response" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
        log_test "Création d'une réservation" "true"
    else
        log_test "Création d'une réservation" "false" "$response"
    fi
fi

# Test 10: Liste des réservations utilisateur
if [ -n "$USER_TOKEN" ]; then
    response=$(api_request "GET" "/reservations/index.php" "" "$USER_TOKEN")

    if echo "$response" | grep -q '"success":true'; then
        log_test "Liste des réservations utilisateur" "true"
    else
        log_test "Liste des réservations utilisateur" "false"
    fi
fi

# Test 11: Détails d'une réservation
if [ -n "$USER_TOKEN" ] && [ -n "$RESERVATION_ID" ]; then
    response=$(api_request "GET" "/reservations/show.php?id=${RESERVATION_ID}" "" "$USER_TOKEN")

    if echo "$response" | grep -q '"success":true'; then
        log_test "Détails d'une réservation" "true"
    else
        log_test "Détails d'une réservation" "false"
    fi
fi

# Test 12: Annulation d'une réservation
if [ -n "$USER_TOKEN" ] && [ -n "$RESERVATION_ID" ]; then
    response=$(api_request "POST" "/reservations/cancel.php?id=${RESERVATION_ID}" "" "$USER_TOKEN")

    if echo "$response" | grep -q '"success":true'; then
        log_test "Annulation d'une réservation" "true"
    else
        log_test "Annulation d'une réservation" "false"
    fi
fi

# TESTS DOMICILIATION
echo -e "\n${CYAN}=== TESTS DOMICILIATION ===${NC}"

# Test 13: Création demande domiciliation
if [ -n "$USER_TOKEN" ] && [ -n "$USER_ID" ]; then
    response=$(api_request "POST" "/domiciliations/create.php" "{
        \"userId\": \"${USER_ID}\",
        \"raisonSociale\": \"Test Company SARL\",
        \"formeJuridique\": \"SARL\",
        \"nif\": \"099012345678901\",
        \"representantLegal\": {
            \"nom\": \"User\",
            \"prenom\": \"Test\",
            \"email\": \"${TEST_EMAIL}\",
            \"telephone\": \"0555123456\"
        }
    }" "$USER_TOKEN")

    if echo "$response" | grep -q '"success":true'; then
        DOMICILIATION_ID=$(echo "$response" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
        log_test "Création demande domiciliation" "true"
    else
        log_test "Création demande domiciliation" "false" "$response"
    fi
fi

# Test 14: Liste des demandes (user)
if [ -n "$USER_TOKEN" ]; then
    response=$(api_request "GET" "/domiciliations/user.php" "" "$USER_TOKEN")

    if echo "$response" | grep -q '"success":true'; then
        log_test "Liste demandes domiciliation (user)" "true"
    else
        log_test "Liste demandes domiciliation (user)" "false"
    fi
fi

# Test 15: Validation domiciliation (admin)
if [ -n "$ADMIN_TOKEN" ] && [ -n "$DOMICILIATION_ID" ]; then
    response=$(api_request "POST" "/domiciliations/validate.php?id=${DOMICILIATION_ID}" "" "$ADMIN_TOKEN")

    if echo "$response" | grep -q '"success":true'; then
        log_test "Validation domiciliation (admin)" "true"
    else
        log_test "Validation domiciliation (admin)" "false"
    fi
fi

# TESTS CODES PROMO
echo -e "\n${CYAN}=== TESTS CODES PROMO ===${NC}"

# Test 16: Création code promo
if [ -n "$ADMIN_TOKEN" ]; then
    today=$(date +%Y-%m-%d)
    future=$(date -d "+30 days" +%Y-%m-%d 2>/dev/null || date -v+30d +%Y-%m-%d)

    response=$(api_request "POST" "/codes-promo/create.php" "{
        \"code\": \"TEST${TIMESTAMP}\",
        \"description\": \"Code promo de test\",
        \"typeRemise\": \"pourcentage\",
        \"valeurRemise\": 20,
        \"dateDebut\": \"${today}\",
        \"dateFin\": \"${future}\",
        \"utilisationsMax\": 100,
        \"actif\": true
    }" "$ADMIN_TOKEN")

    if echo "$response" | grep -q '"success":true'; then
        log_test "Création code promo (admin)" "true"
    else
        log_test "Création code promo (admin)" "false"
    fi
fi

# Test 17: Liste codes promo
if [ -n "$ADMIN_TOKEN" ]; then
    response=$(api_request "GET" "/codes-promo/index.php" "" "$ADMIN_TOKEN")

    if echo "$response" | grep -q '"success":true'; then
        log_test "Liste des codes promo (admin)" "true"
    else
        log_test "Liste des codes promo (admin)" "false"
    fi
fi

# TESTS GESTION UTILISATEURS
echo -e "\n${CYAN}=== TESTS GESTION UTILISATEURS ===${NC}"

# Test 18: Liste utilisateurs (admin)
if [ -n "$ADMIN_TOKEN" ]; then
    response=$(api_request "GET" "/users/index.php" "" "$ADMIN_TOKEN")

    if echo "$response" | grep -q '"success":true'; then
        log_test "Liste des utilisateurs (admin)" "true"
    else
        log_test "Liste des utilisateurs (admin)" "false"
    fi
fi

# Test 19: Détails utilisateur
if [ -n "$ADMIN_TOKEN" ] && [ -n "$USER_ID" ]; then
    response=$(api_request "GET" "/users/show.php?id=${USER_ID}" "" "$ADMIN_TOKEN")

    if echo "$response" | grep -q '"success":true'; then
        log_test "Détails d'un utilisateur (admin)" "true"
    else
        log_test "Détails d'un utilisateur (admin)" "false"
    fi
fi

# Test 20: Statistiques admin
if [ -n "$ADMIN_TOKEN" ]; then
    response=$(api_request "GET" "/admin/stats.php" "" "$ADMIN_TOKEN")

    if echo "$response" | grep -q '"success":true'; then
        log_test "Statistiques admin" "true"
    else
        log_test "Statistiques admin" "false"
    fi
fi

# Test 21: Revenus admin
if [ -n "$ADMIN_TOKEN" ]; then
    response=$(api_request "GET" "/admin/revenue.php" "" "$ADMIN_TOKEN")

    if echo "$response" | grep -q '"success":true'; then
        log_test "Revenus admin" "true"
    else
        log_test "Revenus admin" "false"
    fi
fi

# TESTS NOTIFICATIONS
echo -e "\n${CYAN}=== TESTS NOTIFICATIONS ===${NC}"

# Test 22: Liste notifications
if [ -n "$USER_TOKEN" ]; then
    response=$(api_request "GET" "/notifications/index.php" "" "$USER_TOKEN")

    if echo "$response" | grep -q '"success":true'; then
        log_test "Liste des notifications" "true"
    else
        log_test "Liste des notifications" "false"
    fi
fi

# Test 23: Marquer toutes comme lues
if [ -n "$USER_TOKEN" ]; then
    response=$(api_request "POST" "/notifications/read-all.php" "" "$USER_TOKEN")

    if echo "$response" | grep -q '"success":true'; then
        log_test "Marquer notifications comme lues" "true"
    else
        log_test "Marquer notifications comme lues" "false"
    fi
fi

# TESTS PARRAINAGE
echo -e "\n${CYAN}=== TESTS PARRAINAGE ===${NC}"

# Test 24: Liste parrainages
if [ -n "$USER_TOKEN" ]; then
    response=$(api_request "GET" "/parrainages/index.php" "" "$USER_TOKEN")

    if echo "$response" | grep -q '"success":true'; then
        log_test "Liste des parrainages" "true"
    else
        log_test "Liste des parrainages" "false"
    fi
fi

# RÉSUMÉ FINAL
echo -e "\n${BLUE}╔═══════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║                   RÉSUMÉ DES TESTS                      ║${NC}"
echo -e "${BLUE}╚═══════════════════════════════════════════════════════╝${NC}"
echo -e "\n${CYAN}Total de tests: ${TOTAL_TESTS}${NC}"
echo -e "${GREEN}Tests réussis: ${PASSED_TESTS}${NC}"
echo -e "${RED}Tests échoués: ${FAILED_TESTS}${NC}"

if [ $TOTAL_TESTS -gt 0 ]; then
    SUCCESS_RATE=$(awk "BEGIN {printf \"%.2f\", ($PASSED_TESTS/$TOTAL_TESTS)*100}")
    echo -e "${CYAN}Taux de réussite: ${SUCCESS_RATE}%${NC}\n"

    if [ $FAILED_TESTS -eq 0 ]; then
        echo -e "${GREEN}✅ TOUS LES TESTS SONT PASSÉS !${NC}"
        exit 0
    else
        echo -e "${YELLOW}⚠️  ${FAILED_TESTS} test(s) ont échoué${NC}"
        exit 1
    fi
else
    echo -e "${RED}❌ Aucun test exécuté${NC}"
    exit 1
fi
