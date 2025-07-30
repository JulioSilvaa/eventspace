import { useState } from 'react'
import { reviewReplyService, type ReviewReply, type CreateReplyData } from '@/services/reviewReplyService'
import { MessageCircle, Send, Edit2, Trash2, X } from 'lucide-react'
import { useToast } from '@/contexts/ToastContext'

interface ReviewReplyProps {
  reviewId: string
  listingId: string
  existingReply?: ReviewReply
  isOwner: boolean
  onReplyCreated: (reply: ReviewReply) => void
  onReplyUpdated: (reply: ReviewReply) => void
  onReplyDeleted: (replyId: string) => void
}

export default function ReviewReply({
  reviewId,
  listingId,
  existingReply,
  isOwner,
  onReplyCreated,
  onReplyUpdated,
  onReplyDeleted
}: ReviewReplyProps) {
  const [isReplying, setIsReplying] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [replyText, setReplyText] = useState(existingReply?.reply_text || '')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const toast = useToast()

  const handleCreateReply = async () => {
    if (!replyText.trim() || isSubmitting) return

    setIsSubmitting(true)
    
    const createData: CreateReplyData = {
      review_id: reviewId,
      listing_id: listingId,
      reply_text: replyText.trim()
    }

    const { data, error } = await reviewReplyService.createReply(createData)
    
    if (error) {
      toast.error('Erro ao enviar resposta', error)
    } else if (data) {
      toast.success('Resposta enviada!', 'Sua resposta foi publicada com sucesso.')
      onReplyCreated(data)
      setReplyText('')
      setIsReplying(false)
    }
    
    setIsSubmitting(false)
  }

  const handleUpdateReply = async () => {
    if (!existingReply || !replyText.trim() || isSubmitting) return

    setIsSubmitting(true)
    
    const { error } = await reviewReplyService.updateReply(existingReply.id, replyText.trim())
    
    if (error) {
      toast.error('Erro ao atualizar resposta', error)
    } else {
      toast.success('Resposta atualizada!', 'Suas alterações foram salvas.')
      const updatedReply: ReviewReply = {
        ...existingReply,
        reply_text: replyText.trim(),
        updated_at: new Date().toISOString()
      }
      onReplyUpdated(updatedReply)
      setIsEditing(false)
    }
    
    setIsSubmitting(false)
  }

  const handleDeleteReply = async () => {
    if (!existingReply || isSubmitting) return

    if (!confirm('Tem certeza que deseja excluir esta resposta?')) return

    setIsSubmitting(true)
    
    const { error } = await reviewReplyService.deleteReply(existingReply.id)
    
    if (error) {
      toast.error('Erro ao excluir resposta', error)
    } else {
      toast.success('Resposta excluída!', 'A resposta foi removida com sucesso.')
      onReplyDeleted(existingReply.id)
    }
    
    setIsSubmitting(false)
  }

  const resetState = () => {
    setIsReplying(false)
    setIsEditing(false)
    setReplyText(existingReply?.reply_text || '')
  }

  // Se não é o dono e não há resposta, não mostra nada
  if (!isOwner && !existingReply) {
    return null
  }

  return (
    <div className="mt-3 pl-4 border-l-2 border-gray-200">
      {/* Resposta existente */}
      {existingReply && !isEditing && (
        <div className="bg-blue-50 rounded-lg p-3">
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                <MessageCircle className="w-3 h-3 text-white" />
              </div>
              <span className="text-sm font-medium text-blue-900">Resposta do anunciante</span>
              <span className="text-xs text-blue-600">
                {new Date(existingReply.created_at).toLocaleDateString('pt-BR')}
              </span>
            </div>
            {isOwner && (
              <div className="flex items-center gap-1">
                <button
                  onClick={() => {
                    setReplyText(existingReply.reply_text)
                    setIsEditing(true)
                  }}
                  className="p-1 text-blue-600 hover:text-blue-800 transition-colors"
                  title="Editar resposta"
                >
                  <Edit2 className="w-3 h-3" />
                </button>
                <button
                  onClick={handleDeleteReply}
                  disabled={isSubmitting}
                  className="p-1 text-red-600 hover:text-red-800 transition-colors disabled:opacity-50"
                  title="Excluir resposta"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>
          <p className="text-sm text-blue-800 leading-relaxed">
            {existingReply.reply_text}
          </p>
        </div>
      )}

      {/* Modo de edição */}
      {isEditing && (
        <div className="bg-blue-50 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
              <MessageCircle className="w-3 h-3 text-white" />
            </div>
            <span className="text-sm font-medium text-blue-900">Editando resposta</span>
          </div>
          <textarea
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder="Digite sua resposta..."
            rows={3}
            maxLength={500}
            className="w-full px-3 py-2 border border-blue-200 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          />
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-blue-600">
              {replyText.length}/500 caracteres
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={resetState}
                disabled={isSubmitting}
                className="px-3 py-1 text-xs text-gray-600 hover:text-gray-800 transition-colors disabled:opacity-50"
              >
                <X className="w-3 h-3" />
              </button>
              <button
                onClick={handleUpdateReply}
                disabled={!replyText.trim() || isSubmitting}
                className="flex items-center gap-1 px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-3 h-3" />
                {isSubmitting ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Botão para responder (quando não há resposta ainda) */}
      {isOwner && !existingReply && !isReplying && (
        <button
          onClick={() => setIsReplying(true)}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors text-sm"
        >
          <MessageCircle className="w-4 h-4" />
          Responder avaliação
        </button>
      )}

      {/* Formulário de nova resposta */}
      {isReplying && (
        <div className="bg-blue-50 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
              <MessageCircle className="w-3 h-3 text-white" />
            </div>
            <span className="text-sm font-medium text-blue-900">Responder como anunciante</span>
          </div>
          <textarea
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder="Digite sua resposta à avaliação..."
            rows={3}
            maxLength={500}
            className="w-full px-3 py-2 border border-blue-200 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          />
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-blue-600">
              {replyText.length}/500 caracteres
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setIsReplying(false)
                  setReplyText('')
                }}
                disabled={isSubmitting}
                className="px-3 py-1 text-xs text-gray-600 hover:text-gray-800 transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreateReply}
                disabled={!replyText.trim() || isSubmitting}
                className="flex items-center gap-1 px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-3 h-3" />
                {isSubmitting ? 'Enviando...' : 'Responder'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}