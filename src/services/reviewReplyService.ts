import { supabase } from '@/lib/supabase'

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
      const { data: replyData, error } = await supabase
        .from('review_replies')
        .insert({
          review_id: data.review_id,
          listing_id: data.listing_id,
          reply_text: data.reply_text,
          owner_user_id: (await supabase.auth.getUser()).data.user?.id
        })
        .select()
        .single()

      if (error) {
        return { error: 'Erro ao criar resposta' }
      }

      return { data: replyData }
    } catch (error) {
      return { error: 'Erro inesperado ao criar resposta' }
    }
  }

  async getRepliesByReviewIds(reviewIds: string[]): Promise<{ data: ReviewReply[]; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('review_replies')
        .select('*')
        .in('review_id', reviewIds)
        .order('created_at', { ascending: true })

      if (error) {
        return { data: [], error: 'Erro ao buscar respostas' }
      }

      return { data: data || [] }
    } catch (error) {
      return { data: [], error: 'Erro inesperado ao buscar respostas' }
    }
  }

  async updateReply(replyId: string, replyText: string): Promise<{ error?: string }> {
    try {
      const { error } = await supabase
        .from('review_replies')
        .update({ 
          reply_text: replyText,
          updated_at: new Date().toISOString()
        })
        .eq('id', replyId)

      if (error) {
        return { error: 'Erro ao atualizar resposta' }
      }

      return {}
    } catch (error) {
      return { error: 'Erro inesperado ao atualizar resposta' }
    }
  }

  async deleteReply(replyId: string): Promise<{ error?: string }> {
    try {
      const { error } = await supabase
        .from('review_replies')
        .delete()
        .eq('id', replyId)

      if (error) {
        return { error: 'Erro ao deletar resposta' }
      }

      return {}
    } catch (error) {
      return { error: 'Erro inesperado ao deletar resposta' }
    }
  }

  async checkIfUserOwnsListing(listingId: string): Promise<boolean> {
    try {
      const { data: user } = await supabase.auth.getUser()
      if (!user.user) return false

      const { data, error } = await supabase
        .from('listings')
        .select('user_id')
        .eq('id', listingId)
        .single()

      if (error || !data) return false

      return data.user_id === user.user.id
    } catch (error) {
      return false
    }
  }

  async getUserReviews(listingId?: string): Promise<{ data: any[]; error?: string }> {
    try {
      const { data: user } = await supabase.auth.getUser()
      if (!user.user) return { data: [], error: 'Usuário não autenticado' }

      let query = supabase
        .from('reviews')
        .select(`
          id,
          listing_id,
          user_id,
          reviewer_name,
          rating,
          comment,
          created_at,
          listings!inner(
            id,
            title,
            user_id,
            city,
            state
          )
        `)
        .eq('listings.user_id', user.user.id)
        .order('created_at', { ascending: false })

      if (listingId) {
        query = query.eq('listing_id', listingId)
      }

      const { data, error } = await query

      if (error) {
        return { data: [], error: 'Erro ao buscar avaliações' }
      }

      return { data: data || [] }
    } catch (error) {
      return { data: [], error: 'Erro inesperado ao buscar avaliações' }
    }
  }

  async getReviewsWithReplies(listingId?: string): Promise<{ data: any[]; error?: string }> {
    try {
      const { data: reviews, error: reviewsError } = await this.getUserReviews(listingId)
      
      if (reviewsError) return { data: [], error: reviewsError }

      if (reviews.length === 0) return { data: [], error: undefined }

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

  async getPendingReplies(): Promise<{ data: any[]; error?: string }> {
    try {
      const { data: reviews, error } = await this.getUserReviews()
      
      if (error) return { data: [], error }

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