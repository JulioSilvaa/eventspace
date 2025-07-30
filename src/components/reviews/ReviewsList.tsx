import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import StarRating from './StarRating'
import ReviewReply from './ReviewReply'
import { reviewReplyService, type ReviewReply as ReviewReplyType } from '@/services/reviewReplyService'
import { useToast } from '@/contexts/ToastContext'

interface Review {
  id: string
  user_id: string | null
  reviewer_name: string
  rating: number
  comment: string | null
  created_at: string
}

interface ReviewsListProps {
  listingId: string
  refreshTrigger?: number
}

export default function ReviewsList({ listingId, refreshTrigger }: ReviewsListProps) {
  const [reviews, setReviews] = useState<Review[]>([])
  const [replies, setReplies] = useState<ReviewReplyType[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [averageRating, setAverageRating] = useState(0)
  const [isOwner, setIsOwner] = useState(false)
  const toast = useToast()

  const fetchReviews = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select(`
          id,
          user_id,
          reviewer_name,
          rating,
          comment,
          created_at
        `)
        .eq('listing_id', listingId)
        .order('created_at', { ascending: false })

      if (error) {
        toast.error('Erro ao carregar avaliações', 'Não foi possível carregar as avaliações. Tente recarregar a página.')
        return
      }

      const reviewsData = data || []
      setReviews(reviewsData as Review[])

      // Calcular média
      if (reviewsData.length > 0) {
        const average = reviewsData.reduce((sum, review) => sum + review.rating, 0) / reviewsData.length
        setAverageRating(Number(average.toFixed(1)))

        // Buscar respostas para as avaliações
        const reviewIds = reviewsData.map(review => review.id)
        const { data: repliesData } = await reviewReplyService.getRepliesByReviewIds(reviewIds)
        setReplies(repliesData)
      } else {
        setAverageRating(0)
        setReplies([])
      }

    } catch {
      toast.error('Erro inesperado', 'Ocorreu um erro ao carregar as avaliações.')
    } finally {
      setIsLoading(false)
    }
  }, [listingId, toast])

  const checkOwnership = useCallback(async () => {
    const isListingOwner = await reviewReplyService.checkIfUserOwnsListing(listingId)
    setIsOwner(isListingOwner)
  }, [listingId])

  useEffect(() => {
    fetchReviews()
    checkOwnership()
  }, [listingId, refreshTrigger, fetchReviews, checkOwnership])

  const handleReplyCreated = (newReply: ReviewReplyType) => {
    setReplies(prev => [...prev, newReply])
  }

  const handleReplyUpdated = (updatedReply: ReviewReplyType) => {
    setReplies(prev => prev.map(reply => 
      reply.id === updatedReply.id ? updatedReply : reply
    ))
  }

  const handleReplyDeleted = (replyId: string) => {
    setReplies(prev => prev.filter(reply => reply.id !== replyId))
  }

  const getReplyForReview = (reviewId: string): ReviewReplyType | undefined => {
    return replies.find(reply => reply.review_id === reviewId)
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse bg-gray-200 h-20 rounded-lg"></div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Resumo das avaliações */}
      {reviews.length > 0 && (
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900">
                {averageRating}
              </div>
              <StarRating rating={averageRating} readonly size="sm" />
            </div>
            <div className="text-sm text-gray-600">
              <div className="font-medium">
                {reviews.length} {reviews.length === 1 ? 'avaliação' : 'avaliações'}
              </div>
              <div>Média geral</div>
            </div>
          </div>
        </div>
      )}

      {/* Lista de avaliações */}
      {reviews.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <div className="text-4xl mb-2">⭐</div>
          <p>Ainda não há avaliações para este anúncio.</p>
          <p className="text-sm">Seja o primeiro a avaliar!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review.id} className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="font-medium text-gray-900">
                      {review.reviewer_name}
                    </span>
                    <StarRating rating={review.rating} readonly size="sm" />
                    <span className="text-xs text-gray-500">
                      {new Date(review.created_at).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                  
                  {review.comment && (
                    <p className="text-gray-700 text-sm leading-relaxed">
                      {review.comment}
                    </p>
                  )}

                  {/* Componente de resposta */}
                  <ReviewReply
                    reviewId={review.id}
                    listingId={listingId}
                    existingReply={getReplyForReview(review.id)}
                    isOwner={isOwner}
                    onReplyCreated={handleReplyCreated}
                    onReplyUpdated={handleReplyUpdated}
                    onReplyDeleted={handleReplyDeleted}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}