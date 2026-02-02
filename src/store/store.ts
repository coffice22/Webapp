import { create } from "zustand";
import { persist } from "zustand/middleware";
import { apiClient } from "../lib/api-client";
import toast from "react-hot-toast";
import type {
  User,
  Espace,
  Reservation,
  Transaction,
  DemandeDomiciliation,
  DomiciliationService,
  CodePromo,
  CreateReservationData,
  CreateDomiciliationData,
  AdminStats,
  Abonnement,
  AbonnementUtilisateur,
} from "../types";

interface NotificationSettings {
  emailNotificationsEnabled: boolean;
  reservationReminders: boolean;
  paymentNotifications: boolean;
  maintenanceAlerts: boolean;
}

interface AppState {
  users: User[];
  espaces: Espace[];
  reservations: Reservation[];
  transactions: Transaction[];
  demandesDomiciliation: DemandeDomiciliation[];
  domiciliationServices: DomiciliationService[];
  codesPromo: CodePromo[];
  abonnements: Abonnement[];
  abonnementsUtilisateurs: AbonnementUtilisateur[];
  notificationSettings: NotificationSettings;
  initialized: boolean;
  loading: boolean;

  initializeData: () => Promise<void>;

  loadAbonnements: () => Promise<void>;
  addAbonnement: (
    data: Partial<Abonnement>,
  ) => Promise<{ success: boolean; error?: string }>;
  updateAbonnement: (
    id: string,
    data: Partial<Abonnement>,
  ) => Promise<{ success: boolean; error?: string }>;

  loadEspaces: () => Promise<void>;
  addEspace: (
    data: Partial<Espace>,
  ) => Promise<{ success: boolean; error?: string }>;
  updateEspace: (
    id: string,
    data: Partial<Espace>,
  ) => Promise<{ success: boolean; error?: string }>;
  deleteEspace: (id: string) => Promise<{ success: boolean; error?: string }>;

  loadReservations: () => Promise<void>;
  createReservation: (
    data: CreateReservationData,
  ) => Promise<{ success: boolean; error?: string; id?: string }>;
  updateReservation: (
    id: string,
    data: Partial<Reservation>,
  ) => Promise<{ success: boolean; error?: string }>;
  calculateReservationAmount: (
    espaceId: string,
    dateDebut: Date,
    dateFin: Date,
    codePromo?: string,
  ) => number;

  loadDemandesDomiciliation: () => Promise<void>;
  getUserDemandeDomiciliation: (userId: string) => DemandeDomiciliation | null;
  createDemandeDomiciliation: (
    data: CreateDomiciliationData,
  ) => Promise<{ success: boolean; error?: string }>;

  loadUsers: () => Promise<void>;
  addUser: (
    data: Partial<User>,
  ) => Promise<{ success: boolean; error?: string }>;
  updateUser: (userId: string, data: Record<string, unknown>) => Promise<void>;
  deleteUser: (userId: string) => Promise<{ success: boolean; error?: string }>;

  getAdminStats: () => AdminStats;
  getNotificationSettings: () => NotificationSettings;
  updateNotificationSettings: (settings: Partial<NotificationSettings>) => void;
}

