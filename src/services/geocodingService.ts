interface GeocodeResult {
  latitude: number
  longitude: number
  formatted_address: string
}

interface NominatimResponse {
  lat: string
  lon: string
  display_name: string
}

class GeocodingService {
  private cache = new Map<string, GeocodeResult>()
  private readonly baseUrl = 'https://nominatim.openstreetmap.org/search'

  async geocodeAddress(address: string): Promise<GeocodeResult | null> {
    // Check cache first
    if (this.cache.has(address)) {
      return this.cache.get(address)!
    }

    try {
      const params = new URLSearchParams({
        q: address,
        format: 'json',
        limit: '1',
        countrycodes: 'br', // Restrict to Brazil
        addressdetails: '1'
      })

      const response = await fetch(`${this.baseUrl}?${params}`, {
        headers: {
          'User-Agent': 'EventSpace-App/1.0'
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data: NominatimResponse[] = await response.json()

      if (data.length === 0) {
        return null
      }

      const result: GeocodeResult = {
        latitude: parseFloat(data[0].lat),
        longitude: parseFloat(data[0].lon),
        formatted_address: data[0].display_name
      }

      // Cache the result
      this.cache.set(address, result)

      return result
    } catch (error) {
      console.error('Geocoding error:', error)
      return null
    }
  }

  async geocodeCity(city: string, state: string, neighborhood?: string): Promise<GeocodeResult | null> {
    const addressParts = [neighborhood, city, state, 'Brasil'].filter(Boolean)
    const address = addressParts.join(', ')
    
    return this.geocodeAddress(address)
  }

  clearCache(): void {
    this.cache.clear()
  }

  getCacheSize(): number {
    return this.cache.size
  }
}

export const geocodingService = new GeocodingService()
export default geocodingService