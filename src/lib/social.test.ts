import { describe, expect, it } from 'vitest'
import { organizationJsonLd, socialLinks } from './social'

describe('organizationJsonLd', () => {
  it('declara CISNE con logo y las redes de social.ts en sameAs', () => {
    const ld = organizationJsonLd()
    expect(ld['@type']).toBe('Organization')
    expect(ld.name).toBe('CISNE')
    expect(ld.url).toBe('https://cisneverso.es')
    expect(ld.logo).toBe('https://cisneverso.es/icons/icon-512.png')
    expect(ld.sameAs).toEqual(socialLinks.map((s) => s.url))
    expect(ld.sameAs).toEqual(['https://www.instagram.com/cisneverso.es/', 'https://www.tiktok.com/@cisneverso.es'])
  })
})
