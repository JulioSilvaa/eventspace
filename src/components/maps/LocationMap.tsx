import { useEffect, useRef, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import { Icon } from 'leaflet'
import { MapPin, ExternalLink } from 'lucide-react'
import 'leaflet/dist/leaflet.css'

interface LocationMapProps {
  latitude: number
  longitude: number
  title: string
  address: string
  height?: string
}

// Custom marker icon
const customIcon = new Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
})

// Fallback component when coordinates are not available
export function LocationFallback({ city, state, neighborhood }: {
  city: string
  state: string
  neighborhood?: string
}) {
  const openGoogleMaps = () => {
    const query = `${neighborhood ? neighborhood + ', ' : ''}${city}, ${state}, Brasil`
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="bg-gray-100 rounded-lg p-8 text-center">
      <div className="flex flex-col items-center space-y-4">
        <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
          <MapPin className="w-8 h-8 text-gray-500" />
        </div>
        <div>
          <h4 className="font-medium text-gray-900 mb-2">Localização Aproximada</h4>
          <p className="text-gray-600 text-sm mb-4">
            {neighborhood && `${neighborhood}, `}{city}, {state}
          </p>
          <p className="text-xs text-gray-500 mb-4">
            Coordenadas precisas não disponíveis
          </p>
          <button
            onClick={openGoogleMaps}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            Ver no Google Maps
          </button>
        </div>
      </div>
    </div>
  )
}

export default function LocationMap({
  latitude,
  longitude,
  title,
  address,
  height = "300px"
}: LocationMapProps) {
  const mapRef = useRef<any>(null)
  const [isMobile, setIsMobile] = useState(false)

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Fix for default markers not showing
  useEffect(() => {
    // This is needed to fix the default marker icons in React Leaflet
    delete (Icon.Default.prototype as any)._getIconUrl
    Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
      iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    })
  }, [])

  const openGoogleMaps = () => {
    const url = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  const openAppleMaps = () => {
    const url = `https://maps.apple.com/?q=${latitude},${longitude}`
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="space-y-4">
      {/* Map Container */}
      <div
        className="rounded-lg overflow-hidden border border-gray-200 shadow-sm relative"
        style={{ height }}
      >
        <MapContainer
          center={[latitude, longitude]}
          zoom={15}
          scrollWheelZoom={false}
          dragging={!isMobile}
          touchZoom={!isMobile}
          doubleClickZoom={!isMobile}
          style={{ height: '100%', width: '100%' }}
          ref={mapRef}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker position={[latitude, longitude]} icon={customIcon}>
            <Popup>
              <div className="text-center p-2">
                <h4 className="font-semibold text-gray-900 mb-1">{title}</h4>
                <p className="text-sm text-gray-600 mb-3">{address}</p>
                <div className="flex gap-2">
                  <button
                    onClick={openGoogleMaps}
                    className="text-xs bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition-colors"
                  >
                    Google Maps
                  </button>
                  <button
                    onClick={openAppleMaps}
                    className="text-xs bg-gray-600 text-white px-3 py-1 rounded hover:bg-gray-700 transition-colors"
                  >
                    Apple Maps
                  </button>
                </div>
              </div>
            </Popup>
          </Marker>
        </MapContainer>

        {/* External link button overlay */}
        <div className="absolute top-3 right-3 z-[1000]">
          <button
            onClick={openGoogleMaps}
            className="bg-white/90 backdrop-blur-sm border border-gray-300 rounded-lg p-2 hover:bg-white hover:shadow-md transition-all duration-200"
            title="Abrir no Google Maps"
          >
            <ExternalLink className="w-4 h-4 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-2 justify-center">
        <button
          onClick={openGoogleMaps}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
        >
          <ExternalLink className="w-4 h-4" />
          Google Maps
        </button>
        <button
          onClick={openAppleMaps}
          className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white text-sm rounded-lg hover:bg-gray-700 transition-colors"
        >
          <ExternalLink className="w-4 h-4" />
          Apple Maps
        </button>
      </div>
    </div>
  )
}