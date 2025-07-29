import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import SearchFilters from '@/components/ui/SearchFilters'
import SearchResults from '@/components/ui/SearchResults'
import { useSearch } from '@/hooks/useSearch'
import { Users } from 'lucide-react'

export default function Services() {
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
    totalResults,
    currentPage,
    totalPages,
    hasNextPage,
    hasPrevPage
  } = useSearch({ type: 'service' })

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <Header />
      
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header da Página */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-purple-100 p-3 rounded-lg">
              <Users className="w-8 h-8 text-purple-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Serviços para Eventos</h1>
              <p className="text-gray-600 mt-1">
                Encontre fotógrafos, DJs, buffet, decoração e outros serviços profissionais
              </p>
            </div>
          </div>
          
          {/* Breadcrumb */}
          <nav className="text-sm text-gray-500">
            <a href="/" className="hover:text-gray-700">Início</a>
            <span className="mx-2">›</span>
            <span className="text-gray-900">Serviços</span>
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

        {/* Resultados */}
        <SearchResults
          results={results}
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
      </div>

      <Footer />
    </div>
  )
}