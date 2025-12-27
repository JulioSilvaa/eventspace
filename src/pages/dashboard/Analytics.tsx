import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowLeft,
  Eye,
  MessageCircle,
  TrendingUp,
  Calendar,
  Download,
  Filter,
  Users,
  MousePointer2
} from 'lucide-react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  Legend
} from 'recharts'
import { useAuth } from '@/hooks/useAuth'
import { useUserRealTimeMetrics } from '@/hooks/useRealTimeMetrics'
import DashboardCard from '@/components/dashboard/DashboardCard'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

export default function Analytics() {
  const { user } = useAuth()
  const { metrics, isLoading } = useUserRealTimeMetrics(user?.id)
  const [timeRange, setTimeRange] = useState('30d')

  // Process data for charts
  const filteredData = useMemo(() => {
    if (!metrics.dailyMetrics || metrics.dailyMetrics.length === 0) return []

    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90
    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() - days)

    return metrics.dailyMetrics
      .filter(item => new Date(item.date) >= cutoff)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map(item => ({
        ...item,
        formattedDate: new Date(item.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
      }))
  }, [metrics.dailyMetrics, timeRange])

  // Calculate stats based on filtered data
  const stats = useMemo(() => {
    const totals = filteredData.reduce((acc, curr) => ({
      views: acc.views + curr.views_count,
      contacts: acc.contacts + curr.contacts_count,
    }), { views: 0, contacts: 0 })

    return [
      {
        title: 'Visualizações no Período',
        value: totals.views.toLocaleString(),
        icon: Eye,
        iconColor: 'text-blue-600',
        description: `Visualizações nos últimos ${timeRange.replace('d', '')} dias`
      },
      {
        title: 'Contatos no Período',
        value: totals.contacts.toLocaleString(),
        icon: MessageCircle,
        iconColor: 'text-green-600',
        description: `Contatos nos últimos ${timeRange.replace('d', '')} dias`
      },
      {
        title: 'Taxa de Conversão',
        value: totals.views > 0
          ? ((totals.contacts / totals.views) * 100).toFixed(1) + '%'
          : '0%',
        icon: TrendingUp,
        iconColor: 'text-purple-600',
        description: 'Eficiência no período'
      },
      {
        title: 'Estimativa de Alcance',
        value: Math.floor(totals.views * 1.2).toLocaleString(),
        icon: Users,
        iconColor: 'text-orange-600',
        description: 'Potenciais interessados'
      }
    ]
  }, [filteredData, timeRange])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner message="Carregando estatísticas detalhadas..." />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div className="flex items-center gap-4">
            <Link
              to="/dashboard"
              className="p-2 hover:bg-white hover:shadow-sm rounded-lg transition-all text-gray-500 hover:text-gray-900"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Relatórios de Desempenho</h1>
              <p className="text-gray-500 text-sm">Acompanhe métricas detalhadas do seu anúncio</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex bg-white rounded-lg border p-1 shadow-sm">
              {['7d', '30d', '90d'].map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${timeRange === range
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-gray-600 hover:bg-gray-50'
                    }`}
                >
                  {range === '7d' ? 'Últimos 7 dias' : range === '30d' ? 'Últimos 30 dias' : 'Últimos 90 dias'}
                </button>
              ))}
            </div>
            <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border rounded-lg hover:bg-gray-50 shadow-sm transition-all">
              <Download className="w-4 h-4" />
              Exportar
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <DashboardCard
              key={index}
              title={stat.title}
              value={stat.value}
              icon={stat.icon}
              iconColor={stat.iconColor}
              description={stat.description}
            />
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Chart */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Visualizações vs Contatos</h3>
                <p className="text-sm text-gray-500">Tráfego diário vs interesse direto</p>
              </div>
              <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  <span className="text-gray-600">Views</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span className="text-gray-600">Contatos</span>
                </div>
              </div>
            </div>

            <div className="h-[350px] w-full">
              {filteredData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={filteredData}>
                    <defs>
                      <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorContacts" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.1} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                    <XAxis
                      dataKey="formattedDate"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#9ca3af', fontSize: 12 }}
                      dy={10}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#9ca3af', fontSize: 12 }}
                    />
                    <RechartsTooltip
                      contentStyle={{
                        borderRadius: '12px',
                        border: 'none',
                        boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="views_count"
                      name="Visualizações"
                      stroke="#3b82f6"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#colorViews)"
                    />
                    <Area
                      type="monotone"
                      dataKey="contacts_count"
                      name="Contatos"
                      stroke="#10b981"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#colorContacts)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-gray-400">
                  <Calendar className="w-12 h-12 mb-2 opacity-20" />
                  <p>Sem dados suficientes para gerar o gráfico</p>
                </div>
              )}
            </div>
          </div>

          {/* Device/Platform Mix - Mocked for now */}
          <div className="bg-white rounded-xl shadow-sm border p-6 flex flex-col">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Origem do Tráfego</h3>

            <div className="space-y-6 flex-1 flex flex-col justify-center">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Celular (Mobile)</span>
                  <span className="text-sm font-bold text-gray-900">72%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: '72%' }}></div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Desktop</span>
                  <span className="text-sm font-bold text-gray-900">24%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div className="bg-purple-600 h-2 rounded-full" style={{ width: '24%' }}></div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">WhatsApp Direto</span>
                  <span className="text-sm font-bold text-gray-900">88%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div className="bg-green-600 h-2 rounded-full" style={{ width: '88%' }}></div>
                </div>
              </div>
            </div>

            <div className="mt-8 p-4 bg-blue-50 rounded-lg">
              <div className="flex gap-3">
                <TrendingUp className="w-5 h-5 text-blue-600 shrink-0" />
                <p className="text-xs text-blue-800 leading-relaxed">
                  <strong>Dica de Performance:</strong> Seu tráfego é predominantemente mobile. Garanta que suas fotos carreguem rápido e a descrição seja fácil de ler em telas pequenas.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Events Table */}
        <div className="mt-8 bg-white rounded-xl shadow-sm border overflow-hidden">
          <div className="px-6 py-4 border-b flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-900">Atividade Recente</h3>
            <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
              Últimos 50 eventos
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 text-[11px] uppercase tracking-wider font-bold text-gray-400">
                  <th className="px-6 py-3">Evento</th>
                  <th className="px-6 py-3">Data/Hora</th>
                  <th className="px-6 py-3">Detalhes</th>
                  <th className="px-6 py-3">Localização</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 italic">
                {metrics.recentEvents.slice(0, 10).map((event) => (
                  <tr key={event.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {event.event_type === 'view' ? (
                          <div className="bg-blue-100 text-blue-600 p-1.5 rounded-md">
                            <Eye className="w-3.5 h-3.5" />
                          </div>
                        ) : (
                          <div className="bg-green-100 text-green-600 p-1.5 rounded-md">
                            <MessageCircle className="w-3.5 h-3.5" />
                          </div>
                        )}
                        <span className="text-sm font-medium text-gray-900">
                          {event.event_type === 'view' ? 'Visualização' : 'Novo Contato'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(event.created_at).toLocaleString('pt-BR')}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      ID Anúncio: {event.listing_id.slice(0, 8)}...
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      São Paulo, SP
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
