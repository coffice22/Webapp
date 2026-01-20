/**
 * Constantes spécifiques au contexte algérien
 */

export const ALGERIA_CONSTANTS = {
  COUNTRY_CODE: '+213',
  CURRENCY: 'DZD',
  CURRENCY_SYMBOL: 'DA',
  LOCALE: 'fr-DZ',
  TIMEZONE: 'Africa/Algiers'
} as const

export const PHONE_PREFIXES = ['05', '06', '07'] as const

export const WILAYA_CODES = {
  ALGER: '16',
  ORAN: '31',
  CONSTANTINE: '25',
  ANNABA: '23',
  BLIDA: '09',
  BATNA: '05',
  DJELFA: '17',
  SETIF: '19',
  SIDI_BEL_ABBES: '22',
  BISKRA: '07',
  TEBESSA: '12',
  EL_OUED: '39',
  SKIKDA: '21',
  TIARET: '14',
  BEJAIA: '06',
  TLEMCEN: '13',
  OUARGLA: '30',
  BECHAR: '08',
  MOSTAGANEM: '27',
  BORDJ_BOU_ARRERIDJ: '34',
  CHLEF: '02',
  SOUK_AHRAS: '41',
  M_SILA: '28',
  MEDEA: '26',
  EL_BAYADH: '32',
  TINDOUF: '37',
  TISSEMSILT: '38',
  EL_TAREF: '36',
  JIJEL: '18',
  SAIDA: '20',
  KHENCHELA: '40',
  MILA: '43',
  AIN_DEFLA: '44',
  NAAMA: '45',
  AIN_TEMOUCHENT: '46',
  GHARDAIA: '47',
  RELIZANE: '48',
  TIMIMOUN: '49',
  BORDJ_BADJI_MOKHTAR: '50',
  OULED_DJELLAL: '51',
  BENI_ABBES: '52',
  IN_SALAH: '53',
  IN_GUEZZAM: '54',
  TOUGGOURT: '55',
  DJANET: '56',
  EL_M_GHAIR: '57',
  EL_MENIA: '58'
} as const

export const LEGAL_FORMS = {
  EURL: { code: 'EURL', label: 'EURL - Entreprise Unipersonnelle à Responsabilité Limitée' },
  SARL: { code: 'SARL', label: 'SARL - Société à Responsabilité Limitée' },
  SPA: { code: 'SPA', label: 'SPA - Société Par Actions' },
  SNC: { code: 'SNC', label: 'SNC - Société en Nom Collectif' },
  SCS: { code: 'SCS', label: 'SCS - Société en Commandite Simple' },
  AUTO_ENTREPRENEUR: { code: 'AUTO', label: 'Auto-Entrepreneur' },
  FREELANCE: { code: 'FREELANCE', label: 'Freelance' },
  AUTRE: { code: 'AUTRE', label: 'Autre' }
} as const

export const DOCUMENT_TYPES = {
  STATUTS: { code: 'statuts', label: 'Statuts de la société', required: true },
  KBIS: { code: 'kbis', label: 'Extrait de registre de commerce', required: true },
  NIF: { code: 'nif', label: 'Certificat NIF', required: true },
  NIS: { code: 'nis', label: 'Certificat NIS', required: true },
  RC: { code: 'rc', label: 'Registre de Commerce', required: true },
  ARTICLE_IMPOSITION: { code: 'article_imposition', label: 'Article d\'imposition', required: true },
  CARTE_AUTO_ENTREPRENEUR: { code: 'carte_auto_entrepreneur', label: 'Carte Auto-Entrepreneur', required: false },
  AUTRE: { code: 'autre', label: 'Autre document', required: false }
} as const

export const NIF_VALIDATION = {
  LENGTH: 20,
  PATTERN: /^[0-9]{20}$/,
  ERROR_MESSAGE: 'Le NIF doit contenir exactement 20 chiffres'
} as const

export const NIS_VALIDATION = {
  LENGTH: 15,
  PATTERN: /^[0-9]{15}$/,
  ERROR_MESSAGE: 'Le NIS doit contenir exactement 15 chiffres'
} as const

export const RC_VALIDATION = {
  PATTERN: /^[0-9A-Z\/-]+$/,
  ERROR_MESSAGE: 'Format de registre de commerce invalide'
} as const

export const BUSINESS_SECTORS = [
  'Services',
  'Commerce',
  'Industrie',
  'Technologie',
  'Immobilier',
  'Finance',
  'Santé',
  'Éducation',
  'Transport',
  'Agriculture',
  'Tourisme',
  'BTP - Construction',
  'Consulting',
  'Import/Export',
  'Restauration',
  'Artisanat',
  'Autre'
] as const

