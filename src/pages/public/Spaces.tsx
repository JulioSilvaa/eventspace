import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import SearchFilters from '@/components/ui/SearchFilters'
import SearchResults from '@/components/ui/SearchResults'
import { useSearch } from '@/hooks/useSearch'
import { Building2 } from 'lucide-react'
import { useState } from 'react'

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

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <Header />

      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header da Página */}
        <div className="mb-10 text-center relative z-10">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-48 bg-gradient-to-b from-primary-50/50 to-transparent -z-10 blur-3xl pointer-events-none" />

          <div className="inline-flex items-center justify-center p-3 bg-primary-100/50 rounded-2xl mb-4 backdrop-blur-sm">
            <Building2 className="w-8 h-8 text-primary-600" />
          </div>

          <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-4 tracking-tight">
            Encontre o espaço <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-primary-800">perfeito</span>
          </h1>

          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-6 leading-relaxed">
            Descubra salões, chácaras e sítios incríveis para transformar seu evento em uma experiência inesquecível.
          </p>

          {/* Breadcrumb */}
          <nav className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 bg-white px-4 py-2 rounded-full shadow-sm border border-gray-100">
            <a href="/" className="hover:text-primary-600 transition-colors">Início</a>
            <span className="text-gray-300">/</span>
            <span className="text-gray-900">Espaços</span>
          </nav>
        </div>

        {/* Filtros de Busca */}
        {/* Filtros de Busca */}
        <div className="mb-10">
          <SearchFilters
            filters={filters}
            categories={categories}
            onUpdateFilter={updateFilter}
            onUpdateFilters={updateFilters}
            onClearFilters={clearFilters}
            loading={loading}
          />
        </div>

        {/* Toggle de Visualização */}
        {/* Toggle de Visualização */}
        <div className="mb-8 flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-gray-100 pb-4">
          <div className="text-sm font-medium text-gray-500">
            {hasResults ? (
              <>
                Encontramos <span className="text-primary-700 font-bold">{totalResults}</span> {totalResults === 1 ? 'resultado' : 'resultados'} para sua busca
              </>
            ) : (
              'Nenhum resultado encontrado'
            )}
          </div>

          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-400">Visualizar em:</span>
            <div className="flex bg-white border border-gray-200 rounded-lg p-1 shadow-sm">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-1.5 text-sm font-semibold rounded-md shadow-sm transition-all ${viewMode === 'grid'
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                  }`}
              >
                Grade
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${viewMode === 'list'
                    ? 'bg-primary-50 text-primary-700 font-semibold shadow-sm'
                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                  }`}
              >
                Lista
              </button>
            </div>
          </div>
        </div>

        {/* Resultados */}
        <SearchResults
          results={results?.results || []}
          loading={loading}
          viewMode={viewMode}
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