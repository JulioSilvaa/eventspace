import { Check, MessageCircle, Zap } from 'lucide-react'

export default function TrustBadges() {
  const badges = [
    {
      icon: Check,
      title: '100% Grátis para Buscar',
      description: 'Encontre espaços sem pagar nada',
      color: 'text-green-600',
      bg: 'bg-green-50',
    },
    {
      icon: MessageCircle,
      title: 'Contato Direto',
      description: 'Sem intermediários ou taxas',
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      icon: Zap,
      title: 'Cadastro em 2 Minutos',
      description: 'Rápido e fácil de anunciar',
      color: 'text-amber-600',
      bg: 'bg-amber-50',
    },
  ]

  return (
    <div className="py-8 md:py-12 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {badges.map((badge, index) => {
            const Icon = badge.icon

            return (
              <div
                key={index}
                className="flex items-start gap-4 p-6 bg-white rounded-xl border border-gray-100 hover:border-gray-200 hover:shadow-md transition-all duration-300 group"
              >
                <div className={`flex-shrink-0 w-12 h-12 ${badge.bg} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                  <Icon className={`w-6 h-6 ${badge.color}`} />
                </div>

                <div>
                  <h3 className="font-bold text-gray-900 mb-1">
                    {badge.title}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {badge.description}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
