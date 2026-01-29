export interface BlogArticle {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  author: string;
  publishedAt: string;
  readTime: number;
  image?: string;
  tags: string[];
}

export const blogCategories = [
  { id: "startup", name: "Startup", color: "bg-emerald-500" },
  { id: "taxes", name: "Fiscalité", color: "bg-blue-500" },
  { id: "juridique", name: "Juridique", color: "bg-amber-500" },
  { id: "social", name: "CNAS/CASNOS", color: "bg-rose-500" },
  { id: "creation", name: "Création d'entreprise", color: "bg-cyan-500" },
  { id: "general", name: "Informations générales", color: "bg-gray-500" },
];

export const blogArticles: BlogArticle[] = [
  {
    id: "1",
    slug: "formes-juridiques-algerie",
    title: "Les formes juridiques en Algérie : Guide complet",
    excerpt: "Découvrez les différentes formes juridiques disponibles en Algérie pour créer votre entreprise : SARL, EURL, SPA, SNC, et Auto-entrepreneur.",
    content: `
## Introduction

Le choix de la forme juridique est une étape cruciale dans la création de votre entreprise en Algérie. Ce choix aura des implications importantes sur la gestion, la fiscalité et la responsabilité des associés.

## Les principales formes juridiques

### 1. SARL - Société à Responsabilité Limitée

La SARL est la forme juridique la plus répandue en Algérie. Elle permet à plusieurs associés (de 2 à 50) de créer une société avec une responsabilité limitée à leurs apports.

**Caractéristiques :**
- Capital minimum : 100 000 DA
- Nombre d'associés : 2 à 50
- Responsabilité : limitée aux apports

### 2. EURL - Entreprise Unipersonnelle à Responsabilité Limitée

L'EURL est une variante de la SARL avec un seul associé. Elle offre les mêmes avantages de responsabilité limitée.

**Caractéristiques :**
- Capital minimum : 100 000 DA
- Associé unique
- Responsabilité : limitée aux apports

### 3. SPA - Société Par Actions

La SPA est adaptée aux grandes entreprises nécessitant des capitaux importants.

**Caractéristiques :**
- Capital minimum : 1 000 000 DA
- Nombre d'actionnaires : minimum 7
- Actions librement négociables

### 4. Auto-Entrepreneur

Le statut d'auto-entrepreneur est idéal pour les activités individuelles à faible chiffre d'affaires.

**Caractéristiques :**
- Pas de capital minimum
- Procédure simplifiée
- Fiscalité avantageuse (IFU)

## Comment choisir ?

Le choix dépend de plusieurs facteurs :
- Le nombre d'associés
- Le capital disponible
- Le niveau de risque acceptable
- Les objectifs de croissance

N'hésitez pas à consulter un expert-comptable ou un avocat pour vous accompagner dans ce choix important.
    `,
    category: "juridique",
    author: "Coffice",
    publishedAt: "2024-12-15",
    readTime: 8,
    tags: ["juridique", "création", "SARL", "EURL", "SPA"],
  },
  {
    id: "2",
    slug: "spas-startup-algerie",
    title: "La Société Par Actions Simplifiée (SPAS) en Algérie",
    excerpt: "Nouvelle forme juridique offrant plus de flexibilité pour la création et la gestion des startups en Algérie.",
    content: `
## Qu'est-ce que la SPAS ?

La Société Par Actions Simplifiée (SPAS) est une nouvelle forme juridique introduite en Algérie pour faciliter la création et la gestion des startups et des entreprises innovantes.

## Avantages de la SPAS

### Flexibilité de gestion
- Statuts librement rédigés
- Organisation interne souple
- Décisions rapides

### Facilité de financement
- Ouverture aux investisseurs
- Émission d'actions simplifiée
- Attractivité pour les business angels

### Adaptée aux startups
- Procédures allégées
- Coût de création réduit
- Gouvernance moderne

## Conditions de création

1. Minimum 2 actionnaires (personnes physiques ou morales)
2. Capital social librement fixé dans les statuts
3. Un président obligatoire (personne physique ou morale)

## Procédure de création

1. Rédaction des statuts
2. Dépôt du capital social
3. Publication dans un journal d'annonces légales
4. Immatriculation au registre du commerce

La SPAS représente une avancée majeure pour l'écosystème entrepreneurial algérien.
    `,
    category: "startup",
    author: "Coffice",
    publishedAt: "2024-12-10",
    readTime: 6,
    tags: ["startup", "SPAS", "innovation", "création"],
  },
  {
    id: "3",
    slug: "labels-startup-algerie",
    title: "Comment obtenir les labels Startup en Algérie",
    excerpt: "Guide pratique pour obtenir les labels startup, projet innovant et incubateur selon le décret 20-254.",
    content: `
## Les différents labels

L'Algérie a mis en place un système de labellisation pour encourager l'innovation et l'entrepreneuriat.

### Label Startup
Pour les entreprises innovantes de moins de 8 ans avec un fort potentiel de croissance.

### Label Projet Innovant
Pour les projets en phase de développement portant sur des technologies ou services innovants.

### Label Incubateur
Pour les structures d'accompagnement des startups et projets innovants.

## Critères d'éligibilité

### Pour le label Startup :
- Entreprise de moins de 8 ans
- Activité innovante
- Modèle économique scalable
- Équipe dirigeante compétente

### Avantages du label :
- Exonérations fiscales
- Accès aux financements publics
- Accompagnement personnalisé
- Visibilité accrue

## Procédure de demande

1. Créer un compte sur la plateforme startup.dz
2. Remplir le formulaire de candidature
3. Soumettre les documents requis
4. Passer devant le comité de labellisation

Le processus peut prendre de 2 à 4 semaines selon la complétude du dossier.
    `,
    category: "startup",
    author: "Coffice",
    publishedAt: "2024-12-05",
    readTime: 7,
    tags: ["startup", "label", "innovation", "financement"],
  },
  {
    id: "4",
    slug: "irg-algerie",
    title: "L'impôt sur le revenu global (IRG) en Algérie",
    excerpt: "Comprendre l'IRG, l'impôt direct qui affecte les revenus des personnes physiques en Algérie.",
    content: `
## Qu'est-ce que l'IRG ?

L'Impôt sur le Revenu Global (IRG) est un impôt direct qui s'applique aux revenus des personnes physiques résidant en Algérie.

## Catégories de revenus imposables

1. **Traitements et salaires**
2. **Revenus agricoles**
3. **Revenus fonciers**
4. **Bénéfices industriels et commerciaux**
5. **Bénéfices non commerciaux**
6. **Revenus des capitaux mobiliers**

## Barème progressif

L'IRG est calculé selon un barème progressif :

| Tranche de revenu | Taux |
|-------------------|------|
| 0 - 120 000 DA | 0% |
| 120 001 - 360 000 DA | 20% |
| 360 001 - 1 440 000 DA | 30% |
| Plus de 1 440 000 DA | 35% |

## Déclarations et paiements

- Déclaration annuelle avant le 30 avril
- Paiements par retenue à la source pour les salaires
- Acomptes provisionnels pour les indépendants

## Exonérations

Certains revenus bénéficient d'exonérations totales ou partielles selon la législation en vigueur.
    `,
    category: "taxes",
    author: "Coffice",
    publishedAt: "2024-11-28",
    readTime: 5,
    tags: ["fiscalité", "IRG", "impôts", "déclaration"],
  },
  {
    id: "5",
    slug: "ibs-algerie",
    title: "L'impôt sur les bénéfices des sociétés (IBS)",
    excerpt: "Guide complet sur l'IBS, l'impôt annuel applicable aux sociétés de capitaux en Algérie.",
    content: `
## Définition de l'IBS

L'Impôt sur les Bénéfices des Sociétés (IBS) est un impôt direct annuel qui frappe les bénéfices réalisés par les personnes morales.

## Sociétés concernées

- SARL et EURL
- SPA
- SNC (sur option)
- Établissements stables de sociétés étrangères

## Taux d'imposition

- **Taux normal :** 26%
- **Taux réduit :** 19% (activités de production)
- **Taux majoré :** 30% (certaines activités)

## Calcul de l'IBS

L'IBS se calcule sur le bénéfice net comptable après réintégrations et déductions fiscales.

## Obligations déclaratives

1. **Déclaration annuelle :** G50 avant le 30 avril
2. **Acomptes provisionnels :** 3 acomptes de 30% chaque
3. **Régularisation :** solde dû au 30 avril

## Exonérations et avantages

- Nouvelles entreprises : exonération temporaire
- Zones à promouvoir : avantages fiscaux
- Activités prioritaires : taux réduits
    `,
    category: "taxes",
    author: "Coffice",
    publishedAt: "2024-11-20",
    readTime: 6,
    tags: ["fiscalité", "IBS", "sociétés", "déclaration"],
  },
  {
    id: "6",
    slug: "tva-algerie",
    title: "La taxe sur la valeur ajoutée (TVA) en Algérie",
    excerpt: "Tout savoir sur la TVA en Algérie : taux, mécanisme, déclarations et récupération.",
    content: `
## Principe de la TVA

La TVA est un impôt indirect sur la consommation. Elle est collectée par les entreprises mais supportée par le consommateur final.

## Taux de TVA

- **Taux normal :** 19%
- **Taux réduit :** 9% (produits de première nécessité)
- **Exonération :** 0% (certaines opérations)

## Mécanisme de déduction

Les entreprises peuvent déduire la TVA payée sur leurs achats (TVA déductible) de la TVA collectée sur leurs ventes.

**TVA à payer = TVA collectée - TVA déductible**

## Obligations déclaratives

- **Mensuelle :** Déclaration G50 avant le 20 du mois suivant
- **Crédit de TVA :** reportable ou remboursable

## Opérations exonérées

- Exportations
- Certains produits alimentaires de base
- Services médicaux
- Opérations bancaires

## Facturation

La TVA doit obligatoirement figurer sur les factures avec mention du taux appliqué.
    `,
    category: "taxes",
    author: "Coffice",
    publishedAt: "2024-11-15",
    readTime: 5,
    tags: ["fiscalité", "TVA", "déclaration", "facturation"],
  },
  {
    id: "7",
    slug: "creation-numero-employeur-cnas",
    title: "Création d'un numéro employeur CNAS",
    excerpt: "Procédure complète pour obtenir votre numéro employeur à 10 chiffres auprès de la CNAS.",
    content: `
## Qu'est-ce que le numéro employeur ?

Le numéro employeur est un identifiant unique à 10 chiffres attribué par la CNAS (Caisse Nationale des Assurances Sociales) à tout employeur.

## Pourquoi est-il obligatoire ?

- Déclaration des salariés
- Paiement des cotisations sociales
- Délivrance des attestations
- Accès aux services en ligne

## Documents requis

1. Copie du registre de commerce
2. Copie du NIF (Numéro d'Identification Fiscale)
3. Copie de la pièce d'identité du gérant
4. Extrait de naissance du gérant
5. Formulaire de demande rempli

## Procédure

1. **Dépôt du dossier** auprès de l'agence CNAS de votre wilaya
2. **Vérification** des documents par l'agent
3. **Attribution** du numéro dans un délai de 7 jours
4. **Retrait** de l'attestation d'immatriculation

## Services en ligne

Une fois le numéro obtenu, vous pouvez accéder à la plateforme de télédéclaration pour :
- Déclarer vos employés
- Payer vos cotisations
- Télécharger vos attestations
    `,
    category: "social",
    author: "Coffice",
    publishedAt: "2024-11-10",
    readTime: 4,
    tags: ["CNAS", "employeur", "cotisations", "déclaration"],
  },
  {
    id: "8",
    slug: "facture-algerie",
    title: "La facture en Algérie : Guide complet",
    excerpt: "Règles commerciales, juridiques, fiscales et comptables de la facturation en Algérie.",
    content: `
## Importance de la facture

La facture est un document commercial obligatoire qui fait foi dans les relations commerciales et fiscales.

## Mentions obligatoires

### Informations sur le vendeur
- Dénomination sociale
- Adresse du siège social
- Numéro de registre de commerce
- NIF et NIS
- Capital social

### Informations sur l'acheteur
- Dénomination ou nom
- Adresse
- NIF (si professionnel)

### Détails de la transaction
- Date de la facture
- Numéro de facture (séquence)
- Description des biens/services
- Quantités et prix unitaires
- Montant HT
- Taux et montant de TVA
- Montant TTC

## Facturation électronique

L'Algérie encourage progressivement la facturation électronique avec des avantages fiscaux pour les entreprises qui l'adoptent.

## Conservation

Les factures doivent être conservées pendant 10 ans minimum pour des raisons fiscales et juridiques.

## Pénalités

Le défaut de facturation ou les factures non conformes peuvent entraîner des pénalités fiscales importantes.
    `,
    category: "juridique",
    author: "Coffice",
    publishedAt: "2024-11-05",
    readTime: 6,
    tags: ["facturation", "comptabilité", "juridique", "TVA"],
  },
  {
    id: "9",
    slug: "etapes-creation-entreprise",
    title: "Les 10 étapes pour créer une entreprise en Algérie",
    excerpt: "Guide pas à pas pour créer votre entreprise en Algérie, de l'idée à l'immatriculation.",
    content: `
## Étape 1 : Définir votre projet

- Étude de marché
- Business plan
- Choix de l'activité

## Étape 2 : Choisir la forme juridique

- SARL, EURL, SPA, Auto-entrepreneur
- Consulter un expert si nécessaire

## Étape 3 : Obtenir la dénomination

Auprès du CNRC (Centre National du Registre de Commerce) :
- Vérifier la disponibilité du nom
- Réserver la dénomination

## Étape 4 : Rédiger les statuts

Pour les sociétés :
- Statuts types disponibles
- Personnalisation possible

## Étape 5 : Déposer le capital

- Ouverture d'un compte bancaire bloqué
- Dépôt du capital minimum

## Étape 6 : Immatriculation au registre de commerce

Documents requis :
- Formulaire rempli
- Statuts (si société)
- Justificatif de domiciliation
- Pièces d'identité

## Étape 7 : Obtenir le NIF

Le Numéro d'Identification Fiscale est attribué par les impôts.

## Étape 8 : Obtenir le NIS

Le Numéro d'Identification Statistique auprès de l'ONS.

## Étape 9 : S'affilier aux caisses sociales

- CNAS pour les salariés
- CASNOS pour le gérant

## Étape 10 : Démarrer l'activité

- Ouvrir les registres légaux
- Émettre les premières factures
- Respecter les obligations déclaratives
    `,
    category: "creation",
    author: "Coffice",
    publishedAt: "2024-10-28",
    readTime: 10,
    tags: ["création", "entreprise", "démarches", "guide"],
  },
  {
    id: "10",
    slug: "domiciliation-entreprise-algerie",
    title: "La domiciliation d'entreprise en Algérie",
    excerpt: "Tout savoir sur la domiciliation d'entreprise : avantages, procédure et obligations.",
    content: `
## Qu'est-ce que la domiciliation ?

La domiciliation d'entreprise consiste à établir le siège social de votre société à une adresse professionnelle sans y exercer votre activité.

## Avantages de la domiciliation

### Pour les créateurs
- Adresse prestigieuse
- Coût réduit vs location de bureaux
- Flexibilité

### Services inclus
- Réception du courrier
- Salle de réunion ponctuelle
- Assistance administrative

## Qui peut domicilier ?

- Toute personne morale
- Auto-entrepreneurs
- Professions libérales
- Succursales de sociétés étrangères

## Procédure chez Coffice

1. **Contact initial :** Présentation de vos besoins
2. **Choix de la formule :** 6 mois ou 1 an
3. **Constitution du dossier :** Documents requis
4. **Signature du contrat :** Engagement mutuel
5. **Obtention de l'attestation :** Pour le registre de commerce

## Documents requis

### Entreprise existante
- Extrait de registre de commerce
- Statuts de la société
- Pièce d'identité du gérant

### Nouvelle création
- Dénomination CNRC
- Extrait de naissance
- CNI du futur gérant

## Tarifs

À partir de 12 000 DA/mois avec engagement de 6 mois minimum.

**Coffice** vous propose une domiciliation au Mohammadia Mall, 4ème étage, une adresse prestigieuse au cœur d'Alger.
    `,
    category: "creation",
    author: "Coffice",
    publishedAt: "2024-10-20",
    readTime: 7,
    tags: ["domiciliation", "siège social", "création", "Coffice"],
  },
];

export const BLOG_ENABLED = true;
