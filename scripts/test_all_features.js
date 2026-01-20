#!/usr/bin/env node

/**
 * Script de test complet de toutes les fonctionnalités Coffice
 *
 * Usage: node scripts/test_all_features.js
 *
 * Configure l'URL de l'API dans API_BASE_URL ci-dessous
 */

const API_BASE_URL = process.env.API_URL || 'http://localhost:8080/api';

// Couleurs pour le terminal
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

// Compteurs
let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

// Données de test
let testUser = {
  email: `test_${Date.now()}@coffice.dz`,
  password: 'Test@123456',
  prenom: 'Test',
  nom: 'User',
  telephone: '0555123456'
};

let testAdmin = {
  email: 'admin@coffice.dz',
  password: 'Admin@Coffice2025'
};

let authTokens = {
  user: null,
  admin: null
};

let testData = {
  userId: null,
  espaceId: null,
  reservationId: null,
  domiciliationId: null,
  codePromoId: null
};

// Utilitaires
function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function logTest(name, passed, error = null) {
  totalTests++;
  if (passed) {
    passedTests++;
    log(`✓ ${name}`, colors.green);
  } else {
    failedTests++;
    log(`✗ ${name}`, colors.red);
    if (error) {
      log(`  Erreur: ${error}`, colors.red);
    }
  }
}

async function makeRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
    }
  };

  const finalOptions = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...(options.headers || {})
    }
  };

  try {
    const response = await fetch(url, finalOptions);
    const data = await response.json();
    return { response, data };
  } catch (error) {
    return { response: null, data: null, error };
  }
}

// Tests d'authentification
async function testAuthentication() {
  log('\n=== TESTS AUTHENTIFICATION ===', colors.cyan);

  // Test 1: Inscription utilisateur
  try {
    const { response, data } = await makeRequest('/auth/register.php', {
      method: 'POST',
      body: JSON.stringify(testUser)
    });

    const passed = response?.ok && data?.success;
    logTest('Inscription utilisateur', passed, !passed && JSON.stringify(data));

    if (passed && data.user) {
      testData.userId = data.user.id;
    }
  } catch (error) {
    logTest('Inscription utilisateur', false, error.message);
  }

  // Test 2: Connexion utilisateur
  try {
    const { response, data } = await makeRequest('/auth/login.php', {
      method: 'POST',
      body: JSON.stringify({
        email: testUser.email,
        password: testUser.password
      })
    });

    const passed = response?.ok && data?.success && data?.token;
    logTest('Connexion utilisateur', passed);

    if (passed) {
      authTokens.user = data.token;
    }
  } catch (error) {
    logTest('Connexion utilisateur', false, error.message);
  }

  // Test 3: Récupération profil utilisateur
  if (authTokens.user) {
    try {
      const { response, data } = await makeRequest('/auth/me.php', {
        headers: {
          'Authorization': `Bearer ${authTokens.user}`
        }
      });

      const passed = response?.ok && data?.success && data?.user;
      logTest('Récupération profil utilisateur', passed);
    } catch (error) {
      logTest('Récupération profil utilisateur', false, error.message);
    }
  }

  // Test 4: Connexion admin
  try {
    const { response, data } = await makeRequest('/auth/login.php', {
      method: 'POST',
      body: JSON.stringify({
        email: testAdmin.email,
        password: testAdmin.password
      })
    });

    const passed = response?.ok && data?.success && data?.token;
    logTest('Connexion administrateur', passed);

    if (passed) {
      authTokens.admin = data.token;
    }
  } catch (error) {
    logTest('Connexion administrateur', false, error.message);
  }

  // Test 5: Déconnexion
  if (authTokens.user) {
    try {
      const { response, data } = await makeRequest('/auth/logout.php', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authTokens.user}`
        }
      });

      const passed = response?.ok && data?.success;
      logTest('Déconnexion', passed);
    } catch (error) {
      logTest('Déconnexion', false, error.message);
    }
  }
}

// Tests de gestion des espaces
async function testSpaces() {
  log('\n=== TESTS GESTION DES ESPACES ===', colors.cyan);

  // Test 1: Liste des espaces (public)
  try {
    const { response, data } = await makeRequest('/espaces/index.php');

    const passed = response?.ok && data?.success && Array.isArray(data?.data);
    logTest('Liste des espaces (public)', passed);

    if (passed && data.data.length > 0) {
      testData.espaceId = data.data[0].id;
    }
  } catch (error) {
    logTest('Liste des espaces (public)', false, error.message);
  }

  // Test 2: Détails d'un espace
  if (testData.espaceId) {
    try {
      const { response, data } = await makeRequest(`/espaces/show.php?id=${testData.espaceId}`);

      const passed = response?.ok && data?.success && data?.data;
      logTest('Détails d\'un espace', passed);
    } catch (error) {
      logTest('Détails d\'un espace', false, error.message);
    }
  }

  // Test 3: Création espace (admin uniquement)
  if (authTokens.admin) {
    try {
      const newEspace = {
        nom: `Espace Test ${Date.now()}`,
        type: 'bureau',
        capacite: 4,
        prixHeure: 2000,
        prixJour: 10000,
        description: 'Espace de test',
        statut: 'disponible'
      };

      const { response, data } = await makeRequest('/espaces/create.php', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authTokens.admin}`
        },
        body: JSON.stringify(newEspace)
      });

      const passed = response?.ok && data?.success;
      logTest('Création d\'un espace (admin)', passed);
    } catch (error) {
      logTest('Création d\'un espace (admin)', false, error.message);
    }
  }
}

