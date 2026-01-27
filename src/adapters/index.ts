import type {
  Espace,
  Reservation,
  User,
  Abonnement,
  DemandeDomiciliation,
} from "../types";

type ApiEspace = Record<string, unknown>;
type ApiReservation = Record<string, unknown>;
type ApiAbonnement = Record<string, unknown>;
type ApiUser = Record<string, unknown>;
type ApiDomiciliation = Record<string, unknown>;

interface ApiEspaceData {
  nom?: string;
  type?: string;
  capacite?: number;
  prix_heure?: number;
  prix_demi_journee?: number;
  prix_jour?: number;
  prix_semaine?: number;
  description?: string;
  equipements?: string[];
  disponible?: boolean;
  etage?: string;
  image_url?: string;
}

interface ApiReservationData {
  espace_id?: string;
  date_debut?: string;
  date_fin?: string;
  statut?: string;
  notes?: string;
}

interface ApiAbonnementData {
  nom?: string;
  type?: string;
  prix?: number;
  prix_avec_domiciliation?: number;
  duree_mois?: number;
  description?: string;
  avantages?: string[];
  actif?: boolean;
  ordre?: number;
}

interface ApiDomiciliationData {
  raison_sociale?: string;
  forme_juridique?: string;
  nif?: string;
  nis?: string;
  registre_commerce?: string;
  article_imposition?: string;
  representant_legal?: unknown;
  domaine_activite?: string;
  adresse_siege_social?: string;
  capital?: string;
  date_creation_entreprise?: string;
}

export const espaceAdapter = {
  fromAPI: (apiData: ApiEspace): Espace => ({
    id: String(apiData.id || ""),
    nom: String(apiData.nom || ""),
    type: String(apiData.type || ""),
    capacite: Number(apiData.capacite || 0),
    prixHeure: Number(apiData.prix_heure || 0),
    prixDemiJournee: Number(apiData.prix_demi_journee || 0),
    prixJour: Number(apiData.prix_jour || 0),
    prixSemaine: Number(apiData.prix_semaine || 0),
    description: String(apiData.description || ""),
    equipements: (apiData.equipements as string[]) || [],
    disponible: Boolean(apiData.disponible),
    etage: apiData.etage as string | undefined,
    imageUrl: apiData.image_url as string | undefined,
    createdAt: apiData.created_at as string | undefined,
    updatedAt: apiData.updated_at as string | undefined,
  }),

  toAPI: (espace: Partial<Espace>): ApiEspaceData => ({
    nom: espace.nom,
    type: espace.type,
    capacite: espace.capacite,
    prix_heure: espace.prixHeure,
    prix_demi_journee: espace.prixDemiJournee,
    prix_jour: espace.prixJour,
    prix_semaine: espace.prixSemaine,
    description: espace.description,
    equipements: espace.equipements,
    disponible: espace.disponible,
    etage: espace.etage,
    image_url: espace.imageUrl,
  }),
};

export const reservationAdapter = {
  fromAPI: (apiData: ApiReservation): Reservation => ({
    id: String(apiData.id || ""),
    userId: String(apiData.user_id || ""),
    espaceId: String(apiData.espace_id || ""),
    dateDebut: String(apiData.date_debut || ""),
    dateFin: String(apiData.date_fin || ""),
    statut: String(apiData.statut || "en_attente") as Reservation["statut"],
    typeReservation: apiData.type_reservation as string | undefined,
    montantTotal: Number(apiData.montant_total || 0),
    reduction: Number(apiData.reduction || 0),
    montantPaye: Number(apiData.montant_paye || 0),
    modePaiement: apiData.mode_paiement as string | undefined,
    notes: apiData.notes as string | undefined,
    dateCreation: apiData.created_at as string | undefined,
    createdAt: apiData.created_at as string | undefined,
    espace: apiData.espace_nom
      ? {
          id: String(apiData.espace_id || ""),
          nom: String(apiData.espace_nom || ""),
          type: String(apiData.espace_type || ""),
        }
      : undefined,
    utilisateur: apiData.user_nom
      ? {
          id: String(apiData.user_id || ""),
          nom: String(apiData.user_nom || ""),
          prenom: String(apiData.user_prenom || ""),
          email: String(apiData.user_email || ""),
          role: "user" as const,
        }
      : undefined,
  }),

  toAPI: (reservation: Partial<Reservation>): ApiReservationData => ({
    espace_id: reservation.espaceId,
    date_debut: reservation.dateDebut,
    date_fin: reservation.dateFin,
    statut: reservation.statut,
    notes: reservation.notes,
  }),
};

export const abonnementAdapter = {
  fromAPI: (apiData: ApiAbonnement): Abonnement => ({
    id: String(apiData.id || ""),
    nom: String(apiData.nom || ""),
    type: String(apiData.type || ""),
    prix: Number(apiData.prix || 0),
    prixAvecDomiciliation: Number(apiData.prix_avec_domiciliation || 0),
    creditsMensuels: Number(apiData.credits_mensuels || 0),
    creditMensuel: Number(apiData.credits_mensuels || 0),
    dureeMois: Number(apiData.duree_mois || 1),
    dureeJours: (Number(apiData.duree_mois) || 1) * 30,
    description: String(apiData.description || ""),
    avantages: (apiData.avantages as string[]) || [],
    actif: Boolean(apiData.actif),
    couleur: String(apiData.couleur || "#3B82F6"),
    ordre: Number(apiData.ordre || 0),
    createdAt: apiData.created_at as string | undefined,
    updatedAt: (apiData.updated_at || apiData.created_at) as string | undefined,
  }),

  toAPI: (abonnement: Partial<Abonnement>): ApiAbonnementData => ({
    nom: abonnement.nom,
    type: abonnement.type,
    prix: abonnement.prix,
    prix_avec_domiciliation: abonnement.prixAvecDomiciliation,
    duree_mois: abonnement.dureeMois,
    description: abonnement.description,
    avantages: abonnement.avantages,
    actif: abonnement.actif,
    ordre: abonnement.ordre,
  }),
};

