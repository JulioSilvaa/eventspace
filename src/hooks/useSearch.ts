import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { searchAdsWithCache, getCategories, type SearchFilters, type SearchResponse } from '@/lib/api/search'

export function useSearch(initialFilters: SearchFilters = {}) {
  const [searchParams, setSearchParams] = useSearchParams()

  // Inicializar filtros com parâmetros da URL apenas na primeira renderização
  const [filters, setFilters] = useState<SearchFilters>(() => {
    const urlFilters: SearchFilters = { ...initialFilters }

    if (searchParams.get('query')) urlFilters.query = searchParams.get('query')!
    if (searchParams.get('category')) urlFilters.category = searchParams.get('category')!
    if (searchParams.get('state')) urlFilters.state = searchParams.get('state')!
    if (searchParams.get('city')) urlFilters.city = searchParams.get('city')!
    if (searchParams.get('minPrice')) urlFilters.minPrice = Number(searchParams.get('minPrice'))
    if (searchParams.get('maxPrice')) urlFilters.maxPrice = Number(searchParams.get('maxPrice'))
    if (searchParams.get('sortBy')) urlFilters.sortBy = searchParams.get('sortBy') as 'price' | 'rating' | 'created_at'
    if (searchParams.get('sortOrder')) urlFilters.sortOrder = searchParams.get('sortOrder') as 'asc' | 'desc'
    if (searchParams.get('page')) urlFilters.page = Number(searchParams.get('page'))

    return urlFilters
  })
  const [results, setResults] = useState<SearchResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [categories, setCategories] = useState<Array<{ id: number, name: string, type: string, slug?: string }>>([])

  // Carregar categorias
  useEffect(() => {
    async function loadCategories() {
      try {
        const data = await getCategories(filters.type)
        setCategories(data)
      } catch (err) {
        console.error('Erro ao carregar categorias:', err)
      }
    }
    loadCategories()
  }, [filters.type])

  // Função para executar a busca
  const search = useCallback(async (newFilters?: SearchFilters) => {
    setLoading(true)
    setError(null)

    try {
      const searchFilters = newFilters || filters
      const response = await searchAdsWithCache(searchFilters)
      setResults(response)
    } catch (err) {
      console.error('Erro na busca:', err)
      setError('Erro ao buscar resultados. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }, [filters])

  // Buscar automaticamente quando os filtros mudarem
  useEffect(() => {
    search()
  }, [filters.query, filters.category, filters.state, filters.city, filters.minPrice, filters.maxPrice, filters.sortBy, filters.sortOrder, filters.page, search])

  // Atualizar URL quando filtros mudarem (mas não na inicialização)
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    if (!isInitialized) {
      setIsInitialized(true)
      return
    }

    const newSearchParams = new URLSearchParams()

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== '' && value !== 'all' && key !== 'type' && key !== 'limit') {
        newSearchParams.set(key, String(value))
      }
    })

    setSearchParams(newSearchParams, { replace: true })
  }, [filters, setSearchParams, isInitialized])

  // Funções para atualizar filtros
  const updateFilter = useCallback((key: keyof SearchFilters, value: string | number | undefined) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 })) // Reset page when changing filters
  }, [])

  const updateFilters = useCallback((newFilters: Partial<SearchFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters, page: 1 }))
  }, [])

  const clearFilters = useCallback(() => {
    setFilters({ type: filters.type }) // Manter apenas o tipo
  }, [filters.type])

  const nextPage = useCallback(() => {
    if (results && results.page < results.totalPages) {
      setFilters(prev => ({ ...prev, page: (prev.page || 1) + 1 }))
    }
  }, [results])

  const prevPage = useCallback(() => {
    if (results && results.page > 1) {
      setFilters(prev => ({ ...prev, page: (prev.page || 1) - 1 }))
    }
  }, [results])

  const goToPage = useCallback((page: number) => {
    if (results && page >= 1 && page <= results.totalPages) {
      setFilters(prev => ({ ...prev, page }))
    }
  }, [results])

  return {
    // Estado
    filters,
    results,
    loading,
    error,
    categories,

    // Ações
    search,
    updateFilter,
    updateFilters,
    clearFilters,

    // Paginação
    nextPage,
    prevPage,
    goToPage,

    // Computed
    hasResults: results && results.results.length > 0,
    totalResults: results?.total || 0,
    currentPage: results?.page || 1,
    totalPages: results?.totalPages || 0,
    hasNextPage: results ? results.page < results.totalPages : false,
    hasPrevPage: results ? results.page > 1 : false
  }
}