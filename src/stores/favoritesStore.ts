import { create } from 'zustand'

interface FavoritesState {
  favorites: string[]
  
  // Actions
  addFavorite: (adId: string) => void
  removeFavorite: (adId: string) => void
  toggleFavorite: (adId: string) => void
  isFavorite: (adId: string) => boolean
  clearFavorites: () => void
  getFavorites: () => string[]
}

const STORAGE_KEY = 'eventspace_favorites'

// Helper functions for localStorage
const loadFavoritesFromStorage = (): string[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  } catch (error) {
    console.error('Error loading favorites from localStorage:', error)
    return []
  }
}

const saveFavoritesToStorage = (favorites: string[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites))
  } catch (error) {
    console.error('Error saving favorites to localStorage:', error)
  }
}

export const useFavoritesStore = create<FavoritesState>((set, get) => ({
  favorites: loadFavoritesFromStorage(),

  addFavorite: (adId: string) => {
    const currentFavorites = get().favorites
    if (!currentFavorites.includes(adId)) {
      const newFavorites = [...currentFavorites, adId]
      set({ favorites: newFavorites })
      saveFavoritesToStorage(newFavorites)
    }
  },

  removeFavorite: (adId: string) => {
    const currentFavorites = get().favorites
    const newFavorites = currentFavorites.filter(id => id !== adId)
    set({ favorites: newFavorites })
    saveFavoritesToStorage(newFavorites)
  },

  toggleFavorite: (adId: string) => {
    const { isFavorite, addFavorite, removeFavorite } = get()
    if (isFavorite(adId)) {
      removeFavorite(adId)
    } else {
      addFavorite(adId)
    }
  },

  isFavorite: (adId: string) => {
    return get().favorites.includes(adId)
  },

  clearFavorites: () => {
    set({ favorites: [] })
    saveFavoritesToStorage([])
  },

  getFavorites: () => {
    return get().favorites
  },
}))