import { apiClient } from '@/lib/api-client'
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
      const { data, error } = await apiClient.get<{ reviews: Review[]; total: number }>(
        `/api/reviews/listing/${listingId}`,
        { limit, offset }
      )

      if (error) {
        console.error('Error fetching listing reviews:', error)
        return { data: [], error: error.message }
      }

      return {
        data: data?.reviews || [],
        total: data?.total || 0
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
      const payload = {
        listing_id: listingId,
        user_id: userId,
        reviewer_name: reviewData.reviewer_name || 'Usuário Anônimo',
        rating: reviewData.rating,
        comment: reviewData.comment
      }

      const { data, error } = await apiClient.post<Review>('/api/reviews', payload)

      if (error) {
        console.error('Error creating review:', error)
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
      const { error } = await apiClient.patch(`/api/reviews/${reviewId}`, {
        ...reviewData,
        user_id: userId // Backend should verify ownership
      })

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
      // Backend should verify ownership, but we pass userId for safety if needed by API
      // Usually DELETE methods don't take body, but validation relies on auth token
      const { error } = await apiClient.delete(`/api/reviews/${reviewId}`)

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
      const { data, error } = await apiClient.get<{
        average_rating: number;
        total_reviews: number;
        rating_distribution: { [key: number]: number }
      }>(`/api/reviews/listing/${listingId}/summary`)

      if (error) {
        console.error('Error fetching rating summary:', error)
        return { error: error.message }
      }

      return { data }
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
      const { data, error } = await apiClient.get<{ hasReviewed: boolean }>(
        `/api/reviews/listing/${listingId}/user-status`,
        { userId } // Pass userId as query param or rely on token
      )

      if (error) {
        console.error('Error checking user review:', error)
        return { hasReviewed: false, error: error.message }
      }

      return { hasReviewed: !!data?.hasReviewed }
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
      const { data, error } = await apiClient.get<{ reviews: (Review & { listing_title: string })[]; total: number }>(
        `/api/reviews/user/${userId}/received`,
        { limit, offset }
      )

      if (error) {
        console.error('Error fetching user received reviews:', error)
        return { data: [], error: error.message }
      }

      return {
        data: data?.reviews || [],
        total: data?.total || 0
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
      const { data, error } = await apiClient.get<{ reviews: (Review & { listing_title: string })[]; total: number }>(
        `/api/reviews/user/${userId}/written`,
        { limit, offset }
      )

      if (error) {
        console.error('Error fetching user written reviews:', error)
        return { data: [], error: error.message }
      }

      return {
        data: data?.reviews || [],
        total: data?.total || 0
      }
    } catch (error) {
      console.error('Error in getUserWrittenReviews:', error)
      return { data: [], error: 'Failed to fetch written reviews' }
    }
  }
}

export const reviewService = new ReviewService()