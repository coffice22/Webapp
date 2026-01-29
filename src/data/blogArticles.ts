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
  { id: "taxes", name: "Fiscalite", color: "bg-blue-500" },
  { id: "juridique", name: "Juridique", color: "bg-amber-500" },
  { id: "social", name: "CNAS/CASNOS", color: "bg-rose-500" },
  { id: "creation", name: "Creation d'entreprise", color: "bg-cyan-500" },
  { id: "general", name: "Informations generales", color: "bg-gray-500" },
];

export const blogArticles: BlogArticle[] = [
  {
    id: "1",
    slug: "formes-juridiques-algerie",
    title: "Les formes juridiques en Algerie: Guide complet",
    excerpt:
      "Decouvrez les differentes formes juridiques disponibles en Algerie pour creer votre entreprise: SARL, EURL, SPA, SNC, et Auto-entrepreneur.",
    content: `
## Introduction

Le choix de la forme juridique est une etape cruciale dans la creation de votre entreprise en Algerie. Ce choix aura des implications importantes sur la gestion, la fiscalite et la responsabilite des associes.

## Les principales formes juridiques

### 1. SARL - Societe a Responsabilite Limitee

La SARL est la forme juridique la plus repandue en Algerie. Elle permet a plusieurs associes (de 2 a 50) de creer une societe avec une responsabilite limitee a leurs apports.

**Caracteristiques:**
- Capital minimum: 100 000 DA
- Nombre d'associes: 2 a 50
- Responsabilite: limitee aux apports

### 2. EURL - Entreprise Unipersonnelle a Responsabilite Limitee

L'EURL est une variante de la SARL avec un seul associe. Elle offre les memes avantages de responsabilite limitee.

**Caracteristiques:**
- Capital minimum: 100 000 DA
- Associe unique
- Responsabilite: limitee aux apports

### 3. SPA - Societe Par Actions

La SPA est adaptee aux grandes entreprises necessitant des capitaux importants.

**Caracteristiques:**
- Capital minimum: 1 000 000 DA
- Nombre d'actionnaires: minimum 7
- Actions librement negociables

### 4. Auto-Entrepreneur

Le statut d'auto-entrepreneur est ideal pour les activites individuelles a faible chiffre d'affaires.

**Caracteristiques:**
- Pas de capital minimum
- Procedure simplifiee
- Fiscalite avantageuse (IFU)

## Comment choisir?

Le choix depend de plusieurs facteurs:
- Le nombre d'associes
- Le capital disponible
- Le niveau de risque acceptable
- Les objectifs de croissance

N'hesitez pas a consulter un expert-comptable ou un avocat pour vous accompagner dans ce choix important.
    `,
    category: "juridique",
    author: "Coffice",
    publishedAt: "2024-12-15",
    readTime: 8,
    tags: ["juridique", "creation", "SARL", "EURL", "SPA"],
  },
  {
    id: "2",
    slug: "spas-startup-algerie",
    title: "La Societe Par Actions Simplifiee (SPAS) en Algerie",
    excerpt:
      "Nouvelle forme juridique offrant plus de flexibilite pour la creation et la gestion des startups en Algerie.",
    content: `
## Qu'est-ce que la SPAS?

La Societe Par Actions Simplifiee (SPAS) est une nouvelle forme juridique introduite en Algerie pour faciliter la creation et la gestion des startups et des entreprises innovantes.

## Avantages de la SPAS

### Flexibilite de gestion
- Statuts librement rediges
- Organisation interne souple
- Decisions rapides

### Facilite de financement
- Ouverture aux investisseurs
- Emission d'actions simplifiee
- Attractivite pour les business angels

### Adaptee aux startups
- Procedures allegees
- Cout de creation reduit
- Gouvernance moderne

## Conditions de creation

1. Minimum 2 actionnaires (personnes physiques ou morales)
2. Capital social librement fixe dans les statuts
3. Un president obligatoire (personne physique ou morale)

## Procedure de creation

1. Redaction des statuts
2. Depot du capital social
3. Publication dans un journal d'annonces legales
4. Immatriculation au registre du commerce

La SPAS represente une avancee majeure pour l'ecosysteme entrepreneurial algerien.
    `,
    category: "startup",
    author: "Coffice",
    publishedAt: "2024-12-10",
    readTime: 6,
    tags: ["startup", "SPAS", "innovation", "creation"],
  },
  {
    id: "3",
    slug: "labels-startup-algerie",
    title: "Comment obtenir les labels Startup en Algerie",
    excerpt:
      "Guide pratique pour obtenir les labels startup, projet innovant et incubateur selon le decret 20-254.",
    content: `
## Les differents labels

L'Algerie a mis en place un systeme de labellisation pour encourager l'innovation et l'entrepreneuriat.

### Label Startup
Pour les entreprises innovantes de moins de 8 ans avec un fort potentiel de croissance.

### Label Projet Innovant
Pour les projets en phase de developpement portant sur des technologies ou services innovants.

### Label Incubateur
Pour les structures d'accompagnement des startups et projets innovants.

## Criteres d'eligibilite

### Pour le label Startup:
- Entreprise de moins de 8 ans
- Activite innovante
- Modele economique scalable
- Equipe dirigeante competente

### Avantages du label:
- Exonerations fiscales
- Acces aux financements publics
- Accompagnement personnalise
- Visibilite accrue

## Procedure de demande

1. Creer un compte sur la plateforme startup.dz
2. Remplir le formulaire de candidature
3. Soumettre les documents requis
4. Passer devant le comite de labellisation

Le processus peut prendre de 2 a 4 semaines selon la completude du dossier.
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
    title: "L'impot sur le revenu global (IRG) en Algerie",
    excerpt:
      "Comprendre l'IRG, l'impot direct qui affecte les revenus des personnes physiques en Algerie.",
    content: `
## Qu'est-ce que l'IRG?

L'Impot sur le Revenu Global (IRG) est un impot direct qui s'applique aux revenus des personnes physiques residant en Algerie.

## Categories de revenus imposables

1. **Traitements et salaires**
2. **Revenus agricoles**
3. **Revenus fonciers**
4. **Benefices industriels et commerciaux**
5. **Benefices non commerciaux**
6. **Revenus des capitaux mobiliers**

## Bareme progressif

L'IRG est calcule selon un bareme progressif:

| Tranche de revenu | Taux |
|-------------------|------|
| 0 - 120 000 DA | 0% |
| 120 001 - 360 000 DA | 20% |
| 360 001 - 1 440 000 DA | 30% |
| Plus de 1 440 000 DA | 35% |

## Declarations et paiements

- Declaration annuelle avant le 30 avril
- Paiements par retenue a la source pour les salaires
- Acomptes provisionnels pour les independants

## Exonerations

Certains revenus beneficient d'exonerations totales ou partielles selon la legislation en vigueur.
    `,
    category: "taxes",
    author: "Coffice",
    publishedAt: "2024-11-28",
    readTime: 5,
    tags: ["fiscalite", "IRG", "impots", "declaration"],
  },
  {
    id: "5",
    slug: "ibs-algerie",
    title: "L'impot sur les benefices des societes (IBS)",
    excerpt:
      "Guide complet sur l'IBS, l'impot annuel applicable aux societes de capitaux en Algerie.",
    content: `
## Definition de l'IBS

L'Impot sur les Benefices des Societes (IBS) est un impot direct annuel qui frappe les benefices realises par les personnes morales.

## Societes concernees

- SARL et EURL
- SPA
- SNC (sur option)
- Etablissements stables de societes etrangeres

## Taux d'imposition

- **Taux normal:** 26%
- **Taux reduit:** 19% (activites de production)
- **Taux majore:** 30% (certaines activites)

## Calcul de l'IBS

L'IBS se calcule sur le benefice net comptable apres reintegrations et deductions fiscales.

## Obligations declaratives

1. **Declaration annuelle:** G50 avant le 30 avril
2. **Acomptes provisionnels:** 3 acomptes de 30% chaque
3. **Regularisation:** solde du au 30 avril

## Exonerations et avantages

- Nouvelles entreprises: exoneration temporaire
- Zones a promouvoir: avantages fiscaux
- Activites prioritaires: taux reduits
    `,
    category: "taxes",
    author: "Coffice",
    publishedAt: "2024-11-20",
    readTime: 6,
    tags: ["fiscalite", "IBS", "societes", "declaration"],
  },
  {
    id: "6",
    slug: "tva-algerie",
    title: "La taxe sur la valeur ajoutee (TVA) en Algerie",
    excerpt:
      "Tout savoir sur la TVA en Algerie: taux, mecanisme, declarations et recuperation.",
    content: `
## Principe de la TVA

La TVA est un impot indirect sur la consommation. Elle est collectee par les entreprises mais supportee par le consommateur final.

## Taux de TVA

- **Taux normal:** 19%
- **Taux reduit:** 9% (produits de premiere necessite)
- **Exoneration:** 0% (certaines operations)

## Mecanisme de deduction

Les entreprises peuvent deduire la TVA payee sur leurs achats (TVA deductible) de la TVA collectee sur leurs ventes.

**TVA a payer = TVA collectee - TVA deductible**

## Obligations declaratives

- **Mensuelle:** Declaration G50 avant le 20 du mois suivant
- **Credit de TVA:** reportable ou remboursable

## Operations exonerees

- Exportations
- Certains produits alimentaires de base
- Services medicaux
- Operations bancaires

## Facturation

La TVA doit obligatoirement figurer sur les factures avec mention du taux applique.
    `,
    category: "taxes",
    author: "Coffice",
    publishedAt: "2024-11-15",
    readTime: 5,
    tags: ["fiscalite", "TVA", "declaration", "facturation"],
  },
  {
    id: "7",
    slug: "creation-numero-employeur-cnas",
    title: "Creation d'un numero employeur CNAS",
    excerpt:
      "Procedure complete pour obtenir votre numero employeur a 10 chiffres aupres de la CNAS.",
    content: `
## Qu'est-ce que le numero employeur?

Le numero employeur est un identifiant unique a 10 chiffres attribue par la CNAS (Caisse Nationale des Assurances Sociales) a tout employeur.

## Pourquoi est-il obligatoire?

- Declaration des salaries
- Paiement des cotisations sociales
- Delivrance des attestations
- Acces aux services en ligne

## Documents requis

1. Copie du registre de commerce
2. Copie du NIF (Numero d'Identification Fiscale)
3. Copie de la piece d'identite du gerant
4. Extrait de naissance du gerant
5. Formulaire de demande rempli

## Procedure

1. **Depot du dossier** aupres de l'agence CNAS de votre wilaya
2. **Verification** des documents par l'agent
3. **Attribution** du numero dans un delai de 7 jours
4. **Retrait** de l'attestation d'immatriculation

## Services en ligne

Une fois le numero obtenu, vous pouvez acceder a la plateforme de teledeclaration pour:
- Declarer vos employes
- Payer vos cotisations
- Telecharger vos attestations
    `,
    category: "social",
    author: "Coffice",
    publishedAt: "2024-11-10",
    readTime: 4,
    tags: ["CNAS", "employeur", "cotisations", "declaration"],
  },
  {
    id: "8",
    slug: "facture-algerie",
    title: "La facture en Algerie: Guide complet",
    excerpt:
      "Regles commerciales, juridiques, fiscales et comptables de la facturation en Algerie.",
    content: `
## Importance de la facture

La facture est un document commercial obligatoire qui fait foi dans les relations commerciales et fiscales.

## Mentions obligatoires

### Informations sur le vendeur
- Denomination sociale
- Adresse du siege social
- Numero de registre de commerce
- NIF et NIS
- Capital social

### Informations sur l'acheteur
- Denomination ou nom
- Adresse
- NIF (si professionnel)

### Details de la transaction
- Date de la facture
- Numero de facture (sequence)
- Description des biens/services
- Quantites et prix unitaires
- Montant HT
- Taux et montant de TVA
- Montant TTC

## Facturation electronique

L'Algerie encourage progressivement la facturation electronique avec des avantages fiscaux pour les entreprises qui l'adoptent.

## Conservation

Les factures doivent etre conservees pendant 10 ans minimum pour des raisons fiscales et juridiques.

## Penalites

Le defaut de facturation ou les factures non conformes peuvent entrainer des penalites fiscales importantes.
    `,
    category: "juridique",
    author: "Coffice",
    publishedAt: "2024-11-05",
    readTime: 6,
    tags: ["facturation", "comptabilite", "juridique", "TVA"],
  },
  {
    id: "9",
    slug: "etapes-creation-entreprise",
    title: "Les 10 etapes pour creer une entreprise en Algerie",
    excerpt:
      "Guide pas a pas pour creer votre entreprise en Algerie, de l'idee a l'immatriculation.",
    content: `
## Etape 1: Definir votre projet

- Etude de marche
- Business plan
- Choix de l'activite

## Etape 2: Choisir la forme juridique

- SARL, EURL, SPA, Auto-entrepreneur
- Consulter un expert si necessaire

## Etape 3: Obtenir la denomination

Aupres du CNRC (Centre National du Registre de Commerce):
- Verifier la disponibilite du nom
- Reserver la denomination

## Etape 4: Rediger les statuts

Pour les societes:
- Statuts types disponibles
- Personnalisation possible

## Etape 5: Deposer le capital

- Ouverture d'un compte bancaire bloque
- Depot du capital minimum

## Etape 6: Immatriculation au registre de commerce

Documents requis:
- Formulaire rempli
- Statuts (si societe)
- Justificatif de domiciliation
- Pieces d'identite

## Etape 7: Obtenir le NIF

Le Numero d'Identification Fiscale est attribue par les impots.

## Etape 8: Obtenir le NIS

Le Numero d'Identification Statistique aupres de l'ONS.

## Etape 9: S'affilier aux caisses sociales

- CNAS pour les salaries
- CASNOS pour le gerant

## Etape 10: Demarrer l'activite

- Ouvrir les registres legaux
- Emettre les premieres factures
- Respecter les obligations declaratives
    `,
    category: "creation",
    author: "Coffice",
    publishedAt: "2024-10-28",
    readTime: 10,
    tags: ["creation", "entreprise", "demarches", "guide"],
  },
  {
    id: "10",
    slug: "domiciliation-entreprise-algerie",
    title: "La domiciliation d'entreprise en Algerie",
    excerpt:
      "Tout savoir sur la domiciliation d'entreprise: avantages, procedure et obligations.",
    content: `
## Qu'est-ce que la domiciliation?

La domiciliation d'entreprise consiste a etablir le siege social de votre societe a une adresse professionnelle sans y exercer votre activite.

## Avantages de la domiciliation

### Pour les createurs
- Adresse prestigieuse
- Cout reduit vs location de bureaux
- Flexibilite

### Services inclus
- Reception du courrier
- Salle de reunion ponctuelle
- Assistance administrative

## Qui peut domicilier?

- Toute personne morale
- Auto-entrepreneurs
- Professions liberales
- Succursales de societes etrangeres

## Procedure chez Coffice

1. **Contact initial:** Presentation de vos besoins
2. **Choix de la formule:** 6 mois ou 1 an
3. **Constitution du dossier:** Documents requis
4. **Signature du contrat:** Engagement mutuel
5. **Obtention de l'attestation:** Pour le registre de commerce

## Documents requis

### Entreprise existante
- Extrait de registre de commerce
- Statuts de la societe
- Piece d'identite du gerant

### Nouvelle creation
- Denomination CNRC
- Extrait de naissance
- CNI du futur gerant

## Tarifs

A partir de 12 000 DA/mois avec engagement de 6 mois minimum.

**Coffice** vous propose une domiciliation au Mohammadia Mall, 4eme etage, une adresse prestigieuse au coeur d'Alger.
    `,
    category: "creation",
    author: "Coffice",
    publishedAt: "2024-10-20",
    readTime: 7,
    tags: ["domiciliation", "siege social", "creation", "Coffice"],
  },
];

export const BLOG_ENABLED = false;
