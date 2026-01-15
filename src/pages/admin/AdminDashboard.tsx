import React, { useEffect, useState } from 'react';
import { Users, LayoutGrid, Eye, DollarSign, TrendingUp, TrendingDown, Activity, ArrowRight, User, MapPin, Calendar, Star } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import adminApi from '../../services/adminApi';
import { useNavigate } from 'react-router-dom';

interface DashboardStats {
  totalUsers: number;
  activeAds: number;
  totalViews: number;
  revenue: number;
  mmr: number;
  churnRate: number;
  growth: {
    users: number;
    ads: number;
    views: number;
    revenue: number;
  };
}

interface ChartData {
  usersStart: string[];
  usersSeries: { name: string; data: number[] }[];
  adsSeries: { name: string; data: number[] }[];
}

interface DashboardLists {
  latestUsers: Array<{
    id: string;
    name: string;
    email: string;
    created_at: string;
    region: string;
  }>;
  latestAds: Array<{
    id: string;
    title: string;
    status: string;
    created_at: string;
    users: { name: string; email: string };
  }>;
  mostVisitedAds: Array<{
    id: string;
    title: string;
    views: number;
    users: { name: string };
  }>;
  latestSubscriptions: Array<{
    id: string;
    plan: string;
    price: number;
    status: string;
    next_billing_date: string;
    coupon_code?: string;
    users: { name: string; email: string };
  }>;
}

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [lists, setLists] = useState<DashboardLists | null>(null);
  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, chartsRes, listsRes] = await Promise.all([
        adminApi.get('/admin/dashboard/stats'),
        adminApi.get('/admin/dashboard/charts'),
        adminApi.get('/admin/dashboard/lists')
      ]);

      setStats(statsRes.data);
      setLists(listsRes.data);

      // Process chart data for Recharts
      const labels = chartsRes.data.usersStart;
      const usersData = chartsRes.data.usersSeries[0].data;
      const adsData = chartsRes.data.adsSeries[0].data;

      const processedData = labels.map((label: string, index: number) => ({
        name: label,
        users: usersData[index],
        ads: adsData[index]
      }));

      setChartData(processedData);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-6 md:p-8 max-w-[1600px] mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Dashboard Geral</h1>
          <p className="text-slate-400 mt-1">Visão geral do desempenho da plataforma</p>
        </div>
        <div className="text-sm text-slate-500 bg-slate-800/50 px-4 py-2 rounded-lg border border-slate-700/50">
          Atualizado em {new Date().toLocaleTimeString()}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total de Usuários"
          value={stats?.totalUsers || 0}
          icon={Users}
          trend={stats?.growth.users || 0}
          color="blue"
        />
        <StatsCard
          title="Anúncios Ativos"
          value={stats?.activeAds || 0}
          icon={LayoutGrid}
          trend={stats?.growth.ads || 0}
          color="purple"
        />
        <StatsCard
          title="Churn Rate"
          value={(stats?.churnRate || 0) + '%'}
          icon={Activity}
          trend={0}
          color="emerald" // Red might be better if high, but let's stick to palette
        />
        <StatsCard
          title="MMR Mensal"
          value={formatCurrency(stats?.mmr || 0)}
          icon={DollarSign}
          trend={stats?.growth.revenue || 0}
          color="amber"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Main Chart */}
        <div className="xl:col-span-2 bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
            <div>
              <h3 className="text-xl font-bold text-white">Crescimento</h3>
              <p className="text-sm text-slate-400">Novos usuários e anúncios nos últimos 7 dias</p>
            </div>
            <div className="flex items-center space-x-4 text-sm bg-slate-900/50 px-3 py-1.5 rounded-lg border border-slate-700/50 w-fit">
              <span className="flex items-center text-blue-400 font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500 mr-2 shadow-[0_0_8px_rgba(59,130,246,0.5)]"></span>
                Usuários
              </span>
              <span className="flex items-center text-purple-400 font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-500 mr-2 shadow-[0_0_8px_rgba(168,85,247,0.5)]"></span>
                Anúncios
              </span>
            </div>
          </div>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorAds" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#A855F7" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#A855F7" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} opacity={0.5} />
                <XAxis
                  dataKey="name"
                  stroke="#94a3b8"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  dy={10}
                />
                <YAxis
                  stroke="#94a3b8"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  dx={-10}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(30, 41, 59, 0.9)',
                    borderColor: '#334155',
                    color: '#fff',
                    borderRadius: '0.75rem',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                  }}
                  itemStyle={{ color: '#fff' }}
                  cursor={{ stroke: '#475569', strokeWidth: 1 }}
                />
                <Area
                  type="monotone"
                  dataKey="users"
                  stroke="#3B82F6"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorUsers)"
                  activeDot={{ r: 6, strokeWidth: 0, fill: '#60A5FA' }}
                />
                <Area
                  type="monotone"
                  dataKey="ads"
                  stroke="#A855F7"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorAds)"
                  activeDot={{ r: 6, strokeWidth: 0, fill: '#C084FC' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Side Column: Actions & Server Status */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50 shadow-xl h-fit">
            <h3 className="text-lg font-bold text-white mb-4">Ações Rápidas</h3>
            <div className="space-y-3">
              <button
                onClick={() => navigate('/admin/users')}
                className="w-full flex items-center justify-between p-4 bg-slate-700/30 hover:bg-blue-600/10 hover:border-blue-500/50 border border-transparent rounded-xl text-slate-300 hover:text-blue-400 transition-all group duration-300"
              >
                <div className="flex items-center">
                  <div className="p-2.5 bg-blue-500/10 rounded-lg mr-3 group-hover:bg-blue-500/20 transition-colors">
                    <Users className="w-5 h-5 text-blue-500" />
                  </div>
                  <span className="font-medium">Gerenciar Usuários</span>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
              </button>

              <button
                onClick={() => navigate('/admin/ads')}
                className="w-full flex items-center justify-between p-4 bg-slate-700/30 hover:bg-purple-600/10 hover:border-purple-500/50 border border-transparent rounded-xl text-slate-300 hover:text-purple-400 transition-all group duration-300"
              >
                <div className="flex items-center">
                  <div className="p-2.5 bg-purple-500/10 rounded-lg mr-3 group-hover:bg-purple-500/20 transition-colors">
                    <LayoutGrid className="w-5 h-5 text-purple-500" />
                  </div>
                  <span className="font-medium">Aprovar Anúncios</span>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-purple-400 group-hover:translate-x-1 transition-all" />
              </button>
            </div>
          </div>

          {/* Server Status */}
          <div className="bg-gradient-to-br from-blue-600 to-indigo-800 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
            {/* Decorative background circle */}
            <div className="absolute -right-6 -top-6 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>

            <div className="flex items-center justify-between mb-6 relative z-10">
              <h3 className="font-bold text-lg">Status do Servidor</h3>
              <div className="p-2 bg-white/10 rounded-lg">
                <Activity className="w-5 h-5 text-white" />
              </div>
            </div>

            <div className="space-y-5 relative z-10">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-blue-100 font-medium">CPU</span>
                  <span className="font-bold">24%</span>
                </div>
                <div className="w-full bg-black/20 rounded-full h-2">
                  <div className="bg-white h-2 rounded-full shadow-[0_0_10px_rgba(255,255,255,0.5)]" style={{ width: '24%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-blue-100 font-medium">Memória</span>
                  <span className="font-bold">58%</span>
                </div>
                <div className="w-full bg-black/20 rounded-full h-2">
                  <div className="bg-white h-2 rounded-full shadow-[0_0_10px_rgba(255,255,255,0.5)]" style={{ width: '58%' }}></div>
                </div>
              </div>
              <div className="pt-4 mt-4 border-t border-white/10 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-blue-200 uppercase tracking-wider font-semibold">Uptime</p>
                  <p className="font-mono text-sm mt-0.5">14d 02h</p>
                </div>
                <div>
                  <p className="text-xs text-blue-200 uppercase tracking-wider font-semibold">Requests</p>
                  <p className="font-mono text-sm mt-0.5">2.4k/min</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Subscriptions Table (New) */}
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 overflow-hidden shadow-xl">
        <div className="p-6 border-b border-slate-700/50 bg-slate-800/50 flex justify-between items-center">
          <h3 className="font-bold text-white flex items-center text-lg">
            <div className="p-2 bg-green-500/10 rounded-lg mr-3">
              <DollarSign className="w-5 h-5 text-green-500" />
            </div>
            Pagamentos Recorrentes
          </h3>
          <button className="text-sm font-medium text-green-400 hover:text-green-300 transition-colors">Ver todos</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-slate-300">
            <thead className="bg-slate-900/50 text-xs uppercase font-bold text-slate-400 tracking-wider">
              <tr>
                <th className="px-6 py-4">Usuário</th>
                <th className="px-6 py-4">Plano</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Valor</th>
                <th className="px-6 py-4">Cupom</th>
                <th className="px-6 py-4 text-right">Próxima Cobrança</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {lists?.latestSubscriptions?.map(sub => (
                <tr key={sub.id} className="hover:bg-slate-700/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-bold text-white">{sub.users.name}</div>
                    <div className="text-xs text-slate-400">{sub.users.email}</div>
                  </td>
                  <td className="px-6 py-4 uppercase font-medium">{sub.plan}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${sub.status === 'active' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
                      {sub.status === 'active' ? 'Ativo' : 'Cancelado'}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-mono text-white">{formatCurrency(sub.price)}</td>
                  <td className="px-6 py-4 font-mono text-slate-400">
                    {sub.coupon_code ? (
                      <span className="bg-blue-500/10 text-blue-400 px-2 py-1 rounded text-xs border border-blue-500/20">
                        {sub.coupon_code}
                      </span>
                    ) : (
                      "-"
                    )}
                  </td>
                  <td className="px-6 py-4 text-right font-mono text-slate-400">{sub.next_billing_date ? formatDate(sub.next_billing_date) : '-'}</td>
                </tr>
              ))}
              {(!lists?.latestSubscriptions || lists.latestSubscriptions.length === 0) && (
                <tr><td colSpan={5} className="p-8 text-center text-slate-500">Nenhum pagamento recente.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Lists Section */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Latest Users */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 overflow-hidden shadow-xl flex flex-col">
          <div className="p-6 border-b border-slate-700/50 flex justify-between items-center bg-slate-800/50">
            <h3 className="font-bold text-white flex items-center text-lg">
              <div className="p-2 bg-blue-500/10 rounded-lg mr-3">
                <User className="w-5 h-5 text-blue-500" />
              </div>
              Novos Usuários
            </h3>
            <button onClick={() => navigate('/admin/users')} className="text-sm font-medium text-blue-400 hover:text-blue-300 transition-colors">Ver todos</button>
          </div>
          <div className="divide-y divide-slate-700/50 flex-1 overflow-auto max-h-[500px]">
            {lists?.latestUsers.map(user => (
              <div key={user.id} className="p-4 hover:bg-slate-700/30 transition-colors flex items-center justify-between group">
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-slate-300 mr-4 text-sm font-bold border-2 border-slate-600 group-hover:border-blue-500/50 transition-colors">
                    {user.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors">{user.name}</p>
                    <p className="text-xs text-slate-400">{user.email}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center justify-end text-xs font-medium text-slate-400 mb-1 bg-slate-800 px-2 py-1 rounded-full w-fit ml-auto">
                    <MapPin className="w-3 h-3 mr-1 text-slate-500" />
                    {user.region}
                  </div>
                  <div className="text-xs text-slate-500 mt-1">{formatDate(user.created_at)}</div>
                </div>
              </div>
            ))}
            {(!lists?.latestUsers || lists.latestUsers.length === 0) && (
              <div className="p-8 text-center text-slate-500 text-sm">Nenhum usuário recente encontrado.</div>
            )}
          </div>
        </div>

        {/* Latest Ads */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 overflow-hidden shadow-xl flex flex-col">
          <div className="p-6 border-b border-slate-700/50 flex justify-between items-center bg-slate-800/50">
            <h3 className="font-bold text-white flex items-center text-lg">
              <div className="p-2 bg-purple-500/10 rounded-lg mr-3">
                <LayoutGrid className="w-5 h-5 text-purple-500" />
              </div>
              Novos Anúncios
            </h3>
            <button onClick={() => navigate('/admin/ads')} className="text-sm font-medium text-purple-400 hover:text-purple-300 transition-colors">Ver todos</button>
          </div>
          <div className="divide-y divide-slate-700/50 flex-1 overflow-auto max-h-[500px]">
            {lists?.latestAds.map(ad => (
              <div key={ad.id} className="p-4 hover:bg-slate-700/30 transition-colors flex items-center justify-between group">
                <div className="flex-1 min-w-0 mr-4">
                  <p className="text-sm font-bold text-white truncate group-hover:text-purple-400 transition-colors">{ad.title}</p>
                  <p className="text-xs text-slate-400 mt-0.5">por <span className="text-slate-300">{ad.users.name}</span></p>
                </div>
                <div className="text-right whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${ad.status === 'active' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'}`}>
                    <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${ad.status === 'active' ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                    {ad.status === 'active' ? 'Ativo' : 'Pendente'}
                  </span>
                  <div className="text-xs text-slate-500 mt-2 flex items-center justify-end">
                    <Calendar className="w-3 h-3 mr-1" />
                    {formatDate(ad.created_at)}
                  </div>
                </div>
              </div>
            ))}
            {(!lists?.latestAds || lists.latestAds.length === 0) && (
              <div className="p-8 text-center text-slate-500 text-sm">Nenhum anúncio recente encontrado.</div>
            )}
          </div>
        </div>
      </div>

      {/* Most Visited Ads */}
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 overflow-hidden shadow-xl">
        <div className="p-6 border-b border-slate-700/50 bg-slate-800/50">
          <h3 className="font-bold text-white flex items-center text-lg">
            <div className="p-2 bg-amber-500/10 rounded-lg mr-3">
              <Star className="w-5 h-5 text-amber-500" />
            </div>
            Anúncios Mais Visitados
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-slate-300">
            <thead className="bg-slate-900/50 text-xs uppercase font-bold text-slate-400 tracking-wider">
              <tr>
                <th className="px-6 py-4">Título</th>
                <th className="px-6 py-4">Anunciante</th>
                <th className="px-6 py-4 text-right">Visualizações</th>
                <th className="px-6 py-4 text-right">Popularidade</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {lists?.mostVisitedAds.map(ad => (
                <tr key={ad.id} className="hover:bg-slate-700/30 transition-colors group">
                  <td className="px-6 py-4 font-bold text-white group-hover:text-amber-400 transition-colors">{ad.title}</td>
                  <td className="px-6 py-4">{ad.users.name}</td>
                  <td className="px-6 py-4 text-right font-mono font-medium text-slate-200">{ad.views}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="w-32 ml-auto bg-slate-700 rounded-full h-2 overflow-hidden">
                      <div className="bg-amber-500 h-2 rounded-full shadow-[0_0_8px_rgba(245,158,11,0.5)]" style={{ width: `${Math.min(ad.views / 2, 100)}%` }}></div>
                    </div>
                  </td>
                </tr>
              ))}
              {(!lists?.mostVisitedAds || lists.mostVisitedAds.length === 0) && (
                <tr><td colSpan={4} className="p-8 text-center text-slate-500">Sem dados de visualização disponíveis.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  trend: number;
  color: 'blue' | 'purple' | 'emerald' | 'amber';
}

const StatsCard: React.FC<StatsCardProps> = ({ title, value, icon: Icon, trend, color }) => {
  const colors: Record<string, string> = {
    blue: 'bg-blue-500',
    purple: 'bg-purple-500',
    emerald: 'bg-emerald-500',
    amber: 'bg-amber-500',
  };

  const bgColors: Record<string, string> = {
    blue: 'bg-blue-500/10 text-blue-500 group-hover:bg-blue-500/20',
    purple: 'bg-purple-500/10 text-purple-500 group-hover:bg-purple-500/20',
    emerald: 'bg-emerald-500/10 text-emerald-500 group-hover:bg-emerald-500/20',
    amber: 'bg-amber-500/10 text-amber-500 group-hover:bg-amber-500/20',
  };

  const borderColors: Record<string, string> = {
    blue: 'hover:border-blue-500/50',
    purple: 'hover:border-purple-500/50',
    emerald: 'hover:border-emerald-500/50',
    amber: 'hover:border-amber-500/50',
  };

  return (
    <div className={`bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl group ${borderColors[color]}`}>
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-xl transition-colors ${bgColors[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
        {trend !== 0 && (
          <div className={`flex items-center text-sm font-bold px-2 py-1 rounded-full ${trend > 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
            {trend > 0 ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
            {Math.abs(trend)}%
          </div>
        )}
      </div>
      <div>
        <p className="text-slate-400 text-sm font-medium mb-1">{title}</p>
        <h3 className="text-3xl font-bold text-white tracking-tight">{value}</h3>
      </div>
    </div>
  );
};

export default AdminDashboard;