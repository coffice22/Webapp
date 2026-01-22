/**
 * Règles de validation centralisées pour l'application
 * Utilisé avec react-hook-form pour garantir la cohérence
 */

import { NIF_VALIDATION, NIS_VALIDATION, RC_VALIDATION, validateNIF, validateNIS, validateAlgerianPhone } from '../constants/algeria'
import { VALIDATION_MESSAGES } from '../constants/messages'

export const validationRules = {
  email: {
    required: 'Email requis',
    pattern: {
      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
      message: 'Email invalide'
    }
  },

  password: {
    required: 'Mot de passe requis',
    minLength: {
      value: 6,
      message: 'Le mot de passe doit contenir au moins 6 caractères'
    },
    maxLength: {
      value: 128,
      message: 'Le mot de passe ne peut pas dépasser 128 caractères'
    }
  },

  passwordConfirm: (password: string) => ({
    required: 'Confirmation du mot de passe requise',
    validate: (value: string) => value === password || 'Les mots de passe ne correspondent pas'
  }),

  phone: {
    pattern: {
      value: /^(\+213|0)?[5-7][0-9]{8}$/,
      message: VALIDATION_MESSAGES.PHONE.INVALID
    },
    validate: (value: string) => !value || validateAlgerianPhone(value) || VALIDATION_MESSAGES.PHONE.INVALID
  },

  phoneRequired: {
    required: VALIDATION_MESSAGES.PHONE.REQUIRED,
    pattern: {
      value: /^(\+213|0)?[5-7][0-9]{8}$/,
      message: VALIDATION_MESSAGES.PHONE.INVALID
    },
    validate: (value: string) => validateAlgerianPhone(value) || VALIDATION_MESSAGES.PHONE.INVALID
  },

  nif: {
    required: VALIDATION_MESSAGES.NIF.REQUIRED,
    validate: (value: string) => validateNIF(value) || VALIDATION_MESSAGES.NIF.INVALID
  },

  nis: {
    required: VALIDATION_MESSAGES.NIS.REQUIRED,
    validate: (value: string) => validateNIS(value) || VALIDATION_MESSAGES.NIS.INVALID
  },

  rc: {
    required: VALIDATION_MESSAGES.RC.REQUIRED,
    pattern: {
      value: RC_VALIDATION.PATTERN,
      message: VALIDATION_MESSAGES.RC.INVALID
    }
  },

  nom: {
    required: 'Nom requis',
    minLength: {
      value: 2,
      message: 'Le nom doit contenir au moins 2 caractères'
    },
    maxLength: {
      value: 50,
      message: 'Le nom ne peut pas dépasser 50 caractères'
    }
  },

  prenom: {
    required: 'Prénom requis',
    minLength: {
      value: 2,
      message: 'Le prénom doit contenir au moins 2 caractères'
    },
    maxLength: {
      value: 50,
      message: 'Le prénom ne peut pas dépasser 50 caractères'
    }
  },

  required: (fieldName: string) => ({
    required: `${fieldName} requis`
  }),

  minLength: (length: number, fieldName = 'Ce champ') => ({
    minLength: {
      value: length,
      message: `${fieldName} doit contenir au moins ${length} caractères`
    }
  }),

  maxLength: (length: number, fieldName = 'Ce champ') => ({
    maxLength: {
      value: length,
      message: `${fieldName} ne peut pas dépasser ${length} caractères`
    }
  }),

  dateInFuture: {
    validate: (value: string) => {
      const date = new Date(value)
      const now = new Date()
      return date > now || 'La date doit être dans le futur'
    }
  },

  dateAfter: (startDate: Date | string) => ({
    validate: (value: string) => {
      const endDate = new Date(value)
      const start = new Date(startDate)
      return endDate > start || 'La date de fin doit être après la date de début'
    }
  }),

  amount: {
    required: 'Montant requis',
    validate: (value: number) => {
      if (isNaN(value) || value < 0) {
        return 'Le montant doit être un nombre positif'
      }
      return true
    }
  },

  acceptTerms: {
    required: 'Vous devez accepter les conditions'
  }
}

/**
 * Valider manuellement un email
 */
export function isValidEmail(email: string): boolean {
  const pattern = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i
  return pattern.test(email)
}

/**
 * Valider manuellement un téléphone algérien
 */
export function isValidPhone(phone: string): boolean {
  return validateAlgerianPhone(phone)
}

/**
 * Valider manuellement un mot de passe
 */
export function isValidPassword(password: string): boolean {
  return password.length >= 6 && password.length <= 128
}

/**
 * Nettoyer un numéro de téléphone pour l'envoyer à l'API
 */
export function cleanPhoneNumber(phone: string): string {
  if (!phone) return ''
  return phone.replace(/[\s\-\(\)]/g, '')
}

/**
 * Valider une plage de dates
 */
export function validateDateRange(startDate: Date | string, endDate: Date | string): {
  valid: boolean
  error?: string
} {
  const start = new Date(startDate)
  const end = new Date(endDate)
  const now = new Date()

  if (isNaN(start.getTime())) {
    return { valid: false, error: 'Date de début invalide' }
  }

  if (isNaN(end.getTime())) {
    return { valid: false, error: 'Date de fin invalide' }
  }

  if (start < now) {
    return { valid: false, error: 'La date de début doit être dans le futur' }
  }

  if (end <= start) {
    return { valid: false, error: 'La date de fin doit être après la date de début' }
  }

  return { valid: true }
}
