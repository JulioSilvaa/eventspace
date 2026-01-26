import { useState, useEffect, useCallback } from 'react'
import { reviewService } from '@/services/reviewService'
import StarRating from './StarRating'
import ReviewReply from './ReviewReply'
import { reviewReplyService, type ReviewReply as ReviewReplyType } from '@/services/reviewReplyService'
import { toast } from 'react-hot-toast'
import { useAuth } from '@/hooks/useAuth'

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
  const { user } = useAuth()
  const [expandedReviews, setExpandedReviews] = useState<Set<string>>(new Set())
  const [visibleCount, setVisibleCount] = useState(3)

  const handleShowMore = () => {
    setVisibleCount(prev => prev + 5)
  }

  const visibleReviews = reviews.slice(0, visibleCount)

  const toggleReviewExpand = (reviewId: string) => {
    setExpandedReviews(prev => {
      const next = new Set(prev)
      if (next.has(reviewId)) {
        next.delete(reviewId)
      } else {
        next.add(reviewId)
      }
      return next
    })
  }

  const fetchReviews = useCallback(async () => {
    try {
      const { data, error } = await reviewService.getListingReviews(listingId, 50) // Fetch up to 50 reviews

      if (error) {
        toast.error('Não foi possível carregar as avaliações. Tente recarregar a página.')
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

    } catch (error) {
      toast.error('Ocorreu um erro ao carregar as avaliações.')
    } finally {
      setIsLoading(false)
    }
  }, [listingId])

  const checkOwnership = useCallback(async () => {
    // Only check ownership if user is authenticated
    if (!user) {
      setIsOwner(false)
      return
    }

    const isListingOwner = await reviewReplyService.checkIfUserOwnsListing(listingId)
    setIsOwner(isListingOwner)
  }, [listingId, user])

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
          {visibleReviews.map((review) => {
            const isExpanded = expandedReviews.has(review.id)
            const comment = review.comment || ''
            const shouldTruncate = comment.length > 150

            return (
              <div key={review.id} className="bg-white border border-gray-200 rounded-lg p-3 sm:p-4">
                <div className="flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-900 text-sm">
                          {review.reviewer_name}
                        </span>
                        <StarRating rating={review.rating} readonly size="sm" />
                      </div>
                      <span className="text-xs text-gray-500">
                        {new Date(review.created_at).toLocaleDateString('pt-BR')}
                      </span>
                    </div>

                    {review.comment && (
                      <div className="relative">
                        <p className={`text-gray-700 text-sm leading-relaxed ${!isExpanded ? 'line-clamp-3' : ''}`}>
                          {review.comment}
                        </p>
                        {shouldTruncate && (
                          <button
                            onClick={() => toggleReviewExpand(review.id)}
                            className="text-primary-600 text-xs mt-1 font-medium hover:underline focus:outline-none"
                          >
                            {isExpanded ? 'Ler menos' : 'Ler mais'}
                          </button>
                        )}
                      </div>
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
            )
          })}

          {reviews.length > visibleCount && (
            <div className="text-center pt-2">
              <button
                onClick={handleShowMore}
                className="text-primary-600 font-medium text-sm hover:text-primary-700 hover:underline focus:outline-none transition-colors border border-primary-200 bg-primary-50 px-4 py-2 rounded-full"
              >
                Ver mais avaliações ({reviews.length - visibleCount} restantes)
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}