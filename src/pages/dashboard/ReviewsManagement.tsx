import { useState, useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { ArrowLeft, MessageSquareReply, Star, ChevronDown, ChevronUp, Eye, User } from 'lucide-react'
import { reviewReplyService } from '@/services/reviewReplyService'
import ReviewReply from '@/components/reviews/ReviewReply'
import { type ReviewReply as ReviewReplyType } from '@/services/reviewReplyService'

interface ReviewWithReply {
  id: string
  user_id: string | null
  reviewer_name: string
  rating: number
  comment: string | null
  created_at: string
  listings: {
    id: string
    title: string
    city: string
    state: string
    user_id: string
  }
  reply?: ReviewReplyType | null
}

export default function ReviewsManagement() {
  const [searchParams] = useSearchParams()
  const specificListingId = searchParams.get('listing')
  
  const [reviews, setReviews] = useState<ReviewWithReply[]>([])
  const [pendingReviews, setPendingReviews] = useState<ReviewWithReply[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'all' | 'pending'>('all')
  const [expandedReviews, setExpandedReviews] = useState<Set<string>>(new Set())

  useEffect(() => {
    fetchReviews()
  }, [specificListingId])

  const fetchReviews = async () => {
    try {
      setIsLoading(true)
      
      // Buscar todas as avaliações com respostas
      const { data: reviewsWithReplies, error: reviewsError } = await reviewReplyService.getReviewsWithReplies(specificListingId || undefined)
      
      if (reviewsError) {
        console.error('Erro ao buscar avaliações:', reviewsError)
        return
      }

      setReviews(reviewsWithReplies)

      // Buscar avaliações pendentes
      const { data: pending, error: pendingError } = await reviewReplyService.getPendingReplies()
      
      if (pendingError) {
        console.error('Erro ao buscar avaliações pendentes:', pendingError)
        return
      }

      setPendingReviews(pending)
      
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleReplyCreated = (newReply: ReviewReplyType) => {
    setReviews(prev => prev.map(review => 
      review.id === newReply.review_id 
        ? { ...review, reply: newReply }
        : review
    ))
    
    // Remove da lista de pendentes
    setPendingReviews(prev => prev.filter(review => review.id !== newReply.review_id))
  }

  const handleReplyUpdated = (updatedReply: ReviewReplyType) => {
    setReviews(prev => prev.map(review => 
      review.id === updatedReply.review_id 
        ? { ...review, reply: updatedReply }
        : review
    ))
  }

  const handleReplyDeleted = (replyId: string) => {
    setReviews(prev => prev.map(review => {
      if (review.reply?.id === replyId) {
        const updatedReview = { ...review, reply: null }
        // Adiciona de volta à lista de pendentes se não está lá
        setPendingReviews(prevPending => {
          const exists = prevPending.find(p => p.id === review.id)
          return exists ? prevPending : [...prevPending, updatedReview]
        })
        return updatedReview
      }
      return review
    }))
  }

  const toggleExpanded = (reviewId: string) => {
    setExpandedReviews(prev => {
      const newSet = new Set(prev)
      if (newSet.has(reviewId)) {
        newSet.delete(reviewId)
      } else {
        newSet.add(reviewId)
      }
      return newSet
    })
  }

  const displayReviews = activeTab === 'all' ? reviews : pendingReviews
  const hasSpecificListing = !!specificListingId

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-64 mb-4"></div>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-lg border border-gray-200 p-6">
                  <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-full mb-4"></div>
                  <div className="h-20 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 py-6">
            <Link
              to="/dashboard"
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Voltar ao Dashboard
            </Link>
            <div className="h-6 w-px bg-gray-300"></div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {hasSpecificListing ? 'Avaliações do Anúncio' : 'Gerenciar Avaliações'}
              </h1>
              <p className="text-gray-600">
                {hasSpecificListing 
                  ? 'Responda às avaliações deste anúncio específico'
                  : 'Responda às avaliações dos seus anúncios'
                }
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-2 rounded-lg">
                <Star className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total de Avaliações</p>
                <p className="text-2xl font-bold text-gray-900">{reviews.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center gap-3">
              <div className="bg-orange-100 p-2 rounded-lg">
                <MessageSquareReply className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Pendentes</p>
                <p className="text-2xl font-bold text-gray-900">{pendingReviews.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center gap-3">
              <div className="bg-green-100 p-2 rounded-lg">
                <Eye className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Respondidas</p>
                <p className="text-2xl font-bold text-gray-900">{reviews.filter(r => r.reply).length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        {!hasSpecificListing && (
          <div className="bg-white rounded-lg border border-gray-200 mb-6">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex">
                <button
                  onClick={() => setActiveTab('all')}
                  className={`py-3 px-6 text-sm font-medium ${
                    activeTab === 'all'
                      ? 'border-b-2 border-primary-500 text-primary-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Todas as Avaliações ({reviews.length})
                </button>
                <button
                  onClick={() => setActiveTab('pending')}
                  className={`py-3 px-6 text-sm font-medium ${
                    activeTab === 'pending'
                      ? 'border-b-2 border-primary-500 text-primary-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Pendentes ({pendingReviews.length})
                </button>
              </nav>
            </div>
          </div>
        )}

        {/* Reviews List */}
        {displayReviews.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <Star className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {activeTab === 'pending' ? 'Nenhuma avaliação pendente' : 'Nenhuma avaliação encontrada'}
            </h3>
            <p className="text-gray-500">
              {activeTab === 'pending' 
                ? 'Todas as suas avaliações já foram respondidas!'
                : hasSpecificListing 
                  ? 'Este anúncio ainda não recebeu avaliações.'
                  : 'Seus anúncios ainda não receberam avaliações.'
              }
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {displayReviews.map((review) => (
              <div key={review.id} className="bg-white rounded-lg border border-gray-200 p-6">
                {/* Review Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="bg-gray-100 p-2 rounded-full">
                        <User className="w-4 h-4 text-gray-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{review.reviewer_name}</p>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center">
                            {Array.from({ length: review.rating }).map((_, i) => (
                              <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                            ))}
                          </div>
                          <span className="text-sm text-gray-500">
                            {new Date(review.created_at).toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Anúncio Info */}
                    <div className="bg-gray-50 rounded-lg p-3 mb-3">
                      <p className="text-sm text-gray-600">
                        <strong>Anúncio:</strong> {review.listings.title}
                      </p>
                      <p className="text-xs text-gray-500">
                        {review.listings.city}, {review.listings.state}
                      </p>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => toggleExpanded(review.id)}
                    className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
                  >
                    {expandedReviews.has(review.id) ? (
                      <>
                        <ChevronUp className="w-4 h-4" />
                        Recolher
                      </>
                    ) : (
                      <>
                        <ChevronDown className="w-4 h-4" />
                        Expandir
                      </>
                    )}
                  </button>
                </div>

                {/* Review Content */}
                <div className={`${expandedReviews.has(review.id) ? 'block' : 'hidden'}`}>
                  {review.comment && (
                    <div className="mb-4">
                      <p className="text-gray-700 leading-relaxed">{review.comment}</p>
                    </div>
                  )}

                  {/* Reply Component */}
                  <ReviewReply
                    reviewId={review.id}
                    listingId={review.listings.id}
                    existingReply={review.reply || undefined}
                    isOwner={true}
                    onReplyCreated={handleReplyCreated}
                    onReplyUpdated={handleReplyUpdated}
                    onReplyDeleted={handleReplyDeleted}
                  />
                </div>

                {/* Collapsed Preview */}
                {!expandedReviews.has(review.id) && (
                  <div className="text-sm text-gray-600">
                    {review.comment ? (
                      <p className="truncate">{review.comment}</p>
                    ) : (
                      <p className="italic">Avaliação sem comentário</p>
                    )}
                    {review.reply && (
                      <p className="text-green-600 mt-1">✓ Respondida</p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}