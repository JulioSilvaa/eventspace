import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import SearchFilters from '@/components/ui/SearchFilters'
import SearchResults from '@/components/ui/SearchResults'
import { useSearch } from '@/hooks/useSearch'
import { Search } from 'lucide-react'
import { useState } from 'react'
import SidebarSponsor from '@/components/sponsors/SidebarSponsor'

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
  } = useSearch({})

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <Header />

      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header da Página */}
        <div className="mb-10 text-center relative z-10">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-48 bg-gradient-to-b from-primary-50/50 to-transparent -z-10 blur-3xl pointer-events-none" />

          <div className="inline-flex items-center justify-center p-3 bg-primary-100/50 rounded-2xl mb-4 backdrop-blur-sm">
            <Search className="w-8 h-8 text-primary-600" />
          </div>

          <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-4 tracking-tight">
            Tudo para o seu <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-primary-800">evento</span>
          </h1>

          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-6 leading-relaxed">
            Encontre espaços, buffets, DJs, fotógrafos e muito mais. Negocie direto com os fornecedores.
          </p>
        </div>

        <div className="lg:grid lg:grid-cols-4 lg:gap-8">
          {/* Sidebar (Desktop Only) */}
          <div className="hidden lg:block lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="font-bold text-gray-900 mb-4">Filtrar Resultados</h3>
                <SearchFilters
                  filters={filters}
                  categories={categories}
                  onUpdateFilter={updateFilter}
                  onUpdateFilters={updateFilters}
                  onClearFilters={clearFilters}
                  loading={loading}
                  className="!max-w-full !mb-0 !mx-0"
                  variant="sidebar"
                />
              </div>

              {/* Sidebar Sponsor - Only show if feature is enabled */}
              {import.meta.env.VITE_ENABLE_SPONSORS === 'true' && <SidebarSponsor />}
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Mobile Filters (Visible only on mobile/tablet) */}
            <div className="lg:hidden mb-10">
              <SearchFilters
                filters={filters}
                categories={categories}
                onUpdateFilter={updateFilter}
                onUpdateFilters={updateFilters}
                onClearFilters={clearFilters}
                loading={loading}
              />
            </div>

            {/* Toggle de Visualização & Count */}
            <div className="mb-6 flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-gray-100 pb-4">
              <div className="text-sm font-medium text-gray-500">
                {hasResults ? (
                  <>
                    Encontramos <span className="text-primary-700 font-bold">{totalResults}</span> {totalResults === 1 ? 'resultado' : 'resultados'}
                  </>
                ) : (
                  'Nenhum resultado encontrado'
                )}
              </div>

              <div className="hidden sm:flex items-center gap-3">
                <span className="text-sm text-gray-400">Visualizar:</span>
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
              <div className="mt-12 bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
                <h3 className="text-lg font-semibold text-blue-900 mb-2">
                  Não encontrou o que procura?
                </h3>
                <p className="text-blue-700 mb-4">
                  Cadastre-se e receba atualizações quando novos serviços ou espaços forem adicionados.
                </p>
                <div className="flex justify-center">
                  <a
                    href="/anuncie/novo"
                    className="border border-blue-600 text-blue-600 px-6 py-2 rounded-lg hover:bg-blue-50 transition-colors font-medium"
                  >
                    Criar Conta Grátis
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}