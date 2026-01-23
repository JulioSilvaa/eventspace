import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { X, Search, Megaphone, Sparkles } from 'lucide-react'
import { useOnboardingStore } from '@/stores/onboardingStore'
import type { UserRole } from '@/types/onboarding'

interface WelcomeModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function WelcomeModal({ isOpen, onClose }: WelcomeModalProps) {
  const navigate = useNavigate()
  const { setUserRole, dismissWelcomeModal } = useOnboardingStore()

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  const handleSelectRole = (role: UserRole, path?: string) => {
    setUserRole(role)
    dismissWelcomeModal()
    onClose()
    if (path) {
      navigate(path)
    }
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-300"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl animate-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          aria-label="Fechar"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Content */}
        <div className="p-8 md:p-12">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl mb-4">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              👋 Bem-vindo ao EventSpace!
            </h2>
            <p className="text-gray-600 text-lg">
              Como podemos ajudar você hoje?
            </p>
          </div>

          {/* Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {/* Buscar Espaço */}
            <button
              onClick={() => handleSelectRole('seeker', '/espacos')}
              className="group relative overflow-hidden bg-gradient-to-br from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 border-2 border-blue-200 hover:border-blue-300 rounded-xl p-6 text-left transition-all duration-300 hover:scale-105 hover:shadow-lg"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-200 rounded-full blur-3xl opacity-30 group-hover:opacity-50 transition-opacity" />

              <div className="relative">
                <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Search className="w-6 h-6 text-white" />
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  🔍 Buscar Espaço/Serviço
                </h3>

                <p className="text-sm text-gray-600 leading-relaxed">
                  Encontre o lugar perfeito para seu evento ou contrate serviços especializados
                </p>

                <div className="mt-4 flex items-center text-blue-600 font-semibold text-sm group-hover:translate-x-1 transition-transform">
                  Começar busca →
                </div>
              </div>
            </button>

            {/* Anunciar */}
            <button
              onClick={() => handleSelectRole('advertiser', '/anuncie/novo')}
              className="group relative overflow-hidden bg-gradient-to-br from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 border-2 border-green-200 hover:border-green-300 rounded-xl p-6 text-left transition-all duration-300 hover:scale-105 hover:shadow-lg"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-green-200 rounded-full blur-3xl opacity-30 group-hover:opacity-50 transition-opacity" />

              <div className="relative">
                <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Megaphone className="w-6 h-6 text-white" />
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  📢 Anunciar Meu Espaço
                </h3>

                <p className="text-sm text-gray-600 leading-relaxed">
                  Divulgue grátis e ganhe clientes para seu espaço ou serviço
                </p>

                <div className="mt-4 flex items-center text-green-600 font-semibold text-sm group-hover:translate-x-1 transition-transform">
                  Criar anúncio →
                </div>
              </div>
            </button>
          </div>

          {/* Explorar */}
          <button
            onClick={() => handleSelectRole('explore')}
            className="w-full text-center py-3 text-gray-500 hover:text-gray-700 font-medium transition-colors"
          >
            Apenas explorar o site
          </button>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-8 py-4 rounded-b-2xl border-t border-gray-100">
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <span className="text-green-500">✓</span>
              <span>100% Grátis</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-green-500">✓</span>
              <span>Sem Taxas</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-green-500">✓</span>
              <span>Contato Direto</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
