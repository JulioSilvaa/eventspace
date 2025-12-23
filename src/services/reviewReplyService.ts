import { apiClient } from '@/lib/api-client'

export interface ReviewReply {
  id: string
  review_id: string
  listing_id: string
  owner_user_id: string
  reply_text: string
  created_at: string
  updated_at: string
}

export interface CreateReplyData {
  review_id: string
  listing_id: string
  reply_text: string
}

class ReviewReplyService {
  async createReply(data: CreateReplyData): Promise<{ data?: ReviewReply; error?: string }> {
    try {
      const { data: replyData, error } = await apiClient.post<ReviewReply>('/api/reviews/replies', data)

      if (error) {
        return { error: error.message || 'Erro ao criar resposta' }
      }

      return { data: replyData }
    } catch (error) {
      return { error: 'Erro inesperado ao criar resposta' }
    }
  }

  async getRepliesByReviewIds(reviewIds: string[]): Promise<{ data: ReviewReply[]; error?: string }> {
    try {
      if (reviewIds.length === 0) return { data: [] }

      const searchParams = new URLSearchParams()
      reviewIds.forEach(id => searchParams.append('reviewIds', id))

      const { data, error } = await apiClient.get<ReviewReply[]>(`/api/reviews/replies?${searchParams.toString()}`)

      if (error) {
        return { data: [], error: error.message || 'Erro ao buscar respostas' }
      }

      return { data: data || [] }
    } catch (err) {
      console.error('Error fetching replies:', err)
      return { data: [], error: 'Erro inesperado ao buscar respostas' }
    }
  }

  async updateReply(replyId: string, replyText: string): Promise<{ error?: string }> {
    try {
      const { error } = await apiClient.patch(`/api/reviews/replies/${replyId}`, {
        reply_text: replyText
      })

      if (error) {
        return { error: error.message || 'Erro ao atualizar resposta' }
      }

      return {}
    } catch (error) {
      return { error: 'Erro inesperado ao atualizar resposta' }
    }
  }

  async deleteReply(replyId: string): Promise<{ error?: string }> {
    try {
      const { error } = await apiClient.delete(`/api/reviews/replies/${replyId}`)

      if (error) {
        return { error: error.message || 'Erro ao deletar resposta' }
      }

      return {}
    } catch (error) {
      return { error: 'Erro inesperado ao deletar resposta' }
    }
  }

  async checkIfUserOwnsListing(listingId: string): Promise<boolean> {
    try {
      const { data, error } = await apiClient.get<{ isOwner: boolean }>(`/api/listings/${listingId}/check-ownership`)

      if (error || !data) return false

      return data.isOwner
    } catch (error) {
      return false
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async getUserReviews(listingId?: string): Promise<{ data: any[]; error?: string }> {
    try {
      // Endpoint to get reviews for the logged-in user's listings
      const endpoint = listingId
        ? `/api/reviews/dashboard?listing_id=${listingId}`
        : '/api/reviews/dashboard'

      const { data, error } = await apiClient.get<{ reviews: any[]; total: number }>(endpoint)

      if (error) {
        return { data: [], error: error.message || 'Erro ao buscar avaliações' }
      }

      // Extract reviews array from response object
      return { data: data?.reviews || [] }
    } catch (error) {
      return { data: [], error: 'Erro inesperado ao buscar avaliações' }
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async getReviewsWithReplies(listingId?: string): Promise<{ data: any[]; error?: string }> {
    try {
      // Backend now returns replies directly in the dashboard endpoint
      const { data: reviews, error: reviewsError } = await this.getUserReviews(listingId)

      if (reviewsError) return { data: [], error: reviewsError }

      return { data: reviews }
    } catch (error) {
      return { data: [], error: 'Erro inesperado' }
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async getPendingReplies(listingId?: string): Promise<{ data: any[]; error?: string }> {
    try {
      const endpoint = listingId
        ? `/api/reviews/dashboard?status=pending&listing_id=${listingId}`
        : '/api/reviews/dashboard?status=pending'

      const { data, error } = await apiClient.get<{ reviews: any[]; total: number }>(endpoint)

      if (!error && data?.reviews) {
        return { data: data.reviews }
      }

      return { data: [], error: error?.message || 'Erro ao buscar pendentes' }
    } catch (error) {
      return { data: [], error: 'Erro inesperado' }
    }
  }
}

export const reviewReplyService = new ReviewReplyService()