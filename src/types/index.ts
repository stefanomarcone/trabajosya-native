export type UserRole = 'worker' | 'employer'
export type IdStatus = 'pending' | 'approved' | 'rejected'
export type JobStatus = 'open' | 'in_progress' | 'completed' | 'cancelled'
export type OfferStatus = 'pending' | 'accepted' | 'rejected'
export type PricingMode = 'fixed' | 'quote'
export type JobType = 'standard' | 'freight'

export interface RatingMap {
  [category: string]: { stars: number; count: number }
}

export interface EmployerRating {
  avg: number
  count: number
  dimensions: { payment: number; clarity: number; treatment: number }
}

export interface User {
  id: string
  display_name: string
  email: string
  role: UserRole
  id_status: IdStatus
  verified_criminal_record: boolean
  tools_available: string[]
  rating_map: RatingMap
  employer_rating: EmployerRating
  created_at: string
  avatar_url?: string
  bio?: string
  categories?: string[]
  is_admin?: boolean
  mp_user_id?: string
  mp_email?: string
  phone?: string
  available_balance?: number
  total_earned?: number
  rut?: string
  bank_name?: string
  bank_account_type?: string
  bank_account_number?: string
  terms_accepted_at?: string
}

export interface Job {
  id: string
  employer_ref: string
  category: string
  job_type: JobType
  description: string
  reference_photo_urls: string[]
  address?: string
  date?: string
  tools_provided: boolean
  tools_needed: string[]
  pricing_mode: PricingMode
  price_fixed?: number
  status: JobStatus
  estimated_hours?: number
  created_at: string
}

export interface Offer {
  id: string
  job_ref: string
  worker_ref: string
  worker_name?: string
  type: 'accept' | 'counter' | 'quote'
  amount: number
  message?: string
  status: OfferStatus
  created_at: string
}

export interface Contract {
  id: string
  job_ref: string
  worker_ref: string
  employer_ref: string
  agreed_amount: number
  final_amount?: number
  escrow_status: string
  completion_confirmed_worker: boolean
  completion_confirmed_employer: boolean
  dispute_status: null | 'open' | 'resolved_worker' | 'resolved_employer'
  created_at: string
}

export interface Review {
  id: string
  job_ref: string
  rater_ref: string
  rated_user_ref: string
  category: string
  stars: number
  comment: string
  reviewer_role: 'employer' | 'worker'
  visible: boolean
  created_at: string
}

export interface AppNotification {
  id: string
  user_ref: string
  type: string
  related_ref: string
  read: boolean
  message: string
  created_at: string
}

export const JOB_CATEGORIES = [
  'Pintura',
  'Jardinería',
  'Limpieza',
  'Mudanzas',
  'Apoyo en cocina',
  'Mantención',
  'Fletes',
  'Asistencia General',
  'Otros',
] as const

export type JobCategory = typeof JOB_CATEGORIES[number]
