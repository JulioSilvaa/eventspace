/**
 * Generate JSON-LD structured data for a space/venue
 * Helps search engines understand the content better
 */
export function generateSpaceStructuredData(space: {
  id: string
  title: string
  description: string
  images: string[]
  price_per_day?: number
  city: string
  state: string
  street: string
  neighborhood: string
  zipcode: string
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Place',
    name: space.title,
    description: space.description,
    image: space.images,
    address: {
      '@type': 'PostalAddress',
      streetAddress: space.street,
      addressLocality: space.city,
      addressRegion: space.state,
      postalCode: space.zipcode,
      addressCountry: 'BR'
    },
    ...(space.price_per_day && {
      offers: {
        '@type': 'Offer',
        price: space.price_per_day,
        priceCurrency: 'BRL',
        availability: 'https://schema.org/InStock'
      }
    })
  }
}

/**
 * Generate JSON-LD structured data for the organization
 */
export function generateOrganizationStructuredData() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'EventSpace',
    url: 'https://eventspace.com.br',
    logo: 'https://eventspace.com.br/favicon.png',
    description: 'Plataforma de aluguel de espaços e equipamentos para eventos',
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'Customer Service',
      availableLanguage: 'Portuguese'
    },
    sameAs: [
      // Add social media URLs when available
      // 'https://facebook.com/eventspace',
      // 'https://instagram.com/eventspace',
    ]
  }
}

/**
 * Generate JSON-LD structured data for breadcrumbs
 */
export function generateBreadcrumbStructuredData(items: Array<{ name: string; url: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url
    }))
  }
}

/**
 * Inject structured data into the page
 */
export function injectStructuredData(data: object) {
  const script = document.createElement('script')
  script.type = 'application/ld+json'
  script.text = JSON.stringify(data)

  // Remove existing structured data script if any
  const existing = document.querySelector('script[type="application/ld+json"]')
  if (existing) {
    existing.remove()
  }

  document.head.appendChild(script)
}
