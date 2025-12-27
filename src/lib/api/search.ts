import { apiClient } from '@/lib/api-client'

export interface SearchFilters {
  query?: string
  category_id?: number
  state?: string
  city?: string
  neighborhood?: string
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
  price_per_day?: number
  price_per_weekend?: number
  price_type?: string
  address?: {
    street: string
    number: string
    neighborhood: string
    city: string
    state: string
    zipcode: string
  }
  contact_whatsapp?: string
  contact_phone?: string
  status: string
  featured: boolean
  views_count?: number
  created_at: string
  images?: (string | SpaceImage)[]
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
      category_id,
      state,
      city,
      neighborhood,
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
      search: query,
      category_id,
      state,
      city,
      neighborhood,
      price_min: minPrice,
      price_max: maxPrice,
      type,
      sort: sortBy,
      order: sortOrder,
      status: 'active'
    }

    const { data, error } = await apiClient.get<SpacesListResponse>('/api/spaces', params)

    if (error) {
      console.error('Erro na busca:', error)
      throw new Error(error.message)
    }

    // Transform API response to SearchResult format
    const results: SearchResult[] = (data?.spaces || []).map(space => {
      // Handle images which might be JSON strings or direct objects
      const processedImages = space.images?.map(img => {
        if (typeof img === 'string') {
          try {
            return JSON.parse(img) as SpaceImage
          } catch {
            return { thumbnail: img, medium: img, large: img } as SpaceImage
          }
        }
        return img
      }) || []

      return {
        id: space.id,
        title: space.title,
        description: space.description,
        price: space.price_per_day || space.price_per_weekend || 0,
        price_type: space.price_type || 'daily',
        state: space.address?.state || '',
        city: space.address?.city || '',
        neighborhood: space.address?.neighborhood,
        contact_whatsapp: space.contact_whatsapp,
        contact_phone: space.contact_phone,
        category_name: space.category_name || '',
        category_type: (space.category_type as 'space' | 'advertiser') || 'space',
        featured: space.featured,
        views_count: space.views_count || 0,
        created_at: space.created_at,
        user_plan_type: undefined,
        listing_images: processedImages.map((img, index) => ({
          image_url: img.medium || img.large || img.thumbnail,
          display_order: index
        }))
      }
    })

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
    // TODO: Replace with API call when backend endpoint is ready
    // For now, returning hardcoded categories
    const staticCategories: CategoryResponse[] = [
      { id: 1, name: 'Salão de Festas', type: 'space', slug: 'salao-de-festas' },
      { id: 2, name: 'Chácara', type: 'space', slug: 'chacara' },
      { id: 3, name: 'Área de Lazer', type: 'space', slug: 'area-de-lazer' },
      { id: 4, name: 'Buffet', type: 'advertiser', slug: 'buffet' },
      { id: 5, name: 'Decoração', type: 'advertiser', slug: 'decoracao' },
      { id: 6, name: 'Fotografia', type: 'advertiser', slug: 'fotografia' },
      { id: 7, name: 'Som e Iluminação', type: 'advertiser', slug: 'som-e-iluminacao' },
    ]

    // Filter by type if provided
    if (type) {
      return staticCategories.filter(cat => cat.type === type)
    }

    return staticCategories
  } catch (error) {
    console.error('Erro ao buscar categorias:', error)
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