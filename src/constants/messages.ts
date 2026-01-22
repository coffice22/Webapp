/**
 * Messages centralisés pour l'application
 * Facilite la maintenance et la traduction future
 */

export const SUCCESS_MESSAGES = {
  RESERVATION_CREATED: "Votre réservation a été créée avec succès",
  RESERVATION_UPDATED: "Votre réservation a été modifiée avec succès",
  RESERVATION_CANCELLED: "Votre réservation a été annulée",
  PROFILE_UPDATED: "Votre profil a été mis à jour",
  PASSWORD_CHANGED: "Votre mot de passe a été changé",
  DOMICILIATION_SUBMITTED: "Votre demande de domiciliation a été envoyée",
  DOMICILIATION_UPDATED: "La demande de domiciliation a été mise à jour",
  USER_CREATED: "Utilisateur créé avec succès",
  USER_UPDATED: "Utilisateur mis à jour avec succès",
  USER_DELETED: "Utilisateur supprimé avec succès",
  SPACE_CREATED: "Espace créé avec succès",
  SPACE_UPDATED: "Espace mis à jour avec succès",
  SPACE_DELETED: "Espace supprimé avec succès",
  PROMO_CODE_APPLIED: "Code promo appliqué avec succès",
  PROMO_CODE_CREATED: "Code promo créé avec succès",
  PROMO_CODE_UPDATED: "Code promo mis à jour avec succès",
  PROMO_CODE_DELETED: "Code promo supprimé avec succès",
  COPIED_TO_CLIPBOARD: "Copié dans le presse-papier",
  LINK_COPIED: "Lien copié",
  CODE_COPIED: "Code copié",
  DATA_EXPORTED: "Données exportées avec succès",
  SETTINGS_SAVED: "Paramètres enregistrés",
  NOTIFICATION_READ: "Notification marquée comme lue",
  ALL_NOTIFICATIONS_READ:
    "Toutes les notifications ont été marquées comme lues",
} as const;

export const ERROR_MESSAGES = {
  NETWORK_ERROR: "Erreur de connexion. Vérifiez votre connexion internet.",
  SERVER_ERROR: "Erreur serveur. Veuillez réessayer plus tard.",
  SESSION_EXPIRED: "Votre session a expiré. Veuillez vous reconnecter.",
  UNAUTHORIZED: "Vous n'êtes pas autorisé à effectuer cette action.",
  INVALID_CREDENTIALS: "Email ou mot de passe incorrect.",
  EMAIL_ALREADY_EXISTS: "Cet email est déjà utilisé.",
  USER_NOT_FOUND: "Utilisateur introuvable.",
  INVALID_EMAIL: "Adresse email invalide.",
  INVALID_PHONE: "Numéro de téléphone invalide.",
  PASSWORD_TOO_SHORT: "Le mot de passe doit contenir au moins 6 caractères.",
  PASSWORDS_DONT_MATCH: "Les mots de passe ne correspondent pas.",
  REQUIRED_FIELD: "Ce champ est requis.",
  INVALID_DATE: "Date invalide.",
  DATE_IN_PAST: "La date doit être dans le futur.",
  END_DATE_BEFORE_START: "La date de fin doit être après la date de début.",
  SPACE_NOT_AVAILABLE: "Cet espace n'est pas disponible pour ces dates.",
  INVALID_PROMO_CODE: "Code promo invalide ou expiré.",
  PROMO_CODE_ALREADY_USED: "Vous avez déjà utilisé ce code promo.",
  PROMO_CODE_LIMIT_REACHED: "Ce code promo a atteint sa limite d'utilisations.",
  AMOUNT_TOO_LOW: "Le montant minimum n'est pas atteint pour ce code promo.",
  FILE_TOO_LARGE: "Le fichier est trop volumineux.",
  FILE_INVALID_TYPE: "Type de fichier non supporté.",
  UNKNOWN_ERROR: "Une erreur est survenue. Veuillez réessayer.",
} as const;

export const INFO_MESSAGES = {
  LOADING: "Chargement en cours...",
  SAVING: "Enregistrement en cours...",
  DELETING: "Suppression en cours...",
  UPLOADING: "Téléchargement en cours...",
  PROCESSING: "Traitement en cours...",
  NO_DATA: "Aucune donnée disponible.",
  NO_RESERVATIONS: "Vous n'avez aucune réservation.",
  NO_NOTIFICATIONS: "Aucune notification.",
  EMPTY_LIST: "La liste est vide.",
  SELECT_SPACE: "Sélectionnez un espace pour commencer.",
  SELECT_DATES: "Sélectionnez les dates de réservation.",
  FILL_ALL_FIELDS: "Veuillez remplir tous les champs requis.",
} as const;

export const CONFIRMATION_MESSAGES = {
  DELETE_RESERVATION: "Êtes-vous sûr de vouloir annuler cette réservation ?",
  DELETE_USER: "Êtes-vous sûr de vouloir supprimer cet utilisateur ?",
  DELETE_SPACE: "Êtes-vous sûr de vouloir supprimer cet espace ?",
  DELETE_PROMO_CODE: "Êtes-vous sûr de vouloir supprimer ce code promo ?",
  LOGOUT: "Êtes-vous sûr de vouloir vous déconnecter ?",
  CANCEL_CHANGES: "Êtes-vous sûr de vouloir annuler vos modifications ?",
  CONFIRM_ACTION: "Confirmer cette action ?",
} as const;

export const STATUS_LABELS = {
  RESERVATION: {
    confirmee: "Confirmée",
    en_attente: "En attente",
    en_cours: "En cours",
    annulee: "Annulée",
    terminee: "Terminée",
  },
  DOMICILIATION: {
    en_attente: "En attente de validation",
    validee: "Validée",
    active: "Active",
    rejetee: "Rejetée",
    refusee: "Refusée",
    expiree: "Expirée",
    resiliee: "Résiliée",
  },
  USER: {
    actif: "Actif",
    inactif: "Inactif",
    suspendu: "Suspendu",
  },
  PAYMENT: {
    en_attente: "En attente",
    validee: "Validé",
    echouee: "Échoué",
    rembourse: "Remboursé",
  },
} as const;

export const PLACEHOLDERS = {
  EMAIL: "exemple@email.com",
  PHONE: "0555 12 34 56",
  PHONE_WITH_CODE: "+213 5 55 12 34 56",
  PASSWORD: "••••••••",
  SEARCH: "Rechercher...",
  NOTES: "Ajouter des notes (optionnel)...",
  PROMO_CODE: "Entrez votre code promo",
  AMOUNT: "0",
  SELECT: "Sélectionner...",
  DATE: "JJ/MM/AAAA",
  TIME: "HH:MM",
} as const;

export const VALIDATION_MESSAGES = {
  PHONE: {
    INVALID:
      "Numéro de téléphone invalide (format: 0555123456 ou +213555123456)",
    REQUIRED: "Le numéro de téléphone est requis",
  },
  NIF: {
    INVALID: "NIF invalide (20 caractères numériques requis)",
    REQUIRED: "Le NIF est requis",
  },
  NIS: {
    INVALID: "NIS invalide (15 caractères numériques requis)",
    REQUIRED: "Le NIS est requis",
  },
  RC: {
    INVALID: "Numéro de registre de commerce invalide",
    REQUIRED: "Le numéro de registre de commerce est requis",
  },
  AMOUNT: {
    INVALID: "Montant invalide",
    POSITIVE: "Le montant doit être positif",
    REQUIRED: "Le montant est requis",
  },
} as const;