export const userAdapter = {
  fromAPI: (apiData: ApiUser): User => ({
    id: String(apiData.id || ""),
    email: String(apiData.email || ""),
    nom: String(apiData.nom || ""),
    prenom: String(apiData.prenom || ""),
    telephone: apiData.telephone as string | undefined,
    role: String(apiData.role || "user") as User["role"],
    statut: String(apiData.statut || "actif") as User["statut"],
    avatar: apiData.avatar as string | undefined,
    profession: apiData.profession as string | undefined,
    entreprise: apiData.entreprise as string | undefined,
    adresse: apiData.adresse as string | undefined,
    bio: apiData.bio as string | undefined,
    wilaya: apiData.wilaya as string | undefined,
    commune: apiData.commune as string | undefined,
    typeEntreprise: apiData.type_entreprise as string | undefined,
    nif: apiData.nif as string | undefined,
    nis: apiData.nis as string | undefined,
    registreCommerce: apiData.registre_commerce as string | undefined,
    articleImposition: apiData.article_imposition as string | undefined,
    numeroAutoEntrepreneur: apiData.numero_auto_entrepreneur as
      | string
      | undefined,
    raisonSociale: apiData.raison_sociale as string | undefined,
    dateCreationEntreprise: apiData.date_creation_entreprise as
      | string
      | undefined,
    capital: apiData.capital as string | undefined,
    siegeSocial: apiData.siege_social as string | undefined,
    activitePrincipale: apiData.activite_principale as string | undefined,
    formeJuridique: apiData.forme_juridique as string | undefined,
    absences: apiData.absences as number | undefined,
    bannedUntil: apiData.banned_until as string | undefined,
    derniereConnexion: apiData.derniere_connexion as string | undefined,
    dateCreation: apiData.created_at as string | undefined,
    createdAt: apiData.created_at as string | undefined,
    updatedAt: apiData.updated_at as string | undefined,
  }),

  toAPI: (user: Partial<User>): Record<string, unknown> => {
    const apiData: Record<string, unknown> = {};

    const fieldMapping: Record<string, string> = {
      nom: "nom",
      prenom: "prenom",
      telephone: "telephone",
      profession: "profession",
      entreprise: "entreprise",
      adresse: "adresse",
      bio: "bio",
      wilaya: "wilaya",
      commune: "commune",
      avatar: "avatar",
      typeEntreprise: "type_entreprise",
      nif: "nif",
      nis: "nis",
      registreCommerce: "registre_commerce",
      articleImposition: "article_imposition",
      numeroAutoEntrepreneur: "numero_auto_entrepreneur",
      raisonSociale: "raison_sociale",
      dateCreationEntreprise: "date_creation_entreprise",
      capital: "capital",
      siegeSocial: "siege_social",
      activitePrincipale: "activite_principale",
      formeJuridique: "forme_juridique",
    };

    Object.entries(fieldMapping).forEach(([camelKey, snakeKey]) => {
      if (user[camelKey as keyof User] !== undefined) {
        apiData[snakeKey] = user[camelKey as keyof User];
      }
    });

    return apiData;
  },
};

export const domiciliationAdapter = {
  fromAPI: (apiData: ApiDomiciliation): DemandeDomiciliation => ({
    id: String(apiData.id || ""),
    userId: String(apiData.user_id || ""),
    utilisateur: apiData.utilisateur as User | undefined,
    raisonSociale: String(apiData.raison_sociale || ""),
    formeJuridique: String(apiData.forme_juridique || ""),
    nif: String(apiData.nif || ""),
    nis: String(apiData.nis || ""),
    registreCommerce: String(apiData.registre_commerce || ""),
    articleImposition: String(apiData.article_imposition || ""),
    coordonneesFiscales: apiData.coordonnees_fiscales as string | undefined,
    coordonneesAdministratives: apiData.coordonnees_administratives as
      | string
      | undefined,
    representantLegal:
      typeof apiData.representant_legal === "string"
        ? JSON.parse(apiData.representant_legal)
        : (apiData.representant_legal as DemandeDomiciliation["representantLegal"]),
    domaineActivite: String(apiData.domaine_activite || ""),
    adresseSiegeSocial: String(apiData.adresse_siege_social || ""),
    capital: apiData.capital as string | undefined,
    dateCreationEntreprise: apiData.date_creation_entreprise as
      | string
      | undefined,
    statut: String(
      apiData.statut || "en_attente",
    ) as DemandeDomiciliation["statut"],
    commentaireAdmin: apiData.commentaire_admin as string | undefined,
    dateValidation: apiData.date_validation as string | undefined,
    dateCreation: apiData.created_at as string | undefined,
    updatedAt: apiData.updated_at as string | undefined,
  }),

  toAPI: (
    domiciliation: Partial<DemandeDomiciliation>,
  ): ApiDomiciliationData => ({
    raison_sociale: domiciliation.raisonSociale,
    forme_juridique: domiciliation.formeJuridique,
    nif: domiciliation.nif,
    nis: domiciliation.nis,
    registre_commerce: domiciliation.registreCommerce,
    article_imposition: domiciliation.articleImposition,
    representant_legal: domiciliation.representantLegal,
    domaine_activite: domiciliation.domaineActivite,
    adresse_siege_social: domiciliation.adresseSiegeSocial,
    capital: domiciliation.capital,
    date_creation_entreprise: domiciliation.dateCreationEntreprise,
  }),
};
