import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

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

export default defineConfig({
  plugins: [react(), tailwindcss(), preloadCormorant()],
})
