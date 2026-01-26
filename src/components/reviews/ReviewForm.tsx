import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { reviewService } from '@/services/reviewService'
import StarRating from './StarRating'

interface ReviewFormProps {
  listingId: string
  onReviewSubmitted?: () => void
}

export default function ReviewForm({ listingId, onReviewSubmitted }: ReviewFormProps) {
  const { user, profile } = useAuth()
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [reviewerName, setReviewerName] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (rating === 0) {
      setError('Por favor, selecione uma avaliação')
      return
    }

    // Validate reviewer name for anonymous users
    if (!user && (!reviewerName.trim() || reviewerName.trim().length < 2)) {
      setError('Por favor, digite seu nome (mínimo 2 caracteres)')
      return
    }

    // Validate reviewer name length
    if (!user && reviewerName.trim().length > 50) {
      setError('Nome muito longo (máximo 50 caracteres)')
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      // Get reviewer name: from profile if logged in, or from input if anonymous
      const finalReviewerName = user ? profile?.full_name || 'Usuário' : reviewerName.trim()

      const { success, error: submitError } = await reviewService.createReview(
        listingId,
        {
          reviewer_name: finalReviewerName,
          rating,
          comment: comment.trim() || undefined
        },
        user?.id
      )

      if (!success) {
        setError(submitError || 'Erro ao salvar avaliação. Tente novamente.')
        return
      }

      setSuccess(true)
      setRating(0)
      setComment('')
      setReviewerName('')

      if (onReviewSubmitted) {
        onReviewSubmitted()
      }

      // Auto-hide success message
      setTimeout(() => {
        setSuccess(false)
      }, 3000)

    } catch (err) {
      console.error('Erro ao enviar avaliação:', err)
      setError('Erro inesperado. Tente novamente.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (success) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
        <p className="text-green-800 font-medium">✅ Avaliação enviada com sucesso!</p>
        <p className="text-green-600 text-sm mt-1">
          Obrigado por compartilhar sua experiência!
        </p>
      </div>
    )
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        Avaliar este anúncio
      </h3>

      {!user && (
        <p className="text-sm text-gray-600 mb-4">
          Você pode avaliar sem criar uma conta. Sua avaliação ajuda outros usuários!
        </p>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {!user && (
          <div>
            <label htmlFor="reviewer-name" className="block text-sm font-medium text-gray-700 mb-2">
              Seu nome *
            </label>
            <input
              id="reviewer-name"
              type="text"
              value={reviewerName}
              onChange={(e) => setReviewerName(e.target.value)}
              placeholder="Digite seu nome"
              maxLength={50}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
            <div className="text-xs text-gray-500 mt-1">
              {reviewerName.length}/50 caracteres
            </div>
          </div>
        )}

        {user && (
          <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
            <p className="text-blue-800 text-sm">
              ✓ Avaliando como <strong>{profile?.full_name || 'Usuário'}</strong> (usuário da plataforma)
            </p>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Sua avaliação *
          </label>
          <StarRating
            rating={rating}
            onRatingChange={setRating}
            size="lg"
          />
        </div>

        <div>
          <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-2">
            Comentário (opcional)
          </label>
          <textarea
            id="comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Conte como foi sua experiência..."
            rows={3}
            maxLength={500}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
          <div className="text-xs text-gray-500 mt-1">
            {comment.length}/500 caracteres
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting || rating === 0 || (!user && !reviewerName.trim())}
          className="w-full bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isSubmitting ? 'Enviando...' : 'Enviar Avaliação'}
        </button>

        {/* Removed misleading account creation prompt as per user request */}
      </form>
    </div>
  )
}