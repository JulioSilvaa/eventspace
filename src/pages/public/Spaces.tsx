import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import SearchFilters from '@/components/ui/SearchFilters'
import SearchResults from '@/components/ui/SearchResults'
import { useSearch } from '@/hooks/useSearch'
import { Building2 } from 'lucide-react'

export default function Spaces() {
  const {
    filters,
    results,
    loading,
    error,
    categories,
    updateFilter,
    updateFilters,
    clearFilters,
    nextPage,
    prevPage,
    goToPage,
    hasResults,
    totalResults,
    currentPage,
    totalPages,
    hasNextPage,
    hasPrevPage
  } = useSearch({ type: 'space' })

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <Header />
      
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header da Página */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-primary-100 p-3 rounded-lg">
              <Building2 className="w-8 h-8 text-primary-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Espaços para Eventos</h1>
              <p className="text-gray-600 mt-1">
                Encontre salões, chácaras, sítios e casas de festa para seu evento especial
              </p>
            </div>
          </div>
          
          {/* Breadcrumb */}
          <nav className="text-sm text-gray-500">
            <a href="/" className="hover:text-gray-700">Início</a>
            <span className="mx-2">/</span>
            <span className="text-gray-900">Espaços</span>
          </nav>
        </div>

        {/* Filtros de Busca */}
        <SearchFilters
          filters={filters}
          categories={categories}
          onUpdateFilter={updateFilter}
          onUpdateFilters={updateFilters}
          onClearFilters={clearFilters}
          loading={loading}
        />

        {/* Toggle de Visualização */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">Visualizar:</span>
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button className="px-3 py-1 text-sm font-medium bg-white text-gray-900 rounded-md shadow-sm">
                  Grade
                </button>
                <button className="px-3 py-1 text-sm font-medium text-gray-600 hover:text-gray-900">
                  Lista
                </button>
              </div>
            </div>
            
            {hasResults && (
              <div className="text-sm text-gray-600">
                {totalResults} {totalResults === 1 ? 'espaço encontrado' : 'espaços encontrados'}
              </div>
            )}
          </div>
        </div>

        {/* Resultados */}
        <SearchResults
          results={results?.results || []}
          loading={loading}
          error={error}
          totalResults={totalResults}
          currentPage={currentPage}
          totalPages={totalPages}
          onNextPage={nextPage}
          onPrevPage={prevPage}
          onGoToPage={goToPage}
          hasNextPage={hasNextPage}
          hasPrevPage={hasPrevPage}
        />

        {/* Dica para Anunciantes */}
        {!loading && (!results || results.results.length < 10) && (
          <div className="mt-12 bg-green-50 border border-green-200 rounded-lg p-6 text-center">
            <h3 className="text-lg font-semibold text-green-900 mb-2">
              Não encontrou o espaço ideal?
            </h3>
            <p className="text-green-700 mb-4">
              Temos espaços únicos em todo o Brasil. Cadastre-se e encontre o local perfeito para seu evento.
            </p>
            <div className="flex justify-center">
              <a
                href="/cadastro"
                className="border border-green-600 text-green-600 px-6 py-2 rounded-lg hover:bg-green-50 transition-colors font-medium"
              >
                Anunciar Meu Espaço
              </a>
            </div>
          </div>
        )}
      </div>
      
      <Footer />
    </div>
  )
}