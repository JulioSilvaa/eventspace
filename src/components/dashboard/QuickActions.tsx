import { Plus, Eye, Settings, BarChart3 } from 'lucide-react'
import { Link } from 'react-router-dom'

interface QuickAction {
  title: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  href: string
  color: string
}

interface QuickActionsProps {
  userAds: Array<{ id: string; title: string }>
}

export default function QuickActions({ userAds }: QuickActionsProps) {
  const baseActions: QuickAction[] = [
    {
      title: userAds.length > 0 ? 'Meu Anúncio' : 'Meus Anúncios',
      description: userAds.length > 0 ? 'Gerencie seu anúncio' : 'Aqui aparecerá seu anúncio',
      icon: Eye,
      href: '/dashboard/meus-anuncios',
      color: 'bg-blue-500 hover:bg-blue-600'
    },
    {
      title: 'Relatórios',
      description: 'Veja estatísticas detalhadas',
      icon: BarChart3,
      href: '/dashboard/analytics',
      color: 'bg-purple-500 hover:bg-purple-600'
    },
    {
      title: 'Configurações',
      description: 'Edite seu perfil e preferências',
      icon: Settings,
      href: '/dashboard/configuracoes',
      color: 'bg-gray-500 hover:bg-gray-600'
    }
  ]

  const createAdAction: QuickAction = {
    title: 'Cadastrar Anúncio',
    description: 'Divulgue seu espaço',
    icon: Plus,
    href: '/dashboard/criar-anuncio',
    color: 'bg-green-500 hover:bg-green-600'
  }

  const actions: QuickAction[] = [createAdAction, ...baseActions]

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-1">
          Ações Rápidas
        </h2>
        <p className="text-sm text-gray-600">
          Acesse rapidamente as principais funcionalidades
        </p>
      </div>

      <div className={`grid ${actions.length === 4 ? 'grid-cols-2' : 'grid-cols-1'} gap-4`}>
        {actions.map((action, index) => {
          const Icon = action.icon

          return (
            <Link
              key={index}
              to={action.href}
              className="group bg-white rounded-lg border border-gray-200 p-4 hover:border-gray-300 hover:shadow-md transition-all duration-200"
            >
              <div className="flex flex-col items-center text-center">
                <div className={`w-10 h-10 rounded-lg ${action.color} flex items-center justify-center mb-2 group-hover:scale-110 transition-transform duration-200`}>
                  <Icon className="h-5 w-5 text-white" />
                </div>

                <h3 className="text-sm font-semibold text-gray-900 mb-1">
                  {action.title}
                </h3>

                <p className="text-xs text-gray-500 leading-tight">
                  {action.description}
                </p>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}