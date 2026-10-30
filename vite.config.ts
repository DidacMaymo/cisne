import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { loadArticles, toMeta } from './src/lib/comunidad'
import { organizationJsonLd } from './src/lib/social'

/** Precarga la Cormorant Garamond regular latina (el título de la portada y los poemas) con su nombre con hash. */
function preloadCormorant(): Plugin {
  return {
    name: 'cisne-preload-cormorant',
    transformIndexHtml: {
      order: 'post',
      handler(_html, ctx) {
        const file = Object.keys(ctx.bundle ?? {}).find((f) => /cormorant-garamond-latin-400-normal-.*\.woff2$/.test(f))
        if (!file) return []
        return [
          {
            tag: 'link',
            attrs: { rel: 'preload', as: 'font', type: 'font/woff2', href: `/${file}`, crossorigin: '' },
            injectTo: 'head',
          },
        ]
      },
    },
  }
}

/** Mete el JSON-LD `Organization` en el HTML inicial (la portada no pasa por el Worker). Datos de src/lib/social.ts. */
function organizationLd(): Plugin {
  return {
    name: 'cisne-organization-ld',
    transformIndexHtml() {
      const json = JSON.stringify(organizationJsonLd()).replace(/</g, '\\u003c')
      return [{ tag: 'script', attrs: { type: 'application/ld+json' }, children: json, injectTo: 'head' }]
    },
  }
}

/**
 * Emite `comunidad.json` (metadatos de los artículos publicados) para que el Worker pueda
 * rellenar el <head> y el sitemap. Usa el mismo parser que la SPA; un frontmatter inválido
 * rompe el build en vez de publicar un artículo a medias.
 */
function communityIndex(): Plugin {
  return {
    name: 'cisne-community-index',
    apply: 'build',
    generateBundle() {
      const dir = resolve(__dirname, 'content/comunidad')
      const files: Record<string, string> = {}
      if (existsSync(dir)) for (const f of readdirSync(dir)) if (f.endsWith('.md')) files[f] = readFileSync(resolve(dir, f), 'utf8')
      const { articles, errors } = loadArticles(files, false)
      if (errors.length > 0) this.error(`Artículos de la comunidad no válidos:\n${errors.join('\n')}`)
      this.emitFile({ type: 'asset', fileName: 'comunidad.json', source: JSON.stringify(articles.map(toMeta)) })
    },
  }
}

export default defineConfig({
  plugins: [react(), tailwindcss(), preloadCormorant(), organizationLd(), communityIndex()],
})
