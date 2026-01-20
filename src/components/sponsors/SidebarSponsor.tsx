
import { useEffect, useState } from 'react'
import { useAdsStore } from '@/stores/adsStore'

export default function SidebarSponsor() {
  const { sponsors, fetchSponsors } = useAdsStore()

  useEffect(() => {
    fetchSponsors('SIDEBAR')
  }, [fetchSponsors])

  const sidebarSponsors = sponsors.filter(s => s.display_location === 'SIDEBAR' && s.status === 'active')
  const sponsor = sidebarSponsors[0]

  if (!sponsor) return null

  return (
    <div className="w-full mt-6 mb-8 group">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Destaque</span>
        <div className="h-px bg-gray-200 flex-grow"></div>
      </div>

      <a
        href={sponsor.link_url}
        target="_blank"
        rel="noopener noreferrer"
        className="block relative w-full h-[300px] rounded-2xl overflow-hidden shadow-md group-hover:shadow-xl transition-all duration-300"
      >
        <img
          src={sponsor.banner_desktop_url}
          alt={sponsor.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute top-2 right-2 bg-black/50 backdrop-blur-md text-white text-[10px] px-2 py-0.5 rounded uppercase font-bold">
          Ads
        </div>
      </a>
    </div>
  )
}
