@echo off
setlocal EnableDelayedExpansion

REM Script de test complet de l'API Coffice pour Windows
REM Usage: scripts\test_api.bat [URL_API]
REM Exemple: scripts\test_api.bat https://coffice.dz/api

REM Configuration
set "API_URL=%~1"
if "%API_URL%"=="" set "API_URL=http://localhost:8080/api"

REM Générer un timestamp
for /f "tokens=2 delims==" %%I in ('wmic os get localdatetime /value') do set datetime=%%I
set TIMESTAMP=%datetime:~0,14%

set "TEST_EMAIL=test_%TIMESTAMP%@coffice.dz"
set "TEST_PASSWORD=Test@123456"
set "ADMIN_EMAIL=admin@coffice.dz"
set "ADMIN_PASSWORD=Admin@Coffice2025"

REM Compteurs
set /a TOTAL_TESTS=0
set /a PASSED_TESTS=0
set /a FAILED_TESTS=0

REM Variables
set "USER_TOKEN="
set "ADMIN_TOKEN="
set "USER_ID="
set "ESPACE_ID="

echo ╔═══════════════════════════════════════════════════════╗
echo ║   COFFICE - Test Complet de l'API                     ║
echo ╚═══════════════════════════════════════════════════════╝
echo.
echo URL API: %API_URL%
echo Date: %date% %time%
echo.

REM TESTS AUTHENTIFICATION
echo.
echo === TESTS AUTHENTIFICATION ===

REM Test 1: Inscription utilisateur
curl -s -X POST "%API_URL%/auth/register.php" ^
    -H "Content-Type: application/json" ^
    -d "{\"email\":\"%TEST_EMAIL%\",\"password\":\"%TEST_PASSWORD%\",\"prenom\":\"Test\",\"nom\":\"User\",\"telephone\":\"0555123456\"}" > response.tmp

findstr /C:"\"success\":true" response.tmp >nul
if %errorlevel%==0 (
    echo [OK] Inscription utilisateur
    set /a PASSED_TESTS+=1
) else (
    echo [ERREUR] Inscription utilisateur
    set /a FAILED_TESTS+=1
)
set /a TOTAL_TESTS+=1

REM Test 2: Connexion utilisateur
curl -s -X POST "%API_URL%/auth/login.php" ^
    -H "Content-Type: application/json" ^
    -d "{\"email\":\"%TEST_EMAIL%\",\"password\":\"%TEST_PASSWORD%\"}" > response.tmp

findstr /C:"\"token\"" response.tmp >nul
if %errorlevel%==0 (
    echo [OK] Connexion utilisateur
    set /a PASSED_TESTS+=1
    for /f "tokens=2 delims=:," %%a in ('findstr /C:"\"token\"" response.tmp') do (
        set "USER_TOKEN=%%a"
        set "USER_TOKEN=!USER_TOKEN:~1,-1!"
    )
) else (
    echo [ERREUR] Connexion utilisateur
    set /a FAILED_TESTS+=1
)
set /a TOTAL_TESTS+=1

REM Test 3: Connexion admin
curl -s -X POST "%API_URL%/auth/login.php" ^
    -H "Content-Type: application/json" ^
    -d "{\"email\":\"%ADMIN_EMAIL%\",\"password\":\"%ADMIN_PASSWORD%\"}" > response.tmp

findstr /C:"\"token\"" response.tmp >nul
if %errorlevel%==0 (
    echo [OK] Connexion administrateur
    set /a PASSED_TESTS+=1
    for /f "tokens=2 delims=:," %%a in ('findstr /C:"\"token\"" response.tmp') do (
        set "ADMIN_TOKEN=%%a"
        set "ADMIN_TOKEN=!ADMIN_TOKEN:~1,-1!"
    )
) else (
    echo [ERREUR] Connexion administrateur
    set /a FAILED_TESTS+=1
)
set /a TOTAL_TESTS+=1

REM TESTS GESTION DES ESPACES
echo.
echo === TESTS GESTION DES ESPACES ===

REM Test 4: Liste des espaces
curl -s "%API_URL%/espaces/index.php" > response.tmp

findstr /C:"\"success\":true" response.tmp >nul
if %errorlevel%==0 (
    echo [OK] Liste des espaces ^(public^)
    set /a PASSED_TESTS+=1
) else (
    echo [ERREUR] Liste des espaces ^(public^)
    set /a FAILED_TESTS+=1
)
set /a TOTAL_TESTS+=1

REM TESTS RÉSERVATIONS
echo.
echo === TESTS RÉSERVATIONS ===

if not "%USER_TOKEN%"=="" (
    echo Test de creation de reservation avec token utilisateur...
    REM On skip pour l'instant car le format de date est complexe en batch
    echo [SKIP] Creation de reservation ^(format date complexe en batch^)
)

REM TESTS ADMIN
echo.
echo === TESTS ADMIN ===

if not "%ADMIN_TOKEN%"=="" (
    REM Test: Liste utilisateurs
    curl -s "%API_URL%/users/index.php" ^
        -H "Authorization: Bearer %ADMIN_TOKEN%" > response.tmp

    findstr /C:"\"success\":true" response.tmp >nul
    if %errorlevel%==0 (
        echo [OK] Liste des utilisateurs ^(admin^)
        set /a PASSED_TESTS+=1
    ) else (
        echo [ERREUR] Liste des utilisateurs ^(admin^)
        set /a FAILED_TESTS+=1
    )
    set /a TOTAL_TESTS+=1

    REM Test: Statistiques
    curl -s "%API_URL%/admin/stats.php" ^
        -H "Authorization: Bearer %ADMIN_TOKEN%" > response.tmp

    findstr /C:"\"success\":true" response.tmp >nul
    if %errorlevel%==0 (
        echo [OK] Statistiques admin
        set /a PASSED_TESTS+=1
    ) else (
        echo [ERREUR] Statistiques admin
        set /a FAILED_TESTS+=1
    )
    set /a TOTAL_TESTS+=1
)

REM Nettoyage
del response.tmp 2>nul

REM RÉSUMÉ FINAL
echo.
echo ╔═══════════════════════════════════════════════════════╗
echo ║                   RÉSUMÉ DES TESTS                      ║
echo ╚═══════════════════════════════════════════════════════╝
echo.
echo Total de tests: %TOTAL_TESTS%
echo Tests réussis: %PASSED_TESTS%
echo Tests échoués: %FAILED_TESTS%
echo.

if %FAILED_TESTS%==0 (
    echo [OK] TOUS LES TESTS SONT PASSES !
    exit /b 0
) else (
    echo [ATTENTION] %FAILED_TESTS% test^(s^) ont echoue
    exit /b 1
)