export const DOMICILIATION_SERVICES = [
  { code: 'ADDRESS', label: 'Adresse fiscale et administrative', included: true },
  { code: 'MAIL_RECEPTION', label: 'Réception du courrier', included: true },
  { code: 'MAIL_FORWARDING', label: 'Transfert du courrier', included: true },
  { code: 'PHONE', label: 'Numéro de téléphone dédié', included: false },
  { code: 'MEETING_ROOM', label: 'Accès salle de réunion', included: false },
  { code: 'COWORKING', label: 'Accès espace coworking', included: false },
  { code: 'ADMIN_SUPPORT', label: 'Support administratif', included: false }
] as const

export const PAYMENT_METHODS = [
  { code: 'CASH', label: 'Espèces (Cash)', icon: '💵' },
  { code: 'BANK_TRANSFER', label: 'Virement bancaire', icon: '🏦' },
  { code: 'CHEQUE', label: 'Chèque', icon: '📝' },
  { code: 'CCP', label: 'CCP (Compte Courant Postal)', icon: '📮' },
  { code: 'BARIDI_MOB', label: 'Baridi Mob', icon: '📱' },
  { code: 'CIB', label: 'Carte CIB', icon: '💳' }
] as const

export const TAX_RATES = {
  TVA_STANDARD: 19,
  TVA_REDUIT: 9,
  IRG: 35,
  TAP: 2
} as const

export const WORKING_HOURS = {
  START: '08:00',
  END: '18:00',
  LUNCH_START: '12:00',
  LUNCH_END: '13:00'
} as const

export const WEEKDAYS = {
  SUNDAY: 0,
  MONDAY: 1,
  TUESDAY: 2,
  WEDNESDAY: 3,
  THURSDAY: 4,
  FRIDAY: 5,
  SATURDAY: 6
} as const

export const WORKING_DAYS = [
  WEEKDAYS.SUNDAY,
  WEEKDAYS.MONDAY,
  WEEKDAYS.TUESDAY,
  WEEKDAYS.WEDNESDAY,
  WEEKDAYS.THURSDAY
] as const

export const HOLIDAYS_2025 = [
  { date: '2025-01-01', name: 'Nouvel An' },
  { date: '2025-01-12', name: 'Yennayer' },
  { date: '2025-05-01', name: 'Fête du Travail' },
  { date: '2025-07-05', name: 'Fête de l\'Indépendance' },
  { date: '2025-11-01', name: 'Anniversaire de la Révolution' }
] as const

/**
 * Valider un NIF algérien
 */
export function validateNIF(nif: string): boolean {
  if (!nif) return false
  const cleaned = nif.replace(/\s/g, '')
  return NIF_VALIDATION.PATTERN.test(cleaned)
}

/**
 * Valider un NIS algérien
 */
export function validateNIS(nis: string): boolean {
  if (!nis) return false
  const cleaned = nis.replace(/\s/g, '')
  return NIS_VALIDATION.PATTERN.test(cleaned)
}

/**
 * Valider un numéro de téléphone algérien
 */
export function validateAlgerianPhone(phone: string): boolean {
  if (!phone) return false
  const cleaned = phone.replace(/[\s\-\(\)]/g, '')
  return /^(\+213|0)?[5-7][0-9]{8}$/.test(cleaned)
}

/**
 * Formater un NIF pour l'affichage
 */
export function formatNIF(nif: string): string {
  if (!nif) return ''
  const cleaned = nif.replace(/\s/g, '')
  if (cleaned.length !== 20) return nif
  return `${cleaned.substring(0, 5)} ${cleaned.substring(5, 10)} ${cleaned.substring(10, 15)} ${cleaned.substring(15, 20)}`
}

/**
 * Formater un NIS pour l'affichage
 */
export function formatNIS(nis: string): string {
  if (!nis) return ''
  const cleaned = nis.replace(/\s/g, '')
  if (cleaned.length !== 15) return nis
  return `${cleaned.substring(0, 5)} ${cleaned.substring(5, 10)} ${cleaned.substring(10, 15)}`
}

/**
 * Vérifier si une date est un jour férié
 */
export function isHoliday(date: Date): boolean {
  const dateStr = date.toISOString().split('T')[0]
  return HOLIDAYS_2025.some(holiday => holiday.date === dateStr)
}

/**
 * Vérifier si une date est un jour ouvrable
 */
export function isWorkingDay(date: Date): boolean {
  const day = date.getDay() as 0 | 1 | 2 | 3 | 4 | 5 | 6
  return (WORKING_DAYS as readonly number[]).includes(day) && !isHoliday(date)
}
