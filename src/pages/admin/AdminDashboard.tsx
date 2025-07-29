export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Painel Administrativo</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Total de Usuários</h3>
            <p className="text-3xl font-bold text-primary-600">1,234</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Anúncios Ativos</h3>
            <p className="text-3xl font-bold text-success-600">567</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Receita Mensal</h3>
            <p className="text-3xl font-bold text-warning-600">R$ 12,5k</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Conversões</h3>
            <p className="text-3xl font-bold text-purple-600">89</p>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Gestão da Plataforma</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <h3 className="font-medium text-gray-900 mb-2">Gerenciar Usuários</h3>
                <p className="text-sm text-gray-600">Administrar contas e permissões</p>
              </button>
              <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <h3 className="font-medium text-gray-900 mb-2">Moderar Anúncios</h3>
                <p className="text-sm text-gray-600">Revisar e aprovar anúncios</p>
              </button>
              <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <h3 className="font-medium text-gray-900 mb-2">Relatórios</h3>
                <p className="text-sm text-gray-600">Visualizar métricas detalhadas</p>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}