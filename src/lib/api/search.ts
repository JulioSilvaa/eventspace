import { supabase } from '@/lib/supabase'

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

    let supabaseQuery = supabase
      .from('listings')
      .select(`
        id,
        title,
        description,
        price,
        price_type,
        state,
        city,
        neighborhood,
        contact_whatsapp,
        contact_phone,
        featured,
        views_count,
        created_at,
        categories:category_id (
          name,
          type
        ),
        listing_images (
          image_url,
          display_order
        ),
        profiles:user_id (
          plan_type
        )
      `, { count: 'exact' })
      .eq('status', 'active')

    // Filtro por tipo (equipment ou space) - usar inner join para funcionar corretamente
    if (type) {
      // Refazer a query com inner join quando há filtro por tipo
      supabaseQuery = supabase
        .from('listings')
        .select(`
          id,
          title,
          description,
          price,
          price_type,
          state,
          city,
          neighborhood,
          contact_whatsapp,
          contact_phone,
          featured,
          views_count,
          created_at,
          categories:category_id!inner (
            name,
            type
          ),
          listing_images (
            image_url,
            display_order
          ),
          profiles:user_id (
            plan_type
          )
        `, { count: 'exact' })
        .eq('status', 'active')
        .eq('categories.type', type)
    }

    // Filtro por categoria específica  
    if (category && category !== 'all') {
      // Se é um número, buscar por ID, senão por nome
      if (!isNaN(Number(category))) {
        supabaseQuery = supabaseQuery.eq('category_id', Number(category))
      } else {
        supabaseQuery = supabaseQuery.eq('categories.name', category)
      }
    }

    // Filtro por localização
    if (state) {
      supabaseQuery = supabaseQuery.eq('state', state)
    }
    if (city) {
      supabaseQuery = supabaseQuery.eq('city', city)
    }

    // Filtro por preço
    if (minPrice !== undefined) {
      supabaseQuery = supabaseQuery.gte('price', minPrice)
    }
    if (maxPrice !== undefined) {
      supabaseQuery = supabaseQuery.lte('price', maxPrice)
    }

    // Busca por texto no título e descrição
    if (query) {
      supabaseQuery = supabaseQuery.or(`title.ilike.%${query}%,description.ilike.%${query}%`)
    }

    // Ordenação
    if (sortBy === 'price') {
      supabaseQuery = supabaseQuery.order('price', { ascending: sortOrder === 'asc' })
    } else if (sortBy === 'rating') {
      // Por enquanto ordenar por views_count como proxy para popularidade
      supabaseQuery = supabaseQuery.order('views_count', { ascending: sortOrder === 'asc' })
    } else {
      supabaseQuery = supabaseQuery.order('created_at', { ascending: sortOrder === 'asc' })
    }

    // Destacar anúncios featured primeiro
    supabaseQuery = supabaseQuery.order('featured', { ascending: false })

    // Paginação
    const offset = (page - 1) * limit
    supabaseQuery = supabaseQuery.range(offset, offset + limit - 1)

    const { data, error, count } = await supabaseQuery

    if (error) {
      console.error('Erro na busca:', error)
      throw error
    }

    // Transformar os dados para o formato esperado
    const results: SearchResult[] = (data || []).map(ad => ({
      id: ad.id,
      title: ad.title,
      description: ad.description,
      price: ad.price,
      price_type: ad.price_type,
      state: ad.state,
      city: ad.city,
      neighborhood: ad.neighborhood,
      contact_whatsapp: ad.contact_whatsapp,
      contact_phone: ad.contact_phone,
      category_name: (ad.categories as { name?: string })?.name || '',
      category_type: ((ad.categories as { type?: string })?.type || 'space') as 'space' | 'advertiser',
      featured: ad.featured,
      views_count: ad.views_count,
      created_at: ad.created_at,
      user_plan_type: (ad.profiles as { plan_type?: string })?.plan_type,
      listing_images: ad.listing_images || []
    }))

    const totalPages = Math.ceil((count || 0) / limit)

    return {
      results,
      total: count || 0,
      page,
      totalPages
    }

  } catch (error) {
    console.error('Erro na API de busca:', error)
    throw error
  }
}

export async function getCategories(type?: 'space' | 'advertiser') {
  try {
    let query = supabase
      .from('categories')
      .select('id, name, type, slug')
      .order('name')

    if (type) {
      query = query.eq('type', type)
    }

    const { data, error } = await query

    if (error) {
      console.error('Erro ao buscar categorias:', error)
      throw error
    }

    return data || []
  } catch (error) {
    console.error('Erro na API de categorias:', error)
    throw error
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