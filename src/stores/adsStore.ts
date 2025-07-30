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
  incrementViews: (id: string) => Promise<void>
  incrementContacts: (id: string) => Promise<void>
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

    // Fetch featured ads - simplified query without profiles join
    const { data, error } = await supabase
      .from('listings')
      .select(`
        *,
        categories(id, name, type),
        listing_images(id, image_url, display_order)
      `)
      .eq('status', 'active')
      .eq('featured', true)
      .order('views_count', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Error fetching featured ads:', error)
      return
    }

    set({
      featuredAds: data || [],
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
      .order('views_count', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Error fetching popular spaces:', error)
      return
    }

    set({
      popularSpaces: data || [],
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
      .order('views_count', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Error fetching popular equipment:', error)
      return
    }

    set({
      popularEquipment: data || [],
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

    set({
      currentAd: data,
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

    set({
      userAds: data || [],
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

  incrementViews: async (id: string) => {
    try {
      // First get current views_count
      const { data: currentAd, error: fetchError } = await supabase
        .from('listings')
        .select('views_count')
        .eq('id', id)
        .single()

      if (fetchError) {
        console.error('Error fetching current views:', fetchError)
        return
      }

      const newViewsCount = (currentAd.views_count || 0) + 1

      // Update views_count
      const { error: updateError } = await supabase
        .from('listings')
        .update({ views_count: newViewsCount })
        .eq('id', id)

      if (!updateError) {
        // Update local state
        set((state) => ({
          currentAd: state.currentAd?.id === id 
            ? { ...state.currentAd, views_count: newViewsCount }
            : state.currentAd,
        }))
      } else {
        // Only log error if it's not a network/blocking issue
        if (!updateError.message?.includes('Failed to fetch') && !updateError.message?.includes('ERR_BLOCKED_BY_CLIENT')) {
          console.error('Error updating views:', updateError)
        } else {
          // Mark ad blocker as detected for future operations
          set((state) => ({ ...state, adBlockerDetected: true }))
        }
      }
    } catch (error) {
      // Only log error if it's not a network/blocking issue (ad blockers)
      const errorMessage = error instanceof Error ? error.message : String(error)
      if (!errorMessage.includes('Failed to fetch') && !errorMessage.includes('ERR_BLOCKED_BY_CLIENT')) {
        console.error('Error incrementing views:', error)
      } else {
        // Mark ad blocker as detected for future operations
        set((state) => ({ ...state, adBlockerDetected: true }))
      }
    }
  },

  incrementContacts: async (id: string) => {
    try {
      // Try to get current contacts_count, but handle if field doesn't exist
      const { data: currentAd, error: fetchError } = await supabase
        .from('listings')
        .select('contacts_count, views_count')
        .eq('id', id)
        .single()

      if (fetchError) {
        console.error('Error fetching current ad data:', fetchError)
        // If field doesn't exist, try using views_count as fallback for tracking
        try {
          const { error: fallbackError } = await supabase
            .from('listings')
            .select('views_count')
            .eq('id', id)
            .single()
          
          if (fallbackError) return
          
          // For now, just log the contact attempt since we can't store it
          return
        } catch {
          return
        }
      }

      const newContactsCount = (currentAd.contacts_count || 0) + 1

      // Try to update contacts_count
      const { error: updateError } = await supabase
        .from('listings')
        .update({ contacts_count: newContactsCount })
        .eq('id', id)

      if (!updateError) {
        // Update local state
        set((state) => ({
          currentAd: state.currentAd?.id === id 
            ? { ...state.currentAd, contacts_count: newContactsCount }
            : state.currentAd,
        }))
      } else {
        // If contacts_count field doesn't exist, try alternative approach
        if (updateError.message?.includes('column "contacts_count" of relation "listings" does not exist')) {
          // Could implement alternative tracking here (separate table, etc.)
          return
        }
        
        // Only log other errors if they're not network/blocking issues
        if (!updateError.message?.includes('Failed to fetch') && !updateError.message?.includes('ERR_BLOCKED_BY_CLIENT')) {
          console.error('Error updating contacts:', updateError)
        } else {
          // Mark ad blocker as detected for future operations
          set((state) => ({ ...state, adBlockerDetected: true }))
        }
      }
    } catch (error) {
      // Only log error if it's not a network/blocking issue (ad blockers)
      const errorMessage = error instanceof Error ? error.message : String(error)
      if (!errorMessage.includes('Failed to fetch') && !errorMessage.includes('ERR_BLOCKED_BY_CLIENT')) {
        console.error('Error incrementing contacts:', error)
      } else {
        // Mark ad blocker as detected for future operations
        set((state) => ({ ...state, adBlockerDetected: true }))
      }
    }
  },

  setLoading: (loading: boolean) => {
    set({ isLoading: loading })
  },

  setAdBlockerDetected: (detected: boolean) => {
    set({ adBlockerDetected: detected })
  },
}))