export interface Sponsor {
  id: string
  name: string
  banner_desktop_url: string
  banner_mobile_url: string
  link_url: string
  tier: 'GOLD' | 'SILVER' | 'BRONZE'
  display_location: 'HOME_HERO' | 'SEARCH_FEED' | 'SIDEBAR'
  priority: number
  status: 'active' | 'inactive'
}