const defaultNotificationSettings: NotificationSettings = {
  emailNotificationsEnabled: true,
  reservationReminders: true,
  paymentNotifications: true,
  maintenanceAlerts: true,
};

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      users: [],
      espaces: [],
      reservations: [],
      transactions: [],
      demandesDomiciliation: [],
      domiciliationServices: [],
      codesPromo: [],
      abonnements: [],
      abonnementsUtilisateurs: [],
      notificationSettings: defaultNotificationSettings,
      initialized: false,
      loading: false,

      initializeData: async () => {
        const state = get();
        if (state.loading) return;

        set({ loading: true });

        try {
          await Promise.all([
            get().loadEspaces(),
            get().loadReservations(),
            get().loadDemandesDomiciliation()
          ]);

          set({ initialized: true });
        } catch (error) {
          console.error("Erreur initialisation:", error);
        } finally {
          set({ loading: false });
        }
      },

      loadEspaces: async () => {
        try {
          const response = await apiClient.getEspaces();
          if (
            response.success &&
            response.data &&
            Array.isArray(response.data)
          ) {
            const espaces = response.data.map((e: Record<string, unknown>) => ({
              id: e.id,
              nom: e.nom,
              type: e.type,
              capacite: e.capacite,
              prixHeure: e.prix_heure,
              prixDemiJournee: e.prix_demi_journee || 0,
              prixJour: e.prix_jour,
              prixSemaine: e.prix_semaine,
              description: e.description,
              equipements: e.equipements || [],
              disponible: e.disponible,
              etage: e.etage,
              image: e.image_url,
              imageUrl: e.image_url,
              createdAt: e.created_at,
              updatedAt: e.updated_at,
            }));
            set({ espaces });
          }
        } catch (error) {
          console.error("Erreur chargement espaces:", error);
        }
      },

      addEspace: async (data) => {
        try {
          const response = await apiClient.createEspace(data);
          if (response.success) {
            await get().loadEspaces();
            return { success: true };
          }
          return { success: false, error: response.error };
        } catch (error) {
          return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
        }
      },

      updateEspace: async (id, data) => {
        try {
          const response = await apiClient.updateEspace(id, data as Record<string, unknown>);
          if (response.success) {
            await get().loadEspaces();
            return { success: true };
          }
          return { success: false, error: response.error };
        } catch (error) {
          return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
        }
      },

      deleteEspace: async (id) => {
        try {
          const response = await apiClient.deleteEspace(id);
          if (response.success) {
            await get().loadEspaces();
            return { success: true };
          }
          return { success: false, error: response.error };
        } catch (error) {
          return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
        }
      },

      loadAbonnements: async () => {
        try {
          const response = await apiClient.getAbonnements();
          if (
            response.success &&
            response.data &&
            Array.isArray(response.data)
          ) {
            const abonnements = response.data.map((a: Record<string, unknown>) => ({
              id: a.id,
              nom: a.nom,
              type: a.type,
              prix: a.prix,
              prixAvecDomiciliation: a.prix_avec_domiciliation,
              creditsMensuels: a.credits_mensuels,
              creditMensuel: a.credits_mensuels,
              dureeMois: a.duree_mois,
              dureeJours: (a.duree_mois || 1) * 30,
              description: a.description,
              avantages: a.avantages || [],
              actif: a.actif,
              statut: a.statut,
              couleur: a.couleur || "#3B82F6",
              ordre: a.ordre,
              createdAt: a.created_at,
              updatedAt: a.updated_at,
            }));
            set({ abonnements });
          }
        } catch (error) {
          console.error("Erreur chargement abonnements:", error);
        }
      },

      addAbonnement: async (data) => {
        try {
          const response = await apiClient.createAbonnement(data as Record<string, unknown>);
          if (response.success) {
            await get().loadAbonnements();
            return { success: true };
          }
          return { success: false, error: response.error };
        } catch (error) {
          return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
        }
      },

      updateAbonnement: async (id, data) => {
        try {
          const response = await apiClient.updateAbonnement(id, data as Record<string, unknown>);
          if (response.success) {
            await get().loadAbonnements();
            return { success: true };
          }
          return { success: false, error: response.error };
        } catch (error) {
          return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
        }
      },

      loadReservations: async () => {
        try {
          const response = await apiClient.getReservations();
          if (
            response.success &&
            response.data &&
            Array.isArray(response.data)
          ) {
            const reservations = response.data.map((r: Record<string, unknown>) => ({
              id: r.id,
              userId: r.user_id,
              espaceId: r.espace_id,
              dateDebut: r.date_debut,
              dateFin: r.date_fin,
              statut: r.statut,
              typeReservation: r.type_reservation,
              montantTotal: parseFloat(r.montant_total as string) || 0,
              reduction: parseFloat(r.reduction as string) || 0,
              montantPaye: parseFloat(r.montant_paye as string) || 0,
              modePaiement: r.mode_paiement,
              notes: r.notes,
              dateCreation: r.created_at,
              createdAt: r.created_at,
              espace: r.espace_nom
                ? {
                    id: r.espace_id,
                    nom: r.espace_nom,
                    type: r.espace_type,
                  }
                : undefined,
              utilisateur: r.user_nom
                ? {
                    id: r.user_id,
                    nom: r.user_nom,
                    prenom: r.user_prenom,
                    email: r.user_email,
                    role: "user" as const,
                  }
                : undefined,
            }));
            set({ reservations });
          }
        } catch (error) {
          console.error("Erreur chargement reservations:", error);
        }
      },

      createReservation: async (data: CreateReservationData) => {
        try {
          // Ne jamais envoyer montantTotal - le serveur le calcule de manière sécurisée
          const response = await apiClient.createReservation({
            espaceId: data.espaceId,
            dateDebut: data.dateDebut.toISOString(),
            dateFin: data.dateFin.toISOString(),
            participants: data.participants,
            notes: data.notes,
            codePromo: data.codePromo,
          });

          if (response.success) {
            await get().loadReservations();
            const responseData = response.data as { id?: string } | undefined;
            return { success: true, id: responseData?.id };
          }
          return {
            success: false,
            error: response.error || "Erreur lors de la creation",
          };
        } catch (error) {
          return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
        }
      },

      updateReservation: async (id, data) => {
        try {
          const response = await apiClient.updateReservation(id, data as Record<string, unknown>);
          if (response.success) {
            await get().loadReservations();
            return { success: true };
          }
          return { success: false, error: response.error };
        } catch (error) {
          return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
        }
      },

      calculateReservationAmount: (espaceId, dateDebut, dateFin) => {
        const espace = get().espaces.find((e) => e.id === espaceId);
        if (!espace) return 0;

        const diffMs = dateFin.getTime() - dateDebut.getTime();
        const diffHours = diffMs / (1000 * 60 * 60);

        let amount = 0;

        if (diffHours < 24) {
          amount = Math.ceil(diffHours) * espace.prixHeure;
        } else {
          const diffDays = Math.ceil(diffHours / 24);

          if (diffDays >= 7 && espace.prixSemaine) {
            const weeks = Math.floor(diffDays / 7);
            const remainingDays = diffDays % 7;
            amount =
              weeks * espace.prixSemaine + remainingDays * espace.prixJour;
          } else {
            amount = diffDays * espace.prixJour;
          }
        }

        return Math.round(amount);
      },

      loadDemandesDomiciliation: async () => {
        try {
          const response = await apiClient.getDomiciliations();
          
          
          if (response.success && response.data) {
            // ← CORRECTION ICI : extraire response.data.data
            const rawData = Array.isArray(response.data) 
              ? response.data 
              : response.data.data || [];  // ← Accéder à data.data
            
            const demandesDomiciliation = rawData.map((d: Record<string, unknown>) => ({
              id: d.id,
              userId: d.user_id,
              utilisateur: d.utilisateur,
              raisonSociale: d.raison_sociale,
              formeJuridique: d.forme_juridique,
              nif: d.nif,
              nis: d.nis,
              registreCommerce: d.registre_commerce,
              articleImposition: d.article_imposition,
              coordonneesFiscales: d.coordonnees_fiscales,
              coordonneesAdministratives: d.coordonnees_administratives,
              representantLegal: {
                nom: d.representant_nom,
                prenom: d.representant_prenom,
                fonction: d.representant_fonction,
                telephone: d.representant_telephone,
                email: d.representant_email,
              },
              domaineActivite: d.domaine_activite,
              adresseSiegeSocial: d.adresse_siege_social,
              capital: d.capital,
              dateCreationEntreprise: d.date_creation_entreprise,
              statut: d.statut,
              commentaireAdmin: d.commentaire_admin,
              montantMensuel: d.montant_mensuel,  // ← AJOUTE CECI (pour afficher le tarif)
              dateValidation: d.date_validation,
              dateCreation: d.created_at,
              updatedAt: d.updated_at,
            }));
          
            const domiciliationServices = demandesDomiciliation
              .filter((d: DemandeDomiciliation) => d.statut === "validee")
              .map((d: DemandeDomiciliation) => ({
                id: d.id,
                userId: d.userId,
                demande: d,
                companyName: d.raisonSociale,
                legalForm: d.formeJuridique,
                identification: {
                  typeEntreprise: d.formeJuridique,
                  nif: d.nif,
                  nis: d.nis,
                  registreCommerce: d.registreCommerce,
                  articleImposition: d.articleImposition,
                  raisonSociale: d.raisonSociale,
                  dateCreation: d.dateCreationEntreprise,
                  capital: d.capital,
                  siegeSocial: d.adresseSiegeSocial,
                  activitePrincipale: d.domaineActivite,
                },
                startDate: d.dateValidation || d.dateCreation,
                endDate: new Date(
                  new Date(d.dateValidation || d.dateCreation).setFullYear(
                    new Date(d.dateValidation || d.dateCreation).getFullYear() + 1,
                  ),
                ),
                status: "active" as const,
                address: "Mohammadia Mall, 4eme etage, Bureau 1178, Alger",
                services: [
                  "Domiciliation",
                  "Courrier",
                  "Support administratif",
                ],
                monthlyFee: 22000,
                setupFee: 0,
                documentsLegaux: [],
                representantLegal: d.representantLegal,
                activityDomain: d.domaineActivite,
                dateSignatureContrat: d.dateValidation,
                numeroContrat: `DOM-${d.id.substring(0, 8).toUpperCase()}`,
                visibleSurSite: true,
                createdAt: d.dateCreation,
                updatedAt: d.updatedAt,
              }));

            set({ demandesDomiciliation, domiciliationServices });
          } else {
            set({ demandesDomiciliation: [], domiciliationServices: [] });
          }
        } catch (error) {
          console.error("Erreur chargement domiciliations:", error);
          set({ demandesDomiciliation: [], domiciliationServices: [] });
        }
      },

      getUserDemandeDomiciliation: (userId) => {
        return (
          get().demandesDomiciliation.find((d) => d.userId === userId) || null
        );
      },

      createDemandeDomiciliation: async (data) => {
        try {
          const response = await apiClient.createDemandeDomiciliation(data);
          if (response.success) {
            await get().loadDemandesDomiciliation();
            return { success: true };
          }
          return { success: false, error: response.error || "Erreur creation" };
        } catch (error) {
          return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
        }
      },

      loadUsers: async () => {
        try {
          const response = await apiClient.getUsers();
          if (response.success && response.data) {
            // L'API retourne { data: { data: [...], pagination: {...} } }
            const userData = Array.isArray(response.data)
              ? response.data
              : response.data.data || [];

            const users = userData.map((u: Record<string, unknown>) => ({
              ...u,
              dateCreation: u.created_at,
              derniereConnexion: u.last_login,
            }));
            set({ users });
          }
        } catch (error) {
          logger.error("Erreur chargement utilisateurs:", error);
        }
      },

      addUser: async (data) => {
        try {
          const response = await apiClient.register({
            email: data.email || "",
            password: data.password || "",
            nom: data.nom || "",
            prenom: data.prenom || "",
            telephone: data.telephone,
            profession: data.profession,
            entreprise: data.entreprise,
          });

          if (response.success) {
            await get().loadUsers();
            return { success: true };
          }
          return { success: false, error: response.error };
        } catch (error) {
          return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
        }
      },

      updateUser: async (userId, data) => {
        try {
          const response = await apiClient.updateUser(userId, data);
          if (!response.success) {
            throw new Error(response.error || "Erreur mise a jour");
          }

          const { user, loadUser } = (
            await import("./authStore")
          ).useAuthStore.getState();

          if (user?.id === userId) {
            await loadUser();
          }

          if (user?.role === "admin") {
            await get().loadUsers();
          }

          toast.success("Informations mises a jour");
        } catch (error) {
          toast.error(error instanceof Error ? error.message : "Erreur");
          throw error;
        }
      },

      deleteUser: async (userId) => {
        try {
          const response = await apiClient.deleteUser(userId);
          if (response.success) {
            await get().loadUsers();
            return { success: true };
          }
          return { success: false, error: response.error };
        } catch (error) {
          return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
        }
      },

      getAdminStats: () => {
        const state = get();
        const today = new Date();
        const thisMonth = today.getMonth();
        const thisYear = today.getFullYear();

        const reservationsCeMois = state.reservations.filter((r) => {
          const date = new Date(r.dateCreation || r.createdAt);
          return (
            date.getMonth() === thisMonth && date.getFullYear() === thisYear
          );
        });

        const caMois = reservationsCeMois.reduce(
          (sum, r) => sum + (r.montantTotal || 0),
          0,
        );

        const espacesOccupes = state.espaces.filter(
          (e) => !e.disponible,
        ).length;
        const tauxOccupation =
          state.espaces.length > 0
            ? Math.round((espacesOccupes / state.espaces.length) * 100)
            : 0;

        return {
          totalRevenue: state.transactions.reduce(
            (sum, t) => sum + (t.montant || 0),
            0,
          ),
          totalReservations: state.reservations.length,
          totalUsers: state.users.length,
          activeUsers: state.users.filter((u) => u.statut === "actif").length,
          occupancyRate: tauxOccupation,
          tauxOccupation,
          monthlyRevenue: caMois,
          caMois,
          reservationsCeMois: reservationsCeMois.length,
          popularSpaces: state.espaces.slice(0, 5).map((e) => ({
            name: e.nom,
            count: state.reservations.filter((r) => r.espaceId === e.id).length,
          })),
          recentActivity: state.reservations.slice(0, 10).map((r) => ({
            type: "reservation",
            description: `Reservation ${r.espace?.nom || "Espace"}`,
            date: new Date(r.dateCreation || r.createdAt),
          })),
        };
      },

      getNotificationSettings: () => {
        return get().notificationSettings;
      },

      updateNotificationSettings: (settings) => {
        set((state) => ({
          notificationSettings: { ...state.notificationSettings, ...settings },
        }));
      },
    }),
    {
      name: "coffice-app-storage",
      partialize: (state) => ({
        notificationSettings: state.notificationSettings,
      }),
    },
  ),
);
