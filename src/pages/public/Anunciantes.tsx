import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import SearchFilters from '@/components/ui/SearchFilters'
import SearchResults from '@/components/ui/SearchResults'
import { useSearch } from '@/hooks/useSearch'
import { Users } from 'lucide-react'

export default function Anunciantes() {
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
  } = useSearch({ type: 'advertiser' })

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <Header />
      
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header da Página */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-primary-100 p-3 rounded-lg">
              <Users className="w-8 h-8 text-primary-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Anunciantes</h1>
              <p className="text-gray-600 mt-1">
                Encontre prestadores de serviços, equipamentos e fornecedores para seu evento
              </p>
            </div>
          </div>
          
          {/* Breadcrumb */}
          <nav className="text-sm text-gray-500">
            <a href="/" className="hover:text-gray-700">Início</a>
            <span className="mx-2">/</span>
            <span className="text-gray-900">Anunciantes</span>
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
                {totalResults} {totalResults === 1 ? 'anunciante encontrado' : 'anunciantes encontrados'}
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
          <div className="mt-12 bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">
              Não encontrou o serviço que procura?
            </h3>
            <p className="text-blue-700 mb-4">
              Temos milhares de prestadores de serviços em todo o Brasil. Cadastre-se e encontre exatamente o que precisa.
            </p>
            <div className="flex justify-center">
              <a
                href="/cadastro"
                className="border border-blue-600 text-blue-600 px-6 py-2 rounded-lg hover:bg-blue-50 transition-colors font-medium"
              >
                Anunciar Meus Serviços
              </a>
            </div>
          </div>
        )}
      </div>
      
      <Footer />
    </div>
  )
}