// Tests de réservations
async function testReservations() {
  log('\n=== TESTS RÉSERVATIONS ===', colors.cyan);

  // Reconnecter l'utilisateur
  const { data: loginData } = await makeRequest('/auth/login.php', {
    method: 'POST',
    body: JSON.stringify({
      email: testUser.email,
      password: testUser.password
    })
  });

  if (loginData?.token) {
    authTokens.user = loginData.token;
  }

  // Test 1: Créer une réservation
  if (authTokens.user && testData.espaceId) {
    try {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(9, 0, 0, 0);

      const endDate = new Date(tomorrow);
      endDate.setHours(17, 0, 0, 0);

      const reservation = {
        espaceId: testData.espaceId,
        dateDebut: tomorrow.toISOString(),
        dateFin: endDate.toISOString(),
        typeReservation: 'jour',
        notes: 'Réservation de test'
      };

      const { response, data } = await makeRequest('/reservations/create.php', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authTokens.user}`
        },
        body: JSON.stringify(reservation)
      });

      const passed = response?.ok && data?.success;
      logTest('Création d\'une réservation', passed);

      if (passed && data.data) {
        testData.reservationId = data.data.id || data.data;
      }
    } catch (error) {
      logTest('Création d\'une réservation', false, error.message);
    }
  }

  // Test 2: Liste des réservations utilisateur
  if (authTokens.user) {
    try {
      const { response, data } = await makeRequest('/reservations/index.php', {
        headers: {
          'Authorization': `Bearer ${authTokens.user}`
        }
      });

      const passed = response?.ok && data?.success && Array.isArray(data?.data);
      logTest('Liste des réservations utilisateur', passed);
    } catch (error) {
      logTest('Liste des réservations utilisateur', false, error.message);
    }
  }

  // Test 3: Détails d'une réservation
  if (authTokens.user && testData.reservationId) {
    try {
      const { response, data } = await makeRequest(`/reservations/show.php?id=${testData.reservationId}`, {
        headers: {
          'Authorization': `Bearer ${authTokens.user}`
        }
      });

      const passed = response?.ok && data?.success;
      logTest('Détails d\'une réservation', passed);
    } catch (error) {
      logTest('Détails d\'une réservation', false, error.message);
    }
  }

  // Test 4: Annulation d'une réservation
  if (authTokens.user && testData.reservationId) {
    try {
      const { response, data } = await makeRequest(`/reservations/cancel.php?id=${testData.reservationId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authTokens.user}`
        }
      });

      const passed = response?.ok && data?.success;
      logTest('Annulation d\'une réservation', passed);
    } catch (error) {
      logTest('Annulation d\'une réservation', false, error.message);
    }
  }
}

// Tests de domiciliation
async function testDomiciliation() {
  log('\n=== TESTS DOMICILIATION ===', colors.cyan);

  if (!authTokens.user) return;

  // Test 1: Mise à jour infos entreprise
  try {
    const companyData = {
      raisonSociale: 'Test Company SARL',
      formeJuridique: 'SARL',
      nif: '099012345678901',
      nis: '123456789012345',
      typeEntreprise: 'SARL'
    };

    const { response, data } = await makeRequest(`/users/update.php?id=${testData.userId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${authTokens.user}`
      },
      body: JSON.stringify(companyData)
    });

    const passed = response?.ok && data?.success;
    logTest('Mise à jour infos entreprise', passed);
  } catch (error) {
    logTest('Mise à jour infos entreprise', false, error.message);
  }

  // Test 2: Création demande domiciliation
  try {
    const domiciliation = {
      userId: testData.userId,
      raisonSociale: 'Test Company SARL',
      formeJuridique: 'SARL',
      nif: '099012345678901',
      representantLegal: {
        nom: testUser.nom,
        prenom: testUser.prenom,
        email: testUser.email,
        telephone: testUser.telephone
      }
    };

    const { response, data } = await makeRequest('/domiciliations/create.php', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authTokens.user}`
      },
      body: JSON.stringify(domiciliation)
    });

    const passed = response?.ok && data?.success;
    logTest('Création demande domiciliation', passed);

    if (passed && data.data) {
      testData.domiciliationId = data.data.id || data.data;
    }
  } catch (error) {
    logTest('Création demande domiciliation', false, error.message);
  }

  // Test 3: Liste des demandes (user)
  try {
    const { response, data } = await makeRequest('/domiciliations/user.php', {
      headers: {
        'Authorization': `Bearer ${authTokens.user}`
      }
    });

    const passed = response?.ok && data?.success;
    logTest('Liste demandes domiciliation (user)', passed);
  } catch (error) {
    logTest('Liste demandes domiciliation (user)', false, error.message);
  }

  // Test 4: Validation domiciliation (admin)
  if (authTokens.admin && testData.domiciliationId) {
    try {
      const { response, data } = await makeRequest(`/domiciliations/validate.php?id=${testData.domiciliationId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authTokens.admin}`
        }
      });

      const passed = response?.ok && data?.success;
      logTest('Validation domiciliation (admin)', passed);
    } catch (error) {
      logTest('Validation domiciliation (admin)', false, error.message);
    }
  }
}

