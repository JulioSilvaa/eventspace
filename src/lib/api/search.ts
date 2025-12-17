import { apiClient } from '@/lib/api-client'

export interface SearchFilters {
  query?: string
  category?: string
  state?: string
  city?: string
  minPrice?: number
  maxPrice?: number
  type?: 'space' | 'advertiser'
  sortBy?: 'price' | 'rating' | 'created_at'
  sortOrder?: 'asc' | 'desc'
  page?: number
  limit?: number
}

export interface SearchResult {
  id: string
  title: string
  description: string
  price: number
  price_type: string
  state: string
  city: string
  neighborhood?: string
  contact_whatsapp?: string
  contact_phone?: string
  category_name: string
  category_type: 'space' | 'advertiser'
  featured: boolean
  views_count: number
  created_at: string
  user_plan_type?: string
  listing_images?: Array<{
    image_url: string
    display_order?: number
  }>
}

export interface SearchResponse {
  results: SearchResult[]
  total: number
  page: number
  totalPages: number
}

interface SpaceImage {
  thumbnail: string
  medium: string
  large: string
}

interface SpaceResponse {
  id: string
  title: string
  description: string
  price: number
  price_type?: string
  state: string
  city: string
  neighborhood?: string
  contact_whatsapp?: string
  contact_phone?: string
  status: string
  featured: boolean
  views_count?: number
  created_at: string
  images?: SpaceImage[]
  category_id?: number
  category_name?: string
  category_type?: string
}

interface SpacesListResponse {
  spaces: SpaceResponse[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export async function searchAds(filters: SearchFilters): Promise<SearchResponse> {
  try {
    const {
      query,
      category,
      state,
      city,
      minPrice,
      maxPrice,
      type,
      sortBy = 'created_at',
      sortOrder = 'desc',
      page = 1,
      limit = 12
    } = filters

    const params: Record<string, string | number | boolean | undefined> = {
      page,
      limit,
      status: 'active',
    }

    // Apply filters
    if (query) params.search = query
    if (category && category !== 'all') params.category = category
    if (state) params.state = state
    if (city) params.city = city
    if (minPrice !== undefined) params.price_min = minPrice
    if (maxPrice !== undefined) params.price_max = maxPrice
    if (type) params.type = type
    if (sortBy) params.sort = sortBy
    if (sortOrder) params.order = sortOrder

    const { data, error } = await apiClient.get<SpacesListResponse>('/api/spaces', params)

    if (error) {
      console.error('Erro na busca:', error)
      throw new Error(error.message)
    }

    // Transform API response to SearchResult format
    const results: SearchResult[] = (data?.spaces || []).map(space => ({
      id: space.id,
      title: space.title,
      description: space.description,
      price: space.price,
      price_type: space.price_type || 'daily',
      state: space.state,
      city: space.city,
      neighborhood: space.neighborhood,
      contact_whatsapp: space.contact_whatsapp,
      contact_phone: space.contact_phone,
      category_name: space.category_name || '',
      category_type: (space.category_type as 'space' | 'advertiser') || 'space',
      featured: space.featured,
      views_count: space.views_count || 0,
      created_at: space.created_at,
      user_plan_type: undefined,
      listing_images: space.images?.map((img, index) => ({
        image_url: img.medium || img.large || img.thumbnail,
        display_order: index
      })) || []
    }))

    const totalPages = data?.pagination?.totalPages || Math.ceil((data?.pagination?.total || 0) / limit)

    return {
      results,
      total: data?.pagination?.total || 0,
      page,
      totalPages
    }

  } catch (error) {
    console.error('Erro na API de busca:', error)
    throw error
  }
}

interface CategoryResponse {
  id: number
  name: string
  type: string
  slug?: string
}

export async function getCategories(type?: 'space' | 'advertiser') {
  try {
    const params: Record<string, string | undefined> = {}
    if (type) params.type = type

    // Note: The marketplace API may not have a dedicated categories endpoint
    // This is a placeholder - adjust based on actual API
    const { data, error } = await apiClient.get<CategoryResponse[]>('/api/categories', params)

    if (error) {
      console.error('Erro ao buscar categorias:', error)
      // Return empty array instead of throwing
      return []
    }

    return data || []
  } catch (error) {
    console.error('Erro na API de categorias:', error)
    return []
  }
}

// Re-export from centralized location
export { getBrazilianStates } from '@/lib/brazilian-regions'

// Cache simples para evitar múltiplas requisições
const cache = new Map()
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutos

export async function searchAdsWithCache(filters: SearchFilters): Promise<SearchResponse> {
  const cacheKey = JSON.stringify(filters)
  const cached = cache.get(cacheKey)

  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data
  }

  const result = await searchAds(filters)
  cache.set(cacheKey, { data: result, timestamp: Date.now() })

  return result
}