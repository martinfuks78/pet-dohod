export default function sitemap() {
  const baseUrl = 'https://www.petdohod.cz'

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${baseUrl}/moje-registrace`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/ochrana-osobnich-udaju`,
      lastModified: new Date('2026-01-10'),
      changeFrequency: 'yearly',
      priority: 0.5,
    },
  ]
}
