export interface Review {
  id: string
  listing_id: string
  user_id: string | null // Now nullable for anonymous reviews
  reviewer_name: string // Name of the reviewer (from profile or manually entered)
  rating: number
  comment: string | null
  created_at: string
  updated_at: string
  user?: {
    full_name: string
  }
}

export interface ReviewFormData {
  rating: number
  comment?: string
  reviewer_name?: string // For anonymous reviews
}