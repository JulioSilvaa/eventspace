import { supabase } from '@/lib/supabase'
import { Review, ReviewFormData } from '@/types/reviews'

class ReviewService {
  /**
   * Get reviews for a specific listing
   */
  async getListingReviews(
    listingId: string,
    limit: number = 10,
    offset: number = 0
  ): Promise<{ data: Review[]; error?: string; total?: number }> {
    try {
      const { data, error, count } = await supabase
        .from('reviews')
        .select(`
          *,
          user:users(full_name)
        `, { count: 'exact' })
        .eq('listing_id', listingId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1)

      if (error) {
        console.error('Error fetching listing reviews:', error)
        return { data: [], error: error.message }
      }

      return { 
        data: data || [], 
        total: count || 0 
      }
    } catch (error) {
      console.error('Error in getListingReviews:', error)
      return { data: [], error: 'Failed to fetch reviews' }
    }
  }

  /**
   * Create a new review
   */
  async createReview(
    listingId: string,
    reviewData: ReviewFormData,
    userId?: string
  ): Promise<{ success: boolean; data?: Review; error?: string }> {
    try {
      const insertData = {
        listing_id: listingId,
        user_id: userId || null,
        reviewer_name: reviewData.reviewer_name || 'Usuário Anônimo',
        rating: reviewData.rating,
        comment: reviewData.comment || null
      }

      const { data, error } = await supabase
        .from('reviews')
        .insert([insertData])
        .select(`
          *,
          user:users(full_name)
        `)
        .single()

      if (error) {
        console.error('Error creating review:', error)
        
        // Handle duplicate review error
        if (error.code === '23505') {
          return { 
            success: false, 
            error: userId ? 'Você já avaliou este anúncio' : 'Já existe uma avaliação com estes dados' 
          }
        }
        
        return { success: false, error: error.message }
      }

      return { success: true, data }
    } catch (error) {
      console.error('Error in createReview:', error)
      return { success: false, error: 'Failed to create review' }
    }
  }

  /**
   * Update an existing review (only by the review author)
   */
  async updateReview(
    reviewId: string,
    reviewData: Partial<ReviewFormData>,
    userId: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const updateData: Record<string, number | string | null> = {}
      
      if (reviewData.rating !== undefined) {
        updateData.rating = reviewData.rating
      }
      
      if (reviewData.comment !== undefined) {
        updateData.comment = reviewData.comment || null
      }

      const { error } = await supabase
        .from('reviews')
        .update(updateData)
        .eq('id', reviewId)
        .eq('user_id', userId) // Ensure user can only update their own reviews

      if (error) {
        console.error('Error updating review:', error)
        return { success: false, error: error.message }
      }

      return { success: true }
    } catch (error) {
      console.error('Error in updateReview:', error)
      return { success: false, error: 'Failed to update review' }
    }
  }

  /**
   * Delete a review (only by the review author)
   */
  async deleteReview(reviewId: string, userId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('reviews')
        .delete()
        .eq('id', reviewId)
        .eq('user_id', userId)

      if (error) {
        console.error('Error deleting review:', error)
        return { success: false, error: error.message }
      }

      return { success: true }
    } catch (error) {
      console.error('Error in deleteReview:', error)
      return { success: false, error: 'Failed to delete review' }
    }
  }

  /**
   * Get listing rating summary
   */
  async getListingRatingSummary(
    listingId: string
  ): Promise<{ 
    data?: { 
      average_rating: number; 
      total_reviews: number; 
      rating_distribution: { [key: number]: number } 
    }; 
    error?: string 
  }> {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('rating')
        .eq('listing_id', listingId)

      if (error) {
        console.error('Error fetching rating summary:', error)
        return { error: error.message }
      }

      if (!data || data.length === 0) {
        return { 
          data: { 
            average_rating: 0, 
            total_reviews: 0, 
            rating_distribution: {} 
          } 
        }
      }

      const total_reviews = data.length
      const average_rating = data.reduce((sum, review) => sum + review.rating, 0) / total_reviews

      // Calculate rating distribution
      const rating_distribution: { [key: number]: number } = {}
      for (let i = 1; i <= 5; i++) {
        rating_distribution[i] = data.filter(review => review.rating === i).length
      }

      return {
        data: {
          average_rating: Math.round(average_rating * 100) / 100, // Round to 2 decimal places
          total_reviews,
          rating_distribution
        }
      }
    } catch (error) {
      console.error('Error in getListingRatingSummary:', error)
      return { error: 'Failed to fetch rating summary' }
    }
  }

  /**
   * Check if user has already reviewed a listing
   */
  async hasUserReviewed(listingId: string, userId: string): Promise<{ hasReviewed: boolean; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('id')
        .eq('listing_id', listingId)
        .eq('user_id', userId)
        .single()

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('Error checking user review:', error)
        return { hasReviewed: false, error: error.message }
      }

      return { hasReviewed: !!data }
    } catch (error) {
      console.error('Error in hasUserReviewed:', error)
      return { hasReviewed: false, error: 'Failed to check review status' }
    }
  }

  /**
   * Get reviews received by a user (for their listings)
   */
  async getUserReceivedReviews(
    userId: string,
    limit: number = 20,
    offset: number = 0
  ): Promise<{ data: (Review & { listing_title: string })[]; error?: string; total?: number }> {
    try {
      const { data, error, count } = await supabase
        .from('reviews')
        .select(`
          *,
          listing:listings!inner(title, user_id),
          user:users(full_name)
        `, { count: 'exact' })
        .eq('listing.user_id', userId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1)

      if (error) {
        console.error('Error fetching user received reviews:', error)
        return { data: [], error: error.message }
      }

      // Transform data to include listing title
      const transformedData = (data || []).map(review => ({
        ...review,
        listing_title: review.listing?.title || 'Anúncio'
      }))

      return { 
        data: transformedData, 
        total: count || 0 
      }
    } catch (error) {
      console.error('Error in getUserReceivedReviews:', error)
      return { data: [], error: 'Failed to fetch received reviews' }
    }
  }

  /**
   * Get reviews written by a user
   */
  async getUserWrittenReviews(
    userId: string,
    limit: number = 20,
    offset: number = 0
  ): Promise<{ data: (Review & { listing_title: string })[]; error?: string; total?: number }> {
    try {
      const { data, error, count } = await supabase
        .from('reviews')
        .select(`
          *,
          listing:listings(title),
          user:users(full_name)
        `, { count: 'exact' })
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1)

      if (error) {
        console.error('Error fetching user written reviews:', error)
        return { data: [], error: error.message }
      }

      // Transform data to include listing title
      const transformedData = (data || []).map(review => ({
        ...review,
        listing_title: review.listing?.title || 'Anúncio'
      }))

      return { 
        data: transformedData, 
        total: count || 0 
      }
    } catch (error) {
      console.error('Error in getUserWrittenReviews:', error)
      return { data: [], error: 'Failed to fetch written reviews' }
    }
  }
}

export const reviewService = new ReviewService()