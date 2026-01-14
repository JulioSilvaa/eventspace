import { create } from 'zustand'
import { Ad, SearchFilters } from '@/types'
import { apiClient } from '@/lib/api-client'

interface SpaceImage {
  thumbnail: string
  medium: string
  large: string
  metadata?: {
    originalSize: number
    compressedSize: number
    format: string
    width: number
    height: number
  }
}

interface SpaceResponse {
  id: string
  title: string
  description: string
  price_per_day?: number
  price_per_weekend?: number
  price_type?: string
  address: {
    street: string
    number: string
    complement?: string
    neighborhood: string
    city: string
    state: string
    zipcode: string
    country: string
  }
  status: string
  featured: boolean
  views_count?: number
  contacts_count?: number
  contact_whatsapp?: string
  contact_whatsapp_alternative?: string
  contact_phone?: string
  contact_email?: string
  contact_instagram?: string
  contact_facebook?: string
  created_at: string
  updated_at: string
  images?: (string | SpaceImage)[]
  owner_id: string
  category_id?: number
  average_rating?: number
  reviews_count?: number
  capacity?: number
  comfort?: string[]
  specifications?: Record<string, any>
  owner?: {
    name: string
    phone?: string
    whatsapp?: string
    email?: string
    facebook_url?: string
    instagram_url?: string
  }
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

// Map API response to Ad type
function mapSpaceToAd(space: SpaceResponse): Ad {
  // Handle price mapping
  const price = space.price_per_day || space.price_per_weekend || 0

  // Handle images which might be JSON strings from the database
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
    user_id: space.owner_id,
    category_id: space.category_id || 1,
    title: space.title,
    description: space.description,
    price,
    price_per_day: space.price_per_day,
    price_per_weekend: space.price_per_weekend,
    price_type: (space.price_type as 'daily' | 'hourly' | 'event') || 'daily',
    capacity: space.capacity,
    state: space.address?.state || '',
    city: space.address?.city || '',
    neighborhood: space.address?.neighborhood,
    street: space.address?.street,
    number: space.address?.number,
    complement: space.address?.complement,
    postal_code: space.address?.zipcode,
    status: (space.status || 'inactive') as 'active' | 'inactive' | 'pending' | 'rejected' | 'suspended',
    featured: space.featured || false,
    views_count: space.views_count || 0,
    contacts_count: space.contacts_count || 0,
    rating: space.average_rating,
    reviews_count: space.reviews_count || 0,
    contact_whatsapp: space.contact_whatsapp,
    contact_whatsapp_alternative: space.contact_whatsapp_alternative,
    contact_phone: space.contact_phone,
    contact_email: space.contact_email,
    contact_instagram: space.contact_instagram,
    contact_facebook: space.contact_facebook,
    created_at: space.created_at,
    updated_at: space.updated_at,
    delivery_available: false,
    listing_images: processedImages.map((img, index) => ({
      id: `${space.id}-${index}`,
      listing_id: space.id,
      image_url: img.medium || img.large || img.thumbnail,
      display_order: index,
      created_at: space.created_at,
    })),
    categories: {
      id: space.category_id || 1,
      name: 'Espaço',
      type: 'space',
      slug: 'espaco',
    },
    specifications: {
      ...space.specifications,
      capacity: space.capacity // Ensure capacity is also in specifications if needed by legacy code
    },
    comfort: space.comfort || [],
    owner: space.owner,
  }
}


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
  createAd: (adData: Partial<Ad>, imageFiles?: File[]) => Promise<{ error?: string; data?: Ad }>
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

    const params: Record<string, string | number | boolean | undefined> = {
      page,
      limit: per_page,
      status: 'active',
    }

    // Apply filters
    if (filters.query) params.search = filters.query
    if (filters.category_id) params.category_id = filters.category_id
    if (filters.state) params.state = filters.state
    if (filters.city) params.city = filters.city
    if (filters.price_min) params.price_min = filters.price_min
    if (filters.price_max) params.price_max = filters.price_max

    const { data, error } = await apiClient.get<SpacesListResponse>('/api/spaces', params)

    if (error) {
      console.error('Error fetching ads:', error)
      set({ isLoading: false })
      return
    }

    const ads = data?.spaces?.map(mapSpaceToAd) || []
    const total = data?.pagination?.total || 0
    const total_pages = data?.pagination?.totalPages || Math.ceil(total / per_page)

    set({
      ads,
      searchFilters: filters,
      pagination: {
        page,
        per_page,
        total,
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

    const { data, error } = await apiClient.get<SpacesListResponse>('/api/spaces', {
      featured: true,
      limit,
      status: 'active',
      sort: 'average_rating',
      order: 'desc',
    })

    if (error) {
      console.error('Error fetching featured ads:', error)
      return
    }

    const featuredAds = data?.spaces?.map(mapSpaceToAd) || []

    set({
      featuredAds,
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

    const { data, error } = await apiClient.get<SpacesListResponse>('/api/spaces', {
      type: 'space',
      limit,
      status: 'active',
      sort: 'average_rating',
      order: 'desc',
    })

    if (error) {
      console.error('Error fetching popular spaces:', error)
      return
    }

    const popularSpaces = data?.spaces?.map(mapSpaceToAd) || []

    set({
      popularSpaces,
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

    const { data, error } = await apiClient.get<SpacesListResponse>('/api/spaces', {
      type: 'advertiser',
      limit,
      status: 'active',
      sort: 'views_count',
      order: 'desc',
    })

    if (error) {
      console.error('Error fetching popular equipment:', error)
      return
    }

    const popularEquipment = data?.spaces?.map(mapSpaceToAd) || []

    set({
      popularEquipment,
      cache: { ...state.cache, popularEquipment: now }
    })
  },

  fetchAdById: async (id: string) => {
    set({ isLoading: true })

    const { data, error } = await apiClient.get<SpaceResponse>(`/api/spaces/${id}`)

    if (error) {
      console.error('Error fetching ad:', error)
      set({ isLoading: false })
      return
    }

    if (data) {
      const mappedAd = mapSpaceToAd(data)
      set((state) => ({
        currentAd: mappedAd,
        ads: state.ads.some(a => a.id === id)
          ? state.ads.map(a => a.id === id ? mappedAd : a)
          : [...state.ads, mappedAd],
        isLoading: false,
      }))
    } else {
      set({ isLoading: false })
    }
  },

  fetchUserAds: async (userId: string) => {
    set({ isLoading: true })

    const { data, error } = await apiClient.get<SpacesListResponse>('/api/spaces', {
      owner_id: userId,
    })

    if (error) {
      console.error('Error fetching user ads:', error)
      set({ isLoading: false })
      return
    }

    const userAds = data?.spaces?.map(mapSpaceToAd) || []

    set({
      userAds,
      isLoading: false,
    })
  },

  createAd: async (adData: any, imageFiles: File[] = []) => {
    // Map Ad type to API format (backend expects SpaceEntity format)
    const spaceData: any = {
      title: adData.title,
      description: adData.description,

      // Address object (required by backend)
      address: adData.address || {
        street: '',
        number: '',
        complement: undefined,
        neighborhood: '',
        city: '',
        state: '',
        zipcode: '',
        country: 'Brasil',
      },

      capacity: adData.capacity,

      // Price mapping (backend uses price_per_day and price_per_weekend)
      price_per_day: adData.price_per_day,
      price_per_weekend: adData.price_per_weekend,

      // Comfort array (backend combines all amenities/features/services)
      comfort: adData.comfort || [],

      // Images (if already present as URLs, though usually sent as files)
      images: adData.images || [],

      // Status
      status: adData.status || 'active',

      // Contact info
      contact_phone: adData.contact_phone,
      contact_whatsapp: adData.contact_whatsapp,
      contact_whatsapp_alternative: adData.contact_whatsapp_alternative,
      contact_email: adData.contact_email,
      contact_instagram: adData.contact_instagram,
      contact_facebook: adData.contact_facebook,
    }

    // Filter out undefined values
    const cleanData = Object.fromEntries(
      Object.entries(spaceData).filter(([, value]) => value !== undefined)
    )

    // Using uploadFiles to send as multipart/form-data which the backend expects
    // when receiving files and data together
    const { data, error } = await apiClient.uploadFiles<SpaceResponse>(
      '/api/spaces',
      imageFiles,
      cleanData
    )

    if (error) {
      console.error('Erro ao criar espaço:', error)
      return { error: error.message }
    }

    // Refresh user ads
    if (adData.user_id) {
      get().fetchUserAds(adData.user_id)
    }

    // If backend returns data wrapped in a data property
    const spaceResult = (data as any)?.data || data;

    return { data: spaceResult ? mapSpaceToAd(spaceResult) : undefined }
  },

  updateAd: async (id: string, adData: Partial<Ad>) => {
    const { error } = await apiClient.patch(`/api/spaces/${id}`, adData)

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
    try {
      const { error } = await apiClient.delete(`/api/spaces/${id}`)

      if (error) {
        console.error('Error deleting ad:', error)
        return { error: error.message }
      }

      // Remove from local state
      set((state) => ({
        userAds: state.userAds.filter((ad) => ad.id !== id),
        ads: state.ads.filter((ad) => ad.id !== id),
      }))

      return {}
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      console.error('Error deleting ad:', error)
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