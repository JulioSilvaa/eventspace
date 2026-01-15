import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

interface SEOProps {
  title?: string
  description?: string
  keywords?: string
  image?: string
  url?: string
  type?: string
}

/**
 * SEO Component - Updates meta tags dynamically for each page
 * 
 * @example
 * <SEO 
 *   title="Espaços para Eventos em São Paulo"
 *   description="Encontre os melhores espaços para eventos em São Paulo"
 *   keywords="espaços, eventos, são paulo, salão de festas"
 * />
 */
export default function SEO({
  title,
  description,
  keywords,
  image = 'https://eventspace.com.br/og-image.png',
  url,
  type = 'website'
}: SEOProps) {
  const location = useLocation()

  const defaultTitle = 'EventSpace - Aluguel de Espaços e Equipamentos para Eventos'
  const defaultDescription = 'Encontre e alugue espaços para eventos, festas e celebrações. Equipamentos profissionais, salões de festa, chácaras e muito mais.'
  const defaultKeywords = 'aluguel de espaços, espaços para eventos, salão de festas, chácara para eventos, equipamentos para festas'

  const pageTitle = title ? `${title} | EventSpace` : defaultTitle
  const pageDescription = description || defaultDescription
  const pageKeywords = keywords || defaultKeywords
  const pageUrl = url || `https://eventspace.com.br${location.pathname}`

  useEffect(() => {
    // Update document title
    document.title = pageTitle

    // Update meta tags
    updateMetaTag('name', 'title', pageTitle)
    updateMetaTag('name', 'description', pageDescription)
    updateMetaTag('name', 'keywords', pageKeywords)

    // Update Open Graph tags
    updateMetaTag('property', 'og:title', pageTitle)
    updateMetaTag('property', 'og:description', pageDescription)
    updateMetaTag('property', 'og:image', image)
    updateMetaTag('property', 'og:url', pageUrl)
    updateMetaTag('property', 'og:type', type)

    // Update Twitter tags
    updateMetaTag('property', 'twitter:title', pageTitle)
    updateMetaTag('property', 'twitter:description', pageDescription)
    updateMetaTag('property', 'twitter:image', image)
    updateMetaTag('property', 'twitter:url', pageUrl)

    // Update canonical URL
    updateCanonicalUrl(pageUrl)
  }, [pageTitle, pageDescription, pageKeywords, image, pageUrl, type])

  return null
}

function updateMetaTag(attribute: string, key: string, content: string) {
  let element = document.querySelector(`meta[${attribute}="${key}"]`)

  if (!element) {
    element = document.createElement('meta')
    element.setAttribute(attribute, key)
    document.head.appendChild(element)
  }

  element.setAttribute('content', content)
}

function updateCanonicalUrl(url: string) {
  let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement

  if (!link) {
    link = document.createElement('link')
    link.setAttribute('rel', 'canonical')
    document.head.appendChild(link)
  }

  link.href = url
}
