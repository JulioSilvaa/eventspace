import { X, Check } from 'lucide-react';
import { formatPrice } from '@/lib/utils'; // Assuming this utility exists based on MyAds.tsx

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPlan: (interval: 'month' | 'year') => void;
  isLoading?: boolean;
}

export default function PaymentModal({ isOpen, onClose, onSelectPlan, isLoading }: PaymentModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-2xl relative overflow-hidden shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Ativar Anúncio</h2>
            <p className="text-gray-600">Escolha o plano ideal para destacar seu espaço</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Monthly Plan */}
            <div className="border border-gray-200 rounded-xl p-6 hover:border-primary-500 hover:shadow-lg transition-all cursor-pointer relative group" onClick={() => onSelectPlan('month')}>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-gray-900 text-lg">Mensal</h3>
                  <p className="text-sm text-gray-500">Flexibilidade total</p>
                </div>
                <div className="w-5 h-5 rounded-full border border-gray-300 group-hover:border-primary-500 group-hover:bg-primary-50 flex items-center justify-center">
                  <div className="w-2.5 h-2.5 rounded-full bg-primary-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
              <div className="mb-6">
                <span className="text-3xl font-bold text-gray-900">R$ 50,00</span>
                <span className="text-gray-500">/mês</span>
              </div>
              <ul className="space-y-3 mb-6">
                <li className="flex items-center gap-2 text-sm text-gray-600">
                  <Check className="w-4 h-4 text-green-500" /> Cobrança mensal
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-600">
                  <Check className="w-4 h-4 text-green-500" /> Cancele quando quiser
                </li>
              </ul>
              <button
                disabled={isLoading}
                className="w-full py-2.5 rounded-lg border border-primary-600 text-primary-600 font-medium hover:bg-primary-50 transition-colors"
              >
                Selecionar Mensal
              </button>
            </div>

            {/* Annual Plan */}
            <div className="border border-primary-500 ring-1 ring-primary-500 bg-primary-50/10 rounded-xl p-6 hover:shadow-lg transition-all cursor-pointer relative group" onClick={() => onSelectPlan('year')}>
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm whitespace-nowrap">
                Economize R$ 100/ano
              </div>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-gray-900 text-lg">Anual</h3>
                  <p className="text-sm text-gray-500">Melhor custo-benefício</p>
                </div>
                <div className="w-5 h-5 rounded-full border border-primary-500 bg-primary-50 flex items-center justify-center">
                  <div className="w-2.5 h-2.5 rounded-full bg-primary-500" />
                </div>
              </div>
              <div className="mb-6">
                <span className="text-3xl font-bold text-gray-900">R$ 500,00</span>
                <span className="text-gray-500">/ano</span>
                <p className="text-xs text-green-600 font-medium mt-1">Equivalente a 2 meses grátis</p>
              </div>
              <ul className="space-y-3 mb-6">
                <li className="flex items-center gap-2 text-sm text-gray-600">
                  <Check className="w-4 h-4 text-green-500" /> Pagamento único anual
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-600">
                  <Check className="w-4 h-4 text-green-500" /> Maior economia
                </li>
              </ul>
              <button
                disabled={isLoading}
                className="w-full py-2.5 rounded-lg bg-primary-600 text-white font-medium hover:bg-primary-700 transition-colors shadow-sm"
              >
                {isLoading ? 'Processando...' : 'Selecionar Anual'}
              </button>
            </div>
          </div>

          <div className="mt-8 text-center text-xs text-gray-400">
            Pagamento processado de forma segura pelo Stripe.
          </div>
        </div>
      </div>
    </div>
  );
}
