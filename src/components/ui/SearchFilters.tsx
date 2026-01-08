import { useState, useEffect } from 'react'
import { Search, Filter, X, MapPin, DollarSign } from 'lucide-react'
import { getBrazilianStates } from '@/lib/api/search'
import type { SearchFilters } from '@/lib/api/search'

interface SearchFiltersProps {
  filters: SearchFilters
  categories: Array<{ id: number, name: string, type: string, slug?: string }>
  onUpdateFilter: (key: keyof SearchFilters, value: string | number | undefined) => void
  onUpdateFilters: (filters: Partial<SearchFilters>) => void
  onClearFilters: () => void
  loading?: boolean
}

export default function SearchFiltersComponent({
  filters,
  categories,
  onUpdateFilter,
  onUpdateFilters,
  onClearFilters,
  loading = false
}: SearchFiltersProps) {
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [searchTerm, setSearchTerm] = useState(filters.query || '')
  const [brazilianStates, setBrazilianStates] = useState<Array<{ code: string, name: string, region: string }>>([])

  useEffect(() => {
    getBrazilianStates().then(setBrazilianStates)
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    onUpdateFilter('query', searchTerm)
  }

  const handleQuickSearch = (term: string) => {
    setSearchTerm(term)
    onUpdateFilter('query', term)
  }

  const activeFiltersCount = Object.keys(filters).filter(key => {
    const value = filters[key as keyof SearchFilters]
    return value !== undefined && value !== '' && value !== 'all' && key !== 'type' && key !== 'page' && key !== 'limit'
  }).length

  const suggestions = filters.type === 'advertiser'
    ? ['Som', 'Iluminação', 'Decoração', 'Buffet', 'DJ', 'Fotógrafo']
    : filters.type === 'space'
      ? ['Área de Lazer', 'Chácara', 'Salão']
      : ['DJ', 'Fotógrafo', 'Buffet', 'Decoração', 'Animação', 'Bartender']

  return (
    <div className="max-w-4xl mx-auto mb-8">
      {/* Busca Principal */}
      <form onSubmit={handleSearch} className="mb-6 relative z-10">
        <div className="flex gap-2 shadow-lg rounded-2xl p-2 bg-white border border-gray-100 focus-within:ring-4 focus-within:ring-primary-100 transition-all">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={`O que você procura? Ex: ${filters.type === 'advertiser' ? 'Buffet, DJ...' : 'Chácara com piscina...'}`}
              className="w-full pl-12 pr-4 py-3 bg-transparent border-none focus:ring-0 text-gray-900 placeholder-gray-400 text-lg"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="bg-primary-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-primary-700 transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-primary-200"
          >
            {loading ? 'Buscando...' : 'Buscar'}
          </button>
        </div>
      </form>

      {/* Sugestões de Busca Rápida */}
      <div className="mb-8 flex flex-wrap items-center gap-3 justify-center">
        <p className="text-sm font-medium text-gray-500">Busca rápida:</p>
        <div className="flex flex-wrap gap-2">
          {suggestions.map(suggestion => (
            <button
              key={suggestion}
              onClick={() => handleQuickSearch(suggestion)}
              className="text-sm px-4 py-1.5 bg-white border border-gray-200 text-gray-600 rounded-full hover:border-primary-300 hover:text-primary-700 hover:bg-primary-50 transition-all shadow-sm"
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>

      {/* Toggle Filtros Avançados */}
      <div className="flex items-center justify-center">
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className={`flex items-center gap-2 px-6 py-2 rounded-full transition-all ${showAdvanced
            ? 'bg-primary-50 text-primary-700 font-medium'
            : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'}`}
        >
          <Filter className="w-4 h-4" />
          {showAdvanced ? 'Ocultar filtros' : 'Filtros avançados'}
          {activeFiltersCount > 0 && (
            <span className="ml-1 bg-primary-600 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full">
              {activeFiltersCount}
            </span>
          )}
        </button>

        {activeFiltersCount > 0 && (
          <button
            onClick={onClearFilters}
            className="ml-4 flex items-center gap-1 text-sm text-red-500 hover:text-red-700 transition-colors font-medium"
          >
            <X className="w-4 h-4" />
            Limpar
          </button>
        )}
      </div>

      {/* Filtros Avançados */}
      {showAdvanced && (
        <div className="mt-6 bg-white rounded-2xl shadow-xl border border-gray-100 p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-in fade-in slide-in-from-top-4 duration-300">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Categoria
            </label>
            <select
              value={filters.category_id || 'all'}
              onChange={(e) => onUpdateFilter('category_id', e.target.value === 'all' ? undefined : Number(e.target.value))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">Todas as categorias</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          {/* Estado */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <MapPin className="inline w-4 h-4 mr-1" />
              Estado
            </label>
            <select
              value={filters.state || ''}
              onChange={(e) => onUpdateFilter('state', e.target.value || undefined)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Todos os estados</option>
              {brazilianStates.map(state => (
                <option key={state.code} value={state.code}>
                  {state.name}
                </option>
              ))}
            </select>
          </div>

          {/* Cidade */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cidade
            </label>
            <input
              type="text"
              value={filters.city || ''}
              onChange={(e) => onUpdateFilter('city', e.target.value || undefined)}
              placeholder="Nome da cidade"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          {/* Bairro */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bairro
            </label>
            <input
              type="text"
              value={filters.neighborhood || ''}
              onChange={(e) => onUpdateFilter('neighborhood', e.target.value || undefined)}
              placeholder="Nome do bairro"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          {/* Preço Mínimo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <DollarSign className="inline w-4 h-4 mr-1" />
              Preço mínimo
            </label>
            <input
              type="number"
              value={filters.minPrice || ''}
              onChange={(e) => onUpdateFilter('minPrice', e.target.value ? Number(e.target.value) : undefined)}
              placeholder="R$ 0"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          {/* Preço Máximo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Preço máximo
            </label>
            <input
              type="number"
              value={filters.maxPrice || ''}
              onChange={(e) => onUpdateFilter('maxPrice', e.target.value ? Number(e.target.value) : undefined)}
              placeholder="R$ 9999"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          {/* Ordenação */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ordenar por
            </label>
            <select
              value={`${filters.sortBy || 'created_at'}_${filters.sortOrder || 'desc'}`}
              onChange={(e) => {
                const [sortBy, sortOrder] = e.target.value.split('_')
                onUpdateFilters({ sortBy: sortBy as 'price' | 'rating' | 'created_at', sortOrder: sortOrder as 'asc' | 'desc' })
              }}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="created_at_desc">Mais recentes</option>
              <option value="created_at_asc">Mais antigos</option>
              <option value="price_asc">Menor preço</option>
              <option value="price_desc">Maior preço</option>
              <option value="rating_desc">Mais populares</option>
            </select>
          </div>
        </div>
      )}
    </div>
  )
}