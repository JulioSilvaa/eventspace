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

  // Handle map interactions based on device type
  useEffect(() => {
    if (mapRef.current) {
      const map = mapRef.current
      if (isMobile) {
        map.dragging.disable()
        map.touchZoom.disable()
        map.doubleClickZoom.disable()
        map.scrollWheelZoom.disable()
        map.boxZoom.disable()
        map.keyboard.disable()
        if (map.tap) map.tap.disable()
      } else {
        map.dragging.enable()
        map.touchZoom.enable()
        map.doubleClickZoom.enable()
        map.scrollWheelZoom.enable()
        map.boxZoom.enable()
        map.keyboard.enable()
        if (map.tap) map.tap.enable()
      }
    }
  }, [isMobile])

  const openGoogleMaps = () => {
    const url = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  const openAppleMaps = () => {
    const url = `https://maps.apple.com/?q=${latitude},${longitude}`
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="h-full w-full relative group isolate">
      {/* Map Container - Full Height */}
      <div className="absolute inset-0 z-0">
        <MapContainer
          center={[latitude, longitude]}
          zoom={15}
          scrollWheelZoom={false}
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
              </div>
            </Popup>
          </Marker>
        </MapContainer>
      </div>

      {/* Floating Action Dock - Integrated & Clean */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[1000] w-max max-w-[95%]">
        <div className="flex items-center gap-3 p-2 bg-white/90 backdrop-blur-md border border-gray-200/50 shadow-[0_8px_30px_rgba(0,0,0,0.15)] rounded-xl">
          <button
            onClick={openGoogleMaps}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-700 hover:shadow-lg hover:-translate-y-0.5 transition-all active:scale-95"
          >
            <ExternalLink className="w-4 h-4" />
            <span className="whitespace-nowrap">Google Maps</span>
          </button>
          <button
            onClick={openAppleMaps}
            className="flex items-center gap-2 px-5 py-2.5 bg-gray-100 text-gray-700 text-sm font-bold rounded-lg hover:bg-gray-200 hover:text-gray-900 hover:shadow-lg hover:-translate-y-0.5 transition-all active:scale-95"
          >
            <ExternalLink className="w-4 h-4" />
            <span className="whitespace-nowrap">Apple Maps</span>
          </button>
        </div>
      </div>
    </div>
  )
}