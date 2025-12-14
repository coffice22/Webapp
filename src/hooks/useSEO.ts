import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { updatePageTitle, updateMetaDescription, updateMetaKeywords, addCanonicalLink, seoData } from '../utils/seo'

export const useSEO = (pageData?: {
  title?: string
  description?: string
  keywords?: string[]
  canonical?: string
}) => {
  const location = useLocation()

  useEffect(() => {
    // Get default SEO data based on current path
    const getDefaultSEOData = () => {
      const path = location.pathname
      if (path === '/') return seoData.home
      if (path === '/espaces') return seoData.spaces
      if (path === '/tarifs') return seoData.pricing
      if (path === '/a-propos') return seoData.about
      return seoData.home
    }

    const defaultData = getDefaultSEOData()
    const title = pageData?.title || defaultData.title
    const description = pageData?.description || defaultData.description
    const keywords = pageData?.keywords || defaultData.keywords
    const canonical = pageData?.canonical || `${window.location.origin}${location.pathname}`

    // Update SEO tags
    updatePageTitle(title)
    updateMetaDescription(description)
    updateMetaKeywords(keywords)
    addCanonicalLink(canonical)
  }, [location.pathname, pageData])
}