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
  className?: string
  variant?: 'default' | 'sidebar'
}

export default function SearchFiltersComponent({
  filters,
  categories,
  onUpdateFilter,
  onUpdateFilters,
  onClearFilters,
  loading = false,
  className = '',
  variant = 'default'
}: SearchFiltersProps) {
  const [showAdvanced, setShowAdvanced] = useState(variant === 'sidebar')
  const [searchTerm, setSearchTerm] = useState(filters.query || '')
  const [brazilianStates, setBrazilianStates] = useState<Array<{ code: string, name: string, region: string }>>([])

  useEffect(() => {
    getBrazilianStates().then(setBrazilianStates)
  }, [])

  useEffect(() => {
    setSearchTerm(filters.query || '')
  }, [filters.query])

  useEffect(() => {
    if (variant === 'sidebar') setShowAdvanced(true)
  }, [variant])

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

  if (variant === 'sidebar') {
    return (
      <div className={`space-y-6 ${className}`}>
        {/* Search Input */}
        <form onSubmit={handleSearch}>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar..."
              className="w-full pl-9 pr-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
        </form>

        {/* Filters Stack */}
        <div className="space-y-4">

          {/* Categoria */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2">
              Categoria
            </label>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              <div className="flex items-center">
                <input
                  type="radio"
                  id="cat-all"
                  name="category"
                  checked={!filters.category_id}
                  onChange={() => onUpdateFilter('category_id', undefined)}
                  className="w-4 h-4 text-primary-600 border-gray-300 focus:ring-primary-500"
                />
                <label htmlFor="cat-all" className="ml-2 text-sm text-gray-600 cursor-pointer">Todas</label>
              </div>
              {categories.map(category => (
                <div key={category.id} className="flex items-center">
                  <input
                    type="radio"
                    id={`cat-${category.id}`}
                    name="category"
                    checked={filters.category_id === category.id}
                    onChange={() => onUpdateFilter('category_id', category.id)}
                    className="w-4 h-4 text-primary-600 border-gray-300 focus:ring-primary-500"
                  />
                  <label htmlFor={`cat-${category.id}`} className="ml-2 text-sm text-gray-600 cursor-pointer">{category.name}</label>
                </div>
              ))}
            </div>
          </div>

          <div className="h-px bg-gray-100"></div>

          {/* Localização */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2">
              Localização
            </label>
            <div className="space-y-3">
              <select
                value={filters.state || ''}
                onChange={(e) => onUpdateFilter('state', e.target.value || undefined)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">Estado</option>
                {brazilianStates.map(state => (
                  <option key={state.code} value={state.code}>{state.name}</option>
                ))}
              </select>
              <input
                type="text"
                value={filters.city || ''}
                onChange={(e) => onUpdateFilter('city', e.target.value || undefined)}
                placeholder="Cidade"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-primary-500 focus:border-primary-500"
              />
              <input
                type="text"
                value={filters.neighborhood || ''}
                onChange={(e) => onUpdateFilter('neighborhood', e.target.value || undefined)}
                placeholder="Bairro"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>

          <div className="h-px bg-gray-100"></div>

          {/* Preço */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2">
              Faixa de Preço
            </label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                value={filters.minPrice || ''}
                onChange={(e) => onUpdateFilter('minPrice', e.target.value ? Number(e.target.value) : undefined)}
                placeholder="Mín"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-primary-500 focus:border-primary-500"
              />
              <input
                type="number"
                value={filters.maxPrice || ''}
                onChange={(e) => onUpdateFilter('maxPrice', e.target.value ? Number(e.target.value) : undefined)}
                placeholder="Máx"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>

          <div className="h-px bg-gray-100"></div>

          {/* Ordenação */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2">
              Ordenar por
            </label>
            <select
              value={`${filters.sortBy || 'created_at'}_${filters.sortOrder || 'desc'}`}
              onChange={(e) => {
                const [sortBy, sortOrder] = e.target.value.split('_')
                onUpdateFilters({ sortBy: sortBy as 'price' | 'rating' | 'created_at', sortOrder: sortOrder as 'asc' | 'desc' })
              }}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="created_at_desc">Mais recentes</option>
              <option value="created_at_asc">Mais antigos</option>
              <option value="price_asc">Menor preço</option>
              <option value="price_desc">Maior preço</option>
              <option value="rating_desc">Mais populares</option>
            </select>
          </div>

          {/* Actions */}
          <div className="pt-2 flex flex-col gap-2">
            <button
              onClick={(e) => handleSearch(e)}
              className="w-full bg-primary-600 text-white rounded-lg py-2 text-sm font-medium hover:bg-primary-700 transition-colors"
            >
              Aplicar Filtros
            </button>
            {activeFiltersCount > 0 && (
              <button
                onClick={onClearFilters}
                className="w-full bg-white border border-gray-300 text-gray-700 rounded-lg py-2 text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                Limpar
              </button>
            )}
          </div>

        </div>
      </div>
    )
  }

  return (
    <div className={`max-w-4xl mx-auto mb-8 ${className}`}>
      {/* Type Tabs - Modern Segmented Control */}
      <div className="flex justify-center mb-8 z-10 relative px-4">
        <div className="bg-gray-100/50 p-1.5 rounded-2xl flex w-full md:w-auto overflow-x-auto snap-x">
          {[
            { id: 'space', label: 'Espaços' },
            { id: 'service', label: 'Serviços' },
            { id: 'equipment', label: 'Equipamentos' }
          ].map((type) => (
            <button
              key={type.id}
              onClick={() => onUpdateFilter('type', filters.type === type.id ? undefined : type.id)}
              className={`flex-1 md:flex-none px-4 md:px-8 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap snap-center ${filters.type === type.id
                ? 'bg-white text-primary-600 shadow-sm ring-1 ring-black/5'
                : 'text-gray-500 hover:text-gray-900 hover:bg-white/50'
                }`}
            >
              {type.label}
            </button>
          ))}
        </div>
      </div>

      {/* Busca Principal */}
      <form onSubmit={handleSearch} className="mb-6 relative z-10 mx-4 md:mx-0">
        <div className="flex gap-2 shadow-xl shadow-gray-200/50 rounded-2xl p-2 bg-white border border-gray-100 focus-within:ring-4 focus-within:ring-primary-100 transition-all">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={`O que você procura?`}
              className="w-full pl-12 pr-4 py-3 bg-transparent border-none focus:ring-0 text-gray-900 placeholder-gray-400 text-base md:text-lg font-medium"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="bg-primary-600 text-white px-4 md:px-8 py-2 md:py-3 rounded-xl font-bold hover:bg-primary-700 transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary-200 flex items-center gap-2"
          >
            <Search className="w-5 h-5 md:hidden" />
            <span className="hidden md:inline">{loading ? 'Buscando...' : 'Buscar'}</span>
          </button>
        </div>
      </form>

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