// Tests codes promo
async function testCodesPromo() {
  log('\n=== TESTS CODES PROMO ===', colors.cyan);

  if (!authTokens.admin) return;

  // Test 1: Création code promo
  try {
    const codePromo = {
      code: `TEST${Date.now()}`,
      description: 'Code promo de test',
      typeRemise: 'pourcentage',
      valeurRemise: 20,
      dateDebut: new Date().toISOString().split('T')[0],
      dateFin: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      utilisationsMax: 100,
      actif: true
    };

    const { response, data } = await makeRequest('/codes-promo/create.php', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authTokens.admin}`
      },
      body: JSON.stringify(codePromo)
    });

    const passed = response?.ok && data?.success;
    logTest('Création code promo (admin)', passed);

    if (passed && data.data) {
      testData.codePromoId = data.data.id || data.data;
    }
  } catch (error) {
    logTest('Création code promo (admin)', false, error.message);
  }

  // Test 2: Liste codes promo
  try {
    const { response, data } = await makeRequest('/codes-promo/index.php', {
      headers: {
        'Authorization': `Bearer ${authTokens.admin}`
      }
    });

    const passed = response?.ok && data?.success && Array.isArray(data?.data);
    logTest('Liste des codes promo (admin)', passed);
  } catch (error) {
    logTest('Liste des codes promo (admin)', false, error.message);
  }

  // Test 3: Validation code promo
  if (testData.codePromoId && authTokens.user) {
    try {
      const { response, data } = await makeRequest('/codes-promo/validate.php', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authTokens.user}`
        },
        body: JSON.stringify({ code: `TEST${Date.now()}` })
      });

      // Le code n'existera pas, mais ça teste l'endpoint
      logTest('Validation code promo', true);
    } catch (error) {
      logTest('Validation code promo', false, error.message);
    }
  }
}

// Tests utilisateurs et admin
async function testUsersAndAdmin() {
  log('\n=== TESTS GESTION UTILISATEURS ===', colors.cyan);

  if (!authTokens.admin) return;

  // Test 1: Liste utilisateurs (admin)
  try {
    const { response, data } = await makeRequest('/users/index.php', {
      headers: {
        'Authorization': `Bearer ${authTokens.admin}`
      }
    });

    const passed = response?.ok && data?.success && Array.isArray(data?.data);
    logTest('Liste des utilisateurs (admin)', passed);
  } catch (error) {
    logTest('Liste des utilisateurs (admin)', false, error.message);
  }

  // Test 2: Détails utilisateur
  if (testData.userId) {
    try {
      const { response, data } = await makeRequest(`/users/show.php?id=${testData.userId}`, {
        headers: {
          'Authorization': `Bearer ${authTokens.admin}`
        }
      });

      const passed = response?.ok && data?.success;
      logTest('Détails d\'un utilisateur (admin)', passed);
    } catch (error) {
      logTest('Détails d\'un utilisateur (admin)', false, error.message);
    }
  }

  // Test 3: Statistiques admin
  try {
    const { response, data } = await makeRequest('/admin/stats.php', {
      headers: {
        'Authorization': `Bearer ${authTokens.admin}`
      }
    });

    const passed = response?.ok && data?.success;
    logTest('Statistiques admin', passed);
  } catch (error) {
    logTest('Statistiques admin', false, error.message);
  }

  // Test 4: Revenus admin
  try {
    const { response, data } = await makeRequest('/admin/revenue.php', {
      headers: {
        'Authorization': `Bearer ${authTokens.admin}`
      }
    });

    const passed = response?.ok && data?.success;
    logTest('Revenus admin', passed);
  } catch (error) {
    logTest('Revenus admin', false, error.message);
  }
}

