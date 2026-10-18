const known: Record<string, string> = {
  'instagram.com': 'Instagram',
  'x.com': 'X',
  'twitter.com': 'X',
  'tiktok.com': 'TikTok',
  'youtube.com': 'YouTube',
  'bsky.app': 'Bluesky',
  'threads.net': 'Threads',
  'facebook.com': 'Facebook',
  'substack.com': 'Substack',
  'medium.com': 'Medium',
  'goodreads.com': 'Goodreads',
  'linkedin.com': 'LinkedIn',
}

/** Nombre legible de un enlace: «Instagram», «Substack» o el dominio. */
export function linkLabel(url: string): string {
  try {
    const host = new URL(url).hostname.replace(/^www\./, '')
    const match = Object.keys(known).find((k) => host === k || host.endsWith(`.${k}`))
    return match ? known[match] : host
  } catch {
    return url
  }
}

/** Ruta interna a la que volver tras entrar; nunca otra web. */
export function safeReturn(raw: string | null): string {
  return raw && raw.startsWith('/') && !raw.startsWith('//') ? raw : '/'
}

export function signInHref(returnTo: string): string {
  return `/entrar?volver=${encodeURIComponent(returnTo)}`
}
