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

  const actions: QuickAction[] = [
    {
      title: 'Criar Anúncio',
      description: 'Crie um novo anúncio',
      icon: Plus,
      href: '/dashboard/criar-anuncio',
      color: 'bg-green-500 hover:bg-green-600'
    },
    ...baseActions
  ]

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

      <div className="grid grid-cols-2 lg:grid-cols-1 gap-3 md:gap-4">
        {actions.map((action, index) => {
          const Icon = action.icon

          return (
            <Link
              key={index}
              to={action.href}
              className="group bg-white rounded-2xl border border-gray-100 p-4 hover:border-primary-100 hover:shadow-lg hover:shadow-primary-500/10 transition-all duration-300 relative overflow-hidden"
            >
              <div className={`absolute top-0 right-0 w-16 h-16 rounded-full opacity-10 blur-xl group-hover:scale-150 transition-transform duration-500 ${action.color.split(' ')[0]}`}></div>

              <div className="flex flex-col items-center text-center relative z-10">
                <div className={`w-12 h-12 rounded-xl ${action.color} flex items-center justify-center mb-3 shadow-md group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>

                <h3 className="text-sm font-bold text-gray-900 mb-1">
                  {action.title}
                </h3>

                <p className="text-xs text-gray-500 font-medium leading-tight">
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