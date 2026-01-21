
import { useEffect, useState } from 'react'
import { useAdsStore } from '@/stores/adsStore'
import { Link } from 'react-router-dom'

export default function SponsorHero() {
  const { sponsors, fetchSponsors } = useAdsStore()

  useEffect(() => {
    fetchSponsors('HOME_HERO')
  }, [fetchSponsors])

  const heroSponsors = sponsors.filter(s => s.display_location === 'HOME_HERO' && s.status === 'active')
  const activeSponsor = heroSponsors[0] // For now, just show the first one

  if (!activeSponsor) return null

  return (
    <div className="w-full bg-gray-50 border-b border-gray-200">
      <div className="max-w-7xl mx-auto">
        <a
          href={activeSponsor.link_url}
          target="_blank"
          rel="noopener noreferrer"
          className="block relative w-full h-[150px] md:h-[250px] overflow-hidden group"
        >
          <div className="absolute top-2 right-2 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded z-10 uppercase tracking-wider">
            Patrocinado
          </div>

          {/* Desktop Banner */}
          <img
            src={activeSponsor.banner_desktop_url}
            alt={activeSponsor.name}
            className="hidden md:block w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />

          {/* Mobile Banner */}
          <img
            src={activeSponsor.banner_mobile_url}
            alt={activeSponsor.name}
            className="block md:hidden w-full h-full object-cover"
          />

          <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors duration-300"></div>
        </a>
      </div>
    </div>
  )
}