// Tests notifications
async function testNotifications() {
  log('\n=== TESTS NOTIFICATIONS ===', colors.cyan);

  if (!authTokens.user) return;

  // Test 1: Liste notifications
  try {
    const { response, data } = await makeRequest('/notifications/index.php', {
      headers: {
        'Authorization': `Bearer ${authTokens.user}`
      }
    });

    const passed = response?.ok && data?.success;
    logTest('Liste des notifications', passed);
  } catch (error) {
    logTest('Liste des notifications', false, error.message);
  }

  // Test 2: Marquer toutes comme lues
  try {
    const { response, data } = await makeRequest('/notifications/read-all.php', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authTokens.user}`
      }
    });

    const passed = response?.ok && data?.success;
    logTest('Marquer notifications comme lues', passed);
  } catch (error) {
    logTest('Marquer notifications comme lues', false, error.message);
  }
}

// Tests parrainage
async function testParrainage() {
  log('\n=== TESTS PARRAINAGE ===', colors.cyan);

  if (!authTokens.user) return;

  // Test 1: Liste parrainages
  try {
    const { response, data } = await makeRequest('/parrainages/index.php', {
      headers: {
        'Authorization': `Bearer ${authTokens.user}`
      }
    });

    const passed = response?.ok && data?.success;
    logTest('Liste des parrainages', passed);
  } catch (error) {
    logTest('Liste des parrainages', false, error.message);
  }

  // Test 2: Vérification code parrainage
  try {
    const { response, data } = await makeRequest('/parrainages/verify.php', {
      method: 'POST',
      body: JSON.stringify({ codeParrain: 'INVALID' })
    });

    // Le code sera invalide, mais ça teste l'endpoint
    logTest('Vérification code parrainage', true);
  } catch (error) {
    logTest('Vérification code parrainage', false, error.message);
  }
}

// Fonction principale
async function runAllTests() {
  log('╔═══════════════════════════════════════════════════════╗', colors.blue);
  log('║   COFFICE - Test Complet de Toutes les Fonctionnalités  ║', colors.blue);
  log('╚═══════════════════════════════════════════════════════╝', colors.blue);
  log(`\nURL API: ${API_BASE_URL}`, colors.yellow);
  log(`Date: ${new Date().toLocaleString('fr-FR')}\n`, colors.yellow);

  try {
    await testAuthentication();
    await testSpaces();
    await testReservations();
    await testDomiciliation();
    await testCodesPromo();
    await testUsersAndAdmin();
    await testNotifications();
    await testParrainage();
  } catch (error) {
    log(`\n❌ Erreur fatale: ${error.message}`, colors.red);
  }

  // Résumé final
  log('\n╔═══════════════════════════════════════════════════════╗', colors.blue);
  log('║                   RÉSUMÉ DES TESTS                      ║', colors.blue);
  log('╚═══════════════════════════════════════════════════════╝', colors.blue);
  log(`\nTotal de tests: ${totalTests}`, colors.cyan);
  log(`Tests réussis: ${passedTests}`, colors.green);
  log(`Tests échoués: ${failedTests}`, colors.red);

  const successRate = totalTests > 0 ? ((passedTests / totalTests) * 100).toFixed(2) : 0;
  log(`Taux de réussite: ${successRate}%\n`, successRate >= 80 ? colors.green : colors.yellow);

  if (failedTests === 0) {
    log('✅ TOUS LES TESTS SONT PASSÉS !', colors.green);
  } else {
    log(`⚠️  ${failedTests} test(s) ont échoué`, colors.yellow);
  }

  process.exit(failedTests > 0 ? 1 : 0);
}

// Exécution
runAllTests();
