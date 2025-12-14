export type DocumentType =
  | 'statuts'
  | 'kbis'
  | 'nif'
  | 'nis'
  | 'rc'
  | 'article_imposition'
  | 'carte_auto_entrepreneur'
  | 'autre'

export type DocumentStatus = 'en_attente' | 'valide' | 'rejete'

export interface DocumentLegal {
  id: string
  type: DocumentType
  nom: string
  url?: string
  statut: DocumentStatus
  commentaire?: string
  dateUpload: Date
}

export interface DocumentUpload {
  file: File
  type: DocumentType
  nom: string
}

export interface AlgerianDocument {
  id: string
  type: DocumentType
  name: string
  required: boolean
  description: string
}

export interface CompanyProfile {
  id: string
  name: string
  category: CompanyCategory
  logo?: string
  description: string
  contactEmail?: string
  contactPhone?: string
}

export type CompanyCategory = 'startup' | 'pme' | 'freelance' | 'enterprise' | 'autre' | 'sarl' | 'spa' | 'eurl' | 'snc' | 'autoentrepreneur' | 'entreprise_individuelle'

export interface DocumentTemplate {
  id: string
  type: DocumentType
  name: string
  required: boolean
  description: string
  categories: CompanyCategory[]
}

export interface LegalService {
  id: string
  name: string
  description: string
  price: number
  duration: string
}
