
import React from 'react'
import { X, Check } from 'lucide-react'

interface PlanSelectionModalProps {
  isOpen: boolean
  onClose: () => void
  onSelectPlan: (interval: 'month' | 'year') => void
  isLoading?: boolean
}

export default function PlanSelectionModal({ isOpen, onClose, onSelectPlan, isLoading }: PlanSelectionModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md relative overflow-hidden">

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Escolha seu Plano</h2>
          <p className="text-gray-500 mb-8">Selecione o ciclo de cobrança para ativar seu anúncio.</p>

          <div className="space-y-4">
            {/* Monthly Option */}
            <button
              onClick={() => onSelectPlan('month')}
              disabled={isLoading}
              className="w-full flex items-center justify-between p-4 rounded-xl border-2 border-gray-100 hover:border-blue-600 hover:bg-blue-50 transition-all group text-left"
            >
              <div>
                <span className="block font-bold text-gray-900 group-hover:text-blue-700">Mensal</span>
                <span className="text-sm text-gray-500">Cobrança recorrente</span>
              </div>
              <div className="text-right">
                <span className="block text-xl font-black text-gray-900 group-hover:text-blue-700">R$ 50</span>
                <span className="text-xs text-gray-400">/mês</span>
              </div>
            </button>

            {/* Yearly Option */}
            <button
              onClick={() => onSelectPlan('year')}
              disabled={isLoading}
              className="w-full flex items-center justify-between p-4 rounded-xl border-2 border-blue-600 bg-blue-50/50 hover:bg-blue-100 transition-all text-left relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 bg-green-500 text-white text-[10px] font-bold px-2 py-1 rounded-bl-lg uppercase tracking-wider">
                Recomendado (-16%)
              </div>
              <div>
                <span className="block font-bold text-blue-900">Anual</span>
                <span className="text-sm text-blue-600">Cobrança única anual</span>
              </div>
              <div className="text-right">
                <span className="block text-xl font-black text-blue-900">R$ 500</span>
                <span className="text-xs text-blue-600">/ano</span>
              </div>
            </button>
          </div>

          <div className="mt-8 text-center text-xs text-gray-400">
            Cancelamento disponível a qualquer momento nas configurações.
          </div>
        </div>

        {isLoading && (
          <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
      </div>
    </div>
  )
}
