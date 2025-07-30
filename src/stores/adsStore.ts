import { create } from 'zustand'
import { Ad, SearchFilters } from '@/types'
import { supabase } from '@/lib/supabase'
import { deleteAdImages } from '@/services/imageService'


interface AdsState {
  ads: Ad[]
  currentAd: Ad | null
  userAds: Ad[]
  featuredAds: Ad[]
  popularSpaces: Ad[]
  popularEquipment: Ad[]
  isLoading: boolean
  searchFilters: SearchFilters
  pagination: {
    page: number
    per_page: number
    total: number
    total_pages: number
  }
  cache: {
    featuredAds: number | null
    popularSpaces: number | null
    popularEquipment: number | null
  }
  adBlockerDetected: boolean

  // Actions
  fetchAds: (filters?: SearchFilters, page?: number) => Promise<void>
  fetchFeaturedAds: (limit?: number) => Promise<void>
  fetchPopularSpaces: (limit?: number) => Promise<void>
  fetchPopularEquipment: (limit?: number) => Promise<void>
  fetchAdById: (id: string) => Promise<void>
  fetchUserAds: (userId: string) => Promise<void>
  createAd: (adData: Partial<Ad>) => Promise<{ error?: string; data?: Ad }>
  updateAd: (id: string, adData: Partial<Ad>) => Promise<{ error?: string }>
  deleteAd: (id: string) => Promise<{ error?: string }>
  setSearchFilters: (filters: SearchFilters) => void
  setLoading: (loading: boolean) => void
  setAdBlockerDetected: (detected: boolean) => void
}

const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

