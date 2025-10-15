import type { MetadataRoute } from 'next'
 
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: 'https://www.boostervideos.net',
      lastModified: '2025-10-10',
      changeFrequency: 'yearly',
      priority: 0.5,
      images: ['https://www.boostervideo.net/public/logo.png'],
    },
  ]
}
