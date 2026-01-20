import { useEffect, useState } from 'react'
import { useAdsStore } from '@/stores/adsStore'

export default function FeedSponsor() {
  const { sponsors, fetchSponsors } = useAdsStore()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    fetchSponsors('SEARCH_FEED')
  }, [fetchSponsors])

  const feedSponsors = sponsors.filter(s => s.display_location === 'SEARCH_FEED' && s.status === 'active')

  // Rotation logic
  useEffect(() => {
    if (feedSponsors.length <= 1) return

    const interval = setInterval(() => {
      setIsVisible(false) // Start fade out

      setTimeout(() => {
        setCurrentIndex(prev => (prev + 1) % feedSponsors.length)
        setIsVisible(true) // Start fade in
      }, 500) // Wait for fade out to complete

    }, 5000) // Change every 5 seconds

    return () => clearInterval(interval)
  }, [feedSponsors.length])

  if (!feedSponsors.length) return null

  const sponsor = feedSponsors[currentIndex]

  if (!sponsor) return null

  return (
    <div className="col-span-full my-6">
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl overflow-hidden shadow-lg relative group">
        <a
          href={sponsor.link_url}
          target="_blank"
          rel="noopener noreferrer"
          className="block relative w-full h-[120px] md:h-[180px]"
        >
          <div className="absolute top-2 right-2 bg-white/90 text-gray-900 text-[10px] uppercase font-bold px-2 py-0.5 rounded shadow-sm z-10">
            Patrocinado
          </div>

          <img
            src={sponsor.banner_desktop_url}
            alt={sponsor.name}
            className={`w-full h-full object-cover transition-opacity duration-500 ${isVisible ? 'opacity-90 group-hover:opacity-100' : 'opacity-0'}`}
          />

          {/* Progress Indicators if multiple */}
          {feedSponsors.length > 1 && (
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
              {feedSponsors.map((_, idx) => (
                <div
                  key={idx}
                  className={`h-1 rounded-full transition-all duration-300 ${idx === currentIndex ? 'w-4 bg-white' : 'w-1.5 bg-white/40'}`}
                />
              ))}
            </div>
          )}
        </a>
      </div>
    </div>
  )
}
