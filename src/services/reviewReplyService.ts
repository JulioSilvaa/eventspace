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

      const { data, error } = await apiClient.get<any[]>(endpoint)

      if (error) {
        return { data: [], error: error.message || 'Erro ao buscar avaliações' }
      }

      return { data: data || [] }
    } catch (error) {
      return { data: [], error: 'Erro inesperado ao buscar avaliações' }
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async getReviewsWithReplies(listingId?: string): Promise<{ data: any[]; error?: string }> {
    try {
      // Backend can likely support an 'include_replies' param, or we can stitch it manually like before.
      // Assuming backend returns filtered list or we manually fetch.
      // Let's stick to the manual stitching if backend is just returning flat list or simple structure.
      // Actually, let's reuse getUserReviews and then fetch replies if not included.
      // But simpler is to assume backend sends what we need if we ask.

      const { data: reviews, error: reviewsError } = await this.getUserReviews(listingId)

      if (reviewsError) return { data: [], error: reviewsError }

      if (reviews.length === 0) return { data: [], error: undefined }

      // If the backend dashboard endpoint already includes replies (which it should for efficiency), we are good.
      // If not, we fetch them. I'll preserve the fetch logic just in case backend is simple.
      // Checking if 'reply' is already in data.
      if (reviews[0] && 'reply' in reviews[0]) {
        return { data: reviews }
      }

      const reviewIds = reviews.map(review => review.id)
      const { data: replies } = await this.getRepliesByReviewIds(reviewIds)

      const reviewsWithReplies = reviews.map(review => ({
        ...review,
        reply: replies.find(reply => reply.review_id === review.id) || null
      }))

      return { data: reviewsWithReplies }
    } catch (error) {
      return { data: [], error: 'Erro inesperado' }
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async getPendingReplies(): Promise<{ data: any[]; error?: string }> {
    try {
      // Can ask backend to filter
      const { data, error } = await apiClient.get<any[]>('/api/reviews/dashboard?status=pending')

      if (!error && data) {
        return { data }
      }

      // Fallback to manual filter if endpoint ignores status param or errors 
      // (though arguably we should fix backend, but frontend resilience is good)
      const { data: reviews, error: fetchError } = await this.getUserReviews()

      if (fetchError) return { data: [], error: fetchError }

      const reviewIds = reviews.map(review => review.id)

      if (reviewIds.length === 0) return { data: [] }

      const { data: replies } = await this.getRepliesByReviewIds(reviewIds)
      const repliedReviewIds = replies.map(reply => reply.review_id)

      const pendingReviews = reviews.filter(review =>
        !repliedReviewIds.includes(review.id)
      )

      return { data: pendingReviews }
    } catch (error) {
      return { data: [], error: 'Erro inesperado' }
    }
  }
}

export const reviewReplyService = new ReviewReplyService()