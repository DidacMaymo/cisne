// Genera src/styles/fonts.css con los @font-face de las fuentes de CISNE,
// solo con los subconjuntos `latin` y `latin-ext` (una web en español no usa
// cirílico, griego ni vietnamita) y solo en woff2.
//
// Uso: node scripts/gen-fonts.mjs   (repetir si cambian las fuentes de abajo)
import { readFileSync, writeFileSync } from 'node:fs'

const sources = [
  ['@fontsource-variable/inter', ['wght']],
  ['@fontsource/cormorant-garamond', ['400', '400-italic', '500', '600', '700', '700-italic']],
  ['@fontsource/eb-garamond', ['400', '400-italic', '700', '700-italic']],
  ['@fontsource-variable/literata', ['wght', 'wght-italic']],
  ['@fontsource/courier-prime', ['400', '400-italic', '700', '700-italic']],
  ['@fontsource/atkinson-hyperlegible', ['400', '400-italic', '700', '700-italic']],
]

let out =
  '/* GENERADO por scripts/gen-fonts.mjs: no editar a mano. Solo subconjuntos latin y latin-ext. */\n'
let blocks = 0
for (const [pkg, files] of sources) {
  for (const file of files) {
    const css = readFileSync(`node_modules/${pkg}/${file}.css`, 'utf8')
    for (const m of css.matchAll(/\/\* (\S+) \*\/\s*@font-face \{[\s\S]*?\n\}/g)) {
      if (!/-latin(-ext)?-/.test(m[1])) continue
      const block = m[0]
        // Solo woff2 (todos los navegadores actuales); la ruta apunta a node_modules para que Vite la procese.
        .replace(/src: url\(\.\/files\/([^)]+\.woff2)\) format\('(woff2[^']*)'\)[^;]*;/, (_, f, fmt) =>
          `src: url(../../node_modules/${pkg}/files/${f}) format('${fmt}');`)
      if (!block.includes('node_modules')) throw new Error(`Sin woff2: ${m[1]}`)
      out += `\n${block}\n`
      blocks++
    }
  }
}
writeFileSync('src/styles/fonts.css', out)
console.log(`src/styles/fonts.css: ${blocks} @font-face`)