export const useAdsStore = create<AdsState>((set, get) => ({
  ads: [],
  currentAd: null,
  userAds: [],
  featuredAds: [],
  popularSpaces: [],
  popularEquipment: [],
  isLoading: false,
  searchFilters: {},
  pagination: {
    page: 1,
    per_page: 12,
    total: 0,
    total_pages: 0,
  },
  cache: {
    featuredAds: null,
    popularSpaces: null,
    popularEquipment: null,
  },
  adBlockerDetected: false,

  fetchAds: async (filters = {}, page = 1) => {
    set({ isLoading: true })
    
    const { per_page } = get().pagination
    const offset = (page - 1) * per_page

    let query = supabase
      .from('listings')
      .select(`
        *,
        categories(id, name, type),
        listing_images(id, image_url, display_order)
      `, { count: 'exact' })
      .eq('status', 'active')
      .range(offset, offset + per_page - 1)
      .order('created_at', { ascending: false })

    // Apply filters
    if (filters.query) {
      query = query.ilike('title', `%${filters.query}%`)
    }
    if (filters.category_id) {
      query = query.eq('category_id', filters.category_id)
    }
    if (filters.state) {
      query = query.eq('state', filters.state)
    }
    if (filters.city) {
      query = query.eq('city', filters.city)
    }
    if (filters.price_min) {
      query = query.gte('price', filters.price_min)
    }
    if (filters.price_max) {
      query = query.lte('price', filters.price_max)
    }
    if (filters.delivery_available !== undefined) {
      query = query.eq('delivery_available', filters.delivery_available)
    }

    const { data, error, count } = await query

    if (error) {
      console.error('Error fetching ads:', error)
      set({ isLoading: false })
      return
    }

    const total_pages = Math.ceil((count || 0) / per_page)

    set({
      ads: data || [],
      searchFilters: filters,
      pagination: {
        page,
        per_page,
        total: count || 0,
        total_pages,
      },
      isLoading: false,
    })
  },

  fetchFeaturedAds: async (limit = 8) => {
    const state = get()
    const now = Date.now()
    
    // Check cache
    if (state.cache.featuredAds && now - state.cache.featuredAds < CACHE_DURATION && state.featuredAds.length > 0) {
      return
    }

    // Fetch featured ads
    const { data, error } = await supabase
      .from('listings')
      .select(`
        *,
        categories(id, name, type),
        listing_images(id, image_url, display_order)
      `)
      .eq('status', 'active')
      .eq('featured', true)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Error fetching featured ads:', error)
      return
    }

    // Buscar views count de cada listing a partir da activity_events
    const listingIds = (data || []).map(ad => ad.id)
    let viewsData: Record<string, number> = {}
    
    if (listingIds.length > 0) {
      const { data: viewsCountData } = await supabase
        .from('activity_events')
        .select('listing_id')
        .in('listing_id', listingIds)
        .eq('event_type', 'view')

      // Contar views por listing_id
      if (viewsCountData) {
        viewsData = viewsCountData.reduce((acc, event) => {
          acc[event.listing_id] = (acc[event.listing_id] || 0) + 1
          return acc
        }, {} as Record<string, number>)
      }
    }

    // Process data to add views count from activity_events
    const processedData = (data || []).map(ad => ({
      ...ad,
      views_count: viewsData[ad.id] || 0
    })).sort((a, b) => b.views_count - a.views_count) // Sort by total views descending

    set({
      featuredAds: processedData,
      cache: { ...state.cache, featuredAds: now }
    })
  },

  fetchPopularSpaces: async (limit = 6) => {
    const state = get()
    const now = Date.now()
    
    // Check cache
    if (state.cache.popularSpaces && now - state.cache.popularSpaces < CACHE_DURATION && state.popularSpaces.length > 0) {
      return
    }

    const { data, error } = await supabase
      .from('listings')
      .select(`
        *,
        categories!inner(id, name, type),
        listing_images(id, image_url, display_order)
      `)
      .eq('status', 'active')
      .eq('categories.type', 'space')
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Error fetching popular spaces:', error)
      return
    }

    // Buscar views count de cada listing a partir da activity_events
    const listingIds = (data || []).map(ad => ad.id)
    let viewsData: Record<string, number> = {}
    
    if (listingIds.length > 0) {
      const { data: viewsCountData } = await supabase
        .from('activity_events')
        .select('listing_id')
        .in('listing_id', listingIds)
        .eq('event_type', 'view')

      // Contar views por listing_id
      if (viewsCountData) {
        viewsData = viewsCountData.reduce((acc, event) => {
          acc[event.listing_id] = (acc[event.listing_id] || 0) + 1
          return acc
        }, {} as Record<string, number>)
      }
    }

    // Add views count and sort by popularity
    const processedData = (data || []).map(ad => ({
      ...ad,
      views_count: viewsData[ad.id] || 0
    })).sort((a, b) => b.views_count - a.views_count)

    set({
      popularSpaces: processedData,
      cache: { ...state.cache, popularSpaces: now }
    })
  },

  fetchPopularEquipment: async (limit = 6) => {
    const state = get()
    const now = Date.now()
    
    // Check cache
    if (state.cache.popularEquipment && now - state.cache.popularEquipment < CACHE_DURATION && state.popularEquipment.length > 0) {
      return
    }

    const { data, error } = await supabase
      .from('listings')
      .select(`
        *,
        categories!inner(id, name, type),
        listing_images(id, image_url, display_order)
      `)
      .eq('status', 'active')
      .eq('categories.type', 'advertiser')
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Error fetching popular equipment:', error)
      return
    }

    // Buscar views count de cada listing a partir da activity_events
    const listingIds = (data || []).map(ad => ad.id)
    let viewsData: Record<string, number> = {}
    
    if (listingIds.length > 0) {
      const { data: viewsCountData } = await supabase
        .from('activity_events')
        .select('listing_id')
        .in('listing_id', listingIds)
        .eq('event_type', 'view')

      // Contar views por listing_id
      if (viewsCountData) {
        viewsData = viewsCountData.reduce((acc, event) => {
          acc[event.listing_id] = (acc[event.listing_id] || 0) + 1
          return acc
        }, {} as Record<string, number>)
      }
    }

    // Add views count and sort by popularity
    const processedData = (data || []).map(ad => ({
      ...ad,
      views_count: viewsData[ad.id] || 0
    })).sort((a, b) => b.views_count - a.views_count)

    set({
      popularEquipment: processedData,
      cache: { ...state.cache, popularEquipment: now }
    })
  },

  fetchAdById: async (id: string) => {
    set({ isLoading: true })
    
    const { data, error } = await supabase
      .from('listings')
      .select(`
        *,
        categories(id, name, type),
        listing_images(id, image_url, display_order)
      `)
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error fetching ad:', error)
      set({ isLoading: false })
      return
    }

    // Buscar views count do listing a partir da activity_events
    let viewsCount = 0
    
    const { data: viewsCountData } = await supabase
      .from('activity_events')
      .select('listing_id')
      .eq('listing_id', id)
      .eq('event_type', 'view')

    if (viewsCountData) {
      viewsCount = viewsCountData.length
    }

    // Processar dados para adicionar views count da activity_events
    const processedData = {
      ...data,
      views_count: viewsCount
    }

    set({
      currentAd: processedData,
      isLoading: false,
    })
  },

  fetchUserAds: async (userId: string) => {
    set({ isLoading: true })
    
    const { data, error } = await supabase
      .from('listings')
      .select(`
        *,
        categories(id, name, type),
        listing_images(id, image_url, display_order)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching user ads:', error)
      set({ isLoading: false })
      return
    }

    // Buscar views count de cada listing a partir da activity_events
    const listingIds = (data || []).map(ad => ad.id)
    let viewsData: Record<string, number> = {}
    
    if (listingIds.length > 0) {
      const { data: viewsCountData } = await supabase
        .from('activity_events')
        .select('listing_id')
        .in('listing_id', listingIds)
        .eq('event_type', 'view')

      // Contar views por listing_id
      if (viewsCountData) {
        viewsData = viewsCountData.reduce((acc, event) => {
          acc[event.listing_id] = (acc[event.listing_id] || 0) + 1
          return acc
        }, {} as Record<string, number>)
      }
    }

    // Processar dados para adicionar views count da activity_events
    const processedData = (data || []).map(ad => ({
      ...ad,
      views_count: viewsData[ad.id] || 0
    }))

    set({
      userAds: processedData,
      isLoading: false,
    })
  },

  createAd: async (adData: Partial<Ad>) => {
    
    // Filtrar campos undefined para evitar problemas no Supabase
    const cleanData = Object.fromEntries(
      Object.entries(adData).filter(([, value]) => value !== undefined)
    )
    
    
    const { data, error } = await supabase
      .from('listings')
      .insert([cleanData])
      .select()
      .single()

    if (error) {
      console.error('Erro no Supabase:', error)
      return { error: error.message }
    }

    // Refresh user ads
    if (adData.user_id) {
      get().fetchUserAds(adData.user_id)
    }

    return { data }
  },

  updateAd: async (id: string, adData: Partial<Ad>) => {
    const { error } = await supabase
      .from('listings')
      .update(adData)
      .eq('id', id)

    if (error) {
      return { error: error.message }
    }

    // Update local state
    set((state) => ({
      userAds: state.userAds.map((ad) =>
        ad.id === id ? { ...ad, ...adData } : ad
      ),
      currentAd: state.currentAd?.id === id 
        ? { ...state.currentAd, ...adData } 
        : state.currentAd,
    }))

    return {}
  },

  deleteAd: async (id: string) => {
    const { adBlockerDetected } = get()
    
    try {
      // Delete ad images first (both files and database records)
      await deleteAdImages(id)
      
      // If ad blocker was previously detected, skip direct API call and go straight to RPC
      if (adBlockerDetected) {
        try {
          const { data: rpcResult, error: rpcError } = await supabase.rpc('delete_user_listing', {
            listing_id: id
          })
          
          if (rpcError) {
            return { error: 'Operação bloqueada pelo navegador. Tente desabilitar extensões de bloqueio de anúncios ou use outro navegador.' }
          }
          
          if (rpcResult && !rpcResult.success) {
            return { error: rpcResult.error || 'Erro ao deletar anúncio' }
          }
          
          // RPC succeeded, update local state
          set((state) => ({
            userAds: state.userAds.filter((ad) => ad.id !== id),
            ads: state.ads.filter((ad) => ad.id !== id),
          }))
          
          return {}
        } catch {
          return { error: 'Operação bloqueada pelo navegador. Tente desabilitar extensões de bloqueio de anúncios ou use outro navegador.' }
        }
      }
      
      // Try direct table delete first (when no ad blocker detected)
      const { error } = await supabase
        .from('listings')
        .delete()
        .eq('id', id)
        
      if (error) {
        // If it's a network/blocking error, mark ad blocker as detected and try RPC
        if (error.message?.includes('Failed to fetch') || error.message?.includes('ERR_BLOCKED_BY_CLIENT')) {
          // Mark ad blocker as detected for future operations
          set((state) => ({ ...state, adBlockerDetected: true }))
          
          try {
            const { data: rpcResult, error: rpcError } = await supabase.rpc('delete_user_listing', {
              listing_id: id
            })
            
            if (rpcError) {
              return { error: 'Operação bloqueada pelo navegador. Tente desabilitar extensões de bloqueio de anúncios ou use outro navegador.' }
            }
            
            if (rpcResult && !rpcResult.success) {
              return { error: rpcResult.error || 'Erro ao deletar anúncio' }
            }
            
            // RPC succeeded, update local state
            set((state) => ({
              userAds: state.userAds.filter((ad) => ad.id !== id),
              ads: state.ads.filter((ad) => ad.id !== id),
            }))
            
            return {}
          } catch {
            return { error: 'Operação bloqueada pelo navegador. Tente desabilitar extensões de bloqueio de anúncios ou use outro navegador.' }
          }
        }
        
        // Don't show error if it's blocked by ad blocker
        if (!error.message?.includes('Failed to fetch') && !error.message?.includes('ERR_BLOCKED_BY_CLIENT')) {
          console.error('Error deleting ad:', error)
        }
        
        return { error: error.message }
      }
      
      // Direct delete succeeded, remove from local state
      set((state) => ({
        userAds: state.userAds.filter((ad) => ad.id !== id),
        ads: state.ads.filter((ad) => ad.id !== id),
      }))
      
      return {}
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      
      // Don't log console errors if it's blocked by ad blocker
      if (!errorMessage.includes('Failed to fetch') && !errorMessage.includes('ERR_BLOCKED_BY_CLIENT')) {
        console.error('Error deleting ad with images:', error)
      }
      
      // If it's a network/blocking error, mark ad blocker and try RPC as last resort
      if (errorMessage.includes('Failed to fetch') || errorMessage.includes('ERR_BLOCKED_BY_CLIENT')) {
        // Mark ad blocker as detected for future operations
        set((state) => ({ ...state, adBlockerDetected: true }))
        
        try {
          const { data: rpcResult, error: rpcError } = await supabase.rpc('delete_user_listing', {
            listing_id: id
          })
          
          if (rpcError || (rpcResult && !rpcResult.success)) {
            return { error: 'Operação bloqueada pelo navegador. Tente desabilitar extensões de bloqueio de anúncios ou use outro navegador.' }
          }
          
          // RPC succeeded, update local state
          set((state) => ({
            userAds: state.userAds.filter((ad) => ad.id !== id),
            ads: state.ads.filter((ad) => ad.id !== id),
          }))
          
          return {}
        } catch {
          return { error: 'Operação bloqueada pelo navegador. Tente desabilitar extensões de bloqueio de anúncios ou use outro navegador.' }
        }
      }
      
      return { error: errorMessage || 'Erro ao deletar anúncio' }
    }
  },

  setSearchFilters: (filters: SearchFilters) => {
    set({ searchFilters: filters })
  },



  setLoading: (loading: boolean) => {
    set({ isLoading: loading })
  },

  setAdBlockerDetected: (detected: boolean) => {
    set({ adBlockerDetected: detected })
  },
}))